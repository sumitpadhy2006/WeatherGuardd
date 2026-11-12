import React, { useState } from 'react';
import {
  Sparkles,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Maximize2,
  Calendar,
  Layers,
  Compass,
  Info,
} from 'lucide-react';
import { NasaApodItem, NasaNeoItem } from '../../types/astronomy';

interface NasaSpaceHubProps {
  apod: NasaApodItem | null;
  neoAsteroids: NasaNeoItem[];
}

export const NasaSpaceHub: React.FC<NasaSpaceHubProps> = ({ apod, neoAsteroids }) => {
  const [showHdModal, setShowHdModal] = useState(false);

  return (
    <div className="space-y-6" id="nasa-space-hub-module">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* NASA Astronomy Picture of the Day (APOD) */}
        <div className="lg:col-span-7 bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shadow-lg shadow-cyan-500/10">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    NASA Astronomy Picture of the Day
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    NASA APOD API • {apod?.date}
                  </p>
                </div>
              </div>
            </div>

            {apod && (
              <div className="space-y-3">
                {/* Image Stage */}
                <div
                  onClick={() => setShowHdModal(true)}
                  className="relative rounded-2xl overflow-hidden group cursor-pointer border border-slate-800/80 aspect-video bg-slate-950"
                >
                  <img
                    src={apod.url}
                    alt={apod.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs font-mono text-cyan-300 flex items-center gap-1.5 backdrop-blur-md">
                    <Maximize2 size={13} />
                    <span>View Full HD</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-left">
                    <h4 className="text-sm sm:text-base font-bold text-white leading-snug drop-shadow-md">
                      {apod.title}
                    </h4>
                    {apod.copyright && (
                      <span className="text-[11px] font-mono text-slate-300 block drop-shadow-sm">
                        Credit: {apod.copyright}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed max-h-36 overflow-y-auto pr-1">
                  {apod.explanation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* NASA JPL Near-Earth Asteroid (NEO) Radar */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shadow-lg shadow-amber-500/10">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    NASA Asteroid Radar (NEO)
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    JPL NeoWs Planetary Defense Telemetry
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {neoAsteroids.map((ast) => (
                <div
                  key={ast.id}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{ast.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Approach: {ast.closeApproachDate}
                      </span>
                    </div>

                    {ast.isPotentiallyHazardous ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold flex items-center gap-1">
                        <ShieldAlert size={10} />
                        Hazard Watch
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1">
                        <ShieldCheck size={10} />
                        Safe Flyby
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 bg-slate-900/60 border border-slate-800/60 rounded-xl p-2 text-center font-mono text-[10px]">
                    <div>
                      <span className="text-[8px] uppercase text-slate-500 block">Miss Distance</span>
                      <span className="text-cyan-300 font-bold">
                        {(ast.missDistanceKm / 1000).toFixed(0)}k km
                      </span>
                    </div>

                    <div>
                      <span className="text-[8px] uppercase text-slate-500 block">Velocity</span>
                      <span className="text-amber-300 font-bold">
                        {(ast.relativeVelocityKmh / 1000).toFixed(1)}k km/h
                      </span>
                    </div>

                    <div>
                      <span className="text-[8px] uppercase text-slate-500 block">Diameter</span>
                      <span className="text-slate-200 font-bold">
                        {ast.estimatedDiameterMinM}–{ast.estimatedDiameterMaxM}m
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* HD APOD Modal */}
      {showHdModal && apod && (
        <div
          onClick={() => setShowHdModal(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">{apod.title}</h3>
              <button
                onClick={() => setShowHdModal(false)}
                className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded-lg bg-slate-800"
              >
                Close (ESC)
              </button>
            </div>
            <div className="p-2 overflow-auto flex items-center justify-center bg-black">
              <img
                src={apod.hdurl || apod.url}
                alt={apod.title}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
