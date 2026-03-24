.PHONY: install test lint format clean help

help:
	@echo "Radar Data Platform - Available commands:"
	@echo "  install   Install dependencies"
	@echo "  test      Run tests"
	@echo "  lint      Run linting"
	@echo "  format    Format code"
	@echo "  clean     Clean temporary files"

install:
	pip install -e ".[dev]"

test:
	pytest tests/

lint:
	flake8 agents/ scripts/ tests/
	mypy agents/ scripts/

format:
	black agents/ scripts/ tests/
	isort agents/ scripts/ tests/

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	rm -rf build/ dist/ *.egg-info .pytest_cache .mypy_cache
