import argparse
import sys
import logging
from pathlib import Path

# Add project root to sys.path to allow imports form 'agents' and 'services'
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from services.pipeline_service import PipelineService
from agents.financial_agent import MercadoPublicoAgent

def main():
    parser = argparse.ArgumentParser(description="Ejecutar ingesta financiera desde Mercado Público")
    parser.add_argument("--slep", type=str, help="ID del SLEP en slep_config.yaml (Ej: slep_puerto_cordillera)", required=False)
    parser.add_argument("--date", type=str, help="Fecha en formato ddmmaaaa (opcional). Por defecto, trae lo más reciente.", required=False)
    
    args = parser.parse_args()
    
    # 1. Verificar credenciales antes de iniciar
    agent = MercadoPublicoAgent()
    if not agent.ticket:
        print("\n[CRÍTICO] No se encontró MERCADO_PUBLICO_TICKET en el archivo .env.")
        print("          Ingresa un ticket real para continuar con la extracción.")
        sys.exit(1)
        
    pipeline = PipelineService()
    
    # Si se pasa un SLEP específico, ejecutar para él. Si no, iterar todos.
    if args.slep:
        sleps_to_run = [s for s in agent.sleps if s['id'] == args.slep]
        if not sleps_to_run:
            print(f"[ERROR] SLEP '{args.slep}' no encontrado en config/slep_config.yaml")
            sys.exit(1)
    else:
        sleps_to_run = agent.sleps

    if not sleps_to_run:
        print("[ERROR] No hay SLEPs configurados en config/slep_config.yaml")
        sys.exit(1)

    print(f"\nIniciando ingesta para {len(sleps_to_run)} SLEP(s)...\n")
    
    for slep in sleps_to_run:
        slep_id = slep['id']
        org_code = slep['codigo_organismo']
        print(f"-> Procesando: {slep['name']} (Código Org: {org_code})")
        
        # Ojo: El org_code debe ser el Código Oficial de Comprador en Mercado Público.
        if org_code.startswith("724"):
            print("   [ADVERTENCIA] Usando código de organismo provisional. Asegúrate de configurar el oficial.")

        result = pipeline.run_financial_ingestion(slep_id=slep_id, codigo_organismo=org_code, date_str=args.date)
        
        status = result.get('status')
        if status == 'success':
            print(f"   [EXITO] Descarga completada. Path: {result.get('path')} | Registros: {result.get('records')}")
        else:
            print(f"   [FALLO] Razón: {result.get('error')}")

if __name__ == "__main__":
    main()
