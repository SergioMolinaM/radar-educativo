import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ChevronDown, ChevronUp } from 'lucide-react';
import RadarLogo from '../components/shared/RadarLogo';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showTable, setShowTable] = useState(false);

  if (user) {
    navigate('/dashboard');
    return null;
  }

  const features = [
    { icon: '📊', title: 'Monitoreo en tiempo real', description: 'Asistencia, rendimiento y SIMCE de todos tus establecimientos en un solo lugar.', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
    { icon: '🎯', title: 'Seguimiento del PAL', description: 'Indicadores, compromisos y avance del Plan Anual Local con datos reales.', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
    { icon: '🚨', title: 'Alertas inteligentes', description: 'Detecta establecimientos en riesgo antes de que sea tarde.', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
    { icon: '🗺️', title: 'Mapa territorial', description: 'Visualiza tu territorio con datos georeferenciados por comuna.', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
    { icon: '💼', title: 'Administración y finanzas', description: 'Ejecución presupuestaria del SLEP. Integración financiera en desarrollo.', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
    { icon: '📋', title: 'Datos oficiales', description: 'Fuentes del Mineduc, Agencia de Calidad, ENEP y datos propios del SLEP.', color: '#64748b', bg: 'rgba(100, 116, 139, 0.12)' },
  ];

  const comparativa = [
    ['Visualización de datos', true, true],
    ['Alertas automáticas al equipo directivo', false, true],
    ['Cruce de instrumentos (PAL + CGE + ENEP + SIMCE)', false, true],
    ['Compromisos con countdown y responsables', false, true],
    ['Proyección de cumplimiento a fin de año', false, true],
    ['Acciones sugeridas por indicador', false, true],
    ['Espacio de trabajo diario para el equipo', false, true],
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px 20px',
    }}>
      {/* Hero */}
      <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 20 }}>
        <RadarLogo size={54} />
        <h1 style={{ fontSize: 30, fontWeight: 800, marginTop: 10, marginBottom: 6 }}>
          <span className="text-gradient">Radar</span> de la Educación Pública
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto', lineHeight: 1.5 }}>
          Tu espacio de trabajo diario como equipo directivo SLEP.
          Alertas, brechas y acciones concretas — no solo datos.
        </p>
      </div>

      {/* CTA principal — visible desde el inicio */}
      <button
        onClick={() => navigate('/login')}
        className="animate-fade-in"
        style={{
          padding: '14px 52px', marginBottom: 28,
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          color: 'white', border: 'none', borderRadius: 12,
          fontSize: 17, fontWeight: 700, cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(37, 99, 235, 0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(37, 99, 235, 0.4)'; }}
      >
        Ingresar al Radar
      </button>

      {/* Feature Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12, maxWidth: 880, width: '100%', marginBottom: 20,
      }}>
        {features.map((f, i) => (
          <div key={i} className="animate-fade-in" style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.06), ${f.bg})`,
            border: `1px solid ${f.color}33`, borderRadius: 14, padding: '16px 16px',
            animationDelay: `${i * 0.08}s`,
          }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{f.icon}</div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: f.color, marginBottom: 4 }}>{f.title}</h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>{f.description}</p>
          </div>
        ))}
      </div>

      {/* Tabla comparativa — colapsable */}
      <div style={{ maxWidth: 880, width: '100%', marginBottom: 20 }}>
        <button
          onClick={() => setShowTable(!showTable)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px 20px', background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: showTable ? '14px 14px 0 0' : 14,
            color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          {'¿Por qué '}<span className="text-gradient">Radar</span>{'?'}
          {showTable ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showTable && (
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)', borderTop: 'none',
            borderRadius: '0 0 14px 14px', padding: '16px 24px',
          }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 12, marginTop: 0 }}>
              Comparado con otras plataformas de gestión educativa (IDEA, SIGE, Data Observatory)
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Capacidad</th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600, width: 130 }}>Otras plataformas</th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', color: '#f97316', fontWeight: 700, width: 130 }}>Radar</th>
                </tr>
              </thead>
              <tbody>
                {comparativa.map(([cap, otros, radar], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '7px 12px', color: 'var(--text-primary)' }}>{cap}</td>
                    <td style={{ textAlign: 'center', padding: '7px 12px' }}>
                      {otros ? <span style={{ color: '#10b981', fontWeight: 700 }}>{'Sí'}</span> : <span style={{ color: '#ef4444', fontWeight: 700 }}>No</span>}
                    </td>
                    <td style={{ textAlign: 'center', padding: '7px 12px' }}>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>{'Sí'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', opacity: 0.7, margin: '0 0 4px' }}>
          {'© '}{new Date().getFullYear()}{' Tercera Letra SpA. Todos los derechos reservados.'}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', opacity: 0.5, margin: 0 }}>
          {'Fuente: Datos oficiales que se actualizan según estén disponibles.'}
        </p>
      </div>
    </div>
  );
}
