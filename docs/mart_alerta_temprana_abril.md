# Mart Analítico: Alerta Temprana Abril

Este mart consolida información de asistencia, matrícula y vulnerabilidad a nivel de establecimiento para la detección temprana de riesgos escolares.

## Objetivo
Proporcionar una visión ejecutiva del riesgo preliminar basado en la asistencia del mes de abril y la concentración de estudiantes vulnerables (SEP).

## Tablas Fuente
- `analytics.dim_establecimiento`: Directorio base de establecimientos.
- `analytics.dim_sostenedor`: Información de sostenedores.
- `analytics.fact_matricula`: Datos de matrícula por estudiante.
- `analytics.fact_asistencia_abril`: Asistencia mensual por estudiante.
- `analytics.fact_sep_prioritarios`: Condición de vulnerabilidad (prioritario/preferente).
- `raw.mineduc_directorio`: Usada como puente para el vínculo Establecimiento -> Sostenedor.

## Lógica de Agregación y Métricas
- **Asistencia**: Se calcula como la suma de días asistidos dividida por la suma de días trabajados (`sum(dias_asistidos) / sum(dias_trabajados)`).
- **Vulnerabilidad**: Se consolidan las categorías `prioritario` y `preferente`. Un estudiante se considera vulnerable si tiene cualquiera de estas dos banderas activas ('1').
- **Relación Sostenedor**: Se vincula el RBD con el RUT del sostenedor mediante el directorio oficial del Mineduc en la capa `raw`.

## Señales de Alerta
- **Riesgo Asistencia**: Tasa de asistencia inferior al **85%**.
- **Riesgo Vulnerabilidad**: Concentración de estudiantes SEP (prioritarios + preferentes) superior al **60%** de la matrícula.
- **Semáforo**: 
  - **Roja**: Cumple ambos riesgos.
  - **Amarilla**: Cumple uno de los dos riesgos.
  - **Verde**: No presenta riesgos bajo estos umbrales.

## Supuestos y Límites
- **RBD Format**: Los RBDs en `fact_sep_prioritarios` se normalizaron eliminando decimales (ej: '10763.0' -> '10763').
- **Duplicates**: En caso de múltiples registros para un mismo sostenedor en `dim_sostenedor`, se utiliza el primero encontrado para asegurar una relación 1:1.
- **Cobertura**: El mart depende de la consistencia de los RBDs entre las distintas fuentes oficiales.
