import { PNG } from 'pngjs';

// Web Mercator tile bounding box helper
export function tileToLatLonBounds(x: number, y: number, z: number) {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
  const n2 = Math.PI - (2 * Math.PI * (y + 1)) / Math.pow(2, z);
  
  const minLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n2) - Math.exp(-n2)));
  const maxLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  const minLon = (x / Math.pow(2, z)) * 360 - 180;
  const maxLon = ((x + 1) / Math.pow(2, z)) * 360 - 180;

  return { minLat, maxLat, minLon, maxLon };
}

// Helper to convert hex / rgba string to [r, g, b, a (0-255)]
function parseColor(colorStr: string): [number, number, number, number] {
  if (colorStr.startsWith('#')) {
    let hex = colorStr.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const num = parseInt(hex, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255, 230];
  }
  if (colorStr.startsWith('rgba')) {
    const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
      const a = match[4] !== undefined ? Math.round(parseFloat(match[4]) * 255) : 255;
      return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10), a];
    }
  }
  return [56, 189, 248, 200];
}

// Color gradient interpolator with smooth cubic hermite transitions
export interface ColorStop {
  val: number;
  r: number;
  g: number;
  b: number;
  a: number;
}

export function buildColorScale(stops: { value: number; color: string }[]): ColorStop[] {
  return stops.map(s => {
    const [r, g, b, a] = parseColor(s.color);
    return { val: s.value, r, g, b, a };
  }).sort((a, b) => a.val - b.val);
}

// Map value to RGBA using color scale
export function interpolateColor(val: number, scale: ColorStop[]): [number, number, number, number] {
  if (scale.length === 0) return [0, 0, 0, 0];
  if (val <= scale[0].val) {
    const first = scale[0];
    return [first.r, first.g, first.b, first.a];
  }
  if (val >= scale[scale.length - 1].val) {
    const last = scale[scale.length - 1];
    return [last.r, last.g, last.b, last.a];
  }

  for (let i = 0; i < scale.length - 1; i++) {
    const s0 = scale[i];
    const s1 = scale[i + 1];
    if (val >= s0.val && val <= s1.val) {
      const t = (val - s0.val) / (s1.val - s0.val);
      // Smooth step interpolation
      const smoothT = t * t * (3 - 2 * t);
      const r = Math.round(s0.r + (s1.r - s0.r) * smoothT);
      const g = Math.round(s0.g + (s1.g - s0.g) * smoothT);
      const b = Math.round(s0.b + (s1.b - s0.b) * smoothT);
      const a = Math.round(s0.a + (s1.a - s0.a) * smoothT);
      return [r, g, b, a];
    }
  }
  return [0, 0, 0, 0];
}

// Procedural multi-scale noise for atmospheric simulation
function pseudoNoise(x: number, y: number, seed: number = 42): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
  return n - Math.floor(n);
}

function smoothAtmosphericField(lat: number, lon: number, timeHour: number, scale: number = 1.0): number {
  const radLat = (lat * Math.PI) / 180;
  const radLon = (lon * Math.PI) / 180;
  
  // Wave components simulating planetary Rossby waves and synoptic storm systems
  const wave1 = Math.sin(radLon * 4 + timeHour * 0.05) * Math.cos(radLat * 2);
  const wave2 = Math.sin(radLon * 8 - timeHour * 0.08 + lat * 0.1) * Math.cos(radLat * 4);
  const wave3 = Math.sin((lon + lat) * 0.15 + timeHour * 0.1) * 0.5;
  const vortex1 = Math.sin(Math.hypot(lat - 35, lon - 140) * 0.2 - timeHour * 0.1);
  const vortex2 = Math.sin(Math.hypot(lat - 20, lon - 75) * 0.25 + timeHour * 0.08);
  const vortex3 = Math.sin(Math.hypot(lat - 45, lon - (-30)) * 0.18 + timeHour * 0.06);

  return (wave1 * 0.4 + wave2 * 0.25 + wave3 * 0.15 + vortex1 * 0.1 + vortex2 * 0.1 + vortex3 * 0.1) * scale;
}

// Atmospheric parameter synthesizers
export function evaluateLayerValue(
  layerId: string,
  lat: number,
  lon: number,
  offsetHours: number = 0
): number {
  const time = (Date.now() / (1000 * 3600)) + offsetHours;
  const hourOfDay = (time + lon / 15) % 24;
  const solarZenith = Math.max(0, Math.sin(((hourOfDay - 6) * Math.PI) / 12)) * Math.max(0, Math.cos((lat * Math.PI) / 180));
  const synoptic = smoothAtmosphericField(lat, lon, time, 1.0);
  const microField = Math.sin(lat * 0.4 + lon * 0.3 + time * 0.05) * 0.5;

  switch (layerId) {
    // ------------------- TEMPERATURE & THERMAL -------------------
    case 'temp':
    case 'temp_max_daily':
    case 'temp_min_daily': {
      const latTemp = 30 * Math.cos((lat * Math.PI) / 180) - (lat < 0 ? 5 : 0);
      const diurnal = (solarZenith - 0.3) * 10;
      const front = synoptic * 8;
      const isMax = layerId === 'temp_max_daily';
      const isMin = layerId === 'temp_min_daily';
      return latTemp + diurnal + front + (isMax ? 6 : isMin ? -6 : 0);
    }
    case 'feels_like': {
      const baseTemp = evaluateLayerValue('temp', lat, lon, offsetHours);
      const humidityFactor = Math.sin(lat * 0.2 + lon * 0.2) * 3;
      return baseTemp + humidityFactor;
    }
    case 'dew_point': {
      const baseTemp = evaluateLayerValue('temp', lat, lon, offsetHours);
      return baseTemp - Math.max(2, (1 - solarZenith) * 8 + Math.abs(synoptic * 5));
    }
    case 'freezing_level': {
      const t = evaluateLayerValue('temp', lat, lon, offsetHours);
      return Math.max(0, Math.round(t * 150 + synoptic * 500));
    }

    // ------------------- PRECIPITATION & STORMS -------------------
    case 'rain_precip':
    case 'precipitation_new': {
      const moistBand = Math.sin(lat * 0.3 + lon * 0.2 + synoptic * 3);
      if (moistBand > 0.45) {
        const intensity = (moistBand - 0.45) * 35 * (1 + synoptic);
        return Math.max(0.1, intensity);
      }
      return 0;
    }
    case 'rain_thunder':
    case 'lightning':
    case 'convective_storms': {
      const stormScore = synoptic + (solarZenith * 0.8) + (Math.sin(lat * 0.5 + lon * 0.4) * 0.5);
      if (stormScore > 0.6) {
        return 20 + (stormScore - 0.6) * 65; // dBZ
      }
      return 0;
    }
    case 'snow_accum': {
      const t = evaluateLayerValue('temp', lat, lon, offsetHours);
      const precip = evaluateLayerValue('rain_precip', lat, lon, offsetHours);
      if (t <= 2 && precip > 0.5) {
        return precip * 1.8;
      }
      return 0;
    }
    case 'rain_accum_24h': {
      const p = evaluateLayerValue('rain_precip', lat, lon, offsetHours);
      return p > 0 ? p * 12 + Math.abs(synoptic * 20) : 0;
    }
    case 'extreme_rain_risk': {
      const p = evaluateLayerValue('rain_precip', lat, lon, offsetHours);
      return Math.min(100, p > 5 ? p * 2.5 + 20 : p * 4);
    }
    case 'drought_index': {
      const latBand = Math.abs(lat);
      const isArid = (latBand >= 15 && latBand <= 35) && (Math.sin(lon * 0.2) > 0);
      return isArid ? 2.5 + synoptic : -0.5 + synoptic;
    }

    // ------------------- CLOUDS & ATMOSPHERE -------------------
    case 'clouds':
    case 'satellite_visible':
    case 'satellite_ir': {
      const cloudDeck = (synoptic * 50 + 50) + Math.sin(lat * 0.6 + lon * 0.5) * 25;
      return Math.min(100, Math.max(0, cloudDeck));
    }
    case 'cloud_tops': {
      const cloud = evaluateLayerValue('clouds', lat, lon, offsetHours);
      return cloud > 40 ? Math.round((cloud / 100) * 14000 + synoptic * 2000) : 0;
    }
    case 'fog_boundary': {
      const dewGap = Math.abs(evaluateLayerValue('temp', lat, lon, offsetHours) - evaluateLayerValue('dew_point', lat, lon, offsetHours));
      return Math.max(0, Math.min(100, (1 - dewGap / 6) * 100));
    }
    case 'cape_stability': {
      const t = evaluateLayerValue('temp', lat, lon, offsetHours);
      if (t > 18) {
        const cape = (t - 18) * 120 * (1 + solarZenith) + synoptic * 800;
        return Math.max(0, Math.min(4500, cape));
      }
      return 50;
    }

    // ------------------- WIND DYNAMICS -------------------
    case 'wind':
    case 'wind_new':
    case 'wind_gusts': {
      const jet = Math.sin(Math.abs(lat) * 0.08) * 30;
      const synSpeed = Math.abs(synoptic) * 45;
      const isGust = layerId === 'wind_gusts';
      return Math.min(180, Math.max(5, 12 + jet + synSpeed + (isGust ? 22 : 0)));
    }
    case 'winds_aloft': {
      const surface = evaluateLayerValue('wind', lat, lon, offsetHours);
      return surface * 2.2 + 25;
    }
    case 'wind_convergence': {
      return synoptic * 18;
    }

    // ------------------- PRESSURE & ISOBARS -------------------
    case 'pressure_mslp':
    case 'pressure_new': {
      const baseMslp = 1013.25;
      const latBelt = Math.sin((lat * Math.PI) / 45) * 8;
      const stormDepression = synoptic * 22;
      return Math.round((baseMslp + latBelt + stormDepression) * 10) / 10;
    }
    case 'pressure_300hpa': {
      return Math.round(9200 + synoptic * 400 + Math.cos((lat * Math.PI) / 180) * 600);
    }

    // ------------------- MARINE & OCEAN -------------------
    case 'significant_waves': {
      const isOcean = Math.abs(lat) < 75;
      const windSpd = evaluateLayerValue('wind', lat, lon, offsetHours);
      return isOcean ? Math.min(14, Math.max(0.4, (windSpd / 18) * 2.2 + Math.abs(synoptic * 2))) : 0;
    }
    case 'swell_period': {
      const waves = evaluateLayerValue('significant_waves', lat, lon, offsetHours);
      return waves > 1 ? Math.min(22, 6 + waves * 1.2) : 4;
    }
    case 'sea_surface_temp': {
      const latTemp = 28 * Math.cos((lat * Math.PI) / 180) - (lat < 0 ? 2 : 0);
      return Math.max(-2, Math.min(32, latTemp + synoptic * 2));
    }
    case 'ocean_currents': {
      return Math.min(2.5, Math.max(0.1, 0.4 + Math.abs(synoptic) * 1.2));
    }

    // ------------------- AIR QUALITY & AEROSOLS -------------------
    case 'aqi_index': {
      const urbanDesertFactor = (Math.abs(Math.sin(lat * 0.8 + lon * 0.5)) * 140) + (Math.abs(synoptic) * 40);
      return Math.min(450, Math.max(15, Math.round(25 + urbanDesertFactor)));
    }
    case 'pm25': {
      const aqi = evaluateLayerValue('aqi_index', lat, lon, offsetHours);
      return Math.round(aqi * 0.45 * 10) / 10;
    }
    case 'pm10': {
      const aqi = evaluateLayerValue('aqi_index', lat, lon, offsetHours);
      return Math.round(aqi * 0.75 * 10) / 10;
    }
    case 'ozone_o3': {
      return Math.min(240, Math.max(20, Math.round(35 + solarZenith * 95 + synoptic * 30)));
    }
    case 'dust_mass': {
      const isSaharaThar = (lat >= 10 && lat <= 35 && lon >= -20 && lon <= 85);
      return isSaharaThar ? Math.min(1200, 200 + Math.abs(synoptic) * 700) : Math.max(0, synoptic * 40);
    }

    // ------------------- HAZARDS & EXTREMES -------------------
    case 'fire_danger_index': {
      const t = evaluateLayerValue('temp', lat, lon, offsetHours);
      const w = evaluateLayerValue('wind', lat, lon, offsetHours);
      const p = evaluateLayerValue('rain_precip', lat, lon, offsetHours);
      if (p > 1.0) return 10;
      const fwi = Math.max(0, (t / 35) * 40 + (w / 60) * 40 - (p * 20));
      return Math.min(100, Math.round(fwi));
    }
    case 'thermal_anomalies': {
      const fwi = evaluateLayerValue('fire_danger_index', lat, lon, offsetHours);
      return fwi > 60 ? Math.round((fwi - 60) * 12 + 100) : 0;
    }
    case 'uv_index': {
      return Math.min(14, Math.max(0, Math.round(solarZenith * 11.5 + (lat < 20 && lat > -20 ? 1.5 : 0))));
    }
    case 'solar_radiation': {
      return Math.max(0, Math.round(solarZenith * 980 * (1 - (evaluateLayerValue('clouds', lat, lon, offsetHours) / 150))));
    }

    // ------------------- AVIATION -------------------
    case 'turbulence_risk': {
      const jet = Math.sin(Math.abs(lat) * 0.08);
      return Math.min(1.0, Math.max(0, Math.abs(synoptic * 0.6) + (jet > 0.7 ? 0.35 : 0)));
    }
    case 'icing_index': {
      const t = evaluateLayerValue('temp', lat, lon, offsetHours);
      const c = evaluateLayerValue('clouds', lat, lon, offsetHours);
      if (t >= -15 && t <= 2 && c > 50) {
        return Math.min(100, Math.round((c / 100) * 80 + Math.abs(synoptic) * 20));
      }
      return 0;
    }

    default:
      return 50 + synoptic * 30;
  }
}

// Preset color palettes for high-definition layer raster rendering
export const LAYER_COLOR_MAPS: Record<string, { value: number; color: string }[]> = {
  // Temperature
  temp: [
    { value: -40, color: '#6366f1' },
    { value: -20, color: '#38bdf8' },
    { value: -5, color: '#06b6d4' },
    { value: 0, color: '#22d3ee' },
    { value: 10, color: '#4ade80' },
    { value: 20, color: '#facc15' },
    { value: 30, color: '#fb923c' },
    { value: 40, color: '#ef4444' },
    { value: 50, color: '#a855f7' },
  ],
  temp_max_daily: [
    { value: 0, color: '#38bdf8' },
    { value: 20, color: '#facc15' },
    { value: 35, color: '#ea580c' },
    { value: 45, color: '#dc2626' },
  ],
  temp_min_daily: [
    { value: -30, color: '#4338ca' },
    { value: -10, color: '#0284c7' },
    { value: 10, color: '#16a34a' },
    { value: 25, color: '#d97706' },
  ],
  feels_like: [
    { value: -20, color: '#38bdf8' },
    { value: 0, color: '#22d3ee' },
    { value: 20, color: '#facc15' },
    { value: 35, color: '#ea580c' },
    { value: 45, color: '#dc2626' },
  ],
  dew_point: [
    { value: -10, color: '#67e8f9' },
    { value: 5, color: '#4ade80' },
    { value: 16, color: '#facc15' },
    { value: 24, color: '#ea580c' },
  ],
  freezing_level: [
    { value: 0, color: '#93c5fd' },
    { value: 1500, color: '#3b82f6' },
    { value: 3000, color: '#10b981' },
    { value: 4500, color: '#f59e0b' },
    { value: 6000, color: '#ef4444' },
  ],

  // Rain / Precip
  rain_precip: [
    { value: 0.0, color: 'rgba(0, 0, 0, 0)' },
    { value: 0.1, color: 'rgba(56, 189, 248, 0.5)' },
    { value: 1.0, color: '#0284c7' },
    { value: 4.0, color: '#16a34a' },
    { value: 10.0, color: '#eab308' },
    { value: 25.0, color: '#ea580c' },
    { value: 50.0, color: '#dc2626' },
    { value: 100.0, color: '#9333ea' },
  ],
  rain_thunder: [
    { value: 0, color: 'rgba(0, 0, 0, 0)' },
    { value: 20, color: '#60a5fa' },
    { value: 35, color: '#22c55e' },
    { value: 45, color: '#eab308' },
    { value: 55, color: '#ef4444' },
    { value: 65, color: '#ec4899' },
  ],
  snow_accum: [
    { value: 0, color: 'rgba(0, 0, 0, 0)' },
    { value: 0.5, color: '#c7d2fe' },
    { value: 2.0, color: '#818cf8' },
    { value: 10.0, color: '#6366f1' },
    { value: 30.0, color: '#d946ef' },
  ],
  rain_accum_24h: [
    { value: 0, color: 'rgba(0, 0, 0, 0)' },
    { value: 2, color: '#38bdf8' },
    { value: 15, color: '#16a34a' },
    { value: 50, color: '#eab308' },
    { value: 100, color: '#dc2626' },
  ],
  extreme_rain_risk: [
    { value: 0, color: 'rgba(0, 0, 0, 0)' },
    { value: 20, color: '#22c55e' },
    { value: 50, color: '#f59e0b' },
    { value: 80, color: '#ef4444' },
  ],
  drought_index: [
    { value: -3, color: '#0284c7' },
    { value: -1, color: '#38bdf8' },
    { value: 0, color: 'rgba(255, 255, 255, 0)' },
    { value: 1, color: '#facc15' },
    { value: 3, color: '#dc2626' },
  ],

  // Clouds
  clouds: [
    { value: 0, color: 'rgba(255, 255, 255, 0)' },
    { value: 20, color: 'rgba(255, 255, 255, 0.25)' },
    { value: 50, color: 'rgba(255, 255, 255, 0.55)' },
    { value: 80, color: 'rgba(255, 255, 255, 0.82)' },
    { value: 100, color: 'rgba(255, 255, 255, 0.96)' },
  ],
  satellite_visible: [
    { value: 0, color: 'rgba(0, 0, 0, 0)' },
    { value: 30, color: 'rgba(200, 220, 240, 0.4)' },
    { value: 70, color: 'rgba(240, 245, 255, 0.75)' },
    { value: 100, color: 'rgba(255, 255, 255, 0.95)' },
  ],
  satellite_ir: [
    { value: 0, color: 'rgba(0, 0, 0, 0)' },
    { value: 30, color: '#0284c7' },
    { value: 60, color: '#16a34a' },
    { value: 85, color: '#eab308' },
    { value: 100, color: '#dc2626' },
  ],
  cloud_tops: [
    { value: 0, color: 'rgba(0, 0, 0, 0)' },
    { value: 2000, color: '#93c5fd' },
    { value: 6000, color: '#3b82f6' },
    { value: 10000, color: '#eab308' },
    { value: 14000, color: '#dc2626' },
  ],
  fog_boundary: [
    { value: 0, color: 'rgba(0, 0, 0, 0)' },
    { value: 40, color: 'rgba(203, 213, 225, 0.4)' },
    { value: 80, color: 'rgba(226, 232, 240, 0.85)' },
  ],
  cape_stability: [
    { value: 0, color: 'rgba(0, 0, 0, 0)' },
    { value: 500, color: '#60a5fa' },
    { value: 1500, color: '#22c55e' },
    { value: 2500, color: '#eab308' },
    { value: 3500, color: '#ef4444' },
    { value: 4500, color: '#ec4899' },
  ],

  // Wind
  wind: [
    { value: 0, color: 'rgba(0, 0, 0, 0)' },
    { value: 10, color: 'rgba(56, 189, 248, 0.4)' },
    { value: 25, color: '#0284c7' },
    { value: 45, color: '#16a34a' },
    { value: 65, color: '#eab308' },
    { value: 90, color: '#ea580c' },
    { value: 120, color: '#dc2626' },
  ],
  wind_gusts: [
    { value: 0, color: 'rgba(0, 0, 0, 0)' },
    { value: 25, color: '#38bdf8' },
    { value: 50, color: '#eab308' },
    { value: 80, color: '#ea580c' },
    { value: 120, color: '#dc2626' },
    { value: 160, color: '#9333ea' },
  ],
  winds_aloft: [
    { value: 20, color: '#38bdf8' },
    { value: 60, color: '#22c55e' },
    { value: 100, color: '#eab308' },
    { value: 160, color: '#dc2626' },
  ],
  wind_convergence: [
    { value: -10, color: '#3b82f6' },
    { value: 0, color: 'rgba(0, 0, 0, 0)' },
    { value: 10, color: '#ef4444' },
  ],

  // Pressure
  pressure_mslp: [
    { value: 970, color: '#9333ea' },
    { value: 990, color: '#3b82f6' },
    { value: 1005, color: '#06b6d4' },
    { value: 1013, color: '#22c55e' },
    { value: 1025, color: '#facc15' },
    { value: 1040, color: '#ef4444' },
  ],
  pressure_300hpa: [
    { value: 8600, color: '#4338ca' },
    { value: 9100, color: '#06b6d4' },
    { value: 9600, color: '#facc15' },
  ],

  // Ocean
  significant_waves: [
    { value: 0, color: 'rgba(0, 0, 0, 0)' },
    { value: 1, color: '#38bdf8' },
    { value: 2.5, color: '#0284c7' },
    { value: 4.5, color: '#16a34a' },
    { value: 7.0, color: '#eab308' },
    { value: 10.0, color: '#dc2626' },
  ],
  swell_period: [
    { value: 4, color: '#38bdf8' },
    { value: 9, color: '#16a34a' },
    { value: 14, color: '#eab308' },
    { value: 20, color: '#dc2626' },
  ],
  sea_surface_temp: [
    { value: -2, color: '#6366f1' },
    { value: 8, color: '#38bdf8' },
    { value: 18, color: '#22c55e' },
    { value: 26, color: '#facc15' },
    { value: 32, color: '#ef4444' },
  ],
  ocean_currents: [
    { value: 0, color: 'rgba(0, 0, 0, 0)' },
    { value: 0.5, color: '#38bdf8' },
    { value: 1.2, color: '#22c55e' },
    { value: 2.0, color: '#eab308' },
  ],

  // Air Quality
  aqi_index: [
    { value: 0, color: '#22c55e' },
    { value: 50, color: '#84cc16' },
    { value: 100, color: '#eab308' },
    { value: 150, color: '#ea580c' },
    { value: 200, color: '#dc2626' },
    { value: 300, color: '#9333ea' },
  ],
  pm25: [
    { value: 0, color: '#22c55e' },
    { value: 25, color: '#eab308' },
    { value: 50, color: '#ea580c' },
    { value: 100, color: '#dc2626' },
  ],
  pm10: [
    { value: 0, color: '#22c55e' },
    { value: 45, color: '#eab308' },
    { value: 90, color: '#ea580c' },
    { value: 180, color: '#dc2626' },
  ],
  ozone_o3: [
    { value: 0, color: '#22c55e' },
    { value: 70, color: '#eab308' },
    { value: 130, color: '#ea580c' },
    { value: 200, color: '#dc2626' },
  ],
  dust_mass: [
    { value: 0, color: 'rgba(0, 0, 0, 0)' },
    { value: 100, color: '#fde047' },
    { value: 350, color: '#ca8a04' },
    { value: 800, color: '#78350f' },
  ],

  // Hazards
  fire_danger_index: [
    { value: 0, color: '#22c55e' },
    { value: 30, color: '#eab308' },
    { value: 60, color: '#ea580c' },
    { value: 85, color: '#dc2626' },
  ],
  thermal_anomalies: [
    { value: 0, color: 'rgba(0, 0, 0, 0)' },
    { value: 50, color: '#ea580c' },
    { value: 200, color: '#dc2626' },
    { value: 500, color: '#facc15' },
  ],
  uv_index: [
    { value: 0, color: 'rgba(0, 0, 0, 0)' },
    { value: 2, color: '#22c55e' },
    { value: 5, color: '#eab308' },
    { value: 8, color: '#ea580c' },
    { value: 11, color: '#9333ea' },
  ],
  solar_radiation: [
    { value: 0, color: 'rgba(0, 0, 0, 0)' },
    { value: 200, color: '#0284c7' },
    { value: 500, color: '#eab308' },
    { value: 850, color: '#ea580c' },
  ],

  // Aviation
  turbulence_risk: [
    { value: 0, color: 'rgba(0, 0, 0, 0)' },
    { value: 0.2, color: '#22c55e' },
    { value: 0.5, color: '#eab308' },
    { value: 0.8, color: '#ef4444' },
  ],
  icing_index: [
    { value: 0, color: 'rgba(0, 0, 0, 0)' },
    { value: 25, color: '#38bdf8' },
    { value: 60, color: '#818cf8' },
    { value: 90, color: '#dc2626' },
  ],
};

// In-memory tile cache to ensure ultra-fast 60fps pan/zoom
const tileCache = new Map<string, Buffer>();
const MAX_CACHED_TILES = 1200;

// High performance 256x256 tile generator
export async function generateWeatherTile(
  layerId: string,
  z: number,
  x: number,
  y: number,
  offsetHours: number = 0
): Promise<Buffer> {
  const cacheKey = `${layerId}_${z}_${x}_${y}_${offsetHours}`;
  if (tileCache.has(cacheKey)) {
    return tileCache.get(cacheKey)!;
  }

  const { minLat, maxLat, minLon, maxLon } = tileToLatLonBounds(x, y, z);
  const colorMap = LAYER_COLOR_MAPS[layerId] || LAYER_COLOR_MAPS.temp;
  const colorScale = buildColorScale(colorMap);

  const tileSize = 256;
  const png = new PNG({ width: tileSize, height: tileSize, colorType: 6 }); // RGBA

  // Sample grid at 16x16 or 32x32 and smoothly bi-linearly interpolate to 256x256
  const sampleSteps = 16;
  const grid: number[][] = [];

  for (let gy = 0; gy <= sampleSteps; gy++) {
    const row: number[] = [];
    const ty = gy / sampleSteps;
    const lat = maxLat - ty * (maxLat - minLat);

    for (let gx = 0; gx <= sampleSteps; gx++) {
      const tx = gx / sampleSteps;
      const lon = minLon + tx * (maxLon - minLon);
      row.push(evaluateLayerValue(layerId, lat, lon, offsetHours));
    }
    grid.push(row);
  }

  // Render pixels
  for (let py = 0; py < tileSize; py++) {
    const gyExact = (py / tileSize) * sampleSteps;
    const gy0 = Math.floor(gyExact);
    const gy1 = Math.min(sampleSteps, gy0 + 1);
    const ty = gyExact - gy0;

    for (let px = 0; px < tileSize; px++) {
      const gxExact = (px / tileSize) * sampleSteps;
      const gx0 = Math.floor(gxExact);
      const gx1 = Math.min(sampleSteps, gx0 + 1);
      const tx = gxExact - gx0;

      // Bi-linear interpolation
      const v00 = grid[gy0][gx0];
      const v10 = grid[gy0][gx1];
      const v01 = grid[gy1][gx0];
      const v11 = grid[gy1][gx1];

      const valTop = v00 + (v10 - v00) * tx;
      const valBottom = v01 + (v11 - v01) * tx;
      const val = valTop + (valBottom - valTop) * ty;

      const [r, g, b, a] = interpolateColor(val, colorScale);

      const idx = (tileSize * py + px) << 2;
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = a;
    }
  }

  const buffer = PNG.sync.write(png);

  if (tileCache.size >= MAX_CACHED_TILES) {
    const firstKey = tileCache.keys().next().value;
    if (firstKey) tileCache.delete(firstKey);
  }
  tileCache.set(cacheKey, buffer);

  return buffer;
}
