"""Financial router - Budget execution and Mercado Público endpoints."""
import logging

from fastapi import APIRouter, Depends

from api.db.connection import query_all, check_table_exists
from api.routers.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

DEMO_EXECUTION = {
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

DEMO_ORDERS = [
    {"id": "OC-2026-00234", "proveedor": "Sodexo Chile", "monto": 12500000,
     "estado": "Aceptada", "fecha": "2026-03-15", "categoria": "Alimentación escolar"},
    {"id": "OC-2026-00198", "proveedor": "Ediciones SM Chile", "monto": 3200000,
     "estado": "En proceso", "fecha": "2026-03-10", "categoria": "Material didáctico"},
]


@router.get("/execution")
def get_budget_execution(current_user: dict = Depends(get_current_user)):
    """Return budget execution summary for the SLEP."""
    slep_id = current_user["slep_id"]

    try:
        if not check_table_exists("staging", "stg_mercadopublico_ordenes"):
            raise Exception("No financial tables")

        rows = query_all("""
            SELECT
                rut_slep,
                SUM(monto_neto_clp) AS total_ejecutado,
                COUNT(codigo_orden) AS total_ordenes
            FROM staging.stg_mercadopublico_ordenes
            WHERE estado = 'Aceptada'
            GROUP BY rut_slep
        """)

        total_ejecutado = sum(int(r.get("total_ejecutado") or 0) for r in rows)
        presupuesto_total = 5400000000  # TODO: from config per SLEP
        pct = round(total_ejecutado / presupuesto_total * 100, 1) if presupuesto_total > 0 else 0

        return {
            "slep_id": slep_id,
            "periodo": "2026-Q1",
            "presupuesto_total": presupuesto_total,
            "ejecutado": total_ejecutado,
            "porcentaje_ejecucion": pct,
            "por_establecimiento": DEMO_EXECUTION["por_establecimiento"],  # TODO: breakdown
        }

    except Exception as e:
        logger.warning("Falling back to demo execution: %s", e)
        return {"slep_id": slep_id, **DEMO_EXECUTION}


@router.get("/mercado-publico")
def get_mercado_publico(current_user: dict = Depends(get_current_user)):
    """Return recent Mercado Público purchase orders."""
    slep_id = current_user["slep_id"]

    try:
        if not check_table_exists("staging", "stg_mercadopublico_ordenes"):
            raise Exception("No MP tables")

        rows = query_all("""
            SELECT
                codigo_orden AS id,
                nombre_proveedor AS proveedor,
                monto_neto_clp AS monto,
                estado,
                fecha_aceptacion AS fecha,
                nombre_producto AS categoria
            FROM staging.stg_mercadopublico_ordenes
            ORDER BY fecha_aceptacion DESC
            LIMIT 20
        """)

        ordenes = []
        for r in rows:
            ordenes.append({
                "id": r.get("id") or "—",
                "proveedor": r.get("proveedor") or "Sin proveedor",
                "monto": int(r.get("monto") or 0),
                "estado": r.get("estado") or "—",
                "fecha": str(r.get("fecha") or "—"),
                "categoria": r.get("categoria") or "General",
            })

        return {"slep_id": slep_id, "ordenes_recientes": ordenes}

    except Exception as e:
        logger.warning("Falling back to demo orders: %s", e)
        return {"slep_id": slep_id, "ordenes_recientes": DEMO_ORDERS}
