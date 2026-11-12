import React from 'react';
import {
  Tractor,
  Droplets,
  Wind,
  Thermometer,
  ShieldAlert,
  Sun,
  Sprout,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { usePersonalization } from '../../context/PersonalizationContext';
import { useLocation } from '../../context/LocationContext';
import { useWeather } from '../../hooks/useWeather';

export const FarmerDashboard: React.FC = () => {
  const { farmerData } = usePersonalization();
  const { currentLocation } = useLocation();
  const { data: weather } = useWeather(currentLocation);

  if (!farmerData || !weather) {
    return (
      <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
        Loading agricultural telemetry...
      </div>
    );
  }

  const {
    soilMoisturePercent,
    soilTempCelsius,
    evapotranspirationEt0Mm,
    sprayWindowViability,
    sprayWindowReason,
    frostRisk,
    frostWindowEstimated,
    irrigationRecommendation,
    growingDegreeDaysGdd,
    pestRiskIndex,
    harvestWindowForecast,
    cropAdvice,
  } = farmerData;

  const sprayColor =
    sprayWindowViability === 'Optimal'
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      : sprayWindowViability === 'Caution'
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      : 'bg-red-500/20 text-red-300 border-red-500/40';

  const frostColor =
    frostRisk === 'None'
      ? 'text-slate-400 bg-slate-800/60 border-slate-700'
      : frostRisk === 'Low'
      ? 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40'
      : frostRisk === 'Moderate'
      ? 'text-amber-300 bg-amber-500/20 border-amber-500/40'
      : 'text-red-300 bg-red-500/20 border-red-500/40 animate-pulse';

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Tractor size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Agro-Meteorology & Field Advisory
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {weather.location.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Precision micro-climate insights: soil hydrology, evapotranspiration loss, spray windows & frost protection.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 ${sprayColor}`}>
            {sprayWindowViability === 'Optimal' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
            Spray Window: {sprayWindowViability}
          </span>
        </div>
      </div>

      {/* Top 4 Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Soil Moisture */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Soil Moisture</span>
            <Droplets size={16} className="text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {soilMoisturePercent}%
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                soilMoisturePercent < 30
                  ? 'bg-amber-400'
                  : soilMoisturePercent > 80
                  ? 'bg-blue-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${soilMoisturePercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 block">
            {soilMoisturePercent < 30 ? 'Dry / Depleted' : soilMoisturePercent > 75 ? 'Saturated / Waterlogged' : 'Adequate Field Capacity'}
          </span>
        </div>

        {/* Evapotranspiration (ET0) */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Reference ET0</span>
            <Sun size={16} className="text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">
            {evapotranspirationEt0Mm} <span className="text-xs text-slate-400 font-normal">mm/day</span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            Atmospheric crop water loss rate (Penman-Monteith)
          </span>
        </div>

        {/* Frost Risk Level */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Frost Threat</span>
            <ShieldAlert size={16} className="text-blue-400" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-base font-bold font-mono px-2 py-0.5 rounded-lg border ${frostColor}`}>
              {frostRisk}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            {frostWindowEstimated || `Min Temp: ${weather.tempMin.toFixed(1)}°C`}
          </span>
        </div>

        {/* Growing Degree Days */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">GDD (Base 10°C)</span>
            <Sprout size={16} className="text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            +{growingDegreeDaysGdd} <span className="text-xs text-slate-400 font-normal">HU</span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            Accumulated thermal units for crop phenology
          </span>
        </div>
      </div>

      {/* 2-Column Operational Grid: Spray & Irrigation + Harvest Workability */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (7 cols): Spray & Irrigation Action Directives */}
        <div className="lg:col-span-7 space-y-3">
          {/* Chemical Spray Window Card */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Wind size={14} className="text-cyan-400" /> Pesticide / Fertilizer Spray Window
              </span>
              <span className="text-xs font-mono text-slate-400">
                Wind: {Math.round(weather.windSpeed)} km/h • POP: {Math.round((weather.hourly?.[0]?.pop ?? 0) * 100)}%
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {sprayWindowReason}
            </p>
          </div>

          {/* Irrigation Schedule Advice */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Droplets size={14} className="text-blue-400" /> Smart Irrigation Recommendation
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                {irrigationRecommendation}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono pt-1 text-slate-300">
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Soil Temperature</span>
                <span className="font-bold text-white">{soilTempCelsius}°C</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Pest / Fungal Risk</span>
                <span className="font-bold text-amber-400">{pestRiskIndex}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Humidity Canopy</span>
                <span className="font-bold text-cyan-400">{weather.humidity}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): 3-Day Harvest & Field Workability */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} className="text-emerald-400" /> Harvest & Field Workability
              </span>
              <span className="text-[10px] font-mono text-slate-400">3-Day Window</span>
            </div>

            <div className="space-y-2">
              {harvestWindowForecast.map((h, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <span className="font-bold text-white block">{h.day}</span>
                    <span className="text-[10px] text-slate-400">{h.condition}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-bold">{h.workability}</div>
                    <span className="text-[9px] text-slate-500">Drying: {h.dryingSpeed}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Agronomy Advisory Bulletins */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2.5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={14} className="text-amber-400" /> Live Agronomy Bulletins & Crop Protection Directives
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
          {cropAdvice.map((bullet, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/70 flex items-start gap-2">
              <span className="text-emerald-400 font-bold mt-0.5">•</span>
              <span>{bullet}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
