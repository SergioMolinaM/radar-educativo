# Mart Analítico: Alerta Temprana por Sostenedor

Este mart consolida los indicadores de riesgo escolar a nivel de sostenedor, permitiendo una visión ejecutiva de la gestión territorial e institucional.

## Objetivo
Facilitar la identificación de sostenedores con alta concentración de establecimientos en riesgo o con tendencias de asistencia desfavorables.

## Tablas Fuente
- `analytics.mart_alerta_temprana_abril_julio`: Mart base a nivel de establecimiento (RBD).

## Estructura de la Tabla (`analytics.mart_alerta_temprana_sostenedor`)

| Columna | Descripción |
|---------|-------------|
| `rut_sostenedor` | Identificador único del sostenedor. |
| `nombre_sostenedor` | Nombre o razón social. |
| `num_establecimientos` | Cantidad total de establecimientos vinculados. |
| `matricula_total` | Suma de la matrícula de todos sus establecimientos (Abril). |
| `asistencia_promedio_julio` | Promedio de asistencia de julio ponderado por matrícula. |
| `delta_promedio_abril_julio` | Variación de la asistencia promedio entre abril y julio. |
| `num_rbd_rojo_julio` | Establecimientos con Semáforo Rojo en julio. |
| `pct_rbd_rojo_julio` | Proporción de establecimientos en rojo sobre el total del sostenedor. |
| `num_rbd_empeoramiento_critico` | Establecimientos con caída de asistencia > 5%. |
| `semaforo_sostenedor` | Clasificación final de riesgo del sostenedor (Verde, Amarilla, Roja). |

## Lógica del Semáforo de Sostenedor
- **Rojo**:
    - > 30% de sus establecimientos con empeoramiento crítico.
    - O > 25% de sus establecimientos con semáforo rojo en julio.
- **Amarillo**:
    - 15% - 30% con empeoramiento crítico.
    - O 10% - 25% con semáforo rojo en julio.
- **Verde**: Niveles inferiores a los umbrales de advertencia.

## Resultados Generales (Snapshot 2026-03-17)
- **Total Sostenedores**: 7,040
- **Distribución de Riesgo**:
    - **Verde**: 4,664 (66%)
    - **Roja**: 2,303 (33%)
    - **Amarilla**: 73 (1%)
