import React, { useEffect, useState } from 'react';
import { ChevronLeft, Calendar as CalendarIcon, Moon, Sun, Wind, CloudRain, ShieldAlert, Sparkles, MapPin, Droplets, Activity, Stars } from 'lucide-react';
import { motion } from 'motion/react';
import { getMoonPhaseValue, getMoonPhaseName, isEclipseSeason, getMajorMeteorShower } from '../../utils/astronomyMath';

interface CalendarDateReportProps {
  date: Date;
  onBack: () => void;
}

export const CalendarDateReport: React.FC<CalendarDateReportProps> = ({ date, onBack }) => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const phaseValue = getMoonPhaseValue(date);
  const phaseName = getMoonPhaseName(phaseValue);
  const eclipse = isEclipseSeason(date);
  const meteorShower = getMajorMeteorShower(date);

  const isToday = new Date().toDateString() === date.toDateString();
  const diffDays = Math.round((date.getTime() - new Date().getTime()) / 86400000);
  
  // Weather data logic (stubbed for now - we would use OpenMeteo API)
  // Since we are mocking the UI for now based on the plan
  useEffect(() => {
    if (Math.abs(diffDays) <= 14) {
      setIsLoading(true);
      // Simulate API fetch
      setTimeout(() => {
        setWeatherData({
          tempMax: 28 + Math.floor(Math.random() * 10),
          tempMin: 15 + Math.floor(Math.random() * 8),
          condition: Math.random() > 0.5 ? 'Clear' : 'Rain',
          windSpeed: 10 + Math.floor(Math.random() * 20),
          uvIndex: 4 + Math.floor(Math.random() * 5),
          humidity: 40 + Math.floor(Math.random() * 40),
          aqi: 20 + Math.floor(Math.random() * 50),
        });
        setIsLoading(false);
      }, 500);
    }
  }, [date, diffDays]);

  const getVisibleConstellations = (month: number) => {
    const seasons = [
      ['Orion', 'Taurus', 'Canis Major', 'Gemini'],
      ['Leo', 'Ursa Major', 'Boötes', 'Virgo'],
      ['Scorpius', 'Sagittarius', 'Lyra', 'Cygnus'],
      ['Pegasus', 'Andromeda', 'Cassiopeia', 'Aquarius']
    ];
    if (month >= 0 && month <= 2) return seasons[0];
    if (month >= 3 && month <= 5) return seasons[1];
    if (month >= 6 && month <= 8) return seasons[2];
    return seasons[3];
  };
  const visibleConstellations = getVisibleConstellations(date.getMonth());

  const getEclipseDetails = () => {
    if (phaseValue < 0.03 || phaseValue > 0.97) return { type: 'Solar Eclipse', time: '14:23 UTC', region: 'Visible from Americas & Pacific' };
    if (phaseValue > 0.47 && phaseValue < 0.53) return { type: 'Lunar Eclipse', time: '03:10 UTC', region: 'Visible from Europe, Africa & Asia' };
    return { type: 'Eclipse Window', time: 'Ongoing', region: 'Global Alignment' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full bg-slate-950 text-slate-100 p-4 sm:p-8 overflow-y-auto w-full"
    >
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer z-10"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="text-cyan-400" size={32} />
            {date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Planetary Snapshot</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {/* Astronomical Data */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Moon className="text-slate-300" />
            Lunar & Solar Ephemeris
          </h2>
          
          <div className="space-y-6">
            <div>
              <div className="text-sm text-slate-400 mb-1">Moon Phase</div>
              <div className="text-2xl font-semibold text-white">{phaseName}</div>
              <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                <div 
                  className="bg-slate-300 h-2 rounded-full" 
                  style={{ width: `${Math.abs(phaseValue - 0.5) * 2 * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 relative overflow-hidden">
                <Sun className="text-yellow-400 mb-2" size={20} />
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-xs text-slate-400">Sunrise</div>
                    <div className="font-medium text-slate-200">06:14 AM</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Sunset</div>
                    <div className="font-medium text-slate-200">18:42 PM</div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 relative overflow-hidden">
                <Moon className="text-slate-300 mb-2" size={20} />
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-xs text-slate-400">Moonrise</div>
                    <div className="font-medium text-slate-200">19:20 PM</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Moonset</div>
                    <div className="font-medium text-slate-200">05:45 AM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Special Events */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="text-cyan-400" />
            Deep Space Events
          </h2>
          
          <div className="space-y-4">
            {eclipse ? (
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl">
                <div className="font-bold text-purple-400 mb-2 flex items-center gap-2">
                  <ShieldAlert size={16} />
                  {getEclipseDetails().type}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-300 mb-2">
                  <div><span className="text-slate-500">Peak Time:</span> <br/>{getEclipseDetails().time}</div>
                  <div><span className="text-slate-500">Visibility:</span> <br/>{getEclipseDetails().region}</div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-950/50 border border-white/5 rounded-2xl text-slate-400 text-sm">
                No eclipses near this date.
              </div>
            )}

            {meteorShower ? (
              <div className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-2xl">
                <div className="font-bold text-teal-400 mb-2">{meteorShower} Meteor Shower</div>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-300 mb-2">
                  <div><span className="text-slate-500">Activity:</span> <br/>Peak (100+ ZHR)</div>
                  <div><span className="text-slate-500">Radiant:</span> <br/>Visible after 11:00 PM</div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-950/50 border border-white/5 rounded-2xl text-slate-400 text-sm">
                No major meteor showers.
              </div>
            )}

            <div className="p-4 bg-slate-950/50 border border-white/5 rounded-2xl">
              <div className="font-bold text-slate-200 mb-2 flex items-center gap-2">
                <Stars size={16} className="text-blue-400" />
                Visible Constellations
              </div>
              <p className="text-sm text-slate-400 mb-2">Best viewing after sunset in your hemisphere.</p>
              <div className="flex flex-wrap gap-2">
                {visibleConstellations.map(c => (
                  <span key={c} className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Atmospheric Core (Weather) */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <CloudRain className="text-blue-400" />
            Atmospheric Core
          </h2>
          
          {Math.abs(diffDays) > 14 ? (
            <div className="text-center py-8">
              <Wind className="mx-auto text-slate-600 mb-3" size={32} />
              <p className="text-slate-400 text-sm">
                Precise meteorological data is only available within 14 days of the current date.
              </p>
            </div>
          ) : isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-slate-800 rounded-2xl"></div>
              <div className="h-20 bg-slate-800 rounded-2xl"></div>
            </div>
          ) : weatherData ? (
            <div className="space-y-4">
              <div className="flex items-end gap-3 mb-2">
                <div className="text-4xl font-bold text-white">{weatherData.tempMax}°</div>
                <div className="text-xl text-slate-400 mb-1">/ {weatherData.tempMin}°</div>
              </div>
              <div className="text-lg text-blue-300 mb-4">{weatherData.condition}</div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                  <Wind className="text-slate-400" size={18} />
                  <div>
                    <div className="text-xs text-slate-400">Wind</div>
                    <div className="font-medium text-slate-200">{weatherData.windSpeed} km/h</div>
                  </div>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                  <Sun className="text-yellow-500" size={18} />
                  <div>
                    <div className="text-xs text-slate-400">UV Index</div>
                    <div className="font-medium text-slate-200">{weatherData.uvIndex} (High)</div>
                  </div>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                  <Droplets className="text-blue-400" size={18} />
                  <div>
                    <div className="text-xs text-slate-400">Humidity</div>
                    <div className="font-medium text-slate-200">{weatherData.humidity}%</div>
                  </div>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                  <Activity className="text-green-400" size={18} />
                  <div>
                    <div className="text-xs text-slate-400">AQI</div>
                    <div className="font-medium text-slate-200">{weatherData.aqi} (Good)</div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
};
