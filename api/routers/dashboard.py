"""Dashboard router - Main overview endpoints for SLEP dashboards.
Uses 2025 real data (asistencia_2025_rbd, matricula_2025_rbd, directorio_2025)
with fallback to analytics schema (2024) and then demo data.
"""
import logging

from fastapi import APIRouter, Depends

from api.db.connection import query_all, query_one, check_table_exists
from api.routers.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

# Mapping de slep_id → nombre_slep en datos MINEDUC (mayúsculas, con/sin tilde)
SLEP_NAME_MAP = {
    "barrancas": ["BARRANCAS"],
    "chinchorro": ["CHINCHORRO"],
    "gabriela_mistral": ["GABRIELA MISTRAL"],
    "andalien_sur": ["ANDALIEN SUR", "ANDALIÉN SUR"],
    "costa_araucania": ["COSTA ARAUCANIA", "COSTA ARAUCANÍA"],
    "huasco": ["HUASCO"],
    "puerto_cordillera": ["PUERTO CORDILLERA"],
    "costa_central": ["COSTA CENTRAL"],
    "atacama": ["ATACAMA"],
    "colchagua": ["COLCHAGUA"],
    "llanquihue": ["LLANQUIHUE"],
    "valparaiso": ["VALPARAISO", "VALPARAÍSO"],
    "punilla_cordillera": ["PUNILLA CORDILLERA"],
    "los_libertadores": ["LOS LIBERTADORES"],
    "santa_rosa": ["SANTA ROSA"],
    "del_pino": ["DEL PINO"],
    "iquique": ["IQUIQUE"],
    "licancabur": ["LICANCABUR", "LICANBUR"],
    "elqui": ["ELQUI"],
    "magallanes": ["MAGALLANES"],
    "maule_costa": ["MAULE COSTA"],
    "chiloe": ["CHILOÉ", "CHILOE"],
    "aysen": ["AYSÉN", "AYSEN"],
    "valdivia": ["VALDIVIA"],
    "santa_corina": ["SANTA CORINA"],
    "andalien_costa": ["ANDALIÉN COSTA", "ANDALIEN COSTA"],
}


def _slep_filter(slep_id: str) -> str:
    """Build SQL IN clause for SLEP name variants."""
    names = SLEP_NAME_MAP.get(slep_id, [slep_id.upper().replace("_", " ")])
    placeholders = ", ".join([f"'{n}'" for n in names])
    return f"nombre_slep IN ({placeholders})"

def _has_2025_data() -> bool:
    try:
        return check_table_exists("public", "asistencia_2025_rbd")
    except Exception:
        return False


@router.get("/summary")
def get_dashboard_summary(current_user: dict = Depends(get_current_user)):
    """KPIs del SLEP con datos 2025 reales."""
    slep_id = current_user["slep_id"]
    sf = _slep_filter(slep_id)

    if not _has_2025_data():
        return {"slep_id": slep_id, "kpis": {}, "tendencias": {}, "source": "no_data"}

    try:
        # Matrícula 2025
        mat = query_one(f"""
            SELECT COUNT(DISTINCT rbd) AS total_ee,
                   SUM(matricula_total) AS mat_total
            FROM matricula_2025_rbd WHERE {sf}
        """)
        # Asistencia último mes disponible
        last_month = query_one(f"""
            SELECT mes, ROUND(AVG(pct_asistencia)::numeric, 1) AS asist_avg,
                   COUNT(DISTINCT rbd) AS ee_count
            FROM asistencia_2025_rbd WHERE {sf}
            GROUP BY mes ORDER BY mes DESC LIMIT 1
        """)
        # Asistencia mes anterior (para variación)
        prev_month = None
        if last_month:
            prev_month = query_one(f"""
                SELECT ROUND(AVG(pct_asistencia)::numeric, 1) AS asist_avg
                FROM asistencia_2025_rbd WHERE {sf} AND mes = {int(last_month['mes']) - 1}
            """)

        # Semáforos basados en asistencia último mes
        alertas = query_all(f"""
            SELECT rbd, pct_asistencia FROM asistencia_2025_rbd
            WHERE {sf} AND mes = {int(last_month['mes']) if last_month else 12}
        """)

        rojas = sum(1 for a in alertas if float(a['pct_asistencia'] or 0) < 80)
        naranjas = sum(1 for a in alertas if 80 <= float(a['pct_asistencia'] or 0) < 88)
        verdes = sum(1 for a in alertas if float(a['pct_asistencia'] or 0) >= 88)

        total_ee = int(mat['total_ee']) if mat and mat['total_ee'] else 0
        mat_total = int(mat['mat_total']) if mat and mat['mat_total'] else 0
        asist_avg = float(last_month['asist_avg']) if last_month else 0
        prev_avg = float(prev_month['asist_avg']) if prev_month and prev_month['asist_avg'] else None
        mes_nombre = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

        return {
            "slep_id": slep_id,
            "source": "2025_real",
            "ultimo_mes": mes_nombre[int(last_month['mes'])] if last_month else "?",
            "kpis": {
                "total_establecimientos": total_ee,
                "matricula_total": mat_total,
                "asistencia_promedio": asist_avg,
                "ejecucion_presupuestaria": 62.5,  # TODO: Mercado Público real
                "alertas_rojas": rojas,
                "alertas_naranjas": naranjas,
                "alertas_verdes": verdes,
            },
            "tendencias": {
                "asistencia_variacion_mensual": round(asist_avg - prev_avg, 1) if prev_avg else None,
            },
        }
    except Exception as e:
        logger.warning("Dashboard summary error: %s", e)
        return {"slep_id": slep_id, "kpis": {}, "error": str(e)}


@router.get("/semaforos")
def get_semaforos(current_user: dict = Depends(get_current_user)):
    """Semáforos por establecimiento con datos 2025."""
    slep_id = current_user["slep_id"]
    sf = _slep_filter(slep_id)

    if not _has_2025_data():
        return {"slep_id": slep_id, "establecimientos": []}

    try:
        # Último mes con datos + matrícula
        rows = query_all(f"""
            SELECT a.rbd, a.nom_rbd, a.nom_com_rbd, a.pct_asistencia,
                   a.total_alumnos, m.matricula_total
            FROM asistencia_2025_rbd a
            LEFT JOIN matricula_2025_rbd m ON a.rbd = m.rbd
            WHERE a.{sf}
              AND a.mes = (SELECT MAX(mes) FROM asistencia_2025_rbd WHERE {sf})
            ORDER BY a.pct_asistencia ASC
        """)

        establecimientos = []
        for r in rows:
            asist = float(r.get("pct_asistencia") or 0)
            alertas = []
            if asist < 80:
                alertas.append(f"Asistencia crítica ({asist}%)")
                semaforo = "rojo"
            elif asist < 88:
                alertas.append(f"Asistencia bajo meta ({asist}%)")
                semaforo = "naranja"
            else:
                semaforo = "verde"

            establecimientos.append({
                "rbd": r["rbd"],
                "nombre": r["nom_rbd"],
                "comuna": r.get("nom_com_rbd"),
                "semaforo": semaforo,
                "alertas": alertas,
                "matricula": int(r.get("matricula_total") or r.get("total_alumnos") or 0),
                "asistencia": asist,
                "ejecucion": 0,
            })

        return {"slep_id": slep_id, "establecimientos": establecimientos, "source": "2025_real"}

    except Exception as e:
        logger.warning("Semaforos error: %s", e)
        return {"slep_id": slep_id, "establecimientos": [], "error": str(e)}


@router.get("/tendencia-asistencia")
def get_tendencia_asistencia(current_user: dict = Depends(get_current_user)):
    """Evolución mensual de asistencia 2025 para el SLEP."""
    slep_id = current_user["slep_id"]
    sf = _slep_filter(slep_id)

    try:
        rows = query_all(f"""
            SELECT mes, ROUND(AVG(pct_asistencia)::numeric, 1) AS asistencia_avg,
                   COUNT(DISTINCT rbd) AS ee_count,
                   SUM(total_alumnos) AS total_alumnos
            FROM asistencia_2025_rbd WHERE {sf}
            GROUP BY mes ORDER BY mes
        """)
        mes_nombres = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
        return {
            "slep_id": slep_id,
            "meses": [
                {
                    "mes": int(r["mes"]),
                    "mes_nombre": mes_nombres[int(r["mes"])],
                    "asistencia": float(r["asistencia_avg"]),
                    "establecimientos": int(r["ee_count"]),
                    "alumnos": int(r["total_alumnos"]),
                }
                for r in rows
            ],
        }
    except Exception as e:
        return {"slep_id": slep_id, "meses": [], "error": str(e)}
