import json
import logging
from datetime import datetime
from pathlib import Path

class RunAudit:
    def __init__(self, audit_dir="logs/audits"):
        self.audit_dir = Path(audit_dir)
        self.audit_dir.mkdir(parents=True, exist_ok=True)
        self.run_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.steps = []

    def log_step(self, agent_name, status, context=None):
        """Registra un paso del pipeline con contexto enriquecido."""
        step_entry = {
            "timestamp": datetime.now().isoformat(),
            "agent": agent_name,
            "status": status,
            "context": context or {}
        }
        self.steps.append(step_entry)
        
        # Persistencia inmediata del log de auditoría
        audit_file = self.audit_dir / f"run_{self.run_id}.json"
        try:
            with open(audit_file, 'w', encoding='utf-8') as f:
                json.dump({
                    "run_id": self.run_id,
                    "execution_time": datetime.now().isoformat(),
                    "total_steps": len(self.steps),
                    "steps": self.steps
                }, f, indent=4, ensure_ascii=False)
        except Exception as e:
            logging.error(f"Falla al escribir auditoría: {e}")

    def get_summary(self):
        return {
            "run_id": self.run_id,
            "total_steps": len(self.steps),
            "final_status": self.steps[-1]['status'] if self.steps else "no_steps"
        }
