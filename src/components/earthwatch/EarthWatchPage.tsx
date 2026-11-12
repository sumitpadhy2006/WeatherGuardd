import React, { useState } from 'react';
import { useEarthWatch } from '../../hooks/useEarthWatch';
import { useLocation } from '../../context/LocationContext';
import { usePreferences } from '../../context/PreferencesContext';
import { EarthWatchStatsHeader } from './EarthWatchStatsHeader';
import { DisasterMap } from './DisasterMap';
import { GlobalEventFeed } from './GlobalEventFeed';
import { EarthquakeSystem } from './EarthquakeSystem';
import { WildfireSystem } from './WildfireSystem';
import { VolcanoSystem } from './VolcanoSystem';
import { CycloneSystem } from './CycloneSystem';
import {
  Globe,
  Activity,
  Flame,
  Mountain,
  Wind,
  Shield,
  Layers,
  AlertOctagon,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../common/Button';

export const EarthWatchPage: React.FC = () => {
  const { currentLocation } = useLocation();
  const { preferences } = usePreferences();

  const {
    events,
    filteredEvents,
    stats,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
    selectedType,
    setSelectedType,
    minMagnitude,
    setMinMagnitude,
    selectedSeverity,
    setSelectedSeverity,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedEventId,
    setSelectedEventId,
  } = useEarthWatch({
    currentLocation,
    autoRefreshIntervalSeconds: 60,
  });

  const [activeSystemTab, setActiveSystemTab] = useState<'feed' | 'earthquake' | 'wildfire' | 'volcano' | 'cyclone'>('feed');

  return (
    <div className="space-y-6" id="earth-watch-page">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900/90 via-[#0B1220]/90 to-slate-900/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500/20 via-amber-500/20 to-blue-500/20 border border-red-500/30 flex items-center justify-center text-red-400 font-bold shadow-lg">
            <Globe size={24} className="animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Earth Watch <span className="text-cyan-400">Command</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-red-500/20 text-red-400 border border-red-500/40">
                USGS • NASA EONET
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Planetary geohazard, seismic fault, wildfire perimeter & cyclone vortex surveillance
            </p>
          </div>
        </div>

        {/* Global Action Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Stream Status</span>
            <span className="text-xs font-mono font-semibold text-emerald-400 flex items-center gap-1 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={refresh}
            disabled={isRefreshing}
            icon={<RefreshCw size={14} className={isRefreshing ? 'animate-spin text-cyan-400' : ''} />}
          >
            Sync Feeds
          </Button>
        </div>
      </div>

      {/* Planetary Pulse Stats Strip */}
      <EarthWatchStatsHeader
        stats={stats}
        onSelectCategory={(type) => {
          setSelectedType(type);
          if (type !== 'all') setActiveSystemTab(type as any);
          else setActiveSystemTab('feed');
        }}
        activeType={selectedType}
      />

      {/* Interactive Vector GIS Disaster Map */}
      <DisasterMap
        events={filteredEvents}
        selectedEventId={selectedEventId}
        onSelectEvent={setSelectedEventId}
        currentLocation={currentLocation}
        selectedType={selectedType}
        onSelectType={setSelectedType}
      />

      {/* System Domain View Selector Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveSystemTab('feed')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSystemTab === 'feed'
                ? 'bg-slate-800 text-cyan-300 font-bold border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers size={15} />
            Unified Hazard Feed ({filteredEvents.length})
          </button>
          <button
            onClick={() => setActiveSystemTab('earthquake')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSystemTab === 'earthquake'
                ? 'bg-red-500/20 text-red-300 font-bold border border-red-500/40'
                : 'text-slate-400 hover:text-red-300 hover:bg-slate-900'
            }`}
          >
            <Activity size={15} />
            Seismic System
          </button>
          <button
            onClick={() => setActiveSystemTab('wildfire')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSystemTab === 'wildfire'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900'
            }`}
          >
            <Flame size={15} />
            Wildfire Surveillance
          </button>
          <button
            onClick={() => setActiveSystemTab('volcano')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSystemTab === 'volcano'
                ? 'bg-orange-500/20 text-orange-300 font-bold border border-orange-500/40'
                : 'text-slate-400 hover:text-orange-300 hover:bg-slate-900'
            }`}
          >
            <Mountain size={15} />
            Volcano Monitoring
          </button>
          <button
            onClick={() => setActiveSystemTab('cyclone')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSystemTab === 'cyclone'
                ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40'
                : 'text-slate-400 hover:text-blue-300 hover:bg-slate-900'
            }`}
          >
            <Wind size={15} />
            Cyclone System
          </button>
        </div>
      </div>

      {/* Tab Content Panes */}
      {activeSystemTab === 'earthquake' && (
        <EarthquakeSystem events={events} onSelectEvent={setSelectedEventId} />
      )}

      {activeSystemTab === 'wildfire' && (
        <WildfireSystem events={events} onSelectEvent={setSelectedEventId} />
      )}

      {activeSystemTab === 'volcano' && (
        <VolcanoSystem events={events} onSelectEvent={setSelectedEventId} />
      )}

      {activeSystemTab === 'cyclone' && (
        <CycloneSystem events={events} onSelectEvent={setSelectedEventId} />
      )}

      {/* Global Event Feed (Always accessible or primary) */}
      <GlobalEventFeed
        events={filteredEvents}
        selectedEventId={selectedEventId}
        onSelectEvent={setSelectedEventId}
        selectedType={selectedType}
        onSelectType={setSelectedType}
        minMagnitude={minMagnitude}
        onMinMagnitudeChange={setMinMagnitude}
        selectedSeverity={selectedSeverity}
        onSelectSeverity={setSelectedSeverity}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onRefresh={refresh}
        isRefreshing={isRefreshing}
        units={preferences.units}
      />
    </div>
  );
};
