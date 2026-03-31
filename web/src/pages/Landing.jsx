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
      description: 'Ejecución presupuestaria y compras públicas del SLEP en un vistazo.',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.12)',
    },
    {
      icon: '📋',
      title: 'Datos oficiales verificados',
      description: 'Fuentes del Mineduc, Agencia de Calidad y Mercado Público. Sin datos inventados.',
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
          Plataforma de gestión integral para Servicios Locales de Educación Pública.
          Datos oficiales, actualizados y accionables.
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
        Tercera Letra · Datos fuente: MINEDUC, Agencia de Calidad, Mercado Público
      </p>
    </div>
  );
}
