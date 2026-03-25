"""Financial router - Budget execution and Mercado Público endpoints."""
import logging
import os

import requests as http_requests
import yaml
from dotenv import load_dotenv
from fastapi import APIRouter, Depends

from api.db.connection import query_all, check_table_exists
from api.routers.auth import get_current_user

load_dotenv()

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


def _get_slep_codigo(slep_id: str) -> str | None:
    """Get Mercado Público organism code for a SLEP from config."""
    config_paths = ["api/config/slep_config.yaml", "config/slep_config.yaml"]
    for path in config_paths:
        try:
            with open(path) as f:
                config = yaml.safe_load(f)
            for slep in config.get("sleps", []):
                if slep.get("id") == slep_id:
                    return slep.get("codigo_organismo")
        except FileNotFoundError:
            continue
    return None


@router.get("/mercado-publico-live")
def get_mercado_publico_live(current_user: dict = Depends(get_current_user)):
    """Query Mercado Público API in real-time for the user's SLEP."""
    slep_id = current_user["slep_id"]
    ticket = os.getenv("MERCADO_PUBLICO_TICKET")

    if not ticket or ticket == "ingresar_ticket_aqui":
        return {"slep_id": slep_id, "error": "API ticket no configurado", "ordenes": []}

    codigo = _get_slep_codigo(slep_id)
    if not codigo:
        return {"slep_id": slep_id, "error": f"Código organismo no encontrado para SLEP {slep_id}", "ordenes": []}

    try:
        url = "https://api.mercadopublico.cl/servicios/v1/publico/ordenesdecompra.json"
        resp = http_requests.get(url, params={
            "ticket": ticket,
            "CodigoOrganismo": codigo,
            "estado": "todos",
        }, timeout=30)

        if resp.status_code != 200:
            return {"slep_id": slep_id, "error": f"API respondió {resp.status_code}", "ordenes": []}

        data = resp.json()
        ordenes = []
        for oc in data.get("Listado", []):
            ordenes.append({
                "id": oc.get("Codigo", ""),
                "nombre": oc.get("Nombre", "")[:80],
                "estado": oc.get("Estado") or "Sin estado",
                "fecha": oc.get("Fechas", {}).get("FechaCreacion", ""),
                "tipo": oc.get("Tipo", ""),
            })

        return {
            "slep_id": slep_id,
            "codigo_organismo": codigo,
            "total": data.get("Cantidad", 0),
            "ordenes": ordenes,
        }

    except Exception as e:
        logger.error("Error consultando Mercado Público: %s", e)
        return {"slep_id": slep_id, "error": str(e), "ordenes": []}
