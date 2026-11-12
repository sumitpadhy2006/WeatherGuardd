import React from 'react';
import {
  ShieldAlert,
  Compass,
  Zap,
  Maximize2,
  Radio,
  Clock,
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { NeoFeedSummary, NearEarthObject } from '../../types/neo';

interface NeoOverviewBannerProps {
  summary: NeoFeedSummary;
  source: 'live_neows' | 'verified_jpl_horizons';
  onSelectAsteroid: (ast: NearEarthObject) => void;
  onSelectTab: (tab: 'feed' | 'approaches' | 'hazard' | 'sentry' | 'famous') => void;
}

export const NeoOverviewBanner: React.FC<NeoOverviewBannerProps> = ({
  summary,
  source,
  onSelectAsteroid,
  onSelectTab,
}) => {
  const closest = summary.closest_approach_today;
  const largest = summary.largest_asteroid_today;
  const fastest = summary.fastest_asteroid_today;
  const hazardousCount = summary.hazardous_count;
  const totalCount = summary.element_count;

  return (
    <div className="space-y-4">
      {/* Top Banner Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-cyan-950/40 border border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Radio size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Near Earth Objects (NEO) Radar
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                NASA NeoWs + JPL Horizons
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live orbital trajectory surveillance, close approach monitoring & planetary defense hazard assessment.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Feed: {totalCount} Tracked</span>
          </div>

          {hazardousCount > 0 ? (
            <button
              onClick={() => onSelectTab('hazard')}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-medium text-amber-400 flex items-center gap-1.5 hover:bg-amber-500/20 transition-colors"
            >
              <AlertTriangle size={14} />
              <span>{hazardousCount} PHA Alert{hazardousCount > 1 ? 's' : ''}</span>
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-400 flex items-center gap-1.5">
              <span>0 Immediate Threats</span>
            </div>
          )}

          <div className="px-2.5 py-1.5 rounded-xl bg-slate-950/40 border border-slate-800/80 text-[11px] font-mono text-slate-400">
            {source === 'live_neows' ? '⚡ Live NASA Feed' : '🛰️ JPL Horizons Ephemeris'}
          </div>
        </div>
      </div>

      {/* 4 Metric Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Closest Approach */}
        {closest && (
          <div
            onClick={() => onSelectAsteroid(closest)}
            className="group relative p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer shadow-lg hover:shadow-cyan-500/5"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                <Compass size={14} />
                Closest Flyby
              </span>
              <span className="font-mono text-[10px] bg-slate-800/80 px-2 py-0.5 rounded text-slate-300">
                {closest.hazardScore.closestMissDistanceLd < 1.0 ? '⚠️ Sub-Lunar' : `${closest.hazardScore.closestMissDistanceLd} LD`}
              </span>
            </div>

            <div className="text-base font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
              {closest.name}
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-black font-mono tracking-tight text-cyan-400">
                {closest.hazardScore.closestMissDistanceLd}
              </span>
              <span className="text-xs text-slate-400 font-mono">LD ({Math.round(closest.hazardScore.closestMissDistanceKm).toLocaleString()} km)</span>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-slate-500" />
                {closest.close_approach_data[0]?.close_approach_date || 'Today'}
              </span>
              <span className="text-cyan-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                Inspect <ArrowUpRight size={12} />
              </span>
            </div>
          </div>
        )}

        {/* Card 2: Largest Diameter */}
        {largest && (
          <div
            onClick={() => onSelectAsteroid(largest)}
            className="group relative p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-blue-500/40 transition-all cursor-pointer shadow-lg hover:shadow-blue-500/5"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                <Maximize2 size={14} />
                Largest Tracked
              </span>
              <span className="font-mono text-[10px] bg-slate-800/80 px-2 py-0.5 rounded text-slate-300">
                {largest.hazardScore.comparisonLandmark.name.split('(')[0]}
              </span>
            </div>

            <div className="text-base font-bold text-white truncate group-hover:text-blue-300 transition-colors">
              {largest.name}
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-black font-mono tracking-tight text-blue-400">
                Ø {Math.round(largest.estimated_diameter.meters.estimated_diameter_max)}
              </span>
              <span className="text-xs text-slate-400 font-mono">meters</span>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span className="text-slate-400">
                Mag (H): {largest.absolute_magnitude_h.toFixed(1)}
              </span>
              <span className="text-blue-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                Inspect <ArrowUpRight size={12} />
              </span>
            </div>
          </div>
        )}

        {/* Card 3: Fastest Velocity */}
        {fastest && (
          <div
            onClick={() => onSelectAsteroid(fastest)}
            className="group relative p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-amber-500/40 transition-all cursor-pointer shadow-lg hover:shadow-amber-500/5"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <Zap size={14} />
                Fastest Relative Speed
              </span>
              <span className="font-mono text-[10px] bg-slate-800/80 px-2 py-0.5 rounded text-slate-300">
                Mach {Math.round((fastest.hazardScore.velocityKms * 1000) / 343)}
              </span>
            </div>

            <div className="text-base font-bold text-white truncate group-hover:text-amber-300 transition-colors">
              {fastest.name}
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-black font-mono tracking-tight text-amber-400">
                {fastest.hazardScore.velocityKms}
              </span>
              <span className="text-xs text-slate-400 font-mono">km/s ({Math.round(fastest.hazardScore.velocityKms * 3600).toLocaleString()} km/h)</span>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span className="text-slate-400">
                Type: {fastest.spectralType?.split(' ')[0] || 'Asteroid'}
              </span>
              <span className="text-amber-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                Inspect <ArrowUpRight size={12} />
              </span>
            </div>
          </div>
        )}

        {/* Card 4: Sentry Planetary Defense Status */}
        <div
          onClick={() => onSelectTab('sentry')}
          className="group relative p-4 rounded-2xl bg-gradient-to-br from-slate-900/80 to-purple-950/30 hover:to-purple-950/50 border border-slate-800/80 hover:border-purple-500/40 transition-all cursor-pointer shadow-lg hover:shadow-purple-500/5"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 text-purple-400 font-medium">
              <ShieldAlert size={14} />
              Sentry Impact Watch
            </span>
            <span className="font-mono text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded">
              NASA JPL
            </span>
          </div>

          <div className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
            {summary.sentry_risk_count} Monitored Objects
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black font-mono tracking-tight text-purple-400">
              Torino 0 - 1
            </span>
            <span className="text-xs text-slate-400 font-mono">Apophis, Bennu, 2024 YR4</span>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-purple-300">
              Impact Probability Matrix
            </span>
            <span className="text-purple-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Watchlist <ArrowUpRight size={12} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
