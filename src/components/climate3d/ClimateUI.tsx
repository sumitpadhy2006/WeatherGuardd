import React from 'react';
import { WeatherState } from './types';

interface ClimateUIProps {
  timeOfDay: number;
  setTimeOfDay: (time: number) => void;
  weather: WeatherState;
  setWeather: (weather: WeatherState) => void;
  speed: number;
  setSpeed: (speed: number) => void;
}

const WEATHERS: WeatherState[] = ['sunny', 'cloudy', 'overcast', 'fog', 'light_rain', 'heavy_rain', 'thunderstorm'];

export const ClimateUI: React.FC<ClimateUIProps> = ({ timeOfDay, setTimeOfDay, weather, setWeather, speed, setSpeed }) => {
  return (
    <div className="absolute top-20 right-6 w-80 p-6 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 shadow-2xl text-white pointer-events-auto flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Climate Controls</h3>
        <p className="text-xs text-slate-300">Interactive 3D Environment</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium flex justify-between">
          <span>Time of Day</span>
          <span className="text-cyan-400 font-mono">{Math.floor(timeOfDay).toString().padStart(2, '0')}:{(Math.floor((timeOfDay % 1) * 60)).toString().padStart(2, '0')}</span>
        </label>
        <input 
          type="range" 
          min="0" max="24" step="0.1" 
          value={timeOfDay} 
          onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
          className="w-full accent-cyan-500"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Weather Condition</label>
        <select 
          value={weather} 
          onChange={(e) => setWeather(e.target.value as WeatherState)}
          className="w-full bg-black/40 border border-white/20 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyan-500 capitalize"
        >
          {WEATHERS.map(w => (
            <option key={w} value={w}>{w.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium flex justify-between">
          <span>Time Speed</span>
          <span className="text-cyan-400 font-mono">{speed > 0 ? `${speed}x` : 'Paused'}</span>
        </label>
        <div className="flex gap-2">
          {[0, 1, 10].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
                speed === s ? 'bg-cyan-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              {s === 0 ? 'Pause' : `${s}x`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
