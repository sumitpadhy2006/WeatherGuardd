import React, { useState } from 'react';
import {
  Radar,
  Compass,
  ShieldAlert,
  Flame,
  Sparkles,
  RefreshCw,
  Sliders,
  Layers,
  Radio,
} from 'lucide-react';
import { useNearEarthObjects } from '../../hooks/useNearEarthObjects';
import { NeoOverviewBanner } from './NeoOverviewBanner';
import { AsteroidTrackingFeed } from './AsteroidTrackingFeed';
import { CloseApproachesVisualizer } from './CloseApproachesVisualizer';
import { HazardScoreMatrix } from './HazardScoreMatrix';
import { AsteroidDetailsModal } from './AsteroidDetailsModal';
import { NearEarthObject } from '../../types/neo';

interface NeoPageProps {
  currentLocation?: { name: string; lat: number; lon: number };
}

export const NeoPage: React.FC<NeoPageProps> = () => {
  const {
    data,
    loading,
    error,
    refresh,
    selectedAsteroid,
    setSelectedAsteroid,
    filteredAsteroids,
    searchQuery,
    setSearchQuery,
    hazardousOnly,
    setHazardousOnly,
    subLunarOnly,
    setSubLunarOnly,
    orbitFilter,
    setOrbitFilter,
    sizeFilter,
    setSizeFilter,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    startDate,
    endDate,
    setPresetDateRange,
  } = useNearEarthObjects();

  const [activeTab, setActiveTab] = useState<'feed' | 'approaches' | 'hazard' | 'sentry' | 'famous'>('approaches');

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 pb-20 pt-4 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Radar size={18} className="animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Near Earth Objects (NEO)
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              P17
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time asteroid tracking, close approach trajectory radar, Torino hazard scoring & NASA NeoWs orbital ephemerides.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refresh()}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 hover:text-cyan-400 flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-cyan-400' : ''} />
            <span>{loading ? 'Scanning JPL Orbitals...' : 'Sync Live Radar'}</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton or Error State */}
      {loading && !data && (
        <div className="p-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col items-center justify-center space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
            <Radio size={24} className="absolute text-cyan-400 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Acquiring NASA NeoWs & JPL Horizons Telemetry</h3>
            <p className="text-xs text-slate-500 font-mono">Computing close approach distances, orbital mechanics & Torino scale ratings...</p>
          </div>
        </div>
      )}

      {error && !data && (
        <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/40 text-center space-y-3">
          <ShieldAlert size={28} className="mx-auto text-red-400" />
          <div className="text-sm font-bold text-white">{error}</div>
          <button
            onClick={() => refresh()}
            className="px-4 py-1.5 rounded-xl bg-red-500/20 border border-red-500/40 text-xs font-mono text-red-300 hover:bg-red-500/30 transition-colors"
          >
            Retry Planetary Radar Scan
          </button>
        </div>
      )}

      {/* Content when Data Available */}
      {data && (
        <div className="space-y-6">
          {/* Summary Overview Banner */}
          <NeoOverviewBanner
            summary={data.summary}
            source={data.source}
            onSelectAsteroid={(ast) => setSelectedAsteroid(ast)}
            onSelectTab={(tab) => setActiveTab(tab)}
          />

          {/* Module Navigation Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 overflow-x-auto">
            <button
              onClick={() => setActiveTab('approaches')}
              className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'approaches'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass size={14} />
              <span>Close Approaches Radar (LD)</span>
            </button>

            <button
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'feed'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio size={14} />
              <span>Asteroid Tracking Feed ({filteredAsteroids.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('hazard')}
              className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'hazard'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert size={14} />
              <span>Planetary Defense & Hazard Scores</span>
            </button>

            <button
              onClick={() => setActiveTab('sentry')}
              className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'sentry'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame size={14} />
              <span>Sentry Impact Watchlist ({data.sentryWatchlist.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('famous')}
              className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'famous'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles size={14} />
              <span>Famous NEOs (Apophis, Bennu, Didymos)</span>
            </button>
          </div>

          {/* TAB 1: Real-time Asteroid Tracking Feed */}
          {activeTab === 'feed' && (
            <AsteroidTrackingFeed
              asteroids={filteredAsteroids}
              onSelectAsteroid={(ast) => setSelectedAsteroid(ast)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              hazardousOnly={hazardousOnly}
              onToggleHazardous={() => setHazardousOnly(!hazardousOnly)}
              subLunarOnly={subLunarOnly}
              onToggleSubLunar={() => setSubLunarOnly(!subLunarOnly)}
              orbitFilter={orbitFilter}
              onOrbitFilterChange={setOrbitFilter}
              sizeFilter={sizeFilter}
              onSizeFilterChange={setSizeFilter}
              sortField={sortField}
              onSortFieldChange={setSortField}
              sortOrder={sortOrder}
              onToggleSortOrder={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              startDate={startDate}
              endDate={endDate}
              onPresetDateRange={setPresetDateRange}
            />
          )}

          {/* TAB 2: Close Approaches Orbital Radar */}
          {activeTab === 'approaches' && (
            <CloseApproachesVisualizer
              asteroids={filteredAsteroids}
              onSelectAsteroid={(ast) => setSelectedAsteroid(ast)}
            />
          )}

          {/* TAB 3: Hazard Scores & Torino Scale Matrix */}
          {activeTab === 'hazard' && (
            <HazardScoreMatrix
              asteroids={filteredAsteroids}
              sentryWatchlist={data.sentryWatchlist}
              onSelectAsteroid={(ast) => setSelectedAsteroid(ast)}
            />
          )}

          {/* TAB 4: Sentry Watchlist */}
          {activeTab === 'sentry' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">NASA JPL Sentry Impact Risk System</h2>
                    <p className="text-xs text-slate-400">Automated collision monitoring software for potential Earth impactors across 100+ years.</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-purple-300 bg-purple-950/60 px-3 py-1.5 rounded-xl border border-purple-500/40">
                  {data.sentryWatchlist.length} Monitored Objects
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {data.sentryWatchlist.map((ast) => (
                  <div
                    key={ast.id}
                    onClick={() => setSelectedAsteroid(ast)}
                    className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-purple-500/30 hover:border-purple-400 transition-all cursor-pointer space-y-3 group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                          {ast.name}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {ast.spectralType} • Mag (H): {ast.absolute_magnitude_h}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        Torino {ast.sentry_data?.torino_scale ?? 0}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 text-xs font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Cumulative Probability:</span>
                        <span className="text-amber-400 font-bold">{ast.sentry_data?.impact_probability_str}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Impact Window:</span>
                        <span className="text-white">{ast.sentry_data?.potential_impact_years_range}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Estimated Energy:</span>
                        <span className="text-purple-300 font-bold">{ast.sentry_data?.energy_mt} Megatons</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-purple-400 font-medium">
                      <span>Click to view orbital ephemeris</span>
                      <span>→</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Famous NEOs Catalog */}
          {activeTab === 'famous' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-300">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Curated Near-Earth Asteroid Master Catalog</h2>
                    <p className="text-xs text-slate-400">High-profile targets of space exploration missions (OSIRIS-REx, DART, Hera, Hayabusa2).</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {data.famousAsteroids.map((ast) => (
                  <div
                    key={ast.id}
                    onClick={() => setSelectedAsteroid(ast)}
                    className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer space-y-3 group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {ast.name}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {ast.spectralType} • Ø {Math.round(ast.estimated_diameter.meters.estimated_diameter_max)}m
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                        {ast.orbital_data?.orbit_class?.orbit_class_type || 'NEO'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2">
                      {ast.compositionSummary}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-cyan-400 font-medium pt-2 border-t border-slate-800">
                      <span>Inspect 3D Orbital Model</span>
                      <span>→</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Asteroid Details Deep-Dive Modal */}
      {selectedAsteroid && (
        <AsteroidDetailsModal
          asteroid={selectedAsteroid}
          onClose={() => setSelectedAsteroid(null)}
        />
      )}
    </div>
  );
};
