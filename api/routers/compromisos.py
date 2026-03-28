"""Compromisos de gestión router - Tracking de hitos CGE/PAL/PMG/CDC/ADP."""
import logging
from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query

from api.db.connection import query_all, check_table_exists
from api.routers.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


def _ensure_table():
    """Create compromisos table if it doesn't exist."""
    if not check_table_exists("public", "compromisos_gestion"):
        from api.db.connection import get_cursor
        with get_cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS public.compromisos_gestion (
                    id SERIAL PRIMARY KEY,
                    slep_id VARCHAR(50) NOT NULL,
                    hito VARCHAR(300) NOT NULL,
                    instrumento VARCHAR(10) NOT NULL,
                    responsable VARCHAR(100),
                    fecha_vencimiento DATE NOT NULL,
                    estado VARCHAR(20) DEFAULT 'pendiente',
                    prioridad VARCHAR(10) DEFAULT 'media',
                    notas TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            _seed_data(cur)


def _seed_data(cur):
    """Insert realistic seed data for demo SLEPs."""
    today = date.today()
    compromisos = [
        # Barrancas - Atrasados
        ("barrancas", "Reunión mensual subdirectores territoriales", "CDC", "Jorge Valdes", today - timedelta(days=22), "pendiente", "alta"),
        ("barrancas", "Levantamiento diagnóstico territorial 2025", "PAL", "Maria Silva", today - timedelta(days=19), "pendiente", "alta"),
        ("barrancas", "Medidas equidad de género implementadas", "PMG", "Daniela Perez", today - timedelta(days=17), "pendiente", "media"),
        ("barrancas", "Informe ejecución presupuestaria Q1", "ADP", "Carolina Muñoz", today - timedelta(days=5), "pendiente", "alta"),
        # Barrancas - Próximos a vencer
        ("barrancas", "Cumplimiento plan capacidades personal SLEP", "CGE", "Ana González", today + timedelta(days=3), "pendiente", "alta"),
        ("barrancas", "Seguimiento compromisos directores sector norte", "CDC", "Jorge Valdes", today + timedelta(days=5), "pendiente", "media"),
        ("barrancas", "Seguimiento compromisos directores sector sur", "CDC", "Claudia Vera", today + timedelta(days=5), "pendiente", "media"),
        ("barrancas", "Cierre presupuestario mensual SIGFE", "ADP", "Daniela Perez", today + timedelta(days=6), "pendiente", "alta"),
        ("barrancas", "Taller directivos análisis SIMCE 2024", "PAL", "Maria Silva", today + timedelta(days=8), "pendiente", "media"),
        ("barrancas", "Actualización registro ATE aprobados", "CGE", "Ana González", today + timedelta(days=10), "pendiente", "baja"),
        ("barrancas", "Mesa técnica convivencia escolar", "PMG", "Roberto Soto", today + timedelta(days=12), "pendiente", "media"),
        ("barrancas", "Informe asistencia crónica abril", "PAL", "Maria Silva", today + timedelta(days=14), "pendiente", "alta"),
        ("barrancas", "Revisión contratos dotación docente", "ADP", "Carolina Muñoz", today + timedelta(days=18), "pendiente", "media"),
        # Barrancas - Completados
        ("barrancas", "Entrega cuenta pública 2025", "CGE", "Director Ejecutivo", today - timedelta(days=30), "completado", "alta"),
        ("barrancas", "Informe matrícula inicial 2026", "PAL", "Maria Silva", today - timedelta(days=25), "completado", "alta"),
        ("barrancas", "Capacitación SIGFE equipo financiero", "ADP", "Carolina Muñoz", today - timedelta(days=20), "completado", "media"),
        # Puerto Cordillera
        ("puerto_cordillera", "Diagnóstico PIE comunal", "PAL", "Luis Torres", today - timedelta(days=10), "pendiente", "alta"),
        ("puerto_cordillera", "Convenio de desempeño directores", "CDC", "Paula Reyes", today + timedelta(days=4), "pendiente", "alta"),
        ("puerto_cordillera", "Informe ejecución SEP trimestral", "CGE", "Marco Díaz", today + timedelta(days=7), "pendiente", "media"),
        ("puerto_cordillera", "Plan mantención infraestructura", "PMG", "Andrea Lagos", today + timedelta(days=15), "pendiente", "media"),
        # Gabriela Mistral
        ("gabriela_mistral", "Reunión mensual subdirectores territoriales", "CDC", "Jorge Valdes", today - timedelta(days=22), "pendiente", "alta"),
        ("gabriela_mistral", "Levantamiento diagnóstico territorial 2025", "PAL", "Maria Silva", today - timedelta(days=19), "pendiente", "alta"),
        ("gabriela_mistral", "Medidas equidad de género implementadas", "PMG", "Daniela Perez", today - timedelta(days=17), "pendiente", "media"),
        ("gabriela_mistral", "Cumplimiento plan capacidades personal SLEP", "CGE", "Ana González", today + timedelta(days=3), "pendiente", "alta"),
        ("gabriela_mistral", "Seguimiento compromisos directores La Granja", "CDC", "Jorge Valdes", today + timedelta(days=5), "pendiente", "media"),
        ("gabriela_mistral", "Seguimiento compromisos directores Macul", "CDC", "Claudia Vera", today + timedelta(days=5), "pendiente", "media"),
        ("gabriela_mistral", "Cierre presupuestario mensual SIGFE", "ADP", "Daniela Perez", today + timedelta(days=6), "pendiente", "alta"),
        ("gabriela_mistral", "Taller directivos análisis SIMCE 2024", "PAL", "Maria Silva", today + timedelta(days=8), "pendiente", "media"),
    ]

    for c in compromisos:
        cur.execute(
            """INSERT INTO public.compromisos_gestion
               (slep_id, hito, instrumento, responsable, fecha_vencimiento, estado, prioridad)
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            c,
        )


@router.get("/")
def get_compromisos(
    estado: str = Query(None, description="Filter: pendiente, completado, todos"),
    current_user: dict = Depends(get_current_user),
):
    """Return compromisos for the current SLEP, categorized by urgency."""
    slep_id = current_user["slep_id"]
    _ensure_table()
    today = date.today().isoformat()

    # Atrasados: pendientes con fecha pasada
    atrasados = query_all(
        """SELECT id, hito, instrumento, responsable, fecha_vencimiento, prioridad,
                  CURRENT_DATE - fecha_vencimiento AS dias_atraso
           FROM public.compromisos_gestion
           WHERE slep_id = %s AND estado = 'pendiente' AND fecha_vencimiento < CURRENT_DATE
           ORDER BY fecha_vencimiento ASC""",
        (slep_id,),
    )

    # Próximos: pendientes dentro de 14 días
    proximos = query_all(
        """SELECT id, hito, instrumento, responsable, fecha_vencimiento, prioridad,
                  fecha_vencimiento - CURRENT_DATE AS dias_restantes
           FROM public.compromisos_gestion
           WHERE slep_id = %s AND estado = 'pendiente'
             AND fecha_vencimiento >= CURRENT_DATE
             AND fecha_vencimiento <= CURRENT_DATE + INTERVAL '14 days'
           ORDER BY fecha_vencimiento ASC""",
        (slep_id,),
    )

    # Futuros: pendientes más allá de 14 días
    futuros = query_all(
        """SELECT id, hito, instrumento, responsable, fecha_vencimiento, prioridad,
                  fecha_vencimiento - CURRENT_DATE AS dias_restantes
           FROM public.compromisos_gestion
           WHERE slep_id = %s AND estado = 'pendiente'
             AND fecha_vencimiento > CURRENT_DATE + INTERVAL '14 days'
           ORDER BY fecha_vencimiento ASC""",
        (slep_id,),
    )

    # Completados recientes (últimos 30 días)
    completados = query_all(
        """SELECT id, hito, instrumento, responsable, fecha_vencimiento, prioridad
           FROM public.compromisos_gestion
           WHERE slep_id = %s AND estado = 'completado'
             AND updated_at >= CURRENT_DATE - INTERVAL '30 days'
           ORDER BY updated_at DESC
           LIMIT 5""",
        (slep_id,),
    )

    # Serialize dates
    for lst in [atrasados, proximos, futuros, completados]:
        for item in lst:
            if "fecha_vencimiento" in item:
                item["fecha_vencimiento"] = str(item["fecha_vencimiento"])

    return {
        "atrasados": atrasados,
        "proximos": proximos,
        "futuros": futuros,
        "completados": completados,
        "resumen": {
            "total_atrasados": len(atrasados),
            "total_proximos": len(proximos),
            "total_futuros": len(futuros),
            "total_completados": len(completados),
            "total_activos": len(atrasados) + len(proximos) + len(futuros),
        },
    }


@router.patch("/{compromiso_id}")
def update_compromiso(
    compromiso_id: int,
    estado: str = Query(..., description="nuevo estado: pendiente, completado"),
    current_user: dict = Depends(get_current_user),
):
    """Mark a compromiso as completed or reopen it."""
    from api.db.connection import get_cursor
    with get_cursor() as cur:
        cur.execute(
            """UPDATE public.compromisos_gestion
               SET estado = %s, updated_at = CURRENT_TIMESTAMP
               WHERE id = %s AND slep_id = %s""",
            (estado, compromiso_id, current_user["slep_id"]),
        )
    return {"ok": True, "id": compromiso_id, "estado": estado}
