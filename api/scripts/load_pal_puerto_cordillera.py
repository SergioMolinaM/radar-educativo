"""Load PAL 2026 Puerto Cordillera into analytics tables (correct schema)."""
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

    # ── Document ──
    cur.execute("""
        INSERT INTO analytics.pal_document (id, slep_nombre, anio, tipo_documento, acto_administrativo, fecha_aprobacion, estado_extraccion)
        VALUES (%s, %s, %s, %s, %s, %s, %s) ON CONFLICT DO NOTHING
    """, (doc_id, "Puerto Cordillera", 2026, "PAL", "Resolución Exenta N° 1241", "2025-12-15", "completo"))

    # ── Líneas (pal_linea: id, pal_id, nombre_linea, descripcion, orden) ──
    lineas_data = [
        ("OE1: Mejorar aprendizajes", "Mejorar niveles de aprendizaje a través de gestión pedagógica de calidad con inclusión educativa", 1),
        ("LE 1.1: Gestión curricular inclusiva", "Implementar gestión curricular de calidad e inclusiva, sello en competencias lingüísticas y lógico-matemática", 2),
        ("LE 1.2: Monitoreo trayectorias", "Monitorear estudiantes desde educación parvularia hasta finalización de enseñanza media", 3),
        ("LE 1.3: Inclusión educativa", "Generar gestión curricular basada en la inclusión educativa", 4),
        ("LE 1.4: Educación TP", "Asegurar educación de calidad en establecimientos técnico-profesionales", 5),
        ("LE 1.5: Educación parvularia", "Asegurar educación parvularia de calidad", 6),
        ("OE2: Liderazgo y gestión", "Fortalecer capacidades de liderazgo y gestión de equipos directivos y docentes", 7),
        ("LE 2.1: Liderazgo directivo", "Desarrollar competencias de liderazgo directivo con enfoque de mejora continua", 8),
        ("LE 2.2: Acompañamiento docente", "Acompañar la labor docente con retroalimentación pedagógica", 9),
        ("LE 2.3: Asistencia técnica", "Asesorar y asistir técnicamente a establecimientos", 10),
        ("OE3: Identidad territorial", "Desarrollar identidad territorial y sentido de pertenencia en comunidades educativas", 11),
        ("LE 3.1: Articulación territorial", "Generar identidad y articulación territorial", 12),
        ("LE 3.2: Convivencia educativa", "Elaborar y dar seguimiento al plan de convivencia educativa", 13),
        ("LE 3.3: Participación ciudadana", "Aumentar la participación ciudadana y democrática", 14),
        ("OE4: Infraestructura y recursos", "Mejorar condiciones de infraestructura, equipamiento y recursos", 15),
        ("LE 4.1: Infraestructura segura", "Proveer infraestructura adecuada y segura", 16),
        ("LE 4.2: Recursos pedagógicos", "Proveer recursos y materiales pedagógicos", 17),
        ("LE 4.3: Sostenibilidad ambiental", "Alcanzar sostenibilidad medioambiental", 18),
        ("OE5: Sostenibilidad financiera", "Alcanzar la sostenibilidad financiera del servicio local", 19),
        ("LE 5.1: Gestión presupuestaria", "Realizar la mejor gestión presupuestaria posible", 20),
        ("LE 5.2: Fondos adicionales", "Gestionar fondos y recursos adicionales", 21),
        ("LE 5.3: Eficiencia recursos", "Uso eficiente de los recursos financieros", 22),
    ]
    linea_ids = {}
    for i, (nombre, desc, orden) in enumerate(lineas_data):
        lid = max_linea + 1 + i
        linea_ids[orden] = lid
        cur.execute("INSERT INTO analytics.pal_linea (id, pal_id, nombre_linea, descripcion, orden) VALUES (%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING",
                    (lid, doc_id, nombre, desc, orden))

    # ── Indicadores (id, linea_id, nombre_indicador, meta, avance_actual, observacion) ──
    indicadores_data = [
        (linea_ids[1], "Porcentaje estudiantes nivel insuficiente SIMCE 4B y 2M", "35%", "46%", "No cumple meta"),
        (linea_ids[1], "Promedio IDPS territorial", "72", "70.75", "Parcialmente cumplido"),
        (linea_ids[1], "Porcentaje EE categorizados insuficientes-medios bajos", "20%", "17%", "Cumple"),
        (linea_ids[2], "Especialidades EMTP con factibilidad implementación", "85%", "100%", "Cumple"),
        (linea_ids[2], "Porcentaje estudiantes titulados EMTP", "64%", "60%", "Parcial - brecha 4pp"),
        (linea_ids[2], "Cobertura curricular cumplimiento planes y programas", "70%", "70%", "Cumple"),
        (linea_ids[3], "Porcentaje estudiantes que leen comprensivamente 2° básico", "31%", "44%", "Supera meta - SEPA MideUC"),
        (linea_ids[3], "Porcentaje matrícula territorial en educación pública", "27%", "29%", "Cumple - +2pp sobre meta"),
        (linea_ids[4], "Porcentaje EE con gestión curricular inclusiva PIE", "88%", "89.9%", "Cumple"),
        (linea_ids[4], "Porcentaje estudiantes que reprueban", "2.8%", "1.54%", "Cumple - bajo la meta"),
        (linea_ids[4], "Porcentaje promedio días asistidos", "85%", "Sin dato", "Indicador mal diseñado según PAL"),
        (linea_ids[5], "Porcentaje retiro de estudiantes", "3%", "3.81%", "No cumple - 0.81pp sobre meta"),
        (linea_ids[6], "Porcentaje EE con aulas del siglo XXI", "55%", "60%", "Cumple - 40% aún sin aulas"),
        (linea_ids[8], "Satisfacción equipos directivos con acompañamiento", "75%", "84.3%", "Cumple"),
        (linea_ids[9], "Porcentaje EE con observación y retroalimentación docente", "85%", "86%", "Cumple"),
        (linea_ids[11], "Nivel satisfacción comunidades educativas", "70%", "78%", "Cumple"),
        (linea_ids[12], "Cobertura neta educación parvularia", "30%", "32%", "Cumple"),
        (linea_ids[13], "Porcentaje EE con plan convivencia implementado", "90%", "92%", "Cumple"),
        (linea_ids[14], "Participación en consejos escolares", "80%", "85%", "Cumple"),
        (linea_ids[16], "Infraestructura con estándar de seguridad", "75%", "70%", "Parcial - brecha 5pp"),
        (linea_ids[20], "Ejecución presupuestaria anual", "95%", "91%", "Parcial"),
        (linea_ids[21], "Fondos adicionales gestionados", "500M", "480M", "Parcial"),
    ]
    for i, (lid, nombre, meta, avance, obs) in enumerate(indicadores_data):
        cur.execute("""
            INSERT INTO analytics.pal_indicador (id, linea_id, nombre_indicador, meta, avance_actual, observacion)
            VALUES (%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING
        """, (max_ind+1+i, lid, nombre, meta, avance, obs))

    # ── CGE ── (Puerto Cordillera: sin CGE vigente)
    cur.execute("""
        INSERT INTO analytics.pal_cge (id, pal_id, objetivo, indicador_nombre, meta, resultado_obtenido, observacion)
        VALUES (%s,%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING
    """, (max_cge+1, doc_id, "Sin CGE vigente", "Directora Ejecutiva Suplente - art.24bis Ley 21.040", "N/A", "N/A", "No es posible dar cuenta del avance del CGE"))

    # ── PME avance (extraído de pp.67-70 del PAL) ──
    pme_data = [
        (10632, "Escuela Básica Manuel de Salas", "Coquimbo", 3, 5, 3, 3, 14, 100),
        (10634, "Escuela de Huachalalume", "Coquimbo", 4, 5, 2, 4, 15, 100),
        (10635, "Escuela de Totoralillo", "Coquimbo", 4, 5, 3, 5, 17, 100),
        (10637, "Escuela Lucila Godoy Alcayaga", "Coquimbo", 3, 4, 3, 5, 15, 100),
        (10618, "Escuela Santo Tomás de Aquino", "Coquimbo", 4, 5, 3, 4, 16, 100),
        (10620, "Escuela José Alfaro Alfaro", "Coquimbo", 3, 5, 4, 3, 15, 100),
        (10621, "Escuela Básica Mario Muñoz Silva", "Coquimbo", 3, 4, 3, 4, 14, 100),
        (10624, "Escuela Diferencial Juan Sandoval C.", "Coquimbo", 2, 3, 2, 2, 9, 100),
    ]
    cur.execute("SELECT COALESCE(MAX(id),0) FROM analytics.pal_pme_avance")
    max_pme = cur.fetchone()[0]
    for i, (rbd, nombre, comuna, lid, gp, conv, rec, total, pct) in enumerate(pme_data):
        cur.execute("""
            INSERT INTO analytics.pal_pme_avance (id, pal_id, rbd, nombre_ee, comuna, n_acciones_liderazgo, n_acciones_gestion_pedagogica, n_acciones_convivencia, n_acciones_recursos, total_acciones, pct_cumplimiento)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING
        """, (max_pme+1+i, doc_id, rbd, nombre, comuna, lid, gp, conv, rec, total, pct))

    cur.close()
    conn.close()
    print(f"OK PAL Puerto Cordillera cargado: doc_id={doc_id}, 22 lineas, {len(indicadores_data)} indicadores, {len(pme_data)} PME")

if __name__ == "__main__":
    load()
