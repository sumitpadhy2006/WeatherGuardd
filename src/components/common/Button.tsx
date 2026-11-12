import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-cyan-500/40 select-none';

  let variantStyle = 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 shadow-sm';
  if (variant === 'primary') {
    variantStyle = 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-md shadow-cyan-500/20';
  } else if (variant === 'accent') {
    variantStyle = 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/20';
  } else if (variant === 'ghost') {
    variantStyle = 'bg-transparent hover:bg-slate-800/60 text-slate-300 border border-transparent';
  } else if (variant === 'danger') {
    variantStyle = 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30';
  }

  let sizeStyle = 'px-4 py-2 text-sm gap-2';
  if (size === 'sm') sizeStyle = 'px-3 py-1.5 text-xs gap-1.5';
  if (size === 'lg') sizeStyle = 'px-6 py-3 text-base gap-2.5';
  if (size === 'icon') sizeStyle = 'p-2.5 text-sm aspect-square';

  return (
    <button
      className={`${base} ${variantStyle} ${sizeStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
