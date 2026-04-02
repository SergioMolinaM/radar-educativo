import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/shared/Layout';
import Login from './pages/Login';
import Dashboard from './components/Dashboard';
import Landing from './pages/Landing';

// Lazy load páginas pesadas para mejor performance
const Alertas = lazy(() => import('./pages/Alertas'));
const Establecimientos = lazy(() => import('./pages/Establecimientos'));
const EstablecimientoDetalle = lazy(() => import('./pages/EstablecimientoDetalle'));
const Financiero = lazy(() => import('./pages/Financiero'));
const Comparador = lazy(() => import('./pages/Comparador'));
const ResumenEjecutivo = lazy(() => import('./pages/ResumenEjecutivo'));
const MiSlep = lazy(() => import('./pages/MiSlep'));
const EstablecimientoReal = lazy(() => import('./pages/EstablecimientoReal'));
const Ranking = lazy(() => import('./pages/Ranking'));
const PlanAnual = lazy(() => import('./pages/PlanAnual'));
const MapaTerritorial = lazy(() => import('./pages/MapaTerritorial'));
const FuentesDatos = lazy(() => import('./pages/FuentesDatos'));
const IndicadoresPedagogicos = lazy(() => import('./pages/IndicadoresPedagogicos'));
const ENEPPage = lazy(() => import('./pages/ENEPPage'));

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function LazyFallback() {
  return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>Cargando...</div>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<LazyFallback />}>
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
    </Suspense>
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
