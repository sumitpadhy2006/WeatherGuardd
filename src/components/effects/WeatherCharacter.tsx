import React from 'react';
import { CurrentWeatherPayload } from '../../types';
import { ComputedAtmosphereState } from './AtmosphereSkyEngine';

interface WeatherCharacterProps {
  weather?: CurrentWeatherPayload | null;
  state?: ComputedAtmosphereState;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const WeatherCharacter: React.FC<WeatherCharacterProps> = ({
  weather,
  state = 'clear_day',
  className = '',
  size = 'md',
}) => {
  const isNight = state === 'clear_night' || state === 'cloudy_night' || state === 'rainy_night' || state === 'dusk' || state === 'aurora';
  const isRain = state === 'light_rain' || state === 'heavy_rain' || state === 'thunderstorm' || state === 'rainy_night';
  const isSnow = state === 'snow' || (weather && weather.temp <= 0);
  const isWindy = (weather?.windSpeed || 0) > 25;
  const isStargazing = isNight && (weather?.celestial?.stargazingScore || 0) > 70 && !isRain;
  const isSunsetSunrise = state === 'sunrise' || state === 'golden_hour' || state === 'sunset';

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24 sm:h-28 sm:w-28',
    lg: 'h-36 w-36 sm:h-44 sm:w-44',
  }[size];

  // Pick character variant
  let characterVariant = 'sunny';
  if (isRain) characterVariant = 'rain';
  else if (isSnow) characterVariant = 'snow';
  else if (isStargazing) characterVariant = 'stargazing';
  else if (isNight) characterVariant = 'night_gazer';
  else if (isSunsetSunrise) characterVariant = 'golden_sunset';
  else if (isWindy) characterVariant = 'windy';

  return (
    <div
      className={`relative inline-flex items-end justify-center select-none pointer-events-none ${sizeClasses} ${className}`}
      title={`Atmospheric Observer: ${characterVariant}`}
    >
      {/* Dynamic Ground Horizon Silhouette */}
      <div className="absolute bottom-0 w-full h-1.5 rounded-full bg-slate-900/40 blur-[1px]" />

      <svg
        viewBox="0 0 120 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)] overflow-visible transition-all duration-700"
      >
        {/* ========================================================= */}
        {/* VARIANT 1: RAIN & STORM — Figure with Canopy Umbrella     */}
        {/* ========================================================= */}
        {characterVariant === 'rain' && (
          <g className="animate-pulse-subtle">
            {/* Umbrella Dome */}
            <path
              d="M15 45 C15 15, 95 15, 95 45 C80 43, 70 45, 55 45 C40 45, 30 43, 15 45 Z"
              fill="#06b6d4"
              className="drop-shadow-md"
            />
            {/* Umbrella Ribs Highlight */}
            <path
              d="M55 20 L55 45 M35 25 Q45 35 40 45 M75 25 Q65 35 70 45"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Umbrella Ferrule Top */}
            <path d="M55 16 L55 20" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
            {/* Umbrella Shaft */}
            <path d="M55 45 L55 85 Q55 92 48 92 Q42 92 44 86" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" fill="none" />

            {/* Raindrops deflecting off umbrella edge */}
            <circle cx="16" cy="48" r="1.5" fill="#bae6fd" className="animate-ping" />
            <circle cx="94" cy="48" r="1.5" fill="#bae6fd" className="animate-ping" />

            {/* Head & Waterproof Hat */}
            <circle cx="58" cy="62" r="11" fill="#fbcfe8" />
            <path d="M46 60 Q58 52 70 60 L68 56 Q58 50 48 56 Z" fill="#0891b2" />

            {/* Raincoat Body */}
            <path
              d="M48 72 Q58 70 68 72 L76 112 Q58 114 40 112 Z"
              fill="#0284c7"
            />
            {/* Coat Zipper/Centerline */}
            <path d="M58 72 L58 112" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Arm holding umbrella */}
            <path d="M52 78 Q46 84 48 90" stroke="#0284c7" strokeWidth="6" strokeLinecap="round" />

            {/* Rain Boots */}
            <rect x="42" y="112" width="7" height="20" rx="3" fill="#0369a1" />
            <path d="M42 128 L37 132 Q42 135 49 132 L49 128 Z" fill="#0c4a6e" />

            <rect x="62" y="112" width="7" height="20" rx="3" fill="#0369a1" />
            <path d="M62 128 L67 132 Q62 135 55 132 L55 128 Z" fill="#0c4a6e" />
          </g>
        )}

        {/* ========================================================= */}
        {/* VARIANT 2: SNOW / EXTREME COLD — Heavily Winterized      */}
        {/* ========================================================= */}
        {characterVariant === 'snow' && (
          <g>
            {/* Wool Beanie Hat */}
            <path d="M48 58 Q58 45 68 58 Z" fill="#ef4444" />
            <circle cx="58" cy="48" r="4" fill="#fca5a5" />
            
            {/* Head/Face wrapped in scarf */}
            <circle cx="58" cy="62" r="10" fill="#fcd34d" />
            <path d="M48 64 Q58 70 68 64 L68 72 Q58 78 48 72 Z" fill="#dc2626" />
            {/* Scarf Tail */}
            <path d="M66 70 Q75 80 62 90" stroke="#dc2626" strokeWidth="5" strokeLinecap="round" fill="none" />

            {/* Puffer Jacket */}
            <path d="M46 72 Q58 68 70 72 L78 110 Q58 115 38 110 Z" fill="#3b82f6" />
            {/* Puffer Baffles (Horizontal lines) */}
            <path d="M44 82 Q58 84 72 82 M42 92 Q58 95 74 92 M40 102 Q58 105 76 102" stroke="rgba(0,0,0,0.15)" strokeWidth="2" fill="none" />

            {/* Mittens/Arms tucked in */}
            <circle cx="44" cy="95" r="6" fill="#1e293b" />
            <circle cx="72" cy="95" r="6" fill="#1e293b" />

            {/* Snow Boots */}
            <rect x="45" y="110" width="8" height="22" rx="2" fill="#0f172a" />
            <path d="M45 130 L40 134 L53 134 Z" fill="#334155" />

            <rect x="63" y="110" width="8" height="22" rx="2" fill="#0f172a" />
            <path d="M63 130 L68 134 L55 134 Z" fill="#334155" />
          </g>
        )}

        {/* ========================================================= */}
        {/* VARIANT 3: WINDY — Leaning into gale, coat flapping      */}
        {/* ========================================================= */}
        {characterVariant === 'windy' && (
          <g className="animate-pulse-subtle">
            {/* Head (Leaning forward) */}
            <circle cx="50" cy="58" r="10" fill="#fcd34d" />
            {/* Hair blowing back forcefully */}
            <path d="M50 48 Q70 45 80 55 Q65 52 50 58 Z" fill="#451a03" />

            {/* Trench Coat Body (Leaning) */}
            <path d="M44 68 Q54 62 64 68 L68 95 Q60 100 48 95 Z" fill="#d97706" />
            
            {/* Coat Flapping Backwards (Right side) */}
            <path d="M66 80 Q95 85 90 105 Q70 100 68 95" fill="#b45309" />
            {/* Wind lines wrapping around */}
            <path d="M20 70 Q40 75 90 70 M15 90 Q30 85 85 95" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="6 4" fill="none" />

            {/* Arm holding hat/collar */}
            <path d="M48 72 Q38 65 42 58" stroke="#d97706" strokeWidth="6" strokeLinecap="round" fill="none" />

            {/* Legs wide stance */}
            <path d="M48 95 L40 130 M60 95 L55 130" stroke="#1e293b" strokeWidth="7" strokeLinecap="round" />
            {/* Shoes */}
            <path d="M38 128 L32 132 L42 132 Z M53 128 L47 132 L57 132 Z" fill="#0f172a" />
          </g>
        )}

        {/* ========================================================= */}
        {/* VARIANT 4: STARGAZING — Looking up, holding telescope    */}
        {/* ========================================================= */}
        {characterVariant === 'stargazing' && (
          <g>
            {/* Head (Tilted way up) */}
            <circle cx="58" cy="58" r="10" fill="#fcd34d" />
            {/* Hair */}
            <path d="M48 58 Q48 48 58 48 Q68 48 68 58 Z" fill="#451a03" />
            
            {/* Telescope Tube */}
            <path d="M58 54 L95 25" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
            <path d="M58 54 L95 25" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
            {/* Telescope Lens Hood */}
            <path d="M90 28 L100 20 L102 24 L92 32 Z" fill="#1e293b" />
            
            {/* Body */}
            <path d="M50 68 Q58 65 66 68 L70 110 Q58 112 46 110 Z" fill="#0f766e" />
            
            {/* Arm holding telescope */}
            <path d="M55 75 Q75 75 80 40" stroke="#0f766e" strokeWidth="6" strokeLinecap="round" fill="none" />

            {/* Tripod Legs (Behind) */}
            <path d="M70 60 L60 132 M70 60 L85 132" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Legs */}
            <path d="M52 110 L52 130 M64 110 L64 130" stroke="#1e293b" strokeWidth="7" strokeLinecap="round" />
            {/* Shoes */}
            <path d="M50 128 L45 132 L55 132 Z M62 128 L68 132 L58 132 Z" fill="#0f172a" />
          </g>
        )}

        {/* ========================================================= */}
        {/* VARIANT 5: GOLDEN SUNSET — Relaxed silhouette viewing    */}
        {/* ========================================================= */}
        {characterVariant === 'golden_sunset' && (
          <g>
            {/* Warm Sunset Glow Rim Light on left side */}
            <path d="M48 58 Q48 48 58 48 Q68 48 68 58" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
            
            {/* Head */}
            <circle cx="58" cy="58" r="10" fill="#fcd34d" />
            {/* Hair */}
            <path d="M48 58 Q48 48 58 48 Q68 48 68 58 Z" fill="#451a03" />

            {/* Casual Shirt/Jacket */}
            <path d="M50 68 Q58 66 66 68 L72 110 Q58 112 44 110 Z" fill="#8b5cf6" />
            {/* Rim light on shoulder */}
            <path d="M50 68 L44 110" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" fill="none" />

            {/* Arms crossed or relaxed in pockets */}
            <path d="M52 75 Q60 85 68 75" stroke="#7c3aed" strokeWidth="6" strokeLinecap="round" fill="none" />

            {/* Legs */}
            <path d="M52 110 L50 132 M64 110 L66 132" stroke="#1e293b" strokeWidth="7" strokeLinecap="round" />
            {/* Shoes */}
            <path d="M48 130 L44 134 L54 134 Z M68 130 L72 134 L62 134 Z" fill="#0f172a" />
          </g>
        )}

        {/* ========================================================= */}
        {/* VARIANT 6: CLEAR NIGHT — Serene observer                 */}
        {/* ========================================================= */}
        {characterVariant === 'night_gazer' && (
          <g>
            {/* Head */}
            <circle cx="58" cy="58" r="10" fill="#fcd34d" />
            {/* Hair */}
            <path d="M48 58 Q48 48 58 48 Q68 48 68 58 Z" fill="#451a03" />
            
            {/* Cozy Fleece Pullover */}
            <path d="M48 68 Q58 66 68 68 L74 110 Q58 113 42 110 Z" fill="#0369a1" />
            {/* Fleece Texture hints */}
            <circle cx="58" cy="80" r="1" fill="#bae6fd" opacity="0.3" />
            <circle cx="52" cy="88" r="1.5" fill="#bae6fd" opacity="0.3" />
            <circle cx="64" cy="94" r="1" fill="#bae6fd" opacity="0.3" />

            {/* Holding hot cup */}
            <path d="M50 78 Q58 82 66 78" stroke="#0284c7" strokeWidth="6" strokeLinecap="round" fill="none" />
            <rect x="54" y="72" width="8" height="10" rx="1" fill="#e2e8f0" />
            {/* Steam from cup */}
            <path d="M56 68 Q54 62 58 58 M60 70 Q62 65 58 60" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeLinecap="round" fill="none" className="animate-pulse" />

            {/* Legs */}
            <path d="M50 110 L48 132 M66 110 L68 132" stroke="#1e293b" strokeWidth="7" strokeLinecap="round" />
            {/* Shoes */}
            <path d="M46 130 L42 134 L52 134 Z M70 130 L74 134 L64 134 Z" fill="#0f172a" />
          </g>
        )}

        {/* ========================================================= */}
        {/* VARIANT 7: SUNNY / DEFAULT — Active outdoors             */}
        {/* ========================================================= */}
        {characterVariant === 'sunny' && (
          <g>
            {/* Sun Hat */}
            <path d="M44 58 Q58 45 72 58 Z" fill="#fde047" />
            <path d="M38 58 Q58 55 78 58" stroke="#facc15" strokeWidth="3" strokeLinecap="round" fill="none" />
            
            {/* Head */}
            <circle cx="58" cy="62" r="9" fill="#fcd34d" />
            {/* Sunglasses */}
            <rect x="52" y="58" width="12" height="4" rx="1" fill="#1e293b" />

            {/* Light T-Shirt */}
            <path d="M50 71 Q58 70 66 71 L68 105 Q58 107 48 105 Z" fill="#4bc0c8" />
            {/* Short Sleeves */}
            <path d="M52 73 L42 82 M64 73 L74 82" stroke="#4bc0c8" strokeWidth="6" strokeLinecap="round" fill="none" />
            {/* Bare Arms */}
            <path d="M42 82 L44 95 M74 82 L72 95" stroke="#fcd34d" strokeWidth="4" strokeLinecap="round" fill="none" />

            {/* Shorts */}
            <path d="M48 105 L46 118 L55 118 L55 106 Z M68 105 L70 118 L61 118 L61 106 Z" fill="#475569" />

            {/* Bare Legs */}
            <path d="M50 118 L50 130 M66 118 L66 130" stroke="#fcd34d" strokeWidth="4" strokeLinecap="round" />

            {/* Sneakers */}
            <rect x="46" y="130" width="8" height="4" rx="2" fill="#f1f5f9" />
            <rect x="62" y="130" width="8" height="4" rx="2" fill="#f1f5f9" />
          </g>
        )}
      </svg>
    </div>
  );
};
