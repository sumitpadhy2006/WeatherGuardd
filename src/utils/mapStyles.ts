import { MapBasemapStyle, RainViewerRadarResponse, RadarFrame } from '../types/map';
import { EarthWatchEvent, GeoLocationItem } from '../types';

export const DEFAULT_MAPTILER_KEY = 'ouNSj4DcJSYQgLAIw8Je';

export function getMapTilerKey(): string {
  const envKey = (import.meta as any).env?.VITE_MAPTILER_API_KEY;
  return envKey || DEFAULT_MAPTILER_KEY;
}

// MapTiler style JSON endpoints
export function getMapStyleUrl(style: MapBasemapStyle): string | object {
  const key = getMapTilerKey();

  switch (style) {
    case 'hybrid':
      return `https://api.maptiler.com/maps/hybrid/style.json?key=${key}`;
    case 'satellite':
      return `https://api.maptiler.com/maps/satellite/style.json?key=${key}`;
    case 'streets':
      return `https://api.maptiler.com/maps/streets-v2/style.json?key=${key}`;
    case 'outdoor':
      return `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${key}`;
    case 'dataviz-dark':
      // MapTiler's beautiful high-contrast dark style natively replaces the broken Carto tiles
      return `https://api.maptiler.com/maps/basic-v2-dark/style.json?key=${key}`;
    case 'nasa-gibs': {
      // NASA GIBS TrueColor raster layer style specification
      const today = new Date();
      // Use yesterday to ensure global satellite composite is 100% complete
      today.setDate(today.getDate() - 1);
      const isoDate = today.toISOString().split('T')[0];

      return {
        version: 8,
        sources: {
          'nasa-gibs': {
            type: 'raster',
            tiles: [
              `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${isoDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
            ],
            tileSize: 256,
            maxzoom: 9,
            attribution: 'NASA EOSDIS GIBS • Earthdata',
          },
          'carto-labels': {
            type: 'raster',
            tiles: [
              'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_only_labels/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: { 'background-color': '#050811' },
          },
          {
            id: 'nasa-gibs-layer',
            type: 'raster',
            source: 'nasa-gibs',
            paint: { 'raster-opacity': 1.0 },
          },
          {
            id: 'carto-labels-layer',
            type: 'raster',
            source: 'carto-labels',
            paint: { 'raster-opacity': 0.85 },
          },
        ],
      };
    }
    default:
      return `https://api.maptiler.com/maps/hybrid/style.json?key=${key}`;
  }
}

// Dark raster fallback if MapTiler fails
export const FALLBACK_DARK_STYLE = {
  version: 8,
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: [
        'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
        'https://cartodb-basemaps-b.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© CARTO • OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'carto-dark-layer',
      type: 'raster',
      source: 'carto-dark',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

// Fetch live RainViewer radar frames
export async function fetchRainViewerRadar(): Promise<RainViewerRadarResponse | null> {
  try {
    const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('RainViewer Radar API unavailable:', err);
    return null;
  }
}

// Generate circular polygon GeoJSON around station (for proximity rings)
export function createGeoJSONCircle(
  centerLon: number,
  centerLat: number,
  radiusKm: number,
  points: number = 64
): GeoJSON.Feature<GeoJSON.Polygon> {
  const coords: [number, number][] = [];
  const distanceX = radiusKm / (111.32 * Math.cos((centerLat * Math.PI) / 180));
  const distanceY = radiusKm / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([centerLon + x, centerLat + y]);
  }
  coords.push(coords[0]); // Close polygon

  return {
    type: 'Feature',
    properties: {
      radiusKm,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [coords],
    },
  };
}

// Convert EarthWatchEvent[] to GeoJSON for MapLibre source
export function eventsToGeoJSON(events: EarthWatchEvent[]): GeoJSON.FeatureCollection {
  const validEvents = (events || []).filter(
    (ev) =>
      typeof ev?.lon === 'number' &&
      typeof ev?.lat === 'number' &&
      !isNaN(ev.lon) &&
      !isNaN(ev.lat) &&
      ev.lon >= -180 &&
      ev.lon <= 180 &&
      ev.lat >= -90 &&
      ev.lat <= 90
  );

  const features: GeoJSON.Feature[] = validEvents.map((ev) => {
    return {
      type: 'Feature',
      id: ev.id,
      geometry: {
        type: 'Point',
        coordinates: [ev.lon, ev.lat],
      },
      properties: {
        id: ev.id,
        title: ev.title,
        type: ev.type,
        severity: ev.severity,
        timestamp: ev.timestamp,
        place: ev.place,
        source: ev.source,
        magnitude: Number(ev.magnitude) || 0,
        depthKm: Number(ev.depthKm) || 0,
        feltReports: Number(ev.feltReports) || 0,
        tsunamiRisk: ev.tsunamiRisk ? 1 : 0,
        alertLevel: ev.alertLevel || 'green',
        mmi: Number(ev.mmi) || 0,
        tectonicPlate: ev.tectonicPlate || '',
        wildfireAcres: Number(ev.wildfireAcres) || 0,
        wildfireContainmentPercent: Number(ev.wildfireContainmentPercent) || 0,
        volcanoAviationColor: ev.volcanoAviationColor || '',
        cycloneWindSpeedKmh: Number(ev.cycloneWindSpeedKmh) || 0,
        cycloneCategory: ev.cycloneCategory || '',
        distanceKm: typeof ev.distanceKm === 'number' ? Math.round(ev.distanceKm) : -1,
        description: ev.description || '',
      },
    };
  });

  return {
    type: 'FeatureCollection',
    features,
  };
}
