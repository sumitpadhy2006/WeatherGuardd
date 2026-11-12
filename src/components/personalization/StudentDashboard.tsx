import React from 'react';
import {
  GraduationCap,
  Umbrella,
  Bike,
  Footprints,
  Bus,
  Activity,
  BookOpen,
  Sun,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { usePersonalization } from '../../context/PersonalizationContext';
import { useLocation } from '../../context/LocationContext';
import { useWeather } from '../../hooks/useWeather';

export const StudentDashboard: React.FC = () => {
  const { studentData } = usePersonalization();
  const { currentLocation } = useLocation();
  const { data: weather } = useWeather(currentLocation);

  if (!studentData || !weather) {
    return (
      <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
        Loading student campus telemetry...
      </div>
    );
  }

  const {
    campusCommuteRating,
    transitModeAdvice,
    outdoorSportsIndex,
    outdoorSportsVerdict,
    studyComfortScore,
    studyComfortNotes,
    uvProtectionLevel,
    examDayWeatherOutlook,
  } = studentData;

  const commuteColor =
    campusCommuteRating === 'Clear'
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      : campusCommuteRating === 'Carry Umbrella'
      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
      : 'bg-amber-500/20 text-amber-300 border-amber-500/40';

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <GraduationCap size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Campus Weather & Student Daily Planner
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                {weather.location.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live campus commute advisory, outdoor sports suitability, library study comfort index & exam transit outlook.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 ${commuteColor}`}>
            <Umbrella size={14} />
            Commute: {campusCommuteRating}
          </span>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Commute Verdict */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Campus Commute</span>
            <Umbrella size={16} className="text-blue-400" />
          </div>
          <div className="text-base font-bold text-white font-mono">
            {campusCommuteRating}
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            Rain chance: {Math.round((weather.hourly?.[0]?.pop ?? 0.2) * 100)}%
          </span>
        </div>

        {/* Outdoor Sports Score */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Sports & Track</span>
            <Activity size={16} className="text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            {outdoorSportsIndex} <span className="text-xs text-slate-400 font-normal">/100</span>
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            {outdoorSportsVerdict}
          </span>
        </div>

        {/* Study Room Comfort */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Library Study Score</span>
            <BookOpen size={16} className="text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-400 font-mono">
            {studyComfortScore} <span className="text-xs text-slate-400 font-normal">/100</span>
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            Indoor Temp & AQI balance
          </span>
        </div>

        {/* UV Sun Protection */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">UV Protection</span>
            <Sun size={16} className="text-amber-400" />
          </div>
          <div className="text-sm font-bold text-amber-400 font-mono truncate">
            {uvProtectionLevel}
          </div>
          <span className="text-[10px] text-slate-400 block">
            UV Index: {weather.uvIndex} (Peak at 12:30 PM)
          </span>
        </div>
      </div>

      {/* Transit Modes Breakdown */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Footprints size={14} className="text-blue-400" /> Campus Transit & Travel Modes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Walking */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Footprints size={14} className="text-cyan-400" /> Walking
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                {transitModeAdvice.walking.status}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {transitModeAdvice.walking.text}
            </p>
          </div>

          {/* Cycling */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Bike size={14} className="text-amber-400" /> Cycling / Scooter
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/20 text-blue-300">
                {transitModeAdvice.cycling.status}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {transitModeAdvice.cycling.text}
            </p>
          </div>

          {/* Bus / Shuttle */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Bus size={14} className="text-purple-400" /> Campus Shuttle / Bus
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300">
                {transitModeAdvice.publicTransit.status}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {transitModeAdvice.publicTransit.text}
            </p>
          </div>
        </div>
      </div>

      {/* Exam Day Weather Slots */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={14} className="text-emerald-400" /> Exam Schedule & Lecture Transit Windows
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Timetable Synced</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {examDayWeatherOutlook.map((slot, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between space-y-2"
            >
              <div>
                <span className="text-xs font-bold text-white block">{slot.timeSlot}</span>
                <div className="flex items-center gap-2 text-xs font-mono mt-1 text-slate-400">
                  <span className="text-white font-bold">{slot.temp}</span>
                  <span>•</span>
                  <span className="text-cyan-400">Rain: {slot.rainProb}%</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 pt-1 border-t border-slate-800/60">
                {slot.advisory}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
