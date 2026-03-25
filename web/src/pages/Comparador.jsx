import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Scale } from 'lucide-react';
import api from '../services/api';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

export default function Comparador() {
  const [rbdInput, setRbdInput] = useState('10001, 10002, 10003');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCompare = () => {
    const rbds = rbdInput.split(',').map((s) => parseInt(s.trim())).filter((n) => !isNaN(n));
    if (rbds.length < 2) {
      setError('Ingresa al menos 2 RBDs separados por coma');
      return;
    }
    setLoading(true);
    setError('');
    const params = rbds.map((r) => `rbds=${r}`).join('&');
    api.get(`/compare/?${params}`)
      .then(({ data }) => setData(data))
      .catch((e) => setError(e.response?.data?.detail || 'Error al comparar'))
      .finally(() => setLoading(false));
  };

  // Auto-compare on mount
  useEffect(() => { handleCompare(); }, []);

  const establecimientos = data?.comparacion || [];

  // Data for bar comparison
  const barData = establecimientos.map((e, i) => ({
    name: e.nombre.length > 15 ? e.nombre.slice(0, 15) + '...' : e.nombre,
    asistencia: e.indicadores.asistencia,
    ratio: e.indicadores.ratio_alumno_docente,
    matricula: e.indicadores.matricula,
  }));

  // Data for radar chart (normalized to 0-100)
  const maxMat = Math.max(...establecimientos.map((e) => e.indicadores.matricula || 1));
  const radarData = [
    { metric: 'Asistencia', ...Object.fromEntries(establecimientos.map((e, i) => [`v${i}`, e.indicadores.asistencia])) },
    { metric: 'Matrícula', ...Object.fromEntries(establecimientos.map((e, i) => [`v${i}`, (e.indicadores.matricula / maxMat) * 100])) },
    { metric: 'Docentes', ...Object.fromEntries(establecimientos.map((e, i) => [`v${i}`, Math.min(e.indicadores.docentes * 2, 100)])) },
    { metric: 'Ratio A/D', ...Object.fromEntries(establecimientos.map((e, i) => [`v${i}`, Math.min(e.indicadores.ratio_alumno_docente * 4, 100)])) },
  ];

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
        <Scale size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />
        Comparador
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
        Compara indicadores entre establecimientos
      </p>

      {/* Input */}
      <div className="glass-panel" style={{ padding: 16, marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          value={rbdInput}
          onChange={(e) => setRbdInput(e.target.value)}
          placeholder="RBDs separados por coma: 10001, 10002, 10003"
          style={{
            flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-color)', borderRadius: 8,
            color: 'var(--text-main)', fontSize: 14, outline: 'none',
          }}
        />
        <button
          onClick={handleCompare}
          disabled={loading}
          style={{
            padding: '10px 20px', background: 'var(--accent-primary)',
            color: 'white', border: 'none', borderRadius: 8,
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          {loading ? 'Comparando...' : 'Comparar'}
        </button>
      </div>

      {error && <div style={{ color: 'var(--alert-red)', marginBottom: 16 }}>{error}</div>}

      {establecimientos.length > 0 && (
        <>
          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div className="glass-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Asistencia y ratio</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 13 }} />
                  <Bar dataKey="asistencia" name="Asistencia %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ratio" name="Ratio A/D" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Perfil comparativo</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <PolarRadiusAxis tick={false} axisLine={false} />
                  {establecimientos.map((e, i) => (
                    <Radar key={e.rbd} name={e.nombre} dataKey={`v${i}`} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className="glass-panel" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Detalle comparativo</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Indicador', ...establecimientos.map((e) => e.nombre)].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Matrícula', 'matricula'],
                  ['Asistencia %', 'asistencia'],
                  ['Docentes', 'docentes'],
                  ['Funcionarios', 'funcionarios'],
                  ['Ratio alumno/docente', 'ratio_alumno_docente'],
                  ['Gasto sueldos mensual', 'gasto_sueldos_mensual'],
                  ['Costo por alumno', 'costo_por_alumno'],
                ].map(([label, key]) => (
                  <tr key={key}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{label}</td>
                    {establecimientos.map((e) => {
                      const val = e.indicadores[key];
                      const formatted = key.includes('gasto') || key.includes('costo')
                        ? '$' + (val || 0).toLocaleString('es-CL')
                        : (val || 0).toLocaleString('es-CL');
                      return <td key={e.rbd} style={tdStyle}>{formatted}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

const thStyle = { textAlign: 'left', padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' };
const tdStyle = { padding: '12px', fontSize: 13, borderBottom: '1px solid var(--border-color)' };
