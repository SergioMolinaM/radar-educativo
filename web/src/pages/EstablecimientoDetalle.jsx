import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, GraduationCap, DollarSign, CalendarCheck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { establishmentsApi } from '../services/api';
import KpiCard from '../components/shared/KpiCard';
import SemaforoTag from '../components/shared/SemaforoTag';

export default function EstablecimientoDetalle() {
  const { rbd } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    establishmentsApi.get(rbd)
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [rbd]);

  if (loading) return <p style={{ color: 'var(--text-muted)', padding: 40 }}>Cargando...</p>;
  if (!data) return <p style={{ color: 'var(--alert-red)', padding: 40 }}>Establecimiento no encontrado</p>;

  const trendData = (data.asistencia?.tendencia || []).map((v, i) => ({
    mes: `Mes ${i + 1}`,
    valor: data.asistencia.promedio_mensual + v,
  }));

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, marginBottom: 16, padding: 0 }}
      >
        <ArrowLeft size={16} /> Volver
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{data.nombre}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            RBD {data.rbd} &middot; {data.tipo} &middot; {data.comuna} &middot; {data.direccion}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SemaforoTag value={data.semaforo} />
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{data.alertas_activas} alertas</span>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Matrícula actual" value={data.matricula?.actual} icon={GraduationCap} trend={data.matricula?.variacion} />
        <KpiCard label="Asistencia mensual" value={data.asistencia?.promedio_mensual} unit="%" icon={CalendarCheck} />
        <KpiCard label="Docentes" value={data.dotacion?.docentes} icon={Users} />
        <KpiCard label="Ratio alumno/docente" value={data.dotacion?.ratio_alumno_docente} icon={Users} />
        <KpiCard label="Ejecución presupuestaria" value={data.financiero?.porcentaje_ejecucion} unit="%" icon={DollarSign} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Tendencia asistencia */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Tendencia de asistencia</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <XAxis dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[70, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 13 }} />
              <Line type="monotone" dataKey="valor" stroke="var(--accent-primary)" strokeWidth={2} dot={{ fill: 'var(--accent-primary)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Info financiera */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Resumen financiero</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <InfoRow label="Presupuesto anual" value={'$' + (data.financiero?.presupuesto_anual / 1000000).toFixed(0) + 'M CLP'} />
            <InfoRow label="Ejecutado" value={'$' + (data.financiero?.ejecutado / 1000000).toFixed(0) + 'M CLP'} />
            <InfoRow label="% Ejecución" value={data.financiero?.porcentaje_ejecucion + '%'} highlight={data.financiero?.porcentaje_ejecucion < 40} />
            <InfoRow label="Órdenes activas" value={data.financiero?.ordenes_compra_activas} />
            <InfoRow label="Asistentes educación" value={data.dotacion?.asistentes} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 600, color: highlight ? 'var(--alert-red)' : 'var(--text-main)' }}>{value}</span>
    </div>
  );
}
