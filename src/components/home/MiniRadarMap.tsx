import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getMapStyleUrl, fetchRainViewerRadar } from '../../utils/mapStyles';

interface MiniRadarMapProps {
  lat: number;
  lon: number;
  locationName: string;
}

export const MiniRadarMap: React.FC<MiniRadarMapProps> = ({ lat, lon, locationName }) => {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [isRadarAvailable, setIsRadarAvailable] = useState<boolean>(true);

  // Initialize MapLibre
  const mapContainerCallback = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      if (mapRef.current) return;

      node.style.width = '100%';
      node.style.height = '100%';

      try {
        // Use hybrid satellite style to ensure the map is always visually rich and never looks 'blank' at high zoom levels
        const styleUrl = getMapStyleUrl('hybrid');
        
        const map = new maplibregl.Map({
          container: node,
          style: styleUrl as any,
          center: [lon, lat],
          zoom: 10,
          pitch: 0,
          bearing: 0,
          attributionControl: false,
          interactive: true, // Allow user to pan/zoom
          maxPitch: 60,
        });

        // Add minimal zoom controls
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

        // Add Marker
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.innerHTML = `
          <div class="relative flex flex-col items-center">
            <div class="relative flex items-center justify-center">
              <span class="absolute w-6 h-6 rounded-full bg-cyan-400/30 animate-ping"></span>
              <div class="w-3 h-3 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
            </div>
            <div class="mt-1 px-2 py-0.5 rounded bg-slate-900/90 border border-white/20 text-[10px] font-mono text-white shadow-md backdrop-blur-sm whitespace-nowrap">
              ${locationName}
            </div>
          </div>
        `;
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([lon, lat])
          .addTo(map);
        markerRef.current = marker;

        map.on('load', async () => {
          map.resize();
          
          try {
            // Fetch live radar
            const data = await fetchRainViewerRadar();
            if (data && data.radar) {
              const frames = [...(data.radar.past || []), ...(data.radar.nowcast || [])];
              if (frames.length > 0) {
                // Get the most recent/relevant frame
                const latestFrame = frames[frames.length - 1];
                const radarTileUrl = `https://tilecache.rainviewer.com${latestFrame.path}/256/{z}/{x}/{y}/2/1_1.png`;

                if (!map.getSource('radar-tiles')) {
                  map.addSource('radar-tiles', {
                    type: 'raster',
                    tiles: [radarTileUrl],
                    tileSize: 256,
                    attribution: 'RainViewer',
                  });

                  map.addLayer(
                    {
                      id: 'radar-raster-layer',
                      type: 'raster',
                      source: 'radar-tiles',
                      paint: {
                        'raster-opacity': 0.75,
                        'raster-fade-duration': 300,
                      },
                    }
                  );
                }
              }
            } else {
              setIsRadarAvailable(false);
            }
          } catch (err) {
            console.error('[MiniRadarMap] Failed to load radar:', err);
            setIsRadarAvailable(false);
          }
        });

        const observer = new ResizeObserver(() => {
          if (map) map.resize();
        });
        observer.observe(node);

        mapRef.current = map;

        map.once('remove', () => {
          observer.disconnect();
        });
      } catch (err) {
        console.error('[MiniRadarMap] Init failed', err);
      }
    },
    [lat, lon] // We recreate the callback only if initial coordinates change entirely.
  );

  // Update center when lat/lon props change dynamically
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [lon, lat], zoom: 10, duration: 1000 });
      if (markerRef.current) {
        markerRef.current.setLngLat([lon, lat]);
      }
    }
  }, [lat, lon]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-950 border border-white/5">
      <div ref={mapContainerCallback} className="absolute inset-0 z-0" />

      {/* Status Badges */}
      {!isRadarAvailable && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-mono shadow-md backdrop-blur-md z-10 pointer-events-none">
          RADAR UNAVAILABLE
        </div>
      )}
    </div>
  );
};
