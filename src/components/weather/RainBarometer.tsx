import React from 'react';
import { Card } from '../common/Card';
import { CloudRain, CheckCircle2 } from 'lucide-react';

interface RainBarometerProps {
  minutely: { minute: number; intensityMm: number; probability: number }[];
  isRainingNow: boolean;
}

export const RainBarometer: React.FC<RainBarometerProps> = ({ minutely, isRainingNow }) => {
  const hasRainInNextHour = minutely.some((m) => m.probability > 0.2);
  const nextRainMinute = minutely.findIndex((m) => m.probability > 0.3);

  return (
    <Card id="rain-barometer-card" variant="default" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CloudRain size={16} className="text-cyan-400" />
          <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-300">
            60-Minute Precipitation Barometer
          </h2>
        </div>
        <span className="text-xs font-mono text-cyan-400 font-medium">Next Hour Horizon</span>
      </div>

      <div className="text-xs text-slate-300">
        {isRainingNow ? (
          <span className="text-cyan-300 font-medium">
            Precipitation active. Intensity expected to taper within the hour.
          </span>
        ) : hasRainInNextHour && nextRainMinute !== -1 ? (
          <span className="text-amber-300 font-medium">
            Light rain expected starting in approximately {nextRainMinute} minutes.
          </span>
        ) : (
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 size={14} />
            <span>No precipitation expected in the next 60 minutes.</span>
          </div>
        )}
      </div>

      {/* Visual Minute Bars */}
      <div className="pt-2">
        <div className="flex items-end gap-[2px] sm:gap-1 h-12 w-full bg-slate-950/40 p-2 rounded-xl border border-slate-800/60 overflow-hidden">
          {minutely.map((m, idx) => {
            const heightPercent = m.intensityMm > 0 ? Math.min(100, Math.max(15, (m.intensityMm / 3) * 100)) : 4;
            const barColor =
              m.intensityMm > 2
                ? 'bg-blue-400'
                : m.intensityMm > 0.5
                ? 'bg-cyan-400'
                : m.probability > 0.2
                ? 'bg-cyan-600/60'
                : 'bg-slate-700/40';

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col justify-end h-full group relative cursor-pointer"
              >
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-sm transition-all duration-300 ${barColor}`}
                />
              </div>
            );
          })}
        </div>

        <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5 px-1">
          <span>Now</span>
          <span>15m</span>
          <span>30m</span>
          <span>45m</span>
          <span>60m</span>
        </div>
      </div>
    </Card>
  );
};
