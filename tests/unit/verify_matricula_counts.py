from dotenv import load_dotenv
import os
import psycopg

load_dotenv()

tables = [
    ("raw", "mineduc_matricula"),
    ("staging", "fact_matricula"), # Note: based on previous run output, it's fact_matricula in staging too
    ("analytics", "fact_matricula"),
]

conn = psycopg.connect(os.getenv("DATABASE_URL"))
cur = conn.cursor()

print("Verificando conteos de filas para mineduc_matricula:")
for schema, table in tables:
    try:
        cur.execute(f"SELECT COUNT(*) FROM {schema}.{table}")
        count = cur.fetchone()[0]
        print(f"{schema}.{table}: {count:,} filas")
    except Exception as e:
        print(f"Error al consultar {schema}.{table}: {e}")
        conn.rollback() # Recover from error in case table doesnt exist

cur.close()
conn.close()
