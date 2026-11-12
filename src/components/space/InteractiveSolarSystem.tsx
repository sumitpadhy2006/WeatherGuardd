import React, { useState } from 'react';
import { PlanetData } from '../../types/astronomy';
import { SolarSystemScene } from '../spaceweather/SolarSystemScene';
import { getPlanetPropagation, PlanetPropagationData } from '../../utils/solarSystemPropagation';
import { Layers, Maximize, Minimize, X, Compass, Eye, Navigation, Orbit, Play, Pause } from 'lucide-react';
import { useFullscreen } from '../../hooks/useFullscreen';

interface InteractiveSolarSystemProps {
  planets: PlanetData[];
}

export const InteractiveSolarSystem: React.FC<InteractiveSolarSystemProps> = ({ planets }) => {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetPropagationData | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);
  
  // Calculate current planetary propagation to match space weather view
  const planetaryPropagation = getPlanetPropagation(null);
  
  const fullPlanetData = planets.find(p => p.id === selectedPlanet?.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shadow-lg shadow-indigo-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Interactive Solar System
          </h3>
          <p className="text-xs text-slate-400">
            Real-time 3D orbital dynamics. Drag to pan, scroll to zoom.
          </p>
        </div>
      </div>

      <div ref={containerRef} className={`relative w-full ${isFullscreen ? 'h-full bg-black' : 'h-[500px] xl:h-[600px]'} bg-black overflow-hidden flex flex-col rounded-3xl border border-slate-800 shadow-2xl`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-900 via-black to-black opacity-90 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40 mix-blend-screen pointer-events-none" />
        
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center justify-center p-2 rounded-xl text-slate-300 bg-slate-800/80 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all backdrop-blur-md shadow-lg"
            title={isPaused ? "Resume Orbits" : "Pause Orbits"}
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="flex items-center justify-center p-2 rounded-xl text-slate-300 bg-slate-800/80 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all backdrop-blur-md shadow-lg"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          </button>
        </div>

        {/* Selected Planet Info Panel Overlay */}
        {selectedPlanet && (
          <div className="absolute bottom-2 sm:bottom-8 left-1/2 -translate-x-1/2 sm:left-auto sm:-translate-x-0 sm:right-6 w-[280px] sm:w-[320px] bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl backdrop-blur-md z-30 animate-in slide-in-from-right-8 fade-in duration-300 overflow-hidden">
            <div className="flex items-center justify-between p-2 sm:p-4 border-b border-slate-800 bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full shadow-lg" style={{ backgroundColor: selectedPlanet.colorHex, boxShadow: `0 0 10px ${selectedPlanet.colorHex}80` }} />
                <h4 className="font-black text-white uppercase tracking-wider text-base">{selectedPlanet.name}</h4>
              </div>
              <button onClick={() => setSelectedPlanet(null)} className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-700">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-3 text-[10px] sm:text-xs font-mono">
              <div className="flex justify-between items-center text-slate-400">
                <span className="flex items-center gap-1.5"><Navigation size={12} className="text-indigo-400" /> Distance to Sun:</span>
                <span className="text-slate-200">{selectedPlanet.distanceAu.toFixed(3)} AU</span>
              </div>
              
              {fullPlanetData ? (
                <>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="flex items-center gap-1.5"><Orbit size={12} className="text-amber-400" /> Distance to Earth:</span>
                    <span className="text-amber-400 font-bold">{fullPlanetData.distanceAu.toFixed(3)} AU</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="flex items-center gap-1.5"><Eye size={12} className="text-cyan-400" /> Visibility:</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      fullPlanetData.status === 'visible_now' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      fullPlanetData.status === 'daytime' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {fullPlanetData.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="flex items-center gap-1.5"><Compass size={12} className="text-purple-400" /> Location:</span>
                    <span className="text-slate-300">{fullPlanetData.constellation}</span>
                  </div>
                </>
              ) : (
                <div className="pt-1.5 sm:pt-2 border-t border-slate-800 text-[9px] sm:text-[10px] text-slate-500 italic">
                  Advanced telemetry available for primary planets only.
                </div>
              )}
            </div>
          </div>
        )}
        
        <SolarSystemScene 
          isActive={false} 
          isPaused={isPaused}
          planetaryPropagation={planetaryPropagation} 
          selectedPlanet={selectedPlanet} 
          setSelectedPlanet={setSelectedPlanet} 
        />
      </div>
    </div>
  );
};
