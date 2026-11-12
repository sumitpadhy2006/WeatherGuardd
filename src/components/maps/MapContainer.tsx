import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  MapBasemapStyle,
  WeatherOverlayType,
  TimeWindowFilter,
  RadarFrame,
} from '../../types/map';
import { EarthWatchEvent, DisasterType, GeoLocationItem } from '../../types';
import {
  getMapStyleUrl,
  FALLBACK_DARK_STYLE,
  fetchRainViewerRadar,
  createGeoJSONCircle,
  eventsToGeoJSON,
} from '../../utils/mapStyles';
import { TECTONIC_PLATES_GEOJSON } from '../../utils/tectonicPlates';
import { MapHUDControls } from './MapHUDControls';
import { EventDetailDrawer } from './EventDetailDrawer';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MapContainerProps {
  events?: EarthWatchEvent[];
  selectedEventId?: string | null;
  onSelectEvent?: (id: string | null) => void;
  currentLocation?: GeoLocationItem;
  initialDisasterType?: DisasterType;
  onSelectType?: (type: DisasterType) => void;
  initialStyle?: MapBasemapStyle;
  initialOverlay?: WeatherOverlayType;
  className?: string;
  heightClass?: string;
  enableHUD?: boolean;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  events = [],
  selectedEventId = null,
  onSelectEvent,
  currentLocation,
  initialDisasterType = 'all',
  onSelectType,
  initialStyle = 'hybrid',
  initialOverlay = 'none',
  className = '',
  heightClass = 'h-[480px] sm:h-[540px] lg:h-[600px]',
  enableHUD = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const stationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const radarTimerRef = useRef<NodeJS.Timeout | null>(null);

  // States
  const [currentStyle, setCurrentStyle] = useState<MapBasemapStyle>(initialStyle);
  const [selectedDisasterType, setSelectedDisasterType] = useState<DisasterType>(initialDisasterType);
  const [activeWeatherOverlay, setActiveWeatherOverlay] = useState<WeatherOverlayType>(initialOverlay);
  const [timeFilter, setTimeFilter] = useState<TimeWindowFilter>('30d');
  const [showTectonicPlates, setShowTectonicPlates] = useState<boolean>(true);
  const [showProximityRing, setShowProximityRing] = useState<boolean>(true);
  const [proximityRadiusKm, setProximityRadiusKm] = useState<number>(500);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [pitch, setPitch] = useState<number>(0);
  const [hoveredEvent, setHoveredEvent] = useState<EarthWatchEvent | null>(null);

  // Radar Timeline State
  const [radarFrames, setRadarFrames] = useState<RadarFrame[]>([]);
  const [currentRadarFrameIndex, setCurrentRadarFrameIndex] = useState<number>(0);
  const [isRadarPlaying, setIsRadarPlaying] = useState<boolean>(false);

  // Keep internal selectedDisasterType synced with external onSelectType if provided
  const handleSelectDisasterType = (type: DisasterType) => {
    setSelectedDisasterType(type);
    if (onSelectType) onSelectType(type);
  };

  // Filter events according to Disaster Type and Time Filter
  const filteredEvents = useMemo(() => {
    const now = Date.now();
    let timeThreshold = 0;
    if (timeFilter === 'live') timeThreshold = now - 24 * 3600 * 1000;
    else if (timeFilter === '24h') timeThreshold = now - 24 * 3600 * 1000;
    else if (timeFilter === '7d') timeThreshold = now - 7 * 24 * 3600 * 1000;
    else if (timeFilter === '30d') timeThreshold = now - 30 * 24 * 3600 * 1000;

    return events.filter((ev) => {
      if (selectedDisasterType !== 'all' && ev.type !== selectedDisasterType) {
        return false;
      }
      if (timeThreshold > 0 && ev.timestamp < timeThreshold) {
        return false;
      }
      return true;
    });
  }, [events, selectedDisasterType, timeFilter]);

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    return events.find((e) => e.id === selectedEventId) || null;
  }, [events, selectedEventId]);

  // Load RainViewer Radar Frames on demand
  useEffect(() => {
    if (activeWeatherOverlay === 'radar') {
      fetchRainViewerRadar().then((data) => {
        if (data && data.radar) {
          const allFrames = [...(data.radar.past || []), ...(data.radar.nowcast || [])];
          setRadarFrames(allFrames);
          if (allFrames.length > 0) {
            setCurrentRadarFrameIndex(allFrames.length - 1);
          }
        }
      });
    } else {
      setIsRadarPlaying(false);
    }
  }, [activeWeatherOverlay]);

  // Radar playback animation loop
  useEffect(() => {
    if (isRadarPlaying && radarFrames.length > 0) {
      radarTimerRef.current = setInterval(() => {
        setCurrentRadarFrameIndex((prev) => (prev + 1) % radarFrames.length);
      }, 750);
    } else if (radarTimerRef.current) {
      clearInterval(radarTimerRef.current);
    }
    return () => {
      if (radarTimerRef.current) clearInterval(radarTimerRef.current);
    };
  }, [isRadarPlaying, radarFrames.length]);

  // Interactive Tooltip Popup Ref
  const popupRef = useRef<maplibregl.Popup | null>(null);

  // Setup layers and sources helper
  const setupLayers = useCallback(
    (map: maplibregl.Map) => {
      if (!map.isStyleLoaded()) return;

      // 1. Tectonic Plates GeoJSON Source & Line Layer (Pacific Ring of Fire & Global Faults)
      if (!map.getSource('tectonic-plates')) {
        map.addSource('tectonic-plates', {
          type: 'geojson',
          data: TECTONIC_PLATES_GEOJSON,
        });

        map.addLayer({
          id: 'tectonic-plates-lines',
          type: 'line',
          source: 'tectonic-plates',
          layout: {
            visibility: showTectonicPlates ? 'visible' : 'none',
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': '#FF334B',
            'line-width': 2.0,
            'line-dasharray': [4, 3],
            'line-opacity': 0.85,
          },
        });
      } else {
        const lineVis = showTectonicPlates ? 'visible' : 'none';
        if (map.getLayer('tectonic-plates-lines')) {
          map.setLayoutProperty('tectonic-plates-lines', 'visibility', lineVis);
        }
      }

      // 2. Station Proximity Ring Source & Layer
      if (currentLocation) {
        const ringGeoJSON = createGeoJSONCircle(currentLocation.lon, currentLocation.lat, proximityRadiusKm);
        if (!map.getSource('station-proximity')) {
          map.addSource('station-proximity', {
            type: 'geojson',
            data: ringGeoJSON,
          });

          map.addLayer({
            id: 'station-proximity-fill',
            type: 'fill',
            source: 'station-proximity',
            layout: {
              visibility: showProximityRing ? 'visible' : 'none',
            },
            paint: {
              'fill-color': '#06B6D4',
              'fill-opacity': 0.05,
            },
          });

          map.addLayer({
            id: 'station-proximity-outline',
            type: 'line',
            source: 'station-proximity',
            layout: {
              visibility: showProximityRing ? 'visible' : 'none',
            },
            paint: {
              'line-color': '#22D3EE',
              'line-width': 1.5,
              'line-dasharray': [4, 3],
              'line-opacity': 0.65,
            },
          });
        } else {
          const proxSource = map.getSource('station-proximity') as maplibregl.GeoJSONSource;
          proxSource.setData(ringGeoJSON);
          const ringVis = showProximityRing ? 'visible' : 'none';
          if (map.getLayer('station-proximity-fill')) {
            map.setLayoutProperty('station-proximity-fill', 'visibility', ringVis);
          }
          if (map.getLayer('station-proximity-outline')) {
            map.setLayoutProperty('station-proximity-outline', 'visibility', ringVis);
          }
        }
      }

      // 3. Natural Hazards & Earthquakes GeoJSON Source (Earthquakes, Wildfires, Volcanoes, Cyclones)
      const hazardGeoJSON = eventsToGeoJSON(filteredEvents);

      if (!map.getSource('hazard-events')) {
        map.addSource('hazard-events', {
          type: 'geojson',
          data: hazardGeoJSON,
        });

        // --- EARTHQUAKES ---
        // Earthquakes Outer Pulse Halo
        map.addLayer({
          id: 'earthquake-halo',
          type: 'circle',
          source: 'hazard-events',
          filter: ['==', ['get', 'type'], 'earthquake'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'magnitude'],
              '#22C55E', // < 4.5
              4.5,
              '#F59E0B', // 4.5 - 5.5
              5.5,
              '#F97316', // 5.5 - 6.5
              6.5,
              '#EF4444', // >= 6.5
            ],
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'magnitude'],
              2.0, 7,
              4.5, 12,
              6.0, 18,
              7.5, 26,
              9.0, 36,
            ],
            'circle-opacity': 0.38,
            'circle-blur': 0.65,
          },
        });

        // Earthquakes Core Marker
        map.addLayer({
          id: 'earthquake-points',
          type: 'circle',
          source: 'hazard-events',
          filter: ['==', ['get', 'type'], 'earthquake'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'magnitude'],
              '#4ADE80',
              4.5,
              '#FBBF24',
              5.5,
              '#FB923C',
              6.5,
              '#F87171',
            ],
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'magnitude'],
              2.0, 4,
              4.5, 6,
              6.0, 9,
              7.5, 13,
              9.0, 18,
            ],
            'circle-stroke-width': 1.8,
            'circle-stroke-color': '#0B0F19',
            'circle-opacity': 0.95,
          },
        });

        // --- WILDFIRES ---
        // Wildfires Thermal Glow Halo
        map.addLayer({
          id: 'wildfire-halo',
          type: 'circle',
          source: 'hazard-events',
          filter: ['==', ['get', 'type'], 'wildfire'],
          paint: {
            'circle-color': '#FF4500',
            'circle-radius': 14,
            'circle-opacity': 0.45,
            'circle-blur': 0.7,
          },
        });

        // Wildfires Core Flame Marker
        map.addLayer({
          id: 'wildfire-points',
          type: 'circle',
          source: 'hazard-events',
          filter: ['==', ['get', 'type'], 'wildfire'],
          paint: {
            'circle-color': '#FF5722',
            'circle-radius': 6.5,
            'circle-stroke-width': 1.8,
            'circle-stroke-color': '#3E0E00',
            'circle-opacity': 1.0,
          },
        });

        // --- VOLCANOES ---
        // Volcanoes Ash & Thermal Halo
        map.addLayer({
          id: 'volcano-halo',
          type: 'circle',
          source: 'hazard-events',
          filter: ['==', ['get', 'type'], 'volcano'],
          paint: {
            'circle-color': '#FACC15',
            'circle-radius': 16,
            'circle-opacity': 0.45,
            'circle-blur': 0.75,
          },
        });

        // Volcanoes Caldera Point
        map.addLayer({
          id: 'volcano-points',
          type: 'circle',
          source: 'hazard-events',
          filter: ['==', ['get', 'type'], 'volcano'],
          paint: {
            'circle-color': '#EAB308',
            'circle-radius': 7.5,
            'circle-stroke-width': 2.0,
            'circle-stroke-color': '#422006',
            'circle-opacity': 1.0,
          },
        });

        // --- CYCLONES ---
        // Cyclones Storm Field Halo
        map.addLayer({
          id: 'cyclone-halo',
          type: 'circle',
          source: 'hazard-events',
          filter: ['==', ['get', 'type'], 'cyclone'],
          paint: {
            'circle-color': '#00E5FF',
            'circle-radius': 22,
            'circle-opacity': 0.42,
            'circle-blur': 0.8,
          },
        });

        // Cyclones Eye Core Marker
        map.addLayer({
          id: 'cyclone-points',
          type: 'circle',
          source: 'hazard-events',
          filter: ['==', ['get', 'type'], 'cyclone'],
          paint: {
            'circle-color': '#06B6D4',
            'circle-radius': 9.0,
            'circle-stroke-width': 2.0,
            'circle-stroke-color': '#082F49',
            'circle-opacity': 1.0,
          },
        });

        // --- FLOODS ---
        map.addLayer({
          id: 'flood-halo',
          type: 'circle',
          source: 'hazard-events',
          filter: ['==', ['get', 'type'], 'flood'],
          paint: {
            'circle-color': '#6366F1',
            'circle-radius': 20,
            'circle-opacity': 0.45,
            'circle-blur': 0.8,
          },
        });
        map.addLayer({
          id: 'flood-points',
          type: 'circle',
          source: 'hazard-events',
          filter: ['==', ['get', 'type'], 'flood'],
          paint: {
            'circle-color': '#4F46E5',
            'circle-radius': 8.0,
            'circle-stroke-width': 2.0,
            'circle-stroke-color': '#1E1B4B',
            'circle-opacity': 1.0,
          },
        });

        // --- HIGH TEMP ---
        map.addLayer({
          id: 'high_temp-halo',
          type: 'circle',
          source: 'hazard-events',
          filter: ['==', ['get', 'type'], 'high_temp'],
          paint: {
            'circle-color': '#F43F5E',
            'circle-radius': 18,
            'circle-opacity': 0.45,
            'circle-blur': 0.8,
          },
        });
        map.addLayer({
          id: 'high_temp-points',
          type: 'circle',
          source: 'hazard-events',
          filter: ['==', ['get', 'type'], 'high_temp'],
          paint: {
            'circle-color': '#E11D48',
            'circle-radius': 7.5,
            'circle-stroke-width': 2.0,
            'circle-stroke-color': '#4C0519',
            'circle-opacity': 1.0,
          },
        });

        const targetInteractiveLayers = [
          'earthquake-points',
          'wildfire-points',
          'volcano-points',
          'cyclone-points',
          'flood-points',
          'high_temp-points',
        ];

        // Hover & Pointer Interaction
        targetInteractiveLayers.forEach((layerId) => {
          map.on('mouseenter', layerId, (e) => {
            map.getCanvas().style.cursor = 'pointer';
            if (e.features && e.features.length > 0) {
              const feat = e.features[0];
              const coords = (feat.geometry as any).coordinates.slice();
              const p = feat.properties as any;

              let typeBadge = '⚡ Earthquake';
              let badgeColor = 'text-red-400 border-red-500/40 bg-red-500/10';
              let metricStr = `M ${p.magnitude || 0} • Depth ${p.depthKm || 0} km`;

              if (p.type === 'wildfire') {
                typeBadge = '🔥 Wildfire';
                badgeColor = 'text-orange-400 border-orange-500/40 bg-orange-500/10';
                metricStr = p.wildfireAcres ? `${Number(p.wildfireAcres).toLocaleString()} Acres` : 'Thermal Front';
              } else if (p.type === 'volcano') {
                typeBadge = '🌋 Volcano';
                badgeColor = 'text-amber-400 border-amber-500/40 bg-amber-500/10';
                metricStr = p.volcanoAviationColor ? `Aviation Code: ${p.volcanoAviationColor}` : 'Active Eruption';
              } else if (p.type === 'cyclone') {
                typeBadge = '🌀 Cyclone';
                badgeColor = 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10';
                metricStr = p.cycloneWindSpeedKmh ? `${p.cycloneWindSpeedKmh} km/h • ${p.cycloneCategory || 'Tropical'}` : 'Vortex Stream';
              } else if (p.type === 'flood') {
                typeBadge = '🌊 Flood';
                badgeColor = 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10';
                metricStr = p.waterLevel ? `Water Level: ${p.waterLevel}` : 'Inundation Warning';
              } else if (p.type === 'high_temp') {
                typeBadge = '☀️ High Temp';
                badgeColor = 'text-rose-400 border-rose-500/40 bg-rose-500/10';
                metricStr = p.temperatureMax ? `Peak: ${p.temperatureMax}°C` : 'Extreme Heat Warning';
              }

              const distanceStr = p.distanceKm >= 0 ? `📍 ${Number(p.distanceKm).toLocaleString()} km from station` : '';

              if (!popupRef.current) {
                popupRef.current = new maplibregl.Popup({
                  closeButton: false,
                  closeOnClick: false,
                  offset: 14,
                });
              }

              popupRef.current
                .setLngLat(coords)
                .setHTML(`
                  <div class="space-y-1.5 min-w-[210px]">
                    <div class="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-1">
                      <span class="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border ${badgeColor}">
                        ${typeBadge}
                      </span>
                      <span class="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                        ${p.source || 'USGS'}
                      </span>
                    </div>
                    <div class="text-xs font-bold text-white leading-snug">
                      ${p.title || 'Planetary Geohazard Event'}
                    </div>
                    <div class="text-[11px] font-mono text-cyan-300 font-semibold">
                      ${metricStr}
                    </div>
                    ${
                      distanceStr
                        ? `<div class="text-[10px] text-slate-300 font-medium">${distanceStr}</div>`
                        : ''
                    }
                  </div>
                `)
                .addTo(map);
            }
          });

          map.on('mouseleave', layerId, () => {
            map.getCanvas().style.cursor = '';
            if (popupRef.current) {
              popupRef.current.remove();
            }
          });

          // Single Event Click -> Select & Notify
          map.on('click', layerId, (e) => {
            const features = map.queryRenderedFeatures(e.point, { layers: [layerId] });
            if (!features.length) return;
            const evId = features[0].properties.id;
            if (onSelectEvent) onSelectEvent(evId);
          });
        });
      } else {
        // Update data if source already exists
        const src = map.getSource('hazard-events') as maplibregl.GeoJSONSource;
        src.setData(hazardGeoJSON);
      }

      // 4. Doppler Radar Weather Raster Layer (RainViewer)
      if (activeWeatherOverlay === 'radar' && radarFrames.length > 0 && radarFrames[currentRadarFrameIndex]) {
        const frame = radarFrames[currentRadarFrameIndex];
        const radarTileUrl = `https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;

        if (map.getSource('radar-tiles')) {
          map.removeLayer('radar-raster-layer');
          map.removeSource('radar-tiles');
        }

        map.addSource('radar-tiles', {
          type: 'raster',
          tiles: [radarTileUrl],
          tileSize: 256,
          attribution: 'RainViewer Realtime Radar',
        });

        // Place radar raster below vector markers
        map.addLayer(
          {
            id: 'radar-raster-layer',
            type: 'raster',
            source: 'radar-tiles',
            paint: {
              'raster-opacity': 0.75,
              'raster-fade-duration': 150,
            },
          },
          'earthquake-halo' // Insert before hazard points
        );
      } else if (map.getLayer('radar-raster-layer')) {
        map.removeLayer('radar-raster-layer');
        if (map.getSource('radar-tiles')) map.removeSource('radar-tiles');
      }

      // 5. Cloud Cover Raster Layer (OpenWeather / Satellite Infrared)
      if (activeWeatherOverlay === 'clouds') {
        const cloudsTileUrl = 'https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=';
        if (!map.getSource('clouds-tiles')) {
          map.addSource('clouds-tiles', {
            type: 'raster',
            tiles: [cloudsTileUrl],
            tileSize: 256,
            attribution: 'Clouds Telemetry',
          });

          map.addLayer(
            {
              id: 'clouds-raster-layer',
              type: 'raster',
              source: 'clouds-tiles',
              paint: {
                'raster-opacity': 0.65,
              },
            },
            'earthquake-halo'
          );
        }
      } else if (map.getLayer('clouds-raster-layer')) {
        map.removeLayer('clouds-raster-layer');
        if (map.getSource('clouds-tiles')) map.removeSource('clouds-tiles');
      }
    },
    [
      showTectonicPlates,
      currentLocation,
      proximityRadiusKm,
      showProximityRing,
      filteredEvents,
      activeWeatherOverlay,
      radarFrames,
      currentRadarFrameIndex,
      onSelectEvent,
    ]
  );

  // Initialize MapLibre GL Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCenter: [number, number] = currentLocation
      ? [currentLocation.lon, currentLocation.lat]
      : [0, 20];
    const initialZoom = currentLocation ? 2.5 : 1.5;

    const styleUrl = getMapStyleUrl(currentStyle);

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrl as any,
      center: initialCenter,
      zoom: initialZoom,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
      renderWorldCopies: true,
      maxPitch: 65,
    });

    mapRef.current = map;

    // Add minimal navigation & attribution controls
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    map.on('load', () => {
      setupLayers(map);
      setTimeout(() => map.resize(), 100);
      setTimeout(() => map.resize(), 500);
    });

    map.on('style.load', () => {
      setupLayers(map);
      setTimeout(() => map.resize(), 50);
    });

    map.on('error', (e) => {
      console.warn('MapLibre style/network notification (fallback active):', e);
    });

    // Initial resize trigger
    setTimeout(() => map.resize(), 150);

    // Resize observer to handle container fluid responsiveness
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update style when currentStyle changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const styleUrl = getMapStyleUrl(currentStyle);
    map.setStyle(styleUrl as any);
  }, [currentStyle]);

  // Update layers whenever dependencies change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    setupLayers(map);
  }, [setupLayers]);

  // Synchronize High-Visibility Glowing DOM Hazard Markers & Beacons
  const hazardMarkersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing markers
    hazardMarkersRef.current.forEach((m) => m.remove());
    hazardMarkersRef.current = [];

    const validEvents = filteredEvents.filter(
      (e) =>
        typeof e.lat === 'number' &&
        typeof e.lon === 'number' &&
        !isNaN(e.lat) &&
        !isNaN(e.lon)
    );

    const newMarkers: maplibregl.Marker[] = [];

    validEvents.forEach((ev) => {
      const isSelected = ev.id === selectedEventId;
      const el = document.createElement('div');
      el.className = 'hazard-marker-beacon group relative flex items-center justify-center';
      el.style.zIndex = isSelected ? '45' : ev.severity === 'critical' || (ev.magnitude && ev.magnitude >= 6) ? '35' : '25';

      // Color scheme based on hazard type & magnitude
      let bgGradient = 'from-red-600 via-red-500 to-rose-700';
      let pingColor = 'bg-red-500/40';
      let iconOrTag = `M ${ev.magnitude ? ev.magnitude.toFixed(1) : '4.5'}`;
      let borderColor = 'border-red-400/80';
      let ringGlow = 'shadow-[0_0_15px_rgba(239,68,68,0.7)]';

      if (ev.type === 'wildfire') {
        bgGradient = 'from-orange-600 via-amber-500 to-orange-700';
        pingColor = 'bg-orange-500/50';
        iconOrTag = '🔥 Fire';
        borderColor = 'border-orange-300';
        ringGlow = 'shadow-[0_0_15px_rgba(249,115,22,0.7)]';
      } else if (ev.type === 'volcano') {
        bgGradient = 'from-amber-600 via-yellow-500 to-amber-700';
        pingColor = 'bg-yellow-400/50';
        iconOrTag = '🌋 Volcano';
        borderColor = 'border-amber-300';
        ringGlow = 'shadow-[0_0_15px_rgba(234,179,8,0.7)]';
      } else if (ev.type === 'cyclone') {
        bgGradient = 'from-cyan-600 via-teal-500 to-blue-700';
        pingColor = 'bg-cyan-400/50';
        iconOrTag = '🌀 Storm';
        borderColor = 'border-cyan-300';
        ringGlow = 'shadow-[0_0_15px_rgba(6,182,212,0.7)]';
      } else {
        // Earthquake magnitude coloring
        const mag = ev.magnitude || 4.5;
        if (mag >= 6.5) {
          bgGradient = 'from-red-600 via-rose-500 to-red-800';
          pingColor = 'bg-red-500/60';
          ringGlow = 'shadow-[0_0_20px_rgba(239,68,68,0.85)]';
        } else if (mag >= 5.0) {
          bgGradient = 'from-amber-600 via-orange-500 to-amber-700';
          pingColor = 'bg-amber-500/50';
          ringGlow = 'shadow-[0_0_14px_rgba(245,158,11,0.65)]';
        } else {
          bgGradient = 'from-emerald-600 via-teal-500 to-emerald-800';
          pingColor = 'bg-emerald-500/40';
          ringGlow = 'shadow-[0_0_10px_rgba(16,185,129,0.5)]';
        }
      }

      el.innerHTML = `
        <div class="relative flex items-center justify-center cursor-pointer w-4 h-4">
          <!-- Animated Pulsing Outer Wave -->
          <span class="hazard-pulse-ring absolute -inset-1 rounded-full ${pingColor}"></span>
          
          ${
            isSelected
              ? `
            <!-- Focused Targeting Reticle Ring -->
            <span class="absolute -inset-3 rounded-full border border-cyan-300 animate-spin-slow"></span>
            <span class="absolute -inset-1.5 rounded-full bg-cyan-400/25 animate-ping"></span>
          `
              : ''
          }

          <!-- Small Colored Dot -->
          <div class="relative w-2.5 h-2.5 rounded-full bg-gradient-to-r ${bgGradient} border ${borderColor} ${ringGlow} shadow-lg shadow-black/50">
          </div>
        </div>
      `;

      // Hover Tooltip Popup
      el.addEventListener('mouseenter', () => {
        let typeBadge = '⚡ Earthquake';
        let badgeColor = 'text-red-400 border-red-500/40 bg-red-500/10';
        let metricStr = `M ${ev.magnitude || 0} • Depth ${ev.depthKm || 0} km`;

        if (ev.type === 'wildfire') {
          typeBadge = '🔥 Wildfire';
          badgeColor = 'text-orange-400 border-orange-500/40 bg-orange-500/10';
          metricStr = ev.wildfireAcres ? `${Number(ev.wildfireAcres).toLocaleString()} Acres` : 'Active Fire Perimeter';
        } else if (ev.type === 'volcano') {
          typeBadge = '🌋 Volcano';
          badgeColor = 'text-amber-400 border-amber-500/40 bg-amber-500/10';
          metricStr = ev.volcanoAviationColor ? `Aviation Code: ${ev.volcanoAviationColor}` : 'Active Caldera / Plume';
        } else if (ev.type === 'cyclone') {
          typeBadge = '🌀 Cyclone';
          badgeColor = 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10';
          metricStr = ev.cycloneWindSpeedKmh ? `${ev.cycloneWindSpeedKmh} km/h • ${ev.cycloneCategory || 'Tropical Cyclone'}` : 'Vortex Storm Stream';
        }

        const distanceStr =
          typeof ev.distanceKm === 'number' && ev.distanceKm >= 0
            ? `📍 ${Math.round(ev.distanceKm).toLocaleString()} km from station`
            : '';

        if (!popupRef.current) {
          popupRef.current = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 16,
          });
        }

        popupRef.current
          .setLngLat([ev.lon, ev.lat])
          .setHTML(`
            <div class="space-y-1.5 min-w-[210px]">
              <div class="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-1">
                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border ${badgeColor}">
                  ${typeBadge}
                </span>
                <span class="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                  ${ev.source || 'USGS'}
                </span>
              </div>
              <div class="text-xs font-bold text-white leading-snug">
                ${ev.title || 'Planetary Geohazard Event'}
              </div>
              <div class="text-[11px] font-mono text-cyan-300 font-semibold">
                ${metricStr}
              </div>
              ${distanceStr ? `<div class="text-[10px] text-slate-300 font-medium">${distanceStr}</div>` : ''}
            </div>
          `)
          .addTo(map);
      });

      el.addEventListener('mouseleave', () => {
        if (popupRef.current) popupRef.current.remove();
      });

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onSelectEvent) onSelectEvent(ev.id);
        map.flyTo({
          center: [ev.lon, ev.lat],
          zoom: Math.max(map.getZoom(), 4.5),
          duration: 900,
        });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([ev.lon, ev.lat])
        .addTo(map);

      newMarkers.push(marker);
    });

    hazardMarkersRef.current = newMarkers;

    return () => {
      newMarkers.forEach((m) => m.remove());
    };
  }, [filteredEvents, selectedEventId, onSelectEvent]);

  // Update User Station Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !currentLocation) return;

    if (stationMarkerRef.current) {
      stationMarkerRef.current.remove();
    }

    // Create custom Station Pulse DOM Node
    const el = document.createElement('div');
    el.className = 'station-marker-container';
    el.innerHTML = `
      <div class="relative flex items-center justify-center pointer-events-none">
        <span class="absolute w-8 h-8 rounded-full bg-cyan-400/30 animate-ping"></span>
        <span class="absolute w-4 h-4 rounded-full bg-cyan-500/50"></span>
        <span class="relative w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-white shadow-lg shadow-cyan-500/60"></span>
      </div>
    `;

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([currentLocation.lon, currentLocation.lat])
      .addTo(map);

    stationMarkerRef.current = marker;

    return () => {
      marker.remove();
    };
  }, [currentLocation]);

  // Focus and Fly-To when selectedEventId changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedEventId) return;

    const ev = events.find((e) => e.id === selectedEventId);
    if (ev) {
      map.flyTo({
        center: [ev.lon, ev.lat],
        zoom: Math.max(map.getZoom(), 4.5),
        duration: 1200,
        essential: true,
      });
    }
  }, [selectedEventId, events]);

  // Camera Actions
  const handleZoomIn = () => {
    mapRef.current?.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut({ duration: 300 });
  };

  const handleResetView = () => {
    mapRef.current?.flyTo({
      center: currentLocation ? [currentLocation.lon, currentLocation.lat] : [0, 20],
      zoom: currentLocation ? 2.5 : 1.5,
      pitch: 0,
      bearing: 0,
      duration: 1000,
    });
    setPitch(0);
    if (onSelectEvent) onSelectEvent(null);
  };

  const handleCenterLocation = () => {
    if (!currentLocation || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [currentLocation.lon, currentLocation.lat],
      zoom: 5.5,
      duration: 1200,
    });
  };

  const handleToggle3DPitch = () => {
    if (!mapRef.current) return;
    const newPitch = pitch === 0 ? 50 : 0;
    mapRef.current.easeTo({ pitch: newPitch, duration: 600 });
    setPitch(newPitch);
  };

  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleFlyToCoords = (lat: number, lon: number) => {
    mapRef.current?.flyTo({
      center: [lon, lat],
      zoom: 6,
      duration: 1000,
    });
  };

  return (
    <div
      id="weatherguard-map-container"
      className={`relative w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800/90 bg-[#06090F] select-none transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-0' : heightClass
      } ${className}`}
    >
      {/* MapLibre Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top and Bottom HUD Controls */}
      {enableHUD && (
        <MapHUDControls
          currentStyle={currentStyle}
          onSelectStyle={setCurrentStyle}
          selectedDisasterType={selectedDisasterType}
          onSelectDisasterType={handleSelectDisasterType}
          activeWeatherOverlay={activeWeatherOverlay}
          onSelectWeatherOverlay={setActiveWeatherOverlay}
          timeFilter={timeFilter}
          onSelectTimeFilter={setTimeFilter}
          showTectonicPlates={showTectonicPlates}
          onToggleTectonicPlates={() => setShowTectonicPlates((prev) => !prev)}
          showProximityRing={showProximityRing}
          onToggleProximityRing={() => setShowProximityRing((prev) => !prev)}
          proximityRadiusKm={proximityRadiusKm}
          onSelectProximityRadius={setProximityRadiusKm}
          currentLocation={currentLocation}
          onCenterLocation={handleCenterLocation}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onResetView={handleResetView}
          totalEventsCount={events.length}
          filteredEventsCount={filteredEvents.length}
          radarFrames={radarFrames}
          currentRadarFrameIndex={currentRadarFrameIndex}
          onSelectRadarFrameIndex={setCurrentRadarFrameIndex}
          isRadarPlaying={isRadarPlaying}
          onToggleRadarPlay={() => setIsRadarPlaying((prev) => !prev)}
          pitch={pitch}
          onToggle3DPitch={handleToggle3DPitch}
        />
      )}

      {/* Event Details Drawer */}
      <EventDetailDrawer
        event={selectedEvent}
        onClose={() => onSelectEvent && onSelectEvent(null)}
        onFlyTo={handleFlyToCoords}
        currentLocation={currentLocation}
      />

      {/* Quick Bottom Right Zoom Controls */}
      <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 bg-slate-950/90 backdrop-blur-xl p-1 rounded-2xl border border-slate-700/80 shadow-2xl">
        <button
          onClick={handleZoomIn}
          className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={15} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={15} />
        </button>
        <button
          onClick={handleResetView}
          className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition-colors"
          title="Reset Map Horizon & Pitch"
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </div>
  );
};
