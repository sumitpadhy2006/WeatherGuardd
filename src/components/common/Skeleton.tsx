import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'rounded' | 'card' | 'glass';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rounded',
  ...props
}) => {
  let shapeClass = 'rounded-xl';
  if (variant === 'circular') shapeClass = 'rounded-full';
  else if (variant === 'rectangular') shapeClass = 'rounded-none';
  else if (variant === 'card') shapeClass = 'rounded-2xl border border-slate-800/80';
  else if (variant === 'glass') shapeClass = 'rounded-2xl border border-white/5 backdrop-blur-md';

  return (
    <div
      className={`relative overflow-hidden bg-slate-900/60 ${shapeClass} ${className}`}
      {...props}
    >
      {/* Shimmering specular wave */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
    </div>
  );
};

export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}> = ({ lines = 3, className = '', lastLineWidth = '60%' }) => {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3.5"
          style={{
            width: i === lines - 1 ? lastLineWidth : '100%',
          }}
        />
      ))}
    </div>
  );
};

export const WeatherDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Hero Card Skeleton */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/70 border border-slate-800/80 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex justify-between items-center pb-5 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <Skeleton className="w-48 h-8 rounded-xl" />
            <Skeleton className="w-16 h-6 rounded-lg" />
          </div>
          <Skeleton className="w-32 h-5 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-8">
          <div className="md:col-span-7 flex items-center gap-6">
            <Skeleton className="w-20 h-20 rounded-2xl shrink-0" />
            <div className="space-y-3">
              <Skeleton className="w-36 h-14 rounded-xl" />
              <Skeleton className="w-48 h-5 rounded-lg" />
              <Skeleton className="w-56 h-4 rounded-lg" />
            </div>
          </div>
          <div className="md:col-span-5">
            <Skeleton className="w-full h-28 rounded-2xl" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-800/60">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Rain Barometer Skeleton */}
      <Skeleton className="h-28 rounded-2xl" />

      {/* Hourly Scroller Skeleton */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="w-36 h-5 rounded-lg" />
          <Skeleton className="w-24 h-4 rounded-lg" />
        </div>
        <div className="flex gap-3 overflow-x-hidden pt-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="w-24 h-32 rounded-xl shrink-0" />
          ))}
        </div>
      </div>

      {/* Grid Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6 space-y-6">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <div className="lg:col-span-6 space-y-6">
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  );
};
