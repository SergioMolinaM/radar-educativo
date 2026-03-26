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
    """SIMCE results aggregated for the SLEP + by establishment."""
    slep_id = current_user["slep_id"]
    try:
        # Aggregated by year and level
        resumen = query_all("""
            SELECT f.anio, f.nivel, COUNT(*) AS n_ee,
                   ROUND(AVG(f.prom_lectura)::numeric, 1) AS avg_lectura,
                   ROUND(AVG(f.prom_matematica)::numeric, 1) AS avg_matematica,
                   ROUND(MIN(f.prom_lectura)::numeric, 1) AS min_lectura,
                   ROUND(MAX(f.prom_lectura)::numeric, 1) AS max_lectura,
                   ROUND(MIN(f.prom_matematica)::numeric, 1) AS min_matematica,
                   ROUND(MAX(f.prom_matematica)::numeric, 1) AS max_matematica
            FROM analytics.fact_simce f
            JOIN matricula_2025_rbd m ON f.rbd = m.rbd
            WHERE m.nombre_slep IN (SELECT unnest(string_to_array(%s, ',')))
            GROUP BY f.anio, f.nivel ORDER BY f.anio DESC, f.nivel
        """, (','.join(_get_names(slep_id)),))

        # By establishment (latest year per level)
        detalle = query_all("""
            SELECT f.rbd, f.nom_rbd, f.anio, f.nivel, f.estado_resultado,
                   f.prom_lectura, f.prom_matematica
            FROM analytics.fact_simce f
            JOIN matricula_2025_rbd m ON f.rbd = m.rbd
            WHERE m.nombre_slep IN (SELECT unnest(string_to_array(%s, ',')))
              AND f.anio = (SELECT MAX(anio) FROM analytics.fact_simce)
            ORDER BY f.nivel, f.prom_lectura DESC NULLS LAST
        """, (','.join(_get_names(slep_id)),))

        return {
            "slep_id": slep_id,
            "resumen": [dict(r) for r in resumen],
            "detalle": [dict(r) for r in detalle],
            "source": "simce_real",
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


def _get_names(slep_id):
    from api.routers.dashboard import SLEP_NAME_MAP
    return SLEP_NAME_MAP.get(slep_id, [slep_id.upper().replace("_", " ")])
