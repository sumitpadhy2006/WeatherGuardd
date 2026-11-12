import React, { useState, useMemo } from 'react';
import {
  ExplorerCategory,
  ExplorerModeId,
  ExplorerPreset,
  ExplorerActiveLayers,
} from '../../types/explorer';
import {
  EXPLORER_CATEGORIES,
  EXPLORER_LAYERS,
  EXPLORER_PRESETS,
} from '../../utils/weatherExplorerData';
import {
  Search,
  CloudRain,
  Wind,
  Cloud,
  Thermometer,
  Zap,
  Droplets,
  Eye,
  Sun,
  Compass,
  Waves,
  Sparkles,
  Flame,
  Plane,
  Layers,
  ArrowUpRight,
  Sliders,
  Check,
  ChevronRight,
  Globe,
  Radio,
  Sprout,
  Anchor,
  Telescope,
  Camera,
} from 'lucide-react';

interface ExplorerLayerBrowserProps {
  activeMode: ExplorerModeId;
  onSelectMode: (mode: ExplorerModeId) => void;
  activePreset: ExplorerPreset;
  onSelectPreset: (preset: ExplorerPreset) => void;
  activeLayers: ExplorerActiveLayers;
  onToggleWindParticles: () => void;
  onToggleRadar: () => void;
  onToggleClouds: () => void;
  onToggleIsobars: () => void;
  onNavigateEarthWatch?: () => void;
  isOpen: boolean;
  onClose?: () => void;
}

export const ExplorerLayerBrowser: React.FC<ExplorerLayerBrowserProps> = ({
  activeMode,
  onSelectMode,
  activePreset,
  onSelectPreset,
  activeLayers,
  onToggleWindParticles,
  onToggleRadar,
  onToggleClouds,
  onToggleIsobars,
  onNavigateEarthWatch,
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExplorerCategory | 'all'>('weather');
  const [activeTab, setActiveTab] = useState<'layers' | 'presets'>('layers');

  // Helper for rendering Lucide icons dynamically
  const renderLayerIcon = (iconName: string, size = 15) => {
    switch (iconName) {
      case 'CloudRain':
        return <CloudRain size={size} />;
      case 'Wind':
        return <Wind size={size} />;
      case 'Cloud':
        return <Cloud size={size} />;
      case 'Thermometer':
        return <Thermometer size={size} />;
      case 'Zap':
        return <Zap size={size} />;
      case 'Droplets':
      case 'Droplet':
        return <Droplets size={size} />;
      case 'Eye':
        return <Eye size={size} />;
      case 'Sun':
      case 'SunMedium':
        return <Sun size={size} />;
      case 'Compass':
        return <Compass size={size} />;
      case 'Waves':
        return <Waves size={size} />;
      case 'Sparkles':
        return <Sparkles size={size} />;
      case 'Flame':
        return <Flame size={size} />;
      case 'Plane':
        return <Plane size={size} />;
      case 'Globe':
        return <Globe size={size} />;
      case 'Sprout':
        return <Sprout size={size} />;
      case 'Anchor':
        return <Anchor size={size} />;
      case 'Telescope':
        return <Telescope size={size} />;
      case 'Camera':
        return <Camera size={size} />;
      default:
        return <Layers size={size} />;
    }
  };

  // Filtered layers based on search and category
  const filteredLayers = useMemo(() => {
    const allLayers = Object.values(EXPLORER_LAYERS);
    return allLayers.filter((layer) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        layer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        layer.shortLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        layer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        layer.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === 'all' || layer.category === selectedCategory || searchQuery.trim() !== '';

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <aside
      id="explorer-layer-browser"
      className={`flex flex-col bg-[#080D18]/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
        isOpen ? 'w-80 sm:w-96 max-h-[82vh] opacity-100' : 'w-0 max-h-0 opacity-0 pointer-events-none p-0 border-0'
      }`}
    >
      {/* Top Header & Search */}
      <div className="p-3 sm:p-4 border-b border-slate-800 space-y-3 bg-[#0B1220]/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers size={17} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Weather <span className="text-cyan-400">Explorer</span>
              </h3>
              <p className="text-[10px] text-slate-400">Atmospheric & Environmental Layer System</p>
            </div>
          </div>

          {/* Tab Switcher: Layers vs Presets */}
          <div className="flex bg-slate-900/90 rounded-lg p-0.5 border border-slate-800 text-[11px] font-medium">
            <button
              onClick={() => setActiveTab('layers')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeTab === 'layers'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Layers
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeTab === 'presets'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Presets
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {activeTab === 'layers' && (
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 35+ weather, marine & aero layers..."
              className="w-full pl-8.5 pr-3 py-1.5 bg-slate-900/90 border border-slate-750 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {activeTab === 'layers' ? (
        <>
          {/* Category Tabs Strip */}
          {searchQuery.trim() === '' && (
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-800/80 overflow-x-auto no-scrollbar bg-[#080D18]/90">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                All
              </button>
              {EXPLORER_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  {renderLayerIcon(cat.icon, 12)}
                  <span>{cat.shortLabel}</span>
                </button>
              ))}
            </div>
          )}

          {/* Layers List Grid */}
          <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-1.5 custom-scrollbar">
            {filteredLayers.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No matching atmospheric layers found for "{searchQuery}"
              </div>
            ) : (
              filteredLayers.map((layer) => {
                const isActive = activeMode === layer.id;
                return (
                  <button
                    key={layer.id}
                    onClick={() => onSelectMode(layer.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start justify-between gap-2.5 group cursor-pointer ${
                      isActive
                        ? 'bg-cyan-950/70 border-cyan-500/50 shadow-md'
                        : 'bg-slate-900/40 hover:bg-slate-850/80 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isActive
                            ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.6)] font-bold'
                            : 'bg-slate-800 text-cyan-400 group-hover:bg-slate-750 group-hover:text-cyan-300'
                        }`}
                      >
                        {renderLayerIcon(layer.iconName, 16)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-bold truncate ${
                              isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                            }`}
                          >
                            {layer.name}
                          </span>
                          {layer.isAnimated && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Live Flow
                            </span>
                          )}
                          {layer.isSpecialized && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              Aero
                            </span>
                          )}
                        </div>
                        <p className="text-[10.5px] text-slate-400 line-clamp-1 mt-0.5">
                          {layer.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[9.5px] text-slate-400 font-mono">
                          <span>Unit: {layer.unit}</span>
                          <span>•</span>
                          <span className="truncate">{layer.authoritativeSource.split('/')[0]}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center self-center">
                      {isActive ? (
                        <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-md">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      ) : (
                        <ChevronRight
                          size={14}
                          className="text-slate-600 group-hover:text-slate-400 transition-colors"
                        />
                      )}
                    </div>
                  </button>
                );
              })
            )}

            {/* Earth Watch Cross-Link Notice when viewing Hazards */}
            {(selectedCategory === 'hazards' || activeMode.startsWith('severe') || activeMode.startsWith('fire')) && (
              <div className="mt-3 p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-1.5 text-red-400">
                    <Flame size={14} />
                    Natural Disaster Events
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded">
                    Earth Watch
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  To view live USGS earthquakes, NASA active fire perimeters & NOAA cyclones:
                </p>
                {onNavigateEarthWatch && (
                  <button
                    onClick={onNavigateEarthWatch}
                    className="w-full py-1.5 px-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Open Earth Watch Command</span>
                    <ArrowUpRight size={13} />
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Presets Grid */
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          <div className="text-[11px] text-slate-400 mb-2">
            Role-tailored multi-layer preset configurations for instant situational awareness:
          </div>
          {EXPLORER_PRESETS.map((preset) => {
            const isSelected = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-3 group cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/70 border-cyan-500/50 shadow-md'
                    : 'bg-slate-900/40 hover:bg-slate-850/80 border-slate-800/80 text-slate-300'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                        : 'bg-slate-800 text-cyan-400'
                    }`}
                  >
                    {renderLayerIcon(preset.iconName, 18)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{preset.title}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-slate-800 text-cyan-300 border border-slate-700">
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{preset.subtitle}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-cyan-400/90 font-mono">
                      <span>Primary: {EXPLORER_LAYERS[preset.primaryMode]?.name}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 self-center">
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  ) : (
                    <ChevronRight size={14} className="text-slate-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
};
