# Mart Analítico: Alerta Temprana Abril-Julio

Este mart proporciona una visión comparativa de la asistencia y el riesgo escolar entre los meses de abril y julio de 2025.

## Objetivo
Evaluar la evolución del riesgo de los establecimientos educativos, permitiendo identificar tendencias de mejora o deterioro en la asistencia de los estudiantes.

## Tablas Fuente
- `analytics.mart_alerta_temprana_abril`: Mart base con datos de abril y vulnerabilidad.
- `analytics.fact_asistencia_julio`: Datos de asistencia del mes de julio.

## Estructura de la Tabla (`analytics.mart_alerta_temprana_abril_julio`)

| Columna | Descripción |
|---------|-------------|
| `rbd` | Rol Base de Datos del establecimiento. |
| `nombre_establecimiento` | Nombre oficial del establecimiento. |
| `tasa_asistencia_abr` | Tasa de asistencia agregada en abril. |
| `tasa_asistencia_jul` | Tasa de asistencia agregada en julio. |
| `delta_asistencia` | Diferencia simple (`julio - abril`). |
| `semaforo_jul` | Estado de alerta en julio (Verde, Amarilla, Roja). |
| `tendencia_asistencia` | Clasificación de la tendencia (Mejora, Estable, Empeoramiento). |

## Lógica de Tendencia
- **Empeoramiento Crítico**: Caída en la tasa de asistencia mayor al 5% (`delta < -0.05`).
- **Mejora Significativa**: Incremento en la tasa de asistencia mayor al 5% (`delta > 0.05`).
- **Estable**: Variación dentro del rango +/- 5%.

## Resultados Generales (Snapshot 2026-03-17)
- **Total Establecimientos**: 16,768
- **Distribución de Riesgo (Julio)**:
    - Verde: 7,132
    - Amarilla: 5,241
    - Roja: 4,395
- **Distribución de Tendencias**:
    - Estable: 7,637 (45%)
    - Tendencia a la baja: 5,207 (31%)
    - Empeoramiento Crítico: 3,590 (21%)
    - Mejora Significativa: 334 (2%)
