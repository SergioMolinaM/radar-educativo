import { useState, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, AlertTriangle, School, DollarSign, LogOut,
  Scale, FileText, ChevronDown, Building2, Trophy, ClipboardCheck,
  Map, Database, Calendar, Clock, Users, TrendingUp, ChevronRight, Target,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import RadarLogo from './RadarLogo';

// Navegación organizada por lógica de uso del director SLEP
const NAV_MODULES = [
  {
    id: 'gestion',
    label: 'Gestión',
    icon: LayoutDashboard,
    color: '#3b82f6',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Panel general' },
      { to: '/dashboard/establecimientos', icon: School, label: 'Establecimientos' },
      { to: '/dashboard/indicadores', icon: TrendingUp, label: 'Rendimiento y SIMCE' },
      { to: '/dashboard/alertas', icon: AlertTriangle, label: 'Alertas' },
    ],
  },
  {
    id: 'territorio',
    label: 'Territorio',
    icon: Map,
    color: '#10b981',
    items: [
      { to: '/dashboard/mapa', icon: Map, label: 'Mapa territorial' },
      { to: '/dashboard/ranking', icon: Trophy, label: 'Panorama comparativo' },
    ],
  },
  {
    id: 'pal',
    label: 'Monitoreo',
    icon: ClipboardCheck,
    color: '#8b5cf6',
    items: [
      { to: '/dashboard/enep', icon: Target, label: 'ENEP — Objetivos' },
      { to: '/dashboard/plan-anual', icon: ClipboardCheck, label: 'Avance PAL' },
      { to: '/dashboard/mi-slep', icon: Building2, label: 'Compromisos CGE' },
    ],
  },
  {
    id: 'finanzas',
    label: 'Administración y Finanzas',
    icon: DollarSign,
    color: '#f59e0b',
    items: [
      { to: '/dashboard/financiero', icon: DollarSign, label: 'Ejecución presupuestaria' },
    ],
  },
  {
    id: 'herramientas',
    label: '',
    icon: null,
    color: '#64748b',
    separator: true,
    items: [
      { to: '/dashboard/comparador', icon: Scale, label: 'Indicadores comparados' },
      { to: '/dashboard/resumen', icon: FileText, label: 'Resumen ejecutivo' },
      { to: '/dashboard/fuentes', icon: Database, label: 'Fuentes de datos' },
    ],
  },
];

// Banda contextual: "vista de 90 segundos" para el director
function ContextBanner({ slepLabel }) {
  const now = new Date();
  const weekNum = Math.ceil(((now - new Date(now.getFullYear(), 0, 1)) / 86400000 + 1) / 7);
  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const dayNames = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

  // Calcular días hábiles transcurridos en el mes (aprox)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  let diasHabiles = 0;
  for (let d = new Date(startOfMonth); d <= now; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 0 && d.getDay() !== 6) diasHabiles++;
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 24,
      padding: '10px 32px',
      background: 'rgba(15, 23, 42, 0.6)',
      borderBottom: '1px solid var(--border-color)',
      fontSize: 12,
      color: 'var(--text-muted)',
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Calendar size={14} style={{ color: '#3b82f6' }} />
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {dayNames[now.getDay()]} {now.getDate()} {monthNames[now.getMonth()]} {now.getFullYear()}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Clock size={14} style={{ color: '#10b981' }} />
        <span>Semana escolar {weekNum > 9 ? weekNum - 9 : weekNum} · {diasHabiles} días hábiles en {monthNames[now.getMonth()].toLowerCase()}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Users size={14} style={{ color: '#f59e0b' }} />
        <span>{slepLabel}</span>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        {window.__RADAR_DEMO_MODE__ ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 6, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <span style={{ color: '#f59e0b', fontSize: 11, fontWeight: 600 }}>Datos de ejemplo</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={14} style={{ color: '#10b981' }} />
            <span style={{ color: '#10b981', fontWeight: 600 }}>Datos reales</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Layout() {
  const { user, logout, switchSlep } = useAuth();
  const navigate = useNavigate();
  const [sleps, setSleps] = useState([]);
  const [slepOpen, setSlepOpen] = useState(false);
  const [collapsedModules, setCollapsedModules] = useState({});
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    api.get('/sleps/').then(({ data }) => setSleps(data.sleps || [])).catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleModule = (id) => {
    setCollapsedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const currentSlep = sleps.find((s) => s.id === user?.slep_id);
  const slepLabel = currentSlep?.name?.replace('Servicio Local de Educación Pública ', '') || user?.slep_id?.toUpperCase() || 'SLEP';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar - hidden in demo mode */}
      <aside style={{
        display: demoMode ? 'none' : 'flex',
        width: 250,
        background: 'rgba(15, 23, 42, 0.95)',
        borderRight: '1px solid var(--border-color)',
        flexDirection: 'column',
        padding: '20px 0',
        flexShrink: 0,
      }}>
        {/* Logo + SLEP selector */}
        <div style={{ padding: '0 16px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <RadarLogo size={34} />
            <div>
              <h1 style={{ fontSize: 14, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                <span className="text-gradient">Radar</span> de la<br/>Educación Pública
              </h1>
            </div>
          </div>

          {/* SLEP Logo — fondo claro para visibilidad */}
          {user?.slep_id && (
            <div style={{ textAlign: 'center', marginBottom: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.9)', borderRadius: 8 }}>
              <img
                src={`/logos/${user.slep_id}.png`}
                alt={slepLabel}
                style={{ maxWidth: '100%', maxHeight: 44, objectFit: 'contain' }}
                onError={(e) => { e.target.parentElement.style.display = 'none'; }}
              />
            </div>
          )}

          {/* SLEP Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setSlepOpen(!slepOpen)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                borderRadius: 8,
                color: 'var(--accent-primary)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {slepLabel}
              <ChevronDown size={14} style={{ transform: slepOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {slepOpen && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
                background: 'rgba(15, 23, 42, 0.98)',
                border: '1px solid var(--border-color)',
                borderRadius: 8, maxHeight: 250, overflowY: 'auto', zIndex: 50,
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}>
                {sleps.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { switchSlep(s.id, s.name); setSlepOpen(false); navigate('/dashboard'); }}
                    style={{
                      width: '100%', padding: '8px 12px',
                      background: s.id === user?.slep_id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      border: 'none', borderBottom: '1px solid var(--border-color)',
                      color: s.id === user?.slep_id ? 'var(--accent-primary)' : 'var(--text-muted)',
                      fontSize: 11, textAlign: 'left', cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{s.name.replace('Servicio Local de Educación Pública ', '')}</div>
                    <div style={{ fontSize: 10, opacity: 0.7 }}>{s.region}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Navegación por módulos */}
        <nav style={{ flex: 1, overflowY: 'auto' }}>
          {NAV_MODULES.map((mod) => (
            <div key={mod.id} style={{ marginBottom: 4 }}>
              {/* Separator line for utility section */}
              {mod.separator && (
                <div style={{ margin: '12px 16px 8px', borderTop: '1px solid var(--border-color)' }} />
              )}

              {/* Module header */}
              {mod.label && (
                <button
                  onClick={() => toggleModule(mod.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 16px', background: 'none', border: 'none',
                    color: mod.color, fontSize: 10, fontWeight: 700,
                    letterSpacing: 1.2, textTransform: 'uppercase', cursor: 'pointer',
                  }}
                >
                  <ChevronRight size={12} style={{
                    transform: collapsedModules[mod.id] ? 'none' : 'rotate(90deg)',
                    transition: 'transform 0.2s',
                  }} />
                  {mod.label}
                </button>
              )}

              {/* Module items */}
              {!collapsedModules[mod.id] && mod.items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/dashboard'}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 16px 10px 32px',
                    color: isActive ? mod.color : 'var(--text-muted)',
                    textDecoration: 'none', fontSize: 14,
                    fontWeight: isActive ? 600 : 400,
                    background: isActive ? `${mod.color}15` : 'transparent',
                    borderLeft: isActive ? `3px solid ${mod.color}` : '3px solid transparent',
                    transition: 'all 0.15s',
                  })}
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User info + logout */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600, marginBottom: 2 }}>
            {user?.name}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
            Director(a) · {slepLabel}
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: 12, padding: 0,
            }}
          >
            <LogOut size={13} />
            Cerrar sesión
          </button>
          <div style={{ marginTop: 12, fontSize: 9, color: 'var(--text-muted)', opacity: 0.5, letterSpacing: '0.05em' }}>
            © 2026 Tercera Letra SpA
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <ContextBanner slepLabel={slepLabel} />
        <main style={{ flex: 1, padding: '24px 32px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
