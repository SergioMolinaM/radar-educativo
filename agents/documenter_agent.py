import json
from pathlib import Path
from datetime import datetime
from rich.console import Console

console = Console()

class DocumenterAgent:
    def __init__(self, docs_dir="docs/datasets"):
        self.docs_dir = Path(docs_dir)
        self.docs_dir.mkdir(parents=True, exist_ok=True)

    def generate_fact_sheet(self, dataset_id: str, profile_report: dict, metadata: dict):
        """Genera una ficha técnica versionada en Markdown."""
        console.print(f"Generando documentación para [yellow]{dataset_id}[/yellow]...")
        
        version = metadata.get("version", "v1")
        date_str = datetime.now().strftime("%Y-%m-%d")
        
        content = f"""# Ficha Técnica: {dataset_id} (Version: {version})

## 1. Información General
- **Dataset ID**: {dataset_id}
- **Fecha de Generación**: {date_str}
- **Fuente**: {metadata.get('source_institution', 'Desconocida')}
- **Cobertura Temporal**: {metadata.get('time_coverage', 'N/A')}

## 2. Métricas de Calidad (Auditoría)
- **Total Filas**: {profile_report.get('row_count', 0)}
- **Total Columnas**: {profile_report.get('column_count', 0)}
- **Llaves Candidatas**: {", ".join(profile_report.get('candidate_keys', []))}

## 3. Estructura de Datos
| Columna | Tipo | Nulos (%) | Únicos |
|---------|------|-----------|--------|
"""
        for col, info in profile_report.get("columns", {}).items():
            content += f"| {col} | {info['dtype']} | {info['null_pct']:.2f}% | {info['unique_count']} |\n"

        content += f"""
## 4. Riesgos y Observaciones
- **Nivel de Riesgo**: {metadata.get('legal_risk', 'Low')}
- **Notas**: Documentación generada automáticamente por el pipeline de Radar.
"""

        doc_path = self.docs_dir / f"{dataset_id}_{version}_fact_sheet.md"
        with open(doc_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        console.print(f"[green]Documentación generada: {doc_path}[/green]")
        return doc_path

if __name__ == "__main__":
    # Prueba rápida
    doc = DocumenterAgent()
    doc.generate_fact_sheet("test", {"row_count": 100, "columns": {}}, {"version": "v1"})
