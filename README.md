# Radar Data Platform

Professional data platform for radar data processing and analysis.

## Project Structure

- `agents/`: Independent processing agents.
- `catalog/`: Data catalog and metadata.
- `config/`: Configuration files (YAML, JSON, etc.).
- `data/`:
    - `raw/`: Immutable source data.
    - `staging/`: Intermediate data transformations.
    - `processed/`: Final, cleaned data ready for analysis.
- `docs/`: Project documentation.
- `logs/`: Application and processing logs.
- `scripts/`: Utility scripts for automation.
- `sql/`: SQL migrations and queries.
- `tests/`: Unit and integration tests.

## Setup

1. Clone the repository.
2. Create a virtual environment: `python -m venv .venv`.
3. Activate the environment:
   - Windows: `.venv\Scripts\activate`
   - Unix/macOS: `source .venv/bin/activate`
4. Install dependencies: `pip install .` or `make install`.
5. Configure environment: `cp .env.example .env` and edit `.env`.

## Usage

Use the `Makefile` for common tasks:
- `make install`: Install dependencies.
- `make test`: Run tests.
- `make lint`: Run code linting.

## Core Dataset Roadmap (Prioridad de Integración)

El desarrollo del paquete núcleo inicial seguirá este orden estricto de precedencia (identidad antes que volumen):

1.  **Directorio de Establecimientos** (Identidad Base)
2.  **Directorio de Sostenedores** (Identidad Administrativa)
3.  **Matrícula** (Volumen de Demanda)
4.  **Asistencia** (Continuidad de Proceso)
5.  **Dotación** (Capacidad Instalada)
6.  **SEP / Prioritarios / Preferentes** (Segmentación Crítica)
7.  **Simce** (Resultados de Calidad)
8.  **IDPS** (Indicadores de Desarrollo Social)

*Nota: No se alterará este orden salvo inaccesibilidad crítica de la fuente.*
