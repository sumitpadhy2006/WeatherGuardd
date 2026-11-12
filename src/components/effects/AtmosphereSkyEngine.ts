import { CurrentWeatherPayload, AmbientSimulationMode } from '../../types';

export interface SkyPalette {
  top: string;
  mid: string;
  bottom: string;
  horizon: string;
  sunGlow: string;
  cloudColor: string;
  cloudHighlight: string;
  cardBg: string;
  cardBorder: string;
  ambientMode: string;
  isNight: boolean;
  isSunriseSunset: boolean;
}

export type ComputedAtmosphereState =
  | 'clear_day'
  | 'partly_cloudy_day'
  | 'overcast_day'
  | 'light_rain'
  | 'heavy_rain'
  | 'thunderstorm'
  | 'snow'
  | 'fog'
  | 'sunrise'
  | 'golden_hour'
  | 'sunset'
  | 'dusk'
  | 'clear_night'
  | 'cloudy_night'
  | 'rainy_night'
  | 'aurora'
  | 'windy'
  | 'heavy_snow'
  | 'blizzard'
  | 'hail'
  | 'tornado'
  | 'sandstorm'
  | 'cyclone'
  | 'heatwave'
  | 'cold_wave'
  | 'frost'
  | 'meteor_shower';

/**
 * Calculates the solar time phase of the location based on timestamp and celestial ephemeris
 */
export function getSolarTimePhase(
  weather: CurrentWeatherPayload
): 'deep_night' | 'pre_dawn' | 'sunrise' | 'golden_hour' | 'day' | 'sunset' | 'dusk' | 'night' {
  const now = weather.timestamp ? weather.timestamp * 1000 : Date.now();
  const date = new Date(now);
  const hour = date.getHours() + date.getMinutes() / 60;

  const sunriseTs = weather.celestial?.sunrise ? weather.celestial.sunrise * 1000 : null;
  const sunsetTs = weather.celestial?.sunset ? weather.celestial.sunset * 1000 : null;

  if (sunriseTs && sunsetTs) {
    const sunriseDate = new Date(sunriseTs);
    const sunsetDate = new Date(sunsetTs);
    const sunriseHour = sunriseDate.getHours() + sunriseDate.getMinutes() / 60;
    const sunsetHour = sunsetDate.getHours() + sunsetDate.getMinutes() / 60;

    // Pre-dawn: 45 minutes before sunrise
    if (hour >= sunriseHour - 0.75 && hour < sunriseHour) {
      return 'pre_dawn';
    }
    // Sunrise: Sunrise to 40 minutes after
    if (hour >= sunriseHour && hour < sunriseHour + 0.65) {
      return 'sunrise';
    }
    // Morning Golden Hour: 40 mins to 2 hours after sunrise
    if (hour >= sunriseHour + 0.65 && hour < sunriseHour + 1.8) {
      return 'golden_hour';
    }
    // Evening Golden Hour / Sunset: 1 hour before sunset to sunset
    if (hour >= sunsetHour - 1.0 && hour < sunsetHour) {
      return 'golden_hour';
    }
    // Sunset: Sunset to 35 mins after
    if (hour >= sunsetHour && hour < sunsetHour + 0.6) {
      return 'sunset';
    }
    // Dusk / Twilight: 35 mins to 1.5 hours after sunset
    if (hour >= sunsetHour + 0.6 && hour < sunsetHour + 1.5) {
      return 'dusk';
    }
    // Day
    if (hour >= sunriseHour + 1.8 && hour < sunsetHour - 1.0) {
      return 'day';
    }
    // Deep Night
    if (hour < 4 || hour > 22) {
      return 'deep_night';
    }
    return 'night';
  }

  // Fallback if timestamps not available
  if (hour >= 5.5 && hour < 6.8) return 'sunrise';
  if (hour >= 6.8 && hour < 8.5) return 'golden_hour';
  if (hour >= 8.5 && hour < 17.0) return 'day';
  if (hour >= 17.0 && hour < 18.5) return 'golden_hour';
  if (hour >= 18.5 && hour < 19.8) return 'sunset';
  if (hour >= 19.8 && hour < 21.0) return 'dusk';
  if (hour < 4.5 || hour >= 22.5) return 'deep_night';
  return 'night';
}

/**
 * Computes exact atmospheric visual state
 */
export function computeAtmosphereState(
  weather: CurrentWeatherPayload | null | undefined,
  manualMode?: AmbientSimulationMode | string | null
): ComputedAtmosphereState {
  if (manualMode && manualMode !== 'auto') {
    switch (manualMode) {
      case 'clear_day':
        return 'clear_day';
      case 'golden_hour':
        return 'golden_hour';
      case 'sunset':
        return 'sunset';
      case 'rain':
        return 'light_rain';
      case 'thunderstorm':
        return 'thunderstorm';
      case 'snow':
        return 'snow';
      case 'fog':
        return 'fog';
      case 'aurora':
        return 'aurora';
      case 'deep_night':
        return 'clear_night';
      case 'windy':
      case 'heavy_snow':
      case 'blizzard':
      case 'hail':
      case 'tornado':
      case 'sandstorm':
      case 'cyclone':
      case 'heatwave':
      case 'cold_wave':
      case 'frost':
      case 'meteor_shower':
        return manualMode as ComputedAtmosphereState;
    }
  }

  if (!weather) return 'clear_day';

  const cond = weather.condition.main.toLowerCase();
  const desc = weather.condition.description.toLowerCase();
  const isDay = weather.isDay;
  const cloudCover = weather.cloudCoverPercent || 0;
  const solarPhase = getSolarTimePhase(weather);

  // Storm conditions
  if (cond.includes('thunder') || desc.includes('storm') || desc.includes('squall')) {
    return 'thunderstorm';
  }

  // Rain conditions
  if (cond.includes('rain') || cond.includes('drizzle') || desc.includes('shower')) {
    if (!isDay) return 'rainy_night';
    if (desc.includes('heavy') || desc.includes('torrential') || (weather.minutelyRain && weather.minutelyRain.some(r => r.intensityMm > 2.5))) {
      return 'heavy_rain';
    }
    return 'light_rain';
  }

  // Snow conditions
  if (cond.includes('snow') || cond.includes('sleet') || desc.includes('ice') || desc.includes('blizzard') || desc.includes('flurries')) {
    return 'snow';
  }

  // Fog and Mist
  if (cond.includes('fog') || cond.includes('mist') || cond.includes('haze') || cond.includes('smoke') || cond.includes('dust') || weather.visibilityKm < 3.0) {
    return 'fog';
  }

  // High latitude Aurora condition at night
  if (!isDay && Math.abs(weather.location.lat) > 55 && cloudCover < 50) {
    return 'aurora';
  }

  // Solar phase transitions
  if (solarPhase === 'sunrise' || solarPhase === 'pre_dawn') {
    return 'sunrise';
  }
  if (solarPhase === 'golden_hour') {
    return 'golden_hour';
  }
  if (solarPhase === 'sunset') {
    return 'sunset';
  }
  if (solarPhase === 'dusk') {
    return 'dusk';
  }

  // Day states
  if (isDay) {
    if (cloudCover >= 80) return 'overcast_day';
    if (cloudCover >= 30) return 'partly_cloudy_day';
    return 'clear_day';
  }

  // Night states
  if (cloudCover >= 65) return 'cloudy_night';
  return 'clear_night';
}

/**
 * Returns dynamic color palette for the atmospheric sky and glass layers
 */
export function getSkyPalette(state: ComputedAtmosphereState): SkyPalette {
  switch (state) {
    case 'clear_day':
      return {
        top: '#0d47a1', // Deep azure blue
        mid: '#1976d2', // Vibrant sky blue
        bottom: '#42a5f5', // Radiant light blue
        horizon: '#90caf9',
        sunGlow: 'rgba(255, 235, 59, 0.4)',
        cloudColor: 'rgba(255, 255, 255, 0.45)',
        cloudHighlight: 'rgba(255, 255, 255, 0.7)',
        cardBg: 'rgba(15, 23, 42, 0.65)',
        cardBorder: 'rgba(255, 255, 255, 0.15)',
        ambientMode: 'clear_day',
        isNight: false,
        isSunriseSunset: false,
      };

    case 'partly_cloudy_day':
      return {
        top: '#1565c0',
        mid: '#1e88e5',
        bottom: '#64b5f6',
        horizon: '#bbdefb',
        sunGlow: 'rgba(255, 245, 157, 0.35)',
        cloudColor: 'rgba(240, 248, 255, 0.6)',
        cloudHighlight: 'rgba(255, 255, 255, 0.85)',
        cardBg: 'rgba(15, 23, 42, 0.68)',
        cardBorder: 'rgba(255, 255, 255, 0.16)',
        ambientMode: 'partly_cloudy',
        isNight: false,
        isSunriseSunset: false,
      };

    case 'overcast_day':
      return {
        top: '#263238', // Slate grey
        mid: '#37474f',
        bottom: '#546e7a',
        horizon: '#78909c',
        sunGlow: 'rgba(255, 255, 255, 0.1)',
        cloudColor: 'rgba(176, 190, 197, 0.75)',
        cloudHighlight: 'rgba(207, 216, 220, 0.5)',
        cardBg: 'rgba(15, 23, 42, 0.72)',
        cardBorder: 'rgba(255, 255, 255, 0.12)',
        ambientMode: 'overcast',
        isNight: false,
        isSunriseSunset: false,
      };

    case 'light_rain':
      return {
        top: '#1a2634',
        mid: '#283848',
        bottom: '#3b4d61',
        horizon: '#566b82',
        sunGlow: 'rgba(186, 230, 253, 0.15)',
        cloudColor: 'rgba(100, 116, 139, 0.7)',
        cloudHighlight: 'rgba(148, 163, 184, 0.5)',
        cardBg: 'rgba(10, 18, 30, 0.75)',
        cardBorder: 'rgba(186, 230, 253, 0.15)',
        ambientMode: 'rain',
        isNight: false,
        isSunriseSunset: false,
      };

    case 'heavy_rain':
      return {
        top: '#0f1724',
        mid: '#172233',
        bottom: '#223044',
        horizon: '#34455c',
        sunGlow: 'rgba(186, 230, 253, 0.1)',
        cloudColor: 'rgba(71, 85, 105, 0.85)',
        cloudHighlight: 'rgba(100, 116, 139, 0.6)',
        cardBg: 'rgba(8, 14, 24, 0.8)',
        cardBorder: 'rgba(186, 230, 253, 0.18)',
        ambientMode: 'rain',
        isNight: false,
        isSunriseSunset: false,
      };

    case 'thunderstorm':
      return {
        top: '#090d16',
        mid: '#101726',
        bottom: '#181e30',
        horizon: '#242a3d',
        sunGlow: 'rgba(216, 180, 254, 0.25)',
        cloudColor: 'rgba(51, 65, 85, 0.9)',
        cloudHighlight: 'rgba(99, 102, 241, 0.3)',
        cardBg: 'rgba(6, 10, 18, 0.82)',
        cardBorder: 'rgba(192, 132, 252, 0.22)',
        ambientMode: 'thunderstorm',
        isNight: true,
        isSunriseSunset: false,
      };

    case 'snow':
      return {
        top: '#1e293b',
        mid: '#334155',
        bottom: '#475569',
        horizon: '#94a3b8',
        sunGlow: 'rgba(224, 242, 254, 0.3)',
        cloudColor: 'rgba(226, 232, 240, 0.65)',
        cloudHighlight: 'rgba(255, 255, 255, 0.9)',
        cardBg: 'rgba(15, 23, 42, 0.7)',
        cardBorder: 'rgba(224, 242, 254, 0.2)',
        ambientMode: 'snow',
        isNight: false,
        isSunriseSunset: false,
      };

    case 'fog':
      return {
        top: '#1e293b',
        mid: '#334155',
        bottom: '#475569',
        horizon: '#64748b',
        sunGlow: 'rgba(255, 255, 255, 0.15)',
        cloudColor: 'rgba(148, 163, 184, 0.6)',
        cloudHighlight: 'rgba(203, 213, 225, 0.4)',
        cardBg: 'rgba(15, 23, 42, 0.72)',
        cardBorder: 'rgba(255, 255, 255, 0.12)',
        ambientMode: 'fog',
        isNight: false,
        isSunriseSunset: false,
      };

    case 'sunrise':
      return {
        top: '#1e1b4b', // Deep indigo
        mid: '#581c87', // Purple/Violet
        bottom: '#9f1239', // Rose/Crimson
        horizon: '#ea580c', // Radiant orange gold
        sunGlow: 'rgba(251, 146, 60, 0.6)',
        cloudColor: 'rgba(244, 114, 182, 0.5)',
        cloudHighlight: 'rgba(253, 186, 116, 0.8)',
        cardBg: 'rgba(15, 12, 28, 0.7)',
        cardBorder: 'rgba(251, 146, 60, 0.25)',
        ambientMode: 'sunrise',
        isNight: false,
        isSunriseSunset: true,
      };

    case 'golden_hour':
      return {
        top: '#1e3a5f',
        mid: '#b45309', // Warm amber
        bottom: '#d97706', // Radiant gold
        horizon: '#fbbf24',
        sunGlow: 'rgba(252, 211, 77, 0.55)',
        cloudColor: 'rgba(253, 186, 116, 0.55)',
        cloudHighlight: 'rgba(254, 240, 138, 0.85)',
        cardBg: 'rgba(26, 18, 11, 0.68)',
        cardBorder: 'rgba(245, 158, 11, 0.25)',
        ambientMode: 'golden_hour',
        isNight: false,
        isSunriseSunset: true,
      };

    case 'sunset':
      return {
        top: '#180e29', // Deep twilight purple
        mid: '#581c87', // Rich violet
        bottom: '#9d174d', // Coral pink
        horizon: '#ea580c', // Burning orange
        sunGlow: 'rgba(249, 115, 22, 0.65)',
        cloudColor: 'rgba(244, 114, 182, 0.5)',
        cloudHighlight: 'rgba(251, 146, 60, 0.8)',
        cardBg: 'rgba(20, 10, 25, 0.72)',
        cardBorder: 'rgba(244, 114, 182, 0.25)',
        ambientMode: 'sunset',
        isNight: false,
        isSunriseSunset: true,
      };

    case 'dusk':
      return {
        top: '#090a18',
        mid: '#14142b',
        bottom: '#251b3a',
        horizon: '#44234a',
        sunGlow: 'rgba(244, 114, 182, 0.25)',
        cloudColor: 'rgba(100, 70, 110, 0.5)',
        cloudHighlight: 'rgba(168, 85, 247, 0.4)',
        cardBg: 'rgba(12, 10, 20, 0.75)',
        cardBorder: 'rgba(168, 85, 247, 0.2)',
        ambientMode: 'dusk',
        isNight: true,
        isSunriseSunset: true,
      };

    case 'clear_night':
      return {
        top: '#030712', // Midnight abyss
        mid: '#0b132b', // Deep indigo navy
        bottom: '#1c2541', // Dark celestial blue
        horizon: '#24324f',
        sunGlow: 'rgba(199, 210, 254, 0.3)', // Moon glow
        cloudColor: 'rgba(30, 41, 59, 0.4)',
        cloudHighlight: 'rgba(51, 65, 85, 0.3)',
        cardBg: 'rgba(8, 13, 24, 0.75)',
        cardBorder: 'rgba(255, 255, 255, 0.12)',
        ambientMode: 'deep_night',
        isNight: true,
        isSunriseSunset: false,
      };

    case 'cloudy_night':
      return {
        top: '#05070f',
        mid: '#0c101a',
        bottom: '#141a29',
        horizon: '#1e2436',
        sunGlow: 'rgba(199, 210, 254, 0.15)',
        cloudColor: 'rgba(25, 32, 48, 0.8)',
        cloudHighlight: 'rgba(40, 50, 70, 0.5)',
        cardBg: 'rgba(7, 10, 18, 0.78)',
        cardBorder: 'rgba(255, 255, 255, 0.1)',
        ambientMode: 'cloudy_night',
        isNight: true,
        isSunriseSunset: false,
      };

    case 'rainy_night':
      return {
        top: '#04070d',
        mid: '#0a1017',
        bottom: '#101822',
        horizon: '#182433',
        sunGlow: 'rgba(186, 230, 253, 0.12)',
        cloudColor: 'rgba(20, 30, 42, 0.85)',
        cloudHighlight: 'rgba(35, 50, 70, 0.4)',
        cardBg: 'rgba(6, 10, 16, 0.82)',
        cardBorder: 'rgba(186, 230, 253, 0.15)',
        ambientMode: 'rainy_night',
        isNight: true,
        isSunriseSunset: false,
      };

    case 'aurora':
      return {
        top: '#020d0f',
        mid: '#041d1a',
        bottom: '#082f28',
        horizon: '#0d3d33',
        sunGlow: 'rgba(52, 211, 153, 0.4)',
        cloudColor: 'rgba(15, 45, 40, 0.5)',
        cloudHighlight: 'rgba(52, 211, 153, 0.3)',
        cardBg: 'rgba(4, 14, 14, 0.78)',
        cardBorder: 'rgba(52, 211, 153, 0.25)',
        ambientMode: 'aurora',
        isNight: true,
        isSunriseSunset: false,
      };

    case 'windy':
      return {
        ...getSkyPalette('partly_cloudy_day'),
        ambientMode: 'windy'
      };
    case 'heavy_snow':
    case 'blizzard':
      return {
        top: '#cbd5e1',
        mid: '#e2e8f0',
        bottom: '#f8fafc',
        horizon: '#ffffff',
        sunGlow: 'rgba(255, 255, 255, 0.2)',
        cloudColor: 'rgba(255, 255, 255, 0.9)',
        cloudHighlight: '#ffffff',
        cardBg: 'rgba(15, 23, 42, 0.65)',
        cardBorder: 'rgba(255, 255, 255, 0.15)',
        ambientMode: state,
        isNight: false,
        isSunriseSunset: false,
      };
    case 'hail':
      return {
        ...getSkyPalette('thunderstorm'),
        ambientMode: 'hail'
      };
    case 'tornado':
    case 'cyclone':
      return {
        top: '#020617', // Pitch black top
        mid: '#0f172a', // Very dark slate
        bottom: '#1e293b',
        horizon: '#334155',
        sunGlow: 'rgba(0, 0, 0, 0)',
        cloudColor: 'rgba(15, 23, 42, 0.9)',
        cloudHighlight: '#1e293b',
        cardBg: 'rgba(15, 23, 42, 0.65)',
        cardBorder: 'rgba(255, 255, 255, 0.15)',
        ambientMode: state,
        isNight: true,
        isSunriseSunset: false,
      };
    case 'sandstorm':
      return {
        top: '#78350f', // Dark amber/brown
        mid: '#b45309', // Rust
        bottom: '#d97706',
        horizon: '#f59e0b',
        sunGlow: 'rgba(251, 191, 36, 0.4)',
        cloudColor: 'rgba(180, 83, 9, 0.9)',
        cloudHighlight: '#d97706',
        cardBg: 'rgba(15, 23, 42, 0.65)',
        cardBorder: 'rgba(255, 255, 255, 0.15)',
        ambientMode: 'sandstorm',
        isNight: false,
        isSunriseSunset: false,
      };
    case 'heatwave':
      return {
        top: '#ff8a65',
        mid: '#ffb74d',
        bottom: '#ffd54f',
        horizon: '#fff176',
        sunGlow: 'rgba(255, 152, 0, 0.6)',
        cloudColor: 'rgba(255, 255, 255, 0.2)',
        cloudHighlight: '#ffffff',
        cardBg: 'rgba(15, 23, 42, 0.65)',
        cardBorder: 'rgba(255, 255, 255, 0.15)',
        ambientMode: 'heatwave',
        isNight: false,
        isSunriseSunset: false,
      };
    case 'cold_wave':
    case 'frost':
      return {
        top: '#0284c7',
        mid: '#38bdf8',
        bottom: '#7dd3fc',
        horizon: '#bae6fd',
        sunGlow: 'rgba(255, 255, 255, 0.5)',
        cloudColor: 'rgba(255, 255, 255, 0.4)',
        cloudHighlight: '#ffffff',
        cardBg: 'rgba(15, 23, 42, 0.65)',
        cardBorder: 'rgba(255, 255, 255, 0.15)',
        ambientMode: state,
        isNight: false,
        isSunriseSunset: false,
      };
    case 'meteor_shower':
      return {
        ...getSkyPalette('clear_night'),
        ambientMode: 'meteor_shower'
      };
    default:
      return getSkyPalette('clear_day');
  }
}
