import React from 'react';
import {
  Activity,
  Waves,
  Shield,
  Layers,
  MapPin,
  Clock,
  Compass,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { EarthWatchEvent } from '../../types';

interface EarthquakeSystemProps {
  events: EarthWatchEvent[];
  onSelectEvent: (id: string) => void;
}

export const EarthquakeSystem: React.FC<EarthquakeSystemProps> = ({
  events,
  onSelectEvent,
}) => {
  const earthquakes = events.filter((e) => e.type === 'earthquake');
  const significantQuakes = earthquakes.filter((e) => (e.magnitude || 0) >= 4.5);
  const shallowQuakes = earthquakes.filter((e) => (e.depthKm || 0) <= 30);
  const deepQuakes = earthquakes.filter((e) => (e.depthKm || 0) > 70);

  const highestMagQuake = [...earthquakes].sort(
    (a, b) => (b.magnitude || 0) - (a.magnitude || 0)
  )[0];

  return (
    <div className="space-y-6" id="earthquake-system-panel">
      {/* Top Seismological Diagnostic Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Highest Magnitude Event Card */}
        <div className="bg-slate-900/80 border border-red-500/30 rounded-2xl p-5 space-y-3 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-red-400 font-semibold">
              Peak Seismic Release (24h)
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
              <Activity size={17} />
            </div>
          </div>
          {highestMagQuake ? (
            <div
              className="space-y-1.5 cursor-pointer"
              onClick={() => onSelectEvent(highestMagQuake.id)}
            >
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-red-400">
                  M {highestMagQuake.magnitude?.toFixed(1)}
                </span>
                <span className="text-xs font-mono text-slate-400 uppercase">
                  {highestMagQuake.magType} scale
                </span>
              </div>
              <h4 className="text-sm font-semibold text-slate-100 line-clamp-1">
                {highestMagQuake.place}
              </h4>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 font-mono">
                <span>Depth: {highestMagQuake.depthKm} km</span>
                {highestMagQuake.tsunamiRisk && (
                  <span className="text-red-400 font-bold flex items-center gap-1">
                    <Waves size={13} /> Tsunami Watch
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No major earthquakes recorded in current window.</p>
          )}
        </div>

        {/* Depth Distribution Diagnostic */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Focal Depth Spectrum
            </span>
            <Layers size={17} className="text-cyan-400" />
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Crustal / Shallow (&lt;30 km)</span>
                <span className="text-amber-400 font-bold">{shallowQuakes.length}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (shallowQuakes.length / Math.max(1, earthquakes.length)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Subduction / Deep (&gt;70 km)</span>
                <span className="text-cyan-400 font-bold">{deepQuakes.length}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (deepQuakes.length / Math.max(1, earthquakes.length)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ring of Fire Seismicity Indicator */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 space-y-2.5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Pacific Rim Seismicity
            </span>
            <Compass size={17} className="text-red-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-orange-400">82.4%</span>
            <span className="text-xs text-slate-400">Global seismic moment</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            The Pacific Circum-Belt maintains elevated plate subduction tension along the Kuril-Kamchatka, Japan, and Kermadec Trenches.
          </p>
        </div>
      </div>

      {/* Simulated Live Seismograph Waveform Strip */}
      <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-bold text-slate-200 uppercase tracking-wider">
              USGS Global BroadBand Seismograph Telemetry
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Sampling Rate: 100 Hz / Real-Time</span>
        </div>

        {/* Seismograph Oscilloscope Canvas */}
        <div className="h-20 sm:h-24 bg-[#070B12] rounded-xl border border-slate-800/80 overflow-hidden relative flex items-center px-4">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <svg className="w-full h-full" viewBox="0 0 800 100" preserveAspectRatio="none">
            <path
              d="M 0 50 L 50 50 L 80 48 L 100 52 L 130 50 L 160 49 L 190 51 L 220 50 L 250 42 L 270 65 L 290 20 L 310 85 L 330 10 L 350 90 L 370 25 L 390 75 L 410 35 L 430 65 L 450 45 L 480 55 L 510 49 L 550 51 L 600 50 L 650 50 L 700 49 L 750 51 L 800 50"
              fill="none"
              stroke="#EF4444"
              strokeWidth="1.8"
              className="animate-pulse"
            />
            {/* Horizontal baseline */}
            <line x1="0" y1="50" x2="800" y2="50" stroke="#334155" strokeWidth="0.8" strokeDasharray="4 4" />
          </svg>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Primary (P-Wave) Velocity: 7.8 km/s</span>
          <span>Secondary (S-Wave) Shear Velocity: 4.4 km/s</span>
          <span>Peak Ground Accel (PGA): 0.042g</span>
        </div>
      </div>
    </div>
  );
};
