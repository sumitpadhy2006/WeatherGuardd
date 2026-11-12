import React, { useState } from 'react';
import { MoonData } from '../../types/astronomy';
import { Info, Eye, Calendar, Moon, X } from 'lucide-react';
import { EarthMoonSystem3D } from './EarthMoonSystem3D';

type LunarPhaseName = string;

interface MoonCenterProps {
  moon: MoonData;
  onLocateMoon?: () => void;
  weather: any;
}

export const MoonCenter: React.FC<MoonCenterProps> = ({ moon, onLocateMoon, weather }) => {
  const isWaxing = moon.phaseName.includes('Waxing') || moon.phaseName === 'First Quarter';
  const isWaning = moon.phaseName.includes('Waning') || moon.phaseName === 'Third Quarter';
  const [showMoonInfo, setShowMoonInfo] = useState(true);

  const stars = React.useMemo(() => {
    return Array.from({ length: 600 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.7 + 0.3
    }));
  }, []);

  const renderMoonDisk = (illum: number, phaseName: LunarPhaseName, customClass?: string) => {
    // Keep this for the tiny timeline indicator
    const isWaxingLocal = phaseName.includes('Waxing') || phaseName === 'First Quarter';
    const isWaningLocal = phaseName.includes('Waning') || phaseName === 'Third Quarter';
    const isFull = phaseName === 'Full Moon';
    const isNew = phaseName === 'New Moon';

    const frac = illum / 100;
    const rx = Math.abs(50 - 100 * frac);
    const sweep = (isWaxingLocal && frac <= 0.5) || (isWaningLocal && frac > 0.5) ? 0 : 1;

    return (
      <svg viewBox="0 0 100 100" className={`drop-shadow-[0_0_40px_rgba(255,255,255,0.1)] mx-auto ${customClass || 'w-full h-full max-w-[280px] max-h-[280px]'}`}>
        <defs>
          <filter id="moonGlowMain" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <clipPath id="phaseClip">
            {isFull ? (
              <circle cx="50" cy="50" r="48" />
            ) : isWaxingLocal ? (
              <path d={`M 50 2 A 48 48 0 0 1 50 98 A ${rx} 48 0 0 ${sweep} 50 2`} />
            ) : (
              <path d={`M 50 2 A 48 48 0 0 0 50 98 A ${rx} 48 0 0 ${sweep} 50 2`} />
            )}
          </clipPath>
        </defs>

        <image 
          href="https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg" 
          x="2" y="2" width="96" height="96" 
          opacity="0.15"
          clipPath="url(#fullMoonClip)"
        />
        <clipPath id="fullMoonClip">
          <circle cx="50" cy="50" r="48" />
        </clipPath>

        {!isNew && (
          <g filter="url(#moonGlowMain)">
            <image 
              href="https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg" 
              x="2" y="2" width="96" height="96" 
              clipPath="url(#phaseClip)"
            />
          </g>
        )}
      </svg>
    );
  };

  const getPhaseDescription = (phase: string) => {
    if (phase === 'New Moon') return 'The Moon is between Earth and the Sun, making its illuminated side face away from us.';
    if (phase.includes('Waxing Crescent')) return 'A sliver of the moon is illuminated and it is growing each night.';
    if (phase === 'First Quarter') return 'Half of the Moon is illuminated and growing towards a full moon.';
    if (phase.includes('Waxing Gibbous')) return 'More than half is illuminated and continuing to grow.';
    if (phase === 'Full Moon') return 'The entire face of the Moon is illuminated by the Sun.';
    if (phase.includes('Waning Gibbous')) return 'More than half is illuminated but it is shrinking each night.';
    if (phase === 'Third Quarter') return 'Half is illuminated and decreasing towards a new moon.';
    if (phase.includes('Waning Crescent')) return 'Only a sliver remains illuminated before the new moon.';
    return '';
  };

  const weatherTip = React.useMemo(() => {
    if (!weather) return { text: 'Weather data unavailable.', icon: '☁️' };
    const cc = weather.clouds_hi + weather.clouds_mid + weather.clouds_low;
    if (cc > 150) return { text: 'Moon viewing is unlikely tonight because of heavy cloud cover.', icon: '☁️' };
    if (cc > 50) return { text: 'Partially cloudy. You may catch glimpses of the Moon.', icon: '⛅' };
    return { text: 'Excellent Moon-viewing conditions tonight with clear skies!', icon: '✨' };
  }, [weather]);

  const getStargazingTip = () => {
    if (moon.illuminationPercent > 80) return `The bright ${moon.phaseName} will wash out most faint stars and meteors tonight.`;
    if (moon.illuminationPercent > 40) return `Moderate moonlight. Wait for the moon to set for the darkest skies.`;
    return 'Dark skies! Excellent conditions for stargazing as moonlight is minimal.';
  };

  const formatDate = (val: string | number) => {
    if (!val) return 'TBD';
    return new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (val: string | number) => {
    if (!val) return '--:--';
    return new Date(val).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getDaysUntil = (val: string | number) => {
    if (!val) return '--';
    const d = new Date(val);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days` : 'Today';
  };

  const resetView = () => {
    // Left empty for compatibility if needed, though OrbitControls manages its own state
  };

  return (
    <div className="space-y-6" id="moon-center-module">
      
      {/* Immersive Sky Canvas Area */}
      <div 
        className="bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 relative"
      >
        
        {/* Top Controls Overlay */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 pointer-events-none">
          {showMoonInfo ? (
            <div className="bg-slate-950/60 backdrop-blur-md border border-slate-800/80 rounded-2xl py-2 px-3.5 pointer-events-auto flex flex-col gap-1.5 max-w-[260px] sm:max-w-[280px]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                  <h2 className="text-sm font-bold text-white tracking-tight leading-none">{moon.phaseName}</h2>
                  <div className="flex items-center gap-1">
                    <span className="text-cyan-400 font-mono text-[10px] font-bold">{moon.illuminationPercent}%</span>
                    {isWaxing && <span className="text-[8px] uppercase font-bold text-slate-400 bg-slate-800/80 px-1 rounded">Waxing</span>}
                    {isWaning && <span className="text-[8px] uppercase font-bold text-slate-400 bg-slate-800/80 px-1 rounded">Waning</span>}
                  </div>
                </div>
                <button 
                  onClick={() => setShowMoonInfo(false)} 
                  className="text-slate-400 hover:text-white transition-colors shrink-0"
                  title="Hide phase info"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-[10px] text-slate-300 leading-tight">
                {getPhaseDescription(moon.phaseName)}
              </p>
            </div>
          ) : (
            <button 
              onClick={() => setShowMoonInfo(true)} 
              className="bg-slate-950/60 backdrop-blur-md border border-slate-800/80 rounded-full p-2 pointer-events-auto text-slate-400 hover:text-white"
              title="Show phase info"
            >
              <Info size={14} />
            </button>
          )}
          

        </div>

        {/* The Hero Moon (3D Canvas) */}
        <div className="flex items-center justify-center relative z-0 w-full h-[500px]">
          <EarthMoonSystem3D moon={moon} />
        </div>

        {/* Bottom Info Bar Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-lg px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Real-time Phase Live</span>
          </div>
        </div>
      </div>

      {/* Conditions Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex gap-4 items-start">
          <div className="text-2xl">{weatherTip.icon}</div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Weather Visibility</h4>
            <p className="text-sm text-slate-200 leading-snug">{weatherTip.text}</p>
          </div>
        </div>
        
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex gap-4 items-start">
          <div className="text-2xl">✨</div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Stargazing Impact</h4>
            <p className="text-sm text-slate-200 leading-snug">{getStargazingTip()}</p>
          </div>
        </div>
      </div>

      {/* Special Events & Countdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Next Full Moon */}
        <div className="bg-amber-950/20 border border-amber-900/30 rounded-2xl p-5 flex items-center justify-between group hover:bg-amber-900/20 transition-colors">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500/70 block mb-1">Next Full Moon</span>
            <div className="text-2xl font-bold text-amber-400 font-mono tracking-tight">{getDaysUntil(moon.nextPhases.fullMoon)}</div>
            <div className="text-xs text-amber-200/60 mt-1">{formatDate(moon.nextPhases.fullMoon)}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.3)] border border-amber-200" />
        </div>
        
        {/* Next New Moon */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex items-center justify-between group hover:bg-slate-800/50 transition-colors">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">Next New Moon</span>
            <div className="text-2xl font-bold text-slate-300 font-mono tracking-tight">{getDaysUntil(moon.nextPhases.newMoon)}</div>
            <div className="text-xs text-slate-500 mt-1">{formatDate(moon.nextPhases.newMoon)}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-950 border border-slate-700 shadow-inner" />
        </div>
      </div>

      {/* Special Events */}
      {(moon.isSupermoon || moon.isMicromoon) && (
        <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Info size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-300">
              {moon.isSupermoon ? 'Supermoon Event' : 'Micromoon Event'}
            </h4>
            <p className="text-xs text-indigo-200/70 mt-0.5">
              {moon.isSupermoon 
                ? 'The Moon is near perigee, making it appear slightly larger and brighter than average.' 
                : 'The Moon is near apogee, making it appear slightly smaller than average.'}
            </p>
          </div>
        </div>
      )}

      {/* Synodic Phase Progress */}
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6">
        <h4 className="text-xs font-bold uppercase text-slate-500 mb-8 tracking-wider flex items-center gap-2">
          <Moon size={12} /> Synodic Cycle Progress
        </h4>
        
        <div className="relative h-1.5 bg-slate-800/80 rounded-full w-full mb-8">
          {/* Nodes */}
          <div className="absolute top-1/2 -translate-y-1/2 left-[0%] w-3 h-3 rounded-full bg-slate-600" title="New Moon" />
          <div className="absolute top-1/2 -translate-y-1/2 left-[25%] w-3 h-3 rounded-full bg-slate-600" title="First Quarter" />
          <div className="absolute top-1/2 -translate-y-1/2 left-[50%] w-3 h-3 rounded-full bg-slate-600" title="Full Moon" />
          <div className="absolute top-1/2 -translate-y-1/2 left-[75%] w-3 h-3 rounded-full bg-slate-600" title="Third Quarter" />
          <div className="absolute top-1/2 -translate-y-1/2 left-[100%] w-3 h-3 rounded-full bg-slate-600" title="New Moon" />

          {/* Current Progress Graphic */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out z-10 flex flex-col items-center justify-center pointer-events-none"
            style={{ left: `calc(${Math.min(100, Math.max(0, (moon.moonAgeDays / 29.53) * 100))}% - 24px)` }}
          >
            <div className="bg-slate-950 p-1 rounded-full border border-slate-700 shadow-xl pointer-events-auto">
              {renderMoonDisk(moon.illuminationPercent, moon.phaseName, "w-[36px] h-[36px] md:w-[40px] md:h-[40px]")}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
          <span className="text-center w-12 -ml-6">New</span>
          <span className="text-center w-12">1st Q</span>
          <span className="text-center w-12">Full</span>
          <span className="text-center w-12">3rd Q</span>
          <span className="text-center w-12 -mr-6">New</span>
        </div>
      </div>
      
    </div>
  );
};
