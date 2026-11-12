import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  NearEarthObject,
  NeoOverviewPayload,
  NeoSortField,
  NeoSortOrder,
  NeoSizeFilter,
  NeoOrbitFilter,
} from '../types/neo';

export function useNearEarthObjects() {
  const [data, setData] = useState<NeoOverviewPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAsteroid, setSelectedAsteroid] = useState<NearEarthObject | null>(null);
  const [asteroidDetailsLoading, setAsteroidDetailsLoading] = useState<boolean>(false);

  // Filters and sorting
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hazardousOnly, setHazardousOnly] = useState<boolean>(false);
  const [subLunarOnly, setSubLunarOnly] = useState<boolean>(false);
  const [orbitFilter, setOrbitFilter] = useState<NeoOrbitFilter>('all');
  const [sizeFilter, setSizeFilter] = useState<NeoSizeFilter>('all');
  const [sortField, setSortField] = useState<NeoSortField>('distance');
  const [sortOrder, setSortOrder] = useState<NeoSortOrder>('asc');

  // Date Range state
  const [startDate, setStartDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  const fetchOverview = useCallback(async (start?: string, end?: string) => {
    setLoading(true);
    setError(null);
    try {
      const qStart = start || startDate;
      const qEnd = end || endDate;
      const res = await fetch(`/api/neo/overview?startDate=${qStart}&endDate=${qEnd}`);
      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: Failed to load asteroid telemetry`);
      }
      const json: NeoOverviewPayload = await res.json();
      setData(json);
    } catch (err: any) {
      console.error('Error fetching NEO telemetry:', err);
      setError(err.message || 'Failed to fetch Near Earth Object data');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  const selectAsteroidById = useCallback(async (id: string) => {
    setAsteroidDetailsLoading(true);
    try {
      const res = await fetch(`/api/neo/${encodeURIComponent(id)}`);
      if (res.ok) {
        const fullAsteroid: NearEarthObject = await res.json();
        setSelectedAsteroid(fullAsteroid);
      } else {
        // Fallback to local match
        if (data) {
          const match = data.asteroids.find((a) => a.id === id) ||
            data.famousAsteroids.find((a) => a.id === id) ||
            data.sentryWatchlist.find((a) => a.id === id);
          if (match) setSelectedAsteroid(match);
        }
      }
    } catch (err) {
      if (data) {
        const match = data.asteroids.find((a) => a.id === id) ||
          data.famousAsteroids.find((a) => a.id === id);
        if (match) setSelectedAsteroid(match);
      }
    } finally {
      setAsteroidDetailsLoading(false);
    }
  }, [data]);

  const setPresetDateRange = useCallback((days: number) => {
    const s = new Date();
    const e = new Date();
    e.setDate(e.getDate() + days);
    const startStr = s.toISOString().split('T')[0];
    const endStr = e.toISOString().split('T')[0];
    setStartDate(startStr);
    setEndDate(endStr);
    fetchOverview(startStr, endStr);
  }, [fetchOverview]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // Filtered & Sorted Asteroids
  const filteredAsteroids = useMemo(() => {
    if (!data) return [];
    let list = [...data.asteroids];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((a) =>
        a.name.toLowerCase().includes(q) ||
        a.designation.toLowerCase().includes(q) ||
        a.id.includes(q) ||
        (a.spectralType && a.spectralType.toLowerCase().includes(q))
      );
    }

    // Hazardous filter
    if (hazardousOnly) {
      list = list.filter((a) => a.is_potentially_hazardous_asteroid);
    }

    // Sub-lunar filter (< 1.0 LD)
    if (subLunarOnly) {
      list = list.filter((a) => a.hazardScore.closestMissDistanceLd < 1.0);
    }

    // Orbit class filter
    if (orbitFilter !== 'all') {
      list = list.filter((a) => a.orbital_data?.orbit_class?.orbit_class_type === orbitFilter);
    }

    // Size filter
    if (sizeFilter !== 'all') {
      list = list.filter((a) => {
        const d = a.estimated_diameter.meters.estimated_diameter_max;
        if (sizeFilter === 'small') return d < 25; // <25m (meteoroid)
        if (sizeFilter === 'medium') return d >= 25 && d < 140; // 25-140m (city impactor)
        if (sizeFilter === 'large') return d >= 140 && d < 1000; // 140m-1km (regional catastrophe / PHA standard)
        if (sizeFilter === 'city_killer') return d >= 50 && d < 300;
        if (sizeFilter === 'planet_killer') return d >= 1000; // >1km (global extinction class)
        return true;
      });
    }

    // Sorting
    list.sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      switch (sortField) {
        case 'distance':
          valA = a.hazardScore.closestMissDistanceLd;
          valB = b.hazardScore.closestMissDistanceLd;
          break;
        case 'size':
          valA = a.estimated_diameter.meters.estimated_diameter_max;
          valB = b.estimated_diameter.meters.estimated_diameter_max;
          break;
        case 'velocity':
          valA = a.hazardScore.velocityKms;
          valB = b.hazardScore.velocityKms;
          break;
        case 'hazardScore':
          valA = a.hazardScore.hazardSeverityIndex;
          valB = b.hazardScore.hazardSeverityIndex;
          break;
        case 'magnitude':
          valA = a.absolute_magnitude_h;
          valB = b.absolute_magnitude_h;
          break;
        case 'name':
          valA = a.name;
          valB = b.name;
          break;
        case 'date':
        default:
          valA = a.close_approach_data[0]?.epoch_date_close_approach || 0;
          valB = b.close_approach_data[0]?.epoch_date_close_approach || 0;
          break;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

    return list;
  }, [data, searchQuery, hazardousOnly, subLunarOnly, orbitFilter, sizeFilter, sortField, sortOrder]);

  return {
    data,
    loading,
    error,
    refresh: fetchOverview,
    selectedAsteroid,
    setSelectedAsteroid,
    selectAsteroidById,
    asteroidDetailsLoading,
    filteredAsteroids,
    searchQuery,
    setSearchQuery,
    hazardousOnly,
    setHazardousOnly,
    subLunarOnly,
    setSubLunarOnly,
    orbitFilter,
    setOrbitFilter,
    sizeFilter,
    setSizeFilter,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setPresetDateRange,
  };
}
