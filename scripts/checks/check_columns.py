from dotenv import load_dotenv
import os
import psycopg

load_dotenv()

conn = psycopg.connect(os.getenv("DATABASE_URL"))
cur = conn.cursor()

cur.execute("""
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'raw'
  AND table_name = 'mineduc_directorio'
ORDER BY ordinal_position
""")

print([x[0] for x in cur.fetchall()])

cur.close()
conn.close()