"""Pedagogical indicators router - SIMCE + Rendimiento for SLEP."""
import logging

from fastapi import APIRouter, Depends

from api.db.connection import query_all, query_one
from api.routers.auth import get_current_user
from api.routers.dashboard import _slep_filter

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/simce")
def simce_slep(current_user: dict = Depends(get_current_user)):
    """SIMCE 2024 results (preliminar) aggregated for the SLEP + by establishment.
    Source: datosabiertos.mineduc.cl - SIMCE 2024 preliminar por RBD."""
    slep_id = current_user["slep_id"]
    sf = _slep_filter(slep_id)
    try:
        # Use simce_2024_rbd (real data) joined with matricula for SLEP filter
        resumen = query_all(f"""
            SELECT 2024 AS anio, s.grado AS nivel, COUNT(*) AS n_ee,
                   ROUND(AVG(s.prom_lectura)::numeric, 1) AS avg_lectura,
                   ROUND(AVG(s.prom_matematica)::numeric, 1) AS avg_matematica,
                   ROUND(MIN(s.prom_lectura)::numeric, 1) AS min_lectura,
                   ROUND(MAX(s.prom_lectura)::numeric, 1) AS max_lectura,
                   ROUND(MIN(s.prom_matematica)::numeric, 1) AS min_matematica,
                   ROUND(MAX(s.prom_matematica)::numeric, 1) AS max_matematica
            FROM simce_2024_rbd s
            JOIN matricula_2025_rbd m ON s.rbd = m.rbd
            WHERE m.{sf} AND s.prom_lectura IS NOT NULL
            GROUP BY s.grado ORDER BY s.grado
        """)

        # By establishment detail
        detalle = query_all(f"""
            SELECT s.rbd, s.nom_rbd, 2024 AS anio, s.grado AS nivel,
                   'preliminar' AS estado_resultado,
                   s.prom_lectura, s.prom_matematica,
                   s.pct_insuficiente_lectura, s.pct_adecuado_lectura,
                   s.pct_insuficiente_matematica, s.pct_adecuado_matematica
            FROM simce_2024_rbd s
            JOIN matricula_2025_rbd m ON s.rbd = m.rbd
            WHERE m.{sf} AND s.prom_lectura IS NOT NULL
            ORDER BY s.grado, s.prom_lectura DESC NULLS LAST
        """)

        return {
            "slep_id": slep_id,
            "resumen": [dict(r) for r in resumen],
            "detalle": [dict(r) for r in detalle],
            "source": "simce_2024_preliminar",
            "fuente": "datosabiertos.mineduc.cl",
        }
    except Exception as e:
        logger.error("SIMCE error: %s", e)
        return {"slep_id": slep_id, "resumen": [], "detalle": [], "error": str(e)}


@router.get("/rendimiento")
def rendimiento_slep(current_user: dict = Depends(get_current_user)):
    """Academic performance for the SLEP - historical + 2025."""
    slep_id = current_user["slep_id"]
    sf = _slep_filter(slep_id)

    try:
        # 2025 aggregated
        r2025 = query_one(f"""
            SELECT SUM(total_alumnos) AS total, SUM(aprobados) AS aprob,
                   SUM(reprobados) AS reprob, SUM(retirados) AS retir, SUM(trasladados) AS trasl,
                   ROUND(AVG(prom_general)::numeric, 2) AS prom_gral,
                   ROUND(AVG(prom_asistencia)::numeric, 1) AS prom_asist
            FROM rendimiento_2025_detalle WHERE {sf}
        """)

        # By establishment 2025
        ee_2025 = query_all(f"""
            SELECT rbd, nom_rbd, total_alumnos, aprobados, reprobados, retirados,
                   tasa_aprobacion, tasa_retiro, prom_general
            FROM rendimiento_2025_detalle WHERE {sf}
            ORDER BY tasa_aprobacion DESC
        """)

        # Historical (2023-2024)
        historico = query_all("""
            SELECT r.anio,
                   SUM(r.aprobados_hom + r.aprobados_muj) AS aprob,
                   SUM(r.reprobados_hom + r.reprobados_muj) AS reprob,
                   SUM(r.retirados_hom + r.retirados_muj) AS retir,
                   ROUND(AVG(r.prom_asistencia)::numeric, 1) AS prom_asist
            FROM analytics.fact_rendimiento r
            JOIN matricula_2025_rbd m ON r.rbd = m.rbd
            WHERE m.nombre_slep IN (SELECT unnest(string_to_array(%s, ',')))
            GROUP BY r.anio ORDER BY r.anio
        """, (','.join(_get_names(slep_id)),))

        # Build response
        total = int(r2025['total'] or 0) if r2025 else 0
        aprob = int(r2025['aprob'] or 0) if r2025 else 0

        return {
            "slep_id": slep_id,
            "resumen_2025": {
                "total_alumnos": total,
                "aprobados": aprob,
                "reprobados": int(r2025['reprob'] or 0) if r2025 else 0,
                "retirados": int(r2025['retir'] or 0) if r2025 else 0,
                "trasladados": int(r2025['trasl'] or 0) if r2025 else 0,
                "tasa_aprobacion": round(aprob / max(total, 1) * 100, 1),
                "promedio_general": float(r2025['prom_gral'] or 0) if r2025 else 0,
                "promedio_asistencia": float(r2025['prom_asist'] or 0) if r2025 else 0,
            },
            "establecimientos": [{
                "rbd": int(e["rbd"]),
                "nombre": e["nom_rbd"],
                "total": int(e["total_alumnos"] or 0),
                "tasa_aprobacion": float(e["tasa_aprobacion"] or 0),
                "tasa_retiro": float(e["tasa_retiro"] or 0),
                "promedio": float(e["prom_general"] or 0),
            } for e in ee_2025],
            "historico": [{
                "anio": int(h["anio"]),
                "aprobados": int(h["aprob"] or 0),
                "reprobados": int(h["reprob"] or 0),
                "retirados": int(h["retir"] or 0),
                "tasa_aprobacion": round(int(h["aprob"] or 0) / max(int(h["aprob"] or 0) + int(h["reprob"] or 0) + int(h["retir"] or 0), 1) * 100, 1),
            } for h in historico],
            "source": "rendimiento_real",
        }
    except Exception as e:
        logger.error("Rendimiento error: %s", e)
        return {"slep_id": slep_id, "resumen_2025": {}, "establecimientos": [], "historico": [], "error": str(e)}


@router.get("/egresados")
def egresados_slep(current_user: dict = Depends(get_current_user)):
    """Egresados EM 2024 - tasa de egreso y promedio notas por EE del SLEP.
    Fuente: datosabiertos.mineduc.cl - Egresados EM 2024."""
    slep_id = current_user["slep_id"]
    sf = _slep_filter(slep_id)
    try:
        rows = query_all(f"""
            SELECT e.rbd, m.nom_rbd, e.total_alumnos, e.egresados, e.no_egresados,
                   ROUND((e.egresados::float / NULLIF(e.total_alumnos, 0) * 100)::numeric, 1) AS tasa_egreso,
                   e.prom_notas_avg
            FROM egresados_em_2024 e
            JOIN matricula_2025_rbd m ON e.rbd = m.rbd
            WHERE m.{sf}
            ORDER BY tasa_egreso DESC NULLS LAST
        """)

        total_alumnos = sum(int(r.get("total_alumnos") or 0) for r in rows)
        total_egresados = sum(int(r.get("egresados") or 0) for r in rows)

        return {
            "slep_id": slep_id,
            "resumen": {
                "total_ee": len(rows),
                "total_alumnos_4m": total_alumnos,
                "total_egresados": total_egresados,
                "tasa_egreso_global": round(total_egresados / max(total_alumnos, 1) * 100, 1),
            },
            "establecimientos": [{
                "rbd": int(r["rbd"]),
                "nombre": r["nom_rbd"],
                "total_alumnos": int(r.get("total_alumnos") or 0),
                "egresados": int(r.get("egresados") or 0),
                "tasa_egreso": float(r.get("tasa_egreso") or 0),
                "promedio_notas": float(r.get("prom_notas_avg") or 0),
            } for r in rows],
            "source": "egresados_em_2024_real",
            "fuente": "datosabiertos.mineduc.cl",
        }
    except Exception as e:
        logger.error("Egresados error: %s", e)
        return {"slep_id": slep_id, "resumen": {}, "establecimientos": [], "error": str(e)}


@router.get("/sae")
def sae_slep(current_user: dict = Depends(get_current_user)):
    """SAE 2025 - Resultados admision por EE del SLEP (demanda vs capacidad).
    Fuente: datosabiertos.mineduc.cl - SAE Admision 2026."""
    slep_id = current_user["slep_id"]
    sf = _slep_filter(slep_id)
    try:
        rows = query_all(f"""
            SELECT s.rbd_admitido AS rbd, m.nom_rbd,
                   s.total_admitidos, s.aceptaron, s.rechazaron, s.lista_espera,
                   ROUND((s.aceptaron::float / NULLIF(s.total_admitidos, 0) * 100)::numeric, 1) AS tasa_aceptacion
            FROM sae_resultados_2025 s
            JOIN matricula_2025_rbd m ON s.rbd_admitido = m.rbd
            WHERE m.{sf}
            ORDER BY s.total_admitidos DESC
        """)

        total_admitidos = sum(int(r.get("total_admitidos") or 0) for r in rows)
        total_aceptaron = sum(int(r.get("aceptaron") or 0) for r in rows)

        return {
            "slep_id": slep_id,
            "resumen": {
                "total_ee_con_admision": len(rows),
                "total_admitidos": total_admitidos,
                "total_aceptaron": total_aceptaron,
                "tasa_aceptacion_global": round(total_aceptaron / max(total_admitidos, 1) * 100, 1),
            },
            "establecimientos": [{
                "rbd": int(r["rbd"]),
                "nombre": r["nom_rbd"],
                "admitidos": int(r.get("total_admitidos") or 0),
                "aceptaron": int(r.get("aceptaron") or 0),
                "rechazaron": int(r.get("rechazaron") or 0),
                "lista_espera": int(r.get("lista_espera") or 0),
                "tasa_aceptacion": float(r.get("tasa_aceptacion") or 0),
            } for r in rows],
            "source": "sae_2025_real",
            "fuente": "datosabiertos.mineduc.cl",
        }
    except Exception as e:
        logger.error("SAE error: %s", e)
        return {"slep_id": slep_id, "resumen": {}, "establecimientos": [], "error": str(e)}


def _get_names(slep_id):
    from api.routers.dashboard import SLEP_NAME_MAP
    return SLEP_NAME_MAP.get(slep_id, [slep_id.upper().replace("_", " ")])
