import pandas as pd
import json
import os
from pathlib import Path
from rich.console import Console
import logging

console = Console()

class ProfileAgent:
    def __init__(self, raw_dir="data/raw", report_dir="catalog/profile_reports"):
        self.raw_dir = Path(raw_dir)
        self.report_dir = Path(report_dir)
        self.report_dir.mkdir(parents=True, exist_ok=True)
        self.setup_logging()

    def setup_logging(self):
        logging.basicConfig(
            filename='logs/profile_agent.log',
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )

    def run_profiling(self):
        console.print("[bold blue]Iniciando fase de perfilado...[/bold blue]")
        raw_files = [f for f in self.raw_dir.glob("*") if f.suffix in ['.csv', '.parquet'] and not f.name.endswith('.metadata.json')]
        
        if not raw_files:
            console.print("[yellow]No se encontraron archivos en data/raw/ para perfilar.[/yellow]")
            return

        for file_path in raw_files:
            self.profile_file(file_path)

    def profile_file(self, file_path):
        console.print(f"Perfilando: [cyan]{file_path.name}[/cyan]")
        try:
            if file_path.suffix == '.csv':
                # Intentamos detectar encoding y separador (simplificado)
                df = pd.read_csv(file_path, nrows=1000) # Muestra para perfilado
            elif file_path.suffix == '.parquet':
                df = pd.read_parquet(file_path)

            report = {
                "file_name": file_path.name,
                "rows_sample": len(df),
                "columns_count": len(df.columns),
                "columns": list(df.columns),
                "types": df.dtypes.apply(lambda x: str(x)).to_dict(),
                "null_percentage": (df.isnull().sum() / len(df) * 100).to_dict(),
                "duplicate_rows": int(df.duplicated().sum()),
                "possible_keys": self._infer_keys(df)
            }

            report_path = self.report_dir / f"{file_path.stem}_profile.json"
            with open(report_path, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=4)
            
            console.print(f"[green]Reporte generado: {report_path.name}[/green]")
            logging.info(f"Perfilado exitoso para {file_path.name}")

        except Exception as e:
            console.print(f"[red]Error al perfilar {file_path.name}: {str(e)}[/red]")
            logging.error(f"Error en perfilado {file_path.name}: {str(e)}")

    def _infer_keys(self, df):
        keys = []
        for col in df.columns:
            if df[col].is_unique:
                keys.append(col)
        return keys

if __name__ == "__main__":
    agent = ProfileAgent()
    agent.run_profiling()
