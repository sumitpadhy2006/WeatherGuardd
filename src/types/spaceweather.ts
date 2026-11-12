export type NoaaGScale = 'G0' | 'G1' | 'G2' | 'G3' | 'G4' | 'G5';
export type NoaaSScale = 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5';
export type NoaaRScale = 'R0' | 'R1' | 'R2' | 'R3' | 'R4' | 'R5';

export interface SolarFlareItem {
  flrID: string;
  beginTime: string;
  peakTime: string;
  endTime: string;
  classType: string; // e.g. 'X2.3', 'M6.1', 'C4.5'
  sourceLocation: string; // e.g. 'S18W42'
  activeRegionNum: number | null;
  peakFluxWattsM2: number;
  radioBlackoutLevel: NoaaRScale;
  instruments: string[];
  notes: string;
}

export interface CmeItem {
  cmeID: string;
  startTime: string;
  sourceLocation: string;
  activeRegionNum: number | null;
  speedKms: number;
  halfAngleDeg: number;
  type: 'Halo' | 'Partial Halo' | 'Asymmetrical' | 'Narrow';
  earthImpactProbability: 'High (Direct Hit)' | 'Moderate (Glancing Blow)' | 'Low (Flank Passage)' | 'None (Far Side)';
  estimatedEarthArrival: string;
  transitTimeHours: number;
  enlilSimulationUrl?: string;
  associatedFlareId?: string;
  description: string;
}

export interface KpHistoryPoint {
  time: string;
  kp: number;
  status: 'quiet' | 'unsettled' | 'active' | 'minor_storm' | 'major_storm' | 'severe_storm';
}

export interface KpForecastPoint {
  time: string;
  kp: number;
  gScale: NoaaGScale;
}

export interface RecentGstItem {
  gstID: string;
  startTime: string;
  kpIndex: number;
  noaaScale: NoaaGScale;
  summary: string;
}

export interface GeomagneticStormData {
  currentKp: number;
  maxKp24h: number;
  gScale: NoaaGScale;
  gScaleLabel: string;
  dstIndexNt: number;
  kpHistory: KpHistoryPoint[];
  kpForecast: KpForecastPoint[];
  magnetosphereState: 'Normal' | 'Compressed' | 'Disturbed' | 'Severely Disturbed';
  auroralBoundaryLat: number;
  recentStorms: RecentGstItem[];
}

export interface LocalAuroraPrediction {
  observerLat: number;
  observerLon: number;
  geomagneticLat: number;
  minKpRequired: number;
  currentKp: number;
  viewingProbabilityPercent: number;
  viewingRating: 'Unlikely' | 'Low Chance' | 'Favorable' | 'High Likelihood' | 'Guaranteed Visible (Overhead)';
  recommendation: string;
  bestWindowTonight: string;
  photographicVsVisual: 'Photographic & Naked Eye' | 'Long-Exposure Camera Only' | 'Sub-Horizon Glow Only' | 'None Expected';
}

export interface AuroraColorGuide {
  color: string;
  altitudeKm: string;
  emission: string;
  description: string;
  hex: string;
}

export interface AuroraForecastData {
  hemisphericPowerGW: number;
  auroraActivityLevel: 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Extreme';
  northernOvalExtentLat: number;
  southernOvalExtentLat: number;
  localObserver: LocalAuroraPrediction;
  auroraColors: AuroraColorGuide[];
}

export interface SolarWindHistoryPoint {
  time: string;
  speed: number;
  density: number;
  bz: number;
}

export interface SolarWindData {
  bulkSpeedKms: number;
  protonDensityPcm3: number;
  temperatureK: number;
  imfBtNt: number;
  imfBzNt: number;
  bzOrientation: 'Southward (Storm Risk)' | 'Northward (Stable Shield)' | 'Neutral';
  dynamicPressureNpa: number;
  phiAngleDeg: number;
  substormRiskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  streamHistory: SolarWindHistoryPoint[];
}

export interface SpaceWeatherAlertItem {
  id: string;
  messageType: 'FLR' | 'CME' | 'GST' | 'IPS' | 'ALERTR' | 'ALERTS' | 'ALERTG' | 'WARNING' | 'SUMMARY';
  messageIssueTime: string;
  severity: 'info' | 'warning' | 'watch' | 'alert' | 'emergency';
  title: string;
  messageBody: string;
  link?: string;
  impacts: {
    powerGrid: string;
    spacecraft: string;
    hfRadio: string;
    gnssGps: string;
    aurora: string;
  };
}

export interface ActiveSolarRegion {
  arNumber: number;
  location: string;
  magType: string;
  sunspotCount: number;
  flareProbabilityM: number;
  flareProbabilityX: number;
}

export interface SolarCycleData {
  cycleNumber: number;
  sunspotCount: number;
  radioFlux10cmSfu: number;
  solarCyclePhase: string;
  activeRegions: ActiveSolarRegion[];
  currentNoaaScales: {
    geomagneticG: { current: number; max24h: number; label: string };
    solarRadiationS: { current: number; max24h: number; label: string };
    radioBlackoutR: { current: number; max24h: number; label: string };
  };
}

export interface SpaceWeatherOverviewPayload {
  lastUpdated: number;
  solarFlares: SolarFlareItem[];
  cmes: CmeItem[];
  geomagnetic: GeomagneticStormData;
  aurora: AuroraForecastData;
  solarWind: SolarWindData;
  alerts: SpaceWeatherAlertItem[];
  solarCycle: SolarCycleData;
}
