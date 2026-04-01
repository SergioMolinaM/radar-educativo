import pandas as pd
import yaml
from pathlib import Path
from typing import Any, Optional

class MetadataService:
    """
    Resuelve metadatos de los datasets a partir del catálogo y reglas de esquema.
    Evita valores hardcodeados en la capa de interfaz y orquestación.
    """
    
    def __init__(self, catalog_path: str = "catalog/master_catalog.csv", rules_path: str = "config/schema_rules.yaml"):
        self.catalog_path = Path(catalog_path)
        self.rules_path = Path(rules_path)
        self._rules = None

    @property
    def rules(self) -> dict[str, Any]:
        if self._rules is None:
            if self.rules_path.exists():
                with open(self.rules_path, 'r', encoding='utf-8') as f:
                    self._rules = yaml.safe_load(f)
            else:
                self._rules = {}
        return self._rules

    def get_dataset_metadata(self, dataset_id: str) -> dict[str, Any]:
        """
        Busca los metadatos del dataset en el catálogo maestro.
        """
        if not self.catalog_path.exists():
            return self._get_fallback_metadata(dataset_id)
        
        try:
            df = pd.read_csv(self.catalog_path)
            # Intentamos match exacto primero, luego por substring
            match = df[df['dataset_name'] == dataset_id]
            if match.empty:
                match = df[df['dataset_name'].str.contains(dataset_id, case=False, na=False)]
            
            if not match.empty:
                data = match.iloc[0].to_dict()
                # Asegurar campos mínimos
                data.setdefault('source_institution', 'Unknown')
                data.setdefault('time_coverage', 'N/A')
                data.setdefault('version', 'v1')
                return data
        except Exception:
            pass
            
        return self._get_fallback_metadata(dataset_id)

    def _get_fallback_metadata(self, dataset_id: str) -> dict[str, Any]:
        return {
            "dataset_name": dataset_id,
            "source_institution": "Provisional",
            "time_coverage": "N/A",
            "version": "v1",
            "legal_risk": "Unreviewed"
        }

    def get_mappings(self, dataset_id: str) -> dict[str, str]:
        """
        Retorna el mapeo de columnas específico para un dataset.
        """
        mappings = self.rules.get('mappings', {})
        # Buscar el dataset_id en las llaves del mapping
        for key in mappings:
            if key in dataset_id:
                return mappings[key]
        return {}

    def get_staging_target(self, dataset_id: str) -> str:
        """
        Resuelve el nombre de la tabla en la capa de staging.
        """
        target = self.get_analytics_target(dataset_id)
        if target:
            # Si el target es 'dim_establecimiento', el staging es 'stg_establecimiento'
            return target.replace("dim_", "stg_")
        return f"stg_{dataset_id}"

    def get_analytics_target(self, dataset_id: str) -> str:
        """
        Resuelve el nombre canónico de la tabla en la capa de analytics.
        """
        # 1. Buscar en una sección específica de 'targets' en las reglas
        targets = self.rules.get('analytics_targets', {})
        for key in targets:
            if key in dataset_id:
                return targets[key]
        
        # 2. Lógica de negocio por defecto basada en patrones conocidos
        id_lower = dataset_id.lower()
        if "directorio" in id_lower:
            return "dim_establecimiento"
        if "sostenedor" in id_lower:
            return "dim_sostenedor"
            
        # 3. Fallback controlado: No inventamos nombres automáticos para analytics.
        return None

    def requires_mapping(self, dataset_id: str) -> bool:
        """
        Determina si el dataset requiere un mapeo explícito para ser procesado.
        """
        required = self.rules.get("requires_mapping", [])
        return any(key in dataset_id.lower() for key in required)
