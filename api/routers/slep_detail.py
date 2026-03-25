"""SLEP detail router - Establishments and KPIs for a specific SLEP."""
import logging

import yaml
from fastapi import APIRouter, Depends, HTTPException

from api.db.connection import query_all, query_one
from api.routers.auth import get_current_user

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
    """KPIs aggregados del SLEP completo con datos reales."""
    rut = _get_rut_sostenedor(current_user["slep_id"])
    if not rut:
        raise HTTPException(status_code=404, detail=f"SLEP {current_user['slep_id']} no configurado")

    try:
        overview = query_one("""
            SELECT
                COUNT(*) AS total_establecimientos,
                SUM(matricula_total) AS matricula_total,
                ROUND(AVG(tasa_asistencia) * 100, 1) AS asistencia_promedio,
                SUM(total_vulnerable) AS total_vulnerable,
                ROUND(AVG(proporcion_vulnerabilidad) * 100, 1) AS vulnerabilidad_promedio,
                SUM(CASE WHEN semaforo_riesgo = 'Roja' THEN 1 ELSE 0 END) AS alertas_rojas,
                SUM(CASE WHEN semaforo_riesgo = 'Naranja' THEN 1 ELSE 0 END) AS alertas_naranjas,
                SUM(CASE WHEN semaforo_riesgo = 'Verde' THEN 1 ELSE 0 END) AS alertas_verdes,
                nombre_sostenedor
            FROM analytics.mart_alerta_temprana_abril
            WHERE rut_sostenedor = %s
            GROUP BY nombre_sostenedor
        """, (rut,))

        if not overview:
            raise HTTPException(status_code=404, detail="Sin datos para este SLEP")

        return {
            "slep_id": current_user["slep_id"],
            "nombre_sostenedor": overview["nombre_sostenedor"],
            "kpis": {
                "total_establecimientos": int(overview["total_establecimientos"]),
                "matricula_total": int(overview["matricula_total"]),
                "asistencia_promedio": float(overview["asistencia_promedio"]),
                "total_vulnerable": int(overview["total_vulnerable"]),
                "vulnerabilidad_promedio": float(overview["vulnerabilidad_promedio"]),
                "alertas_rojas": int(overview["alertas_rojas"]),
                "alertas_naranjas": int(overview["alertas_naranjas"]),
                "alertas_verdes": int(overview["alertas_verdes"]),
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting SLEP overview: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/establecimientos")
def slep_establecimientos(current_user: dict = Depends(get_current_user)):
    """Lista de todos los colegios del SLEP con datos de alerta temprana."""
    rut = _get_rut_sostenedor(current_user["slep_id"])
    if not rut:
        raise HTTPException(status_code=404, detail=f"SLEP {current_user['slep_id']} no configurado")

    try:
        rows = query_all("""
            SELECT
                rbd,
                nombre_establecimiento,
                codigo_comuna,
                dependencia,
                matricula_total,
                ROUND(tasa_asistencia * 100, 1) AS asistencia_pct,
                total_vulnerable,
                ROUND(proporcion_vulnerabilidad * 100, 1) AS vulnerabilidad_pct,
                riesgo_asistencia,
                riesgo_vulnerabilidad,
                semaforo_riesgo
            FROM analytics.mart_alerta_temprana_abril
            WHERE rut_sostenedor = %s
            ORDER BY tasa_asistencia ASC
        """, (rut,))

        establecimientos = []
        for r in rows:
            establecimientos.append({
                "rbd": r["rbd"],
                "nombre": r["nombre_establecimiento"],
                "codigo_comuna": r["codigo_comuna"],
                "dependencia": r["dependencia"],
                "matricula": int(r["matricula_total"] or 0),
                "asistencia": float(r["asistencia_pct"] or 0),
                "vulnerable": int(r["total_vulnerable"] or 0),
                "vulnerabilidad_pct": float(r["vulnerabilidad_pct"] or 0),
                "riesgo_asistencia": bool(r["riesgo_asistencia"]),
                "riesgo_vulnerabilidad": bool(r["riesgo_vulnerabilidad"]),
                "semaforo": r["semaforo_riesgo"].lower().rstrip('a') if r.get("semaforo_riesgo") else "verde",
            })

        return {
            "slep_id": current_user["slep_id"],
            "total": len(establecimientos),
            "establecimientos": establecimientos,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting SLEP establishments: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


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
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting establishment detail: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
