import React, { useEffect, useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { MapPin, Navigation } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelected: (lat: number, lon: number) => void;
}

// Component to handle map interactions
const MapController = ({ 
  setCenter, 
  currentLocation 
}: { 
  setCenter: (c: { lat: number; lon: number }) => void;
  currentLocation: any;
}) => {
  const map = useMap();
  
  // Track center when dragging finishes
  useMapEvents({
    moveend: () => {
      const c = map.getCenter();
      setCenter({ lat: c.lat, lon: c.lng });
    }
  });

  // Force map invalidation on mount to fix modal rendering issues
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
};

export const MapPickerModal: React.FC<MapPickerModalProps> = ({ isOpen, onClose, onLocationSelected }) => {
  const { currentLocation } = useLocation();
  const [center, setCenter] = useState<{ lat: number; lon: number } | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      const initialCenter = currentLocation ? [currentLocation.lon, currentLocation.lat] : [0, 20];
      setCenter({ lat: initialCenter[1], lon: initialCenter[0] });
    }
  }, [isOpen, currentLocation]);

  const handleConfirm = () => {
    if (!center) return;
    setIsConfirming(true);
    onLocationSelected(center.lat, center.lon);
    setIsConfirming(false);
    onClose();
  };

  const handleCurrentGPS = () => {
    if (navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition((pos) => {
        mapRef.current.setView([pos.coords.latitude, pos.coords.longitude], 12);
      });
    }
  };

  const initialLat = currentLocation ? currentLocation.lat : 20;
  const initialLon = currentLocation ? currentLocation.lon : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pick on Map" subtitle="Drag the map to select a location" maxWidth="lg">
      <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-slate-700 bg-slate-900 z-10">
        
        {isOpen && (
          <MapContainer 
            center={[initialLat, initialLon]} 
            zoom={currentLocation ? 10 : 2} 
            zoomControl={false}
            style={{ width: '100%', height: '100%', zIndex: 1 }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController setCenter={setCenter} currentLocation={currentLocation} />
          </MapContainer>
        )}

        {/* Center Crosshair Marker */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="relative flex items-center justify-center -mt-8">
            <MapPin size={36} className="text-red-500 drop-shadow-md z-10" fill="currentColor" />
            <div className="absolute top-full w-2 h-2 bg-black/40 rounded-full blur-[2px]"></div>
          </div>
        </div>

        {/* GPS Button */}
        <button
          onClick={handleCurrentGPS}
          className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-lg backdrop-blur-sm border border-slate-700 shadow-lg transition-colors z-30"
          title="Go to Current Location"
        >
          <Navigation size={20} />
        </button>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm font-mono text-slate-400">
          {center ? `${center.lat.toFixed(4)}°, ${center.lon.toFixed(4)}°` : '---'}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="secondary" onClick={onClose} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!center || isConfirming} className="flex-1 sm:flex-none" icon={<MapPin size={16} />}>
            Confirm Location
          </Button>
        </div>
      </div>
    </Modal>
  );
};
