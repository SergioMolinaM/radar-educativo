"""
Load 2025 MINEDUC data into PostgreSQL.
Sources: BBDD Radar educativo folder (datosabiertos.mineduc.cl)

Datasets:
- Directorio establecimientos 2025
- Matrícula por estudiante 2025
- Asistencia mensual 2025 (marzo a diciembre, 10 meses)
- Rendimiento 2025
- SEP prioritarios 2025
"""
import os
import sys
import io
import pandas as pd
import psycopg
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DATABASE_URL")
BASE = Path("data/raw/bbdd_2025")


def load_csv_to_raw(csv_path: str, table_name: str, schema: str = "raw"):
    """Load a CSV file into a raw schema table using COPY."""
    print(f"\n  Loading {csv_path} -> {schema}.{table_name}")

    # Try different encodings and separators
    for enc in ["utf-8", "latin-1"]:
        for sep in [";", ","]:
            try:
                df = pd.read_csv(csv_path, sep=sep, encoding=enc, low_memory=False, nrows=5)
                if len(df.columns) > 1:
                    df_full = pd.read_csv(csv_path, sep=sep, encoding=enc, low_memory=False)
                    print(f"    Read: {len(df_full)} rows, {len(df_full.columns)} cols (enc={enc}, sep='{sep}')")

                    # Clean column names
                    df_full.columns = [c.strip().replace("\ufeff", "") for c in df_full.columns]

                    conn = psycopg.connect(DB_URL, autocommit=True)
                    cur = conn.cursor()

                    cur.execute(f"CREATE SCHEMA IF NOT EXISTS {schema}")
                    cur.execute(f"DROP TABLE IF EXISTS {schema}.{table_name} CASCADE")

                    # Create table from DataFrame dtypes
                    col_defs = []
                    for col in df_full.columns:
                        safe_col = col.lower().replace(" ", "_").replace(".", "_").replace("-", "_")
                        col_defs.append(f'"{safe_col}" TEXT')

                    cur.execute(f'CREATE TABLE {schema}.{table_name} ({", ".join(col_defs)})')

                    # COPY via StringIO
                    buf = io.StringIO()
                    df_full.to_csv(buf, index=False, header=False, sep="\t", na_rep="")
                    buf.seek(0)

                    safe_cols = [f'"{c.lower().replace(" ", "_").replace(".", "_").replace("-", "_")}"' for c in df_full.columns]
                    with cur.copy(f'COPY {schema}.{table_name} ({",".join(safe_cols)}) FROM STDIN') as copy:
                        for line in buf:
                            copy.write(line)

                    cur.execute(f"SELECT COUNT(*) FROM {schema}.{table_name}")
                    count = cur.fetchone()[0]
                    print(f"    Loaded: {count} rows into {schema}.{table_name}")
                    conn.close()
                    return count
            except Exception as e:
                continue

    print(f"    ERROR: Could not read {csv_path}")
    return 0


def main():
    datasets = [
        # (csv_relative_path, table_name)
        ("Directorio-Oficial-EE-2025/mineduc_directorio.csv", "mineduc_directorio_2025"),
        ("Matricula-por-estudiante-2025/mineduc_matricula.csv", "mineduc_matricula_2025"),
        ("Asistencia-declarada-Marzo-2025/mineduc_asistencia_marzo.csv", "mineduc_asistencia_marzo_2025"),
        ("Asistencia-declarada-Abril-2025/mineduc_asistencia_abril.csv", "mineduc_asistencia_abril_2025"),
        ("Asistencia-declarada-Mayo-2025/mineduc_asistencia_mayo.csv", "mineduc_asistencia_mayo_2025"),
        ("Asistencia-declarada-Junio-2025/mineduc_asistencia_junio.csv", "mineduc_asistencia_junio_2025"),
        ("Asistencia-declarada-Julio-2025/mineduc_asistencia_julio.csv", "mineduc_asistencia_julio_2025"),
        ("Asistencia-declarada-Agosto-2025/20250911_Asistencia_AGOSTO_2025_20250905_WEB.csv", "mineduc_asistencia_agosto_2025"),
        ("Asistencia-declarada-septiembre-2025/mineduc_asistencia_septiembre.csv", "mineduc_asistencia_septiembre_2025"),
        ("Asistencia-declarada-octubre-2025/mineduc_asistencia_octubre.csv", "mineduc_asistencia_octubre_2025"),
        ("Asistencia-declarada-Noviembre-2025/mineduc_asistencia_noviembre.csv", "mineduc_asistencia_noviembre_2025"),
        ("Asistencia-declarada-Diciembre-2025/20260107_Asistencia_DICIEMBRE_2025_20260106_WEB.csv", "mineduc_asistencia_diciembre_2025"),
        ("Asistencia-anual-2025/ASISTENCIA_ANUAL_PUBL_2025.csv", "mineduc_asistencia_anual_2025"),
        ("Rendimiento-por-estudiante-2025/mineduc_rendimiento.csv", "mineduc_rendimiento_2025"),
        ("Asistencia-declarada-Abril-2025/Alumnos-SEP-2025/mineduc_sep_prioritarios.csv", "mineduc_sep_prioritarios_2025"),
        ("Directorio-Oficial-Sostenedores-2025/mineduc_sostenedores.csv", "mineduc_sostenedores_2025"),
        ("Egresados-EM-2024/mineduc_egresados_em.csv", "mineduc_egresados_em_2024"),
    ]

    total_loaded = 0
    for csv_rel, table_name in datasets:
        csv_path = BASE / csv_rel
        if csv_path.exists():
            count = load_csv_to_raw(str(csv_path), table_name)
            total_loaded += count
        else:
            print(f"\n  SKIP: {csv_rel} not found")

    print(f"\n{'='*60}")
    print(f"TOTAL: {total_loaded:,} rows loaded into raw schema")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
