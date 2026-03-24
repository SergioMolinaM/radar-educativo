import pytest
import pandas as pd
from agents.profile_agent import ProfileAgent

def test_profile_structural_analysis(tmp_path):
    """Verifica que el perfilador detecte columnas y conteo básico correctamente."""
    reports_dir = tmp_path / "reports"
    agent = ProfileAgent(reports_dir=reports_dir)
    
    df = pd.DataFrame({
        "col1": [1, 2, 3],
        "col2": ["A", "B", "C"],
        "col3": [True, False, None]
    })
    
    report = agent.profile(df, "test_dataset")
    
    assert report["row_count"] == 3
    assert report["column_count"] == 3
    assert "col1" in report["columns"]
    assert "col2" in report["columns"]
    assert "col3" in report["columns"]
    assert report["columns"]["col3"]["null_count"] == 1
    assert report["columns"]["col1"]["unique_count"] == 3
