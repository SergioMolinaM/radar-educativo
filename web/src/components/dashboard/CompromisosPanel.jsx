import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { compromisosApi } from '../../services/api';

const INSTRUMENTO_COLORS = {
  CGE: '#3b82f6',
  PAL: '#8b5cf6',
  PMG: '#10b981',
  CDC: '#f59e0b',
  ADP: '#ef4444',
};

function TaskItem({ item, type, onComplete }) {
  const isAtrasado = type === 'atrasado';
  const borderColor = isAtrasado ? 'var(--alert-red)' : 'var(--alert-orange)';
  const days = isAtrasado ? item.dias_atraso : item.dias_restantes;

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '14px 20px',
      borderBottom: '1px solid var(--border-color)',
      transition: 'background 0.15s',
      cursor: 'default',
    }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      {/* Color bar */}
      <div style={{
        width: 3, minHeight: 48, borderRadius: 2,
        background: borderColor, flexShrink: 0, marginTop: 2,
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Top row: hito + badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {item.hito}
          </div>
          <span style={{
            flexShrink: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
            padding: '2px 8px', borderRadius: 10,
            background: isAtrasado ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
            color: isAtrasado ? 'var(--alert-red)' : 'var(--alert-orange)',
          }}>
            {isAtrasado ? 'ATRASADO' : `VENCE EN ${days} DIA${days !== 1 ? 'S' : ''}`}
          </span>
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-muted)' }}>
          <span style={{
            padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700,
            background: `${INSTRUMENTO_COLORS[item.instrumento] || '#666'}20`,
            color: INSTRUMENTO_COLORS[item.instrumento] || '#666',
          }}>
            {item.instrumento}
          </span>
          <span>{item.responsable}</span>
          <span style={{ marginLeft: 'auto', fontWeight: 600, color: isAtrasado ? 'var(--alert-red)' : 'var(--text-muted)' }}>
            {isAtrasado ? `hace ${days} dia${days !== 1 ? 's' : ''}` : item.fecha_vencimiento}
          </span>
          {onComplete && (
            <button
              onClick={() => onComplete(item.id)}
              title="Marcar como completado"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: 2,
              }}
            >
              <CheckCircle2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CompromisosPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    compromisosApi.list()
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleComplete = (id) => {
    compromisosApi.update(id, 'completado').then(() => fetchData());
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
        Cargando compromisos...
      </div>
    );
  }

  if (!data) return null;

  const { atrasados, proximos, resumen } = data;

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 4 }}>
            Compromisos institucionales
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
            Hitos activos por instrumento — CGE · PAL · PMG · CDC · ADP
          </p>
          <div style={{
            marginTop: 8, padding: '8px 12px', borderRadius: 6,
            background: 'rgba(59, 130, 246, 0.06)',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7,
          }}>
            <strong style={{ color: 'var(--accent-primary)' }}>¿De donde vienen estas tareas?</strong> Se generan automaticamente desde tres fuentes:
            el <strong>calendario normativo</strong> (plazos legales CGE, ADP, PMG),
            el <strong>Plan Anual Local</strong> al cargarse, y
            las <strong>alertas del sistema</strong> cuando un indicador requiere accion.
            El equipo directivo marca avance o completado.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {resumen.total_atrasados > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              background: 'rgba(239,68,68,0.12)', color: 'var(--alert-red)',
              border: '1px solid rgba(239,68,68,0.2)',
            }}>
              <AlertTriangle size={12} /> {resumen.total_atrasados} atrasadas
            </span>
          )}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            background: 'rgba(245,158,11,0.12)', color: 'var(--alert-orange)',
            border: '1px solid rgba(245,158,11,0.2)',
          }}>
            <Clock size={12} /> {resumen.total_proximos} proximas
          </span>
        </div>
      </div>

      {/* Two-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Atrasadas */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', borderBottom: '1px solid var(--border-color)',
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Tareas vencidas
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 10,
              background: 'rgba(239,68,68,0.12)', color: 'var(--alert-red)',
            }}>
              Accion requerida
            </span>
          </div>
          <div>
            {atrasados.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                Sin tareas vencidas
              </div>
            ) : (
              atrasados.map((item) => (
                <TaskItem key={item.id} item={item} type="atrasado" onComplete={handleComplete} />
              ))
            )}
          </div>
        </div>

        {/* Proximas */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', borderBottom: '1px solid var(--border-color)',
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Proximas a vencer
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 10,
              background: 'rgba(245,158,11,0.12)', color: 'var(--alert-orange)',
            }}>
              Esta quincena
            </span>
          </div>
          <div>
            {proximos.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                Sin compromisos proximos
              </div>
            ) : (
              proximos.map((item) => (
                <TaskItem key={item.id} item={item} type="proximo" onComplete={handleComplete} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
