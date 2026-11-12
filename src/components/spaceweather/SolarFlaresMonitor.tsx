import React, { useState } from 'react';
import {
  Flame,
  Radio,
  Sparkles,
  Info,
  Clock,
  Layers,
  Activity,
  AlertTriangle,
  Globe,
} from 'lucide-react';
import { SolarFlareItem, ActiveSolarRegion } from '../../types/spaceweather';

interface SolarFlaresMonitorProps {
  flares: SolarFlareItem[];
  activeRegions: ActiveSolarRegion[];
}

export const SolarFlaresMonitor: React.FC<SolarFlaresMonitorProps> = ({ flares, activeRegions }) => {
  const [selectedFlare, setSelectedFlare] = useState<SolarFlareItem | null>(flares[0] || null);

  const getFlareBadge = (classType: string) => {
    const upper = classType.toUpperCase();
    if (upper.startsWith('X')) {
      return 'bg-rose-500/20 text-rose-300 border-rose-500/60 font-extrabold animate-pulse';
    }
    if (upper.startsWith('M')) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold';
    }
    if (upper.startsWith('C')) {
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-medium';
    }
    return 'bg-slate-800 text-slate-400 border-slate-700';
  };

  const getRScaleBadge = (rScale: string) => {
    switch (rScale) {
      case 'R5':
      case 'R4':
      case 'R3':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
      case 'R2':
      case 'R1':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6" id="solar-flares-module">
      <div className="bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shadow-lg shadow-amber-500/10">
              <Flame size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Solar Flares & GOES X-Ray Monitor
              </h3>
              <p className="text-xs text-slate-400">
                NASA DONKI Solar Flare (FLR) catalog, active sunspot magnetic morphology & daylight HF radio absorption
              </p>
            </div>
          </div>
        </div>

        {/* Flare Classification Spectrum Reference */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          <div className="bg-slate-950/80 border border-rose-500/40 rounded-2xl p-3 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400">X-Class</span>
              <span className="text-[10px] text-rose-300 uppercase px-1.5 py-0.5 rounded bg-rose-500/20">
                Major / Extreme
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Flux &gt; 10⁻⁴ W/m²</span>
            <span className="text-[10px] text-slate-500 block">R3–R5 Wide Radio Blackout</span>
          </div>

          <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-3 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">M-Class</span>
              <span className="text-[10px] text-amber-300 uppercase px-1.5 py-0.5 rounded bg-amber-500/20">
                Moderate
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">10⁻⁵ – 10⁻⁴ W/m²</span>
            <span className="text-[10px] text-slate-500 block">R1–R2 Polar Degradation</span>
          </div>

          <div className="bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-3 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400">C-Class</span>
              <span className="text-[10px] text-cyan-300 uppercase px-1.5 py-0.5 rounded bg-cyan-500/20">
                Small / Minor
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">10⁻⁶ – 10⁻⁵ W/m²</span>
            <span className="text-[10px] text-slate-500 block">Minimal Ground Impact</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">B / A-Class</span>
              <span className="text-[10px] text-slate-400 uppercase px-1.5 py-0.5 rounded bg-slate-800">
                Background
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">&lt; 10⁻⁶ W/m²</span>
            <span className="text-[10px] text-slate-500 block">Baseline Solar Emission</span>
          </div>
        </div>

        {/* Flares Catalog & Active Regions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recent Flares Feed */}
          <div className="lg:col-span-7 space-y-3">
            <span className="text-[11px] uppercase font-mono font-bold text-slate-400 block">
              Recent Solar Flare Events (NASA DONKI / GOES-16)
            </span>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {flares.map((flare) => {
                const isSelected = selectedFlare?.flrID === flare.flrID;
                const flareBadge = getFlareBadge(flare.classType);
                const rBadge = getRScaleBadge(flare.radioBlackoutLevel);

                return (
                  <div
                    key={flare.flrID}
                    onClick={() => setSelectedFlare(flare)}
                    className={`bg-slate-950/70 border rounded-2xl p-4 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.2)] bg-slate-900/90'
                        : 'border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono border ${flareBadge}`}>
                            {flare.classType}
                          </span>
                          <span className="text-xs font-mono text-slate-200 font-bold">
                            {flare.sourceLocation || 'Disk'} {flare.activeRegionNum ? `(AR${flare.activeRegionNum})` : ''}
                          </span>
                        </div>

                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono border font-bold ${rBadge}`}>
                          Blackout: {flare.radioBlackoutLevel}
                        </span>
                      </div>

                      {/* Timestamps */}
                      <div className="grid grid-cols-3 gap-1 bg-slate-900/60 border border-slate-800/60 rounded-xl p-2 font-mono text-[10px] text-center">
                        <div>
                          <span className="text-slate-500 block">Begin</span>
                          <span className="text-slate-300">
                            {flare.beginTime ? new Date(flare.beginTime).toUTCString().slice(17, 22) + ' UTC' : '--'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Peak</span>
                          <span className="text-amber-300 font-bold">
                            {flare.peakTime ? new Date(flare.peakTime).toUTCString().slice(17, 22) + ' UTC' : '--'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">End</span>
                          <span className="text-slate-300">
                            {flare.endTime ? new Date(flare.endTime).toUTCString().slice(17, 22) + ' UTC' : '--'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {flare.notes}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Instruments: {flare.instruments.join(', ')}</span>
                      <span className="text-amber-300">
                        {flare.peakFluxWattsM2 ? `${(flare.peakFluxWattsM2 * 1e6).toFixed(1)} µW/m²` : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Sunspot Regions Matrix */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-[11px] uppercase font-mono font-bold text-slate-400 block">
              Active Solar Regions (AR Flare Probability)
            </span>

            <div className="space-y-3">
              {activeRegions.map((ar) => (
                <div
                  key={ar.arNumber}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 space-y-2.5 font-mono"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">AR{ar.arNumber}</span>
                      <span className="text-[10px] text-slate-400">({ar.location})</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-cyan-300">
                      {ar.magType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Sunspot Count:</span>
                    <span className="text-slate-200 font-bold">{ar.sunspotCount} spots</span>
                  </div>

                  {/* Flare Probabilities */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">M-Class Prob</span>
                        <span className="text-amber-400 font-bold">{ar.flareProbabilityM}%</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${ar.flareProbabilityM}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">X-Class Prob</span>
                        <span className="text-rose-400 font-bold">{ar.flareProbabilityX}%</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${ar.flareProbabilityX}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
