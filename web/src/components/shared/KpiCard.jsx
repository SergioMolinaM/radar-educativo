import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import useCountUp from '../../hooks/useCountUp';
import InfoTooltip from './InfoTooltip';

export default function KpiCard({ label, value, unit, trend, icon: Icon, tooltip, subtitle, detail }) {
  const trendColor = trend > 0 ? 'var(--alert-green)' : trend < 0 ? 'var(--alert-red)' : 'var(--text-muted)';
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const animatedValue = useCountUp(typeof value === 'number' ? value : 0);

  return (
    <div className="glass-panel" style={{ padding: '12px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          {label}
          {tooltip && <InfoTooltip {...tooltip} />}
        </span>
        {Icon && <Icon size={16} style={{ color: 'var(--accent-primary)', opacity: 0.6 }} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
        <span style={{ fontSize: 24, fontWeight: 700 }}>
          {typeof value === 'number' ? animatedValue.toLocaleString('es-CL') : value}
        </span>
        {unit && <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>{unit}</span>}
        {trend !== undefined && typeof trend === 'number' && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: trendColor, marginLeft: 'auto' }}>
            <TrendIcon size={12} />
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      {typeof trend === 'string' && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{trend}</div>
      )}
      {detail && (
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{detail}</div>
      )}
      {subtitle && !detail && (
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, opacity: 0.8 }}>{subtitle}</div>
      )}
    </div>
  );
}
