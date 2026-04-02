/**
 * TimelineNormativa — Línea de tiempo con hitos legales del SLEP
 * Countdown automático. Muestra qué viene, qué venció, cuántos días faltan.
 */
import { Calendar, AlertTriangle, CheckCircle2, Clock, ChevronRight } from 'lucide-react';

// Calendario normativo real 2026 para SLEPs
const HITOS_2026 = [
  { id: 1, fecha: '2026-03-15', hito: 'Inicio año escolar — verificar dotación completa', instrumento: 'CGE', area: 'RRHH' },
  { id: 2, fecha: '2026-03-31', hito: 'Entrega Plan de Asistencia al territorio', instrumento: 'PAL', area: 'Pedagógica' },
  { id: 3, fecha: '2026-04-15', hito: 'Diagnóstico DIA Lectura — 4° básico (todos los EE)', instrumento: 'PAL', area: 'UTP' },
  { id: 4, fecha: '2026-04-30', hito: 'Evaluación PME primer trimestre — reporte de avance', instrumento: 'PME', area: 'Planificación' },
  { id: 5, fecha: '2026-05-15', hito: 'Reporte trimestral ejecución presupuestaria Q1', instrumento: 'CGE', area: 'Finanzas' },
  { id: 6, fecha: '2026-05-30', hito: 'Diagnóstico capacitación liderazgo directivo (52 EE)', instrumento: 'PAL', area: 'RRHH' },
  { id: 7, fecha: '2026-06-30', hito: 'Informe semestral CGE al Consejo Local', instrumento: 'CGE', area: 'Director Ejecutivo' },
  { id: 8, fecha: '2026-06-30', hito: 'Reporte intermedio PAL — avance indicadores', instrumento: 'PAL', area: 'Planificación' },
  { id: 9, fecha: '2026-07-15', hito: 'Diagnóstico DIA Lectura y Matemática — todos los niveles', instrumento: 'PAL', area: 'UTP' },
  { id: 10, fecha: '2026-08-15', hito: 'Reporte trimestral ejecución presupuestaria Q2', instrumento: 'CGE', area: 'Finanzas' },
  { id: 11, fecha: '2026-09-30', hito: 'Evaluación PME segundo semestre', instrumento: 'PME', area: 'Planificación' },
  { id: 12, fecha: '2026-10-31', hito: 'Plan fortalecimiento directivo — cumplimiento esperado', instrumento: 'CGE', area: 'RRHH' },
  { id: 13, fecha: '2026-11-15', hito: 'Reporte trimestral ejecución presupuestaria Q3', instrumento: 'CGE', area: 'Finanzas' },
  { id: 14, fecha: '2026-11-30', hito: 'Reporte anual PAL — cierre indicadores', instrumento: 'PAL', area: 'Director Ejecutivo' },
  { id: 15, fecha: '2026-12-15', hito: 'Evaluación desempeño Director Ejecutivo por DEP', instrumento: 'CGE', area: 'DEP' },
  { id: 16, fecha: '2026-12-31', hito: 'Cierre año escolar — balance CGE completo', instrumento: 'CGE', area: 'Director Ejecutivo' },
];

const INSTR_COLORS = { CGE: '#3b82f6', PAL: '#8b5cf6', PME: '#10b981', ADP: '#ef4444' };

function diasEntre(fecha) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const target = new Date(fecha + 'T00:00:00');
  return Math.ceil((target - hoy) / (1000 * 60 * 60 * 24));
}

export default function TimelineNormativa() {
  const hoy = new Date();
  const mesActual = hoy.getMonth(); // 0-indexed

  // Separar vencidos, próximos (30 días), futuros
  const vencidos = HITOS_2026.filter(h => diasEntre(h.fecha) < 0);
  const proximos = HITOS_2026.filter(h => { const d = diasEntre(h.fecha); return d >= 0 && d <= 30; });
  const futuros = HITOS_2026.filter(h => diasEntre(h.fecha) > 30);

  return (
    <div className="glass-panel" style={{ padding: 20, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={18} style={{ color: '#8b5cf6' }} />
            Calendario normativo 2026
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {vencidos.length} cumplidos · {proximos.length} en los próximos 30 días · {futuros.length} pendientes
          </p>
        </div>
      </div>

      {/* Barra visual de progreso del año */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>
          <span>Ene</span><span>Abr</span><span>Jul</span><span>Oct</span><span>Dic</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', position: 'relative' }}>
          <div style={{
            height: '100%', borderRadius: 3, width: `${((mesActual + 1) / 12) * 100}%`,
            background: 'linear-gradient(90deg, #2563eb, #8b5cf6)',
            transition: 'width 0.5s ease',
          }} />
          {/* Marcadores de hitos próximos */}
          {proximos.map(h => {
            const fecha = new Date(h.fecha + 'T00:00:00');
            const pct = ((fecha.getMonth() + fecha.getDate() / 30) / 12) * 100;
            return (
              <div key={h.id} style={{
                position: 'absolute', top: -2, left: `${pct}%`,
                width: 10, height: 10, borderRadius: '50%',
                background: INSTR_COLORS[h.instrumento] || '#f59e0b',
                border: '2px solid var(--bg-dark)',
              }} />
            );
          })}
        </div>
      </div>

      {/* Próximos hitos — lo importante */}
      {proximos.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            Próximos 30 días
          </div>
          {proximos.map(h => {
            const dias = diasEntre(h.fecha);
            const urgente = dias <= 7;
            return (
              <div key={h.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', marginBottom: 4, borderRadius: 8,
                background: urgente ? 'rgba(249,115,22,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${urgente ? 'rgba(249,115,22,0.2)' : 'var(--border-color)'}`,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: urgente ? 'rgba(249,115,22,0.15)' : 'rgba(139,92,246,0.1)',
                  color: urgente ? '#f97316' : '#8b5cf6',
                  fontSize: 14, fontWeight: 800, lineHeight: 1,
                }}>
                  {dias}
                  <span style={{ fontSize: 8, fontWeight: 600 }}>días</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{h.hito}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                    <span style={{
                      padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                      background: `${INSTR_COLORS[h.instrumento] || '#666'}20`,
                      color: INSTR_COLORS[h.instrumento] || '#666',
                    }}>{h.instrumento}</span>
                    <span>{h.area}</span>
                    <span style={{ marginLeft: 'auto' }}>{h.fecha}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Futuros — colapsado, solo conteo */}
      {futuros.length > 0 && (
        <div style={{
          padding: '8px 12px', borderRadius: 8,
          background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)',
          fontSize: 12, color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Clock size={14} style={{ color: '#8b5cf6' }} />
          {futuros.length} hitos pendientes hasta diciembre
          <span style={{ marginLeft: 'auto', fontSize: 11 }}>
            Próximo: {futuros[0]?.hito?.slice(0, 40)}... ({diasEntre(futuros[0]?.fecha)} días)
          </span>
        </div>
      )}

      {/* Globo explicativo */}
      <div style={{
        marginTop: 12, padding: '10px 14px', borderRadius: 12,
        background: '#ffffff', color: '#334155',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        fontSize: 11, lineHeight: 1.6, position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: -7, left: 20,
          width: 0, height: 0,
          borderLeft: '7px solid transparent', borderRight: '7px solid transparent',
          borderBottom: '7px solid #ffffff',
        }} />
        <strong style={{ color: '#2563eb' }}>¿Qué es esto?</strong>{' '}
        Los plazos normativos del SLEP para 2026: entregas CGE, reportes PAL, evaluaciones PME y otros compromisos legales.
        Radar calcula automáticamente los días restantes y alerta cuando un plazo se acerca.
      </div>
    </div>
  );
}
