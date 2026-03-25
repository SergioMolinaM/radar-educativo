import pytest
from unittest.mock import MagicMock, patch
from services.pipeline_service import PipelineService

@pytest.fixture
def pipeline():
    return PipelineService()

def test_run_profile_contract(pipeline):
    """
    Valida el contrato de run_profile:
    - Debe retornar dict con dataset_id, rows, cols y status.
    - Debe invocar al ProfileAgent correctamente.
    """
    with patch.object(pipeline.io, "get_raw_csv_path") as mock_path, \
         patch.object(pipeline.io, "read_csv_standardized") as mock_read, \
         patch("services.pipeline_service.ProfileAgent") as MockAgent:
        
        mock_path.return_value = "mock.csv"
        mock_read.return_value = MagicMock()
        
        instance = MockAgent.return_value
        instance.profile.return_value = {
            "dataset_id": "test_ds",
            "row_count": 100,
            "column_count": 5
        }
        
        result = pipeline.run_profile("test_ds")
        
        assert result["dataset_id"] == "test_ds"
        assert result["rows"] == 100
        assert result["cols"] == 5
        assert result["status"] == "success"
        assert "report_path" in result

def test_run_document_metadata_hard_stop(pipeline):
    """
    Valida el Hard Stop de run_document:
    - Debe fallar si la metadata indica institution 'Unknown' o 'Provisional'.
    """
    with patch.object(pipeline.metadata, "get_dataset_metadata") as mock_meta, \
         patch.object(pipeline.io, "get_profile_report_path"), \
         patch.object(pipeline.io, "load_json"):
        
        # Caso 1: Unknown
        mock_meta.return_value = {"source_institution": "Unknown"}
        with pytest.raises(ValueError, match="Metadata insuficiente"):
            pipeline.run_document("test_ds")
            
        # Caso 2: Provisional
        mock_meta.return_value = {"source_institution": "Provisional"}
        with pytest.raises(ValueError, match="Metadata insuficiente"):
            pipeline.run_document("test_ds")

def test_run_load_mapping_gate(pipeline):
    """
    Valida el gate de mapping en run_load:
    - Si el dataset requiere mapping y el service devuelve vacío, debe fallar.
    """
    with patch.object(pipeline.metadata, "requires_mapping", return_value=True), \
         patch.object(pipeline.metadata, "get_mappings", return_value={}), \
         patch.object(pipeline.io, "get_raw_csv_path"), \
         patch.object(pipeline.io, "read_csv_standardized"):
        
        with pytest.raises(ValueError, match="requiere mapping explícito"):
            pipeline.run_load("mineduc_test")

def test_run_load_target_gate(pipeline):
    """
    Valida el gate de target en run_load:
    - Si no se resuelve el target de analytics, debe abortar.
    """
    with patch.object(pipeline.metadata, "get_analytics_target", return_value=None), \
         patch.object(pipeline.io, "get_raw_csv_path"), \
         patch.object(pipeline.io, "read_csv_standardized"):
        
        with pytest.raises(ValueError, match="No se pudo resolver el target"):
            pipeline.run_load("any_ds")
