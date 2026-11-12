import React, { useEffect, useState, useRef } from 'react';
import { Activity, Map, AlertTriangle, Clock, ArrowUpRight, Compass, Info, X, Maximize, Minimize } from 'lucide-react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { SolarFlareItem, SolarCycleData, CmeItem } from '../../types/spaceweather';
import { GeoLocationItem } from '../../types';
import { getPotentiallyAffectedRegions } from '../../utils/solarFlareImpact';
import { getPlanetPropagation, PlanetPropagationData, formatTravelTime } from '../../utils/solarSystemPropagation';
import { SolarSystemScene } from './SolarSystemScene';

interface SolarFlareHeroProps {
  latestFlare: SolarFlareItem | null;
  solarCycle: SolarCycleData | null;
  currentLocation: GeoLocationItem | null;
  relatedCme?: CmeItem;
  onSwitchToCme: () => void;
}

export const SolarFlareHero: React.FC<SolarFlareHeroProps> = ({
  latestFlare,
  solarCycle,
  currentLocation,
  relatedCme,
  onSwitchToCme,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [flareClass, setFlareClass] = useState<string>('B');
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetPropagationData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);

  // Time-based animation tracking for radiation propagation
  const animationStartTime = useRef(Date.now());

  useEffect(() => {
    if (latestFlare) {
      const upper = latestFlare.classType.toUpperCase();
      if (upper.startsWith('X') || upper.startsWith('M')) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
      setFlareClass(upper.charAt(0));
    }
    // Reset animation clock when flare updates
    animationStartTime.current = Date.now();
  }, [latestFlare]);

  // Determine affected regions based on latest flare time
  const affectedRegions = getPotentiallyAffectedRegions(latestFlare?.peakTime || null);

  // Get active region forecast
  const mostActiveRegion = solarCycle?.activeRegions.sort((a, b) => b.flareProbabilityX - a.flareProbabilityX)[0];

  // Calculate propagation for the Solar System
  const planetaryPropagation = getPlanetPropagation(latestFlare?.peakTime);
  const earthPropagation = planetaryPropagation.find(p => p.id === 'earth');

  const formatUtc = (isoStr: string | null | undefined) => {
    if (!isoStr) return '--';
    return new Date(isoStr).toUTCString().slice(5, 22) + ' UTC';
  };

  return (
    <div className="w-full bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden relative mb-6 shadow-2xl flex flex-col">
      
      {/* LEFT: Solar System Visualization Area */}
      <div ref={containerRef} className={`relative w-full ${isFullscreen ? 'h-screen fixed inset-0 z-50' : 'h-[500px] xl:h-[600px]'} bg-black overflow-hidden flex flex-col`}>
        {/* Deep Space Background Grid / Stars */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-900 via-black to-black opacity-90" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40 mix-blend-screen" />

        {/* Orbit paths & Planets Container */}
        <SolarSystemScene 
          isActive={isActive} 
          planetaryPropagation={planetaryPropagation} 
          selectedPlanet={selectedPlanet} 
          setSelectedPlanet={setSelectedPlanet} 
        />

        {/* Helper Tooltip */}
        <div className="absolute top-4 left-4 sm:left-6 z-10 flex items-center gap-2 px-3 py-2 bg-blue-950/40 border border-blue-500/30 rounded-lg backdrop-blur-md shadow-lg">
          <Info size={14} className="text-blue-400" />
          <span className="text-[10px] font-mono font-medium text-blue-200 uppercase tracking-wider">Tip: Click on any planet to focus & zoom</span>
        </div>

        {/* Top-Right Label */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest border border-slate-800/50 px-2 py-1 rounded bg-slate-950/50 backdrop-blur hidden sm:block">
            Orbital view — Not to scale
          </div>
          <button
            onClick={toggleFullscreen}
            className="flex items-center justify-center p-1.5 rounded bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors border border-slate-800/50 backdrop-blur"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          </button>
        </div>

        {/* Selected Planet Info Panel Overlay */}
        {selectedPlanet && (
          <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 sm:left-auto sm:-translate-x-0 sm:right-8 w-[280px] bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-md z-30 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedPlanet.colorHex }} />
                <h4 className="font-bold text-white uppercase tracking-wider text-sm">{selectedPlanet.name}</h4>
              </div>
              <button onClick={() => setSelectedPlanet(null)} className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-800">
                <X size={14} />
              </button>
            </div>
            
            <div className="p-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-400">
                <span>Distance:</span>
                <span className="text-slate-200">{selectedPlanet.distanceAu.toFixed(3)} AU</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Radiation Travel:</span>
                <span className="text-amber-400 font-bold">{selectedPlanet.travelTimeFormatted}</span>
              </div>
              
              <div className="pt-2 mt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-1">Event Relevance:</span>
                <p className="text-slate-300 font-sans leading-tight">
                  {selectedPlanet.relevance}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Timeline Bar */}
        <div className="absolute bottom-0 inset-x-0 h-14 bg-slate-950/80 backdrop-blur-md border-t border-slate-800/80 flex items-center overflow-x-auto scrollbar-none px-4 gap-4 z-20">
          <div className="flex items-center gap-2 shrink-0 pr-4 border-r border-slate-800">
             <Activity size={14} className="text-amber-500" />
             <div className="flex flex-col">
               <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Flare Peak</span>
               <span className="text-xs text-slate-200 font-mono">{latestFlare?.peakTime ? formatUtc(latestFlare.peakTime) : 'No recent event'}</span>
             </div>
          </div>
          
          <div className="flex items-center gap-6 shrink-0">
            {planetaryPropagation.map(p => (
              <div key={p.id} className="flex flex-col items-center cursor-pointer group" onClick={() => setSelectedPlanet(p)}>
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider group-hover:text-slate-300 transition-colors">{p.name}</span>
                <span className={`text-[10px] font-mono transition-colors ${p.id === 'earth' ? 'text-cyan-400 font-bold' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {p.arrivalDate ? p.arrivalDate.toUTCString().slice(17, 22) + ' UTC' : `+${p.travelTimeFormatted}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Status Dashboard */}
      <div className="w-full bg-slate-900/90 p-5 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-800">
        
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="text-amber-400" size={18} />
              Solar Flare Status
            </div>
            {/* Active Now Status Badge */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${isActive ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="text-[10px] font-bold font-mono tracking-wider uppercase">
                {isActive ? 'Active Major Flare' : 'No Active Flare'}
              </span>
            </div>
          </h2>

          <div className="space-y-4">
            {/* Latest Flare Info - Full Detail */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2">
                <span className={`text-2xl font-black font-mono opacity-20 ${
                  flareClass === 'X' ? 'text-rose-500' :
                  flareClass === 'M' ? 'text-amber-500' :
                  'text-cyan-500'
                }`}>
                  {latestFlare?.classType || 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Last Detected Flare</span>
                <div className="flex items-end gap-3">
                  <span className={`text-xl font-black font-mono ${
                    flareClass === 'X' ? 'text-rose-400' :
                    flareClass === 'M' ? 'text-amber-400' :
                    'text-cyan-400'
                  }`}>
                    {latestFlare?.classType || 'None'}
                  </span>
                  <span className="text-xs text-slate-300 font-mono mb-1">
                    AR: {latestFlare?.activeRegionNum || 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/50">
                <div>
                  <span className="block text-slate-500 mb-0.5">Begin</span>
                  <span className="text-slate-300">{formatUtc(latestFlare?.beginTime)}</span>
                </div>
                <div>
                  <span className="block text-slate-500 mb-0.5">End</span>
                  <span className="text-slate-300">{formatUtc(latestFlare?.endTime)}</span>
                </div>
                <div className="col-span-2 mt-1">
                  <span className="block text-slate-500 mb-0.5">Peak / Radiation Release</span>
                  <span className="text-amber-400 font-bold">{formatUtc(latestFlare?.peakTime)}</span>
                </div>
              </div>
            </div>

            {/* Most Active Region / Forecast */}
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/50 space-y-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Most Active Region</span>
                <span className="text-[10px] text-cyan-400 font-mono font-bold">AR{mostActiveRegion?.arNumber || 'N/A'}</span>
              </div>
              
              {!mostActiveRegion ? (
                <div className="text-[10px] text-slate-500 font-mono">No active region data available.</div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-mono">M-Class Prob:</span>
                    <span className="text-[10px] font-bold text-amber-400 font-mono">{mostActiveRegion.flareProbabilityM}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-mono">X-Class Prob:</span>
                    <span className="text-[10px] font-bold text-rose-400 font-mono">{mostActiveRegion.flareProbabilityX}%</span>
                  </div>
                  <p className="text-[9px] text-slate-500 pt-1 leading-tight">
                    Potential source of future flare activity. Exact timings cannot be predicted.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Earth Impact section */}
          <div className="h-full">
            <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Map size={12} className="text-cyan-400" />
                Earth Impact & Regions
              </div>
              <span className="text-[9px] font-mono text-cyan-500 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-900/50">
                +{earthPropagation?.travelTimeFormatted} travel
              </span>
            </h3>
            
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/50">
               {affectedRegions.length > 0 && isActive ? (
                 <>
                   <p className="text-[10px] text-amber-300 mb-2 flex items-start gap-1">
                     <AlertTriangle size={10} className="mt-0.5 shrink-0" />
                     Potential space-weather impact possible: HF radio disruption on sunlit side.
                   </p>
                   <div className="flex flex-wrap gap-1.5">
                     {affectedRegions.map(region => (
                       <span key={region.name} className="px-1.5 py-0.5 bg-slate-800 text-[9px] text-slate-300 rounded font-mono border border-slate-700">
                         {region.name}
                       </span>
                     ))}
                   </div>
                 </>
               ) : (
                 <p className="text-[10px] text-slate-500 font-mono py-1 leading-relaxed">
                   No significant direct radiation impact indicated. Earth's atmosphere provides protection to the surface.
                 </p>
               )}
            </div>
          </div>

          {/* Associated CME section */}
          {relatedCme && (
            <div className="h-full">
              <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Compass size={12} className="text-emerald-400" />
                Related CME Detected
              </h3>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/50 flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] font-mono">
                   <span className="text-slate-400">Launch:</span>
                   <span className="text-slate-200">{formatUtc(relatedCme.startTime)}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono">
                   <span className="text-slate-400">Speed:</span>
                   <span className="text-amber-400 font-bold">{relatedCme.speedKms} km/s</span>
                </div>
                <button 
                  onClick={onSwitchToCme}
                  className="mt-2 flex items-center justify-center gap-1.5 w-full py-2 bg-slate-800 hover:bg-slate-700 transition-colors rounded-lg text-[10px] text-slate-200 uppercase font-bold tracking-wider shadow-md"
                >
                  View CME propagation <ArrowUpRight size={10} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
