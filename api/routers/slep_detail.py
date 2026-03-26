"""SLEP detail router - Establishments and KPIs for a specific SLEP.
Uses 2025 data tables with fallback to analytics schema (2024).
"""
import logging

import yaml
from fastapi import APIRouter, Depends, HTTPException

from api.db.connection import query_all, query_one, check_table_exists
from api.routers.auth import get_current_user
from api.routers.dashboard import _slep_filter, SLEP_NAME_MAP

logger = logging.getLogger(__name__)
router = APIRouter()


def _get_rut_sostenedor(slep_id: str) -> str | None:
    for path in ["api/config/slep_config.yaml", "config/slep_config.yaml"]:
        try:
            with open(path) as f:
                config = yaml.safe_load(f)
            for s in config.get("sleps", []):
                if s["id"] == slep_id:
                    return s.get("rut_sostenedor")
        except FileNotFoundError:
            continue
    return None


@router.get("/overview")
def slep_overview(current_user: dict = Depends(get_current_user)):
    """KPIs aggregados del SLEP completo - datos 2025."""
    slep_id = current_user["slep_id"]
    sf = _slep_filter(slep_id)

    try:
        # Try 2025 data first
        mat = query_one(f"""
            SELECT COUNT(DISTINCT rbd) AS total_ee, SUM(matricula_total) AS mat_total
            FROM matricula_2025_rbd WHERE {sf}
        """)
        asist = query_one(f"""
            SELECT ROUND(AVG(pct_asistencia)::numeric, 1) AS asist_avg, MAX(mes) AS ultimo_mes
            FROM asistencia_2025_rbd WHERE {sf}
              AND mes = (SELECT MAX(mes) FROM asistencia_2025_rbd WHERE {sf})
        """)
        # Semáforos
        alertas_q = query_all(f"""
            SELECT pct_asistencia FROM asistencia_2025_rbd
            WHERE {sf} AND mes = (SELECT MAX(mes) FROM asistencia_2025_rbd WHERE {sf})
        """)

        total_ee = int(mat['total_ee'] or 0) if mat else 0
        if total_ee == 0:
            raise ValueError("No 2025 data, try analytics")

        rojas = sum(1 for a in alertas_q if float(a['pct_asistencia'] or 0) < 80)
        naranjas = sum(1 for a in alertas_q if 80 <= float(a['pct_asistencia'] or 0) < 88)
        verdes = sum(1 for a in alertas_q if float(a['pct_asistencia'] or 0) >= 88)

        return {
            "slep_id": slep_id,
            "source": "2025_real",
            "kpis": {
                "total_establecimientos": total_ee,
                "matricula_total": int(mat['mat_total'] or 0),
                "asistencia_promedio": float(asist['asist_avg'] or 0) if asist else 0,
                "alertas_rojas": rojas,
                "alertas_naranjas": naranjas,
                "alertas_verdes": verdes,
            },
        }
    except Exception as e:
        logger.info("2025 data not available for %s, trying analytics: %s", slep_id, e)

    # Fallback: analytics schema (2024)
    rut = _get_rut_sostenedor(slep_id)
    if not rut:
        raise HTTPException(status_code=404, detail=f"SLEP {slep_id} no configurado")
    try:
        overview = query_one("""
            SELECT COUNT(*) AS total_ee, SUM(matricula_total) AS mat_total,
                   ROUND(AVG(tasa_asistencia)*100, 1) AS asist_avg,
                   SUM(CASE WHEN semaforo_riesgo='Roja' THEN 1 ELSE 0 END) AS rojas,
                   SUM(CASE WHEN semaforo_riesgo='Naranja' THEN 1 ELSE 0 END) AS naranjas,
                   SUM(CASE WHEN semaforo_riesgo='Verde' THEN 1 ELSE 0 END) AS verdes
            FROM analytics.mart_alerta_temprana_abril WHERE rut_sostenedor = %s
        """, (rut,))
        if not overview or not overview['total_ee']:
            raise HTTPException(status_code=404, detail="Sin datos")
        return {
            "slep_id": slep_id, "source": "2024_analytics",
            "kpis": {
                "total_establecimientos": int(overview['total_ee']),
                "matricula_total": int(overview['mat_total'] or 0),
                "asistencia_promedio": float(overview['asist_avg'] or 0),
                "alertas_rojas": int(overview['rojas'] or 0),
                "alertas_naranjas": int(overview['naranjas'] or 0),
                "alertas_verdes": int(overview['verdes'] or 0),
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/establecimientos")
def slep_establecimientos(current_user: dict = Depends(get_current_user)):
    """Lista de establecimientos del SLEP con datos 2025."""
    slep_id = current_user["slep_id"]
    sf = _slep_filter(slep_id)

    try:
        rows = query_all(f"""
            SELECT a.rbd, a.nom_rbd, a.nom_com_rbd, a.pct_asistencia,
                   a.total_alumnos, m.matricula_total,
                   d.latitud, d.longitud, d.rural_rbd
            FROM asistencia_2025_rbd a
            LEFT JOIN matricula_2025_rbd m ON a.rbd = m.rbd
            LEFT JOIN directorio_2025 d ON a.rbd = d.rbd
            WHERE a.{sf.replace('nombre_slep', 'a.nombre_slep')}
              AND a.mes = (SELECT MAX(mes) FROM asistencia_2025_rbd WHERE {sf})
            ORDER BY a.pct_asistencia ASC
        """)

        establecimientos = []
        for r in rows:
            asist = float(r.get("pct_asistencia") or 0)
            if asist < 80:
                semaforo = "rojo"
            elif asist < 88:
                semaforo = "naranja"
            else:
                semaforo = "verde"

            establecimientos.append({
                "rbd": r["rbd"],
                "nombre": r["nom_rbd"],
                "comuna": r.get("nom_com_rbd"),
                "matricula": int(r.get("matricula_total") or r.get("total_alumnos") or 0),
                "asistencia_pct": asist,
                "semaforo": semaforo,
                "latitud": float(r["latitud"]) if r.get("latitud") else None,
                "longitud": float(r["longitud"]) if r.get("longitud") else None,
                "rural": bool(r.get("rural_rbd")),
            })

        return {
            "slep_id": slep_id,
            "total": len(establecimientos),
            "establecimientos": establecimientos,
            "source": "2025_real",
        }
    except Exception as e:
        logger.warning("2025 establishments error: %s", e)
        # Fallback to analytics
        rut = _get_rut_sostenedor(slep_id)
        if not rut:
            return {"slep_id": slep_id, "total": 0, "establecimientos": []}
        try:
            rows = query_all("""
                SELECT rbd, nombre_establecimiento, codigo_comuna, matricula_total,
                       ROUND(tasa_asistencia*100, 1) AS asist, semaforo_riesgo
                FROM analytics.mart_alerta_temprana_abril WHERE rut_sostenedor = %s
                ORDER BY tasa_asistencia ASC
            """, (rut,))
            return {
                "slep_id": slep_id, "total": len(rows), "source": "2024_analytics",
                "establecimientos": [{
                    "rbd": r["rbd"], "nombre": r["nombre_establecimiento"],
                    "matricula": int(r["matricula_total"] or 0),
                    "asistencia_pct": float(r["asist"] or 0),
                    "semaforo": (r.get("semaforo_riesgo") or "verde").lower().rstrip('a'),
                } for r in rows],
            }
        except Exception:
            return {"slep_id": slep_id, "total": 0, "establecimientos": []}


@router.get("/ranking")
def slep_ranking(
    metric: str = "asistencia",
    current_user: dict = Depends(get_current_user),
):
    """Ranking de establecimientos del SLEP por métrica."""
    slep_id = current_user["slep_id"]
    sf = _slep_filter(slep_id)

    metric_map = {
        "asistencia": ("a.pct_asistencia", "DESC"),
        "matricula": ("m.matricula_total", "DESC"),
        "aprobacion": ("r.tasa_aprobacion", "DESC"),
        "retiro": ("r.tasa_retiro", "ASC"),  # menor es mejor
        "promedio": ("r.prom_general", "DESC"),
    }

    col, order = metric_map.get(metric, ("a.pct_asistencia", "DESC"))

    try:
        rows = query_all(f"""
            SELECT a.rbd, a.nom_rbd AS nombre, a.pct_asistencia,
                   m.matricula_total,
                   r.tasa_aprobacion, r.tasa_retiro, r.prom_general
            FROM asistencia_2025_rbd a
            LEFT JOIN matricula_2025_rbd m ON a.rbd = m.rbd
            LEFT JOIN rendimiento_2025_detalle r ON a.rbd = r.rbd
            WHERE a.{sf.replace('nombre_slep', 'a.nombre_slep')}
              AND a.mes = (SELECT MAX(mes) FROM asistencia_2025_rbd WHERE {sf})
            ORDER BY {col} {order} NULLS LAST
        """)

        ranking = []
        for i, r in enumerate(rows):
            ranking.append({
                "posicion": i + 1,
                "rbd": int(r["rbd"]),
                "nombre": r["nombre"],
                "asistencia": float(r.get("pct_asistencia") or 0),
                "matricula": int(r.get("matricula_total") or 0),
                "tasa_aprobacion": float(r.get("tasa_aprobacion") or 0),
                "tasa_retiro": float(r.get("tasa_retiro") or 0),
                "promedio_general": float(r.get("prom_general") or 0),
            })

        return {
            "slep_id": slep_id,
            "metric": metric,
            "total": len(ranking),
            "ranking": ranking,
            "source": "2025_real",
        }
    except Exception as e:
        return {"slep_id": slep_id, "metric": metric, "total": 0, "ranking": [], "error": str(e)}


@router.get("/establecimiento/{rbd}")
def slep_establecimiento_detalle(rbd: str, current_user: dict = Depends(get_current_user)):
    """Detalle de un establecimiento específico con datos abril + julio."""
    try:
        # Datos de abril
        abril = query_one("""
            SELECT * FROM analytics.mart_alerta_temprana_abril WHERE rbd = %s
        """, (rbd,))

        # Datos de julio (si existen)
        julio = query_one("""
            SELECT
                ROUND(tasa_asistencia * 100, 1) AS asistencia_julio,
                matricula_total AS matricula_julio,
                semaforo_riesgo AS semaforo_julio
            FROM analytics.mart_alerta_temprana_abril_julio WHERE rbd = %s
        """, (rbd,))

        if not abril:
            raise HTTPException(status_code=404, detail=f"Establecimiento RBD {rbd} no encontrado")

        asist_abril = round(float(abril.get("tasa_asistencia") or 0) * 100, 1)
        asist_julio = float(julio.get("asistencia_julio") or 0) if julio else None
        mat_abril = int(abril.get("matricula_total") or 0)
        mat_julio = int(julio.get("matricula_julio") or 0) if julio else None

        return {
            "rbd": rbd,
            "nombre": abril["nombre_establecimiento"],
            "codigo_comuna": abril["codigo_comuna"],
            "nombre_sostenedor": abril["nombre_sostenedor"],
            "dependencia": abril["dependencia"],
            "semaforo": abril.get("semaforo_riesgo", "Verde").lower().rstrip("a"),
            "matricula": {
                "abril": mat_abril,
                "julio": mat_julio,
                "variacion": round((mat_julio - mat_abril) / mat_abril * 100, 1) if mat_julio and mat_abril else None,
            },
            "asistencia": {
                "abril": asist_abril,
                "julio": asist_julio,
                "variacion": round(asist_julio - asist_abril, 1) if asist_julio else None,
            },
            "vulnerabilidad": {
                "total": int(abril.get("total_vulnerable") or 0),
                "proporcion": round(float(abril.get("proporcion_vulnerabilidad") or 0) * 100, 1),
            },
            "riesgos": {
                "asistencia": bool(abril.get("riesgo_asistencia")),
                "vulnerabilidad": bool(abril.get("riesgo_vulnerabilidad")),
            },
            "simce": _get_simce(rbd),
            "rendimiento": _get_rendimiento(rbd),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting establishment detail: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


def _get_simce(rbd: str) -> list:
    """Get SIMCE scores for an establishment across years."""
    try:
        rows = query_all("""
            SELECT anio, nivel, estado_resultado,
                   prom_lectura, prom_matematica
            FROM analytics.fact_simce
            WHERE rbd = %s
            ORDER BY anio DESC, nivel
        """, (int(rbd),))
        return [
            {
                "anio": r["anio"],
                "nivel": r["nivel"],
                "estado": r["estado_resultado"],
                "lectura": float(r["prom_lectura"]) if r.get("prom_lectura") else None,
                "matematica": float(r["prom_matematica"]) if r.get("prom_matematica") else None,
            }
            for r in rows
        ]
    except Exception:
        return []


def _get_rendimiento(rbd: str) -> list:
    """Get academic performance for an establishment across years."""
    try:
        rows = query_all("""
            SELECT anio,
                   aprobados_hom + aprobados_muj AS aprobados,
                   reprobados_hom + reprobados_muj AS reprobados,
                   retirados_hom + retirados_muj AS retirados,
                   prom_asistencia
            FROM analytics.fact_rendimiento
            WHERE rbd = %s
            ORDER BY anio DESC
        """, (int(rbd),))
        result = []
        for r in rows:
            total = int(r["aprobados"] or 0) + int(r["reprobados"] or 0) + int(r["retirados"] or 0)
            result.append({
                "anio": r["anio"],
                "aprobados": int(r["aprobados"] or 0),
                "reprobados": int(r["reprobados"] or 0),
                "retirados": int(r["retirados"] or 0),
                "tasa_aprobacion": round(int(r["aprobados"] or 0) / total * 100, 1) if total > 0 else 0,
                "tasa_retiro": round(int(r["retirados"] or 0) / total * 100, 1) if total > 0 else 0,
                "prom_asistencia": float(r["prom_asistencia"]) if r.get("prom_asistencia") else None,
            })
        return result
    except Exception:
        return []
