import React from 'react';
import {
  ShieldAlert,
  Activity,
  Sparkles,
  Compass,
  AlertTriangle,
  Clock,
  Layers,
  ArrowDown,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { GeomagneticStormData } from '../../types/spaceweather';

interface GeomagneticStormsCenterProps {
  geomagnetic: GeomagneticStormData | null;
}

export const GeomagneticStormsCenter: React.FC<GeomagneticStormsCenterProps> = ({ geomagnetic }) => {
  if (!geomagnetic) return null;

  const getKpColor = (kp: number) => {
    if (kp >= 8) return 'bg-rose-600 text-rose-100';
    if (kp >= 7) return 'bg-rose-500 text-rose-100';
    if (kp >= 6) return 'bg-amber-500 text-amber-950 font-bold';
    if (kp >= 5) return 'bg-yellow-400 text-yellow-950 font-bold';
    if (kp >= 4) return 'bg-cyan-500 text-cyan-950 font-bold';
    if (kp >= 3) return 'bg-indigo-400 text-white';
    return 'bg-emerald-500 text-white';
  };

  const getKpTextColor = (kp: number) => {
    if (kp >= 7) return 'text-rose-400';
    if (kp >= 5) return 'text-amber-400';
    if (kp >= 4) return 'text-cyan-400';
    return 'text-emerald-400';
  };

  const getKpBarHeight = (kp: number) => {
    return Math.max(10, Math.min(100, (kp / 9) * 100));
  };

  const recentStorm = geomagnetic.recentStorms.length > 0 ? geomagnetic.recentStorms[0] : null;
  
  let whySource = "Solar wind disturbance";
  if (recentStorm?.summary.toLowerCase().includes('cme')) {
    whySource = "CME shock arrived at Earth";
  } else if (recentStorm?.summary.toLowerCase().includes('high-speed') || recentStorm?.summary.toLowerCase().includes('coronal hole')) {
    whySource = "High-speed solar wind stream";
  } else if (recentStorm) {
    whySource = "Geomagnetic disturbance detected (see advanced log)";
  } else {
    whySource = "Data stream does not specify exact driver at this time";
  }

  let startedTime = "Recent data unavailable";
  if (recentStorm) {
    startedTime = new Date(recentStorm.startTime).toLocaleString();
  } else if (geomagnetic.currentKp >= 5) {
    startedTime = "Currently active";
  } else {
    startedTime = "No active storm";
  }

  let recoveryTime = "Recovery time uncertain";
  const recoveryPoint = geomagnetic.kpForecast.find(fc => fc.kp < 4);
  if (geomagnetic.currentKp >= 4 && recoveryPoint) {
    recoveryTime = `Expected recovery around ${recoveryPoint.time}`;
  } else if (geomagnetic.currentKp < 4) {
    recoveryTime = "Currently below storm levels";
  }

  const maxForecastKp = Math.max(...geomagnetic.kpForecast.map(f => f.kp), 0);
  let forecastSentence = "Geomagnetic activity is expected to remain quiet.";
  if (maxForecastKp > geomagnetic.currentKp && maxForecastKp >= 5) {
    forecastSentence = "Geomagnetic activity is expected to increase to storm levels.";
  } else if (maxForecastKp > geomagnetic.currentKp) {
    forecastSentence = "Geomagnetic activity is expected to increase slightly.";
  } else if (maxForecastKp < geomagnetic.currentKp && geomagnetic.currentKp >= 5) {
    forecastSentence = "Geomagnetic activity is expected to decrease.";
  } else if (maxForecastKp >= 5) {
    forecastSentence = "Geomagnetic storms are expected to continue.";
  }

  const effectsList = [
    { name: 'Radio', active: geomagnetic.currentKp >= 5 },
    { name: 'GPS/GNSS', active: geomagnetic.currentKp >= 6 },
    { name: 'Satellites', active: geomagnetic.currentKp >= 7 },
    { name: 'Power', active: geomagnetic.currentKp >= 8 },
    { name: 'Aurora', active: geomagnetic.currentKp >= 4 },
  ];

  return (
    <div className="space-y-6" id="geomagnetic-storms-module">
      <div className="bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shadow-lg shadow-indigo-500/10">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Geomagnetic Storms
              </h3>
              <p className="text-xs text-slate-400">
                Planetary Kp-Index, Magnetosphere & NASA GST Log
              </p>
            </div>
          </div>
        </div>

        {/* 1. AT A GLANCE */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-l-2 border-indigo-500 pl-3">Geomagnetic Storm — At a Glance</h4>
          <div className="bg-slate-950/50 rounded-2xl p-5 border border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div className="space-y-1">
              <span className="text-slate-500 font-mono text-[11px] uppercase">Status</span>
              <div className={`font-bold ${getKpTextColor(geomagnetic.currentKp)}`}>
                {geomagnetic.magnetosphereState} / {geomagnetic.gScale}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 font-mono text-[11px] uppercase">Current Kp</span>
              <div className="font-bold text-slate-200">
                {geomagnetic.currentKp} <span className="text-slate-400 font-normal">({geomagnetic.gScaleLabel})</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 font-mono text-[11px] uppercase">When</span>
              <div className="text-slate-300">
                Started: {startedTime}<br/>
                Peak (24h): Kp {geomagnetic.maxKp24h}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 font-mono text-[11px] uppercase">Why</span>
              <div className="text-slate-300">{whySource}</div>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 font-mono text-[11px] uppercase">Where</span>
              <div className="text-slate-300">Higher magnetic latitudes<br/><span className="text-slate-400 text-xs">Auroral boundary: {geomagnetic.auroralBoundaryLat}° Mag Lat</span></div>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 font-mono text-[11px] uppercase">How Long</span>
              <div className="text-slate-300">{recoveryTime}</div>
            </div>
            <div className="space-y-1 md:col-span-2 pt-2 border-t border-slate-800/50">
              <span className="text-slate-500 font-mono text-[11px] uppercase block mb-2">Possible Effects</span>
              <div className="flex flex-wrap gap-2">
                {effectsList.map(effect => (
                  <div key={effect.name} className={`px-2 py-1 rounded text-xs font-mono border ${effect.active ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800/50 text-slate-500 border-slate-700/50'}`}>
                    {effect.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. CURRENT KP + MAGNETOSPHERE (Kept Existing Metrics) */}
        <div className="space-y-4">
           <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-l-2 border-slate-500 pl-3">Current Technical Metrics</h4>
           <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Planetary Kp Dial Card */}
            <div className="md:col-span-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-3">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" stroke="#1E293B" strokeWidth="8" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (264 * geomagnetic.currentKp) / 9}
                    strokeLinecap="round"
                    className={`${getKpTextColor(geomagnetic.currentKp)} transition-all duration-1000`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold font-mono text-white">{geomagnetic.currentKp}</span>
                  <span className="text-[9px] font-mono text-slate-400">/ 9.0 Kp</span>
                </div>
              </div>
            </div>

            {/* Environmental Metrics */}
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 space-y-1 font-mono">
                <span className="text-[10px] uppercase text-slate-400 block">Dst Index</span>
                <div className={`text-base font-bold ${geomagnetic.dstIndexNt <= -50 ? 'text-rose-400' : 'text-cyan-300'}`}>{geomagnetic.dstIndexNt} nT</div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 space-y-1 font-mono">
                <span className="text-[10px] uppercase text-slate-400 block">Magnetosphere</span>
                <div className={`text-sm font-bold ${geomagnetic.magnetosphereState.includes('Disturbed') ? 'text-amber-400' : 'text-emerald-400'}`}>{geomagnetic.magnetosphereState}</div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 space-y-1 font-mono">
                <span className="text-[10px] uppercase text-slate-400 block">Auroral Edge</span>
                <div className="text-base font-bold text-indigo-300">{geomagnetic.auroralBoundaryLat}°</div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 space-y-1 font-mono">
                <span className="text-[10px] uppercase text-slate-400 block">G1 Limit</span>
                <div className="text-sm font-bold text-slate-200">Kp ≥ 5.0</div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 space-y-1 font-mono">
                <span className="text-[10px] uppercase text-slate-400 block">G3 Limit</span>
                <div className="text-sm font-bold text-slate-200">Kp ≥ 7.0</div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 space-y-1 font-mono">
                <span className="text-[10px] uppercase text-slate-400 block">G5 Limit</span>
                <div className="text-sm font-bold text-slate-200">Kp = 9.0</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. 24-HOUR KP TIMELINE */}
        <div className="space-y-3">
          <span className="text-[11px] uppercase font-mono font-bold text-slate-400 block">24-Hour Kp History (time →)</span>
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 overflow-x-auto">
            <div className="min-w-[500px] flex items-end justify-between gap-1 h-24 relative pb-6 border-b border-slate-800/50">
              {/* G1 Threshold line */}
              <div className="absolute left-0 right-0 bottom-6 border-t border-dashed border-amber-500/30 flex items-center" style={{ bottom: 'calc(24px + 55.5%)' }}>
                <span className="text-[9px] font-mono text-amber-500/50 bg-slate-950 px-1 absolute -top-1.5 left-0">G1 Threshold (Kp 5)</span>
              </div>
              
              {geomagnetic.kpHistory.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                  <div 
                    className={`w-full max-w-[24px] rounded-t-sm transition-all ${getKpColor(item.kp)}`}
                    style={{ height: `${getKpBarHeight(item.kp)}%` }}
                  ></div>
                  <span className="text-[9px] font-mono text-slate-500 absolute -bottom-5 transform whitespace-nowrap">{item.time}</span>
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-white text-[10px] font-mono px-2 py-1 rounded shadow-lg pointer-events-none z-10 transition-opacity">
                    Kp {item.kp}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. 3-DAY FORECAST TIMELINE */}
        <div className="space-y-3">
          <div>
            <span className="text-[11px] uppercase font-mono font-bold text-slate-400 block mb-1">3-Day Forecast</span>
            <p className="text-sm text-slate-200 font-medium">Forecast: {forecastSentence}</p>
          </div>
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 overflow-x-auto">
            <div className="min-w-[600px] flex items-center justify-between">
              {geomagnetic.kpForecast.map((fc, idx) => (
                <div key={idx} className="flex flex-col items-center relative z-10">
                  <span className="text-[10px] font-mono text-slate-400 mb-2">{idx === 0 ? 'NOW' : fc.time.split(' ')[0]}</span>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-slate-900 ${fc.kp >= 6 ? 'border-rose-500 text-rose-400' : fc.kp >= 5 ? 'border-amber-500 text-amber-400' : 'border-slate-700 text-slate-300'}`}>
                    <span className="text-xs font-bold font-mono">{fc.kp}</span>
                  </div>
                  <span className={`mt-2 text-[9px] font-bold px-1.5 py-0.5 rounded ${fc.gScale !== 'G0' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-500'}`}>{fc.gScale}</span>
                </div>
              ))}
              {/* Connecting line */}
              <div className="absolute left-8 right-8 h-0.5 bg-slate-800 top-1/2 -translate-y-1/2 z-0"></div>
            </div>
          </div>
        </div>

        {/* 5. RECENT MAJOR STORM EVENTS (Advanced Details) */}
        {geomagnetic.recentStorms.length > 0 && (
          <div className="pt-4 space-y-3">
            <span className="text-[11px] uppercase font-mono font-bold text-slate-400 block">Advanced Details: NASA DONKI GST Log</span>
            <div className="grid grid-cols-1 gap-3">
              {geomagnetic.recentStorms.map((gst) => (
                <div key={gst.gstID} className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 space-y-1 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">{gst.gstID}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400/80 text-[10px] font-bold border border-amber-500/20">
                      {gst.noaaScale} • Kp {gst.kpIndex}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">{new Date(gst.startTime).toUTCString()}</span>
                  <p className="text-xs text-slate-400 font-sans mt-2">{gst.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
