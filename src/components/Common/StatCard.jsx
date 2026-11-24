import React from 'react';

export default function StatCard({ label, value, icon: Icon, color = 'teal', subtitle }) {
  const colorMap = {
    teal: { bg: 'var(--teal-50)', icon: 'var(--teal-600)', border: 'var(--teal-100)' },
    blue: { bg: 'var(--blue-50)', icon: 'var(--blue-600)', border: '#BFDBFE' },
    amber: { bg: 'var(--amber-50)', icon: 'var(--amber-600)', border: '#FDE68A' },
    emerald: { bg: 'var(--emerald-50)', icon: 'var(--emerald-600)', border: '#A7F3D0' },
    rose: { bg: 'var(--rose-50)', icon: 'var(--rose-600)', border: '#FECDD3' },
    slate: { bg: 'var(--slate-100)', icon: 'var(--slate-600)', border: 'var(--slate-200)' },
  };

  const currentTheme = colorMap[color] || colorMap.teal;

  return (
    <div className="stat-card">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {subtitle && <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.2rem' }}>{subtitle}</div>}
      </div>
      <div
        className="stat-icon-wrapper"
        style={{
          backgroundColor: currentTheme.bg,
          border: `1px solid ${currentTheme.border}`,
          color: currentTheme.icon,
        }}
      >
        {Icon && <Icon size={22} />}
      </div>
    </div>
  );
}
