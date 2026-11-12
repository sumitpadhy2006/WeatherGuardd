import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {  PanelLeftClose,
  Menu,
  ChevronRight,
  ChevronDown,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopCommandBar } from './TopCommandBar';
import { BottomNav } from './BottomNav';

import { NotificationCenterModal } from '../personalization/NotificationCenterModal';
import { BackgroundLayer } from '../effects/BackgroundLayer';
import { WeatherOverlay } from '../effects/WeatherOverlay';

import { ClimateBackground } from '../climate3d/ClimateBackground';
import { usePreferences } from '../../context/PreferencesContext';
import { useAuth } from '../../context/AuthContext';
import { CurrentWeatherPayload } from '../../types';
import { pageTransition } from '../../utils/motion';

interface AppShellProps {
  children: React.ReactNode;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: number | null;
  weather?: CurrentWeatherPayload | null;
  isLocationsModalOpen?: boolean;
  onCloseLocationsModal?: () => void;
  onOpenLocationsModal?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeTab,
  onSelectTab,
  onRefresh,
  isRefreshing,
  lastUpdated,
  weather,
  isLocationsModalOpen,
  onCloseLocationsModal,
  onOpenLocationsModal,
}) => {
  const { preferences } = usePreferences();
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isLocationsOpen = activeTab === 'saved-places' || activeTab === 'locations' || (isLocationsModalOpen !== undefined ? isLocationsModalOpen : false);
  const isSettingsOpen = activeTab === 'settings';
  const isProfileOpen = activeTab === 'profile' && isAuthenticated;
  const isAuthOpen = activeTab === 'profile' && !isAuthenticated;
  const isNotificationsOpen = activeTab === 'notifications';
  const [authMessage, setAuthMessage] = useState<string | undefined>(undefined);
  const [isTopBarOpen, setIsTopBarOpen] = useState(true);

  const openLocations = () => onSelectTab('saved-places');
  const closeLocations = () => window.history.back();

  // Automatically unlock the tab when the user signs in
  useEffect(() => {
    if (isAuthenticated && activeTab.startsWith('locked-')) {
      onSelectTab(activeTab.replace('locked-', ''));
    }
  }, [isAuthenticated, activeTab, onSelectTab]);

  const handleOpenAccountOrProfile = (message?: string) => {
    onSelectTab('profile');
    if (message) setAuthMessage(typeof message === 'string' ? message : undefined);
  };

  const tapDirectionRef = useRef<'closing' | 'opening'>('closing');

  const handleBackgroundClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Do not toggle if clicking inside the top command bar, sidebar, or any interactive elements
    if (
      target.closest('button') || 
      target.closest('a') || 
      target.closest('input') ||
      target.closest('select') ||
      target.closest('canvas') ||
      target.closest('.rounded-xl') ||
      target.closest('.rounded-2xl') ||
      target.closest('.rounded-3xl') ||
      target.closest('[role="dialog"]') ||
      target.closest('[role="tab"]') ||
      target.closest('[role="slider"]') ||
      target.closest('#top-command-bar') ||
      target.closest('.sidebar-container')
    ) {
      return;
    }
    
    if (isSidebarOpen && isTopBarOpen) {
      setIsSidebarOpen(false);
      tapDirectionRef.current = 'closing';
    } else if (!isSidebarOpen && isTopBarOpen) {
      if (tapDirectionRef.current === 'closing') {
        setIsTopBarOpen(false);
      } else {
        setIsSidebarOpen(true);
        tapDirectionRef.current = 'closing'; // Reset for next cycle
      }
    } else if (!isSidebarOpen && !isTopBarOpen) {
      setIsTopBarOpen(true);
      tapDirectionRef.current = 'opening';
    } else if (isSidebarOpen && !isTopBarOpen) {
      setIsTopBarOpen(true);
      tapDirectionRef.current = 'closing';
    }
  };

  return (
    <div className="relative h-screen w-full bg-[#070B12] text-slate-100 flex flex-col md:flex-row antialiased overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Weather-Reactive CSS Gradient Sky Colors Layer */}
      <BackgroundLayer />

      {/* 2D Canvas Background Removed - Using DynamicSky in BackgroundLayer */}

      {/* 3D React Three Fiber Climate Simulation */}
      <ClimateBackground />

      {/* Stationary Collapsible Left Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        activeTab={activeTab}
        onSelectTab={(tabId) => {
          onSelectTab(tabId);
          // On mobile screen width, auto close sidebar when selecting a tab
          if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
          }
        }}
        onOpenLocations={openLocations}
        onOpenSettings={() => onSelectTab('settings')}
        onOpenAuth={handleOpenAccountOrProfile}
      />

      {/* 2D Environmental Effects Overlay (Rain, Condensation, Lightning, Wind) */}
      <WeatherOverlay />


      <div
        id="main-scroll-container"
        onClick={handleBackgroundClick}
        className={`relative z-10 flex-1 h-screen overflow-y-auto overflow-x-hidden flex flex-col min-w-0 pb-20 md:pb-8 transition-colors duration-500 ease-in-out scroll-smooth ${
          activeTab === 'about' || activeTab === 'creator' ? 'bg-slate-950' : ''
        }`}
      >
        {/* Pull-down handle to restore top bar if background click fails */}
        {!isTopBarOpen && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsTopBarOpen(true);
            }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-50 p-1.5 px-6 bg-slate-800/40 hover:bg-slate-700/80 rounded-b-2xl border border-t-0 border-white/10 backdrop-blur-md text-cyan-400 transition-all cursor-pointer shadow-lg group"
            title="Show Top Bar"
          >
            <ChevronDown size={20} className="group-hover:translate-y-0.5 transition-transform" />
          </button>
        )}

        {/* Top Command Bar with Sidebar Toggle Menu */}
        <div className={`sticky top-0 z-40 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isTopBarOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
          <TopCommandBar
            onOpenLocations={openLocations}
            onOpenSettings={() => onSelectTab('settings')}
            onOpenAuth={handleOpenAccountOrProfile}
            onOpenNotifications={() => onSelectTab('notifications')}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
            lastUpdated={lastUpdated}
            weather={weather}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          />
        </div>

        {/* Page Body with Animated Transition */}
        <main className={`flex-1 w-full mx-auto transition-all duration-300 ${
          activeTab === 'about' || activeTab === 'creator'
            ? 'px-0 py-0 max-w-none'
            : 'px-4 sm:px-6 lg:px-8 py-6 max-w-7xl'
        }`}>
          {activeTab.startsWith('locked-') ? (
            <div className="flex h-full w-full items-center justify-center p-8 bg-slate-950/40 backdrop-blur-md">
              <div className="text-center max-w-md">
                <Lock className="w-12 h-12 text-cyan-400 mx-auto mb-4 opacity-80" />
                <h2 className="text-2xl font-semibold text-white mb-2">Access Restricted</h2>
                <p className="text-slate-400 mb-8">
                  Sign in to get access of advance features of weather guard
                </p>
                <button
                  onClick={() => handleOpenAccountOrProfile()}
                  className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  Sign In <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={preferences.reducedMotion ? undefined : pageTransition}
                initial={preferences.reducedMotion ? undefined : 'hidden'}
                animate={preferences.reducedMotion ? undefined : 'visible'}
                exit={preferences.reducedMotion ? undefined : 'exit'}
                className="w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          )}
        </main>

        <BottomNav
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          onOpenLocations={openLocations}
          onOpenSettings={() => onSelectTab('settings')}
          onOpenAuth={handleOpenAccountOrProfile}
        />
      </div>

      {/* Modals */}
      <NotificationCenterModal
        isOpen={isNotificationsOpen}
        onClose={() => window.history.back()}
        onNavigateTab={onSelectTab}
      />
    </div>
  );
};


