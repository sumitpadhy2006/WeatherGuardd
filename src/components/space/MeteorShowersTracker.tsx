import React from 'react';
import {
  Flame,
  Calendar,
  Sparkles,
  Compass,
  Gauge,
  Moon,
  Info,
  Clock,
  X,
} from 'lucide-react';
import { MeteorShowerItem } from '../../types/astronomy';

interface MeteorShowersTrackerProps {
  meteorShowers: MeteorShowerItem[];
}

export const MeteorShowersTracker: React.FC<MeteorShowersTrackerProps> = ({ meteorShowers }) => {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const statusBadge: Record<string, { label: string; class: string }> = {
    peak_tonight: {
      label: 'Peak Activity Tonight',
      class: 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold animate-pulse',
    },
    active_now: {
      label: 'Active Shower',
      class: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold',
    },
    approaching: {
      label: 'Approaching Soon',
      class: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
    },
    past: {
      label: 'Annual Cycle Complete',
      class: 'bg-slate-800 border-slate-700 text-slate-400',
    },
  };

  const moonBadge: Record<string, string> = {
    Low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    Moderate: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    High: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    Severe: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  };

  const getMeteorImage = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('eta aquariid')) return '/assets/meteors/eta_aquariids.jpg';
    if (n.includes('geminid')) return '/assets/meteors/geminids.webp';
    if (n.includes('leonid')) return '/assets/meteors/leonids.jpg';
    if (n.includes('lyrid')) return '/assets/meteors/lyrids.jpg';
    if (n.includes('orionid')) return '/assets/meteors/orionids.jpg';
    if (n.includes('perseid')) return '/assets/meteors/perseids.jpg';
    if (n.includes('quadrantid')) return '/assets/meteors/quadrantids.jpg';
    return '/assets/meteors/perseids.jpg'; // fallback
  };

  return (
    <div className="space-y-6" id="meteor-showers-module">
      <div className="bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold shadow-lg shadow-rose-500/10">
              <Flame size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Meteor Showers Tracker & Peak ZHR
              </h3>
              <p className="text-xs text-slate-400">
                Annual cometary particle streams, radiant points, Zenithal Hourly Rates & lunar wash interference
              </p>
            </div>
          </div>
        </div>

        {/* Showers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {meteorShowers.map((shower) => {
            const status = statusBadge[shower.status] || statusBadge.past;
            const moonInterf = moonBadge[shower.moonInterferenceRating] || moonBadge.Low;

            return (
              <div
                key={shower.id}
                className="bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-lg group relative"
              >
                {/* Image Header */}
                <div 
                  className="h-36 w-full relative overflow-hidden bg-slate-900 shrink-0 cursor-pointer"
                  onClick={() => setSelectedImage(getMeteorImage(shower.name))}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10 pointer-events-none" />
                  <img 
                    src={getMeteorImage(shower.name)} 
                    alt={shower.name}
                    className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-700 opacity-70"
                  />
                  <div className="absolute top-3 right-3 z-20">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase border ${status.class} bg-slate-950/60 backdrop-blur-sm`}>
                      {status.label}
                    </span>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-4 z-20 -mt-8 relative">
                  <div>
                    <h4 className="text-lg font-bold text-slate-100 flex items-center gap-1.5 mb-1">
                      {shower.name}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono tracking-wide">
                      {shower.activityRange}
                    </span>
                  </div>

                  {/* ZHR Gauge & Velocity Strip */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 font-mono shadow-inner backdrop-blur-sm">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 block mb-0.5">Peak Rate (ZHR)</span>
                      <span className="text-lg font-bold text-rose-400">
                        {shower.zhr} <span className="text-[9px] font-normal text-slate-400">meteors/hr</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 block mb-0.5">Velocity</span>
                      <span className="text-lg font-bold text-cyan-300">
                        {shower.velocityKms} <span className="text-[9px] font-normal text-slate-400">km/s</span>
                      </span>
                    </div>
                  </div>

                  {/* Details matrix */}
                  <div className="space-y-2 text-xs text-slate-300 bg-slate-900/40 rounded-xl p-3 border border-slate-800/40">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-slate-500">Radiant:</span>
                      <span className="text-slate-200 font-semibold">{shower.radiantConstellation}</span>
                    </div>

                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-slate-500">Parent Body:</span>
                      <span className="text-amber-300 font-semibold">{shower.parentBody}</span>
                    </div>

                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-slate-500">Moon at Peak:</span>
                      <span className={`px-2 py-0.5 rounded-md border font-semibold ${moonInterf}`}>
                        {shower.moonIlluminationAtPeak}% ({shower.moonInterferenceRating})
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {shower.description}
                  </p>
                </div>

                <div className="px-5 pb-5 mt-auto">
                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock size={13} className="text-rose-400" />
                      <span>Prime:</span>
                    </div>
                    <span className="text-rose-300 font-bold text-[11px] bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                      {shower.viewingWindow}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Image Modal / Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-rose-400 bg-slate-900/50 hover:bg-slate-800 p-2 rounded-full transition-colors z-[110]"
            onClick={() => setSelectedImage(null)}
          >
            <X size={24} />
          </button>
          
          <img 
            src={selectedImage} 
            alt="Meteor Shower Full View" 
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
          />
        </div>
      )}
    </div>
  );
};
