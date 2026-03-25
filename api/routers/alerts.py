"""Alerts router - Early warning system endpoints."""
import logging

from fastapi import APIRouter, Depends, Query

from api.db.connection import query_all, check_table_exists
from api.routers.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

DEMO_ALERTS = [
    {"id": 1, "rbd": 10001, "establecimiento": "Escuela Básica Las Acacias", "tipo": "asistencia_critica",
     "severidad": "rojo", "mensaje": "Asistencia promedio 78.5% - bajo umbral crítico 85%",
     "valor": 78.5, "umbral": 85.0, "fecha_deteccion": "2026-03-20",
     "accion_sugerida": "Activar plan de retención y contactar apoderados"},
    {"id": 2, "rbd": 10001, "establecimiento": "Escuela Básica Las Acacias", "tipo": "ejecucion_presupuestaria",
     "severidad": "rojo", "mensaje": "Ejecución presupuestaria 35.2% al mes 3 - riesgo de subejercicio",
     "valor": 35.2, "umbral": 40.0, "fecha_deteccion": "2026-03-18",
     "accion_sugerida": "Revisar plan de compras y acelerar licitaciones pendientes"},
    {"id": 3, "rbd": 10002, "establecimiento": "Liceo Polivalente Central", "tipo": "ratio_docente",
     "severidad": "naranja", "mensaje": "Ratio alumno/docente 32:1 - sobre umbral recomendado 25:1",
     "valor": 32.0, "umbral": 25.0, "fecha_deteccion": "2026-03-15",
     "accion_sugerida": "Evaluar contratación docente adicional o redistribución"},
]


@router.get("/")
def get_alerts(
    severity: str = Query(None, description="Filter: rojo, naranja, verde"),
    current_user: dict = Depends(get_current_user),
):
    """Return active alerts for the SLEP."""
    try:
        if not check_table_exists("analytics", "dim_establecimiento"):
            raise Exception("No analytics tables")

        rows = query_all("""
            SELECT
                rbd_liceo AS rbd,
                nombre_establecimiento AS nombre,
                total_matricula AS matricula,
                asistencia_promedio AS asistencia,
                ratio_alumno_docente AS ratio,
                es_rural,
                total_docentes
            FROM analytics.vh_radar_integral
            ORDER BY asistencia_promedio ASC
        """)

        alerts = []
        alert_id = 1
        for r in rows:
            asist = float(r.get("asistencia") or 0)
            ratio = float(r.get("ratio") or 0)
            mat = int(r.get("matricula") or 0)
            rural = r.get("es_rural")
            docentes = int(r.get("total_docentes") or 0)

            # Rule: rural dropout risk
            if rural and asist < 88:
                alerts.append(_alert(alert_id, r, "rojo", "desercion_rural",
                    f"Asistencia rural {asist}% bajo umbral 88% - riesgo de deserción",
                    asist, 88.0, "Activar programa de retención rural y transporte escolar"))
                alert_id += 1

            # Rule: urban attendance
            if not rural and asist < 85:
                alerts.append(_alert(alert_id, r, "rojo", "asistencia_critica",
                    f"Asistencia urbana {asist}% bajo umbral 85% - riesgo subvención",
                    asist, 85.0, "Activar plan de retención y contactar apoderados"))
                alert_id += 1

            # Rule: high student/teacher ratio
            if ratio > 25:
                alerts.append(_alert(alert_id, r, "naranja", "ratio_docente",
                    f"Ratio alumno/docente {ratio}:1 sobre umbral 25:1",
                    ratio, 25.0, "Evaluar contratación docente adicional"))
                alert_id += 1

            # Rule: micro-school sustainability
            if mat > 0 and mat < 50 and docentes > 8:
                alerts.append(_alert(alert_id, r, "naranja", "microescuela",
                    f"Microescuela ({mat} alumnos, {docentes} docentes) - revisar sustentabilidad",
                    mat, 50.0, "Evaluar fusión o redistribución de personal"))
                alert_id += 1

        if severity:
            alerts = [a for a in alerts if a["severidad"] == severity]

        return {"total": len(alerts), "alerts": alerts}

    except Exception as e:
        logger.warning("Falling back to demo alerts: %s", e)
        filtered = DEMO_ALERTS if not severity else [a for a in DEMO_ALERTS if a["severidad"] == severity]
        return {"total": len(filtered), "alerts": filtered}


def _alert(aid, row, sev, tipo, msg, val, umbral, accion):
    return {
        "id": aid,
        "rbd": row["rbd"],
        "establecimiento": row["nombre"],
        "tipo": tipo,
        "severidad": sev,
        "mensaje": msg,
        "valor": val,
        "umbral": umbral,
        "fecha_deteccion": "2026-03-25",
        "accion_sugerida": accion,
    }
