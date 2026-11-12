import React, { useState } from 'react';
import { ExplorerLayerDefinition, ExplorerActiveLayers } from '../../types/explorer';
import { ShieldCheck, Eye, EyeOff, Sliders, ChevronDown, ChevronUp, Layers } from 'lucide-react';

interface ExplorerLegendProps {
  layer: ExplorerLayerDefinition;
  activeLayers: ExplorerActiveLayers;
  onChangeOpacity: (opacity: number) => void;
  onToggleWindParticles: () => void;
  onToggleRadar: () => void;
  onToggleClouds: () => void;
  onToggleIsobars: () => void;
  isImperial: boolean;
}

export const ExplorerLegend: React.FC<ExplorerLegendProps> = ({
  layer,
  activeLayers,
  onChangeOpacity,
  onToggleWindParticles,
  onToggleRadar,
  onToggleClouds,
  onToggleIsobars,
  isImperial,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showStackControls, setShowStackControls] = useState(false);

  const displayUnit = isImperial && layer.unitImperial ? layer.unitImperial : layer.unit;

  return (
    <div
      id="explorer-legend-card"
      className="bg-[#090E17]/90 hover:bg-[#090E17]/95 backdrop-blur-xl border border-slate-700/70 rounded-2xl p-3 sm:p-3.5 shadow-2xl transition-all select-none max-w-[280px] sm:max-w-xs text-xs text-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold text-slate-100 truncate text-xs sm:text-sm">
            {layer.name}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowStackControls(!showStackControls)}
            title="Layer stacking & overlays"
            className={`p-1 rounded-lg border transition-colors ${
              showStackControls
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Layers size={13} />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="pt-2.5 space-y-2.5">
          {/* Unit and scale indicator */}
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Scale ({displayUnit})</span>
            <span className="font-mono text-[10px] text-cyan-300 font-semibold px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
              {layer.legendType.toUpperCase()}
            </span>
          </div>

          {/* Color Gradient / Steps Bar */}
          {layer.legendType === 'gradient' ? (
            <div className="space-y-1">
              <div
                className="h-3.5 rounded-lg border border-slate-700/80 shadow-inner w-full"
                style={{
                  background: `linear-gradient(to right, ${layer.colorStops
                    .map((s) => s.color)
                    .join(', ')})`,
                }}
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-300 px-0.5">
                <span>{layer.colorStops[0]?.label}</span>
                <span>{layer.colorStops[layer.colorStops.length - 1]?.label}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex rounded-md overflow-hidden border border-slate-700/80 h-3.5 w-full">
                {layer.colorStops.map((stop, idx) => (
                  <div
                    key={idx}
                    className="flex-1 transition-transform hover:scale-y-110"
                    style={{ backgroundColor: stop.color }}
                    title={stop.label}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[9.5px] font-mono text-slate-300 overflow-hidden text-ellipsis whitespace-nowrap">
                <span>{layer.colorStops[0]?.label.split(' ')[0]}</span>
                <span>{layer.colorStops[Math.floor(layer.colorStops.length / 2)]?.label.split(' ')[0]}</span>
                <span>{layer.colorStops[layer.colorStops.length - 1]?.label.split(' ')[0]}</span>
              </div>
            </div>
          )}

          {/* Layer Opacity Slider */}
          <div className="pt-1 flex items-center gap-2">
            <span className="text-[10px] font-medium text-slate-400">Opacity</span>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={activeLayers.layerOpacity}
              onChange={(e) => onChangeOpacity(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="text-[10px] font-mono text-slate-300 w-7 text-right">
              {Math.round(activeLayers.layerOpacity * 100)}%
            </span>
          </div>

          {/* Quick Overlay Stack Toggles (if expanded) */}
          {showStackControls && (
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Overlay Combinations
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={onToggleWindParticles}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium border flex items-center justify-between transition-all ${
                    activeLayers.showWindParticles
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
                  }`}
                >
                  <span>Wind Streamlines</span>
                  <span className="text-[9px] font-mono font-bold">
                    {activeLayers.showWindParticles ? 'ON' : 'OFF'}
                  </span>
                </button>

                <button
                  onClick={onToggleRadar}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium border flex items-center justify-between transition-all ${
                    activeLayers.showRadarOverlay
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
                  }`}
                >
                  <span>Rain Doppler</span>
                  <span className="text-[9px] font-mono font-bold">
                    {activeLayers.showRadarOverlay ? 'ON' : 'OFF'}
                  </span>
                </button>

                <button
                  onClick={onToggleClouds}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium border flex items-center justify-between transition-all ${
                    activeLayers.showCloudCover
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
                  }`}
                >
                  <span>Clouds Cover</span>
                  <span className="text-[9px] font-mono font-bold">
                    {activeLayers.showCloudCover ? 'ON' : 'OFF'}
                  </span>
                </button>

                <button
                  onClick={onToggleIsobars}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium border flex items-center justify-between transition-all ${
                    activeLayers.showIsobars
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
                  }`}
                >
                  <span>Pressure Isobars</span>
                  <span className="text-[9px] font-mono font-bold">
                    {activeLayers.showIsobars ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Authoritative Source Badge */}
          <div className="flex items-center gap-1 text-[9.5px] text-slate-400/90 pt-1">
            <ShieldCheck size={11} className="text-cyan-400 shrink-0" />
            <span className="truncate">{layer.authoritativeSource}</span>
          </div>
        </div>
      )}
    </div>
  );
};
