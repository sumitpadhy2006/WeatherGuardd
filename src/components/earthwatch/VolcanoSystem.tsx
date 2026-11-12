import React from 'react';
import { Mountain, AlertTriangle, Wind, Compass, Shield, Activity } from 'lucide-react';
import { EarthWatchEvent } from '../../types';

interface VolcanoSystemProps {
  events: EarthWatchEvent[];
  onSelectEvent: (id: string) => void;
}

export const VolcanoSystem: React.FC<VolcanoSystemProps> = ({
  events,
  onSelectEvent,
}) => {
  const volcanoes = events.filter((e) => e.type === 'volcano');
  const redAlerts = volcanoes.filter((v) => v.volcanoAviationColor === 'RED');
  const orangeAlerts = volcanoes.filter((v) => v.volcanoAviationColor === 'ORANGE');

  return (
    <div className="space-y-6" id="volcano-system-panel">
      {/* 3-Card Volcanology Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Volcanic Plumes */}
        <div className="bg-slate-900/80 border border-orange-500/30 rounded-2xl p-5 space-y-2.5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-semibold">
              Active Eruptive Centers
            </span>
            <Mountain size={18} className="text-orange-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-orange-400">
              {volcanoes.length}
            </span>
            <span className="text-xs text-slate-400">Global calderas</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {redAlerts.length} under Aviation Red Alert with active ash emission.
          </p>
        </div>

        {/* Aviation Alert Code Distribution */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 space-y-2.5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              ICAO / VAAC Alert Codes
            </span>
            <Shield size={18} className="text-cyan-400" />
          </div>
          <div className="flex items-center gap-2 pt-1 font-mono text-xs font-bold">
            <span className="px-2.5 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/40">
              RED: {redAlerts.length}
            </span>
            <span className="px-2.5 py-1 rounded bg-orange-500/20 text-orange-400 border border-orange-500/40">
              ORANGE: {orangeAlerts.length}
            </span>
            <span className="px-2.5 py-1 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
              YELLOW: {volcanoes.length - redAlerts.length - orangeAlerts.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Real-time ICAO aviation advisory color codes for commercial flight path avoidance.
          </p>
        </div>

        {/* Ash Dispersion & Gas Telemetry */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 space-y-2.5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Sulfur Dioxide & Ash Radar
            </span>
            <Wind size={18} className="text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-300">Sentinel-5P TROPOMI</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Orbital atmospheric gas column mapping for volcanic SO₂ and sulfate aerosol plumes.
          </p>
        </div>
      </div>
    </div>
  );
};
