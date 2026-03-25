import os
import requests
import yaml
import json
import logging
import pandas as pd
from datetime import datetime
from pathlib import Path
from rich.console import Console
from dotenv import load_dotenv

console = Console()
load_dotenv()

class MercadoPublicoAgent:
    """
    Agente especializado en ingesta de datos financieros desde la API de Mercado Público.
    Se utiliza para obtener las órdenes de compra asociadas a un SLEP específico.
    """
    BASE_URL = "https://api.mercadopublico.cl/servicios/v1/publico"

    def __init__(self, slep_config_path="config/slep_config.yaml"):
        self.ticket = os.getenv("MERCADO_PUBLICO_TICKET")
        self.slep_config_path = Path(slep_config_path)
        self.sleps = self._load_slep_config()
        self.setup_logging()

    def setup_logging(self):
        logging.basicConfig(
            filename='logs/financial_agent.log',
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )

    def _load_slep_config(self):
        if not self.slep_config_path.exists():
            logging.warning(f"Configuración de SLEP no encontrada en {self.slep_config_path}")
            return []
        with open(self.slep_config_path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f).get('sleps', [])

    def fetch_purchase_orders(self, codigo_organismo: str, date_str: str = None):
        """
        Obtiene las órdenes de compra de un organismo específico (SLEP).
        Si no se provee fecha, trae los datos más recientes según el límite de la API.
        En la API de Mercado Público, se puede buscar por CodigoOrganismo.
        """
        if not self.ticket:
            msg = "MERCADO_PUBLICO_TICKET no está configurado en el archivo .env"
            console.print(f"[bold red]Error: {msg}[/bold red]")
            logging.error(msg)
            return None

        # Parámetros básicos para la API de Mercado Público
        params = {
            "ticket": self.ticket,
            "CodigoOrganismo": codigo_organismo
        }
        
        # Opcionalmente se puede filtrar por fecha (formato ddmmaaaa)
        if date_str:
            params["fecha"] = date_str

        endpoint = f"{self.BASE_URL}/ordenesdecompra.json"
        
        console.print(f"[bold blue]Consultando API Mercado Público para organismo: {codigo_organismo}[/bold blue]")
        try:
            response = requests.get(endpoint, params=params, timeout=30)
            
            # Manejo Graceful del error 401 u otros
            if response.status_code == 401:
                console.print("[bold red]Acceso denegado (401). Verifica tu MERCADO_PUBLICO_TICKET.[/bold red]")
                logging.error("Error 401: Ticket inválido o sin permisos.")
                return None
            
            response.raise_for_status()
            data = response.json()
            
            # La API de MP retorna un conteo y una lista 'Listado'
            cantidad = data.get('Cantidad', 0)
            ordenes = data.get('Listado', [])
            
            console.print(f"[green]Consulta exitosa. Se encontraron {cantidad} órdenes de compra.[/green]")
            logging.info(f"Retrieved {cantidad} orders for org {codigo_organismo}")
            
            return ordenes
            
        except requests.exceptions.RequestException as e:
            console.print(f"[bold red]Error al conectar con Mercado Público: {e}[/bold red]")
            logging.error(f"Error RequestException fetching orders: {e}")
            return None

    def save_raw_data(self, data, slep_id: str, date_str: str, io_service=None):
        """
        Guarda los datos raw extraídos en la estructura estandarizada de Data.
        """
        if not data:
            console.print("[yellow]No hay datos para guardar.[/yellow]")
            return None

        # Transformar a DataFrame para estandarizar guardado si es necesario
        df = pd.DataFrame(data)
        
        # En caso de no inyectar io_service, crear carpeta básica
        raw_dir = Path("data/raw/mercadopublico")
        raw_dir.mkdir(parents=True, exist_ok=True)
        
        # Ejemplo: data/raw/mercadopublico/slep_puerto_cordillera_20230801.csv
        file_name = f"{slep_id}_{date_str}.csv"
        file_path = raw_dir / file_name
        
        df.to_csv(file_path, index=False)
        console.print(f"[green]Datos guardados en {file_path}[/green]")
        logging.info(f"Saved {len(df)} records to {file_path}")
        
        return str(file_path)

if __name__ == "__main__":
    # Test básico del agente
    agent = MercadoPublicoAgent()
    print("Agente Inicializado. Ticket:", "OK" if agent.ticket else "MISSING")
