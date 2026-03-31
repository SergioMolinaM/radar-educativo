"""Load PAL 2026 Los Parques into analytics tables.
Comunas: Quinta Normal, Renca. 52 EE (escuelas/liceos + jardines).
Matricula: 16.070 escuelas + 1.768 jardines = 17.838 total.
Director Ejecutivo: Ulises Jaque Carreno (nombrado 27/05/2024).
"""
import psycopg
from dotenv import load_dotenv
import os

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:Bremen#229@localhost:5432/radar_edu_dev")

def load():
    conn = psycopg.connect(DATABASE_URL, autocommit=True)
    cur = conn.cursor()

    cur.execute("SELECT COALESCE(MAX(id),0) FROM analytics.pal_document")
    max_doc = cur.fetchone()[0]
    cur.execute("SELECT COALESCE(MAX(id),0) FROM analytics.pal_linea")
    max_linea = cur.fetchone()[0]
    cur.execute("SELECT COALESCE(MAX(id),0) FROM analytics.pal_indicador")
    max_ind = cur.fetchone()[0]
    cur.execute("SELECT COALESCE(MAX(id),0) FROM analytics.pal_cge")
    max_cge = cur.fetchone()[0]

    doc_id = max_doc + 1

    # -- Document --
    cur.execute("""
        INSERT INTO analytics.pal_document (id, slep_nombre, anio, tipo_documento, acto_administrativo, fecha_aprobacion, estado_extraccion)
        VALUES (%s, %s, %s, %s, %s, %s, %s) ON CONFLICT DO NOTHING
    """, (doc_id, "Los Parques", 2026, "PAL", "Resolucion SLEP Los Parques", "2025-12-15", "completo"))

    # -- Lineas estrategicas (4 OE del PAL p.8) --
    lineas_data = [
        ("OE1: Mejorar aprendizaje integral", "Mejorar el aprendizaje integral del estudiantado mediante acompanamiento continuo, bienestar con enfoque de derechos y perspectiva de genero", 1),
        ("OE2: Liderazgo educativo", "Aumentar capacidades de liderazgo educativo de equipos directivos, docentes y asistentes mediante formacion continua", 2),
        ("OE3: Infraestructura y recursos", "Mejorar infraestructura, equipamiento y recursos educativos mediante Plan Integral de Inversion y Mantenimiento", 3),
        ("OE4: Sostenibilidad financiera", "Asegurar sostenibilidad del servicio educativo mediante gestion eficiente de recursos administrativos y tecnico-pedagogicos", 4),
    ]
    linea_ids = {}
    for i, (nombre, desc, orden) in enumerate(lineas_data):
        lid = max_linea + 1 + i
        linea_ids[orden] = lid
        cur.execute("INSERT INTO analytics.pal_linea (id, pal_id, nombre_linea, descripcion, orden) VALUES (%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING",
                    (lid, doc_id, nombre, desc, orden))

    # -- CGE (Convenio de Gestion Educacional - datos reales pp.9-12) --
    cge_data = [
        (1, "OBJ1: Plan Estrategico y Plan Anual", "1.1 Porcentaje cumplimiento metas anuales PA", "85%", "16.67%", "2 de 12 acciones al 100%, resto en ejecucion"),
        (2, "OBJ2: Gestion eficiente del servicio", "2.1 Indice gestion de recursos", "100%", "28.41%", "Plan Sostenibilidad 18.75%, ejecucion presupuestaria 38.07%"),
        (3, "OBJ2: Gestion eficiente", "2.1.2 Cumplimiento Plan Sostenibilidad Financiera", "100%", "18.75%", "3 de 16 acciones completadas"),
        (4, "OBJ2: Gestion eficiente", "2.1.3 Porcentaje ejecucion presupuestaria", "90%", "38.07%", "$616.665.678 ejecutados del presupuesto vigente al 31/jul"),
        (5, "OBJ3: Participacion y cultura mejora", "3.1 Indice participacion y articulacion local", "100%", "55.77%", "16 de 26 acciones ejecutadas, 3 de 6 convenios formalizados"),
    ]
    for i, (num, obj, ind, meta, avance, obs) in enumerate(cge_data):
        cur.execute("""
            INSERT INTO analytics.pal_cge (id, pal_id, objetivo, indicador_nombre, meta, resultado_obtenido, observacion)
            VALUES (%s,%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING
        """, (max_cge+1+i, doc_id, obj, ind, meta, avance, obs))

    # -- Indicadores (sintetizados del PAL) --
    indicadores_data = [
        (linea_ids[1], "Porcentaje cumplimiento metas anuales PA", "85%", "16.67%", "2 de 12 acciones al 100%"),
        (linea_ids[1], "Matricula total escuelas y liceos", "16.070", "16.070", "52 establecimientos"),
        (linea_ids[1], "Matricula jardines infantiles", "1.768", "1.768", "Jardines VTF"),
        (linea_ids[2], "Formacion continua equipos directivos", "100%", "En ejecucion", "Programa con enfoque de genero"),
        (linea_ids[3], "Plan Integral Inversion y Mantenimiento", "100%", "En ejecucion", "Basado en diagnostico participativo"),
        (linea_ids[4], "Indice gestion de recursos", "100%", "28.41%", "Sostenibilidad financiera + ejecucion presupuestaria"),
        (linea_ids[4], "Ejecucion presupuestaria", "90%", "38.07%", "$616M ejecutados al 31/jul"),
        (linea_ids[4], "Plan Sostenibilidad Financiera", "100%", "18.75%", "3 de 16 acciones completadas"),
        (linea_ids[4], "Convenios entidades publicas/privadas", "6", "3", "50% de convenios formalizados"),
    ]
    for i, (lid, nombre, meta, avance, obs) in enumerate(indicadores_data):
        cur.execute("""
            INSERT INTO analytics.pal_indicador (id, linea_id, nombre_indicador, meta, avance_actual, observacion)
            VALUES (%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING
        """, (max_ind+1+i, lid, nombre, meta, avance, obs))

    cur.close()
    conn.close()
    print(f"OK PAL Los Parques cargado: doc_id={doc_id}, {len(lineas_data)} lineas, {len(indicadores_data)} indicadores, {len(cge_data)} CGE")

if __name__ == "__main__":
    load()
