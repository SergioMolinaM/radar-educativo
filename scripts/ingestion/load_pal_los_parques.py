import os
import psycopg
from dotenv import load_dotenv
from pathlib import Path
from datetime import date

def load_data():
    # Cargar .env desde el directorio raíz del proyecto
    load_dotenv()
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("Error: DATABASE_URL no encontrada en el archivo .env")
        return

    try:
        # Conexión usando DATABASE_URL
        conn = psycopg.connect(database_url, autocommit=True)
        with conn.cursor() as cur:
            # 1. Crear tablas si no existen (usando el DDL de referencia)
            schema_path = Path("sql/pal_schema.sql")
            if schema_path.exists():
                print(f"Definiendo esquema desde {schema_path}...")
                cur.execute(schema_path.read_text(encoding='utf-8'))
            else:
                print("Aviso: sql/pal_schema.sql no encontrado. Saltando creación de tablas.")

            # Limpiar datos previos de Los Parques 2026 para asegurar repetibilidad
            print("Limpiando registros previos de Los Parques 2026...")
            
            # Buscar IDs del documento para borrado explícito
            cur.execute("""
                SELECT id FROM analytics.pal_document 
                WHERE slep_nombre = %s AND anio = %s AND tipo_documento = %s
            """, ('Los Parques', 2026, 'PAL'))
            doc_rows = cur.fetchall()
            
            for (old_pal_id,) in doc_rows:
                # El borrado en cascada (si existe) se encargaría, 
                # pero el usuario pide orden explícito: indicador -> linea -> document
                print(f"Borrando indicadores y líneas para PAL ID: {old_pal_id}")
                cur.execute("DELETE FROM analytics.pal_indicador WHERE linea_id IN (SELECT id FROM analytics.pal_linea WHERE pal_id = %s)", (old_pal_id,))
                cur.execute("DELETE FROM analytics.pal_linea WHERE pal_id = %s", (old_pal_id,))
                cur.execute("DELETE FROM analytics.pal_document WHERE id = %s", (old_pal_id,))

            # 2. Insertar Metadatos del Documento
            print("Cargando analytics.pal_document...")
            cur.execute("""
                INSERT INTO analytics.pal_document 
                (slep_nombre, anio, tipo_documento, acto_administrativo, fecha_aprobacion, file_path_principal, file_path_resolucion, estado_extraccion)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                'Los Parques', 2026, 'PAL', 'Resolución Exenta N°175', date(2025, 12, 12),
                'data/source_documents/pal/los_parques/pal_2026_los_parques.pdf',
                'data/source_documents/pal/los_parques/resolucion_pal_2026_los_parques.pdf',
                'parcial'
            ))
            pal_id = cur.fetchone()[0]

            # 3. Insertar Líneas del PAL (según índice)
            print("Cargando analytics.pal_linea...")
            lines = [
                ('objetivos_estrategicos', 'Objetivos estratégicos del SLEP', 1),
                ('estado_avance_instrumentos_gestion', 'Estado de avance de los instrumentos de gestión', 2),
                ('estado_convenio_gestion_educacional', 'Estado del convenio de gestión educacional', 3),
                ('acciones_cumplimiento_cge', 'Acciones orientadas al cumplimiento del CGE', 4),
                ('acciones_instalacion_prestacion_servicio', 'Acciones para una adecuada instalación y prestación del servicio educativo', 5)
            ]
            line_ids = {}
            for nombre, desc, orden in lines:
                cur.execute("""
                    INSERT INTO analytics.pal_linea (pal_id, nombre_linea, descripcion, orden)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id
                """, (pal_id, nombre, desc, orden))
                line_ids[nombre] = cur.fetchone()[0]

            # 4. Insertar Indicadores (capa mínima inicial)
            print("Cargando analytics.pal_indicador...")
            indicators = [
                (
                    line_ids['acciones_cumplimiento_cge'],
                    'Porcentaje de proyectos de inversión en ejecución o terminados que consideran al menos un estándar de la ENEP en los establecimientos educacionales',
                    '100%', 'Trimestral', 'Correo electrónico que envía reporte de ejecución',
                    'Unidad de Infraestructura y Mantenimiento', 'parcial', 'Extraído de sección 4.1'
                ),
                (
                    line_ids['acciones_instalacion_prestacion_servicio'],
                    'Porcentaje de informes de monitoreo del uso de recursos SEP realizados en el año t',
                    '100%', 'Trimestral', 'Memorándum a Dirección Ejecutiva',
                    'Subdirección de Planificación y Control de Gestión', 'si', 'Extraído de sección 4.2'
                ),
                (
                    line_ids['acciones_instalacion_prestacion_servicio'],
                    'Porcentaje de establecimientos en los que se aplica el sistema de diagnóstico de aprendizajes en lectura y matemáticas',
                    '75%', 'Trimestral', 'Memorándum a Dirección Ejecutiva',
                    'Subdirección Apoyo Técnico Pedagógico', 'si', 'Extraído de sección 4.2'
                )
            ]
            for ind in indicators:
                cur.execute("""
                    INSERT INTO analytics.pal_indicador 
                    (linea_id, nombre_indicador, meta, periodicidad, medio_verificacion, responsable, automatizable, observacion)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, ind)

            print(f"¡Carga exitosa! Se han insertado registros para PAL ID: {pal_id}")
            
        conn.close()
    except Exception as e:
        print(f"Error durante la ejecución del script: {e}")

if __name__ == "__main__":
    load_data()
