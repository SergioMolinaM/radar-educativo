import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, CalendarCheck, DollarSign, AlertTriangle, Download } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardApi } from '../services/api';
import KpiCard from './shared/KpiCard';
import SemaforoTag from './shared/SemaforoTag';

const PIE_COLORS = ['var(--alert-red)', 'var(--alert-orange)', 'var(--alert-green)'];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [semaforos, setSemaforos] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([dashboardApi.summary(), dashboardApi.semaforos()])
      .then(([s, sem]) => {
        setSummary(s.data);
        setSemaforos(sem.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  const kpis = summary?.kpis || {};
  const trends = summary?.tendencias || {};
  const establecimientos = semaforos?.establecimientos || [];

  const pieData = [
    { name: 'Rojo', value: kpis.alertas_rojas || 0 },
    { name: 'Naranja', value: kpis.alertas_naranjas || 0 },
    { name: 'Verde', value: kpis.alertas_verdes || 0 },
  ];

  const barData = establecimientos.map((e) => ({
    name: e.nombre.length > 20 ? e.nombre.slice(0, 20) + '...' : e.nombre,
    asistencia: e.asistencia,
    ejecucion: e.ejecucion,
  }));

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>
            Resumen operativo del SLEP &middot; {new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => {
            const token = localStorage.getItem('token');
            window.open(`/api/exports/excel?token=${token}`, '_blank');
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', background: 'rgba(59, 130, 246, 0.15)',
            color: 'var(--accent-primary)', border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: 8, fontSize: 18, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Download size={15} /> Exportar Excel
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Establecimientos" value={kpis.total_establecimientos} icon={School2Icon} />
        <KpiCard label="Matrícula total" value={kpis.matricula_total} icon={GraduationCap} trend={trends.matricula_variacion_anual} />
        <KpiCard label="Asistencia promedio" value={kpis.asistencia_promedio} unit="%" icon={CalendarCheck} trend={trends.asistencia_variacion_mensual} />
        <KpiCard label="Ejecución presup." value={kpis.ejecucion_presupuestaria} unit="%" icon={DollarSign} trend={trends.ejecucion_variacion_mensual} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, marginBottom: 24 }}>
        {/* Semáforo resumen */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Estado general</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={0}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 8 }}>
            <LegendDot color="var(--alert-red)" label={`${kpis.alertas_rojas} rojas`} />
            <LegendDot color="var(--alert-orange)" label={`${kpis.alertas_naranjas} naranja`} />
            <LegendDot color="var(--alert-green)" label={`${kpis.alertas_verdes} verdes`} />
          </div>
        </div>

        {/* Bar chart */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Asistencia y ejecución por establecimiento</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barGap={4}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 13 }} />
              <Bar dataKey="asistencia" name="Asistencia %" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ejecucion" name="Ejecución %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de establecimientos */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Establecimientos</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{establecimientos.length} establecimientos</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['RBD', 'Nombre', 'Matrícula', 'Asistencia', 'Ejecución', 'Estado', 'Alertas'].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {establecimientos.map((e) => (
              <tr
                key={e.rbd}
                onClick={() => navigate(`/establecimientos/${e.rbd}`)}
                style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={(ev) => (ev.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
              >
                <td style={tdStyle}>{e.rbd}</td>
                <td style={tdStyle}>{e.nombre}</td>
                <td style={tdStyle}>{e.matricula?.toLocaleString('es-CL')}</td>
                <td style={{ ...tdStyle, color: e.asistencia < 85 ? 'var(--alert-red)' : 'var(--text-main)' }}>
                  {e.asistencia}%
                </td>
                <td style={{ ...tdStyle, color: e.ejecucion < 40 ? 'var(--alert-red)' : 'var(--text-main)' }}>
                  {e.ejecucion}%
                </td>
                <td style={tdStyle}><SemaforoTag value={e.semaforo} size="sm" /></td>
                <td style={tdStyle}>
                  {e.alertas?.length > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--alert-orange)', fontSize: 12 }}>
                      <AlertTriangle size={13} /> {e.alertas.length}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function School2Icon(props) {
  return <Users {...props} />;
}

function LegendDot({ color, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, color: 'var(--text-muted)' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      {label}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
      Cargando dashboard...
    </div>
  );
}

const thStyle = {
  textAlign: 'left',
  padding: '12px 14px',
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--text-muted)',
  borderBottom: '1px solid var(--border-color)',
};

const tdStyle = {
  padding: '14px',
  fontSize: 15,
  borderBottom: '1px solid var(--border-color)',
};
