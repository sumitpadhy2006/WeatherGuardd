import React, { useState } from 'react';
import {
  Compass,
  ArrowUpRight,
  Sparkles,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  Gauge,
} from 'lucide-react';
import { motion } from 'motion/react';
import { CmeItem } from '../../types/spaceweather';

interface CmeTrackerProps {
  cmes: CmeItem[];
}

export const CmeTracker: React.FC<CmeTrackerProps> = ({ cmes }) => {
  const [selectedCme, setSelectedCme] = useState<CmeItem | null>(cmes[0] || null);

  const getImpactBadge = (prob: string) => {
    if (prob.includes('Direct')) {
      return 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold animate-pulse';
    }
    if (prob.includes('Glancing')) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold';
    }
    return 'bg-slate-800 text-slate-400 border-slate-700';
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Halo':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/40 font-bold';
      case 'Partial Halo':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/40 font-bold';
      default:
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40';
    }
  };

  return (
    <div className="space-y-6" id="cme-tracker-module">
      <div className="bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shadow-lg shadow-cyan-500/10">
              <Compass size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Coronal Mass Ejections (CME) & ENLIL Cone Tracker
              </h3>
              <p className="text-xs text-slate-400">
                NASA DONKI CME catalog, WSA-ENLIL heliospheric plasma modeling & interplanetary shock arrival forecasts
              </p>
            </div>
          </div>
        </div>

        {/* Visual Heliospheric Trajectory Diagram */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 sm:p-6 mb-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Trajectory Graphic */}
            <div className="flex-1 w-full flex items-center justify-between relative px-4 py-8">
              {/* Grid Background overlay for tech feel */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none rounded-lg" />

              {/* Main Connection track */}
              <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 rounded-full" />
              
              {/* Traveling Plasma Stream */}
              <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 overflow-hidden rounded-full">
                <motion.div 
                  animate={{ x: ['-100%', '300%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="w-1/3 h-full bg-gradient-to-r from-transparent via-amber-500 to-transparent blur-[1px]"
                />
              </div>

              {/* Shockwave Arc Animation */}
              <motion.div
                animate={{ left: ['10%', '90%'], opacity: [0, 1, 0], scale: [0.8, 1.5, 2] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
                className="absolute top-1/2 -translate-y-1/2 w-4 h-16 border-r-2 border-cyan-400 rounded-full blur-[1px] pointer-events-none"
                style={{ marginLeft: '-8px' }}
              />

              {/* Particle trail */}
              <motion.div
                animate={{ left: ['10%', '90%'], opacity: [0, 1, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 0.1 }}
                className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-cyan-300 rounded-full blur-[2px] pointer-events-none shadow-[0_0_10px_rgba(34,211,238,0.8)]"
              />

              {/* Sun Node */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="relative">
                  {/* Solar flare glow */}
                  <div className="absolute inset-0 bg-amber-500 rounded-full blur-md animate-pulse opacity-60" />
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-300 via-orange-500 to-rose-700 flex items-center justify-center relative z-10 border border-orange-400/50 shadow-[0_0_25px_rgba(245,158,11,0.6)]">
                    <span className="text-xs font-black text-white drop-shadow-md">SUN</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider">Corona Ejection</span>
              </div>

              {/* L1 Lagrange Node */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-cyan-500/80 flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    <span className="text-[9px] font-bold font-mono text-cyan-300">L1</span>
                  </div>
                  {/* L1 orbital ring */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-slate-700 rounded-full border-dashed" />
                </div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">DSCOVR / ACE</span>
              </div>

              {/* Earth Node */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="relative group">
                  {/* Magnetosphere shield glow */}
                  <div className="absolute -inset-2 bg-blue-500/20 rounded-full blur-sm border-l-2 border-blue-400/40" />
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 via-indigo-600 to-emerald-600 flex items-center justify-center relative z-10 border border-blue-400/50 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                    <span className="text-[10px] font-black text-white drop-shadow-md">EARTH</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider">Magnetosphere</span>
              </div>
            </div>

            {/* Trajectory Status Panel */}
            {selectedCme && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1.5 font-mono text-xs w-full md:w-64">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Selected:</span>
                  <span className="text-cyan-300 font-bold">{selectedCme.cmeID.slice(0, 16)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Speed:</span>
                  <span className="text-amber-400 font-bold">{selectedCme.speedKms} km/s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Transit Duration:</span>
                  <span className="text-slate-200 font-bold">~{selectedCme.transitTimeHours} hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Est. Arrival:</span>
                  <span className="text-emerald-400 font-bold">
                    {new Date(selectedCme.estimatedEarthArrival).toUTCString().slice(5, 22)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CME Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cmes.map((cme) => {
            const isSelected = selectedCme?.cmeID === cme.cmeID;
            const impactBadge = getImpactBadge(cme.earthImpactProbability);
            const typeBadge = getTypeBadge(cme.type);

            return (
              <div
                key={cme.cmeID}
                onClick={() => setSelectedCme(cme)}
                className={`bg-slate-950/70 border rounded-2xl p-4 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)] bg-slate-900/90'
                    : 'border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        {cme.cmeID.slice(0, 16)}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {cme.sourceLocation} {cme.activeRegionNum ? `(AR${cme.activeRegionNum})` : ''}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${typeBadge}`}>
                      {cme.type}
                    </span>
                  </div>

                  {/* Telemetry Strip */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-900/60 border border-slate-800/60 rounded-xl p-2.5 font-mono text-xs">
                    <div>
                      <span className="text-[9px] uppercase text-slate-500 block">Expansion Speed</span>
                      <span className="font-bold text-amber-300 text-sm">
                        {cme.speedKms} <span className="text-[10px] font-normal text-slate-400">km/s</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase text-slate-500 block">Half-Angle</span>
                      <span className="font-bold text-cyan-300 text-sm">
                        {cme.halfAngleDeg}° <span className="text-[10px] font-normal text-slate-400">cone</span>
                      </span>
                    </div>
                  </div>

                  {/* Impact probability */}
                  <div className="space-y-1 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Earth Impact:</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] border ${impactBadge}`}>
                        {cme.earthImpactProbability}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span className="text-slate-500">Transit:</span>
                      <span>~{cme.transitTimeHours} hours (~{(150000000 / cme.speedKms / 3600).toFixed(0)}h)</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {cme.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">
                    Launch: {new Date(cme.startTime).toUTCString().slice(17, 22)} UTC
                  </span>
                  <span className="text-emerald-400 font-semibold">
                    Shock: {new Date(cme.estimatedEarthArrival).toUTCString().slice(5, 16)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
