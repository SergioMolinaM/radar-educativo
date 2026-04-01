.PHONY: install test lint format clean help dev api web docker-up docker-down

help:
	@echo "Radar Educativo - Comandos disponibles:"
	@echo ""
	@echo "  Desarrollo:"
	@echo "    make dev        Levantar API + Frontend (necesita 2 terminales)"
	@echo "    make api        Levantar solo la API (puerto 8000)"
	@echo "    make web        Levantar solo el frontend (puerto 5173)"
	@echo ""
	@echo "  Docker:"
	@echo "    make docker-up  Levantar todo con Docker"
	@echo "    make docker-down Detener Docker"
	@echo ""
	@echo "  Calidad:"
	@echo "    make install    Instalar dependencias"
	@echo "    make test       Ejecutar tests"
	@echo "    make lint       Ejecutar linting"
	@echo "    make format     Formatear codigo"

install:
	pip install -e ".[dev]"
	pip install fastapi uvicorn[standard] python-multipart
	cd web && npm install

api:
	uvicorn api.main:app --reload --host 0.0.0.0 --port 8000

web:
	cd web && npm run dev

test:
	pytest tests/

lint:
	flake8 api/ services/ agents/
	cd web && npm run lint

format:
	black api/ services/ agents/ tests/
	isort api/ services/ agents/ tests/

docker-up:
	cd infra && docker compose up -d --build

docker-down:
	cd infra && docker compose down

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	rm -rf build/ dist/ *.egg-info .pytest_cache .mypy_cache web/dist
