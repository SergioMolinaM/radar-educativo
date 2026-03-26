"""Dashboard router - Main overview endpoints for SLEP dashboards.
Uses 2025 real data with adult education filter.
"""
import logging

from fastapi import APIRouter, Depends, Query

from api.db.connection import query_all, query_one, check_table_exists
from api.routers.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

# Mapping de slep_id → nombre_slep en datos MINEDUC
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

MES_NOMBRES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
               'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

ADULTOS_FILTER = "AND nom_rbd NOT ILIKE '%CEIA%' AND nom_rbd NOT ILIKE '%ADULTO%' AND nom_rbd NOT ILIKE '%NOCTURNO%'"


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
def get_dashboard_summary(
    mes: int = None,
    excluir_adultos: bool = True,
    current_user: dict = Depends(get_current_user),
):
    """KPIs del SLEP con datos 2025 reales."""
    slep_id = current_user["slep_id"]
    sf = _slep_filter(slep_id)
    af = ADULTOS_FILTER if excluir_adultos else ""

    if not _has_2025_data():
        return {"slep_id": slep_id, "kpis": {}, "source": "no_data"}

    try:
        # Determine month
        if not mes:
            m = query_one(f"SELECT MAX(mes) AS m FROM asistencia_2025_rbd WHERE {sf}")
            mes = int(m["m"]) if m and m["m"] else 10

        # Matrícula 2025
        mat = query_one(f"""
            SELECT COUNT(DISTINCT rbd) AS total_ee, SUM(matricula_total) AS mat_total
            FROM matricula_2025_rbd WHERE {sf}
        """)

        # Asistencia mes seleccionado (sin adultos)
        asist = query_one(f"""
            SELECT ROUND(AVG(CASE WHEN pct_asistencia > 0 THEN pct_asistencia END)::numeric, 1) AS asist_avg
            FROM asistencia_2025_rbd WHERE {sf} AND mes = {mes} {af}
        """)

        # Mes anterior para variación
        prev = query_one(f"""
            SELECT ROUND(AVG(CASE WHEN pct_asistencia > 0 THEN pct_asistencia END)::numeric, 1) AS asist_avg
            FROM asistencia_2025_rbd WHERE {sf} AND mes = {mes - 1} {af}
        """) if mes > 3 else None

        # Semáforos (sin adultos)
        alertas = query_all(f"""
            SELECT rbd, pct_asistencia FROM asistencia_2025_rbd
            WHERE {sf} AND mes = {mes} {af} AND pct_asistencia > 0
        """)

        total_ee = int(mat['total_ee']) if mat and mat['total_ee'] else 0
        mat_total = int(mat['mat_total']) if mat and mat['mat_total'] else 0
        asist_avg = float(asist['asist_avg']) if asist and asist['asist_avg'] else 0
        prev_avg = float(prev['asist_avg']) if prev and prev.get('asist_avg') else None

        rojas = sum(1 for a in alertas if float(a['pct_asistencia'] or 0) < 80)
        naranjas = sum(1 for a in alertas if 80 <= float(a['pct_asistencia'] or 0) < 88)
        verdes = sum(1 for a in alertas if float(a['pct_asistencia'] or 0) >= 88)

        return {
            "slep_id": slep_id,
            "source": "2025_real",
            "mes": mes,
            "mes_nombre": MES_NOMBRES[mes] if mes < len(MES_NOMBRES) else str(mes),
            "kpis": {
                "total_establecimientos": total_ee,
                "matricula_total": mat_total,
                "asistencia_promedio": asist_avg,
                "ejecucion_presupuestaria": 62.5,  # TODO: Mercado Público API
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
def get_semaforos(
    mes: int = None,
    excluir_adultos: bool = True,
    current_user: dict = Depends(get_current_user),
):
    """Semáforos por establecimiento con datos 2025."""
    slep_id = current_user["slep_id"]
    sf = _slep_filter(slep_id)
    af = ADULTOS_FILTER if excluir_adultos else ""

    if not _has_2025_data():
        return {"slep_id": slep_id, "establecimientos": []}

    try:
        if not mes:
            m = query_one(f"SELECT MAX(mes) AS m FROM asistencia_2025_rbd WHERE {sf}")
            mes = int(m["m"]) if m and m["m"] else 10

        rows = query_all(f"""
            SELECT a.rbd, a.nom_rbd, a.nom_com_rbd, a.pct_asistencia,
                   a.total_alumnos, m.matricula_total
            FROM asistencia_2025_rbd a
            LEFT JOIN matricula_2025_rbd m ON a.rbd = m.rbd
            WHERE a.{sf} AND a.mes = {mes} {af.replace('nom_rbd', 'a.nom_rbd')}
              AND a.pct_asistencia > 0
            ORDER BY a.pct_asistencia ASC
        """)

        establecimientos = []
        for r in rows:
            asist = float(r.get("pct_asistencia") or 0)
            alertas_list = []
            if asist < 80:
                alertas_list.append(f"Asistencia crítica ({asist}%)")
                semaforo = "rojo"
            elif asist < 88:
                alertas_list.append(f"Asistencia bajo meta ({asist}%)")
                semaforo = "naranja"
            else:
                semaforo = "verde"

            establecimientos.append({
                "rbd": r["rbd"],
                "nombre": r["nom_rbd"],
                "comuna": r.get("nom_com_rbd"),
                "semaforo": semaforo,
                "alertas": alertas_list,
                "matricula": int(r.get("matricula_total") or r.get("total_alumnos") or 0),
                "asistencia": asist,
            })

        return {"slep_id": slep_id, "mes": mes, "establecimientos": establecimientos, "source": "2025_real"}

    except Exception as e:
        logger.warning("Semaforos error: %s", e)
        return {"slep_id": slep_id, "establecimientos": [], "error": str(e)}


@router.get("/tendencia-asistencia")
def get_tendencia_asistencia(
    excluir_adultos: bool = True,
    current_user: dict = Depends(get_current_user),
):
    """Evolución mensual de asistencia 2025 para el SLEP."""
    slep_id = current_user["slep_id"]
    sf = _slep_filter(slep_id)
    af = ADULTOS_FILTER if excluir_adultos else ""

    try:
        rows = query_all(f"""
            SELECT mes,
                   ROUND(AVG(CASE WHEN pct_asistencia > 0 THEN pct_asistencia END)::numeric, 1) AS asistencia_avg,
                   COUNT(DISTINCT rbd) AS ee_count,
                   SUM(total_alumnos) AS total_alumnos
            FROM asistencia_2025_rbd WHERE {sf} {af}
            GROUP BY mes ORDER BY mes
        """)
        return {
            "slep_id": slep_id,
            "meses": [
                {
                    "mes": int(r["mes"]),
                    "mes_nombre": MES_NOMBRES[int(r["mes"])] if int(r["mes"]) < len(MES_NOMBRES) else str(r["mes"]),
                    "asistencia": float(r["asistencia_avg"] or 0),
                    "establecimientos": int(r["ee_count"]),
                    "alumnos": int(r["total_alumnos"] or 0),
                }
                for r in rows
            ],
        }
    except Exception as e:
        return {"slep_id": slep_id, "meses": [], "error": str(e)}
