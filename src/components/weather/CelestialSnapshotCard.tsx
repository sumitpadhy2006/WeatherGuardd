import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { CelestialSummary } from '../../types';
import { formatTime } from '../../utils/formatters';
import { Sunrise, Sunset, Moon, Sparkles, Camera } from 'lucide-react';

interface CelestialSnapshotCardProps {
  celestial: CelestialSummary;
}

export const CelestialSnapshotCard: React.FC<CelestialSnapshotCardProps> = ({ celestial }) => {
  const durationHours = Math.floor(celestial.daylightDurationSeconds / 3600);
  const durationMinutes = Math.floor((celestial.daylightDurationSeconds % 3600) / 60);

  return (
    <Card id="celestial-snapshot-card" variant="default" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Moon size={16} className="text-indigo-400" />
          <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-300">
            Celestial & Ephemeris
          </h2>
        </div>
        <Badge variant={celestial.stargazingScore > 75 ? 'emerald' : celestial.stargazingScore > 50 ? 'cyan' : 'amber'} size="sm">
          <Sparkles size={11} className="mr-1 inline" />
          Stargazing {celestial.stargazingRating} ({celestial.stargazingScore}%)
        </Badge>
      </div>

      {/* Sunrise / Sunset Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
          <div className="p-2 rounded-lg bg-amber-950/60 text-amber-400">
            <Sunrise size={18} />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block uppercase">Sunrise</span>
            <span className="text-sm font-bold font-mono text-white">
              {formatTime(celestial.sunrise)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
          <div className="p-2 rounded-lg bg-orange-950/60 text-orange-400">
            <Sunset size={18} />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block uppercase">Sunset</span>
            <span className="text-sm font-bold font-mono text-white">
              {formatTime(celestial.sunset)}
            </span>
          </div>
        </div>
      </div>

      {/* Moon & Photography Info */}
      <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Moon Phase:</span>
          <span className="font-mono font-semibold text-slate-200">
            {celestial.moonPhaseName} ({celestial.moonIlluminationPercent}% illuminated)
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Camera size={12} className="text-amber-400" />
            Golden Hour (Eve):
          </span>
          <span className="font-mono text-amber-300 font-medium">
            {celestial.goldenHourEvening}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs border-t border-slate-800/60 pt-2">
          <span className="text-slate-400">Daylight Duration:</span>
          <span className="font-mono text-slate-300">
            {durationHours}h {durationMinutes}m
          </span>
        </div>
      </div>
    </Card>
  );
};
