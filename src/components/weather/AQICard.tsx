import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { AirQualityData } from '../../types';
import { Wind, Activity } from 'lucide-react';

interface AQICardProps {
  airQuality: AirQualityData;
}

export const AQICard: React.FC<AQICardProps> = ({ airQuality }) => {
  let badgeVariant: 'emerald' | 'amber' | 'crimson' | 'cyan' | 'neutral' = 'emerald';
  let barGradient = 'from-emerald-500 to-emerald-400';

  if (airQuality.aqi > 150) {
    badgeVariant = 'crimson';
    barGradient = 'from-red-500 to-purple-600';
  } else if (airQuality.aqi > 100) {
    badgeVariant = 'amber';
    barGradient = 'from-amber-500 to-red-500';
  } else if (airQuality.aqi > 50) {
    badgeVariant = 'cyan';
    barGradient = 'from-emerald-400 to-amber-400';
  }

  const fillPercent = Math.min(100, Math.max(5, (airQuality.aqi / 300) * 100));

  return (
    <Card id="aqi-card" variant="default" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wind size={16} className="text-emerald-400" />
          <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-300">
            Air Quality Index
          </h2>
        </div>
        <Badge variant={badgeVariant} size="sm">
          {airQuality.category} ({airQuality.aqi})
        </Badge>
      </div>

      {/* Main Bar */}
      <div className="space-y-1.5">
        <div className="h-2.5 w-full bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            style={{ width: `${fillPercent}%` }}
            className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-500`}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>0 (Good)</span>
          <span>50</span>
          <span>100</span>
          <span>150</span>
          <span>300+ (Hazardous)</span>
        </div>
      </div>

      {/* Advice */}
      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
        {airQuality.healthRecommendation}
      </p>

      {/* Pollutant Matrix */}
      <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-800/60 text-center font-mono">
        <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/40">
          <span className="text-[10px] text-slate-400 block">PM2.5</span>
          <span className="text-xs font-bold text-slate-200">{airQuality.pm2_5}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/40">
          <span className="text-[10px] text-slate-400 block">PM10</span>
          <span className="text-xs font-bold text-slate-200">{airQuality.pm10}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/40">
          <span className="text-[10px] text-slate-400 block">O₃</span>
          <span className="text-xs font-bold text-slate-200">{airQuality.o3}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/40">
          <span className="text-[10px] text-slate-400 block">NO₂</span>
          <span className="text-xs font-bold text-slate-200">{airQuality.no2}</span>
        </div>
      </div>
    </Card>
  );
};
