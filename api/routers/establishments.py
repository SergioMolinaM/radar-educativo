"""Establishments router - School/establishment detail endpoints."""
from fastapi import APIRouter, Depends

from api.routers.auth import get_current_user

router = APIRouter()


@router.get("/")
def list_establishments(current_user: dict = Depends(get_current_user)):
    """List all establishments in the SLEP."""
    # TODO: Query analytics.dim_establecimiento
    return {
        "slep_id": current_user["slep_id"],
        "total": 3,
        "establecimientos": [
            {"rbd": 10001, "nombre": "Escuela Básica Las Acacias", "tipo": "Básica", "comuna": "Cerro Navia", "matricula": 320, "estado": "activo"},
            {"rbd": 10002, "nombre": "Liceo Polivalente Central", "tipo": "Media", "comuna": "Pudahuel", "matricula": 890, "estado": "activo"},
            {"rbd": 10003, "nombre": "Escuela Rural Los Pinos", "tipo": "Básica", "comuna": "Lo Prado", "matricula": 45, "estado": "activo"},
        ],
    }


@router.get("/{rbd}")
def get_establishment(rbd: int, current_user: dict = Depends(get_current_user)):
    """Get detailed information for a single establishment."""
    # TODO: Query real data from analytics schema
    return {
        "rbd": rbd,
        "nombre": "Escuela Básica Las Acacias",
        "tipo": "Básica",
        "comuna": "Cerro Navia",
        "direccion": "Av. José Joaquín Pérez 1234",
        "matricula": {
            "actual": 320,
            "anterior": 335,
            "variacion": -4.5,
        },
        "asistencia": {
            "promedio_mensual": 78.5,
            "tendencia": [-2.1, -1.5, -0.8, 0.3],
        },
        "dotacion": {
            "docentes": 18,
            "asistentes": 12,
            "ratio_alumno_docente": 17.8,
        },
        "financiero": {
            "presupuesto_anual": 450000000,
            "ejecutado": 158400000,
            "porcentaje_ejecucion": 35.2,
            "ordenes_compra_activas": 5,
        },
        "semaforo": "rojo",
        "alertas_activas": 2,
    }
