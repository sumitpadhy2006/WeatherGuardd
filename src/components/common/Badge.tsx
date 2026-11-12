import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'crimson' | 'cyan' | 'violet' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
  icon,
}) => {
  const sizeStyles = size === 'sm' ? 'text-xs px-2.5 py-1 gap-1.5' : 'text-sm px-3.5 py-1.5 gap-2';

  let variantStyles = 'bg-slate-800/80 text-slate-300 border border-slate-700/60';

  switch (variant) {
    case 'emerald':
      variantStyles = 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30';
      break;
    case 'amber':
      variantStyles = 'bg-amber-950/60 text-amber-300 border border-amber-500/30';
      break;
    case 'crimson':
      variantStyles = 'bg-red-950/70 text-red-300 border border-red-500/40';
      break;
    case 'cyan':
      variantStyles = 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30';
      break;
    case 'violet':
      variantStyles = 'bg-purple-950/60 text-purple-300 border border-purple-500/30';
      break;
  }

  return (
    <span
      className={`inline-flex items-center justify-center font-medium rounded-full whitespace-nowrap leading-none transition-colors ${sizeStyles} ${variantStyles} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
