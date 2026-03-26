"""Establishments router - School/establishment detail endpoints.
Uses 2025 real data: directorio_2025, matricula_2025_rbd, rendimiento_2025_detalle,
asistencia_2025_rbd, asistencia_anual_2025, sep_2025_rbd.
"""
import logging

from fastapi import APIRouter, Depends, Query

from api.db.connection import query_all, query_one, check_table_exists
from api.routers.auth import get_current_user
from api.routers.dashboard import _slep_filter

logger = logging.getLogger(__name__)
router = APIRouter()


def _has_2025():
    try:
        return check_table_exists("public", "directorio_2025")
    except Exception:
        return False


@router.get("/")
def list_establishments(
    current_user: dict = Depends(get_current_user),
    slep_id: str = Query(None),
):
    """List all establishments in the SLEP with real 2025 data."""
    sid = slep_id or current_user["slep_id"]
    sf = _slep_filter(sid)

    if not _has_2025():
        return {"slep_id": sid, "total": 0, "establecimientos": [], "source": "no_data"}

    try:
        rows = query_all(f"""
            SELECT
                d.rbd, d.nom_rbd AS nombre, d.nom_com_rbd AS comuna,
                d.cod_depe2, d.rural_rbd,
                COALESCE(m.matricula_total, 0) AS matricula,
                r.tasa_aprobacion, r.tasa_retiro, r.prom_general, r.prom_asistencia,
                r.total_alumnos AS alumnos_rendimiento,
                s.total_sep, s.prioritarios, s.preferentes
            FROM directorio_2025 d
            LEFT JOIN matricula_2025_rbd m ON d.rbd = m.rbd
            LEFT JOIN rendimiento_2025_detalle r ON d.rbd = r.rbd
            LEFT JOIN sep_2025_rbd s ON d.rbd = s.rbd
            WHERE d.nombre_slep IN ({_slep_in_values(sid)})
              AND d.estado_estab = 1
            ORDER BY d.nom_rbd
        """)

        asist_map = {}
        try:
            asist_rows = query_all(f"""
                SELECT rbd, pct_asistencia, mes
                FROM asistencia_2025_rbd
                WHERE {sf} AND mes = (SELECT MAX(mes) FROM asistencia_2025_rbd WHERE {sf})
            """)
            asist_map = {int(r["rbd"]): float(r["pct_asistencia"] or 0) for r in asist_rows}
        except Exception:
            pass

        establecimientos = []
        for r in rows:
            rbd = int(r["rbd"])
            asist = asist_map.get(rbd, float(r.get("prom_asistencia") or 0))
            mat = int(r.get("matricula") or 0)

            if asist < 80:
                semaforo = "rojo"
            elif asist < 88:
                semaforo = "naranja"
            else:
                semaforo = "verde"

            establecimientos.append({
                "rbd": rbd,
                "nombre": r["nombre"],
                "comuna": r.get("comuna") or "-",
                "tipo": "Rural" if r.get("rural_rbd") == 1 else "Urbano",
                "dependencia": int(r.get("cod_depe2") or 0),
                "matricula": mat,
                "asistencia": round(asist, 1),
                "tasa_aprobacion": float(r.get("tasa_aprobacion") or 0),
                "tasa_retiro": float(r.get("tasa_retiro") or 0),
                "promedio_general": float(r.get("prom_general") or 0),
                "alumnos_sep": int(r.get("total_sep") or 0),
                "prioritarios": int(r.get("prioritarios") or 0),
                "semaforo": semaforo,
            })

        return {"slep_id": sid, "total": len(establecimientos), "establecimientos": establecimientos, "source": "2025_real"}

    except Exception as e:
        logger.warning("List establishments error: %s", e)
        return {"slep_id": sid, "total": 0, "establecimientos": [], "error": str(e)}


@router.get("/{rbd}")
def get_establishment(rbd: int, current_user: dict = Depends(get_current_user)):
    """Get detailed info for a single establishment with all 2025 data."""
    if not _has_2025():
        return {"rbd": rbd, "error": "no_data"}

    try:
        est = query_one("SELECT * FROM directorio_2025 WHERE rbd = %s", (rbd,))
        if not est:
            return {"rbd": rbd, "error": "not_found"}

        mat = query_one("SELECT * FROM matricula_2025_rbd WHERE rbd = %s", (rbd,))
        rend = query_one("SELECT * FROM rendimiento_2025_detalle WHERE rbd = %s", (rbd,))
        sep = query_one("SELECT * FROM sep_2025_rbd WHERE rbd = %s", (rbd,))
        asist_meses = query_all(
            "SELECT mes, pct_asistencia, total_alumnos FROM asistencia_2025_rbd WHERE rbd = %s ORDER BY mes",
            (rbd,),
        )
        asist_anual = query_one("SELECT * FROM asistencia_anual_2025 WHERE rbd = %s", (rbd,))

        mes_nombres = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

        matricula_total = int(mat["matricula_total"]) if mat and mat.get("matricula_total") else 0
        asist_prom = float(asist_anual["tasa_asistencia_promedio"]) if asist_anual and asist_anual.get("tasa_asistencia_promedio") else 0

        semaforo = "verde"
        if asist_prom < 80:
            semaforo = "rojo"
        elif asist_prom < 88:
            semaforo = "naranja"

        return {
            "rbd": rbd,
            "nombre": est.get("nom_rbd"),
            "comuna": est.get("nom_com_rbd"),
            "region": est.get("nom_reg_rbd_a"),
            "direccion": est.get("dir_rbd"),
            "telefono": est.get("telefono_rbd"),
            "email": est.get("email_rbd"),
            "rural": est.get("rural_rbd") == 1,
            "slep": est.get("nombre_slep"),
            "semaforo": semaforo,
            "source": "2025_real",
            "matricula": {
                "total": matricula_total,
                "hombres": int(mat.get("hombres_total", 0)) if mat else 0,
                "mujeres": int(mat.get("mujeres_total", 0)) if mat else 0,
            },
            "rendimiento": {
                "total_alumnos": int(rend["total_alumnos"]),
                "aprobados": int(rend["aprobados"]),
                "reprobados": int(rend["reprobados"]),
                "retirados": int(rend["retirados"]),
                "trasladados": int(rend.get("trasladados") or 0),
                "tasa_aprobacion": float(rend["tasa_aprobacion"]),
                "tasa_retiro": float(rend["tasa_retiro"]),
                "promedio_general": float(rend["prom_general"]),
                "promedio_asistencia": float(rend["prom_asistencia"]),
            } if rend else None,
            "sep": {
                "total": int(sep["total_sep"]),
                "prioritarios": int(sep["prioritarios"]),
                "preferentes": int(sep["preferentes"]),
                "pct_sep": round(int(sep["total_sep"]) / max(matricula_total, 1) * 100, 1),
            } if sep else None,
            "asistencia_mensual": [
                {
                    "mes": int(a["mes"]),
                    "mes_nombre": mes_nombres[int(a["mes"])],
                    "asistencia": float(a["pct_asistencia"]),
                    "alumnos": int(a["total_alumnos"]),
                }
                for a in asist_meses
            ],
            "asistencia_anual": {
                "promedio": asist_prom,
                "total_alumnos": int(asist_anual["total_alumnos"]),
                "cronica_grave": int(asist_anual.get("cat_1") or 0),
                "cronica": int(asist_anual.get("cat_2") or 0),
                "en_riesgo": int(asist_anual.get("cat_3") or 0),
                "normal": int(asist_anual.get("cat_4") or 0),
            } if asist_anual else None,
        }

    except Exception as e:
        logger.warning("Establishment detail error: %s", e)
        return {"rbd": rbd, "error": str(e)}


def _slep_in_values(slep_id: str) -> str:
    """Return comma-separated quoted SLEP names for SQL IN clause."""
    from api.routers.dashboard import SLEP_NAME_MAP
    names = SLEP_NAME_MAP.get(slep_id, [slep_id.upper().replace("_", " ")])
    return ", ".join([f"'{n}'" for n in names])
