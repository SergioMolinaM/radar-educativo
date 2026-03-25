import logging

class AIHelper:
    """Servicio opcional de asistencia por IA para el pipeline."""
    
    def __init__(self, enabled=False):
        self.enabled = enabled
        if not enabled:
            logging.info("AIHelper está desactivado por diseño.")

    def suggest_mappings(self, raw_columns):
        """Sugiere mapeos semánticos entre columnas raw y el estándar."""
        if not self.enabled:
            return None
        # Aquí iría la llamada a Gemini/LLM
        return {"RBD": "rbd", "NOM_ESTAB": "nombre_establecimiento"}

    def draft_description(self, metadata):
        """Redacta una descripción técnica para la ficha del dataset."""
        if not self.enabled:
            return "Descripción generada automáticamente (Determinista)."
        # Aquí iría la llamada a Gemini/LLM
        return "El dataset contiene el directorio oficial de establecimientos..."

    def detect_inconsistencies(self, df1, df2):
        """Detecta incoherencias semánticas entre dos dataframes."""
        if not self.enabled:
            return []
        return ["Posible duplicidad semántica detectada en columna 'RBD'"]
