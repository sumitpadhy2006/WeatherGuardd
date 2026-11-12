import React from 'react';
import {
  Flame,
  Wind,
  ShieldAlert,
  AlertTriangle,
  Layers,
  Thermometer,
  Trees,
  CheckCircle2,
} from 'lucide-react';
import { EarthWatchEvent } from '../../types';

interface WildfireSystemProps {
  events: EarthWatchEvent[];
  onSelectEvent: (id: string) => void;
}

export const WildfireSystem: React.FC<WildfireSystemProps> = ({
  events,
  onSelectEvent,
}) => {
  const wildfires = events.filter((e) => e.type === 'wildfire');

  const totalAcres = wildfires.reduce((acc, f) => acc + (f.wildfireAcres || 0), 0);
  const avgContainment =
    wildfires.length > 0
      ? Math.round(
          wildfires.reduce((acc, f) => acc + (f.wildfireContainmentPercent || 0), 0) /
            wildfires.length
        )
      : 0;

  return (
    <div className="space-y-6" id="wildfire-system-panel">
      {/* 3-Card Fire Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Active Burn Area */}
        <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 space-y-2.5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
              Total Monitored Burn Footprint
            </span>
            <Flame size={18} className="text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-amber-400">
              {totalAcres.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-slate-400">Acres</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Across {wildfires.length} major satellite-tracked thermal complex perimeters.
          </p>
        </div>

        {/* Global Mean Containment */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 space-y-2.5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Mean Containment Index
            </span>
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-400">
              {avgContainment}%
            </span>
            <span className="text-xs text-slate-400">Perimeter control</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden mt-2">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${avgContainment}%` }}
            />
          </div>
        </div>

        {/* Satellite Thermal Sensors */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 space-y-2.5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Sensor Constellation
            </span>
            <Layers size={18} className="text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-300">MODIS + VIIRS</span>
          </div>
          <p className="text-[11px] text-slate-400">
            375m high-resolution mid-infrared fire radiative power (FRP) sensors with twice-daily orbital passes.
          </p>
        </div>
      </div>
    </div>
  );
};
