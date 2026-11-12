import React, { useEffect, useRef } from 'react';
import { 
  Github, Linkedin, Twitter, Mail, Code2, 
  ChevronDown, ArrowDown, ExternalLink, Globe,
  Instagram
} from 'lucide-react';

export const CreatorPage: React.FC = () => {
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
      className="w-full overflow-x-hidden bg-slate-950 text-slate-200"
    >
      {/* 1. PAGE HERO */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="relative z-10 space-y-8 max-w-4xl mx-auto pt-20">
          
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-full blur-md opacity-40 animate-pulse" />
              <img 
                src="/assets/Sumit.png" 
                alt="SumitKumar Padhy" 
                className="relative w-40 h-40 rounded-full object-cover border-4 border-slate-900 shadow-2xl"
              />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tight break-words px-2">
            SumitKumar Padhy
          </h1>
          
          <h2 className="text-lg sm:text-xl md:text-2xl font-light text-cyan-400 px-4">
            Creator & Architect of WeatherGuard
          </h2>
          
          <div className="text-slate-400 text-xs sm:text-sm md:text-base font-mono space-y-1 px-4">
            <p>Computer Science & Engineering</p>
            <p>Artificial Intelligence & Machine Learning</p>
          </div>

          <div className="pt-8">
            <p className="text-slate-300 text-lg md:text-xl font-light italic max-w-2xl mx-auto leading-relaxed border-t border-b border-white/10 py-6">
              "Designed, architected and developed as a unified
              Weather, Earth & Space intelligence platform."
            </p>
          </div>
          
          {/* Social Links placeholder */}
          <div className="flex justify-center gap-6 pt-6">
            <SocialLink icon={<Linkedin size={22} />} href="https://www.linkedin.com/in/sumitkumar-padhy-16may2006/" label="LinkedIn" />
            <SocialLink icon={<Twitter size={22} />} href="https://x.com/PadhySumit9006" label="X" />
            <SocialLink icon={<Github size={22} />} href="https://github.com/sumitpadhy2006" label="GitHub" />
            <SocialLink icon={<Instagram size={22} />} href="https://www.instagram.com/sumit_padhy_9006/" label="Instagram" />
            <SocialLink icon={<Mail size={22} />} href="mailto:sumitpadhy2006@gmail.com" label="Email" />
            <SocialLink icon={<Globe size={22} />} href="https://sumitkportfolio.vercel.app/" label="Portfolio" />
          </div>
          
          <div className="pt-16 animate-bounce text-slate-500">
            <ArrowDown size={24} className="mx-auto" />
          </div>
        </div>
      </section>

      {/* 2. ABOUT THE CREATOR */}
      <section className="px-6 py-24 max-w-3xl mx-auto">
        <div className="bg-slate-900/40 backdrop-blur-md rounded-[2rem] p-8 md:p-12 border border-white/5 shadow-2xl">
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed space-y-6">
            <span className="block">
              "Hi, I'm SumitKumar Padhy, a Computer Science & Engineering student specializing in Artificial Intelligence & Machine Learning.
            </span>
            <span className="block pt-4">
              WeatherGuard was created as a project to bring together real-time weather intelligence, severe-weather awareness, Earth observation, astronomy and space-related information into one simple platform."
            </span>
          </p>
        </div>
      </section>

      {/* 3. WHY I CREATED WEATHERGUARD */}
      <section className="px-6 py-24 border-t border-white/5 bg-slate-900/20">
        <div className="max-w-4xl mx-auto">
          <SectionTitle title="WHY I CREATED WEATHERGUARD" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-16 items-center">
            <div className="space-y-6 text-lg text-slate-300 leading-relaxed">
              <p>Weather information is usually spread across multiple platforms.</p>
              <p>WeatherGuard was envisioned to bring important information together in one place:</p>
            </div>
            
            <div className="space-y-4 bg-slate-900/60 p-8 rounded-3xl border border-slate-800">
              <ul className="space-y-4 text-cyan-100 font-medium">
                <li className="flex gap-3"><span className="text-cyan-500">•</span> What is happening around me?</li>
                <li className="flex gap-3"><span className="text-cyan-500">•</span> What weather is coming next?</li>
                <li className="flex gap-3"><span className="text-cyan-500">•</span> Is there a risk?</li>
                <li className="flex gap-3"><span className="text-cyan-500">•</span> What important events are happening around Earth?</li>
                <li className="flex gap-3"><span className="text-cyan-500">•</span> What can I observe in the sky tonight?</li>
                <li className="flex gap-3"><span className="text-cyan-500">•</span> What is happening beyond Earth?</li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-20">
            <p className="text-slate-400 mb-6">The goal is:</p>
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-12 text-2xl md:text-3xl font-black tracking-widest text-white">
              <span>OBSERVE.</span>
              <span className="hidden md:block w-2 h-2 rounded-full bg-cyan-500" />
              <span>UNDERSTAND.</span>
              <span className="hidden md:block w-2 h-2 rounded-full bg-cyan-500" />
              <span>PREPARE.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE IDEA */}
      <section className="px-6 py-32 max-w-4xl mx-auto text-center">
        <SectionTitle title="THE IDEA" />
        
        <p className="text-lg text-slate-300 max-w-2xl mx-auto mt-12 mb-20 leading-relaxed">
          WeatherGuard gradually evolved from a weather and early-warning concept into a broader observation platform covering atmospheric, Earth and space information.
        </p>

        <div className="flex flex-col items-center space-y-6 font-mono text-sm md:text-base tracking-widest">
          <div className="px-8 py-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 w-full max-w-sm">WEATHER</div>
          <ArrowDown className="text-slate-600" />
          <div className="px-8 py-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 w-full max-w-sm">EARTH</div>
          <ArrowDown className="text-slate-600" />
          <div className="px-8 py-4 rounded-xl bg-purple-950/30 border border-purple-500/30 text-purple-300 w-full max-w-sm">SPACE</div>
          <ArrowDown className="text-slate-600" />
          <div className="px-8 py-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 w-full max-w-sm">OBSERVATION</div>
          <ArrowDown className="text-slate-600" />
          <div className="px-10 py-6 rounded-2xl bg-slate-800 text-white font-bold w-full max-w-md shadow-2xl border border-slate-600 text-lg">
            ONE UNIFIED PLATFORM
          </div>
        </div>
      </section>

      {/* 5. WHAT I BUILT */}
      <section className="px-6 py-24 bg-slate-900/40 border-t border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <SectionTitle title="WHAT I DESIGNED & BUILT" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            <FeatureGroup title="Weather Intelligence">
              Real-time weather, Forecasting, Risk classification, Severe-weather alerts, Early-warning experience, Weather maps
            </FeatureGroup>
            <FeatureGroup title="Earth Watch">
              Global disaster tracking, Earthquakes, Environmental observation
            </FeatureGroup>
            <FeatureGroup title="Space Weather">
              Solar Flares, CME, Geomagnetic Storms, Aurora / Northern & Southern Lights
            </FeatureGroup>
            <FeatureGroup title="Sky Observation">
              Celestial Bodies, Planets, Moon, Constellations, Meteor Showers, Eclipses
            </FeatureGroup>
            <FeatureGroup title="Space Exploration">
              Near-Earth Objects, Satellite passes, Live launch / tracking information
            </FeatureGroup>
            <FeatureGroup title="Platform Features">
              Solar System exploration, 360° planetary exploration, Observation calendar, Personalized locations and alerts
            </FeatureGroup>
          </div>
        </div>
      </section>

      {/* 6 & 7. HOME & OBSERVATION EXPERIENCE */}
      <section className="px-6 py-24 max-w-5xl mx-auto space-y-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">WeatherGuard Home Experience</h3>
            <p className="text-slate-300 leading-relaxed text-lg mb-6">
              "The WeatherGuard Home experience adapts to the user's selected location, local time and actual weather conditions."
            </p>
            <p className="text-slate-400">
              The visual environment adapts to: Day, Night, Clear, Cloudy, Rain, Heavy Rain, Thunderstorm, Strong Wind, Snow, Fog, and Extreme weather. The purpose is to make the interface reflect the actual environment while keeping the information simple.
            </p>
          </div>
          <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-6">Observation Experience</h3>
            <p className="text-slate-300 mb-6">Answers location-based questions:</p>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li>• Which planets are visible? When and where?</li>
              <li>• Which constellations are visible?</li>
              <li>• When is a meteor shower? Can I observe it?</li>
              <li>• When is an eclipse? Can it be seen from my location?</li>
              <li>• Is an aurora visible from my city?</li>
              <li>• Which satellites may pass overhead?</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 8. SCIENTIFIC CALCULATIONS */}
      <section className="px-6 py-24 bg-indigo-950/20 border-t border-b border-indigo-500/10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <SectionTitle title="BUILT AROUND REAL DATA & CALCULATIONS" />
          <p className="text-lg md:text-xl text-indigo-200 leading-relaxed max-w-3xl mx-auto">
            "WeatherGuard does not rely on manually placed decorative planet positions. Where supported, astronomical positions, movement and observation timing are derived from connected astronomical libraries, APIs and ephemeris data."
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-8 max-w-3xl mx-auto">
            {['Planetary positions', 'Orbital movement', 'Moon calculations', 'Celestial observation timing', 'Solar System positioning', 'Asteroid/NEO movement', 'Satellite observation'].map(tag => (
              <span key={tag} className="px-4 py-2 rounded-full bg-indigo-900/30 text-indigo-300 text-sm border border-indigo-500/20">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 9. TECHNOLOGY & DATA CREDITS */}
      <section className="px-6 py-32 max-w-4xl mx-auto">
        <SectionTitle title="TECHNOLOGY & DATA SOURCES" />
        <p className="text-center text-slate-400 mb-16 max-w-2xl mx-auto">
          WeatherGuard brings together multiple specialized data providers. These data and service acknowledgements power specific parts of the platform.
        </p>

        <div className="space-y-8">
          <CreditCard title="NASA">
            NASA DONKI, NASA NeoWs, and other relevant NASA scientific APIs/data services.
          </CreditCard>
          
          <CreditCard title="Astronomy Libraries / APIs">
            Astronomical calculation libraries, ephemeris sources, and celestial-position services.
          </CreditCard>
          
          <CreditCard title="OrbitalRadar">
            Special thanks for important observation and tracking information used across areas such as the Sun, Moon, Mars, Deep Space, Stellar information, satellite passes, tracking, and launches.
          </CreditCard>
          
          <CreditCard title="MoonCalc.org">
            Special thanks for lunar calculations and Moon-related observation information.
          </CreditCard>
          
          <CreditCard title="Timeanddate.com">
            Special thanks for date/time and astronomy-related reference information such as sunrise, sunset, Moon timing, eclipse timing, and night-sky observation timing.
          </CreditCard>
          
          <CreditCard title="Weather data providers">
            Acknowledging weather APIs/services used for current weather, forecast, atmospheric measurements, air quality, and weather-related information.
          </CreditCard>
        </div>
      </section>

      {/* 10, 11, 12. DESIGN, WMD, ROLES */}
      <section className="px-6 py-24 bg-slate-900/40 border-y border-white/5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white tracking-widest uppercase">Design Philosophy</h3>
            <ul className="space-y-2 text-slate-400">
              <li>• Simplicity & visual clarity</li>
              <li>• Meaningful real data</li>
              <li>• Location awareness</li>
              <li>• Scientific context</li>
              <li>• Progressive detail</li>
            </ul>
            <p className="text-cyan-400 italic pt-4">
              "Simple enough for anyone to understand, detailed enough for anyone who wants to explore."
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white tracking-widest uppercase">Built as a WMD Project</h3>
            <p className="text-slate-400 leading-relaxed">
              WeatherGuard is being developed progressively through the Web and Mobile Development practical journey. The project grows step-by-step as different technologies and concepts are introduced.
            </p>
          </div>

          <div className="bg-slate-800/80 p-8 rounded-3xl border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-2">SUMITKUMAR PADHY</h3>
            <p className="text-cyan-400 text-sm font-mono mb-6">Creator • Architect • Designer • Developer</p>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li>• Product vision & architecture</li>
              <li>• UI/UX design & feature planning</li>
              <li>• Frontend & Backend integration</li>
              <li>• Data-source & astronomy integration</li>
              <li>• Testing and refinement</li>
            </ul>
          </div>

        </div>
      </section>

      {/* 13. FINAL MESSAGE */}
      <section className="px-6 py-40 text-center max-w-3xl mx-auto space-y-12">
        <div className="space-y-8 text-xl md:text-2xl font-light text-slate-300 leading-relaxed">
          <p>
            "WeatherGuard started with a simple idea:<br/>
            <span className="text-white font-medium mt-2 block">Understand the weather around you.</span>
          </p>
          <p>
            It grew into something larger:<br/>
            <span className="text-white font-medium mt-2 block">
              Understand the Earth.<br/>
              Look into the sky.<br/>
              Explore space.<br/>
              And know what matters to you."
            </span>
          </p>
        </div>

        <div className="pt-24 pb-8 space-y-4">
          <div className="text-3xl font-black tracking-widest text-white">WEATHERGUARD</div>
          <div className="text-sm font-mono tracking-[0.3em] text-cyan-500">OBSERVE • UNDERSTAND • PREPARE</div>
        </div>

        <div className="pt-12 border-t border-white/10 max-w-sm mx-auto">
          <p className="text-slate-500 text-sm uppercase tracking-widest mb-4">Created & Architected by</p>
          <h2 className="text-2xl font-bold text-white tracking-wide">SUMITKUMAR PADHY</h2>
        </div>
      </section>
      
    </div>
  );
};

// --- Helper Components ---

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="text-center">
      <h2 className="text-sm font-black tracking-[0.3em] text-slate-500 uppercase">{title}</h2>
    </div>
  );
}

function SocialLink({ icon, href, label }: { icon: React.ReactNode, href: string, label: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
      aria-label={label}
    >
      {icon}
    </a>
  );
}

function FeatureGroup({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-white font-semibold flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
        {title}
      </h4>
      <p className="text-sm text-slate-400 leading-relaxed pl-3.5">
        {children}
      </p>
    </div>
  );
}

function CreditCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 transition-colors hover:border-slate-700">
      <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
      <p className="text-slate-400 leading-relaxed text-sm md:text-base">
        {children}
      </p>
    </div>
  );
}
