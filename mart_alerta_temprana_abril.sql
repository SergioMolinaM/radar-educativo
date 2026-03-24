-- Mart Analítico: Alerta Temprana Abril
-- Objetivo: Consolidar riesgo por asistencia y vulnerabilidad a nivel de establecimiento y sostenedor

BEGIN;

-- 1. Agregación de Asistencia (Abril)
CREATE TEMP TABLE tmp_asistencia AS
SELECT 
    SPLIT_PART(rbd, '.', 1) as rbd_clean,
    SUM(CAST(dias_asistidos AS FLOAT)) as total_asistidos,
    SUM(CAST(dias_trabajados AS FLOAT)) as total_trabajados,
    CASE 
        WHEN SUM(CAST(dias_trabajados AS FLOAT)) > 0 
        THEN SUM(CAST(dias_asistidos AS FLOAT)) / SUM(CAST(dias_trabajados AS FLOAT))
        ELSE NULL 
    END as tasa_asistencia
FROM analytics.fact_asistencia_abril
GROUP BY 1;

-- 2. Agregación de Matrícula
CREATE TEMP TABLE tmp_matricula AS
SELECT 
    SPLIT_PART(rbd, '.', 1) as rbd_clean,
    COUNT(DISTINCT mrun) as matricula_total
FROM analytics.fact_matricula
GROUP BY 1;

-- 3. Agregación de Vulnerabilidad (SEP/Prioritarios/Preferentes)
CREATE TEMP TABLE tmp_vulnerabilidad AS
SELECT 
    SPLIT_PART(rbd, '.', 1) as rbd_clean,
    COUNT(DISTINCT mrun) FILTER (WHERE prioritario = '1' OR preferente = '1') as total_vulnerable
FROM analytics.fact_sep_prioritarios
GROUP BY 1;

-- 4. Construcción del Mart Final
DROP TABLE IF EXISTS analytics.mart_alerta_temprana_abril;

CREATE TABLE analytics.mart_alerta_temprana_abril AS
WITH base_establecimientos AS (
    SELECT 
        e.rbd,
        e.nombre_establecimiento,
        e.codigo_region,
        e.codigo_comuna,
        e.dependencia,
        r.rut_sostenedor
    FROM analytics.dim_establecimiento e
    LEFT JOIN raw.mineduc_directorio r ON SPLIT_PART(e.rbd, '.', 1) = SPLIT_PART(r.rbd, '.', 1)
),
sostenedores_clean AS (
    SELECT DISTINCT ON (rut_sostenedor)
        rut_sostenedor,
        nombre_sostenedor
    FROM analytics.dim_sostenedor
)
SELECT 
    b.rbd,
    b.nombre_establecimiento,
    b.codigo_region,
    b.codigo_comuna,
    b.dependencia,
    b.rut_sostenedor,
    s.nombre_sostenedor,
    
    -- Métricas
    m.matricula_total,
    a.tasa_asistencia,
    v.total_vulnerable,
    CASE 
        WHEN m.matricula_total > 0 
        THEN v.total_vulnerable::FLOAT / m.matricula_total 
        ELSE 0 
    END as proporcion_vulnerabilidad,
    
    -- Señales de Riesgo
    CASE WHEN a.tasa_asistencia < 0.85 THEN 1 ELSE 0 END as riesgo_asistencia,
    CASE WHEN (m.matricula_total > 0 AND (v.total_vulnerable::FLOAT / m.matricula_total) > 0.60) THEN 1 ELSE 0 END as riesgo_vulnerabilidad,
    
    -- Alerta Combinada
    CASE 
        WHEN a.tasa_asistencia < 0.85 AND (m.matricula_total > 0 AND (v.total_vulnerable::FLOAT / m.matricula_total) > 0.60) 
        THEN 'Roja'
        WHEN a.tasa_asistencia < 0.85 OR (m.matricula_total > 0 AND (v.total_vulnerable::FLOAT / m.matricula_total) > 0.60)
        THEN 'Amarilla'
        ELSE 'Verde'
    END as semaforo_riesgo,
    
    CURRENT_TIMESTAMP as built_at
FROM base_establecimientos b
LEFT JOIN sostenedores_clean s ON b.rut_sostenedor = s.rut_sostenedor
LEFT JOIN tmp_matricula m ON SPLIT_PART(b.rbd, '.', 1) = m.rbd_clean
LEFT JOIN tmp_asistencia a ON SPLIT_PART(b.rbd, '.', 1) = a.rbd_clean
LEFT JOIN tmp_vulnerabilidad v ON SPLIT_PART(b.rbd, '.', 1) = v.rbd_clean;

-- Comentarios
COMMENT ON TABLE analytics.mart_alerta_temprana_abril IS 'Mart analítico de riesgo escolar (Abril). Cruce de asistencia, matrícula y vulnerabilidad.';

COMMIT;
