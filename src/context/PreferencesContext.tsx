import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode, UnitSystem, UserPreferences, UserRole } from '../types';

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  setTheme: (theme: ThemeMode) => void;
  setUnits: (units: UnitSystem) => void;
  setRole: (role: UserRole) => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  units: 'metric',
  tempUnit: 'C',
  speedUnit: 'km/h',
  pressureUnit: 'hPa',
  rainUnit: 'mm',
  theme: 'dark',
  role: 'general',
  refreshIntervalMinutes: 10,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  enableSoundAlerts: false,
  enableEmergencyBanner: true,
  ambientEffectsEnabled: true,
  ambientSimulationMode: 'auto',
  particleDensity: 'high',
  reducedMotion: false,
  glassIntensity: 'standard',
};

const STORAGE_KEY = 'weatherguard_preferences_v1';

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PREFERENCES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Ignore
    }

    // Apply root document theme class
    const root = document.documentElement;
    root.classList.remove('dark', 'light', 'theme-astronomer-red');
    if (preferences.theme === 'astronomer-red') {
      root.classList.add('dark', 'theme-astronomer-red');
    } else if (preferences.theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.add('dark');
    }
  }, [preferences]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      // Auto-sync units if 'units' system is toggled
      if (updates.units === 'imperial' && prev.units !== 'imperial') {
        next.tempUnit = 'F';
        next.speedUnit = 'mph';
        next.pressureUnit = 'inHg';
        next.rainUnit = 'in';
      } else if (updates.units === 'metric' && prev.units !== 'metric') {
        next.tempUnit = 'C';
        next.speedUnit = 'km/h';
        next.pressureUnit = 'hPa';
        next.rainUnit = 'mm';
      }
      return next;
    });
  };

  const setTheme = (theme: ThemeMode) => updatePreferences({ theme });
  const setUnits = (units: UnitSystem) => updatePreferences({ units });
  const setRole = (role: UserRole) => updatePreferences({ role });

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreferences,
        setTheme,
        setUnits,
        setRole,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export function usePreferences(): PreferencesContextType {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
