/**
 * Mock data for offline demo mode - SLEP Barrancas
 * Realistic Chilean public education data
 */

// Coordenadas reales aprox de Pudahuel, Cerro Navia, Lo Prado
// 53 EE reales SLEP Barrancas — Directorio MINEDUC 2025 + Asistencia Marzo 2025
const ESTABLECIMIENTOS = [
  { rbd: 10104, nombre: 'Escuela Monsenor Carlos Oviedo', comuna: 'Pudahuel', nivel: 'Basica', matricula: 317, asistencia: 92.2, estado: 'verde', latitud: -33.449766, longitud: -70.744983 , aprobacion: 95.4, retiro: 0.7, sep: 276, sep_prioritarios: 52 },
  { rbd: 10134, nombre: 'Esc.comodoro Arturo Merino Benitez', comuna: 'Pudahuel', nivel: 'Basica', matricula: 369, asistencia: 91.4, estado: 'verde', latitud: -33.411774, longitud: -70.85475 , aprobacion: 93.6, retiro: 0.6, sep: 346, sep_prioritarios: 104 },
  { rbd: 24889, nombre: 'Liceo Bicentenario Monsenor Enrique Alvear', comuna: 'Pudahuel', nivel: 'Media', matricula: 1019, asistencia: 90.5, estado: 'verde', latitud: -33.463317, longitud: -70.753354 , aprobacion: 91.8, retiro: 1.7, sep: 849, sep_prioritarios: 232 },
  { rbd: 10085, nombre: 'Escuela Estado De Florida', comuna: 'Pudahuel', nivel: 'Basica', matricula: 591, asistencia: 90.4, estado: 'verde', latitud: -33.432981, longitud: -70.766664 , aprobacion: 92.7, retiro: 0.7, sep: 534, sep_prioritarios: 169 },
  { rbd: 10081, nombre: 'Escuela Estrella De Chile', comuna: 'Pudahuel', nivel: 'Basica', matricula: 973, asistencia: 89.8, estado: 'verde', latitud: -33.436599, longitud: -70.747686 , aprobacion: 96.0, retiro: 0.2, sep: 911, sep_prioritarios: 173 },
  { rbd: 10080, nombre: 'Escuela Teniente Hernan Merino Correa', comuna: 'Pudahuel', nivel: 'Basica', matricula: 322, asistencia: 89.7, estado: 'verde', latitud: -33.432563, longitud: -70.76105 , aprobacion: 90.9, retiro: 1.3, sep: 283, sep_prioritarios: 73 },
  { rbd: 10092, nombre: 'Escuela Golda Meir', comuna: 'Lo Prado', nivel: 'Basica', matricula: 314, asistencia: 89.6, estado: 'verde', latitud: -33.450619, longitud: -70.718095 , aprobacion: 88.9, retiro: 2.1, sep: 226, sep_prioritarios: 48 },
  { rbd: 10108, nombre: 'Escuela Leonardo Da Vinci', comuna: 'Cerro Navia', nivel: 'Basica', matricula: 248, asistencia: 89.4, estado: 'verde', latitud: -33.427507, longitud: -70.743876 , aprobacion: 90.1, retiro: 0.9, sep: 220, sep_prioritarios: 56 },
  { rbd: 10130, nombre: 'Liceo Ciudad De Brasilia', comuna: 'Pudahuel', nivel: 'Media', matricula: 487, asistencia: 89.4, estado: 'verde', latitud: -33.402741, longitud: -70.855648 , aprobacion: 94.6, retiro: 0.5, sep: 458, sep_prioritarios: 120 },
  { rbd: 10102, nombre: 'Escuela Albert Einstein', comuna: 'Pudahuel', nivel: 'Basica', matricula: 168, asistencia: 89.3, estado: 'verde', latitud: -33.434022, longitud: -70.754697 , aprobacion: 94.7, retiro: 0.0, sep: 144, sep_prioritarios: 35 },
  { rbd: 10090, nombre: 'Escuela Alexander Graham Bell', comuna: 'Pudahuel', nivel: 'Basica', matricula: 445, asistencia: 89.2, estado: 'verde', latitud: -33.432629, longitud: -70.741512 , aprobacion: 92.0, retiro: 1.7, sep: 361, sep_prioritarios: 119 },
  { rbd: 10083, nombre: 'Escuela Presidente Roosevelt', comuna: 'Cerro Navia', nivel: 'Basica', matricula: 401, asistencia: 89.1, estado: 'verde', latitud: -33.434039, longitud: -70.738172 , aprobacion: 94.7, retiro: 1.8, sep: 340, sep_prioritarios: 78 },
  { rbd: 10097, nombre: 'Escuela Mariscal De Ayacucho', comuna: 'Lo Prado', nivel: 'Basica', matricula: 207, asistencia: 89.1, estado: 'verde', latitud: -33.440944, longitud: -70.736637 , aprobacion: 87.6, retiro: 3.0, sep: 133, sep_prioritarios: 18 },
  { rbd: 10116, nombre: 'Colegio Neptuno', comuna: 'Cerro Navia', nivel: 'Basica', matricula: 399, asistencia: 88.3, estado: 'verde', latitud: -33.435337, longitud: -70.727789 , aprobacion: 86.0, retiro: 2.1, sep: 316, sep_prioritarios: 104 },
  { rbd: 10124, nombre: 'Escuela San Daniel', comuna: 'Pudahuel', nivel: 'Basica', matricula: 294, asistencia: 88.1, estado: 'verde', latitud: -33.428756, longitud: -70.764876 , aprobacion: 82.2, retiro: 3.5, sep: 226, sep_prioritarios: 65 },
  { rbd: 10100, nombre: 'Escuela El Salitre', comuna: 'Pudahuel', nivel: 'Basica', matricula: 250, asistencia: 88.0, estado: 'verde', latitud: -33.447977, longitud: -70.750715 , aprobacion: 92.9, retiro: 1.7, sep: 209, sep_prioritarios: 55 },
  { rbd: 10098, nombre: 'Escuela Provincia De Arauco', comuna: 'Cerro Navia', nivel: 'Basica', matricula: 252, asistencia: 87.7, estado: 'amarillo', latitud: -33.423559, longitud: -70.719789 , aprobacion: 88.5, retiro: 2.1, sep: 196, sep_prioritarios: 76 },
  { rbd: 10113, nombre: 'Escuela Elvira Santa Cruz Ossa', comuna: 'Pudahuel', nivel: 'Basica', matricula: 444, asistencia: 87.1, estado: 'amarillo', latitud: -33.44253, longitud: -70.765428 , aprobacion: 88.3, retiro: 2.3, sep: 361, sep_prioritarios: 103 },
  { rbd: 10089, nombre: 'Escuela Jaime Gomez Garcia', comuna: 'Lo Prado', nivel: 'Basica', matricula: 589, asistencia: 87.0, estado: 'amarillo', latitud: -33.442527, longitud: -70.719589 , aprobacion: 88.3, retiro: 2.3, sep: 460, sep_prioritarios: 114 },
  { rbd: 10119, nombre: 'Escuela Poeta Vicente Huidobro', comuna: 'Lo Prado', nivel: 'Basica', matricula: 354, asistencia: 86.8, estado: 'amarillo', latitud: -33.451283, longitud: -70.735587 , aprobacion: 88.0, retiro: 2.9, sep: 293, sep_prioritarios: 66 },
  { rbd: 10099, nombre: 'Escuela General Rene Escauriaza', comuna: 'Cerro Navia', nivel: 'Basica', matricula: 276, asistencia: 86.5, estado: 'amarillo', latitud: -33.425594, longitud: -70.748602 , aprobacion: 91.8, retiro: 2.0, sep: 231, sep_prioritarios: 100 },
  { rbd: 10095, nombre: 'Escuela Ignacio Carrera Pinto', comuna: 'Lo Prado', nivel: 'Basica', matricula: 201, asistencia: 86.1, estado: 'amarillo', latitud: -33.437266, longitud: -70.739503 , aprobacion: 89.2, retiro: 1.7, sep: 172, sep_prioritarios: 44 },
  { rbd: 10103, nombre: 'Escuela Sor Teresa De Los Andes', comuna: 'Lo Prado', nivel: 'Basica', matricula: 490, asistencia: 86.1, estado: 'amarillo', latitud: -33.444213, longitud: -70.738148 , aprobacion: 86.5, retiro: 2.0, sep: 427, sep_prioritarios: 85 },
  { rbd: 10117, nombre: 'Escuela Maria Luisa Bombal', comuna: 'Cerro Navia', nivel: 'Basica', matricula: 308, asistencia: 86.0, estado: 'amarillo', latitud: -33.415116, longitud: -70.736629 , aprobacion: 93.5, retiro: 0.4, sep: 263, sep_prioritarios: 93 },
  { rbd: 10076, nombre: 'Complejo Educacional Pedro Prado', comuna: 'Lo Prado', nivel: 'TP', matricula: 939, asistencia: 85.8, estado: 'amarillo', latitud: -33.444302, longitud: -70.728372 , aprobacion: 83.4, retiro: 4.2, sep: 700, sep_prioritarios: 217 },
  { rbd: 10087, nombre: 'Liceo Republica De Croacia', comuna: 'Cerro Navia', nivel: 'Media', matricula: 456, asistencia: 85.8, estado: 'amarillo', latitud: -33.434128, longitud: -70.730196 , aprobacion: 84.6, retiro: 3.0, sep: 354, sep_prioritarios: 132 },
  { rbd: 10093, nombre: 'Escuela Millahue', comuna: 'Cerro Navia', nivel: 'Basica', matricula: 225, asistencia: 85.7, estado: 'amarillo', latitud: -33.419499, longitud: -70.743981 , aprobacion: 88.6, retiro: 1.3, sep: 170, sep_prioritarios: 80 },
  { rbd: 10086, nombre: 'Escuela Republica De Italia', comuna: 'Cerro Navia', nivel: 'Basica', matricula: 249, asistencia: 85.6, estado: 'amarillo', latitud: -33.426616, longitud: -70.734422 , aprobacion: 88.3, retiro: 2.6, sep: 197, sep_prioritarios: 55 },
  { rbd: 10105, nombre: 'Escuela Federico Acevedo Salazar', comuna: 'Cerro Navia', nivel: 'Basica', matricula: 486, asistencia: 85.5, estado: 'amarillo', latitud: -33.420757, longitud: -70.754958 , aprobacion: 91.6, retiro: 0.6, sep: 410, sep_prioritarios: 169 },
  { rbd: 25047, nombre: 'Escuela Antilhue De Pudahuel', comuna: 'Pudahuel', nivel: 'Basica', matricula: 797, asistencia: 85.5, estado: 'amarillo', latitud: -33.465021, longitud: -70.742723 , aprobacion: 89.7, retiro: 2.1, sep: 681, sep_prioritarios: 105 },
  { rbd: 10109, nombre: 'Escuela Doctor Treviso Girardi Tonelli', comuna: 'Cerro Navia', nivel: 'Basica', matricula: 243, asistencia: 85.4, estado: 'amarillo', latitud: -33.420467, longitud: -70.728759 , aprobacion: 88.5, retiro: 1.8, sep: 170, sep_prioritarios: 75 },
  { rbd: 10127, nombre: 'Esc.de Educacion Diferencial Quillahue', comuna: 'Lo Prado', nivel: 'Basica', matricula: 228, asistencia: 85.2, estado: 'amarillo', latitud: -33.449547, longitud: -70.7274 , aprobacion: 92.5, retiro: 1.7, sep: 197, sep_prioritarios: 49 },
  { rbd: 10107, nombre: 'Escuela Basica Paulo Freire', comuna: 'Cerro Navia', nivel: 'Basica', matricula: 280, asistencia: 85.0, estado: 'amarillo', latitud: -33.417718, longitud: -70.724869 , aprobacion: 90.2, retiro: 1.2, sep: 216, sep_prioritarios: 103 },
  { rbd: 10135, nombre: 'Escuela Lo Boza', comuna: 'Pudahuel', nivel: 'Basica', matricula: 252, asistencia: 84.9, estado: 'amarillo', latitud: -33.385446, longitud: -70.761676 , aprobacion: 93.9, retiro: 0.0, sep: 182, sep_prioritarios: 58 },
  { rbd: 24412, nombre: 'Colegio Finlandia', comuna: 'Pudahuel', nivel: 'Basica', matricula: 358, asistencia: 84.8, estado: 'amarillo', latitud: -33.447166, longitud: -70.758572 , aprobacion: 86.9, retiro: 0.3, sep: 320, sep_prioritarios: 79 },
  { rbd: 10125, nombre: 'Escuela Sargento Candelaria', comuna: 'Cerro Navia', nivel: 'Basica', matricula: 208, asistencia: 84.0, estado: 'amarillo', latitud: -33.425432, longitud: -70.741765 , aprobacion: 85.9, retiro: 2.5, sep: 167, sep_prioritarios: 44 },
  { rbd: 10074, nombre: 'Escuela Alianza', comuna: 'Cerro Navia', nivel: 'Basica', matricula: 192, asistencia: 83.8, estado: 'amarillo', latitud: -33.414588, longitud: -70.76228 , aprobacion: 85.6, retiro: 3.6, sep: 153, sep_prioritarios: 49 },
  { rbd: 10114, nombre: 'Escuela Basica N°389 Republica De Estados Unidos', comuna: 'Lo Prado', nivel: 'Basica', matricula: 362, asistencia: 83.3, estado: 'amarillo', latitud: -33.444728, longitud: -70.71439 , aprobacion: 80.5, retiro: 2.4, sep: 274, sep_prioritarios: 68 },
  { rbd: 10122, nombre: 'Escuela Prof. Manuel Guerrero Ceballos', comuna: 'Cerro Navia', nivel: 'Basica', matricula: 375, asistencia: 83.3, estado: 'amarillo', latitud: -33.413656, longitud: -70.752878 , aprobacion: 86.1, retiro: 2.0, sep: 329, sep_prioritarios: 145 },
  { rbd: 10121, nombre: 'Escuela Ciudad Santo Domingo De Guzman', comuna: 'Cerro Navia', nivel: 'Basica', matricula: 276, asistencia: 82.9, estado: 'amarillo', latitud: -33.430573, longitud: -70.729934 , aprobacion: 86.6, retiro: 4.6, sep: 204, sep_prioritarios: 72 },
  { rbd: 10126, nombre: 'Complejo Educacional Cerro Navia', comuna: 'Cerro Navia', nivel: 'TP', matricula: 446, asistencia: 82.7, estado: 'amarillo', latitud: -33.414127, longitud: -70.724878 , aprobacion: 84.6, retiro: 4.2, sep: 338, sep_prioritarios: 171 },
  { rbd: 10010, nombre: 'Mustafa Kemal Ataturk', comuna: 'Lo Prado', nivel: 'Basica', matricula: 316, asistencia: 82.6, estado: 'amarillo', latitud: -33.439727, longitud: -70.709998 , aprobacion: 90.0, retiro: 1.0, sep: 240, sep_prioritarios: 53 },
  { rbd: 25315, nombre: 'Escuela Puerto Futuro', comuna: 'Pudahuel', nivel: 'Basica', matricula: 291, asistencia: 82.6, estado: 'amarillo', latitud: -33.461525, longitud: -70.746018 , aprobacion: 85.1, retiro: 3.7, sep: 191, sep_prioritarios: 55 },
  { rbd: 10128, nombre: 'Escuela Centro Educ.integral De Adultos', comuna: 'Lo Prado', nivel: 'Basica', matricula: 448, asistencia: 81.1, estado: 'amarillo', latitud: -33.437267, longitud: -70.74014 , aprobacion: 50.0, retiro: 10.4, sep: 123, sep_prioritarios: 49 },
  { rbd: 10077, nombre: 'Liceo Centro Experimental Pudahuel Caren', comuna: 'Pudahuel', nivel: 'Media', matricula: 431, asistencia: 79.4, estado: 'rojo', latitud: -33.444558, longitud: -70.750318 , aprobacion: 71.8, retiro: 4.6, sep: 317, sep_prioritarios: 102 },
  { rbd: 10106, nombre: 'Liceo Bicentenario Poeta Pablo Neruda', comuna: 'Lo Prado', nivel: 'Media', matricula: 826, asistencia: 78.7, estado: 'rojo', latitud: -33.455139, longitud: -70.714923 , aprobacion: 88.2, retiro: 3.2, sep: 559, sep_prioritarios: 109 },
  { rbd: 10075, nombre: 'Liceo Polivalente Los Heroes De La Concepción', comuna: 'Cerro Navia', nivel: 'TP', matricula: 510, asistencia: 76.1, estado: 'rojo', latitud: -33.422817, longitud: -70.741797 , aprobacion: 73.5, retiro: 9.3, sep: 407, sep_prioritarios: 198 },
  { rbd: 10120, nombre: 'Liceo De Adultos Alberto Galleguillos J.', comuna: 'Pudahuel', nivel: 'Basica', matricula: 354, asistencia: 75.0, estado: 'rojo', latitud: -33.442444, longitud: -70.75491 , aprobacion: 50.0, retiro: 24.4, sep: 187, sep_prioritarios: 71 },
  { rbd: 10088, nombre: 'Escuela Herminda De La Victoria', comuna: 'Cerro Navia', nivel: 'Basica', matricula: 201, asistencia: 73.2, estado: 'rojo', latitud: -33.424725, longitud: -70.737404 , aprobacion: 74.7, retiro: 1.7, sep: 166, sep_prioritarios: 60 },
  { rbd: 10123, nombre: 'Escuela Basica Melvin Jones', comuna: 'Pudahuel', nivel: 'Basica', matricula: 512, asistencia: 71.9, estado: 'rojo', latitud: -33.4411, longitud: -70.7412 , aprobacion: 91.5, retiro: 0.6, sep: 442, sep_prioritarios: 100 },
  { rbd: 10091, nombre: 'Liceo Profesora Gladys Valenzuela', comuna: 'Lo Prado', nivel: 'Media', matricula: 525, asistencia: 71.6, estado: 'rojo', latitud: -33.447435, longitud: -70.726796 , aprobacion: 75.5, retiro: 6.1, sep: 365, sep_prioritarios: 95 },
  { rbd: 24804, nombre: 'Escuela Especial Sgto.candelaria', comuna: 'Cerro Navia', nivel: 'Especial', matricula: 140, asistencia: 64.2, estado: 'rojo', latitud: -33.41836, longitud: -70.74417 , aprobacion: 87.6, retiro: 5.6, sep: 123, sep_prioritarios: 45 },
  { rbd: 24754, nombre: 'Ceia Georgina Salas Dinamarca', comuna: 'Cerro Navia', nivel: 'Media', matricula: 347, asistencia: 51.1, estado: 'rojo', latitud: -33.41629, longitud: -70.741425 , aprobacion: 39.9, retiro: 9.6, sep: 84, sep_prioritarios: 43 },
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
      total_establecimientos: ESTABLECIMIENTOS.length,
      ee_escuelas_liceos: ESTABLECIMIENTOS.filter(e => e.nivel !== 'Parvularia').length,
      ee_jardines: ESTABLECIMIENTOS.filter(e => e.nivel === 'Parvularia').length,
      ee_con_datos: ESTABLECIMIENTOS.length,
      ee_oficial: ESTABLECIMIENTOS.length,
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
  // Asistencia real SLEP Barrancas 2025 — Fuente: MINEDUC Asistencia Declarada mensual
  tendenciaAsistencia: {
    meses: [
      { mes: '2025-03', mes_nombre: 'Mar', asistencia: 84.3 },
      { mes: '2025-04', mes_nombre: 'Abr', asistencia: 79.0 },
      { mes: '2025-05', mes_nombre: 'May', asistencia: 74.8 },
      { mes: '2025-06', mes_nombre: 'Jun', asistencia: 63.3 },
      { mes: '2025-07', mes_nombre: 'Jul', asistencia: 77.2 },
      { mes: '2025-08', mes_nombre: 'Ago', asistencia: 75.3 },
      { mes: '2025-09', mes_nombre: 'Sep', asistencia: 75.9 },
      { mes: '2025-10', mes_nombre: 'Oct', asistencia: 75.1 },
      { mes: '2025-11', mes_nombre: 'Nov', asistencia: 74.4 },
      { mes: '2025-12', mes_nombre: 'Dic', asistencia: 75.0 },
    ],
  },
};

// ─── ALERTS — generadas desde semáforo real de asistencia marzo 2025 ─────────
export const mockAlerts = [
  { id: 1, tipo: 'asistencia', severity: 'critical', mensaje: 'CEIA Georgina Salas Dinamarca (Cerro Navia): asistencia 51,1% — muy bajo umbral 80%', rbd: 24754, fecha: '2026-03-28', leida: false },
  { id: 2, tipo: 'asistencia', severity: 'critical', mensaje: 'Escuela Especial Sgto. Candelaria (Cerro Navia): asistencia 64,2%', rbd: 24804, fecha: '2026-03-28', leida: false },
  { id: 3, tipo: 'asistencia', severity: 'critical', mensaje: 'Liceo Profesora Gladys Valenzuela (Lo Prado): asistencia 71,6%', rbd: 10091, fecha: '2026-03-27', leida: false },
  { id: 4, tipo: 'asistencia', severity: 'critical', mensaje: 'Escuela Melvin Jones (Pudahuel): asistencia 71,9%', rbd: 10123, fecha: '2026-03-27', leida: false },
  { id: 5, tipo: 'asistencia', severity: 'critical', mensaje: 'Escuela Herminda de la Victoria (Cerro Navia): asistencia 73,2%', rbd: 10088, fecha: '2026-03-26', leida: true },
  { id: 6, tipo: 'asistencia', severity: 'warning', mensaje: 'Liceo Polivalente Los Heroes (Cerro Navia): asistencia 76,1%', rbd: 10075, fecha: '2026-03-26', leida: true },
  { id: 7, tipo: 'asistencia', severity: 'warning', mensaje: 'Escuela Villa Los Boldos (Pudahuel): asistencia 77,1%', rbd: 10131, fecha: '2026-03-25', leida: true },
  { id: 8, tipo: 'asistencia', severity: 'warning', mensaje: 'Liceo Centro Experimental Pudahuel Caren: asistencia 79,4%', rbd: 10077, fecha: '2026-03-25', leida: true },
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
    asistencia_pct: e.asistencia,
    semaforo: e.estado === 'amarillo' ? 'naranja' : e.estado,
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
  // Rendimiento real SLEP Barrancas — Fuente: MINEDUC Rendimiento por Estudiante 2025
  rendimiento: {
    aprobacion: 84.8,
    reprobacion: 3.5,
    retiro: 3.2,
    fuente: 'MINEDUC Rendimiento por Estudiante 2025',
    nota: 'Datos reales de 21.131 alumnos en 53 EE. Resta ~8.5% sin situación final informada.',
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
