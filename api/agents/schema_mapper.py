import yaml
from pathlib import Path
from rich.console import Console

console = Console()

class SchemaMapper:
    def __init__(self, rules_path="config/schema_rules.yaml"):
        self.rules_path = Path(rules_path)
        self.rules = self._load_rules()

    def _load_rules(self):
        if not self.rules_path.exists():
            return {}
        with open(self.rules_path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)

    def get_canonical_name(self, raw_name: str, dataset_key: str = None):
        """Busca si el nombre raw tiene un mapeo definido."""
        clean_name = raw_name.strip() # Mantener caso si hay mapeo explícito
        
        # 1. Buscar en mapeos específicos si existen
        if dataset_key and dataset_key in self.rules.get('mappings', {}):
            dataset_mapping = self.rules['mappings'][dataset_key]
            if clean_name in dataset_mapping:
                return dataset_mapping[clean_name]

        # 2. Búsqueda por normalización básica (lowercase)
        clean_lower = clean_name.lower()
        mapping = {
            "rbd": "rbd",
            "cod_com": "codigo_comuna",
            "cod_com_rbd": "codigo_comuna",
            "nom_com": "nombre_comuna",
            "cod_reg": "codigo_region",
            "nom_reg": "nombre_region",
            "nom_estab": "nombre_establecimiento"
        }
        
        return mapping.get(clean_lower, clean_lower)

    def map_dataframe(self, df, dataset_key: str = None):
        """Renombra las columnas del dataframe al estándar canónico."""
        new_columns = {col: self.get_canonical_name(col, dataset_key) for col in df.columns}
        return df.rename(columns=new_columns)

if __name__ == "__main__":
    mapper = SchemaMapper()
    print(mapper.get_canonical_name("RBD"))
    print(mapper.get_canonical_name("NOM_ESTAB"))
