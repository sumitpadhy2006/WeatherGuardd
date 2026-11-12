import React, { useEffect, useState, useRef } from 'react';
import { WeatherState } from '../climate3d/types';
import { RealMoonDisc } from '../weather/SunMoonCard';

export type TimeOfDayStr = 'morning' | 'afternoon' | 'evening' | 'sunset' | 'night';

interface DynamicSkyProps {
  timeOfDay: TimeOfDayStr;
  setTimeOfDay?: (time: TimeOfDayStr) => void;
  weatherCondition: WeatherState;
  isDarkMode: boolean;
  moonIllumination?: number;
  moonPhaseName?: string;
}

export default function DynamicSky({
  timeOfDay,
  weatherCondition,
  isDarkMode,
  moonIllumination = 100,
  moonPhaseName = 'Full Moon',
}: DynamicSkyProps) {
  const [activeClouds, setActiveClouds] = useState<{ id: number; left: number; top: number; scale: number; speed: number; opacity: number; delay: number }[]>([]);
  const [sparkles, setSparkles] = useState<{ id: number; left: number; top: number; size: number; delay: string }[]>([]);
  const [stars, setStars] = useState<{ id: number; left: number; top: number; size: number; delay: string; duration: string; color: string; glow: string }[]>([]);

  // Air Traffic System
  interface AirbornePlane {
    id: number;
    type: 'passenger_wide' | 'passenger_narrow' | 'business_jet' | 'cargo' | 'special_regional';
    direction: 'left' | 'right';
    speed: number;
    altitude: number;
    scale: number;
    delay: number;
    contrailLength: number;
  }

  const generateRandomPlane = (id: number, initialDelay = false): AirbornePlane => {
    const roll = Math.random();
    let type: AirbornePlane['type'] = 'passenger_narrow';
    if (roll < 0.35) {
      type = 'passenger_narrow';
    } else if (roll < 0.70) {
      type = 'passenger_wide';
    } else if (roll < 0.85) {
      type = 'business_jet';
    } else if (roll < 0.95) {
      type = 'cargo';
    } else {
      type = 'special_regional';
    }

    const direction = Math.random() > 0.5 ? 'left' : 'right';
    const speed = Math.random() * 20 + 35; // 35s to 55s for realistic flight speed
    const altitude = Math.random() * 26 + 6; // 6% to 32% of sky height
    const scale = Math.random() * 0.55 + 0.45; // size factor simulating distance
    const delay = initialDelay ? -Math.random() * speed : 0;
    const contrailLength = Math.floor(Math.random() * 90 + 50);

    return {
      id,
      type,
      direction,
      speed,
      altitude,
      scale,
      delay,
      contrailLength,
    };
  };

  const [planes, setPlanes] = useState<AirbornePlane[]>([]);

  // Generate some weather and sky objects once on load
  useEffect(() => {
    const initialPlanes = Array.from({ length: 2 }).map((_, i) => {
      const plane = generateRandomPlane(i, false);
      plane.direction = i === 0 ? 'right' : 'left';
      plane.speed = 25; // fixed speed for consistent looping
      plane.delay = i * 5; // 5 second stagger between planes
      return plane;
    });
    setPlanes(initialPlanes);

    const clouds = Array.from({ length: 30 }).map((_, i) => {
      const speed = Math.random() * 30 + 45; // faster drift (45s to 75s) for a more lively and dynamic feel
      return {
        id: i, 
        left: Math.random() * 100, // kept for backwards compatibility
        top: Math.random() * 45 + 2, // upper 45% of the sky
        scale: Math.random() * 1.4 + 0.5,
        speed,
        opacity: Math.random() * 0.4 + 0.15,
        delay: -Math.random() * speed, // negative delay so they scatter horizontally immediately
      };
    });
    setActiveClouds(clouds);

    const sparkList = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: `${Math.random() * 5}s`,
    }));
    setSparkles(sparkList);

    const starList = Array.from({ length: 120 }).map((_, i) => {
      const isBig = Math.random() > 0.92;
      const colorRoll = Math.random();
      let color = 'bg-white';
      let glow = 'shadow-[0_0_3px_#fff]';
      
      if (colorRoll > 0.9) {
        color = 'bg-sky-200';
        glow = 'shadow-[0_0_4px_#bae6fd]';
      } else if (colorRoll > 0.8) {
        color = 'bg-purple-200';
        glow = 'shadow-[0_0_4px_#e9d5ff]';
      }

      return {
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 75, // Keep stars in upper 75%
        size: isBig ? Math.random() * 1.5 + 1.2 : Math.random() * 0.8 + 0.4,
        delay: `${Math.random() * 5}s`,
        duration: `${Math.random() * 4 + 2}s`,
        color,
        glow: isBig ? glow : 'shadow-none'
      };
    });
    setStars(starList);
  }, []);

  // Define backgrounds based on time of day and weather condition
  const getSkyStyles = () => {
    let skyBg = '';
    let sunMoonColor = '';
    let auroraGlow = '';
    let label = '';
    let accentText = '';

    const isDay = timeOfDay === 'morning' || timeOfDay === 'afternoon' || timeOfDay === 'evening';

    if (weatherCondition === 'sunny') {
      auroraGlow = isDarkMode ? 'bg-[#7C3AED]/15' : 'bg-amber-400/10';
      accentText = 'text-amber-500';
      switch (timeOfDay) {
        case 'morning':
          skyBg = 'from-[#38bdf8] via-[#fdba74] to-[#fb923c]';
          sunMoonColor = 'bg-gradient-to-tr from-amber-400 to-rose-400 shadow-[0_0_80px_rgba(245,158,11,0.6)]';
          label = 'Warm Sunny Sunrise';
          break;
        case 'afternoon':
          skyBg = 'from-[#0ea5e9] via-[#38bdf8] to-[#e0f2fe]';
          sunMoonColor = 'bg-gradient-to-tr from-amber-300 to-amber-500 shadow-[0_0_120px_rgba(251,191,36,0.85)]';
          label = 'Radiant Midday Clear';
          break;
        case 'evening':
          skyBg = 'from-[#0284c7] via-[#0ea5e9] to-[#ffedd5]';
          sunMoonColor = 'bg-gradient-to-tr from-rose-500 to-amber-500 shadow-[0_0_90px_rgba(244,63,94,0.7)]';
          label = 'Golden Hour Dusk';
          break;
        case 'sunset':
          skyBg = 'from-[#1e1b4b] via-[#e11d48] to-[#fdba74]';
          sunMoonColor = 'bg-gradient-to-tr from-rose-600 to-purple-600 shadow-[0_0_100px_rgba(236,72,153,0.7)]';
          label = 'Crimson Sunset';
          break;
        case 'night':
          skyBg = 'from-[#030712] via-[#090d16] to-[#1e1b4b]';
          sunMoonColor = 'bg-slate-100 shadow-[0_0_60px_rgba(255,255,255,0.45)]';
          label = 'Cosmic Starry Night';
          break;
      }
    } else if (weatherCondition === 'overcast' || weatherCondition === 'cloudy') {
      auroraGlow = 'bg-transparent'; // Aurora almost invisible during day overcast
      accentText = 'text-slate-500';
      switch (timeOfDay) {
        case 'morning':
          skyBg = 'from-[#94A3B8] via-[#CBD5E1]/70 to-[#F1F5F9]';
          sunMoonColor = 'bg-slate-400/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]';
          label = 'Gloomy Overcast Dawn';
          break;
        case 'afternoon':
          skyBg = 'from-[#CBD5E1] via-[#E2E8F0]/80 to-[#F1F5F9]';
          sunMoonColor = 'bg-slate-300/10 shadow-[0_0_20px_rgba(255,255,255,0.02)]';
          label = 'Dense Midday Overcast';
          break;
        case 'evening':
          skyBg = 'from-[#94A3B8] via-[#CBD5E1] to-[#F1F5F9]';
          sunMoonColor = 'bg-slate-500/10 shadow-[0_0_10px_rgba(0,0,0,0.1)]';
          label = 'Overcast Dusk';
          break;
        case 'sunset':
          skyBg = 'from-[#CBD5E1] via-[#F472B6]/15 to-[#F5F5F4]';
          sunMoonColor = 'bg-slate-600/10 shadow-none';
          label = 'Purple Clouded Sunset';
          break;
        case 'night':
          skyBg = 'from-[#0B1329] via-[#0F172A] to-[#020617]';
          sunMoonColor = 'bg-slate-100/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]';
          label = 'Pitch Overcast Night';
          break;
      }
    } else if (weatherCondition === 'light_rain') {
      auroraGlow = 'bg-indigo-900/10';
      accentText = 'text-indigo-400';
      switch (timeOfDay) {
        case 'morning':
          skyBg = 'from-[#475569] via-[#94A3B8]/60 to-[#FFEDD5]/30';
          sunMoonColor = 'bg-amber-300/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]';
          label = 'Monsoon Drizzle Morning';
          break;
        case 'afternoon':
          skyBg = 'from-[#334155] via-[#64748B]/60 to-[#94A3B8]/40';
          sunMoonColor = 'bg-amber-400/15 shadow-[0_0_40px_rgba(251,191,36,0.1)]';
          label = 'Drizzly Midday Overcast';
          break;
        case 'evening':
          skyBg = 'from-[#1E1B4B] via-[#334155]/70 to-[#0F172A]';
          sunMoonColor = 'bg-rose-400/10 shadow-none';
          label = 'Drizzly Golden Dusk';
          break;
        case 'sunset':
          skyBg = 'from-[#E11D48]/30 via-[#4C1D95]/60 to-[#030712]';
          sunMoonColor = 'bg-rose-500/15 shadow-none';
          label = 'Stormy Rain Sunset';
          break;
        case 'night':
          skyBg = 'from-[#020617] via-[#0B1329]/90 to-[#0F172A]';
          sunMoonColor = 'bg-slate-100/20 shadow-[0_0_30px_rgba(255,255,255,0.15)]';
          label = 'Damp Rainy Night';
          break;
      }
    } else if (weatherCondition === 'heavy_rain') {
      auroraGlow = 'bg-transparent';
      accentText = 'text-blue-500';
      switch (timeOfDay) {
        case 'morning':
          skyBg = 'from-[#1F2937] via-[#374151]/75 to-[#111827]';
          sunMoonColor = 'bg-transparent';
          label = 'Torrential Morning Downpour';
          break;
        case 'afternoon':
          skyBg = 'from-[#111827] via-[#1F2937]/80 to-[#030712]';
          sunMoonColor = 'bg-transparent';
          label = 'Monsoon Torrential Midday';
          break;
        case 'evening':
          skyBg = 'from-[#030712] via-[#1E1B4B]/80 to-[#020617]';
          sunMoonColor = 'bg-transparent';
          label = 'Saturated Heavy Rain Evening';
          break;
        case 'sunset':
          skyBg = 'from-[#311042] via-[#1E1B4B]/90 to-[#020617]';
          sunMoonColor = 'bg-transparent';
          label = 'Crimson Rainstorm Sunset';
          break;
        case 'night':
          skyBg = 'from-[#020617] via-[#090D16] to-[#020617]';
          sunMoonColor = 'bg-slate-300/10 shadow-none';
          label = 'Monsoon Night Tempest';
          break;
      }
    } else if (weatherCondition === 'thunderstorm') {
      auroraGlow = 'bg-purple-900/15';
      accentText = 'text-fuchsia-400';
      switch (timeOfDay) {
        case 'morning':
          skyBg = 'from-[#1E1B4B] via-[#111827] to-[#374151]';
          sunMoonColor = 'bg-transparent';
          label = 'Electric Storm Dawn';
          break;
        case 'afternoon':
          skyBg = 'from-[#0B1329] via-[#111827] to-[#020617]';
          sunMoonColor = 'bg-transparent';
          label = 'Thunderstorm Midday';
          break;
        case 'evening':
          skyBg = 'from-[#2E1065] via-[#0F172A] to-[#020617]';
          sunMoonColor = 'bg-transparent';
          label = 'Violent Storm Dusk';
          break;
        case 'sunset':
          skyBg = 'from-[#4C1D95] via-[#3B0764]/90 to-[#020617]';
          sunMoonColor = 'bg-transparent';
          label = 'Crimson Electric Sunset';
          break;
        case 'night':
          skyBg = 'from-[#020617] via-[#090D16] to-[#020617]';
          sunMoonColor = 'bg-purple-500/5 shadow-[0_0_10px_rgba(168,85,247,0.1)]';
          label = 'Cosmic Lightning Night';
          break;
      }
    } else if (weatherCondition === 'tornado' || weatherCondition === 'cyclone') {
      auroraGlow = 'bg-slate-800/60';
      accentText = 'text-slate-400';
      switch (timeOfDay) {
        case 'morning':
        case 'afternoon':
          skyBg = 'from-[#0f172a] via-[#1e293b] to-[#334155]';
          sunMoonColor = 'bg-transparent';
          label = weatherCondition === 'tornado' ? 'Approaching Cyclone' : 'Severe Cyclone';
          break;
        case 'evening':
        case 'sunset':
          skyBg = 'from-[#020617] via-[#0f172a] to-[#1e293b]';
          sunMoonColor = 'bg-transparent';
          label = weatherCondition === 'tornado' ? 'Dark Storm Approaching' : 'Dark Squall Line';
          break;
        case 'night':
          skyBg = 'from-[#000000] via-[#020617] to-[#0f172a]';
          sunMoonColor = 'bg-transparent';
          label = weatherCondition === 'tornado' ? 'Pitch Black Tornado Night' : 'Cyclone Night';
          break;
      }
    } else if (weatherCondition === 'fog') {
      auroraGlow = 'bg-teal-500/5';
      accentText = 'text-teal-400';
      switch (timeOfDay) {
        case 'morning':
          skyBg = 'from-[#F1F5F9] via-[#E2E8F0] to-[#CBD5E1]';
          sunMoonColor = 'bg-amber-300/30 shadow-[0_0_40px_rgba(245,158,11,0.1)]';
          label = 'Dense Morning Fog';
          break;
        case 'afternoon':
          skyBg = 'from-[#E2E8F0] via-[#CBD5E1] to-[#94A3B8]';
          sunMoonColor = 'bg-amber-400/25 shadow-[0_0_50px_rgba(251,191,36,0.1)]';
          label = 'Misty Afternoon Overcast';
          break;
        case 'evening':
          skyBg = 'from-[#CBD5E1] via-[#94A3B8]/70 to-[#475569]';
          sunMoonColor = 'bg-rose-400/20 shadow-none';
          label = 'Foggy Twilight';
          break;
        case 'sunset':
          skyBg = 'from-[#FDA4AF]/40 via-[#94A3B8]/60 to-[#334155]';
          sunMoonColor = 'bg-rose-400/20 shadow-none';
          label = 'Foggy Sunset';
          break;
        case 'night':
          skyBg = 'from-[#1e293b] via-[#334155] to-[#0f172a]';
          sunMoonColor = 'bg-slate-300/20 shadow-none';
          label = 'Thick Night Fog';
          break;
      }
    } else if (weatherCondition === 'aurora') {
      auroraGlow = 'bg-emerald-500/20';
      accentText = 'text-emerald-400';
      skyBg = 'from-[#020617] via-[#0f172a] to-[#1e293b]';
      sunMoonColor = 'bg-transparent shadow-none';
      label = 'Aurora Borealis';
    } else if (weatherCondition === 'meteor_shower') {
      auroraGlow = 'bg-indigo-500/15';
      accentText = 'text-indigo-400';
      skyBg = 'from-[#000000] via-[#020617] to-[#0f172a]';
      sunMoonColor = 'bg-transparent shadow-none';
      label = 'Meteor Shower';
    } else if (weatherCondition === 'clear_night') {
      auroraGlow = 'bg-blue-900/20';
      accentText = 'text-blue-400';
      skyBg = 'from-[#020617] via-[#0f172a] to-[#1e293b]';
      sunMoonColor = 'bg-slate-200/40 shadow-[0_0_40px_rgba(226,232,240,0.3)]';
      label = 'Clear Starlit Night';
    } else {
      auroraGlow = 'bg-transparent';
      accentText = 'text-slate-400';
      skyBg = 'from-[#0f172a] via-[#1e293b] to-[#334155]';
      sunMoonColor = 'bg-slate-300/20 shadow-none';
      label = 'Unknown Condition';
    }

    return { skyBg, sunMoonColor, auroraGlow, label, accentText };
  };

  const { skyBg, sunMoonColor, auroraGlow, label, accentText } = getSkyStyles();

  const [sunTop, setSunTop] = useState('18%');
  const [sunLeft, setSunLeft] = useState('15%'); // Starts at 15% (morning)
  const [prevSkyBg, setPrevSkyBg] = useState(skyBg); // Initialize with current skyBg
  const currentSkyBgRef = useRef(skyBg);
  const [sunTransition, setSunTransition] = useState(false);

  useEffect(() => {
    if (skyBg !== currentSkyBgRef.current) {
      setPrevSkyBg(currentSkyBgRef.current);
      currentSkyBgRef.current = skyBg;
    }
  }, [skyBg]);

  useEffect(() => {
    if (timeOfDay === 'morning') {
      setSunLeft('15%');
      setSunTop('18%');
    } else if (timeOfDay === 'afternoon') {
      setSunLeft('50%');
      setSunTop('10%');
    } else if (timeOfDay === 'evening') {
      setSunLeft('75%');
      setSunTop('18%');
    } else if (timeOfDay === 'sunset') {
      setSunLeft('85%');
      setSunTop('18%');
    } else if (timeOfDay === 'night') {
      setSunLeft('95%');
      setSunTop('25%');
    }
  }, [timeOfDay]);

  const getCloudStyles = () => {
    const isNight = timeOfDay === 'night';
    let baseColor = 'from-white/60 via-white/40 to-transparent';
    let blurClass = 'blur-[40px]';
    
    if (weatherCondition === 'sunny') {
      baseColor = 'from-white/10 to-transparent';
      blurClass = 'blur-[30px]';
    } else if (weatherCondition === 'cloudy' || weatherCondition === 'overcast') {
      blurClass = 'blur-[40px]';
      if (isNight) {
        baseColor = 'from-slate-700/20 via-slate-800/12 to-transparent';
      } else if (timeOfDay === 'sunset' || timeOfDay === 'evening') {
        baseColor = 'from-purple-300/30 via-slate-500/20 to-transparent';
      } else {
        baseColor = 'from-slate-100/45 via-slate-200/30 to-transparent';
      }
    } else if (weatherCondition === 'light_rain' || weatherCondition === 'heavy_rain' || weatherCondition === 'thunderstorm' || weatherCondition === 'tornado' || weatherCondition === 'cyclone') {
      blurClass = 'blur-[35px]';
      if (weatherCondition === 'light_rain') {
        baseColor = isNight 
          ? 'from-slate-800/30 via-slate-900/15 to-transparent' 
          : 'from-slate-200/45 via-slate-300/30 to-transparent';
      } else {
        baseColor = isNight || weatherCondition === 'tornado'
          ? 'from-slate-900/45 via-purple-950/10 to-transparent' 
          : 'from-slate-400/45 via-slate-500/30 to-transparent';
      }
    } else if (weatherCondition === 'fog') {
      baseColor = 'from-slate-100/20 to-transparent';
      blurClass = 'blur-[50px]';
    } else {
      blurClass = 'blur-[45px]';
      if (isNight) {
        baseColor = 'from-slate-200/12 via-slate-300/8 to-transparent';
      } else if (timeOfDay === 'sunset') {
        baseColor = 'from-orange-200/40 via-rose-300/25 to-transparent';
      } else if (timeOfDay === 'evening') {
        baseColor = 'from-amber-100/35 via-rose-200/20 to-transparent';
      } else {
        baseColor = 'from-white/60 via-white/40 to-transparent';
      }
    }

    return { baseColor, blurClass };
  };

  const getCloudCount = () => {
    switch (weatherCondition) {
      case 'sunny': return 2;
      case 'partly_cloudy': return 4;
      case 'cloudy': return 6;
      case 'overcast': return 8;
      case 'light_rain': return 4;
      case 'heavy_rain': return 5;
      case 'thunderstorm': return 5;
      case 'fog': return 3;
      case 'tornado': return 7;
      case 'cyclone': return 7;
      default: return 3;
    }
  };

  const cloudStyles = getCloudStyles();
  const cloudCount = getCloudCount();

  const getMoonOpacity = () => {
    if (timeOfDay === 'morning' || timeOfDay === 'afternoon') {
      return 0.0;
    }
    if (weatherCondition === 'heavy_rain' || weatherCondition === 'thunderstorm' || weatherCondition === 'tornado' || weatherCondition === 'cyclone') {
      return 0.0;
    }
    let baseOpacity = 0.0;
    if (timeOfDay === 'evening') {
      baseOpacity = 0.25;
    } else if (timeOfDay === 'sunset') {
      baseOpacity = 0.55;
    } else if (timeOfDay === 'night') {
      baseOpacity = 1.0;
    }
    if (weatherCondition === 'cloudy' || weatherCondition === 'overcast') {
      return baseOpacity * 0.4;
    }
    if (weatherCondition === 'fog') {
      return baseOpacity * 0.3;
    }
    return baseOpacity;
  };

  const moonOpacity = getMoonOpacity();

  const isStormy = weatherCondition === 'heavy_rain' || weatherCondition === 'thunderstorm' || weatherCondition === 'tornado' || weatherCondition === 'cyclone';
  const isWindy = weatherCondition === 'thunderstorm' || weatherCondition === 'tornado' || weatherCondition === 'cyclone';

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 transition-all duration-[3000ms]">
      <style>{`
        @keyframes fly-right-slow {
          from { left: -20%; }
          to { left: 120%; }
        }
        @keyframes fly-left-slow {
          from { left: 120%; }
          to { left: -20%; }
        }
        @keyframes sky-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-sky-fade-in {
          animation: sky-fade-in 3000ms ease-in-out forwards;
        }
      `}</style>

      {/* Sky Base Gradient - Pure CSS cross-fading via keyframes */}
      <div className={`absolute inset-0 bg-gradient-to-b ${prevSkyBg}`} />
      <div 
        key={skyBg}
        className={`absolute inset-0 bg-gradient-to-b ${skyBg} animate-sky-fade-in`} 
      />

      {/* Vibrant Animated Aurora Borealis - Horizontal sweeping waves */}
      {weatherCondition === 'aurora' && (
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none mix-blend-screen">
          <style>{`
            .aurora-scene { filter: url(#aurora-turb); }

            @keyframes ag1 {
              0%   { transform: translateX(-6%)  translateY(0%)  skewY(2deg)  scaleX(1.0)  scaleY(1.0);  opacity: 0.80; }
              25%  { transform: translateX(8%)   translateY(-5%) skewY(-4deg) scaleX(1.2)  scaleY(1.15); opacity: 0.95; }
              50%  { transform: translateX(-3%)  translateY(4%)  skewY(5deg)  scaleX(0.88) scaleY(0.9);  opacity: 0.60; }
              75%  { transform: translateX(12%)  translateY(-3%) skewY(-2deg) scaleX(1.1)  scaleY(1.2);  opacity: 0.88; }
              100% { transform: translateX(-6%)  translateY(0%)  skewY(2deg)  scaleX(1.0)  scaleY(1.0);  opacity: 0.80; }
            }
            @keyframes ag2 {
              0%   { transform: translateX(7%)   translateY(-4%) skewY(-3deg) scaleX(1.15) scaleY(1.1);  opacity: 0.70; }
              33%  { transform: translateX(-11%) translateY(5%)  skewY(6deg)  scaleX(0.82) scaleY(0.85); opacity: 0.90; }
              66%  { transform: translateX(9%)   translateY(-6%) skewY(-5deg) scaleX(1.28) scaleY(1.25); opacity: 0.96; }
              100% { transform: translateX(7%)   translateY(-4%) skewY(-3deg) scaleX(1.15) scaleY(1.1);  opacity: 0.70; }
            }
            @keyframes ag3 {
              0%   { transform: translateX(-8%)  translateY(3%)  skewY(4deg)  scaleX(0.92) scaleY(1.05); opacity: 0.82; }
              40%  { transform: translateX(10%)  translateY(-7%) skewY(-6deg) scaleX(1.32) scaleY(0.8);  opacity: 0.52; }
              70%  { transform: translateX(-5%)  translateY(6%)  skewY(7deg)  scaleX(1.08) scaleY(1.3);  opacity: 0.94; }
              100% { transform: translateX(-8%)  translateY(3%)  skewY(4deg)  scaleX(0.92) scaleY(1.05); opacity: 0.82; }
            }
            @keyframes ap1 {
              0%   { transform: translateX(-80%) translateY(2%)  skewY(-3deg) scaleX(1.1);  opacity: 0.0;  }
              15%  { transform: translateX(-40%) translateY(-4%) skewY(3deg)  scaleX(1.25); opacity: 0.70; }
              40%  { transform: translateX(10%)  translateY(5%)  skewY(-5deg) scaleX(0.9);  opacity: 0.90; }
              65%  { transform: translateX(60%)  translateY(-3%) skewY(4deg)  scaleX(1.15); opacity: 0.65; }
              85%  { transform: translateX(100%) translateY(4%)  skewY(-2deg) scaleX(1.0);  opacity: 0.0;  }
              100% { transform: translateX(-80%) translateY(2%)  skewY(-3deg) scaleX(1.1);  opacity: 0.0;  }
            }
            @keyframes ap2 {
              0%   { transform: translateX(90%)  translateY(-3%) skewY(4deg)  scaleX(0.95); opacity: 0.0;  }
              20%  { transform: translateX(50%)  translateY(5%)  skewY(-4deg) scaleX(1.2);  opacity: 0.75; }
              50%  { transform: translateX(-5%)  translateY(-4%) skewY(6deg)  scaleX(0.85); opacity: 0.88; }
              75%  { transform: translateX(-55%) translateY(3%)  skewY(-3deg) scaleX(1.1);  opacity: 0.55; }
              90%  { transform: translateX(-90%) translateY(-5%) skewY(2deg)  scaleX(1.0);  opacity: 0.0;  }
              100% { transform: translateX(90%)  translateY(-3%) skewY(4deg)  scaleX(0.95); opacity: 0.0;  }
            }
            @keyframes ap3 {
              0%   { transform: translateX(30%)  translateY(4%)  skewY(-5deg) scaleX(1.05); opacity: 0.60; }
              30%  { transform: translateX(-20%) translateY(-5%) skewY(4deg)  scaleX(1.3);  opacity: 0.85; }
              60%  { transform: translateX(70%)  translateY(6%)  skewY(-6deg) scaleX(0.88); opacity: 0.72; }
              100% { transform: translateX(30%)  translateY(4%)  skewY(-5deg) scaleX(1.05); opacity: 0.60; }
            }
            .ag1  { animation: ag1 14s ease-in-out infinite; }
            .ag2  { animation: ag2 18s ease-in-out infinite; }
            .ag3  { animation: ag3 16s ease-in-out infinite; }
            .ag1b { animation: ag1 14s ease-in-out infinite -5s; }
            .ag2b { animation: ag2 18s ease-in-out infinite -8s; }
            .ag3b { animation: ag3 16s ease-in-out infinite -6s; }
            .ag1c { animation: ag1 14s ease-in-out infinite -10s; }
            .ap1  { animation: ap1 35s ease-in-out infinite; }
            .ap2  { animation: ap2 45s ease-in-out infinite; }
            .ap3  { animation: ap3 28s ease-in-out infinite; }
          `}</style>

          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs>
              <filter id="aurora-turb" x="-30%" y="-30%" width="160%" height="160%">
                <feTurbulence type="fractalNoise" baseFrequency="0.018 0.006" numOctaves="6" seed="7" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="65" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
          </svg>

          <div className="aurora-scene" style={{ position: 'absolute', inset: 0 }}>
            <div className="ag1 absolute" style={{ top: '-5%', left: '-15%', width: '115%', height: '40%', background: 'radial-gradient(ellipse 88% 55% at 50% 50%, #22c55ebb 0%, #16a34a88 40%, #14532d44 70%, transparent 100%)', filter: 'blur(18px)', borderRadius: '50%' }} />
            <div className="ag2 absolute" style={{ top: '8%', left: '5%', width: '95%', height: '28%', background: 'radial-gradient(ellipse 85% 52% at 50% 50%, #4ade80cc 0%, #22c55e77 45%, transparent 100%)', filter: 'blur(14px)', borderRadius: '50%' }} />
            <div className="ag3 absolute" style={{ top: '20%', left: '-20%', width: '130%', height: '22%', background: 'radial-gradient(ellipse 90% 48% at 50% 50%, #34d399aa 0%, #05966966 60%, transparent 100%)', filter: 'blur(20px)', borderRadius: '50%' }} />
            <div className="ag1b absolute" style={{ top: '2%', left: '10%', width: '80%', height: '20%', background: 'radial-gradient(ellipse 80% 60% at 50% 50%, #86efaccc 0%, #4ade8077 42%, transparent 100%)', filter: 'blur(12px)', borderRadius: '50%' }} />
            <div className="ag2b absolute" style={{ top: '28%', left: '-5%', width: '100%', height: '26%', background: 'radial-gradient(ellipse 86% 50% at 50% 50%, #16a34a99 0%, #14532d55 55%, transparent 100%)', filter: 'blur(22px)', borderRadius: '50%' }} />
            <div className="ag3b absolute" style={{ top: '14%', left: '-10%', width: '85%', height: '18%', background: 'radial-gradient(ellipse 82% 55% at 50% 50%, #6ee7b7bb 0%, #34d39966 50%, transparent 100%)', filter: 'blur(16px)', borderRadius: '50%' }} />
            <div className="ag1c absolute" style={{ top: '-2%', left: '-5%', width: '110%', height: '32%', background: 'radial-gradient(ellipse 92% 45% at 50% 50%, #15803d77 0%, transparent 100%)', filter: 'blur(30px)', borderRadius: '50%' }} />

            <div className="ap1 absolute" style={{ top: '5%', left: '10%', width: '70%', height: '30%', background: 'radial-gradient(ellipse 85% 55% at 50% 50%, #9333eacc 0%, #7e22ce88 45%, transparent 100%)', filter: 'blur(22px)', borderRadius: '50%' }} />
            <div className="ap2 absolute" style={{ top: '18%', left: '20%', width: '65%', height: '24%', background: 'radial-gradient(ellipse 80% 52% at 50% 50%, #a855f7bb 0%, #6b21a877 48%, transparent 100%)', filter: 'blur(26px)', borderRadius: '50%' }} />
            <div className="ap3 absolute" style={{ top: '10%', left: '-5%', width: '75%', height: '28%', background: 'radial-gradient(ellipse 88% 50% at 50% 50%, #c084fcaa 0%, #9333ea66 50%, transparent 100%)', filter: 'blur(20px)', borderRadius: '50%' }} />
          </div>
        </div>
      )}
      {/* Standard Subtle Aurora Radial Glow (For non-aurora deep night accents) */}

      {weatherCondition !== 'aurora' && auroraGlow !== 'bg-transparent' && (
        <div className={`absolute -top-40 left-1/4 w-[80vw] h-[60vh] rounded-full filter blur-[120px] mix-blend-screen opacity-60 transition-all duration-[3000ms] ${auroraGlow}`} />
      )}

      {/* Sunny/Partly Sparkling particles */}
      {weatherCondition === 'sunny' && (
        <div className="absolute inset-0 opacity-40">
          {sparkles.map((sp) => (
            <div
              key={sp.id}
              className="absolute bg-white rounded-full animate-pulse filter blur-[0.5px]"
              style={{
                left: `${sp.left}%`,
                top: `${sp.top}%`,
                width: `${sp.size}px`,
                height: `${sp.size}px`,
                animationDelay: sp.delay,
                animationDuration: '3s',
              }}
            />
          ))}
        </div>
      )}

      {/* Twinkling Stars (Only visible at Night and not heavy overcast) */}
      {timeOfDay === 'night' && weatherCondition !== 'heavy_rain' && weatherCondition !== 'thunderstorm' && (
        <div className="absolute inset-0 transition-opacity duration-[3000ms]">
          {stars.map((star) => (
            <div
              key={`star-${star.id}`}
              className={`absolute rounded-full ${star.color} ${star.glow} ${Math.random() > 0.8 ? 'animate-ping' : 'animate-pulse'}`}
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: star.delay,
                animationDuration: star.duration,
                opacity: Math.random() * 0.6 + 0.4,
              }}
            />
          ))}
        </div>
      )}

      {/* ── REALISTIC COLORFUL FIREBALL METEORS ── */}
      {(weatherCondition === 'meteor_shower' || weatherCondition === 'aurora' || (weatherCondition === 'clear_night' && timeOfDay === 'night')) && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <style>{`
            /* 
             * Meteor motion: The container is pre-rotated. 
             * We animate translateX so it moves along its angled path.
             * Length of cycle: 28s. Active fall: 2s (which is ~7.1% of 28s).
             */
            @keyframes meteor-fall {
              0%     { transform: translateX(0); opacity: 0; }
              0.5%   { opacity: 1; }
              5%     { opacity: 1; }
              6%     { transform: translateX(180vw); opacity: 0; }
              100%   { transform: translateX(180vw); opacity: 0; }
            }
            
            /* Add a subtle flicker to the head for burning effect */
            @keyframes meteor-flicker {
              0% { opacity: 0.8; transform: scale(0.8); }
              50% { opacity: 1; transform: scale(1.2); }
              100% { opacity: 0.8; transform: scale(0.8); }
            }

            /* Sparks falling off the tail */
            @keyframes meteor-sparks {
              0% { opacity: 1; transform: translateX(0) scale(1); }
              100% { opacity: 0; transform: translateX(-50px) scale(0); }
            }
          `}</style>

          {/* ── BLUE meteor ── */}
          <div style={{ position:'absolute', top:'-10%', left:'10%', transform:'rotate(35deg)', transformOrigin:'left center' }}>
            <div style={{ position:'relative', opacity: 0, animation:'meteor-fall 28s ease-in 0s infinite' }}>
              {/* Head / Core */}
              <div style={{ position:'absolute', right:0, top:'-3px', width:'10px', height:'6px', borderRadius:'50%', background:'#ffffff', boxShadow:'0 0 15px 5px #38bdf8', animation:'meteor-flicker 0.1s infinite', zIndex:3 }} />
              {/* Main Tail */}
              <div style={{ position:'absolute', right:'4px', top:'-1px', width:'200px', height:'2px', background:'linear-gradient(to left, #ffffff, #38bdf8cc 20%, transparent 100%)', filter:'blur(1px)', zIndex:2 }} />
              {/* Particle Sparks (Dashed trail) */}
              <div style={{ position:'absolute', right:'10px', top:'-1px', width:'150px', height:'1px', background:'repeating-linear-gradient(to left, #38bdf8 0, #38bdf8 2px, transparent 2px, transparent 15px)', filter:'blur(0.5px)', opacity: 0.6, zIndex:1 }} />
            </div>
          </div>

          {/* ── ORANGE meteor ── */}
          <div style={{ position:'absolute', top:'15%', left:'-5%', transform:'rotate(28deg)', transformOrigin:'left center' }}>
            <div style={{ position:'relative', opacity: 0, animation:'meteor-fall 28s ease-in 4s infinite' }}>
              <div style={{ position:'absolute', right:0, top:'-3px', width:'12px', height:'7px', borderRadius:'50%', background:'#ffffff', boxShadow:'0 0 18px 6px #fb923c', animation:'meteor-flicker 0.1s infinite', zIndex:3 }} />
              <div style={{ position:'absolute', right:'5px', top:'-1px', width:'240px', height:'2px', background:'linear-gradient(to left, #ffffff, #fb923ccc 20%, transparent 100%)', filter:'blur(1px)', zIndex:2 }} />
              <div style={{ position:'absolute', right:'12px', top:'-1px', width:'180px', height:'1px', background:'repeating-linear-gradient(to left, #fb923c 0, #fb923c 3px, transparent 3px, transparent 20px)', filter:'blur(0.5px)', opacity: 0.6, zIndex:1 }} />
            </div>
          </div>

          {/* ── GREEN meteor ── */}
          <div style={{ position:'absolute', top:'-5%', left:'40%', transform:'rotate(40deg)', transformOrigin:'left center' }}>
            <div style={{ position:'relative', opacity: 0, animation:'meteor-fall 28s ease-in 9s infinite' }}>
              <div style={{ position:'absolute', right:0, top:'-2px', width:'8px', height:'5px', borderRadius:'50%', background:'#ffffff', boxShadow:'0 0 12px 4px #4ade80', animation:'meteor-flicker 0.1s infinite', zIndex:3 }} />
              <div style={{ position:'absolute', right:'3px', top:'-1px', width:'160px', height:'2px', background:'linear-gradient(to left, #ffffff, #4ade80cc 20%, transparent 100%)', filter:'blur(0.5px)', zIndex:2 }} />
              <div style={{ position:'absolute', right:'8px', top:'-1px', width:'120px', height:'1px', background:'repeating-linear-gradient(to left, #4ade80 0, #4ade80 2px, transparent 2px, transparent 12px)', opacity: 0.5, zIndex:1 }} />
            </div>
          </div>

          {/* ── YELLOW-WHITE meteor ── */}
          <div style={{ position:'absolute', top:'5%', left:'20%', transform:'rotate(32deg)', transformOrigin:'left center' }}>
            <div style={{ position:'relative', opacity: 0, animation:'meteor-fall 28s ease-in 15s infinite' }}>
              <div style={{ position:'absolute', right:0, top:'-4px', width:'14px', height:'8px', borderRadius:'50%', background:'#ffffff', boxShadow:'0 0 20px 7px #fef08a', animation:'meteor-flicker 0.1s infinite', zIndex:3 }} />
              <div style={{ position:'absolute', right:'6px', top:'-1.5px', width:'280px', height:'3px', background:'linear-gradient(to left, #ffffff, #fef08acc 20%, transparent 100%)', filter:'blur(1px)', zIndex:2 }} />
              <div style={{ position:'absolute', right:'14px', top:'-1px', width:'200px', height:'1px', background:'repeating-linear-gradient(to left, #facc15 0, #facc15 3px, transparent 3px, transparent 25px)', filter:'blur(0.5px)', opacity: 0.7, zIndex:1 }} />
            </div>
          </div>

          {/* ── PURPLE meteor (meteor_shower only) ── */}
          {weatherCondition === 'meteor_shower' && (
            <div style={{ position:'absolute', top:'30%', left:'-10%', transform:'rotate(25deg)', transformOrigin:'left center' }}>
              <div style={{ position:'relative', opacity: 0, animation:'meteor-fall 28s ease-in 20s infinite' }}>
                <div style={{ position:'absolute', right:0, top:'-2.5px', width:'9px', height:'5px', borderRadius:'50%', background:'#ffffff', boxShadow:'0 0 14px 5px #c084fc', animation:'meteor-flicker 0.1s infinite', zIndex:3 }} />
                <div style={{ position:'absolute', right:'4px', top:'-1px', width:'180px', height:'2px', background:'linear-gradient(to left, #ffffff, #c084fccc 20%, transparent 100%)', filter:'blur(1px)', zIndex:2 }} />
                <div style={{ position:'absolute', right:'9px', top:'-1px', width:'140px', height:'1px', background:'repeating-linear-gradient(to left, #c084fc 0, #c084fc 2px, transparent 2px, transparent 18px)', filter:'blur(0.5px)', opacity: 0.6, zIndex:1 }} />
              </div>
            </div>
          )}

          {/* ── BRIGHT WHITE meteor (meteor_shower only) ── */}
          {weatherCondition === 'meteor_shower' && (
            <div style={{ position:'absolute', top:'-5%', left:'60%', transform:'rotate(45deg)', transformOrigin:'left center' }}>
              <div style={{ position:'relative', opacity: 0, animation:'meteor-fall 28s ease-in 24s infinite' }}>
                <div style={{ position:'absolute', right:0, top:'-5px', width:'16px', height:'10px', borderRadius:'50%', background:'#ffffff', boxShadow:'0 0 25px 8px #e0f2fe', animation:'meteor-flicker 0.1s infinite', zIndex:3 }} />
                <div style={{ position:'absolute', right:'8px', top:'-2px', width:'320px', height:'4px', background:'linear-gradient(to left, #ffffff, #7dd3fc88 25%, transparent 100%)', filter:'blur(1.5px)', zIndex:2 }} />
                <div style={{ position:'absolute', right:'16px', top:'-1px', width:'240px', height:'2px', background:'repeating-linear-gradient(to left, #e0f2fe 0, #e0f2fe 4px, transparent 4px, transparent 30px)', filter:'blur(0.5px)', opacity: 0.8, zIndex:1 }} />
              </div>
            </div>
          )}
        </div>
      )}
      {/* Sun celestial body */}
      <div 
        className="absolute"
        style={{
          width: '96px',
          height: '96px',
          top: sunTop,
          left: sunLeft,
          transform: 'translateX(-50%)',
          opacity: weatherCondition === 'heavy_rain' ? 0.0 : weatherCondition === 'thunderstorm' ? 0.0 : weatherCondition === 'cloudy' || weatherCondition === 'overcast' ? 0.25 : weatherCondition === 'fog' ? 0.35 : (timeOfDay === 'night' ? 0.0 : 1.0),
          transition: sunTransition ? 'all 3000ms ease-in-out' : 'none',
        }}
      >
        {/* Realistic, highly advanced living Sun */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Outer atmospheric solar corona (pulsing and breathing) */}
          <div className="absolute -inset-14 rounded-full bg-amber-400/20 filter blur-2xl animate-pulse" />
          <div className="absolute -inset-24 rounded-full bg-rose-500/10 filter blur-3xl animate-[pulse_5s_ease-in-out_infinite]" />
          
          {/* Primary Rotating Solar Flare Vector Ray Layer (Slow clockwise spin) */}
          <svg viewBox="0 0 100 100" className="absolute -inset-16 w-[230%] h-[230%] animate-[spin_180s_linear_infinite] opacity-35 pointer-events-none select-none">
            <defs>
              <radialGradient id="sun-ray-grad-1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>
            </defs>
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 360) / 12;
              return (
                <path
                  key={i}
                  d="M 50 50 L 38 1 L 62 1 Z"
                  fill="url(#sun-ray-grad-1)"
                  transform={`rotate(${angle} 50 50)`}
                />
              );
            })}
          </svg>

          {/* Secondary Rotating Solar Flare Ray Layer (Faster counter-clockwise spin) */}
          <svg viewBox="0 0 100 100" className="absolute -inset-12 w-[200%] h-[200%] animate-[spin_110s_linear_reverse_infinite] opacity-25 pointer-events-none select-none">
            <defs>
              <radialGradient id="sun-ray-grad-2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="35%" stopColor="#fbbf24" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
              </radialGradient>
            </defs>
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * 360) / 8 + 22.5;
              return (
                <path
                  key={i}
                  d="M 50 50 L 41 6 L 59 6 Z"
                  fill="url(#sun-ray-grad-2)"
                  transform={`rotate(${angle} 50 50)`}
                />
              );
            })}
          </svg>

          {/* High intensity inner hot ring */}
          <div className="absolute -inset-4 rounded-full bg-amber-200/40 filter blur-md animate-[pulse_3s_ease-in-out_infinite]" />

          {/* High intensity white-hot core body with gorgeous orange-red outer glowing shadows */}
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-300 via-amber-100 to-white shadow-[0_0_50px_#fff,0_0_90px_#f59e0b,0_0_150px_#ef4444,0_0_250px_rgba(245,158,11,0.5)] relative z-10" />
          
          {/* Cinematics: Micro Camera Lens Flares aligned radially */}
          <div className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-white/10 border border-white/20 filter blur-[0.5px] transform translate-x-12 translate-y-12 select-none pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 w-6 h-6 rounded-full bg-rose-400/5 filter blur-[1px] transform translate-x-24 translate-y-24 select-none pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-teal-400/10 filter blur-[0.5px] transform translate-x-36 translate-y-36 select-none pointer-events-none" />
        </div>
      </div>

      {/* Realistic 2D Moon Disc */}
      <div 
        className="absolute transition-all duration-[3000ms] ease-in-out"
        style={{
          width: '90px',
          height: '90px',
          top: timeOfDay === 'evening' ? '14%' : timeOfDay === 'sunset' ? '12%' : '10%',
          left: timeOfDay === 'evening' ? '72%' : timeOfDay === 'sunset' ? '68%' : '75%',
          transform: 'translateX(-50%)',
          opacity: moonOpacity,
        }}
      >
        <RealMoonDisc illumination={moonIllumination} phaseName={moonPhaseName} size={90} />
      </div>

      {/* Drifting Clouds Mesh */}
      <div className="absolute inset-0">
        {activeClouds.slice(0, cloudCount).map((cloud) => (
          <div
            key={cloud.id}
            className={`absolute rounded-full bg-gradient-to-b ${cloudStyles.baseColor} ${cloudStyles.blurClass} transition-all duration-[3000ms]`}
            style={{
              width: `${240 * cloud.scale}px`,
              height: `${120 * cloud.scale}px`,
              left: 0,
              top: `${cloud.top}%`,
              opacity: weatherCondition === 'cloudy' || weatherCondition === 'overcast' ? cloud.opacity * 1.0 : isStormy ? cloud.opacity * 1.1 : cloud.opacity * 0.75,
              animationName: 'float-cloud-drift',
              animationDuration: `${isWindy ? cloud.speed / 4.5 : isStormy ? cloud.speed / 2.5 : cloud.speed}s`,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationDelay: `${cloud.delay}s`,
              willChange: 'transform',
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float-cloud-drift {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100vw); }
        }
        @keyframes bird-flap-wing {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(-0.7); }
        }
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
      `}</style>



      {/* Airplanes (Always visible Air Traffic System) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {planes.map((plane) => (
          <div
            key={`plane-${plane.id}`}
            data-direction={plane.direction}
            className="absolute pointer-events-none"
            style={{
              top: `${plane.altitude}%`,
              left: plane.direction === 'right' ? '-20%' : '120%',
              width: '100px',
              height: '28px',
              animationName: plane.direction === 'right' ? 'fly-right-slow' : 'fly-left-slow',
              animationDuration: `${plane.speed}s`,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationDelay: `${plane.delay}s`,
              transform: plane.direction === 'left' ? 'scaleX(-1)' : 'none',
              willChange: 'left, transform',
            }}
          >
            {/* Airplane Inner Scale and bank tilting simulation */}
            <div 
              className="relative flex items-center justify-center transition-all duration-[3000ms] ease-in-out"
              style={{ 
                width: '100%',
                height: '100%',
                transform: `scale(${plane.scale}) rotate(${plane.direction === 'right' ? '1deg' : '-1deg'})`,
                opacity: weatherCondition === 'fog' ? 0.35 : weatherCondition === 'heavy_rain' ? 0.45 : 1
              }}
            >
              {/* 3. Contrails behind the aircraft (condensation trail) */}
              <div 
                className="absolute h-[1px] bg-gradient-to-l from-white/25 via-white/5 to-transparent pointer-events-none origin-right"
                style={{
                  right: plane.type === 'business_jet' ? '120px' : plane.type === 'cargo' ? '125px' : plane.type === 'special_regional' ? '125px' : '135px',
                  top: plane.type === 'special_regional' ? '12px' : '28px',
                  width: `${plane.contrailLength}px`,
                  opacity: weatherCondition === 'fog' ? 0.1 : weatherCondition === 'heavy_rain' ? 0.05 : 0.6,
                }}
              />

              {/* Vector Aircraft Illustration */}
              <svg viewBox="0 0 180 50" width="100" height="28" className="overflow-visible pointer-events-none drop-shadow-md">
                <defs>
                  <linearGradient id={`plane-body-grad-${plane.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={timeOfDay === 'night' ? "#1e293b" : timeOfDay === 'evening' || timeOfDay === 'sunset' ? "#ffe4e6" : "#ffffff"} />
                    <stop offset="45%" stopColor={timeOfDay === 'night' ? "#0f172a" : timeOfDay === 'evening' || timeOfDay === 'sunset' ? "#fda4af" : "#f1f5f9"} />
                    <stop offset="100%" stopColor={timeOfDay === 'night' ? "#020617" : timeOfDay === 'evening' || timeOfDay === 'sunset' ? "#e11d48" : "#cbd5e1"} />
                  </linearGradient>
                  <linearGradient id={`plane-wing-grad-${plane.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={timeOfDay === 'night' ? "#334155" : "#cbd5e1"} />
                    <stop offset="100%" stopColor={timeOfDay === 'night' ? "#0f172a" : "#64748b"} />
                  </linearGradient>
                </defs>

                {/* Render specific geometry based on aircraft type */}
                {plane.type === 'passenger_wide' && (
                  <>
                    <path d="M 12 28 C 12 22 18 20 28 20 L 142 20 C 158 20 170 21 174 24 C 178 26.2 177 29.5 170 31.5 L 28 32 C 18 32 12 30 12 28 Z" fill={`url(#plane-body-grad-${plane.id})`} />
                    <path d="M 160 22 C 164 22 167 22.8 168.5 24 L 157 24 C 157.5 22.5 158.5 22 160 22 Z" fill="#090d16" />
                    {Array.from({ length: 22 }).map((_, j) => (
                      <rect key={j} x={42 + j * 5} y="24" width="2" height="1.8" rx="0.5" fill={timeOfDay === 'night' ? "#fbbf24" : "#090d16"} opacity={timeOfDay === 'night' ? 0.95 : 0.45} />
                    ))}
                    <path d="M 28 21 L 8 4 L 20 4 L 42 20 Z" fill={`url(#plane-body-grad-${plane.id})`} />
                    <path d="M 18 29 L 5 24 L 12 24 L 24 29 Z" fill={`url(#plane-wing-grad-${plane.id})`} />
                    <path d="M 96 29 L 68 45 L 85 45 L 112 29 Z" fill={`url(#plane-wing-grad-${plane.id})`} />
                    <path d="M 68 45 L 64 42 L 72 45 Z" fill="#f43f5e" />
                    <rect x="80" y="32" width="16" height="7.5" rx="3.5" fill="#475569" stroke="#cbd5e1" strokeWidth="0.5" />
                    <ellipse cx="95.5" cy="35.75" rx="0.8" ry="3.5" fill="#0f172a" />
                  </>
                )}

                {plane.type === 'passenger_narrow' && (
                  <>
                    <path d="M 15 28 C 15 23 20 21.5 28 21.5 L 138 21.5 C 152 21.5 165 22.5 169 25 C 172 26.8 171 29 165 30.5 L 28 31 C 19 31 15 29.5 15 28 Z" fill={`url(#plane-body-grad-${plane.id})`} />
                    <path d="M 156 23.5 C 159 23.5 161 24.2 163 25 L 153 25 C 153.5 24 154.5 23.5 156 23.5 Z" fill="#090d16" />
                    {Array.from({ length: 16 }).map((_, j) => (
                      <rect key={j} x={45 + j * 6} y="25" width="1.8" height="1.5" rx="0.4" fill={timeOfDay === 'night' ? "#fbbf24" : "#090d16"} opacity={timeOfDay === 'night' ? 0.95 : 0.45} />
                    ))}
                    <path d="M 30 22 L 12 6 L 22 6 L 44 22 Z" fill={`url(#plane-body-grad-${plane.id})`} />
                    <path d="M 20 29 L 8 25 L 14 25 L 25 29 Z" fill={`url(#plane-wing-grad-${plane.id})`} />
                    <path d="M 94 30 L 70 43 L 84 43 L 108 30 Z" fill={`url(#plane-wing-grad-${plane.id})`} />
                    <rect x="80" y="32" width="13" height="6" rx="3" fill="#475569" stroke="#cbd5e1" strokeWidth="0.5" />
                    <ellipse cx="92.5" cy="35" rx="0.6" ry="2.8" fill="#0f172a" />
                  </>
                )}

                {plane.type === 'business_jet' && (
                  <>
                    <path d="M 18 28 C 18 24 22 22.5 32 22.5 L 132 22.5 C 146 22.5 158 23 162 25 C 165 26.5 164 28 158 29.5 L 32 30 C 24 30 18 29.5 18 28 Z" fill={`url(#plane-body-grad-${plane.id})`} />
                    <path d="M 148 24 C 151 24 153.5 24.5 155 25.2 L 145 25.2 Z" fill="#090d16" />
                    {Array.from({ length: 8 }).map((_, j) => (
                      <circle key={j} cx={55 + j * 9} cy="26" r="1" fill={timeOfDay === 'night' ? "#fbbf24" : "#090d16"} opacity={timeOfDay === 'night' ? 0.95 : 0.45} />
                    ))}
                    <path d="M 32 23 L 18 8 L 28 8 L 44 23 Z" fill={`url(#plane-body-grad-${plane.id})`} />
                    <path d="M 20 9 L 10 9 L 18 7 L 28 7 Z" fill={`url(#plane-wing-grad-${plane.id})`} />
                    <path d="M 85 29 L 55 42 L 68 42 L 98 29 Z" fill={`url(#plane-wing-grad-${plane.id})`} />
                    <rect x="42" y="16" width="13" height="6.5" rx="2.5" fill="#334155" stroke="#cbd5e1" strokeWidth="0.4" />
                    <ellipse cx="54.5" cy="19.25" rx="0.5" ry="3" fill="#0f172a" />
                  </>
                )}

                {plane.type === 'cargo' && (
                  <>
                    <path d="M 12 28 C 12 22 18 20 28 20 L 118 20 C 128 20 134 16 142 16 C 150 16 160 18 168 22 C 175 25.5 174 29 168 31 L 28 31.5 C 18 31.5 12 30 12 28 Z" fill={`url(#plane-body-grad-${plane.id})`} />
                    <path d="M 152 18.5 Q 155 18.5 157 20 L 146 20 Z" fill="#090d16" />
                    {Array.from({ length: 4 }).map((_, j) => (
                      <rect key={j} x={130 + j * 4} y="18" width="1.5" height="1.2" rx="0.3" fill={timeOfDay === 'night' ? "#fbbf24" : "#090d16"} opacity={timeOfDay === 'night' ? 0.9 : 0.5} />
                    ))}
                    <path d="M 28 21 L 6 3 L 18 3 L 41 20 Z" fill={`url(#plane-body-grad-${plane.id})`} />
                    <path d="M 18 29 L 5 24 L 12 24 L 24 29 Z" fill={`url(#plane-wing-grad-${plane.id})`} />
                    <path d="M 96 29 L 65 46 L 82 46 L 112 29 Z" fill={`url(#plane-wing-grad-${plane.id})`} />
                    <rect x="74" y="32" width="11" height="5" rx="2.5" fill="#475569" stroke="#cbd5e1" strokeWidth="0.4" />
                    <rect x="88" y="35" width="11" height="5" rx="2.5" fill="#475569" stroke="#cbd5e1" strokeWidth="0.4" />
                  </>
                )}

                {plane.type === 'special_regional' && (
                  <>
                    <path d="M 14 24 C 14 18 20 16 30 16 L 136 16 C 148 16 162 18 168 21 C 173 23.5 173 27 166 29 L 30 29.5 C 20 29.5 14 27.5 14 24 Z" fill={`url(#plane-body-grad-${plane.id})`} />
                    <path d="M 154 18 Q 157 18 159 19.5 L 148 19.5 Z" fill="#090d16" />
                    <path d="M 32 17 L 10 2 L 22 2 L 46 17 Z" fill={`url(#plane-body-grad-${plane.id})`} />
                    <path d="M 16 3 L 6 3 L 12 1 L 22 1 Z" fill={`url(#plane-wing-grad-${plane.id})`} />
                    <path d="M 90 17 L 62 33 L 78 33 L 106 17 Z" fill={`url(#plane-wing-grad-${plane.id})`} />
                    <rect x="72" y="24" width="12" height="5.5" rx="2.5" fill="#475569" stroke="#cbd5e1" strokeWidth="0.4" />
                    <rect x="86" y="22" width="12" height="5.5" rx="2.5" fill="#475569" stroke="#cbd5e1" strokeWidth="0.4" />
                  </>
                )}
              </svg>

              {/* 4. Realistic Navigation Lights (Wingtips, Beacons, Strobes) */}
              <div 
                className="absolute w-[4px] h-[4px] bg-red-500 rounded-full animate-ping shadow-[0_0_8px_#ef4444]" 
                style={{
                  left: plane.type === 'cargo' ? '80px' : plane.type === 'special_regional' ? '82px' : '76px',
                  top: plane.type === 'cargo' ? '5px' : plane.type === 'special_regional' ? '5px' : '7px',
                  animationDuration: '1.2s'
                }} 
              />
              <div 
                className="absolute w-[3px] h-[3px] bg-emerald-400 rounded-full shadow-[0_0_6px_#34d399]" 
                style={{
                  left: plane.type === 'passenger_wide' ? '40px' : plane.type === 'passenger_narrow' ? '41px' : plane.type === 'business_jet' ? '30px' : plane.type === 'cargo' ? '36px' : '38px',
                  top: plane.type === 'passenger_wide' ? '24px' : plane.type === 'passenger_narrow' ? '23px' : plane.type === 'business_jet' ? '22px' : plane.type === 'cargo' ? '24px' : '17px',
                }} 
              />
              <div 
                className="absolute w-[3.5px] h-[3.5px] bg-white rounded-full animate-pulse shadow-[0_0_8px_#fff]" 
                style={{
                  left: '5px',
                  top: plane.type === 'business_jet' ? '6px' : plane.type === 'cargo' ? '3px' : plane.type === 'special_regional' ? '2px' : '4px',
                  animationDuration: '0.7s'
                }} 
              />

              {/* Engine Exhaust Glow (Night/Rain) */}
              {timeOfDay === 'night' && (
                <div 
                  className="absolute w-[5px] h-[5px] rounded-full bg-orange-500/80 shadow-[0_0_8px_#f97316] animate-pulse"
                  style={{
                    left: plane.type === 'business_jet' ? '21px' : '42px',
                    top: plane.type === 'business_jet' ? '11px' : plane.type === 'special_regional' ? '14px' : '19px',
                    animationDuration: '0.2s'
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
