import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUpDown } from 'lucide-react';
import { establishmentsApi } from '../services/api';
import SemaforoTag from '../components/shared/SemaforoTag';

export default function Establecimientos() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('nombre');
  const [sortAsc, setSortAsc] = useState(true);
  const [filtroSemaforo, setFiltroSemaforo] = useState('todos');
  const navigate = useNavigate();

  useEffect(() => {
    establishmentsApi.list()
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) return <p style={{ color: 'var(--text-muted)', padding: 40 }}>Cargando establecimientos...</p>;

  const resumen = {
    total: filtered.length,
    rojos: filtered.filter(e => e.semaforo === 'rojo').length,
    naranjas: filtered.filter(e => e.semaforo === 'naranja').length,
    verdes: filtered.filter(e => e.semaforo === 'verde').length,
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Establecimientos</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
        {data?.total || 0} establecimientos en el SLEP &middot; Datos 2025
      </p>

      {/* Resumen semáforos */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        {[
          { key: 'todos', label: `Todos (${data?.total || 0})`, bg: 'rgba(255,255,255,0.05)' },
          { key: 'rojo', label: `Rojo (${resumen.rojos})`, bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
          { key: 'naranja', label: `Naranja (${resumen.naranjas})`, bg: 'rgba(249,115,22,0.15)', color: '#f97316' },
          { key: 'verde', label: `Verde (${resumen.verdes})`, bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltroSemaforo(f.key)}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, border: 'none', cursor: 'pointer',
              background: filtroSemaforo === f.key ? (f.color || 'var(--accent-primary)') : f.bg,
              color: filtroSemaforo === f.key ? '#fff' : (f.color || 'var(--text-muted)'),
              fontWeight: filtroSemaforo === f.key ? 600 : 400,
            }}
          >{f.label}</button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, RBD o comuna..."
          style={{
            width: '100%', padding: '8px 12px 8px 36px', background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'var(--text-main)', fontSize: 14,
          }}
        />
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              {[
                { key: 'rbd', label: 'RBD', w: 70 },
                { key: 'nombre', label: 'Nombre', w: null },
                { key: 'comuna', label: 'Comuna', w: 120 },
                { key: 'matricula', label: 'Matrícula', w: 90 },
                { key: 'asistencia', label: 'Asistencia', w: 90 },
                { key: 'tasa_aprobacion', label: 'Aprobación', w: 90 },
                { key: 'promedio_general', label: 'Promedio', w: 80 },
                { key: 'alumnos_sep', label: 'SEP', w: 70 },
                { key: 'semaforo', label: 'Estado', w: 80 },
              ].map(col => (
                <th key={col.key} onClick={() => toggleSort(col.key)}
                  style={{
                    padding: '12px 10px', textAlign: col.key === 'nombre' ? 'left' : 'right',
                    color: 'var(--text-muted)', fontWeight: 500, cursor: 'pointer',
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
                <td style={{ padding: '10px', textAlign: 'right', color: 'var(--text-muted)' }}>{e.rbd}</td>
                <td style={{ padding: '10px', fontWeight: 500 }}>{e.nombre}</td>
                <td style={{ padding: '10px', textAlign: 'right', color: 'var(--text-muted)' }}>{e.comuna}</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>{e.matricula?.toLocaleString('es-CL')}</td>
                <td style={{ padding: '10px', textAlign: 'right', color: e.asistencia < 80 ? '#ef4444' : e.asistencia < 88 ? '#f97316' : '#22c55e' }}>
                  {e.asistencia?.toFixed(1)}%
                </td>
                <td style={{ padding: '10px', textAlign: 'right' }}>{e.tasa_aprobacion?.toFixed(1)}%</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>{e.promedio_general?.toFixed(1)}</td>
                <td style={{ padding: '10px', textAlign: 'right', color: 'var(--text-muted)' }}>{e.alumnos_sep?.toLocaleString('es-CL')}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}><SemaforoTag value={e.semaforo} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No se encontraron establecimientos</p>
        )}
      </div>
    </div>
  );
}
