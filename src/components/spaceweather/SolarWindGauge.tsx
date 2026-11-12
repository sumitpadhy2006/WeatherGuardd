import React from 'react';
import {
  Wind,
  Compass,
  Zap,
  Activity,
  AlertTriangle,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { SolarWindData } from '../../types/spaceweather';

interface SolarWindGaugeProps {
  solarWind: SolarWindData | null;
}

export const SolarWindGauge: React.FC<SolarWindGaugeProps> = ({ solarWind }) => {
  if (!solarWind) return null;

  const isSouthward = solarWind.imfBzNt < 0;
  const isHighRisk = solarWind.substormRiskLevel === 'High' || solarWind.substormRiskLevel === 'Critical';

  return (
    <div className="space-y-6" id="solar-wind-module">
      <div className="bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shadow-lg shadow-cyan-500/10">
              <Wind size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Real-Time Solar Wind & Interplanetary Magnetic Field (L1)
              </h3>
              <p className="text-xs text-slate-400">
                DSCOVR / ACE real-time plasma velocity, proton density and IMF Bz orientation (~1.5M km upstream)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${
                isHighRisk
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
              }`}
            >
              <Activity size={13} />
              Substorm Risk: {solarWind.substormRiskLevel}
            </span>
          </div>
        </div>

        {/* 4-Dial Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Bulk Speed */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-2 font-mono relative overflow-hidden">
            <span className="text-[10px] uppercase text-slate-400 block">Solar Wind Speed</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-300">
                {solarWind.bulkSpeedKms}
              </span>
              <span className="text-xs text-slate-400">km/s</span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              {solarWind.bulkSpeedKms > 600 ? 'High-Speed Stream' : solarWind.bulkSpeedKms > 450 ? 'Elevated Stream' : 'Slow Ambient Wind'}
            </span>
          </div>

          {/* Proton Density */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-2 font-mono relative overflow-hidden">
            <span className="text-[10px] uppercase text-slate-400 block">Proton Density</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-cyan-300">
                {solarWind.protonDensityPcm3}
              </span>
              <span className="text-xs text-slate-400">p/cm³</span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              {solarWind.protonDensityPcm3 > 15 ? 'Dense Plasma Filament' : 'Normal Density'}
            </span>
          </div>

          {/* IMF Bz (North/South) */}
          <div
            className={`bg-slate-950/80 border rounded-2xl p-4 space-y-2 font-mono relative overflow-hidden ${
              isSouthward ? 'border-rose-500/50 bg-rose-950/10' : 'border-slate-800/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-slate-400 block">IMF Bz (Polarity)</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  isSouthward ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {isSouthward ? 'Southward' : 'Northward'}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-2xl sm:text-3xl font-extrabold ${
                  isSouthward ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {solarWind.imfBzNt > 0 ? `+${solarWind.imfBzNt}` : solarWind.imfBzNt}
              </span>
              <span className="text-xs text-slate-400">nT</span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              {isSouthward ? '⚠️ Magnetic Reconnection Trigger' : 'Shielding Magnetosphere'}
            </span>
          </div>

          {/* Total IMF Bt & Dynamic Pressure */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-2 font-mono relative overflow-hidden">
            <span className="text-[10px] uppercase text-slate-400 block">Total IMF Bt & Pressure</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-300">
                {solarWind.imfBtNt}
              </span>
              <span className="text-xs text-slate-400">nT</span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              Pressure: <span className="text-slate-200 font-bold">{solarWind.dynamicPressureNpa} nPa</span>
            </span>
          </div>
        </div>

        {/* 24-Hour Solar Wind History Stream Table / Visual Grid */}
        <div className="mt-6 space-y-2">
          <span className="text-[11px] uppercase font-mono font-bold text-slate-400 block">
            Solar Wind Multi-Parameter Telemetry Stream (Past 24 Hours)
          </span>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border border-slate-800/80 rounded-2xl overflow-hidden">
              <thead className="bg-slate-950/90 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Time (UTC)</th>
                  <th className="p-3">Speed (km/s)</th>
                  <th className="p-3">Density (p/cm³)</th>
                  <th className="p-3">IMF Bz (nT)</th>
                  <th className="p-3">Coupling State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/50">
                {solarWind.streamHistory.map((pt, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3 text-slate-300">{pt.time}</td>
                    <td className="p-3 font-bold text-amber-300">{pt.speed} km/s</td>
                    <td className="p-3 text-cyan-300">{pt.density} p/cm³</td>
                    <td className={`p-3 font-bold ${pt.bz < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {pt.bz > 0 ? `+${pt.bz}` : pt.bz} nT
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          pt.bz < -3
                            ? 'bg-rose-500/20 text-rose-300 font-bold'
                            : pt.bz < 0
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {pt.bz < -3 ? 'Strong Influx' : pt.bz < 0 ? 'Coupled' : 'Deflected'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
