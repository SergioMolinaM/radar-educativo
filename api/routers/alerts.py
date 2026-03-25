"""Alerts router - Early warning system endpoints."""
from fastapi import APIRouter, Depends, Query

from api.routers.auth import get_current_user

router = APIRouter()


@router.get("/")
def get_alerts(
    severity: str = Query(None, description="Filter: rojo, naranja, verde"),
    current_user: dict = Depends(get_current_user),
):
    """Return active alerts for the SLEP."""
    # TODO: Connect to AlertEngine.run()
    alerts = [
        {
            "id": 1,
            "rbd": 10001,
            "establecimiento": "Escuela Básica Las Acacias",
            "tipo": "asistencia_critica",
            "severidad": "rojo",
            "mensaje": "Asistencia promedio 78.5% - bajo umbral crítico 85%",
            "valor": 78.5,
            "umbral": 85.0,
            "fecha_deteccion": "2026-03-20",
            "accion_sugerida": "Activar plan de retención y contactar apoderados",
        },
        {
            "id": 2,
            "rbd": 10001,
            "establecimiento": "Escuela Básica Las Acacias",
            "tipo": "ejecucion_presupuestaria",
            "severidad": "rojo",
            "mensaje": "Ejecución presupuestaria 35.2% al mes 3 - riesgo de subejercicio",
            "valor": 35.2,
            "umbral": 40.0,
            "fecha_deteccion": "2026-03-18",
            "accion_sugerida": "Revisar plan de compras y acelerar licitaciones pendientes",
        },
        {
            "id": 3,
            "rbd": 10002,
            "establecimiento": "Liceo Polivalente Central",
            "tipo": "ratio_docente",
            "severidad": "naranja",
            "mensaje": "Ratio alumno/docente 32:1 - sobre umbral recomendado 25:1",
            "valor": 32.0,
            "umbral": 25.0,
            "fecha_deteccion": "2026-03-15",
            "accion_sugerida": "Evaluar contratación docente adicional o redistribución",
        },
    ]

    if severity:
        alerts = [a for a in alerts if a["severidad"] == severity]

    return {"total": len(alerts), "alerts": alerts}
