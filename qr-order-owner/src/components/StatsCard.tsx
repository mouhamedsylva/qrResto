import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  iconColor: string;   /* hex or css var */
  iconBg: string;      /* hex with opacity, e.g. "#10b98120" */
  animClass?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  label, value, change, trend, icon, iconColor, iconBg, animClass = '',
}) => (
  <div className={`stat-card anim-in ${animClass}`}>
    <div className="stat-card-header">
      <div
        className="stat-icon-wrap"
        style={{ background: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      <div className={`stat-badge ${trend === 'up' ? 'badge-up' : 'badge-down'}`}>
        {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {change}
      </div>
    </div>
    <p className="stat-value">{value}</p>
    <p className="stat-label">{label}</p>
  </div>
);

export default StatsCard;
