import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Sparkles,
  Globe,
  Star,
  Flame,
  Calendar,
  Eye,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { GeoLocationItem } from '../../types';
import { useAstronomy } from '../../hooks/useAstronomy';
import { useWeather } from '../../hooks/useWeather';
import { SunCenter } from './SunCenter';
import { MoonCenter } from './MoonCenter';
import { NightSkyDome } from './NightSkyDome';
import { PlanetsVisibilityTable } from './PlanetsVisibilityTable';
import { ConstellationsExplorer } from './ConstellationsExplorer';
import { MeteorShowersTracker } from './MeteorShowersTracker';
import { EclipsesTracker } from './EclipsesTracker';
import { StargazingScoreCard } from './StargazingScoreCard';
import { NasaSpaceHub } from './NasaSpaceHub';

interface SpacePageProps {
  currentLocation: GeoLocationItem | null;
}

type SpaceSectionTab =
  | 'sun'
  | 'moon'
  | 'dome'
  | 'planets'
  | 'constellations'
  | 'meteors'
  | 'eclipses'
  | 'stargazing'
  | 'nasa';

export const SpacePage: React.FC<SpacePageProps> = ({ currentLocation }) => {
  const {
    data,
    sun,
    moon,
    planets,
    constellations,
    meteorShowers,
    eclipses,
    stargazingScore,
    apod,
    neoAsteroids,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
    simulatedHourOffset,
    setSimulatedHourOffset,
  } = useAstronomy({ currentLocation });

  const { data: weather } = useWeather(currentLocation || { id: 'default', name: '', lat: 0, lon: 0, country: '' });

  const [activeTab, setActiveTab] = useState<SpaceSectionTab>('dome');
  const [astronomerRedMode, setAstronomerRedMode] = useState<boolean>(false);
  const [domeFocusTargetId, setDomeFocusTargetId] = useState<string | null>(null);

  const handleLocateMoon = () => {
    setActiveTab('dome');
    setDomeFocusTargetId('moon');
  };

  const handleLocatePlanet = (planetId: string) => {
    setActiveTab('dome');
    setDomeFocusTargetId(`planet-${planetId}`);
  };

  const visiblePlanetsCount = planets.filter((p) => p.status === 'visible_now').length;
  const activeMeteorsCount = meteorShowers.filter((s) => s.status === 'active_now' || s.status === 'peak_tonight').length;

  return (
    <div
      className={`min-h-screen pb-24 transition-colors duration-300 ${
        astronomerRedMode ? 'bg-[#0a0000] text-red-400 font-sans' : 'bg-slate-950 text-slate-100'
      }`}
      id="sky-space-page"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Page Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold flex items-center gap-1">
                <Sparkles size={11} />
                Celestial Telemetry
              </span>
              <span className="text-xs font-mono text-slate-400">
                {currentLocation?.name || 'San Francisco, CA'} ({currentLocation?.lat.toFixed(2)}°, {currentLocation?.lon.toFixed(2)}°)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Sky &amp; Space Ephemeris Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              High-precision solar-lunar mechanics, real-time planetarium sky dome &amp; deep-space surveillance
            </p>
          </div>

          {/* Controls: Night-Vision Red Mode & Sync */}
          <div className="flex items-center gap-3">
            {/* Astronomer Dark Adaptation Red Mode Toggle */}
            <button
              onClick={() => setAstronomerRedMode(!astronomerRedMode)}
              className={`px-3.5 py-2 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all shadow-md ${
                astronomerRedMode
                  ? 'bg-red-950 border-red-600 text-red-200 shadow-red-900/30'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Red Night-Vision Mode protects rhodopsin in dark adaptation during outdoor stargazing sessions"
            >
              <Eye size={15} className={astronomerRedMode ? 'text-red-400' : 'text-slate-400'} />
              <span>{astronomerRedMode ? 'Red Mode ON' : 'Astro Red Mode'}</span>
            </button>

            {/* Sync Refresh */}
            <button
              onClick={() => refresh()}
              disabled={isRefreshing}
              className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50"
              title="Refresh Celestial Ephemeris"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-cyan-400' : ''} />
            </button>
          </div>
        </div>

        {/* Real-time Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Stargazing SQI */}
          <div
            onClick={() => setActiveTab('stargazing')}
            className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-3.5 cursor-pointer hover:border-indigo-500/60 transition-all shadow-lg space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono text-slate-400">Stargazing SQI</span>
              <Sparkles size={14} className="text-indigo-400" />
            </div>
            <div className="text-xl font-bold font-mono text-indigo-300">
              {stargazingScore?.score ?? '--'}/100
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold block">
              {stargazingScore?.rating || 'Calculating...'}
            </span>
          </div>

          {/* Lunar Phase */}
          <div
            onClick={() => setActiveTab('moon')}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 cursor-pointer hover:border-slate-700 transition-all shadow-lg space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono text-slate-400">Moon Phase</span>
              <Moon size={14} className="text-cyan-400" />
            </div>
            <div className="text-base font-bold text-slate-100 line-clamp-1">
              {moon?.phaseName || '--'}
            </div>
            <span className="text-[11px] text-cyan-300 font-mono block">
              {moon?.illuminationPercent}% Illuminated
            </span>
          </div>

          {/* Visible Planets */}
          <div
            onClick={() => setActiveTab('planets')}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 cursor-pointer hover:border-slate-700 transition-all shadow-lg space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono text-slate-400">Visible Planets</span>
              <Globe size={14} className="text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono text-amber-300">
              {visiblePlanetsCount} Visible
            </div>
            <span className="text-[11px] text-slate-400 font-mono block">
              {planets.length} in Ephemeris
            </span>
          </div>

          {/* Sun & Daylight */}
          <div
            onClick={() => setActiveTab('sun')}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 cursor-pointer hover:border-slate-700 transition-all shadow-lg space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono text-slate-400">Daylight Total</span>
              <Sun size={14} className="text-amber-400" />
            </div>
            <div className="text-base font-bold font-mono text-amber-300">
              {sun?.dayLengthFormatted || '--'}
            </div>
            <span className="text-[11px] text-slate-400 font-mono block">
              Elev: {sun?.elevationDeg}°
            </span>
          </div>

          {/* Meteor Showers */}
          <div
            onClick={() => setActiveTab('meteors')}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 cursor-pointer hover:border-slate-700 transition-all shadow-lg space-y-1 col-span-2 sm:col-span-4 lg:col-span-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono text-slate-400">Meteors Active</span>
              <Flame size={14} className="text-rose-400" />
            </div>
            <div className="text-xl font-bold font-mono text-rose-400">
              {activeMeteorsCount} Active
            </div>
            <span className="text-[11px] text-slate-400 font-mono block">
              Peak: Perseids / Geminids
            </span>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800/80 no-scrollbar">
          {[
            { id: 'dome', label: 'Planetarium Dome', icon: Sparkles },
            { id: 'sun', label: 'Sun Center', icon: Sun },
            { id: 'moon', label: 'Moon Center', icon: Moon },
            { id: 'planets', label: 'Planets Visibility', icon: Globe },
            { id: 'constellations', label: 'Constellations', icon: Star },
            { id: 'meteors', label: 'Meteor Showers', icon: Flame },
            { id: 'eclipses', label: 'Eclipses', icon: Calendar },
            { id: 'stargazing', label: 'Stargazing SQI', icon: Eye },
            { id: 'nasa', label: 'NASA Hub & NEO', icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SpaceSectionTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Section Contents */}
        {isLoading && !data ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-mono text-slate-400">
              Calculating high-precision Keplerian orbital ephemerides...
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Individual Tab Modes */}
            {activeTab === 'dome' && (
              <NightSkyDome
                constellations={constellations}
                planets={planets}
                moon={moon}
                sun={sun}
                simulatedHourOffset={simulatedHourOffset}
                onHourOffsetChange={setSimulatedHourOffset}
                focusTargetId={domeFocusTargetId}
              />
            )}

            {activeTab === 'sun' && <SunCenter sun={sun} planets={planets} />}
            {activeTab === 'moon' && (
              <MoonCenter
                moon={moon}
                weather={weather}
                onLocateMoon={handleLocateMoon}
              />
            )}
            {activeTab === 'planets' && (
              <PlanetsVisibilityTable
                planets={planets}
                weather={weather}
                onLocatePlanet={handleLocatePlanet}
              />
            )}
            {activeTab === 'constellations' && <ConstellationsExplorer constellations={constellations} />}
            {activeTab === 'meteors' && <MeteorShowersTracker meteorShowers={meteorShowers} />}
            {activeTab === 'eclipses' && <EclipsesTracker eclipses={eclipses} />}
            {activeTab === 'stargazing' && <StargazingScoreCard score={stargazingScore} />}
            {activeTab === 'nasa' && <NasaSpaceHub apod={apod} neoAsteroids={neoAsteroids} />}
          </div>
        )}
      </div>
    </div>
  );
};
