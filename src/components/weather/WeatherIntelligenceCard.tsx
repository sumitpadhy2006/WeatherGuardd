import React from 'react';
import { CurrentWeatherPayload, UserRole } from '../../types';
import { Badge } from '../common/Badge';
import { formatTime, formatTemperatureWithUnit } from '../../utils/formatters';
import {
  Sparkles,
  Zap,
  TrendingUp,
  AlertTriangle,
  Compass,
  ArrowRight,
  ShieldCheck,
  Footprints,
  Plane,
  Camera,
  Sprout,
  Moon,
} from 'lucide-react';

interface WeatherIntelligenceCardProps {
  weather: CurrentWeatherPayload;
  role?: UserRole;
  onNavigateTab?: (tab: string) => void;
}

export const WeatherIntelligenceCard: React.FC<WeatherIntelligenceCardProps> = ({
  weather,
  role = 'general',
  onNavigateTab,
}) => {
  // Synthesize contextual intelligence
  const isRain = weather.condition.main === 'Rain' || (weather.hourly[0]?.pop || 0) > 0.4;
  const isHighUv = weather.uvIndex >= 6;
  const isWindy = weather.windSpeed > 25;
  const isClearNight = !weather.isDay && weather.cloudCoverPercent < 30;

  // Role-specific recommendation
  const getRoleInsight = () => {
    switch (role) {
      case 'runner':
        return {
          icon: <Footprints size={15} className="text-emerald-400" />,
          title: 'Athletic / Runner Dispatch',
          text: isRain
            ? 'Wet surface friction reduction. Recommend water-resistant footwear and high-visibility outer layer.'
            : weather.temp > 28
            ? 'Thermal exertion alert. Schedule hydration breaks and avoid midday solar peaks.'
            : 'Optimal atmospheric temperature and oxygen density for distance running.',
          badge: isRain || weather.temp > 28 ? 'Caution' : 'Optimal',
          badgeVariant: (isRain || weather.temp > 28 ? 'amber' : 'emerald') as 'amber' | 'emerald',
        };
      case 'drone_operator':
        return {
          icon: <Plane size={15} className="text-cyan-400" />,
          title: 'UAV / Drone Operations',
          text: isWindy
            ? `Turbulence aloft with surface winds reaching ${Math.round(weather.windSpeed)} km/h. Maintain safety buffers.`
            : isRain
            ? 'Precipitation active. Moisture risk to optical gimbal sensors.'
            : 'Favorable laminar air currents with clear line-of-sight visual flight conditions.',
          badge: isWindy || isRain ? 'Advisory' : 'Cleared VFR',
          badgeVariant: (isWindy || isRain ? 'amber' : 'emerald') as 'amber' | 'emerald',
        };
      case 'photographer':
        return {
          icon: <Camera size={15} className="text-amber-400" />,
          title: 'Optics & Golden Hour',
          text: weather.celestial
            ? `Next golden hour window opens around ${weather.celestial.goldenHourEvening}. Diffused cloud ratio: ${weather.cloudCoverPercent}%.`
            : 'Soft atmospheric scattering with balanced contrast ratio across the horizon.',
          badge: 'Favorable',
          badgeVariant: 'cyan' as 'cyan',
        };
      case 'farmer':
        return {
          icon: <Sprout size={15} className="text-emerald-400" />,
          title: 'Agricultural Microclimate',
          text: isRain
            ? 'Surface runoff active. Halt spray treatments until canopy evaporation stabilizes.'
            : `Relative humidity at ${weather.humidity}% and dew point ${weather.dewPoint}°C provide favorable soil moisture retention.`,
          badge: isRain ? 'Delay Spraying' : 'Favorable',
          badgeVariant: (isRain ? 'amber' : 'emerald') as 'amber' | 'emerald',
        };
      case 'astronomer':
        return {
          icon: <Moon size={15} className="text-indigo-400" />,
          title: 'Stargazing & Astronomical Seeing',
          text: weather.celestial
            ? `Stargazing score is ${weather.celestial.stargazingScore}% (${weather.celestial.stargazingRating}). Moon illumination is ${weather.celestial.moonIlluminationPercent}%.`
            : 'Astronomical seeing conditions calculated from cloud and turbulence layers.',
          badge: weather.celestial?.stargazingRating || 'Good',
          badgeVariant: (weather.celestial?.stargazingScore && weather.celestial.stargazingScore > 65 ? 'emerald' : 'cyan') as 'emerald' | 'cyan',
        };
      case 'general':
      default:
        return {
          icon: <ShieldCheck size={15} className="text-cyan-400" />,
          title: 'Daily Operational Synopsis',
          text: isRain
            ? 'Precipitation expected over upcoming hours. Carry rain gear and allow extra commute margin.'
            : isHighUv
            ? `UV peak reaches index ${weather.uvIndex}. Standard sun protection recommended between 11 AM - 3 PM.`
            : 'Stable weather parameters across the region. Suitable for unrestricted outdoor activities.',
          badge: 'Normal',
          badgeVariant: 'cyan' as 'cyan',
        };
    }
  };

  const roleInsight = getRoleInsight();

  return (
    <div
      id="weather-intelligence-card"
      className="rounded-3xl border border-white/12 bg-slate-900/60 backdrop-blur-2xl p-4 sm:p-5 shadow-xl transition-all space-y-3.5"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-amber-400" />
          <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-200">
            Weather Intelligence & Operational Feasibility
          </h2>
        </div>
        <Badge variant="cyan" size="sm">
          Active Role: {role.toUpperCase().replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Box 1: Situational Awareness */}
        <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/8 space-y-1.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
              <Zap size={14} className="text-cyan-400" />
              <span>Real-Time Atmospheric State</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mt-1.5">
              {weather.condition.description}. Cloud coverage stands at{' '}
              <strong>{weather.cloudCoverPercent}%</strong> with air quality index rated{' '}
              <strong>{weather.airQuality.category} ({weather.airQuality.aqi})</strong>.
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/5 pt-1.5">
            <span>Thermal Comfort: {weather.temp > 24 ? 'Warm' : weather.temp < 10 ? 'Cool' : 'Temperate'}</span>
            <span>Humidity: {weather.humidity}%</span>
          </div>
        </div>

        {/* Box 2: Contextual Role Advice */}
        <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/8 space-y-1.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                {roleInsight.icon}
                <span>{roleInsight.title}</span>
              </div>
              <Badge variant={roleInsight.badgeVariant} size="sm">
                {roleInsight.badge}
              </Badge>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mt-1.5">
              {roleInsight.text}
            </p>
          </div>

          {onNavigateTab && (
            <div className="flex items-center justify-end pt-1 border-t border-white/5">
              <button
                onClick={() => onNavigateTab('personalization')}
                className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Customize Role & Thresholds</span>
                <ArrowRight size={11} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
