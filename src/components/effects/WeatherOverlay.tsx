import React, { useEffect, useState } from 'react';
import { useClimate } from '../../context/ClimateContext';

export const WeatherOverlay = React.memo(() => {
  const { weather: weatherCondition } = useClimate();
  const [raindrops, setRaindrops] = useState<{ id: number; left: number; speed: number; opacity: number; length: number; delay: number }[]>([]);
  const [glassDrops, setGlassDrops] = useState<{ id: number; left: number; size: number; speed: number; delay: number }[]>([]);

  useEffect(() => {
    // Generate a static pool of 150 realistic foreground raindrops to supplement the 3D rain
    const rainList = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      speed: Math.random() * 0.3 + 0.4,
      opacity: Math.random() * 0.4 + 0.1,
      length: Math.random() * 32 + 20,
      delay: Math.random() * 2,
    }));
    setRaindrops(rainList);

    // Generate static pool of slow glass water condensation droplets running down the viewport
    const glassList = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 3 + 1.5, // 1.5px to 4.5px width
      speed: Math.random() * 7 + 7, // very slow (7s to 14s to cross screen)
      delay: Math.random() * 6,
    }));
    setGlassDrops(glassList);
  }, []);

  const isStormy = weatherCondition === 'heavy_rain' || weatherCondition === 'thunderstorm' || weatherCondition === 'cyclone' || weatherCondition === 'tornado';
  const isWindy = weatherCondition === 'thunderstorm' || weatherCondition === 'windy' || weatherCondition === 'blizzard' || weatherCondition === 'tornado' || weatherCondition === 'cyclone';
  const isRainy = weatherCondition === 'light_rain' || weatherCondition === 'heavy_rain' || weatherCondition === 'thunderstorm' || weatherCondition === 'cyclone';
  const isHeatwave = weatherCondition === 'heatwave';
  const isColdWave = weatherCondition === 'cold_wave' || weatherCondition === 'frost';
  const isSandstorm = weatherCondition === 'sandstorm';

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-[40] overflow-hidden">
      
      {/* Weather Specific Visual Overlays - Enhanced Splash Ripples */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-[1500ms]"
        style={{ opacity: isRainy ? 1 : 0 }}
      >
        {/* Glass Condensation Running Droplets (Water running down the screen) */}
        {glassDrops.slice(0, weatherCondition === 'light_rain' ? 6 : 18).map((drop) => (
          <div
            key={`glass-${drop.id}`}
            className="absolute bg-white/25 rounded-full backdrop-blur-[0.5px] border-l border-white/35 shadow-[0_1px_3px_rgba(255,255,255,0.15)]"
            style={{
              left: `${drop.left}%`,
              top: '-20px',
              width: `${drop.size}px`,
              height: `${drop.size * 1.8}px`,
              animationName: 'run-down',
              animationDuration: `${drop.speed}s`,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationDelay: `${drop.delay}s`,
            }}
          />
        ))}

        {/* Periodic Lightning Flash Overlay for Thunderstorm */}
        {(weatherCondition === 'thunderstorm' || weatherCondition === 'cyclone' || weatherCondition === 'tornado') && (
          <div className="absolute inset-0 bg-sky-50 animate-lightning pointer-events-none"></div>
        )}
      </div>

      {/* Fog/Mist Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-slate-200/25 dark:from-slate-900/40 via-transparent to-transparent transition-opacity duration-[1500ms] pointer-events-none" 
        style={{ opacity: weatherCondition === 'fog' ? 1 : 0 }}
      />

      {/* Heatwave Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-[2000ms] mix-blend-overlay"
        style={{ opacity: isHeatwave ? 1 : 0 }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent animate-pulse" />
        <div className="absolute inset-0 backdrop-blur-[1px]" />
      </div>

      {/* Frost / Cold Wave Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-[2000ms]"
        style={{ 
          opacity: isColdWave ? 1 : 0,
          boxShadow: 'inset 0 0 150px 40px rgba(255, 255, 255, 0.4)',
          background: 'radial-gradient(circle, transparent 40%, rgba(200, 240, 255, 0.15) 100%)'
        }}
      >
        <div className="absolute inset-0 backdrop-blur-[2px]" style={{ maskImage: 'radial-gradient(circle, transparent 60%, black 100%)', WebkitMaskImage: 'radial-gradient(circle, transparent 60%, black 100%)' }} />
      </div>

      {/* Sandstorm Overlay */}
      <div 
        className="absolute inset-0 bg-amber-700/30 pointer-events-none transition-opacity duration-[2000ms] backdrop-blur-[2px] mix-blend-multiply"
        style={{ opacity: isSandstorm ? 1 : 0 }}
      />

      {/* Wind gusts (Gale Lines) */}
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-[1500ms]"
        style={{ opacity: isWindy ? (weatherCondition === 'tornado' || weatherCondition === 'cyclone' || weatherCondition === 'blizzard' ? 0.8 : 0.4) : 0 }}
      >
        <div className="absolute top-[20%] left-[-20%] w-[50%] h-[1.5px] bg-gradient-to-r from-transparent via-purple-300/40 to-transparent animate-wind-gust" style={{ transform: 'rotate(5deg)' }}></div>
        <div className="absolute top-[45%] left-[-30%] w-[60%] h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent animate-wind-gust" style={{ animationDelay: '1.2s', transform: 'rotate(7deg)' }}></div>
        <div className="absolute top-[70%] left-[-25%] w-[45%] h-[1.5px] bg-gradient-to-r from-transparent via-sky-300/40 to-transparent animate-wind-gust" style={{ animationDelay: '0.6s', transform: 'rotate(6deg)' }}></div>
        <div className="absolute top-[85%] left-[-35%] w-[55%] h-[2.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent animate-wind-gust" style={{ animationDelay: '2.0s', transform: 'rotate(5deg)' }}></div>
      </div>

      <style>{`
        @keyframes fall-rain-straight {
          0% { transform: translateY(-20px); }
          100% { transform: translateY(115vh); }
        }
        @keyframes fall-rain-angled {
          0% { transform: translateY(-20px) translateX(-40px) rotate(-12deg); }
          100% { transform: translateY(115vh) translateX(140px) rotate(-12deg); }
        }
        @keyframes run-down {
          0% { transform: translateY(-20px); opacity: 0; }
          10% { opacity: 0.65; }
          90% { opacity: 0.65; }
          100% { transform: translateY(115vh); opacity: 0; }
        }
        @keyframes thunder-light {
          0%, 84%, 93%, 100% { opacity: 0; }
          85% { opacity: 0.8; }
          86% { opacity: 0.25; }
          87.5% { opacity: 0.95; }
          90% { opacity: 0.35; }
        }
        @keyframes wind-gust {
          0% { transform: translateX(-100%) skewX(-15deg); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateX(250%) skewX(-15deg); opacity: 0; }
        }
        .animate-lightning {
          animation: thunder-light 4.5s infinite;
        }
        .animate-wind-gust {
          animation: wind-gust 2.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
});
