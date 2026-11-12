import React from 'react';
import {
  Activity,
  Flame,
  Mountain,
  Wind,
  Shield,
  ExternalLink,
  Navigation,
  Compass,
  AlertTriangle,
  X,
  Copy,
  Check,
  Radio,
  Clock,
  Layers,
} from 'lucide-react';
import { EarthWatchEvent, GeoLocationItem } from '../../types';
import { formatDistanceKm } from '../../utils/formatters';

interface EventDetailDrawerProps {
  event: EarthWatchEvent | null;
  onClose: () => void;
  onFlyTo: (lat: number, lon: number) => void;
  currentLocation?: GeoLocationItem;
}

export const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({
  event,
  onClose,
  onFlyTo,
  currentLocation,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!event) return null;

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${event.lat.toFixed(4)}, ${event.lon.toFixed(4)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getEventIcon = () => {
    switch (event.type) {
      case 'earthquake':
        return <Activity size={18} className="text-red-400" />;
      case 'wildfire':
        return <Flame size={18} className="text-amber-400" />;
      case 'volcano':
        return <Mountain size={18} className="text-orange-400" />;
      case 'cyclone':
        return <Wind size={18} className="text-blue-400" />;
      default:
        return <AlertTriangle size={18} className="text-yellow-400" />;
    }
  };

  const formattedTime = new Date(event.timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-96 z-30 pointer-events-auto bg-slate-950/95 backdrop-blur-2xl border border-slate-700/90 rounded-2xl p-4 shadow-2xl space-y-3.5 animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 shadow-md shrink-0">
            {getEventIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  event.severity === 'critical'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : event.severity === 'warning'
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                    : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                }`}
              >
                {event.severity}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {event.source}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-100 mt-0.5 line-clamp-1">
              {event.title}
            </h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close details"
        >
          <X size={16} />
        </button>
      </div>

      {/* Description / Summary */}
      <p className="text-xs text-slate-300 leading-relaxed">
        {event.description || event.place}
      </p>

      {/* Specific Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {event.type === 'earthquake' && (
          <>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block">Magnitude</span>
              <span className="text-base font-bold font-mono text-red-400">
                M {event.magnitude?.toFixed(1) || '--'}
              </span>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block">Focal Depth</span>
              <span className="text-base font-bold font-mono text-cyan-300">
                {event.depthKm ? `${event.depthKm} km` : '10 km'}
              </span>
            </div>
            {event.tsunamiRisk && (
              <div className="col-span-2 bg-red-950/40 border border-red-500/40 p-2 rounded-xl flex items-center gap-2 text-red-300 font-bold text-xs">
                <AlertTriangle size={14} className="animate-pulse shrink-0" />
                <span>Regional Tsunami Warning Active</span>
              </div>
            )}
          </>
        )}

        {event.type === 'wildfire' && (
          <>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block">Estimated Area</span>
              <span className="text-sm font-bold font-mono text-amber-400">
                {event.wildfireAcres ? `${event.wildfireAcres.toLocaleString()} ac` : '--'}
              </span>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block">Containment</span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                {event.wildfireContainmentPercent != null
                  ? `${event.wildfireContainmentPercent}%`
                  : 'Active'}
              </span>
            </div>
          </>
        )}

        {event.type === 'volcano' && (
          <>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block">Aviation Code</span>
              <span
                className={`text-sm font-bold font-mono ${
                  event.volcanoAviationColor === 'RED'
                    ? 'text-red-400'
                    : event.volcanoAviationColor === 'ORANGE'
                    ? 'text-orange-400'
                    : 'text-yellow-400'
                }`}
              >
                {event.volcanoAviationColor || 'WATCH'}
              </span>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block">Plume Altitude</span>
              <span className="text-sm font-bold font-mono text-slate-200">
                {event.volcanoPlumeAltitudeKm ? `${event.volcanoPlumeAltitudeKm} km` : 'Active'}
              </span>
            </div>
          </>
        )}

        {event.type === 'cyclone' && (
          <>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block">Wind Velocity</span>
              <span className="text-sm font-bold font-mono text-blue-400">
                {event.cycloneWindSpeedKmh ? `${event.cycloneWindSpeedKmh} km/h` : '--'}
              </span>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block">Category</span>
              <span className="text-sm font-bold font-mono text-cyan-300">
                {event.cycloneCategory || 'Tropical Storm'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Tectonic plate & distance */}
      <div className="space-y-1 text-[11px] text-slate-400 font-mono border-t border-slate-800 pt-2.5">
        {event.tectonicPlate && (
          <div className="flex items-center justify-between">
            <span>Tectonic Setting:</span>
            <span className="text-slate-200 text-right truncate max-w-[200px]">
              {event.tectonicPlate}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span>Recorded Time:</span>
          <span className="text-slate-300">{formattedTime}</span>
        </div>
        {event.distanceKm != null && (
          <div className="flex items-center justify-between">
            <span>Distance from Station:</span>
            <span className="text-cyan-300 font-semibold">
              {formatDistanceKm(event.distanceKm)}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onFlyTo(event.lat, event.lon)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md"
        >
          <Navigation size={13} />
          <span>Center Focus</span>
        </button>

        <button
          onClick={handleCopyCoords}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Copy Coordinates"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>

        {event.sourceUrl && (
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
            title="View Official Source Report"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
};
