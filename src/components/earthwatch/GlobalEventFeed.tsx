import React from 'react';
import {
  Search,
  SlidersHorizontal,
  RotateCw,
  AlertCircle,
  Activity,
  Flame,
  Mountain,
  Wind,
  Layers,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { EarthWatchEvent, DisasterType, EarthWatchSeverity, UnitSystem } from '../../types';
import { DisasterEventCard } from './DisasterEventCard';

interface GlobalEventFeedProps {
  events: EarthWatchEvent[];
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
  selectedType: DisasterType;
  onSelectType: (type: DisasterType) => void;
  minMagnitude: number;
  onMinMagnitudeChange: (mag: number) => void;
  selectedSeverity: EarthWatchSeverity | 'all';
  onSelectSeverity: (sev: EarthWatchSeverity | 'all') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: 'recency' | 'severity' | 'distance' | 'magnitude';
  onSortByChange: (sort: 'recency' | 'severity' | 'distance' | 'magnitude') => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  units?: UnitSystem;
}

export const GlobalEventFeed: React.FC<GlobalEventFeedProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
  selectedType,
  onSelectType,
  minMagnitude,
  onMinMagnitudeChange,
  selectedSeverity,
  onSelectSeverity,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortByChange,
  onRefresh,
  isRefreshing,
  units = 'metric',
}) => {
  return (
    <div className="space-y-4" id="global-event-feed-container">
      {/* Controls Strip: Search & Filter Tabs */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3 sm:p-4 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Omnibox search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by country, tectonic plate, volcano or cyclone name..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Quick Sort & Refresh */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
              <ArrowUpDown size={13} className="text-cyan-400" />
              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value as any)}
                className="bg-transparent border-0 text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="recency" className="bg-slate-900">Most Recent</option>
                <option value="severity" className="bg-slate-900">Highest Severity</option>
                <option value="distance" className="bg-slate-900">Closest to Station</option>
                <option value="magnitude" className="bg-slate-900">Highest Magnitude</option>
              </select>
            </div>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-slate-700 transition-colors disabled:opacity-50"
              title="Refresh Planetary Event Feeds"
            >
              <RotateCw size={15} className={isRefreshing ? 'animate-spin text-cyan-400' : ''} />
            </button>
          </div>
        </div>

        {/* Hazard Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => onSelectType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedType === 'all'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => onSelectType('earthquake')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                selectedType === 'earthquake'
                  ? 'bg-red-500 text-white shadow-md font-bold'
                  : 'bg-slate-950/60 text-slate-400 hover:text-red-300 border border-slate-800'
              }`}
            >
              <Activity size={13} />
              Earthquakes
            </button>
            <button
              onClick={() => onSelectType('wildfire')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                selectedType === 'wildfire'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-950/60 text-slate-400 hover:text-amber-300 border border-slate-800'
              }`}
            >
              <Flame size={13} />
              Wildfires
            </button>
            <button
              onClick={() => onSelectType('volcano')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                selectedType === 'volcano'
                  ? 'bg-orange-500 text-white shadow-md font-bold'
                  : 'bg-slate-950/60 text-slate-400 hover:text-orange-300 border border-slate-800'
              }`}
            >
              <Mountain size={13} />
              Volcanoes
            </button>
            <button
              onClick={() => onSelectType('cyclone')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                selectedType === 'cyclone'
                  ? 'bg-blue-500 text-white shadow-md font-bold'
                  : 'bg-slate-950/60 text-slate-400 hover:text-blue-300 border border-slate-800'
              }`}
            >
              <Wind size={13} />
              Cyclones
            </button>
          </div>

          {/* Severity & Magnitude Secondary Filter */}
          <div className="flex items-center gap-2">
            {(selectedType === 'all' || selectedType === 'earthquake') && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="text-[11px] font-mono">Min Mag:</span>
                <select
                  value={minMagnitude}
                  onChange={(e) => onMinMagnitudeChange(parseFloat(e.target.value))}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs font-mono font-bold focus:outline-none"
                >
                  <option value={2.5}>M 2.5+</option>
                  <option value={4.0}>M 4.0+</option>
                  <option value={5.5}>M 5.5+</option>
                  <option value={6.5}>M 6.5+ (Major)</option>
                </select>
              </div>
            )}

            <select
              value={selectedSeverity}
              onChange={(e) => onSelectSeverity(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs font-semibold focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Alerts</option>
              <option value="warning">Warnings</option>
              <option value="watch">Watches</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feed Counter */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400 font-mono">
        <span>
          Displaying <strong className="text-slate-200">{events.length}</strong> active hazards
        </span>
        <span className="flex items-center gap-1 text-cyan-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Live Telemetry Link Active
        </span>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <AlertCircle size={36} className="text-slate-500 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-200">No matching events in range</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria, reducing the minimum magnitude threshold, or selecting another hazard domain.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <DisasterEventCard
              key={event.id}
              event={event}
              isSelected={selectedEventId === event.id}
              onSelect={() => onSelectEvent(event.id)}
              units={units}
            />
          ))}
        </div>
      )}
    </div>
  );
};
