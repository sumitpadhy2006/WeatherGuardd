import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Navigation,
  RefreshCw,
  Sliders,
  User,
  Shield,
  Sun,
  Moon,
  Bell,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  MoreVertical,
  X,
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { usePreferences } from '../../context/PreferencesContext';
import { useAuth } from '../../context/AuthContext';
import { usePersonalization } from '../../context/PersonalizationContext';
import { GeoLocationItem, CurrentWeatherPayload } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { WeatherGuardLogo } from '../common/WeatherGuardLogo';
import { MapPickerModal } from '../locations/MapPickerModal';
import { useClimate } from '../../context/ClimateContext';

interface TopCommandBarProps {
  onOpenLocations: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onOpenNotifications: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: number | null;
  weather?: CurrentWeatherPayload | null;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const TopCommandBar: React.FC<TopCommandBarProps> = ({
  onOpenLocations,
  onOpenSettings,
  onOpenAuth,
  onOpenNotifications,
  onRefresh,
  isRefreshing,
  lastUpdated,
  weather,
  isSidebarOpen = true,
  onToggleSidebar,
}) => {
  const { currentLocation, setCurrentLocation, detectCurrentGPS, isLocating, addSavedLocation } = useLocation();
  const { preferences, setUnits, setTheme } = usePreferences();
  const { user, isAuthenticated } = useAuth();
  const { unreadAlertsCount } = usePersonalization();
  const { isControlTowerOpen, setControlTowerOpen } = useClimate();

  const [query, setQuery] = useState('');

  const [results, setResults] = useState<GeoLocationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<GeoLocationItem | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for command bar
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(query.trim())}&lat=${currentLocation.lat}&lon=${currentLocation.lon}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setIsOpen(true);
        }
      } catch {
        // Ignore
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc: GeoLocationItem) => {
    setCurrentLocation(loc);
    setQuery('');
    setIsOpen(false);
    
    // Instead of window.confirm, trigger our custom modal
    setPendingLocation(loc);
  };

  const handleMapPick = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`/api/geocode/reverse?lat=${lat}&lon=${lon}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentLocation({
          ...data,
          id: data.id || `geo_${lat.toFixed(3)}_${lon.toFixed(3)}`,
          name: data.name || `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
          lat,
          lon,
        });
      }
    } catch {
      // Fallback
    }
  };

  return (
    <header
      id="top-command-bar"
      className="sticky top-0 z-20 bg-transparent backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 transition-colors duration-500"
    >
      {/* Left Menu Toggle & Brand Elements */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Menu Bar Toggle Button (Appears always, allows collapsing sidebar entirely) */}
        {onToggleSidebar && (
          <button
            id="toggle-sidebar-button"
            onClick={onToggleSidebar}
            className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] border border-white/15 hover:border-cyan-400/40 text-slate-200 hover:text-cyan-300 transition-all backdrop-blur-xl cursor-pointer flex items-center justify-center gap-1.5 group"
            title={isSidebarOpen ? 'Collapse sidebar (Full screen home)' : 'Open navigation sidebar'}
            aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Open navigation sidebar'}
          >
            {isSidebarOpen ? (
              <PanelLeftClose size={17} className="group-hover:text-cyan-300 transition-colors" />
            ) : (
              <Menu size={17} className="group-hover:text-cyan-300 transition-colors text-cyan-400" />
            )}
            {!isSidebarOpen && (
              <span className="hidden sm:inline text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                Menu
              </span>
            )}
            
            {/* Blinking Attention Arrows when Sidebar is Closed */}
            {!isSidebarOpen && (
              <div className="flex items-center text-cyan-400 ml-0.5">
                <ChevronRight size={14} className="animate-blink-1" />
                <ChevronRight size={14} className="animate-blink-2 -ml-2" />
                <ChevronRight size={14} className="animate-blink-3 -ml-2" />
              </div>
            )}
          </button>
        )}

        {/* Mobile Brand Shield Logo only (no text on small screens) */}
        {(!isSidebarOpen || true) && (
          <div className="flex md:hidden items-center shrink-0">
            <WeatherGuardLogo size="sm" animate />
          </div>
        )}
      </div>

      {/* Omnibox Global Search */}
      <div ref={dropdownRef} className="relative flex-1 max-w-md min-w-0">
        <div className="relative flex items-center">
          <Search
            size={14}
            className="absolute left-2.5 sm:left-3.5 text-white/60 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
            placeholder="Search city..."
            className="w-full bg-white/[0.08] hover:bg-white/[0.12] focus:bg-slate-950/60 border border-white/15 focus:border-cyan-400/80 rounded-xl pl-8 sm:pl-9.5 pr-4 sm:pr-20 py-1.5 sm:py-2 text-xs sm:text-sm text-white placeholder-white/50 focus:outline-none backdrop-blur-xl transition-all shadow-inner"
          />
        </div>

        {/* Dropdown Suggestions */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900/90 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-3xl overflow-hidden z-50 divide-y divide-white/10">
            {results.length > 0 ? (
              results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-white/10 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-cyan-400 shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-100 flex items-center gap-2">
                        {item.name}
                        {item.placeType && (
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                            {item.placeType}
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {[item.district, item.state, item.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300/80">
                    {item.lat.toFixed(1)}°, {item.lon.toFixed(1)}°
                  </span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-xs text-slate-400 text-center">
                No locations found for "{query}"
              </div>
            )}
            
            <div className="p-2 bg-slate-950/50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsMapPickerOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-200 transition-colors"
              >
                <MapPin size={14} className="text-cyan-400" />
                Pick on Map
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Controls — Desktop (hidden on mobile) */}
      <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
        {/* Quick Unit Switcher */}
        <button
          onClick={() => setUnits(preferences.units === 'metric' ? 'imperial' : 'metric')}
          className="px-2.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] border border-white/15 hover:border-cyan-400/40 text-xs font-mono font-bold text-cyan-300 transition-all backdrop-blur-xl cursor-pointer"
          title="Toggle Metric / Imperial Units"
        >
          {preferences.units === 'metric' ? '°C' : '°F'}
        </button>

        {/* Quick Refresh */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] border border-white/15 hover:border-cyan-400/40 text-slate-200 hover:text-cyan-300 transition-all disabled:opacity-50 backdrop-blur-xl cursor-pointer"
          title="Refresh Atmospheric Telemetry"
        >
          <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-cyan-400' : ''} />
        </button>

        {isAuthenticated ? (
          <>
            {/* Active Location Pill */}
            <button
              onClick={onOpenLocations}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] border border-white/15 hover:border-cyan-400/40 text-xs text-white hover:text-cyan-300 transition-all backdrop-blur-xl cursor-pointer"
            >
              <MapPin size={13} className="text-cyan-400" />
              <span className="font-semibold">{currentLocation.nickname || currentLocation.name}</span>
            </button>

            {/* Notification Center Trigger */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] border border-white/15 hover:border-cyan-400/40 text-slate-200 hover:text-cyan-300 transition-all backdrop-blur-xl cursor-pointer"
              title="Smart Alerts & Notifications"
            >
              <Bell size={15} />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 text-[9px] font-bold font-mono flex items-center justify-center animate-pulse">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Settings Trigger */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] border border-white/15 hover:border-cyan-400/40 text-slate-200 hover:text-cyan-300 transition-all backdrop-blur-xl cursor-pointer"
              title="System Preferences"
            >
              <Sliders size={15} />
            </button>
          </>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 hover:border-cyan-400/70 text-xs font-semibold text-cyan-300 transition-all backdrop-blur-xl cursor-pointer shadow-sm shadow-cyan-500/10"
          >
            <User size={13} />
            <span>Sign In</span>
          </button>
        )}
      </div>

      {/* Right Controls — Mobile overflow menu (visible only on mobile) */}
      <div ref={mobileMenuRef} className="relative flex sm:hidden items-center shrink-0">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] border border-white/15 hover:border-cyan-400/40 text-slate-200 hover:text-cyan-300 transition-all backdrop-blur-xl cursor-pointer"
          title="More options"
        >
          {isMobileMenuOpen ? <X size={17} /> : <MoreVertical size={17} />}
        </button>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full right-0 mt-2 w-52 bg-slate-900/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-3xl overflow-hidden z-50">
            {/* Unit Switcher */}
            <button
              onClick={() => {
                setUnits(preferences.units === 'metric' ? 'imperial' : 'metric');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left border-b border-white/5"
            >
              <span className="text-sm font-mono font-bold text-cyan-300 w-7">
                {preferences.units === 'metric' ? '°C' : '°F'}
              </span>
              <span className="text-xs text-slate-300">Toggle Units</span>
            </button>

            {/* Refresh */}
            <button
              onClick={() => {
                onRefresh();
                setIsMobileMenuOpen(false);
              }}
              disabled={isRefreshing}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left border-b border-white/5 disabled:opacity-50"
            >
              <RefreshCw size={15} className={`text-slate-300 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="text-xs text-slate-300">Refresh Data</span>
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button
                  onClick={() => {
                    onOpenNotifications();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left border-b border-white/5"
                >
                  <Bell size={15} className="text-slate-300" />
                  <span className="text-xs text-slate-300">Notifications</span>
                  {unreadAlertsCount > 0 && (
                    <span className="ml-auto w-5 h-5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                      {unreadAlertsCount}
                    </span>
                  )}
                </button>

                {/* Settings */}
                <button
                  onClick={() => {
                    onOpenSettings();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left border-b border-white/5"
                >
                  <Sliders size={15} className="text-slate-300" />
                  <span className="text-xs text-slate-300">Settings</span>
                </button>

                {/* Profile */}
                <button
                  onClick={() => {
                    onOpenAuth();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left"
                >
                  <User size={15} className="text-slate-300" />
                  <span className="text-xs text-slate-300">Profile</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left"
              >
                <User size={15} className="text-cyan-400" />
                <span className="text-xs font-semibold text-cyan-300">Sign In</span>
              </button>
            )}
          </div>
        )}
      </div>

      <MapPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        onLocationSelected={handleMapPick}
      />

      {/* Save Location Prompt Modal */}
      <Modal
        isOpen={!!pendingLocation}
        onClose={() => setPendingLocation(null)}
        title="Location Found"
        maxWidth="sm"
      >
        <div className="space-y-5">
          <p className="text-sm text-slate-300">
            Would you like to save <strong>{pendingLocation?.name}</strong> to your saved locations for quick access later?
          </p>
          <div className="flex items-center gap-3 justify-end pt-2">
            <button
              onClick={() => setPendingLocation(null)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
            >
              Only view
            </button>
            {isAuthenticated ? (
              <button
                onClick={() => {
                  if (pendingLocation) addSavedLocation(pendingLocation);
                  setPendingLocation(null);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold transition-colors"
              >
                Save Location
              </button>
            ) : (
              <button
                onClick={() => {
                  setPendingLocation(null);
                  onOpenAuth();
                }}
                className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold transition-colors"
              >
                Sign in to Save
              </button>
            )}
          </div>
        </div>
      </Modal>
    </header>
  );
};
