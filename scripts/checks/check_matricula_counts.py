from dotenv import load_dotenv
import os
import psycopg

load_dotenv()

tables = [
    ("raw", "mineduc_matricula"),
    ("staging", "fact_matricula"),
    ("analytics", "fact_matricula"),
]

conn = psycopg.connect(os.getenv("DATABASE_URL"))
cur = conn.cursor()

for schema, table in tables:
    cur.execute(f"SELECT COUNT(*) FROM {schema}.{table}")
    count = cur.fetchone()[0]
    print(f"{schema}.{table}: {count}")

cur.close()
conn.close()