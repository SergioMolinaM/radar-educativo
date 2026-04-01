import pytest
import pandas as pd
import yaml
from services.metadata_service import MetadataService

@pytest.fixture
def mock_config(tmp_path):
    # Crear un schema_rules.yaml de prueba
    rules_path = tmp_path / "schema_rules.yaml"
    rules = {
        "requires_mapping": ["mineduc"],
        "analytics_targets": {
            "mineduc_directorio": "dim_establecimiento"
        }
    }
    with open(rules_path, 'w', encoding='utf-8') as f:
        yaml.dump(rules, f)
    
    # Crear un master_catalog.csv de prueba
    catalog_path = tmp_path / "master_catalog.csv"
    catalog_df = pd.DataFrame([
        {
            "dataset_name": "mineduc_directorio_2024", 
            "source_institution": "Mineduc", 
            "time_coverage": "2024"
        }
    ])
    catalog_df.to_csv(catalog_path, index=False)
    
    return catalog_path, rules_path

def test_get_dataset_metadata(mock_config):
    """Verifica que get_dataset_metadata devuelva la metadata del catálogo."""
    cat_p, rules_p = mock_config
    service = MetadataService(catalog_path=cat_p, rules_path=rules_p)
    
    meta = service.get_dataset_metadata("mineduc_directorio_2024")
    assert meta["source_institution"] == "Mineduc"
    assert str(meta["time_coverage"]) == "2024"

def test_get_analytics_target_for_directorio(mock_config):
    """Verifica que resuelva dim_establecimiento para el directorio."""
    cat_p, rules_p = mock_config
    service = MetadataService(catalog_path=cat_p, rules_path=rules_p)
    
    # Por regla de negocio configurada
    target = service.get_analytics_target("mineduc_directorio")
    assert target == "dim_establecimiento"

def test_requires_mapping_rules(mock_config):
    """Verifica que responda correctamente según las reglas configuradas."""
    cat_p, rules_p = mock_config
    service = MetadataService(catalog_path=cat_p, rules_path=rules_p)
    
    assert service.requires_mapping("mineduc_any_dataset") is True
    assert service.requires_mapping("other_source_dataset") is False

def test_get_staging_target_derivation(mock_config):
    """Verifica que derive bien stg_ desde analytics."""
    cat_p, rules_p = mock_config
    service = MetadataService(catalog_path=cat_p, rules_path=rules_p)
    
    # dim_establecimiento -> stg_establecimiento
    stg = service.get_staging_target("mineduc_directorio")
    assert stg == "stg_establecimiento"
