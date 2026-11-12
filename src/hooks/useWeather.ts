import { useState, useEffect, useCallback } from 'react';
import { CurrentWeatherPayload, GeoLocationItem } from '../types';

interface UseWeatherReturn {
  data: CurrentWeatherPayload | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: number | null;
}

export function useWeather(location: GeoLocationItem | null, refreshIntervalMinutes: number = 10): UseWeatherReturn {
  const [data, setData] = useState<CurrentWeatherPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const fetchWeather = useCallback(async (isManualRefresh = false) => {
    if (!location) {
      setIsLoading(false);
      return;
    }

    if (isManualRefresh) setIsRefreshing(true);
    else if (!data) setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        lat: location.lat.toString(),
        lon: location.lon.toString(),
        name: location.name,
      });

      const response = await fetch(`/api/weather?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`Weather telemetry server returned ${response.status}`);
      }

      const result: CurrentWeatherPayload = await response.json();
      setData(result);
      setLastUpdated(Date.now());
    } catch (err: any) {
      setError(err.message || 'Failed to ingest weather telemetry.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [location?.lat, location?.lon, location?.name]);

  useEffect(() => {
    fetchWeather();

    const intervalMs = Math.max(2, refreshIntervalMinutes) * 60 * 1000;
    const timer = setInterval(() => {
      fetchWeather();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [fetchWeather, refreshIntervalMinutes]);

  const refresh = async () => {
    await fetchWeather(true);
  };

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    refresh,
    lastUpdated,
  };
}
