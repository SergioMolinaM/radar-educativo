import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { alertsApi } from '../services/api';

const FILTERS = [
  { value: '', label: 'Todas' },
  { value: 'critical', label: 'Críticas' },
  { value: 'warning', label: 'Advertencias' },
  { value: 'info', label: 'Info' },
];

const SEVERITY_STYLES = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', label: 'Crítica' },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', label: 'Advertencia' },
  info: { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', label: 'Info' },
};

export default function Alertas() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    alertsApi.list(filter || undefined)
      .then(({ data }) => {
        let list = data.alerts || data || [];
        if (!Array.isArray(list)) list = [];
        setAlerts(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Alertas</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 6 }}>Sistema de alerta temprana — datos base 2025, gestión 2026</p>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 600 }}>
            Las alertas se generan automáticamente al detectar indicadores fuera de rango:
            asistencia bajo el umbral del SLEP, tasa de retiro mayor a 5%, aprobación bajo 85%, o microescuelas con menos de 30 alumnos.
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
          {alerts.map((a) => {
            const sev = SEVERITY_STYLES[a.severity] || SEVERITY_STYLES.info;
            return (
              <div key={a.id} className="glass-panel" style={{ padding: 20, opacity: a.leida ? 0.7 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <AlertTriangle size={18} style={{ color: sev.color }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {a.tipo?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        {!a.leida && <span style={{ marginLeft: 8, fontSize: 10, color: sev.color, fontWeight: 700 }}>NUEVA</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>RBD {a.rbd} &middot; {a.fecha}</div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, padding: '3px 10px', borderRadius: 12,
                    background: sev.bg, color: sev.color, fontWeight: 600,
                  }}>
                    {sev.label}
                  </span>
                </div>
                <p style={{ fontSize: 14, margin: '0 0 8px', lineHeight: 1.5 }}>{a.mensaje}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
