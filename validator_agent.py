import pandas as pd
import json
import logging
from pathlib import Path
from rich.console import Console

console = Console()

class ValidationError(Exception):
    pass

class ValidatorAgent:
    def __init__(self, rules_path="config/schema_rules.yaml"):
        self.rules_path = Path(rules_path)
        self.rules = self._load_rules()
        self.setup_logging()

    def setup_logging(self):
        logging.basicConfig(
            filename='logs/validator_agent.log',
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )

    def _load_rules(self):
        import yaml
        if not self.rules_path.exists():
            return {}
        with open(self.rules_path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)

    def validate(self, df: pd.DataFrame, dataset_name: str):
        console.print(f"[bold blue]Validando dataset: {dataset_name}[/bold blue]")
        errors = []

        # 1. Regla: Columnas obligatorias (específicas por dataset o fallback a standard_fields)
        required_fields = self.rules.get('required_fields_by_dataset', {}).get(dataset_name, [])
        if not required_fields:
            # Fallback para mantener compatibilidad con datasets que aún usen la estructura antigua
            required_fields = list(self.rules.get('standard_fields', {}).keys())

        for field in required_fields:
            if field not in df.columns:
                errors.append(f"Falta columna obligatoria: {field}")

        # 2. Regla: Umbral de nulos (específico por dataset o global)
        dataset_rules = self.rules.get('validation_rules', {}).get(dataset_name, {})
        thresholds = dataset_rules.get('check_nulls', self.rules.get('validation_rules', {}).get('check_nulls', []))
        
        for col in thresholds:
            if col in df.columns:
                null_pct = df[col].isnull().mean() * 100
                if null_pct > 5.0: # Umbral hardcodeado por ahora para el MVP
                    errors.append(f"Columna {col} supera umbral de nulos: {null_pct:.2f}%")

        # 3. Regla: Tipos de datos (Opcional en fase 1)
        # TODO: Implementar validación de tipos contra schema_rules.yaml

        if errors:
            for err in errors:
                console.print(f"[red]Error de validación: {err}[/red]")
                logging.error(f"Validation Error [{dataset_name}]: {err}")
            raise ValidationError(f"Dataset {dataset_name} rechazado por fallas críticas.")

        console.print("[green]Validación exitosa.[/green]")
        logging.info(f"Validation successful for {dataset_name}")
        return True

if __name__ == "__main__":
    # Prueba rápida
    try:
        df_test = pd.DataFrame({"rbd": [1, None, 3], "nombre": ["A", "B", "C"]})
        validator = ValidatorAgent()
        validator.validate(df_test, "test_dataset")
    except Exception as e:
        print(e)
