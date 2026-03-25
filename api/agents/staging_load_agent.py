import os
import psycopg
import pandas as pd
from pathlib import Path
from dotenv import load_dotenv
from rich.console import Console

console = Console()

class StagingLoadAgent:
    def __init__(self, db_url=None):
        load_dotenv()
        self.db_url = db_url or os.getenv("DATABASE_URL")
        self.console = Console()

    def _get_connection(self):
        return psycopg.connect(self.db_url, autocommit=True)

    def load_to_raw(self, df: pd.DataFrame, table_name: str):
        """Etapa 1: Carga bruta a la capa 'raw' de SQL."""
        console.print(f"Cargando datos a [bold]raw.{table_name}[/bold]...")
        
        with self._get_connection() as conn:
            with conn.cursor() as cur:
                # Crear tabla raw si no existe (clonando estructura de pandas)
                # En un entorno real usaríamos DDL prefijado
                cols = ", ".join([f"{col} TEXT" for col in df.columns])
                cur.execute(f"CREATE SCHEMA IF NOT EXISTS raw;")
                cur.execute(f"DROP TABLE IF EXISTS raw.{table_name};")
                cur.execute(f"CREATE TABLE raw.{table_name} ({cols});")
                
                # Carga masiva eficiente usando COPY (psycopg 3)
                with cur.copy(f"COPY raw.{table_name} FROM STDIN") as copy:
                    for row in df.itertuples(index=False, name=None):
                        copy.write_row(row)
        
        console.print(f"[green]Carga a raw.{table_name} completada ({len(df):,} filas).[/green]")

    def promote_to_staging(self, raw_table: str, staging_table: str, mapping_rules: dict):
        """
        Etapa 2: Limpieza y normalización a la capa 'staging'.
        Aplica renombrado de columnas basado en las reglas de mapeo.
        """
        console.print(f"Promocionando {raw_table} a [bold]staging.{staging_table}[/bold]...")
        
        # Construir el SELECT con renombreo (normalizando fuentes a minúscula para coincidir con el RAW de Postgres)
        if mapping_rules:
            # columns: {RAW_NAME: CANONICAL_NAME}
            select_parts = [f'"{raw_name.lower()}" AS "{canonical}"' for raw_name, canonical in mapping_rules.items()]
            select_statement = ", ".join(select_parts)
        else:
            select_statement = "*"

        with self._get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(f"CREATE SCHEMA IF NOT EXISTS staging;")
                cur.execute(f"DROP TABLE IF EXISTS staging.{staging_table};")
                # Crear tabla en staging con los nombres correctos
                cur.execute(f"CREATE TABLE staging.{staging_table} AS SELECT {select_statement} FROM raw.{raw_table};")
        
        console.print(f"[green]Promoción a staging.{staging_table} completada con {len(mapping_rules)} mapeos.[/green]")

    def promote_to_analytics(self, staging_table: str, final_table: str):
        """Etapa 3: Modelado final a la capa 'analytics'."""
        console.print(f"Promocionando {staging_table} a [bold]analytics.{final_table}[/bold]...")
        
        with self._get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(f"CREATE SCHEMA IF NOT EXISTS analytics;")
                # Simulación de modelado final
                cur.execute(f"DROP TABLE IF EXISTS analytics.{final_table};")
                cur.execute(f"CREATE TABLE analytics.{final_table} AS SELECT * FROM staging.{staging_table};")
                
        console.print(f"[green]Modelado final en analytics.{final_table} completado.[/green]")

if __name__ == "__main__":
    # Prueba conceptual
    df = pd.DataFrame({"rbd": ["1"], "nombre": ["Test"]})
    loader = StagingLoadAgent()
    loader.load_to_raw(df, "test_table")
    loader.promote_to_staging("test_table", "stg_test", {})
    loader.promote_to_analytics("stg_test", "dim_test")
