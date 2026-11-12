import React from 'react';
import { EarthWatchEvent, DisasterType, GeoLocationItem } from '../../types';
import { MapContainer } from '../maps/MapContainer';

export interface DisasterMapProps {
  events: EarthWatchEvent[];
  selectedEventId: string | null;
  onSelectEvent: (id: string | null) => void;
  currentLocation?: GeoLocationItem;
  selectedType: DisasterType;
  onSelectType: (type: DisasterType) => void;
}

export const DisasterMap: React.FC<DisasterMapProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
  currentLocation,
  selectedType,
  onSelectType,
}) => {
  return (
    <MapContainer
      events={events}
      selectedEventId={selectedEventId}
      onSelectEvent={onSelectEvent}
      currentLocation={currentLocation}
      initialDisasterType={selectedType}
      onSelectType={onSelectType}
      initialStyle="hybrid"
      enableHUD={true}
      heightClass="h-[460px] sm:h-[520px] lg:h-[580px]"
    />
  );
};
