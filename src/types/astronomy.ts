// Sky & Space Telemetry Data Models

export type SolarPeriod =
  | 'day'
  | 'golden_hour_morning'
  | 'golden_hour_evening'
  | 'blue_hour_morning'
  | 'blue_hour_evening'
  | 'civil_twilight'
  | 'nautical_twilight'
  | 'astro_twilight'
  | 'night';

export interface SunData {
  sunrise: number;
  sunset: number;
  solarNoon: number;
  dayLengthSeconds: number;
  dayLengthFormatted: string;
  elevationDeg: number;
  azimuthDeg: number;
  declinationDeg: number;
  distanceAu: number;
  civilDawn: number;
  civilDusk: number;
  nauticalDawn: number;
  nauticalDusk: number;
  astroDawn: number;
  astroDusk: number;
  goldenHourMorning: { start: number; end: number };
  goldenHourEvening: { start: number; end: number };
  blueHourMorning: { start: number; end: number };
  blueHourEvening: { start: number; end: number };
  solarRadiationWm2: number;
  peakElevationDeg: number;
  daylightProgressPercent: number;
  currentPeriod: SolarPeriod;
}

export type LunarPhaseName =
  | 'New Moon'
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Third Quarter'
  | 'Waning Crescent';

export interface MoonData {
  phaseName: LunarPhaseName;
  phaseCode: string;
  illuminationPercent: number;
  moonAgeDays: number;
  moonrise: number | null;
  moonset: number | null;
  altitudeDeg: number;
  azimuthDeg: number;
  distanceKm: number;
  isSupermoon: boolean;
  isMicromoon: boolean;
  zodiacSign: string;
  nextPhases: {
    newMoon: number;
    firstQuarter: number;
    fullMoon: number;
    lastQuarter: number;
  };
}

export type PlanetStatus =
  | 'visible_now'
  | 'rises_tonight'
  | 'daytime'
  | 'below_horizon'
  | 'near_sun';

export interface PlanetData {
  id: 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune';
  name: string;
  symbol: string;
  altitudeDeg: number;
  azimuthDeg: number;
  azimuthDirection: string;
  magnitude: number;
  elongationDeg: number;
  distanceAu: number;
  constellation: string;
  riseTime: string;
  setTime: string;
  transitTime: string;
  status: PlanetStatus;
  visibilityRecommendation: 'Naked Eye' | 'Binoculars' | 'Telescope' | 'Difficult';
  description: string;
  colorHex: string;
  diameterArcsec: number;
}

export interface ConstellationStar {
  name?: string;
  mag: number;
  x: number; // 0-100
  y: number; // 0-100
}

export interface ConstellationItem {
  id: string;
  name: string;
  latinName: string;
  season: 'Spring' | 'Summer' | 'Autumn' | 'Winter' | 'Circumpolar';
  brightStar: string;
  brightStarMagnitude: number;
  rightAscension: string;
  declination: string;
  visibleTonight: boolean;
  bestViewingTime: string;
  mythology: string;
  deepSkyObjects: string[];
  starPoints: ConstellationStar[];
  lines: Array<[number, number]>;
}

export interface MeteorShowerItem {
  id: string;
  name: string;
  activityRange: string;
  peakDate: string;
  peakTimestamp: number;
  zhr: number; // Zenithal Hourly Rate
  velocityKms: number;
  parentBody: string;
  radiantConstellation: string;
  status: 'active_now' | 'peak_tonight' | 'approaching' | 'past';
  moonIlluminationAtPeak: number;
  moonInterferenceRating: 'Low' | 'Moderate' | 'High' | 'Severe';
  viewingWindow: string;
  description: string;
}

export interface EclipseItem {
  id: string;
  type:
    | 'solar_total'
    | 'solar_annular'
    | 'solar_partial'
    | 'lunar_total'
    | 'lunar_partial'
    | 'lunar_penumbral';
  title: string;
  date: string;
  timestamp: number;
  duration: string;
  magnitude: number;
  visibilitySummary: string;
  localVisibility: 'Totality Visible' | 'Partial Visible' | 'Penumbral Visible' | 'Not Visible';
  localCoveragePercent: number;
  nextOccurrenceIn: string;
  description: string;
}

export interface StargazingHourlyItem {
  hour: string;
  timestamp: number;
  score: number;
  rating: string;
  clouds: number;
  seeing: string;
  moonUp: boolean;
}

export interface StargazingScore {
  score: number;
  rating: 'Exceptional' | 'Great' | 'Good' | 'Fair' | 'Poor';
  bortleClass: number;
  bortleDescription: string;
  limitingMagnitude: number;
  seeingIndex: string;
  transparencyPercent: number;
  cloudCoverPercent: number;
  moonInterferencePercent: number;
  recommendations: {
    nakedEye: string;
    binoculars: string;
    telescope: string;
    astrophotography: string;
  };
  hourlyScores: StargazingHourlyItem[];
}

export interface NasaApodItem {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  mediaType: 'image' | 'video';
  date: string;
  copyright?: string;
}

export interface NasaNeoItem {
  id: string;
  name: string;
  closeApproachDate: string;
  missDistanceKm: number;
  relativeVelocityKmh: number;
  estimatedDiameterMinM: number;
  estimatedDiameterMaxM: number;
  isPotentiallyHazardous: boolean;
}

export interface SkyOverviewPayload {
  sun: SunData;
  moon: MoonData;
  planets: PlanetData[];
  constellations: ConstellationItem[];
  meteorShowers: MeteorShowerItem[];
  eclipses: EclipseItem[];
  stargazingScore: StargazingScore;
  apod: NasaApodItem;
  neoAsteroids: NasaNeoItem[];
  lastUpdated: number;
}
