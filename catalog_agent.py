import yaml
import pandas as pd
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from pathlib import Path
from rich.console import Console
from rich.table import Table
import logging

console = Console()

class CatalogAgent:
    def __init__(self, sources_path="config/sources.yaml", catalog_path="catalog/master_catalog.csv"):
        self.sources_path = Path(sources_path)
        self.catalog_path = Path(catalog_path)
        self.sources = self._load_sources()
        self.setup_logging()

    def setup_logging(self):
        logging.basicConfig(
            filename='logs/catalog_agent.log',
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )

    def _load_sources(self):
        with open(self.sources_path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)['sources']

    def discover(self):
        console.print("[bold blue]Iniciando descubrimiento de datasets...[/bold blue]")
        new_entries = []
        
        for source_id, info in self.sources.items():
            console.print(f"Visitando: [yellow]{info['full_name']}[/yellow] ({info['website']})")
            
            try:
                # Simulación de descubrimiento profesional (En producción usaría scrapers específicos)
                # No inventamos: si no podemos scrapear automáticamente, marcamos para revisión.
                entry = {
                    "source_institution": info['full_name'],
                    "source_domain": "Education",
                    "dataset_name": f"Discovery_{source_id}_{datetime.now().strftime('%Y%m%d')}",
                    "dataset_url": info['website'],
                    "download_url": "",
                    "access_type": "Public",
                    "format": "manual_review",
                    "aggregation_level": "manual_review",
                    "primary_key_candidate": "",
                    "territorial_keys": "",
                    "time_coverage": "",
                    "update_frequency": info.get('frequency', 'unknown'),
                    "mvp_priority": "Pending",
                    "legal_risk": "Low",
                    "status": "discovered",
                    "last_checked_at": datetime.now().isoformat(),
                    "notes": "Automated discovery - Requires manual verification"
                }
                new_entries.append(entry)
                logging.info(f"Dataset descubierto para {source_id}")
                
            except Exception as e:
                logging.error(f"Error al procesar {source_id}: {str(e)}")
                console.print(f"[red]Error en {source_id}[/red]")

        if new_entries:
            self.update_catalog(new_entries)

    def update_catalog(self, new_entries):
        df_new = pd.DataFrame(new_entries)
        if self.catalog_path.exists():
            df_old = pd.read_csv(self.catalog_path)
            # Evitar duplicados por URL de institución/sitio
            df_final = pd.concat([df_old, df_new]).drop_duplicates(subset=['source_institution', 'dataset_url'], keep='first')
        else:
            df_final = df_new
            
        df_final.to_csv(self.catalog_path, index=False)
        console.print(f"[bold green]Catálogo actualizado. {len(new_entries)} entradas procesadas.[/bold green]")

if __name__ == "__main__":
    agent = CatalogAgent()
    agent.discover()
