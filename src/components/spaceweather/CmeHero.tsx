import React from 'react';
import { Compass, Clock, Map, AlertTriangle, ArrowUpRight, Maximize, Minimize } from 'lucide-react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { CmeItem, SolarFlareItem } from '../../types/spaceweather';
import { CmeSystemScene } from './CmeSystemScene';

interface CmeHeroProps {
  latestCme: CmeItem | null;
  associatedFlare?: SolarFlareItem;
  onSwitchToFlares: () => void;
}

export const CmeHero: React.FC<CmeHeroProps> = ({ latestCme, associatedFlare, onSwitchToFlares }) => {
  const isHalo = latestCme?.type === 'Halo' || latestCme?.type === 'Partial Halo';
  const isEarthDirected = latestCme?.earthImpactProbability.includes('Direct') || latestCme?.earthImpactProbability.includes('Glancing');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);

  return (
    <div className="w-full bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden relative mb-6 shadow-2xl flex flex-col md:flex-row">
      
      {/* LEFT: Visualization Area */}
      <div ref={containerRef} className={`relative w-full ${isFullscreen ? 'h-screen fixed inset-0 z-50 md:w-full' : 'md:w-2/3 h-[400px] md:h-[500px]'} bg-black overflow-hidden flex flex-col`}>
        {/* Deep Space Background Grid / Stars */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black opacity-90" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40 mix-blend-screen" />

        {/* 3D CME System Scene */}
        <CmeSystemScene latestCme={latestCme} />

        {/* Top-Right Label */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest border border-slate-800/50 px-2 py-1 rounded bg-slate-950/50 backdrop-blur pointer-events-none hidden sm:block">
            3D CME Transit View
          </div>
          <button
            onClick={toggleFullscreen}
            className="flex items-center justify-center p-1.5 rounded bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors border border-slate-800/50 backdrop-blur"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          </button>
        </div>
      </div>

      {/* RIGHT: Status Dashboard */}
      <div className="w-full md:w-1/3 bg-slate-900/90 p-5 md:p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800">
        
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 mb-4">
            <Compass className="text-cyan-400" size={18} />
            CME Status
          </h2>

          {!latestCme ? (
            <div className="text-sm text-slate-400 font-mono">No recent CME data available.</div>
          ) : (
            <div className="space-y-4">
              {/* Event Details */}
              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                   <span className="text-[11px] text-slate-400 font-mono">Speed</span>
                   <span className="text-xs font-bold text-amber-400 font-mono">{latestCme.speedKms} km/s</span>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-[11px] text-slate-400 font-mono">Type</span>
                   <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
                     isHalo ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                   }`}>
                     {latestCme.type}
                   </span>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-[11px] text-slate-400 font-mono">Launch</span>
                   <span className="text-[11px] text-slate-300 font-mono">
                     {new Date(latestCme.startTime).toUTCString().slice(17, 22)} UTC
                   </span>
                </div>
              </div>

              {/* Impact / Arrival */}
              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-2">
                <span className="text-xs text-slate-400 font-mono block">Earth Impact Prediction</span>
                
                <div className="flex items-center justify-between">
                   <span className="text-[11px] text-slate-400">Impact:</span>
                   <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                     isEarthDirected ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' : 'text-slate-300'
                   }`}>
                     {latestCme.earthImpactProbability}
                   </span>
                </div>

                <div className="flex justify-between items-center text-[11px]">
                   <span className="text-slate-400">Transit:</span>
                   <span className="text-slate-200">~{latestCme.transitTimeHours}h</span>
                </div>

                <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-800/50">
                   <span className="text-slate-400">Est. Arrival:</span>
                   <span className="text-emerald-400 font-bold font-mono">
                     {new Date(latestCme.estimatedEarthArrival).toUTCString().slice(5, 16)}
                   </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Associated Flare section */}
        {associatedFlare && (
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <AlertTriangle size={12} className="text-amber-400" />
              Associated Solar Flare
            </h3>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/50 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                 <span className="text-xs font-bold text-rose-400 font-mono">{associatedFlare.classType} Class</span>
                 <span className="text-[10px] text-slate-400 font-mono">Peak: {new Date(associatedFlare.peakTime).toUTCString().slice(17, 22)}</span>
              </div>
              <button 
                onClick={onSwitchToFlares}
                className="mt-1 flex items-center justify-center gap-1.5 w-full py-1.5 bg-slate-800 hover:bg-slate-700 transition-colors rounded text-[10px] text-slate-200 uppercase font-bold tracking-wider"
              >
                View Solar Flare <ArrowUpRight size={10} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
