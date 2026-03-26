import { useState, useEffect } from 'react';
import { ClipboardCheck, Target, CheckCircle, Clock, AlertTriangle, ChevronDown, ChevronRight, TrendingUp, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { palApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const AUTO_COLORS = { si: '#10b981', parcial: '#f59e0b', manual: '#94a3b8' };
const AUTO_LABELS = { si: 'Automatizable', parcial: 'Parcial', manual: 'Manual' };

// Simulated monitoring data for demo (replace with real API when available)
const MONITORING_DATA = {
  1: { avance: 60, registros: [
    { periodo: 'Q1', valor: '3 de 5 proyectos', pct: 60, fecha: '2025-03-31' },
  ]},
  2: { avance: 75, registros: [
    { periodo: 'Q1', valor: '6 de 8 informes', pct: 75, fecha: '2025-03-31' },
    { periodo: 'Q2', valor: 'Pendiente', pct: 0, fecha: null },
  ]},
  3: { avance: 45, registros: [
    { periodo: 'Q1', valor: '23 de 50 EE', pct: 46, fecha: '2025-03-28' },
  ]},
};

export default function PlanAnual() {
  const { user } = useAuth();
  const [resumen, setResumen] = useState(null);
  const [docs, setDocs] = useState([]);
  const [detail, setDetail] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('estructura'); // estructura | monitoreo

  useEffect(() => {
    Promise.all([palApi.resumen(), palApi.documentos()])
      .then(([r, d]) => {
        setResumen(r.data);
        setDocs(d.data.documentos || []);
        if (d.data.documentos?.length > 0) {
          loadDetail(d.data.documentos[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadDetail = (docId) => {
    palApi.documento(docId).then(({ data }) => setDetail(data)).catch(() => {});
  };

  const toggleLine = (idx) => setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));

  if (loading) return <p style={{ color: 'var(--text-muted)', padding: 40, fontSize: 15 }}>Cargando Plan Anual Local...</p>;

  const pieData = resumen ? [
    { name: 'Automatizables', value: resumen.automatizables, color: AUTO_COLORS.si },
    { name: 'Parciales', value: resumen.parciales, color: AUTO_COLORS.parcial },
    { name: 'Manuales', value: resumen.manuales, color: AUTO_COLORS.manual },
  ] : [];

  // Collect all indicators for monitoring view
  const allIndicators = detail?.lineas?.flatMap((l, li) =>
    (l.indicadores || []).map((ind, ii) => ({ ...ind, lineaIdx: li, lineaDesc: l.descripcion || l.nombre, indIdx: ii }))
  ) || [];

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
        <ClipboardCheck size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />
        Plan Anual Local (PAL)
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 20 }}>
        Seguimiento de compromisos e indicadores del PAL
      </p>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { key: 'estructura', label: 'Estructura PAL', icon: Target },
          { key: 'monitoreo', label: 'Monitoreo', icon: TrendingUp },
        ].map(v => (
          <button key={v.key} onClick={() => setViewMode(v.key)} style={{
            padding: '9px 18px', borderRadius: 8, fontSize: 14, cursor: 'pointer',
            border: '1px solid var(--border-color)',
            background: viewMode === v.key ? 'var(--accent-primary)' : 'transparent',
            color: viewMode === v.key ? 'white' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <v.icon size={15} /> {v.label}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, marginBottom: 24 }}>
        <MiniKpi icon={ClipboardCheck} label="PALs cargados" value={resumen?.total_pals || 0} />
        <MiniKpi icon={Target} label="Lineas estrategicas" value={resumen?.total_lineas || 0} />
        <MiniKpi icon={CheckCircle} label="Indicadores" value={resumen?.total_indicadores || 0} color="var(--accent-primary)" />
        <MiniKpi icon={CheckCircle} label="Automatizables" value={resumen?.automatizables || 0} color="var(--alert-green)" />
      </div>

      {viewMode === 'estructura' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, marginBottom: 24 }}>
            {/* Automatizacion pie */}
            <div className="glass-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Automatizacion</h3>
              {pieData.some(d => d.value > 0) ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" strokeWidth={0}>
                        {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 8 }}>
                    {pieData.map((d) => (
                      <span key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                        {d.value} {d.name.toLowerCase()}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sin datos</p>
              )}
            </div>

            {/* PAL Documents */}
            <div className="glass-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Documentos PAL</h3>
              {docs.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
                  <AlertTriangle size={24} style={{ marginBottom: 8, opacity: 0.5 }} />
                  <p style={{ fontSize: 14 }}>No hay PALs cargados para este SLEP.</p>
                  <p style={{ fontSize: 13, marginTop: 8 }}>Sube el PDF del PAL para comenzar el seguimiento automatizado.</p>
                </div>
              ) : (
                docs.map((d) => (
                  <div key={d.id} onClick={() => loadDetail(d.id)} style={{
                    padding: 14, marginBottom: 8, borderRadius: 10,
                    background: detail?.documento?.id === d.id ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${detail?.documento?.id === d.id ? 'rgba(59,130,246,0.3)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>PAL {d.anio}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                      {d.acto_administrativo} &middot; {d.n_lineas} lineas &middot; {d.n_indicadores} indicadores
                    </div>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 8, marginTop: 6, display: 'inline-block',
                      background: d.estado_extraccion === 'completo' ? 'rgba(16,185,129,0.15)' : 'rgba(249,115,22,0.15)',
                      color: d.estado_extraccion === 'completo' ? '#10b981' : '#f59e0b',
                    }}>
                      {d.estado_extraccion === 'demo' ? 'Ejemplo' : d.estado_extraccion}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Lines and indicators */}
          {detail && (
            <div className="glass-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>
                PAL {detail.documento.anio}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                {detail.documento.acto_administrativo}
                {detail.documento.fecha_aprobacion && ` · Aprobado: ${detail.documento.fecha_aprobacion}`}
              </p>

              {detail.lineas.map((linea, idx) => (
                <div key={idx} style={{ marginBottom: 8 }}>
                  <button onClick={() => toggleLine(idx)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '14px 16px', background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)', borderRadius: 10,
                    color: 'var(--text-main)', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', textAlign: 'left',
                  }}>
                    {expanded[idx] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span style={{ flex: 1 }}>
                      {idx + 1}. {linea.descripcion || linea.nombre}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>
                      {linea.indicadores.length} indicadores
                    </span>
                  </button>

                  {expanded[idx] && linea.indicadores.length > 0 && (
                    <div style={{ padding: '12px 0 12px 32px' }}>
                      {linea.indicadores.map((ind, iIdx) => (
                        <div key={iIdx} style={{
                          padding: 16, marginBottom: 8, borderRadius: 10,
                          background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)',
                        }}>
                          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{ind.nombre}</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                            <InfoPill label="Meta" value={ind.meta} highlight />
                            <InfoPill label="Periodicidad" value={ind.periodicidad} />
                            <InfoPill label="Responsable" value={ind.responsable} />
                            <InfoPill label="Automatizable" value={AUTO_LABELS[ind.automatizable] || ind.automatizable}
                              color={AUTO_COLORS[ind.automatizable]} />
                          </div>
                          {ind.medio_verificacion && (
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                              <strong>Verificacion:</strong> {ind.medio_verificacion}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* MONITORING VIEW */
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Monitoreo de Indicadores PAL</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
            Seguimiento trimestral del avance de cada indicador
          </p>

          {allIndicators.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14, padding: 20, textAlign: 'center' }}>
              No hay indicadores cargados para monitorear.
            </p>
          ) : (
            allIndicators.map((ind) => {
              const mon = MONITORING_DATA[ind.id] || { avance: 0, registros: [] };
              const avance = mon.avance;
              const color = avance >= 75 ? '#10b981' : avance >= 50 ? '#f59e0b' : '#ef4444';

              return (
                <div key={ind.id} style={{
                  padding: 20, marginBottom: 16, borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                        Linea {ind.lineaIdx + 1}: {ind.lineaDesc?.slice(0, 50)}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{ind.nombre}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color }}>{avance}%</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>avance</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: 12, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${avance}%`, background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
                  </div>

                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                    <span><strong>Meta:</strong> {ind.meta}</span>
                    <span><strong>Periodicidad:</strong> {ind.periodicidad}</span>
                    <span style={{ color: AUTO_COLORS[ind.automatizable] }}>
                      {AUTO_LABELS[ind.automatizable] || ind.automatizable}
                    </span>
                  </div>

                  {/* Timeline */}
                  {mon.registros.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                        <Calendar size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        Registros
                      </div>
                      {mon.registros.map((reg, ri) => (
                        <div key={ri} style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0',
                          borderBottom: ri < mon.registros.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                        }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                            background: reg.pct > 0 ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
                            color: reg.pct > 0 ? '#60a5fa' : 'var(--text-muted)',
                          }}>
                            {reg.periodo}
                          </span>
                          <span style={{ fontSize: 13, flex: 1 }}>{reg.valor}</span>
                          {reg.fecha && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{reg.fecha}</span>}
                          {reg.pct > 0 && (
                            <span style={{ fontSize: 13, fontWeight: 600, color: reg.pct >= 75 ? '#10b981' : reg.pct >= 50 ? '#f59e0b' : '#ef4444' }}>
                              {reg.pct}%
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}

          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16, padding: 12, background: 'rgba(59,130,246,0.05)', borderRadius: 8 }}>
            <strong>Nota:</strong> Los datos de monitoreo se actualizan trimestralmente.
            Los indicadores marcados como "Automatizable" se alimentan desde las fuentes de datos conectadas (SIGE, Mercado Publico).
            Los "Parciales" requieren complemento manual. Los "Manuales" se ingresan directamente por el equipo del SLEP.
          </div>
        </div>
      )}

      {/* Disclosure */}
      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7, padding: '16px 0', borderTop: '1px solid var(--border-color)', marginTop: 16 }}>
        <strong>Fuente:</strong> Plan Anual Local extraido por Radar Educativo. Los indicadores automatizables se monitorean
        con datos de MINEDUC SIGE, Mercado Publico y otras fuentes abiertas. &middot; Tercera Letra SpA
      </div>
    </div>
  );
}

function MiniKpi({ icon: Icon, label, value, color }) {
  return (
    <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <Icon size={20} style={{ color: color || 'var(--accent-primary)', opacity: 0.7, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
      </div>
    </div>
  );
}

function InfoPill({ label, value, highlight, color }) {
  return (
    <div style={{ fontSize: 13 }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}: </span>
      <span style={{ fontWeight: highlight ? 700 : 600, color: color || (highlight ? 'var(--accent-primary)' : 'var(--text-main)') }}>
        {value || '\u2014'}
      </span>
    </div>
  );
}
