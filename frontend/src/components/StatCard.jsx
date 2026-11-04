import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary' }) => {
  const colorMap = {
    primary: {
      bg: 'var(--primary-light)',
      fg: 'var(--primary-color)',
    },
    success: {
      bg: 'var(--status-success-bg)',
      fg: 'var(--status-success)',
    },
    warning: {
      bg: 'var(--status-warning-bg)',
      fg: 'var(--status-warning)',
    },
    error: {
      bg: 'var(--status-error-bg)',
      fg: 'var(--status-error)',
    },
  };

  const style = colorMap[color] || colorMap.primary;

  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className="stat-card-icon" style={{ backgroundColor: style.bg, color: style.fg }}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="stat-card-value">{value ?? 0}</div>
      {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
    </div>
  );
};

export default StatCard;
