"""Sync PAL data from local DB to Render DB.
Usage: RENDER_DB_URL=xxx python api/scripts/sync_pal_to_render.py
"""
import psycopg
import os
from dotenv import load_dotenv

load_dotenv()

LOCAL_URL = "postgresql://postgres:Bremen#229@localhost:5432/radar_edu_dev"
RENDER_URL = os.getenv("RENDER_DB_URL", "")

if not RENDER_URL:
    print("Set RENDER_DB_URL env var with the external connection string from Render Dashboard")
    print("Example: RENDER_DB_URL='postgresql://user:pass@host/db?sslmode=require' python api/scripts/sync_pal_to_render.py")
    exit(1)

# Ensure SSL
if 'sslmode' not in RENDER_URL:
    RENDER_URL += '?sslmode=require' if '?' not in RENDER_URL else '&sslmode=require'

def sync():
    # Read SQL file
    with open('scripts/pal_sync_render.sql', 'r', encoding='utf-8') as f:
        sql = f.read()

    # Execute on Render
    conn = psycopg.connect(RENDER_URL, autocommit=True)
    cur = conn.cursor()

    statements = [s.strip() for s in sql.split(';') if s.strip()]
    ok = 0
    err = 0
    for stmt in statements:
        try:
            cur.execute(stmt)
            ok += 1
        except Exception as e:
            print(f"ERROR: {str(e)[:100]}")
            print(f"  SQL: {stmt[:80]}...")
            err += 1

    cur.close()
    conn.close()
    print(f"Sync complete: {ok} OK, {err} errors")

if __name__ == "__main__":
    sync()
