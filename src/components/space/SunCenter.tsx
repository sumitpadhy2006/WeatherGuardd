import React from 'react';
import {
  Sun,
  Sunrise,
  Sunset,
  Clock,
  Compass,
  Gauge,
  Camera,
  Eye,
  Sparkles,
  Zap,
  Info,
} from 'lucide-react';
import { SunData, PlanetData } from '../../types/astronomy';
import { InteractiveSolarSystem } from './InteractiveSolarSystem';

interface SunCenterProps {
  sun: SunData | null;
  planets: PlanetData[];
}

export const SunCenter: React.FC<SunCenterProps> = ({ sun, planets }) => {
  if (!sun) return null;

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const periodLabel: Record<string, { label: string; color: string; desc: string }> = {
    day: {
      label: 'Full Daylight',
      color: 'text-amber-300 bg-amber-500/20 border-amber-500/40',
      desc: 'Sun is well above horizon with direct atmospheric illumination',
    },
    golden_hour_morning: {
      label: 'Morning Golden Hour',
      color: 'text-amber-400 bg-amber-500/20 border-amber-500/50',
      desc: 'Soft warm specular sunlight ideal for photography and outdoor cinematography',
    },
    golden_hour_evening: {
      label: 'Evening Golden Hour',
      color: 'text-amber-400 bg-amber-500/20 border-amber-500/50',
      desc: 'Long golden shadows with warm, diffused atmospheric Rayleigh scattering',
    },
    blue_hour_morning: {
      label: 'Morning Blue Hour',
      color: 'text-blue-300 bg-blue-500/20 border-blue-500/40',
      desc: 'Cool saturated cobalt sky gradient prior to sunrise',
    },
    blue_hour_evening: {
      label: 'Evening Blue Hour',
      color: 'text-blue-300 bg-blue-500/20 border-blue-500/40',
      desc: 'Deep royal blue sky illumination immediately after sunset',
    },
    civil_twilight: {
      label: 'Civil Twilight',
      color: 'text-indigo-300 bg-indigo-500/20 border-indigo-500/40',
      desc: 'Sun between 0° and -6° below horizon. Terrestrial objects clearly discernible without artificial lights.',
    },
    nautical_twilight: {
      label: 'Nautical Twilight',
      color: 'text-blue-400 bg-blue-900/40 border-blue-700/40',
      desc: 'Sun between -6° and -12° below horizon. General sea horizon remains visible for marine navigation.',
    },
    astro_twilight: {
      label: 'Astronomical Twilight',
      color: 'text-purple-300 bg-purple-900/40 border-purple-700/40',
      desc: 'Sun between -12° and -18° below horizon. Sky darkening toward complete astronomical background darkness.',
    },
    night: {
      label: 'Astronomical Night',
      color: 'text-slate-300 bg-slate-800/80 border-slate-700',
      desc: 'Sun deeper than -18° below horizon. Maximum celestial contrast and deep-sky visibility.',
    },
  };

  const currentStatus = periodLabel[sun.currentPeriod] || periodLabel.day;

  return (
    <div className="space-y-6" id="sun-center-module">
      {/* Interactive 3D Solar System View */}
      <InteractiveSolarSystem planets={planets} />

      {/* Daylight Arc & Solar Position Graphic */}
      <div className="bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shadow-lg shadow-amber-500/10">
              <Sun size={22} className="animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Solar Ephemeris Center
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold border ${currentStatus.color}`}>
                  {currentStatus.label}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Real-time solar azimuth, daylight curve & photography lighting windows
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-500 block">Total Daylight</span>
              <span className="text-sm font-bold text-amber-300">{sun.dayLengthFormatted}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-500 block">Solar Distance</span>
              <span className="text-sm font-bold text-slate-200">{sun.distanceAu} AU</span>
            </div>
          </div>
        </div>

        {/* Daylight Arc Visualizer (SVG) */}
        <div className="relative pt-2 pb-6">
          <div className="h-44 sm:h-52 w-full max-w-2xl mx-auto relative flex items-end justify-center">
            <svg viewBox="0 0 400 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="skyArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="sunGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>

              {/* Horizon Line */}
              <line x1="20" y1="150" x2="380" y2="150" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />
              
              {/* Daylight Arc Path */}
              <path
                d="M 40 150 A 160 130 0 0 1 360 150"
                fill="none"
                stroke="url(#skyArcGrad)"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Sunrise & Sunset Tick Marks */}
              <circle cx="40" cy="150" r="4" fill="#38BDF8" />
              <circle cx="360" cy="150" r="4" fill="#F43F5E" />
              <circle cx="200" cy="20" r="3" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2" />

              {/* Text labels */}
              <text x="40" y="170" fill="#94A3B8" fontSize="10" fontFamily="monospace" textAnchor="middle">
                Rise {formatTime(sun.sunrise)}
              </text>
              <text x="200" y="12" fill="#FBBF24" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                Noon {formatTime(sun.solarNoon)} (Peak {sun.peakElevationDeg}°)
              </text>
              <text x="360" y="170" fill="#94A3B8" fontSize="10" fontFamily="monospace" textAnchor="middle">
                Set {formatTime(sun.sunset)}
              </text>

              {/* Active Sun Marker on Arc */}
              {(() => {
                // Calculate position on arc based on elevation/time
                const progress = Math.max(0, Math.min(100, sun.daylightProgressPercent)) / 100;
                const angle = Math.PI - progress * Math.PI; // from PI (left) to 0 (right)
                const sunX = 200 + 160 * Math.cos(angle);
                const sunY = 150 - 130 * Math.sin(angle);
                const isAboveHorizon = sun.elevationDeg > 0;

                return (
                  <g transform={`translate(${sunX}, ${sunY})`}>
                    {/* Glowing pulsating rings */}
                    <circle r="16" fill="#F59E0B" opacity="0.2" className="animate-ping" />
                    <circle r="10" fill="#FBBF24" opacity="0.4" />
                    <circle r="6" fill="url(#sunGlow)" />
                    {/* Tooltip callout */}
                    <rect x="-35" y="-28" width="70" height="18" rx="4" fill="#0F172A" stroke="#F59E0B" strokeWidth="0.8" opacity="0.9" />
                    <text x="0" y="-16" fill="#FDE047" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      {sun.elevationDeg > 0 ? `+${sun.elevationDeg}°` : `${sun.elevationDeg}°`}
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Key Solar Diagnostic Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] uppercase font-mono tracking-wider">Solar Elevation</span>
              <Gauge size={14} className="text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono text-amber-300">
              {sun.elevationDeg > 0 ? `+${sun.elevationDeg}°` : `${sun.elevationDeg}°`}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Peak: {sun.peakElevationDeg}° at noon
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] uppercase font-mono tracking-wider">Solar Azimuth</span>
              <Compass size={14} className="text-cyan-400" />
            </div>
            <div className="text-xl font-bold font-mono text-cyan-300">
              {sun.azimuthDeg}°
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Declination: {sun.declinationDeg}°
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] uppercase font-mono tracking-wider">Solar Irradiance</span>
              <Zap size={14} className="text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono text-amber-400">
              {sun.solarRadiationWm2} <span className="text-xs font-normal">W/m²</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Direct surface flux
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] uppercase font-mono tracking-wider">Daylight Progress</span>
              <Clock size={14} className="text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {sun.daylightProgressPercent}%
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${sun.daylightProgressPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Photography & Twilight Progression Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Photography Golden & Blue Hours */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Camera size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">Photography Light Windows</h4>
                <span className="text-[11px] text-slate-400">Cinematographic golden & blue hour schedules</span>
              </div>
            </div>
            <Sparkles size={16} className="text-amber-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Morning Golden Hour */}
            <div className="bg-slate-950/70 border border-amber-500/30 rounded-2xl p-3.5 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-amber-400 block">
                Morning Golden Hour
              </span>
              <div className="text-sm font-mono font-bold text-slate-100">
                {formatTime(sun.goldenHourMorning.start)} – {formatTime(sun.goldenHourMorning.end)}
              </div>
              <p className="text-[11px] text-slate-400">Warm diffused dawn light (Sun -4° to +6°)</p>
            </div>

            {/* Evening Golden Hour */}
            <div className="bg-slate-950/70 border border-amber-500/30 rounded-2xl p-3.5 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-amber-400 block">
                Evening Golden Hour
              </span>
              <div className="text-sm font-mono font-bold text-slate-100">
                {formatTime(sun.goldenHourEvening.start)} – {formatTime(sun.goldenHourEvening.end)}
              </div>
              <p className="text-[11px] text-slate-400">Cinematic side-lighting and rich warmth</p>
            </div>

            {/* Morning Blue Hour */}
            <div className="bg-slate-950/70 border border-blue-500/30 rounded-2xl p-3.5 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-blue-400 block">
                Morning Blue Hour
              </span>
              <div className="text-sm font-mono font-bold text-slate-100">
                {formatTime(sun.blueHourMorning.start)} – {formatTime(sun.blueHourMorning.end)}
              </div>
              <p className="text-[11px] text-slate-400">Cobalt sky tones before sunrise</p>
            </div>

            {/* Evening Blue Hour */}
            <div className="bg-slate-950/70 border border-blue-500/30 rounded-2xl p-3.5 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-blue-400 block">
                Evening Blue Hour
              </span>
              <div className="text-sm font-mono font-bold text-slate-100">
                {formatTime(sun.blueHourEvening.start)} – {formatTime(sun.blueHourEvening.end)}
              </div>
              <p className="text-[11px] text-slate-400">Atmospheric twilight cityscape contrast</p>
            </div>
          </div>
        </div>

        {/* Complete Astronomical Twilight Ladder */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-5 space-y-3.5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Eye size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">Twilight Spectrum Ladder</h4>
                <span className="text-[11px] text-slate-400">Dawn & dusk atmospheric solar depression</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {/* Civil Twilight */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <div>
                  <span className="font-semibold text-slate-200 block">Civil Twilight (0° to -6°)</span>
                  <span className="text-[10px] text-slate-400">Naked-eye terrestrial visibility</span>
                </div>
              </div>
              <div className="text-right font-mono text-[11px]">
                <span className="text-slate-300 block">{formatTime(sun.civilDawn)} (Dawn)</span>
                <span className="text-slate-400 block">{formatTime(sun.civilDusk)} (Dusk)</span>
              </div>
            </div>

            {/* Nautical Twilight */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <div>
                  <span className="font-semibold text-slate-200 block">Nautical Twilight (-6° to -12°)</span>
                  <span className="text-[10px] text-slate-400">Horizon distinguishable for sailors</span>
                </div>
              </div>
              <div className="text-right font-mono text-[11px]">
                <span className="text-slate-300 block">{formatTime(sun.nauticalDawn)} (Dawn)</span>
                <span className="text-slate-400 block">{formatTime(sun.nauticalDusk)} (Dusk)</span>
              </div>
            </div>

            {/* Astronomical Twilight */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <div>
                  <span className="font-semibold text-slate-200 block">Astronomical Twilight (-12° to -18°)</span>
                  <span className="text-[10px] text-slate-400">Deep sky darkness onset</span>
                </div>
              </div>
              <div className="text-right font-mono text-[11px]">
                <span className="text-slate-300 block">{formatTime(sun.astroDawn)} (Dawn)</span>
                <span className="text-slate-400 block">{formatTime(sun.astroDusk)} (Dusk)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
