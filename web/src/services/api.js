import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (username, password) =>
    api.post('/auth/login', new URLSearchParams({ username, password })),
  me: () => api.get('/auth/me'),
};

export const dashboardApi = {
  summary: () => api.get('/dashboard/summary'),
  semaforos: () => api.get('/dashboard/semaforos'),
  tendenciaAsistencia: () => api.get('/dashboard/tendencia-asistencia'),
};

export const alertsApi = {
  list: (severity) => api.get('/alerts/', { params: severity ? { severity } : {} }),
};

export const establishmentsApi = {
  list: () => api.get('/establishments/'),
  get: (rbd) => api.get(`/establishments/${rbd}`),
};

export const financialApi = {
  execution: () => api.get('/financial/execution'),
  mercadoPublico: () => api.get('/financial/mercado-publico'),
};

export const slepApi = {
  overview: (params) => api.get('/slep/overview', { params }),
  establecimientos: (params) => api.get('/slep/establecimientos', { params }),
  establecimiento: (rbd) => api.get(`/slep/establecimiento/${rbd}`),
  ranking: (metric) => api.get('/slep/ranking', { params: metric ? { metric } : {} }),
  meses: () => api.get('/slep/meses'),
};

export const pedagogicoApi = {
  simce: () => api.get('/pedagogico/simce'),
  rendimiento: () => api.get('/pedagogico/rendimiento'),
};

export const palApi = {
  documentos: () => api.get('/pal/documentos'),
  documento: (id) => api.get(`/pal/documento/${id}`),
  resumen: () => api.get('/pal/resumen'),
  cge: (id) => api.get(`/pal/cge/${id}`),
  pme: (id) => api.get(`/pal/pme/${id}`),
};

export const compromisosApi = {
  list: () => api.get('/compromisos/'),
  update: (id, estado) => api.patch(`/compromisos/${id}`, null, { params: { estado } }),
};

export default api;
