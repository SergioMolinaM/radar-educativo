# Radar Educativo

Plataforma de inteligencia operativa para Servicios Locales de Educacion Publica (SLEPs).
No es un visor de datos — es el espacio de trabajo diario del equipo directivo.
Alertas, brechas, proyecciones y acciones concretas.

## Deploy y accesos

- **Produccion**: https://radar-educativo.netlify.app
- **GitHub**: SergioMolinaM/radar-educativo (privado)
- **Login demo**: admin@slep-barrancas.cl / demo2026

## Stack

```
web/          React 18 + Vite + Recharts + Leaflet (dashboard SPA)
api/          FastAPI + Python (backend, pipeline de datos)
database/     PostgreSQL schemas, views, marts
data/         CSVs MINEDUC + PDFs IDEA + PALs (excluidos de git, en local)
```

## Inicio rapido

```bash
# Frontend (modo demo, sin backend)
cd web && npm install && npm run dev
# Abre http://localhost:5176
```

## Datos reales integrados (SLEP Barrancas)

Todos los datos visibles provienen de fuentes oficiales. NO hay datos inventados.

| Dato | Fuente | Periodo | Estado |
|------|--------|---------|--------|
| 53 EE (nombres, RBD, comunas, coordenadas) | Directorio MINEDUC | 2025 | Integrado |
| Matricula por EE (20.991 total) | Matricula MINEDUC | 2025 | Integrado |
| Asistencia por EE (53 EE) | Asistencia Declarada Marzo | 2025 | Integrado |
| Tendencia asistencia 10 meses | Asistencia Declarada Mar-Dic | 2025 | Integrado |
| Rendimiento por EE (aprobacion, retiro) | Rendimiento MINEDUC | 2025 | Integrado |
| Alumnos SEP por EE (16.501 alumnos) | SEP MINEDUC | 2025 | Integrado |
| Egresados EM (1.049 de 1.141) | Egresados MINEDUC | 2024 | Integrado |
| Titulados TP (5 liceos, 210 alumnos) | Titulados TP MINEDUC | 2024 | Integrado |
| ENEP 5 OEs con metas y avance | PDFs IDEA ENEP | 2025 | Integrado |
| PAL Los Parques (19 indicadores, CGE, PME) | PDF oficial PAL 2026 | Jul 2025 | Integrado |
| Calendario normativo (16 hitos) | Plazos legales reales | 2026 | Integrado |
| Ejecucion presupuestaria | Sin fuente real | - | En construccion |

## BBDD disponibles (en data/bbdd_mineduc/, no en git)

### Procesadas e integradas
- Directorio-Oficial-EE-2025 (mineduc_directorio.csv)
- Matricula-por-estudiante-2025 (mineduc_matricula.csv)
- Asistencia-declarada Mar a Dic 2025 (10 CSVs mensuales)
- Asistencia-anual-2025 (ASISTENCIA_ANUAL_PUBL_2025.csv)
- Rendimiento-por-estudiante-2025 (mineduc_rendimiento.csv)
- Alumnos-SEP-2025 (mineduc_sep_prioritarios.csv)
- Egresados-EM-2024 (mineduc_egresados_em.csv)
- Practicantes-y-Titulados-TP-2024 (mineduc_practicantes_titulados_tp.csv)

### Disponibles, pendientes de procesar
- SAE_2025 (11 CSVs: oferta, postulantes, postulaciones)
- NEM-y-Percentil-Jovenes-2023
- NEM-y-Percentil-Adultos-2023
- Matricula-Parvularia-2025
- Registro-Publico-Digital-2025
- EXAMENES-LIBRES-2024
- IDEA descargasPDF (31 PDFs: SIMCE, docentes, directivos, jardines, etc.)
- PALs: Barrancas, Los Parques, La Quebrada, Los Pinos, Puelche

## Componentes del dashboard

| Componente | Archivo | Datos |
|-----------|---------|-------|
| Briefing diario (popup) | BriefingDiario.jsx | Alertas + compromisos + calendario |
| KPIs compactos | KpiCard.jsx | EE, matricula, asistencia, ejecucion |
| Semaforo cruzado | SemaforoCruzado.jsx | EE con rojo en multiples dimensiones |
| Proyeccion a diciembre | BrechaAcumulada.jsx | 5 indicadores clave con tendencia |
| Calendario normativo | TimelineNormativa.jsx | 16 hitos legales 2026 con countdown |
| ENEP Objetivos | ENEPPanel.jsx | 5 OEs con semaforo rojo/naranja/verde |
| Compromisos | CompromisosPanel.jsx | Atrasados + proximos con responsables |
| Tendencia asistencia | Dashboard.jsx | Grafico 10 meses reales |
| Mapa territorial | MapaTerritorial.jsx | 53 EE con coords reales, tile dark |
| Brechas entre EE | Ranking.jsx | Ranking por multiples metricas |
| Avance PAL 2026 | PlanAnual.jsx | Barrancas + Los Parques (demo) |

## Reglas de trabajo

1. **Solo datos reales.** Todo dato visible debe tener fuente oficial. Si no hay dato, mostrar "Sin dato" o "En construccion".
2. **No competir con IDEA.** Radar es complementario. Citar IDEA solo como fuente de datos.
3. **Orientado a accion.** Cada feature responde: "Esto ayuda al director a decidir HOY?"
4. **Datos base 2025, gestion 2026.** Los datos mas recientes son 2025. La gestion es 2026.
5. **Comunas Barrancas**: Cerro Navia, Lo Prado, Pudahuel. NO incluye Estacion Central.
6. **Umbrales semaforo asistencia**: Rojo <80%, Naranja 80-88%, Verde >=88%.

## Licencia

Propietario - Tercera Letra SpA. Todos los derechos reservados.
