import pandas as pd
import random
from datetime import datetime
from pathlib import Path
from rich.console import Console
import logging

console = Console()

class TransparenciaAgent:
    """
    Agente Operativo (PILOTO / MOCK). 
    Extrae (simula) datos de Dotación Docente y Asistentes de la Educación.
    Autorizado excepcionalmente por el usuario solo para validar la arquitectura de este módulo.
    """
    def __init__(self):
        self.setup_logging()

    def setup_logging(self):
        Path('logs').mkdir(exist_ok=True)
        logging.basicConfig(
            filename='logs/operative_agent.log',
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )

    def fetch_personnel(self, slep_id: str, year: int, month: int):
        console.print(f"[bold yellow]Ejecutando PILOTO de Transparencia Activa para {slep_id} ({month}/{year})[/bold yellow]")
        console.print("[dim]Aviso: Generando datos estructurados simulados (Mock) para pruebas de integración...[/dim]")
        
        # Generar datos simulados de dotación respetando la lógica de negocio escolar
        estamentos = ['Docente', 'Docente', 'Docente', 'Asistente', 'Asistente', 'Directivo']
        colegios = ['Liceo Bicentenario', 'Escuela Básica Barrancas', 'Liceo Politécnico']
        
        datos = []
        # Simular 100 funcionarios (Muestra)
        for i in range(1, 101):
            estamento = random.choice(estamentos)
            if estamento == 'Docente':
                sueldo = random.randint(1200000, 2500000)
                horas = random.choice([30, 38, 44])
            elif estamento == 'Directivo':
                sueldo = random.randint(2800000, 4000000)
                horas = 44
            else:
                sueldo = random.randint(600000, 1200000)
                horas = random.choice([40, 44])
                
            datos.append({
                'rut_funcionario': f"{random.randint(10000000, 25000000)}-{random.choice('0123456789K')}",
                'nombre_completo': f"Funcionario Piloto {i}",
                'estamento': estamento,
                'tipo_contrato': random.choice(['Planta', 'Contrata', 'Código del Trabajo']),
                'establecimiento': random.choice(colegios),
                'horas_contrato': horas,
                'renta_bruta': sueldo,
                'mes': month,
                'anio': year
            })
            
        logging.info(f"Generated {len(datos)} mock personnel records for {slep_id}")
        return datos

    def save_raw_personnel(self, data, slep_id: str, year: int, month: int):
        if not data:
            return None
            
        df = pd.DataFrame(data)
        raw_dir = Path("data/raw/transparencia")
        raw_dir.mkdir(parents=True, exist_ok=True)
        
        file_name = f"{slep_id}_dotacion_{year}_{month:02d}.csv"
        file_path = raw_dir / file_name
        
        df.to_csv(file_path, index=False)
        
        console.print(f"[green]Datos operativos (PILOTO) guardados en {file_path}[/green]")
        logging.info(f"Saved operative mock data to {file_path}")
        return str(file_path)

if __name__ == "__main__":
    agent = TransparenciaAgent()
    agent.fetch_personnel("slep_barrancas", 2024, 3)
