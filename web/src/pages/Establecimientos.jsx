import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { establishmentsApi } from '../services/api';
import SemaforoTag from '../components/shared/SemaforoTag';

export default function Establecimientos() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    establishmentsApi.list()
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: 'var(--text-muted)', padding: 40 }}>Cargando establecimientos...</p>;

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Establecimientos</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
        {data?.total || 0} establecimientos en el SLEP
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {(data?.establecimientos || []).map((e) => (
          <div
            key={e.rbd}
            className="glass-panel"
            onClick={() => navigate(`/establecimientos/${e.rbd}`)}
            style={{ padding: 20, cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{e.nombre}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>RBD {e.rbd} &middot; {e.tipo} &middot; {e.comuna}</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Matrícula: <strong style={{ color: 'var(--text-main)' }}>{e.matricula}</strong>
              </span>
              <span style={{
                fontSize: 11,
                padding: '3px 10px',
                borderRadius: 12,
                background: e.estado === 'activo' ? 'var(--alert-green-bg)' : 'var(--alert-red-bg)',
                color: e.estado === 'activo' ? 'var(--alert-green)' : 'var(--alert-red)',
              }}>
                {e.estado}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
