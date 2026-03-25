# Radar Educativo

Plataforma de gestion educativa, financiera y operativa para Servicios Locales de Educacion Publica (SLEPs).

## Que hace

- **Alertas tempranas**: semaforos rojo/naranja/verde por establecimiento basados en asistencia, matricula, dotacion y ejecucion presupuestaria
- **Monitoreo financiero**: seguimiento de ejecucion presupuestaria e integracion con Mercado Publico
- **Datos integrados**: pipeline automatizado que consolida datos de Mineduc, Mercado Publico, Transparencia y PAL
- **Dashboard operativo**: vision unificada para directores SLEP con indicadores accionables

## Arquitectura

```
web/          React + Vite (dashboard SPA)
api/          FastAPI + Python (backend, pipeline de datos, alertas)
database/     PostgreSQL schemas, views, marts
infra/        Docker, nginx, CI/CD
```

## Inicio rapido

```bash
# 1. Clonar y configurar
cp .env.example .env
# Editar .env con tus credenciales

# 2. Levantar con Docker
cd infra
docker compose up -d

# 3. Verificar
curl http://localhost:8000/health
# Frontend en http://localhost:3000
```

## Desarrollo local (sin Docker)

```bash
# Backend
pip install -e ".[dev]"
pip install fastapi uvicorn[standard]
uvicorn api.main:app --reload

# Frontend
cd web
npm install
npm run dev
```

## Pipeline de datos

```bash
# CLI para operaciones de datos
python api/cli.py catalog          # Descubrir datasets disponibles
python api/cli.py profile <id>     # Perfilar estructura de un dataset
python api/cli.py validate <id>    # Validar calidad
python api/cli.py load <id>        # Cargar a base de datos (raw->staging->analytics)
```

## Estructura de datos

```
raw/        -> Datos originales sin modificar
staging/    -> Datos limpiados y normalizados
analytics/  -> Modelos dimensionales listos para consulta
```

Dimensiones: `dim_establecimiento`, `dim_sostenedor`
Hechos: `fact_matricula`, `fact_asistencia`, `fact_sep_prioritarios`
Vista: `vh_radar_integral` (vista tridimensional integrada)

## Tests

```bash
pytest tests/
```

## Licencia

Propietario - Tercera Letra SpA
