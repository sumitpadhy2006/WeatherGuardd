import React from 'react';
import { CelestialSummary } from '../../types';
import { Badge } from '../common/Badge';
import { formatTime } from '../../utils/formatters';
import {
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Sparkles,
  Camera,
  ArrowRight,
  Clock,
} from 'lucide-react';

interface SunMoonCardProps {
  celestial: CelestialSummary;
  isDay?: boolean;
  onNavigateTab?: (tab: string) => void;
}

// Realistic moon disc using actual moon image + SVG phase clipping
export const RealMoonDisc: React.FC<{ illumination: number; phaseName: string; size?: number }> = ({
  illumination,
  phaseName,
  size = 80,
}) => {
  const isWaxing = phaseName.includes('Waxing') || phaseName === 'First Quarter';
  const isNew = phaseName === 'New Moon';
  const isFull = phaseName === 'Full Moon';

  const frac = illumination / 100;
  const rx = Math.abs(50 - 100 * frac);
  const sweep = (isWaxing && frac <= 0.5) || (!isWaxing && frac > 0.5) ? 0 : 1;

  return (
    <div
      style={{ width: size, height: size }}
      className="relative shrink-0"
    >
      <svg viewBox="0 0 100 100" width={size} height={size} className="drop-shadow-[0_0_40px_rgba(255,255,255,0.7)]">
        <defs>
          <filter id="moonGlowSMC" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <clipPath id="fullClipSMC">
            <circle cx="50" cy="50" r="48" />
          </clipPath>
          <clipPath id="phaseClipSMC">
            {isFull ? (
              <circle cx="50" cy="50" r="48" />
            ) : isWaxing ? (
              <path d={`M 50 2 A 48 48 0 0 1 50 98 A ${rx} 48 0 0 ${sweep} 50 2`} />
            ) : (
              <path d={`M 50 2 A 48 48 0 0 0 50 98 A ${rx} 48 0 0 ${sweep} 50 2`} />
            )}
          </clipPath>
        </defs>
        {/* Added behind-moon glow to simulate emitting light */}
        <circle cx="50" cy="50" r="46" fill="#fff" opacity="0.1" filter="url(#moonGlowSMC)" />

        {/* Dark moon base (always visible) */}
        <image
          href="https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg"
          x="-6" y="-6" width="112" height="112"
          opacity="0.12"
          clipPath="url(#fullClipSMC)"
        />

        {/* Lit portion clipped to phase shape */}
        {!isNew && (
          <g filter="url(#moonGlowSMC)">
            <image
              href="https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg"
              x="-6" y="-6" width="112" height="112"
              clipPath="url(#phaseClipSMC)"
            />
          </g>
        )}

        {/* Outer ring removed per user request */}
      </svg>
    </div>
  );
};

export const SunMoonCard: React.FC<SunMoonCardProps> = ({
  celestial,
  isDay = true,
  onNavigateTab,
}) => {
  const durationHours = Math.floor(celestial.daylightDurationSeconds / 3600);
  const durationMinutes = Math.floor((celestial.daylightDurationSeconds % 3600) / 60);

  // --- Solar Arc Progress ---
  const nowEpoch = Date.now() / 1000;
  const sunriseEpoch = celestial.sunrise;
  const sunsetEpoch = celestial.sunset;

  let sunProgress = 0.5;
  if (nowEpoch < sunriseEpoch) {
    sunProgress = 0.05;
  } else if (nowEpoch > sunsetEpoch) {
    sunProgress = 0.95;
  } else {
    sunProgress = Math.max(0.05, Math.min(0.95, (nowEpoch - sunriseEpoch) / Math.max(1, sunsetEpoch - sunriseEpoch)));
  }

  // Solar arc position on quadratic bezier: M 20,70 Q 110,10 200,70
  const t = sunProgress;
  const p0x = 20, p0y = 70, p1x = 110, p1y = 10, p2x = 200, p2y = 70;
  const sunX = (1 - t) * (1 - t) * p0x + 2 * (1 - t) * t * p1x + t * t * p2x;
  const sunY = (1 - t) * (1 - t) * p0y + 2 * (1 - t) * t * p1y + t * t * p2y;

  // --- Lunar Arc Progress ---
  const moonriseEpoch = celestial.moonrise;
  const moonsetEpoch = celestial.moonset;

  // Calculate moon duration in hours/minutes
  let moonDurationSeconds = 0;
  let moonProgress = 0.5;
  let moonX = 110, moonY = 10;
  let moonDurationStr = '--h --m';
  let moonriseStr = '--:--';
  let moonsetStr = '--:--';

  if (moonriseEpoch && moonsetEpoch) {
    let diff = moonsetEpoch - moonriseEpoch;
    if (diff < 0) {
      diff = (moonsetEpoch + 86400) - moonriseEpoch;
    }
    moonDurationSeconds = Math.max(0, diff);
    const mDurH = Math.floor(moonDurationSeconds / 3600);
    const mDurM = Math.floor((moonDurationSeconds % 3600) / 60);
    moonDurationStr = `${mDurH}h ${mDurM}m`;
    moonriseStr = formatTime(moonriseEpoch);
    moonsetStr = formatTime(moonsetEpoch);

    if (nowEpoch < moonriseEpoch) {
      moonProgress = 0.05;
    } else if (nowEpoch > moonsetEpoch) {
      moonProgress = 0.95;
    } else {
      moonProgress = Math.max(0.05, Math.min(0.95, (nowEpoch - moonriseEpoch) / Math.max(1, moonsetEpoch - moonriseEpoch)));
    }

    const tm = moonProgress;
    moonX = (1 - tm) * (1 - tm) * p0x + 2 * (1 - tm) * tm * p1x + tm * tm * p2x;
    moonY = (1 - tm) * (1 - tm) * p0y + 2 * (1 - tm) * tm * p1y + tm * tm * p2y;
  }

  // Moonlight brightness label
  const getMoonlightLabel = (illum: number) => {
    if (illum >= 95) return 'Full Moonlight';
    if (illum >= 70) return 'Bright Gibbous';
    if (illum >= 50) return 'Half-Moonlight';
    if (illum >= 25) return 'Crescent Light';
    if (illum >= 5) return 'Faint Crescent';
    return 'No Moonlight';
  };

  return (
    <div
      id="sun-moon-card"
      className="rounded-3xl border border-white/12 bg-slate-900/60 backdrop-blur-2xl p-4 sm:p-5 shadow-xl transition-all space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Sun size={16} className="text-amber-400" />
          <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-200">
            Celestial Ephemeris &amp; Solar Trajectory
          </h2>
        </div>
        <Badge
          variant={celestial.stargazingScore > 75 ? 'emerald' : celestial.stargazingScore > 50 ? 'cyan' : 'amber'}
          size="sm"
        >
          <Sparkles size={11} className="mr-1 inline" />
          Stargazing: {celestial.stargazingRating} ({celestial.stargazingScore}%)
        </Badge>
      </div>

      {/* 3-column grid — items-stretch so all boxes are same height */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">

        {/* ====================================================== */}
        {/* COL 1: SOLAR TRAJECTORY ARC                           */}
        {/* ====================================================== */}
        <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/8 flex flex-col justify-between space-y-3">
          {/* Box header: stacked */}
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
              <Sun size={13} className="text-amber-400" />
              Solar Arc &amp; Daylight
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {durationHours}h {durationMinutes}m Total Light
            </span>
          </div>

          {/* SVG Solar Arc */}
          <div className="relative w-full h-24 flex items-center justify-center">
            <svg viewBox="0 0 220 85" className="w-full h-full overflow-visible">
              <line x1="10" y1="70" x2="210" y2="70" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
              <path d="M 20,70 Q 110,10 200,70" fill="none" stroke="rgba(251,191,36,0.25)" strokeWidth="2.5" strokeLinecap="round" />
              <path
                d="M 20,70 Q 110,10 200,70"
                fill="none"
                stroke="url(#solarGlowGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="220"
                strokeDashoffset={`${Math.max(0, 220 * (1 - sunProgress))}`}
              />
              <defs>
                <linearGradient id="solarGlowGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
              <g transform={`translate(${sunX}, ${sunY})`}>
                <circle cx="0" cy="0" r="8" fill="#fbbf24" className="drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                <circle cx="0" cy="0" r="4" fill="#ffffff" />
              </g>
              <text x="20" y="82" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">Rise</text>
              <text x="200" y="82" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">Set</text>
            </svg>
          </div>

          {/* Sunrise / Sunset Times */}
          <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-2">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Sunrise size={13} className="text-amber-400" />
                <span className="text-[10px] text-slate-400 uppercase font-mono">Sunrise</span>
              </div>
              <span className="text-xs font-bold text-white font-mono block">{formatTime(celestial.sunrise)}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Sunset size={13} className="text-orange-400" />
                <span className="text-[10px] text-slate-400 uppercase font-mono">Sunset</span>
              </div>
              <span className="text-xs font-bold text-white font-mono block">{formatTime(celestial.sunset)}</span>
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* COL 2: LUNAR PHASE & OPTICS (real moon disc)          */}
        {/* ====================================================== */}
        <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/8 flex flex-col justify-between space-y-3">
          {/* Box header: stacked */}
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
              <Moon size={13} className="text-indigo-400" />
              Lunar Phase &amp; Optics
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {celestial.moonIlluminationPercent}% Illuminated
            </span>
          </div>

          {/* Real moon disc centered */}
          <div className="flex flex-col items-center gap-3 py-1">
            <RealMoonDisc
              illumination={celestial.moonIlluminationPercent}
              phaseName={celestial.moonPhaseName}
              size={90}
            />
            <div className="text-center space-y-0.5">
              <h4 className="text-sm font-bold text-white">{celestial.moonPhaseName}</h4>
              <p className="text-xs text-slate-400">
                Lunar disc is {celestial.moonIlluminationPercent}% lit.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono border-t border-white/5 pt-2">
            <Camera size={12} className="text-amber-400" />
            <span>Golden Hour: {celestial.goldenHourEvening}</span>
          </div>
        </div>

        {/* ====================================================== */}
        {/* COL 3: LUNAR DURATION & MOONLIGHT ARC                 */}
        {/* ====================================================== */}
        <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/8 flex flex-col justify-between space-y-3">
          {/* Box header: stacked */}
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock size={13} className="text-slate-400" />
              Lunar Duration &amp; Moonlight
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {moonDurationStr} in Sky
            </span>
          </div>

          {/* SVG Lunar Arc */}
          <div className="relative w-full h-24 flex items-center justify-center">
            <svg viewBox="0 0 220 85" className="w-full h-full overflow-visible">
              <line x1="10" y1="70" x2="210" y2="70" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
              {/* Arc background */}
              <path d="M 20,70 Q 110,10 200,70" fill="none" stroke="rgba(129,140,248,0.2)" strokeWidth="2.5" strokeLinecap="round" />
              {/* Lit portion */}
              <path
                d="M 20,70 Q 110,10 200,70"
                fill="none"
                stroke="url(#moonArcGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="220"
                strokeDashoffset={`${Math.max(0, 220 * (1 - moonProgress))}`}
              />
              <defs>
                <linearGradient id="moonArcGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="50%" stopColor="#c7d2fe" />
                  <stop offset="100%" stopColor="#a5b4fc" />
                </linearGradient>
              </defs>
              {/* Moon marker */}
              {moonriseEpoch && moonsetEpoch && (
                <g transform={`translate(${moonX}, ${moonY})`}>
                  <circle cx="0" cy="0" r="8" fill="#818cf8" opacity="0.9" />
                  <circle cx="0" cy="0" r="4" fill="#e0e7ff" />
                </g>
              )}
              <text x="20" y="82" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">Rise</text>
              <text x="200" y="82" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">Set</text>
            </svg>
          </div>

          {/* Moonrise / Moonset Times */}
          <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-2">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Moon size={12} className="text-indigo-400" />
                <span className="text-[10px] text-slate-400 uppercase font-mono">Moonrise</span>
              </div>
              <span className="text-xs font-bold text-white font-mono block">{moonriseStr}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Moon size={12} className="text-slate-500" />
                <span className="text-[10px] text-slate-400 uppercase font-mono">Moonset</span>
              </div>
              <span className="text-xs font-bold text-white font-mono block">{moonsetStr}</span>
            </div>
          </div>

          {/* Moonlight label */}
          <div className="text-center">
            <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2 py-0.5">
              {getMoonlightLabel(celestial.moonIlluminationPercent)}
            </span>
          </div>

          {/* Navigation */}
          {onNavigateTab && (
            <div className="border-t border-white/5 pt-2 flex justify-end">
              <button
                onClick={() => onNavigateTab('space')}
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Full Astronomical &amp; Space Observatory</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
