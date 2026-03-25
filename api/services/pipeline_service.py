from typing import Any
from agents.catalog_agent import CatalogAgent
from agents.download_agent import DownloadAgent
from agents.profile_agent import ProfileAgent
from agents.validator_agent import ValidatorAgent
from agents.staging_load_agent import StagingLoadAgent
from agents.documenter_agent import DocumenterAgent
from agents.financial_agent import MercadoPublicoAgent
from agents.run_audit import RunAudit
from services.io_service import IOService
from services.metadata_service import MetadataService

class PipelineService:
    """
    Orquestador principal del pipeline de Radar.
    Capa de aplicación que coordina agentes y servicios con lógica determinística.
    """
    
    def __init__(self):
        self.io = IOService()
        self.metadata = MetadataService()
        self.audit = RunAudit()

    def run_catalog(self) -> dict[str, Any]:
        """Ejecuta descubrimiento y catalogación."""
        agent = CatalogAgent()
        # TODO: Modificar CatalogAgent para que retorne el conteo de cambios
        agent.discover()
        
        result = {"action": "catalog", "status": "success", "detail": "Catalogo maestro actualizado."}
        self.audit.log_step("catalog", "success", result)
        return result

    def run_download(self) -> dict[str, Any]:
        """Ejecuta descarga de fuentes aprobadas."""
        agent = DownloadAgent()
        # TODO: Modificar DownloadAgent para retornar resumen (processed/downloaded/skipped)
        agent.process_downloads()
        
        result = {"action": "download", "status": "success"}
        self.audit.log_step("download", "success", result)
        return result

    def run_financial_ingestion(self, slep_id: str, codigo_organismo: str, date_str: str = None) -> dict[str, Any]:
        """Ejecuta la ingesta financiera (ej. Mercado Público) para un SLEP específico."""
        agent = MercadoPublicoAgent()
        data = agent.fetch_purchase_orders(codigo_organismo, date_str)
        
        if data:
            # Guardamos los datos simulando hoy si no hay fecha explícita
            safe_date = date_str if date_str else "latest"
            path = agent.save_raw_data(data, slep_id, safe_date)
            result = {"action": "financial_ingestion", "status": "success", "slep_id": slep_id, "path": path, "records": len(data)}
            self.audit.log_step("financial_ingestion", "success", result)
            return result
        else:
            result = {"action": "financial_ingestion", "status": "failed", "slep_id": slep_id, "error": "No data or auth failed"}
            self.audit.log_step("financial_ingestion", "failed", result)
            return result

    def run_operative_ingestion(self, slep_id: str, year: int, month: int) -> dict[str, Any]:
        """Ejecuta la ingesta operativa (Transparencia / Dotación) en modo PILOTO."""
        from agents.operative_agent import TransparenciaAgent
        agent = TransparenciaAgent()
        data = agent.fetch_personnel(slep_id, year, month)
        
        if data:
            path = agent.save_raw_personnel(data, slep_id, year, month)
            result = {"action": "operative_ingestion", "status": "success", "slep_id": slep_id, "path": path, "records": len(data)}
            self.audit.log_step("operative_ingestion", "success", result)
            return result
        else:
            result = {"action": "operative_ingestion", "status": "failed", "slep_id": slep_id, "error": "Mock generation failed"}
            self.audit.log_step("operative_ingestion", "failed", result)
            return result

    def run_profile(self, dataset_id: str) -> dict[str, Any]:
        """Analiza la estructura estructural de un dataset raw."""
        path = self.io.get_raw_csv_path(dataset_id)
        df = self.io.read_csv_standardized(path)
        
        agent = ProfileAgent()
        report = agent.profile(df, dataset_id)
        
        result = {
            "dataset_id": dataset_id,
            "rows": report.get("row_count"),
            "cols": report.get("column_count"),
            "status": "success",
            "report_path": str(self.io.get_profile_report_path(dataset_id))
        }
        self.audit.log_step("profile", "success", result)
        return result

    def run_validate(self, dataset_id: str) -> dict[str, Any]:
        """Valida calidad y consistencia del dataset (sobre datos mapeados)."""
        path = self.io.get_raw_csv_path(dataset_id)
        df = self.io.read_csv_standardized(path)

        # 1. Obtener mapping y verificar requerimientos
        mapping = self.metadata.get_mappings(dataset_id)
        if self.metadata.requires_mapping(dataset_id) and not mapping:
            error_msg = f"Dataset {dataset_id} requiere mapping explícito para validación y no se encontró."
            self.audit.log_step("validate", "failed", {"error": error_msg})
            raise ValueError(error_msg)

        # 2. Aplicar SchemaMapper si existe mapping
        if mapping:
            mapper = SchemaMapper()
            df = mapper.map_dataframe(df, dataset_id)

        # 3. Validar sobre el DataFrame ya normalizado
        agent = ValidatorAgent()
        agent.validate(df, dataset_id)
        
        result = {"dataset_id": dataset_id, "status": "success", "message": "Validación exitosa (mapeo aplicado)."}
        self.audit.log_step("validate", "success", result)
        return result

    def run_load(self, dataset_id: str) -> dict[str, Any]:
        """
        Orquestación endurecida de carga multi-etapa.
        Raw -> Staging -> Analytics con validación de gates.
        """
        # 1. Resolver recursos
        path = self.io.get_raw_csv_path(dataset_id)
        df = self.io.read_csv_standardized(path)
        
        dataset_meta = self.metadata.get_dataset_metadata(dataset_id)
        mapping = self.metadata.get_mappings(dataset_id)
        target_table = self.metadata.get_analytics_target(dataset_id)
        
        # 2. Hard Gate: Mapping Requerido
        if self.metadata.requires_mapping(dataset_id) and not mapping:
            error_msg = f"Dataset {dataset_id} requiere mapping explícito y no se encontró en schema_rules.yaml"
            self.audit.log_step("load", "failed", {"error": error_msg})
            raise ValueError(error_msg)

        # 3. Hard Gate: Target Analytics
        if not target_table:
            error_msg = f"No se pudo resolver el target canónico en analytics para {dataset_id}. Carga abortada por seguridad."
            self.audit.log_step("load", "failed", {"error": error_msg})
            raise ValueError(error_msg)

        loader = StagingLoadAgent()
        
        # Etapa 1: RAW
        loader.load_to_raw(df, dataset_id)
        
        # Etapa 2: STAGING (Mapping aplicado vía SQL en el Agente)
        stg_table = self.metadata.get_staging_target(dataset_id)
        loader.promote_to_staging(dataset_id, stg_table, mapping)
        
        # GATE: Validación Post-Staging (Integridad de esquema y tipos)
        # TODO: Implementar StageValidator o similar para verificar que la tabla stg cumple el contrato
        
        # Etapa 3: ANALYTICS
        loader.promote_to_analytics(stg_table, target_table)
        
        result = {
            "dataset_id": dataset_id,
            "raw_table": f"raw.{dataset_id}",
            "staging_table": f"staging.{stg_table}",
            "analytics_table": f"analytics.{target_table}",
            "status": "success"
        }
        self.audit.log_step("load", "success", result)
        return result

    def run_document(self, dataset_id: str) -> dict[str, Any]:
        """Genera ficha técnica documentada."""
        report_path = self.io.get_profile_report_path(dataset_id)
        report = self.io.load_json(report_path)
        
        metadata = self.metadata.get_dataset_metadata(dataset_id)
        
        # Hard Stop: Validación de metadata crítica para documentación
        if not metadata or metadata.get('source_institution') == 'Unknown' or metadata.get('source_institution') == 'Provisional':
            error_msg = f"Imposible documentar {dataset_id}: Metadata insuficiente (Institución de origen no identificada)."
            self.audit.log_step("document", "failed", {"error": error_msg})
            raise ValueError(error_msg)

        doc_agent = DocumenterAgent()
        doc_path = doc_agent.generate_fact_sheet(dataset_id, report, metadata)
        
        result = {
            "dataset_id": dataset_id,
            "version": metadata.get('version', 'v1'),
            "doc_path": str(doc_path),
            "status": "success"
        }
        self.audit.log_step("document", "success", result)
        return result
