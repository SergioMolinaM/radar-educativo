const COLORS = {
  rojo: { bg: 'var(--alert-red-bg)', color: 'var(--alert-red)', label: 'Rojo' },
  naranja: { bg: 'var(--alert-orange-bg)', color: 'var(--alert-orange)', label: 'Naranja' },
  verde: { bg: 'var(--alert-green-bg)', color: 'var(--alert-green)', label: 'Verde' },
};

export default function SemaforoTag({ value, size = 'md' }) {
  const s = COLORS[value] || COLORS.verde;
  const px = size === 'sm' ? '8px 10px' : '6px 14px';
  const fs = size === 'sm' ? 11 : 12;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: px,
      background: s.bg,
      color: s.color,
      borderRadius: 20,
      fontSize: fs,
      fontWeight: 600,
    }}>
      <span style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: s.color,
        boxShadow: `0 0 6px ${s.color}`,
      }} />
      {s.label}
    </span>
  );
}
