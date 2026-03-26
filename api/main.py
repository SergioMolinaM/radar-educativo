"""
Radar Educativo - API Server
FastAPI backend for SLEP education management platform.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import auth, dashboard, alerts, establishments, financial, exports, compare, sleps, slep_detail, pal, pedagogico

app = FastAPI(
    title="Radar Educativo API",
    description="Plataforma de gestión educativa, financiera y operativa para SLEPs",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "radar-educativo"}


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
