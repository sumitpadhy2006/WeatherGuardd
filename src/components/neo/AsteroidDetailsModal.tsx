import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  Compass,
  Maximize2,
  Zap,
  Layers,
  Calendar,
  Clock,
  Sparkles,
  Flame,
  Globe,
  Radio,
  Share2,
} from 'lucide-react';
import { NearEarthObject } from '../../types/neo';

interface AsteroidDetailsModalProps {
  asteroid: NearEarthObject | null;
  onClose: () => void;
}

export const AsteroidDetailsModal: React.FC<AsteroidDetailsModalProps> = ({
  asteroid,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orbit' | 'encounters' | 'hazard'>('overview');

  if (!asteroid) return null;

  const diamMax = Math.round(asteroid.estimated_diameter.meters.estimated_diameter_max);
  const diamMin = Math.round(asteroid.estimated_diameter.meters.estimated_diameter_min);
  const orbit = asteroid.orbital_data;
  const hazard = asteroid.hazardScore;
  const landmark = hazard.comparisonLandmark;
  const sentry = asteroid.sentry_data;

  // Comparison landmarks list
  const LANDMARKS = [
    { name: 'Human', height: 1.8, icon: '🧍' },
    { name: 'Boeing 737', height: 35, icon: '✈️' },
    { name: 'Statue of Liberty', height: 93, icon: '🗽' },
    { name: 'Eiffel Tower', height: 300, icon: '🗼' },
    { name: 'Burj Khalifa', height: 828, icon: '🏙️' },
    { name: 'Mount Everest', height: 8848, icon: '🏔️' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto md:pl-[296px]">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden text-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-lg shrink-0">
              ☄️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white tracking-tight">
                  {asteroid.name}
                </h2>
                {asteroid.is_potentially_hazardous_asteroid && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <AlertTriangle size={11} /> Potentially Hazardous Asteroid
                  </span>
                )}
                {asteroid.is_sentry_object && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                    <ShieldAlert size={11} /> Sentry Risk Object
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Designation: {asteroid.designation} • SPK-ID: {asteroid.id} • Mag (H): {asteroid.absolute_magnitude_h.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={asteroid.nasa_jpl_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-mono text-cyan-400 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <span>NASA JPL SBDB</span>
              <ExternalLink size={12} />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* AT A GLANCE: User Quick Answers */}
        <div className="bg-slate-950/80 border-b border-slate-800 p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Zap size={14} className="text-amber-400" />
            Asteroid At A Glance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Will it hit Earth?</span>
              <span className={`text-sm font-bold font-mono ${sentry ? 'text-red-400' : 'text-emerald-400'}`}>
                {sentry ? `${sentry.impact_probability}% Risk` : '0.00% (No)'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">How Close?</span>
              <span className="text-sm font-bold font-mono text-cyan-400 block">
                {hazard.closestMissDistanceLd} LD
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {Math.round(hazard.closestMissDistanceKm).toLocaleString()} km
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">When?</span>
              <span className="text-sm font-bold font-mono text-white block">
                {asteroid.close_approach_data[0]?.close_approach_date_full || asteroid.close_approach_data[0]?.close_approach_date}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">UTC</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">How Fast?</span>
              <span className="text-sm font-bold font-mono text-amber-400 block">
                {hazard.velocityKms} km/s
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {Math.round(hazard.velocityKms * 3600).toLocaleString()} km/h
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">How Big?</span>
              <span className="text-sm font-bold font-mono text-blue-400 block">
                ~{diamMax} meters
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {landmark.name} size
              </span>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-800 bg-slate-950/40 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Physical & Summary
          </button>
          <button
            onClick={() => setActiveTab('orbit')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
              activeTab === 'orbit'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Orbital Mechanics
          </button>
          <button
            onClick={() => setActiveTab('encounters')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
              activeTab === 'encounters'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Future Encounters ({asteroid.futureEncounters?.length || asteroid.close_approach_data.length})
          </button>
          <button
            onClick={() => setActiveTab('hazard')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
              activeTab === 'hazard'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hazard & Impact Analysis
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: Physical & Summary */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Est. Diameter</span>
                  <div className="text-base font-bold text-white font-mono mt-1">
                    {diamMin} – {diamMax} m
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({(diamMin * 3.28084).toFixed(0)} - {(diamMax * 3.28084).toFixed(0)} ft)
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Relative Velocity</span>
                  <div className="text-base font-bold text-amber-400 font-mono mt-1">
                    {hazard.velocityKms} km/s
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {Math.round(hazard.velocityKms * 3600).toLocaleString()} km/h
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Miss Distance</span>
                  <div className="text-base font-bold text-cyan-400 font-mono mt-1">
                    {hazard.closestMissDistanceLd} LD
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {Math.round(hazard.closestMissDistanceKm).toLocaleString()} km
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Kinetic Energy</span>
                  <div className="text-base font-bold text-purple-400 font-mono mt-1">
                    ~{hazard.kineticEnergyMegatons} Mt
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    TNT equivalent
                  </span>
                </div>
              </div>

              {/* Physical Composition & Spectral Class */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={13} className="text-cyan-400" /> Physical Taxonomy & Composition
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    Spectral Class: <span className="text-cyan-300 font-bold">{asteroid.spectralType || 'S-type (Siliceous)'}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {asteroid.compositionSummary || `${asteroid.name} is classified under the ${orbit?.orbit_class?.orbit_class_type || 'Apollo'} group. Composed primarily of silicate minerals, nickel-iron grain matrix, and pyroxene/olivine compounds.`}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                  <div>Albedo (Reflectivity): <span className="text-slate-200">{asteroid.albedo ?? 0.18}</span></div>
                  <div>Rotational Period: <span className="text-slate-200">{asteroid.rotationPeriodHours ? `${asteroid.rotationPeriodHours} hrs` : 'N/A'}</span></div>
                  <div>Absolute Magnitude (H): <span className="text-slate-200">{asteroid.absolute_magnitude_h}</span></div>
                  <div>Discovery Year: <span className="text-slate-200">{asteroid.discoveryYear || 'Modern Survey'}</span></div>
                </div>
              </div>

              {/* Architectural Landmark Size Comparison Bar */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Maximize2 size={13} className="text-blue-400" /> Landmark Scale Comparison
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    Asteroid Diameter: <span className="text-blue-400 font-bold">{diamMax} meters</span>
                  </span>
                </div>

                <div className="space-y-2">
                  {LANDMARKS.map((lm) => {
                    const ratio = diamMax / lm.height;
                    const percent = Math.min(100, Math.max(4, (diamMax / lm.height) * 50));

                    return (
                      <div key={lm.name} className="flex items-center gap-3 text-xs">
                        <span className="w-36 font-medium text-slate-300 flex items-center gap-1.5 shrink-0">
                          <span>{lm.icon}</span> {lm.name} ({lm.height}m)
                        </span>
                        <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden flex">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-24 text-right font-mono text-[11px] text-slate-400 shrink-0">
                          {ratio >= 1 ? `${ratio.toFixed(1)}x taller` : `${(ratio * 100).toFixed(0)}% of height`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Orbital Mechanics */}
          {activeTab === 'orbit' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Compass size={14} className="text-cyan-400" /> Keplerian Orbital Elements (JPL Horizons)
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                    Orbit Class: {orbit?.orbit_class?.orbit_class_type || 'Apollo'}
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  {orbit?.orbit_class?.orbit_class_description || 'Near-Earth asteroid orbit dynamics computed using multi-revolution radar & optical astrometry.'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 block">Semi-Major Axis (a)</span>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {orbit?.semi_major_axis || '1.12'} AU
                    </div>
                    <span className="text-[9px] text-slate-500">Average orbital radius</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 block">Eccentricity (e)</span>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {orbit?.eccentricity || '0.203'}
                    </div>
                    <span className="text-[9px] text-slate-500">Orbital elongation</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 block">Inclination (i)</span>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {orbit?.inclination || '6.04'}°
                    </div>
                    <span className="text-[9px] text-slate-500">Tilt relative to ecliptic</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 block">Perihelion (q)</span>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {orbit?.perihelion_distance || '0.89'} AU
                    </div>
                    <span className="text-[9px] text-slate-500">Closest point to Sun</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 block">Aphelion (Q)</span>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {orbit?.aphelion_distance || '1.35'} AU
                    </div>
                    <span className="text-[9px] text-slate-500">Farthest point from Sun</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 block">Orbital Period</span>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {orbit?.orbital_period || '436'} days
                    </div>
                    <span className="text-[9px] text-slate-500">
                      (~{(parseFloat(orbit?.orbital_period || '436') / 365.25).toFixed(2)} Earth years)
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Earth Minimum Orbit Intersection Distance (MOID):</span>
                  <span className="text-cyan-400 font-bold">
                    {orbit?.minimum_orbit_intersection || '0.003'} AU (~{hazard.moidLunarDistances} Lunar Distances)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Future Encounters Ephemeris Table */}
          {activeTab === 'encounters' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-cyan-400" />
                  Calculated Ephemeris Close Encounters Schedule
                </span>
                <span className="font-mono text-[11px]">Orbiting Body: Earth / Moon / Mars</span>
              </div>

              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Date (UTC)</th>
                      <th className="p-3">Miss Distance (LD)</th>
                      <th className="p-3">Miss Distance (km)</th>
                      <th className="p-3">Velocity (km/s)</th>
                      <th className="p-3">Orbiting Body / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {(asteroid.futureEncounters || asteroid.close_approach_data).map((enc, i) => {
                      const ld = parseFloat(enc.miss_distance.lunar);
                      const isSubLunar = ld < 1.0;

                      return (
                        <tr key={i} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-3 text-white font-bold">
                            {enc.close_approach_date_full || enc.close_approach_date}
                          </td>
                          <td className={`p-3 font-bold ${isSubLunar ? 'text-amber-400' : 'text-cyan-400'}`}>
                            {ld.toFixed(3)} LD {isSubLunar && '⚠️'}
                          </td>
                          <td className="p-3 text-slate-300">
                            {Math.round(parseFloat(enc.miss_distance.kilometers)).toLocaleString()} km
                          </td>
                          <td className="p-3 text-slate-300">
                            {parseFloat(enc.relative_velocity.kilometers_per_second).toFixed(2)} km/s
                          </td>
                          <td className="p-3 text-slate-400 font-sans">
                            {enc.orbiting_body || 'Earth'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Hazard & Impact Analysis */}
          {activeTab === 'hazard' && (
            <div className="space-y-4">
              {/* Torino & Palermo Score Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-slate-400">Torino Impact Scale</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Level {hazard.torinoScale} – {hazard.torinoRating}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {hazard.torinoDescription}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-slate-400">Palermo Technical Scale</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700">
                      {hazard.palermoScale} ({hazard.palermoRating})
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Palermo Technical Scale compares risk against background impact hazard flux over equivalent timespan.
                  </p>
                </div>
              </div>

              {/* Kinetic Energy & Physical Cratering Simulator */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Flame size={14} className="text-amber-400" /> Atmospheric Entry & Crater Scaling Physics
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Kinetic Energy Release</span>
                    <div className="text-sm font-bold text-amber-400 mt-0.5">
                      {hazard.kineticEnergyMegatons} Megatons TNT
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Est. Transient Crater Ø</span>
                    <div className="text-sm font-bold text-orange-400 mt-0.5">
                      {hazard.craterDiameterMeters > 0 ? `${hazard.craterDiameterMeters} meters` : 'High Airburst'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Planetary Defense Index</span>
                    <div className="text-sm font-bold text-cyan-400 mt-0.5">
                      {hazard.hazardSeverityIndex} / 100 ({hazard.hazardLevel})
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  <span className="font-semibold text-slate-200">Simulated Blast Consequence: </span>
                  {hazard.tntEquivalentDescription}
                </p>
              </div>

              {/* Sentry Details if available */}
              {sentry && (
                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-purple-300">
                    <ShieldAlert size={14} /> NASA JPL Sentry System Deep Analytics
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-slate-300 pt-1">
                    <div>Impact Prob: <span className="text-amber-400">{sentry.impact_probability_str}</span></div>
                    <div>Years Window: <span className="text-white">{sentry.potential_impact_years_range}</span></div>
                    <div>Potential Impacts: <span className="text-white">{sentry.potential_impacts_count}</span></div>
                    <div>V-Infinity: <span className="text-white">{sentry.v_infinity} km/s</span></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
