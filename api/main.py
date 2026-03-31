"""
Radar Educativo - API Server
FastAPI backend for SLEP education management platform.
"""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import auth, dashboard, alerts, establishments, financial, exports, compare, sleps, slep_detail, pal, pedagogico, compromisos

app = FastAPI(
    title="Radar Educativo API",
    description="Plataforma de gestión educativa, financiera y operativa para SLEPs",
    version="0.1.0",
)

CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5176",
    "http://localhost:3000",
]
if os.getenv("NETLIFY_URL"):
    CORS_ORIGINS.append(os.getenv("NETLIFY_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.netlify\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "radar-educativo"}


@app.post("/admin/migrate-pal")
def migrate_pal(secret: str = ""):
    """One-time PAL data migration endpoint. Remove after use."""
    if secret != os.getenv("MIGRATE_SECRET", "radar-migrate-2026"):
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Forbidden")

    from api.db.connection import get_cursor
    sql_statements = _get_pal_migration_sql()
    ok, errors = 0, []
    with get_cursor() as cur:
        for stmt in sql_statements:
            try:
                cur.execute(stmt)
                ok += 1
            except Exception as e:
                errors.append(f"{str(e)[:80]}: {stmt[:60]}")
    return {"ok": ok, "errors": errors}


def _get_pal_migration_sql():
    """Return list of SQL statements for PAL data migration."""
    import pathlib
    sql_file = pathlib.Path(__file__).parent.parent / "scripts" / "pal_sync_render.sql"
    if sql_file.exists():
        content = sql_file.read_text(encoding="utf-8")
        return [s.strip() for s in content.split(";") if s.strip() and not s.strip().startswith("--")]
    return []


app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(establishments.router, prefix="/api/establishments", tags=["establishments"])
app.include_router(financial.router, prefix="/api/financial", tags=["financial"])
app.include_router(exports.router, prefix="/api/exports", tags=["exports"])
app.include_router(compare.router, prefix="/api/compare", tags=["compare"])
app.include_router(sleps.router, prefix="/api/sleps", tags=["sleps"])
app.include_router(slep_detail.router, prefix="/api/slep", tags=["slep-detail"])
app.include_router(pal.router, prefix="/api/pal", tags=["pal"])
app.include_router(pedagogico.router, prefix="/api/pedagogico", tags=["pedagogico"])
app.include_router(compromisos.router, prefix="/api/compromisos", tags=["compromisos"])
