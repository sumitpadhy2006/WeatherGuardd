import React from 'react';
import {
  Activity,
  Flame,
  Mountain,
  Wind,
  ShieldAlert,
  AlertTriangle,
  Radio,
  Navigation,
} from 'lucide-react';
import { EarthWatchSummaryStats } from '../../types';

interface EarthWatchStatsHeaderProps {
  stats: EarthWatchSummaryStats | null;
  onSelectCategory: (type: 'all' | 'earthquake' | 'wildfire' | 'volcano' | 'cyclone') => void;
  activeType: string;
}

export const EarthWatchStatsHeader: React.FC<EarthWatchStatsHeaderProps> = ({
  stats,
  onSelectCategory,
  activeType,
}) => {
  if (!stats) return null;

  return (
    <section className="space-y-3">
      {/* Nearest Hazard Proximity Warning (if within 1000km) */}
      {stats.nearestEvent && stats.nearestEvent.distanceKm != null && stats.nearestEvent.distanceKm < 1500 && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs sm:text-sm text-amber-200 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldAlert size={18} />
            </div>
            <div>
              <span className="font-bold text-amber-300 uppercase tracking-wider font-mono text-xs block">
                Regional Geological / Atmospheric Advisory
              </span>
              <span className="text-slate-200">
                Nearest event: <strong className="text-white">{stats.nearestEvent.title}</strong> is located{' '}
                <strong className="text-amber-300 font-mono">
                  {stats.nearestEvent.distanceKm.toLocaleString()} km
                </strong>{' '}
                from your active weather station.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4-Card Global Planetary Hazard Telemetry Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Earthquakes */}
        <button
          onClick={() => onSelectCategory('earthquake')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
            activeType === 'earthquake'
              ? 'bg-red-500/10 border-red-500/50 shadow-lg shadow-red-950/30 ring-1 ring-red-500/40'
              : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
              Earthquakes (24h)
            </span>
            <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
              <Activity size={15} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-red-400">
              {stats.earthquakes24h}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              ({stats.significantQuakes} M4.5+)
            </span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            USGS Global Seismic Grid
          </div>
        </button>

        {/* Wildfires */}
        <button
          onClick={() => onSelectCategory('wildfire')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
            activeType === 'wildfire'
              ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500/40'
              : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
              Active Wildfires
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Flame size={15} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-400">
              {stats.activeWildfires}
            </span>
            <span className="text-[11px] font-mono text-slate-400">Thermal Fronts</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            NASA EONET / MODIS VIIRS
          </div>
        </button>

        {/* Volcanoes */}
        <button
          onClick={() => onSelectCategory('volcano')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
            activeType === 'volcano'
              ? 'bg-orange-500/10 border-orange-500/50 shadow-lg shadow-orange-950/30 ring-1 ring-orange-500/40'
              : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
              Volcanic Eruptions
            </span>
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Mountain size={15} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-orange-400">
              {stats.activeVolcanoes}
            </span>
            <span className="text-[11px] font-mono text-slate-400">Plumes & Vents</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            ICAO / Global Volcanism
          </div>
        </button>

        {/* Cyclones */}
        <button
          onClick={() => onSelectCategory('cyclone')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
            activeType === 'cyclone'
              ? 'bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-950/30 ring-1 ring-blue-500/40'
              : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
              Tropical Cyclones
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Wind size={15} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-blue-400">
              {stats.activeCyclones}
            </span>
            <span className="text-[11px] font-mono text-slate-400">Active Vortices</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            JTWC / NOAA NHC Stream
          </div>
        </button>
      </div>
    </section>
  );
};
