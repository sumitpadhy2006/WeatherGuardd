import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Flame,
  Compass,
  ShieldAlert,
  Wind,
  Bell,
  Activity,
  Layers,
  Info,
} from 'lucide-react';
import { GeoLocationItem } from '../../types';
import { useSpaceWeather } from '../../hooks/useSpaceWeather';
import { NoaaScalesHeader } from './NoaaScalesHeader';
import { UnifiedSolarActivity } from './UnifiedSolarActivity';
import { GeomagneticStormsCenter } from './GeomagneticStormsCenter';
import { AuroraForecastMap } from './AuroraForecastMap';
import { SolarWindGauge } from './SolarWindGauge';
import { SpaceWeatherAlertsFeed } from './SpaceWeatherAlertsFeed';

interface SpaceWeatherPageProps {
  currentLocation: GeoLocationItem | null;
}

type TabType = 'solar-activity' | 'geomagnetic' | 'aurora' | 'solarwind' | 'alerts';

export const SpaceWeatherPage: React.FC<SpaceWeatherPageProps> = ({ currentLocation }) => {
  const [activeTab, setActiveTab] = useState<TabType>('solar-activity');

  const {
    data,
    solarFlares,
    cmes,
    geomagnetic,
    aurora,
    solarWind,
    alerts,
    solarCycle,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
  } = useSpaceWeather({ currentLocation });

  const TABS = [
    { id: 'solar-activity', label: 'Solar Activity', icon: <Flame size={15} /> },
    { id: 'geomagnetic', label: 'Geomagnetic Storms', icon: <ShieldAlert size={15} /> },
    { id: 'aurora', label: 'Aurora Forecast', icon: <Sparkles size={15} /> },
    { id: 'solarwind', label: 'Solar Wind (L1)', icon: <Wind size={15} /> },
    { id: 'alerts', label: 'Alerts & Bulletins', icon: <Bell size={15} />, badge: alerts.length > 0 ? `${alerts.length}` : undefined },
  ];

  return (
    <div className="space-y-6 pb-16" id="spaceweather-page">
      {/* Top Header & Navigation Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1.5">
              <Activity size={11} />
              NASA DONKI & NOAA SWPC
            </span>
            <span className="text-xs font-mono text-slate-400">
              Station: {currentLocation?.name || 'San Francisco, CA'} ({currentLocation?.lat.toFixed(2) || '37.77'}°N)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Space Weather & Solar Physics Hub
          </h1>
        </div>

        {/* Refresh & Last Updated */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">
            Updated {new Date(lastUpdated).toLocaleTimeString()}
          </span>

          <button
            onClick={() => refresh()}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white text-xs font-mono transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold shadow-lg shadow-amber-500/10'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {isLoading && !data && (
        <div className="p-12 text-center font-mono text-slate-400 space-y-3">
          <RefreshCw size={24} className="animate-spin mx-auto text-amber-400" />
          <p className="text-sm">Connecting to NASA DONKI & NOAA SWPC space physics feeds...</p>
        </div>
      )}

      {/* Main Content Area */}
      {data && (
        <div className="space-y-6">

          {/* Tab Content Render */}
          {activeTab === 'solar-activity' && (
            <UnifiedSolarActivity data={data} currentLocation={currentLocation} />
          )}

          {activeTab === 'geomagnetic' && <GeomagneticStormsCenter geomagnetic={geomagnetic} />}

          {activeTab === 'aurora' && <AuroraForecastMap aurora={aurora} />}

          {activeTab === 'solarwind' && <SolarWindGauge solarWind={solarWind} />}

          {activeTab === 'alerts' && <SpaceWeatherAlertsFeed alerts={alerts} />}

          {/* Show NOAA Scales Header below the main visualizer */}
          <NoaaScalesHeader solarCycle={solarCycle} lastUpdated={lastUpdated} />
        </div>
      )}
    </div>
  );
};
