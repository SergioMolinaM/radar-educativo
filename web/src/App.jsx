import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/shared/Layout';
import Login from './pages/Login';
import Dashboard from './components/Dashboard';
import Alertas from './pages/Alertas';
import Establecimientos from './pages/Establecimientos';
import EstablecimientoDetalle from './pages/EstablecimientoDetalle';
import Financiero from './pages/Financiero';
import Comparador from './pages/Comparador';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="alertas" element={<Alertas />} />
        <Route path="establecimientos" element={<Establecimientos />} />
        <Route path="establecimientos/:rbd" element={<EstablecimientoDetalle />} />
        <Route path="financiero" element={<Financiero />} />
        <Route path="comparador" element={<Comparador />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
