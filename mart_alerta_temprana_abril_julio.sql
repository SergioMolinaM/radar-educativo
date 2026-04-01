-- Mart Analítico: Comparativa Alerta Temprana Abril-Julio
-- Objetivo: Evaluar evolución del riesgo por asistencia entre abril y julio

BEGIN;

-- 1. Agregación de Asistencia (Julio)
CREATE TEMP TABLE tmp_asistencia_julio AS
SELECT 
    SPLIT_PART(rbd, '.', 1) as rbd_clean,
    SUM(CAST(dias_asistidos AS FLOAT)) as total_asistidos_jul,
    SUM(CAST(dias_trabajados AS FLOAT)) as total_trabajados_jul,
    CASE 
        WHEN SUM(CAST(dias_trabajados AS FLOAT)) > 0 
        THEN SUM(CAST(dias_asistidos AS FLOAT)) / SUM(CAST(dias_trabajados AS FLOAT))
        ELSE NULL 
    END as tasa_asistencia_jul
FROM analytics.fact_asistencia_julio
GROUP BY 1;

-- 2. Construcción del Mart Final
DROP TABLE IF EXISTS analytics.mart_alerta_temprana_abril_julio;

CREATE TABLE analytics.mart_alerta_temprana_abril_julio AS
SELECT 
    m1.rbd,
    m1.nombre_establecimiento,
    m1.codigo_region,
    m1.codigo_comuna,
    m1.dependencia,
    m1.rut_sostenedor,
    m1.nombre_sostenedor,
    
    -- Métricas Abril (de Mart 1)
    m1.matricula_total as matricula_abril,
    m1.tasa_asistencia as tasa_asistencia_abr,
    m1.total_vulnerable,
    m1.proporcion_vulnerabilidad,
    m1.semaforo_riesgo as semaforo_abr,
    
    -- Métricas Julio (nuevas)
    aj.tasa_asistencia_jul,
    
    -- Comparativa
    (aj.tasa_asistencia_jul - m1.tasa_asistencia) as delta_asistencia,
    
    -- Nuevas Señales (Julio)
    CASE WHEN aj.tasa_asistencia_jul < 0.85 THEN 1 ELSE 0 END as riesgo_asistencia_jul,
    
    -- Semáforo Julio (Mantenemos criterio de vulnerabilidad de Abril por simplicidad o usamos el mismo si SEP no ha cambiado)
    -- En este enfoque usamos la proporcion_vulnerabilidad ya calculada en Mart 1
    CASE 
        WHEN aj.tasa_asistencia_jul < 0.85 AND m1.proporcion_vulnerabilidad > 0.60 
        THEN 'Roja'
        WHEN aj.tasa_asistencia_jul < 0.85 OR m1.proporcion_vulnerabilidad > 0.60
        THEN 'Amarilla'
        ELSE 'Verde'
    END as semaforo_jul,
    
    -- Alerta de Tendencia
    CASE 
        WHEN (aj.tasa_asistencia_jul - m1.tasa_asistencia) < -0.05 THEN 'Empeoramiento Crítico'
        WHEN (aj.tasa_asistencia_jul - m1.tasa_asistencia) < 0 THEN 'Tendencia a la baja'
        WHEN (aj.tasa_asistencia_jul - m1.tasa_asistencia) > 0.05 THEN 'Mejora Significativa'
        ELSE 'Estable'
    END as tendencia_asistencia,
    
    CURRENT_TIMESTAMP as built_at
FROM analytics.mart_alerta_temprana_abril m1
LEFT JOIN tmp_asistencia_julio aj ON SPLIT_PART(m1.rbd, '.', 1) = aj.rbd_clean;

-- Comentarios
COMMENT ON TABLE analytics.mart_alerta_temprana_abril_julio IS 'Mart analítico comparativo de riesgo escolar (Abril vs Julio). Evalúa tendencia de asistencia.';

COMMIT;
