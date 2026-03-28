import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUpDown, Filter } from 'lucide-react';
import { slepApi } from '../services/api';
import SemaforoTag from '../components/shared/SemaforoTag';

export default function Establecimientos() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('nombre');
  const [sortAsc, setSortAsc] = useState(true);
  const [filtroSemaforo, setFiltroSemaforo] = useState('todos');
  const [meses, setMeses] = useState([]);
  const [mesActual, setMesActual] = useState(null);
  const [excluirAdultos, setExcluirAdultos] = useState(true);
  const navigate = useNavigate();

  // Load available months
  useEffect(() => {
    slepApi.meses().then(({ data }) => setMeses(data.meses || [])).catch(() => {});
  }, []);

  // Load establishments
  useEffect(() => {
    setLoading(true);
    const params = {};
    if (mesActual) params.mes = mesActual;
    params.excluir_adultos = excluirAdultos;
    slepApi.establecimientos(params)
      .then(({ data }) => {
        setData(data);
        if (!mesActual && data.mes) setMesActual(data.mes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mesActual, excluirAdultos]);

  const filtered = useMemo(() => {
    let list = data?.establecimientos || [];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e => e.nombre?.toLowerCase().includes(q) || String(e.rbd).includes(q) || e.comuna?.toLowerCase().includes(q));
    }
    if (filtroSemaforo !== 'todos') {
      list = list.filter(e => e.semaforo === filtroSemaforo);
    }
    list = [...list].sort((a, b) => {
      const va = a[sortKey] ?? 0;
      const vb = b[sortKey] ?? 0;
      if (typeof va === 'string') return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortAsc ? va - vb : vb - va;
    });
    return list;
  }, [data, search, sortKey, sortAsc, filtroSemaforo]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(key === 'nombre'); }
  };

  if (loading) return <p style={{ color: 'var(--text-muted)', padding: 40, fontSize: 15 }}>Cargando establecimientos...</p>;

  const resumen = {
    total: (data?.establecimientos || []).length,
    rojos: (data?.establecimientos || []).filter(e => e.semaforo === 'rojo').length,
    naranjas: (data?.establecimientos || []).filter(e => e.semaforo === 'naranja').length,
    verdes: (data?.establecimientos || []).filter(e => e.semaforo === 'verde').length,
  };

  const mesNombre = meses.find(m => m.valor === mesActual)?.nombre || '';

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Establecimientos</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 6 }}>
        {resumen.total} establecimientos {excluirAdultos ? '(sin ed. adultos)' : '(todos)'} &middot; {mesNombre} 2025
      </p>
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
        <span>Semaforo: <span style={{ color: '#ef4444' }}>●</span> Rojo &lt;75% · <span style={{ color: '#f59e0b' }}>●</span> Naranja 75-82% · <span style={{ color: '#10b981' }}>●</span> Verde &ge;82%</span>
        <span style={{ opacity: 0.6 }}>Fuente: MINEDUC 2025 · Haz clic en un establecimiento para ver su detalle</span>
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Month selector */}
        <select
          value={mesActual || ''}
          onChange={e => setMesActual(Number(e.target.value))}
          style={{
            padding: '8px 12px', borderRadius: 8, fontSize: 14, cursor: 'pointer',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
            color: 'var(--text-main)',
          }}
        >
          {meses.map(m => (
            <option key={m.valor} value={m.valor} style={{ background: '#1e293b' }}>{m.nombre}</option>
          ))}
        </select>

        {/* Adult filter toggle */}
        <button
          onClick={() => setExcluirAdultos(!excluirAdultos)}
          style={{
            padding: '8px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.15)',
            background: excluirAdultos ? 'rgba(99,102,241,0.2)' : 'transparent',
            color: excluirAdultos ? '#818cf8' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <Filter size={14} />
          {excluirAdultos ? 'Sin Ed. Adultos' : 'Todos los EE'}
        </button>

        {/* Semáforo filters */}
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          {[
            { key: 'todos', label: `Todos (${resumen.total})`, bg: 'rgba(255,255,255,0.05)' },
            { key: 'rojo', label: `Rojo (${resumen.rojos})`, bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
            { key: 'naranja', label: `Naranja (${resumen.naranjas})`, bg: 'rgba(249,115,22,0.15)', color: '#f97316' },
            { key: 'verde', label: `Verde (${resumen.verdes})`, bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
          ].map(f => (
            <button key={f.key} onClick={() => setFiltroSemaforo(f.key)}
              style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 13, border: 'none', cursor: 'pointer',
                background: filtroSemaforo === f.key ? (f.color || 'var(--accent-primary)') : f.bg,
                color: filtroSemaforo === f.key ? '#fff' : (f.color || 'var(--text-muted)'),
                fontWeight: filtroSemaforo === f.key ? 600 : 400,
              }}
            >{f.label}</button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, RBD o comuna..."
          style={{
            width: '100%', padding: '10px 12px 10px 36px', background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'var(--text-main)', fontSize: 15,
          }}
        />
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              {[
                { key: 'rbd', label: 'RBD', w: 70 },
                { key: 'nombre', label: 'Nombre', w: null },
                { key: 'comuna', label: 'Comuna', w: 130 },
                { key: 'matricula', label: 'Matrícula', w: 95 },
                { key: 'asistencia_pct', label: 'Asistencia', w: 95 },
                { key: 'tasa_aprobacion', label: 'Aprobación', w: 95 },
                { key: 'promedio', label: 'Promedio', w: 85 },
                { key: 'sep', label: 'SEP', w: 75 },
                { key: 'semaforo', label: 'Estado', w: 85 },
              ].map(col => (
                <th key={col.key} onClick={() => toggleSort(col.key)}
                  style={{
                    padding: '12px 10px', textAlign: col.key === 'nombre' ? 'left' : 'right',
                    color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', fontSize: 13,
                    width: col.w || 'auto', userSelect: 'none',
                  }}>
                  {col.label}
                  {sortKey === col.key && <ArrowUpDown size={11} style={{ marginLeft: 4, opacity: 0.5 }} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.rbd}
                onClick={() => navigate(`/establecimientos/${e.rbd}`)}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                onMouseOver={ev => ev.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseOut={ev => ev.currentTarget.style.background = 'transparent'}
              >
                <td style={tdR}>{e.rbd}</td>
                <td style={{ padding: '11px 10px', fontWeight: 500 }}>
                  {e.nombre}
                  {e.es_adultos && <span style={{ fontSize: 11, color: '#818cf8', marginLeft: 6 }}>ADULTOS</span>}
                </td>
                <td style={tdR}>{e.comuna}</td>
                <td style={tdR}>{e.matricula?.toLocaleString('es-CL')}</td>
                <td style={{ ...tdR, fontWeight: 600, color: e.asistencia_pct < 80 ? '#ef4444' : e.asistencia_pct < 88 ? '#f97316' : '#22c55e' }}>
                  {e.asistencia_pct?.toFixed(1)}%
                </td>
                <td style={tdR}>{(e.tasa_aprobacion || 0).toFixed(1)}%</td>
                <td style={tdR}>{(e.promedio || 0).toFixed(1)}</td>
                <td style={tdR}>{(e.sep || 0).toLocaleString('es-CL')}</td>
                <td style={{ padding: '11px 10px', textAlign: 'center' }}><SemaforoTag value={e.semaforo} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 15 }}>No se encontraron establecimientos</p>
        )}
      </div>
    </div>
  );
}

const tdR = { padding: '11px 10px', textAlign: 'right', color: 'var(--text-muted)' };
