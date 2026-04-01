-- Definición de Tabla Maestra: Establecimientos (Chile)
-- Esta tabla consolida la identidad única de cada colegio/liceo

CREATE TABLE IF NOT EXISTS dim_establecimiento (
    rbd INTEGER PRIMARY KEY,
    nombre_establecimiento VARCHAR(255) NOT NULL,
    
    -- Dependencia Administrativa
    dependencia_id INTEGER,
    dependencia_glosa VARCHAR(100), -- Municipal, Particular Subvencionado, etc.
    
    -- Localización Territorial
    codigo_region INTEGER,
    nombre_region VARCHAR(100),
    codigo_comuna INTEGER,
    nombre_comuna VARCHAR(100),
    
    -- Características
    ruralidad_id INTEGER, -- 1: Rural, 2: Urbano (Estándar Mineduc)
    estado_establecimiento INTEGER, -- Activo, Receso, etc.
    
    -- Metadatos de Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_source VARCHAR(100) DEFAULT 'Mineduc'
);

-- Índices para optimización de búsquedas geográficas y administrativas
CREATE INDEX idx_establecimiento_comuna ON dim_establecimiento(codigo_comuna);
CREATE INDEX idx_establecimiento_region ON dim_establecimiento(codigo_region);
