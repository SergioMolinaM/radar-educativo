"""Dashboard router - Main overview endpoints for SLEP dashboards."""
import logging

from fastapi import APIRouter, Depends

from api.db.connection import query_all, query_one, check_table_exists
from api.routers.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

# Demo data used when DB tables don't exist yet
DEMO_SUMMARY = {
    "kpis": {
        "total_establecimientos": 45,
        "matricula_total": 12350,
        "asistencia_promedio": 87.2,
        "ejecucion_presupuestaria": 62.5,
        "alertas_rojas": 3,
        "alertas_naranjas": 8,
        "alertas_verdes": 34,
    },
    "tendencias": {
        "matricula_variacion_anual": -2.1,
        "asistencia_variacion_mensual": 1.3,
        "ejecucion_variacion_mensual": 5.2,
    },
}

DEMO_ESTABLECIMIENTOS = [
    {"rbd": 10001, "nombre": "Escuela Básica Las Acacias", "semaforo": "rojo",
     "alertas": ["Asistencia bajo 85%", "Ejecución presupuestaria bajo 40%"],
     "matricula": 320, "asistencia": 78.5, "ejecucion": 35.2},
    {"rbd": 10002, "nombre": "Liceo Polivalente Central", "semaforo": "naranja",
     "alertas": ["Ratio alumno/docente elevado"],
     "matricula": 890, "asistencia": 86.1, "ejecucion": 58.7},
    {"rbd": 10003, "nombre": "Escuela Rural Los Pinos", "semaforo": "verde",
     "alertas": [], "matricula": 45, "asistencia": 92.3, "ejecucion": 71.0},
]


def _use_real_data() -> bool:
    """Check if analytics tables exist for real queries."""
    try:
        return check_table_exists("analytics", "dim_establecimiento")
    except Exception:
        return False


@router.get("/summary")
def get_dashboard_summary(current_user: dict = Depends(get_current_user)):
    """Return high-level KPIs for the SLEP dashboard."""
    slep_id = current_user["slep_id"]

    if not _use_real_data():
        return {"slep_id": slep_id, **DEMO_SUMMARY}

    try:
        # Real queries against analytics schema
        est = query_one("SELECT COUNT(*) AS total FROM analytics.dim_establecimiento")
        mat = query_one("""
            SELECT COALESCE(SUM(total_matricula), 0) AS total,
                   COALESCE(AVG(asistencia_promedio), 0) AS asistencia_avg
            FROM analytics.vh_radar_integral
        """)
        total_est = est["total"] if est else 0
        total_mat = int(mat["total"]) if mat else 0
        asist_avg = round(float(mat["asistencia_avg"]), 1) if mat else 0

        return {
            "slep_id": slep_id,
            "kpis": {
                "total_establecimientos": total_est,
                "matricula_total": total_mat,
                "asistencia_promedio": asist_avg,
                "ejecucion_presupuestaria": 62.5,  # TODO: real budget query
                "alertas_rojas": 3,
                "alertas_naranjas": 8,
                "alertas_verdes": total_est - 11,
            },
            "tendencias": {
                "matricula_variacion_anual": -2.1,
                "asistencia_variacion_mensual": 1.3,
                "ejecucion_variacion_mensual": 5.2,
            },
        }
    except Exception as e:
        logger.warning("Falling back to demo data: %s", e)
        return {"slep_id": slep_id, **DEMO_SUMMARY}


@router.get("/semaforos")
def get_semaforos(current_user: dict = Depends(get_current_user)):
    """Return semaphore status for all establishments in the SLEP."""
    slep_id = current_user["slep_id"]

    if not _use_real_data():
        return {"slep_id": slep_id, "establecimientos": DEMO_ESTABLECIMIENTOS}

    try:
        rows = query_all("""
            SELECT
                rbd_liceo AS rbd,
                nombre_establecimiento AS nombre,
                total_matricula AS matricula,
                ROUND(asistencia_promedio::numeric, 1) AS asistencia,
                ratio_alumno_docente,
                es_rural
            FROM analytics.vh_radar_integral
            ORDER BY asistencia_promedio ASC
            LIMIT 100
        """)

        establecimientos = []
        for r in rows:
            alertas = []
            asist = float(r.get("asistencia") or 0)
            ratio = float(r.get("ratio_alumno_docente") or 0)
            rural = r.get("es_rural")

            # Apply alert rules
            if rural and asist < 88:
                alertas.append("Riesgo deserción rural (asistencia < 88%)")
            if not rural and asist < 85:
                alertas.append("Asistencia bajo umbral urbano (< 85%)")
            if ratio > 25:
                alertas.append(f"Ratio alumno/docente elevado ({ratio}:1)")

            if any("Riesgo" in a or asist < 85 for a in alertas):
                semaforo = "rojo"
            elif alertas:
                semaforo = "naranja"
            else:
                semaforo = "verde"

            establecimientos.append({
                "rbd": r["rbd"],
                "nombre": r["nombre"],
                "semaforo": semaforo,
                "alertas": alertas,
                "matricula": r.get("matricula") or 0,
                "asistencia": asist,
                "ejecucion": 60.0,  # TODO: real budget per establishment
            })

        return {"slep_id": slep_id, "establecimientos": establecimientos}

    except Exception as e:
        logger.warning("Falling back to demo semaforos: %s", e)
        return {"slep_id": slep_id, "establecimientos": DEMO_ESTABLECIMIENTOS}
