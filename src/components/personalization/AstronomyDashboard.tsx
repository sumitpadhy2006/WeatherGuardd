import React from 'react';
import {
  Telescope,
  Sparkles,
  Moon,
  Eye,
  Satellite,
  Compass,
  Calendar,
  Layers,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { usePersonalization } from '../../context/PersonalizationContext';
import { useLocation } from '../../context/LocationContext';
import { useWeather } from '../../hooks/useWeather';

export const AstronomyDashboard: React.FC = () => {
  const { astronomyData } = usePersonalization();
  const { currentLocation } = useLocation();
  const { data: weather } = useWeather(currentLocation);

  if (!astronomyData || !weather) {
    return (
      <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
        Loading deep-sky observatory telemetry...
      </div>
    );
  }

  const {
    bortleDarkSkyClass,
    bortleDescription,
    nakedEyeLimitingMagnitude,
    nightCloudForecast,
    activeMeteorShowers,
    upcomingEclipses,
    satellitePasses,
    stargazingIndex,
  } = astronomyData;

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Telescope size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Deep-Sky & Celestial Ephemeris Radar
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Observatory Mode
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Bortle dark sky light pollution index, night sky opacity forecast, meteor radiants & space station flyovers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5">
            <Sparkles size={13} />
            Stargazing Index: {stargazingIndex}/100
          </span>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Bortle Class */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Bortle Scale</span>
            <Eye size={16} className="text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-400 font-mono">
            Class {bortleDarkSkyClass} <span className="text-xs text-slate-400 font-normal">/ 9</span>
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            {bortleDescription.split('.')[0]}
          </span>
        </div>

        {/* Limiting Magnitude */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Limiting Magnitude</span>
            <Sparkles size={16} className="text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">
            +{nakedEyeLimitingMagnitude} <span className="text-xs text-slate-400 font-normal">mv</span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            Faintest naked-eye star visible
          </span>
        </div>

        {/* Moon Illumination */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Moon Interference</span>
            <Moon size={16} className="text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {weather.celestial.moonIlluminationPercent}%
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            {weather.celestial.moonPhaseName}
          </span>
        </div>

        {/* ISS Next Flyover */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">ISS Flyover</span>
            <Satellite size={16} className="text-emerald-400" />
          </div>
          <div className="text-base font-bold text-emerald-400 font-mono">
            {satellitePasses[0]?.time || 'Tonight'}
          </div>
          <span className="text-[10px] text-slate-400 block">
            Max Elevation: {satellitePasses[0]?.maxElevationDegrees}° (Mag {satellitePasses[0]?.brightnessMagnitude})
          </span>
        </div>
      </div>

      {/* Night Sky Cloud & Transparency Forecast */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Layers size={14} className="text-cyan-400" /> Night Sky Cloud Opacity & Optical Seeing
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Night Window</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {nightCloudForecast.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{item.hour}</span>
                <span className="text-cyan-400">{item.cloudCoverPercent}% Cloud</span>
              </div>
              <div className="text-[11px] text-slate-300">
                Transparency: <span className="text-emerald-400 font-bold">{item.transparencyRating}</span>
              </div>
              <div className="text-[10px] text-slate-500">
                Seeing: {item.seeingConditions}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column: Active Meteor Showers + Eclipses Track */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Active Meteor Showers (7 cols) */}
        <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Flame size={14} className="text-amber-400" /> Active Meteor Showers & Peak Radiants
          </h3>

          <div className="space-y-2">
            {activeMeteorShowers.map((shower, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{shower.name}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300">
                      ZHR ~{shower.zenithalHourlyRateZhr}/hr
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                    Radiant: {shower.radiantConstellation} • Peak: {shower.peakDate}
                  </span>
                </div>

                <div className="text-right sm:shrink-0">
                  <span className="text-[10px] font-mono text-cyan-400 block">{shower.viewingWindow}</span>
                  <span className="text-[9px] text-slate-500">Moon Interf: {shower.moonInterference}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Upcoming Eclipses (5 cols) */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={14} className="text-purple-400" /> Upcoming Solar & Lunar Eclipses
          </h3>

          <div className="space-y-2">
            {upcomingEclipses.map((e, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{e.type} Eclipse</span>
                  <span className="text-purple-300 font-bold">in {e.countdownDays} days</span>
                </div>
                <div className="text-[10px] text-slate-400">{e.date} • Peak: {e.peakUtc}</div>
                <div className="text-[10px] text-slate-500 truncate">{e.visibilityRegion}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
