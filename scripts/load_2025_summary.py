"""
Carga datos 2025 a PostgreSQL como resúmenes por RBD.
No carga las 6.8M filas individuales - agrega por establecimiento.
"""
import os, sys
import pandas as pd
from sqlalchemy import create_engine, text
from pathlib import Path

DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:Bremen#229@localhost:5432/radar_edu_dev")
BASE = Path(__file__).parent.parent / "data" / "raw" / "bbdd_2025"

engine = create_engine(DB_URL)

def load_asistencia_2025():
    """Carga asistencia mensual 2025 agregada por RBD."""
    meses = {
        'Marzo': 3, 'Abril': 4, 'Mayo': 5, 'Junio': 6, 'Julio': 7,
        'Agosto': 8, 'septiembre': 9, 'octubre': 10, 'Noviembre': 11, 'Diciembre': 12,
    }

    all_frames = []
    for mes_name, mes_num in meses.items():
        folder = BASE / f"Asistencia-declarada-{mes_name}-2025"
        csv_files = list(folder.glob("*.csv")) if folder.exists() else []
        if not csv_files:
            print(f"  [SKIP] No CSV para {mes_name}")
            continue

        csv_path = csv_files[0]
        print(f"  Leyendo {mes_name} ({csv_path.name})...")

        try:
            df = pd.read_csv(csv_path, sep=';', encoding='utf-8-sig',
                           usecols=['AGNO','MES_ESCOLAR','RBD','NOM_RBD','NOMBRE_SLEP',
                                   'COD_COM_RBD','NOM_COM_RBD','DIAS_ASISTIDOS','DIAS_TRABAJADOS'],
                           dtype={'RBD': 'Int64'}, low_memory=False)
        except Exception as e:
            print(f"  [ERROR] {mes_name}: {e}")
            continue

        # Agregar por RBD
        agg = df.groupby(['AGNO','RBD','NOM_RBD','NOMBRE_SLEP','COD_COM_RBD','NOM_COM_RBD']).agg(
            total_alumnos=('DIAS_ASISTIDOS', 'count'),
            sum_dias_asistidos=('DIAS_ASISTIDOS', 'sum'),
            sum_dias_trabajados=('DIAS_TRABAJADOS', 'sum'),
        ).reset_index()

        agg['mes'] = mes_num
        agg['pct_asistencia'] = (agg['sum_dias_asistidos'] / agg['sum_dias_trabajados'].replace(0, 1) * 100).round(1)
        all_frames.append(agg)
        print(f"  {mes_name}: {len(agg)} establecimientos, {len(df)} alumnos")

    if all_frames:
        result = pd.concat(all_frames, ignore_index=True)
        result.columns = [c.lower() for c in result.columns]
        result.to_sql('asistencia_2025_rbd', engine, if_exists='replace', index=False)
        print(f"\n=> asistencia_2025_rbd: {len(result)} filas cargadas")
        return len(result)
    return 0


def load_matricula_2025():
    """Carga matrícula 2025 agregada por RBD."""
    folder = BASE / "Matricula-por-estudiante-2025"
    csv_files = list(folder.glob("*.csv")) if folder.exists() else []
    if not csv_files:
        print("  [SKIP] No CSV de matrícula")
        return 0

    print(f"  Leyendo matrícula ({csv_files[0].name})...")
    df = pd.read_csv(csv_files[0], sep=';', encoding='utf-8-sig',
                    usecols=['AGNO','RBD','NOM_RBD','NOMBRE_SLEP','COD_COM_RBD','NOM_COM_RBD',
                            'GEN_ALU','COD_ENSE','MRUN'],
                    dtype={'RBD': 'Int64'}, low_memory=False)

    agg = df.groupby(['AGNO','RBD','NOM_RBD','NOMBRE_SLEP','COD_COM_RBD','NOM_COM_RBD']).agg(
        matricula_total=('MRUN', 'nunique'),
        total_hombres=('GEN_ALU', lambda x: (x == 1).sum()),
        total_mujeres=('GEN_ALU', lambda x: (x == 2).sum()),
    ).reset_index()

    agg.columns = [c.lower() for c in agg.columns]
    agg.to_sql('matricula_2025_rbd', engine, if_exists='replace', index=False)
    print(f"\n=> matricula_2025_rbd: {len(agg)} filas ({df.MRUN.nunique()} alumnos únicos)")
    return len(agg)


def load_rendimiento_2025():
    """Carga rendimiento 2025 si existe."""
    folder = BASE / "Rendimiento-por-estudiante-2025"
    csv_files = list(folder.glob("*.csv")) if folder.exists() else []
    if not csv_files:
        print("  [SKIP] No CSV de rendimiento 2025")
        return 0

    print(f"  Leyendo rendimiento ({csv_files[0].name})...")
    try:
        df = pd.read_csv(csv_files[0], sep=';', encoding='utf-8-sig', low_memory=False)
        print(f"  Columnas: {list(df.columns[:15])}")
        # Guardar raw - es más pequeño que asistencia
        df.columns = [c.lower() for c in df.columns]
        if len(df) < 500000:  # solo si es manejable
            df.to_sql('rendimiento_2025_raw', engine, if_exists='replace', index=False)
            print(f"\n=> rendimiento_2025_raw: {len(df)} filas")
        else:
            # Agregar por RBD si es muy grande
            cols_group = [c for c in ['agno','rbd','nom_rbd','nombre_slep'] if c in df.columns]
            agg = df.groupby(cols_group).size().reset_index(name='total_alumnos')
            agg.to_sql('rendimiento_2025_rbd', engine, if_exists='replace', index=False)
            print(f"\n=> rendimiento_2025_rbd: {len(agg)} filas (agregado)")
        return len(df)
    except Exception as e:
        print(f"  [ERROR] rendimiento: {e}")
        return 0


def load_directorio_2025():
    """Carga directorio de establecimientos 2025."""
    folder = BASE / "Directorio-Oficial-EE-2025"
    csv_files = list(folder.glob("*.csv")) if folder.exists() else []
    if not csv_files:
        print("  [SKIP] No CSV de directorio 2025")
        return 0

    print(f"  Leyendo directorio ({csv_files[0].name})...")
    df = pd.read_csv(csv_files[0], sep=';', encoding='utf-8-sig', low_memory=False)
    df.columns = [c.lower() for c in df.columns]
    df.to_sql('directorio_2025', engine, if_exists='replace', index=False)
    print(f"\n=> directorio_2025: {len(df)} filas")
    return len(df)


if __name__ == '__main__':
    print("=" * 60)
    print("CARGA DE DATOS 2025 - Radar Educativo")
    print("=" * 60)

    total = 0

    print("\n[1/4] Directorio 2025...")
    total += load_directorio_2025()

    print("\n[2/4] Matrícula 2025...")
    total += load_matricula_2025()

    print("\n[3/4] Asistencia mensual 2025...")
    total += load_asistencia_2025()

    print("\n[4/4] Rendimiento 2025...")
    total += load_rendimiento_2025()

    print(f"\n{'=' * 60}")
    print(f"TOTAL: {total:,} filas cargadas")
    print("=" * 60)
