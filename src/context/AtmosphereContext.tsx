import React, { createContext, useContext, useMemo } from 'react';
import { CurrentWeatherPayload, GeoLocationItem, AmbientSimulationMode } from '../types';
import { useLocation } from './LocationContext';
import { usePreferences } from './PreferencesContext';
import { useWeather } from '../hooks/useWeather';
import {
  computeAtmosphereState,
  getSkyPalette,
  ComputedAtmosphereState,
  SkyPalette,
} from '../components/effects/AtmosphereSkyEngine';

export interface AtmosphereContextType {
  atmosphereState: ComputedAtmosphereState;
  palette: SkyPalette;
  cssGradient: string;
  ambientGlowCss: string;
  weather: CurrentWeatherPayload | null;
  currentLocation: GeoLocationItem;
  simulationMode: AmbientSimulationMode;
  setSimulationMode: (mode: AmbientSimulationMode) => void;
  isNight: boolean;
  isSunriseSunset: boolean;
  isStorm: boolean;
  isRain: boolean;
  isSnow: boolean;
  isFog: boolean;
}

const AtmosphereContext = createContext<AtmosphereContextType | undefined>(undefined);

interface AtmosphereProviderProps {
  children: React.ReactNode;
  weather?: CurrentWeatherPayload | null;
}

export const AtmosphereProvider: React.FC<AtmosphereProviderProps> = ({
  children,
  weather: explicitWeather,
}) => {
  const { currentLocation } = useLocation();
  const { preferences, updatePreferences } = usePreferences();

  const setSimulationMode = (mode: AmbientSimulationMode) => {
    updatePreferences({ ambientSimulationMode: mode });
  };

  // Ingest weather data for currentLocation if not explicitly provided
  const fetchedWeather = useWeather(
    currentLocation,
    preferences.refreshIntervalMinutes
  );

  const activeWeather = explicitWeather !== undefined ? explicitWeather : fetchedWeather.data;

  // Compute atmosphere state based on currentLocation weather & simulation mode
  const atmosphereState = useMemo<ComputedAtmosphereState>(() => {
    return computeAtmosphereState(activeWeather, preferences.ambientSimulationMode);
  }, [activeWeather, preferences.ambientSimulationMode]);

  // Compute Sky Palette
  const palette = useMemo<SkyPalette>(() => {
    return getSkyPalette(atmosphereState);
  }, [atmosphereState]);

  // Compute rich CSS Linear Gradient for Sky
  const cssGradient = useMemo(() => {
    return `linear-gradient(180deg, ${palette.top} 0%, ${palette.mid} 38%, ${palette.bottom} 74%, ${palette.horizon} 100%)`;
  }, [palette]);

  // Compute CSS Radial Glow for Solar / Lunar / Storm ambience
  const ambientGlowCss = useMemo(() => {
    switch (atmosphereState) {
      case 'sunrise':
        return 'radial-gradient(circle at 80% 35%, rgba(251, 146, 60, 0.45) 0%, rgba(244, 114, 182, 0.2) 35%, rgba(0, 0, 0, 0) 70%)';
      case 'golden_hour':
        return 'radial-gradient(circle at 75% 25%, rgba(252, 211, 77, 0.4) 0%, rgba(245, 158, 11, 0.2) 40%, rgba(0, 0, 0, 0) 70%)';
      case 'sunset':
        return 'radial-gradient(circle at 80% 38%, rgba(249, 115, 22, 0.45) 0%, rgba(157, 23, 77, 0.25) 45%, rgba(0, 0, 0, 0) 75%)';
      case 'dusk':
        return 'radial-gradient(circle at 75% 45%, rgba(168, 85, 247, 0.3) 0%, rgba(67, 56, 202, 0.15) 50%, rgba(0, 0, 0, 0) 80%)';
      case 'thunderstorm':
        return 'radial-gradient(circle at 50% 20%, rgba(192, 132, 252, 0.28) 0%, rgba(99, 102, 241, 0.18) 40%, rgba(0, 0, 0, 0) 75%)';
      case 'light_rain':
      case 'heavy_rain':
      case 'rainy_night':
        return 'radial-gradient(circle at 60% 30%, rgba(56, 189, 248, 0.2) 0%, rgba(30, 41, 59, 0.35) 50%, rgba(0, 0, 0, 0) 80%)';
      case 'snow':
        return 'radial-gradient(circle at 50% 30%, rgba(224, 242, 254, 0.35) 0%, rgba(148, 163, 184, 0.15) 50%, rgba(0, 0, 0, 0) 80%)';
      case 'fog':
        return 'radial-gradient(circle at 50% 50%, rgba(203, 213, 225, 0.25) 0%, rgba(100, 116, 139, 0.2) 60%, rgba(0, 0, 0, 0) 90%)';
      case 'aurora':
        return 'radial-gradient(circle at 50% 15%, rgba(52, 211, 153, 0.35) 0%, rgba(168, 85, 247, 0.2) 45%, rgba(0, 0, 0, 0) 75%)';
      case 'clear_night':
      case 'cloudy_night':
        return 'radial-gradient(circle at 82% 18%, rgba(199, 210, 254, 0.25) 0%, rgba(99, 102, 241, 0.08) 35%, rgba(0, 0, 0, 0) 65%)';
      case 'clear_day':
      default:
        return 'radial-gradient(circle at 80% 18%, rgba(255, 245, 157, 0.35) 0%, rgba(56, 189, 248, 0.15) 45%, rgba(0, 0, 0, 0) 75%)';
    }
  }, [atmosphereState]);

  const isNight = palette.isNight;
  const isSunriseSunset = palette.isSunriseSunset;
  const isStorm = atmosphereState === 'thunderstorm';
  const isRain =
    atmosphereState === 'light_rain' ||
    atmosphereState === 'heavy_rain' ||
    atmosphereState === 'rainy_night';
  const isSnow = atmosphereState === 'snow';
  const isFog = atmosphereState === 'fog';

  const value = useMemo<AtmosphereContextType>(() => {
    return {
      atmosphereState,
      palette,
      cssGradient,
      ambientGlowCss,
      weather: activeWeather,
      currentLocation,
      simulationMode: preferences.ambientSimulationMode,
      setSimulationMode,
      isNight,
      isSunriseSunset,
      isStorm,
      isRain,
      isSnow,
      isFog,
    };
  }, [
    atmosphereState,
    palette,
    cssGradient,
    ambientGlowCss,
    activeWeather,
    currentLocation,
    preferences.ambientSimulationMode,
    setSimulationMode,
    isNight,
    isSunriseSunset,
    isStorm,
    isRain,
    isSnow,
    isFog,
  ]);

  return (
    <AtmosphereContext.Provider value={value}>
      {children}
    </AtmosphereContext.Provider>
  );
};

export function useAtmosphere(): AtmosphereContextType {
  const context = useContext(AtmosphereContext);
  if (!context) {
    throw new Error('useAtmosphere must be used within an AtmosphereProvider');
  }
  return context;
}
