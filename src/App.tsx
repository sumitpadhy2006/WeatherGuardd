/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { PreferencesProvider, usePreferences } from './context/PreferencesContext';
import { LocationProvider, useLocation } from './context/LocationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PersonalizationProvider } from './context/PersonalizationContext';
import { AtmosphereProvider } from './context/AtmosphereContext';
import { ClimateProvider } from './context/ClimateContext';
import { AppShell } from './components/layout/AppShell';
import { IntroSplash } from './components/intro/IntroSplash';
import { HomePage } from './components/home/HomePage';
import { WeatherDashboard } from './components/weather/WeatherDashboard';
import { WeatherExplorerPage } from './components/explorer/WeatherExplorerPage';
import { EarthWatchPage } from './components/earthwatch/EarthWatchPage';
import { SpacePage } from './components/space/SpacePage';
import { SpaceWeatherPage } from './components/spaceweather/SpaceWeatherPage';
import { NeoPage } from './components/neo/NeoPage';
import { PersonalizationPage } from './components/personalization/PersonalizationPage';
import { CalendarView } from './components/calendar/CalendarView';
import { AboutPage } from './components/about/AboutPage';
import { CreatorPage } from './components/about/CreatorPage';
import { SettingsModal } from './components/settings/SettingsModal';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { AuthModal } from './components/auth/AuthModal';
import { SavedLocationsModal } from './components/locations/SavedLocationsModal';
import { useWeather } from './hooks/useWeather';

function WeatherGuardMain() {
  const [activeTab, setActiveTabState] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'home';
  });

  // Sync initial state to history if not present
  useEffect(() => {
    if (!window.history.state || !window.history.state.tab) {
      window.history.replaceState({ tab: activeTab }, '', `#${activeTab}`);
    }
  }, []);

  const setActiveTab = (tab: string) => {
    if (tab === activeTab) return;
    setActiveTabState(tab);
    window.history.pushState({ tab }, '', `#${tab}`);
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.tab) {
        setActiveTabState(event.state.tab);
      } else {
        const hash = window.location.hash.replace('#', '');
        setActiveTabState(hash || 'home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [isLocationsModalOpen, setIsLocationsModalOpen] = useState(false);
  const { currentLocation, isLocating, locationError, detectCurrentGPS } = useLocation();
  const { preferences } = usePreferences();
  const { isAuthenticated } = useAuth();
  const { data: weather, refresh, isRefreshing, lastUpdated } = useWeather(
    currentLocation,
    preferences.refreshIntervalMinutes
  );

  // Automatic location prompting has been removed per user request.
  // The home page will simply open, and users can use the top search bar.

  return (
    <AtmosphereProvider weather={weather}>
      <AppShell
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onRefresh={refresh}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
        weather={weather}
        isLocationsModalOpen={isLocationsModalOpen}
        onCloseLocationsModal={() => setIsLocationsModalOpen(false)}
        onOpenLocationsModal={() => setIsLocationsModalOpen(true)}
      >
        {activeTab === 'home' ? (
          <HomePage
            onOpenLocations={() => setIsLocationsModalOpen(true)}
            onNavigateTab={setActiveTab}
          />
        ) : activeTab === 'home-calendar' ? (
          <CalendarView />
        ) : activeTab === 'explorer' || activeTab === 'weathermaps' || activeTab === 'maps' ? (
          <WeatherExplorerPage onNavigateEarthWatch={() => setActiveTab('earthwatch')} />
        ) : activeTab === 'personalization' || activeTab === 'alerts' ? (
          <PersonalizationPage onNavigateTab={setActiveTab} />
        ) : activeTab === 'earthwatch' ? (
          <EarthWatchPage />
        ) : activeTab === 'space' ? (
          <SpacePage currentLocation={currentLocation} />
        ) : activeTab === 'spaceweather' ? (
          <SpaceWeatherPage currentLocation={currentLocation} />
        ) : activeTab === 'neo' ? (
          <NeoPage currentLocation={currentLocation} />
        ) : activeTab === 'about' ? (
          <AboutPage onNavigateTab={setActiveTab} />
        ) : activeTab === 'creator' ? (
          <CreatorPage />
        ) : activeTab === 'settings' ? (
          <SettingsModal isOpen={true} onClose={() => window.history.back()} mode="page" />
        ) : activeTab === 'profile' ? (
          isAuthenticated ? (
            <UserProfileModal isOpen={true} onClose={() => window.history.back()} mode="page" />
          ) : (
            <AuthModal isOpen={true} onClose={() => window.history.back()} mode="page" />
          )
        ) : activeTab === 'saved-places' ? (
          <SavedLocationsModal isOpen={true} onClose={() => window.history.back()} mode="page" />
        ) : (
          <WeatherDashboard
            onOpenLocations={() => setIsLocationsModalOpen(true)}
            onNavigateTab={setActiveTab}
          />
        )}
      </AppShell>
    </AtmosphereProvider>
  );
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <AuthProvider>
      <PreferencesProvider>
        <LocationProvider>
          <ClimateProvider>
            <PersonalizationProvider>
              {showIntro && <IntroSplash onComplete={() => setShowIntro(false)} />}
              <WeatherGuardMain />
            </PersonalizationProvider>
          </ClimateProvider>
        </LocationProvider>
      </PreferencesProvider>
    </AuthProvider>
  );
}

