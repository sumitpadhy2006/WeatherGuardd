import React from 'react';
import { motion } from 'motion/react';
import { useWeather } from '../../hooks/useWeather';
import { useLocation } from '../../context/LocationContext';
import { usePreferences } from '../../context/PreferencesContext';
import { useAuth } from '../../context/AuthContext';
import { CurrentHeroCard } from './CurrentHeroCard';
import { ImmediateOutlook } from './ImmediateOutlook';
import { SynopticOutlook } from './SynopticOutlook';
import { EnvironmentalGrid } from './EnvironmentalGrid';
import { SunMoonCard } from './SunMoonCard';
import { WeatherMapPreview } from './WeatherMapPreview';
import { WeatherDashboardSkeleton } from '../common/Skeleton';
import { Button } from '../common/Button';
import { RefreshCw, AlertCircle, MapPin } from 'lucide-react';
import { staggerContainer, fadeInUp } from '../../utils/motion';

interface WeatherDashboardProps {
  onOpenLocations: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const WeatherDashboard: React.FC<WeatherDashboardProps> = ({
  onOpenLocations,
  onNavigateTab,
}) => {
  const { currentLocation } = useLocation();
  const { preferences } = usePreferences();
  const { user } = useAuth();
  const { data, isLoading, error, refresh, isRefreshing } = useWeather(
    currentLocation,
    preferences.refreshIntervalMinutes
  );

  if (currentLocation.id === 'loc_placeholder') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4 w-full">
        <MapPin size={48} className="text-cyan-400 mb-6 opacity-80" />
        <h2 className="text-3xl md:text-4xl font-light text-white mb-4">No Location Selected</h2>
        <p className="text-slate-400 text-lg max-w-md mb-8">
          Search for your city in the top bar above to view the Atmosphere Core dashboard.
        </p>
      </div>
    );
  }

  if (isLoading && !data) {
    return <WeatherDashboardSkeleton />;
  }

  if (error && !data) {
    return (
      <div className="p-8 text-center bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl max-w-lg mx-auto my-12 space-y-4 shadow-2xl">
        <AlertCircle size={44} className="text-red-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-100">Atmospheric Telemetry Ingestion Interrupted</h3>
        <p className="text-xs text-slate-400">{error}</p>
        <Button variant="primary" onClick={() => refresh()} icon={<RefreshCw size={16} />}>
          Retry Telemetry Ingestion
        </Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      variants={preferences.reducedMotion ? undefined : staggerContainer}
      initial={preferences.reducedMotion ? undefined : 'hidden'}
      animate={preferences.reducedMotion ? undefined : 'visible'}
      className="space-y-5 pb-8 max-w-7xl mx-auto"
    >
      {/* ========================================================= */}
      {/* 1. LOCATION + HERO WEATHER EXPERIENCE                     */}
      {/* ========================================================= */}
      <motion.div variants={preferences.reducedMotion ? undefined : fadeInUp}>
        <CurrentHeroCard
          weather={data}
          preferences={preferences}
          onOpenLocations={onOpenLocations}
          onNavigateTab={onNavigateTab}
        />
      </motion.div>

      {/* ========================================================= */}
      {/* 2. IMMEDIATE WEATHER OUTLOOK & 48-HOUR TIMELINE           */}
      {/* ========================================================= */}
      <motion.div variants={preferences.reducedMotion ? undefined : fadeInUp}>
        <ImmediateOutlook
          hourly={data.hourly}
          minutelyRain={data.minutelyRain}
          isRainingNow={data.condition.main === 'Rain'}
          preferences={preferences}
          celestial={data.celestial}
        />
      </motion.div>

      {/* ========================================================= */}
      {/* TWO-COLUMN CORE METEOROLOGICAL BLOCK                      */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: 7-Day Synoptic Outlook (6 Cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* 3. DAILY / MULTI-DAY FORECAST */}
          <motion.div variants={preferences.reducedMotion ? undefined : fadeInUp}>
            <SynopticOutlook
              daily={data.daily}
              currentTemp={data.temp}
              preferences={preferences}
            />
          </motion.div>

          {/* 6. SUN & MOON CELESTIAL EPHEMERIS */}
          {data.celestial && (
            <motion.div variants={preferences.reducedMotion ? undefined : fadeInUp}>
              <SunMoonCard
                celestial={data.celestial}
                isDay={data.isDay}
                onNavigateTab={onNavigateTab}
              />
            </motion.div>
          )}
        </div>

        {/* Right Column: Environmental Diagnostics & Intelligence (6 Cols) */}
        <div className="lg:col-span-6 space-y-5">
          <motion.div variants={preferences.reducedMotion ? undefined : fadeInUp}>
            <EnvironmentalGrid
              weather={data}
              preferences={preferences}
            />
          </motion.div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SYNOPTIC RADAR & SATELLITE MAP PREVIEW                 */}
      {/* ========================================================= */}
      <motion.div variants={preferences.reducedMotion ? undefined : fadeInUp}>
        <WeatherMapPreview
          weather={data}
          onNavigateTab={onNavigateTab}
        />
      </motion.div>
    </motion.div>
  );
};
