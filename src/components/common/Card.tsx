import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glass' | 'accent';
  className?: string;
  id?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  id,
  ...props
}) => {
  // Apple Weather-inspired translucent glass panels that adapt to ambient sky
  let variantStyles =
    'bg-slate-900/60 backdrop-blur-2xl border border-white/12 shadow-xl shadow-black/25 relative before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent';

  if (variant === 'elevated') {
    variantStyles =
      'bg-slate-900/70 backdrop-blur-3xl border border-white/15 shadow-2xl shadow-black/40 relative before:absolute before:inset-x-0 before:top-0 before:h-[1.5px] before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent';
  } else if (variant === 'glass') {
    variantStyles =
      'bg-slate-950/45 backdrop-blur-xl border border-white/8 shadow-lg shadow-black/20 relative before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent';
  } else if (variant === 'accent') {
    variantStyles =
      'bg-gradient-to-br from-cyan-950/40 via-slate-900/65 to-slate-900/75 border border-cyan-500/30 shadow-cyan-950/30 backdrop-blur-2xl relative before:absolute before:inset-x-0 before:top-0 before:h-[1.5px] before:bg-gradient-to-r before:from-transparent before:via-cyan-400/40 before:to-transparent';
  }

  return (
    <div
      id={id}
      className={`rounded-3xl p-5 sm:p-6 transition-all duration-300 overflow-hidden ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
