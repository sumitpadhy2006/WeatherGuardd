import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapBasemapStyle, RadarFrame } from '../../types/map';
import { ExplorerModeId, ExplorerActiveLayers, TimelineState } from '../../types/explorer';
import { EXPLORER_LAYERS } from '../../utils/weatherExplorerData';
import { getMapStyleUrl, DEFAULT_MAPTILER_KEY } from '../../utils/mapStyles';
import { WindParticleLayer } from '../../utils/windParticles';
import { GeoLocationItem } from '../../types';

interface ExplorerMapProps {
  currentLocation?: GeoLocationItem;
  onMapClickLocation?: (loc: GeoLocationItem) => void;
  activeMode: ExplorerModeId;
  activeLayers: ExplorerActiveLayers;
  timeline: TimelineState;
  pitch: number;
  onPitchChange?: (pitch: number) => void;
  heightClass?: string;
}

export const ExplorerMap: React.FC<ExplorerMapProps> = ({
  currentLocation,
  onMapClickLocation,
  activeMode,
  activeLayers,
  timeline,
  pitch,
  onPitchChange,
  heightClass = 'h-full w-full',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const locationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const particleEngineRef = useRef<WindParticleLayer | null>(null);

  const [radarFrames, setRadarFrames] = useState<RadarFrame[]>([]);
  const [activeRadarFrameIndex, setActiveRadarFrameIndex] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);

  const layerDef = EXPLORER_LAYERS[activeMode];

  // Fetch RainViewer radar timestamps if radar or precipitation mode is active
  useEffect(() => {
    let isMounted = true;
    const fetchRadar = async () => {
      try {
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        if (res.ok) {
          const data = await res.json();
          if (data && data.radar && data.radar.past && isMounted) {
            const frames: RadarFrame[] = [
              ...data.radar.past.map((f: any) => ({ time: f.time, path: f.path })),
              ...(data.radar.nowcast ? data.radar.nowcast.map((f: any) => ({ time: f.time, path: f.path })) : []),
            ];
            setRadarFrames(frames);
            setActiveRadarFrameIndex(frames.length > 0 ? frames.length - 1 : 0);
          }
        }
      } catch {
        // Fallback gracefully
      }
    };
    fetchRadar();
    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Initialize MapLibre Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCenter: [number, number] = currentLocation
      ? [currentLocation.lon, currentLocation.lat]
      : [72.8777, 19.076]; // Mumbai default

    const styleUrl = getMapStyleUrl(activeLayers.basemapStyle) as any;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center: initialCenter,
      zoom: 4,
      pitch: pitch,
      maxPitch: 65,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'bottom-right');
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: 'metric' }), 'bottom-left');

    map.on('load', () => {
      setMapLoaded(true);
      mapRef.current = map;

      // Initialize wind particle canvas overlay
      if (canvasRef.current) {
        const particleEngine = new WindParticleLayer(canvasRef.current);
        particleEngine.setMap(map);
        if (activeLayers.showWindParticles) {
          particleEngine.start();
        }
        particleEngineRef.current = particleEngine;
      }

      // Add persistent city/town name labels overlay so they always show on satellite maps
      try {
        if (!map.getSource('wg-city-labels-source')) {
          map.addSource('wg-city-labels-source', {
            type: 'raster',
            tiles: [
              'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_only_labels/{z}/{x}/{y}.png',
              'https://cartodb-basemaps-b.global.ssl.fastly.net/dark_only_labels/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '© CartoDB',
          });
          map.addLayer({
            id: 'wg-city-labels-layer',
            type: 'raster',
            source: 'wg-city-labels-source',
            paint: {
              'raster-opacity': 0.85,
              'raster-fade-duration': 200,
            },
          });
        }
      } catch (e) {
        // Labels overlay already exists or failed silently
      }
    });

    map.on('resize', () => {
      particleEngineRef.current?.resize();
    });

    map.on('move', () => {
      // Keep particles aligned on pan/zoom
    });

    map.on('pitch', () => {
      if (onPitchChange) {
        onPitchChange(map.getPitch());
      }
    });

    // Handle click on map - detect city label clicks first, then reverse geocode
    map.on('click', async (e) => {
      const { lng, lat } = e.lngLat;

      // First: check if the user clicked directly on a rendered city/place name label
      const placeFeatures = map.queryRenderedFeatures(e.point, {
        layers: [
          'place-city', 'place_label', 'place-city-label', 'place-town',
          'place-village', 'settlement-label', 'place_label_city',
          'place-label-city', 'city-label', 'town-label', 'place-other',
          'poi-label', 'airport-label', 'state-label', 'country-label',
        ],
      });

      if (placeFeatures.length > 0) {
        const feat = placeFeatures[0];
        const props = feat.properties || {};
        const placeName = props.name || props['name:en'] || props.name_en || props.place_name;
        if (placeName && onMapClickLocation) {
          // Try to get richer info via geocoding, but use the feature name as fallback
          try {
            const coords = (feat.geometry as any).coordinates;
            const fLon = coords ? coords[0] : lng;
            const fLat = coords ? coords[1] : lat;
            const res = await fetch(`/api/geocode/reverse?lat=${fLat}&lon=${fLon}`);
            if (res.ok) {
              const geo = await res.json();
              onMapClickLocation({
                id: `map-place-${Date.now()}`,
                name: geo.name || placeName,
                country: geo.country || props.country || '',
                state: geo.state || '',
                lat: fLat,
                lon: fLon,
              });
              return;
            }
          } catch {}
          // Fallback to feature data directly
          onMapClickLocation({
            id: `map-place-${Date.now()}`,
            name: placeName,
            country: props.country_code?.toUpperCase() || '',
            lat,
            lon: lng,
          });
          return;
        }
      }

      // Second: general map click → reverse geocode
      try {
        const res = await fetch(`/api/geocode/reverse?lat=${lat}&lon=${lng}`);
        if (res.ok) {
          const geo = await res.json();
          if (onMapClickLocation) {
            onMapClickLocation({
              id: `map-click-${Date.now()}`,
              name: geo.name || `Point (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
              country: geo.country || '',
              lat: lat,
              lon: lng,
            });
          }
        }
      } catch {
        if (onMapClickLocation) {
          onMapClickLocation({
            id: `map-click-${Date.now()}`,
            name: `Coords (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
            country: '',
            lat: lat,
            lon: lng,
          });
        }
      }
    });

    // Change cursor to pointer when hovering place labels
    map.on('mousemove', (e) => {
      const placeFeatures = map.queryRenderedFeatures(e.point, {
        layers: [
          'place-city', 'place_label', 'place-city-label', 'place-town',
          'place-village', 'settlement-label', 'place_label_city',
          'place-label-city', 'city-label', 'town-label',
        ],
      });
      map.getCanvas().style.cursor = placeFeatures.length > 0 ? 'pointer' : '';
    });


    mapRef.current = map;

    return () => {
      particleEngineRef.current?.stop();
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, [activeLayers.basemapStyle]);

  // 2. Handle 3D Pitch sync
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    if (Math.abs(map.getPitch() - pitch) > 2) {
      map.easeTo({ pitch, duration: 600 });
    }
  }, [pitch, mapLoaded]);

  // 3. Handle Location Marker & Centering
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !currentLocation) return;

    if (locationMarkerRef.current) {
      locationMarkerRef.current.remove();
    }

    const el = document.createElement('div');
    el.className = 'relative flex items-center justify-center cursor-pointer group';
    el.innerHTML = `
      <div class="absolute -inset-2 bg-cyan-500/30 rounded-full animate-ping"></div>
      <div class="relative w-6 h-6 rounded-full bg-slate-900 border-2 border-cyan-400 shadow-xl flex items-center justify-center text-cyan-300">
        <div class="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
      </div>
      <div class="absolute bottom-full mb-1.5 px-2 py-0.5 rounded-lg bg-slate-950/90 border border-slate-700 text-[10px] font-bold text-white whitespace-nowrap shadow-lg opacity-90 group-hover:opacity-100 transition-opacity pointer-events-none">
        ${currentLocation.name}
      </div>
    `;

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([currentLocation.lon, currentLocation.lat])
      .addTo(map);

    locationMarkerRef.current = marker;

    // Fly to position
    map.flyTo({
      center: [currentLocation.lon, currentLocation.lat],
      zoom: Math.max(map.getZoom(), 5.5),
      speed: 1.2,
      curve: 1.4,
      essential: true,
    });
  }, [currentLocation, mapLoaded]);

  // 4. Manage Wind Particle Streamlines Overlay
  useEffect(() => {
    const engine = particleEngineRef.current;
    if (!engine) return;

    if (activeLayers.showWindParticles || activeMode === 'wind' || activeMode === 'winds_aloft') {
      if (activeMode === 'significant_waves' || activeMode === 'ocean_currents') {
        engine.setColorMode('marine');
      } else if (activeMode === 'wind_gusts') {
        engine.setColorMode('speed');
      } else {
        engine.setColorMode('cyan');
      }
      engine.start();
    } else {
      engine.stop();
    }
  }, [activeLayers.showWindParticles, activeMode]);

  // 5. Update Dynamic Map Tile Layers (OpenWeather & RainViewer)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const weatherSourceId = 'wg-weather-raster-source';
    const weatherLayerId = 'wg-weather-raster-layer';
    const radarSourceId = 'wg-radar-raster-source';
    const radarLayerId = 'wg-radar-raster-layer';

    // Remove existing dynamic layers safely
    if (map.getLayer(weatherLayerId)) map.removeLayer(weatherLayerId);
    if (map.getSource(weatherSourceId)) map.removeSource(weatherSourceId);
    if (map.getLayer(radarLayerId)) map.removeLayer(radarLayerId);
    if (map.getSource(radarSourceId)) map.removeSource(radarSourceId);

    // Add Primary Weather Overlay Layer (renders for all 35+ meteorological & atmospheric layers)
    const layerEndpoint = `/api/tiles/weather/${activeMode}/{z}/{x}/{y}?offset=${timeline.currentOffsetHours}`;
    map.addSource(weatherSourceId, {
      type: 'raster',
      tiles: [layerEndpoint],
      tileSize: 256,
    });

    map.addLayer({
      id: weatherLayerId,
      type: 'raster',
      source: weatherSourceId,
      paint: {
        'raster-opacity': activeLayers.layerOpacity,
        'raster-fade-duration': 250,
      },
    });

    // Add Clouds Overlay if explicitly toggled on alongside another mode
    const cloudsSourceId = 'wg-secondary-clouds-source';
    const cloudsLayerId = 'wg-secondary-clouds-layer';
    if (map.getLayer(cloudsLayerId)) map.removeLayer(cloudsLayerId);
    if (map.getSource(cloudsSourceId)) map.removeSource(cloudsSourceId);

    if (activeLayers.showCloudCover && activeMode !== 'clouds' && (activeMode as string) !== 'satellite_visible' && (activeMode as string) !== 'satellite_ir') {
      map.addSource(cloudsSourceId, {
        type: 'raster',
        tiles: [`/api/tiles/weather/clouds/{z}/{x}/{y}?offset=${timeline.currentOffsetHours}`],
        tileSize: 256,
      });

      map.addLayer({
        id: cloudsLayerId,
        type: 'raster',
        source: cloudsSourceId,
        paint: {
          'raster-opacity': Math.min(0.7, activeLayers.layerOpacity * 0.75),
          'raster-fade-duration': 250,
        },
      });
    }

    // Add RainViewer Doppler Radar if active or selected
    if (activeLayers.showRadarOverlay && radarFrames.length > 0) {
      const activeFrame = radarFrames[activeRadarFrameIndex] || radarFrames[radarFrames.length - 1];
      if (activeFrame) {
        const radarTileUrl = `https://tilecache.rainviewer.com${activeFrame.path}/256/{z}/{x}/{y}/2/1_1.png`;

        map.addSource(radarSourceId, {
          type: 'raster',
          tiles: [radarTileUrl],
          tileSize: 256,
        });

        map.addLayer({
          id: radarLayerId,
          type: 'raster',
          source: radarSourceId,
          paint: {
            'raster-opacity': Math.min(1.0, activeLayers.layerOpacity * 1.1),
            'raster-fade-duration': 200,
          },
        });
      }
    }
  }, [
    activeMode,
    activeLayers.layerOpacity,
    activeLayers.showRadarOverlay,
    activeLayers.showCloudCover,
    timeline.currentOffsetHours,
    activeRadarFrameIndex,
    radarFrames,
    mapLoaded,
    layerDef,
  ]);

  // 6. Handle Timeline Frame Advancing (during playback)
  useEffect(() => {
    if (!timeline.isPlaying || radarFrames.length === 0) return;

    const intervalMs = Math.max(250, 1200 / timeline.playbackSpeed);
    const timer = setInterval(() => {
      setActiveRadarFrameIndex((prev) => (prev + 1) % radarFrames.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [timeline.isPlaying, timeline.playbackSpeed, radarFrames.length]);

  return (
    <div className={`relative ${heightClass} bg-[#060B14] overflow-hidden select-none`}>
      {/* MapLibre DOM Anchor */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Wind Particles Interactive Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />
    </div>
  );
};
