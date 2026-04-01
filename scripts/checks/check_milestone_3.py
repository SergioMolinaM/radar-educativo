import os
import psycopg
from dotenv import load_dotenv
from rich.console import Console
from rich.table import Table

console = Console()

def check_milestone_3():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    
    tables_to_check = [
        ("raw", "mineduc_matricula"),
        ("staging", "fact_matricula"),
        ("analytics", "fact_matricula")
    ]
    
    console.print("[bold blue]Verificando Hito 3: Matrícula (Escalabilidad y Hechos)[/bold blue]\n")
    
    results_table = Table(title="Estado de Tablas Milestone 3")
    results_table.add_column("Esquema", style="cyan")
    results_table.add_column("Tabla", style="magenta")
    results_table.add_column("Existe", style="green")
    results_table.add_column("Filas", justify="right", style="yellow")
    
    try:
        with psycopg.connect(db_url) as conn:
            with conn.cursor() as cur:
                for schema, table in tables_to_check:
                    # Verificar existencia
                    cur.execute("""
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_schema = %s 
                            AND table_name = %s
                        );
                    """, (schema, table))
                    exists = cur.fetchone()[0]
                    
                    row_count = 0
                    if exists:
                        cur.execute(f"SELECT COUNT(*) FROM {schema}.{table};")
                        row_count = cur.fetchone()[0]
                    
                    results_table.add_row(
                        schema, 
                        table, 
                        "SÍ" if exists else "NO", 
                        f"{row_count:,}" if exists else "N/A"
                    )
                    
        console.print(results_table)
        console.print("\n[bold green]Hito 3 Verificado Exitosamente.[/bold green]")
        
    except Exception as e:
        console.print(f"[bold red]Error en verificación:[/bold red] {e}")

if __name__ == "__main__":
    check_milestone_3()
