import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useWeather } from '../../hooks/useWeather';
import { useLocation } from '../../context/LocationContext';
import { usePreferences } from '../../context/PreferencesContext';
import { useAuth } from '../../context/AuthContext';
import { GeoLocationItem } from '../../types';
import { WeatherIcon } from '../common/WeatherIcon';
import { AnimatedNumber } from '../common/AnimatedNumber';
import { WeatherDashboardSkeleton } from '../common/Skeleton';
import { MiniRadarMap } from './MiniRadarMap';
import { WeatherIntelligenceCard } from '../weather/WeatherIntelligenceCard';
import { LifestyleGrid } from '../weather/LifestyleGrid';
import { SunMoonCard } from '../weather/SunMoonCard';
import {
  formatTemperature,
  formatWindSpeed,
  formatTime,
  toUserTemp,
  formatCoordinates,
} from '../../utils/formatters';
import { getWindCardinal } from '../../utils/calculations';
import {
  Navigation,
  Sparkles,
  Droplets,
  Wind,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Activity,
  Maximize2,
  RefreshCw,
  AlertCircle,
  MapPin,
  X,
} from 'lucide-react';
import { Button } from '../common/Button';
import { fadeInUp, staggerContainer } from '../../utils/motion';
import { HomeTopClock } from './HomeTopClock';

interface HomePageProps {
  onOpenLocations: () => void;
  onNavigateTab: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenLocations,
  onNavigateTab,
}) => {
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const { currentLocation } = useLocation();
  const { preferences } = usePreferences();
  const { user } = useAuth();
  const { data: weather, isLoading, error, refresh } = useWeather(
    currentLocation,
    preferences.refreshIntervalMinutes
  );

  if (currentLocation.id === 'loc_placeholder') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4 w-full">
        <MapPin size={48} className="text-cyan-400 mb-6 opacity-80" />
        <h2 className="text-3xl md:text-4xl font-light text-white mb-4">No Location Selected</h2>
        <p className="text-black text-lg max-w-md mb-8">
          Search for your city in the top bar above to see your local weather telemetry and forecasts.
        </p>
      </div>
    );
  }

  if (isLoading && !weather) {
    return <WeatherDashboardSkeleton />;
  }

  if (error && !weather) {
    return (
      <div className="p-8 text-center bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl max-w-lg mx-auto my-12 space-y-4 shadow-2xl">
        <AlertCircle size={44} className="text-red-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-100">Weather Telemetry Offline</h3>
        <p className="text-xs text-slate-400">{error}</p>
        <Button variant="primary" onClick={() => refresh()} icon={<RefreshCw size={16} />}>
          Retry Ingestion
        </Button>
      </div>
    );
  }

  if (!weather) return null;

  const isFahrenheit = preferences.tempUnit === 'F' || preferences.units === 'imperial';
  const unitLetter = isFahrenheit ? 'F' : 'C';
  const currentTemp = Math.round(toUserTemp(weather.temp, preferences));
  const maxTemp = Math.round(toUserTemp(weather.tempMax, preferences));
  const minTemp = Math.round(toUserTemp(weather.tempMin, preferences));
  const windCardinal = getWindCardinal(weather.windDeg);
  const rainPop = Math.round((weather.hourly?.[0]?.pop ?? 0) * 100);

  // Format 2 words description in Title Case
  const formatShortDescription = (desc: string) => {
    if (!desc) return 'Clear Sky';
    const words = desc
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    
    if (words.length <= 2) {
      return words.join(' ');
    }
    return `${words[0]} ${words[1]}`;
  };

  const shortDescription = formatShortDescription(weather.condition.description);
  const locationTag = (currentLocation.placeLabel && currentLocation.placeLabel !== 'Custom' ? currentLocation.placeLabel.toUpperCase() : null) || currentLocation.nickname?.toUpperCase() || (currentLocation.category?.toUpperCase() || (currentLocation.isDefault ? 'HOME' : 'LOCATION'));

  const getCityName = () => {
    if (currentLocation?.city) return currentLocation.city;
    let n = currentLocation?.name || 'Unknown Location';
    if (currentLocation?.state) n = n.replace(currentLocation.state, '');
    if (currentLocation?.country) n = n.replace(currentLocation.country, '');
    return n.replace(/\s*\([A-Za-z]*\)/g, '').replace(/\s+(East|West|North|South)$/i, '').replace(/,/g, '').trim();
  };

  // Generate concise top weather insight
  const getTopInsight = () => {
    if (weather.condition.main === 'Rain' || weather.condition.main === 'Thunderstorm') {
      return {
        icon: <Droplets size={16} className="text-cyan-400 shrink-0" />,
        text: 'Precipitation active. Carry rain protection and allow extra transit margin.',
        highlight: 'Precipitation Alert',
        color: 'border-cyan-500/30 bg-cyan-950/40 text-cyan-200',
      };
    }

    const rainUpcoming = weather.hourly.slice(0, 12).find((h) => h.pop > 0.45);
    if (rainUpcoming) {
      const timeStr = formatTime(rainUpcoming.timestamp);
      return {
        icon: <Droplets size={16} className="text-cyan-400 shrink-0" />,
        text: `Precipitation expected around ${timeStr} (${Math.round(rainUpcoming.pop * 100)}% probability).`,
        highlight: 'Rain Window',
        color: 'border-cyan-500/30 bg-cyan-950/40 text-cyan-200',
      };
    }

    if (weather.uvIndex >= 7 && weather.isDay) {
      return {
        icon: <Sun size={16} className="text-amber-400 shrink-0" />,
        text: `Very high UV Index of ${weather.uvIndex} today. Sun protection strongly recommended between 11 AM – 3 PM.`,
        highlight: 'High UV',
        color: 'border-amber-500/30 bg-amber-950/40 text-amber-200',
      };
    }

    if (weather.windSpeed > 35) {
      return {
        icon: <Wind size={16} className="text-indigo-400 shrink-0" />,
        text: `Elevated wind gusts up to ${Math.round(weather.windGust || weather.windSpeed * 1.4)} km/h.`,
        highlight: 'Wind Advisory',
        color: 'border-indigo-500/30 bg-indigo-950/40 text-indigo-200',
      };
    }

    if (!weather.isDay && weather.celestial && weather.celestial.stargazingScore >= 70) {
      return {
        icon: <Sparkles size={16} className="text-purple-400 shrink-0" />,
        text: `Clear night skies ahead — ${weather.celestial.stargazingRating} astronomical viewing conditions (${weather.celestial.stargazingScore}% SQI).`,
        highlight: 'Stargazing Ideal',
        color: 'border-purple-500/30 bg-purple-950/40 text-purple-200',
      };
    }

    if (weather.airQuality.aqi > 100) {
      return {
        icon: <AlertTriangle size={16} className="text-amber-400 shrink-0" />,
        text: `Air quality is ${weather.airQuality.category} (AQI ${weather.airQuality.aqi}). Sensitive groups should limit outdoor exertion.`,
        highlight: 'Air Quality Advisory',
        color: 'border-amber-500/30 bg-amber-950/40 text-amber-200',
      };
    }

    return {
      icon: <ShieldCheck size={16} className="text-emerald-400 shrink-0" />,
      text: 'Stable and comfortable atmospheric conditions across the region for all outdoor routines.',
      highlight: 'Optimal Conditions',
      color: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-200',
    };
  };

  const topInsight = getTopInsight();

  return (
    <motion.div
      variants={preferences.reducedMotion ? undefined : staggerContainer}
      initial={preferences.reducedMotion ? undefined : 'hidden'}
      animate={preferences.reducedMotion ? undefined : 'visible'}
      className="pb-12 w-full select-none"
    >
      {/* ========================================================= */}
      {/* TOP HEADER: TOP-RIGHT LIVE TIME, DATE & DAY CLOCK         */}
      {/* ========================================================= */}
      {/* The absolute positioning breaks out of the max-w-7xl constraint and anchors to the main scroll container edges */}
      <motion.div
        variants={preferences.reducedMotion ? undefined : fadeInUp}
        className="relative sm:absolute sm:top-20 px-4 sm:left-6 lg:left-8 sm:right-6 lg:right-8 flex items-start justify-center sm:justify-end pointer-events-none z-10 mb-4 sm:mb-0"
      >
        {/* Location tag removed per user request */}

        {/* Top Right Corner: Plain & Smart Time, Date, Day & Timezone Clock (pushed to right) */}
        <HomeTopClock
          currentLocation={currentLocation}
          className="pointer-events-auto"
        />
      </motion.div>

      {/* Main Content Wrapper (Centered, Max Width) */}
      <div className="max-w-5xl mx-auto space-y-4 px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* ========================================================= */}
        {/* BOX-LESS HERO WEATHER PRESENTATION                        */}
        {/* ========================================================= */}
        <motion.div
          variants={preferences.reducedMotion ? undefined : fadeInUp}
          className="flex flex-col items-center justify-center text-center pt-0 pb-2 space-y-0.5"
        >
        {/* Navigation Indicator / Category */}
        <button
          onClick={onOpenLocations}
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-300/90 hover:text-white transition-colors cursor-pointer mb-0.5 group"
          title="Change location"
        >
          <Navigation size={12} className="fill-current text-slate-300 group-hover:text-white transition-colors" />
          <span>{locationTag}</span>
        </button>

        {/* City Name */}
        <button
          onClick={onOpenLocations}
          className="flex flex-col items-center cursor-pointer group"
          title="Change or search location"
        >
          <span className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white group-hover:text-cyan-100 transition-colors drop-shadow-md pb-0.5">
            {getCityName()}
          </span>
          {([currentLocation?.state, currentLocation?.country].filter(Boolean).length > 0 || (currentLocation?.name && currentLocation.name.includes(','))) && (
            <span className="text-sm sm:text-base font-light text-slate-300 group-hover:text-slate-200 transition-colors drop-shadow-sm mt-1 mb-1">
              {[currentLocation?.state, currentLocation?.country].filter(Boolean).join(', ') || currentLocation?.name?.split(',').slice(1).join(', ').trim()}
            </span>
          )}
        </button>

        {/* Temperature */}
        <div className="text-6xl sm:text-8xl md:text-9xl font-extralight tracking-tighter text-white font-sans drop-shadow-lg -my-2 sm:-my-3 flex items-start justify-center">
          <span>
            <AnimatedNumber value={currentTemp} decimals={0} />
          </span>
          <span className="flex items-baseline ml-0.5 mt-2">
            <span className="text-4xl sm:text-5xl md:text-6xl font-light text-white/90">
              °
            </span>
            <span className="text-2xl sm:text-3xl md:text-4xl font-light text-cyan-300/90 ml-0.5 uppercase">
              {unitLetter}
            </span>
          </span>
        </div>

        {/* 2 Words Description */}
        <div className="text-xl sm:text-2xl font-medium text-slate-200 drop-shadow-md pt-0.5">
          {shortDescription}
        </div>

        {/* High / Low Temp */}
        <div className="text-base sm:text-lg font-medium text-slate-300/90 drop-shadow-md pb-1.5">
          H:{maxTemp}°{unitLetter} &nbsp; L:{minTemp}°{unitLetter}
        </div>

        {/* Nicely arranged metrics below without any boxes */}
        <div className="pt-1 flex flex-col items-center space-y-0.5 text-sm sm:text-base font-normal text-slate-200/95 drop-shadow-md">
          <div>
            Rain: <span className="font-semibold text-white">{rainPop}%</span>
          </div>

          <div>
            AQI: <span className="font-semibold text-white">{weather.airQuality.aqi}</span>{' '}
            <span className="text-slate-300">({weather.airQuality.category})</span>
          </div>

          <div>
            Wind: <span className="font-semibold text-white">{formatWindSpeed(weather.windSpeed, preferences)}</span>{' '}
            <span className="text-slate-300">({windCardinal})</span>
          </div>
        </div>
      </motion.div>

      {/* ========================================================= */}
      {/* IMPORTANT WEATHER INSIGHT BANNER                          */}
      {/* ========================================================= */}
      <motion.div
        variants={preferences.reducedMotion ? undefined : fadeInUp}
        className={`px-4 py-3 rounded-2xl border backdrop-blur-xl flex items-center justify-between gap-3 text-xs shadow-md ${topInsight.color}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {topInsight.icon}
          <div className="min-w-0">
            <span className="font-bold mr-1.5">{topInsight.highlight}:</span>
            <span className="text-slate-100 font-normal leading-relaxed">{topInsight.text}</span>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('weather')}
          className="text-[11px] font-semibold text-slate-300 hover:text-white shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>More</span>
          <ArrowRight size={11} />
        </button>
      </motion.div>

      {/* ========================================================= */}
      {/* COMPACT HOURLY FORECAST HORIZONTAL STRIP                  */}
      {/* ========================================================= */}
      <motion.div
        variants={preferences.reducedMotion ? undefined : fadeInUp}
        className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl p-4 sm:p-5 shadow-xl space-y-3"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-sans">
            Hourly Forecast (Next 24 Hours)
          </span>
          <span className="text-[11px] font-mono text-slate-400">Horizontal Scroll →</span>
        </div>

        <div className="overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-700">
          <div className="flex gap-2 min-w-max py-1">
            {weather.hourly.slice(0, 24).map((hour, idx) => {
              const isNow = idx === 0;
              const popPercent = Math.round(hour.pop * 100);

              return (
                <div
                  key={hour.timestamp}
                  className={`flex flex-col items-center justify-between p-2.5 rounded-2xl min-w-[70px] sm:min-w-[76px] transition-all border ${
                    isNow
                      ? 'bg-cyan-950/50 border-cyan-500/50 shadow-md shadow-cyan-950/30'
                      : 'bg-slate-950/40 border-white/8 hover:border-white/20 hover:bg-slate-900/60'
                  }`}
                >
                  <span className="text-[11px] font-mono font-medium text-slate-300">
                    {isNow ? 'Now' : formatTime(hour.timestamp)}
                  </span>

                  <div className="my-1.5 p-1 rounded-lg">
                    <WeatherIcon
                      conditionId={hour.condition.id}
                      iconCode={hour.condition.icon}
                      isDay={hour.isDay}
                      size={24}
                    />
                  </div>

                  <span className="text-xs sm:text-sm font-bold font-mono text-white">
                    {formatTemperature(hour.temp, preferences)}
                  </span>

                  {popPercent > 10 ? (
                    <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-0.5 mt-0.5 font-semibold">
                      <Droplets size={8} />
                      {popPercent}%
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {hour.isDay ? 'Clear' : 'Night'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ========================================================= */}
      {/* TWO-COLUMN GRID: SNAPSHOTS + EPHEMERIS + RADAR PREVIEW    */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Left Column (7 Cols): Environmental Metrics & Ephemeris */}
        <div className="md:col-span-7 space-y-4">
          {/* COMPACT ENVIRONMENTAL SNAPSHOT */}
          <motion.div
            variants={preferences.reducedMotion ? undefined : fadeInUp}
            className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl p-4 sm:p-5 shadow-xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-sans">
                Environmental Snapshot
              </span>
              <button
                onClick={() => onNavigateTab('weather')}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Full Telemetry</span>
                <ArrowRight size={11} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* AQI */}
              <button
                onClick={() => onNavigateTab('weather')}
                className="p-3 rounded-2xl bg-slate-950/50 hover:bg-slate-950/70 border border-white/8 hover:border-cyan-500/30 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Air Quality</span>
                  <Activity size={13} className="text-emerald-400" />
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-lg font-bold font-mono text-white">
                    {weather.airQuality.aqi}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-medium">
                    {weather.airQuality.category}
                  </span>
                </div>
              </button>

              {/* UV Index */}
              <button
                onClick={() => onNavigateTab('weather')}
                className="p-3 rounded-2xl bg-slate-950/50 hover:bg-slate-950/70 border border-white/8 hover:border-amber-500/30 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>UV Index</span>
                  <Sun size={13} className="text-amber-400" />
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-lg font-bold font-mono text-white">
                    {weather.uvIndex}
                  </span>
                  <span className="text-[11px] text-amber-300 font-medium">
                    {weather.uvIndex >= 8 ? 'Very High' : weather.uvIndex >= 6 ? 'High' : weather.uvIndex >= 3 ? 'Moderate' : 'Low'}
                  </span>
                </div>
              </button>

              {/* Humidity */}
              <button
                onClick={() => onNavigateTab('weather')}
                className="p-3 rounded-2xl bg-slate-950/50 hover:bg-slate-950/70 border border-white/8 hover:border-cyan-500/30 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Humidity</span>
                  <Droplets size={13} className="text-cyan-400" />
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-lg font-bold font-mono text-white">
                    {weather.humidity}%
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    DP {formatTemperature(weather.dewPoint, preferences)}
                  </span>
                </div>
              </button>

              {/* Wind Vector */}
              <button
                onClick={() => onNavigateTab('weather')}
                className="p-3 rounded-2xl bg-slate-950/50 hover:bg-slate-950/70 border border-white/8 hover:border-cyan-500/30 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Wind</span>
                  <Wind size={13} className="text-cyan-400" />
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-sm sm:text-base font-bold font-mono text-white truncate">
                    {formatWindSpeed(weather.windSpeed, preferences)}
                  </span>
                  <span className="text-[11px] text-cyan-300 font-mono shrink-0">
                    {windCardinal}
                  </span>
                </div>
              </button>
            </div>
          </motion.div>

        </div>

        {/* Right Column (5 Cols): Compact Weather Map Preview */}
        <div className="md:col-span-5 space-y-4">
          {/* SMALL WEATHER MAP PREVIEW */}
          <motion.div
            variants={preferences.reducedMotion ? undefined : fadeInUp}
            className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl p-4 sm:p-5 shadow-xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-sans">
                Local Radar Preview
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/20">
                ACTIVE
              </span>
            </div>

            {/* Compact Map Canvas */}
            <div
              className="relative h-44 w-full rounded-2xl bg-slate-950/80 border border-white/10 overflow-hidden group"
            >
              <MiniRadarMap lat={weather.location.lat} lon={weather.location.lon} locationName={getCityName()} />

              {/* Top-Right expand button (instead of full overlay) */}
              <div 
                onClick={() => setIsMapExpanded(true)}
                className="absolute top-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-xl cursor-pointer hover:scale-105 transition-transform z-20"
              >
                <Maximize2 size={13} />
                <span className="hidden sm:inline">Expand Radar</span>
              </div>

              <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-[10px] font-mono text-slate-300 z-20 pointer-events-none">
                {formatCoordinates(weather.location.lat, weather.location.lon)}
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('earthwatch')}
              className="w-full py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-slate-200 hover:text-cyan-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Explore Earth Watch & 3D Maps</span>
              <ArrowRight size={12} />
            </button>
          </motion.div>
        </div>
      </div>

      {/* SUN & MOON EPHEMERIS (Using SunMoonCard) */}
      {weather.celestial && (
        <motion.div variants={preferences.reducedMotion ? undefined : fadeInUp} className="mt-4">
          <SunMoonCard
            celestial={weather.celestial}
            isDay={weather.isDay}
            onNavigateTab={onNavigateTab}
          />
        </motion.div>
      )}

      {/* Feasibility Widgets from Atmosphere Core */}
      <div className="space-y-4 mt-6">
        <WeatherIntelligenceCard
          weather={weather}
          role={user?.role || 'general'}
          onNavigateTab={onNavigateTab}
        />
        <LifestyleGrid
          weather={weather}
          role={user?.role || 'general'}
        />
      </div>

      </div>

      {/* MAP EXPAND MODAL */}
      <AnimatePresence>
        {isMapExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
          >
            <div className="relative w-full h-full max-w-5xl max-h-[85vh] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/80">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity size={18} className="text-cyan-400" /> Local Radar
                </h3>
                <button
                  onClick={() => setIsMapExpanded(false)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 w-full h-full relative">
                <MiniRadarMap lat={weather.location.lat} lon={weather.location.lon} locationName={getCityName()} />
                <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-slate-300 z-20 pointer-events-none">
                  {formatCoordinates(weather.location.lat, weather.location.lon)}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
