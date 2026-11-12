import React from 'react';
import { Home, CloudSun, Map, Globe, Sparkles, Flame, Radar, Sliders, User } from 'lucide-react';
import { usePersonalization } from '../../context/PersonalizationContext';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/formatters';

interface BottomNavProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenLocations: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenLocations,
  onOpenSettings,
  onOpenAuth,
}) => {
  const { isAuthenticated, user } = useAuth();
  const { unreadAlertsCount } = usePersonalization();

  const handleTabClick = (tabId: string, requiresAuth: boolean = false) => {
    if (requiresAuth && !isAuthenticated) {
      onSelectTab(`locked-${tabId}`);
    } else {
      onSelectTab(tabId);
    }
  };

  return (
    <nav
      id="mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090D14]/95 backdrop-blur-xl border-t border-slate-800/80 px-1 py-2 flex items-center justify-around select-none"
    >
      <button
        onClick={() => handleTabClick('home')}
        className={`flex flex-col items-center gap-1 p-1 transition-colors ${
          activeTab === 'home' ? 'text-cyan-400 font-semibold' : 'text-slate-400'
        }`}
      >
        <Home size={17} />
        <span className="text-[9px]">Home</span>
      </button>

      <button
        onClick={() => handleTabClick('explorer', true)}
        className={`flex flex-col items-center gap-1 p-1 transition-colors ${
          activeTab === 'explorer' ? 'text-cyan-400 font-semibold' : 'text-slate-400'
        }`}
      >
        <Map size={17} />
        <span className="text-[9px]">Explorer</span>
      </button>

      <button
        onClick={() => handleTabClick('weather')}
        className={`flex flex-col items-center gap-1 p-1 transition-colors ${
          activeTab === 'weather' ? 'text-cyan-400 font-semibold' : 'text-slate-400'
        }`}
      >
        <CloudSun size={17} />
        <span className="text-[9px]">Atmosphere</span>
      </button>



      <button
        onClick={() => handleTabClick('earthwatch', true)}
        className={`flex flex-col items-center gap-1 p-1 transition-colors ${
          activeTab === 'earthwatch' ? 'text-red-400 font-semibold' : 'text-slate-400'
        }`}
      >
        <Globe size={17} />
        <span className="text-[9px]">Earth</span>
      </button>

      <button
        onClick={() => handleTabClick('space', true)}
        className={`flex flex-col items-center gap-1 p-1 transition-colors ${
          activeTab === 'space' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
        }`}
      >
        <Sparkles size={17} />
        <span className="text-[9px]">Sky</span>
      </button>

      <button
        onClick={() => handleTabClick('spaceweather', true)}
        className={`flex flex-col items-center gap-1 p-1 transition-colors ${
          activeTab === 'spaceweather' ? 'text-amber-400 font-semibold' : 'text-slate-400'
        }`}
      >
        <Flame size={17} />
        <span className="text-[9px]">Space Wx</span>
      </button>

      <button
        onClick={() => handleTabClick('neo', true)}
        className={`flex flex-col items-center gap-1 p-1 transition-colors ${
          activeTab === 'neo' ? 'text-cyan-400 font-semibold' : 'text-slate-400'
        }`}
      >
        <Radar size={17} />
        <span className="text-[9px]">Asteroids</span>
      </button>

      <button
        onClick={() => onOpenAuth()}
        className="flex flex-col items-center gap-1 p-1 text-slate-400 hover:text-slate-200 transition-colors"
      >
        {isAuthenticated && user ? (
          user.profilePhotoUrl ? (
            <img src={user.profilePhotoUrl} alt="Profile" className="w-[18px] h-[18px] rounded-full object-cover border border-cyan-500/40" />
          ) : (
            <div className="w-[18px] h-[18px] rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[8px] border border-cyan-500/40">
              {getInitials(user.displayName)}
            </div>
          )
        ) : (
          <User size={18} />
        )}
        <span className="text-[9px]">Profile</span>
      </button>
    </nav>
  );
};




