import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { GeoLocationItem } from '../types';
import { SavedPlaceLabel, SavedLocationRecord } from '../types/personalization';
import { useAuth } from './AuthContext';
import {
  saveSavedLocationToFirestore,
  deleteSavedLocationFromFirestore,
  subscribeToSavedLocations,
} from '../services/firebase';

export interface LocationItemWithMeta extends GeoLocationItem {
  placeLabel?: SavedPlaceLabel;
  alertEnabled?: boolean;
  isDefault?: boolean;
}

interface LocationContextType {
  currentLocation: LocationItemWithMeta;
  savedLocations: LocationItemWithMeta[];
  isLocating: boolean;
  locationError: string | null;
  setCurrentLocation: (loc: LocationItemWithMeta) => void;
  addSavedLocation: (loc: LocationItemWithMeta, label?: SavedPlaceLabel) => Promise<void>;
  removeSavedLocation: (id: string) => Promise<void>;
  updateLocationNickname: (
    id: string,
    nickname: string,
    category?: GeoLocationItem['category'],
    placeLabel?: SavedPlaceLabel
  ) => Promise<void>;
  toggleLocationAlert: (id: string, enabled?: boolean) => Promise<void>;
  setDefaultLocation: (id: string) => Promise<void>;
  detectCurrentGPS: () => Promise<void>;
  isCurrentLocationSaved: boolean;
  customTags: string[];
  addCustomTag: (tag: string) => void;
  removeCustomTag: (tag: string) => void;
}

const DEFAULT_LOCATION: LocationItemWithMeta = {
  id: 'loc_mumbai',
  name: 'Mumbai',
  country: 'IN',
  state: 'Maharashtra',
  lat: 19.076,
  lon: 72.8777,
  category: 'home',
  placeLabel: 'Home',
  timezone: 'Asia/Kolkata',
  isDefault: true,
  alertEnabled: true,
};

const PRELOADED_LOCATIONS: LocationItemWithMeta[] = [
  DEFAULT_LOCATION,
  {
    id: 'loc_seattle',
    name: 'Seattle',
    country: 'US',
    state: 'Washington',
    lat: 47.6062,
    lon: -122.3321,
    category: 'work',
    placeLabel: 'Office',
    timezone: 'America/Los_Angeles',
    alertEnabled: true,
  },
  {
    id: 'loc_london',
    name: 'London',
    country: 'GB',
    lat: 51.5074,
    lon: -0.1278,
    category: 'travel',
    placeLabel: 'Travel',
    timezone: 'Europe/London',
    nickname: 'Europe Office',
    alertEnabled: false,
  },
  {
    id: 'loc_tokyo',
    name: 'Tokyo',
    country: 'JP',
    lat: 35.6762,
    lon: 139.6503,
    category: 'observatory',
    placeLabel: 'Custom',
    timezone: 'Asia/Tokyo',
    nickname: 'Stargaze Site',
    alertEnabled: true,
  },
];

const DEFAULT_UNSET_LOCATION: LocationItemWithMeta = {
  id: 'loc_placeholder',
  name: 'Select Location',
  country: '',
  state: '',
  lat: 0,
  lon: 0,
  category: 'home',
  placeLabel: 'Home',
  timezone: 'UTC',
  isDefault: true,
  alertEnabled: false,
};

const STORAGE_SAVED_LOCS = 'weatherguard_saved_locations_v2';
const STORAGE_ACTIVE_LOC = 'weatherguard_active_location_v3';

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [savedLocations, setSavedLocationsState] = useState<LocationItemWithMeta[]>(() => {
    try {
      const stored = sessionStorage.getItem('weatherguard_session_saved_locs');
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignore
    }
    return [];
  });

  const setSavedLocations = useCallback((action: React.SetStateAction<LocationItemWithMeta[]>) => {
    setSavedLocationsState((prev) => {
      const nextState = typeof action === 'function' ? action(prev) : action;
      try {
        sessionStorage.setItem('weatherguard_session_saved_locs', JSON.stringify(nextState));
      } catch {
        // Ignore
      }
      return nextState;
    });
  }, []);

  const [currentLocation, setCurrentLocationState] = useState<LocationItemWithMeta>(() => {
    try {
      const stored = sessionStorage.getItem('weatherguard_session_location');
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignore
    }
    return DEFAULT_UNSET_LOCATION;
  });

  const [customTags, setCustomTagsState] = useState<string[]>(() => {
    try {
      const stored = sessionStorage.getItem('weatherguard_custom_tags');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const addCustomTag = useCallback((tag: string) => {
    setCustomTagsState(prev => {
      if (prev.includes(tag) || ['Home', 'Work', 'College', 'Institution', 'Travel', 'Custom'].includes(tag)) return prev;
      const next = [...prev, tag];
      try {
        sessionStorage.setItem('weatherguard_custom_tags', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const removeCustomTag = useCallback((tag: string) => {
    setCustomTagsState(prev => {
      const next = prev.filter(t => t !== tag);
      try {
        sessionStorage.setItem('weatherguard_custom_tags', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    // Completely wipe all location data from the browser's local storage per user request
    try {
      localStorage.removeItem('weatherguard_saved_locations_v2');
      localStorage.removeItem('weatherguard_active_location_v2');
      localStorage.removeItem('weatherguard_active_location_v3');
    } catch {
      // Ignore
    }
  }, []);

  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Firestore synchronization for authenticated user
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) return;

    const unsubscribe = subscribeToSavedLocations(user.uid, (firestoreLocations) => {
      if (firestoreLocations && firestoreLocations.length > 0) {
        const mapped: LocationItemWithMeta[] = firestoreLocations.map((item) => ({
          id: item.locationId,
          name: item.city,
          city: item.city,
          state: item.state,
          country: item.country,
          lat: item.latitude,
          lon: item.longitude,
          timezone: item.timezone,
          nickname: item.nickname,
          placeLabel: item.label,
          isDefault: item.isDefault,
          alertEnabled: item.alertEnabled !== false,
        }));
        setSavedLocations(mapped);

        // If current location matches default unset, set it to their firestore default (or first location)
        const defaultLoc = mapped.find((l) => l.isDefault) || mapped[0];
        if (defaultLoc) {
          setCurrentLocationState((prev) => {
            if (prev.id === DEFAULT_UNSET_LOCATION.id) {
              try {
                sessionStorage.setItem('weatherguard_session_location', JSON.stringify(defaultLoc));
              } catch {}
              return defaultLoc;
            }
            return prev;
          });
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, user?.uid]);

  // Local storage persistence has been completely removed per user request

  const setCurrentLocation = (loc: LocationItemWithMeta) => {
    setCurrentLocationState(loc);
    try {
      sessionStorage.setItem('weatherguard_session_location', JSON.stringify(loc));
    } catch {
      // Ignore
    }
    setLocationError(null);
  };

  const addSavedLocation = async (loc: LocationItemWithMeta, label: SavedPlaceLabel = 'Custom') => {
    const enriched: LocationItemWithMeta = {
      ...loc,
      placeLabel: loc.placeLabel || label,
      alertEnabled: loc.alertEnabled !== undefined ? loc.alertEnabled : true,
    };

    let targetId = loc.id;

    setSavedLocations((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === loc.id || (Math.abs(item.lat - loc.lat) < 0.05 && Math.abs(item.lon - loc.lon) < 0.05)
      );
      
      let nextState = [...prev];

      if (existingIndex >= 0) {
        targetId = nextState[existingIndex].id; // Use existing ID to prevent duplicates in Firestore
        nextState[existingIndex] = {
          ...nextState[existingIndex],
          placeLabel: enriched.placeLabel,
          isDefault: enriched.isDefault || nextState[existingIndex].isDefault,
        };
      } else {
        nextState = [enriched, ...nextState];
      }

      // If this location is set to default, unset default on all others
      if (enriched.isDefault) {
        nextState = nextState.map(l => {
          if (l.id === targetId) return l;
          
          if (l.isDefault) {
             // Unset old default in Firestore
             if (isAuthenticated && user?.uid) {
                saveSavedLocationToFirestore(user.uid, {
                   locationId: l.id,
                   label: l.placeLabel || 'Custom',
                   nickname: l.nickname || l.name,
                   city: l.name,
                   state: l.state,
                   country: l.country,
                   latitude: l.lat,
                   longitude: l.lon,
                   timezone: l.timezone,
                   isDefault: false,
                   alertEnabled: l.alertEnabled !== false,
                   createdAt: Date.now(),
                });
             }
          }
          return { ...l, isDefault: false };
        });
      }

      return nextState;
    });

    setCurrentLocationState((prevCur) => {
      if (prevCur.id === targetId || (Math.abs(prevCur.lat - loc.lat) < 0.05 && Math.abs(prevCur.lon - loc.lon) < 0.05)) {
        const updatedCur = {
          ...prevCur,
          placeLabel: enriched.placeLabel,
          isDefault: enriched.isDefault || prevCur.isDefault
        };
        try {
          sessionStorage.setItem('weatherguard_session_location', JSON.stringify(updatedCur));
        } catch {}
        return updatedCur;
      }
      return prevCur;
    });

    if (isAuthenticated && user?.uid) {
      const record: SavedLocationRecord = {
        locationId: targetId,
        label: enriched.placeLabel || label,
        nickname: loc.nickname || loc.name,
        city: loc.name,
        state: loc.state,
        country: loc.country,
        latitude: loc.lat,
        longitude: loc.lon,
        timezone: loc.timezone,
        isDefault: loc.isDefault || false,
        alertEnabled: enriched.alertEnabled !== false,
        createdAt: Date.now(),
      };
      await saveSavedLocationToFirestore(user.uid, record);
    }
  };

  const removeSavedLocation = async (id: string) => {
    setSavedLocations((prev) => prev.filter((item) => item.id !== id));
    if (isAuthenticated && user?.uid) {
      await deleteSavedLocationFromFirestore(user.uid, id);
    }
  };

  const updateLocationNickname = async (
    id: string,
    nickname: string,
    category?: GeoLocationItem['category'],
    placeLabel?: SavedPlaceLabel
  ) => {
    let updatedItem: LocationItemWithMeta | null = null;
    setSavedLocations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const mod = {
            ...item,
            nickname,
            ...(category ? { category } : {}),
            ...(placeLabel ? { placeLabel } : {}),
          };
          updatedItem = mod;
          return mod;
        }
        return item;
      })
    );

    if (currentLocation.id === id) {
      setCurrentLocationState((prev) => ({
        ...prev,
        nickname,
        ...(category ? { category } : {}),
        ...(placeLabel ? { placeLabel } : {}),
      }));
    }

    if (isAuthenticated && user?.uid && updatedItem) {
      const item: LocationItemWithMeta = updatedItem;
      const record: SavedLocationRecord = {
        locationId: item.id,
        label: item.placeLabel || 'Custom',
        nickname: item.nickname,
        city: item.name,
        state: item.state,
        country: item.country,
        latitude: item.lat,
        longitude: item.lon,
        timezone: item.timezone,
        isDefault: item.isDefault || false,
        alertEnabled: item.alertEnabled !== false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await saveSavedLocationToFirestore(user.uid, record);
    }
  };

  const toggleLocationAlert = async (id: string, enabled?: boolean) => {
    let updatedItem: LocationItemWithMeta | null = null;
    setSavedLocations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newVal = enabled !== undefined ? enabled : !item.alertEnabled;
          const mod = { ...item, alertEnabled: newVal };
          updatedItem = mod;
          return mod;
        }
        return item;
      })
    );

    if (isAuthenticated && user?.uid && updatedItem) {
      const item: LocationItemWithMeta = updatedItem;
      const record: SavedLocationRecord = {
        locationId: item.id,
        label: item.placeLabel || 'Custom',
        nickname: item.nickname,
        city: item.name,
        state: item.state,
        country: item.country,
        latitude: item.lat,
        longitude: item.lon,
        timezone: item.timezone,
        isDefault: item.isDefault || false,
        alertEnabled: item.alertEnabled,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await saveSavedLocationToFirestore(user.uid, record);
    }
  };

  const setDefaultLocation = async (id: string) => {
    setSavedLocations((prev) =>
      prev.map((item) => ({
        ...item,
        isDefault: item.id === id,
      }))
    );

    const match = savedLocations.find((l) => l.id === id);
    if (match) {
      setCurrentLocationState(match);
    }

    if (isAuthenticated && user?.uid) {
      for (const loc of savedLocations) {
        const record: SavedLocationRecord = {
          locationId: loc.id,
          label: loc.placeLabel || 'Custom',
          nickname: loc.nickname,
          city: loc.name,
          state: loc.state,
          country: loc.country,
          latitude: loc.lat,
          longitude: loc.lon,
          timezone: loc.timezone,
          isDefault: loc.id === id,
          alertEnabled: loc.alertEnabled !== false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await saveSavedLocationToFirestore(user.uid, record);
      }
    }
  };

  const detectCurrentGPS = async (): Promise<void> => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          try {
            const res = await fetch(`/api/geocode/reverse?lat=${lat}&lon=${lon}`);
            if (res.ok) {
              const data = await res.json();
              const newLoc: LocationItemWithMeta = {
                id: `gps_${Date.now()}`,
                name: data.name || 'Current Location',
                country: data.country || '',
                state: data.state,
                lat,
                lon,
                category: 'home',
                placeLabel: 'Home',
                alertEnabled: true,
              };
              setCurrentLocation(newLoc);
              setIsLocating(false);
              resolve();
              return;
            }
          } catch {
            // Fallback
          }

          const fallbackLoc: LocationItemWithMeta = {
            id: `gps_${Date.now()}`,
            name: `Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
            country: 'GPS',
            lat,
            lon,
            category: 'home',
            placeLabel: 'Home',
            alertEnabled: true,
          };
          setCurrentLocation(fallbackLoc);
          setIsLocating(false);
          resolve();
        },
        (err) => {
          setIsLocating(false);
          if (err.code === err.PERMISSION_DENIED) {
            setLocationError('Location permission denied. Select a city manually.');
          } else {
            setLocationError('Unable to retrieve your current location.');
          }
          resolve();
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  };

  const isCurrentLocationSaved = savedLocations.some(
    (item) =>
      item.id === currentLocation.id ||
      (Math.abs(item.lat - currentLocation.lat) < 0.05 && Math.abs(item.lon - currentLocation.lon) < 0.05)
  );

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        savedLocations,
        isLocating,
        locationError,
        setCurrentLocation,
        addSavedLocation,
        removeSavedLocation,
        updateLocationNickname,
        toggleLocationAlert,
        setDefaultLocation,
        detectCurrentGPS,
        isCurrentLocationSaved,
        customTags,
        addCustomTag,
        removeCustomTag,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export function useLocation(): LocationContextType {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
