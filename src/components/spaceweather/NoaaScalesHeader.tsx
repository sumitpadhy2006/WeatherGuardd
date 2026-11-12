import React from 'react';
import {
  Zap,
  Radio,
  ShieldAlert,
  Flame,
  Activity,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';
import { SolarCycleData } from '../../types/spaceweather';

interface NoaaScalesHeaderProps {
  solarCycle: SolarCycleData | null;
  lastUpdated: number;
}

export const NoaaScalesHeader: React.FC<NoaaScalesHeaderProps> = ({ solarCycle, lastUpdated }) => {
  if (!solarCycle) return null;

  const getGScaleColor = (scale: number) => {
    if (scale >= 4) return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
    if (scale >= 2) return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
    if (scale >= 1) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
  };

  const getSScaleColor = (scale: number) => {
    if (scale >= 4) return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
    if (scale >= 2) return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
    if (scale >= 1) return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
  };

  const getRScaleColor = (scale: number) => {
    if (scale >= 4) return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
    if (scale >= 2) return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
    if (scale >= 1) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
  };

  const gScale = solarCycle.currentNoaaScales.geomagneticG;
  const sScale = solarCycle.currentNoaaScales.solarRadiationS;
  const rScale = solarCycle.currentNoaaScales.radioBlackoutR;

  return (
    <div className="space-y-4" id="noaa-scales-banner">
      {/* Top Banner Grid */}
      <div className="bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Title & Cycle Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1.5">
                <Activity size={11} />
                NASA DONKI & NOAA SWPC Real-Time Telemetry
              </span>
              <span className="text-xs font-mono text-slate-400">
                Cycle {solarCycle.cycleNumber} • {solarCycle.solarCyclePhase}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              Space Weather Conditions & Threat Index
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Global magnetospheric disturbances, solar flare radiation bursts, coronal mass ejections and L1 solar wind plasma streams.
            </p>
          </div>

          {/* Solar Cycle 25 Metrics */}
          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 font-mono">
            <div className="text-center px-2">
              <span className="text-[10px] uppercase text-slate-500 block">Sunspots</span>
              <span className="text-lg font-bold text-amber-400">{solarCycle.sunspotCount}</span>
              <span className="text-[9px] text-slate-400 block">Active Disk</span>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            <div className="text-center px-2">
              <span className="text-[10px] uppercase text-slate-500 block">10.7cm Flux</span>
              <span className="text-lg font-bold text-cyan-300">{solarCycle.radioFlux10cmSfu}</span>
              <span className="text-[9px] text-slate-400 block">sfu units</span>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            <div className="text-center px-2">
              <span className="text-[10px] uppercase text-slate-500 block">Active AR</span>
              <span className="text-lg font-bold text-emerald-400">{solarCycle.activeRegions.length}</span>
              <span className="text-[9px] text-slate-400 block">Regions</span>
            </div>
          </div>
        </div>

        {/* NOAA Scales 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/80">
          {/* G-Scale: Geomagnetic Storms */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200">
                <ShieldAlert size={16} className="text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Geomagnetic Storms</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${getGScaleColor(gScale.current)}`}>
                G{gScale.current}
              </span>
            </div>

            <div className="space-y-1 font-mono">
              <div className="text-sm font-bold text-slate-100">{gScale.label}</div>
              <div className="text-[11px] text-slate-400">
                24h Max: <span className="text-amber-300 font-semibold">G{gScale.max24h}</span> • Earth Magnetic Disturbance
              </div>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden flex gap-1">
              {[0, 1, 2, 3, 4, 5].map((lvl) => (
                <div
                  key={lvl}
                  className={`h-full flex-1 rounded-full ${
                    lvl <= gScale.current ? (lvl >= 3 ? 'bg-rose-500' : 'bg-amber-400') : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* S-Scale: Solar Radiation Storms */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200">
                <Flame size={16} className="text-orange-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Solar Radiation Storms</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${getSScaleColor(sScale.current)}`}>
                S{sScale.current}
              </span>
            </div>

            <div className="space-y-1 font-mono">
              <div className="text-sm font-bold text-slate-100">{sScale.label}</div>
              <div className="text-[11px] text-slate-400">
                24h Max: <span className="text-orange-300 font-semibold">S{sScale.max24h}</span> • Energetic &gt;10MeV Protons
              </div>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden flex gap-1">
              {[0, 1, 2, 3, 4, 5].map((lvl) => (
                <div
                  key={lvl}
                  className={`h-full flex-1 rounded-full ${
                    lvl <= sScale.current ? (lvl >= 3 ? 'bg-rose-500' : 'bg-orange-400') : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* R-Scale: Radio Blackouts */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200">
                <Radio size={16} className="text-purple-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Radio Blackouts (HF)</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${getRScaleColor(rScale.current)}`}>
                R{rScale.current}
              </span>
            </div>

            <div className="space-y-1 font-mono">
              <div className="text-sm font-bold text-slate-100">{rScale.label}</div>
              <div className="text-[11px] text-slate-400">
                24h Max: <span className="text-purple-300 font-semibold">R{rScale.max24h}</span> • Solar X-Ray Flux
              </div>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden flex gap-1">
              {[0, 1, 2, 3, 4, 5].map((lvl) => (
                <div
                  key={lvl}
                  className={`h-full flex-1 rounded-full ${
                    lvl <= rScale.current ? (lvl >= 3 ? 'bg-rose-500' : 'bg-purple-400') : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
