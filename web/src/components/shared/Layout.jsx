import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, School, DollarSign, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Panel general' },
  { to: '/alertas', icon: AlertTriangle, label: 'Alertas' },
  { to: '/establecimientos', icon: School, label: 'Establecimientos' },
  { to: '/financiero', icon: DollarSign, label: 'Financiero' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
        <div style={{ padding: '0 20px', marginBottom: 32 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
            <span className="text-gradient">Radar</span> Educativo
          </h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {user?.slep_id?.toUpperCase() || 'SLEP'}
          </p>
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
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 13,
              padding: 0,
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
