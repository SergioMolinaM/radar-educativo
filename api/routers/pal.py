"""PAL router - Plan Anual Local tracking and monitoring."""
import logging

from fastapi import APIRouter, Depends, HTTPException

from api.db.connection import query_all, query_one
from api.routers.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


def _match_slep_clause():
    return "(LOWER(REPLACE(slep_nombre, ' ', '_')) = %s OR UPPER(slep_nombre) = UPPER(REPLACE(%s, '_', ' ')))"


@router.get("/documentos")
def list_pal_documents(current_user: dict = Depends(get_current_user)):
    """List all PAL documents loaded."""
    try:
        slep_id = current_user["slep_id"]
        docs = query_all(f"""
            SELECT id, slep_nombre, anio, tipo_documento, acto_administrativo,
                   fecha_aprobacion, estado_extraccion,
                   (SELECT COUNT(*) FROM analytics.pal_linea WHERE pal_id = d.id) AS n_lineas,
                   (SELECT COUNT(*) FROM analytics.pal_indicador i
                    JOIN analytics.pal_linea l ON i.linea_id = l.id
                    WHERE l.pal_id = d.id) AS n_indicadores
            FROM analytics.pal_document d
            WHERE {_match_slep_clause()}
            ORDER BY anio DESC
        """, (slep_id, slep_id))
        return {"total": len(docs), "documentos": docs}
    except Exception as e:
        logger.error("Error listing PAL docs: %s", e)
        return {"total": 0, "documentos": []}


@router.get("/documento/{doc_id}")
def get_pal_detail(doc_id: int, current_user: dict = Depends(get_current_user)):
    """Get full PAL detail with lines and indicators (including avance and formula)."""
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
                SELECT nombre_indicador, meta, avance_actual, periodicidad,
                       medio_verificacion, responsable, automatizable,
                       formula_calculo, observacion
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
                            "avance": ind.get("avance_actual"),
                            "periodicidad": ind.get("periodicidad"),
                            "medio_verificacion": ind.get("medio_verificacion"),
                            "responsable": ind.get("responsable"),
                            "automatizable": ind.get("automatizable"),
                            "formula": ind.get("formula_calculo"),
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
    """Summary of PAL compliance across all loaded PALs for current SLEP."""
    try:
        slep_id = current_user["slep_id"]
        stats = query_one(f"""
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
            WHERE {_match_slep_clause()}
        """, (slep_id, slep_id))

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


@router.get("/cge/{doc_id}")
def get_cge(doc_id: int, current_user: dict = Depends(get_current_user)):
    """Get CGE (Convenio de Gestión Educacional) data for a PAL document."""
    try:
        rows = query_all("""
            SELECT objetivo, sub_indicador, indicador_nombre, meta,
                   ponderacion, resultado_obtenido, ponderacion_alcanzada, observacion
            FROM analytics.pal_cge
            WHERE pal_id = %s
            ORDER BY objetivo, sub_indicador
        """, (doc_id,))
        return {"total": len(rows), "cge": rows}
    except Exception as e:
        logger.error("Error getting CGE: %s", e)
        return {"total": 0, "cge": []}


@router.get("/pme/{doc_id}")
def get_pme_avance(doc_id: int, current_user: dict = Depends(get_current_user)):
    """Get PME progress by school for a PAL document."""
    try:
        rows = query_all("""
            SELECT rbd, nombre_ee, comuna,
                   n_acciones_liderazgo, n_acciones_gestion_pedagogica,
                   n_acciones_convivencia, n_acciones_recursos,
                   total_acciones, pct_cumplimiento
            FROM analytics.pal_pme_avance
            WHERE pal_id = %s
            ORDER BY pct_cumplimiento DESC
        """, (doc_id,))

        # Estadísticas resumen
        if rows:
            pcts = [float(r["pct_cumplimiento"]) for r in rows]
            promedio = sum(pcts) / len(pcts)
            criticos = [r for r in rows if float(r["pct_cumplimiento"]) < 30]
            buenos = [r for r in rows if float(r["pct_cumplimiento"]) >= 70]
        else:
            promedio = 0
            criticos = []
            buenos = []

        return {
            "total_ee": len(rows),
            "promedio_cumplimiento": round(promedio, 1),
            "ee_criticos": len(criticos),
            "ee_sobre_70": len(buenos),
            "establecimientos": rows,
        }
    except Exception as e:
        logger.error("Error getting PME avance: %s", e)
        return {"total_ee": 0, "establecimientos": []}
