import os
import psycopg
from dotenv import load_dotenv
from rich.console import Console
from rich.table import Table

console = Console()

def run_mart():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    sql_path = r"C:\Users\molin\OneDrive\Documentos\Escritorio\radar-data-platform\sql\mart_alerta_temprana_abril_julio.sql"

    console.print(f"[bold blue]Iniciando construcción de Mart 2 (Abril-Julio)...[/bold blue]")
    
    with open(sql_path, "r", encoding="utf-8") as f:
        sql_query = f.read()

    try:
        with psycopg.connect(db_url, autocommit=True) as conn:
            with conn.cursor() as cur:
                cur.execute(sql_query)
                console.print("[bold green]SQL ejecutado exitosamente.[/bold green]")
                
                # Reporte de resultados
                cur.execute("SELECT count(*) FROM analytics.mart_alerta_temprana_abril_julio")
                total_rows = cur.fetchone()[0]
                console.print(f"Total de establecimientos en el Mart: [bold]{total_rows}[/bold]")
                
                # Muestra de datos
                cur.execute("""
                    SELECT rbd, nombre_establecimiento, tasa_asistencia_abr, tasa_asistencia_jul, delta_asistencia, semaforo_jul, tendencia_asistencia 
                    FROM analytics.mart_alerta_temprana_abril_julio 
                    WHERE delta_asistencia IS NOT NULL
                    ORDER BY delta_asistencia ASC 
                    LIMIT 5
                """)
                rows = cur.fetchall()
                cols = [desc[0] for desc in cur.description]
                
                table = Table(title="Muestra de Tendencias (Mayores bajas en asistencia)")
                for col in cols:
                    table.add_column(col)
                for row in rows:
                    table.add_row(*[str(val) for val in row])
                console.print(table)

    except Exception as e:
        console.print(f"[bold red]Error construyendo el Mart:[/bold red] {e}")
        raise

if __name__ == "__main__":
    run_mart()
