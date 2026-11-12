import React, { useState } from 'react';
import { CurrentWeatherPayload, UserRole } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { evaluateLifestyleIndices } from '../../utils/calculations';
import {
  Activity,
  Footprints,
  Plane,
  Camera,
  Car,
  Sprout,
  Moon,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface LifestyleGridProps {
  weather: CurrentWeatherPayload;
  role?: UserRole;
}

export const LifestyleGrid: React.FC<LifestyleGridProps> = ({ weather, role }) => {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const scores = evaluateLifestyleIndices(
    weather.temp,
    weather.humidity,
    weather.windSpeed,
    weather.hourly[0]?.pop || 0,
    weather.airQuality.aqi,
    weather.uvIndex
  );

  const activities = [
    {
      id: 'running',
      icon: <Footprints size={16} className="text-emerald-400" />,
      title: 'Outdoor Running & Cardio',
      status: scores.running.status,
      score: scores.running.score,
      advice: scores.running.advice,
      badgeVariant: (scores.running.status === 'Ideal'
        ? 'emerald'
        : scores.running.status === 'Good'
        ? 'cyan'
        : scores.running.status === 'Fair'
        ? 'amber'
        : 'crimson') as 'emerald' | 'cyan' | 'amber' | 'crimson',
    },
    {
      id: 'drone',
      icon: <Plane size={16} className="text-cyan-400" />,
      title: 'Drone Flight / UAV',
      status: scores.droneFlight.status,
      score: scores.droneFlight.score,
      advice: scores.droneFlight.advice,
      badgeVariant: (scores.droneFlight.status === 'Safe'
        ? 'emerald'
        : scores.droneFlight.status === 'Caution'
        ? 'amber'
        : 'crimson') as 'emerald' | 'cyan' | 'amber' | 'crimson',
    },
    {
      id: 'agriculture',
      icon: <Sprout size={16} className="text-amber-400" />,
      title: 'Agricultural Spraying',
      status: scores.agriculturalSpraying.status,
      score: scores.agriculturalSpraying.score,
      advice: scores.agriculturalSpraying.advice,
      badgeVariant: (scores.agriculturalSpraying.status === 'Favorable'
        ? 'emerald'
        : scores.agriculturalSpraying.status === 'Suboptimal'
        ? 'amber'
        : 'crimson') as 'emerald' | 'cyan' | 'amber' | 'crimson',
    },
    {
      id: 'events',
      icon: <Car size={16} className="text-blue-400" />,
      title: 'Outdoor Gatherings & Events',
      status: scores.outdoorEvents.status,
      score: scores.outdoorEvents.score,
      advice: scores.outdoorEvents.advice,
      badgeVariant: (scores.outdoorEvents.status === 'Excellent'
        ? 'emerald'
        : scores.outdoorEvents.status === 'Good'
        ? 'cyan'
        : 'amber') as 'emerald' | 'cyan' | 'amber' | 'crimson',
    },
    {
      id: 'stargazing',
      icon: <Moon size={16} className="text-indigo-400" />,
      title: 'Stargazing / Night Sky',
      status: weather.celestial?.stargazingRating || 'Good',
      score: weather.celestial?.stargazingScore || 75,
      advice: `Dark sky potential with ${weather.cloudCoverPercent}% cloud obstruction and ${weather.celestial?.moonIlluminationPercent || 0}% lunar glare.`,
      badgeVariant: (weather.celestial?.stargazingScore && weather.celestial.stargazingScore > 75
        ? 'emerald'
        : 'cyan') as 'emerald' | 'cyan' | 'amber' | 'crimson',
    },
    {
      id: 'photography',
      icon: <Camera size={16} className="text-rose-400" />,
      title: 'Outdoor Photography',
      status: weather.cloudCoverPercent > 80 ? 'Diffused' : 'High Contrast',
      score: 85,
      advice: weather.celestial
        ? `Golden hour scheduled for ${weather.celestial.goldenHourEvening}. Color temperature ideal for landscape capture.`
        : 'Balanced ambient lighting conditions.',
      badgeVariant: 'cyan' as 'emerald' | 'cyan' | 'amber' | 'crimson',
    },
  ];

  return (
    <div
      id="lifestyle-grid-card"
      className="rounded-3xl border border-white/12 bg-slate-900/60 backdrop-blur-2xl p-4 sm:p-5 shadow-xl transition-all space-y-3.5"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-cyan-400" />
          <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-200">
            Lifestyle & Operational Feasibility
          </h2>
        </div>
        <span className="text-xs font-mono text-slate-400">6 Activity Assessments</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {activities.map((act) => (
          <button
            key={act.id}
            onClick={() => setSelectedActivity(act.id)}
            className="p-3.5 rounded-2xl bg-slate-950/50 hover:bg-slate-950/80 border border-white/8 hover:border-cyan-500/30 transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {act.icon}
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                    {act.title}
                  </span>
                </div>
                <Badge variant={act.badgeVariant} size="sm">
                  {act.status} ({act.score})
                </Badge>
              </div>
              <p className="mt-2 text-xs text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed line-clamp-2">
                {act.advice}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 group-hover:text-cyan-400 transition-colors border-t border-white/5 pt-2 mt-2.5">
              <span>Feasibility: {act.score}%</span>
              <span className="flex items-center gap-0.5">Details <ChevronRight size={11} /></span>
            </div>
          </button>
        ))}
      </div>

      {/* Modal for detailed activity breakdown */}
      {selectedActivity && (
        <Modal
          isOpen={!!selectedActivity}
          onClose={() => setSelectedActivity(null)}
          title={`Activity Feasibility Assessment`}
          size="md"
        >
          {(() => {
            const act = activities.find((a) => a.id === selectedActivity);
            if (!act) return null;
            return (
              <div className="space-y-4 text-slate-200">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10">
                      {act.icon}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">{act.title}</h4>
                      <span className="text-xs font-mono text-slate-400">Score: {act.score} / 100</span>
                    </div>
                  </div>
                  <Badge variant={act.badgeVariant} size="md">
                    {act.status}
                  </Badge>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/10 text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-cyan-400 block mb-1">Operational Guidance:</span>
                  {act.advice}
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center font-mono text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Temperature</span>
                    <span className="font-bold text-white mt-0.5 block">{weather.temp}°C</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Wind Speed</span>
                    <span className="font-bold text-white mt-0.5 block">{weather.windSpeed} km/h</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/10">
                    <span className="text-[10px] text-slate-400 block">AQI</span>
                    <span className="font-bold text-white mt-0.5 block">{weather.airQuality.aqi}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};
