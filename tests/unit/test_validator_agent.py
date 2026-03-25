import pytest
import pandas as pd
import yaml
from agents.validator_agent import ValidatorAgent, ValidationError

@pytest.fixture
def mock_rules(tmp_path):
    rules_p = tmp_path / "schema_rules.yaml"
    rules = {
        "standard_fields": {
            "rbd": {"critical": True},
            "nombre": {"critical": True}
        }
    }
    with open(rules_p, "w", encoding="utf-8") as f:
        yaml.dump(rules, f)
    return rules_p

@pytest.fixture
def io_service_with_metadata(tmp_path):
    io = IOService(root_path=tmp_path)
    csv_path = tmp_path / "data" / "raw" / "test.csv"
    # El IOService ya crea los directorios en __init__
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    with open(csv_path, "w") as f:
        f.write("col1,col2\n1,2")

    metadata_path = tmp_path / "data" / "metadata" / "mineduc_directorio_2024.yaml"
    metadata_path.parent.mkdir(parents=True, exist_ok=True)
    metadata_content = {
        "source_institution": "Mineduc",
        "time_coverage": 2024
    }
    with open(metadata_path, "w", encoding="utf-8") as f:
        yaml.dump(metadata_content, f)
    return io

def test_validate_missing_critical_column(mock_rules):
    """Valida que falle si falta una columna obligatoria."""
    df = pd.DataFrame({"rbd": [1, 2]}) # Falta 'nombre'
    validator = ValidatorAgent(rules_path=mock_rules)
    
    with pytest.raises(ValidationError, match="rechazado por fallas críticas"):
        validator.validate(df, "test_dataset")

def test_validate_critical_rule_break(mock_rules):
    """
    Valida que falle si se rompe una regla crítica.
    Nota: Actualmente el agente tiene un umbral hardcodeado de 5% para nulos.
    """
    # Agregar regla de nulos al mock
    with open(mock_rules, "w", encoding="utf-8") as f:
        yaml.dump({
            "standard_fields": {"rbd": {}, "nombre": {}},
            "validation_rules": {"check_nulls": ["rbd"]}
        }, f)
        
    # 10 filas, 1 nulo = 10% (supera el 5% hardcodeado)
    df = pd.DataFrame({
        "rbd": [1, None, 3, 4, 5, 6, 7, 8, 9, 10],
        "nombre": ["A"] * 10
    })
    
    validator = ValidatorAgent(rules_path=mock_rules)
    with pytest.raises(ValidationError, match="rechazado por fallas críticas"):
        validator.validate(df, "test_dataset")
