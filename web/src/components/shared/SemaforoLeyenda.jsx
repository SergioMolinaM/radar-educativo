/**
 * Leyenda de semáforos con umbrales.
 * Responde: ¿qué significan los colores?
 */
export default function SemaforoLeyenda({ compact = false }) {
  if (compact) {
    return (
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        <span style={{ color: '#ef4444' }}>●</span> Critico &lt;75%
        {' · '}<span style={{ color: '#f59e0b' }}>●</span> Atencion 75-82%
        {' · '}<span style={{ color: '#10b981' }}>●</span> Esperado &ge;82%
      </span>
    );
  }

  return (
    <div style={{
      display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)',
      padding: '8px 12px', borderRadius: 6,
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid var(--border-color)',
    }}>
      <span><span style={{ color: '#ef4444', fontSize: 14 }}>●</span> <strong>Rojo</strong> — Asistencia bajo 75%. Requiere accion inmediata.</span>
      <span><span style={{ color: '#f59e0b', fontSize: 14 }}>●</span> <strong>Naranja</strong> — Asistencia 75-82%. Monitorear de cerca.</span>
      <span><span style={{ color: '#10b981', fontSize: 14 }}>●</span> <strong>Verde</strong> — Asistencia sobre 82%. Nivel esperado.</span>
      <span style={{ opacity: 0.6 }}>Umbrales configurables por SLEP</span>
    </div>
  );
}
