import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, CalendarCheck, ShieldAlert, AlertTriangle, Download } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { slepApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import KpiCard from '../components/shared/KpiCard';
import SemaforoTag from '../components/shared/SemaforoTag';

const PIE_COLORS = ['#ef4444', '#f59e0b', '#10b981'];

export default function MiSlep() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [establecimientos, setEstablecimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([slepApi.overview(), slepApi.establecimientos()])
      .then(([ov, est]) => {
        setOverview(ov.data);
        setEstablecimientos(est.data.establecimientos || []);
      })
      .catch((e) => setError(e.response?.data?.detail || 'Error cargando datos del SLEP'))
      .finally(() => setLoading(false));
  }, [user?.slep_id]);

  if (loading) return <p style={{ color: 'var(--text-muted)', padding: 40 }}>Cargando datos reales del SLEP...</p>;
  if (error) return <p style={{ color: 'var(--alert-red)', padding: 40 }}>{error}</p>;

  const kpis = overview?.kpis || {};

  const pieData = [
    { name: 'Roja', value: kpis.alertas_rojas || 0 },
    { name: 'Naranja', value: kpis.alertas_naranjas || 0 },
    { name: 'Verde', value: kpis.alertas_verdes || 0 },
  ];

  // Top 15 peores asistencia para el gráfico
  const barData = establecimientos.slice(0, 15).map((e) => ({
    name: e.nombre.length > 20 ? e.nombre.slice(0, 20) + '...' : e.nombre,
    asistencia: e.asistencia,
    vulnerabilidad: e.vulnerabilidad_pct,
  }));

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Mi SLEP</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {overview?.nombre_sostenedor} &middot; Datos reales
          </p>
        </div>
        <button
          onClick={() => window.open(`/api/exports/excel`, '_blank')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', background: 'rgba(59, 130, 246, 0.15)',
            color: 'var(--accent-primary)', border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Download size={15} /> Exportar
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Establecimientos" value={kpis.total_establecimientos} icon={Users} />
        <KpiCard label="Matrícula total" value={kpis.matricula_total} icon={GraduationCap} />
        <KpiCard label="Asistencia prom." value={kpis.asistencia_promedio} unit="%" icon={CalendarCheck} />
        <KpiCard label="Vulnerabilidad" value={kpis.vulnerabilidad_promedio} unit="%" icon={ShieldAlert} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, marginBottom: 24 }}>
        {/* Semáforo resumen */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Distribución semáforo</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={0}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
            {pieData.map((d, i) => (
              <span key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i] }} />
                {d.value} {d.name.toLowerCase()}
              </span>
            ))}
          </div>
        </div>

        {/* Bar chart - peores asistencia */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Establecimientos con menor asistencia</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} layout="vertical" barSize={14}>
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={160} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="asistencia" name="Asistencia %" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de establecimientos */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Todos los establecimientos</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{establecimientos.length} establecimientos</span>
        </div>
        <div style={{ maxHeight: 500, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'rgba(15, 23, 42, 0.95)' }}>
              <tr>
                {['RBD', 'Nombre', 'Matrícula', 'Asistencia', 'Vulnerab.', 'Semáforo'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {establecimientos.map((e) => (
                <tr
                  key={e.rbd}
                  onClick={() => navigate(`/mi-slep/${e.rbd}`)}
                  style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={(ev) => (ev.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
                >
                  <td style={tdStyle}>{e.rbd}</td>
                  <td style={tdStyle}>{e.nombre}</td>
                  <td style={tdStyle}>{e.matricula.toLocaleString('es-CL')}</td>
                  <td style={{ ...tdStyle, color: e.asistencia < 85 ? 'var(--alert-red)' : e.asistencia < 90 ? 'var(--alert-orange)' : 'var(--text-main)', fontWeight: e.asistencia < 85 ? 700 : 400 }}>
                    {e.asistencia}%
                  </td>
                  <td style={{ ...tdStyle, color: e.vulnerabilidad_pct > 70 ? 'var(--alert-red)' : 'var(--text-muted)' }}>
                    {e.vulnerabilidad_pct}%
                  </td>
                  <td style={tdStyle}>
                    <SemaforoTag value={e.semaforo === 'roj' ? 'rojo' : e.semaforo === 'naranj' ? 'naranja' : e.semaforo} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const thStyle = { textAlign: 'left', padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' };
const tdStyle = { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid var(--border-color)' };
