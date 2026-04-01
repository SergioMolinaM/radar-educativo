import { useState, useEffect } from 'react';
import {
  ClipboardCheck, Target, CheckCircle, AlertTriangle, ChevronDown, ChevronRight,
  TrendingUp, BarChart3, School, FileText, Info
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { palApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { mockPal } from '../services/mockData';

// Los Parques always shown as demo SLEP — real CGE data from PDF oficial julio 2025
const LOS_PARQUES_DOC = { id: '__los_parques__', anio: 2026, slep_nombre: 'Los Parques', _demo: true };

const AUTO_COLORS = { si: '#10b981', parcial: '#f59e0b', manual: '#94a3b8' };
const AUTO_LABELS = { si: 'Automatizable', parcial: 'Parcial', manual: 'Manual' };

function parseNumeric(val) {
  if (!val || val === 'S/I' || val === 'N/A') return null;
  const n = parseFloat(String(val).replace(/[^0-9,.\-]/g, '').replace(',', '.'));
  return isNaN(n) ? null : n;
}

function avanceColor(avance, meta) {
  if (avance === null) return 'var(--text-muted)';
  if (meta === null) return '#60a5fa';
  const ratio = meta !== 0 ? avance / meta : 0;
  if (ratio >= 0.9) return '#10b981';
  if (ratio >= 0.6) return '#f59e0b';
  return '#ef4444';
}

function SemaforoChip({ avance, meta }) {
  const av = parseNumeric(avance);
  const mt = parseNumeric(meta);
  const color = avanceColor(av, mt);
  const label = avance || 'Sin dato';
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
      background: `${color}18`, color,
    }}>
      {label}
    </span>
  );
}

export default function PlanAnual() {
  const { user } = useAuth();
  const [resumen, setResumen] = useState(null);
  const [docs, setDocs] = useState([]);
  const [detail, setDetail] = useState(null);
  const [cge, setCge] = useState(null);
  const [pme, setPme] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('monitoreo');
  const [selectedDocId, setSelectedDocId] = useState(null);

  useEffect(() => {
    Promise.all([palApi.resumen(), palApi.documentos()])
      .then(([r, d]) => {
        setResumen(r.data);
        const liveDocs = d.data.documentos || [];
        const allDocs = [...liveDocs, LOS_PARQUES_DOC];
        setDocs(allDocs);
        if (liveDocs.length > 0) {
          const firstId = liveDocs[0].id;
          setSelectedDocId(firstId);
          loadAll(firstId);
        } else {
          // demo-only mode: load Los Parques by default
          setSelectedDocId(LOS_PARQUES_DOC.id);
          loadAll(LOS_PARQUES_DOC.id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadAll = (docId) => {
    setSelectedDocId(docId);
    if (docId === LOS_PARQUES_DOC.id) {
      setDetail(mockPal.documento(2));
      setCge(mockPal.cge(2));
      setPme(mockPal.pme(2));
      return;
    }
    Promise.all([
      palApi.documento(docId),
      palApi.cge(docId).catch(() => ({ data: { cge: [] } })),
      palApi.pme(docId).catch(() => ({ data: { establecimientos: [] } })),
    ]).then(([det, cgeRes, pmeRes]) => {
      setDetail(det.data);
      setCge(cgeRes.data);
      setPme(pmeRes.data);
    });
  };

  const toggleLine = (idx) => setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));

  if (loading) return <p style={{ color: 'var(--text-muted)', padding: 40, fontSize: 15 }}>Cargando Plan Anual Local...</p>;

  const pieData = resumen ? [
    { name: 'Automatizables', value: resumen.automatizables, color: AUTO_COLORS.si },
    { name: 'Parciales', value: resumen.parciales, color: AUTO_COLORS.parcial },
    { name: 'Manuales', value: resumen.manuales, color: AUTO_COLORS.manual },
  ] : [];

  // Separate PEL lines (OE1-OE5) from ATP lines
  const pelLineas = detail?.lineas?.filter(l => l.nombre.startsWith('OE')) || [];
  const atpLineas = detail?.lineas?.filter(l => l.nombre.startsWith('ATP')) || [];
  const allIndicators = detail?.lineas?.flatMap((l) =>
    (l.indicadores || []).map((ind) => ({ ...ind, lineaName: l.nombre, lineaDesc: l.descripcion }))
  ) || [];

  const VIEWS = [
    { key: 'monitoreo', label: 'Monitoreo', icon: TrendingUp },
    { key: 'estructura', label: 'Estructura', icon: Target },
    { key: 'cge', label: 'CGE', icon: FileText },
    { key: 'pme', label: 'PME por EE', icon: School },
  ];

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
        <ClipboardCheck size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />
        Plan Anual Local (PAL)
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 20 }}>
        Monitoreo profundo de compromisos, indicadores y avance del PAL {detail?.documento?.anio || ''}
        {detail?.documento?.slep && ` — SLEP ${detail.documento.slep}`}
      </p>

      {/* Document selector — always shown, Los Parques always injected */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {docs.map((d) => (
          <button key={d.id} onClick={() => loadAll(d.id)} style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
            border: `1px solid ${selectedDocId === d.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
            background: selectedDocId === d.id ? 'rgba(59,130,246,0.1)' : 'transparent',
            color: selectedDocId === d.id ? 'var(--accent-primary)' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            PAL {d.anio} — {d.slep_nombre}
            {d._demo && (
              <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontWeight: 700 }}>
                DEMO
              </span>
            )}
          </button>
        ))}
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {VIEWS.map(v => (
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
        <MiniKpi icon={Target} label="Objetivos Estratégicos" value={pelLineas.length} />
        <MiniKpi icon={ClipboardCheck} label="Acciones ATP" value={atpLineas.length} />
        <MiniKpi icon={CheckCircle} label="Indicadores totales" value={resumen?.total_indicadores || 0} color="var(--accent-primary)" />
        <MiniKpi icon={School} label="Establecimientos" value={pme?.total_ee || 0} color="var(--alert-green)" />
      </div>

      {/* ============= MONITOREO VIEW ============= */}
      {viewMode === 'monitoreo' && (
        <div>
          {/* Summary bar chart of PEL avance */}
          {pelLineas.length > 0 && <AvanceResumenChart lineas={pelLineas} />}

          {/* ATP avance cards */}
          {atpLineas.length > 0 && (
            <div className="glass-panel" style={{ padding: 24, marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>
                <TrendingUp size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Acciones Técnico Pedagógicas — Avance
              </h3>
              {atpLineas.map((l, i) => (
                <AtpCard key={i} linea={l} index={i} />
              ))}
            </div>
          )}

          {/* All indicators detailed */}
          <div className="glass-panel" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>
              Detalle de Indicadores PEL — Avance Real
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              {allIndicators.filter(i => i.avance && i.avance !== 'S/I' && i.avance !== 'N/A').length} de {allIndicators.length} indicadores con dato de avance
            </p>

            {pelLineas.map((linea, idx) => (
              <div key={idx} style={{ marginBottom: 16 }}>
                <button onClick={() => toggleLine(`mon_${idx}`)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-color)', borderRadius: 10,
                  color: 'var(--text-main)', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', textAlign: 'left',
                }}>
                  {expanded[`mon_${idx}`] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span style={{ flex: 1 }}>{linea.descripcion}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>
                    {linea.indicadores.length} ind.
                  </span>
                </button>

                {expanded[`mon_${idx}`] && (
                  <div style={{ padding: '12px 0 0 24px' }}>
                    {linea.indicadores.map((ind, iIdx) => (
                      <IndicadorMonitorCard key={iIdx} ind={ind} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <SourceNote />
        </div>
      )}

      {/* ============= ESTRUCTURA VIEW ============= */}
      {viewMode === 'estructura' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, marginBottom: 24 }}>
            <div className="glass-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Automatización</h3>
              {pieData.some(d => d.value > 0) ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" strokeWidth={0}>
                        {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <RTooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 12 }} />
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

            <div className="glass-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Información del Documento</h3>
              {detail?.documento && (
                <div style={{ display: 'grid', gap: 8 }}>
                  <InfoPill label="SLEP" value={detail.documento.slep} />
                  <InfoPill label="Año" value={detail.documento.anio} />
                  <InfoPill label="Acto Administrativo" value={detail.documento.acto_administrativo} />
                  <InfoPill label="Fecha Aprobación" value={detail.documento.fecha_aprobacion} />
                  <InfoPill label="Estado Extracción" value={detail.documento.estado} highlight />
                </div>
              )}
            </div>
          </div>

          {detail && (
            <div className="glass-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Líneas Estratégicas e Indicadores</h3>
              {detail.lineas.map((linea, idx) => (
                <div key={idx} style={{ marginBottom: 8 }}>
                  <button onClick={() => toggleLine(`est_${idx}`)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '14px 16px', background: linea.nombre.startsWith('ATP') ? 'rgba(59,130,246,0.04)' : 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)', borderRadius: 10,
                    color: 'var(--text-main)', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', textAlign: 'left',
                  }}>
                    {expanded[`est_${idx}`] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 6, flexShrink: 0,
                      background: linea.nombre.startsWith('ATP') ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)',
                      color: linea.nombre.startsWith('ATP') ? '#60a5fa' : '#10b981',
                    }}>
                      {linea.nombre}
                    </span>
                    <span style={{ flex: 1 }}>{linea.descripcion}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>
                      {linea.indicadores.length} ind.
                    </span>
                  </button>

                  {expanded[`est_${idx}`] && linea.indicadores.length > 0 && (
                    <div style={{ padding: '12px 0 12px 32px' }}>
                      {linea.indicadores.map((ind, iIdx) => (
                        <div key={iIdx} style={{
                          padding: 16, marginBottom: 8, borderRadius: 10,
                          background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)',
                        }}>
                          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{ind.nombre}</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                            <InfoPill label="Meta" value={ind.meta} highlight />
                            <InfoPill label="Avance" value={ind.avance || '—'} color={avanceColor(parseNumeric(ind.avance), parseNumeric(ind.meta))} />
                            <InfoPill label="Periodicidad" value={ind.periodicidad} />
                            <InfoPill label="Responsable" value={ind.responsable} />
                            <InfoPill label="Automatizable" value={AUTO_LABELS[ind.automatizable] || ind.automatizable}
                              color={AUTO_COLORS[ind.automatizable]} />
                          </div>
                          {ind.formula && (
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                              <strong>Fórmula:</strong> {ind.formula}
                            </div>
                          )}
                          {ind.medio_verificacion && (
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                              <strong>Verificación:</strong> {ind.medio_verificacion}
                            </div>
                          )}
                          {ind.observacion && (
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic' }}>
                              {ind.observacion}
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
          <SourceNote />
        </>
      )}

      {/* ============= CGE VIEW ============= */}
      {viewMode === 'cge' && (
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>
            <FileText size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Convenio de Gestión Educacional (CGE)
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            Estado de avance de los 5 objetivos del CGE con sus sub-indicadores
          </p>

          {(!cge?.cge || cge.cge.length === 0) ? (
            <EmptyState message="No hay datos CGE cargados para este PAL." />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={thStyle}>Obj.</th>
                    <th style={thStyle}>Indicador</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Meta</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Pond.</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Resultado</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Alcanzado</th>
                    <th style={thStyle}>Observación</th>
                  </tr>
                </thead>
                <tbody>
                  {cge.cge.map((row, i) => {
                    const isHeader = row.sub_indicador === row.indicador_nombre?.split(' - ')[0]?.trim()
                      || !row.sub_indicador?.includes('.');
                    return (
                      <tr key={i} style={{
                        borderBottom: '1px solid var(--border-color)',
                        background: isHeader ? 'rgba(59,130,246,0.04)' : 'transparent',
                        fontWeight: isHeader ? 600 : 400,
                      }}>
                        <td style={tdStyle}>{row.objetivo}</td>
                        <td style={{ ...tdStyle, maxWidth: 350 }}>{row.indicador_nombre}</td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>{row.meta}</td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>{row.ponderacion}</td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                          <SemaforoChip avance={row.resultado_obtenido} meta={row.meta} />
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right', color: row.ponderacion_alcanzada === '0%' ? '#ef4444' : 'var(--text-main)' }}>
                          {row.ponderacion_alcanzada || '—'}
                        </td>
                        <td style={{ ...tdStyle, fontSize: 12, color: 'var(--text-muted)', maxWidth: 280 }}>
                          {row.observacion || ''}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'rgba(239,68,68,0.06)', fontSize: 12, color: 'var(--text-muted)' }}>
            <Info size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            <strong>Nota técnica:</strong> Cuando el resultado ponderado es menor a 70%, la nota técnica del CGE asigna 0% de avance.
            Esto distorsiona la evaluación intermedia pero se presenta según las notas oficiales del indicador.
          </div>
          <SourceNote />
        </div>
      )}

      {/* ============= PME VIEW ============= */}
      {viewMode === 'pme' && (
        <div>
          {pme && pme.total_ee > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, marginBottom: 16 }}>
              <MiniKpi icon={School} label="Establecimientos" value={pme.total_ee} />
              <MiniKpi icon={TrendingUp} label="Promedio cumplimiento" value={`${pme.promedio_cumplimiento}%`}
                color={pme.promedio_cumplimiento >= 60 ? '#10b981' : '#f59e0b'} />
              <MiniKpi icon={CheckCircle} label="EE sobre 70%" value={pme.ee_sobre_70} color="#10b981" />
              <MiniKpi icon={AlertTriangle} label="EE críticos (<30%)" value={pme.ee_criticos} color="#ef4444" />
            </div>
          )}

          <div className="glass-panel" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>
              <School size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
              Avance PME por Establecimiento
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              % de cumplimiento global del PME 2025 — ordenado de mayor a menor avance
            </p>

            {(!pme?.establecimientos || pme.establecimientos.length === 0) ? (
              <EmptyState message="No hay datos PME cargados para este PAL." />
            ) : (
              <>
                {/* Distribution chart */}
                <PmeDistributionChart data={pme.establecimientos} />

                <div style={{ overflowX: 'auto', marginTop: 16 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                        <th style={thStyle}>RBD</th>
                        <th style={thStyle}>Establecimiento</th>
                        <th style={thStyle}>Comuna</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Lid.</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>G.Ped.</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Conv.</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Rec.</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Total</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Cumplimiento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pme.establecimientos.map((ee, i) => {
                        const pct = parseFloat(ee.pct_cumplimiento);
                        const color = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ ...tdStyle, fontSize: 12, color: 'var(--text-muted)' }}>{ee.rbd}</td>
                            <td style={{ ...tdStyle, fontWeight: 500 }}>{ee.nombre_ee}</td>
                            <td style={tdStyle}>{ee.comuna}</td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>{ee.n_acciones_liderazgo}</td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>{ee.n_acciones_gestion_pedagogica}</td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>{ee.n_acciones_convivencia}</td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>{ee.n_acciones_recursos}</td>
                            <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600 }}>{ee.total_acciones}</td>
                            <td style={{ ...tdStyle, textAlign: 'right' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                                <div style={{ width: 60, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3 }} />
                                </div>
                                <span style={{ fontWeight: 700, color, minWidth: 45, textAlign: 'right' }}>{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
          <SourceNote />
        </div>
      )}
    </div>
  );
}

/* ---- Sub-components ---- */

function AvanceResumenChart({ lineas }) {
  const data = lineas.map((l) => {
    const total = l.indicadores.length;
    const conDato = l.indicadores.filter(i => i.avance && i.avance !== 'S/I' && i.avance !== 'N/A').length;
    const cumplidos = l.indicadores.filter(i => {
      const av = parseNumeric(i.avance);
      const mt = parseNumeric(i.meta);
      return av !== null && mt !== null && mt !== 0 && (av / mt) >= 0.9;
    }).length;
    return {
      name: l.nombre,
      total,
      conDato,
      cumplidos,
      pct: total > 0 ? Math.round((cumplidos / total) * 100) : 0,
    };
  });

  return (
    <div className="glass-panel" style={{ padding: 24, marginBottom: 16 }}>
      <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>
        <BarChart3 size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
        Resumen PEL — Indicadores por Objetivo Estratégico
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
          <RTooltip
            contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 12 }}
            formatter={(value, name) => [value, name === 'total' ? 'Total' : name === 'conDato' ? 'Con avance' : 'Cumplidos (≥90%)']}
          />
          <Bar dataKey="total" fill="#475569" radius={[4, 4, 0, 0]} name="Total" />
          <Bar dataKey="conDato" fill="#60a5fa" radius={[4, 4, 0, 0]} name="Con avance" />
          <Bar dataKey="cumplidos" fill="#10b981" radius={[4, 4, 0, 0]} name="Cumplidos" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function AtpCard({ linea, index }) {
  const ind = linea.indicadores[0];
  if (!ind) return null;
  return (
    <div style={{
      padding: 20, marginBottom: 12, borderRadius: 12,
      background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.15)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 6,
            background: 'rgba(59,130,246,0.15)', color: '#60a5fa', marginBottom: 6, display: 'inline-block',
          }}>
            {linea.nombre}
          </span>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>{linea.descripcion}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 12 }}>
        <InfoPill label="Meta" value={ind.meta} highlight />
        <InfoPill label="Periodicidad" value={ind.periodicidad} />
        <InfoPill label="Responsable" value={ind.responsable} />
      </div>
      {ind.observacion && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>
          {ind.observacion}
        </div>
      )}
    </div>
  );
}

function IndicadorMonitorCard({ ind }) {
  const av = parseNumeric(ind.avance);
  const mt = parseNumeric(ind.meta);
  const hasData = av !== null;
  const pct = hasData && mt ? Math.min(Math.round((av / mt) * 100), 150) : 0;
  const color = avanceColor(av, mt);

  return (
    <div style={{
      padding: 16, marginBottom: 8, borderRadius: 10,
      background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{ind.nombre}</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-muted)' }}>
            <span><strong>Meta:</strong> {ind.meta}</span>
            <span><strong>Periodicidad:</strong> {ind.periodicidad}</span>
            <span style={{ color: AUTO_COLORS[ind.automatizable] }}>
              {AUTO_LABELS[ind.automatizable]}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 80 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color }}>
            {hasData ? ind.avance : '—'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {hasData ? `${pct}% de meta` : 'Sin dato'}
          </div>
        </div>
      </div>

      {hasData && (
        <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, marginTop: 10, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
        </div>
      )}

      {ind.observacion && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>
          {ind.observacion}
        </div>
      )}
    </div>
  );
}

function PmeDistributionChart({ data }) {
  const ranges = [
    { label: '0-29%', min: 0, max: 29, color: '#ef4444' },
    { label: '30-49%', min: 30, max: 49, color: '#f97316' },
    { label: '50-69%', min: 50, max: 69, color: '#f59e0b' },
    { label: '70-84%', min: 70, max: 84, color: '#10b981' },
    { label: '85-100%', min: 85, max: 100, color: '#059669' },
  ];
  const chartData = ranges.map(r => ({
    name: r.label,
    count: data.filter(ee => {
      const p = parseFloat(ee.pct_cumplimiento);
      return p >= r.min && p <= r.max;
    }).length,
    fill: r.color,
  }));

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
        Distribución de cumplimiento PME
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} barSize={36}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} allowDecimals={false} />
          <RTooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 12 }} />
          <Bar dataKey="count" name="Establecimientos" radius={[4, 4, 0, 0]}>
            {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
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
        {value || '—'}
      </span>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
      <AlertTriangle size={24} style={{ marginBottom: 8, opacity: 0.5 }} />
      <p style={{ fontSize: 14 }}>{message}</p>
    </div>
  );
}

function SourceNote() {
  return (
    <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7, padding: '16px 0', borderTop: '1px solid var(--border-color)', marginTop: 16 }}>
      <strong>Fuente:</strong> Plan Anual Local extraído del documento oficial del SLEP por Radar de la Educación Pública.
      Los indicadores automatizables se monitorean con datos de MINEDUC/SIGE, Agencia de Calidad y otras fuentes abiertas.
      Los indicadores parciales y manuales requieren actualización directa por el equipo del SLEP. · Tercera Letra SpA
    </div>
  );
}

const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' };
const tdStyle = { padding: '10px 12px', fontSize: 13 };
