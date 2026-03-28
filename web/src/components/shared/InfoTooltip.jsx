import { useState } from 'react';

/**
 * Tooltip informativo que responde: ¿Qué es? ¿Fuente? ¿Periodo?
 * Aparece al hover sobre el icono ⓘ.
 */
export default function InfoTooltip({ text, fuente, periodo }) {
  const [show, setShow] = useState(false);

  const lines = [text];
  if (fuente) lines.push(`Fuente: ${fuente}`);
  if (periodo) lines.push(`Periodo: ${periodo}`);

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span style={{
        cursor: 'help', fontSize: 13, opacity: 0.5, marginLeft: 4,
        userSelect: 'none', lineHeight: 1,
      }}>&#9432;</span>

      {show && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: 8, padding: '10px 14px',
          background: 'rgba(15, 23, 42, 0.97)',
          border: '1px solid var(--border-color)',
          borderRadius: 8, fontSize: 12, color: 'var(--text-muted)',
          lineHeight: 1.6, whiteSpace: 'nowrap', zIndex: 100,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          pointerEvents: 'none',
        }}>
          {lines.map((l, i) => (
            <div key={i} style={{ color: i === 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>{l}</div>
          ))}
        </div>
      )}
    </span>
  );
}
