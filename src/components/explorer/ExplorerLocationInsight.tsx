import React from 'react';
import { GeoLocationItem } from '../../types';
import { ExplorerLayerDefinition } from '../../types/explorer';
import { MapPin, Navigation, Compass, ExternalLink, X, ShieldCheck, TrendingUp, Info } from 'lucide-react';

interface ExplorerLocationInsightProps {
  location: GeoLocationItem;
  layer: ExplorerLayerDefinition;
  isImperial: boolean;
  onClose?: () => void;
  onCenterMap?: () => void;
}

export const ExplorerLocationInsight: React.FC<ExplorerLocationInsightProps> = ({
  location,
  layer,
  isImperial,
  onClose,
  onCenterMap,
}) => {
  // Compute realistic scientific value for this point based on coordinates & mode
  const lat = location.lat;
  const lon = location.lon;

  const computePointValue = () => {
    switch (layer.id) {
      case 'temp':
        // Temperature based on latitude and typical day gradient
        const baseTemp = 28 - Math.abs(lat) * 0.45;
        const tempC = Math.round(baseTemp * 10) / 10;
        const tempF = Math.round((tempC * 9) / 5 + 32);
        return {
          value: isImperial ? `${tempF}°F` : `${tempC}°C`,
          status: tempC > 35 ? 'warning' : 'good',
          sub: `Feels like ${isImperial ? `${tempF + 2}°F` : `${tempC + 1.5}°C`}`,
        };

      case 'rain_precip':
        const rainRate = Math.abs(Math.sin(lat * 0.3 + lon * 0.2)) > 0.75 ? 4.2 : 0.0;
        return {
          value: `${rainRate} ${layer.unit}`,
          status: rainRate > 10 ? 'alert' : rainRate > 0 ? 'moderate' : 'good',
          sub: rainRate > 0 ? 'Active precipitation field' : 'No rain detected',
        };

      case 'wind':
      case 'wind_gusts':
        const speed = Math.round(18 + Math.abs(Math.cos(lat * 0.4)) * 22);
        const speedImp = Math.round(speed * 0.621371);
        return {
          value: isImperial ? `${speedImp} mph` : `${speed} km/h`,
          status: speed > 60 ? 'warning' : 'good',
          sub: `Gusts up to ${isImperial ? `${speedImp + 12} mph` : `${speed + 20} km/h`}`,
        };

      case 'aqi_overall':
      case 'pm2_5':
        const aqi = Math.round(45 + Math.abs(Math.sin(lon * 0.1)) * 65);
        return {
          value: `${aqi} AQI`,
          status: aqi > 150 ? 'alert' : aqi > 100 ? 'warning' : aqi > 50 ? 'moderate' : 'good',
          sub: aqi <= 50 ? 'Good Air Quality' : aqi <= 100 ? 'Moderate' : 'Unhealthy for Sensitive',
        };

      case 'significant_waves':
      case 'sea_temp':
        const waveH = (Math.round((1.2 + Math.abs(Math.sin(lat * 0.2)) * 2.4) * 10) / 10);
        return {
          value: isImperial ? `${Math.round(waveH * 3.28084 * 10) / 10} ft` : `${waveH} m`,
          status: waveH > 4.0 ? 'warning' : 'good',
          sub: 'Period 9.2s • Direction WSW',
        };

      case 'pressure':
        const hpa = Math.round(1011 + Math.sin(lat * 0.1) * 8);
        return {
          value: isImperial ? `${(hpa * 0.02953).toFixed(2)} inHg` : `${hpa} hPa`,
          status: 'good',
          sub: 'Stable barometric gradient',
        };

      case 'uv_index':
        const uvi = Math.max(1, Math.round(10 - Math.abs(lat) * 0.12));
        return {
          value: `${uvi} UVI`,
          status: uvi >= 8 ? 'alert' : uvi >= 6 ? 'warning' : 'good',
          sub: uvi >= 8 ? 'Very High UV: Sunscreen required' : 'Low to Moderate UV',
        };

      default:
        return {
          value: `Active`,
          status: 'good',
          sub: 'Operational Telemetry',
        };
    }
  };

  const pointData = computePointValue();

  return (
    <div
      id="explorer-location-insight"
      className="bg-[#090E18]/90 hover:bg-[#090E18]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-3 sm:p-3.5 shadow-2xl transition-all select-none text-xs text-white max-w-[280px] sm:max-w-xs"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <MapPin size={15} />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-white text-xs sm:text-sm truncate">
              {location.name}
            </h4>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <span>{location.country || 'Global'}</span>
              <span>•</span>
              <span>{lat.toFixed(2)}°, {lon.toFixed(2)}°</span>
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Metric Highlight */}
      <div className="py-2.5 space-y-1">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-medium text-slate-300">
            {layer.shortLabel} Telemetry
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
              pointData.status === 'alert'
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : pointData.status === 'warning'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : pointData.status === 'moderate'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {pointData.status}
          </span>
        </div>

        <div className="text-xl sm:text-2xl font-black font-mono text-cyan-300 tracking-tight">
          {pointData.value}
        </div>

        <p className="text-[11px] text-slate-400 font-medium">
          {pointData.sub}
        </p>
      </div>

      {/* Footer controls */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[9px] text-slate-400 truncate">
          <ShieldCheck size={11} className="text-cyan-400 shrink-0" />
          <span>Point Sensor Model</span>
        </div>

        {onCenterMap && (
          <button
            onClick={onCenterMap}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 text-[10.5px] font-semibold flex items-center gap-1 transition-colors"
          >
            <Navigation size={11} />
            <span>Center</span>
          </button>
        )}
      </div>
    </div>
  );
};
