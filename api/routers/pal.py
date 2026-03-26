"""PAL router - Plan Anual Local tracking and monitoring."""
import logging

from fastapi import APIRouter, Depends, HTTPException

from api.db.connection import query_all, query_one
from api.routers.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/documentos")
def list_pal_documents(current_user: dict = Depends(get_current_user)):
    """List all PAL documents loaded."""
    try:
        slep_id = current_user["slep_id"]
        docs = query_all("""
            SELECT id, slep_nombre, anio, tipo_documento, acto_administrativo,
                   fecha_aprobacion, estado_extraccion,
                   (SELECT COUNT(*) FROM analytics.pal_linea WHERE pal_id = d.id) AS n_lineas,
                   (SELECT COUNT(*) FROM analytics.pal_indicador i
                    JOIN analytics.pal_linea l ON i.linea_id = l.id
                    WHERE l.pal_id = d.id) AS n_indicadores
            FROM analytics.pal_document d
            WHERE LOWER(REPLACE(slep_nombre, ' ', '_')) = %s
               OR UPPER(slep_nombre) = UPPER(REPLACE(%s, '_', ' '))
            ORDER BY anio DESC
        """, (slep_id, slep_id))
        return {"total": len(docs), "documentos": docs}
    except Exception as e:
        logger.error("Error listing PAL docs: %s", e)
        return {"total": 0, "documentos": []}


@router.get("/documento/{doc_id}")
def get_pal_detail(doc_id: int, current_user: dict = Depends(get_current_user)):
    """Get full PAL detail with lines and indicators."""
    try:
        doc = query_one("SELECT * FROM analytics.pal_document WHERE id = %s", (doc_id,))
        if not doc:
            raise HTTPException(status_code=404, detail="PAL no encontrado")

        lineas = query_all("""
            SELECT l.id, l.nombre_linea, l.descripcion, l.orden
            FROM analytics.pal_linea l
            WHERE l.pal_id = %s
            ORDER BY l.orden
        """, (doc_id,))

        for linea in lineas:
            indicadores = query_all("""
                SELECT nombre_indicador, meta, periodicidad,
                       medio_verificacion, responsable, automatizable, observacion
                FROM analytics.pal_indicador
                WHERE linea_id = %s
            """, (linea["id"],))
            linea["indicadores"] = indicadores

        return {
            "documento": {
                "id": doc["id"],
                "slep": doc["slep_nombre"],
                "anio": doc["anio"],
                "tipo": doc["tipo_documento"],
                "acto_administrativo": doc.get("acto_administrativo"),
                "fecha_aprobacion": str(doc.get("fecha_aprobacion") or ""),
                "estado": doc.get("estado_extraccion"),
            },
            "lineas": [
                {
                    "nombre": l["nombre_linea"],
                    "descripcion": l["descripcion"],
                    "orden": l["orden"],
                    "indicadores": [
                        {
                            "nombre": ind["nombre_indicador"],
                            "meta": ind["meta"],
                            "periodicidad": ind["periodicidad"],
                            "medio_verificacion": ind["medio_verificacion"],
                            "responsable": ind["responsable"],
                            "automatizable": ind["automatizable"],
                            "observacion": ind.get("observacion"),
                        }
                        for ind in l["indicadores"]
                    ],
                }
                for l in lineas
            ],
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting PAL detail: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/resumen")
def pal_summary(current_user: dict = Depends(get_current_user)):
    """Summary of PAL compliance across all loaded PALs."""
    try:
        stats = query_one("""
            SELECT
                COUNT(DISTINCT d.id) AS total_pals,
                COUNT(DISTINCT l.id) AS total_lineas,
                COUNT(i.id) AS total_indicadores,
                SUM(CASE WHEN i.automatizable = 'si' THEN 1 ELSE 0 END) AS automatizables,
                SUM(CASE WHEN i.automatizable = 'parcial' THEN 1 ELSE 0 END) AS parciales,
                SUM(CASE WHEN i.automatizable = 'manual' THEN 1 ELSE 0 END) AS manuales
            FROM analytics.pal_document d
            LEFT JOIN analytics.pal_linea l ON l.pal_id = d.id
            LEFT JOIN analytics.pal_indicador i ON i.linea_id = l.id
        """)

        return {
            "total_pals": int(stats["total_pals"] or 0),
            "total_lineas": int(stats["total_lineas"] or 0),
            "total_indicadores": int(stats["total_indicadores"] or 0),
            "automatizables": int(stats["automatizables"] or 0),
            "parciales": int(stats["parciales"] or 0),
            "manuales": int(stats["manuales"] or 0),
        }
    except Exception as e:
        logger.error("Error getting PAL summary: %s", e)
        return {"total_pals": 0, "total_lineas": 0, "total_indicadores": 0}
