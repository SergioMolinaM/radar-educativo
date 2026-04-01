import duckdb
import pandas as pd
from pathlib import Path
from rich.console import Console
from rich.table import Table
import logging

console = Console()

class RadarAlertEngine:
    """
    Inteligencia Analítica: Lee el Data Warehouse (DuckDB) y la tabla de compromisos del PAL.
    Aplica lógicas estrictas para disparar Semáforos de Riesgo Administrativos.
    """
    def __init__(self, db_path="radar_edu.duckdb"):
        self.db_path = db_path
        self.setup_logging()

    def setup_logging(self):
        Path('logs').mkdir(exist_ok=True)
        logging.basicConfig(
            filename='logs/alert_engine.log',
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )

    def generate_alerts(self):
        console.print("[bold blue]Iniciando Motor de Alertas (Cruzando Data vs PAL)...[/bold blue]")
        
        # Conectar a la base analítica
        try:
            conn = duckdb.connect(self.db_path)
            
            # Verificar si existe la vista tridimensional
            vista_check = conn.execute("SELECT count(*) FROM information_schema.tables WHERE table_schema='analytics' AND table_name='vh_radar_integral'").fetchone()[0]
            if vista_check == 0:
                console.print("[red]Vista 'analytics.vh_radar_integral' no encontrada. Ejecuta load_data_warehouse.py primero.[/red]")
                return
                
            # Extraer toda la matriz de liceos y la foto de caja agregada del SLEP
            df_liceos = conn.execute("SELECT * FROM analytics.vh_radar_integral").df()
            
            # Obtener métricas financieras globales de Mercado Público
            try:
                gasto_global = conn.execute("SELECT SUM(monto_neto_clp) FROM staging.stg_mercadopublico_ordenes").fetchone()[0]
                gasto_global = gasto_global if gasto_global else 0
            except:
                gasto_global = 0

            # Cargar compromisos estructurados del PAL si existen
            try:
                df_pal = conn.execute("SELECT * FROM staging.stg_pal_compromisos").df()
            except:
                df_pal = pd.DataFrame()

            alertas = []
            
            # ========================================================
            # REGLA 0: ALERTA GLOBAL DE SUB-EJECUCIÓN DE INFRA Y FAEP
            # ========================================================
            import datetime
            mes_actual = datetime.datetime.now().month
            # Ejemplo: Presupuesto base promedio asignado para Reparaciones / Mantención / FAEP: 5000 Millones
            presupuesto_infra_slep = 5000000000 
            porcentaje_ejecucion = (gasto_global / presupuesto_infra_slep) * 100 if presupuesto_infra_slep > 0 else 0
            
            # Si estamos después de Julio (mes 7) y se ha gastado menos del 40%, hay riesgo inminente de remesa a Hacienda
            if mes_actual >= 7 and porcentaje_ejecucion < 40.0:
                alertas.append({
                    "liceo": "TODO EL SLEP (Central)",
                    "kpi_afectado": "Presupuesto Infraestructura (FAEP)",
                    "valor_actual": f"Ejecutado: {porcentaje_ejecucion:.1f}%",
                    "nivel_riesgo": "ROJO",
                    "mensaje_directivo": f"Peligro de Reintegro: Licitaciones de Mercado Público atrasadísimas. Ejecución es {porcentaje_ejecucion:.1f}% a mitad de año. Apurar a equipo de Compras."
                })

            for _, liceo in df_liceos.iterrows():
                
                ratio = liceo.get('ratio_alumno_docente', 0)
                asistencia = liceo.get('asistencia_promedio', 0)
                es_rural = liceo.get('es_rural', 0)
                matricula = liceo.get('total_matricula', 0)
                docentes = liceo.get('total_docentes', 0)
                
                # ========================================================
                # NUEVA REGLA: QUIEBRA INMINENTE / FUSIÓN (ROJO)
                # ========================================================
                if pd.notna(matricula) and matricula < 50 and docentes > 8:
                    alertas.append({
                        "liceo": liceo['nombre_establecimiento'],
                        "kpi_afectado": "Liderazgo / Dimensión Financiera",
                        "valor_actual": f"Alumnos: {matricula} | Docentes: {docentes}",
                        "nivel_riesgo": "ROJO",
                        "mensaje_directivo": "Alerta de Fusión: Micro-escuela con planta hipertrofiada. Económicamente insustentable con subvención actual."
                    })

                # ========================================================
                # REGLA 1: FUGA TÉRMICA Y SOBREDOTACIÓN (ROJO)
                # ========================================================
                if pd.notna(ratio) and ratio > 0 and ratio < 15.0 and matricula >= 50:
                    alertas.append({
                        "liceo": liceo['nombre_establecimiento'],
                        "kpi_afectado": "Eficiencia de Dotación",
                        "valor_actual": f"Ratio A/D: {ratio}",
                        "nivel_riesgo": "ROJO",
                        "mensaje_directivo": "Crítico: Establecimiento quema presupuesto FAEP por ratio < 15. Requiere auditoría de matrícula fantasma o reubicación docente."
                    })
                    
                # ========================================================
                # NUEVA REGLA: COMPLEJIDAD TERRITORIAL RURAL (NARANJA/ROJO)
                # ========================================================
                if pd.notna(es_rural) and es_rural == 1 and asistencia < 88.0:
                    alertas.append({
                        "liceo": liceo['nombre_establecimiento'],
                        "kpi_afectado": "Trayectoria Educativa Rural",
                        "valor_actual": f"Asist: {asistencia}% (Rural)",
                        "nivel_riesgo": "ROJO",
                        "mensaje_directivo": "Foco Crítico de Deserción: Alta vulnerabilidad logística. Urge redestinar fondos a Transporte Escolar."
                    })
                # Regla de asistencia general urbana
                elif pd.notna(es_rural) and es_rural == 0 and asistencia < 85.0:
                    alertas.append({
                        "liceo": liceo['nombre_establecimiento'],
                        "kpi_afectado": "Asistencia / Flujo Caja",
                        "valor_actual": f"{asistencia}%",
                        "nivel_riesgo": "NARANJA",
                        "mensaje_directivo": "Alerta de Subejecución de Subvención. Auditar contención de dupla psicosocial."
                    })
                    
                # ========================================================
                # REGLA 3: CRUZAMIENTO PAL EXPLÍCITO (Semáforo Verde o Naranja)
                # ========================================================
                cumple_pal = False
                if not df_pal.empty:
                    metas_escuela = df_pal[df_pal['descripcion_cruda'].str.contains(str(liceo['nombre_establecimiento']), case=False, na=False)]
                    if not metas_escuela.empty:
                        for _, meta in metas_escuela.iterrows():
                            if meta['tipo_indicador'] == 'Asistencia':
                                meta_val = 90.0 # Parse mock
                                if asistencia < meta_val:
                                    alertas.append({
                                        "liceo": liceo['nombre_establecimiento'],
                                        "kpi_afectado": "Compromiso Director ADP",
                                        "valor_actual": f"Real: {asistencia}% vs Meta PAL",
                                        "nivel_riesgo": "ROJO",
                                        "mensaje_directivo": "Riesgo destitución: Incumplimiento meta principal del Convenio de Desempeño."
                                    })
                                else:
                                    cumple_pal = True

                # ========================================================
                # ESTADO DE REPOSO (VERDE)
                # ========================================================
                if pd.notna(asistencia) and asistencia >= 90.0 and ratio >= 20 and matricula >= 50:
                    alertas.append({
                        "liceo": liceo['nombre_establecimiento'],
                        "kpi_afectado": "Acompañamiento Sistémico",
                        "valor_actual": f"KPIs en rango normal",
                        "nivel_riesgo": "VERDE",
                        "mensaje_directivo": "Establecimiento autosustentable. El convenio ADP se encuentra protegido." if cumple_pal else "Establecimiento autosustentable según línea base nacional."
                    })

            # Imprimir y Guardar Resultados
            self._render_table(alertas)
            self._save_alerts(alertas)
            
        except Exception as e:
            console.print(f"[bold red]Error crítico en el Alert Engine: {e}[/bold red]")
            logging.error(f"Error AlertEngine: {e}")

    def _render_table(self, alertas):
        if not alertas:
            console.print("[green]Análisis perfecto. No se activaron alarmas.[/green]")
            return
            
        table = Table(title="PANEL DE COMANDO SLEP (Alertas Tempranas)")
        table.add_column("Liceo / Establecimiento", style="cyan", no_wrap=True)
        table.add_column("Riesgo", style="bold")
        table.add_column("Monitor", style="magenta")
        table.add_column("Decisión Directiva (Acción)", style="white")
        
        for a in alertas:
            color = "red" if a['nivel_riesgo'] == 'ROJO' else "yellow" if a['nivel_riesgo'] == 'NARANJA' else "green"
            table.add_row(
                a['liceo'], 
                f"[{color}]{a['nivel_riesgo']}[/{color}]", 
                f"{a['kpi_afectado']} ({a['valor_actual']})",
                a['mensaje_directivo']
            )
            
        console.print(table)

    def _save_alerts(self, alertas):
        if alertas:
            df = pd.DataFrame(alertas)
            out_dir = Path("data/processed")
            out_dir.mkdir(exist_ok=True)
            out_file = out_dir / "semaforos_slep_report.csv"
            df.to_csv(out_file, index=False)
            logging.info(f"Reporte de {len(alertas)} alertas guardado en {out_file}")

if __name__ == "__main__":
    engine = RadarAlertEngine()
    engine.generate_alerts()
