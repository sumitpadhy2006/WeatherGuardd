import React from 'react';
import { CurrentWeatherPayload, UserPreferences } from '../../types';
import { WeatherIcon } from '../common/WeatherIcon';
import { Badge } from '../common/Badge';
import { AnimatedNumber } from '../common/AnimatedNumber';
import { WeatherCharacter } from '../effects/WeatherCharacter';
import { computeAtmosphereState } from '../effects/AtmosphereSkyEngine';
import {
  formatTemperature,
  formatTemperatureWithUnit,
  formatCoordinates,
  toUserTemp,
} from '../../utils/formatters';
import { getBeaufortScale } from '../../utils/calculations';
import {
  ShieldCheck,
  MapPin,
  Sparkles,
  Droplets,
  Wind,
  Gauge,
  Eye,
} from 'lucide-react';

interface CurrentHeroCardProps {
  weather: CurrentWeatherPayload;
  preferences: UserPreferences;
  onOpenLocations: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const CurrentHeroCard: React.FC<CurrentHeroCardProps> = ({
  weather,
  preferences,
  onOpenLocations,
  onNavigateTab,
}) => {
  const beaufort = getBeaufortScale(weather.windSpeed);
  const currentTempConverted = toUserTemp(weather.temp, preferences);
  const atmosphereState = computeAtmosphereState(weather, preferences.ambientSimulationMode);

  // Dynamic ambient atmospheric glow classes based on live weather condition & time
  const getAmbientGlowClasses = () => {
    switch (atmosphereState) {
      case 'sunrise':
      case 'golden_hour':
        return 'from-amber-500/25 via-orange-500/15 to-transparent';
      case 'sunset':
      case 'dusk':
        return 'from-pink-500/25 via-purple-500/15 to-transparent';
      case 'thunderstorm':
        return 'from-purple-600/30 via-indigo-600/20 to-transparent';
      case 'light_rain':
      case 'heavy_rain':
      case 'rainy_night':
        return 'from-blue-500/25 via-cyan-600/15 to-transparent';
      case 'snow':
        return 'from-cyan-400/25 via-sky-300/15 to-transparent';
      case 'fog':
        return 'from-slate-400/20 via-slate-500/10 to-transparent';
      case 'aurora':
        return 'from-emerald-500/25 via-teal-500/15 to-transparent';
      case 'clear_night':
      case 'cloudy_night':
        return 'from-indigo-500/25 via-blue-700/15 to-transparent';
      case 'clear_day':
      default:
        return 'from-cyan-500/25 via-blue-500/15 to-transparent';
    }
  };

  return (
    <div
      id="current-hero-card"
      className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-950/85 backdrop-blur-3xl p-5 sm:p-6 shadow-2xl transition-all"
    >
      {/* Dynamic Ambient Sky Glow Layer */}
      <div
        className={`absolute -top-24 -right-24 w-80 sm:w-96 h-80 sm:h-96 rounded-full blur-3xl pointer-events-none opacity-40 bg-gradient-to-br transition-all duration-1000 ${getAmbientGlowClasses()}`}
      />

      {/* Top Bar: Location + Telemetry Status */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3.5">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLocations}
            className="group flex items-center gap-2 text-left cursor-pointer hover:opacity-90 transition-opacity"
            title="Change Location or Station"
          >
            <div className="p-1.5 rounded-xl bg-white/[0.08] border border-white/10 group-hover:border-cyan-400/40 text-cyan-400 transition-colors">
              <MapPin size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  {weather.location.name}
                </h1>
                {weather.location.country && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/10 text-slate-200 border border-white/10">
                    {weather.location.country}
                  </span>
                )}
              </div>
            </div>
          </button>
          {weather.location.nickname && (
            <Badge variant="cyan" size="sm">
              {weather.location.nickname}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-950/60 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
            <span>{formatCoordinates(weather.location.lat, weather.location.lon)}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-semibold hidden sm:inline">LIVE SYNC</span>
          </div>
        </div>
      </div>

      {/* Main Atmospheric Data & Visual Display */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center my-4">
        {/* Left: Huge Temperature + Condition + High/Low */}
        <div className="lg:col-span-7 flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6 pl-2 sm:pl-4">
          <div className="relative flex items-center justify-center shrink-0">
            <WeatherIcon
              conditionId={weather.condition.id}
              iconCode={weather.condition.icon}
              isDay={weather.isDay}
              size={86}
              className="drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)] hover:scale-105 transition-transform"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-6xl sm:text-7xl font-bold tracking-tight text-white font-mono drop-shadow-md">
                <AnimatedNumber value={currentTempConverted} decimals={0} />
              </span>
              <span className="text-3xl sm:text-4xl text-cyan-300 font-light font-mono">
                {preferences.tempUnit === 'F' ? '°F' : '°C'}
              </span>
            </div>

            <p className="text-lg sm:text-xl font-semibold text-slate-100 capitalize tracking-tight">
              {weather.condition.description}
            </p>

            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300 font-mono">
              <span className="text-slate-300">
                Feels like <strong className="text-white">{formatTemperatureWithUnit(weather.feelsLike, preferences)}</strong>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">
                H: <span className="text-amber-300 font-semibold">{formatTemperatureWithUnit(weather.tempMax, preferences)}</span> L:{' '}
                <span className="text-cyan-300 font-semibold">{formatTemperatureWithUnit(weather.tempMin, preferences)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Atmospheric Summary Pill + Integrated Contextual Observer Silhouette */}
        <div className="lg:col-span-5 flex items-center justify-between gap-3 rounded-2xl bg-slate-950/60 p-3.5 sm:p-4 border border-white/10 backdrop-blur-xl">
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
              <ShieldCheck size={14} className="text-cyan-400" />
              <span>Atmospheric Intelligence</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-snug font-normal">
              {weather.condition.main === 'Rain'
                ? 'Precipitation active. Cloud ceiling is low with elevated boundary moisture.'
                : weather.cloudCoverPercent > 60
                ? 'Overcast stratiform deck with mild thermal stability.'
                : 'Clear and stable planetary boundary layer with unobstructed solar irradiance.'}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono border-t border-white/10 pt-1.5">
              <span>Dew Point: <strong className="text-slate-100">{formatTemperatureWithUnit(weather.dewPoint, preferences)}</strong></span>
              <span>Wind: <strong className="text-cyan-300">{beaufort.label}</strong></span>
            </div>
          </div>

          {/* Atmospheric Human Character Silhouette */}
          <div className="hidden sm:flex shrink-0 items-center justify-center pl-2 border-l border-white/10">
            <WeatherCharacter weather={weather} state={atmosphereState} size="md" />
          </div>
        </div>
      </div>
    </div>
  );
};
