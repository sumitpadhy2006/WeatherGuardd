import React from 'react';
import {
  Sparkles,
  Eye,
  Cloud,
  Moon,
  Wind,
  Layers,
  CheckCircle2,
  Telescope,
  Camera,
  Info,
} from 'lucide-react';
import { StargazingScore } from '../../types/astronomy';

interface StargazingScoreCardProps {
  score: StargazingScore | null;
}

export const StargazingScoreCard: React.FC<StargazingScoreCardProps> = ({ score }) => {
  if (!score) return null;

  const ratingColors: Record<string, { badge: string; text: string; ring: string }> = {
    Exceptional: {
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
      text: 'text-emerald-400',
      ring: 'stroke-emerald-400',
    },
    Great: {
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
      text: 'text-cyan-400',
      ring: 'stroke-cyan-400',
    },
    Good: {
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50',
      text: 'text-indigo-400',
      ring: 'stroke-indigo-400',
    },
    Fair: {
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      text: 'text-amber-400',
      ring: 'stroke-amber-400',
    },
    Poor: {
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
      text: 'text-rose-400',
      ring: 'stroke-rose-400',
    },
  };

  const currentRating = ratingColors[score.rating] || ratingColors.Good;

  return (
    <div className="space-y-6" id="stargazing-score-module">
      <div className="bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-indigo-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shadow-lg shadow-indigo-500/10">
              <Sparkles size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Stargazing Quality Index ($SQI$)
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${currentRating.badge}`}>
                  {score.rating}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Composite astronomical seeing, dark-sky Bortle rating & atmospheric transparency
              </p>
            </div>
          </div>
        </div>

        {/* Master Score Dial & Diagnostics */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Main Dial */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" stroke="#1E293B" strokeWidth="8" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * score.score) / 100}
                  strokeLinecap="round"
                  className={`${currentRating.ring} transition-all duration-1000`}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`text-3xl font-extrabold font-mono ${currentRating.text}`}>
                  {score.score}
                </span>
                <span className="text-[10px] uppercase font-mono text-slate-500">SQI / 100</span>
              </div>
            </div>

            <div className="mt-2 text-center">
              <span className="text-xs font-bold text-slate-200 block">{score.rating} Viewing Tonight</span>
              <span className="text-[11px] text-slate-400 font-mono">
                NELM: ~{score.limitingMagnitude} Mag Limiting
              </span>
            </div>
          </div>

          {/* Environmental Components */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Dark-Sky Bortle</span>
              <div className="text-lg font-bold font-mono text-cyan-300">
                Class {score.bortleClass}
              </div>
              <span className="text-[10px] text-slate-500 line-clamp-1">
                Rural/suburban transition
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Atmospheric Seeing</span>
              <div className="text-lg font-bold font-mono text-emerald-400">
                {score.seeingIndex}
              </div>
              <span className="text-[10px] text-slate-500">
                Angular resolution
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Transparency</span>
              <div className="text-lg font-bold font-mono text-indigo-300">
                {score.transparencyPercent}%
              </div>
              <span className="text-[10px] text-slate-500">
                Direct aerosol clarity
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Cloud Cover</span>
              <div className="text-lg font-bold font-mono text-slate-200">
                {score.cloudCoverPercent}%
              </div>
              <span className="text-[10px] text-slate-500">
                Sky obscuration
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Moon Glare Wash</span>
              <div className="text-lg font-bold font-mono text-amber-300">
                {score.moonInterferencePercent}%
              </div>
              <span className="text-[10px] text-slate-500">
                Contrast penalty
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Dark Hours</span>
              <div className="text-lg font-bold font-mono text-purple-300">
                7.5 hrs
              </div>
              <span className="text-[10px] text-slate-500">
                Astro darkness
              </span>
            </div>
          </div>
        </div>

        {/* Hourly Stargazing Forecast Strip (Tonight) */}
        <div className="mt-6 space-y-2">
          <span className="text-[11px] uppercase font-mono font-bold text-slate-400 block">
            Tonight’s Hourly Stargazing Window (20:00 – 06:00)
          </span>

          <div className="grid grid-cols-5 sm:grid-cols-11 gap-1.5 overflow-x-auto pb-1">
            {score.hourlyScores.map((h, idx) => (
              <div
                key={idx}
                className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2 text-center font-mono space-y-1 flex-1 min-w-[55px]"
              >
                <span className="text-[10px] text-slate-400 block">{h.hour}</span>
                <span
                  className={`text-xs font-bold block ${
                    h.score >= 80 ? 'text-emerald-400' : h.score >= 60 ? 'text-cyan-300' : 'text-amber-400'
                  }`}
                >
                  {h.score}
                </span>
                <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${
                      h.score >= 80 ? 'bg-emerald-400' : h.score >= 60 ? 'bg-cyan-400' : 'bg-amber-400'
                    }`}
                    style={{ width: `${h.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optical Equipment Guidance Strip */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs">
              <Eye size={15} className="text-cyan-400" />
              <span>Naked Eye Targets</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {score.recommendations.nakedEye}
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs">
              <Layers size={15} className="text-emerald-400" />
              <span>10x50 Binoculars</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {score.recommendations.binoculars}
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs">
              <Telescope size={15} className="text-indigo-400" />
              <span>8" Telescope</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {score.recommendations.telescope}
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs">
              <Camera size={15} className="text-purple-400" />
              <span>Astrophotography</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {score.recommendations.astrophotography}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
