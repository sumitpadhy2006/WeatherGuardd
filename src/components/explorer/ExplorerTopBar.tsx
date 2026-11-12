import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  MapPin,
  Navigation,
  Layers,
  Maximize2,
  Minimize2,
  Compass,
  RotateCcw,
  Sliders,
  ChevronDown,
  SlidersHorizontal,
  CloudRain,
  Wind,
  Cloud,
  Thermometer,
  Sparkles,
  Sun,
  Waves,
} from 'lucide-react';
import { MapBasemapStyle } from '../../types/map';
import { ExplorerModeId } from '../../types/explorer';
import { QUICK_MODES } from '../../utils/weatherExplorerData';
import { GeoLocationItem } from '../../types';

interface ExplorerTopBarProps {
  currentLocation?: GeoLocationItem;
  onSelectLocation: (loc: GeoLocationItem) => void;
  currentBasemap: MapBasemapStyle;
  onSelectBasemap: (style: MapBasemapStyle) => void;
  activeMode: ExplorerModeId;
  onSelectMode: (mode: ExplorerModeId) => void;
  isLayerBrowserOpen: boolean;
  onToggleLayerBrowser: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onResetView: () => void;
  isHudOpen: boolean;
  onToggleHud: () => void;
}

export const ExplorerTopBar: React.FC<ExplorerTopBarProps> = ({
  currentLocation,
  onSelectLocation,
  currentBasemap,
  onSelectBasemap,
  activeMode,
  onSelectMode,
  isLayerBrowserOpen,
  onToggleLayerBrowser,
  isFullscreen,
  onToggleFullscreen,
  onResetView,
  isHudOpen,
  onToggleHud,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeoLocationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showBasemapMenu, setShowBasemapMenu] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const basemapMenuRef = useRef<HTMLDivElement>(null);

  const BASEMAP_OPTIONS: { id: MapBasemapStyle; label: string; badge?: string }[] = [
    { id: 'hybrid', label: 'Satellite Hybrid', badge: 'HD' },
    { id: 'dataviz-dark', label: 'Tactical Dark', badge: 'Clean' },
    { id: 'satellite', label: 'TrueColor Satellite' },
    { id: 'streets', label: 'Streets Standard' },
    { id: 'outdoor', label: 'Outdoor Topo' },
    { id: 'nasa-gibs', label: 'NASA MODIS GIBS' },
  ];

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (basemapMenuRef.current && !basemapMenuRef.current.contains(e.target as Node)) {
        setShowBasemapMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search geocode query handler with debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data || []);
          setShowSearchDropdown(true);
        }
      } catch {
        // Handle gracefully
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectCity = (city: GeoLocationItem) => {
    onSelectLocation(city);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  const renderQuickModeIcon = (iconName: string) => {
    switch (iconName) {
      case 'CloudRain':
        return <CloudRain size={13} />;
      case 'Wind':
        return <Wind size={13} />;
      case 'Cloud':
        return <Cloud size={13} />;
      case 'Thermometer':
        return <Thermometer size={13} />;
      case 'Sparkles':
        return <Sparkles size={13} />;
      case 'Sun':
        return <Sun size={13} />;
      case 'Waves':
        return <Waves size={13} />;
      case 'Compass':
        return <Compass size={13} />;
      default:
        return <Layers size={13} />;
    }
  };

  return (
    <div
      id="explorer-top-bar"
      className="absolute top-3 left-3 right-3 z-30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pointer-events-none"
    >
      {/* Left: Layer Browser Toggle + City Search */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Toggle Layer Browser Button */}
        <button
          onClick={onToggleLayerBrowser}
          className={`px-3 py-2 rounded-xl text-xs font-bold border backdrop-blur-xl shadow-xl flex items-center gap-2 transition-all cursor-pointer ${
            isLayerBrowserOpen
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
              : 'bg-[#090E18]/90 hover:bg-[#090E18] text-white border-slate-700/80 hover:border-slate-600'
          }`}
        >
          <Layers size={15} />
          <span className="hidden xs:inline">Layers</span>
        </button>

        {/* Global City Search Dropdown */}
        <div ref={searchRef} className="relative flex-1 sm:w-64">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowSearchDropdown(true);
              }}
              placeholder="Search your city or town..."
              className="w-full pl-8.5 pr-3 py-2 bg-[#090E18]/90 hover:bg-[#090E18] focus:bg-[#090E18] backdrop-blur-xl border border-slate-700/80 focus:border-cyan-400 rounded-xl text-xs text-white placeholder-slate-400 shadow-xl focus:outline-none transition-all"
            />
            {isSearching && (
              <span className="absolute right-3 w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          {/* Autocomplete Results */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0A101D] border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto custom-scrollbar">
              {searchResults.map((result, idx) => (
                <button
                  key={`${result.lat}-${result.lon}-${idx}`}
                  onClick={() => handleSelectCity(result)}
                  className="w-full px-3 py-2 text-left hover:bg-slate-800/90 flex items-center justify-between border-b border-slate-800/50 last:border-0 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin size={13} className="text-cyan-400 shrink-0" />
                    <span className="font-semibold text-white truncate">{result.name}</span>
                    {result.country && (
                      <span className="text-[10px] text-slate-400 truncate">
                        ({result.state ? `${result.state}, ` : ''}
                        {result.country})
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                    {result.lat.toFixed(1)}°, {result.lon.toFixed(1)}°
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center/Right: Quick Modes Bar & Map Controls */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pointer-events-auto justify-start sm:justify-end">
        {/* Quick Mode Pills */}
        <div className="flex items-center bg-[#090E18]/90 backdrop-blur-xl border border-slate-700/80 rounded-xl p-1 shadow-xl">
          {QUICK_MODES.map((mode) => {
            const isActive = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => onSelectMode(mode.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
                title={mode.label}
              >
                {renderQuickModeIcon(mode.iconName)}
                <span className="text-[11px]">{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Basemap Switcher Menu */}
        <div ref={basemapMenuRef} className="relative">
          <button
            onClick={() => setShowBasemapMenu(!showBasemapMenu)}
            className="px-2.5 py-2 rounded-xl bg-[#090E18]/90 hover:bg-[#090E18] text-slate-200 hover:text-white border border-slate-700/80 shadow-xl backdrop-blur-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Switch Map Basemap Style"
          >
            <Compass size={14} className="text-cyan-400" />
            <span className="hidden md:inline capitalize">{currentBasemap.split('-')[0]}</span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>

          {showBasemapMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-[#0A101D] border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 space-y-1">
              <div className="text-[10px] font-mono text-slate-400 px-2 py-1 uppercase tracking-wider">
                Basemap Projection
              </div>
              {BASEMAP_OPTIONS.map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    onSelectBasemap(style.id);
                    setShowBasemapMenu(false);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-medium flex items-center justify-between transition-colors ${
                    currentBasemap === style.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{style.label}</span>
                  {style.badge && (
                    <span className="text-[9px] font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-400">
                      {style.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* HUD Toggle (Legend & Telemetry) */}
        <button
          onClick={onToggleHud}
          className={`p-2 rounded-xl border backdrop-blur-xl shadow-xl transition-colors flex items-center gap-1.5 ${
            isHudOpen
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
              : 'bg-[#090E18]/90 text-slate-400 hover:text-white border-slate-700/80 hover:bg-[#090E18]'
          }`}
          title={isHudOpen ? 'Hide Map Telemetry' : 'Show Map Telemetry'}
        >
          <SlidersHorizontal size={14} className={isHudOpen ? 'text-slate-950' : 'text-slate-400'} />
          <span className="text-[10px] font-bold uppercase">Data</span>
        </button>

        {/* Recenter GPS / View Reset */}
        <button
          onClick={onResetView}
          className="p-2 rounded-xl bg-[#090E18]/90 hover:bg-[#090E18] text-slate-300 hover:text-white border border-slate-700/80 shadow-xl backdrop-blur-xl transition-colors"
          title="Recenter Map View"
        >
          <RotateCcw size={14} />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-xl bg-[#090E18]/90 hover:bg-[#090E18] text-slate-300 hover:text-white border border-slate-700/80 shadow-xl backdrop-blur-xl transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>
    </div>
  );
};
