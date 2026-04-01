import { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

/**
 * Tooltip tipo globo cómic — fondo blanco, puntero triangular.
 * Uso: <InfoTooltip text="..." fuente="..." periodo="..." />
 * Aparece al hover/click sobre el ícono ⓘ azul.
 */
export default function InfoTooltip({ text, fuente, periodo, children }) {
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  // Close on outside click (mobile)
  useEffect(() => {
    if (!show) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setShow(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [show]);

  const lines = [];
  if (text) lines.push({ label: null, value: text, bold: true });
  if (fuente) lines.push({ label: 'Fuente', value: fuente });
  if (periodo) lines.push({ label: 'Periodo', value: periodo });

  return (
    <span
      ref={ref}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <button
        onClick={(e) => { e.stopPropagation(); setShow(!show); }}
        style={{
          cursor: 'help', marginLeft: 5, padding: 0, border: 'none',
          background: 'none', display: 'inline-flex', alignItems: 'center',
          color: '#3b82f6', opacity: 0.7,
        }}
        aria-label="Más información"
      >
        <Info size={14} />
      </button>

      {show && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 12px)', left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 16px',
          background: '#ffffff', color: '#1e293b',
          borderRadius: 12,
          fontSize: 12, lineHeight: 1.7,
          minWidth: 220, maxWidth: 300,
          zIndex: 200,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
          pointerEvents: 'none',
        }}>
          {/* Puntero triangular */}
          <div style={{
            position: 'absolute', bottom: -7, left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #ffffff',
          }} />

          {lines.map((l, i) => (
            <div key={i} style={{
              color: l.bold ? '#0f172a' : '#64748b',
              fontWeight: l.bold ? 600 : 400,
              marginBottom: i < lines.length - 1 ? 4 : 0,
            }}>
              {l.label && <span style={{ fontWeight: 600, color: '#3b82f6' }}>{l.label}: </span>}
              {l.value}
            </div>
          ))}
          {children}
        </div>
      )}
    </span>
  );
}
