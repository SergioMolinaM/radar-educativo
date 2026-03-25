"""Dashboard router - Main overview endpoints for SLEP dashboards."""
from fastapi import APIRouter, Depends

from api.routers.auth import get_current_user

router = APIRouter()


@router.get("/summary")
def get_dashboard_summary(current_user: dict = Depends(get_current_user)):
    """Return high-level KPIs for the SLEP dashboard."""
    slep_id = current_user["slep_id"]

    # TODO: Replace with real DB queries
    return {
        "slep_id": slep_id,
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


@router.get("/semaforos")
def get_semaforos(current_user: dict = Depends(get_current_user)):
    """Return semaphore status for all establishments in the SLEP."""
    # TODO: Connect to AlertEngine service
    return {
        "slep_id": current_user["slep_id"],
        "establecimientos": [
            {
                "rbd": 10001,
                "nombre": "Escuela Básica Las Acacias",
                "semaforo": "rojo",
                "alertas": ["Asistencia bajo 85%", "Ejecución presupuestaria bajo 40%"],
                "matricula": 320,
                "asistencia": 78.5,
                "ejecucion": 35.2,
            },
            {
                "rbd": 10002,
                "nombre": "Liceo Polivalente Central",
                "semaforo": "naranja",
                "alertas": ["Ratio alumno/docente elevado"],
                "matricula": 890,
                "asistencia": 86.1,
                "ejecucion": 58.7,
            },
            {
                "rbd": 10003,
                "nombre": "Escuela Rural Los Pinos",
                "semaforo": "verde",
                "alertas": [],
                "matricula": 45,
                "asistencia": 92.3,
                "ejecucion": 71.0,
            },
        ],
    }
