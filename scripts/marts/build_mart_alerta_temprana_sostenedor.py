import os
import psycopg
from dotenv import load_dotenv
from rich.console import Console
from rich.table import Table

console = Console()

def run_mart():
    project_dir = r"C:\Users\molin\OneDrive\Documentos\Escritorio\radar-data-platform"
    load_dotenv(os.path.join(project_dir, ".env"))
    db_url = os.getenv("DATABASE_URL")
    sql_path = os.path.join(project_dir, "sql", "mart_alerta_temprana_sostenedor.sql")

    console.print(f"[bold blue]Iniciando construcción de Mart Sostenedor...[/bold blue]")
    
    with open(sql_path, "r", encoding="utf-8") as f:
        sql_query = f.read()

    try:
        with psycopg.connect(db_url, autocommit=True) as conn:
            with conn.cursor() as cur:
                cur.execute(sql_query)
                console.print("[bold green]SQL ejecutado exitosamente.[/bold green]")
                
                # Reporte de resultados
                cur.execute("SELECT count(*) FROM analytics.mart_alerta_temprana_sostenedor")
                total_rows = cur.fetchone()[0]
                console.print(f"Total de sostenedores en el Mart: [bold]{total_rows}[/bold]")
                
                # Distribución de semáforo
                cur.execute("SELECT semaforo_sostenedor, count(*) FROM analytics.mart_alerta_temprana_sostenedor GROUP BY 1 ORDER BY 2 DESC")
                dist = cur.fetchall()
                console.print("\n[bold]Distribución de Semáforo:[/bold]")
                for color, count in dist:
                    console.print(f" - {color}: {count}")

                # Muestra de datos
                cur.execute("""
                    SELECT rut_sostenedor, nombre_sostenedor, num_establecimientos, matricula_total, semaforo_sostenedor 
                    FROM analytics.mart_alerta_temprana_sostenedor 
                    ORDER BY matricula_total DESC 
                    LIMIT 5
                """)
                rows = cur.fetchall()
                cols = [desc[0] for desc in cur.description]
                
                table = Table(title="Muestra de Sostenedores (Mayores por Matrícula)")
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
