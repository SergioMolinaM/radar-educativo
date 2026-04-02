import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, GraduationCap, CalendarCheck, DollarSign, AlertTriangle, Download,
  MapPin, TrendingDown, Clock, ChevronRight, School, Target,
} from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { dashboardApi, alertsApi, slepApi } from '../services/api';
import KpiCard from './shared/KpiCard';
import CompromisosPanel from './dashboard/CompromisosPanel';
import ENEPPanel from './dashboard/ENEPPanel';
import TimelineNormativa from './dashboard/TimelineNormativa';
import BrechaAcumulada from './dashboard/BrechaAcumulada';
import SemaforoCruzado from './dashboard/SemaforoCruzado';

const PIE_COLORS = ['var(--alert-red)', 'var(--alert-orange)', 'var(--alert-green)'];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [semaforos, setSemaforos] = useState(null);
  const [tendencia, setTendencia] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      dashboardApi.summary(),
      dashboardApi.semaforos(),
      dashboardApi.tendenciaAsistencia(),
      alertsApi.list().catch(() => ({ data: [] })),
    ])
      .then(([s, sem, t, al]) => {
        setSummary(s.data);
        setSemaforos(sem.data);
        setTendencia(t.data);
        setAlertas(Array.isArray(al.data) ? al.data.slice(0, 5) : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  const kpis = summary?.kpis || {};
  const trends = summary?.tendencias || {};
  const establecimientos = semaforos?.establecimientos || [];
  const comunas = summary?.comunas || [];

  const pieData = [
    { name: 'Rojo', value: kpis.alertas_rojas || 0 },
    { name: 'Naranja', value: kpis.alertas_naranjas || 0 },
    { name: 'Verde', value: kpis.alertas_verdes || 0 },
  ];

  const top5criticos = [...establecimientos]
    .filter(e => e.semaforo === 'rojo')
    .sort((a, b) => a.asistencia - b.asistencia)
    .slice(0, 5);

  // Build "Tu día hoy" — top 3 urgent actions
  const alertasNoLeidas = alertas.filter(a => !a.leida && (a.severity === 'critical' || a.severity === 'warning'));
  const hoyActions = [
    ...alertasNoLeidas.slice(0, 2).map(a => ({
      text: a.mensaje,
      type: 'alerta',
      color: a.severity === 'critical' ? '#ef4444' : '#f59e0b',
    })),
    ...(kpis.alertas_rojas > 0 ? [{
      text: `${kpis.alertas_rojas} establecimientos con asistencia bajo 75% requieren intervención`,
      type: 'brecha',
      color: '#ef4444',
    }] : []),
  ].slice(0, 3);

  return (
    <div className="animate-fade-in">
      {/* Header operativo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
            Estado del SLEP hoy
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
            {comunas.length > 0 && (
              <span>
                <MapPin size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                {comunas.join(', ')} ·{' '}
              </span>
            )}
            {kpis.total_establecimientos || kpis.ee_oficial} EE en el SLEP
            ({kpis.ee_con_datos || '?'} con datos cargados)
            {kpis.ee_escuelas_liceos ? ` — ${kpis.ee_escuelas_liceos} escuelas/liceos + ${kpis.ee_jardines || 0} jardines` : ''}
          </p>
        </div>
        <button
          onClick={() => {
            const token = localStorage.getItem('token');
            window.open(`/api/exports/excel?token=${token}`, '_blank');
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', background: 'rgba(59, 130, 246, 0.1)',
            color: 'var(--accent-primary)', border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Download size={14} /> Exportar
        </button>
      </div>

      {/* TU DÍA HOY — top 3 acciones urgentes */}
      {hoyActions.length > 0 && (
        <div style={{
          marginBottom: 20, padding: '16px 20px', borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(239,68,68,0.06))',
          border: '1px solid rgba(249,115,22,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <AlertTriangle size={16} style={{ color: '#f97316' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#f97316' }}>
              Requiere tu atención hoy
            </span>
          </div>
          {hoyActions.map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '8px 0',
              borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${a.color}18`, color: a.color, fontSize: 12, fontWeight: 700,
              }}>
                {i + 1}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {a.text}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Establecimientos" value={kpis.total_establecimientos || kpis.ee_oficial} icon={School}
          detail={kpis.ee_escuelas_liceos
            ? `${kpis.ee_escuelas_liceos} escuelas/liceos · ${kpis.ee_jardines || 0} jardines`
            : null}
          subtitle={kpis.ee_con_datos
            ? `${kpis.ee_con_datos} EE con datos cargados`
            : null}
          tooltip={{ text: `Total de establecimientos del SLEP. Los jardines infantiles (JUNJI/VTF) no reportan asistencia al Mineduc, por lo que el panel de asistencia muestra solo escuelas y liceos.`, fuente: 'Sitio oficial SLEP + MINEDUC 2025' }} />
        <KpiCard label="Matrícula total" value={kpis.matricula_total} icon={GraduationCap} trend={trends.matricula_variacion_anual}
          tooltip={{ text: 'Alumnos matriculados en escuelas, liceos y jardines del SLEP. No incluye educación de adultos.', fuente: 'MINEDUC Matrícula 2025' }} />
        <KpiCard label="Asistencia promedio" value={kpis.asistencia_promedio} unit="%" icon={CalendarCheck} trend={trends.asistencia_variacion_mensual}
          tooltip={{ text: 'Porcentaje promedio de asistencia de escuelas y liceos del SLEP. No incluye educación de adultos ni jardines JUNJI.', fuente: 'MINEDUC Asistencia 2025', periodo: summary?.mes_nombre + ' 2025' }} />
        <KpiCard label="Ejecución presup." value={kpis.ejecucion_presupuestaria} unit="%" icon={DollarSign}
          tooltip={{ text: 'Porcentaje del presupuesto anual del SLEP ejecutado a la fecha. Este dato se actualizará con la integración al sistema financiero del SLEP (en desarrollo).', fuente: 'Estimación interna', periodo: 'Q1 2026' }} />
      </div>

      {/* ENEP — Objetivos Estratégicos con alertas */}
      <ENEPPanel />

      {/* Semáforo cruzado — EE con problemas en múltiples áreas */}
      <SemaforoCruzado />

      {/* Proyección y calendario en 2 columnas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 0 }}>
        <BrechaAcumulada />
        <TimelineNormativa />
      </div>

      {/* Fila principal: Compromisos + Alertas urgentes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Compromisos */}
        <CompromisosPanel />

        {/* Alertas urgentes - lo que requiere acción HOY */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={18} style={{ color: 'var(--alert-red)' }} />
              Requieren atención
            </h3>
            <button onClick={() => navigate('/dashboard/alertas')} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              Ver todas <ChevronRight size={14} />
            </button>
          </div>

          {/* Info bubble — globo blanco */}
          <div style={{
            padding: '10px 14px', marginBottom: 14, borderRadius: 10,
            background: '#ffffff', color: '#334155',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            fontSize: 12, lineHeight: 1.5,
          }}>
            <strong style={{ color: '#ef4444' }}>{kpis.alertas_rojas || 0} establecimientos en rojo</strong> — asistencia bajo 75%.
            {top5criticos.length > 0 && ` El más crítico: ${top5criticos[0]?.nombre?.slice(0, 30)} (${top5criticos[0]?.asistencia}%).`}
          </div>

          {/* Top 5 críticos */}
          {top5criticos.map((e, i) => (
            <div
              key={e.rbd}
              onClick={() => navigate(`/establecimientos/${e.rbd}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                borderBottom: i < top5criticos.length - 1 ? '1px solid var(--border-color)' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(239, 68, 68, 0.15)', color: 'var(--alert-red)', fontSize: 13, fontWeight: 700,
              }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {e.nombre}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  RBD {e.rbd} · {e.matricula?.toLocaleString('es-CL')} alumnos
                </div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--alert-red)' }}>
                {e.asistencia}%
              </div>
            </div>
          ))}

          {top5criticos.length === 0 && (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>
              No hay establecimientos en rojo. ¡Buen estado!
            </div>
          )}
        </div>
      </div>

      {/* Fila secundaria: Tendencia + Semáforo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, marginBottom: 24 }}>
        {/* Tendencia asistencia */}
        {tendencia?.meses?.length > 0 && (
          <div className="glass-panel" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>
              Asistencia mensual 2025
              <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>
                {tendencia.meses.length} meses
              </span>
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={tendencia.meses}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="mes_nombre" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 13 }} formatter={(v) => [`${v}%`, 'Asistencia']} />
                <ReferenceLine y={82} stroke="var(--alert-green)" strokeDasharray="4 4" label={{ value: 'Meta 82%', fill: 'var(--alert-green)', fontSize: 10 }} />
                <Line type="monotone" dataKey="asistencia" stroke="var(--accent-primary)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--accent-primary)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Semáforo donut compacto */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Estado general</h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 4 }}>
            <LegendDot color="var(--alert-red)" label={`${kpis.alertas_rojas || 0} rojas`} />
            <LegendDot color="var(--alert-orange)" label={`${kpis.alertas_naranjas || 0} naranja`} />
            <LegendDot color="var(--alert-green)" label={`${kpis.alertas_verdes || 0} verdes`} />
          </div>

          {/* Info bubble comic — globo blanco */}
          <div style={{
            marginTop: 12, padding: '8px 12px', borderRadius: 10,
            background: '#ffffff', color: '#334155',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            fontSize: 11, lineHeight: 1.5, textAlign: 'center',
          }}>
            <Target size={12} style={{ verticalAlign: 'middle', color: '#2563eb' }} /> Umbrales asistencia: <strong style={{ color: '#ef4444' }}>Rojo</strong> &lt;75% · <strong style={{ color: '#f59e0b' }}>Naranja</strong> 75-82% · <strong style={{ color: '#10b981' }}>Verde</strong> &ge;82%
          </div>
        </div>
      </div>

      {/* Acciones rápidas — orientadas a acción, no solo navegación */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <QuickLink icon="🚨" label="Ver alertas activas" desc={`${kpis.alertas_rojas || 0} EE en rojo`} color="#ef4444" to="/alertas" navigate={navigate} />
        <QuickLink icon="🎯" label="Revisar avance PAL" desc="Indicadores y compromisos" color="#8b5cf6" to="/plan-anual" navigate={navigate} />
        <QuickLink icon="📊" label="Detectar brechas" desc="Comparar establecimientos" color="#f97316" to="/ranking" navigate={navigate} />
        <QuickLink icon="🗺️" label="Explorar territorio" desc={`${kpis.total_establecimientos || '?'} EE (${kpis.ee_con_datos || '?'} con datos)`} color="#10b981" to="/mapa" navigate={navigate} />
      </div>
    </div>
  );
}

function QuickLink({ icon, label, desc, color, to, navigate }) {
  return (
    <div
      onClick={() => navigate(to)}
      className="glass-panel"
      style={{
        padding: '16px 18px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 14,
        border: `1px solid ${color}22`,
        transition: 'transform 0.15s, border-color 0.15s',
      }}
      onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-2px)'; ev.currentTarget.style.borderColor = `${color}44`; }}
      onMouseLeave={ev => { ev.currentTarget.style.transform = 'translateY(0)'; ev.currentTarget.style.borderColor = `${color}22`; }}
    >
      <span style={{ fontSize: 28 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
      </div>
      <ChevronRight size={16} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      {label}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
      Cargando dashboard...
    </div>
  );
}
