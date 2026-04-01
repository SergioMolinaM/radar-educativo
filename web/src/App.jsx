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
import ResumenEjecutivo from './pages/ResumenEjecutivo';
import MiSlep from './pages/MiSlep';
import EstablecimientoReal from './pages/EstablecimientoReal';
import Ranking from './pages/Ranking';
import PlanAnual from './pages/PlanAnual';
import MapaTerritorial from './pages/MapaTerritorial';
import FuentesDatos from './pages/FuentesDatos';
import IndicadoresPedagogicos from './pages/IndicadoresPedagogicos';
import Landing from './pages/Landing';
import ENEPPage from './pages/ENEPPage';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="alertas" element={<Alertas />} />
        <Route path="establecimientos" element={<Establecimientos />} />
        <Route path="establecimientos/:rbd" element={<EstablecimientoDetalle />} />
        <Route path="financiero" element={<Financiero />} />
        <Route path="comparador" element={<Comparador />} />
        <Route path="resumen" element={<ResumenEjecutivo />} />
        <Route path="mi-slep" element={<MiSlep />} />
        <Route path="mi-slep/:rbd" element={<EstablecimientoReal />} />
        <Route path="ranking" element={<Ranking />} />
        <Route path="plan-anual" element={<PlanAnual />} />
        <Route path="mapa" element={<MapaTerritorial />} />
        <Route path="indicadores" element={<IndicadoresPedagogicos />} />
        <Route path="fuentes" element={<FuentesDatos />} />
        <Route path="enep" element={<ENEPPage />} />
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
