# Criterios de cierre por etapa

## Etapa 1: Base de arquitectura
La etapa se considera cerrada cuando existen:
- documento de arquitectura v1
- modelo conceptual mínimo
- estructura base del repositorio
- CLI funcional
- servicios principales definidos

## Etapa 2: Base de calidad y gobernanza
La etapa se considera cerrada cuando existen:
- tests mínimos pasando
- política de calidad de datos
- bitácora de decisiones
- criterios de salida por etapa

## Etapa 3: Primer dataset perfilado y validado
La etapa se considera cerrada cuando el Directorio de Establecimientos:
- puede resolverse desde el catálogo
- puede leerse correctamente
- genera profile report
- pasa validación
- genera ficha técnica con metadata suficiente

## Etapa 4: Primer E2E completo [COMPLETADA]
La etapa se considera cerrada cuando el Directorio de Establecimientos:
- carga en `raw` [OK]
- promueve a `staging` [OK]
- promueve a `analytics.dim_establecimiento` [OK]

## Etapa 5: Replicación y Escala [COMPLETADA]
Se replica el flujo con datasets prioritarios adicionales.
- Dataset 2: `mineduc_sostenedores` [OK]
- Dataset 3: `mineduc_matricula` [OK]

## Etapa 6: Enriquecimiento y Cruce Analítico [COMPLETADA]
Integración de datos operativos de asistencia.
- Dataset 4: `mineduc_asistencia_abril` [OK]

## Etapa 7: Análisis de Equidad y Vulnerabilidad [EN PROCESO]
Integración de datos SEP (Prioritarios/Preferentes).
- Dataset 5: `mineduc_sep_prioritarios` [PENDIENTE]
