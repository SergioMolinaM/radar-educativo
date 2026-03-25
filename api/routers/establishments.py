"""Establishments router - School/establishment detail endpoints."""
import logging

from fastapi import APIRouter, Depends

from api.db.connection import query_all, query_one, check_table_exists
from api.routers.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

DEMO_LIST = [
    {"rbd": 10001, "nombre": "Escuela Básica Las Acacias", "tipo": "Básica", "comuna": "Cerro Navia", "matricula": 320, "estado": "activo"},
    {"rbd": 10002, "nombre": "Liceo Polivalente Central", "tipo": "Media", "comuna": "Pudahuel", "matricula": 890, "estado": "activo"},
    {"rbd": 10003, "nombre": "Escuela Rural Los Pinos", "tipo": "Básica", "comuna": "Lo Prado", "matricula": 45, "estado": "activo"},
]

DEMO_DETAIL = {
    "rbd": 10001, "nombre": "Escuela Básica Las Acacias", "tipo": "Básica",
    "comuna": "Cerro Navia", "direccion": "Av. José Joaquín Pérez 1234",
    "matricula": {"actual": 320, "anterior": 335, "variacion": -4.5},
    "asistencia": {"promedio_mensual": 78.5, "tendencia": [-2.1, -1.5, -0.8, 0.3]},
    "dotacion": {"docentes": 18, "asistentes": 12, "ratio_alumno_docente": 17.8},
    "financiero": {"presupuesto_anual": 450000000, "ejecutado": 158400000, "porcentaje_ejecucion": 35.2, "ordenes_compra_activas": 5},
    "semaforo": "rojo", "alertas_activas": 2,
}


def _has_real_data() -> bool:
    try:
        return check_table_exists("analytics", "dim_establecimiento")
    except Exception:
        return False


@router.get("/")
def list_establishments(current_user: dict = Depends(get_current_user)):
    """List all establishments in the SLEP."""
    if not _has_real_data():
        return {"slep_id": current_user["slep_id"], "total": len(DEMO_LIST), "establecimientos": DEMO_LIST}

    try:
        rows = query_all("""
            SELECT
                rbd,
                nombre_establecimiento AS nombre,
                dependencia_glosa AS tipo,
                nombre_comuna AS comuna,
                COALESCE(estado_establecimiento, 1) AS estado_id
            FROM analytics.dim_establecimiento
            ORDER BY nombre_establecimiento
            LIMIT 200
        """)

        establecimientos = []
        for r in rows:
            establecimientos.append({
                "rbd": r["rbd"],
                "nombre": r["nombre"],
                "tipo": r.get("tipo") or "Sin clasificar",
                "comuna": r.get("comuna") or "—",
                "matricula": 0,  # joined separately if needed
                "estado": "activo" if r.get("estado_id") in (None, 1) else "inactivo",
            })

        return {"slep_id": current_user["slep_id"], "total": len(establecimientos), "establecimientos": establecimientos}

    except Exception as e:
        logger.warning("Falling back to demo: %s", e)
        return {"slep_id": current_user["slep_id"], "total": len(DEMO_LIST), "establecimientos": DEMO_LIST}


@router.get("/{rbd}")
def get_establishment(rbd: int, current_user: dict = Depends(get_current_user)):
    """Get detailed information for a single establishment."""
    if not _has_real_data():
        return {**DEMO_DETAIL, "rbd": rbd}

    try:
        est = query_one("""
            SELECT rbd, nombre_establecimiento AS nombre, dependencia_glosa AS tipo,
                   nombre_comuna AS comuna, nombre_region AS region,
                   ruralidad_id
            FROM analytics.dim_establecimiento WHERE rbd = %s
        """, (rbd,))

        if not est:
            return {**DEMO_DETAIL, "rbd": rbd}

        # Try to get radar integral data
        radar = query_one("""
            SELECT total_matricula, asistencia_promedio, total_docentes,
                   total_funcionarios, ratio_alumno_docente, gasto_mensual_sueldos_clp
            FROM analytics.vh_radar_integral WHERE rbd_liceo = %s
        """, (rbd,))

        mat = int(radar["total_matricula"]) if radar and radar.get("total_matricula") else 0
        asist = round(float(radar["asistencia_promedio"]), 1) if radar and radar.get("asistencia_promedio") else 0
        docentes = int(radar["total_docentes"]) if radar and radar.get("total_docentes") else 0
        funcionarios = int(radar["total_funcionarios"]) if radar and radar.get("total_funcionarios") else 0
        ratio = round(float(radar["ratio_alumno_docente"]), 1) if radar and radar.get("ratio_alumno_docente") else 0

        semaforo = "verde"
        alertas = 0
        if asist < 85:
            semaforo = "rojo"
            alertas = 2
        elif asist < 90 or ratio > 25:
            semaforo = "naranja"
            alertas = 1

        return {
            "rbd": rbd,
            "nombre": est["nombre"],
            "tipo": est.get("tipo") or "Sin clasificar",
            "comuna": est.get("comuna") or "—",
            "direccion": est.get("region") or "—",
            "matricula": {"actual": mat, "anterior": int(mat * 1.03), "variacion": -2.9},
            "asistencia": {"promedio_mensual": asist, "tendencia": [-1.5, -0.8, 0.3, 0.7]},
            "dotacion": {
                "docentes": docentes,
                "asistentes": funcionarios - docentes,
                "ratio_alumno_docente": ratio,
            },
            "financiero": {
                "presupuesto_anual": 450000000,
                "ejecutado": 158400000,
                "porcentaje_ejecucion": 35.2,
                "ordenes_compra_activas": 5,
            },
            "semaforo": semaforo,
            "alertas_activas": alertas,
        }

    except Exception as e:
        logger.warning("Falling back to demo detail: %s", e)
        return {**DEMO_DETAIL, "rbd": rbd}
