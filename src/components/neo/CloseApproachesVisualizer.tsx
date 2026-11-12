import React, { useState, useMemo } from 'react';
import {
  Compass,
  Radio,
  Eye,
  Zap,
  Maximize,
  Minimize,
  Maximize2,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  Info,
  Clock,
} from 'lucide-react';
import { NearEarthObject } from '../../types/neo';
import { Neo3DTracker } from './Neo3DTracker';
import { useFullscreen } from '../../hooks/useFullscreen';

interface CloseApproachesVisualizerProps {
  asteroids: NearEarthObject[];
  onSelectAsteroid: (ast: NearEarthObject) => void;
}

export const CloseApproachesVisualizer: React.FC<CloseApproachesVisualizerProps> = ({
  asteroids,
  onSelectAsteroid,
}) => {
  const [maxDistanceFilterLd, setMaxDistanceFilterLd] = useState<number>(15);
  const [selectedOrbitingBody, setSelectedOrbitingBody] = useState<string>('Earth');
  const [focusedAst, setFocusedAst] = useState<NearEarthObject | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);

  // Filter approaches
  const displayedAsteroids = useMemo(() => {
    return asteroids
      .filter((a) => {
        const ld = a.hazardScore.closestMissDistanceLd;
        return ld <= maxDistanceFilterLd;
      })
      .slice(0, 20);
  }, [asteroids, maxDistanceFilterLd]);

  return (
    <div className="space-y-4">
      {/* Visualizer Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Radio size={18} className="text-cyan-400" />
              Planetary Proximity & Close Approach Radar
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Orbital Scale (LD)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Radial spatial map centered on Earth. 1.0 Lunar Distance (LD) = 384,400 km. Geostationary satellite orbit = 0.09 LD (35,786 km).
          </p>
        </div>

        {/* Range and Body Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
            <span className="text-slate-500 text-[11px]">Radar Range:</span>
            <select
              value={maxDistanceFilterLd}
              onChange={(e) => setMaxDistanceFilterLd(Number(e.target.value))}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer text-xs"
            >
              <option value={3} className="bg-slate-900 text-white">3 LD (Close Zone)</option>
              <option value={7} className="bg-slate-900 text-white">7 LD (Medium Range)</option>
              <option value={15} className="bg-slate-900 text-white">15 LD (Wide Sector)</option>
              <option value={30} className="bg-slate-900 text-white">30 LD (Deep NEO)</option>
              <option value={100} className="bg-slate-900 text-white">100 LD (Far Orbit)</option>
              <option value={1000} className="bg-slate-900 text-white">All Tracked Objects</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stacked Layout: Full-Width Radar + Timeline Below */}
      <div className="flex flex-col gap-4">
        {/* Top: Orbital Radar Map (Full Width) */}
        <div ref={containerRef} className={`rounded-2xl bg-slate-950 border border-slate-800/80 relative flex flex-col items-center justify-center overflow-hidden w-full group ${isFullscreen ? 'h-screen fixed inset-0 z-50' : 'h-[500px]'}`}>
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 left-4 z-20 flex items-center justify-center p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-700 backdrop-blur-md shadow-lg"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          </button>

          <Neo3DTracker 
            asteroids={asteroids} 
            onSelectAsteroid={setFocusedAst} 
            maxDistanceFilterLd={maxDistanceFilterLd} 
            focusedAsteroidId={focusedAst?.id}
          />

          {/* In-Canvas Overlay Dashboard */}
          {focusedAst && (
            <div className="absolute top-4 right-4 w-80 bg-slate-950/90 border border-slate-700 rounded-2xl shadow-2xl backdrop-blur-md p-4 animate-in slide-in-from-right-4 fade-in duration-300 z-10 pointer-events-auto">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    {focusedAst.name}
                    {focusedAst.is_potentially_hazardous_asteroid && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">PHA</span>
                    )}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">Asteroid Telemetry</span>
                </div>
                <button 
                  onClick={() => setFocusedAst(null)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Hit Earth?</span>
                  <span className={`text-xs font-bold font-mono ${focusedAst.sentry_data ? 'text-red-400' : 'text-emerald-400'}`}>
                    {focusedAst.sentry_data ? `${focusedAst.sentry_data.impact_probability}% Risk` : '0.00% (No)'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Distance</span>
                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-cyan-400 block">{focusedAst.hazardScore.closestMissDistanceLd} LD</span>
                    <span className="text-[9px] text-slate-500 font-mono">{Math.round(focusedAst.hazardScore.closestMissDistanceKm).toLocaleString()} km</span>
                  </div>
                </div>

                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Date</span>
                  <span className="text-[11px] font-bold font-mono text-white">
                    {focusedAst.close_approach_data[0]?.close_approach_date_full || focusedAst.close_approach_data[0]?.close_approach_date}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Velocity</span>
                  <span className="text-xs font-bold font-mono text-amber-400">{focusedAst.hazardScore.velocityKms} km/s</span>
                </div>

                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Diameter</span>
                  <span className="text-xs font-bold font-mono text-blue-400">~{Math.round(focusedAst.estimated_diameter.meters.estimated_diameter_max)} m</span>
                </div>
              </div>
              
              <button 
                onClick={() => onSelectAsteroid(focusedAst)}
                className="mt-4 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 transition-colors"
              >
                Open Full Analysis
              </button>
            </div>
          )}

          {/* Radar Legend */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-slate-400 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800/60 pointer-events-none z-10 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" /> Potentially Hazardous (PHA)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.5)]" /> Sub-Lunar Flyby (SLF)
              </span>
            </div>
            <span>Drag to rotate • Scroll to zoom • Click rock to inspect</span>
          </div>
        </div>

        {/* Bottom: Close Encounters Timeline List */}
        <div className="space-y-3 mt-4">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Calendar size={14} className="text-cyan-400" />
              Upcoming Trajectory Timeline ({displayedAsteroids.length})
            </span>
            <span className="text-[10px] font-mono text-slate-400">Next Closest Encounters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayedAsteroids.map((ast) => {
              const closeApproach = ast.close_approach_data[0];
              const distLd = ast.hazardScore.closestMissDistanceLd;
              const isSubLunar = distLd < 1.0;
              const isHaz = ast.is_potentially_hazardous_asteroid;

              return (
                <div
                  key={ast.id}
                  onClick={() => setFocusedAst(ast)}
                  className="p-3.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/70 hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col justify-between group gap-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {ast.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 mt-1">
                        {closeApproach?.close_approach_date || 'Upcoming'} • {ast.hazardScore.velocityKms} km/s
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {isHaz && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
                          PHA
                        </span>
                      )}
                      {isSubLunar && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          SLF
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-end justify-between border-t border-slate-800 pt-2">
                    <span className="text-[10px] font-mono text-slate-500">
                      Ø {Math.round(ast.estimated_diameter.meters.estimated_diameter_max)}m
                    </span>
                    <div className="text-right">
                      <div className={`text-xs font-bold font-mono ${isSubLunar ? 'text-amber-400' : 'text-cyan-400'}`}>
                        {distLd} LD
                      </div>
                      <div className="text-[9px] font-mono text-slate-500">
                        {Math.round(ast.hazardScore.closestMissDistanceKm).toLocaleString()} km
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
