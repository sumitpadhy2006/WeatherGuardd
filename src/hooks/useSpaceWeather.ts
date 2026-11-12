import { useState, useEffect, useCallback, useRef } from 'react';
import { GeoLocationItem } from '../types';
import {
  SpaceWeatherOverviewPayload,
  SolarFlareItem,
  CmeItem,
  GeomagneticStormData,
  AuroraForecastData,
  SolarWindData,
  SpaceWeatherAlertItem,
  SolarCycleData,
} from '../types/spaceweather';

interface UseSpaceWeatherProps {
  currentLocation?: GeoLocationItem | null;
}

export function useSpaceWeather({ currentLocation }: UseSpaceWeatherProps = {}) {
  const [data, setData] = useState<SpaceWeatherOverviewPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  const isMountedRef = useRef<boolean>(true);

  const fetchTelemetry = useCallback(
    async (isManualRefresh: boolean = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const lat = currentLocation?.lat ?? 37.7749;
        const lon = currentLocation?.lon ?? -122.4194;

        const res = await fetch(`/api/spaceweather/overview?lat=${lat}&lon=${lon}`);
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        const json: SpaceWeatherOverviewPayload = await res.json();

        if (isMountedRef.current) {
          setData(json);
          setLastUpdated(json.lastUpdated || Date.now());
          setError(null);
        }
      } catch (err: any) {
        console.error('Error fetching space weather telemetry:', err);
        if (isMountedRef.current) {
          setError(err.message || 'Failed to retrieve space weather telemetry');
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [currentLocation?.lat, currentLocation?.lon]
  );

  useEffect(() => {
    isMountedRef.current = true;
    fetchTelemetry(false);

    // Auto refresh every 3 minutes
    const interval = setInterval(() => {
      fetchTelemetry(false);
    }, 180000);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchTelemetry]);

  return {
    data,
    solarFlares: data?.solarFlares ?? [],
    cmes: data?.cmes ?? [],
    geomagnetic: data?.geomagnetic ?? null,
    aurora: data?.aurora ?? null,
    solarWind: data?.solarWind ?? null,
    alerts: data?.alerts ?? [],
    solarCycle: data?.solarCycle ?? null,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh: () => fetchTelemetry(true),
  };
}
