import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from '../../context/LocationContext';
import { usePreferences } from '../../context/PreferencesContext';
import { MapBasemapStyle } from '../../types/map';
import {
  ExplorerModeId,
  ExplorerPreset,
  ExplorerActiveLayers,
  TimelineState,
} from '../../types/explorer';
import { EXPLORER_LAYERS, EXPLORER_PRESETS } from '../../utils/weatherExplorerData';
import { ExplorerMap } from './ExplorerMap';
import { ExplorerTopBar } from './ExplorerTopBar';
import { ExplorerLayerBrowser } from './ExplorerLayerBrowser';
import { ExplorerLegend } from './ExplorerLegend';
import { ExplorerLocationInsight } from './ExplorerLocationInsight';
import { ExplorerTimeline } from './ExplorerTimeline';
import { GeoLocationItem } from '../../types';

interface WeatherExplorerPageProps {
  onNavigateEarthWatch?: () => void;
}

export const WeatherExplorerPage: React.FC<WeatherExplorerPageProps> = ({
  onNavigateEarthWatch,
}) => {
  const { currentLocation, setCurrentLocation } = useLocation();
  const { preferences } = usePreferences();

  // Active layer and presentation state
  const [activeMode, setActiveMode] = useState<ExplorerModeId>('rain_precip');
  const [activePreset, setActivePreset] = useState<ExplorerPreset>('standard');
  const [isLayerBrowserOpen, setIsLayerBrowserOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pitch, setPitch] = useState(0);
  const [isHudOpen, setIsHudOpen] = useState(false);

  // Inspected location (defaults to active location or clicked coordinate)
  const [inspectedLocation, setInspectedLocation] = useState<GeoLocationItem | undefined>(
    currentLocation || { id: 'mumbai', name: 'Mumbai', lat: 19.076, lon: 72.8777, country: 'IN' }
  );

  // Multi-layer stacking state
  const [activeLayers, setActiveLayers] = useState<ExplorerActiveLayers>({
    primaryMode: 'rain_precip',
    basemapStyle: 'hybrid',
    showWindParticles: true,
    showRadarOverlay: true,
    showCloudCover: false,
    showIsobars: false,
    showCurrentLocationMarker: true,
    layerOpacity: 0.85,
    particleSpeed: 1.0,
  });

  // Timeline / Temporal simulation state
  const [timeline, setTimeline] = useState<TimelineState>({
    isPlaying: false,
    playbackSpeed: 1,
    currentOffsetHours: 0,
    radarFrameIndex: 0,
    totalRadarFrames: 12,
    activeTimestamp: Date.now(),
    stepMinutes: 60,
  });

  // Sync currentLocation when it changes from global search
  useEffect(() => {
    if (currentLocation) {
      setInspectedLocation(currentLocation);
    }
  }, [currentLocation]);

  // Handle Preset selection
  const handleSelectPreset = (presetId: ExplorerPreset) => {
    const preset = EXPLORER_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setActivePreset(presetId);
    setActiveMode(preset.primaryMode);
    setActiveLayers((prev) => ({
      ...prev,
      primaryMode: preset.primaryMode,
      basemapStyle: preset.basemapStyle,
      showWindParticles: preset.showWindParticles,
      showRadarOverlay: preset.showRadarOverlay,
      showCloudCover: preset.showCloudCover,
      showIsobars: preset.showIsobars,
    }));
  };

  // Mode selection
  const handleSelectMode = (mode: ExplorerModeId) => {
    setActiveMode(mode);
    setActiveLayers((prev) => ({
      ...prev,
      primaryMode: mode,
      // Auto enable wind streamlines if wind mode is chosen
      showWindParticles: mode.startsWith('wind') || prev.showWindParticles,
      // Auto enable radar if rain mode is chosen
      showRadarOverlay: mode.startsWith('rain') || prev.showRadarOverlay,
    }));
  };

  // Basemap style selection
  const handleSelectBasemap = (style: MapBasemapStyle) => {
    setActiveLayers((prev) => ({ ...prev, basemapStyle: style }));
  };

  // Toggle overlay elements
  const handleToggleWindParticles = () => {
    setActiveLayers((prev) => ({ ...prev, showWindParticles: !prev.showWindParticles }));
  };

  const handleToggleRadar = () => {
    setActiveLayers((prev) => ({ ...prev, showRadarOverlay: !prev.showRadarOverlay }));
  };

  const handleToggleClouds = () => {
    setActiveLayers((prev) => ({ ...prev, showCloudCover: !prev.showCloudCover }));
  };

  const handleToggleIsobars = () => {
    setActiveLayers((prev) => ({ ...prev, showIsobars: !prev.showIsobars }));
  };

  const handleChangeOpacity = (opacity: number) => {
    setActiveLayers((prev) => ({ ...prev, layerOpacity: opacity }));
  };

  // Timeline handlers
  const handleTogglePlay = () => {
    setTimeline((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleSetOffsetHours = (hours: number) => {
    setTimeline((prev) => ({
      ...prev,
      currentOffsetHours: hours,
      isPlaying: false,
    }));
  };

  const handleSetSpeed = (speed: number) => {
    setTimeline((prev) => ({ ...prev, playbackSpeed: speed }));
  };

  const handleStep = (deltaHours: number) => {
    setTimeline((prev) => ({
      ...prev,
      currentOffsetHours: Math.max(-12, Math.min(72, prev.currentOffsetHours + deltaHours)),
      isPlaying: false,
    }));
  };

  const handleResetToNow = () => {
    setTimeline((prev) => ({
      ...prev,
      currentOffsetHours: 0,
      isPlaying: false,
    }));
  };

  // Map controls
  const handleToggle3D = () => {
    setPitch((prev) => (prev > 0 ? 0 : 50));
  };

  const handleResetView = () => {
    if (currentLocation) {
      setInspectedLocation({ ...currentLocation });
    }
    setPitch(0);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const activeLayerDef = EXPLORER_LAYERS[activeMode] || EXPLORER_LAYERS.rain_precip;

  return (
    <div
      id="weather-explorer-workspace"
      className="relative w-full h-[calc(100vh-4rem)] sm:h-[calc(100vh-4.5rem)] bg-[#060B14] overflow-hidden flex flex-col select-none"
    >
      {/* Top Floating Command Bar */}
      <ExplorerTopBar
        currentLocation={inspectedLocation}
        onSelectLocation={(loc) => {
          setInspectedLocation(loc);
          setCurrentLocation(loc);
        }}
        currentBasemap={activeLayers.basemapStyle}
        onSelectBasemap={handleSelectBasemap}
        activeMode={activeMode}
        onSelectMode={handleSelectMode}
        isLayerBrowserOpen={isLayerBrowserOpen}
        onToggleLayerBrowser={() => setIsLayerBrowserOpen(!isLayerBrowserOpen)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onResetView={handleResetView}
        isHudOpen={isHudOpen}
        onToggleHud={() => setIsHudOpen(!isHudOpen)}
      />

      {/* Main Map Canvas Area */}
      <div className="relative flex-1 w-full h-full">
        <ExplorerMap
          currentLocation={inspectedLocation}
          onMapClickLocation={(loc) => setInspectedLocation(loc)}
          activeMode={activeMode}
          activeLayers={activeLayers}
          timeline={timeline}
          pitch={pitch}
          onPitchChange={setPitch}
          heightClass="h-full w-full"
        />

        {/* Left Floating: Layer Browser Drawer (Desktop & Mobile) */}
        <div className="absolute top-16 left-3 bottom-20 z-20 pointer-events-none flex items-start">
          <div className="pointer-events-auto">
            <ExplorerLayerBrowser
              activeMode={activeMode}
              onSelectMode={handleSelectMode}
              activePreset={activePreset}
              onSelectPreset={handleSelectPreset}
              activeLayers={activeLayers}
              onToggleWindParticles={handleToggleWindParticles}
              onToggleRadar={handleToggleRadar}
              onToggleClouds={handleToggleClouds}
              onToggleIsobars={handleToggleIsobars}
              onNavigateEarthWatch={onNavigateEarthWatch}
              isOpen={isLayerBrowserOpen}
              onClose={() => setIsLayerBrowserOpen(false)}
            />
          </div>
        </div>

        {/* Right Floating HUD: Dynamic Legend & Inspected Location Card */}
        {isHudOpen && (
          <div className="absolute top-16 right-3 z-20 pointer-events-none flex flex-col gap-2.5 items-end">
            {/* Active Layer Legend */}
            <div className="pointer-events-auto">
              <ExplorerLegend
                layer={activeLayerDef}
                activeLayers={activeLayers}
                onChangeOpacity={handleChangeOpacity}
                onToggleWindParticles={handleToggleWindParticles}
                onToggleRadar={handleToggleRadar}
                onToggleClouds={handleToggleClouds}
                onToggleIsobars={handleToggleIsobars}
                isImperial={preferences.units === 'imperial'}
              />
            </div>

            {/* Inspected Point Telemetry Card */}
            {inspectedLocation && (
              <div className="pointer-events-auto">
                <ExplorerLocationInsight
                  location={inspectedLocation}
                  layer={activeLayerDef}
                  isImperial={preferences.units === 'imperial'}
                  onClose={() => setInspectedLocation(undefined)}
                  onCenterMap={handleResetView}
                />
              </div>
            )}
          </div>
        )}

        {/* Bottom Floating: Forecast / Radar Timeline Bar */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex justify-center pointer-events-none">
          <div className="pointer-events-auto w-full max-w-2xl">
            <ExplorerTimeline
              timeline={timeline}
              onTogglePlay={handleTogglePlay}
              onSetOffsetHours={handleSetOffsetHours}
              onSetSpeed={handleSetSpeed}
              onStep={handleStep}
              onResetToNow={handleResetToNow}
              locationTimezone={inspectedLocation?.timezone}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
