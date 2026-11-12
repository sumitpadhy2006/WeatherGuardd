import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { WeatherGuardLogo } from '../common/WeatherGuardLogo';
import { usePreferences } from '../../context/PreferencesContext';
import { useAuth } from '../../context/AuthContext';
import { ThemeMode, UnitSystem, UserRole } from '../../types';
import {
  Sliders,
  Sun,
  Moon,
  Eye,
  Volume2,
  VolumeX,
  Bell,
  Check,
  Compass,
  User,
  Shield,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'modal' | 'page';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, mode }) => {
  const { preferences, updatePreferences, setTheme, setUnits, setRole } = usePreferences();
  const { user, isAuthenticated } = useAuth();

  const ROLES: { id: UserRole; label: string; desc: string }[] = [
    { id: 'general', label: 'General / Citizen', desc: 'Standard daily atmospheric & commute metrics' },
    { id: 'farmer', label: 'Farmer / Agriculture', desc: 'Precipitation, dew point, soil & pesticide spray index' },
    { id: 'student', label: 'Student / Campus', desc: 'Transit weather, backpack checklist & exam weather' },
    { id: 'traveler', label: 'Traveler / Explorer', desc: 'Pack list, flight delay risk & destination forecast' },
    { id: 'photographer', label: 'Photographer / Creator', desc: 'Golden hour, blue hour & ephemeris calculations' },
    { id: 'astronomy', label: 'Astronomer / Stargazer', desc: 'Stargazing index, cloud deck & night-vision telemetry' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Global Settings & Preferences"
      subtitle="Customize units, interface theme, display metrics, and system behavior"
      maxWidth="full"
      mode={mode}
    >
      <div className="space-y-6">
        {/* Unit Systems */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Meteorological Unit Standard
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setUnits('metric')}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                preferences.units === 'metric'
                  ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div>
                <span className="text-sm font-bold block">Metric System</span>
                <span className="text-xs text-slate-400 mt-0.5 block">°C, km/h, hPa, mm</span>
              </div>
              {preferences.units === 'metric' && <Check size={18} className="text-cyan-400" />}
            </button>

            <button
              onClick={() => setUnits('imperial')}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                preferences.units === 'imperial'
                  ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div>
                <span className="text-sm font-bold block">Imperial System</span>
                <span className="text-xs text-slate-400 mt-0.5 block">°F, mph, inHg, in</span>
              </div>
              {preferences.units === 'imperial' && <Check size={18} className="text-cyan-400" />}
            </button>
          </div>
        </div>

        {/* Visual Themes */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Display Theme
          </label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <button
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                preferences.theme === 'dark'
                  ? 'bg-slate-800 border-cyan-500 text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Moon size={18} className="text-indigo-400" />
              <span className="text-xs font-semibold">Deep Obsidian</span>
            </button>

            <button
              onClick={() => setTheme('light')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                preferences.theme === 'light'
                  ? 'bg-slate-200 border-cyan-500 text-slate-900 font-bold'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Sun size={18} className="text-amber-500" />
              <span className="text-xs font-semibold">Solar Day</span>
            </button>

            <button
              onClick={() => setTheme('astronomer-red')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                preferences.theme === 'astronomer-red'
                  ? 'bg-red-950/70 border-red-500 text-red-300'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Eye size={18} className="text-red-400" />
              <span className="text-xs font-semibold">Astro Red (650nm)</span>
            </button>
          </div>
        </div>

        {/* Persona Adaptation */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            User Persona Focus
          </label>
          <div className="space-y-2">
            {ROLES.map((r) => (
              <div
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  preferences.role === r.id
                    ? 'bg-cyan-950/30 border-cyan-500 text-slate-100'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <span className="text-sm font-semibold block">{r.label}</span>
                  <span className="text-xs text-slate-400 mt-0.5 block">{r.desc}</span>
                </div>
                {preferences.role === r.id && <Check size={16} className="text-cyan-400 shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* P19 Ambient Atmospheric Simulation & Motion Layer */}
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Atmospheric Motion & Ambient Canvas
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
              <div>
                <span className="text-sm font-medium text-slate-200 block">
                  Dynamic Canvas Weather FX
                </span>
                <span className="text-xs text-slate-400 block">
                  Apple Weather particle effects (rain, snow, lightning, sun rays, stars)
                </span>
              </div>
              <button
                onClick={() =>
                  updatePreferences({
                    ambientEffectsEnabled: preferences.ambientEffectsEnabled === false ? true : false,
                  })
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                  preferences.ambientEffectsEnabled !== false
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {preferences.ambientEffectsEnabled !== false ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
              <div>
                <span className="text-sm font-medium text-slate-200 block">Particle Density</span>
                <span className="text-xs text-slate-400 block">
                  Adjust GPU particle count & frame rendering rate
                </span>
              </div>
              <div className="flex items-center gap-1">
                {(['low', 'medium', 'high', 'ultra'] as const).map((density) => (
                  <button
                    key={density}
                    onClick={() => updatePreferences({ particleDensity: density })}
                    className={`px-2 py-1 rounded text-[10px] uppercase font-bold font-mono transition-all ${
                      (preferences.particleDensity || 'high') === density
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {density}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
              <div>
                <span className="text-sm font-medium text-slate-200 block">Reduced Motion</span>
                <span className="text-xs text-slate-400 block">
                  Minimize animated springs, rapid lightning flashes, and transitions
                </span>
              </div>
              <button
                onClick={() =>
                  updatePreferences({
                    reducedMotion: !preferences.reducedMotion,
                  })
                }
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  preferences.reducedMotion ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    preferences.reducedMotion ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Quiet Hours & Alerts */}
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
              <Bell size={16} className="text-cyan-400" />
              <span>Quiet Hours Mode</span>
            </div>
            <button
              onClick={() =>
                updatePreferences({ quietHoursEnabled: !preferences.quietHoursEnabled })
              }
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                preferences.quietHoursEnabled ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  preferences.quietHoursEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          {preferences.quietHoursEnabled && (
            <p className="text-xs text-slate-400">
              Mutes non-critical weather alerts between 22:00 and 07:00 local time.
            </p>
          )}
        </div>

        {/* System & Brand Identity */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            <WeatherGuardLogo size="xs" />
            <span className="font-semibold text-slate-300">WeatherGuard v2.4</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">Atmospheric & Planetary Intelligence</span>
        </div>
      </div>
    </Modal>
  );
};
