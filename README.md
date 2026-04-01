# Radar Educativo

Plataforma de inteligencia operativa para Servicios Locales de Educacion Publica (SLEPs).
No es un repositorio de datos — es un sistema de alertas, monitoreo y acompanamiento en la toma de decisiones.

## Que hace (y que NO hace IDEA)

- **Alertas tempranas**: semaforos rojo/naranja/verde por establecimiento y por objetivo estrategico
- **Monitoreo PAL**: seguimiento de Plan Anual Local con avance real vs meta, CGE y PME por EE
- **ENEP integrado**: 5 Objetivos Estrategicos nacionales con deteccion automatica de brechas
- **Monitoreo financiero**: ejecucion presupuestaria e integracion con Mercado Publico
- **Dashboard operativo**: vision unificada para directores SLEP con indicadores accionables

IDEA muestra datos. Radar dice cuando actuar.

## Arquitectura

```
web/          React 18 + Vite (dashboard SPA, demo offline)
api/          FastAPI + Python (backend, pipeline de datos, alertas)
database/     PostgreSQL schemas, views, marts
data/         PDFs y datos fuente (excluidos de git)
```

## Inicio rapido

```bash
# Frontend (modo demo, sin backend)
cd web
npm install
npm run dev
# Abre http://localhost:5176 — login con cualquier credencial
```

## Desarrollo con backend

```bash
# Backend
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8002

# Frontend
cd web
npm install
npm run dev
```

## Deploy

- **Frontend**: Netlify (configurado en netlify.toml, base=web)
- **Backend**: Render (configurado en render.yaml)
- El frontend funciona en modo demo cuando el backend no esta disponible

## Datos integrados

### SLEPs con datos reales (PAL 2026)
- **Barrancas**: Pudahuel, Cerro Navia, Lo Prado — 53 EE
- **Los Parques**: Quinta Normal, Renca — 52 EE (datos CGE julio 2025)

### Fuentes
- MINEDUC: matricula, asistencia, SIMCE
- IDEA: ENEP, categorias de desempeno
- PAL oficiales: CGE, PME, indicadores de avance
- Mercado Publico: ordenes de compra, ejecucion presupuestaria

## Tests

```bash
pytest tests/
```

## Licencia

Propietario - Tercera Letra SpA
