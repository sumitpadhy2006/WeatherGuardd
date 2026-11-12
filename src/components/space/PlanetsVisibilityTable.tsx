import React, { useState, useEffect } from 'react';
import {
  Globe,
  Eye,
  Compass,
  ArrowUpRight,
  Info,
  Layers,
  MapPin,
  ChevronRight,
  Calendar,
  Sparkles
} from 'lucide-react';
import { PlanetData, PlanetStatus } from '../../types/astronomy';

interface PlanetsVisibilityTableProps {
  planets: PlanetData[];
  weather?: any;
  onLocatePlanet?: (planetId: string) => void;
}

export const PlanetsVisibilityTable: React.FC<PlanetsVisibilityTableProps> = ({ planets, weather, onLocatePlanet }) => {
  // Try to default to the first visible planet, or just the first planet
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);

  useEffect(() => {
    if (planets.length > 0 && !selectedPlanet) {
      const visible = planets.find(p => p.status === 'visible_now');
      setSelectedPlanet(visible || planets[0]);
    }
  }, [planets, selectedPlanet]);

  const getStatusText = (status: PlanetStatus) => {
    switch (status) {
      case 'visible_now': return { text: 'Visible Now', color: 'text-emerald-400', icon: '🟢', border: 'border-emerald-500/50', bg: 'bg-emerald-500/10' };
      case 'rises_tonight': return { text: 'Rises Tonight', color: 'text-cyan-400', icon: '🟢', border: 'border-cyan-500/50', bg: 'bg-cyan-500/10' };
      case 'daytime': return { text: 'Daytime Sky', color: 'text-amber-400', icon: '🟡', border: 'border-amber-500/40', bg: 'bg-amber-500/10' };
      case 'near_sun': return { text: 'Solar Glare', color: 'text-orange-400', icon: '🟡', border: 'border-orange-500/40', bg: 'bg-orange-500/10' };
      case 'below_horizon': return { text: 'Not Visible', color: 'text-slate-500', icon: '⚪', border: 'border-slate-700', bg: 'bg-slate-800' };
      default: return { text: 'Unknown', color: 'text-slate-500', icon: '⚪', border: 'border-slate-700', bg: 'bg-slate-800' };
    }
  };

  const getHumanReadablePosition = (planet: PlanetData) => {
    if (planet.altitudeDeg < 0) return `Currently below the horizon.`;
    
    let height = '';
    if (planet.altitudeDeg < 20) height = 'low on the horizon';
    else if (planet.altitudeDeg < 50) height = 'about halfway up the sky';
    else if (planet.altitudeDeg < 75) height = 'high in the sky';
    else height = 'nearly straight overhead';

    return `Look toward the ${planet.azimuthDirection.toLowerCase()}, ${height}.`;
  };

  const getWeatherVisibilityTip = (planet: PlanetData) => {
    if (!weather) return null;
    if (planet.altitudeDeg < 0) return null; // Doesn't matter if it's below horizon
    
    const cc = weather.clouds_hi + weather.clouds_mid + weather.clouds_low;
    if (cc > 150) return 'Cloud cover will likely block the view.';
    if (cc > 50) return 'Partially cloudy. You may catch glimpses through breaks.';
    return 'Excellent conditions for viewing tonight with clear skies!';
  };

  const getBrightnessDescription = (mag: number) => {
    if (mag < -1.5) return 'Exceptionally Bright (Very easy to spot)';
    if (mag < 0) return 'Very Bright (Easy to spot)';
    if (mag < 2) return 'Bright (Visible to naked eye)';
    if (mag < 4) return 'Moderate (Visible in dark skies)';
    if (mag < 6) return 'Faint (Requires dark skies or binoculars)';
    return 'Very Faint (Telescope required)';
  };

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-4" id="planets-visibility-module">
      
      {/* Compact Planet Strip Navigation */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-3 shadow-xl backdrop-blur-md">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 px-2 flex items-center gap-2">
          <Globe size={12} />
          Tonight's Planets
        </h3>
        
        <div className="flex overflow-x-auto gap-2 pb-2 snap-x hide-scrollbar">
          {planets.map((planet) => {
            const isSelected = selectedPlanet?.id === planet.id;
            const sInfo = getStatusText(planet.status);
            
            return (
              <button
                key={planet.id}
                onClick={() => {
                  setSelectedPlanet(planet);
                  setShowAdvanced(false);
                }}
                className={`snap-start shrink-0 flex items-center gap-3 p-2 pr-4 rounded-2xl transition-all border ${
                  isSelected 
                    ? `border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]` 
                    : `border-slate-800/50 hover:bg-slate-800/50 hover:border-slate-700`
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center p-1.5 shadow-inner border border-slate-800/60 shrink-0">
                  <img 
                    src={`/assets/planets/${planet.name.toLowerCase()}.png`} 
                    alt={planet.name} 
                    className="w-full h-full object-contain drop-shadow-[0_0_4px_rgba(255,255,255,0.2)]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/planets/earth.png'; // Fallback
                    }}
                  />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-200 leading-none mb-1">{planet.name}</div>
                  <div className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                    {sInfo.icon} {sInfo.text}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Detail View for Selected Planet */}
      {selectedPlanet && (
        <div className="bg-gradient-to-b from-slate-900 to-black border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl relative">
          
          {/* Subtle starry background for the hero area */}
          <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen" style={{ backgroundImage: 'radial-gradient(1px 1px at 10% 20%, white, transparent), radial-gradient(1px 1px at 40% 70%, white, transparent), radial-gradient(2px 2px at 80% 30%, white, transparent)' }}></div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] min-h-[400px]">
            
            {/* Left/Top: The Planet Visual */}
            <div className="relative flex items-center justify-center p-12 overflow-hidden border-b md:border-b-0 md:border-r border-slate-800/50 min-h-[300px]">
              {/* Giant atmospheric glow behind planet */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full blur-[80px] opacity-20 pointer-events-none"
                style={{ backgroundColor: selectedPlanet.colorHex || '#ffffff' }}
              />
              
              <img 
                src={`/assets/planets/${selectedPlanet.name.toLowerCase()}.png`} 
                alt={selectedPlanet.name} 
                className="w-full max-w-[280px] max-h-[280px] object-contain relative z-10 drop-shadow-[0_0_30px_rgba(255,255,255,0.05)] animate-[float_10s_ease-in-out_infinite]"
                style={{
                  animation: 'float 20s ease-in-out infinite alternate',
                }}
              />
            </div>

            {/* Right/Bottom: The Information Panel */}
            <div className="flex flex-col p-6 sm:p-8 z-10 bg-black/40 backdrop-blur-sm">
              <div className="mb-auto">
                
                {/* Header & Status */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight mb-2">{selectedPlanet.name}</h2>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${getStatusText(selectedPlanet.status).border} ${getStatusText(selectedPlanet.status).bg}`}>
                      <span className="text-xs">{getStatusText(selectedPlanet.status).icon}</span>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${getStatusText(selectedPlanet.status).color}`}>
                        {getStatusText(selectedPlanet.status).text}
                      </span>
                    </div>
                  </div>
                  
                  {onLocatePlanet && selectedPlanet.altitudeDeg >= 0 && (
                    <button 
                      onClick={() => onLocatePlanet(selectedPlanet.id)}
                      className="shrink-0 bg-indigo-600/90 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/40 border border-indigo-500/50"
                    >
                      <Eye size={14} />
                      Locate in Sky
                    </button>
                  )}
                </div>

                {/* Human-readable Position / Summary */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 mb-6">
                  <div className="flex gap-3 text-sm text-slate-200 leading-relaxed mb-3">
                    <MapPin size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                    <p>{getHumanReadablePosition(selectedPlanet)}</p>
                  </div>
                  
                  {getWeatherVisibilityTip(selectedPlanet) && (
                    <div className="flex gap-3 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                      <Sparkles size={18} className="text-amber-400 shrink-0 mt-0.5" />
                      <p>{getWeatherVisibilityTip(selectedPlanet)}</p>
                    </div>
                  )}
                </div>

                {/* Constellation Connection */}
                <div className="flex items-center gap-3 mb-6 p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 shrink-0">
                    <Compass size={18} className="text-slate-400" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Currently located in</span>
                    <span className="text-sm font-bold text-slate-200">{selectedPlanet.constellation}</span>
                  </div>
                </div>

                <p className="text-sm text-slate-400 leading-relaxed mb-8">
                  {selectedPlanet.description}
                </p>

              </div>

              {/* Bottom Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-3">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Rises</span>
                  <span className="text-sm font-mono font-bold text-slate-200">{selectedPlanet.riseTime}</span>
                </div>
                <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-3">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Sets</span>
                  <span className="text-sm font-mono font-bold text-slate-200">{selectedPlanet.setTime}</span>
                </div>
              </div>

              {/* Expandable Advanced Info */}
              <div className="mt-4 border-t border-slate-800/60 pt-4">
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-widest py-2"
                >
                  Scientific Details
                  <ChevronRight size={14} className={`transition-transform duration-300 ${showAdvanced ? 'rotate-90' : ''}`} />
                </button>
                
                {showAdvanced && (
                  <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div>
                      <span className="text-[9px] uppercase text-slate-500 block">Altitude</span>
                      <span className="text-xs font-mono text-slate-300">{selectedPlanet.altitudeDeg > 0 ? '+' : ''}{selectedPlanet.altitudeDeg}°</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-slate-500 block">Azimuth</span>
                      <span className="text-xs font-mono text-slate-300">{selectedPlanet.azimuthDeg}° {selectedPlanet.azimuthDirection}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-slate-500 block">Apparent Mag</span>
                      <span className="text-xs font-mono text-slate-300">{selectedPlanet.magnitude}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-slate-500 block">Brightness</span>
                      <span className="text-[10px] font-sans text-slate-300 leading-tight block">{getBrightnessDescription(selectedPlanet.magnitude)}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[9px] uppercase text-slate-500 block">Recommended Optics</span>
                      <span className="text-xs font-sans text-slate-300">{selectedPlanet.visibilityRecommendation}</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};
