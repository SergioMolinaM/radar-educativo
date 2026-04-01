"""SLEP detail router - Establishments and KPIs for a specific SLEP.
Uses 2025 data tables with fallback to analytics schema (2024).
"""
import logging

import yaml
from fastapi import APIRouter, Depends, HTTPException

from api.db.connection import query_all, query_one, check_table_exists
from api.routers.auth import get_current_user
from api.routers.dashboard import _slep_filter, SLEP_NAME_MAP, _get_umbrales, _clasificar_semaforo

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


def _parse_coord(val) -> float | None:
    """Parse coordinate that may use comma as decimal separator."""
    if val is None or val == '' or val == '0':
        return None
    try:
        return float(str(val).replace(',', '.'))
    except (ValueError, TypeError):
        return None


MESES = {1:"Enero",2:"Febrero",3:"Marzo",4:"Abril",5:"Mayo",6:"Junio",
         7:"Julio",8:"Agosto",9:"Septiembre",10:"Octubre",11:"Noviembre",12:"Diciembre"}

ADULTOS_FILTER = "AND nom_rbd NOT ILIKE '%CEIA%' AND nom_rbd NOT ILIKE '%ADULTO%' AND nom_rbd NOT ILIKE '%NOCTURNO%'"


@router.get("/meses")
def slep_meses(current_user: dict = Depends(get_current_user)):
    """List available months for the SLEP."""
    sf = _slep_filter(current_user["slep_id"])
    rows = query_all(f"SELECT DISTINCT mes FROM asistencia_2025_rbd WHERE {sf} ORDER BY mes")
    return {"meses": [{"valor": r["mes"], "nombre": MESES.get(r["mes"], str(r["mes"]))} for r in rows]}


@router.get("/overview")
def slep_overview(
    mes: int = None,
    excluir_adultos: bool = True,
    current_user: dict = Depends(get_current_user),
):
    """KPIs aggregados del SLEP completo - datos 2025."""
    slep_id = current_user["slep_id"]
    sf = _slep_filter(slep_id)
    adultos = ADULTOS_FILTER if excluir_adultos else ""

    try:
        # Determine month
        if not mes:
            m = query_one(f"SELECT MAX(mes) AS m FROM asistencia_2025_rbd WHERE {sf}")
            mes = int(m["m"]) if m and m["m"] else 10

        mat_af = "AND nom_rbd NOT ILIKE '%CEIA%' AND nom_rbd NOT ILIKE '%ADULTO%' AND nom_rbd NOT ILIKE '%NOCTURNO%'" if excluir_adultos else ""
        mat = query_one(f"""
            SELECT COUNT(DISTINCT rbd) AS total_ee, SUM(matricula_total) AS mat_total
            FROM matricula_2025_rbd WHERE {sf} {mat_af}
        """)
        asist = query_one(f"""
            SELECT ROUND(AVG(CASE WHEN pct_asistencia > 0 THEN pct_asistencia END)::numeric, 1) AS asist_avg
            FROM asistencia_2025_rbd WHERE {sf} AND mes = {mes} {adultos}
        """)
        alertas_q = query_all(f"""
            SELECT pct_asistencia, nom_rbd FROM asistencia_2025_rbd
            WHERE {sf} AND mes = {mes} {adultos}
        """)

        total_ee = int(mat['total_ee'] or 0) if mat else 0
        if total_ee == 0:
            raise ValueError("No 2025 data")

        umbrales = _get_umbrales(slep_id)
        rojas = sum(1 for a in alertas_q if _clasificar_semaforo(float(a['pct_asistencia'] or 0), umbrales) == "rojo")
        naranjas = sum(1 for a in alertas_q if _clasificar_semaforo(float(a['pct_asistencia'] or 0), umbrales) == "naranja")
        verdes = sum(1 for a in alertas_q if _clasificar_semaforo(float(a['pct_asistencia'] or 0), umbrales) == "verde")

        from api.routers.dashboard import SLEP_OFICIAL
        oficial = SLEP_OFICIAL.get(slep_id, {})

        return {
            "slep_id": slep_id,
            "source": "2025_real",
            "mes": mes,
            "mes_nombre": MESES.get(mes, str(mes)),
            "excluir_adultos": excluir_adultos,
            "kpis": {
                "total_establecimientos": oficial.get("ee_total") or total_ee,
                "ee_con_datos": total_ee,
                "ee_oficial": oficial.get("ee_total"),
                "matricula_total": int(mat['mat_total'] or 0),
                "asistencia_promedio": float(asist['asist_avg'] or 0) if asist else 0,
                "alertas_rojas": rojas,
                "alertas_naranjas": naranjas,
                "alertas_verdes": verdes,
            },
            "cobertura_datos": f"{total_ee} de {oficial.get('ee_total')} EE con datos" if oficial.get("ee_total") else f"{total_ee} EE con datos",
            "comunas": oficial.get("comunas", []),
        }
    except Exception as e:
        logger.info("2025 overview error for %s: %s", slep_id, e)
        return {"slep_id": slep_id, "source": "error", "error": str(e), "kpis": {}}


@router.get("/establecimientos")
def slep_establecimientos(
    mes: int = None,
    excluir_adultos: bool = True,
    current_user: dict = Depends(get_current_user),
):
    """Lista de establecimientos del SLEP con datos 2025."""
    slep_id = current_user["slep_id"]
    sf = _slep_filter(slep_id)
    adultos = ADULTOS_FILTER if excluir_adultos else ""

    try:
        if not mes:
            m = query_one(f"SELECT MAX(mes) AS m FROM asistencia_2025_rbd WHERE {sf}")
            mes = int(m["m"]) if m and m["m"] else 10

        rows = query_all(f"""
            SELECT a.rbd, a.nom_rbd, a.nom_com_rbd, a.pct_asistencia,
                   a.total_alumnos, m.matricula_total,
                   r.tasa_aprobacion, r.prom_general,
                   s.total_sep, s.prioritarios,
                   d.latitud, d.longitud, d.rural_rbd
            FROM asistencia_2025_rbd a
            LEFT JOIN matricula_2025_rbd m ON a.rbd = m.rbd
            LEFT JOIN rendimiento_2025_detalle r ON a.rbd = r.rbd
            LEFT JOIN sep_2025_rbd s ON a.rbd = s.rbd
            LEFT JOIN directorio_2025 d ON a.rbd = d.rbd
            WHERE a.{sf} AND a.mes = {mes} {adultos.replace('nom_rbd', 'a.nom_rbd')}
            ORDER BY a.pct_asistencia ASC
        """)

        establecimientos = []
        for r in rows:
            asist = float(r.get("pct_asistencia") or 0)
            nombre = r.get("nom_rbd") or ""
            # Marcar CEIA/Adultos
            es_adultos = any(x in nombre.upper() for x in ["CEIA", "ADULTO", "NOCTURNO"])
            umbrales = _get_umbrales(slep_id)
            semaforo = _clasificar_semaforo(asist, umbrales)

            # Parse coordinates (may use comma as decimal separator)
            lat = _parse_coord(r.get("latitud"))
            lon = _parse_coord(r.get("longitud"))

            establecimientos.append({
                "rbd": r["rbd"],
                "nombre": nombre,
                "comuna": r.get("nom_com_rbd"),
                "matricula": int(r.get("matricula_total") or r.get("total_alumnos") or 0),
                "asistencia_pct": asist,
                "tasa_aprobacion": float(r.get("tasa_aprobacion") or 0),
                "promedio": float(r.get("prom_general") or 0),
                "sep": int(r.get("total_sep") or 0),
                "prioritarios": int(r.get("prioritarios") or 0),
                "semaforo": semaforo,
                "es_adultos": es_adultos,
                "latitud": lat,
                "longitud": lon,
                "rural": r.get("rural_rbd") in (1, "1", True),
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
    mes: int = None,
    excluir_adultos: bool = True,
    current_user: dict = Depends(get_current_user),
):
    """Ranking de establecimientos del SLEP por métrica."""
    slep_id = current_user["slep_id"]
    sf = _slep_filter(slep_id)
    adultos = ADULTOS_FILTER.replace("nom_rbd", "a.nom_rbd") if excluir_adultos else ""

    if not mes:
        m = query_one(f"SELECT MAX(mes) AS m FROM asistencia_2025_rbd WHERE {sf}")
        mes = int(m["m"]) if m and m["m"] else 10

    metric_map = {
        "asistencia": ("a.pct_asistencia", "DESC"),
        "matricula": ("m.matricula_total", "DESC"),
        "aprobacion": ("r.tasa_aprobacion", "DESC"),
        "retiro": ("r.tasa_retiro", "ASC"),
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
            WHERE a.{sf} AND a.mes = {mes}
              AND a.pct_asistencia > 0 {adultos}
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
    """Detalle de un establecimiento - datos 2025 reales."""
    try:
        rbd_int = int(rbd)
    except ValueError:
        raise HTTPException(status_code=400, detail="RBD inválido")

    try:
        # Matrícula
        mat = query_one("SELECT * FROM matricula_2025_rbd WHERE rbd = %s", (rbd_int,))
        # Rendimiento
        rend = query_one("SELECT * FROM rendimiento_2025_detalle WHERE rbd = %s", (rbd_int,))
        # SEP
        sep = query_one("SELECT * FROM sep_2025_rbd WHERE rbd = %s", (rbd_int,))
        # Asistencia mensual (todos los meses)
        asist_mensual = query_all(
            "SELECT mes, pct_asistencia, total_alumnos FROM asistencia_2025_rbd WHERE rbd = %s ORDER BY mes",
            (rbd_int,))

        if not mat and not asist_mensual:
            raise HTTPException(status_code=404, detail=f"RBD {rbd} sin datos 2025")

        nombre = (mat or {}).get("nom_rbd") or (asist_mensual[0]["nom_rbd"] if asist_mensual else f"RBD {rbd}")
        comuna = (mat or {}).get("nom_com_rbd", "")
        matricula = int((mat or {}).get("matricula_total", 0) or 0)

        # Último mes de asistencia
        ultimo = asist_mensual[-1] if asist_mensual else {}
        asist_actual = float(ultimo.get("pct_asistencia", 0) or 0)
        umbrales = _get_umbrales(current_user["slep_id"])
        semaforo = _clasificar_semaforo(asist_actual, umbrales)

        # Tendencia asistencia
        tendencia = [{"mes": MESES.get(a["mes"], str(a["mes"])), "mes_num": a["mes"],
                      "asistencia": float(a["pct_asistencia"] or 0)} for a in asist_mensual]

        # Rendimiento
        rend_data = {}
        if rend:
            rend_data = {
                "total_alumnos": int(rend.get("total_alumnos", 0) or 0),
                "aprobados": int(rend.get("aprobados", 0) or 0),
                "reprobados": int(rend.get("reprobados", 0) or 0),
                "retirados": int(rend.get("retirados", 0) or 0),
                "trasladados": int(rend.get("trasladados", 0) or 0),
                "tasa_aprobacion": float(rend.get("tasa_aprobacion", 0) or 0),
                "tasa_retiro": float(rend.get("tasa_retiro", 0) or 0),
                "prom_general": float(rend.get("prom_general", 0) or 0),
                "prom_asistencia": float(rend.get("prom_asistencia", 0) or 0),
            }

        # SEP
        sep_data = {}
        if sep:
            sep_data = {
                "total_sep": int(sep.get("total_sep", 0) or 0),
                "prioritarios": int(sep.get("prioritarios", 0) or 0),
                "preferentes": int(sep.get("preferentes", 0) or 0),
                "pct_sep": round(int(sep.get("total_sep", 0) or 0) / max(matricula, 1) * 100, 1),
            }

        return {
            "rbd": rbd_int,
            "nombre": nombre,
            "comuna": comuna,
            "nombre_slep": (mat or {}).get("nombre_slep", ""),
            "matricula": matricula,
            "semaforo": semaforo,
            "asistencia_actual": asist_actual,
            "asistencia_tendencia": tendencia,
            "rendimiento": rend_data,
            "sep": sep_data,
            "source": "2025_real",
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error detalle %s: %s", rbd, e)
        raise HTTPException(status_code=500, detail=str(e))
