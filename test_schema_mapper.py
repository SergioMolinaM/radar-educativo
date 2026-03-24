import pytest
from agents.schema_mapper import SchemaMapper

def test_schema_mapper_canonical_naming():
    """Verifica la traducción de nombres de columnas a términos canónicos."""
    mapper = SchemaMapper()
    # Casos del Directorio Mineduc
    assert mapper.get_canonical_name("RBD") == "rbd"
    assert mapper.get_canonical_name("NOM_ESTAB") == "nombre_establecimiento"
    assert mapper.get_canonical_name("COD_COM_RBD") == "codigo_comuna"
    # Identidad
    assert mapper.get_canonical_name("rbd") == "rbd"
