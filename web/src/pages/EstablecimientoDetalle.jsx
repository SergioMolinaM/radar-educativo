import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, GraduationCap, CalendarCheck, TrendingUp, AlertTriangle } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { slepApi } from '../services/api';
import KpiCard from '../components/shared/KpiCard';
import SemaforoTag from '../components/shared/SemaforoTag';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

export default function EstablecimientoDetalle() {
  const { rbd } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    slepApi.establecimiento(rbd)
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [rbd]);

  if (loading) return <p style={{ color: 'var(--text-muted)', padding: 40 }}>Cargando...</p>;
  if (!data || data.error) return <p style={{ color: 'var(--alert-red)', padding: 40 }}>Establecimiento no encontrado</p>;

  const asistMensual = (data.asistencia_mensual || []).map(m => ({
    mes: m.mes_nombre,
    asistencia: m.asistencia,
    alumnos: m.alumnos,
  }));

  const rendPie = data.rendimiento ? [
    { name: 'Aprobados', value: data.rendimiento.aprobados, color: '#22c55e' },
    { name: 'Reprobados', value: data.rendimiento.reprobados, color: '#ef4444' },
    { name: 'Retirados', value: data.rendimiento.retirados, color: '#f97316' },
    { name: 'Trasladados', value: data.rendimiento.trasladados || 0, color: '#94a3b8' },
  ].filter(d => d.value > 0) : [];

  const asistCategorias = data.asistencia_anual ? [
    { name: 'Inasist. Grave', value: data.asistencia_anual.cronica_grave, color: '#ef4444' },
    { name: 'Inasist. Reiterada', value: data.asistencia_anual.cronica, color: '#f97316' },
    { name: 'En riesgo', value: data.asistencia_anual.en_riesgo, color: '#eab308' },
    { name: 'Normal', value: data.asistencia_anual.normal, color: '#22c55e' },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, marginBottom: 16, padding: 0 }}
      >
        <ArrowLeft size={16} /> Volver
      </button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{data.nombre}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            RBD {data.rbd} &middot; {data.comuna} &middot; {data.region || ''} {data.rural ? '(Rural)' : ''}
          </p>
          {data.slep && <p style={{ color: 'var(--accent-primary)', fontSize: 13 }}>SLEP {data.slep}</p>}
        </div>
        <SemaforoTag value={data.semaforo} />
      </div>

      {/* KPIs row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Matrícula" value={data.matricula?.total?.toLocaleString('es-CL')} icon={GraduationCap} />
        <KpiCard
          label="Asistencia anual"
          value={data.asistencia_anual?.promedio ? data.asistencia_anual.promedio.toFixed(1) : '-'}
          unit="%" icon={CalendarCheck}
        />
        <KpiCard
          label="Tasa aprobación"
          value={data.rendimiento?.tasa_aprobacion?.toFixed(1) || '-'}
          unit="%" icon={TrendingUp}
        />
        <KpiCard
          label="Alumnos SEP"
          value={data.sep ? `${data.sep.total} (${data.sep.pct_sep}%)` : '-'}
          icon={Users}
        />
        <KpiCard
          label="Promedio general"
          value={data.rendimiento?.promedio_general?.toFixed(1) || '-'}
          icon={GraduationCap}
        />
      </div>

      {/* Charts row 1: Asistencia mensual + Rendimiento */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Asistencia mensual 2025</h3>
          {asistMensual.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={asistMensual}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                <YAxis domain={[60, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 13 }} />
                <Line type="monotone" dataKey="asistencia" stroke="var(--accent-primary)" strokeWidth={2.5} dot={{ fill: 'var(--accent-primary)', r: 4 }} name="Asistencia %" />
              </LineChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sin datos de asistencia mensual</p>}
        </div>

        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Rendimiento 2025</h3>
          {rendPie.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={rendPie} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2}>
                    {rendPie.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}>
                {rendPie.map((d, i) => (
                  <span key={i} style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, display: 'inline-block' }} />
                    {d.name}: {d.value.toLocaleString('es-CL')}
                  </span>
                ))}
              </div>
            </>
          ) : <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sin datos de rendimiento</p>}
        </div>
      </div>

      {/* Charts row 2: Categorías asistencia + Info detalle */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Categorías de asistencia anual</h3>
          {asistCategorias.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={asistCategorias} layout="vertical">
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} width={120} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 13 }} />
                <Bar dataKey="value" name="Alumnos" radius={[0, 4, 4, 0]}>
                  {asistCategorias.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sin datos anuales</p>}
        </div>

        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Detalle SEP y matrícula</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <InfoRow label="Matrícula total" value={data.matricula?.total?.toLocaleString('es-CL')} />
            <InfoRow label="Hombres" value={data.matricula?.hombres?.toLocaleString('es-CL')} />
            <InfoRow label="Mujeres" value={data.matricula?.mujeres?.toLocaleString('es-CL')} />
            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
            <InfoRow label="Alumnos SEP" value={data.sep?.total?.toLocaleString('es-CL')} />
            <InfoRow label="Prioritarios" value={data.sep?.prioritarios?.toLocaleString('es-CL')} />
            <InfoRow label="Preferentes" value={data.sep?.preferentes?.toLocaleString('es-CL')} />
            <InfoRow label="% SEP" value={data.sep?.pct_sep ? data.sep.pct_sep + '%' : '-'}
              highlight={data.sep?.pct_sep > 70} />
          </div>
        </div>
      </div>

      {/* Disclosure */}
      <div style={{ marginTop: 24, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)' }}>
        <AlertTriangle size={14} style={{ display: 'inline', marginRight: 6 }} />
        <strong>Fuente de datos:</strong> Datos oficiales Mineduc 2025 (Directorio, Matrícula, Rendimiento, Asistencia declarada, SEP).
        Procesados por Radar Educativo - Tercera Letra SpA. Los datos corresponden al año escolar 2025 y pueden tener rezago
        respecto a la información más reciente declarada por los establecimientos.
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 600, color: highlight ? 'var(--alert-red)' : 'var(--text-main)' }}>{value || '-'}</span>
    </div>
  );
}
