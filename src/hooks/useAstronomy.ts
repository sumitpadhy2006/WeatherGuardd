import { useState, useEffect, useCallback, useRef } from 'react';
import { GeoLocationItem } from '../types';
import { SkyOverviewPayload } from '../types/astronomy';

interface UseAstronomyOptions {
  currentLocation: GeoLocationItem | null;
  autoRefreshIntervalSeconds?: number;
}

export function useAstronomy({
  currentLocation,
  autoRefreshIntervalSeconds = 120,
}: UseAstronomyOptions) {
  const [data, setData] = useState<SkyOverviewPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // Time machine simulation scrubber offset in hours (-12 to +12)
  const [simulatedHourOffset, setSimulatedHourOffset] = useState<number>(0);

  const fetchOverview = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setIsRefreshing(true);
      else if (!data) setIsLoading(true);

      try {
        const lat = currentLocation?.lat ?? 37.7749;
        const lon = currentLocation?.lon ?? -122.4194;

        const res = await fetch(`/api/astronomy/overview?lat=${lat}&lon=${lon}`);
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        const json: SkyOverviewPayload = await res.json();

        setData(json);
        setLastUpdated(json.lastUpdated || Date.now());
        setError(null);
      } catch (err: any) {
        console.error('Error fetching astronomy telemetry:', err);
        setError(err.message || 'Failed to load celestial data');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentLocation?.lat, currentLocation?.lon, data]
  );

  useEffect(() => {
    fetchOverview();
  }, [currentLocation?.lat, currentLocation?.lon]);

  // Periodic automatic sync
  useEffect(() => {
    if (autoRefreshIntervalSeconds <= 0) return;
    const interval = setInterval(() => {
      fetchOverview(false);
    }, autoRefreshIntervalSeconds * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshIntervalSeconds, fetchOverview]);

  return {
    data,
    sun: data?.sun || null,
    moon: data?.moon || null,
    planets: data?.planets || [],
    constellations: data?.constellations || [],
    meteorShowers: data?.meteorShowers || [],
    eclipses: data?.eclipses || [],
    stargazingScore: data?.stargazingScore || null,
    apod: data?.apod || null,
    neoAsteroids: data?.neoAsteroids || [],
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh: () => fetchOverview(true),
    simulatedHourOffset,
    setSimulatedHourOffset,
  };
}
