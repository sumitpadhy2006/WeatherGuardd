import React, { useState } from 'react';
import {
  Sparkles,
  Eye,
  MapPin,
  Camera,
  Info,
  Layers,
  Compass,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  Globe2
} from 'lucide-react';
import { AuroraForecastData } from '../../types/spaceweather';

interface AuroraForecastMapProps {
  aurora: AuroraForecastData | null;
}

export const AuroraForecastMap: React.FC<AuroraForecastMapProps> = ({ aurora }) => {
  const [activePole, setActivePole] = useState<'north' | 'south'>('north');

  if (!aurora) return null;
  const local = aurora.localObserver;
  const extentLat = activePole === 'north' ? aurora.northernOvalExtentLat : Math.abs(aurora.southernOvalExtentLat);

  const getVisibilityColor = (rating: string) => {
    switch (rating) {
      case 'Guaranteed Visible (Overhead)':
      case 'High Likelihood': return 'text-emerald-400';
      case 'Favorable': return 'text-cyan-400';
      case 'Low Chance': return 'text-amber-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6" id="aurora-forecast-module">
      <div className="bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/10">
              <Sparkles size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Aurora Forecast
              </h3>
              <p className="text-xs text-slate-400">
                Hemispheric power index, auroral oval extent & local probability
              </p>
            </div>
          </div>
        </div>

        {/* 1. AURORA TONIGHT - AT A GLANCE */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-l-2 border-emerald-500 pl-3">Aurora Tonight — At a Glance</h4>
          
          <div className="bg-slate-950/50 rounded-2xl p-5 border border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div className="space-y-1 md:col-span-2 pb-2 border-b border-slate-800/50">
              <span className="text-slate-500 font-mono text-[11px] uppercase">Can I see it?</span>
              <div className="text-lg">
                From Your Location ({local.observerLat.toFixed(1)}°N, {local.observerLon.toFixed(1)}°E): <span className={`font-bold ${getVisibilityColor(local.viewingRating)}`}>{local.viewingRating}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="text-slate-500 font-mono text-[11px] uppercase">Best Time</span>
              <div className="font-bold text-slate-200">{local.bestWindowTonight}</div>
            </div>
            
            <div className="space-y-1">
              <span className="text-slate-500 font-mono text-[11px] uppercase">Best Direction</span>
              <div className="font-bold text-slate-200">{activePole === 'north' ? 'Looking North' : 'Looking South'}</div>
            </div>
            
            <div className="space-y-1">
              <span className="text-slate-500 font-mono text-[11px] uppercase">Current Activity</span>
              <div className={`font-bold ${aurora.auroraActivityLevel === 'Very Low' ? 'text-slate-300' : 'text-amber-400'}`}>
                {aurora.auroraActivityLevel}
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="text-slate-500 font-mono text-[11px] uppercase">Viewing Probability</span>
              <div className="font-bold text-emerald-400">{local.viewingProbabilityPercent}%</div>
            </div>
          </div>
        </div>

        {/* 2. LARGE AURORA VISUAL & POLE SELECTOR */}
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1 font-mono text-xs z-10">
              <button
                onClick={() => setActivePole('north')}
                className={`px-4 py-2 rounded-lg transition-all ${activePole === 'north' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Northern Aurora (Borealis)
              </button>
              <button
                onClick={() => setActivePole('south')}
                className={`px-4 py-2 rounded-lg transition-all ${activePole === 'south' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Southern Aurora (Australis)
              </button>
            </div>
            
            <div className="relative w-full max-w-2xl h-64 sm:h-80 rounded-3xl bg-gradient-to-b from-[#060a14] via-[#0a1628] to-[#040810] border border-slate-800 flex items-center justify-center overflow-hidden shadow-inner">
              {/* Auroral Glow Ring */}
              <div className={`absolute rounded-full border-4 shadow-[0_0_60px_rgba(16,185,129,0.5)] transition-all duration-1000 ${aurora.auroraActivityLevel === 'Very Low' ? 'w-40 h-40 border-emerald-500/40' : 'w-56 h-56 border-emerald-400/80 animate-pulse'}`} />
              <div className="absolute w-64 h-64 rounded-full border border-cyan-400/40 opacity-60" />
              <div className="absolute w-40 h-40 rounded-full border border-rose-400/30 opacity-40" />

              {/* Center Pole */}
              <div className="relative z-10 flex flex-col items-center bg-slate-950/50 p-4 rounded-2xl backdrop-blur-sm border border-slate-800/50">
                <Globe2 size={28} className="text-emerald-400 mb-2 opacity-80" />
                <span className="text-sm font-extrabold text-white tracking-widest">
                  {activePole === 'north' ? 'NORTHERN HEMISPHERE' : 'SOUTHERN HEMISPHERE'}
                </span>
                <span className="text-xs text-emerald-300 font-mono mt-1">
                  Current Oval Edge: ~{extentLat}° Magnetic Latitude
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. YOUR LOCATION & WHEN TO WATCH */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-l-2 border-slate-500 pl-3">Your Location Context</h4>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-3 text-sm h-full">
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                <span className="text-slate-400 font-mono text-[11px] uppercase">Magnetic Latitude</span>
                <span className="font-bold text-emerald-300">{local.geomagneticLat}° Φ</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                <span className="text-slate-400 font-mono text-[11px] uppercase">Visibility</span>
                <span className={`font-bold ${getVisibilityColor(local.viewingRating)}`}>{local.viewingRating}</span>
              </div>
              <div className="space-y-1 pt-1">
                <span className="text-slate-400 font-mono text-[11px] uppercase">Reason</span>
                <p className="text-slate-300 text-xs leading-relaxed">{local.recommendation} (Minimum Kp needed: {local.minKpRequired}, Current: {local.currentKp})</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-l-2 border-slate-500 pl-3">When to Watch</h4>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 h-full">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 relative mt-2">
                <div className="hidden sm:block absolute left-4 right-4 h-0.5 bg-slate-800 top-1/2 -translate-y-1/2 z-0"></div>
                
                <div className="flex flex-col items-center relative z-10 bg-slate-950 px-2">
                  <span className="text-[10px] font-mono text-slate-500 mb-1">NOW</span>
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                </div>
                
                <div className="flex flex-col items-center relative z-10 bg-slate-950 px-2 transform sm:-translate-y-2">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold mb-1">BEST WINDOW</span>
                  <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <span className="text-xs font-bold text-slate-200 mt-1">{local.bestWindowTonight}</span>
                </div>
                
                <div className="flex flex-col items-center relative z-10 bg-slate-950 px-2">
                  <span className="text-[10px] font-mono text-slate-500 mb-1">LATE NIGHT</span>
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                </div>
                
                <div className="flex flex-col items-center relative z-10 bg-slate-950 px-2">
                  <span className="text-[10px] font-mono text-slate-500 mb-1">SUNRISE</span>
                  <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-600"></div>
                </div>
              </div>
              <p className="text-center text-xs text-slate-400 mt-6">
                Note: {local.photographicVsVisual === 'Photographic & Naked Eye' ? 'Aurora may be visible to the naked eye during this window.' : 'Aurora is likely only visible through long-exposure photography.'}
              </p>
            </div>
          </div>
        </div>

        {/* 4. WHERE TO SEE IT & AURORA STRENGTH */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-l-2 border-slate-500 pl-3">Where to See It</h4>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-3 h-full">
              <span className="text-slate-400 font-mono text-[11px] uppercase block">Best Viewing Regions</span>
              <p className="text-sm text-slate-300">
                The aurora oval is currently reaching down to <strong>{extentLat}° Magnetic Latitude</strong>.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {activePole === 'north' 
                  ? 'This generally includes regions like Alaska, Northern Canada, Iceland, Northern Europe, and Northern Asia. Look towards the northern horizon.'
                  : 'This generally includes Antarctica and the southernmost high latitudes. Look towards the southern horizon.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-l-2 border-slate-500 pl-3">Aurora Strength</h4>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 grid grid-cols-2 gap-4 h-full content-center">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Current Kp</span>
                <div className="text-2xl font-bold text-white">{local.currentKp}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Hemispheric Power</span>
                <div className="text-2xl font-bold text-emerald-400">{aurora.hemisphericPowerGW} <span className="text-sm text-emerald-400/70">GW</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. SIMPLE AURORA COLOR GUIDE & WHY? */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-l-2 border-slate-500 pl-3">Why Does This Happen?</h4>
            <div className="bg-slate-950/40 border border-slate-800/50 rounded-2xl p-5 text-sm text-slate-300 leading-relaxed h-full flex items-center">
              Charged particles from the Sun interact with Earth's magnetic field and collide with gases in the upper atmosphere. These collisions release tiny bursts of light, which we see as the glowing aurora.
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-l-2 border-slate-500 pl-3">Aurora Colors</h4>
            <div className="bg-slate-950/40 border border-slate-800/50 rounded-2xl p-4 flex flex-col justify-center gap-3 h-full">
              {aurora.auroraColors.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.hex, boxShadow: `0 0 8px ${c.hex}` }}></div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                    <span className="font-bold text-xs text-slate-200">{c.color}</span>
                    <span className="text-[10px] text-slate-500 font-mono">— {c.emission} ({c.altitudeKm})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6. SCIENTIFIC DETAILS (Advanced) */}
        <div className="pt-6 border-t border-slate-800/50 space-y-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Advanced Scientific Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {aurora.auroraColors.map((colorItem, idx) => (
              <div key={idx} className="bg-slate-950/30 border border-slate-800/50 rounded-xl p-3 space-y-2 relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorItem.hex }} />
                  <span className="text-[11px] font-bold text-slate-300">{colorItem.color}</span>
                </div>
                <div className="space-y-0.5 font-mono text-[9px]">
                  <div className="text-slate-500">Alt: <span className="text-slate-400">{colorItem.altitudeKm}</span></div>
                  <div className="text-slate-500">Src: <span className="text-cyan-400/70">{colorItem.emission}</span></div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-sans">{colorItem.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
