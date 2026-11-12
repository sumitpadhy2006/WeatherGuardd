import React from 'react';

interface WeatherGuardLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animate?: boolean;
}

const SIZE_MAP = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

export const WeatherGuardLogo: React.FC<WeatherGuardLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  animate = false,
}) => {
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div
        className={`relative flex items-center justify-center shrink-0 ${sizeClasses} ${
          animate ? 'transition-transform duration-300 hover:scale-105' : ''
        }`}
      >
        <img
          src="/assets/logo.svg"
          alt="WeatherGuard Logo"
          className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]"
          referrerPolicy="no-referrer"
          loading="eager"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-0.5 leading-none">
            <span className="font-bold text-base tracking-tight text-white font-sans">
              WEATHER<span className="text-cyan-400">GUARD</span>
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block mt-0.5">
            Planetary Intelligence
          </span>
        </div>
      )}
    </div>
  );
};
