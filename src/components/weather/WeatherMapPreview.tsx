import React from 'react';
import { CurrentWeatherPayload } from '../../types';
import { formatCoordinates } from '../../utils/formatters';
import {
  Map,
  ArrowRight,
  Maximize2,
  CloudRain,
} from 'lucide-react';
import { MapContainer } from '../maps/MapContainer';

interface WeatherMapPreviewProps {
  weather: CurrentWeatherPayload;
  onNavigateTab?: (tab: string) => void;
}

export const WeatherMapPreview: React.FC<WeatherMapPreviewProps> = ({
  weather,
  onNavigateTab,
}) => {
  return (
    <div
      id="weather-map-preview-card"
      className="rounded-3xl border border-white/12 bg-slate-900/60 backdrop-blur-2xl p-4 sm:p-5 shadow-xl transition-all space-y-3.5"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Map size={16} className="text-cyan-400" />
          <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-200">
            Synoptic Radar & Satellite Geographic Map
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>MAPTILER LIVE</span>
        </div>
      </div>

      {/* Mini Geographic MapLibre Radar Container */}
      <div className="relative h-48 sm:h-56 w-full rounded-2xl overflow-hidden border border-white/10 group shadow-inner">
        <MapContainer
          currentLocation={weather.location}
          initialStyle="hybrid"
          initialOverlay="radar"
          enableHUD={false}
          heightClass="h-full"
        />

        {/* Hover overlay button to jump to full EarthWatch Command */}
        {onNavigateTab && (
          <div className="absolute top-2.5 right-2.5 z-20">
            <button
              onClick={() => onNavigateTab('earthwatch')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-slate-700/80 text-cyan-300 text-xs font-semibold backdrop-blur-md shadow-xl transition-all"
            >
              <Maximize2 size={13} />
              <span>Full Command Map</span>
            </button>
          </div>
        )}

        {/* Location tag badge */}
        <div className="absolute bottom-2.5 left-2.5 z-20 flex items-center gap-2 pointer-events-none">
          <div className="bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 text-[11px] font-mono text-slate-300 shadow-lg">
            {weather.location.name} • {formatCoordinates(weather.location.lat, weather.location.lon)}
          </div>
        </div>
      </div>

      {/* Direct link footer */}
      {onNavigateTab && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-400">
            Live MapTiler GIS basemaps with USGS seismic clusters & RainViewer Doppler radar.
          </span>
          <button
            onClick={() => onNavigateTab('earthwatch')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <span>Explore EarthWatch</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
};
