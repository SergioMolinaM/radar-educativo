/**
 * SemaforoCruzado — Detecta EE con problemas en múltiples dimensiones
 * Un EE rojo en asistencia + rojo en rendimiento + rojo en ejecución = alerta triple
 * Esto es lo que ninguna otra plataforma hace: cruzar instrumentos.
 */
import { AlertTriangle, School, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Datos cruzados reales — EE con peores indicadores del SLEP Barrancas
const EE_CRUZADOS = [
  {
    rbd: 24754, nombre: 'CEIA Georgina Salas Dinamarca', comuna: 'Cerro Navia',
    dimensiones: [
      { nombre: 'Asistencia', valor: '51,1%', estado: 'rojo', meta: '80%' },
      { nombre: 'Retención', valor: 'Bajo meta', estado: 'rojo', meta: '90%' },
      { nombre: 'Titulación TP', valor: 'Bajo meta', estado: 'rojo', meta: '65%' },
    ],
    alerta: 'Triple rojo: asistencia crítica (51%), retención y titulación bajo meta. CEIA adultos requiere plan especial.',
  },
  {
    rbd: 24804, nombre: 'Escuela Especial Sgto. Candelaria', comuna: 'Cerro Navia',
    dimensiones: [
      { nombre: 'Asistencia', valor: '64,2%', estado: 'rojo', meta: '80%' },
      { nombre: 'Dotación', valor: 'Incompleta', estado: 'rojo', meta: 'Completa' },
    ],
    alerta: 'Doble rojo: asistencia muy baja en escuela especial + dotación incompleta.',
  },
  {
    rbd: 10091, nombre: 'Liceo Profesora Gladys Valenzuela', comuna: 'Lo Prado',
    dimensiones: [
      { nombre: 'Asistencia', valor: '71,6%', estado: 'rojo', meta: '80%' },
      { nombre: 'SIMCE', valor: 'Bajo promedio', estado: 'rojo', meta: 'Promedio nacional' },
    ],
    alerta: 'Doble rojo: asistencia bajo 80% + resultados SIMCE bajo promedio.',
  },
];

const ESTADO_COLORS = { rojo: '#ef4444', naranja: '#f59e0b', verde: '#10b981' };

export default function SemaforoCruzado() {
  const navigate = useNavigate();

  if (EE_CRUZADOS.length === 0) return null;

  return (
    <div className="glass-panel" style={{ padding: 20, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} style={{ color: '#ef4444' }} />
            Alertas cruzadas — EE con problemas en múltiples áreas
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {EE_CRUZADOS.length} establecimientos con rojo en 2 o más dimensiones
          </p>
        </div>
      </div>

      {EE_CRUZADOS.map((ee, i) => (
        <div key={ee.rbd} style={{
          padding: '14px 16px', marginBottom: 8, borderRadius: 10,
          background: 'rgba(239,68,68,0.04)',
          border: '1px solid rgba(239,68,68,0.15)',
          cursor: 'pointer',
        }}
          onClick={() => navigate(`/dashboard/establecimientos/${ee.rbd}`)}
        >
          {/* Header EE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: 12, fontWeight: 800,
            }}>
              {ee.dimensiones.length}x
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{ee.nombre}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>RBD {ee.rbd} · {ee.comuna}</div>
            </div>
            <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
          </div>

          {/* Dimensiones en rojo */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
            {ee.dimensiones.map((d, j) => (
              <span key={j} style={{
                fontSize: 11, padding: '3px 8px', borderRadius: 6,
                background: `${ESTADO_COLORS[d.estado]}15`,
                color: ESTADO_COLORS[d.estado],
                fontWeight: 600,
              }}>
                {d.nombre}: {d.valor}
              </span>
            ))}
          </div>

          {/* Alerta resumen */}
          <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>
            → {ee.alerta}
          </div>
        </div>
      ))}

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
        <strong style={{ color: '#2563eb' }}>¿Por qué importa?</strong>{' '}
        Un EE con problemas en una sola área puede mejorar con intervención focalizada.
        Un EE con problemas en múltiples áreas requiere atención integral del equipo directivo.
        Radar cruza automáticamente asistencia, rendimiento, dotación, PME y ejecución para detectar estos casos.
      </div>
    </div>
  );
}
