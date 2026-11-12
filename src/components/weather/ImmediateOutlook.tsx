import React from 'react';
import { HourlyForecastItem, UserPreferences, CelestialSummary } from '../../types';
import { WeatherIcon } from '../common/WeatherIcon';
import { formatTemperature, formatWindSpeed } from '../../utils/formatters';
import { Sunrise, Sunset } from 'lucide-react';

interface ImmediateOutlookProps {
  hourly: HourlyForecastItem[];
  minutelyRain?: { minute: number; intensityMm: number; probability: number }[];
  isRainingNow?: boolean;
  preferences: UserPreferences;
  celestial?: CelestialSummary;
}

interface TimelineNode {
  id: string;
  timestamp: number;
  timeLabel: string;
  isCelestial?: boolean;
  celestialType?: 'sunrise' | 'sunset';
  tempStr?: string;
  conditionId?: number;
  iconCode?: string;
  isDay?: boolean;
  popPercent?: number;
}

function formatHourLabel(timestampSec: number, isNow: boolean): string {
  if (isNow) return 'Now';
  const d = new Date(timestampSec * 1000);
  let hours = d.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}${ampm}`;
}

function formatCelestialTime(timestampSec: number): string {
  const d = new Date(timestampSec * 1000);
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes}${ampm}`;
}

export const ImmediateOutlook: React.FC<ImmediateOutlookProps> = ({
  hourly,
  isRainingNow = false,
  preferences,
  celestial,
}) => {
  // Generate intelligent meteorological summary matching Apple Weather style
  const generateSummary = (): string => {
    const next12Hours = hourly.slice(0, 12);
    const rainingHourIndex = next12Hours.findIndex(
      (h) => (h.pop || 0) > 0.35 || h.condition.main === 'Rain'
    );
    const maxWind = Math.max(...next12Hours.map((h) => h.windSpeed || 0));
    const windStr = formatWindSpeed(maxWind, preferences);

    if (isRainingNow) {
      return `Rainy conditions will continue over the next few hours. Wind gusts are up to ${windStr}.`;
    }
    if (rainingHourIndex > 0) {
      const rainTime = formatHourLabel(next12Hours[rainingHourIndex].timestamp, false);
      return `Rain expected around ${rainTime}. Wind gusts are up to ${windStr}.`;
    }

    const currentDesc = hourly[0]?.condition.description || 'Cloudy';
    const capitalizedDesc = currentDesc.charAt(0).toUpperCase() + currentDesc.slice(1);
    return `${capitalizedDesc} conditions will continue for the rest of the day. Wind gusts are up to ${windStr}.`;
  };

  // Build the chronological 24-hour timeline and interleave Sunrise/Sunset events
  const timelineNodes: TimelineNode[] = [];
  const hoursSlice = hourly.slice(0, 24);

  const sunriseEpoch = celestial?.sunrise;
  const sunsetEpoch = celestial?.sunset;

  let addedSunrise = false;
  let addedSunset = false;

  for (let i = 0; i < hoursSlice.length; i++) {
    const currentHour = hoursSlice[i];
    const nextHour = hoursSlice[i + 1];
    const isNow = i === 0;

    // Check if sunrise falls before or between this hour and next
    if (
      sunriseEpoch &&
      !addedSunrise &&
      nextHour &&
      sunriseEpoch >= currentHour.timestamp &&
      sunriseEpoch < nextHour.timestamp
    ) {
      // Add current hour first
      timelineNodes.push({
        id: `hour-${currentHour.timestamp}`,
        timestamp: currentHour.timestamp,
        timeLabel: formatHourLabel(currentHour.timestamp, isNow),
        tempStr: formatTemperature(currentHour.temp, preferences),
        conditionId: currentHour.condition.id,
        iconCode: currentHour.condition.icon,
        isDay: currentHour.isDay,
        popPercent: Math.round((currentHour.pop || 0) * 100),
      });

      // Insert Sunrise node
      timelineNodes.push({
        id: `celestial-sunrise-${sunriseEpoch}`,
        timestamp: sunriseEpoch,
        timeLabel: formatCelestialTime(sunriseEpoch),
        isCelestial: true,
        celestialType: 'sunrise',
      });
      addedSunrise = true;
      continue;
    }

    // Check if sunset falls before or between this hour and next
    if (
      sunsetEpoch &&
      !addedSunset &&
      nextHour &&
      sunsetEpoch >= currentHour.timestamp &&
      sunsetEpoch < nextHour.timestamp
    ) {
      timelineNodes.push({
        id: `hour-${currentHour.timestamp}`,
        timestamp: currentHour.timestamp,
        timeLabel: formatHourLabel(currentHour.timestamp, isNow),
        tempStr: formatTemperature(currentHour.temp, preferences),
        conditionId: currentHour.condition.id,
        iconCode: currentHour.condition.icon,
        isDay: currentHour.isDay,
        popPercent: Math.round((currentHour.pop || 0) * 100),
      });

      // Insert Sunset node
      timelineNodes.push({
        id: `celestial-sunset-${sunsetEpoch}`,
        timestamp: sunsetEpoch,
        timeLabel: formatCelestialTime(sunsetEpoch),
        isCelestial: true,
        celestialType: 'sunset',
      });
      addedSunset = true;
      continue;
    }

    // Standard hourly node
    timelineNodes.push({
      id: `hour-${currentHour.timestamp}`,
      timestamp: currentHour.timestamp,
      timeLabel: formatHourLabel(currentHour.timestamp, isNow),
      tempStr: formatTemperature(currentHour.temp, preferences),
      conditionId: currentHour.condition.id,
      iconCode: currentHour.condition.icon,
      isDay: currentHour.isDay,
      popPercent: Math.round((currentHour.pop || 0) * 100),
    });
  }

  return (
    <div
      id="immediate-outlook-card"
      className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl p-4 sm:p-5 shadow-xl transition-all"
    >
      {/* Top Synoptic Summary Sentence */}
      <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
        {generateSummary()}
      </p>

      {/* Clean Divider Line */}
      <div className="border-b border-white/10 my-3.5" />

      {/* Clean Horizontal Timeline Scroller (No inner boxes/cards) */}
      <div className="overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="flex items-center gap-6 sm:gap-7.5 min-w-max px-1 py-1">
          {timelineNodes.map((node) => {
            if (node.isCelestial) {
              const isSunrise = node.celestialType === 'sunrise';
              return (
                <div
                  key={node.id}
                  className="flex flex-col items-center justify-between min-w-[3.75rem] h-[104px] shrink-0 text-center select-none"
                >
                  {/* Event Time */}
                  <span className="text-xs sm:text-[13px] font-medium text-slate-300 whitespace-nowrap">
                    {node.timeLabel}
                  </span>

                  {/* Celestial Icon */}
                  <div className="my-auto flex items-center justify-center">
                    {isSunrise ? (
                      <Sunrise size={26} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                    ) : (
                      <Sunset size={26} className="text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                    )}
                  </div>

                  {/* Event Label */}
                  <span className="text-xs sm:text-[13px] font-medium text-slate-300 whitespace-nowrap capitalize">
                    {node.celestialType}
                  </span>
                </div>
              );
            }

            const hasRainRisk = node.popPercent && node.popPercent >= 20;

            return (
              <div
                key={node.id}
                className="flex flex-col items-center justify-between min-w-[3.75rem] h-[104px] shrink-0 text-center select-none"
              >
                {/* Time Label (Now, 8PM, 9PM...) */}
                <span className="text-xs sm:text-[13px] font-medium text-slate-200 whitespace-nowrap">
                  {node.timeLabel}
                </span>

                {/* Weather Icon + Rain POP (if any) */}
                <div className="my-auto flex flex-col items-center justify-center">
                  <WeatherIcon
                    conditionId={node.conditionId || 800}
                    iconCode={node.iconCode || '01d'}
                    isDay={node.isDay ?? true}
                    size={26}
                  />
                  {hasRainRisk ? (
                    <span className="text-[11px] font-bold text-cyan-400 font-mono -mt-0.5 leading-none">
                      {node.popPercent}%
                    </span>
                  ) : null}
                </div>

                {/* Temperature Label (e.g. 28°) */}
                <span className="text-sm sm:text-[15px] font-semibold text-white font-mono whitespace-nowrap">
                  {node.tempStr}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
