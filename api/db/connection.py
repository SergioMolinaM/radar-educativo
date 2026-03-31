"""Database connection manager for Radar Educativo API."""
import os
from contextlib import contextmanager

import psycopg
from dotenv import load_dotenv

load_dotenv()

# Render usa postgres:// pero psycopg3 necesita postgresql://
_raw_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/radar_edu_dev")
DATABASE_URL = _raw_url.replace("postgres://", "postgresql://", 1) if _raw_url.startswith("postgres://") else _raw_url


def get_connection():
    """Get a new database connection."""
    return psycopg.connect(DATABASE_URL, autocommit=True)


@contextmanager
def get_cursor():
    """Context manager that yields a cursor and handles cleanup."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            yield cur
    finally:
        conn.close()


def query_all(sql: str, params: tuple = None) -> list[dict]:
    """Execute a query and return all rows as list of dicts."""
    with get_cursor() as cur:
        cur.execute(sql, params)
        if cur.description is None:
            return []
        columns = [desc[0] for desc in cur.description]
        return [dict(zip(columns, row)) for row in cur.fetchall()]


def query_one(sql: str, params: tuple = None) -> dict | None:
    """Execute a query and return a single row as dict."""
    with get_cursor() as cur:
        cur.execute(sql, params)
        if cur.description is None:
            return None
        columns = [desc[0] for desc in cur.description]
        row = cur.fetchone()
        return dict(zip(columns, row)) if row else None


def check_table_exists(schema: str, table: str) -> bool:
    """Check if a table exists in the given schema."""
    result = query_one(
        "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema=%s AND table_name=%s)",
        (schema, table),
    )
    return result.get("exists", False) if result else False
