# Plan de Producto: Radar Educativo → Producto Vendible a SLEPs

## Posicionamiento
"La plataforma que unifica gestión educativa, financiera y operativa para SLEPs"

Complemento a IDEA (DEP), no competidor. IDEA = indicadores educativos.
Radar = decisiones operativas + alertas + finanzas.

## Modelo de Negocio Propuesto
- **Tier 1 - Básico**: $2.500.000 CLP/mes (~$2,500 USD) por SLEP
  - Dashboard semáforo, alertas automáticas, reportería básica
- **Tier 2 - Profesional**: $5.000.000 CLP/mes (~$5,000 USD) por SLEP
  - + Mercado Público integrado, PAL tracking, exportación avanzada
- **Tier 3 - Enterprise**: $8.000.000 CLP/mes (~$8,000 USD) por SLEP
  - + API, integraciones custom, soporte dedicado, SLA 99.5%

Con 5 SLEPs en Tier 2 = $25M CLP/mes = $300M CLP/año (~$300K USD/año)

## Roadmap de Desarrollo (12 semanas)

### FASE 1: Fundamentos (Semanas 1-3) - PRIORIDAD MÁXIMA
- [ ] Crear API FastAPI conectando backend Python con frontend React
- [ ] Implementar autenticación (JWT + roles: admin_slep, analista, viewer)
- [ ] Dockerizar todo (docker-compose: app + postgres + nginx)
- [ ] Mover credenciales a secrets management (.env fuera de git)
- [ ] Restructurar carpetas (monorepo: /api, /web, /shared, /infra)

### FASE 2: Dashboard Real (Semanas 4-6)
- [ ] Dashboard principal con semáforos por establecimiento
- [ ] Vista de alertas activas con filtros y priorización
- [ ] Panel financiero (ejecución presupuestaria, Mercado Público)
- [ ] Vista de asistencia/matrícula con tendencias
- [ ] Exportación PDF/Excel de reportes

### FASE 3: Diferenciadores (Semanas 7-9)
- [ ] Integración real Transparencia (reemplazar mock)
- [ ] Comparador inter-establecimientos
- [ ] Timeline de compromisos PAL con seguimiento
- [ ] Notificaciones por email cuando semáforo cambia a rojo
- [ ] Multi-SLEP (un deploy, múltiples clientes)

### FASE 4: Production-Ready (Semanas 10-12)
- [ ] CI/CD pipeline (GitHub Actions → deploy automático)
- [ ] Tests E2E (Playwright)
- [ ] Monitoreo (health checks, error tracking)
- [ ] Documentación de producto y onboarding
- [ ] Landing page comercial
- [ ] Demo environment para presentar a SLEPs

## Estructura de Carpetas Propuesta

```
radar-educativo/
├── api/                    # FastAPI backend
│   ├── main.py            # Entry point
│   ├── routers/           # Endpoints por dominio
│   │   ├── auth.py
│   │   ├── alerts.py
│   │   ├── dashboard.py
│   │   ├── establishments.py
│   │   └── financial.py
│   ├── services/          # Lógica de negocio (migrar de raíz)
│   ├── agents/            # Agentes de datos (migrar de raíz)
│   ├── models/            # Pydantic schemas
│   ├── db/                # Conexión y migraciones
│   └── config/            # Configuración
├── web/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   ├── alerts/
│   │   │   ├── financial/
│   │   │   └── shared/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/      # API client
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
├── database/               # SQL schemas y migraciones
├── infra/                  # Docker, nginx, CI/CD
│   ├── docker-compose.yml
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   └── nginx.conf
├── docs/                   # Documentación
├── tests/                  # Tests E2E
├── .github/workflows/      # CI/CD
├── .env.example
├── pyproject.toml
└── README.md
```

## Riesgos Principales
1. **IDEA (DEP) se expande**: si DEP agrega módulo financiero, perdemos diferenciador
   - Mitigación: velocidad de ejecución + features que gobierno no puede hacer rápido
2. **Presupuesto SLEP limitado**: SLEPs son nuevos, presupuestos ajustados
   - Mitigación: empezar con tier bajo, demostrar ROI rápido
3. **Datos mock**: si no reemplazamos transparencia mock, demo no convence
   - Mitigación: priorizar datos reales en Fase 3
4. **Dependencia de un dev**: bus factor = 1
   - Mitigación: documentar todo, código limpio, tests

## Métricas de Éxito para Demo
- Dashboard carga en < 2 segundos
- Semáforos visibles sin scroll
- 3 clicks máximo para llegar a cualquier dato
- Exportar reporte PDF en 1 click
- Login → dashboard en < 5 segundos
