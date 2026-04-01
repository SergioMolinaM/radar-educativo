from pathlib import Path
from typing import Any

import json
import pandas as pd


class IOService:
    """
    Centraliza resolución de rutas y operaciones de entrada/salida del proyecto.
    Define una política común para lectura de archivos y manejo de artefactos.
    """

    def __init__(self, root_path: str = ".") -> None:
        self.root = Path(root_path)
        self.raw_dir = self.root / "data" / "raw"
        self.profile_dir = self.root / "catalog" / "profile_reports"
        self.docs_dir = self.root / "docs" / "datasets"

        self.raw_dir.mkdir(parents=True, exist_ok=True)
        self.profile_dir.mkdir(parents=True, exist_ok=True)
        self.docs_dir.mkdir(parents=True, exist_ok=True)

    def get_raw_csv_path(self, dataset_id: str) -> Path:
        """Devuelve la ruta del archivo raw CSV para un dataset."""
        return self.raw_dir / f"{dataset_id}.csv"

    def get_raw_metadata_path(self, dataset_id: str) -> Path:
        """Devuelve la ruta del metadata JSON asociado al archivo raw."""
        return self.raw_dir / f"{dataset_id}.metadata.json"

    def get_profile_report_path(self, dataset_id: str) -> Path:
        """Devuelve la ruta del reporte de perfilado JSON."""
        return self.profile_dir / f"{dataset_id}_profile.json"

    def get_dataset_doc_path(self, dataset_id: str) -> Path:
        """Devuelve la ruta de la ficha técnica markdown del dataset."""
        # Nota: El DocumenterAgent usa {dataset_id}_{version}_fact_sheet.md actualmente
        # Mantendremos esta función como helper genérico o punto de refactorización
        return self.docs_dir / f"{dataset_id}.md"

    def ensure_file_exists(self, path: Path) -> None:
        """Valida existencia de archivo y levanta una excepción clara si no existe."""
        if not path.exists():
            raise FileNotFoundError(f"Archivo no encontrado: {path}")

    def read_csv_standardized(self, path: Path, **kwargs: Any) -> pd.DataFrame:
        """
        Lee un CSV con una política común del proyecto.
        Intenta combinaciones razonables de encoding y separador.
        """
        self.ensure_file_exists(path)

        attempts = [
            {"encoding": "utf-8"},
            {"encoding": "utf-8", "sep": ";", "engine": "python"},
            {"encoding": "latin-1"},
            {"encoding": "latin-1", "sep": ";", "engine": "python"},
        ]

        last_error = None

        for opts in attempts:
            try:
                merged = {**opts, **kwargs}
                df = pd.read_csv(path, **merged)
                return df
            except Exception as e:
                last_error = e
                continue

        raise IOError(f"Error al leer CSV {path}: {last_error}") from last_error

    def load_json(self, path: Path) -> dict[str, Any]:
        """Carga un archivo JSON de forma segura."""
        self.ensure_file_exists(path)
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError as e:
            raise ValueError(f"JSON inválido en {path}: {e}") from e

    def save_json(self, data: dict[str, Any], path: Path) -> None:
        """Guarda un diccionario como JSON formateado."""
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
