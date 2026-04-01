import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import useCountUp from '../../hooks/useCountUp';
import InfoTooltip from './InfoTooltip';

export default function KpiCard({ label, value, unit, trend, icon: Icon, tooltip, subtitle, detail }) {
  const trendColor = trend > 0 ? 'var(--alert-green)' : trend < 0 ? 'var(--alert-red)' : 'var(--text-muted)';
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const animatedValue = useCountUp(typeof value === 'number' ? value : 0);

  return (
    <div className="glass-panel" style={{ padding: '22px 26px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 15, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          {label}
          {tooltip && <InfoTooltip {...tooltip} />}
        </span>
        {Icon && <Icon size={20} style={{ color: 'var(--accent-primary)', opacity: 0.7 }} />}
      </div>
      <div style={{ fontSize: 34, fontWeight: 700, marginTop: 8 }}>
        {typeof value === 'number' ? animatedValue.toLocaleString('es-CL') : value}
        {unit && <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>{unit}</span>}
      </div>
      {trend !== undefined && typeof trend === 'number' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 14, color: trendColor }}>
          <TrendIcon size={15} />
          {trend > 0 ? '+' : ''}{trend}% vs mes anterior
        </div>
      )}
      {typeof trend === 'string' && (
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{trend}</div>
      )}
      {/* Detail line: e.g. "40 escuelas/liceos + 13 jardines" */}
      {detail && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>{detail}</div>
      )}
      {subtitle && !detail && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, opacity: 0.8 }}>{subtitle}</div>
      )}
    </div>
  );
}
