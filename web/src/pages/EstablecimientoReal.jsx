import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, GraduationCap, CalendarCheck, Users, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { slepApi } from '../services/api';
import KpiCard from '../components/shared/KpiCard';
import SemaforoTag from '../components/shared/SemaforoTag';

const PIE_COLORS = ['#22c55e', '#ef4444', '#f97316', '#6366f1'];

export default function EstablecimientoReal() {
  const { rbd } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    slepApi.establecimiento(rbd)
      .then(({ data }) => setData(data))
      .catch((e) => setError(e.response?.data?.detail || 'Error cargando datos'))
      .finally(() => setLoading(false));
  }, [rbd]);

  if (loading) return <p style={{ color: 'var(--text-muted)', padding: 40, fontSize: 15 }}>Cargando establecimiento...</p>;
  if (error) return <p style={{ color: 'var(--alert-red)', padding: 40, fontSize: 15 }}>{error}</p>;
  if (!data) return null;

  const rend = data.rendimiento || {};
  const sep = data.sep || {};
  const tendencia = data.asistencia_tendencia || [];

  // Pie chart data for rendimiento
  const pieData = rend.total_alumnos ? [
    { name: 'Aprobados', value: rend.aprobados || 0 },
    { name: 'Reprobados', value: rend.reprobados || 0 },
    { name: 'Retirados', value: rend.retirados || 0 },
    { name: 'Trasladados', value: rend.trasladados || 0 },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, marginBottom: 16, padding: 0 }}>
        <ArrowLeft size={16} /> Volver
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{data.nombre}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            RBD {data.rbd} &middot; {data.comuna} &middot; {data.nombre_slep}
          </p>
        </div>
        <SemaforoTag value={data.semaforo} />
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Matri&#769;cula 2025" value={data.matricula || 0} icon={GraduationCap} />
        <KpiCard label="Asistencia actual" value={data.asistencia_actual || 0} unit="%" icon={CalendarCheck} />
        <KpiCard label="Tasa aprobacio&#769;n" value={rend.tasa_aprobacion || 0} unit="%" icon={TrendingUp} />
        <KpiCard label="Alumnos SEP" value={sep.total_sep || 0} icon={Users}
          trend={sep.pct_sep ? `${sep.pct_sep}% del total` : null} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Tendencia asistencia mensual */}
        {tendencia.length > 1 && (
          <div className="glass-panel" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Asistencia mensual 2025</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={tendencia}>
                <XAxis dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[40, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 13 }}
                  formatter={(v) => `${v}%`} />
                <Line type="monotone" dataKey="asistencia" stroke="#3b82f6" strokeWidth={2.5}
                  dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                {/* Reference line at 80% */}
                <Line type="monotone" dataKey={() => 80} stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5"
                  dot={false} name="Umbral 80%" />
              </LineChart>
            </ResponsiveContainer>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Linea roja: umbral critico 80%</p>
          </div>
        )}

        {/* Rendimiento pie chart */}
        {pieData.length > 0 && (
          <div className="glass-panel" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Rendimiento 2025</h3>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    paddingAngle={2} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, paddingLeft: 16 }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#22c55e' }}>{rend.tasa_aprobacion}%</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Tasa de aprobación</div>
                {pieData.map((d, i) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: PIE_COLORS[i], flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-muted)' }}>{d.name}: {d.value.toLocaleString('es-CL')}</span>
                  </div>
                ))}
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  Promedio general: <strong style={{ color: 'var(--text-main)' }}>{rend.prom_general || '?'}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SEP Detail */}
      {sep.total_sep > 0 && (
        <div className="glass-panel" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Subvención Escolar Preferencial (SEP)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <StatBox label="Total alumnos SEP" value={sep.total_sep} sub={`${sep.pct_sep}% de la matrícula`} />
            <StatBox label="Prioritarios" value={sep.prioritarios} sub="Máximo nivel de vulnerabilidad" color="#ef4444" />
            <StatBox label="Preferentes" value={sep.preferentes} sub="Nivel intermedio" color="#f97316" />
          </div>
        </div>
      )}

      {/* Analisis de riesgos */}
      <div className="glass-panel" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Análisis de riesgos</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <RiskIndicator label="Asistencia" active={data.asistencia_actual < 80}
            detail={data.asistencia_actual < 80 ? `${data.asistencia_actual}% - bajo umbral crítico 80%` : `${data.asistencia_actual}% - aceptable`} />
          <RiskIndicator label="Aprobación" active={rend.tasa_aprobacion > 0 && rend.tasa_aprobacion < 85}
            detail={rend.tasa_aprobacion ? `${rend.tasa_aprobacion}% de aprobación` : 'Sin datos'} />
          <RiskIndicator label="Retiro escolar" active={rend.tasa_retiro > 5}
            detail={rend.tasa_retiro ? `${rend.tasa_retiro}% de retiro` : 'Sin datos'} />
          <RiskIndicator label="Vulnerabilidad SEP" active={sep.pct_sep > 80}
            detail={sep.pct_sep ? `${sep.pct_sep}% alumnos SEP` : 'Sin datos SEP'} />
        </div>

        <div style={{ marginTop: 20, padding: 16, background: data.semaforo === 'rojo' ? 'rgba(239,68,68,0.08)' : data.semaforo === 'naranja' ? 'rgba(249,115,22,0.08)' : 'rgba(34,197,94,0.08)', borderRadius: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: data.semaforo === 'rojo' ? '#ef4444' : data.semaforo === 'naranja' ? '#f97316' : '#22c55e', marginBottom: 6 }}>
            Estado: {data.semaforo?.toUpperCase()}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {data.semaforo === 'rojo' && 'Este establecimiento requiere intervención inmediata. Revise plan de acción y contacte al equipo directivo.'}
            {data.semaforo === 'naranja' && 'Requiere monitoreo activo. Agende revisión con el equipo directivo dentro de las próximas 2 semanas.'}
            {data.semaforo === 'verde' && 'Indicadores dentro de rangos aceptables. Mantener monitoreo regular.'}
          </div>
        </div>
      </div>

      {/* Disclosure */}
      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7, padding: '12px 0', borderTop: '1px solid var(--border-color)' }}>
        <strong>Fuentes:</strong> Asistencia y matrícula - MINEDUC SIGE 2025.
        Rendimiento - MINEDUC Datos Abiertos 2025. Alumnos SEP - MINEDUC Abril 2025.
        Semaforos y alertas calculados por Radar de la Educación Pública en base a umbrales definidos.
        &middot; Tercera Letra SpA &middot; {data.source === '2025_real' ? 'Datos reales verificados' : 'Datos parciales'}
      </div>
    </div>
  );
}

function StatBox({ label, value, sub, color }) {
  return (
    <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color || 'var(--text-main)' }}>{(value || 0).toLocaleString('es-CL')}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function RiskIndicator({ label, active, detail }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{
        width: 10, height: 10, borderRadius: '50%', marginTop: 5, flexShrink: 0,
        background: active ? '#ef4444' : '#22c55e',
        boxShadow: `0 0 8px ${active ? '#ef4444' : '#22c55e'}`,
      }} />
      <div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{detail}</div>
      </div>
    </div>
  );
}
