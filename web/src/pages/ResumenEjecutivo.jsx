import { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';
import { dashboardApi, alertsApi, compromisosApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import SemaforoTag from '../components/shared/SemaforoTag';

export default function ResumenEjecutivo() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [semaforos, setSemaforos] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [compromisos, setCompromisos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.summary(),
      dashboardApi.semaforos(),
      alertsApi.list(),
      compromisosApi.list(),
    ])
      .then(([s, sem, a, c]) => {
        setSummary(s.data);
        setSemaforos(sem.data);
        setAlerts(a.data.alerts || []);
        setCompromisos(c.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: 'var(--text-muted)', padding: 40 }}>Generando resumen...</p>;

  const kpis = summary?.kpis || {};
  const establecimientos = semaforos?.establecimientos || [];
  const rojas = alerts.filter((a) => a.severidad === 'rojo');
  const naranjas = alerts.filter((a) => a.severidad === 'naranja');
  const fecha = new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Resumen Ejecutivo</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            SLEP {user?.slep_id?.toUpperCase()} &middot; {fecha}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', background: 'rgba(59, 130, 246, 0.15)',
            color: 'var(--accent-primary)', border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Printer size={15} /> Imprimir
        </button>
      </div>

      {/* KPI Summary Box */}
      <div className="glass-panel" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Indicadores Clave</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          <KpiBlock label="Establecimientos" value={kpis.total_establecimientos} />
          <KpiBlock label="Matrícula" value={kpis.matricula_total?.toLocaleString('es-CL')} />
          <KpiBlock label="Asistencia" value={`${kpis.asistencia_promedio}%`} warn={kpis.asistencia_promedio < 88} />
          <KpiBlock label="Ejecución presup." value={`${kpis.ejecucion_presupuestaria}%`} warn={kpis.ejecucion_presupuestaria < 50} />
        </div>
      </div>

      {/* Semáforo summary */}
      <div className="glass-panel" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Estado de Establecimientos</h3>
        <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
          <SemaforoCount color="var(--alert-red)" count={kpis.alertas_rojas} label="En riesgo" />
          <SemaforoCount color="var(--alert-orange)" count={kpis.alertas_naranjas} label="Atención" />
          <SemaforoCount color="var(--alert-green)" count={kpis.alertas_verdes} label="Estables" />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Establecimiento', 'Comuna', 'Matricula', 'Asistencia', 'Estado'].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {establecimientos.map((e) => (
              <tr key={e.rbd}>
                <td style={tdStyle}><strong>{e.nombre}</strong><br /><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>RBD {e.rbd}</span></td>
                <td style={tdStyle}>{e.comuna || '—'}</td>
                <td style={tdStyle}>{e.matricula?.toLocaleString('es-CL')}</td>
                <td style={{ ...tdStyle, color: e.asistencia < 75 ? 'var(--alert-red)' : e.asistencia < 82 ? 'var(--alert-orange)' : 'inherit', fontWeight: e.asistencia < 75 ? 700 : 400 }}>{e.asistencia}%</td>
                <td style={tdStyle}><SemaforoTag value={e.semaforo} size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Alertas activas */}
      {rojas.length > 0 && (
        <div className="glass-panel" style={{ padding: 24, marginBottom: 16, borderLeft: '4px solid var(--alert-red)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--alert-red)' }}>
            Alertas Críticas ({rojas.length})
          </h3>
          {rojas.map((a) => (
            <div key={a.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{a.establecimiento}</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>{a.mensaje}</div>
              <div style={{ fontSize: 13, color: 'var(--accent-primary)', marginTop: 4 }}>Acción: {a.accion_sugerida}</div>
            </div>
          ))}
        </div>
      )}

      {naranjas.length > 0 && (
        <div className="glass-panel" style={{ padding: 24, marginBottom: 16, borderLeft: '4px solid var(--alert-orange)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--alert-orange)' }}>
            Alertas de Atención ({naranjas.length})
          </h3>
          {naranjas.map((a) => (
            <div key={a.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{a.establecimiento}</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>{a.mensaje}</div>
              <div style={{ fontSize: 13, color: 'var(--accent-primary)', marginTop: 4 }}>Acción: {a.accion_sugerida}</div>
            </div>
          ))}
        </div>
      )}

      {/* Compromisos de gestión */}
      {compromisos && (compromisos.atrasados?.length > 0 || compromisos.proximos?.length > 0) && (
        <div className="glass-panel" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            Compromisos de Gestion
            <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>
              {compromisos.resumen?.total_activos} activos
            </span>
          </h3>

          {compromisos.atrasados?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--alert-red)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Vencidos ({compromisos.atrasados.length})
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Hito', 'Instrumento', 'Responsable', 'Dias atraso'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compromisos.atrasados.map(c => (
                    <tr key={c.id}>
                      <td style={tdStyle}>{c.hito}</td>
                      <td style={tdStyle}><span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: 'rgba(239,68,68,0.1)', color: 'var(--alert-red)' }}>{c.instrumento}</span></td>
                      <td style={tdStyle}>{c.responsable}</td>
                      <td style={{ ...tdStyle, color: 'var(--alert-red)', fontWeight: 700 }}>{c.dias_atraso} dias</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {compromisos.proximos?.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--alert-orange)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Proximos a vencer ({compromisos.proximos.length})
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Hito', 'Instrumento', 'Responsable', 'Vence'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compromisos.proximos.map(c => (
                    <tr key={c.id}>
                      <td style={tdStyle}>{c.hito}</td>
                      <td style={tdStyle}><span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: 'rgba(245,158,11,0.1)', color: 'var(--alert-orange)' }}>{c.instrumento}</span></td>
                      <td style={tdStyle}>{c.responsable}</td>
                      <td style={{ ...tdStyle, color: 'var(--alert-orange)' }}>en {c.dias_restantes} dias</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 12 }}>
        Radar de la Educación Pública &middot; Generado el {fecha} &middot; Tercera Letra SpA
      </div>
    </div>
  );
}

function KpiBlock({ label, value, warn }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: warn ? 'var(--alert-red)' : 'var(--text-main)' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function SemaforoCount({ color, count, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 12, height: 12, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
      <span style={{ fontSize: 20, fontWeight: 700 }}>{count}</span>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
    </div>
  );
}

const thStyle = { textAlign: 'left', padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' };
const tdStyle = { padding: '12px', fontSize: 13, borderBottom: '1px solid var(--border-color)' };
