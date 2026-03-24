# Bitácora de decisiones

## 2026-03-16
### Decisión
Se adopta una arquitectura de pipeline por capas: `raw -> staging -> analytics`.

### Motivo
Separar ingesta, normalización y modelado analítico para asegurar trazabilidad, control de calidad y mantenibilidad.

### Implicancia
Ningún dataset debe pasar directamente desde archivo fuente a tabla analítica final.

---

## 2026-03-16
### Decisión
La CLI queda definida como capa delgada de operación, no como capa de negocio.

### Motivo
Evitar acoplamiento, duplicación de lógica y dificultad para testing.

### Implicancia
La lógica operacional debe residir en `PipelineService` y servicios auxiliares.

---

## 2026-03-16
### Decisión
La IA queda fuera del critical path del pipeline.

### Motivo
El pipeline base debe ser determinístico, auditable y reproducible.

### Implicancia
La IA solo puede usarse como apoyo para documentación, clasificación o sugerencias no bloqueantes.

---

## 2026-03-16
### Decisión
El primer dataset E2E será el Directorio de Establecimientos del Mineduc.

### Motivo
Es una base estructural para el resto del modelo y permite construir la dimensión principal del sistema.

### Implicancia
El primer target analítico esperado es `analytics.dim_establecimiento`.

---

## 2026-03-16
### Decisión
Las fuentes iniciales del MVP se restringen a datos públicos oficiales.

### Motivo
Reducir riesgo jurídico, complejidad de acceso y dependencia de convenios o credenciales especiales.

### Implicancia
IDEA y otras fuentes no claramente abiertas quedan fuera de la automatización inicial.

---

## 2026-03-16
### Decisión
Cierre del Hito 1: Primer E2E Real Completado.

### Motivo
Validar la robustez del diseño del sistema con datos reales del Mineduc (`mineduc_directorio`).

### Implicancia
La arquitectura queda confirmada como apta para producción. El siguiente dataset prioritario es `mineduc_sostenedores`.

---

## 2026-03-16
### Decisión
Cierre del Hito 2: Segundo E2E Real Completado.

### Motivo
Validar la extensibilidad del pipeline con un dataset de estructura distinta (`mineduc_sostenedores`).

### Implicancia
El sistema demuestra capacidad multi-dataset. El próximo dataset prioritario es `mineduc_matricula`.

---

## 2026-03-16
### Decisión
Cierre del Hito 3: Tercer E2E Real Completado (Tabla de Hechos).

### Motivo
Validar la escalabilidad del sistema con un dataset de alto volumen (3.5M filas) y la integración de una tabla de hechos (`fact_matricula`).

### Implicancia
El pipeline es ahora capaz de manejar cargas masivas eficientemente usando `COPY`. La arquitectura de Radar ya soporta formalmente un modelo estrella básico con:
- `analytics.dim_establecimiento`
- `analytics.dim_sostenedor`
- `analytics.fact_matricula`

---

## 2026-03-17
### Decisión
Cierre del Hito 5: Cuarto E2E Real Completado (Asistencia).

### Motivo
Integrar el primer flujo de datos dinámicos (asistencia) sobre la base estructural de estudiantes (matrícula).

### Implicancia
El sistema ya opera con un modelo de **2 Dimensiones** y **2 Tablas de Hechos**, habilitando el cruce analítico matrícula + asistencia.

---

## 2026-03-17
### Decisión
Cierre del Hito 6: Quinto E2E Real Completado (SEP/Prioritarios).

### Motivo
Integrar datos de vulnerabilidad social para enriquecer el análisis de riesgo de deserción.

### Implicancia
Permite identificar brechas de equidad y enfocar esfuerzos en estudiantes prioritarios y preferentes.
