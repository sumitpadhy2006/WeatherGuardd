import { MapBasemapStyle } from './map';
import { GeoLocationItem } from './index';

export type ExplorerCategory =
  | 'weather'
  | 'precipitation'
  | 'atmosphere'
  | 'ocean'
  | 'airquality'
  | 'hazards'
  | 'aviation';

export type ExplorerModeId =
  // CATEGORY 1: WEATHER
  | 'rain_precip'
  | 'rain_thunder'
  | 'clouds'
  | 'temp'
  | 'wind'
  | 'wind_gusts'
  | 'pressure'
  | 'humidity'
  | 'dew_point'
  | 'wet_bulb'
  | 'visibility'
  | 'uv_index'
  | 'solar_radiation'
  // CATEGORY 2: PRECIPITATION
  | 'precip_accum'
  | 'snow'
  | 'snow_depth'
  | 'precip_type'
  | 'thunderstorms'
  // CATEGORY 3: ATMOSPHERE
  | 'cloud_cover_total'
  | 'high_clouds'
  | 'mid_clouds'
  | 'low_clouds'
  | 'fog'
  | 'cloud_tops'
  | 'cloud_base'
  | 'cape_index'
  | 'thermal_lift'
  // CATEGORY 4: OCEAN & MARINE
  | 'sea_temp'
  | 'significant_waves'
  | 'swell_height'
  | 'swell_direction'
  | 'wind_waves'
  | 'ocean_currents'
  | 'wave_power'
  // CATEGORY 5: AIR QUALITY
  | 'aqi_overall'
  | 'pm2_5'
  | 'pm10'
  | 'no2'
  | 'so2'
  | 'o3'
  | 'co'
  | 'dust_aerosols'
  // CATEGORY 6: HAZARDS / EXTREMES
  | 'severe_weather'
  | 'fire_danger'
  | 'drought_index'
  | 'extreme_temp_anomaly'
  | 'flood_potential'
  // CATEGORY 7: AVIATION / SPECIALIZED
  | 'aviation_icing'
  | 'aviation_turbulence'
  | 'freezing_level'
  | 'winds_aloft';

export interface ExplorerLayerDefinition {
  id: ExplorerModeId;
  name: string;
  category: ExplorerCategory;
  description: string;
  shortLabel: string;
  iconName: string;
  unit: string;
  unitImperial?: string;
  authoritativeSource: string;
  legendType: 'gradient' | 'steps' | 'categorical';
  colorStops: { value: number; color: string; label: string }[];
  isAnimated: boolean;
  animationType?: 'particles' | 'temporal_frames' | 'streamlines' | 'pulse';
  supportsForecast: boolean;
  forecastHoursMax?: number; // e.g. 72, 120
  supportsPast: boolean;
  pastHoursMax?: number; // e.g. 24
  minZoom?: number;
  maxZoom?: number;
  openWeatherLayerKey?: string;
  rainViewerType?: 'radar' | 'satellite';
  nasaGibsLayerKey?: string;
  openMeteoVariable?: string;
  isSpecialized?: boolean;
}

export interface ExplorerActiveLayers {
  primaryMode: ExplorerModeId;
  basemapStyle: MapBasemapStyle;
  showWindParticles: boolean;
  showRadarOverlay: boolean;
  showCloudCover: boolean;
  showIsobars: boolean;
  showCurrentLocationMarker: boolean;
  layerOpacity: number; // 0.1 to 1.0
  particleSpeed: number; // 0.5 to 2.0
}

export type ExplorerPreset =
  | 'standard'
  | 'marine'
  | 'aviator'
  | 'stargazer'
  | 'farmer'
  | 'photographer'
  | 'storm_chaser';

export interface TimelineState {
  isPlaying: boolean;
  playbackSpeed: number; // 1x, 2x, 4x
  currentOffsetHours: number; // -12 to +72 (0 = Now)
  radarFrameIndex: number;
  totalRadarFrames: number;
  activeTimestamp: number;
  stepMinutes: number; // 60 min for forecast, 10 min for radar
}

export interface ExplorerLocationTelemetry {
  location: GeoLocationItem;
  timestamp: number;
  primaryValue: string | number;
  primaryUnit: string;
  primaryLabel: string;
  secondaryMetrics: {
    label: string;
    value: string | number;
    unit?: string;
    status?: 'good' | 'moderate' | 'warning' | 'alert';
  }[];
  summaryText: string;
  trend?: 'rising' | 'falling' | 'stable';
  authoritativeSource: string;
}
