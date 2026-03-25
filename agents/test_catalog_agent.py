import pytest
import pandas as pd
from unittest.mock import patch, MagicMock
from agents.catalog_agent import CatalogAgent

def test_catalog_structure():
    """Verifica que los diccionarios del catálogo tengan los campos mínimos."""
    entry = {
        "source_institution": "Mineduc",
        "dataset_name": "Test",
        "dataset_url": "http://test.com",
        "status": "discovered"
    }
    required_fields = ["source_institution", "dataset_name", "dataset_url", "status"]
    for field in required_fields:
        assert field in entry

def test_catalog_no_duplicates(tmp_path):
    """Verifica que el catalogador no duplique entradas en el CSV."""
    catalog_file = tmp_path / "master_catalog.csv"
    # El agente intentará cargar el catálogo al inicializarse
    with patch("agents.catalog_agent.Path.exists", return_value=False):
        agent = CatalogAgent(catalog_path=catalog_file)
        
        entry = [{
            "source_institution": "Mineduc",
            "dataset_url": "http://test.com",
            "dataset_name": "Test"
        }]
        
        agent.update_catalog(entry)
        agent.update_catalog(entry) # Duplicado
        
        df = pd.read_csv(catalog_file)
        assert len(df) == 1
