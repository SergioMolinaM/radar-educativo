-- Esquema para el Plan Anual Local (PAL)
-- Capa de Analytics

CREATE TABLE IF NOT EXISTS analytics.pal_document (
    id SERIAL PRIMARY KEY,
    slep_nombre VARCHAR(255) NOT NULL,
    anio INTEGER NOT NULL,
    tipo_documento VARCHAR(100) NOT NULL,
    acto_administrativo VARCHAR(255),
    fecha_aprobacion DATE,
    file_path_principal TEXT,
    file_path_resolucion TEXT,
    estado_extraccion VARCHAR(50) DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_pal_doc UNIQUE (slep_nombre, anio, tipo_documento)
);

CREATE TABLE IF NOT EXISTS analytics.pal_linea (
    id SERIAL PRIMARY KEY,
    pal_id INTEGER REFERENCES analytics.pal_document(id) ON DELETE CASCADE,
    nombre_linea VARCHAR(255) NOT NULL,
    descripcion TEXT,
    orden INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics.pal_indicador (
    id SERIAL PRIMARY KEY,
    linea_id INTEGER REFERENCES analytics.pal_linea(id) ON DELETE CASCADE,
    nombre_indicador TEXT NOT NULL,
    meta VARCHAR(255),
    periodicidad VARCHAR(100),
    medio_verificacion TEXT,
    responsable VARCHAR(255),
    automatizable VARCHAR(50), -- si, parcial, manual
    observacion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comentarios para documentación
COMMENT ON TABLE analytics.pal_document IS 'Metadatos de los documentos PAL cargados';
COMMENT ON TABLE analytics.pal_linea IS 'Líneas estratégicas o secciones principales de cada PAL';
COMMENT ON TABLE analytics.pal_indicador IS 'Indicadores específicos extraídos de cada línea del PAL';
