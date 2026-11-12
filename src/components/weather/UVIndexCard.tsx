import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { calculateSunBurnTimeMinutes } from '../../utils/calculations';
import { Sun, ShieldAlert, Timer } from 'lucide-react';

interface UVIndexCardProps {
  uvIndex: number;
}

export const UVIndexCard: React.FC<UVIndexCardProps> = ({ uvIndex }) => {
  let level = 'Low';
  let badgeVariant: 'emerald' | 'amber' | 'crimson' | 'cyan' | 'neutral' = 'emerald';
  let advice = 'No protection required for safe outdoor exposure.';

  if (uvIndex >= 11) {
    level = 'Extreme';
    badgeVariant = 'crimson';
    advice = 'Extreme burn risk! Avoid sun between 10 AM - 4 PM. Seek shade and wear SPF 50+.';
  } else if (uvIndex >= 8) {
    level = 'Very High';
    badgeVariant = 'crimson';
    advice = 'Extra protection essential. Hat, sunglasses, and high-factor sunscreen required.';
  } else if (uvIndex >= 6) {
    level = 'High';
    badgeVariant = 'amber';
    advice = 'Sun protection needed during midday hours. Apply SPF 30+ generously.';
  } else if (uvIndex >= 3) {
    level = 'Moderate';
    badgeVariant = 'cyan';
    advice = 'Take care during peak solar noon; seek shade if outdoors for extended periods.';
  }

  const burnTimeType2 = calculateSunBurnTimeMinutes(uvIndex, 2);

  return (
    <Card id="uv-index-card" variant="default" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sun size={16} className="text-amber-400" />
          <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-300">
            UV Index & Radiation
          </h2>
        </div>
        <Badge variant={badgeVariant} size="sm">
          {level} ({uvIndex})
        </Badge>
      </div>

      <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
        <div>
          <span className="text-xs text-slate-400 block">Peak Solar Irradiance</span>
          <span className="text-2xl font-bold font-mono text-white mt-0.5 block">{uvIndex} / 12</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 flex items-center gap-1 justify-end">
            <Timer size={12} className="text-amber-400" />
            Skin Burn Time
          </span>
          <span className="text-sm font-bold font-mono text-amber-300 mt-0.5 block">
            ~{burnTimeType2} mins
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 flex items-start gap-2">
        <ShieldAlert size={14} className="text-amber-400 shrink-0 mt-0.5" />
        <span>{advice}</span>
      </p>
    </Card>
  );
};
