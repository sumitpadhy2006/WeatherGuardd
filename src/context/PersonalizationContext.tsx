import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  UserRole,
  SmartAlertNotification,
  NotificationRuleSettings,
  AlertCategory,
  FarmerAdvisoryData,
  StudentDashboardData,
  TravelerDashboardData,
  PhotographerOpticsData,
  AstronomyEnthusiastData,
} from '../types/personalization';
import { useAuth } from './AuthContext';
import { useLocation } from './LocationContext';
import { useWeather } from '../hooks/useWeather';
import { useEarthWatch } from '../hooks/useEarthWatch';
import {
  calculateFarmerAdvisory,
  calculateStudentDashboard,
  calculateTravelerDashboard,
  calculatePhotographerOptics,
  calculateAstronomyDashboard,
  evaluateSmartAlerts,
} from '../utils/personalizationEngines';
import {
  saveUserProfileToFirestore,
  fetchUserProfileFromFirestore,
  requestFcmPushToken,
  saveAlertToFirestore,
  markAlertReadInFirestore,
} from '../services/firebase';

const STORAGE_ROLE = 'wg_selected_role_v2';
const STORAGE_ALERTS = 'wg_smart_alerts_v2';
const STORAGE_RULES = 'wg_alert_rules_v2';

const DEFAULT_SETTINGS: NotificationRuleSettings = {
  enableRainAlerts: true,
  rainProbabilityThreshold: 50,
  rainTimingLeadMinutes: 30,
  enableAqiAlerts: true,
  aqiThresholdCategory: 'Moderate',
  aqiThresholdValue: 100,
  enableCycloneAlerts: true,
  cycloneRadiusKm: 800,
  cycloneMinCategory: 'Tropical Storm',
  enableEarthquakeAlerts: true,
  earthquakeMinMagnitude: 4.5,
  earthquakeRadiusKm: 600,
  enableEclipseAlerts: true,
  eclipseAdvanceHours: 24,
  enableMeteorShowerAlerts: true,
  meteorMinZhr: 20,
  channelInApp: true,
  channelWebPush: false,
  channelSound: true,
  fcmToken: null,
  fcmPermissionStatus: 'default',
};

interface PersonalizationContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  settings: NotificationRuleSettings;
  updateSettings: (partial: Partial<NotificationRuleSettings>) => void;
  alerts: SmartAlertNotification[];
  unreadAlertsCount: number;
  markAlertAsRead: (alertId: string) => void;
  markAllAlertsAsRead: () => void;
  dismissAlert: (alertId: string) => void;
  clearAllAlerts: () => void;
  triggerSimulatedAlert: (category: AlertCategory) => void;
  requestPushPermission: () => Promise<void>;
  farmerData: FarmerAdvisoryData | null;
  studentData: StudentDashboardData | null;
  travelerData: TravelerDashboardData | null;
  photographerData: PhotographerOpticsData | null;
  astronomyData: AstronomyEnthusiastData | null;
  isSyncingFirestore: boolean;
  firestoreSyncStatus: 'synced' | 'local_cached' | 'error';
}

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

export const PersonalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { currentLocation } = useLocation();
  const { data: weather } = useWeather(currentLocation);
  const { events: earthWatchEvents, lastUpdated: earthWatchLastUpdated } = useEarthWatch({ currentLocation });

  const [role, setRoleState] = useState<UserRole>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ROLE);
      if (stored) return stored as UserRole;
    } catch {}
    return (user?.role as UserRole) || 'farmer';
  });

  const [settings, setSettings] = useState<NotificationRuleSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_RULES);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [alerts, setAlerts] = useState<SmartAlertNotification[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ALERTS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [firestoreSyncStatus, setFirestoreSyncStatus] = useState<'synced' | 'local_cached' | 'error'>('synced');
  const [isSyncingFirestore, setIsSyncingFirestore] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ROLE, role);
      localStorage.setItem(STORAGE_RULES, JSON.stringify(settings));
      localStorage.setItem(STORAGE_ALERTS, JSON.stringify(alerts));
    } catch {}
  }, [role, settings, alerts]);

  // Load from Firestore on user mount
  useEffect(() => {
    if (!user || user.isAnonymous) return;
    let isMounted = true;
    (async () => {
      setIsSyncingFirestore(true);
      try {
        const firestoreProfile = await fetchUserProfileFromFirestore(user.uid);
        if (firestoreProfile && isMounted) {
          if (firestoreProfile.role) setRoleState(firestoreProfile.role);
          if (firestoreProfile.notificationSettings) {
            setSettings((prev) => ({ ...prev, ...firestoreProfile.notificationSettings }));
          }
          setFirestoreSyncStatus('synced');
        }
      } catch {
        if (isMounted) setFirestoreSyncStatus('local_cached');
      } finally {
        if (isMounted) setIsSyncingFirestore(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  // Save profile & settings to Firestore on change
  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (user?.uid) {
      saveUserProfileToFirestore({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: newRole,
        notificationSettings: settings,
        createdAt: user.createdAt || Date.now(),
      }).catch(() => setFirestoreSyncStatus('local_cached'));
    }
  };

  const updateSettings = (partial: Partial<NotificationRuleSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    if (user?.uid) {
      saveUserProfileToFirestore({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role,
        notificationSettings: updated,
        createdAt: user.createdAt || Date.now(),
      }).catch(() => setFirestoreSyncStatus('local_cached'));
    }
  };

  // Evaluate Live Alerts periodically when weather / earthwatch updates
  useEffect(() => {
    if (!weather) return;
    const generated = evaluateSmartAlerts(weather, earthWatchEvents || [], settings, role);
    setAlerts((prev) => {
      // Merge unique by title/category
      const existingIds = new Set(prev.map((a) => a.id));
      const newItems = generated.filter((g) => !existingIds.has(g.id));
      if (newItems.length === 0) return prev;
      return [...newItems, ...prev].slice(0, 50);
    });
  }, [weather?.timestamp, earthWatchLastUpdated, settings, role]);

  const unreadAlertsCount = useMemo(() => {
    return alerts.filter((a) => !a.isRead).length;
  }, [alerts]);

  const markAlertAsRead = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isRead: true, readAt: Date.now() } : a))
    );
    markAlertReadInFirestore(alertId);
  };

  const markAllAlertsAsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true, readAt: Date.now() })));
  };

  const dismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  // Request FCM Web Push Notification Permission
  const requestPushPermission = async () => {
    const res = await requestFcmPushToken();
    if (res.status === 'granted' && res.token) {
      updateSettings({
        channelWebPush: true,
        fcmToken: res.token,
        fcmPermissionStatus: 'granted',
      });
      // Fire a test welcome notification
      const welcomeAlert: SmartAlertNotification = {
        id: `fcm_welcome_${Date.now()}`,
        category: 'system',
        severity: 'info',
        title: 'FCM Push Notifications Activated',
        message: 'You are now registered for real-time instant alerts for Rain, AQI, Cyclones, Earthquakes, Eclipses, and Meteor Showers.',
        timestamp: Date.now(),
        locationName: weather?.location.name || 'Primary Station',
        isRead: false,
        triggerSource: 'fcm_push',
        fcmSent: true,
      };
      setAlerts((prev) => [welcomeAlert, ...prev]);
      saveAlertToFirestore(welcomeAlert, user?.uid);
    } else {
      updateSettings({
        channelWebPush: false,
        fcmPermissionStatus: res.status as any,
      });
    }
  };

  // Manual Trigger Simulation for testing
  const triggerSimulatedAlert = (category: AlertCategory) => {
    const loc = weather?.location.name || 'Current Station';
    const now = Date.now();
    let newAlert: SmartAlertNotification;

    switch (category) {
      case 'rain':
        newAlert = {
          id: `sim_rain_${now}`,
          category: 'rain',
          severity: 'warning',
          title: `Flash Rain & Downpour Warning (${loc})`,
          message: `Heavy rain cell (18 mm/h) detected upstream heading towards ${loc}. Peak precipitation expected in 15 minutes.`,
          timestamp: now,
          locationName: loc,
          actionLabel: 'View Radar',
          actionTab: 'weather',
          isRead: false,
          triggerSource: 'simulation',
          fcmSent: settings.channelWebPush,
        };
        break;
      case 'aqi':
        newAlert = {
          id: `sim_aqi_${now}`,
          category: 'aqi',
          severity: 'critical',
          title: `Severe AQI Spike: Hazardous (AQI 320)`,
          message: `Fine particulate matter (PM2.5: 185 µg/m³) exceeds safe respiratory limits. Keep windows closed and operate HEPA purifiers.`,
          timestamp: now,
          locationName: loc,
          actionLabel: 'Check AQI Advisory',
          actionTab: 'weather',
          isRead: false,
          triggerSource: 'simulation',
          fcmSent: settings.channelWebPush,
        };
        break;
      case 'cyclone':
        newAlert = {
          id: `sim_cyclone_${now}`,
          category: 'cyclone',
          severity: 'critical',
          title: `Cyclone Emergency Warning: Category 3 Storm`,
          message: `Severe tropical cyclone center located 240 km SE of ${loc}. Sustained hurricane-force winds (155 km/h) & storm surge advisory.`,
          timestamp: now,
          locationName: loc,
          actionLabel: 'Open EarthWatch Radar',
          actionTab: 'earthwatch',
          isRead: false,
          triggerSource: 'simulation',
          fcmSent: settings.channelWebPush,
        };
        break;
      case 'earthquake':
        newAlert = {
          id: `sim_quake_${now}`,
          category: 'earthquake',
          severity: 'critical',
          title: `Urgent Seismic Alert: M6.4 Earthquake Detected`,
          message: `Shallow tectonic fault rupture recorded 48 km offshore. Estimated shaking intensity: Strong (MMI VI). Tsunami evaluation underway.`,
          timestamp: now,
          locationName: loc,
          actionLabel: 'View Seismic Map',
          actionTab: 'earthwatch',
          isRead: false,
          triggerSource: 'simulation',
          fcmSent: settings.channelWebPush,
        };
        break;
      case 'eclipse':
        newAlert = {
          id: `sim_eclipse_${now}`,
          category: 'eclipse',
          severity: 'info',
          title: `Total Solar Eclipse Countdown: 24 Hours to Totality`,
          message: `Sky visibility forecast along the totality path is 95% Clear. Ensure ISO 12312-2 certified solar eclipse viewing glasses are ready.`,
          timestamp: now,
          locationName: 'Solar Totality Corridor',
          actionLabel: 'Open Eclipse Tracker',
          actionTab: 'space',
          isRead: false,
          triggerSource: 'simulation',
          fcmSent: settings.channelWebPush,
        };
        break;
      case 'meteor_shower':
        newAlert = {
          id: `sim_meteor_${now}`,
          category: 'meteor_shower',
          severity: 'info',
          title: `Geminids Meteor Shower Peak Active Tonight (ZHR ~120)`,
          message: `Radiant constellation overhead with zero lunar illumination interference. Peak rates exceeding 2 meteors per minute between 01:00 AM - 04:30 AM.`,
          timestamp: now,
          locationName: 'Dark Sky Observatory',
          actionLabel: 'View Sky Radiant',
          actionTab: 'space',
          isRead: false,
          triggerSource: 'simulation',
          fcmSent: settings.channelWebPush,
        };
        break;
      default:
        newAlert = {
          id: `sim_gen_${now}`,
          category: 'system',
          severity: 'info',
          title: 'System Notification Test',
          message: 'WeatherGuard multi-channel dispatch engine operational.',
          timestamp: now,
          locationName: loc,
          isRead: false,
          triggerSource: 'simulation',
        };
    }

    setAlerts((prev) => [newAlert, ...prev]);
    saveAlertToFirestore(newAlert, user?.uid);

    // Browser Notification API if enabled
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && settings.channelWebPush) {
      try {
        new Notification(newAlert.title, {
          body: newAlert.message,
          icon: '/favicon.ico',
        });
      } catch {}
    }
  };

  // Role Computed Data
  const farmerData = useMemo(() => {
    if (!weather) return null;
    return calculateFarmerAdvisory(weather);
  }, [weather]);

  const studentData = useMemo(() => {
    if (!weather) return null;
    return calculateStudentDashboard(weather);
  }, [weather]);

  const travelerData = useMemo(() => {
    if (!weather) return null;
    return calculateTravelerDashboard(weather);
  }, [weather]);

  const photographerData = useMemo(() => {
    if (!weather) return null;
    return calculatePhotographerOptics(weather);
  }, [weather]);

  const astronomyData = useMemo(() => {
    if (!weather) return null;
    return calculateAstronomyDashboard(weather);
  }, [weather]);

  return (
    <PersonalizationContext.Provider
      value={{
        role,
        setRole,
        settings,
        updateSettings,
        alerts,
        unreadAlertsCount,
        markAlertAsRead,
        markAllAlertsAsRead,
        dismissAlert,
        clearAllAlerts,
        triggerSimulatedAlert,
        requestPushPermission,
        farmerData,
        studentData,
        travelerData,
        photographerData,
        astronomyData,
        isSyncingFirestore,
        firestoreSyncStatus,
      }}
    >
      {children}
    </PersonalizationContext.Provider>
  );
};

export function usePersonalization(): PersonalizationContextType {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
}
