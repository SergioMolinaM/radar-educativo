import { useState, useEffect } from 'react';
import { ClipboardCheck, Target, CheckCircle, Clock, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { palApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const AUTO_COLORS = { si: '#10b981', parcial: '#f59e0b', manual: '#94a3b8' };
const AUTO_LABELS = { si: 'Automatizable', parcial: 'Parcial', manual: 'Manual' };

export default function PlanAnual() {
  const { user } = useAuth();
  const [resumen, setResumen] = useState(null);
  const [docs, setDocs] = useState([]);
  const [detail, setDetail] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p style={{ color: 'var(--text-muted)', padding: 40 }}>Cargando Plan Anual Local...</p>;

  const pieData = resumen ? [
    { name: 'Automatizables', value: resumen.automatizables, color: AUTO_COLORS.si },
    { name: 'Parciales', value: resumen.parciales, color: AUTO_COLORS.parcial },
    { name: 'Manuales', value: resumen.manuales, color: AUTO_COLORS.manual },
  ] : [];

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
        <ClipboardCheck size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />
        Plan Anual Local (PAL)
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
        Seguimiento de compromisos e indicadores del PAL
      </p>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        <MiniKpi icon={ClipboardCheck} label="PALs cargados" value={resumen?.total_pals || 0} />
        <MiniKpi icon={Target} label="Líneas estratégicas" value={resumen?.total_lineas || 0} />
        <MiniKpi icon={CheckCircle} label="Indicadores" value={resumen?.total_indicadores || 0} color="var(--accent-primary)" />
        <MiniKpi icon={CheckCircle} label="Automatizables" value={resumen?.automatizables || 0} color="var(--alert-green)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, marginBottom: 24 }}>
        {/* Automatización pie */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Automatización</h3>
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
                  <span key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                    {d.value} {d.name.toLowerCase()}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sin datos de automatización</p>
          )}
        </div>

        {/* PAL Documents list */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Documentos PAL</h3>
          {docs.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
              <AlertTriangle size={24} style={{ marginBottom: 8, opacity: 0.5 }} />
              <p style={{ fontSize: 13 }}>No hay PALs cargados. Sube el PDF del PAL para comenzar el seguimiento.</p>
            </div>
          ) : (
            docs.map((d) => (
              <div key={d.id} onClick={() => loadDetail(d.id)} style={{
                padding: 14, marginBottom: 8, borderRadius: 10,
                background: detail?.documento?.id === d.id ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${detail?.documento?.id === d.id ? 'rgba(59,130,246,0.3)' : 'var(--border-color)'}`,
                cursor: 'pointer',
              }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{d.slep_nombre} - PAL {d.anio}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  {d.acto_administrativo} &middot; {d.n_lineas} líneas &middot; {d.n_indicadores} indicadores
                </div>
                <span style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: 8, marginTop: 6, display: 'inline-block',
                  background: d.estado_extraccion === 'completo' ? 'var(--alert-green-bg)' : 'var(--alert-orange-bg)',
                  color: d.estado_extraccion === 'completo' ? 'var(--alert-green)' : 'var(--alert-orange)',
                }}>
                  {d.estado_extraccion}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail: Lines and Indicators */}
      {detail && (
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
            {detail.documento.slep} - PAL {detail.documento.anio}
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
            {detail.documento.acto_administrativo} &middot; Aprobado: {detail.documento.fecha_aprobacion} &middot; Estado: {detail.documento.estado}
          </p>

          {detail.lineas.map((linea, idx) => (
            <div key={idx} style={{ marginBottom: 8 }}>
              {/* Line header */}
              <button onClick={() => toggleLine(idx)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px', background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-color)', borderRadius: 10,
                color: 'var(--text-main)', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', textAlign: 'left',
              }}>
                {expanded[idx] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span style={{ flex: 1 }}>
                  {idx + 1}. {linea.descripcion || linea.nombre}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
                  {linea.indicadores.length} indicadores
                </span>
              </button>

              {/* Indicators */}
              {expanded[idx] && linea.indicadores.length > 0 && (
                <div style={{ padding: '12px 0 12px 32px' }}>
                  {linea.indicadores.map((ind, iIdx) => (
                    <div key={iIdx} style={{
                      padding: 16, marginBottom: 8, borderRadius: 10,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{ind.nombre}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                        <InfoPill label="Meta" value={ind.meta} highlight />
                        <InfoPill label="Periodicidad" value={ind.periodicidad} />
                        <InfoPill label="Responsable" value={ind.responsable} />
                        <InfoPill label="Automatizable" value={AUTO_LABELS[ind.automatizable] || ind.automatizable}
                          color={AUTO_COLORS[ind.automatizable] || 'var(--text-muted)'} />
                      </div>
                      {ind.medio_verificacion && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                          <strong>Verificación:</strong> {ind.medio_verificacion}
                        </div>
                      )}
                      {ind.observacion && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic' }}>
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
    </div>
  );
}

function MiniKpi({ icon: Icon, label, value, color }) {
  return (
    <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <Icon size={20} style={{ color: color || 'var(--accent-primary)', opacity: 0.7, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
      </div>
    </div>
  );
}

function InfoPill({ label, value, highlight, color }) {
  return (
    <div style={{ fontSize: 12 }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}: </span>
      <span style={{ fontWeight: highlight ? 700 : 600, color: color || (highlight ? 'var(--accent-primary)' : 'var(--text-main)') }}>
        {value || '—'}
      </span>
    </div>
  );
}
