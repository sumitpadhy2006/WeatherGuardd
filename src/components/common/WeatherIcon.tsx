import React from 'react';
import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudSnow,
  CloudFog,
  Wind,
} from 'lucide-react';

interface WeatherIconProps {
  conditionId?: number;
  iconCode?: string;
  isDay?: boolean;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  conditionId,
  iconCode,
  isDay = true,
  className = 'w-6 h-6',
  size = 24,
}) => {
  // If iconCode is OpenWeather style: '01d', '01n', '10d', etc.
  if (iconCode) {
    const isNightCode = iconCode.endsWith('n');
    const codeNum = iconCode.substring(0, 2);

    switch (codeNum) {
      case '01':
        return isNightCode ? (
          <Moon size={size} className={`${className} text-indigo-300 drop-shadow-[0_0_8px_rgba(165,180,252,0.4)]`} />
        ) : (
          <Sun size={size} className={`${className} text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]`} />
        );
      case '02':
        return isNightCode ? (
          <CloudMoon size={size} className={`${className} text-indigo-200`} />
        ) : (
          <CloudSun size={size} className={`${className} text-amber-300`} />
        );
      case '03':
      case '04':
        return <Cloud size={size} className={`${className} text-slate-300`} />;
      case '09':
        return <CloudDrizzle size={size} className={`${className} text-cyan-400`} />;
      case '10':
        return <CloudRain size={size} className={`${className} text-blue-400`} />;
      case '11':
        return <CloudLightning size={size} className={`${className} text-amber-300 animate-pulse`} />;
      case '13':
        return <CloudSnow size={size} className={`${className} text-sky-200`} />;
      case '50':
        return <CloudFog size={size} className={`${className} text-slate-400`} />;
    }
  }

  // Fallback by condition ID
  if (conditionId) {
    if (conditionId >= 200 && conditionId < 300) {
      return <CloudLightning size={size} className={`${className} text-amber-300`} />;
    }
    if (conditionId >= 300 && conditionId < 400) {
      return <CloudDrizzle size={size} className={`${className} text-cyan-400`} />;
    }
    if (conditionId >= 500 && conditionId < 600) {
      return <CloudRain size={size} className={`${className} text-blue-400`} />;
    }
    if (conditionId >= 600 && conditionId < 700) {
      return <CloudSnow size={size} className={`${className} text-sky-200`} />;
    }
    if (conditionId >= 700 && conditionId < 800) {
      return <CloudFog size={size} className={`${className} text-slate-400`} />;
    }
    if (conditionId === 800) {
      return isDay ? (
        <Sun size={size} className={`${className} text-amber-400`} />
      ) : (
        <Moon size={size} className={`${className} text-indigo-300`} />
      );
    }
    if (conditionId > 800) {
      return isDay ? (
        <CloudSun size={size} className={`${className} text-amber-300`} />
      ) : (
        <CloudMoon size={size} className={`${className} text-indigo-200`} />
      );
    }
  }

  return isDay ? <Sun size={size} className={`${className} text-amber-400`} /> : <Moon size={size} className={`${className} text-indigo-300`} />;
};
