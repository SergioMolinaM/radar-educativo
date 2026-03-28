export default function RadarLogo({ size = 32 }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" width={size} height={size} style={{ flexShrink: 0 }}>
      <style>{`
        .radar-ring { animation: radar-pulse 2.5s ease-in-out infinite; transform-origin: center; }
        .radar-ring:nth-child(2) { animation-delay: 0.5s; }
        .radar-ring:nth-child(3) { animation-delay: 1.0s; }
        .radar-sweep { animation: radar-sweep 3s linear infinite; transform-origin: 50% 50%; }
        @keyframes radar-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.9; } }
        @keyframes radar-sweep { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      <circle className="radar-ring" cx="18" cy="18" r="16" stroke="#3b82f6" strokeWidth="0.8" fill="none" />
      <circle className="radar-ring" cx="18" cy="18" r="11" stroke="#3b82f6" strokeWidth="0.8" fill="none" />
      <circle className="radar-ring" cx="18" cy="18" r="6" stroke="#3b82f6" strokeWidth="1" fill="none" />
      <circle cx="18" cy="18" r="2.5" fill="#3b82f6" />
      <line x1="18" y1="2" x2="18" y2="34" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="2 3" />
      <line x1="2" y1="18" x2="34" y2="18" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="2 3" />
      <g className="radar-sweep">
        <line x1="18" y1="18" x2="32" y2="4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="32" cy="4" r="2" fill="#10b981" opacity="0.7" />
      </g>
    </svg>
  );
}
