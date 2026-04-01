import pandas as pd
import json
import logging
from pathlib import Path
from rich.console import Console

console = Console()

class ProfileAgent:
    def __init__(self, reports_dir="catalog/profile_reports"):
        self.reports_dir = Path(reports_dir)
        self.reports_dir.mkdir(parents=True, exist_ok=True)
        self.setup_logging()

    def setup_logging(self):
        logging.basicConfig(
            filename='logs/profile_agent.log',
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )

    def profile(self, df: pd.DataFrame, dataset_id: str):
        console.print(f"Perfilando dataset: [yellow]{dataset_id}[/yellow]")
        
        report = {
            "dataset_id": dataset_id,
            "row_count": len(df),
            "column_count": len(df.columns),
            "columns": {},
            "candidate_keys": self._infer_keys(df)
        }

        for col in df.columns:
            report["columns"][col] = {
                "dtype": str(df[col].dtype),
                "null_count": int(df[col].isnull().sum()),
                "null_pct": float(df[col].isnull().mean() * 100),
                "unique_count": int(df[col].nunique())
            }

        report_path = self.reports_dir / f"{dataset_id}_profile.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=4)
        
        console.print(f"Reporte de perfilado guardado en: [cyan]{report_path}[/cyan]")
        logging.info(f"Profle generated for {dataset_id}")
        return report

    def _infer_keys(self, df):
        """Identifica columnas que podrían ser llaves primarias (sin nulos, únicas)."""
        keys = []
        for col in df.columns:
            # Una llave candidata no debe tener nulos y debe ser única
            if df[col].isnull().sum() == 0 and df[col].nunique() == len(df):
                keys.append(col)
        
        # Prioridad específica para 'rbd' si se detecta
        if 'rbd' in [c.lower() for c in df.columns] and 'rbd' not in keys:
            # Si rbd no es única pero es rbd, es un caso de estudio (ej: matrícula)
            # Para el MVP lo marcamos si existe
            pass
            
        return keys

if __name__ == "__main__":
    df_test = pd.DataFrame({"rbd": [1, 2, 3], "nombre": ["A", "B", "C"]})
    profiler = ProfileAgent()
    profiler.profile(df_test, "test_directorio")
