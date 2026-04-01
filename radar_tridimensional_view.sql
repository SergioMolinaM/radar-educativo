-- DATA WAREHOUSE: RADAR DATA PLATFORM
-- Capa: Analytics (Cubo Tridimensional Aislado Multi-Tenant)

CREATE OR REPLACE VIEW analytics.vh_radar_integral AS
WITH 
base_matricula AS (
    SELECT 
        rbd_liceo,
        nombre_establecimiento,
        SUM(alumnos_matriculados) AS total_matricula,
        AVG(porcentaje_asistencia) AS asistencia_promedio,
        MAX(rural_rbd) AS es_rural
    FROM staging.stg_mineduc_asistencia
    GROUP BY rbd_liceo, nombre_establecimiento
),

base_dotacion AS (
    SELECT 
        establecimiento,
        COUNT(DISTINCT rut_funcionario) AS total_funcionarios,
        SUM(CASE WHEN estamento = 'Docente' THEN 1 ELSE 0 END) AS total_docentes,
        SUM(renta_bruta) AS gasto_mensual_sueldos_clp
    FROM staging.stg_transparencia_dotacion
    WHERE anio = EXTRACT(YEAR FROM CURRENT_DATE)
    GROUP BY establecimiento
),

base_compras AS (
    SELECT 
        rut_slep,
        SUM(monto_neto_clp) AS gasto_operativo_compras_clp,
        COUNT(codigo_orden) AS cantidad_ordenes_activas
    FROM staging.stg_mercadopublico_ordenes
    WHERE estado = 'Aceptada'
    GROUP BY rut_slep
)

SELECT 
    m.rbd_liceo,
    m.nombre_establecimiento,
    m.total_matricula,
    m.asistencia_promedio,
    m.es_rural,

    COALESCE(d.total_funcionarios, 0) AS total_funcionarios,
    COALESCE(d.total_docentes, 0) AS total_docentes,
    COALESCE(d.gasto_mensual_sueldos_clp, 0) AS gasto_mensual_sueldos_clp,
    
    -- KPIs Maestros
    CASE 
        WHEN m.total_matricula > 0 THEN 
            ROUND(COALESCE(d.gasto_mensual_sueldos_clp, 0) / m.total_matricula, 0)
        ELSE 0 
    END AS costo_sueldo_por_alumno_clp,

    CASE 
        WHEN d.total_docentes > 0 THEN 
            ROUND(CAST(m.total_matricula AS NUMERIC) / d.total_docentes, 2)
        ELSE 0 
    END AS ratio_alumno_docente

FROM base_matricula m
LEFT JOIN base_dotacion d 
    ON m.nombre_establecimiento = d.establecimiento;
