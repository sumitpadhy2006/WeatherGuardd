import { EarthWatchEvent, DisasterType, GeoLocationItem } from './index';

export type MapBasemapStyle =
  | 'hybrid'
  | 'satellite'
  | 'dataviz-dark'
  | 'streets'
  | 'outdoor'
  | 'nasa-gibs';

export type WeatherOverlayType =
  | 'none'
  | 'radar'
  | 'clouds'
  | 'wind'
  | 'temp'
  | 'pressure'
  | 'aqi';

export type TimeWindowFilter = 'live' | '24h' | '7d' | '30d';

export interface RadarFrame {
  time: number;
  path: string;
}

export interface RainViewerRadarResponse {
  version: string;
  generated: number;
  host: string;
  radar: {
    past: RadarFrame[];
    nowcast: RadarFrame[];
  };
  satellite?: {
    infrared: RadarFrame[];
  };
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapViewportState {
  center: [number, number]; // [lon, lat]
  zoom: number;
  pitch: number;
  bearing: number;
}

export interface MapLayerVisibility {
  earthquakes: boolean;
  wildfires: boolean;
  volcanoes: boolean;
  cyclones: boolean;
  tectonicPlates: boolean;
  proximityRings: boolean;
  stationMarker: boolean;
}
