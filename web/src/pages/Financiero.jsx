import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Wifi } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { financialApi } from '../services/api';
import api from '../services/api';
import KpiCard from '../components/shared/KpiCard';

export default function Financiero() {
  const [execution, setExecution] = useState(null);
  const [orders, setOrders] = useState(null);
  const [liveOrders, setLiveOrders] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([financialApi.execution(), financialApi.mercadoPublico()])
      .then(([ex, ord]) => {
        setExecution(ex.data);
        setOrders(ord.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: 'var(--text-muted)', padding: 40 }}>Cargando datos financieros...</p>;

  const barData = (execution?.por_establecimiento || []).map((e) => ({
    name: e.nombre.length > 18 ? e.nombre.slice(0, 18) + '...' : e.nombre,
    ejecutado: e.pct,
  }));

  const formatCLP = (n) => '$' + (n / 1000000).toFixed(0) + 'M';

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Financiero</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 6 }}>Ejecución presupuestaria y compras públicas</p>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
        Este módulo permite monitorear la ejecución del presupuesto y las órdenes de compra del SLEP en Mercado Público.
        Ayuda a identificar sub-ejecución temprana y verificar que las compras estén alineadas con las prioridades del PAL.
      </div>
      <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '10px 16px', marginBottom: 24, fontSize: 14, color: '#f59e0b' }}>
        ⚠️ <strong>Vista demostración</strong> — Los datos financieros se conectarán con la API de Mercado Público del SLEP. Las cifras mostradas son ilustrativas.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Presupuesto total" value={formatCLP(execution?.presupuesto_total || 0)} icon={DollarSign} />
        <KpiCard label="Ejecutado" value={formatCLP(execution?.ejecutado || 0)} icon={DollarSign} />
        <KpiCard label="% Ejecución" value={execution?.porcentaje_ejecucion || 0} unit="%" icon={DollarSign} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Ejecución por establecimiento */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Ejecución por establecimiento</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData} layout="vertical" barSize={18}>
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={140} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 13 }} formatter={(v) => `${v}%`} />
              <Bar dataKey="ejecutado" fill="var(--accent-primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Órdenes de compra */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
            <ShoppingCart size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Mercado Público - Últimas órdenes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(orders?.ordenes_recientes || []).map((o) => (
              <div key={o.id} style={{
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 10,
                border: '1px solid var(--border-color)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{o.id}</span>
                  <span style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: o.estado === 'Aceptada' ? 'var(--alert-green-bg)' : 'var(--alert-orange-bg)',
                    color: o.estado === 'Aceptada' ? 'var(--alert-green)' : 'var(--alert-orange)',
                  }}>
                    {o.estado}
                  </span>
                </div>
                <div style={{ fontSize: 13 }}>{o.proveedor}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  {o.categoria} &middot; {'$' + o.monto.toLocaleString('es-CL')} &middot; {o.fecha}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mercado Público en vivo */}
      <div className="glass-panel" style={{ padding: 24, marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
            <Wifi size={16} style={{ marginRight: 8, verticalAlign: 'middle', color: 'var(--alert-green)' }} />
            Mercado Público - Consulta en vivo
          </h3>
          <button
            onClick={() => {
              setLiveLoading(true);
              api.get('/financial/mercado-publico-live')
                .then(({ data }) => setLiveOrders(data))
                .catch(() => {})
                .finally(() => setLiveLoading(false));
            }}
            disabled={liveLoading}
            style={{
              padding: '6px 14px', background: 'var(--accent-primary)',
              color: 'white', border: 'none', borderRadius: 8,
              fontSize: 13, cursor: 'pointer', opacity: liveLoading ? 0.7 : 1,
            }}
          >
            {liveLoading ? 'Consultando API...' : 'Consultar ahora'}
          </button>
        </div>

        {liveOrders?.error && (
          <div style={{ padding: 12, background: 'var(--alert-red-bg)', color: 'var(--alert-red)', borderRadius: 8, fontSize: 13 }}>
            {liveOrders.error}
          </div>
        )}

        {liveOrders?.ordenes?.length > 0 && (
          <>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              {liveOrders.total} órdenes encontradas para código {liveOrders.codigo_organismo}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {liveOrders.ordenes.map((o, i) => (
                <div key={i} style={{
                  padding: '12px 14px', background: 'rgba(255,255,255,0.03)',
                  borderRadius: 8, border: '1px solid var(--border-color)',
                }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{o.id}</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>{o.nombre}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    {o.tipo} &middot; {o.estado} &middot; {o.fecha}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!liveOrders && !liveLoading && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Presiona "Consultar ahora" para obtener las órdenes de compra directamente desde la API de Mercado Público.
          </p>
        )}
      </div>
    </div>
  );
}
