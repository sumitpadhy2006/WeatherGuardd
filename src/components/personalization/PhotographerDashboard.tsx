import React from 'react';
import {
  Camera,
  Sun,
  Moon,
  Cloud,
  Compass,
  Layers,
  Sparkles,
  Eye,
  Sliders,
  Clock,
  Flame,
} from 'lucide-react';
import { usePersonalization } from '../../context/PersonalizationContext';
import { useLocation } from '../../context/LocationContext';
import { useWeather } from '../../hooks/useWeather';

export const PhotographerDashboard: React.FC = () => {
  const { photographerData } = usePersonalization();
  const { currentLocation } = useLocation();
  const { data: weather } = useWeather(currentLocation);

  if (!photographerData || !weather) {
    return (
      <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
        Loading optical atmosphere telemetry...
      </div>
    );
  }

  const {
    goldenHourMorning,
    goldenHourEvening,
    blueHourMorning,
    blueHourEvening,
    cloudCeiling,
    sunAzimuthDegrees,
    sunElevationDegrees,
    moonAzimuthDegrees,
    moonElevationDegrees,
    moonIlluminationPercent,
    moonPhaseName,
    fogMistForecast,
    lensRecommendation,
  } = photographerData;

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Camera size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Optical Atmosphere & Golden Hour Optics
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                {weather.location.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live golden/blue hour ephemeris, multi-tier cloud ceiling, sun/moon azimuth angles & sunset drama predictions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl border border-purple-500/40 bg-purple-500/20 text-purple-300 text-xs font-mono font-bold flex items-center gap-1.5">
            <Sparkles size={13} />
            Sunset Drama Score: {cloudCeiling.dramaticSunsetScore}/100
          </span>
        </div>
      </div>

      {/* Top 4 Optical Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Morning Golden Hour */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Morning Golden Hour</span>
            <Sun size={16} className="text-amber-400" />
          </div>
          <div className="text-base font-bold text-amber-300 font-mono">
            {goldenHourMorning.start} – {goldenHourMorning.end}
          </div>
          <span className="text-[10px] text-slate-400 block">
            Quality: <span className="text-emerald-400 font-bold">{goldenHourMorning.quality}</span>
          </span>
        </div>

        {/* Evening Golden Hour */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Evening Golden Hour</span>
            <Flame size={16} className="text-orange-400" />
          </div>
          <div className="text-base font-bold text-orange-300 font-mono">
            {goldenHourEvening.start} – {goldenHourEvening.end}
          </div>
          <span className="text-[10px] text-slate-400 block">
            Quality: <span className="text-emerald-400 font-bold">{goldenHourEvening.quality}</span>
          </span>
        </div>

        {/* Blue Hour Evening */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Evening Blue Hour</span>
            <Clock size={16} className="text-blue-400" />
          </div>
          <div className="text-base font-bold text-blue-300 font-mono">
            {blueHourEvening.start} – {blueHourEvening.end}
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            Deep cobalt twilight
          </span>
        </div>

        {/* Moon Phase & Light */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Moon Illumination</span>
            <Moon size={16} className="text-cyan-400" />
          </div>
          <div className="text-base font-bold text-white font-mono">
            {moonIlluminationPercent}%
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            {moonPhaseName}
          </span>
        </div>
      </div>

      {/* 2-Column: Cloud Ceiling & Sunset Drama + Sun/Moon Celestial Angles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Cloud Layers & Sunset Drama (7 cols) */}
        <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={14} className="text-purple-400" /> 3-Tier Cloud Ceiling & Light Diffusion
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Cloud Base: ~{cloudCeiling.cloudBaseMeters}m
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Low Stratus</span>
              <span className="text-sm font-bold text-white mt-1 block">{cloudCeiling.lowCloudPercent}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Mid Altocumulus</span>
              <span className="text-sm font-bold text-cyan-300 mt-1 block">{cloudCeiling.midCloudPercent}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">High Cirrus</span>
              <span className="text-sm font-bold text-purple-300 mt-1 block">{cloudCeiling.highCloudPercent}%</span>
            </div>
          </div>

          {/* Valley Mist / Fog Indicator */}
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-200 block">Atmospheric Fog & Golden Mist:</span>
              <span className="text-slate-400 text-[11px]">
                {fogMistForecast.predictedValleyFog
                  ? `High chance (${fogMistForecast.chancePercent}%) of ground/valley mist at dawn.`
                  : 'Clear line of sight; low mist probability.'}
              </span>
            </div>
            {fogMistForecast.goldenMistTime && (
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                Mist: {fogMistForecast.goldenMistTime}
              </span>
            )}
          </div>
        </div>

        {/* Right: Sun & Moon Solar Position Vectors (5 cols) */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Compass size={14} className="text-cyan-400" /> Celestial Vector Angles
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[10px] text-amber-400 flex items-center gap-1">
                <Sun size={11} /> Sun Azimuth
              </span>
              <div className="text-base font-bold text-white">{sunAzimuthDegrees}° (SW)</div>
              <span className="text-[10px] text-slate-500">Elevation: {sunElevationDegrees}°</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[10px] text-blue-400 flex items-center gap-1">
                <Moon size={11} /> Moon Azimuth
              </span>
              <div className="text-base font-bold text-white">{moonAzimuthDegrees}° (ESE)</div>
              <span className="text-[10px] text-slate-500">Elevation: {moonElevationDegrees}°</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-1 text-xs">
            <span className="font-bold text-purple-300 flex items-center gap-1">
              <Camera size={12} /> Optical Lens & Filter Match:
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {lensRecommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
