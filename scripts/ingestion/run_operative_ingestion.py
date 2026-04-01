import argparse
import sys
import logging
from datetime import datetime
from pathlib import Path

# Agregar raíz al PYTHONPATH
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from services.pipeline_service import PipelineService
import yaml

def get_slep_config(slep_id: str = None):
    config_path = Path("config/slep_config.yaml")
    if not config_path.exists():
        print(f"[ERROR] No existe {config_path}")
        sys.exit(1)
        
    with open(config_path, 'r', encoding='utf-8') as f:
        sleps = yaml.safe_load(f).get('sleps', [])
        
    if slep_id:
        return [s for s in sleps if s['id'] == slep_id]
    return sleps

def main():
    parser = argparse.ArgumentParser(description="Ejecutar ingesta operativa (Dotación) PILOTO")
    parser.add_argument("--slep", type=str, help="ID del SLEP en slep_config.yaml (Ej: slep_barrancas)", required=False)
    
    # Defaults to current year and month
    now = datetime.now()
    parser.add_argument("--year", type=int, default=now.year, help="Año a extraer")
    parser.add_argument("--month", type=int, default=now.month, help="Mes a extraer (1-12)")
    
    args = parser.parse_args()
    
    pipeline = PipelineService()
    sleps_to_run = get_slep_config(args.slep)

    if not sleps_to_run:
        print("[ERROR] No se encontraron SLEPs para procesar.")
        sys.exit(1)

    print(f"\nIniciando ingesta OPERATIVA (MODO PILOTO) para {len(sleps_to_run)} SLEP(s)...\n")
    
    for slep in sleps_to_run:
        slep_id = slep['id']
        print(f"-> Procesando Dotación para: {slep['name']} | Período: {args.month}/{args.year}")
        
        result = pipeline.run_operative_ingestion(slep_id=slep_id, year=args.year, month=args.month)
        
        if result.get('status') == 'success':
            print(f"   [EXITO] Archivo generado. Path: {result.get('path')} | Registros PILOTO: {result.get('records')}")
        else:
            print(f"   [FALLO] Razón: {result.get('error')}")

if __name__ == "__main__":
    main()
