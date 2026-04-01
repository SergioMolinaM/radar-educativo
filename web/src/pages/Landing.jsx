import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import RadarLogo from '../components/shared/RadarLogo';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    navigate('/dashboard');
    return null;
  }

  const features = [
    {
      icon: '📊',
      title: 'Monitoreo en tiempo real',
      description: 'Asistencia, rendimiento y SIMCE de todos tus establecimientos en un solo lugar.',
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.12)',
    },
    {
      icon: '🎯',
      title: 'Seguimiento del PAL',
      description: 'Indicadores, compromisos y avance del Plan Anual Local con datos reales.',
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.12)',
    },
    {
      icon: '🚨',
      title: 'Alertas inteligentes',
      description: 'Detecta establecimientos en riesgo antes de que sea tarde. Umbrales configurables.',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.12)',
    },
    {
      icon: '🗺️',
      title: 'Mapa territorial',
      description: 'Visualiza tu territorio con datos georeferenciados por comuna y establecimiento.',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
    },
    {
      icon: '💼',
      title: 'Administración y finanzas',
      description: 'Ejecución presupuestaria del SLEP en un vistazo. Integración financiera en desarrollo.',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.12)',
    },
    {
      icon: '📋',
      title: 'Datos oficiales y del SLEP',
      description: 'Fuentes del Mineduc, Agencia de Calidad, ENEP y datos propios del SLEP.',
      color: '#64748b',
      bg: 'rgba(100, 116, 139, 0.12)',
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 20px',
    }}>
      {/* Hero */}
      <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 24 }}>
        <RadarLogo size={60} />
        <h1 style={{ fontSize: 30, fontWeight: 800, marginTop: 12, marginBottom: 6 }}>
          <span className="text-gradient">Radar</span> de la Educación Pública
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto', lineHeight: 1.5 }}>
          Tu espacio de trabajo diario como equipo directivo SLEP.
          Alertas, brechas y acciones concretas — no solo datos.
        </p>
      </div>

      {/* Feature Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 14,
        maxWidth: 900,
        width: '100%',
        marginBottom: 28,
      }}>
        {features.map((f, i) => (
          <div
            key={i}
            className="animate-fade-in"
            style={{
              background: `linear-gradient(135deg, rgba(255,255,255,0.08), ${f.bg})`,
              border: `1px solid ${f.color}44`,
              borderRadius: 16,
              padding: '18px 18px',
              animationDelay: `${i * 0.1}s`,
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = `0 8px 30px ${f.color}22`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: f.color, marginBottom: 6 }}>
              {f.title}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
              {f.description}
            </p>
          </div>
        ))}
      </div>

      {/* Tabla comparativa — Por qué Radar */}
      <div className="animate-fade-in" style={{
        maxWidth: 900, width: '100%', marginBottom: 28,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: '24px 28px',
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, textAlign: 'center' }}>
          ¿Por qué <span className="text-gradient">Radar</span>?
        </h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 16 }}>
          Comparado con otras plataformas de gestión educativa (IDEA, SIGE, Data Observatory)
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Capacidad</th>
              <th style={{ textAlign: 'center', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600, width: 140 }}>Otras plataformas</th>
              <th style={{ textAlign: 'center', padding: '8px 12px', color: '#f97316', fontWeight: 700, width: 140 }}>Radar</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Visualización de datos', true, true],
              ['Alertas automáticas al equipo directivo', false, true],
              ['Cruce de instrumentos (PAL + CGE + ENEP + SIMCE)', false, true],
              ['Compromisos con countdown y responsables', false, true],
              ['Proyección de cumplimiento a fin de año', false, true],
              ['Acciones sugeridas por indicador', false, true],
              ['Espacio de trabajo diario para el equipo', false, true],
            ].map(([cap, otros, radar], i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>{cap}</td>
                <td style={{ textAlign: 'center', padding: '8px 12px' }}>
                  {otros
                    ? <span style={{ color: '#10b981', fontWeight: 700 }}>Si</span>
                    : <span style={{ color: '#ef4444', fontWeight: 700 }}>No</span>
                  }
                </td>
                <td style={{ textAlign: 'center', padding: '8px 12px' }}>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>Si</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate('/login')}
        style={{
          padding: '16px 56px',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          color: 'white',
          border: 'none',
          borderRadius: 12,
          fontSize: 18,
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(59, 130, 246, 0.5)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.4)';
        }}
      >
        Ingresar al Radar
      </button>

      {/* Footer */}
      <p style={{ marginTop: 32, fontSize: 12, color: 'var(--text-muted)', opacity: 0.6 }}>
        Tercera Letra · Datos fuente: MINEDUC, Agencia de Calidad, ENEP, PAL oficiales
      </p>
    </div>
  );
}
