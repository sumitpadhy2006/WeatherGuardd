import React from 'react';
import {
  Tractor,
  GraduationCap,
  Plane,
  Camera,
  Telescope,
  CheckCircle2,
  Sparkles,
  CloudLightning,
} from 'lucide-react';
import { UserRole } from '../../types/personalization';
import { usePersonalization } from '../../context/PersonalizationContext';

interface RoleOption {
  id: UserRole;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  badgeBg: string;
  perks: string[];
}

export const RoleSelector: React.FC = () => {
  const { role, setRole, firestoreSyncStatus } = usePersonalization();

  const ROLES: RoleOption[] = [
    {
      id: 'farmer',
      title: 'Farmer',
      subtitle: 'Agro-Meteorology',
      icon: <Tractor size={20} />,
      color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
      badgeBg: 'bg-emerald-500/20 text-emerald-300',
      perks: ['Soil moisture % & ET0', 'Spray window viability', 'Frost risk alerts', 'Irrigation guidance'],
    },
    {
      id: 'student',
      title: 'Student',
      subtitle: 'Campus & Commute',
      icon: <GraduationCap size={20} />,
      color: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
      badgeBg: 'bg-blue-500/20 text-blue-300',
      perks: ['Campus rain check', 'Transit & bike safety', 'Outdoor sports score', 'Study room comfort'],
    },
    {
      id: 'traveler',
      title: 'Traveler',
      subtitle: 'Itinerary & Flights',
      icon: <Plane size={20} />,
      color: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
      badgeBg: 'bg-amber-500/20 text-amber-300',
      perks: ['Multi-city weather', 'Flight turbulence risk', 'Packing checklist', 'Jet lag sunlight advice'],
    },
    {
      id: 'photographer',
      title: 'Photographer',
      subtitle: 'Golden Hour & Optics',
      icon: <Camera size={20} />,
      color: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
      badgeBg: 'bg-purple-500/20 text-purple-300',
      perks: ['Golden/Blue hour timers', 'Cloud ceiling & drama', 'Sun & Moon angles', 'Valley fog prediction'],
    },
    {
      id: 'astronomy',
      title: 'Astronomy Enthusiast',
      subtitle: 'Dark Sky & Ephemeris',
      icon: <Telescope size={20} />,
      color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
      badgeBg: 'bg-cyan-500/20 text-cyan-300',
      perks: ['Bortle dark sky class', 'Meteor shower radiant', 'Eclipse countdowns', 'ISS satellite flyovers'],
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-cyan-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Personalized Role Profile
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Tailors dashboard metrics & notifications
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Firestore: {firestoreSyncStatus === 'synced' ? 'Live Synced' : 'Local Cache'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {ROLES.map((r) => {
          const isSelected = role === r.id;

          return (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between group cursor-pointer ${
                isSelected
                  ? `${r.color} shadow-lg ring-1 ring-white/20`
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                      isSelected ? r.badgeBg : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {r.icon}
                  </div>
                  {isSelected && (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  )}
                </div>

                <div className="text-sm font-bold text-white">{r.title}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{r.subtitle}</div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 space-y-0.5">
                {r.perks.slice(0, 2).map((perk, idx) => (
                  <div key={idx} className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                    <span className="text-slate-600">•</span>
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
