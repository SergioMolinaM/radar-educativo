-- Mart Analítico: Alerta Temprana por Sostenedor
-- Objetivo: Vista ejecutiva de riesgo agregada por sostenedor basada en el Mart 2

BEGIN;

DROP TABLE IF EXISTS analytics.mart_alerta_temprana_sostenedor;

CREATE TABLE analytics.mart_alerta_temprana_sostenedor AS
WITH stats_sostenedor AS (
    SELECT 
        rut_sostenedor,
        MAX(nombre_sostenedor) as nombre_sostenedor, -- Tomamos el nombre más representativo
        COUNT(rbd) as num_establecimientos,
        SUM(matricula_abril) as matricula_total,
        SUM(total_vulnerable) as total_sep,
        
        -- Asistencia Ponderada
        SUM(tasa_asistencia_abr * matricula_abril) / NULLIF(SUM(matricula_abril), 0) as asistencia_promedio_abril,
        SUM(tasa_asistencia_jul * matricula_abril) / NULLIF(SUM(matricula_abril), 0) as asistencia_promedio_julio,
        
        -- Conteo de Riesgo
        COUNT(*) FILTER (WHERE semaforo_jul = 'Roja') as num_rbd_rojo_julio,
        COUNT(*) FILTER (WHERE tendencia_asistencia = 'Empeoramiento Crítico') as num_rbd_empeoramiento_critico
    FROM analytics.mart_alerta_temprana_abril_julio
    WHERE rut_sostenedor IS NOT NULL
    GROUP BY 1
)
SELECT 
    s.*,
    (asistencia_promedio_julio - asistencia_promedio_abril) as delta_promedio_abril_julio,
    total_sep::FLOAT / NULLIF(matricula_total, 0) as proporcion_sep_matricula,
    num_rbd_rojo_julio::FLOAT / NULLIF(num_establecimientos, 0) as pct_rbd_rojo_julio,
    num_rbd_empeoramiento_critico::FLOAT / NULLIF(num_establecimientos, 0) as pct_rbd_empeoramiento_critico,
    
    -- Semáforo Agregado
    CASE 
        WHEN (num_rbd_empeoramiento_critico::FLOAT / NULLIF(num_establecimientos, 0) > 0.30)
             OR (num_rbd_rojo_julio::FLOAT / NULLIF(num_establecimientos, 0) > 0.25)
        THEN 'Roja'
        WHEN (num_rbd_empeoramiento_critico::FLOAT / NULLIF(num_establecimientos, 0) BETWEEN 0.15 AND 0.30)
             OR (num_rbd_rojo_julio::FLOAT / NULLIF(num_establecimientos, 0) BETWEEN 0.10 AND 0.25)
        THEN 'Amarilla'
        ELSE 'Verde'
    END as semaforo_sostenedor,
    
    CURRENT_TIMESTAMP as built_at
FROM stats_sostenedor s;

-- Comentarios
COMMENT ON TABLE analytics.mart_alerta_temprana_sostenedor IS 'Vista ejecutiva de riesgo escolar por Sostenedor. Agregación de señales de RBDs.';

COMMIT;
