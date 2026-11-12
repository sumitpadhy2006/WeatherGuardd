import React, { useState } from 'react';
import {
  Layers,
  Map as MapIcon,
  Activity,
  Flame,
  Mountain,
  Wind,
  CloudRain,
  Eye,
  Play,
  Pause,
  RotateCcw,
  Navigation,
  Compass,
  Maximize2,
  Minimize2,
  Calendar,
  Radio,
  Sliders,
  Sparkles,
  Search,
  Globe,
  X,
  Droplets,
  ThermometerSun,
} from 'lucide-react';
import {
  MapBasemapStyle,
  WeatherOverlayType,
  TimeWindowFilter,
  RadarFrame,
} from '../../types/map';
import { DisasterType, GeoLocationItem } from '../../types';

interface MapHUDControlsProps {
  currentStyle: MapBasemapStyle;
  onSelectStyle: (style: MapBasemapStyle) => void;
  selectedDisasterType: DisasterType;
  onSelectDisasterType: (type: DisasterType) => void;
  activeWeatherOverlay: WeatherOverlayType;
  onSelectWeatherOverlay: (overlay: WeatherOverlayType) => void;
  timeFilter: TimeWindowFilter;
  onSelectTimeFilter: (filter: TimeWindowFilter) => void;
  showTectonicPlates: boolean;
  onToggleTectonicPlates: () => void;
  showProximityRing: boolean;
  onToggleProximityRing: () => void;
  proximityRadiusKm: number;
  onSelectProximityRadius: (radius: number) => void;
  currentLocation?: GeoLocationItem;
  onCenterLocation: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onResetView: () => void;
  totalEventsCount: number;
  filteredEventsCount: number;
  // Radar timeline player props
  radarFrames: RadarFrame[];
  currentRadarFrameIndex: number;
  onSelectRadarFrameIndex: (idx: number) => void;
  isRadarPlaying: boolean;
  onToggleRadarPlay: () => void;
  onSearchLocation?: (query: string) => void;
  pitch: number;
  onToggle3DPitch: () => void;
}

export const MapHUDControls: React.FC<MapHUDControlsProps> = ({
  currentStyle,
  onSelectStyle,
  selectedDisasterType,
  onSelectDisasterType,
  activeWeatherOverlay,
  onSelectWeatherOverlay,
  timeFilter,
  onSelectTimeFilter,
  showTectonicPlates,
  onToggleTectonicPlates,
  showProximityRing,
  onToggleProximityRing,
  proximityRadiusKm,
  onSelectProximityRadius,
  currentLocation,
  onCenterLocation,
  isFullscreen,
  onToggleFullscreen,
  onResetView,
  totalEventsCount,
  filteredEventsCount,
  radarFrames,
  currentRadarFrameIndex,
  onSelectRadarFrameIndex,
  isRadarPlaying,
  onToggleRadarPlay,
  onSearchLocation,
  pitch,
  onToggle3DPitch,
}) => {
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const [isOverlayMenuOpen, setIsOverlayMenuOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const MAP_STYLES: { id: MapBasemapStyle; label: string; badge?: string }[] = [
    { id: 'hybrid', label: 'Satellite Hybrid', badge: 'Default HD' },
    { id: 'dataviz-dark', label: 'Tactical Dark', badge: 'Vector' },
    { id: 'satellite', label: 'TrueColor Satellite' },
    { id: 'streets', label: 'Streets Standard' },
    { id: 'outdoor', label: 'Outdoor Topo' },
    { id: 'nasa-gibs', label: 'NASA Satellite GIBS', badge: 'MODIS' },
  ];

  const WEATHER_OVERLAYS: { id: WeatherOverlayType; label: string; icon: any }[] = [
    { id: 'none', label: 'Off', icon: Eye },
    { id: 'radar', label: 'Rain Doppler Radar', icon: CloudRain },
    { id: 'clouds', label: 'Cloud Cover', icon: Wind },
    { id: 'temp', label: 'Thermal Heatmap', icon: Flame },
    { id: 'wind', label: 'Wind Dynamics', icon: Compass },
    { id: 'aqi', label: 'Air Quality (AQI)', icon: Sparkles },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchLocation) {
      onSearchLocation(searchQuery.trim());
    }
  };

  const activeRadarTime =
    radarFrames.length > 0 && radarFrames[currentRadarFrameIndex]
      ? new Date(radarFrames[currentRadarFrameIndex].time * 1000).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : null;

  return (
    <>
      {/* Top HUD Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Stream Status + Disaster Filters */}
        <div className="flex items-center gap-1.5 pointer-events-auto flex-wrap">
          {/* Live GIS Telemetry Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-xl border border-slate-700/80 text-xs text-slate-200 shadow-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="font-bold uppercase tracking-wider font-mono text-[11px] text-cyan-300">
              Live MapLibre GIS
            </span>
            <span className="text-slate-600 font-mono">|</span>
            <span className="font-mono text-[11px] text-slate-300">
              {filteredEventsCount} / {totalEventsCount} Active Events
            </span>
          </div>

          {/* Quick Disaster Filter Pills */}
          <div className="hidden sm:flex items-center gap-0.5 bg-slate-950/85 backdrop-blur-xl p-1 rounded-xl border border-slate-700/80 shadow-xl">
            <button
              onClick={() => onSelectDisasterType('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                selectedDisasterType === 'all'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => onSelectDisasterType('earthquake')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                selectedDisasterType === 'earthquake'
                  ? 'bg-red-500 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-red-300 hover:bg-slate-800/60'
              }`}
            >
              <Activity size={12} />
              Earthquakes
            </button>
            <button
              onClick={() => onSelectDisasterType('wildfire')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                selectedDisasterType === 'wildfire'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/60'
              }`}
            >
              <Flame size={12} />
              Wildfires
            </button>
            <button
              onClick={() => onSelectDisasterType('volcano')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                selectedDisasterType === 'volcano'
                  ? 'bg-orange-500 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-orange-300 hover:bg-slate-800/60'
              }`}
            >
              <Mountain size={12} />
              Volcanoes
            </button>
            <button
              onClick={() => onSelectDisasterType('cyclone')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                selectedDisasterType === 'cyclone'
                  ? 'bg-blue-500 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-blue-300 hover:bg-slate-800/60'
              }`}
            >
              <Wind size={12} />
              Cyclones
            </button>
            <button
              onClick={() => onSelectDisasterType('flood')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                selectedDisasterType === 'flood'
                  ? 'bg-indigo-500 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800/60'
              }`}
            >
              <Droplets size={12} />
              Floods
            </button>
            <button
              onClick={() => onSelectDisasterType('high_temp')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                selectedDisasterType === 'high_temp'
                  ? 'bg-rose-500 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-rose-300 hover:bg-slate-800/60'
              }`}
            >
              <ThermometerSun size={12} />
              High Temp
            </button>
          </div>
        </div>

        {/* Right HUD: Style Switcher, Weather Overlays, 3D & Fullscreen */}
        <div className="flex items-center gap-1.5 pointer-events-auto ml-auto">
          {/* Basemap Style Menu Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setIsStyleMenuOpen((prev) => !prev);
                setIsOverlayMenuOpen(false);
                setIsFilterMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-200 backdrop-blur-xl transition-all shadow-xl"
              title="Change Map Style"
            >
              <MapIcon size={14} className="text-cyan-400" />
              <span className="hidden md:inline capitalize">{currentStyle.replace('-', ' ')}</span>
            </button>

            {isStyleMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-950/95 backdrop-blur-2xl border border-slate-700 rounded-2xl p-1.5 shadow-2xl z-40 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  MapTiler Geographic Basemap
                </div>
                {MAP_STYLES.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      onSelectStyle(st.id);
                      setIsStyleMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-left transition-colors ${
                      currentStyle === st.id
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <span>{st.label}</span>
                    {st.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {st.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Weather Overlay Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setIsOverlayMenuOpen((prev) => !prev);
                setIsStyleMenuOpen(false);
                setIsFilterMenuOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border backdrop-blur-xl transition-all shadow-xl text-xs font-semibold ${
                activeWeatherOverlay !== 'none'
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-950/85 hover:bg-slate-900 border-slate-700/80 text-slate-300'
              }`}
              title="Weather Layers & Doppler Radar"
            >
              <CloudRain size={14} className={activeWeatherOverlay !== 'none' ? 'text-cyan-400' : 'text-slate-400'} />
              <span className="hidden md:inline">
                {activeWeatherOverlay === 'none' ? 'Weather Overlay' : activeWeatherOverlay.toUpperCase()}
              </span>
            </button>

            {isOverlayMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-950/95 backdrop-blur-2xl border border-slate-700 rounded-2xl p-1.5 shadow-2xl z-40 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Meteorological Overlays
                </div>
                {WEATHER_OVERLAYS.map((lay) => {
                  const Icon = lay.icon;
                  return (
                    <button
                      key={lay.id}
                      onClick={() => {
                        onSelectWeatherOverlay(lay.id);
                        setIsOverlayMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-left transition-colors ${
                        activeWeatherOverlay === lay.id
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <Icon size={14} className="shrink-0" />
                      <span>{lay.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Time Filter Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setIsFilterMenuOpen((prev) => !prev);
                setIsStyleMenuOpen(false);
                setIsOverlayMenuOpen(false);
              }}
              className="p-2 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white backdrop-blur-xl transition-all shadow-xl"
              title="Time Horizon Window"
            >
              <Calendar size={15} />
            </button>

            {isFilterMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-slate-950/95 backdrop-blur-2xl border border-slate-700 rounded-2xl p-1.5 shadow-2xl z-40 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Time Window
                </div>
                {(['live', '24h', '7d', '30d'] as TimeWindowFilter[]).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => {
                      onSelectTimeFilter(tf);
                      setIsFilterMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left transition-colors ${
                      timeFilter === tf
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <span className="capitalize">{tf === 'live' ? 'Real-Time Live' : `Past ${tf}`}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tectonic Plates Toggle */}
          <button
            onClick={onToggleTectonicPlates}
            className={`p-2 rounded-xl border backdrop-blur-xl transition-all shadow-xl ${
              showTectonicPlates
                ? 'bg-red-500/20 border-red-500/50 text-red-300'
                : 'bg-slate-950/85 hover:bg-slate-900 border-slate-700/80 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Ring of Fire & Tectonic Fault Boundaries"
          >
            <Layers size={15} />
          </button>

          {/* 3D Pitch Angle Toggle */}
          <button
            onClick={onToggle3DPitch}
            className={`p-2 rounded-xl border backdrop-blur-xl transition-all shadow-xl ${
              pitch > 0
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold'
                : 'bg-slate-950/85 hover:bg-slate-900 border-slate-700/80 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle 3D Oblique Globe Perspective (45° Pitch)"
          >
            <Compass size={15} />
          </button>

          {/* User Location Center */}
          {currentLocation && (
            <button
              onClick={onCenterLocation}
              className="p-2 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-cyan-400 backdrop-blur-xl transition-all shadow-xl"
              title="Fly to Current Observation Station"
            >
              <Navigation size={15} />
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={onToggleFullscreen}
            className="p-2 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white backdrop-blur-xl transition-all shadow-xl"
            title="Toggle Fullscreen Mode"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Floating Radar Timeline Player (Active when Radar overlay is enabled) */}
      {activeWeatherOverlay === 'radar' && radarFrames.length > 0 && (
        <div className="absolute top-16 left-3 right-3 sm:right-auto sm:w-96 z-20 pointer-events-auto bg-slate-950/95 backdrop-blur-2xl border border-slate-700/90 rounded-2xl p-3 shadow-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudRain size={16} className="text-cyan-400" />
              <span className="text-xs font-bold text-slate-100">Live Doppler Radar Timeline</span>
            </div>
            <div className="flex items-center gap-2">
              {activeRadarTime && (
                <span className="font-mono text-[11px] text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  {activeRadarTime}
                </span>
              )}
              <button
                onClick={() => onSelectWeatherOverlay('none')}
                className="text-slate-400 hover:text-white p-0.5"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleRadarPlay}
              className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md shrink-0"
              title={isRadarPlaying ? 'Pause Radar Loop' : 'Play Radar Loop'}
            >
              {isRadarPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>

            <input
              type="range"
              min={0}
              max={radarFrames.length - 1}
              value={currentRadarFrameIndex}
              onChange={(e) => onSelectRadarFrameIndex(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>-2 Hours Past</span>
            <span className="text-cyan-400 font-semibold">Live Nowcast</span>
            <span>+30 Min Forecast</span>
          </div>
        </div>
      )}

      {/* Bottom Left Legend & Proximity Filter */}
      <div className="hidden md:flex absolute bottom-3 left-3 z-20 items-center gap-3 px-3.5 py-2 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-slate-700/80 text-[11px] text-slate-200 font-mono shadow-2xl pointer-events-auto">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm ring-2 ring-red-500/30" />
          <span>Earthquake</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm ring-2 ring-orange-500/30" />
          <span>Wildfire</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-sm ring-2 ring-yellow-400/30" />
          <span>Volcano</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm ring-2 ring-cyan-400/30" />
          <span>Cyclone</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm ring-2 ring-indigo-500/30" />
          <span>Flood</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm ring-2 ring-rose-500/30" />
          <span>High Temp</span>
        </div>
        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
          <span className="w-4 h-0.5 border-b border-dashed border-red-500" />
          <span className="text-[10px] text-red-400">Ring of Fire</span>
        </div>

        {/* Proximity Range selector */}
        {currentLocation && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
            <button
              onClick={onToggleProximityRing}
              className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                showProximityRing
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Rings: {proximityRadiusKm}km
            </button>
          </div>
        )}
      </div>
    </>
  );
};
