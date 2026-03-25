import duckdb
from pathlib import Path
from rich.console import Console
import sys
import logging

console = Console()

def main(slep_target: str = "BARRANCAS"):
    db_path = "radar_edu.duckdb"
    console.print(f"[bold blue]Inicializando Data Warehouse (DuckDB: {db_path}) para Tenant: {slep_target}[/bold blue]")
    
    conn = duckdb.connect(db_path)
    conn.execute("CREATE SCHEMA IF NOT EXISTS staging")
    conn.execute("CREATE SCHEMA IF NOT EXISTS analytics")
    
    # -----------------------------------------------------
    # 1. Cargar Transparencia (Operativa) FILTRADO
    # -----------------------------------------------------
    trans_files = list(Path("data/raw/transparencia").glob("*.csv"))
    if trans_files:
        console.print("[yellow]-> Cargando Dotación (Transparencia)...[/yellow]")
        conn.execute("DROP TABLE IF EXISTS staging.stg_transparencia_dotacion")
        conn.execute("CREATE TABLE staging.stg_transparencia_dotacion AS SELECT * FROM read_csv_auto('data/raw/transparencia/*.csv', header=True)")
    else:
        conn.execute("CREATE TABLE IF NOT EXISTS staging.stg_transparencia_dotacion (rut_funcionario VARCHAR, nombre_completo VARCHAR, estamento VARCHAR, tipo_contrato VARCHAR, establecimiento VARCHAR, horas_contrato INT, renta_bruta BIGINT, mes INT, anio INT)")

    # -----------------------------------------------------
    # 2. Cargar Mineduc (Pedagógica) CON SHARDING POR SLEP
    # -----------------------------------------------------
    asis_files = list(Path("data/raw").glob("mineduc_asistencia_*.csv"))
    if asis_files:
        console.print("[yellow]-> Aislando Asistencia Mineduc (Solo RBDs de la jurisdicción)...[/yellow]")
        conn.execute("DROP TABLE IF EXISTS staging.stg_mineduc_asistencia")
        conn.execute(f"""
            CREATE TABLE staging.stg_mineduc_asistencia AS 
            SELECT 
                RBD as rbd_liceo, 
                NOM_RBD as nombre_establecimiento, 
                COUNT(MRUN) as alumnos_matriculados,
                AVG(TRY_CAST(REPLACE(ASIS_PROMEDIO, ',', '.') AS FLOAT)) as porcentaje_asistencia,
                ANY_VALUE(RURAL_RBD) as rural_rbd
            FROM read_csv_auto('data/raw/mineduc_asistencia_*.csv', sep=';', header=True, ignore_errors=true)
            WHERE NOMBRE_SLEP ILIKE '%{slep_target}%'
            GROUP BY RBD, NOM_RBD
        """)
    else:
        conn.execute("CREATE TABLE IF NOT EXISTS staging.stg_mineduc_asistencia (rbd_liceo INT, nombre_establecimiento VARCHAR, alumnos_matriculados BIGINT, porcentaje_asistencia DOUBLE, rural_rbd INT)")

    # -----------------------------------------------------
    # 3. Cargar Finanzas (Mercado Público)
    # -----------------------------------------------------
    fin_files = list(Path("data/raw/mercadopublico").glob("*.csv"))
    if fin_files:
        console.print("[yellow]-> Cargando Finanzas (Mercado Público)...[/yellow]")
        conn.execute("DROP TABLE IF EXISTS staging.stg_mercadopublico_ordenes")
        conn.execute("CREATE TABLE staging.stg_mercadopublico_ordenes AS SELECT * FROM read_csv_auto('data/raw/mercadopublico/*.csv', header=True)")
    else:
        conn.execute("CREATE TABLE IF NOT EXISTS staging.stg_mercadopublico_ordenes (rut_slep VARCHAR, monto_neto_clp DOUBLE, codigo_orden VARCHAR, estado VARCHAR)")

    # -----------------------------------------------------
    # 4. Compilar Data Warehouse
    # -----------------------------------------------------
    sql_file = Path("sql/radar_tridimensional_view.sql")
    if sql_file.exists():
        console.print("[yellow]-> Construyendo Matriz Tridimensional Aislada...[/yellow]")
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_query = f.read()
            conn.execute(sql_query)
        console.print("[bold green]Sharding B2G completado. Vista 'analytics.vh_radar_integral' blindada.[/bold green]")
    else:
        console.print(f"[red]Archivo SQL {sql_file} no encontrado.[/red]")
        sys.exit(1)

    conn.close()

if __name__ == "__main__":
    import yaml
    slep_filter = "BARRANCAS"
    if Path("config/slep_config.yaml").exists():
        with open("config/slep_config.yaml", "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
            if data and "sleps" in data and len(data["sleps"]) > 0:
                slep_id = data["sleps"][0]["id"]
                slep_filter = slep_id.split("_")[-1].upper() # "slep_barrancas" -> "BARRANCAS"

    main(slep_target=slep_filter)
