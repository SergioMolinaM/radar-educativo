# Política de calidad de datos

## Propósito
Esta política define las condiciones mínimas que debe cumplir un dataset para avanzar en el pipeline de Radar Data Platform.

## Principios generales
- Ningún dataset ingresa al sistema sin fuente identificada.
- Ningún archivo descargado se considera válido sin nombre estandarizado, timestamp de descarga y hash de integridad.
- Ningún dataset pasa a `staging` sin perfilado previo.
- Ningún dataset pasa a `analytics` sin validación satisfactoria y sin target canónico definido.
- Todo cambio de esquema debe quedar registrado.
- Toda validación fallida debe detener la promoción a la siguiente capa.
- Toda carga debe dejar trazabilidad en auditoría.

## Reglas mínimas por capa

### Ingesta / Raw
Un archivo puede cargarse a `raw` solo si:
- existe físicamente en la ruta esperada
- su nombre sigue la convención del proyecto
- su lectura fue exitosa
- su metadata mínima está disponible
- su hash fue registrado

### Perfilado
Un dataset se considera perfilado cuando:
- se identifican columnas
- se identifican tipos observados
- se reporta cantidad de filas
- se reporta cantidad de columnas
- se identifican llaves candidatas cuando aplique
- se genera el reporte JSON correspondiente

### Validación
Un dataset se considera validado cuando:
- contiene las columnas obligatorias definidas para su esquema
- no presenta cambios de esquema no autorizados
- cumple umbrales de nulos en campos críticos
- cumple reglas mínimas de consistencia de tipos
- no presenta errores bloqueantes definidos por el validador

### Staging
Un dataset puede promoverse a `staging` solo si:
- pasó validación
- su mapping fue resuelto cuando corresponde
- tiene tabla de staging definida
- la promoción fue ejecutada sin error
- queda pendiente o implementada una verificación post-staging de integridad estructural

### Analytics
Un dataset puede promoverse a `analytics` solo si:
- tiene target canónico definido
- pasó por `raw` y `staging`
- no existen errores bloqueantes previos
- la promoción respeta el modelo de negocio del proyecto

## Criterios de bloqueo
La promoción de un dataset debe abortarse si ocurre cualquiera de estas situaciones:
- archivo inexistente
- metadata crítica ausente
- target canónico no resuelto
- mapping obligatorio no disponible
- validación fallida
- error de lectura no recuperable
- error de carga en base de datos

## Trazabilidad mínima
Toda ejecución relevante debe registrar:
- dataset_id
- etapa
- estado
- timestamp
- detalle mínimo del resultado o error
