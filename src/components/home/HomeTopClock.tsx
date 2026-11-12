import React, { useState, useEffect } from 'react';
import { GeoLocationItem } from '../../types';
import { getLocalTimeDetails, FormattedLocationTime } from '../../utils/timezone';

interface HomeTopClockProps {
  currentLocation: GeoLocationItem;
  className?: string;
}

export const HomeTopClock: React.FC<HomeTopClockProps> = ({
  currentLocation,
  className = '',
}) => {
  const [timeDetails, setTimeDetails] = useState<FormattedLocationTime>(() =>
    getLocalTimeDetails(currentLocation, new Date())
  );

  // Live real-time 1-second clock tick
  useEffect(() => {
    // Immediately update on location change
    setTimeDetails(getLocalTimeDetails(currentLocation, new Date()));

    const timer = setInterval(() => {
      setTimeDetails(getLocalTimeDetails(currentLocation, new Date()));
    }, 1000);

    return () => clearInterval(timer);
  }, [currentLocation]);

  return (
    <div
      id="home-top-location-clock"
      className={`flex flex-col items-center sm:items-end text-center sm:text-right select-none ${className}`}
    >
      {/* Time: (hr min and sec) */}
      <div className="flex items-baseline gap-1 font-mono text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]">
        <span className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-white">
          {timeDetails.hours}
        </span>
        <span className="text-xl sm:text-2xl font-light text-cyan-300 opacity-90 animate-pulse">
          :
        </span>
        <span className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-white">
          {timeDetails.minutes}
        </span>
        <span className="text-xl sm:text-2xl font-light text-cyan-300 opacity-90 animate-pulse">
          :
        </span>
        <span className="text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight text-cyan-200">
          {timeDetails.seconds}
        </span>
        {timeDetails.ampm && (
          <span className="text-xs sm:text-sm font-semibold text-slate-200/90 ml-1 uppercase tracking-wider">
            {timeDetails.ampm}
          </span>
        )}
      </div>

      {/* Day, Date (date mon yr) and Location Timezone */}
      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-100/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)] mt-0.5">
        <span className="text-cyan-300 font-semibold">{timeDetails.dayName},</span>
        <span>{timeDetails.dateFormatted}</span>
        <span className="text-cyan-400 font-mono text-[11px] sm:text-xs font-bold ml-0.5">
          ({timeDetails.timezoneName})
        </span>
      </div>
    </div>
  );
};

