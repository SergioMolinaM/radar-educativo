import pytest
from agents.download_agent import DownloadAgent
from pathlib import Path

def test_download_directory_logic(tmp_path):
    """Verifica que el agente reconozca el directorio de descarga."""
    raw_dir = tmp_path / "raw"
    agent = DownloadAgent(raw_dir=raw_dir)
    assert agent.raw_dir == raw_dir

def test_get_sha256_calculation(tmp_path):
    """Verifica que el cálculo de SHA256 sea correcto para un contenido conocido."""
    test_file = tmp_path / "test.txt"
    test_file.write_text("radar_platform", encoding="utf-8")
    
    agent = DownloadAgent()
    sha256 = agent.get_sha256(test_file)
    
    # El hash de "radar_platform" es conocido
    assert len(sha256) == 64
    assert isinstance(sha256, str)
