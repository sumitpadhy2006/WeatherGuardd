import React, { useState } from 'react';
import {
  Plane,
  Luggage,
  Clock,
  Compass,
  AlertTriangle,
  Sun,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Wind,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { usePersonalization } from '../../context/PersonalizationContext';
import { useLocation } from '../../context/LocationContext';
import { useWeather } from '../../hooks/useWeather';

export const TravelerDashboard: React.FC = () => {
  const { travelerData } = usePersonalization();
  const { currentLocation } = useLocation();
  const { data: weather } = useWeather(currentLocation);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  if (!travelerData || !weather) {
    return (
      <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
        Loading travel itinerary telemetry...
      </div>
    );
  }

  const {
    itinerary,
    generalPackingAdvice,
    jetlagSunlightAdvice,
    localTimeAndSun,
    emergencyServicesNumber,
  } = travelerData;

  const toggleCheck = (item: string) => {
    setCheckedItems((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Plane size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Multi-City Travel & Flight Corridor Weather
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Itinerary Synced
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-stop climate comparison, flight corridor turbulence indicators, automated packing checklist & jet lag sun synchronization.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
            <Clock size={13} className="text-amber-400" />
            <span>{localTimeAndSun.localTime} ({localTimeAndSun.daylightRemainingHours}h sun left)</span>
          </div>
        </div>
      </div>

      {/* Multi-City Itinerary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {itinerary.map((city) => {
          const turbColor =
            city.flightTurbulenceRisk === 'Low'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : city.flightTurbulenceRisk === 'Moderate'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-red-500/20 text-red-300 border-red-500/40';

          return (
            <div
              key={city.id}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      <MapPin size={14} className="text-amber-400" />
                      {city.cityName}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{city.dates}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${turbColor}`}>
                    Turbulence: {city.flightTurbulenceRisk}
                  </span>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-base font-bold text-white font-mono">{city.tempRange}</div>
                    <span className="text-[11px] text-slate-400 capitalize">{city.weatherCondition}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-cyan-400">{city.rainChance}% POP</span>
                    <span className="text-[10px] text-slate-500 block">Precipitation</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs">
                {city.localAlerts.map((alert, i) => (
                  <div key={i} className="text-slate-300 text-[11px] flex items-center gap-1.5">
                    <span className="text-amber-400">•</span>
                    <span>{alert}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column: Smart Packing Checklist + Jet Lag & Emergency */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Smart Packing Checklist (7 cols) */}
        <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Luggage size={14} className="text-amber-400" /> Climate-Tailored Packing Checklist
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              {Object.values(checkedItems).filter(Boolean).length} / {generalPackingAdvice.length} Packed
            </span>
          </div>

          <div className="space-y-2">
            {generalPackingAdvice.map((item, idx) => {
              const isDone = !!checkedItems[item];

              return (
                <div
                  key={idx}
                  onClick={() => toggleCheck(item)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs">
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                        isDone ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600'
                      }`}
                    >
                      {isDone && <CheckCircle2 size={12} />}
                    </div>
                    <span className={isDone ? 'line-through opacity-80' : ''}>{item}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Auto-Generated</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Jet Lag & Emergency Services (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Jet Lag Advice */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sun size={14} className="text-amber-400" /> Circadian Rhythm & Sunlight Reset
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {jetlagSunlightAdvice}
            </p>
          </div>

          {/* Local Emergency Dispatch */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <PhoneCall size={14} className="text-red-400" /> Emergency Services Hotlines
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-300">
                {emergencyServicesNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dial local dispatch for immediate medical, police, or mountain rescue assistance in {weather.location.name}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
