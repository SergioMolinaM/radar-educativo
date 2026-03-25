import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, TrendingDown } from 'lucide-react';
import { slepApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import SemaforoTag from '../components/shared/SemaforoTag';

const METRICS = [
  { key: 'asistencia', label: 'Asistencia %', format: (v) => `${v}%` },
  { key: 'matricula', label: 'Matrícula', format: (v) => v.toLocaleString('es-CL') },
  { key: 'vulnerabilidad_pct', label: 'Vulnerabilidad %', format: (v) => `${v}%`, invert: true },
];

export default function Ranking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [establecimientos, setEstablecimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState('asistencia');

  useEffect(() => {
    slepApi.establecimientos()
      .then(({ data }) => setEstablecimientos(data.establecimientos || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.slep_id]);

  if (loading) return <p style={{ color: 'var(--text-muted)', padding: 40 }}>Cargando ranking...</p>;

  const m = METRICS.find((x) => x.key === metric) || METRICS[0];
  const sorted = [...establecimientos].sort((a, b) => m.invert ? a[metric] - b[metric] : b[metric] - a[metric]);
  const top5 = sorted.slice(0, 5);
  const bottom5 = sorted.slice(-5).reverse();

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Ranking</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
        Mejores y peores establecimientos por indicador
      </p>

      {/* Metric selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {METRICS.map((m) => (
          <button key={m.key} onClick={() => setMetric(m.key)} style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
            border: '1px solid var(--border-color)',
            background: metric === m.key ? 'var(--accent-primary)' : 'transparent',
            color: metric === m.key ? 'white' : 'var(--text-muted)',
          }}>
            {m.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Top 5 */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy size={18} style={{ color: 'var(--alert-green)' }} />
            Top 5 - {m.invert ? 'Menor' : 'Mayor'} {m.label}
          </h3>
          {top5.map((e, i) => (
            <div key={e.rbd} onClick={() => navigate(`/mi-slep/${e.rbd}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i === 0 ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                color: i === 0 ? 'var(--alert-green)' : 'var(--text-muted)',
                fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>
                {i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.nombre}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>RBD {e.rbd}</div>
              </div>
              <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--alert-green)' }}>
                {m.format(e[metric])}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom 5 */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingDown size={18} style={{ color: 'var(--alert-red)' }} />
            Bottom 5 - {m.invert ? 'Mayor' : 'Menor'} {m.label}
          </h3>
          {bottom5.map((e, i) => (
            <div key={e.rbd} onClick={() => navigate(`/mi-slep/${e.rbd}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i === 0 ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
                color: i === 0 ? 'var(--alert-red)' : 'var(--text-muted)',
                fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>
                {sorted.length - bottom5.length + i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.nombre}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>RBD {e.rbd}</div>
              </div>
              <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--alert-red)' }}>
                {m.format(e[metric])}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Full ranking table */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Ranking completo ({sorted.length} establecimientos)</h3>
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'rgba(15, 23, 42, 0.95)' }}>
              <tr>
                {['#', 'RBD', 'Nombre', m.label, 'Semáforo'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((e, i) => (
                <tr key={e.rbd} onClick={() => navigate(`/mi-slep/${e.rbd}`)} style={{ cursor: 'pointer' }}
                  onMouseEnter={(ev) => (ev.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
                >
                  <td style={tdStyle}>{i + 1}</td>
                  <td style={tdStyle}>{e.rbd}</td>
                  <td style={tdStyle}>{e.nombre}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{m.format(e[metric])}</td>
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

const thStyle = { textAlign: 'left', padding: '8px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' };
const tdStyle = { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid var(--border-color)' };
