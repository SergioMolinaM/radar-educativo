import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, CalendarCheck, ShieldAlert, AlertTriangle, Download, Search, ArrowUpDown } from 'lucide-react';
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
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('asistencia');
  const [sortAsc, setSortAsc] = useState(true);
  const [filterSemaforo, setFilterSemaforo] = useState('');

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
    asistencia: e.asistencia_pct || 0,
  }));

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            SLEP {user?.slep_id?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Mi SLEP'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {overview?.nombre_sostenedor || 'Datos reales 2025'}
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
        <KpiCard label="Establecimientos" value={kpis.total_establecimientos || kpis.ee_oficial} icon={Users}
          subtitle={overview?.cobertura_datos}
          tooltip={{ text: `Total oficial: ${kpis.ee_oficial || '?'} EE. Datos para ${kpis.ee_con_datos || '?'} EE.`, fuente: 'Sitio oficial SLEP + MINEDUC 2025' }} />
        <KpiCard label="Matrícula total" value={kpis.matricula_total} icon={GraduationCap}
          tooltip={{ text: 'Alumnos matriculados en el SLEP', fuente: 'MINEDUC Matrícula 2025' }} />
        <KpiCard label="Asistencia prom." value={kpis.asistencia_promedio} unit="%" icon={CalendarCheck}
          tooltip={{ text: 'Promedio del SLEP (sin ed. adultos)', fuente: 'MINEDUC Asistencia 2025', periodo: overview?.mes_nombre }} />
        <KpiCard label="Vulnerabilidad" value={kpis.vulnerabilidad_promedio || '—'} unit={kpis.vulnerabilidad_promedio ? '%' : ''} icon={ShieldAlert}
          tooltip={{ text: 'Porcentaje de alumnos prioritarios SEP', fuente: 'MINEDUC SEP 2025' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, marginBottom: 24 }}>
        {/* Semáforo resumen */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Distribución semáforo</h3>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>
            Rojo: asistencia &lt;75% · Naranja: 75-82% · Verde: &ge;82%<br/>
            Umbrales configurables por el SLEP
          </div>
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

      {/* Tabla con búsqueda, filtros y ordenamiento */}
      <div className="glass-panel" style={{ padding: 24 }}>
        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o RBD..."
              style={{ width: '100%', padding: '8px 12px 8px 34px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          {['', 'rojo', 'naranja', 'verde'].map((f) => (
            <button key={f} onClick={() => setFilterSemaforo(f)} style={{
              padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
              border: '1px solid var(--border-color)',
              background: filterSemaforo === f ? 'var(--accent-primary)' : 'transparent',
              color: filterSemaforo === f ? 'white' : 'var(--text-muted)',
            }}>
              {f || 'Todos'}
            </button>
          ))}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 12 }}
          >
            <option value="asistencia">Ordenar: Asistencia</option>
            <option value="matricula">Ordenar: Matrícula</option>
            <option value="vulnerabilidad_pct">Ordenar: Vulnerabilidad</option>
            <option value="nombre">Ordenar: Nombre</option>
          </select>
          <button onClick={() => setSortAsc(!sortAsc)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
            <ArrowUpDown size={16} />
          </button>
        </div>

        {(() => {
          let filtered = establecimientos;
          if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter((e) => e.nombre.toLowerCase().includes(q) || String(e.rbd).includes(q));
          }
          if (filterSemaforo) {
            filtered = filtered.filter((e) => {
              const s = e.semaforo === 'roj' ? 'rojo' : e.semaforo === 'naranj' ? 'naranja' : e.semaforo;
              return s === filterSemaforo;
            });
          }
          filtered = [...filtered].sort((a, b) => {
            const va = sortBy === 'nombre' ? a.nombre : a[sortBy];
            const vb = sortBy === 'nombre' ? b.nombre : b[sortBy];
            if (typeof va === 'string') return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
            return sortAsc ? va - vb : vb - va;
          });

          return (
            <>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                Mostrando {filtered.length} de {establecimientos.length} establecimientos
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
                    {filtered.map((e) => (
                      <tr key={e.rbd} onClick={() => navigate(`/mi-slep/${e.rbd}`)}
                        style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={(ev) => (ev.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                        onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
                      >
                        <td style={tdStyle}>{e.rbd}</td>
                        <td style={tdStyle}>{e.nombre}</td>
                        <td style={tdStyle}>{e.matricula.toLocaleString('es-CL')}</td>
                        <td style={{ ...tdStyle, color: (e.asistencia_pct || 0) < 75 ? 'var(--alert-red)' : (e.asistencia_pct || 0) < 82 ? 'var(--alert-orange)' : 'var(--text-main)', fontWeight: (e.asistencia_pct || 0) < 75 ? 700 : 400 }}>
                          {(e.asistencia_pct || 0)}%
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
            </>
          );
        })()}
      </div>
    </div>
  );
}

const thStyle = { textAlign: 'left', padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' };
const tdStyle = { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid var(--border-color)' };
