import React from 'react';

interface MetricDisplayProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'steady';
  className?: string;
}

export const MetricDisplay: React.FC<MetricDisplayProps> = ({
  label,
  value,
  unit,
  subtext,
  icon,
  className = '',
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium tracking-wide uppercase">
        {icon && <span className="text-slate-400">{icon}</span>}
        <span>{label}</span>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-xl sm:text-2xl font-semibold font-mono tracking-tight text-slate-100">
          {value}
        </span>
        {unit && <span className="text-xs sm:text-sm font-medium text-slate-400 font-mono">{unit}</span>}
      </div>
      {subtext && <p className="mt-1 text-xs text-slate-400/90 leading-tight">{subtext}</p>}
    </div>
  );
};
