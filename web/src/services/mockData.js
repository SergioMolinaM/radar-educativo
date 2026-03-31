/**
 * Mock data for offline demo mode - SLEP Barrancas
 * Realistic Chilean public education data
 */

const ESTABLECIMIENTOS = [
  { rbd: 10001, nombre: 'Escuela Básica República de Francia', comuna: 'Pudahuel', nivel: 'Básica', matricula: 620, asistencia: 88.2, estado: 'verde' },
  { rbd: 10002, nombre: 'Liceo Bicentenario de Pudahuel', comuna: 'Pudahuel', nivel: 'Media', matricula: 890, asistencia: 91.5, estado: 'verde' },
  { rbd: 10003, nombre: 'Escuela Básica Presidente Salvador Allende', comuna: 'Cerro Navia', nivel: 'Básica', matricula: 410, asistencia: 82.1, estado: 'amarillo' },
  { rbd: 10004, nombre: 'Liceo Polivalente Cerro Navia', comuna: 'Cerro Navia', nivel: 'Media', matricula: 750, asistencia: 79.8, estado: 'rojo' },
  { rbd: 10005, nombre: 'Escuela Básica Pablo Neruda', comuna: 'Lo Prado', nivel: 'Básica', matricula: 380, asistencia: 90.3, estado: 'verde' },
  { rbd: 10006, nombre: 'Liceo Municipal de Lo Prado', comuna: 'Lo Prado', nivel: 'Media', matricula: 670, asistencia: 85.7, estado: 'verde' },
  { rbd: 10007, nombre: 'Escuela Básica Gabriela Mistral', comuna: 'Pudahuel', nivel: 'Básica', matricula: 520, asistencia: 87.4, estado: 'verde' },
  { rbd: 10008, nombre: 'Escuela Especial Santa Teresa', comuna: 'Cerro Navia', nivel: 'Especial', matricula: 95, asistencia: 76.2, estado: 'rojo' },
  { rbd: 10009, nombre: 'Escuela Básica Violeta Parra', comuna: 'Lo Prado', nivel: 'Básica', matricula: 445, asistencia: 89.1, estado: 'verde' },
  { rbd: 10010, nombre: 'Liceo Técnico Profesional Pudahuel Sur', comuna: 'Pudahuel', nivel: 'TP', matricula: 980, asistencia: 86.9, estado: 'verde' },
  { rbd: 10011, nombre: 'Escuela Básica Los Nogales', comuna: 'Pudahuel', nivel: 'Básica', matricula: 310, asistencia: 83.4, estado: 'amarillo' },
  { rbd: 10012, nombre: 'Escuela Básica República de México', comuna: 'Cerro Navia', nivel: 'Básica', matricula: 490, asistencia: 88.8, estado: 'verde' },
  { rbd: 10013, nombre: 'Liceo Industrial de Cerro Navia', comuna: 'Cerro Navia', nivel: 'TP', matricula: 720, asistencia: 84.2, estado: 'amarillo' },
  { rbd: 10014, nombre: 'Escuela Básica El Montijo', comuna: 'Pudahuel', nivel: 'Básica', matricula: 280, asistencia: 91.0, estado: 'verde' },
  { rbd: 10015, nombre: 'Escuela Básica Arturo Prat', comuna: 'Lo Prado', nivel: 'Básica', matricula: 350, asistencia: 86.5, estado: 'verde' },
  { rbd: 10016, nombre: 'Jardín Infantil Semillita', comuna: 'Pudahuel', nivel: 'Parvularia', matricula: 120, asistencia: 78.3, estado: 'rojo' },
  { rbd: 10017, nombre: 'Escuela Básica Diego Portales', comuna: 'Cerro Navia', nivel: 'Básica', matricula: 540, asistencia: 87.6, estado: 'verde' },
  { rbd: 10018, nombre: 'Liceo Polivalente Lo Prado', comuna: 'Lo Prado', nivel: 'Media', matricula: 810, asistencia: 83.9, estado: 'amarillo' },
  { rbd: 10019, nombre: 'Escuela Básica Estrella de Chile', comuna: 'Pudahuel', nivel: 'Básica', matricula: 395, asistencia: 90.7, estado: 'verde' },
  { rbd: 10020, nombre: 'Escuela Básica Manuel Rodríguez', comuna: 'Cerro Navia', nivel: 'Básica', matricula: 460, asistencia: 85.1, estado: 'verde' },
];

const totalMatricula = ESTABLECIMIENTOS.reduce((s, e) => s + e.matricula, 0);
const avgAsistencia = (ESTABLECIMIENTOS.reduce((s, e) => s + e.asistencia, 0) / ESTABLECIMIENTOS.length).toFixed(1);

// ─── AUTH ────────────────────────────────────────────────────────
export const mockAuth = {
  login: {
    access_token: 'demo-token-slep-barrancas-2026',
    token_type: 'bearer',
  },
  me: {
    id: 1,
    username: 'demo',
    email: 'demo@slepbarrancas.cl',
    nombre: 'Usuario Demo',
    rol: 'admin',
    slep: 'Barrancas',
  },
};

// ─── DASHBOARD ──────────────────────────────────────────────────
export const mockDashboard = {
  summary: {
    matricula_total: totalMatricula,
    asistencia_promedio: parseFloat(avgAsistencia),
    total_establecimientos: ESTABLECIMIENTOS.length,
    establecimientos_criticos: ESTABLECIMIENTOS.filter(e => e.estado === 'rojo').length,
    docentes_total: 1420,
    asistentes_educacion: 680,
    tasa_aprobacion: 91.3,
    tasa_repitencia: 3.2,
    ipc_promedio: 72.5,
    presupuesto_ejecutado: 78.4,
  },
  semaforos: ESTABLECIMIENTOS.map(e => ({
    rbd: e.rbd,
    nombre: e.nombre,
    comuna: e.comuna,
    estado: e.estado,
    asistencia: e.asistencia,
    matricula: e.matricula,
    alertas_activas: e.estado === 'rojo' ? 3 : e.estado === 'amarillo' ? 1 : 0,
  })),
  tendenciaAsistencia: [
    { mes: '2025-03', asistencia: 89.2 },
    { mes: '2025-04', asistencia: 87.8 },
    { mes: '2025-05', asistencia: 86.1 },
    { mes: '2025-06', asistencia: 84.5 },
    { mes: '2025-07', asistencia: 0 },
    { mes: '2025-08', asistencia: 85.9 },
    { mes: '2025-09', asistencia: 87.3 },
    { mes: '2025-10', asistencia: 88.0 },
    { mes: '2025-11', asistencia: 87.5 },
    { mes: '2025-12', asistencia: 86.2 },
    { mes: '2026-01', asistencia: 0 },
    { mes: '2026-02', asistencia: 0 },
    { mes: '2026-03', asistencia: 88.7 },
  ],
};

// ─── ALERTS ─────────────────────────────────────────────────────
export const mockAlerts = [
  { id: 1, tipo: 'asistencia', severity: 'critical', mensaje: 'Jardín Infantil Semillita: asistencia bajo 80% por 3 semanas consecutivas', rbd: 10016, fecha: '2026-03-28', leida: false },
  { id: 2, tipo: 'asistencia', severity: 'critical', mensaje: 'Liceo Polivalente Cerro Navia: asistencia bajo 80% por 2 semanas', rbd: 10004, fecha: '2026-03-27', leida: false },
  { id: 3, tipo: 'asistencia', severity: 'critical', mensaje: 'Escuela Especial Santa Teresa: asistencia crónica bajo 80%', rbd: 10008, fecha: '2026-03-26', leida: true },
  { id: 4, tipo: 'financiero', severity: 'warning', mensaje: 'Liceo Industrial de Cerro Navia: ejecución presupuestaria bajo 60%', rbd: 10013, fecha: '2026-03-25', leida: false },
  { id: 5, tipo: 'matricula', severity: 'warning', mensaje: 'Escuela Básica Los Nogales: baja de 15 estudiantes en marzo', rbd: 10011, fecha: '2026-03-24', leida: true },
  { id: 6, tipo: 'pedagogico', severity: 'info', mensaje: 'Resultados SIMCE 4° básico disponibles para análisis', rbd: null, fecha: '2026-03-20', leida: true },
  { id: 7, tipo: 'infraestructura', severity: 'warning', mensaje: 'Escuela Básica Presidente Salvador Allende: mantención pendiente gimnasio', rbd: 10003, fecha: '2026-03-18', leida: true },
  { id: 8, tipo: 'dotacion', severity: 'info', mensaje: 'Liceo Bicentenario de Pudahuel: 2 vacantes docentes sin cubrir', rbd: 10002, fecha: '2026-03-15', leida: true },
];

// ─── ESTABLISHMENTS ─────────────────────────────────────────────
export const mockEstablishments = {
  list: ESTABLECIMIENTOS.map(e => ({
    ...e,
    director: `Director/a ${e.nombre.split(' ').pop()}`,
    telefono: `+56 2 ${Math.floor(2000 + Math.random() * 8000)} ${Math.floor(1000 + Math.random() * 9000)}`,
    email: `contacto@${e.nombre.toLowerCase().replace(/\s+/g, '').slice(0, 12)}.cl`,
    docentes: Math.floor(e.matricula / 18),
    cursos: Math.floor(e.matricula / 35),
  })),
  // Returns detail for any rbd
  getDetail: (rbd) => {
    const e = ESTABLECIMIENTOS.find(x => x.rbd === parseInt(rbd)) || ESTABLECIMIENTOS[0];
    return {
      ...e,
      director: `María Fernanda González`,
      telefono: '+56 2 2345 6789',
      email: 'contacto@escuela.cl',
      docentes: Math.floor(e.matricula / 18),
      asistentes_educacion: Math.floor(e.matricula / 40),
      cursos: Math.floor(e.matricula / 35),
      indice_vulnerabilidad: 78.5,
      categoria_desempeno: 'Medio',
      pie: true,
      sep: true,
      jec: e.nivel !== 'Parvularia',
      programa_integracion: true,
      tendencia_matricula: [
        { anio: 2023, matricula: e.matricula - 40 },
        { anio: 2024, matricula: e.matricula - 15 },
        { anio: 2025, matricula: e.matricula + 5 },
        { anio: 2026, matricula: e.matricula },
      ],
      tendencia_asistencia: [
        { mes: '2026-01', valor: 0 },
        { mes: '2026-02', valor: 0 },
        { mes: '2026-03', valor: e.asistencia },
      ],
    };
  },
};

// ─── FINANCIAL ──────────────────────────────────────────────────
export const mockFinancial = {
  execution: {
    presupuesto_total: 18500000000,
    ejecutado: 14500000000,
    porcentaje_ejecucion: 78.4,
    por_subtitulo: [
      { subtitulo: '21 - Gastos en Personal', presupuesto: 12000000000, ejecutado: 10200000000, porcentaje: 85.0 },
      { subtitulo: '22 - Bienes y Servicios', presupuesto: 3500000000, ejecutado: 2450000000, porcentaje: 70.0 },
      { subtitulo: '24 - Transferencias', presupuesto: 1500000000, ejecutado: 1050000000, porcentaje: 70.0 },
      { subtitulo: '29 - Adquisición Activos', presupuesto: 800000000, ejecutado: 480000000, porcentaje: 60.0 },
      { subtitulo: '31 - Inversión Real', presupuesto: 700000000, ejecutado: 320000000, porcentaje: 45.7 },
    ],
    por_mes: [
      { mes: '2026-01', ejecutado: 1200000000 },
      { mes: '2026-02', ejecutado: 1350000000 },
      { mes: '2026-03', ejecutado: 1450000000 },
    ],
  },
  mercadoPublico: {
    ordenes: [
      { id: 'OC-2026-001', proveedor: 'Librerías Crisol SpA', descripcion: 'Material didáctico escolar', monto: 12500000, estado: 'Recepcionada', fecha: '2026-03-15' },
      { id: 'OC-2026-002', proveedor: 'Sodexo Chile SA', descripcion: 'Servicio de alimentación marzo', monto: 85000000, estado: 'En ejecución', fecha: '2026-03-01' },
      { id: 'OC-2026-003', proveedor: 'Aramark Chile SA', descripcion: 'Servicio de aseo establecimientos', monto: 32000000, estado: 'En ejecución', fecha: '2026-03-01' },
      { id: 'OC-2026-004', proveedor: 'Tecnología Educativa Ltda', descripcion: 'Notebooks laboratorio computación', monto: 28000000, estado: 'En proceso', fecha: '2026-03-20' },
      { id: 'OC-2026-005', proveedor: 'Constructora Renca SA', descripcion: 'Reparación techumbre gimnasio', monto: 45000000, estado: 'Adjudicada', fecha: '2026-03-22' },
    ],
    resumen: {
      total_ordenes: 5,
      monto_total: 202500000,
      en_ejecucion: 2,
      completadas: 1,
      en_proceso: 2,
    },
  },
};

// ─── SLEP ───────────────────────────────────────────────────────
export const mockSlep = {
  overview: {
    nombre: 'SLEP Barrancas',
    director_ejecutivo: 'Carlos Muñoz Sepúlveda',
    comunas: ['Pudahuel', 'Cerro Navia', 'Lo Prado'],
    total_establecimientos: ESTABLECIMIENTOS.length,
    matricula_total: totalMatricula,
    asistencia_promedio: parseFloat(avgAsistencia),
    docentes: 1420,
    asistentes: 680,
    presupuesto_anual: 18500000000,
    ejecucion_presupuestaria: 78.4,
    establecimientos_criticos: ESTABLECIMIENTOS.filter(e => e.estado === 'rojo').length,
    establecimientos_alerta: ESTABLECIMIENTOS.filter(e => e.estado === 'amarillo').length,
  },
  establecimientos: ESTABLECIMIENTOS.map(e => ({
    ...e,
    docentes: Math.floor(e.matricula / 18),
    cursos: Math.floor(e.matricula / 35),
  })),
  ranking: ESTABLECIMIENTOS
    .slice()
    .sort((a, b) => b.asistencia - a.asistencia)
    .map((e, i) => ({ ...e, posicion: i + 1 })),
  meses: [
    { valor: '2026-03', etiqueta: 'Marzo 2026' },
    { valor: '2026-02', etiqueta: 'Febrero 2026' },
    { valor: '2025-12', etiqueta: 'Diciembre 2025' },
    { valor: '2025-11', etiqueta: 'Noviembre 2025' },
    { valor: '2025-10', etiqueta: 'Octubre 2025' },
    { valor: '2025-09', etiqueta: 'Septiembre 2025' },
  ],
};

// ─── PEDAGOGICO ─────────────────────────────────────────────────
export const mockPedagogico = {
  simce: {
    anio: 2025,
    resultados: [
      { nivel: '4° Básico', lectura: 267, matematica: 258, promedio_nacional_lectura: 260, promedio_nacional_matematica: 252 },
      { nivel: '8° Básico', lectura: 248, matematica: 262, promedio_nacional_lectura: 252, promedio_nacional_matematica: 258 },
      { nivel: '2° Medio', lectura: 242, matematica: 255, promedio_nacional_lectura: 249, promedio_nacional_matematica: 250 },
    ],
    tendencia: [
      { anio: 2022, lectura_4b: 255, matematica_4b: 248 },
      { anio: 2023, lectura_4b: 260, matematica_4b: 252 },
      { anio: 2024, lectura_4b: 263, matematica_4b: 255 },
      { anio: 2025, lectura_4b: 267, matematica_4b: 258 },
    ],
  },
  rendimiento: {
    aprobacion: 91.3,
    reprobacion: 5.5,
    retiro: 3.2,
    por_nivel: [
      { nivel: 'Parvularia', aprobacion: 99.0, reprobacion: 0, retiro: 1.0 },
      { nivel: '1° a 4° Básico', aprobacion: 95.2, reprobacion: 2.1, retiro: 2.7 },
      { nivel: '5° a 8° Básico', aprobacion: 90.5, reprobacion: 6.0, retiro: 3.5 },
      { nivel: '1° a 2° Medio', aprobacion: 85.8, reprobacion: 9.2, retiro: 5.0 },
      { nivel: '3° a 4° Medio', aprobacion: 88.1, reprobacion: 7.4, retiro: 4.5 },
    ],
  },
};

// ─── PAL ────────────────────────────────────────────────────────
export const mockPal = {
  documentos: [
    { id: 1, nombre: 'PAL SLEP Barrancas 2026', tipo: 'PAL', estado: 'Vigente', fecha_creacion: '2025-12-15', fecha_actualizacion: '2026-03-01' },
    { id: 2, nombre: 'CGE Escuela Rep. de Francia', tipo: 'CGE', rbd: 10001, estado: 'Aprobado', fecha_creacion: '2025-11-20' },
    { id: 3, nombre: 'PME Liceo Bicentenario Pudahuel', tipo: 'PME', rbd: 10002, estado: 'En revisión', fecha_creacion: '2026-01-10' },
    { id: 4, nombre: 'CGE Liceo Polivalente Cerro Navia', tipo: 'CGE', rbd: 10004, estado: 'Aprobado', fecha_creacion: '2025-11-25' },
    { id: 5, nombre: 'PME Escuela Pablo Neruda', tipo: 'PME', rbd: 10005, estado: 'Vigente', fecha_creacion: '2026-02-01' },
  ],
  resumen: {
    total_documentos: 5,
    pal_vigentes: 1,
    cge_aprobados: 2,
    pme_en_revision: 1,
    pme_vigentes: 1,
    cobertura_cge: 85,
    cobertura_pme: 90,
  },
  documento: (id) => ({
    id: parseInt(id),
    nombre: `Documento PAL #${id}`,
    tipo: 'PAL',
    estado: 'Vigente',
    contenido: 'Contenido del documento de planificación anual local.',
    objetivos: [
      { id: 1, descripcion: 'Mejorar asistencia promedio sobre 90%', indicador: 'Tasa asistencia mensual', meta: 90, avance: 86.8 },
      { id: 2, descripcion: 'Reducir brecha SIMCE lectura 4° básico', indicador: 'Puntaje SIMCE', meta: 270, avance: 267 },
      { id: 3, descripcion: 'Ejecutar 95% del presupuesto anual', indicador: '% ejecución presupuestaria', meta: 95, avance: 78.4 },
    ],
  }),
  cge: (id) => ({
    id: parseInt(id),
    nombre: `Convenio de Gestión Educacional #${id}`,
    estado: 'Aprobado',
    compromisos: 12,
    cumplidos: 8,
    en_proceso: 3,
    pendientes: 1,
    porcentaje_cumplimiento: 66.7,
  }),
  pme: (id) => ({
    id: parseInt(id),
    nombre: `Plan de Mejoramiento Educativo #${id}`,
    estado: 'Vigente',
    areas: [
      { nombre: 'Gestión Pedagógica', acciones: 5, completadas: 3 },
      { nombre: 'Liderazgo', acciones: 4, completadas: 2 },
      { nombre: 'Convivencia Escolar', acciones: 3, completadas: 1 },
      { nombre: 'Gestión de Recursos', acciones: 4, completadas: 3 },
    ],
  }),
};

// ─── COMPROMISOS ────────────────────────────────────────────────
export const mockCompromisos = [
  { id: 1, descripcion: 'Implementar programa de reforzamiento en lectura para 4° básico', estado: 'en_progreso', fecha_limite: '2026-06-30', responsable: 'Coord. Pedagógica', avance: 45 },
  { id: 2, descripcion: 'Completar dotación docente en establecimientos con vacantes', estado: 'en_progreso', fecha_limite: '2026-04-15', responsable: 'RRHH', avance: 70 },
  { id: 3, descripcion: 'Ejecutar plan de mantención de infraestructura crítica', estado: 'pendiente', fecha_limite: '2026-07-31', responsable: 'Infraestructura', avance: 20 },
  { id: 4, descripcion: 'Implementar sistema de alerta temprana de deserción', estado: 'completado', fecha_limite: '2026-03-31', responsable: 'UTP', avance: 100 },
  { id: 5, descripcion: 'Capacitación docente en metodologías activas (40 hrs)', estado: 'en_progreso', fecha_limite: '2026-08-30', responsable: 'Formación Continua', avance: 35 },
  { id: 6, descripcion: 'Revisión y actualización de PME de todos los establecimientos', estado: 'en_progreso', fecha_limite: '2026-05-31', responsable: 'Planificación', avance: 60 },
  { id: 7, descripcion: 'Licitación servicio de alimentación segundo semestre', estado: 'pendiente', fecha_limite: '2026-06-15', responsable: 'Adquisiciones', avance: 10 },
  { id: 8, descripcion: 'Evaluación diagnóstica DIA primer semestre', estado: 'completado', fecha_limite: '2026-03-28', responsable: 'UTP', avance: 100 },
];

// ─── URL MATCHER ────────────────────────────────────────────────
/**
 * Given an axios config (url + method), return the matching mock data or null.
 */
export function getMockForRequest(config) {
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();

  // AUTH
  if (url.includes('/auth/login') && method === 'post') return mockAuth.login;
  if (url.includes('/auth/me')) return mockAuth.me;

  // DASHBOARD
  if (url.includes('/dashboard/summary')) return mockDashboard.summary;
  if (url.includes('/dashboard/semaforos')) return mockDashboard.semaforos;
  if (url.includes('/dashboard/tendencia-asistencia')) return mockDashboard.tendenciaAsistencia;

  // ALERTS
  if (url.includes('/alerts')) return mockAlerts;

  // ESTABLISHMENTS
  const estMatch = url.match(/\/establishments\/(\d+)/);
  if (estMatch) return mockEstablishments.getDetail(estMatch[1]);
  if (url.includes('/establishments')) return mockEstablishments.list;

  // FINANCIAL
  if (url.includes('/financial/execution')) return mockFinancial.execution;
  if (url.includes('/financial/mercado-publico')) return mockFinancial.mercadoPublico;

  // SLEP
  const slepEstMatch = url.match(/\/slep\/establecimiento\/(\d+)/);
  if (slepEstMatch) return mockEstablishments.getDetail(slepEstMatch[1]);
  if (url.includes('/slep/establecimientos')) return mockSlep.establecimientos;
  if (url.includes('/slep/overview')) return mockSlep.overview;
  if (url.includes('/slep/ranking')) return mockSlep.ranking;
  if (url.includes('/slep/meses')) return mockSlep.meses;

  // PEDAGOGICO
  if (url.includes('/pedagogico/simce')) return mockPedagogico.simce;
  if (url.includes('/pedagogico/rendimiento')) return mockPedagogico.rendimiento;

  // PAL
  const palDocMatch = url.match(/\/pal\/documento\/(\d+)/);
  if (palDocMatch) return mockPal.documento(palDocMatch[1]);
  const palCgeMatch = url.match(/\/pal\/cge\/(\d+)/);
  if (palCgeMatch) return mockPal.cge(palCgeMatch[1]);
  const palPmeMatch = url.match(/\/pal\/pme\/(\d+)/);
  if (palPmeMatch) return mockPal.pme(palPmeMatch[1]);
  if (url.includes('/pal/documentos')) return mockPal.documentos;
  if (url.includes('/pal/resumen')) return mockPal.resumen;

  // COMPROMISOS
  if (url.includes('/compromisos') && method === 'patch') {
    const compMatch = url.match(/\/compromisos\/(\d+)/);
    if (compMatch) {
      const c = mockCompromisos.find(x => x.id === parseInt(compMatch[1]));
      return c || mockCompromisos[0];
    }
  }
  if (url.includes('/compromisos')) return mockCompromisos;

  return null;
}
