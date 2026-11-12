import React from 'react';
import {
  Sun,
  Moon,
  Calendar,
  Compass,
  MapPin,
  Sparkles,
  Info,
  Clock,
  X,
} from 'lucide-react';
import { EclipseItem } from '../../types/astronomy';

interface EclipsesTrackerProps {
  eclipses: EclipseItem[];
}

export const EclipsesTracker: React.FC<EclipsesTrackerProps> = ({ eclipses }) => {
  const formatEclipseType = (type: EclipseItem['type']) => {
    switch (type) {
      case 'solar_total':
        return { label: 'Total Solar Eclipse', color: 'text-amber-400 bg-amber-500/20 border-amber-500/40' };
      case 'solar_annular':
        return { label: 'Annular Solar Eclipse', color: 'text-amber-300 bg-amber-500/20 border-amber-500/40' };
      case 'lunar_total':
        return { label: 'Total Lunar Eclipse (Blood Moon)', color: 'text-rose-400 bg-rose-500/20 border-rose-500/40' };
      case 'lunar_partial':
        return { label: 'Partial Lunar Eclipse', color: 'text-purple-400 bg-purple-500/20 border-purple-500/40' };
      default:
        return { label: 'Penumbral Eclipse', color: 'text-slate-300 bg-slate-800 border-slate-700' };
    }
  };

  const getEclipseImage = (eclipse: EclipseItem) => {
    const title = eclipse.title.toLowerCase();
    if (title.includes('2026') && title.includes('solar')) return '/assets/eclipses/media_1788465529773.jpg';
    if (title.includes('2027') && title.includes('solar')) return '/assets/eclipses/media_1788465529791.jpg';
    if (title.includes('2026') && title.includes('lunar')) return '/assets/eclipses/media_1788465529776.jpg';
    if (title.includes('2028') && title.includes('lunar')) return '/assets/eclipses/media_1788465529787.jpg';

    // Fallbacks
    if (eclipse.type.includes('solar')) return '/assets/eclipses/media_1788465529773.jpg';
    return '/assets/eclipses/media_1788465529776.jpg';
  };

  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  return (
    <div className="space-y-6" id="eclipses-tracker-module">
      <div className="bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shadow-lg shadow-amber-500/10">
              <Sun size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Solar & Lunar Eclipses Tracker
              </h3>
              <p className="text-xs text-slate-400">
                Global syzygy alignment calendar, totality tracks & localized observer visibility
              </p>
            </div>
          </div>
        </div>

        {/* Eclipses List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {eclipses.map((eclipse) => {
            const badge = formatEclipseType(eclipse.type);
            const isSolar = eclipse.type.startsWith('solar');

            return (
              <div
                key={eclipse.id}
                className="bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-xl group relative"
              >
                {/* Image Header */}
                <div
                  className="h-40 w-full relative overflow-hidden bg-slate-900 shrink-0 cursor-pointer"
                  onClick={() => setSelectedImage(getEclipseImage(eclipse))}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10 pointer-events-none" />
                  <img
                    src={getEclipseImage(eclipse)}
                    alt={eclipse.title}
                    className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-700 opacity-80"
                  />
                  <div className="absolute top-3 right-3 z-20">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase border ${badge.color} bg-slate-950/70 backdrop-blur-sm shadow-md`}>
                      {badge.label}
                    </span>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-4 z-20 -mt-6 relative mb-auto">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="text-xl font-bold text-slate-100 leading-tight">
                      {eclipse.title}
                    </h4>
                    <span className="shrink-0 text-xs font-mono font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded-lg">
                      {eclipse.nextOccurrenceIn}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5 mt-1 bg-slate-900 w-fit px-2.5 py-1 rounded-md border border-slate-800">
                    <Calendar size={13} className={isSolar ? 'text-amber-400' : 'text-rose-400'} />
                    {eclipse.date} <span className="text-slate-600 mx-1">|</span> {eclipse.duration}
                  </span>

                  {/* Local Visibility Status Callout */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5 backdrop-blur-sm shadow-inner mt-4">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                        <MapPin size={13} className="text-cyan-400" />
                        Observer Visibility
                      </span>
                      <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {eclipse.localVisibility} ({eclipse.localCoveragePercent}%)
                      </span>
                    </div>

                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full ${isSolar ? 'bg-amber-400' : 'bg-rose-400'} transition-all duration-1000`}
                        style={{ width: `${eclipse.localCoveragePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Path summary */}
                  <div className="text-xs space-y-1 mt-4">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block tracking-wider">
                      Geographic Path
                    </span>
                    <p className="text-slate-300 font-mono text-[11px] leading-relaxed bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40">
                      {eclipse.visibilitySummary}
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed pt-2">
                    {eclipse.description}
                  </p>
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
            alt="Eclipse Full View"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
