import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Shield,
  CloudSun,
  Globe,
  Radio,
  MapPin,
  Sliders,
  User,
  Compass,
  Sparkles,
  Flame,
  Radar,
  BellRing,
  PanelLeftClose,
  Map,
  X,
  ChevronRight,
  ChevronDown,
  Moon,
  Sun,
  Telescope,
  Star,
  Info,
  Calendar,
  Rocket,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePersonalization } from '../../context/PersonalizationContext';
import { useLocation } from '../../context/LocationContext';
import { Badge } from '../common/Badge';
import { WeatherGuardLogo } from '../common/WeatherGuardLogo';
import { getInitials } from '../../utils/formatters';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenLocations: () => void;
  onOpenSettings: () => void;
  onOpenAuth: (message?: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  activeTab,
  onSelectTab,
  onOpenLocations,
  onOpenSettings,
  onOpenAuth,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { unreadAlertsCount } = usePersonalization();
  const { currentLocation } = useLocation();

  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleExpanded = (id: string) => {
    setExpandedMenus((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const setExpanded = (id: string, expand: boolean) => {
    setExpandedMenus((prev) => {
      if (expand && !prev.includes(id)) return [...prev, id];
      if (!expand && prev.includes(id)) return prev.filter((i) => i !== id);
      return prev;
    });
  };

  const handleLunarCalculationsClick = () => {
    const lat = currentLocation?.lat || 19.0001;
    const lon = currentLocation?.lon || 72.5697;
    const now = new Date();
    
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    
    const url = `https://www.mooncalc.org/#/${lat},${lon},3/${yyyy}.${mm}.${dd}/${hh}:${min}/1/3`;
    window.open(url, '_blank');
  };

  interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    badgeVariant?: 'cyan' | 'emerald' | 'amber' | 'purple' | 'red';
    action?: () => void;
    subItems?: NavItem[];
    requiresAuth?: boolean;
  }

  interface NavSection {
    title?: string;
    items: NavItem[];
  }

  const NAV_SECTIONS: NavSection[] = [
    {
      items: [
        {
          id: 'home',
          label: 'Home',
          icon: <Home size={19} />,
        },
        {
          id: 'home-calendar',
          label: 'Get info in Calendar',
          icon: <Calendar size={19} />,
        }
      ],
    },
    {
      title: 'WEATHER',
      items: [
        {
          id: 'weather',
          label: 'Atmosphere Core',
          icon: <CloudSun size={19} />,
          badge: 'Live',
          badgeVariant: 'cyan',
        },
        {
          id: 'explorer',
          label: 'Weather Explorer',
          icon: <Map size={19} />,
          requiresAuth: true,
        },
      ],
    },
    {
      title: 'EARTH',
      items: [
        {
          id: 'earthwatch',
          label: 'Earth Watch',
          icon: <Globe size={19} />,
          badge: 'USGS',
          requiresAuth: true,
        },
        {
          id: 'earth-observation',
          label: 'Earth Observation',
          icon: <Telescope size={19} />,
          action: () => window.open('https://orbitalradar.com/', '_blank'),
          requiresAuth: true,
        },
        {
          id: 'earth-essentials',
          label: 'Essentials',
          icon: <Info size={19} />,
          action: () => window.open('https://www.timeanddate.com/moon/phases/', '_blank'),
          requiresAuth: true,
        },
      ],
    },
    {
      title: 'SPACE',
      items: [
        {
          id: 'space',
          label: 'Sky & Space',
          icon: <Sparkles size={19} />,
          badge: 'Ephemeris',
          requiresAuth: true,
        },
        {
          id: 'spaceweather',
          label: 'Space Weather',
          icon: <Flame size={19} />,
          badge: 'DONKI',
          requiresAuth: true,
        },
        {
          id: 'neo',
          label: 'Asteroids',
          icon: <Radar size={19} />,
          badge: 'NeoWs',
          requiresAuth: true,
        },
        {
          id: 'celestial-bodies',
          label: 'Celestial Bodies',
          icon: <Moon size={19} />,
          requiresAuth: true,
          subItems: [
            { id: 'cb-sun', label: 'Sun', icon: <Sun size={15} />, action: () => window.open('https://orbitalradar.com/sun', '_blank') },
            { id: 'cb-moon', label: 'Moon', icon: <Moon size={15} />, action: () => window.open('https://orbitalradar.com/moon', '_blank') },
            { id: 'cb-mars', label: 'Mars', icon: <Globe size={15} className="text-red-400" />, action: () => window.open('https://orbitalradar.com/mars', '_blank') },
            { id: 'cb-deepspace', label: 'Deep Space', icon: <Telescope size={15} />, action: () => window.open('https://orbitalradar.com/deep-space', '_blank') },
            { id: 'cb-stellar', label: 'Stellar', icon: <Star size={15} />, action: () => window.open('https://stellarium-web.org/', '_blank') },
            { id: 'cb-essentials', label: 'Lunar Calculations', icon: <Info size={15} />, action: handleLunarCalculationsClick },
          ]
        },
        {
          id: 'space-essentials',
          label: 'Essentials',
          icon: <Info size={19} />,
          requiresAuth: true,
          subItems: [
            { id: 'ess-spaceweather', label: 'Space Weather', icon: <Flame size={15} />, action: () => window.open('https://orbitalradar.com/space-weather', '_blank') },
            { id: 'ess-eclipses', label: 'Eclipses', icon: <Moon size={15} />, action: () => window.open('https://orbitalradar.com/eclipses', '_blank') },
            { id: 'ess-neo', label: 'Near-Earth Objects', icon: <Radar size={15} />, action: () => window.open('https://orbitalradar.com/near-earth-objects', '_blank') },
            { id: 'ess-groundlink', label: 'Groundlink', icon: <MapPin size={15} />, action: () => window.open('https://orbitalradar.com/groundlink', '_blank') },
          ]
        },
      ],
    },
    {
      title: 'SATELLITES',
      items: [
        {
          id: 'ess-satellite',
          label: 'Satellite Directory',
          icon: <Globe size={19} />,
          action: () => window.open('https://orbitalradar.com/satellite-directory', '_blank'),
          requiresAuth: true,
        },
        {
          id: 'satellite-pass',
          label: 'Satellite Pass',
          icon: <Radio size={19} />,
          action: () => window.open('https://orbitalradar.com/satellite-pass-predictions', '_blank'),
          requiresAuth: true,
        },
        {
          id: 'launch-logs',
          label: 'Launch Logs',
          icon: <Flame size={19} />,
          action: () => window.open('https://orbitalradar.com/satellite-launch-log', '_blank'),
          requiresAuth: true,
        },
        {
          id: 'trackers',
          label: 'Trackers',
          icon: <Radar size={19} />,
          action: () => window.open('https://orbitalradar.com/trackers', '_blank'),
          requiresAuth: true,
        },
        {
          id: 'live-launch',
          label: 'Live Launch',
          icon: <Rocket size={19} />,
          action: () => window.open('https://orbitalradar.com/launch-schedule', '_blank'),
          requiresAuth: true,
        },
      ],
    },
    ...(isAuthenticated
      ? [
          {
            title: 'PERSONAL',
            items: [
              {
                id: 'alerts',
                label: 'Alerts',
                icon: <BellRing size={19} />,
                badge:
                  unreadAlertsCount > 0
                    ? `${unreadAlertsCount} Alert${unreadAlertsCount > 1 ? 's' : ''}`
                    : undefined,
                badgeVariant: 'emerald' as const,
              },
              {
                id: 'saved-places',
                label: 'Saved Places',
                icon: <MapPin size={19} />,
              },
              {
                id: 'profile',
                label: 'Profile',
                icon: <User size={19} />,
              },
              {
                id: 'settings',
                label: 'Settings',
                icon: <Sliders size={19} />,
              },
            ],
          },
        ]
      : []),
    {
      title: 'PLATFORM',
      items: [
        {
          id: 'about',
          label: 'About Us',
          icon: <Info size={19} />,
          action: () => onSelectTab('about'),
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay when opened */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 md:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Main Collapsible Sidebar */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.aside
            id="app-sidebar"
            initial={{ width: 0, opacity: 0, x: -20 }}
            animate={{ width: 296, opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: -20 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed md:relative top-0 left-0 z-50 md:z-30 h-screen shrink-0 select-none overflow-y-auto overflow-x-hidden flex flex-col justify-between p-3.5 bg-slate-950/85 md:bg-slate-950/45 backdrop-blur-2xl border-r border-white/10 shadow-2xl md:shadow-none"
            style={{ width: 296 }}
          >
            {/* Brand & Shield Emblem */}
            <div className="space-y-4 w-full">
              <div className="flex items-center justify-between px-1 py-1">
                <div className="flex items-center gap-2.5">
                  <WeatherGuardLogo size="lg" animate />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-base tracking-tight text-white font-sans whitespace-nowrap">
                        WEATHER<span className="text-cyan-400">GUARD</span>
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block -mt-0.5 whitespace-nowrap">
                      Planetary Intelligence
                    </span>
                  </div>
                </div>

                {/* Collapse Button inside header */}
                <button
                  id="collapse-sidebar-inner-btn"
                  onClick={onToggle}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                  title="Collapse sidebar (Full screen)"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose size={18} className="hidden md:block" />
                  <X size={18} className="md:hidden" />
                </button>
              </div>

              {/* Navigation Sections */}
              <div className="space-y-3 pt-1">
                {NAV_SECTIONS.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-1">
                    {section.title && (
                      <div className="flex items-center gap-2 px-3 pt-2 pb-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono whitespace-nowrap">
                          ── {section.title} ──
                        </span>
                      </div>
                    )}

                    {section.items.map((item, iIdx) => {
                      const isActive = activeTab === item.id || activeTab === `locked-${item.id}`;
                      const hasSubItems = item.subItems && item.subItems.length > 0;
                      const isExpanded = expandedMenus.includes(item.id);

                      return (
                        <div 
                          key={`${item.id}-${iIdx}`} 
                          className="space-y-1"
                          onMouseEnter={() => hasSubItems && setExpanded(item.id, true)}
                          onMouseLeave={() => hasSubItems && setExpanded(item.id, false)}
                        >
                          <button
                            onClick={() => {
                              if (item.requiresAuth && !isAuthenticated) {
                                onSelectTab(`locked-${item.id}`);
                                return;
                              }
                              
                              if (!hasSubItems) {
                                if (item.action) {
                                  item.action();
                                } else {
                                  onSelectTab(item.id);
                                }
                              }
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                              isActive && !hasSubItems
                                ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-400/40 shadow-sm shadow-cyan-500/10'
                                : 'text-slate-300 hover:text-white hover:bg-white/[0.08] border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className={`shrink-0 ${isActive && !hasSubItems ? 'text-cyan-400' : 'text-slate-400'}`}>
                                {item.icon}
                              </span>
                              <span className="whitespace-nowrap truncate">{item.label}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {item.badge && (
                                <span className="shrink-0">
                                  <Badge variant={(item.badgeVariant as any) || 'cyan'} size="sm">
                                    {item.badge}
                                  </Badge>
                                </span>
                              )}
                              {hasSubItems && (
                                <span className="text-slate-500">
                                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </span>
                              )}
                            </div>
                          </button>

                          {/* Sub Items */}
                          <AnimatePresence>
                            {hasSubItems && isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="pl-9 space-y-1 overflow-hidden"
                              >
                                {item.subItems!.map((subItem) => (
                                  <button
                                    key={subItem.id}
                                    onClick={() => {
                                      if (item.requiresAuth && !isAuthenticated) {
                                        onSelectTab(`locked-${subItem.id}`);
                                        return;
                                      }
                                      if (subItem.action) subItem.action();
                                      // Normally we'd select tab here, but they are inactive placeholders for now
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-colors"
                                  >
                                    <span className="text-slate-500">{subItem.icon}</span>
                                    <span>{subItem.label}</span>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Profile & System Badge */}
            <div className="space-y-3 pt-4 border-t border-white/10 w-full mt-auto">
              {isAuthenticated ? (
                <button
                  onClick={() => onOpenAuth()}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-cyan-400/30 transition-all text-left cursor-pointer"
                >
                  {user.profilePhotoUrl ? (
                    <img
                      src={user.profilePhotoUrl}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-700"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {getInitials(user.displayName)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-slate-200 block truncate whitespace-nowrap">
                      {user.displayName}
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono block uppercase whitespace-nowrap truncate">
                      {user.role}
                    </span>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => onOpenAuth()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 hover:border-cyan-400/60 text-cyan-300 text-xs font-semibold transition-all cursor-pointer shadow-sm shadow-cyan-500/10"
                >
                  <User size={15} />
                  <span>Sign In / Create Account</span>
                </button>
              )}

              <div className="flex items-center justify-between px-2 text-[10px] font-mono text-slate-400">
                <span className="whitespace-nowrap">v1.0.0-MVP</span>
                <span className="flex items-center gap-1 text-emerald-400 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  STREAMING
                </span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
