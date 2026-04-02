import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { MapPin, School, Users, AlertTriangle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const SEMAFORO_COLORS = { rojo: '#ef4444', naranja: '#f59e0b', verde: '#10b981' };

export default function MapaTerritorial() {
  const { user } = useAuth();
  const [data, setData] = useState({ establecimientos: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get('/slep/establecimientos')
      .then(({ data: d }) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.slep_id]);

  const ees = data.establecimientos || [];
  const withCoords = ees.filter(e => e.latitud && e.longitud);

  // Calculate center from data
  const center = withCoords.length > 0
    ? [
        withCoords.reduce((s, e) => s + e.latitud, 0) / withCoords.length,
        withCoords.reduce((s, e) => s + e.longitud, 0) / withCoords.length,
      ]
    : [-33.45, -70.65]; // Santiago default

  // KPIs
  const totalMat = ees.reduce((s, e) => s + (e.matricula || 0), 0);
  const avgAsist = ees.length > 0
    ? (ees.reduce((s, e) => s + (e.asistencia_pct || 0), 0) / ees.length).toFixed(1)
    : 0;
  const rojos = ees.filter(e => e.semaforo === 'rojo').length;
  const comunas = [...new Set(ees.map(e => e.comuna).filter(Boolean))];

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Mapa territorial</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 6 }}>
        {withCoords.length} establecimientos georreferenciados de {ees.length} total · {comunas.length} comunas
      </p>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
        Cada círculo representa un establecimiento. El tamaño indica matrícula y el color el estado del semáforo
        (<span style={{ color: '#ef4444' }}>rojo</span> = crítico,
        <span style={{ color: '#f59e0b' }}> naranja</span> = atención,
        <span style={{ color: '#10b981' }}> verde</span> = esperado).
        Haz clic en un círculo para ver detalle. Fuente: Coordenadas MINEDUC 2025.
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Comunas', value: comunas.length, icon: MapPin, color: '#3b82f6' },
          { label: 'Establecimientos', value: ees.length, icon: School, color: '#10b981' },
          { label: 'Matrícula total', value: totalMat.toLocaleString('es-CL'), icon: Users, color: '#f59e0b' },
          { label: 'En alerta roja', value: rojos, icon: AlertTriangle, color: '#ef4444' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
              <Icon size={16} style={{ color }} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Map + sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Leaflet Map */}
        <div className="card" style={{ overflow: 'hidden', height: 520 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              Cargando mapa...
            </div>
          ) : (
            <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}>
              <TileLayer
                attribution='&copy; <a href="https://carto.com">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {withCoords.map((e) => (
                <CircleMarker
                  key={e.rbd}
                  center={[e.latitud, e.longitud]}
                  radius={Math.max(7, Math.min(16, (e.matricula || 100) / 55))}
                  pathOptions={{
                    color: '#ffffff',
                    fillColor: SEMAFORO_COLORS[e.semaforo] || '#10b981',
                    fillOpacity: 0.85,
                    weight: 2,
                  }}
                  eventHandlers={{
                    click: () => setSelected(e),
                  }}
                >
                  <Popup>
                    <div style={{ fontSize: 13, minWidth: 220, lineHeight: 1.6 }}>
                      <strong style={{ fontSize: 14 }}>{e.nombre}</strong><br />
                      <span style={{ color: '#94a3b8' }}>RBD {e.rbd} · {e.comuna}</span>
                      <hr style={{ border: 'none', borderTop: '1px solid #334155', margin: '6px 0' }} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 12px' }}>
                        <span>Matrícula:</span><b>{e.matricula?.toLocaleString('es-CL')}</b>
                        <span>Asistencia:</span><b style={{ color: SEMAFORO_COLORS[e.semaforo] }}>{e.asistencia_pct}%</b>
                        {e.tasa_aprobacion > 0 && <><span>Aprobación:</span><b>{e.tasa_aprobacion}%</b></>}
                        {e.sep > 0 && <><span>Alumnos SEP:</span><b>{e.sep}</b></>}
                        {e.rural && <><span>Tipo:</span><b>Rural</b></>}
                      </div>
                      <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
                        <a href={`/dashboard/establecimientos/${e.rbd}`} style={{ fontSize: 12, color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>
                          Ver detalle →
                        </a>
                        <a href={`https://mi.mineduc.cl/mvc/mime/portada?rbd=${e.rbd}`} target="_blank" rel="noopener"
                          style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>
                          MIME ↗
                        </a>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          )}
          {/* Instrucción visual */}
          <div style={{
            position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
            zIndex: 1000, padding: '6px 14px', borderRadius: 20,
            background: '#ffffff', color: '#334155',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            fontSize: 11, fontWeight: 600, pointerEvents: 'none',
          }}>
            Haz clic en un punto para ver el detalle del establecimiento
          </div>
        </div>

        {/* Sidebar: comunas */}
        <div className="card" style={{ padding: 16, overflowY: 'auto', maxHeight: 520 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Por comuna</h3>
          {comunas.sort().map((comuna) => {
            const comunaEes = ees.filter(e => e.comuna === comuna);
            const comunaAsist = (comunaEes.reduce((s, e) => s + (e.asistencia_pct || 0), 0) / comunaEes.length).toFixed(1);
            const comunaRojos = comunaEes.filter(e => e.semaforo === 'rojo').length;
            return (
              <div key={comuna} style={{
                padding: '10px 0',
                borderBottom: '1px solid var(--border-color)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{comuna}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{comunaEes.length} EE</span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  <span>Asist: <b style={{ color: parseFloat(comunaAsist) < 80 ? '#ef4444' : parseFloat(comunaAsist) < 88 ? '#f59e0b' : '#10b981' }}>{comunaAsist}%</b></span>
                  {comunaRojos > 0 && <span style={{ color: '#ef4444' }}>{comunaRojos} en rojo</span>}
                </div>
              </div>
            );
          })}

          {/* Selected establishment detail */}
          {selected && (
            <div style={{ marginTop: 16, padding: 12, background: 'rgba(59, 130, 246, 0.08)', borderRadius: 8 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{selected.nombre}</h4>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                RBD: {selected.rbd}<br />
                Comuna: {selected.comuna}<br />
                Matrícula: {selected.matricula?.toLocaleString('es-CL')}<br />
                Asistencia: <b style={{ color: SEMAFORO_COLORS[selected.semaforo] }}>{selected.asistencia_pct}%</b><br />
                {selected.rural && <span>Rural</span>}
              </div>
              <a href={`/dashboard/establecimientos/${selected.rbd}`} style={{
                display: 'inline-block', marginTop: 8, fontSize: 11,
                color: '#3b82f6', textDecoration: 'none', fontWeight: 600,
              }}>
                Ver detalle →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Disclosure */}
      <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
        Fuente: Directorio Oficial de Establecimientos 2025, MINEDUC · Coordenadas georreferenciadas oficiales
      </div>
    </div>
  );
}
