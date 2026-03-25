import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, GraduationCap, CalendarCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { slepApi } from '../services/api';
import KpiCard from '../components/shared/KpiCard';
import SemaforoTag from '../components/shared/SemaforoTag';

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

  if (loading) return <p style={{ color: 'var(--text-muted)', padding: 40 }}>Cargando establecimiento...</p>;
  if (error) return <p style={{ color: 'var(--alert-red)', padding: 40 }}>{error}</p>;
  if (!data) return null;

  const semaforo = data.semaforo === 'roj' ? 'rojo' : data.semaforo === 'naranj' ? 'naranja' : data.semaforo;

  // Comparison data: abril vs julio
  const compData = [];
  if (data.asistencia?.abril) compData.push({ periodo: 'Abril', asistencia: data.asistencia.abril });
  if (data.asistencia?.julio) compData.push({ periodo: 'Julio', asistencia: data.asistencia.julio });

  const matCompData = [];
  if (data.matricula?.abril) matCompData.push({ periodo: 'Abril', matricula: data.matricula.abril });
  if (data.matricula?.julio) matCompData.push({ periodo: 'Julio', matricula: data.matricula.julio });

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, marginBottom: 16, padding: 0 }}
      >
        <ArrowLeft size={16} /> Volver al SLEP
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{data.nombre}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            RBD {data.rbd} &middot; Comuna {data.codigo_comuna} &middot; {data.nombre_sostenedor}
          </p>
        </div>
        <SemaforoTag value={semaforo} />
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Matrícula" value={data.matricula?.abril || 0} icon={GraduationCap}
          trend={data.matricula?.variacion} />
        <KpiCard label="Asistencia abril" value={data.asistencia?.abril || 0} unit="%" icon={CalendarCheck} />
        {data.asistencia?.julio && (
          <KpiCard label="Asistencia julio" value={data.asistencia.julio} unit="%" icon={CalendarCheck}
            trend={data.asistencia.variacion} />
        )}
        <KpiCard label="Vulnerabilidad" value={data.vulnerabilidad?.proporcion || 0} unit="%" icon={ShieldAlert} />
        <KpiCard label="Alumnos vulnerables" value={data.vulnerabilidad?.total || 0} icon={AlertTriangle} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Asistencia abril vs julio */}
        {compData.length > 0 && (
          <div className="glass-panel" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Asistencia: abril vs julio</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={compData} barSize={50}>
                <XAxis dataKey="periodo" tick={{ fill: '#94a3b8', fontSize: 13 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 13 }} formatter={(v) => `${v}%`} />
                <Bar dataKey="asistencia" radius={[6, 6, 0, 0]}>
                  {compData.map((entry, i) => (
                    <Cell key={i} fill={entry.asistencia < 85 ? '#ef4444' : entry.asistencia < 90 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Riesgos */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Análisis de riesgos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <RiskIndicator
              label="Riesgo de asistencia"
              active={data.riesgos?.asistencia}
              detail={data.asistencia?.abril < 85 ? `Asistencia ${data.asistencia.abril}% bajo umbral 85%` : 'Dentro de rango aceptable'}
            />
            <RiskIndicator
              label="Riesgo de vulnerabilidad"
              active={data.riesgos?.vulnerabilidad}
              detail={`${data.vulnerabilidad?.proporcion}% de alumnos vulnerables (${data.vulnerabilidad?.total} alumnos)`}
            />
            <RiskIndicator
              label="Variación matrícula"
              active={data.matricula?.variacion && data.matricula.variacion < -5}
              detail={data.matricula?.variacion ? `${data.matricula.variacion > 0 ? '+' : ''}${data.matricula.variacion}% entre abril y julio` : 'Sin datos comparativos'}
            />
          </div>

          <div style={{ marginTop: 24, padding: 16, background: 'rgba(59,130,246,0.08)', borderRadius: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-primary)', marginBottom: 8 }}>
              Semáforo: {semaforo.toUpperCase()}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {semaforo === 'rojo' && 'Este establecimiento requiere intervención inmediata. Revise plan de acción y contacte al equipo directivo.'}
              {semaforo === 'naranja' && 'Requiere monitoreo activo. Agende revisión con el equipo directivo dentro de las próximas 2 semanas.'}
              {semaforo === 'verde' && 'Indicadores dentro de rangos aceptables. Mantener monitoreo regular.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskIndicator({ label, active, detail }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{
        width: 10, height: 10, borderRadius: '50%', marginTop: 4, flexShrink: 0,
        background: active ? 'var(--alert-red)' : 'var(--alert-green)',
        boxShadow: `0 0 8px ${active ? 'var(--alert-red)' : 'var(--alert-green)'}`,
      }} />
      <div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{detail}</div>
      </div>
    </div>
  );
}
