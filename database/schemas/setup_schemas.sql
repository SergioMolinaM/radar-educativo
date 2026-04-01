-- Creación de esquemas (Zonas de Datos)
-- Patrón estándar de arquitectura de datos

-- 1. RAW: Datos de origen sin modificaciones (copia espejo del CSV/Parquet)
CREATE SCHEMA IF NOT EXISTS raw;

-- 2. STAGING: Datos limpios, normalizados y homologados
CREATE SCHEMA IF NOT EXISTS staging;

-- 3. ANALYTICS: Tablas finales, vistas y modelos listos para consumo (Dashboards/BI)
CREATE SCHEMA IF NOT EXISTS analytics;

-- Comentarios detallados para auditoría
COMMENT ON SCHEMA raw IS 'Datos crudos importados directamente de fuentes oficiales';
COMMENT ON SCHEMA staging IS 'Capa de limpieza y normalización';
COMMENT ON SCHEMA analytics IS 'Capa de presentación y análisis final';
