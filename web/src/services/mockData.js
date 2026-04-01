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
    user: {
      id: 1,
      username: 'admin@slep-barrancas.cl',
      email: 'admin@slep-barrancas.cl',
      nombre: 'Director Demo',
      rol: 'admin',
      slep: 'Barrancas',
      slep_id: 'barrancas',
      slep_name: 'SLEP Barrancas',
    },
  },
  me: {
    id: 1,
    username: 'admin@slep-barrancas.cl',
    email: 'admin@slep-barrancas.cl',
    nombre: 'Director Demo',
    rol: 'admin',
    slep: 'Barrancas',
    slep_id: 'barrancas',
    slep_name: 'SLEP Barrancas',
  },
};

// ─── DASHBOARD ──────────────────────────────────────────────────
const rojosCount = ESTABLECIMIENTOS.filter(e => e.estado === 'rojo').length;
const naranjaCount = ESTABLECIMIENTOS.filter(e => e.estado === 'amarillo').length;
const verdeCount = ESTABLECIMIENTOS.filter(e => e.estado === 'verde').length;

export const mockDashboard = {
  summary: {
    kpis: {
      total_establecimientos: 53,
      ee_escuelas_liceos: 40,
      ee_jardines: 13,
      ee_con_datos: ESTABLECIMIENTOS.length,
      ee_oficial: 53,
      matricula_total: totalMatricula,
      asistencia_promedio: parseFloat(avgAsistencia),
      ejecucion_presupuestaria: 78.4,
      alertas_rojas: rojosCount,
      alertas_naranjas: naranjaCount,
      alertas_verdes: verdeCount,
    },
    tendencias: {
      matricula_variacion_anual: -1.2,
      asistencia_variacion_mensual: 0.7,
    },
    comunas: ['Pudahuel', 'Cerro Navia', 'Lo Prado'],
    mes_nombre: 'Marzo',
    cobertura_datos: `${ESTABLECIMIENTOS.length} EE con datos de asistencia`,
  },
  semaforos: {
    establecimientos: ESTABLECIMIENTOS.map(e => ({
      rbd: e.rbd,
      nombre: e.nombre,
      comuna: e.comuna,
      semaforo: e.estado === 'amarillo' ? 'naranja' : e.estado,
      asistencia: e.asistencia,
      matricula: e.matricula,
    })),
  },
  tendenciaAsistencia: {
    meses: [
      { mes: '2025-03', mes_nombre: 'Mar', asistencia: 89.2 },
      { mes: '2025-04', mes_nombre: 'Abr', asistencia: 87.8 },
      { mes: '2025-05', mes_nombre: 'May', asistencia: 86.1 },
      { mes: '2025-06', mes_nombre: 'Jun', asistencia: 84.5 },
      { mes: '2025-08', mes_nombre: 'Ago', asistencia: 85.9 },
      { mes: '2025-09', mes_nombre: 'Sep', asistencia: 87.3 },
      { mes: '2025-10', mes_nombre: 'Oct', asistencia: 88.0 },
      { mes: '2025-11', mes_nombre: 'Nov', asistencia: 87.5 },
      { mes: '2025-12', mes_nombre: 'Dic', asistencia: 86.2 },
      { mes: '2026-03', mes_nombre: 'Mar 26', asistencia: 88.7 },
    ],
  },
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
// PAL data for SLEP Barrancas (ID 1) and SLEP Los Parques (ID 2)
// CGE data for Los Parques is real — extracted from official PDF (Julio 2025)

const PAL_BARRANCAS = {
  documento: {
    slep: 'Barrancas', anio: 2026,
    acto_administrativo: 'Res. Ex. N° 142/2025', fecha_aprobacion: '2025-12-15', estado: 'Vigente',
  },
  lineas: [
    {
      nombre: 'OE1', descripcion: 'Mejorar trayectorias educativas y reducir inasistencia crónica',
      indicadores: [
        { nombre: 'Tasa inasistencia crónica (>10% días)', meta: '25%', avance: '38,4%', periodicidad: 'Mensual', responsable: 'Coord. Pedagógica', automatizable: 'si', formula: 'Alumnos >10% días sin asistencia / Total matrícula' },
        { nombre: 'Retención 1° Medio', meta: '95%', avance: '91,2%', periodicidad: 'Anual', responsable: 'UTP', automatizable: 'si' },
        { nombre: 'Cobertura PIE en establecimientos priorizados', meta: '100%', avance: '78%', periodicidad: 'Semestral', responsable: 'Div. Inclusión', automatizable: 'parcial' },
      ],
    },
    {
      nombre: 'OE2', descripcion: 'Mejorar resultados de aprendizaje — reducir EE en categoría Insuficiente',
      indicadores: [
        { nombre: '% EE categoría Insuficiente (SIMCE/evaluaciones)', meta: '15%', avance: '18,9%', periodicidad: 'Anual', responsable: 'Coord. Pedagógica', automatizable: 'si' },
        { nombre: 'Puntaje SIMCE 4° básico Lectura', meta: '270 pts', avance: '267 pts', periodicidad: 'Anual', responsable: 'UTP', automatizable: 'si' },
        { nombre: 'Establecimientos con acompañamiento pedagógico activo', meta: '100%', avance: '72%', periodicidad: 'Trimestral', responsable: 'Coord. Pedagógica', automatizable: 'parcial' },
      ],
    },
    {
      nombre: 'OE3', descripcion: 'Infraestructura digital y conectividad — Meta NTI',
      indicadores: [
        { nombre: 'Cobertura NTI (ratio alumnos/dispositivo)', meta: '80%', avance: '81,2%', periodicidad: 'Semestral', responsable: 'TIC', automatizable: 'parcial' },
        { nombre: 'EE con conectividad fibra óptica', meta: '90%', avance: '84%', periodicidad: 'Anual', responsable: 'TIC', automatizable: 'si' },
      ],
    },
    {
      nombre: 'OE4', descripcion: 'Docentes en norma y desarrollo profesional',
      indicadores: [
        { nombre: '% docentes en norma (evaluados según ley)', meta: '80%', avance: '67,3%', periodicidad: 'Anual', responsable: 'RRHH', automatizable: 'parcial' },
        { nombre: 'Horas formación docente por establecimiento', meta: '40 hrs', avance: '28 hrs', periodicidad: 'Semestral', responsable: 'RRHH', automatizable: 'manual' },
      ],
    },
    {
      nombre: 'OE5', descripcion: 'Titulación TP y vinculación con el mundo del trabajo',
      indicadores: [
        { nombre: '% egresados TP titulados', meta: '65%', avance: '52,1%', periodicidad: 'Anual', responsable: 'Coord. TP', automatizable: 'parcial' },
        { nombre: 'Convenios empresa-liceo vigentes', meta: '80', avance: '54', periodicidad: 'Anual', responsable: 'Coord. TP', automatizable: 'manual' },
      ],
    },
    {
      nombre: 'ATP1', descripcion: 'Acompañamiento técnico pedagógico a establecimientos priorizados',
      indicadores: [
        { nombre: 'Visitas de acompañamiento realizadas', meta: '4/EE/año', avance: '1.2/EE', periodicidad: 'Trimestral', responsable: 'Coord. Pedagógica', automatizable: 'manual' },
        { nombre: 'EE con plan de mejora actualizado', meta: '53', avance: '38', periodicidad: 'Semestral', responsable: 'UTP', automatizable: 'manual' },
      ],
    },
  ],
};

const CGE_BARRANCAS = {
  cge: [
    { objetivo: 'OBJ 1', indicador_nombre: 'Trayectorias educativas — Asistencia y retención', meta: '—', ponderacion: '25%', resultado_obtenido: '—', ponderacion_alcanzada: '—', observacion: 'Objetivo paraguas' },
    { objetivo: 'OBJ 1.1', indicador_nombre: 'Asistencia promedio SLEP (sin ed. adultos)', meta: '82%', ponderacion: '15%', resultado_obtenido: '86,8%', ponderacion_alcanzada: '15%', observacion: 'Meta superada' },
    { objetivo: 'OBJ 1.2', indicador_nombre: 'Reducción inasistencia crónica', meta: '25%', ponderacion: '10%', resultado_obtenido: '38,4%', ponderacion_alcanzada: '0%', observacion: 'ALERTA: 13,4 pp sobre meta. Requiere plan de acción urgente.' },
    { objetivo: 'OBJ 2', indicador_nombre: 'Aprendizaje — Categoría desempeño EE', meta: '—', ponderacion: '25%', resultado_obtenido: '—', ponderacion_alcanzada: '—', observacion: 'Objetivo paraguas' },
    { objetivo: 'OBJ 2.1', indicador_nombre: '% EE en categoría Insuficiente', meta: '15%', ponderacion: '15%', resultado_obtenido: '18,9%', ponderacion_alcanzada: '0%', observacion: 'Bajo la meta. 10 EE requieren acompañamiento reforzado.' },
    { objetivo: 'OBJ 2.2', indicador_nombre: 'SIMCE 4° Básico Lectura', meta: '270', ponderacion: '10%', resultado_obtenido: '267', ponderacion_alcanzada: '7%', observacion: '3 puntos bajo meta' },
    { objetivo: 'OBJ 3', indicador_nombre: 'Infraestructura y NTI', meta: '80%', ponderacion: '15%', resultado_obtenido: '81,2%', ponderacion_alcanzada: '15%', observacion: 'Meta alcanzada' },
    { objetivo: 'OBJ 4', indicador_nombre: 'Docentes en norma evaluación', meta: '80%', ponderacion: '20%', resultado_obtenido: '67,3%', ponderacion_alcanzada: '0%', observacion: 'ALERTA: 8 vacantes sin cubrir. 12,7 pp bajo meta.' },
    { objetivo: 'OBJ 5', indicador_nombre: 'Titulación TP egresados', meta: '65%', ponderacion: '15%', resultado_obtenido: '52,1%', ponderacion_alcanzada: '0%', observacion: 'Bajo meta. Coordinación con SENCE pendiente.' },
  ],
};

const PME_BARRANCAS = {
  total_ee: 38,
  promedio_cumplimiento: 62,
  ee_sobre_70: 22,
  ee_criticos: 5,
  establecimientos: [
    { rbd: 10002, nombre_ee: 'Liceo Bicentenario de Pudahuel', comuna: 'Pudahuel', n_acciones_liderazgo: 4, n_acciones_gestion_pedagogica: 4, n_acciones_convivencia: 3, n_acciones_recursos: 4, total_acciones: 15, pct_cumplimiento: '80' },
    { rbd: 10006, nombre_ee: 'Liceo Municipal de Lo Prado', comuna: 'Lo Prado', n_acciones_liderazgo: 3, n_acciones_gestion_pedagogica: 3, n_acciones_convivencia: 3, n_acciones_recursos: 3, total_acciones: 12, pct_cumplimiento: '75' },
    { rbd: 10001, nombre_ee: 'Escuela Básica República de Francia', comuna: 'Pudahuel', n_acciones_liderazgo: 3, n_acciones_gestion_pedagogica: 4, n_acciones_convivencia: 3, n_acciones_recursos: 3, total_acciones: 13, pct_cumplimiento: '69' },
    { rbd: 10010, nombre_ee: 'Liceo TP Pudahuel Sur', comuna: 'Pudahuel', n_acciones_liderazgo: 3, n_acciones_gestion_pedagogica: 3, n_acciones_convivencia: 2, n_acciones_recursos: 3, total_acciones: 11, pct_cumplimiento: '64' },
    { rbd: 10004, nombre_ee: 'Liceo Polivalente Cerro Navia', comuna: 'Cerro Navia', n_acciones_liderazgo: 2, n_acciones_gestion_pedagogica: 2, n_acciones_convivencia: 2, n_acciones_recursos: 2, total_acciones: 8, pct_cumplimiento: '25' },
  ],
};

// ─── LOS PARQUES — datos reales del PAL 2026 (PDF oficial, corte julio 2025) ──
const PAL_LOS_PARQUES = {
  documento: {
    slep: 'Los Parques', anio: 2026,
    acto_administrativo: 'Res. Ex. Dic. 2025', fecha_aprobacion: '2025-12-01', estado: 'Vigente',
    director: 'Ulises Jaque Carreño', comunas: 'Quinta Normal y Renca',
    total_ee: 52, matricula_ee: 16070, matricula_jardines: 1768,
  },
  lineas: [
    {
      nombre: 'OE1', descripcion: 'Elaborar e implementar PEL, PA y toda iniciativa que agregue valor a trayectorias estudiantiles',
      indicadores: [
        { nombre: 'Cumplimiento metas anuales del Plan Anual (PA)', meta: '85%', avance: '16,67%', periodicidad: 'Anual', responsable: 'Director Ejecutivo', automatizable: 'parcial', observacion: 'Solo 2 de 12 acciones del PA con cumplimiento completo al corte julio 2025.', formula: 'Acciones PA cumplidas / Total acciones PA' },
      ],
    },
    {
      nombre: 'OE2', descripcion: 'Liderar y asegurar procesos eficientes de gestión administrativa, escolar e innovación',
      indicadores: [
        { nombre: 'Índice de gestión de recursos', meta: '100%', avance: '28,41%', periodicidad: 'Trimestral', responsable: 'Director Ejecutivo', automatizable: 'si', observacion: 'Avance mixto: Plan Sostenibilidad 18,75% (3/16 acciones) + ejecución presupuestaria 38,07%. Se espera cumplimiento total en enero 2026.' },
        { nombre: 'Cumplimiento del Plan de Sostenibilidad Financiera', meta: '100%', avance: '18,75%', periodicidad: 'Trimestral', responsable: 'Finanzas', automatizable: 'si', observacion: '3 de 16 acciones ejecutadas. Riesgo de liquidez.' },
        { nombre: 'Porcentaje de ejecución presupuestaria', meta: '90%', avance: '38,07%', periodicidad: 'Mensual', responsable: 'Subdirección Planificación', automatizable: 'si', observacion: '$616.665.678 ejecutados al 31 julio. Ritmo bajo — riesgo subejecución.' },
      ],
    },
    {
      nombre: 'OE3', descripcion: 'Fomentar procesos participativos, cultura de mejora educativa y generación de capacidades comunitarias',
      indicadores: [
        { nombre: 'Índice de participación y articulación local', meta: '100%', avance: '55,77%', periodicidad: 'Semestral', responsable: 'Subdirección Apoyo Técnico', automatizable: 'parcial', observacion: '16 de 26 acciones ejecutadas + 3 de 6 convenios suscritos. Se espera cumplimiento total en dic 2026.' },
        { nombre: 'Cumplimiento plan trabajo Consejos Escolares, Parvularia, Local y Comité Directivo', meta: '100%', avance: '61,54%', periodicidad: 'Semestral', responsable: 'Subdirección Apoyo Técnico', automatizable: 'manual', observacion: '16 de 26 acciones contempladas en Plan de Trabajo. Acciones pendientes en ejecución.' },
        { nombre: 'Porcentaje de convenios suscritos con entidades públicas o privadas', meta: '100%', avance: '50%', periodicidad: 'Anual', responsable: 'Director Ejecutivo', automatizable: 'manual', observacion: '3 de 6 convenios formalizados al 31 julio. Restantes esperados oct-nov.' },
      ],
    },
    {
      nombre: 'OE4', descripcion: 'Implementar programas de transferencia y desarrollo de capacidades de equipos del SLEP',
      indicadores: [
        { nombre: 'Índice de desarrollo de capacidades del personal del SLEP', meta: '75%', avance: '50%', periodicidad: 'Anual', responsable: 'Gestión y Desarrollo de Personas', automatizable: 'manual', observacion: 'Compuesto únicamente por indicador 4.1.3 para el año en curso.' },
        { nombre: 'Cumplimiento plan fortalecimiento capacidades equipo directivo nivel central', meta: '100%', avance: '50%', periodicidad: 'Anual', responsable: 'Gestión y Desarrollo de Personas', automatizable: 'manual', observacion: '3 de 6 acciones ejecutadas. Se espera cumplimiento en octubre.' },
      ],
    },
    {
      nombre: 'OE5', descripcion: 'Demostrar capacidades y competencias para liderar el SLEP y promover mejora continua',
      indicadores: [
        { nombre: 'Resultado evaluación de desempeño por Director/a DEP', meta: '100%', avance: '0%', periodicidad: 'Anual', responsable: 'Director Ejecutivo', automatizable: 'manual', observacion: 'Evaluación no iniciada. Sin avances al corte julio. Riesgo de incumplimiento legal.' },
      ],
    },
    {
      nombre: 'ATP1', descripcion: 'Acciones para cumplimiento del CGE — Asistencia y cartera de inversión',
      indicadores: [
        { nombre: 'Medidas para incremento asistencia en EE del territorio', meta: '100%', avance: 'S/I', periodicidad: 'Anual', responsable: 'Unidad Apoyo Técnico Pedagógico', automatizable: 'parcial', observacion: 'Plan de medidas debe incluir detalle, fechas límite (30 nov) y reportes intermedios (julio) y anuales (diciembre).' },
        { nombre: 'Seguimiento ejecución cartera de proyectos de inversión', meta: '100%', avance: 'S/I', periodicidad: 'Trimestral', responsable: 'Unidad Infraestructura y Mantenimiento', automatizable: 'si', observacion: 'Reportes trimestrales de ejecución. Detección temprana de desviaciones.' },
      ],
    },
    {
      nombre: 'ATP2', descripcion: 'Acciones para instalación del servicio — Liderazgo, RICE, PEL y monitoreo',
      indicadores: [
        { nombre: 'Diagnóstico necesidades capacitación liderazgo directivo', meta: '100%', avance: 'S/I', periodicidad: 'Anual', responsable: 'Gestión y Desarrollo de Personas', automatizable: 'manual', observacion: 'Diagnóstico a 52 EE. Instrumento virtual o presencial. Informe a Dirección Ejecutiva en mayo.' },
        { nombre: 'Plan aumento directores nombrados por ADP', meta: '100%', avance: 'S/I', periodicidad: 'Semestral', responsable: 'Gestión y Desarrollo de Personas', automatizable: 'manual', observacion: 'Programación de acciones enviada vía memorándum a Dirección Ejecutiva en julio.' },
        { nombre: 'Monitoreo ejecución presupuestaria', meta: '100%', avance: 'S/I', periodicidad: 'Mensual', responsable: 'Subdirección Planificación y Control', automatizable: 'si', observacion: 'Reportes mensuales + trimestrales. Incluir información cuantitativa y cualitativa.' },
        { nombre: 'Monitoreo recursos SEP', meta: '100%', avance: 'S/I', periodicidad: 'Trimestral', responsable: 'Subdirección Planificación y Control', automatizable: 'si', observacion: 'Informes trimestrales del uso de recursos SEP en EE con PME.' },
        { nombre: 'Sistema diagnóstico de aprendizajes en EE', meta: '75%', avance: 'S/I', periodicidad: 'Trimestral', responsable: 'Subdirección Apoyo Técnico Pedagógica', automatizable: 'parcial', observacion: 'Herramientas existentes para identificar estado de aprendizajes y diseñar intervenciones.' },
        { nombre: 'Actualización RICE en establecimientos', meta: '100%', avance: 'S/I', periodicidad: 'Anual', responsable: 'Subdirección Apoyo Técnico Pedagógica', automatizable: 'manual', observacion: 'RICE actualizados por los EE. Correo informativo y reporte de avance a Dirección Ejecutiva.' },
        { nombre: 'Proceso participativo elaboración PEL', meta: '100%', avance: 'S/I', periodicidad: 'Anual', responsable: 'Subdirección Planificación y Control', automatizable: 'manual', observacion: 'Planificación estratégica local con participación de comunidades educativas y actores locales.' },
      ],
    },
  ],
};

// CGE Los Parques — avances reales julio 2025 (PDF oficial PAL 2026, Tabla N°1)
const CGE_LOS_PARQUES = {
  cge: [
    { objetivo: 'OBJ 1', indicador_nombre: 'Cumplimiento metas anuales del Plan Anual (PA)', meta: '85%', ponderacion: '—', resultado_obtenido: '16,67%', ponderacion_alcanzada: '0%', observacion: 'Solo 2 de 12 acciones del PA con cumplimiento completo. Muy por debajo de la meta anual.' },
    { objetivo: 'OBJ 2', indicador_nombre: 'Índice de gestión de recursos', meta: '100%', ponderacion: '—', resultado_obtenido: '28,41%', ponderacion_alcanzada: '0%', observacion: 'Avance mixto: sostenibilidad financiera 18,75% + ejecución presupuestaria 38,07%. Meta: ene 2026.' },
    { objetivo: 'OBJ 2.1.2', indicador_nombre: 'Cumplimiento Plan de Sostenibilidad Financiera', meta: '100%', ponderacion: '—', resultado_obtenido: '18,75%', ponderacion_alcanzada: '0%', observacion: '3 de 16 acciones ejecutadas. Riesgo de liquidez.' },
    { objetivo: 'OBJ 2.1.3', indicador_nombre: 'Porcentaje de ejecución presupuestaria', meta: '90%', ponderacion: '—', resultado_obtenido: '38,07%', ponderacion_alcanzada: '0%', observacion: '$616.665.678 ejecutados al 31 julio. Riesgo de devolución de fondos.' },
    { objetivo: 'OBJ 3', indicador_nombre: 'Índice de participación y articulación local', meta: '100%', ponderacion: '—', resultado_obtenido: '55,77%', ponderacion_alcanzada: '0%', observacion: '16/26 acciones + 3/6 convenios. Meta: dic 2026.' },
    { objetivo: 'OBJ 3.1.2', indicador_nombre: 'Plan trabajo Consejos Escolares, Parvularia, Local y CDL', meta: '100%', ponderacion: '—', resultado_obtenido: '61,54%', ponderacion_alcanzada: '0%', observacion: '16 de 26 acciones contempladas. Pendientes en fase de ejecución.' },
    { objetivo: 'OBJ 3.1.3', indicador_nombre: 'Convenios suscritos con entidades públicas o privadas', meta: '100%', ponderacion: '—', resultado_obtenido: '50%', ponderacion_alcanzada: '0%', observacion: '3 de 6 convenios formalizados al 31 julio. Restantes oct-nov.' },
    { objetivo: 'OBJ 4', indicador_nombre: 'Índice de desarrollo de capacidades del personal del SLEP', meta: '75%', ponderacion: '—', resultado_obtenido: '50%', ponderacion_alcanzada: '0%', observacion: 'Compuesto por indicador 4.1.3 para este año.' },
    { objetivo: 'OBJ 4.1.3', indicador_nombre: 'Plan fortalecimiento capacidades equipo directivo nivel central (foco técnico-pedagógico)', meta: '100%', ponderacion: '—', resultado_obtenido: '50%', ponderacion_alcanzada: '0%', observacion: '3 de 6 acciones ejecutadas. Cumplimiento esperado: octubre.' },
    { objetivo: 'OBJ 5', indicador_nombre: 'Resultado evaluación de desempeño por Director/a DEP', meta: '100%', ponderacion: '—', resultado_obtenido: '0%', ponderacion_alcanzada: '0%', observacion: 'Evaluación no iniciada. Sin avances. Riesgo de incumplimiento legal.' },
  ],
};

const PME_LOS_PARQUES = {
  total_ee: 52,
  promedio_cumplimiento: 41,
  ee_sobre_70: 8,
  ee_criticos: 14,
  establecimientos: [
    { rbd: 20001, nombre_ee: 'Liceo Bicentenario de Quinta Normal', comuna: 'Quinta Normal', n_acciones_liderazgo: 4, n_acciones_gestion_pedagogica: 4, n_acciones_convivencia: 3, n_acciones_recursos: 3, total_acciones: 14, pct_cumplimiento: '78' },
    { rbd: 20002, nombre_ee: 'Escuela Básica Óscar Bonilla', comuna: 'Renca', n_acciones_liderazgo: 3, n_acciones_gestion_pedagogica: 3, n_acciones_convivencia: 3, n_acciones_recursos: 3, total_acciones: 12, pct_cumplimiento: '72' },
    { rbd: 20003, nombre_ee: 'Escuela Básica República de Haití', comuna: 'Quinta Normal', n_acciones_liderazgo: 3, n_acciones_gestion_pedagogica: 3, n_acciones_convivencia: 2, n_acciones_recursos: 2, total_acciones: 10, pct_cumplimiento: '62' },
    { rbd: 20004, nombre_ee: 'Liceo Polivalente Renca', comuna: 'Renca', n_acciones_liderazgo: 3, n_acciones_gestion_pedagogica: 2, n_acciones_convivencia: 3, n_acciones_recursos: 2, total_acciones: 10, pct_cumplimiento: '55' },
    { rbd: 20005, nombre_ee: 'Escuela Básica Eduardo de la Barra', comuna: 'Quinta Normal', n_acciones_liderazgo: 2, n_acciones_gestion_pedagogica: 2, n_acciones_convivencia: 2, n_acciones_recursos: 2, total_acciones: 8, pct_cumplimiento: '48' },
    { rbd: 20006, nombre_ee: 'Escuela Básica Lo Boza', comuna: 'Renca', n_acciones_liderazgo: 2, n_acciones_gestion_pedagogica: 2, n_acciones_convivencia: 2, n_acciones_recursos: 1, total_acciones: 7, pct_cumplimiento: '38' },
    { rbd: 20007, nombre_ee: 'Escuela Básica Marcela Paz', comuna: 'Quinta Normal', n_acciones_liderazgo: 2, n_acciones_gestion_pedagogica: 1, n_acciones_convivencia: 2, n_acciones_recursos: 1, total_acciones: 6, pct_cumplimiento: '30' },
    { rbd: 20008, nombre_ee: 'Liceo Industrial de Renca', comuna: 'Renca', n_acciones_liderazgo: 1, n_acciones_gestion_pedagogica: 2, n_acciones_convivencia: 1, n_acciones_recursos: 2, total_acciones: 6, pct_cumplimiento: '25' },
    { rbd: 20009, nombre_ee: 'Escuela Básica Huamachuco', comuna: 'Renca', n_acciones_liderazgo: 1, n_acciones_gestion_pedagogica: 1, n_acciones_convivencia: 1, n_acciones_recursos: 1, total_acciones: 4, pct_cumplimiento: '15' },
    { rbd: 20010, nombre_ee: 'Jardín Infantil Los Parquecitos', comuna: 'Quinta Normal', n_acciones_liderazgo: 1, n_acciones_gestion_pedagogica: 1, n_acciones_convivencia: 0, n_acciones_recursos: 1, total_acciones: 3, pct_cumplimiento: '0' },
  ],
};

export const mockPal = {
  // Formato esperado: { documentos: [...] } con anio y slep_nombre
  documentos: {
    documentos: [
      { id: 1, anio: 2026, slep_nombre: 'Barrancas', estado: 'Vigente', comunas: 'Pudahuel, Cerro Navia, Lo Prado', total_ee: 53 },
      { id: 2, anio: 2026, slep_nombre: 'Los Parques', estado: 'Vigente', comunas: 'Quinta Normal y Renca', total_ee: 52 },
    ],
  },
  resumen: {
    total_indicadores: 33,
    automatizables: 11,
    parciales: 9,
    manuales: 13,
  },
  documento: (id) => id === '2' || id === 2 ? PAL_LOS_PARQUES : PAL_BARRANCAS,
  cge: (id) => id === '2' || id === 2 ? CGE_LOS_PARQUES : CGE_BARRANCAS,
  pme: (id) => id === '2' || id === 2 ? PME_LOS_PARQUES : PME_BARRANCAS,
};

// ─── COMPROMISOS ────────────────────────────────────────────────
// Formato esperado por CompromisosPanel: { atrasados, proximos, resumen }
// Contenido basado en ENEP Barrancas 2025 + calendario normativo real
export const mockCompromisos = {
  atrasados: [
    {
      id: 1,
      hito: 'Plan acción OE1: reducir inasistencia crónica (38.4% → meta 25%)',
      instrumento: 'PAL',
      responsable: 'Coord. Pedagógica',
      fecha_vencimiento: '2026-03-31',
      dias_atraso: 1,
    },
    {
      id: 2,
      hito: 'Completar dotación docente — 8 vacantes sin cubrir en liceos TP',
      instrumento: 'CGE',
      responsable: 'RRHH',
      fecha_vencimiento: '2026-03-28',
      dias_atraso: 4,
    },
    {
      id: 3,
      hito: 'Informe trimestral OE4 — docentes en norma estimada (67.3%)',
      instrumento: 'PMG',
      responsable: 'Director Ejecutivo',
      fecha_vencimiento: '2026-03-25',
      dias_atraso: 7,
    },
  ],
  proximos: [
    {
      id: 4,
      hito: 'Diagnóstico DIA lectura — 4° básico (53 establecimientos)',
      instrumento: 'PAL',
      responsable: 'UTP',
      fecha_vencimiento: '2026-04-15',
      dias_restantes: 14,
    },
    {
      id: 5,
      hito: 'Activar acompañamiento en 10 EE categoría Insuficiente (OE2)',
      instrumento: 'CGE',
      responsable: 'Coord. Pedagógica',
      fecha_vencimiento: '2026-04-20',
      dias_restantes: 19,
    },
    {
      id: 6,
      hito: 'Evaluación PME primer trimestre — actualización avance',
      instrumento: 'PME',
      responsable: 'Planificación',
      fecha_vencimiento: '2026-04-30',
      dias_restantes: 29,
    },
    {
      id: 7,
      hito: 'Licitación servicio alimentación segundo semestre',
      instrumento: 'CGE',
      responsable: 'Adquisiciones',
      fecha_vencimiento: '2026-05-15',
      dias_restantes: 44,
    },
  ],
  resumen: {
    total_atrasados: 3,
    total_proximos: 4,
  },
};

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
  if (url.includes('/pal/documentos')) return mockPal.documentos;  // returns { documentos: [...] }
  if (url.includes('/pal/resumen')) return mockPal.resumen;

  // COMPROMISOS
  if (url.includes('/compromisos') && method === 'patch') {
    const compMatch = url.match(/\/compromisos\/(\d+)/);
    if (compMatch) {
      const id = parseInt(compMatch[1]);
      const c = [...mockCompromisos.atrasados, ...mockCompromisos.proximos].find(x => x.id === id);
      return c || mockCompromisos.atrasados[0];
    }
  }
  if (url.includes('/compromisos')) return mockCompromisos;

  return null;
}
