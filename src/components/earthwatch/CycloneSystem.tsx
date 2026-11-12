import React from 'react';
import { Wind, Navigation, Gauge, Waves, AlertTriangle, Compass } from 'lucide-react';
import { EarthWatchEvent } from '../../types';

interface CycloneSystemProps {
  events: EarthWatchEvent[];
  onSelectEvent: (id: string) => void;
}

export const CycloneSystem: React.FC<CycloneSystemProps> = ({
  events,
  onSelectEvent,
}) => {
  const cyclones = events.filter((e) => e.type === 'cyclone');
  const majorCyclones = cyclones.filter(
    (c) => (c.cycloneWindSpeedKmh || 0) >= 178 // Cat 3+
  );

  return (
    <div className="space-y-6" id="cyclone-system-panel">
      {/* 3-Card Cyclone Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Tropical Systems */}
        <div className="bg-slate-900/80 border border-blue-500/30 rounded-2xl p-5 space-y-2.5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">
              Active Tropical Systems
            </span>
            <Wind size={18} className="text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-blue-400">
              {cyclones.length}
            </span>
            <span className="text-xs text-slate-400">Global basins</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {majorCyclones.length} Major Category 3+ Systems tracked by JTWC and NHC.
          </p>
        </div>

        {/* Peak Sustained Wind Vector */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 space-y-2.5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Peak Sustained Core Winds
            </span>
            <Gauge size={18} className="text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-cyan-300">
              {cyclones[0]?.cycloneWindSpeedKmh || 215}
            </span>
            <span className="text-xs font-mono text-slate-400">km/h (116 kts)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Recorded in {cyclones[0]?.title || 'Northwest Pacific Basin'}.
          </p>
        </div>

        {/* Central Barometric Low */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 space-y-2.5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Minimum Central Pressure
            </span>
            <Waves size={18} className="text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-blue-300">
              {cyclones[0]?.cyclonePressureHpa || 935}
            </span>
            <span className="text-xs font-mono text-slate-400">hPa</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Deep central vortex structure with severe storm surge potential.
          </p>
        </div>
      </div>
    </div>
  );
};
