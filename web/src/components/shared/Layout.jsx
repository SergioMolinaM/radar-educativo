import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, School, DollarSign, LogOut, Scale, FileText, ChevronDown, Building2, Trophy } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Panel general' },
  { to: '/mi-slep', icon: Building2, label: 'Mi SLEP' },
  { to: '/alertas', icon: AlertTriangle, label: 'Alertas' },
  { to: '/establecimientos', icon: School, label: 'Establecimientos' },
  { to: '/financiero', icon: DollarSign, label: 'Financiero' },
  { to: '/ranking', icon: Trophy, label: 'Ranking' },
  { to: '/comparador', icon: Scale, label: 'Comparador' },
  { to: '/resumen', icon: FileText, label: 'Resumen ejecutivo' },
];

export default function Layout() {
  const { user, logout, switchSlep } = useAuth();
  const navigate = useNavigate();
  const [sleps, setSleps] = useState([]);
  const [slepOpen, setSlepOpen] = useState(false);

  useEffect(() => {
    api.get('/sleps/').then(({ data }) => setSleps(data.sleps || [])).catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentSlep = sleps.find((s) => s.id === user?.slep_id);
  const slepLabel = currentSlep?.name?.replace('Servicio Local de Educación Pública ', '') || user?.slep_id?.toUpperCase() || 'SLEP';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: 'rgba(15, 23, 42, 0.95)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        flexShrink: 0,
      }}>
        <div style={{ padding: '0 20px', marginBottom: 24 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
            <span className="text-gradient">Radar</span> Educativo
          </h1>

          {/* SLEP Selector */}
          <div style={{ position: 'relative', marginTop: 10 }}>
            <button
              onClick={() => setSlepOpen(!slepOpen)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
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
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: 4,
                background: 'rgba(15, 23, 42, 0.98)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                maxHeight: 250,
                overflowY: 'auto',
                zIndex: 50,
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}>
                {sleps.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      switchSlep(s.id, s.name);
                      setSlepOpen(false);
                      navigate('/');
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: s.id === user?.slep_id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--border-color)',
                      color: s.id === user?.slep_id ? 'var(--accent-primary)' : 'var(--text-muted)',
                      fontSize: 11,
                      textAlign: 'left',
                      cursor: 'pointer',
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

        <nav style={{ flex: 1 }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 20px',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                transition: 'all 0.2s',
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '0 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            {user?.name}
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: 13, padding: 0,
            }}
          >
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
