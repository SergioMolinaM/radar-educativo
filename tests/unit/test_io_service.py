import pytest
import pandas as pd
from services.io_service import IOService

def test_get_raw_csv_path(tmp_path):
    """Verifica que get_raw_csv_path construya la ruta correcta."""
    io = IOService(root_path=tmp_path)
    path = io.get_raw_csv_path("dataset_test")
    # Nota: Path construction must match IOService's internal structure
    assert path == tmp_path / "data" / "raw" / "dataset_test.csv"

def test_get_profile_report_path(tmp_path):
    """Verifica que get_profile_report_path construya la ruta correcta."""
    io = IOService(root_path=tmp_path)
    path = io.get_profile_report_path("dataset_test")
    assert path == tmp_path / "catalog" / "profile_reports" / "dataset_test_profile.json"

def test_read_csv_standardized_success(tmp_path):
    """Verifica que read_csv_standardized lea un CSV simple correctamente."""
    io = IOService(root_path=tmp_path)
    csv_path = tmp_path / "data" / "raw" / "test.csv"
    # IOService already creates directories
    
    df_orig = pd.DataFrame({"col1": [1, 2], "col2": ["A", "B"]})
    df_orig.to_csv(csv_path, index=False)
    
    df_read = io.read_csv_standardized(csv_path)
    assert len(df_read) == 2
    assert list(df_read.columns) == ["col1", "col2"]

def test_read_csv_file_not_found(tmp_path):
    """Verifica que falle con error claro si el archivo no existe."""
    io = IOService(root_path=tmp_path)
    non_existent = tmp_path / "missing.csv"
    with pytest.raises(FileNotFoundError, match="Archivo no encontrado"):
        io.read_csv_standardized(non_existent)
