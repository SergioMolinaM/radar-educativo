import { useState, useEffect } from 'react';
import { AlertTriangle, Filter } from 'lucide-react';
import { alertsApi } from '../services/api';
import SemaforoTag from '../components/shared/SemaforoTag';

const FILTERS = [
  { value: '', label: 'Todas' },
  { value: 'rojo', label: 'Rojas' },
  { value: 'naranja', label: 'Naranjas' },
];

export default function Alertas() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    alertsApi.list(filter || undefined)
      .then(({ data }) => setAlerts(data.alerts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Alertas</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 6 }}>Sistema de alerta temprana basado en datos 2025</p>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 600 }}>
            Las alertas se generan automaticamente al detectar indicadores fuera de rango:
            asistencia bajo el umbral del SLEP, tasa de retiro mayor a 5%, aprobacion bajo 85%, o microescuelas con menos de 30 alumnos.
            Los umbrales son configurables por cada SLEP.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                background: filter === f.value ? 'var(--accent-primary)' : 'transparent',
                color: filter === f.value ? 'white' : 'var(--text-muted)',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando alertas...</p>
      ) : alerts.length === 0 ? (
        <div className="glass-panel" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No hay alertas activas</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {alerts.map((a) => (
            <div key={a.id} className="glass-panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AlertTriangle size={18} style={{ color: a.severidad === 'rojo' ? 'var(--alert-red)' : 'var(--alert-orange)' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{a.establecimiento}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>RBD {a.rbd} &middot; {a.fecha_deteccion}</div>
                  </div>
                </div>
                <SemaforoTag value={a.severidad} size="sm" />
              </div>
              <p style={{ fontSize: 14, margin: '0 0 8px', lineHeight: 1.5 }}>{a.mensaje}</p>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
                Valor actual: <strong>{a.valor}</strong> · Umbral: {a.umbral} · Tipo: {a.tipo?.replace(/_/g, ' ')}
              </div>
              <div style={{
                padding: '10px 14px',
                background: 'rgba(59, 130, 246, 0.08)',
                borderRadius: 8,
                fontSize: 13,
                color: 'var(--accent-primary)',
              }}>
                <strong>¿Que hacer?</strong> {a.accion_sugerida}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
