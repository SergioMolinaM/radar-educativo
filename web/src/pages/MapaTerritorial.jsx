import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { MapPin, School, Users, TrendingUp, AlertTriangle } from 'lucide-react';

// Coordenadas aproximadas de comunas por SLEP (sin Leaflet por ahora - se agrega después)
const SLEP_COORDS = {
  barrancas: { lat: -33.44, lng: -70.74, comunas: ['Pudahuel', 'Lo Prado', 'Cerro Navia'] },
  chinchorro: { lat: -18.47, lng: -70.30, comunas: ['Arica', 'Camarones', 'Putre', 'General Lagos'] },
  gabriela_mistral: { lat: -30.41, lng: -70.99, comunas: ['La Serena', 'Coquimbo', 'Ovalle', 'Andacollo'] },
  andalien_sur: { lat: -36.82, lng: -73.04, comunas: ['Concepción', 'Chiguayante', 'Hualqui', 'Florida'] },
  costa_araucania: { lat: -38.74, lng: -73.23, comunas: ['Carahue', 'Saavedra', 'Teodoro Schmidt', 'Toltén'] },
  huasco: { lat: -28.46, lng: -71.22, comunas: ['Vallenar', 'Huasco', 'Freirina', 'Alto del Carmen'] },
};

export default function MapaTerritorial() {
  const { user } = useAuth();
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/slep-detail/${user?.slep_id || 'barrancas'}/establishments`)
      .then(({ data }) => setEstablishments(data.establishments || []))
      .catch(() => setEstablishments([]))
      .finally(() => setLoading(false));
  }, [user?.slep_id]);

  const slepData = SLEP_COORDS[user?.slep_id] || SLEP_COORDS.barrancas;

  // Agrupar por comuna (simulado por nombre)
  const byComuna = {};
  establishments.forEach(e => {
    const comuna = e.comuna || 'Sin comuna';
    if (!byComuna[comuna]) byComuna[comuna] = [];
    byComuna[comuna].push(e);
  });

  const totalAlerts = establishments.reduce((sum, e) => sum + (e.alerts_count || 0), 0);
  const avgAsistencia = establishments.length > 0
    ? (establishments.reduce((sum, e) => sum + (e.asistencia_pct || 0), 0) / establishments.length).toFixed(1)
    : 0;

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Mapa territorial</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
        Distribución geográfica de establecimientos del SLEP
      </p>

      {/* KPIs territoriales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Comunas', value: slepData.comunas.length, icon: MapPin, color: '#3b82f6' },
          { label: 'Establecimientos', value: establishments.length, icon: School, color: '#10b981' },
          { label: 'Asistencia promedio', value: `${avgAsistencia}%`, icon: Users, color: '#f59e0b' },
          { label: 'Alertas activas', value: totalAlerts, icon: AlertTriangle, color: '#ef4444' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
              <Icon size={16} style={{ color }} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Mapa placeholder + lista de comunas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Mapa visual */}
        <div className="card" style={{ padding: 24, minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <MapPin size={48} style={{ color: '#3b82f6', marginBottom: 16, opacity: 0.5 }} />
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Mapa interactivo</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', maxWidth: 300 }}>
            Integración con Leaflet + GeoJSON de comunas. Próximamente: visualización georreferenciada de cada establecimiento.
          </p>
          <div style={{ marginTop: 16, padding: '8px 16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 8, fontSize: 12, color: '#3b82f6' }}>
            Coordenadas: {slepData.lat}°S, {Math.abs(slepData.lng)}°W
          </div>
        </div>

        {/* Comunas del SLEP */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Comunas del territorio</h3>
          {slepData.comunas.map((comuna, i) => {
            const comunaEstabs = byComuna[comuna] || [];
            return (
              <div key={comuna} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: i < slepData.comunas.length - 1 ? '1px solid var(--border-color)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <MapPin size={14} style={{ color: '#3b82f6' }} />
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{comuna}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>{comunaEstabs.length} establecimientos</span>
                </div>
              </div>
            );
          })}

          {loading && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Cargando...</p>}
        </div>
      </div>
    </div>
  );
}
