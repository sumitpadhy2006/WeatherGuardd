import React, { useState } from 'react';
import {
  Sparkles,
  CloudRain,
  Zap,
  Snowflake,
  Sun,
  Sunset,
  Moon,
  CloudFog,
  Radio,
  Sliders,
  X,
  Gauge,
  Layers,
  Wind,
  ThermometerSun,
  ThermometerSnowflake,
  Tornado,
  CloudHail,
  CloudLightning,
  Flame,
} from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { AmbientSimulationMode } from '../../types';

interface AtmosphereAmbienceBarProps {
  currentCondition?: string;
  isDay?: boolean;
}

export const AtmosphereAmbienceBar: React.FC<AtmosphereAmbienceBarProps> = ({
  currentCondition,
  isDay = true,
}) => {
  const { preferences, updatePreferences } = usePreferences();
  const [isOpen, setIsOpen] = useState(false);

  const activeMode = preferences.ambientSimulationMode || 'auto';
  const ambientEnabled = preferences.ambientEffectsEnabled !== false;

  const MODES: {
    id: AmbientSimulationMode;
    label: string;
    icon: React.ReactNode;
    color: string;
    description: string;
  }[] = [
    {
      id: 'auto',
      label: 'Live Auto Telemetry',
      icon: <Radio size={14} className="text-cyan-400" />,
      color: 'border-cyan-500/40 text-cyan-300',
      description: 'Synchronized in real-time to current solar position and live radar',
    },
    {
      id: 'clear_day',
      label: 'Solar Day (Sun Rays)',
      icon: <Sun size={14} className="text-amber-400" />,
      color: 'border-amber-500/40 text-amber-300',
      description: 'Radiant azure sky with rotating solar crepuscular optical rays',
    },
    {
      id: 'golden_hour',
      label: 'Golden Hour (Dawn/Dusk)',
      icon: <Sunset size={14} className="text-orange-400" />,
      color: 'border-orange-500/40 text-orange-300',
      description: 'Warm Rayleigh scattering amber gradients and low-angle sun flare',
    },
    {
      id: 'sunset',
      label: 'Sunset / Twilight',
      icon: <Sunset size={14} className="text-pink-400" />,
      color: 'border-pink-500/40 text-pink-300',
      description: 'Deep magenta, violet, and obsidian atmospheric horizon clouds',
    },
    {
      id: 'thunderstorm',
      label: 'Severe Thunderstorm',
      icon: <Zap size={14} className="text-amber-300" />,
      color: 'border-amber-400/40 text-amber-200',
      description: 'Torrential downpour with randomized multi-branch lightning bolts',
    },
    {
      id: 'rain',
      label: 'Precipitation Rain',
      icon: <CloudRain size={14} className="text-blue-400" />,
      color: 'border-blue-500/40 text-blue-300',
      description: 'Wind-vectored raindrops with dynamic water surface splash ripples',
    },
    {
      id: 'snow',
      label: 'Winter Blizzard Snow',
      icon: <Snowflake size={14} className="text-cyan-300" />,
      color: 'border-cyan-400/40 text-cyan-200',
      description: '3D depth-layered drifting snowflakes with Brownian turbulence',
    },
    {
      id: 'fog',
      label: 'Dense Mist / Stratum',
      icon: <CloudFog size={14} className="text-slate-300" />,
      color: 'border-slate-400/40 text-slate-200',
      description: 'Multi-octave rolling fog banks with soft Gaussian horizontal drift',
    },
    {
      id: 'aurora',
      label: 'Aurora Borealis',
      icon: <Sparkles size={14} className="text-emerald-400" />,
      color: 'border-emerald-500/40 text-emerald-300',
      description: 'Ethereal green and violet geomagnetic solar wind particle collisions',
    },
    {
      id: 'meteor_shower',
      label: 'Meteor Shower',
      icon: <Sparkles size={14} className="text-indigo-400" />,
      color: 'border-indigo-500/40 text-indigo-300',
      description: 'High-velocity atmospheric entry streaks and celestial debris',
    },
    {
      id: 'windy',
      label: 'High Winds / Gale',
      icon: <Wind size={14} className="text-teal-300" />,
      color: 'border-teal-400/40 text-teal-200',
      description: 'Visible atmospheric shear lines and rapid cloud displacement',
    },
    {
      id: 'heavy_snow',
      label: 'Heavy Snowfall',
      icon: <Snowflake size={14} className="text-blue-200" />,
      color: 'border-blue-300/40 text-blue-100',
      description: 'Dense, large-flake winter precipitation with reduced visibility',
    },
    {
      id: 'blizzard',
      label: 'Whiteout Blizzard',
      icon: <Wind size={14} className="text-slate-100" />,
      color: 'border-slate-200/40 text-slate-100',
      description: 'Extreme horizontal snow vectors and severe optical whitening',
    },
    {
      id: 'hail',
      label: 'Severe Hailstorm',
      icon: <CloudHail size={14} className="text-zinc-300" />,
      color: 'border-zinc-400/40 text-zinc-200',
      description: 'High-velocity solid ice precipitation and heavy downdrafts',
    },
    {
      id: 'tornado',
      label: 'Tornado Warning',
      icon: <Tornado size={14} className="text-red-500" />,
      color: 'border-red-600/40 text-red-400',
      description: 'Violent cyclonic vortex and extreme atmospheric darkening',
    },
    {
      id: 'cyclone',
      label: 'Hurricane / Cyclone',
      icon: <Tornado size={14} className="text-purple-400" />,
      color: 'border-purple-500/40 text-purple-300',
      description: 'Catastrophic swirling cloud bands and torrential rain',
    },
    {
      id: 'sandstorm',
      label: 'Dust / Sandstorm',
      icon: <CloudFog size={14} className="text-amber-600" />,
      color: 'border-amber-700/40 text-amber-500',
      description: 'Opaque particulate suspension with severe sepia tinting',
    },
    {
      id: 'heatwave',
      label: 'Extreme Heatwave',
      icon: <Flame size={14} className="text-orange-500" />,
      color: 'border-orange-600/40 text-orange-400',
      description: 'Severe optical heat distortion, chromatic aberration, and shimmering',
    },
    {
      id: 'cold_wave',
      label: 'Severe Cold Wave',
      icon: <ThermometerSnowflake size={14} className="text-cyan-200" />,
      color: 'border-cyan-300/40 text-cyan-100',
      description: 'Deep freeze atmospheric tinting and sharp visibility',
    },
    {
      id: 'frost',
      label: 'Freezing Frost',
      icon: <Snowflake size={14} className="text-sky-100" />,
      color: 'border-sky-200/40 text-sky-100',
      description: 'Radial ice crystal condensation forming on the viewport lens',
    },
    {
      id: 'deep_night',
      label: 'Deep Celestial Night',
      icon: <Moon size={14} className="text-indigo-400" />,
      color: 'border-indigo-500/40 text-indigo-300',
      description: 'Twinkling 200+ star field with periodic streaking shooting stars',
    },
  ];

  const currentLabel =
    activeMode === 'auto'
      ? `Live Sky: ${currentCondition || (isDay ? 'Clear Day' : 'Clear Night')}`
      : MODES.find((m) => m.id === activeMode)?.label || 'Custom Ambience';

  return (
    <div className="relative">
      {/* Trigger pill */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all backdrop-blur-xl cursor-pointer ${
            activeMode !== 'auto'
              ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-400/50 text-amber-200 shadow-lg shadow-amber-500/10'
              : 'bg-white/[0.08] hover:bg-white/[0.16] border-white/15 text-white hover:border-cyan-400/40 hover:text-cyan-300'
          }`}
          title="Adjust Apple-Style Weather Ambience & Simulation Layer"
        >
          <Sparkles size={13} className={activeMode !== 'auto' ? 'text-amber-300 animate-spin' : 'text-cyan-400'} />
          <span className="truncate max-w-[140px] sm:max-w-[180px] font-semibold">{currentLabel}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
        </button>
      </div>

      {/* Popover selector */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 rounded-3xl bg-slate-900/95 border border-white/15 p-4 shadow-2xl backdrop-blur-3xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Sparkles size={15} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Atmosphere Experience Layer
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Apple Weather dynamic background simulator
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Master Switch */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-xs font-mono">
              <span className="text-slate-300">Ambient Canvas FX</span>
              <button
                onClick={() =>
                  updatePreferences({ ambientEffectsEnabled: !ambientEnabled })
                }
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  ambientEnabled
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {ambientEnabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {/* Simulation Modes Grid */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {MODES.map((mode) => {
                const isSelected = activeMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => {
                      updatePreferences({ ambientSimulationMode: mode.id });
                      if (!ambientEnabled) updatePreferences({ ambientEffectsEnabled: true });
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
                        : 'bg-slate-950/40 border-white/5 hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    <div className="mt-0.5 p-1.5 rounded-lg bg-slate-900 border border-white/10 shrink-0">
                      {mode.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isSelected ? 'text-cyan-300' : 'text-slate-200'
                          }`}
                        >
                          {mode.label}
                        </span>
                        {isSelected && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        {mode.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Particle Density Setting */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Particle Density:</span>
              <div className="flex items-center gap-1">
                {(['low', 'medium', 'high', 'ultra'] as const).map((density) => (
                  <button
                    key={density}
                    onClick={() => updatePreferences({ particleDensity: density })}
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-all cursor-pointer ${
                      preferences.particleDensity === density
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {density}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
