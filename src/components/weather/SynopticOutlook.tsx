import React, { useState } from 'react';
import { DailyForecastItem, UserPreferences } from '../../types';
import { WeatherIcon } from '../common/WeatherIcon';
import { formatTemperature, formatDayName, formatWindSpeed } from '../../utils/formatters';
import {
  Calendar,
  Droplets,
  ChevronRight,
  Sun,
  Wind,
  Compass,
  Eye,
  Umbrella,
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface SynopticOutlookProps {
  daily: DailyForecastItem[];
  currentTemp?: number;
  preferences: UserPreferences;
}

export const SynopticOutlook: React.FC<SynopticOutlookProps> = ({
  daily,
  currentTemp,
  preferences,
}) => {
  const [selectedDay, setSelectedDay] = useState<DailyForecastItem | null>(null);

  // Find global min and max across all days for normalized envelope bar scaling
  const allMins = daily.map((d) => d.tempMin);
  const allMaxs = daily.map((d) => d.tempMax);
  const globalMin = Math.min(...allMins);
  const globalMax = Math.max(...allMaxs);
  const totalRange = Math.max(1, globalMax - globalMin);

  return (
    <div
      id="synoptic-outlook-card"
      className="rounded-3xl border border-white/12 bg-slate-900/60 backdrop-blur-2xl p-4 sm:p-5 shadow-xl transition-all space-y-3"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-cyan-400" />
          <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-200">
            7-Day Synoptic Outlook
          </h2>
        </div>
        <span className="text-xs font-mono text-slate-400">Temp Range Envelope</span>
      </div>

      {/* Days List */}
      <div className="divide-y divide-white/5">
        {daily.map((day, idx) => {
          const isToday = idx === 0;
          const popPercent = Math.round(day.pop * 100);

          // Calculate bar offsets
          const leftPercent = ((day.tempMin - globalMin) / totalRange) * 100;
          const widthPercent = Math.max(8, ((day.tempMax - day.tempMin) / totalRange) * 100);

          // Current temp indicator dot position for today
          let currentTempDotPercent: number | null = null;
          if (isToday && currentTemp !== undefined) {
            currentTempDotPercent = Math.max(
              0,
              Math.min(100, ((currentTemp - day.tempMin) / Math.max(1, day.tempMax - day.tempMin)) * 100)
            );
          }

          return (
            <button
              key={day.timestamp}
              onClick={() => setSelectedDay(day)}
              className="w-full py-2.5 px-2 flex items-center justify-between gap-2.5 text-left rounded-xl hover:bg-white/[0.06] transition-colors group cursor-pointer"
            >
              {/* Day Name */}
              <div className="w-14 sm:w-16 shrink-0">
                <span
                  className={`text-xs sm:text-sm font-medium ${
                    isToday ? 'text-cyan-300 font-bold' : 'text-slate-200 group-hover:text-white'
                  }`}
                >
                  {formatDayName(day.timestamp, idx)}
                </span>
              </div>

              {/* Weather Icon & Rain Probability */}
              <div className="flex items-center gap-1.5 w-16 sm:w-20 shrink-0">
                <WeatherIcon
                  conditionId={day.condition.id}
                  iconCode={day.condition.icon}
                  size={20}
                />
                {popPercent > 15 ? (
                  <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-0.5 font-semibold">
                    <Droplets size={10} />
                    {popPercent}%
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-slate-500">0%</span>
                )}
              </div>

              {/* Temp Min */}
              <span className="w-9 text-right font-mono text-xs text-slate-400 shrink-0">
                {formatTemperature(day.tempMin, preferences)}
              </span>

              {/* Visual Temperature Range Bar */}
              <div className="flex-1 h-2 bg-slate-950/80 rounded-full overflow-hidden relative mx-2 hidden sm:block border border-white/5">
                <div
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                  }}
                  className="absolute h-full rounded-full bg-gradient-to-r from-cyan-400 via-amber-300 to-rose-400 opacity-90 shadow-sm"
                >
                  {/* Current temp marker dot on Today */}
                  {isToday && currentTempDotPercent !== null && (
                    <div
                      style={{ left: `${currentTempDotPercent}%` }}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white border-2 border-slate-900 shadow-md"
                    />
                  )}
                </div>
              </div>

              {/* Temp Max */}
              <span className="w-9 text-left font-mono text-xs sm:text-sm font-bold text-white shrink-0">
                {formatTemperature(day.tempMax, preferences)}
              </span>

              {/* Subtle chevron */}
              <ChevronRight
                size={14}
                className="text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0 hidden sm:block"
              />
            </button>
          );
        })}
      </div>

      {/* Progressive Disclosure Modal for Day Details */}
      {selectedDay && (
        <Modal
          isOpen={!!selectedDay}
          onClose={() => setSelectedDay(null)}
          title={`Forecast Details: ${formatDayName(selectedDay.timestamp, 1)}`}
          size="md"
        >
          <div className="space-y-4 text-slate-200">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/60 border border-white/10">
              <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-400">
                <WeatherIcon
                  conditionId={selectedDay.condition.id}
                  iconCode={selectedDay.condition.icon}
                  size={40}
                />
              </div>
              <div>
                <h4 className="text-base font-bold text-white capitalize">
                  {selectedDay.condition.description}
                </h4>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-300 mt-1">
                  <span>High: <strong className="text-amber-300">{formatTemperature(selectedDay.tempMax, preferences)}</strong></span>
                  <span>•</span>
                  <span>Low: <strong className="text-cyan-300">{formatTemperature(selectedDay.tempMin, preferences)}</strong></span>
                  <span>•</span>
                  <span>Precipitation: <strong>{Math.round(selectedDay.pop * 100)}%</strong></span>
                </div>
              </div>
            </div>

            {/* Diagnostic Matrix for selected day */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono">
              <div className="p-3 rounded-xl bg-slate-950/50 border border-white/10">
                <span className="text-[11px] text-slate-400 block">UV Index</span>
                <span className="text-sm font-bold text-amber-400 mt-0.5 block">{selectedDay.uvIndex} / 12</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/50 border border-white/10">
                <span className="text-[11px] text-slate-400 block">Wind Speed</span>
                <span className="text-sm font-bold text-slate-100 mt-0.5 block">
                  {formatWindSpeed(selectedDay.windSpeed, preferences)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/50 border border-white/10">
                <span className="text-[11px] text-slate-400 block">Humidity</span>
                <span className="text-sm font-bold text-cyan-400 mt-0.5 block">{selectedDay.humidity}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/50 border border-white/10">
                <span className="text-[11px] text-slate-400 block">Rain Volume</span>
                <span className="text-sm font-bold text-blue-400 mt-0.5 block">
                  {selectedDay.rainMm ? `${selectedDay.rainMm} mm` : '0 mm'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-white/10 text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-cyan-400 block mb-1">Synoptic Assessment:</span>
              Expected {selectedDay.condition.description.toLowerCase()} with daytime thermal highs around{' '}
              {formatTemperature(selectedDay.tempMax, preferences)}. Precipitation risk is{' '}
              {Math.round(selectedDay.pop * 100) > 40 ? 'elevated' : 'minimal'}.
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
