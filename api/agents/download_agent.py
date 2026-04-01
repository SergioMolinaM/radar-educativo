import pandas as pd
import requests
import json
import hashlib
import os
from datetime import datetime
from pathlib import Path
from rich.console import Console
import logging

console = Console()

class DownloadAgent:
    def __init__(self, catalog_path="catalog/master_catalog.csv", raw_dir="data/raw"):
        self.catalog_path = Path(catalog_path)
        self.raw_dir = Path(raw_dir)
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        self.setup_logging()

    def setup_logging(self):
        logging.basicConfig(
            filename='logs/download_agent.log',
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )

    def get_sha256(self, file_path):
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    def process_downloads(self):
        if not self.catalog_path.exists():
            console.print("[red]No se encontró el catálogo maestro.[/red]")
            return

        df = pd.read_csv(self.catalog_path)
        to_download = df[df['status'] == 'approved_for_download']

        if to_download.empty:
            console.print("[yellow]No hay datasets aprobados para descargar.[/yellow]")
            return

        for _, row in to_download.iterrows():
            self.download_dataset(row)

    def download_dataset(self, row):
        # Patrón: institucion__dataset__anio_fecha__version.ext
        inst = row['source_institution'].lower().replace(" ", "_")
        name = row['dataset_name'].lower().replace(" ", "_")
        year = str(row['time_coverage']) if pd.notnull(row['time_coverage']) else "unknown"
        version = "v1" # Simplificación para el MVP
        
        file_ext = row['format'].lower() if pd.notnull(row['format']) and row['format'] != 'manual_review' else 'csv'
        base_name = f"{inst}__{name}__{year}__{version}"
        file_name = f"{base_name}.{file_ext}"
        meta_name = f"{base_name}.metadata.json"
        
        dest_path = self.raw_dir / file_name
        meta_path = self.raw_dir / meta_name

        console.print(f"Descargando: [cyan]{file_name}[/cyan]...")
        
        try:
            # Simulación de descarga (Uso de una URL real si estuviera disponible)
            # En este MVP, si la URL está vacía, simulamos un error 404
            url = row['download_url']
            if not url or pd.isna(url):
                 raise Exception("URL de descarga vacía")

            response = requests.get(url, stream=True, timeout=30)
            response.raise_for_status()

            with open(dest_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)

            file_size = os.path.getsize(dest_path)
            sha256 = self.get_sha256(dest_path)

            metadata = {
                "dataset_name": row['dataset_name'],
                "source_url": url,
                "downloaded_at": datetime.now().isoformat(),
                "file_name": file_name,
                "content_type": response.headers.get('Content-Type', 'unknown'),
                "sha256": sha256,
                "file_size": file_size,
                "http_status": response.status_code
            }

            with open(meta_path, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=4)

            console.print(f"[bold green]Completado: {file_name} ({file_size} bytes)[/bold green]")
            logging.info(f"Descarga exitosa: {file_name}")

        except Exception as e:
            console.print(f"[red]Error al descargar {file_name}: {str(e)}[/red]")
            logging.error(f"Error en descarga {file_name}: {str(e)}")

if __name__ == "__main__":
    agent = DownloadAgent()
    agent.process_downloads()
