import React from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import { useClimate } from '../../context/ClimateContext';
import { useAtmosphere } from '../../context/AtmosphereContext';
import DynamicSky, { TimeOfDayStr } from './DynamicSky';

interface BackgroundLayerProps {
  className?: string;
  children?: React.ReactNode;
}

export const BackgroundLayer: React.FC<BackgroundLayerProps> = React.memo(({
  className = '',
  children,
}) => {
  const { preferences } = usePreferences();
  const { timeOfDay: timeOfDayNum, weather } = useClimate();
  const { weather: activeWeather } = useAtmosphere();

  const celestial = activeWeather?.celestial;

  const isEnabled = preferences.ambientEffectsEnabled !== false;

  const getTimeStr = (t: number): TimeOfDayStr => {
    if (t >= 5 && t < 10) return 'morning';
    if (t >= 10 && t < 16) return 'afternoon';
    if (t >= 16 && t < 18) return 'evening';
    if (t >= 18 && t < 20) return 'sunset';
    return 'night';
  };

  return (
    <div
      id="weatherguard-background-layer"
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-all duration-1000 ease-in-out ${className}`}
      aria-hidden="true"
    >
      {isEnabled ? (
        <DynamicSky 
          timeOfDay={getTimeStr(timeOfDayNum)} 
          weatherCondition={weather} 
          isDarkMode={true} 
          moonIllumination={celestial?.moonIlluminationPercent ?? 100}
          moonPhaseName={celestial?.moonPhaseName ?? 'Full Moon'}
        />
      ) : (
        <div className="absolute inset-0 bg-[#070B12]" />
      )}

      {/* Atmospheric Horizon Haze removed per user request */}

      {children}
    </div>
  );
});
