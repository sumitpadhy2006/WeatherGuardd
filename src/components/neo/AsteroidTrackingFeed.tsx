import React from 'react';
import {
  Search,
  SlidersHorizontal,
  AlertTriangle,
  Compass,
  ArrowUpDown,
  Maximize2,
  Zap,
  Calendar,
  Layers,
  ChevronRight,
  ShieldAlert,
  Flame,
  Info,
} from 'lucide-react';
import {
  NearEarthObject,
  NeoSortField,
  NeoSortOrder,
  NeoSizeFilter,
  NeoOrbitFilter,
} from '../../types/neo';

interface AsteroidTrackingFeedProps {
  asteroids: NearEarthObject[];
  onSelectAsteroid: (ast: NearEarthObject) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  hazardousOnly: boolean;
  onToggleHazardous: () => void;
  subLunarOnly: boolean;
  onToggleSubLunar: () => void;
  orbitFilter: NeoOrbitFilter;
  onOrbitFilterChange: (orbit: NeoOrbitFilter) => void;
  sizeFilter: NeoSizeFilter;
  onSizeFilterChange: (size: NeoSizeFilter) => void;
  sortField: NeoSortField;
  onSortFieldChange: (field: NeoSortField) => void;
  sortOrder: NeoSortOrder;
  onToggleSortOrder: () => void;
  startDate: string;
  endDate: string;
  onPresetDateRange: (days: number) => void;
}

export const AsteroidTrackingFeed: React.FC<AsteroidTrackingFeedProps> = ({
  asteroids,
  onSelectAsteroid,
  searchQuery,
  onSearchChange,
  hazardousOnly,
  onToggleHazardous,
  subLunarOnly,
  onToggleSubLunar,
  orbitFilter,
  onOrbitFilterChange,
  sizeFilter,
  onSizeFilterChange,
  sortField,
  onSortFieldChange,
  sortOrder,
  onToggleSortOrder,
  startDate,
  endDate,
  onPresetDateRange,
}) => {
  return (
    <div className="space-y-4">
      {/* Control Bar: Search & Quick Date Presets */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search asteroids by name, designation, SPK-ID, or spectral type (e.g. Apophis, 2024 YR4)..."
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Date Window Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <Calendar size={13} /> Window:
          </span>
          <button
            onClick={() => onPresetDateRange(1)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-950/60 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors shrink-0"
          >
            Today
          </button>
          <button
            onClick={() => onPresetDateRange(7)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-colors shrink-0"
          >
            7 Days
          </button>
          <button
            onClick={() => onPresetDateRange(14)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-950/60 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors shrink-0"
          >
            14 Days
          </button>
          <button
            onClick={() => onPresetDateRange(30)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-950/60 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors shrink-0"
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Hazardous filter */}
          <button
            onClick={onToggleHazardous}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all font-medium ${
              hazardousOnly
                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/10'
                : 'bg-slate-950/60 border border-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle size={13} className={hazardousOnly ? 'text-amber-400' : ''} />
            <span>Potentially Hazardous (PHA)</span>
          </button>

          {/* Sub-lunar filter (< 1 LD) */}
          <button
            onClick={onToggleSubLunar}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all font-medium ${
              subLunarOnly
                ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-500/10'
                : 'bg-slate-950/60 border border-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass size={13} className={subLunarOnly ? 'text-cyan-400' : ''} />
            <span>Sub-Lunar (Within Moon Orbit &lt;1 LD)</span>
          </button>

          {/* Size Filter Dropdown */}
          <div className="flex items-center gap-1 bg-slate-950/60 border border-slate-800/80 rounded-xl px-2.5 py-1">
            <span className="text-slate-500 text-[11px]">Size:</span>
            <select
              value={sizeFilter}
              onChange={(e) => onSizeFilterChange(e.target.value as NeoSizeFilter)}
              className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Sizes</option>
              <option value="small" className="bg-slate-900 text-white">&lt; 25 m (Meteoroids)</option>
              <option value="medium" className="bg-slate-900 text-white">25 - 140 m (City Impactor)</option>
              <option value="large" className="bg-slate-900 text-white">140 - 1000 m (Regional Threat)</option>
              <option value="planet_killer" className="bg-slate-900 text-white">&gt; 1 km (Extinction Class)</option>
            </select>
          </div>

          {/* Orbit Class Filter */}
          <div className="flex items-center gap-1 bg-slate-950/60 border border-slate-800/80 rounded-xl px-2.5 py-1">
            <span className="text-slate-500 text-[11px]">Orbit:</span>
            <select
              value={orbitFilter}
              onChange={(e) => onOrbitFilterChange(e.target.value as NeoOrbitFilter)}
              className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Orbit Classes</option>
              <option value="Apollo" className="bg-slate-900 text-white">Apollo (Earth-Crossing)</option>
              <option value="Aten" className="bg-slate-900 text-white">Aten (Inside Earth)</option>
              <option value="Amor" className="bg-slate-900 text-white">Amor (Outside Earth)</option>
              <option value="Atira" className="bg-slate-900 text-white">Atira (Inside Venus)</option>
            </select>
          </div>
        </div>

        {/* Sorting Controls */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-slate-500 text-[11px] flex items-center gap-1">
            <ArrowUpDown size={12} /> Sort:
          </span>
          <select
            value={sortField}
            onChange={(e) => onSortFieldChange(e.target.value as NeoSortField)}
            className="bg-slate-950/70 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-1 text-xs focus:outline-none cursor-pointer"
          >
            <option value="distance" className="bg-slate-900 text-white">Proximity (Miss Distance)</option>
            <option value="size" className="bg-slate-900 text-white">Diameter (Size)</option>
            <option value="velocity" className="bg-slate-900 text-white">Relative Velocity</option>
            <option value="hazardScore" className="bg-slate-900 text-white">Hazard Score</option>
            <option value="date" className="bg-slate-900 text-white">Approach Date</option>
            <option value="magnitude" className="bg-slate-900 text-white">Brightness (Mag H)</option>
            <option value="name" className="bg-slate-900 text-white">Name</option>
          </select>
          <button
            onClick={onToggleSortOrder}
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Asteroids List / Grid */}
      {asteroids.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80">
          <Info size={28} className="mx-auto text-slate-500 mb-2" />
          <p className="text-sm font-medium text-slate-300">No Near Earth Objects Match Current Filters</p>
          <p className="text-xs text-slate-500 mt-1">Try broadening your search term or adjusting size and distance filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {asteroids.map((ast) => {
            const closeApproach = ast.close_approach_data[0];
            const distLd = ast.hazardScore.closestMissDistanceLd;
            const isSubLunar = distLd < 1.0;
            const diamMax = Math.round(ast.estimated_diameter.meters.estimated_diameter_max);
            const diamMin = Math.round(ast.estimated_diameter.meters.estimated_diameter_min);
            const velKms = ast.hazardScore.velocityKms;
            const orbitClass = ast.orbital_data?.orbit_class?.orbit_class_type || 'NEO';
            const landmark = ast.hazardScore.comparisonLandmark;

            return (
              <div
                key={ast.id}
                onClick={() => onSelectAsteroid(ast)}
                className={`group relative p-4 rounded-2xl transition-all cursor-pointer border flex flex-col justify-between ${
                  ast.is_potentially_hazardous_asteroid
                    ? 'bg-gradient-to-b from-slate-900/90 to-amber-950/10 border-amber-500/30 hover:border-amber-400/60 shadow-lg shadow-amber-500/5'
                    : isSubLunar
                    ? 'bg-gradient-to-b from-slate-900/90 to-cyan-950/20 border-cyan-500/30 hover:border-cyan-400/60 shadow-lg shadow-cyan-500/5'
                    : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Header info */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors tracking-tight">
                          {ast.name}
                        </span>
                        {ast.is_potentially_hazardous_asteroid && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            PHA
                          </span>
                        )}
                        {ast.is_sentry_object && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            Sentry
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                        Orbit: <span className="text-slate-300">{orbitClass}</span> | Mag (H): <span className="text-slate-300">{ast.absolute_magnitude_h.toFixed(1)}</span>
                      </span>
                    </div>

                    {/* Hazard Severity Badge */}
                    <div
                      className={`shrink-0 px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex flex-col items-center border ${
                        ast.hazardScore.hazardLevel === 'Elevated'
                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                          : ast.hazardScore.hazardLevel === 'Watch'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      <span className="text-[9px] opacity-75">HAZARD</span>
                      <span>{ast.hazardScore.hazardSeverityIndex}/100</span>
                    </div>
                  </div>

                  {/* Proximity Gauge / Visual Bar */}
                  <div className="my-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Compass size={12} className="text-cyan-400" />
                        Miss Distance:
                      </span>
                      <span className={`font-mono font-bold ${isSubLunar ? 'text-amber-400' : 'text-cyan-300'}`}>
                        {distLd} LD {isSubLunar && '(Sub-Lunar Flyby)'}
                      </span>
                    </div>

                    {/* Distance Meter */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full rounded-full ${
                          distLd < 1.0 ? 'bg-gradient-to-r from-red-500 to-amber-400' : distLd < 5.0 ? 'bg-amber-400' : 'bg-cyan-400'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, (10 / Math.max(0.5, distLd)) * 10))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
                      <span>Earth</span>
                      <span>1 LD (Moon)</span>
                      <span>10+ LD</span>
                    </div>
                  </div>

                  {/* Physical Telemetry Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Maximize2 size={11} className="text-blue-400" /> Diameter
                      </span>
                      <div className="text-xs font-bold text-white font-mono mt-0.5">
                        {diamMin} - {diamMax} m
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">
                        ~{landmark.name.split('(')[0]}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Zap size={11} className="text-amber-400" /> Velocity
                      </span>
                      <div className="text-xs font-bold text-white font-mono mt-0.5">
                        {velKms} km/s
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Mach {Math.round((velKms * 1000) / 343)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer approach timestamp */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} className="text-slate-500" />
                    {closeApproach?.close_approach_date || 'Upcoming'}
                  </span>
                  <span className="text-cyan-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform font-medium">
                    Orbital Details <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
