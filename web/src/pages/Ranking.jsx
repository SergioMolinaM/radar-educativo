import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, TrendingDown } from 'lucide-react';
import { slepApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import SemaforoTag from '../components/shared/SemaforoTag';

const METRICS = [
  { key: 'asistencia', label: 'Asistencia %', format: (v) => `${(v || 0).toFixed(1)}%` },
  { key: 'matricula', label: 'Matrícula', format: (v) => (v || 0).toLocaleString('es-CL') },
  { key: 'aprobacion', label: 'Aprobación %', format: (v) => `${(v || 0).toFixed(1)}%`, field: 'tasa_aprobacion' },
  { key: 'retiro', label: 'Retiro %', format: (v) => `${(v || 0).toFixed(1)}%`, field: 'tasa_retiro', invert: true },
  { key: 'promedio', label: 'Promedio', format: (v) => (v || 0).toFixed(1), field: 'promedio_general' },
];

export default function Ranking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState('asistencia');

  useEffect(() => {
    setLoading(true);
    slepApi.ranking(metric)
      .then(({ data }) => setRanking(data.ranking || []))
      .catch(() => {
        // Fallback: try establecimientos endpoint
        slepApi.establecimientos()
          .then(({ data }) => setRanking(data.establecimientos || []))
          .catch(() => {});
      })
      .finally(() => setLoading(false));
  }, [metric, user?.slep_id]);

  if (loading) return <p style={{ color: 'var(--text-muted)', padding: 40 }}>Cargando panorama...</p>;

  const m = METRICS.find((x) => x.key === metric) || METRICS[0];
  const fieldKey = m.field || m.key;
  const top5 = ranking.slice(0, 5);
  const bottom5 = ranking.slice(-5).reverse();

  const getSemaforo = (e) => {
    const asist = e.asistencia || e.asistencia_pct || 0;
    if (asist < 80) return 'rojo';
    if (asist < 88) return 'naranja';
    return 'verde';
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Comparador de brechas entre establecimientos</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
        {ranking.length} establecimientos &middot; Datos base 2025 &middot; Gestión 2026
      </p>

      {/* Metric selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {METRICS.map((mx) => (
          <button key={mx.key} onClick={() => setMetric(mx.key)} style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
            border: '1px solid var(--border-color)',
            background: metric === mx.key ? 'var(--accent-primary)' : 'transparent',
            color: metric === mx.key ? 'white' : 'var(--text-muted)',
          }}>
            {mx.label}
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
            <div key={e.rbd} onClick={() => navigate(`/dashboard/establecimientos/${e.rbd}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i === 0 ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                color: i === 0 ? 'var(--alert-green)' : 'var(--text-muted)',
                fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>
                {e.posicion || i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.nombre}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>RBD {e.rbd}</div>
              </div>
              <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--alert-green)' }}>
                {m.format(e[fieldKey])}
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
            <div key={e.rbd} onClick={() => navigate(`/dashboard/establecimientos/${e.rbd}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i === 0 ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
                color: i === 0 ? 'var(--alert-red)' : 'var(--text-muted)',
                fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>
                {e.posicion || ranking.length - bottom5.length + i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.nombre}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>RBD {e.rbd}</div>
              </div>
              <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--alert-red)' }}>
                {m.format(e[fieldKey])}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Full ranking table */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Detalle completo ({ranking.length} establecimientos)</h3>
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'rgba(15, 23, 42, 0.95)' }}>
              <tr>
                {['#', 'RBD', 'Nombre', 'Asistencia', 'Aprobación', 'Promedio', 'Matrícula', 'Estado'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ranking.map((e, i) => (
                <tr key={e.rbd} onClick={() => navigate(`/dashboard/establecimientos/${e.rbd}`)} style={{ cursor: 'pointer' }}
                  onMouseEnter={(ev) => (ev.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
                >
                  <td style={tdStyle}>{e.posicion || i + 1}</td>
                  <td style={tdStyle}>{e.rbd}</td>
                  <td style={{ ...tdStyle, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.nombre}</td>
                  <td style={{ ...tdStyle, color: e.asistencia < 80 ? '#ef4444' : e.asistencia < 88 ? '#f97316' : '#22c55e' }}>
                    {(e.asistencia || 0).toFixed(1)}%
                  </td>
                  <td style={tdStyle}>{(e.tasa_aprobacion || 0).toFixed(1)}%</td>
                  <td style={tdStyle}>{(e.promedio_general || 0).toFixed(1)}</td>
                  <td style={tdStyle}>{(e.matricula || 0).toLocaleString('es-CL')}</td>
                  <td style={tdStyle}><SemaforoTag value={getSemaforo(e)} size="sm" /></td>
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
