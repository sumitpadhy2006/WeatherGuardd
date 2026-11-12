import React from 'react';
import { GeoLocationItem } from '../../types';
import { useWeather } from '../../hooks/useWeather';
import { WeatherIcon } from '../common/WeatherIcon';
import { Badge } from '../common/Badge';
import { MapPin, Wind, Droplets, Activity, Edit2, Trash2, Check, Clock } from 'lucide-react';
import { formatTemperature } from '../../utils/formatters';

interface SavedLocationCardProps {
  location: GeoLocationItem & { placeLabel?: string; isDefault?: boolean };
  isActive: boolean;
  isEditing: boolean;
  editNickname: string;
  onSelect: (loc: GeoLocationItem) => void;
  onEditStart: (id: string) => void;
  onEditSave: (id: string) => void;
  onEditCancel: () => void;
  onEditChange: (val: string) => void;
  onDelete: (id: string, name: string) => void;
  onAssignLabel: (id: string, label: string) => void;
  onRequestCustomTag: (onSave: (val: string) => void) => void;
  unit: 'C' | 'F';
}

// Map weather IDs to subtle tailwind background classes
const getWeatherBackground = (weatherId?: number, isNight = false) => {
  if (!weatherId) return 'bg-slate-900/40 border-slate-800';

  if (weatherId >= 200 && weatherId < 300) {
    // Thunderstorm
    return 'bg-indigo-950/40 border-indigo-500/30 shadow-[inset_0_0_20px_rgba(79,70,229,0.1)]';
  }
  if (weatherId >= 300 && weatherId < 600) {
    // Rain/Drizzle
    return 'bg-cyan-950/30 border-cyan-700/30';
  }
  if (weatherId >= 600 && weatherId < 700) {
    // Snow
    return 'bg-sky-950/40 border-sky-400/20';
  }
  if (weatherId >= 700 && weatherId < 800) {
    // Atmosphere (Fog, etc)
    return 'bg-slate-800/40 border-slate-600/30';
  }
  if (weatherId === 800) {
    // Clear
    return isNight
      ? 'bg-[#0a0f24]/60 border-indigo-900/40' // Darker indigo for clear night
      : 'bg-sky-900/20 border-sky-500/20'; // Warm/blue for clear day
  }
  if (weatherId > 800) {
    // Clouds
    return 'bg-slate-800/30 border-slate-700/40';
  }

  return 'bg-slate-900/40 border-slate-800';
};

export const SavedLocationCard: React.FC<SavedLocationCardProps> = ({
  location,
  isActive,
  isEditing,
  editNickname,
  onSelect,
  onEditStart,
  onEditSave,
  onEditCancel,
  onEditChange,
  onDelete,
  onAssignLabel,
  onRequestCustomTag,
  unit,
}) => {
  // Fetch weather data autonomously for this specific card
  const { data: weather, isLoading, error } = useWeather(location, 15);

  const cleanName = (location?.name || 'Unknown Location').replace(/\s*\([A-Za-z]*\)/g, '').replace(/\s+(East|West|North|South)$/i, '').split(',')[0];
  const displayName = location.nickname || cleanName;
  const contextName = [location?.district, location?.state, location?.countryCode].filter(Boolean).join(', ');

  const isNight = weather?.condition?.icon?.endsWith('n') ?? false;
  const weatherBg = getWeatherBackground(weather?.condition?.id, isNight);

  const activeStyles = isActive
    ? 'ring-1 ring-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
    : 'hover:border-slate-600 hover:bg-slate-800/50';

  return (
    <div
      onClick={() => onSelect(location)}
      className={`group relative overflow-hidden p-4 rounded-2xl border transition-all duration-300 cursor-pointer backdrop-blur-xl ${weatherBg} ${activeStyles}`}
    >
      {/* Decorative Glow for Active State */}
      {isActive && (
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* --- Header Row --- */}
      <div className="flex items-start justify-between gap-2 relative z-10">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <MapPin size={16} className={`mt-1 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
          <div className="flex flex-col min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editNickname}
                  onChange={(e) => onEditChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onEditSave(location.id);
                    if (e.key === 'Escape') onEditCancel();
                  }}
                  className="bg-slate-950/80 border border-cyan-500/50 rounded-md px-2 py-1 text-sm text-white w-full max-w-[150px] focus:outline-none focus:border-cyan-400"
                  placeholder="Nickname (optional)"
                  autoFocus
                />
                <button
                  onClick={() => onEditSave(location.id)}
                  className="p-1 text-emerald-400 hover:bg-emerald-400/20 rounded transition-colors"
                >
                  <Check size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold text-slate-100 truncate">{displayName}</span>
                {isActive && <Badge variant="cyan" size="sm">Active</Badge>}
                {location.placeLabel && location.placeLabel !== 'Custom' && (
                  <Badge variant="violet" size="sm" className="bg-indigo-900/40 text-indigo-300 border-indigo-800/50 uppercase tracking-widest text-[9px] px-1.5 py-0.5">
                    {location.placeLabel}
                  </Badge>
                )}
              </div>
            )}
            {!isEditing && (
              <span className="text-xs text-slate-400 truncate mt-0.5">
                {location.nickname ? `${cleanName} • ` : ''}{contextName}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons (Hover Reveal) */}
        <div 
          className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <select
            value={location.placeLabel || 'Custom'}
            onChange={(e) => {
              if (e.target.value === '__custom__') {
                onRequestCustomTag((customName) => {
                  if (customName && customName.trim()) {
                    onAssignLabel(location.id, customName.trim());
                  }
                });
              } else {
                onAssignLabel(location.id, e.target.value);
              }
            }}
            className="appearance-none bg-slate-800/60 text-slate-300 hover:text-cyan-300 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md border border-slate-700/50 hover:border-cyan-500/50 cursor-pointer focus:outline-none transition-colors mr-1"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="Custom">Save As...</option>
            <option value="Home">Home</option>
            <option value="Work">Work</option>
            <option value="College">College</option>
            <option value="Institution">Institution</option>
            <option value="Travel">Travel</option>
            {location.placeLabel && location.placeLabel !== 'Custom' && !['Home', 'Work', 'College', 'Institution', 'Travel'].includes(location.placeLabel) && (
              <option value={location.placeLabel}>{location.placeLabel}</option>
            )}
            <option value="__custom__">+ Custom...</option>
          </select>
          <button
            onClick={() => onEditStart(location.id)}
            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 rounded-md transition-colors"
            title="Edit Nickname"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(location.id, displayName)}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
            title="Remove Location"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* --- Weather Body --- */}
      <div className="mt-4 flex items-end justify-between relative z-10">
        <div className="flex flex-col">
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-10 w-24 bg-slate-800/50 rounded animate-pulse" />
              <div className="h-4 w-32 bg-slate-800/50 rounded animate-pulse" />
            </div>
          ) : error ? (
            <span className="text-xs text-amber-400/80">Telemetry unavailable</span>
          ) : weather ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-light text-white tracking-tighter">
                  {formatTemperature(weather?.temp, { tempUnit: unit }).replace('°C','').replace('°F','')}
                </span>
                <span className="text-xl font-light text-slate-300">°{unit}</span>
              </div>
              <span className="text-sm font-medium text-slate-200 mt-1 capitalize">
                {weather?.condition?.description}
              </span>
            </>
          ) : null}
        </div>

        {/* Weather Icon Large */}
        {weather && !isLoading && (
          <div className="mb-2">
            <WeatherIcon
              iconCode={weather?.condition?.icon}
              className="w-14 h-14 drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
            />
          </div>
        )}
      </div>

      {/* --- Compact Telemetry Row --- */}
      <div className="mt-4 pt-3 border-t border-slate-700/30 flex items-center justify-between text-[11px] text-slate-300 relative z-10">
        <div className="flex items-center gap-3">
          {weather && !isLoading ? (
            <>
              <div className="flex items-center gap-1">
                <Droplets size={12} className="text-blue-400" />
                <span>{Math.round((weather?.hourly?.[0]?.pop || 0) * 100)}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Wind size={12} className="text-slate-400" />
                <span>{Math.round(weather?.windSpeed)} km/h</span>
              </div>
              <div className="flex items-center gap-1 hidden sm:flex">
                <Activity size={12} className={
                  weather?.airQuality?.aqi <= 50 ? 'text-emerald-400' :
                  weather?.airQuality?.aqi <= 100 ? 'text-amber-400' : 'text-red-400'
                } />
                <span>AQI {weather?.airQuality?.aqi}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1 text-slate-500 font-mono">
              {Math.abs(location.lat).toFixed(2)}°, {Math.abs(location.lon).toFixed(2)}°
            </div>
          )}
        </div>

        {/* Refresh Indicator */}
        {weather && !isLoading && (
          <div className="flex items-center gap-1 text-slate-500" title="Live Telemetry">
            <Clock size={10} />
            <span>Live</span>
          </div>
        )}
      </div>
    </div>
  );
};
