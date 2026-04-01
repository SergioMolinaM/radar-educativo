"""
Load SIMCE and Rendimiento data into PostgreSQL.
Creates staging tables with normalized structure.

Data sources and disclosure:
- SIMCE 2024 (4B, 6B, 2M): Resultados PRELIMINARES, Agencia de Calidad de la Educación
- SIMCE 2023 (4B): Resultados FINALES versión pública, Agencia de Calidad de la Educación
- SIMCE 2022 (4B, 2M): Resultados FINALES, Agencia de Calidad de la Educación
- Rendimiento 2023-2024: Resumen por establecimiento, MINEDUC Datos Abiertos

IMPORTANT: 2024 SIMCE data is PRELIMINARY and may change.
"""
import os
import sys
import pandas as pd
import psycopg
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DATABASE_URL")
BASE = os.path.join(os.path.dirname(__file__), "..", "..", "data", "raw", "mineduc", "extracted")


def load_simce():
    """Load all SIMCE files into a unified staging table."""
    simce_files = [
        ("simce4b2024_rbd_preliminar.csv", "4B", 2024, "preliminar"),
        ("simce6b2024_rbd_preliminar.csv", "6B", 2024, "preliminar"),
        ("simce2m2024_rbd_preliminar.csv", "2M", 2024, "preliminar"),
        ("simce4b2023_rbd_público_final.csv", "4B", 2023, "final"),
        ("simce4b2022_rbd_final.csv", "4B", 2022, "final"),
        ("simce2m2022_rbd_final.csv", "2M", 2022, "final"),
    ]

    all_rows = []
    for filename, nivel, anio, estado in simce_files:
        path = os.path.join(BASE, filename)
        if not os.path.exists(path):
            # Try with different encoding in filename
            alt = filename.replace("ú", "u")
            path = os.path.join(BASE, alt)
            if not os.path.exists(path):
                print(f"  SKIP: {filename} not found")
                continue

        df = pd.read_csv(path, sep=";", encoding="latin-1", low_memory=False)
        print(f"  {filename}: {len(df)} rows, {len(df.columns)} cols")

        # Normalize column names: find prom_lect and prom_mate
        lect_col = [c for c in df.columns if c.startswith("prom_lect")]
        mate_col = [c for c in df.columns if c.startswith("prom_mate")]

        if not lect_col or not mate_col:
            print(f"    WARNING: Could not find score columns")
            continue

        for _, row in df.iterrows():
            rbd = row.get("rbd")
            if pd.isna(rbd):
                continue

            prom_lect = row.get(lect_col[0])
            prom_mate = row.get(mate_col[0])

            # Convert to float, handle non-numeric
            try:
                prom_lect = float(str(prom_lect).replace(",", ".")) if pd.notna(prom_lect) else None
            except (ValueError, TypeError):
                prom_lect = None
            try:
                prom_mate = float(str(prom_mate).replace(",", ".")) if pd.notna(prom_mate) else None
            except (ValueError, TypeError):
                prom_mate = None

            all_rows.append({
                "rbd": int(rbd),
                "anio": anio,
                "nivel": nivel,
                "estado_resultado": estado,
                "prom_lectura": prom_lect,
                "prom_matematica": prom_mate,
                "nom_rbd": row.get("nom_rbd", ""),
                "cod_com_rbd": row.get("cod_com_rbd"),
                "cod_reg_rbd": row.get("cod_reg_rbd"),
                "cod_depe2": row.get("cod_depe2"),
                "cod_grupo": row.get("cod_grupo"),
            })

    print(f"\n  Total SIMCE rows to load: {len(all_rows)}")

    # Create table and load
    conn = psycopg.connect(DB_URL, autocommit=True)
    cur = conn.cursor()

    cur.execute("CREATE SCHEMA IF NOT EXISTS staging")
    cur.execute("DROP TABLE IF EXISTS staging.stg_simce CASCADE")
    cur.execute("""
        CREATE TABLE staging.stg_simce (
            rbd INTEGER,
            anio INTEGER,
            nivel VARCHAR(10),
            estado_resultado VARCHAR(20),
            prom_lectura NUMERIC(6,1),
            prom_matematica NUMERIC(6,1),
            nom_rbd VARCHAR(255),
            cod_com_rbd VARCHAR(20),
            cod_reg_rbd VARCHAR(10),
            cod_depe2 VARCHAR(10),
            cod_grupo VARCHAR(10),
            loaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Bulk insert
    with cur.copy("COPY staging.stg_simce (rbd, anio, nivel, estado_resultado, prom_lectura, prom_matematica, nom_rbd, cod_com_rbd, cod_reg_rbd, cod_depe2, cod_grupo) FROM STDIN") as copy:
        for r in all_rows:
            copy.write_row((
                r["rbd"], r["anio"], r["nivel"], r["estado_resultado"],
                r["prom_lectura"], r["prom_matematica"],
                str(r["nom_rbd"])[:255], str(r.get("cod_com_rbd") or ""),
                str(r.get("cod_reg_rbd") or ""), str(r.get("cod_depe2") or ""),
                str(r.get("cod_grupo") or ""),
            ))

    cur.execute("SELECT COUNT(*) FROM staging.stg_simce")
    print(f"  Loaded: {cur.fetchone()[0]} rows into staging.stg_simce")

    # Create analytics view
    cur.execute("DROP TABLE IF EXISTS analytics.fact_simce CASCADE")
    cur.execute("""
        CREATE TABLE analytics.fact_simce AS
        SELECT * FROM staging.stg_simce
    """)
    cur.execute("CREATE INDEX idx_fact_simce_rbd ON analytics.fact_simce(rbd)")
    cur.execute("CREATE INDEX idx_fact_simce_anio ON analytics.fact_simce(anio)")
    print("  Created analytics.fact_simce with indexes")

    conn.close()


def load_rendimiento():
    """Load rendimiento (academic performance) data."""
    files = [
        ("20240223_Resumen_Rendimiento 2023_20240131.csv", 2023),
        ("20250311_Resumen_Rendimiento 2024_20250131.csv", 2024),
    ]

    all_rows = []
    for filename, anio in files:
        path = os.path.join(BASE, filename)
        if not os.path.exists(path):
            # Try parent dir
            path = os.path.join(BASE, "..", filename)
        if not os.path.exists(path):
            print(f"  SKIP: {filename}")
            continue

        df = pd.read_csv(path, sep=";", encoding="latin-1", low_memory=False)
        print(f"  {filename}: {len(df)} rows")

        for _, row in df.iterrows():
            rbd = row.get("RBD") or row.get("\ufeffRBD") or row.get(df.columns[1])
            if pd.isna(rbd):
                continue

            def safe_float(v):
                if pd.isna(v):
                    return None
                try:
                    return float(str(v).strip().replace(",", "."))
                except:
                    return None

            def safe_int(v):
                if pd.isna(v):
                    return 0
                try:
                    return int(float(str(v).strip().replace(",", ".")))
                except:
                    return 0

            all_rows.append({
                "rbd": int(rbd),
                "anio": anio,
                "nom_rbd": str(row.get("NOM_RBD", ""))[:255],
                "cod_com_rbd": str(row.get("COD_COM_RBD", "")),
                "aprobados_hom": safe_int(row.get("APR_HOM_TO")),
                "aprobados_muj": safe_int(row.get("APR_MUJ_TO")),
                "reprobados_hom": safe_int(row.get("REP_HOM_TO")),
                "reprobados_muj": safe_int(row.get("REP_MUJ_TO")),
                "retirados_hom": safe_int(row.get("RET_HOM_TO")),
                "retirados_muj": safe_int(row.get("RET_MUJ_TO")),
                "prom_asistencia": safe_float(row.get("PROM_ASIS")),
            })

    print(f"\n  Total rendimiento rows: {len(all_rows)}")

    conn = psycopg.connect(DB_URL, autocommit=True)
    cur = conn.cursor()

    cur.execute("DROP TABLE IF EXISTS staging.stg_rendimiento CASCADE")
    cur.execute("""
        CREATE TABLE staging.stg_rendimiento (
            rbd INTEGER,
            anio INTEGER,
            nom_rbd VARCHAR(255),
            cod_com_rbd VARCHAR(20),
            aprobados_hom INTEGER,
            aprobados_muj INTEGER,
            reprobados_hom INTEGER,
            reprobados_muj INTEGER,
            retirados_hom INTEGER,
            retirados_muj INTEGER,
            prom_asistencia NUMERIC(6,2),
            loaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    with cur.copy("COPY staging.stg_rendimiento (rbd, anio, nom_rbd, cod_com_rbd, aprobados_hom, aprobados_muj, reprobados_hom, reprobados_muj, retirados_hom, retirados_muj, prom_asistencia) FROM STDIN") as copy:
        for r in all_rows:
            copy.write_row((
                r["rbd"], r["anio"], r["nom_rbd"], r["cod_com_rbd"],
                r["aprobados_hom"], r["aprobados_muj"],
                r["reprobados_hom"], r["reprobados_muj"],
                r["retirados_hom"], r["retirados_muj"],
                r["prom_asistencia"],
            ))

    cur.execute("SELECT COUNT(*) FROM staging.stg_rendimiento")
    print(f"  Loaded: {cur.fetchone()[0]} rows into staging.stg_rendimiento")

    cur.execute("DROP TABLE IF EXISTS analytics.fact_rendimiento CASCADE")
    cur.execute("CREATE TABLE analytics.fact_rendimiento AS SELECT * FROM staging.stg_rendimiento")
    cur.execute("CREATE INDEX idx_fact_rendimiento_rbd ON analytics.fact_rendimiento(rbd)")
    print("  Created analytics.fact_rendimiento with indexes")

    conn.close()


if __name__ == "__main__":
    print("=" * 60)
    print("LOADING SIMCE DATA")
    print("=" * 60)
    load_simce()

    print()
    print("=" * 60)
    print("LOADING RENDIMIENTO DATA")
    print("=" * 60)
    load_rendimiento()

    print()
    print("Done. Tables created:")
    print("  - staging.stg_simce / analytics.fact_simce")
    print("  - staging.stg_rendimiento / analytics.fact_rendimiento")
