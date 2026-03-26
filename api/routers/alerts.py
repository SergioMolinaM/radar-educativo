"""Alerts router - Early warning system using real 2025 data."""
import logging
from datetime import date

from fastapi import APIRouter, Depends, Query

from api.db.connection import query_all, check_table_exists
from api.routers.auth import get_current_user
from api.routers.dashboard import _slep_filter

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/")
def get_alerts(
    severity: str = Query(None, description="Filter: rojo, naranja, verde"),
    current_user: dict = Depends(get_current_user),
):
    """Return active alerts for the SLEP based on 2025 data."""
    slep_id = current_user["slep_id"]
    sf = _slep_filter(slep_id)
    today = date.today().isoformat()

    try:
        # Get establishments with all indicators
        rows = query_all(f"""
            SELECT
                a.rbd, a.nom_rbd AS nombre, a.pct_asistencia,
                a.total_alumnos, a.mes,
                m.matricula_total,
                r.tasa_aprobacion, r.tasa_retiro, r.prom_asistencia AS asist_rendimiento,
                d.rural_rbd
            FROM asistencia_2025_rbd a
            LEFT JOIN matricula_2025_rbd m ON a.rbd = m.rbd
            LEFT JOIN rendimiento_2025_detalle r ON a.rbd = r.rbd
            LEFT JOIN directorio_2025 d ON a.rbd = d.rbd
            WHERE a.{sf}
              AND a.mes = (SELECT MAX(mes) FROM asistencia_2025_rbd WHERE {sf})
            ORDER BY a.pct_asistencia ASC
        """)

        alerts = []
        aid = 1
        for r in rows:
            asist = float(r.get("pct_asistencia") or 0)
            mat = int(r.get("matricula_total") or r.get("total_alumnos") or 0)
            tasa_retiro = float(r.get("tasa_retiro") or 0)
            tasa_aprob = float(r.get("tasa_aprobacion") or 0)
            rural = r.get("rural_rbd") == 1

            # Regla 1: Asistencia crítica (<80%)
            if asist < 80:
                alerts.append(_alert(aid, r, "rojo", "asistencia_critica",
                    f"Asistencia {asist}% - bajo umbral crítico 80%",
                    asist, 80.0, "Activar plan de retención y contactar apoderados", today))
                aid += 1

            # Regla 2: Asistencia en riesgo (80-88%)
            elif asist < 88:
                alerts.append(_alert(aid, r, "naranja", "asistencia_riesgo",
                    f"Asistencia {asist}% - bajo meta 88%",
                    asist, 88.0, "Monitorear y reforzar seguimiento de asistencia", today))
                aid += 1

            # Regla 3: Tasa de retiro alta (>5%)
            if tasa_retiro > 5:
                alerts.append(_alert(aid, r, "rojo", "retiro_alto",
                    f"Tasa de retiro {tasa_retiro}% - sobre umbral 5%",
                    tasa_retiro, 5.0, "Analizar causas de retiro y activar programa de reincorporación", today))
                aid += 1

            # Regla 4: Tasa de aprobación baja (<85%)
            if tasa_aprob > 0 and tasa_aprob < 85:
                sev = "rojo" if tasa_aprob < 75 else "naranja"
                alerts.append(_alert(aid, r, sev, "aprobacion_baja",
                    f"Tasa de aprobación {tasa_aprob}% - bajo umbral 85%",
                    tasa_aprob, 85.0, "Revisar planes de apoyo académico y reforzamiento", today))
                aid += 1

            # Regla 5: Microescuela (<30 alumnos)
            if 0 < mat < 30:
                alerts.append(_alert(aid, r, "naranja", "microescuela",
                    f"Microescuela con {mat} alumnos - evaluar sustentabilidad",
                    mat, 30.0, "Evaluar fusión o reorganización de recursos", today))
                aid += 1

            # Regla 6: Escuela rural con asistencia bajo 85%
            if rural and asist < 85:
                alerts.append(_alert(aid, r, "rojo", "desercion_rural",
                    f"Escuela rural con asistencia {asist}% - riesgo de deserción",
                    asist, 85.0, "Activar programa de retención rural y transporte escolar", today))
                aid += 1

        if severity:
            alerts = [a for a in alerts if a["severidad"] == severity]

        return {
            "slep_id": slep_id,
            "total": len(alerts),
            "rojas": sum(1 for a in alerts if a["severidad"] == "rojo"),
            "naranjas": sum(1 for a in alerts if a["severidad"] == "naranja"),
            "alerts": alerts,
            "source": "2025_real",
        }

    except Exception as e:
        logger.warning("Alerts error: %s", e)
        return {"slep_id": slep_id, "total": 0, "alerts": [], "error": str(e)}


def _alert(aid, row, sev, tipo, msg, val, umbral, accion, fecha):
    return {
        "id": aid,
        "rbd": int(row["rbd"]),
        "establecimiento": row["nombre"],
        "tipo": tipo,
        "severidad": sev,
        "mensaje": msg,
        "valor": round(val, 1),
        "umbral": umbral,
        "fecha_deteccion": fecha,
        "accion_sugerida": accion,
    }
