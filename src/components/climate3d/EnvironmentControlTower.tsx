import React from 'react';
import { useClimate } from '../../context/ClimateContext';
import { useAtmosphere } from '../../context/AtmosphereContext';
import { WeatherState } from './types';
import { CloudRain, Cloud, Sun, CloudFog, Compass, 
  CloudLightning, CloudSun, X, Wifi, WifiOff
} from 'lucide-react';
import { TimeOfDayStr } from '../effects/DynamicSky';
import { usePreferences } from '../../context/PreferencesContext';

export const EnvironmentControlTower: React.FC = () => {
  const { isControlTowerOpen, setControlTowerOpen, weather: currentCondition, setWeather: setCondition, timeOfDay, setTimeOfDay, isAutoPilot, setIsAutoPilot } = useClimate();
  const { weather: liveWeather, atmosphereState, currentLocation } = useAtmosphere();
  const { updatePreferences } = usePreferences();

  if (!isControlTowerOpen) return null;

  const isManualWeather = !isAutoPilot;
  const setIsManualWeather = (manual: boolean) => setIsAutoPilot(!manual);

  // Live API values
  const liveTemp = liveWeather?.temp !== undefined ? Math.round(liveWeather.temp) : '--';
  const liveHumidity = liveWeather?.humidity !== undefined ? `${liveWeather.humidity}%` : '--';
  const liveWind = liveWeather?.windSpeed !== undefined ? `${Math.round(liveWeather.windSpeed * 3.6)} km/h` : '--';
  const liveConditionLabel = liveWeather?.condition?.description
    ? liveWeather.condition.description.replace(/\b\w/g, (l: string) => l.toUpperCase())
    : atmosphereState.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

  const liveSunrise = liveWeather?.celestial?.sunrise
    ? new Date(liveWeather.celestial.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--';
  const liveSunset = liveWeather?.celestial?.sunset
    ? new Date(liveWeather.celestial.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--';

  const locationLabel = currentLocation?.name
    ? `${currentLocation.name}${currentLocation.country ? `, ${currentLocation.country}` : ''}`
    : 'Live Location';

  const getTimeStr = (t: number): TimeOfDayStr => {
    if (t >= 5 && t < 10) return 'morning';
    if (t >= 10 && t < 16) return 'afternoon';
    if (t >= 16 && t < 18) return 'evening';
    if (t >= 18 && t < 20) return 'sunset';
    return 'night';
  };

  const setTimeStr = (t: TimeOfDayStr) => {
    switch (t) {
      case 'morning': setTimeOfDay(8); break;
      case 'afternoon': setTimeOfDay(13); break;
      case 'evening': setTimeOfDay(17); break;
      case 'sunset': setTimeOfDay(19); break;
      case 'night': setTimeOfDay(22); break;
    }
  };

  const getConditionIcon = () => {
    switch (currentCondition) {
      case 'sunny': return <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />;
      case 'cloudy':
      case 'overcast': return <Cloud className="w-5 h-5 text-slate-400" />;
      case 'light_rain': return <CloudRain className="w-5 h-5 text-indigo-400 animate-pulse" />;
      case 'heavy_rain': return <CloudRain className="w-5 h-5 text-blue-500 animate-bounce" />;
      case 'thunderstorm': return <CloudLightning className="w-5 h-5 text-purple-400 animate-pulse" />;
      case 'fog': return <CloudFog className="w-5 h-5 text-teal-400" />;
      default: return <CloudSun className="w-5 h-5 text-sky-300" />;
    }
  };

  const handleConditionSelect = (cond: WeatherState) => {
    setCondition(cond);
    let simMode: any = cond;
    if (cond === 'sunny') simMode = 'clear_day';
    else if (cond === 'cloudy' || cond === 'overcast') simMode = 'auto';
    else if (cond === 'light_rain' || cond === 'heavy_rain') simMode = 'rain';
    updatePreferences({ ambientSimulationMode: simMode });
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div
        id="live-weather-control"
        className="backdrop-blur-xl border border-white/10 dark:border-slate-800/60 p-4 rounded-2xl shadow-xl transition-all duration-300 relative overflow-hidden"
        style={{ background: 'rgba(15, 23, 42, 0.90)' }}
      >
        <button
          onClick={() => setControlTowerOpen(false)}
          className="absolute top-4 right-4 z-20 text-slate-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-3 relative z-10 pr-6">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-purple-400" />
            <span className="font-display text-xs tracking-wider font-semibold uppercase text-slate-300 truncate max-w-[160px]">
              {locationLabel}
            </span>
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border ${
            isManualWeather
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full bg-current ${!isManualWeather && 'animate-ping'}`}></span>
            {isManualWeather ? 'MANUAL OVERRIDE' : 'AUTO PILOT'}
          </div>
        </div>

        {/* Control Mode Toggle */}
        <div className="mb-3 flex items-center justify-between bg-slate-950/40 p-2.5 rounded-xl border border-white/5 relative z-10">
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Control Mode</span>
          <div className="flex gap-1 bg-slate-950 p-0.5 rounded-lg border border-white/10">
            <button
              type="button"
              onClick={() => setIsManualWeather(false)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold font-mono transition-all cursor-pointer ${
                !isManualWeather
                  ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Wifi size={9} />
              AUTO PILOT
            </button>
            <button
              type="button"
              onClick={() => setIsManualWeather(true)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold font-mono transition-all cursor-pointer ${
                isManualWeather
                  ? 'bg-amber-600/30 text-amber-400 border border-amber-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <WifiOff size={9} />
              MANUAL
            </button>
          </div>
        </div>

        {/* Live weather summary */}
        <div className="flex flex-col gap-3 mb-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                {getConditionIcon()}
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-white tracking-tight">
                  {isManualWeather ? '—°C' : `${liveTemp}°C`}
                </div>
                <div className="text-xs text-slate-300 font-medium capitalize">
                  {isManualWeather ? currentCondition.replace(/_/g, ' ') : liveConditionLabel}
                </div>
              </div>
            </div>
            {!isManualWeather && liveWeather && (
              <div className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                LIVE API
              </div>
            )}
          </div>

          {/* Weather overrides grid */}
          <div className="mt-1">
            <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              {isManualWeather ? 'Interactive Environment Overrides' : 'Preview (API-Controlled — Switch to Manual to override)'}
            </div>
            <div className="grid grid-cols-4 gap-1.5 bg-slate-950/65 p-1.5 rounded-xl border border-white/5 max-h-44 overflow-y-auto">
              {([
                { key: 'sunny', emoji: '☀️' },
                { key: 'cloudy', emoji: '☁️' },
                { key: 'overcast', emoji: '☁️' },
                { key: 'fog', emoji: '🌫️' },
                { key: 'light_rain', emoji: '🌦️' },
                { key: 'heavy_rain', emoji: '🌧️' },
                { key: 'thunderstorm', emoji: '⛈️' },
                { key: 'snow', emoji: '❄️' },
                { key: 'windy', emoji: '🌬️' },
                { key: 'heavy_snow', emoji: '🌨️' },
                { key: 'blizzard', emoji: '❄️' },
                { key: 'hail', emoji: '🧊' },
                { key: 'tornado', emoji: '🌪️' },
                { key: 'sandstorm', emoji: '🌪️' },
                { key: 'cyclone', emoji: '🌊' },
                { key: 'heatwave', emoji: '🔥' },
                { key: 'cold_wave', emoji: '🥶' },
                { key: 'frost', emoji: '🧊' },
                { key: 'aurora', emoji: '🌌' },
                { key: 'meteor_shower', emoji: '☄️' },
              ] as const).map((item) => (
                <button
                  key={item.key}
                  disabled={!isManualWeather}
                  onClick={() => handleConditionSelect(item.key as WeatherState)}
                  className={`py-1.5 rounded-lg text-xs capitalize transition-all cursor-pointer flex flex-col items-center justify-center border disabled:opacity-40 disabled:cursor-not-allowed ${
                    currentCondition === item.key
                      ? 'bg-purple-600/35 text-white border-purple-500 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border-transparent'
                  }`}
                  title={isManualWeather ? `Simulate ${item.key.replace('_', ' ')} weather` : 'Switch to Manual mode to modify'}
                >
                  <span className="text-sm leading-tight">{item.emoji}</span>
                  <span className="text-[8px] tracking-tight font-mono opacity-80 scale-90 mt-0.5 truncate max-w-full">
                    {item.key.split('_')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Time of day */}
          <div className="mt-2.5 pt-2.5 border-t border-white/5">
            <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              {isManualWeather ? 'Time of Day (Sky State)' : 'Time of Day (Real-Time)'}
            </div>
            <div className="grid grid-cols-5 gap-1 bg-slate-950/65 p-1 rounded-xl border border-white/5">
              {([
                { key: 'morning', label: 'Morning', icon: '🌅' },
                { key: 'afternoon', label: 'Midday', icon: '☀️' },
                { key: 'evening', label: 'Evening', icon: '🌇' },
                { key: 'sunset', label: 'Sunset', icon: '🌆' },
                { key: 'night', label: 'Night', icon: '🌑' }
              ] as const).map((t) => (
                <button
                  key={t.key}
                  disabled={!isManualWeather}
                  onClick={() => setTimeStr(t.key as TimeOfDayStr)}
                  className={`py-1 rounded-lg text-xs capitalize transition-all cursor-pointer flex flex-col items-center justify-center border disabled:opacity-40 disabled:cursor-not-allowed ${
                    getTimeStr(timeOfDay) === t.key
                      ? 'bg-purple-600/35 text-white border-purple-500 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border-transparent'
                  }`}
                  title={isManualWeather ? `Simulate ${t.label} Sky` : 'Driven by real local time'}
                >
                  <span className="text-xs leading-none">{t.icon}</span>
                  <span className="text-[8px] tracking-tight font-mono opacity-80 scale-90 mt-0.5 truncate max-w-full leading-none">
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live stats footer */}
        <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-white/5 font-mono text-[11px] text-slate-400 relative z-10">
          <div className="flex justify-between items-center bg-slate-950/20 px-2 py-1 rounded border border-white/5">
            <span>Humidity:</span>
            <span className="text-slate-200 font-bold">{isManualWeather ? '—' : liveHumidity}</span>
          </div>
          <div className="flex justify-between items-center bg-slate-950/20 px-2 py-1 rounded border border-white/5">
            <span>Wind:</span>
            <span className="text-slate-200 font-bold">{isManualWeather ? '—' : liveWind}</span>
          </div>
          <div className="flex justify-between items-center bg-slate-950/20 px-2 py-1 rounded border border-white/5">
            <span>Sunrise:</span>
            <span className="text-slate-200 font-bold">{isManualWeather ? '—' : liveSunrise}</span>
          </div>
          <div className="flex justify-between items-center bg-slate-950/20 px-2 py-1 rounded border border-white/5">
            <span>Sunset:</span>
            <span className="text-slate-200 font-bold">{isManualWeather ? '—' : liveSunset}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
