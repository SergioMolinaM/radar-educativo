"""Financial router - Budget execution and Mercado Público endpoints."""
from fastapi import APIRouter, Depends

from api.routers.auth import get_current_user

router = APIRouter()


@router.get("/execution")
def get_budget_execution(current_user: dict = Depends(get_current_user)):
    """Return budget execution summary for the SLEP."""
    # TODO: Connect to financial_agent + DuckDB analytics
    return {
        "slep_id": current_user["slep_id"],
        "periodo": "2026-Q1",
        "presupuesto_total": 5400000000,
        "ejecutado": 1890000000,
        "porcentaje_ejecucion": 35.0,
        "por_establecimiento": [
            {"rbd": 10001, "nombre": "Escuela Básica Las Acacias", "presupuesto": 450000000, "ejecutado": 158400000, "pct": 35.2},
            {"rbd": 10002, "nombre": "Liceo Polivalente Central", "presupuesto": 980000000, "ejecutado": 575260000, "pct": 58.7},
            {"rbd": 10003, "nombre": "Escuela Rural Los Pinos", "presupuesto": 120000000, "ejecutado": 85200000, "pct": 71.0},
        ],
    }


@router.get("/mercado-publico")
def get_mercado_publico(current_user: dict = Depends(get_current_user)):
    """Return recent Mercado Público purchase orders."""
    # TODO: Connect to MercadoPublicoAgent
    return {
        "slep_id": current_user["slep_id"],
        "ordenes_recientes": [
            {
                "id": "OC-2026-00234",
                "proveedor": "Sodexo Chile",
                "monto": 12500000,
                "estado": "Aceptada",
                "fecha": "2026-03-15",
                "categoria": "Alimentación escolar",
            },
            {
                "id": "OC-2026-00198",
                "proveedor": "Ediciones SM Chile",
                "monto": 3200000,
                "estado": "En proceso",
                "fecha": "2026-03-10",
                "categoria": "Material didáctico",
            },
        ],
    }
