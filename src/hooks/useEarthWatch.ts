import { useState, useEffect, useCallback, useMemo } from 'react';
import { EarthWatchEvent, EarthWatchSummaryStats, DisasterType, EarthWatchSeverity, GeoLocationItem } from '../types';
import { getCuratedPlanetaryEvents, computeEarthWatchStats, enrichEventsWithDistance } from '../utils/earthwatchFallback';

export interface UseEarthWatchOptions {
  currentLocation?: GeoLocationItem;
  autoRefreshIntervalSeconds?: number;
  initialType?: DisasterType;
}

export function useEarthWatch(options: UseEarthWatchOptions = {}) {
  const { currentLocation, autoRefreshIntervalSeconds = 60, initialType = 'all' } = options;

  // Initialize with curated planetary dataset immediately so UI is never blank
  const [events, setEvents] = useState<EarthWatchEvent[]>(() =>
    enrichEventsWithDistance(getCuratedPlanetaryEvents(), currentLocation?.lat, currentLocation?.lon)
  );
  const [stats, setStats] = useState<EarthWatchSummaryStats | null>(() =>
    computeEarthWatchStats(getCuratedPlanetaryEvents())
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(() => Date.now());

  // Filters & Sorting state
  const [selectedType, setSelectedType] = useState<DisasterType>(initialType);
  const [minMagnitude, setMinMagnitude] = useState<number>(2.5);
  const [selectedSeverity, setSelectedSeverity] = useState<EarthWatchSeverity | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recency' | 'severity' | 'distance' | 'magnitude'>('recency');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const fetchEarthWatchData = useCallback(
    async (isManual = false) => {
      if (isManual) setIsRefreshing(true);

      try {
        const queryParams = new URLSearchParams();
        if (currentLocation?.lat != null && currentLocation?.lon != null) {
          queryParams.set('lat', currentLocation.lat.toString());
          queryParams.set('lon', currentLocation.lon.toString());
        }

        const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
        const [eventsRes, statsRes] = await Promise.allSettled([
          fetch(`/api/earthwatch/events${queryStr}`),
          fetch(`/api/earthwatch/stats${queryStr}`),
        ]);

        let loadedEvents: EarthWatchEvent[] | null = null;
        let loadedStats: EarthWatchSummaryStats | null = null;

        if (eventsRes.status === 'fulfilled' && eventsRes.value.ok) {
          const eventsJson = await eventsRes.value.json();
          if (eventsJson.events && Array.isArray(eventsJson.events) && eventsJson.events.length > 0) {
            loadedEvents = eventsJson.events;
          }
        }

        if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
          const statsJson = await statsRes.value.json();
          if (statsJson && typeof statsJson === 'object') {
            loadedStats = statsJson;
          }
        }

        if (loadedEvents) {
          setEvents(loadedEvents);
          setStats(loadedStats || computeEarthWatchStats(loadedEvents));
          setError(null);
        } else {
          // If server returned empty or failed, gracefully use enriched curated events
          const fallbackEvents = enrichEventsWithDistance(
            getCuratedPlanetaryEvents(),
            currentLocation?.lat,
            currentLocation?.lon
          );
          setEvents((prev) => (prev.length > 0 ? prev : fallbackEvents));
          setStats((prev) => prev || computeEarthWatchStats(fallbackEvents));
        }

        setLastUpdated(Date.now());
      } catch (err: any) {
        console.warn('Earth Watch telemetry network notification (using fallback):', err);
        const fallbackEvents = enrichEventsWithDistance(
          getCuratedPlanetaryEvents(),
          currentLocation?.lat,
          currentLocation?.lon
        );
        setEvents((prev) => (prev.length > 0 ? prev : fallbackEvents));
        setStats((prev) => prev || computeEarthWatchStats(fallbackEvents));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentLocation?.lat, currentLocation?.lon]
  );

  // Initial fetch and auto refresh
  useEffect(() => {
    fetchEarthWatchData();

    if (autoRefreshIntervalSeconds > 0) {
      const interval = setInterval(() => {
        fetchEarthWatchData();
      }, autoRefreshIntervalSeconds * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchEarthWatchData, autoRefreshIntervalSeconds]);

  // Filtered & Sorted Events
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Filter by Type
      if (selectedType !== 'all' && event.type !== selectedType) {
        return false;
      }

      // Filter by Magnitude (for earthquakes)
      if (selectedType === 'earthquake' || event.type === 'earthquake') {
        if (event.magnitude != null && event.magnitude < minMagnitude) {
          return false;
        }
      }

      // Filter by Severity
      if (selectedSeverity !== 'all' && event.severity !== selectedSeverity) {
        return false;
      }

      // Filter by Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = event.title.toLowerCase().includes(q);
        const matchPlace = event.place.toLowerCase().includes(q);
        const matchPlate = event.tectonicPlate?.toLowerCase().includes(q) || false;
        const matchDesc = event.description?.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchPlace && !matchPlate && !matchDesc) {
          return false;
        }
      }

      return true;
    });
  }, [events, selectedType, minMagnitude, selectedSeverity, searchQuery]);

  const sortedEvents = useMemo(() => {
    const list = [...filteredEvents];

    list.sort((a, b) => {
      if (sortBy === 'recency') {
        return b.timestamp - a.timestamp;
      }

      if (sortBy === 'severity') {
        const severityRank = { critical: 4, warning: 3, watch: 2, advisory: 1 };
        const diff = (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
        if (diff !== 0) return diff;
        return b.timestamp - a.timestamp;
      }

      if (sortBy === 'distance') {
        const distA = a.distanceKm != null ? a.distanceKm : 999999;
        const distB = b.distanceKm != null ? b.distanceKm : 999999;
        return distA - distB;
      }

      if (sortBy === 'magnitude') {
        const magA = a.magnitude || (a.cycloneWindSpeedKmh ? a.cycloneWindSpeedKmh / 25 : 0);
        const magB = b.magnitude || (b.cycloneWindSpeedKmh ? b.cycloneWindSpeedKmh / 25 : 0);
        return magB - magA;
      }

      return 0;
    });

    return list;
  }, [filteredEvents, sortBy]);

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    return events.find((e) => e.id === selectedEventId) || null;
  }, [events, selectedEventId]);

  return {
    events,
    filteredEvents: sortedEvents,
    stats,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh: () => fetchEarthWatchData(true),

    // Controls
    selectedType,
    setSelectedType,
    minMagnitude,
    setMinMagnitude,
    selectedSeverity,
    setSelectedSeverity,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedEventId,
    setSelectedEventId,
    selectedEvent,
  };
}
