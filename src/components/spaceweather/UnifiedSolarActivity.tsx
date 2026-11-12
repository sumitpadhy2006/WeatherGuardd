import React, { useState } from 'react';
import { Flame, Compass } from 'lucide-react';
import { SolarFlareHero } from './SolarFlareHero';
import { CmeHero } from './CmeHero';
import { SolarFlaresMonitor } from './SolarFlaresMonitor';
import { CmeTracker } from './CmeTracker';
import { SpaceWeatherOverviewPayload } from '../../types/spaceweather';
import { GeoLocationItem } from '../../types';

interface UnifiedSolarActivityProps {
  data: SpaceWeatherOverviewPayload;
  currentLocation: GeoLocationItem | null;
}

type ViewMode = 'flares' | 'cme';

export const UnifiedSolarActivity: React.FC<UnifiedSolarActivityProps> = ({ data, currentLocation }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('flares');

  const { solarFlares, cmes, solarCycle, lastUpdated } = data;
  const latestFlare = solarFlares?.[0] || null;
  const latestCme = cmes?.[0] || null;

  // Very basic association logic: If they happened within 12 hours of each other, consider them associated.
  // In a real app, this would use a strict ID mapping provided by the backend (like `associatedFlareId`).
  let relatedCme = undefined;
  if (latestFlare && latestCme) {
    const flareTime = new Date(latestFlare.peakTime).getTime();
    const cmeTime = new Date(latestCme.startTime).getTime();
    if (Math.abs(cmeTime - flareTime) < 12 * 60 * 60 * 1000) {
      relatedCme = latestCme;
    }
  }

  let associatedFlare = undefined;
  if (latestCme && latestFlare) {
    const flareTime = new Date(latestFlare.peakTime).getTime();
    const cmeTime = new Date(latestCme.startTime).getTime();
    if (Math.abs(cmeTime - flareTime) < 12 * 60 * 60 * 1000) {
      associatedFlare = latestFlare;
    }
  }

  return (
    <div className="space-y-6">
      {/* Internal View Switcher */}
      <div className="flex items-center justify-center pt-2">
        <div className="bg-slate-900 border border-slate-800 rounded-full p-1 flex items-center shadow-inner">
          <button
            onClick={() => setViewMode('flares')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold font-mono transition-all ${
              viewMode === 'flares'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Flame size={16} className={viewMode === 'flares' ? 'text-slate-950' : 'text-amber-500'} />
            Solar Flares
          </button>
          
          <button
            onClick={() => setViewMode('cme')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold font-mono transition-all ${
              viewMode === 'cme'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Compass size={16} className={viewMode === 'cme' ? 'text-slate-950' : 'text-cyan-500'} />
            CME
          </button>
        </div>
      </div>

      {/* Conditional Rendering based on viewMode */}
      {viewMode === 'flares' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <SolarFlareHero
            latestFlare={latestFlare}
            solarCycle={solarCycle}
            currentLocation={currentLocation}
            relatedCme={relatedCme}
            onSwitchToCme={() => setViewMode('cme')}
          />
          <SolarFlaresMonitor flares={solarFlares} activeRegions={solarCycle?.activeRegions || []} />
        </div>
      )}

      {viewMode === 'cme' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CmeHero
            latestCme={latestCme}
            associatedFlare={associatedFlare}
            onSwitchToFlares={() => setViewMode('flares')}
          />
          <CmeTracker cmes={cmes} />
        </div>
      )}
    </div>
  );
};
