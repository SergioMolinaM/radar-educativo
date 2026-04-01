import os
import psycopg
from dotenv import load_dotenv
from pathlib import Path
from rich.console import Console

console = Console()

def run_sql_file(file_path):
    load_dotenv()
    
    # Obtener variables del .env
    dbname = os.getenv("POSTGRES_DB")
    user = os.getenv("POSTGRES_USER")
    password = os.getenv("POSTGRES_PASSWORD")
    host = os.getenv("POSTGRES_HOST", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")

    if not all([dbname, user, password]):
        console.print("[red]Error: Faltan credenciales en el archivo .env[/red]")
        return

    try:
        # Conexión a la base de datos
        conn = psycopg.connect(
            dbname=dbname,
            user=user,
            password=password,
            host=host,
            port=port,
            autocommit=True
        )
        
        with conn.cursor() as cur:
            sql_script = Path(file_path).read_text(encoding='utf-8')
            console.print(f"Ejecutando [yellow]{file_path}[/yellow]...")
            cur.execute(sql_script)
            console.print("[bold green]¡Éxito! Esquemas creados correctamente.[/bold green]")
            
        conn.close()
    except Exception as e:
        console.print(f"[red]Error al conectar o ejecutar el script: {e}[/red]")
        console.print("[yellow]Asegúrate de que la base de datos existe y las credenciales en .env son correctas.[/yellow]")

if __name__ == "__main__":
    run_sql_file("sql/setup_schemas.sql")
