import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  Zap,
  Maximize2,
  HelpCircle,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { NearEarthObject } from '../../types/neo';

interface HazardScoreMatrixProps {
  asteroids: NearEarthObject[];
  sentryWatchlist: NearEarthObject[];
  onSelectAsteroid: (ast: NearEarthObject) => void;
}

export const HazardScoreMatrix: React.FC<HazardScoreMatrixProps> = ({
  asteroids,
  sentryWatchlist,
  onSelectAsteroid,
}) => {
  const [selectedTorinoTab, setSelectedTorinoTab] = useState<number>(0);

  // Torino scale breakdown levels
  const TORINO_LEVELS = [
    {
      level: 0,
      name: 'No Hazard (White)',
      color: 'bg-slate-500/20 text-slate-300 border-slate-600',
      tagColor: 'text-slate-400',
      description:
        'The likelihood of a collision is zero, or is so low as to be effectively zero. Also applies to small objects like meteors that burn up harmlessly in the atmosphere.',
      publicAction: 'No public hazard. Routine automated sky survey monitoring.',
    },
    {
      level: 1,
      name: 'Normal (Green)',
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
      tagColor: 'text-emerald-400',
      description:
        'A routine discovery that is projected to pass near Earth without posing an unusual level of danger. Current calculations show the chance of collision is extremely unlikely.',
      publicAction: 'No cause for public attention or concern. Telescopic follow-up observations will likely reassign to Level 0.',
    },
    {
      level: 2,
      name: 'Meriting Attention (Yellow - 2 to 4)',
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      tagColor: 'text-amber-400',
      description:
        'A close encounter meriting attention by astronomers. Current calculations give a 1% or greater chance of collision capable of localized devastation.',
      publicAction: 'Merits attention by astronomers; does not require public action. Telescopic refinement will determine true path.',
    },
    {
      level: 5,
      name: 'Threatening (Orange - 5 to 7)',
      color: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
      tagColor: 'text-orange-400',
      description:
        'A close encounter posing a serious, but not yet certain, danger of localized to regional devastation, or a global catastrophe if impact occurs.',
      publicAction: 'Critical attention by astronomers, international space agencies (NASA DART / ESA Hera), and governmental disaster planning contingency.',
    },
    {
      level: 8,
      name: 'Certain Collisions (Red - 8 to 10)',
      color: 'bg-red-500/20 text-red-300 border-red-500/50',
      tagColor: 'text-red-400',
      description:
        'A collision is certain. For smaller objects, capable of causing localized destruction (Level 8); for larger objects, regional destruction (Level 9) or a global climatic catastrophe capable of threatening civilization (Level 10).',
      publicAction: 'Immediate planetary defense kinetic deflection missions, civil defense evacuation, and global disaster readiness.',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-amber-950/30 border border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Planetary Defense & Hazard Scoring Matrix
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Torino & Palermo Scale
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive impact hazard assessment combining kinetic energy ($E=\frac{1}{2}mv^2$), impact probability, and orbital keyhole intersection.
            </p>
          </div>
        </div>
      </div>

      {/* Sentry Impact Watchlist */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-purple-400" />
            <h3 className="text-sm font-bold text-white">
              NASA JPL Sentry Impact Risk System Watchlist
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              High-Precision Ephemerides
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {sentryWatchlist.length} Monitored Objects
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sentryWatchlist.map((ast) => {
            const sentry = ast.sentry_data;
            const diam = Math.round(ast.estimated_diameter.meters.estimated_diameter_max);

            return (
              <div
                key={ast.id}
                onClick={() => onSelectAsteroid(ast)}
                className="p-3.5 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                        {ast.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                        Ø ~{diam} m • {ast.spectralType || 'Asteroid'}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      Torino {sentry?.torino_scale ?? 0}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Impact Prob:</span>
                      <span className="text-amber-400 font-bold">{sentry?.impact_probability_str || '1 in 100,000'}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Years Window:</span>
                      <span className="text-slate-300">{sentry?.potential_impact_years_range || '2030 - 2100'}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Palermo Max:</span>
                      <span className="text-slate-300">{sentry?.palermo_scale_max || -2.5}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Kinetic Energy:</span>
                      <span className="text-cyan-400 font-bold">{sentry?.energy_mt || ast.hazardScore.kineticEnergyMegatons} Mt TNT</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-purple-400 font-medium">
                  <span>View Full Sentry Dossier</span>
                  <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Torino Scale Explainer & Category Cards */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              The Torino Impact Hazard Scale (0 to 10)
            </h3>
          </div>
          <span className="text-xs text-slate-400">IAU Standard</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {TORINO_LEVELS.map((tl, idx) => (
            <button
              key={tl.level}
              onClick={() => setSelectedTorinoTab(idx)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selectedTorinoTab === idx
                  ? `${tl.color} shadow-md`
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="text-[11px] font-bold truncate">{tl.name}</div>
              <div className="text-[9px] font-mono opacity-80 mt-0.5">Scale {tl.level}</div>
            </button>
          ))}
        </div>

        {/* Selected Torino Level Details */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
          <div className="font-bold text-white flex items-center gap-2">
            <span className={TORINO_LEVELS[selectedTorinoTab].tagColor}>
              ● {TORINO_LEVELS[selectedTorinoTab].name}
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {TORINO_LEVELS[selectedTorinoTab].description}
          </p>
          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-slate-400">
            <span className="font-semibold text-slate-300">Action Protocol:</span>
            <span>{TORINO_LEVELS[selectedTorinoTab].publicAction}</span>
          </div>
        </div>
      </div>

      {/* Kinetic Energy & Physical Cratering Simulator Matrix */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-cyan-400" />
          <h3 className="text-sm font-bold text-white">
            Kinetic Energy & Atmospheric Impact Reference Scaling
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 space-y-1">
            <div className="font-bold text-slate-200">10 – 25 meters</div>
            <div className="text-[10px] font-mono text-cyan-400">~0.1 to 0.5 Mt TNT</div>
            <p className="text-[11px] text-slate-400">
              Chelyabinsk (2013). High-altitude airburst; shockwave shatters glass and damages roofs.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 space-y-1">
            <div className="font-bold text-slate-200">50 – 100 meters</div>
            <div className="text-[10px] font-mono text-amber-400">~5 to 20 Mt TNT</div>
            <p className="text-[11px] text-slate-400">
              Tunguska (1908). Super-airburst or Barringer Meteor Crater; levels 2,000 km² of forest/metropolis.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 space-y-1">
            <div className="font-bold text-slate-200">140 – 500 meters</div>
            <div className="text-[10px] font-mono text-orange-400">~100 to 1,500 Mt TNT</div>
            <p className="text-[11px] text-slate-400">
              Apophis / Bennu class. Regional devastation, severe tsunamis if ocean impact, crater Ø 5-10 km.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 space-y-1">
            <div className="font-bold text-slate-200">&gt; 1,000 meters (1 km+)</div>
            <div className="text-[10px] font-mono text-red-400">&gt; 50,000 Mt TNT</div>
            <p className="text-[11px] text-slate-400">
              Global extinction class. Stratospheric ozone depletion, nuclear winter dust blackout, mass extinction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
