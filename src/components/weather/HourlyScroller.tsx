import React, { useState } from 'react';
import { Card } from '../common/Card';
import { HourlyForecastItem, UserPreferences } from '../../types';
import { WeatherIcon } from '../common/WeatherIcon';
import { formatTemperature, formatWindSpeed, formatTime } from '../../utils/formatters';
import { Clock, Droplets, Wind, Sun } from 'lucide-react';

interface HourlyScrollerProps {
  hourly: HourlyForecastItem[];
  preferences: UserPreferences;
}

export const HourlyScroller: React.FC<HourlyScrollerProps> = ({ hourly, preferences }) => {
  const [activeTab, setActiveTab] = useState<'temp' | 'rain' | 'wind'>('temp');

  return (
    <Card id="hourly-scroller-card" variant="default" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-cyan-400" />
          <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-300">
            48-Hour Hourly Synoptic Outlook
          </h2>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-950/60 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('temp')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'temp' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Temperature
          </button>
          <button
            onClick={() => setActiveTab('rain')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'rain' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Precipitation
          </button>
          <button
            onClick={() => setActiveTab('wind')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'wind' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Wind & UV
          </button>
        </div>
      </div>

      {/* Horizontal Scroller Container */}
      <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="flex gap-2 min-w-max py-2">
          {hourly.slice(0, 24).map((hour, idx) => {
            const isNow = idx === 0;
            const popPercent = Math.round(hour.pop * 100);

            return (
              <div
                key={hour.timestamp}
                className={`flex flex-col items-center justify-between p-3 rounded-xl min-w-[76px] transition-all border ${
                  isNow
                    ? 'bg-cyan-950/40 border-cyan-500/40 shadow-md shadow-cyan-950/20'
                    : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700/80 hover:bg-slate-900/60'
                }`}
              >
                {/* Time */}
                <span className="text-xs font-mono font-medium text-slate-300">
                  {isNow ? 'Now' : formatTime(hour.timestamp)}
                </span>

                {/* Weather Icon */}
                <div className="my-2 p-1.5 rounded-lg bg-slate-900/60">
                  <WeatherIcon
                    conditionId={hour.condition.id}
                    iconCode={hour.condition.icon}
                    isDay={hour.isDay}
                    size={22}
                  />
                </div>

                {/* Metric based on active tab */}
                {activeTab === 'temp' && (
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-bold font-mono text-white">
                      {formatTemperature(hour.temp, preferences)}
                    </span>
                    {popPercent > 15 ? (
                      <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-0.5 mt-0.5">
                        <Droplets size={9} />
                        {popPercent}%
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                        FL {formatTemperature(hour.feelsLike, preferences)}
                      </span>
                    )}
                  </div>
                )}

                {activeTab === 'rain' && (
                  <div className="flex flex-col items-center">
                    <span
                      className={`text-xs font-mono font-bold ${
                        popPercent > 30 ? 'text-cyan-300' : 'text-slate-400'
                      }`}
                    >
                      {popPercent}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {hour.rainMm && hour.rainMm > 0 ? `${hour.rainMm}mm` : '0 mm'}
                    </span>
                  </div>
                )}

                {activeTab === 'wind' && (
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-mono font-semibold text-slate-200">
                      {formatWindSpeed(hour.windSpeed, preferences)}
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono mt-0.5 flex items-center gap-0.5">
                      <Sun size={9} />
                      UV {hour.uvIndex}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
