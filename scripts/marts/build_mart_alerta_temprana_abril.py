import os
import psycopg
from dotenv import load_dotenv
from pathlib import Path
from rich.console import Console
from rich.table import Table

console = Console()

def build_mart():
    project_dir = Path(r"C:\Users\molin\OneDrive\Documentos\Escritorio\radar-data-platform")
    env_path = project_dir / ".env"
    load_dotenv(dotenv_path=env_path)
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        console.print("[red]Error: DATABASE_URL not found[/red]")
        return

    try:
        conn = psycopg.connect(database_url, autocommit=True)
        with conn.cursor() as cur:
            # 1. Coverage Report before building
            console.print("\n[bold yellow]--- Join Coverage Report ---[/bold yellow]")
            
            checks = {
                "fact_matricula": "rbd",
                "fact_asistencia_abril": "rbd",
                "fact_sep_prioritarios": "rbd"
            }
            
            for table, col in checks.items():
                # Note: normalizing RBD for the check
                cur.execute(f"""
                    WITH fact_rbds AS (SELECT DISTINCT SPLIT_PART({col}, '.', 1) as rbd FROM analytics.{table}),
                    dim_rbds AS (SELECT DISTINCT SPLIT_PART(rbd, '.', 1) as rbd FROM analytics.dim_establecimiento)
                    SELECT 
                        (SELECT COUNT(*) FROM fact_rbds) as total,
                        COUNT(f.rbd) as matches
                    FROM fact_rbds f
                    JOIN dim_rbds d ON f.rbd = d.rbd
                """)
                res = cur.fetchone()
                total = res[0]
                matches = res[1]
                pct = (matches/total*100) if total > 0 else 0
                console.print(f"{table}: {matches}/{total} match ({pct:.1f}%)")

            # 2. Execute SQL script
            sql_path = Path("sql/mart_alerta_temprana_abril.sql")
            if not sql_path.exists():
                console.print(f"[red]Error: {sql_path} not found[/red]")
                return

            console.print(f"\n[bold green]Building Mart from {sql_path}...[/bold green]")
            cur.execute(sql_path.read_text(encoding='utf-8'))
            
            # 3. Summary Statistics
            console.print("\n[bold yellow]--- Mart Summary Statistics ---[/bold yellow]")
            cur.execute("SELECT COUNT(*) FROM analytics.mart_alerta_temprana_abril")
            row_count = cur.fetchone()[0]
            console.print(f"Total rows in mart: {row_count}")

            cur.execute("""
                SELECT semaforo_riesgo, COUNT(*) 
                FROM analytics.mart_alerta_temprana_abril 
                GROUP BY 1 
                ORDER BY 1
            """)
            semaforo = cur.fetchall()
            sem_table = Table(title="Semaforo Distribution")
            sem_table.add_column("Semaforo")
            sem_table.add_column("Count")
            for s in semaforo:
                sem_table.add_row(str(s[0]), str(s[1]))
            console.print(sem_table)

            # Sample rows
            console.print("\n[bold cyan]Sample Rows (First 3):[/bold cyan]")
            cur.execute("SELECT rbd, nombre_establecimiento, matricula_total, tasa_asistencia, semaforo_riesgo FROM analytics.mart_alerta_temprana_abril LIMIT 3")
            rows = cur.fetchall()
            sample_table = Table()
            sample_table.add_column("RBD")
            sample_table.add_column("Nom_Estab")
            sample_table.add_column("Matricula")
            sample_table.add_column("Asistencia")
            sample_table.add_column("Riesgo")
            for r in rows:
                asist_str = f"{r[3]:.2%}" if r[3] is not None else "N/A"
                sample_table.add_row(str(r[0]), str(r[1]), str(r[2]), asist_str, str(r[4]))
            console.print(sample_table)

        conn.close()
    except Exception as e:
        console.print(f"[red]Build failed: {e}[/red]")

if __name__ == "__main__":
    build_mart()
