import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KpiCard({ label, value, unit, trend, icon: Icon }) {
  const trendColor = trend > 0 ? 'var(--alert-green)' : trend < 0 ? 'var(--alert-red)' : 'var(--text-muted)';
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;

  return (
    <div className="glass-panel" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
        {Icon && <Icon size={18} style={{ color: 'var(--accent-primary)', opacity: 0.7 }} />}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>
        {typeof value === 'number' ? value.toLocaleString('es-CL') : value}
        {unit && <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>{unit}</span>}
      </div>
      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 12, color: trendColor }}>
          <TrendIcon size={14} />
          {trend > 0 ? '+' : ''}{trend}% vs mes anterior
        </div>
      )}
    </div>
  );
}
