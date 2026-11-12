import React, { useEffect, useRef } from 'react';
import { 
  CloudRain, Globe, Rocket, Telescope, 
  Wind, Thermometer, ShieldAlert, Map, 
  Sun, Moon, Star, BellRing, Settings,
  Activity, MapPin, Search, Navigation
} from 'lucide-react';

export const AboutPage: React.FC<{ onNavigateTab?: (tab: string) => void }> = ({ onNavigateTab }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to top on mount
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full overflow-x-hidden bg-slate-950 text-slate-200 pb-32"
    >
      {/* 1. Hero Section */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="relative z-10 space-y-6 max-w-4xl mx-auto mt-20">
          <div className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-semibold tracking-wider mb-4 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            WHAT IS WEATHERGUARD?
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-400 tracking-tight break-words px-2">
            WEATHERGUARD
          </h1>
          <h2 className="text-xl md:text-2xl font-light text-slate-300">
            Weather, Earth & Space Intelligence
          </h2>
          <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed px-4">
            A unified platform for understanding the atmosphere around us, events happening across Earth, and what is happening above us in the sky and space.
          </p>

          {/* Creators Link */}
          <div className="pt-4 flex justify-center">
            <button 
              onClick={() => onNavigateTab && onNavigateTab('creator')}
              className="group relative inline-flex items-center justify-center px-8 py-2.5 bg-transparent overflow-hidden rounded-full transition-all duration-300"
            >
              <div className="absolute inset-0 w-full h-full bg-cyan-500/10 group-hover:bg-cyan-500/20 animate-pulse transition-colors duration-300" style={{ filter: 'blur(8px)' }} />
              <div className="absolute inset-0 w-full h-full rounded-full border border-cyan-500/30 group-hover:border-cyan-400/60 shadow-[0_0_15px_rgba(34,211,238,0.2)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] transition-all duration-300" />
              <span className="relative text-xs sm:text-sm font-semibold text-cyan-300 group-hover:text-cyan-100 transition-colors duration-300 tracking-wide">
                Created By SumitKumar Padhy
              </span>
            </button>
          </div>

          <div className="pt-8">
            <p className="text-xs sm:text-sm font-mono text-cyan-400 tracking-[0.1em] sm:tracking-[0.3em] px-2">
              OBSERVE • UNDERSTAND • PREPARE
            </p>
          </div>
        </div>
      </section>

      {/* 2. What WeatherGuard Brings Together */}
      <section className="px-6 py-20 max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={<CloudRain size={32} className="text-cyan-400" />}
            title="Weather"
            description="Real-time conditions, forecasts, atmospheric measurements, risk and early warnings."
            bgClass="bg-cyan-950/20 border-cyan-500/20"
          />
          <FeatureCard 
            icon={<Globe size={32} className="text-emerald-400" />}
            title="Earth"
            description="Worldwide disasters, emergencies, earthquakes, and environmental observation."
            bgClass="bg-emerald-950/20 border-emerald-500/20"
          />
          <FeatureCard 
            icon={<Rocket size={32} className="text-purple-400" />}
            title="Space"
            description="Solar activity, CME, geomagnetic storms, aurora, satellites and space weather."
            bgClass="bg-purple-950/20 border-purple-500/20"
          />
          <FeatureCard 
            icon={<Telescope size={32} className="text-amber-400" />}
            title="Observation"
            description="Planets, constellations, meteor showers, eclipses, and Solar System observation."
            bgClass="bg-amber-950/20 border-amber-500/20"
          />
        </div>
      </section>

      {/* 3. Weather Intelligence */}
      <section className="px-6 py-20 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <SectionHeader title="Weather Intelligence" subtitle="Home — Your Weather at a Glance" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-slate-300 leading-relaxed text-lg">
                The Home screen is highly dependent on the user's selected location and its actual local date, time, and weather conditions.
              </p>
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                    <Sun className="text-amber-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Mumbai — Daytime + Clear</div>
                    <div className="text-slate-400 text-sm">Bright sky atmosphere</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <CloudRain className="text-blue-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Mumbai — Nighttime + Rain</div>
                    <div className="text-slate-400 text-sm">Dark atmosphere + rain conditions</div>
                  </div>
                </div>
              </div>
              <p className="text-cyan-400 font-medium">
                The interface remains simple while the environment reflects the real weather state.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 rounded-3xl border border-slate-700/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Activity size={20} className="text-cyan-400" /> Atmosphere Core
                </h3>
                <p className="text-slate-400 mb-6">
                  WeatherGuard interprets the atmosphere with detailed information including:
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Temperature', 'Feels Like', 'High / Low', 'Wind Speed', 'Humidity', 'Dew Point', 'Pressure', 'Visibility', 'UV Index', 'AQI', 'Rain'].map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs border border-slate-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-8. Forecasting, Risk, Radar, Explorer */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="space-y-24">
          
          <FeatureRow 
            title="Weather Forecasting"
            subtitle="Know What Is Coming Next"
            description="Hourly forecasts for the next 24 hours including temperature, conditions, rain probability, and wind. Extended daily predictions for the week ahead."
            highlight="Know the weather now. Know what is coming next."
            icon={<Thermometer size={40} className="text-orange-400" />}
            reverse={false}
          />

          <FeatureRow 
            title="Weather Risk & Early Warning"
            subtitle="From Weather Data to Action"
            description="WeatherGuard analyzes current and forecast conditions and converts them into understandable risk levels. View weather from a local perspective up to an interactive radar map."
            highlight="What is happening? How serious is it? What should I be aware of?"
            icon={<ShieldAlert size={40} className="text-red-400" />}
            reverse={true}
          />

          <FeatureRow 
            title="Weather Explorer & Earth Watch"
            subtitle="Explore What Is Happening Across Earth"
            description="Expand your view beyond one city. A worldwide map for observing disasters, emergencies, earthquakes, volcanic activity, wildfires, and major environmental events."
            highlight="WeatherGuard watches both the local atmosphere and important events across our planet."
            icon={<Globe size={40} className="text-emerald-400" />}
            reverse={false}
          />
        </div>
      </section>

      {/* 10-13. Space & Solar Activity */}
      <section className="px-6 py-24 bg-gradient-to-b from-slate-950 via-purple-950/10 to-slate-950">
        <div className="max-w-5xl mx-auto text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white">Look Beyond Earth</h2>
            <p className="text-xl text-purple-300 font-light">Information about activity originating from the Sun and its effects in space.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SpaceCard 
              title="Solar Flares"
              subtitle="Understand Solar Activity"
              flow="Sun → Solar Flare → Radiation → Earth"
            />
            <SpaceCard 
              title="CME"
              subtitle="Follow Solar Plasma"
              flow="Sun → CME → Space → L1 → Earth"
            />
            <SpaceCard 
              title="Geomagnetic Storms"
              subtitle="Earth's Magnetic Response"
              flow="Solar Wind → Magnetosphere → Storm"
            />
          </div>
        </div>
      </section>

      {/* 14-23. Observation & Solar System */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <SectionHeader title="Sky & Space Observation" subtitle="Explore Tonight's Sky" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center md:text-left">
            <h3 className="text-2xl font-bold text-white">What Can You See Tonight?</h3>
            <p className="text-slate-300 text-lg leading-relaxed">
              WeatherGuard determines what is visible from your selected location, combining darkness, weather, and precise astronomical calculations.
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-left">
              <ObsCard title="Planets" desc="Which are visible, and where." />
              <ObsCard title="Constellations" desc="When and where to look." />
              <ObsCard title="Meteor Showers" desc="Peak dates and viewing conditions." />
              <ObsCard title="Moon & Eclipses" desc="Phases, timing, and visibility." />
              <ObsCard title="Aurora" desc="Location-specific viewing probability." />
              <ObsCard title="Satellites" desc="What passes overhead and when." />
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-700 mt-4 shadow-lg">
              <p className="text-cyan-400 font-mono text-center">
                “What can I observe from my location, and when should I look?”
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/80 p-8 md:p-10 rounded-[2rem] border border-indigo-500/30 relative overflow-hidden group shadow-2xl h-full flex flex-col justify-center text-center md:text-left">
            <div className="absolute -top-10 -right-10 p-8 opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-700">
              <Globe size={180} />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="inline-block px-4 py-1.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold tracking-wider rounded-full border border-indigo-500/30 uppercase">
                Advanced Feature
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white">360° Solar System</h3>
              <p className="text-indigo-200 leading-relaxed text-lg">
                Explore the Solar System from a full 360° perspective. WeatherGuard uses actual astronomical calculations and ephemeris data to determine precise planetary positions and movement rather than placing planets at fixed decorative positions.
              </p>
              <ul className="space-y-3 text-slate-300 text-left mx-auto md:mx-0 w-max">
                <li className="flex items-center gap-3"><Star size={16} className="text-indigo-400" /> Rotate and inspect planets</li>
                <li className="flex items-center gap-3"><Star size={16} className="text-indigo-400" /> View orbital positions and movement</li>
                <li className="flex items-center gap-3"><Star size={16} className="text-indigo-400" /> Follow Asteroids & Near-Earth Objects</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 24-30. Calendar, Home & Personalization */}
      <section className="px-6 py-20 bg-slate-900/30 border-y border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 text-center md:text-left">
          <div className="space-y-6 p-6 rounded-3xl bg-slate-900/50 border border-slate-800/50">
            <h3 className="text-2xl font-bold text-white flex items-center justify-center md:justify-start gap-3">
              <CalendarIcon /> 14-Day Calendar
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Your planning center for weather and sky observation. View the previous 7 days and upcoming 7 days. Highlights include upcoming New/Full Moons, Eclipses, and Meteor Showers observable from your location.
            </p>
          </div>
          
          <div className="space-y-6 p-6 rounded-3xl bg-slate-900/50 border border-slate-800/50">
            <h3 className="text-2xl font-bold text-white flex items-center justify-center md:justify-start gap-3">
              <Settings className="text-slate-400" /> Personalization
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Save multiple places (Home, Work, College). Select your occupation (Student, Farmer, Pilot, Photographer) to help WeatherGuard emphasize relevant information. Configure units and opt-in to FCM push notifications for severe weather alerts.
            </p>
          </div>
        </div>
      </section>

      {/* 37. How Everything Connects Diagram */}
      <section className="px-6 py-24 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-16">How Everything Connects</h2>
        
        <div className="bg-slate-900/80 p-6 md:p-12 rounded-[2rem] border border-slate-700/80 shadow-2xl relative overflow-hidden font-mono text-xs md:text-sm">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
          <div className="relative z-10 flex flex-col items-center space-y-12 text-cyan-100 w-full max-w-3xl mx-auto">
            
            <div className="font-bold text-xl md:text-2xl text-white tracking-widest bg-slate-800 px-6 py-2 rounded-xl border border-slate-700 shadow-lg">WEATHERGUARD</div>
            <div className="h-12 w-px bg-slate-600 -my-8" />
            
            <div className="flex w-full justify-between relative mt-4">
              {/* Connection Line */}
              <div className="absolute top-0 left-[16%] right-[16%] h-px bg-slate-600" />
              
              <div className="flex flex-col items-center w-1/3">
                <div className="w-px h-6 bg-slate-600 mb-2" />
                <div className="font-bold text-cyan-400 mb-4 bg-cyan-950/40 px-3 py-1 rounded border border-cyan-500/20">WEATHER</div>
                <ul className="space-y-3 text-slate-400">
                  <li>Live Weather</li>
                  <li>Forecasts</li>
                  <li>Risk & Alerts</li>
                  <li>Radar</li>
                </ul>
              </div>
              
              <div className="flex flex-col items-center w-1/3">
                <div className="w-px h-6 bg-slate-600 mb-2" />
                <div className="font-bold text-emerald-400 mb-4 bg-emerald-950/40 px-3 py-1 rounded border border-emerald-500/20">EARTH</div>
                <ul className="space-y-3 text-slate-400">
                  <li>Earth Watch</li>
                  <li>Disasters</li>
                  <li>Earthquakes</li>
                  <li>Wildfires</li>
                </ul>
              </div>
              
              <div className="flex flex-col items-center w-1/3">
                <div className="w-px h-6 bg-slate-600 mb-2" />
                <div className="font-bold text-purple-400 mb-4 bg-purple-950/40 px-3 py-1 rounded border border-purple-500/20">SPACE</div>
                <ul className="space-y-3 text-slate-400">
                  <li>Solar Activity</li>
                  <li>Solar Flares</li>
                  <li>CME</li>
                  <li>Aurora</li>
                </ul>
              </div>
            </div>

            <div className="h-12 w-px bg-slate-600 -my-6" />
            <div className="font-bold text-amber-400 bg-amber-950/40 px-6 py-2 rounded-xl border border-amber-500/20 shadow-lg mt-4 z-10">OBSERVATION</div>
            <div className="text-slate-400 max-w-lg text-center leading-relaxed text-sm bg-slate-900 p-4 rounded-xl border border-slate-800">
              Planets • Moon • Stars • Constellations • Meteor Showers • Eclipses • Satellites • Solar System • Asteroids • NEOs
            </div>

          </div>
        </div>
      </section>

      {/* 31-36, 39. Technology & Thanks */}
      <section className="px-6 py-20 bg-slate-950 border-t border-white/5">
        <div className="max-w-5xl mx-auto space-y-16 text-center">
          <h2 className="text-3xl font-bold text-white">Built With Gratitude</h2>
          <p className="text-slate-400 max-w-3xl mx-auto leading-relaxed">
            WeatherGuard combines multiple specialized information and calculation sources. We would like to acknowledge the scientific, astronomical, and data providers whose APIs and services make this platform possible.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            <TechCard title="NASA" desc="Special thanks for NASA's scientific APIs (DONKI, NeoWs) used across the space/astronomy side of WeatherGuard." />
            <TechCard title="OrbitalRadar" desc="A special thank you for providing important observation, tracking and space-related information that powers several experiences." />
            <TechCard title="MoonCalc.org" desc="Acknowledging contributions to precise lunar calculations including phase, position, and timing." />
            <TechCard title="Timeanddate.com" desc="Used as a reference/data source for date/time, sunrise/sunset, and astronomical observation timing." />
            <TechCard title="OpenWeather" desc="Providing core atmospheric information, current weather, forecasts, and precipitation data." />
            <TechCard title="Astronomy Libraries" desc="Powering ephemeris calculations and celestial movement rather than manually placed decorative objects." />
          </div>
        </div>
      </section>

      {/* 38. Core Philosophy */}
      <section className="px-6 py-32 text-center max-w-3xl mx-auto space-y-8">
        <h2 className="text-4xl md:text-5xl font-black text-white">One Platform.<br/><span className="text-cyan-400">Many Perspectives.</span></h2>
        <div className="space-y-4 text-xl font-light text-slate-300 py-8">
          <p><span className="text-white font-medium">Look around you.</span> Weather and atmosphere.</p>
          <p><span className="text-white font-medium">Look across Earth.</span> Worldwide events and emergencies.</p>
          <p><span className="text-white font-medium">Look above you.</span> Planets, stars, satellites and celestial events.</p>
          <p><span className="text-white font-medium">Look beyond Earth.</span> Solar activity, space weather and near-Earth objects.</p>
        </div>
        <p className="text-2xl font-semibold text-cyan-400 pt-4">
          And most importantly — understand when something matters to you.
        </p>
        <div className="pt-24 pb-10">
          <div className="text-3xl font-black tracking-widest text-slate-700">WEATHERGUARD</div>
          <div className="text-xs font-mono tracking-[0.3em] text-slate-500 mt-3">OBSERVE. UNDERSTAND. PREPARE.</div>
        </div>
      </section>

    </div>
  );
};

// --- Helper Components ---

function FeatureCard({ icon, title, description, bgClass }: { icon: React.ReactNode, title: string, description: string, bgClass: string }) {
  return (
    <div className={`p-6 rounded-3xl border backdrop-blur-md transition-all hover:-translate-y-2 hover:shadow-2xl duration-300 ${bgClass}`}>
      <div className="mb-4 bg-black/20 w-16 h-16 rounded-2xl flex items-center justify-center">{icon}</div>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <div className="text-center space-y-4 mb-16">
      <h2 className="text-3xl md:text-5xl font-bold text-white">{title}</h2>
      <p className="text-xl text-slate-400 font-light">{subtitle}</p>
    </div>
  );
}

function FeatureRow({ title, subtitle, description, highlight, icon, reverse }: any) {
  return (
    <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 group`}>
      <div className="w-full md:w-1/2 flex justify-center">
        <div className="w-48 h-48 rounded-[2.5rem] bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl relative transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
          <div className="absolute inset-0 bg-cyan-500/5 rounded-[2.5rem] animate-ping" style={{ animationDuration: '3s' }} />
          {icon}
        </div>
      </div>
      <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
        <div>
          <h3 className="text-3xl font-bold text-white mb-2">{title}</h3>
          <h4 className="text-lg text-slate-400">{subtitle}</h4>
        </div>
        <p className="text-slate-300 text-lg leading-relaxed">
          {description}
        </p>
        <p className="text-cyan-400 font-medium text-lg border-l-2 border-cyan-500 pl-4 py-1">
          {highlight}
        </p>
      </div>
    </div>
  );
}

function SpaceCard({ title, subtitle, flow }: { title: string, subtitle: string, flow: string }) {
  return (
    <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-purple-500/20 backdrop-blur-md shadow-xl hover:border-purple-500/40 transition-colors">
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-purple-300 mb-8">{subtitle}</p>
      <div className="text-[10px] sm:text-xs font-mono text-slate-400 tracking-wider bg-slate-950 py-3 px-2 rounded-xl border border-slate-800 break-words">
        {flow}
      </div>
    </div>
  );
}

function ObsCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-amber-500/30 transition-all hover:shadow-lg hover:-translate-y-1">
      <div className="font-bold text-slate-200 mb-1">{title}</div>
      <div className="text-xs text-slate-400 leading-relaxed">{desc}</div>
    </div>
  );
}

function TechCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 transition-colors hover:border-slate-600">
      <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-500" />
        {title}
      </h4>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );
}
