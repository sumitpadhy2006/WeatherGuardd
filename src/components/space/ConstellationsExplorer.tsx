import React, { useState } from 'react';
import {
  Sparkles,
  Compass,
  Layers,
  Filter,
  Eye,
  Star,
  BookOpen,
} from 'lucide-react';
import { ConstellationItem } from '../../types/astronomy';

interface ConstellationsExplorerProps {
  constellations: ConstellationItem[];
}

export const ConstellationsExplorer: React.FC<ConstellationsExplorerProps> = ({ constellations }) => {
  const [selectedSeason, setSelectedSeason] = useState<string>('All');
  const [activeConstellation, setActiveConstellation] = useState<ConstellationItem | null>(null);

  // Generate a consistent array of faint background stars for the charts
  const bgStars = React.useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: Math.random() * 0.4 + 0.1,
      opacity: Math.random() * 0.4 + 0.1,
    }));
  }, []);

  const getStarColor = (name?: string, mag?: number) => {
    if (!name) {
      // Procedurally assign a subtle color to unnamed stars based on magnitude
      if (mag && mag < 2.0) return '#e0f2fe'; // slight blue
      if (mag && mag > 4.0) return '#ffedd5'; // slight orange
      return '#ffffff';
    }
    
    const n = name.toLowerCase();
    if (n.includes('betelgeuse') || n.includes('aldebaran') || n.includes('antares')) return '#fca5a5'; // reddish
    if (n.includes('rigel') || n.includes('sirius') || n.includes('vega')) return '#bae6fd'; // blue-white
    if (n.includes('capella') || n.includes('pollux') || n.includes('arcturus')) return '#fde047'; // yellow-orange
    return '#ffffff';
  };

  const filtered = constellations.filter((c) => {
    if (selectedSeason === 'All') return true;
    return c.season.toLowerCase() === selectedSeason.toLowerCase();
  });

  const seasons = ['All', 'Winter', 'Summer', 'Autumn', 'Circumpolar'];

  return (
    <div className="space-y-6" id="constellations-explorer-module">
      <div className="bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl">
        {/* Header & Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shadow-lg shadow-indigo-500/10">
              <Star size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Constellations Catalog & Lore
              </h3>
              <p className="text-xs text-slate-400">
                Interactive seasonal asterisms, alpha star coordinates & deep-sky object locations
              </p>
            </div>
          </div>

          {/* Season Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {seasons.map((season) => (
              <button
                key={season}
                onClick={() => setSelectedSeason(season)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedSeason === season
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {season}
              </button>
            ))}
          </div>
        </div>

        {/* Constellations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => {
            const isActive = activeConstellation?.id === c.id;
            
            return (
            <div
              key={c.id}
              onClick={() => setActiveConstellation(isActive ? null : c)}
              className={`bg-slate-950/60 border hover:border-indigo-500/50 rounded-[2rem] p-5 transition-all duration-300 hover:bg-slate-900/60 flex flex-col justify-between group cursor-pointer shadow-xl backdrop-blur-sm relative overflow-hidden ${
                isActive ? 'border-indigo-500/60 shadow-[0_0_30px_rgba(99,102,241,0.1)] ring-1 ring-indigo-500/20' : 'border-slate-800/80'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                      {c.name}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {c.latinName}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold">
                    {c.season}
                  </span>
                </div>

                {/* Interactive Asterism Preview (SVG) */}
                <div className={`h-48 w-full rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-500 ${isActive ? 'bg-[#030b1c] border-indigo-500/40 shadow-inner' : 'bg-[#050B14] border-slate-800'} border`}>
                  
                  {/* Subtle glowing center gradient for deep space feel */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />

                  <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 group-hover:scale-105 transition-transform duration-700">
                    <defs>
                      <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Faint Background Stars */}
                    {bgStars.map((bs, idx) => (
                      <circle key={`bg-${idx}`} cx={bs.x} cy={bs.y} r={bs.r} fill="#fff" opacity={bs.opacity} />
                    ))}

                    {/* Connecting constellation lines */}
                    {c.lines.map(([idx1, idx2], lIdx) => {
                      const p1 = c.starPoints[idx1];
                      const p2 = c.starPoints[idx2];
                      if (!p1 || !p2) return null;
                      return (
                        <line
                          key={lIdx}
                          x1={p1.x}
                          y1={p1.y}
                          x2={p2.x}
                          y2={p2.y}
                          stroke={isActive ? "#818CF8" : "#4F46E5"}
                          strokeWidth={isActive ? "0.6" : "0.4"}
                          opacity={isActive ? "0.7" : "0.4"}
                          className="transition-all duration-500"
                        />
                      );
                    })}

                    {/* Star points */}
                    {c.starPoints.map((star, sIdx) => {
                      // Magnitude scale: lower is brighter. Sirius is -1.46, faint stars are 5-6.
                      const baseSize = Math.max(0.4, (6 - star.mag) * 0.45); 
                      const starColor = getStarColor(star.name, star.mag);
                      const isMajor = star.mag < 2.5;

                      return (
                        <g key={sIdx} transform={`translate(${star.x}, ${star.y})`}>
                          {/* Outer glow for major stars */}
                          {isMajor && (
                            <circle r={baseSize * 3} fill={starColor} opacity={isActive ? "0.2" : "0.1"} className="transition-all duration-500" />
                          )}
                          {/* Core star body */}
                          <circle r={baseSize} fill={starColor} />
                          
                          {/* Labels for prominent stars */}
                          {star.name && isMajor && (
                            <text
                              x="3.5"
                              y="1.5"
                              fill="#94A3B8"
                              fontSize="3.5"
                              fontFamily="sans-serif"
                              fontWeight="500"
                              className={`transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'}`}
                            >
                              {star.name}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Alpha Star & Viewing Window */}
                <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-3 space-y-1.5 font-mono text-[11px] shadow-inner">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500 tracking-wide uppercase text-[10px]">Alpha Star</span>
                    <span className="font-bold text-amber-200/90">{c.brightStar}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500 tracking-wide uppercase text-[10px]">Prime Viewing</span>
                    <span className="text-cyan-300/90 font-bold">{c.bestViewingTime}</span>
                  </div>
                </div>

                <p className="text-[13px] text-slate-400 line-clamp-3 leading-relaxed mt-2">
                  {c.mythology}
                </p>
              </div>

              {/* Deep Sky Objects Tags */}
              <div className="mt-4 pt-4 border-t border-slate-800/60 relative z-10">
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block mb-2">
                  Deep-Sky Objects (DSO)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {c.deepSkyObjects.map((dso, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-indigo-500/5 border border-indigo-500/20 text-indigo-300/80 text-[10px] font-mono hover:bg-indigo-500/10 hover:text-indigo-300 transition-colors"
                    >
                      {dso.split('(')[0].trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
