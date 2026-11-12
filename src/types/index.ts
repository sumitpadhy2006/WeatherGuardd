import { UserRole } from './personalization';

export type UnitSystem = 'metric' | 'imperial';
export type ThemeMode = 'dark' | 'light' | 'astronomer-red';
export type { UserRole };

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface GeoLocationItem {
  id: string;
  name: string;
  country: string;
  state?: string;
  district?: string;
  placeType?: string;
  countryCode?: string;
  displayName?: string;
  city?: string;
  town?: string;
  village?: string;
  locality?: string;
  lat: number;
  lon: number;
  category?: 'home' | 'work' | 'field' | 'observatory' | 'travel' | 'other';
  isDefault?: boolean;
  nickname?: string;
  timezone?: string;
}

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface HourlyForecastItem {
  timestamp: number;
  temp: number;
  feelsLike: number;
  humidity: number;
  pop: number; // Probability of precipitation (0-1)
  rainMm?: number;
  windSpeed: number;
  windDeg: number;
  windGust?: number;
  uvIndex: number;
  pressure: number;
  condition: WeatherCondition;
  isDay: boolean;
}

export interface DailyForecastItem {
  timestamp: number;
  sunrise: number;
  sunset: number;
  tempMin: number;
  tempMax: number;
  tempDay: number;
  tempNight: number;
  feelsLikeDay: number;
  humidity: number;
  pop: number;
  rainMm?: number;
  windSpeed: number;
  windDeg: number;
  uvIndex: number;
  pressure: number;
  condition: WeatherCondition;
  summary?: string;
}

export interface AirQualityData {
  aqi: number; // 1-5 or 0-500 scale
  category: 'Good' | 'Fair' | 'Moderate' | 'Poor' | 'Very Poor' | 'Hazardous';
  pm2_5: number; // µg/m³
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
  dominantPollutant: string;
  healthRecommendation: string;
}

export interface CelestialSummary {
  sunrise: number;
  sunset: number;
  solarNoon: number;
  daylightDurationSeconds: number;
  goldenHourMorning: string;
  goldenHourEvening: string;
  blueHourEvening: string;
  sunElevationDeg: number;
  sunAzimuthDeg: number;
  moonPhaseName: string;
  moonIlluminationPercent: number;
  moonrise?: number;
  moonset?: number;
  stargazingScore: number; // 0-100
  stargazingRating: 'Pristine' | 'Good' | 'Fair' | 'Poor';
}

export interface CurrentWeatherPayload {
  location: GeoLocationItem;
  timestamp: number;
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  dewPoint: number;
  pressure: number;
  pressureTendency: 'rising' | 'steady' | 'falling';
  windSpeed: number;
  windDeg: number;
  windGust?: number;
  visibilityKm: number;
  cloudCoverPercent: number;
  uvIndex: number;
  condition: WeatherCondition;
  isDay: boolean;
  minutelyRain: { minute: number; intensityMm: number; probability: number }[];
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  airQuality: AirQualityData;
  celestial: CelestialSummary;
  source: 'live_api' | 'scientific_cache';
}

export type AmbientSimulationMode =
  | 'auto'
  | 'clear_day'
  | 'golden_hour'
  | 'sunset'
  | 'rain'
  | 'thunderstorm'
  | 'snow'
  | 'fog'
  | 'aurora'
  | 'deep_night'
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

export type ParticleDensity = 'low' | 'medium' | 'high' | 'ultra';

export interface UserPreferences {
  units: UnitSystem;
  tempUnit: 'C' | 'F';
  speedUnit: 'km/h' | 'mph' | 'm/s' | 'knots';
  pressureUnit: 'hPa' | 'inHg' | 'mmHg';
  rainUnit: 'mm' | 'in';
  theme: ThemeMode;
  role: UserRole;
  refreshIntervalMinutes: number;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "07:00"
  enableSoundAlerts: boolean;
  enableEmergencyBanner: boolean;
  // P19 Premium Experience Layer
  ambientEffectsEnabled?: boolean;
  ambientSimulationMode?: AmbientSimulationMode;
  particleDensity?: ParticleDensity;
  reducedMotion?: boolean;
  glassIntensity?: 'subtle' | 'standard' | 'frosted';
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  profilePhotoUrl?: string | null;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  emailVerified?: boolean;
  isAnonymous: boolean;
  primaryUserType?: string;
  specificProfession?: string;
  interests?: string[];
  address?: any;
  role: UserRole;
  createdAt: number;
  updatedAt?: number;
  lastLoginAt?: number;
}

// Earth Watch Types
export type DisasterType = 'all' | 'earthquake' | 'wildfire' | 'volcano' | 'cyclone' | 'tsunami' | 'flood' | 'high_temp';
export type EarthWatchSeverity = 'advisory' | 'watch' | 'warning' | 'critical';

export interface CycloneTrackPoint {
  lat: number;
  lon: number;
  timestamp: number;
  windKmh?: number;
  pressureHpa?: number;
  category?: string;
}

export interface EarthWatchEvent {
  id: string;
  title: string;
  type: 'earthquake' | 'wildfire' | 'volcano' | 'cyclone' | 'tsunami' | 'flood' | 'high_temp';
  severity: EarthWatchSeverity;
  timestamp: number;
  lat: number;
  lon: number;
  place: string;
  source: 'USGS' | 'NASA_EONET' | 'NOAA' | 'GLOBAL_SEISMIC' | 'GDACS' | 'NWS';
  sourceUrl?: string;
  // High Temp Specific
  temperatureMax?: number;
  status: 'active' | 'ongoing' | 'contained' | 'historical';
  description?: string;
  
  // Earthquake specific
  magnitude?: number;
  magType?: string;
  depthKm?: number;
  feltReports?: number;
  tsunamiRisk?: boolean;
  alertLevel?: 'green' | 'yellow' | 'orange' | 'red';
  mmi?: number; // Modified Mercalli Intensity
  tectonicPlate?: string;

  // Wildfire specific
  wildfireAcres?: number;
  wildfireHectares?: number;
  wildfireContainmentPercent?: number;
  fireBrightnessKelvin?: number;
  fireFrpMw?: number; // Fire Radiative Power in MW

  // Volcano specific
  volcanoAviationColor?: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  volcanoPlumeAltitudeKm?: number;
  volcanoActivityStatus?: string;

  // Cyclone specific
  cycloneCategory?: string; // e.g. 'Category 4', 'Tropical Storm'
  cycloneWindSpeedKmh?: number;
  cycloneWindGustKmh?: number;
  cyclonePressureHpa?: number;
  cycloneMovement?: string; // e.g. "WNW at 18 km/h"
  cycloneTrack?: CycloneTrackPoint[];

  // Distance from active user station
  distanceKm?: number;
}

export interface EarthWatchSummaryStats {
  totalActiveEvents: number;
  earthquakes24h: number;
  significantQuakes: number; // M4.5+
  activeWildfires: number;
  activeVolcanoes: number;
  activeCyclones: number;
  criticalAlertsCount: number;
  lastUpdated: number;
  nearestEvent?: EarthWatchEvent;
}

export * from './astronomy';
export * from './neo';
export * from './personalization';
