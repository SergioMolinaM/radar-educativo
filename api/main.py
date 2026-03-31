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


@app.post("/admin/assign-los-parques")
def assign_los_parques(secret: str = ""):
    """Assign Los Parques SLEP to Quinta Normal/Renca DAEM schools."""
    if secret != os.getenv("MIGRATE_SECRET", "radar-migrate-2026"):
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Forbidden")

    from api.db.connection import get_cursor
    rbds = "8508,8564,9985,9986,9987,9991,9992,9993,9994,9995,9996,9998,9999,10000,10001,10005,10006,10012,10197,10200,10201,10202,10204,10205,10207,10210,10212,10216,11831,12113,12243,12273,31037,31153"
    ok, errors = 0, []
    with get_cursor() as cur:
        for table in ["asistencia_2025_rbd", "matricula_2025_rbd", "rendimiento_2025_detalle", "rendimiento_2025_rbd"]:
            try:
                cur.execute(f"UPDATE {table} SET nombre_slep = 'LOS PARQUES' WHERE rbd IN ({rbds}) AND (nombre_slep IS NULL OR nombre_slep = '' OR nombre_slep = ' ')")
                ok += 1
            except Exception as e:
                errors.append(str(e)[:80])
    return {"ok": ok, "errors": errors}


@app.post("/admin/migrate-new-tables")
def migrate_new_tables(secret: str = ""):
    """Load parvularia + SIMCE 2024 tables into Render DB."""
    if secret != os.getenv("MIGRATE_SECRET", "radar-migrate-2026"):
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Forbidden")

    from api.db.connection import get_cursor
    import pathlib
    sql_file = pathlib.Path(__file__).parent / "scripts" / "new_tables_sync.sql"
    if not sql_file.exists():
        return {"error": "SQL file not found"}

    content = sql_file.read_text(encoding="utf-8")
    stmts = [s.strip() for s in content.split(";") if s.strip() and not s.strip().startswith("--")]

    ok, errs = 0, 0
    with get_cursor() as cur:
        for stmt in stmts:
            try:
                cur.execute(stmt)
                ok += 1
            except Exception:
                errs += 1
    return {"ok": ok, "errors": errs, "total": len(stmts)}


def _get_pal_migration_sql():
    """Return list of SQL statements for PAL data migration."""
    import pathlib
    # Try multiple paths (local dev vs Render)
    base = pathlib.Path(__file__).parent.parent
    sql_file = base / "scripts" / "pal_sync_render.sql"
    if not sql_file.exists():
        sql_file = base / "api" / "scripts" / "pal_sync_render.sql"
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
