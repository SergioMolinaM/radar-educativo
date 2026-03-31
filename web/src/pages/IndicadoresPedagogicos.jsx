import { useState, useEffect } from 'react';
import { GraduationCap, TrendingUp, TrendingDown, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend, PieChart, Pie } from 'recharts';
import { pedagogicoApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const NIVEL_LABELS = { '4B': '4to Basico', '6B': '6to Basico', '2M': '2do Medio' };
const COLORES = { lectura: '#3b82f6', matematica: '#8b5cf6' };

export default function IndicadoresPedagogicos() {
  const { user } = useAuth();
  const [simce, setSimce] = useState(null);
  const [rend, setRend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('rendimiento');

  useEffect(() => {
    Promise.all([pedagogicoApi.simce(), pedagogicoApi.rendimiento()])
      .then(([s, r]) => { setSimce(s.data); setRend(r.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.slep_id]);

  if (loading) return <p style={{ color: 'var(--text-muted)', padding: 40, fontSize: 15 }}>Cargando indicadores...</p>;

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
        <BookOpen size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />
        Indicadores Pedagógicos
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 6 }}>
        Rendimiento académico y resultados SIMCE del SLEP
      </p>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
        <strong>Rendimiento:</strong> tasas de aprobación, reprobación y retiro de cada establecimiento (MINEDUC 2025).
        Permite identificar donde se concentra la deserción y el bajo rendimiento.
        <strong> SIMCE:</strong> promedios de lectura y matemática por nivel, comparando resultados dentro del SLEP (Agencia de Calidad 2024).
      </div>

      {/* Tab selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { key: 'rendimiento', label: 'Rendimiento', icon: TrendingUp },
          { key: 'simce', label: 'SIMCE', icon: GraduationCap },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '9px 18px', borderRadius: 8, fontSize: 14, cursor: 'pointer',
            border: '1px solid var(--border-color)',
            background: tab === t.key ? 'var(--accent-primary)' : 'transparent',
            color: tab === t.key ? 'white' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'simce' ? <SimceView data={simce} /> : <RendimientoView data={rend} />}

      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7, padding: '16px 0', borderTop: '1px solid var(--border-color)', marginTop: 16 }}>
        <strong>Fuentes:</strong> SIMCE — Agencia de Calidad de la Educación, resultados oficiales 2024.
        Los promedios mostrados corresponden al SLEP (no al promedio nacional).
        Rendimiento — MINEDUC Datos Abiertos 2025. &middot; Tercera Letra SpA
      </div>
    </div>
  );
}

function SimceView({ data }) {
  if (!data?.resumen?.length) return <p style={{ color: 'var(--text-muted)', padding: 20 }}>Sin datos SIMCE disponibles.</p>;

  // Group by nivel for chart
  const niveles = [...new Set(data.resumen.map(r => r.nivel))];
  const chartData = niveles.map(n => {
    const rows = data.resumen.filter(r => r.nivel === n);
    const latest = rows[0]; // most recent year (sorted DESC)
    return {
      nivel: NIVEL_LABELS[n] || n,
      lectura: parseFloat(latest.avg_lectura || 0),
      matematica: parseFloat(latest.avg_matematica || 0),
      n_ee: latest.n_ee,
      anio: latest.anio,
    };
  });

  return (
    <>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {chartData.map(d => (
          <div key={d.nivel} className="glass-panel" style={{ padding: 20 }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{d.nivel} ({d.anio})</div>
            <div style={{ display: 'flex', gap: 20 }}>
              <div>
                <div style={{ fontSize: 26, fontWeight: 700, color: d.lectura < 250 ? '#ef4444' : '#3b82f6' }}>{d.lectura}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Lectura</div>
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 700, color: d.matematica < 250 ? '#ef4444' : '#8b5cf6' }}>{d.matematica}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Matemática</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{d.n_ee} establecimientos evaluados</div>
          </div>
        ))}
      </div>

      {/* Chart comparison */}
      <div className="glass-panel" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
          Promedios SIMCE del SLEP por nivel
          <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>
            (promedio de los establecimientos del SLEP evaluados)
          </span>
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} barGap={4}>
            <XAxis dataKey="nivel" tick={{ fill: '#94a3b8', fontSize: 13 }} axisLine={false} tickLine={false} />
            <YAxis domain={[180, 300]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 13 }} />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Bar dataKey="lectura" name="Lectura" fill={COLORES.lectura} radius={[6, 6, 0, 0]} barSize={40} />
            <Bar dataKey="matematica" name="Matemática" fill={COLORES.matematica} radius={[6, 6, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detail table */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Detalle por establecimiento (último año)</h3>
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead style={{ position: 'sticky', top: 0, background: 'rgba(15,23,42,0.95)' }}>
              <tr>
                {['RBD', 'Nombre', 'Nivel', 'Lectura', 'Matemática', 'Estado'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data.detalle || []).map((d, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={tdStyle}>{d.rbd}</td>
                  <td style={{ ...tdStyle, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nom_rbd}</td>
                  <td style={tdStyle}>{NIVEL_LABELS[d.nivel] || d.nivel}</td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: d.prom_lectura < 250 ? '#ef4444' : '#3b82f6' }}>
                    {d.prom_lectura || '\u2014'}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: d.prom_matematica < 250 ? '#ef4444' : '#8b5cf6' }}>
                    {d.prom_matematica || '\u2014'}
                  </td>
                  <td style={{ ...tdStyle, fontSize: 12 }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 6,
                      background: d.estado_resultado === 'preliminar' ? 'rgba(249,115,22,0.15)' : 'rgba(16,185,129,0.15)',
                      color: d.estado_resultado === 'preliminar' ? '#f97316' : '#10b981',
                    }}>
                      {d.estado_resultado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function RendimientoView({ data }) {
  if (!data?.resumen_2025?.total_alumnos) return <p style={{ color: 'var(--text-muted)', padding: 20 }}>Sin datos de rendimiento.</p>;

  const r = data.resumen_2025;
  const pieData = [
    { name: 'Aprobados', value: r.aprobados, color: '#22c55e' },
    { name: 'Reprobados', value: r.reprobados, color: '#ef4444' },
    { name: 'Retirados', value: r.retirados, color: '#f97316' },
    { name: 'Trasladados', value: r.trasladados, color: '#6366f1' },
  ].filter(d => d.value > 0);

  // Historical trend
  const histData = [...(data.historico || []), {
    anio: 2025, aprobados: r.aprobados, reprobados: r.reprobados, retirados: r.retirados, tasa_aprobacion: r.tasa_aprobacion,
  }];

  return (
    <>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, marginBottom: 24 }}>
        <KpiBox label="Total alumnos" value={r.total_alumnos?.toLocaleString('es-CL')} />
        <KpiBox label="Tasa aprobación" value={`${r.tasa_aprobacion}%`} color={r.tasa_aprobacion >= 90 ? '#22c55e' : r.tasa_aprobacion >= 85 ? '#f59e0b' : '#ef4444'} />
        <KpiBox label="Promedio general" value={r.promedio_general} />
        <KpiBox label="Prom. asistencia" value={`${r.promedio_asistencia}%`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Pie */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Rendimiento SLEP 2025</h3>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {pieData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, marginBottom: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
                  {d.name}: <strong>{d.value.toLocaleString('es-CL')}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trend */}
        {histData.length > 1 && (
          <div className="glass-panel" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Evolución tasa de aprobación</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={histData}>
                <XAxis dataKey="anio" tick={{ fill: '#94a3b8', fontSize: 13 }} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} formatter={v => `${v}%`} />
                <Line type="monotone" dataKey="tasa_aprobacion" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 5 }} name="Aprobación %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Rendimiento por establecimiento 2025</h3>
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead style={{ position: 'sticky', top: 0, background: 'rgba(15,23,42,0.95)' }}>
              <tr>
                {['#', 'RBD', 'Nombre', 'Alumnos', 'Aprobación', 'Retiro', 'Promedio'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data.establecimientos || []).map((e, i) => (
                <tr key={e.rbd} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={tdStyle}>{i + 1}</td>
                  <td style={tdStyle}>{e.rbd}</td>
                  <td style={{ ...tdStyle, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.nombre}</td>
                  <td style={tdStyle}>{e.total?.toLocaleString('es-CL')}</td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: e.tasa_aprobacion < 85 ? '#ef4444' : '#22c55e' }}>
                    {e.tasa_aprobacion}%
                  </td>
                  <td style={{ ...tdStyle, color: e.tasa_retiro > 5 ? '#ef4444' : 'var(--text-muted)' }}>
                    {e.tasa_retiro}%
                  </td>
                  <td style={tdStyle}>{e.promedio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function KpiBox({ label, value, color }) {
  return (
    <div className="glass-panel" style={{ padding: '16px 20px' }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color || 'var(--text-main)' }}>{value}</div>
    </div>
  );
}

const thStyle = { textAlign: 'left', padding: '10px 12px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' };
const tdStyle = { padding: '10px 12px', fontSize: 14, borderBottom: '1px solid var(--border-color)' };
