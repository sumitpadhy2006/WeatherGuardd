import React, { useState } from 'react';
import {
  Activity,
  Flame,
  Mountain,
  Wind,
  Waves,
  MapPin,
  Clock,
  Navigation,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Radio,
  Layers,
  Copy,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { EarthWatchEvent, UnitSystem } from '../../types';
import { Badge } from '../common/Badge';

interface DisasterEventCardProps {
  event: EarthWatchEvent;
  isSelected?: boolean;
  onSelect?: () => void;
  units?: UnitSystem;
}

export const DisasterEventCard: React.FC<DisasterEventCardProps> = ({
  event,
  isSelected,
  onSelect,
  units = 'metric',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Time ago formatter
  const formatTimeAgo = (timestamp: number) => {
    const elapsedMinutes = Math.floor((Date.now() - timestamp) / 60000);
    if (elapsedMinutes < 1) return 'Just now';
    if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    if (elapsedHours < 24) return `${elapsedHours}h ago`;
    const elapsedDays = Math.floor(elapsedHours / 24);
    return `${elapsedDays}d ago`;
  };

  const handleCopyCoords = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(`${event.lat.toFixed(4)}, ${event.lon.toFixed(4)}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 1800);
  };

  // Severity color mappings
  const severityBadge = {
    critical: {
      bg: 'bg-red-500/15 text-red-400 border-red-500/40',
      pill: 'bg-red-500',
      label: 'Critical Alert',
    },
    warning: {
      bg: 'bg-orange-500/15 text-orange-400 border-orange-500/40',
      pill: 'bg-orange-500',
      label: 'Warning',
    },
    watch: {
      bg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/40',
      pill: 'bg-yellow-500',
      label: 'Watch',
    },
    advisory: {
      bg: 'bg-slate-800 text-slate-300 border-slate-700',
      pill: 'bg-slate-500',
      label: 'Advisory',
    },
  }[event.severity];

  return (
    <article
      id={`event-card-${event.id}`}
      onClick={onSelect}
      className={`rounded-2xl border transition-all cursor-pointer select-none p-4 sm:p-5 space-y-3.5 ${
        isSelected
          ? 'bg-slate-900/95 border-cyan-500/80 ring-2 ring-cyan-500/30 shadow-xl shadow-cyan-950/30'
          : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800/80 hover:border-slate-700/80 shadow-md'
      }`}
    >
      {/* Header Strip: Icon, Type, Severity & Time */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {event.type === 'earthquake' && (
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
              <Activity size={17} />
            </div>
          )}
          {event.type === 'wildfire' && (
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Flame size={17} />
            </div>
          )}
          {event.type === 'volcano' && (
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
              <Mountain size={17} />
            </div>
          )}
          {event.type === 'cyclone' && (
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Wind size={17} />
            </div>
          )}

          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block -mb-0.5">
              {event.source} Telemetry
            </span>
            <span className="text-xs font-bold text-slate-200 capitalize">
              {event.type === 'earthquake'
                ? 'Seismic Tremor'
                : event.type === 'wildfire'
                ? 'Thermal Anomaly / Fire'
                : event.type === 'volcano'
                ? 'Volcanic Eruption'
                : 'Cyclonic System'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider border ${severityBadge.bg}`}
          >
            {severityBadge.label}
          </span>
          <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
            <Clock size={11} />
            {formatTimeAgo(event.timestamp)}
          </span>
        </div>
      </div>

      {/* Main Title & Place */}
      <div>
        <h4 className="text-sm sm:text-base font-bold text-slate-100 leading-snug hover:text-cyan-300 transition-colors">
          {event.title}
        </h4>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
          <MapPin size={13} className="text-slate-500 shrink-0" />
          <span className="truncate">{event.place}</span>
        </div>
      </div>

      {/* Tsunami Risk Banner (if flagged) */}
      {event.tsunamiRisk && (
        <div className="bg-red-950/80 border border-red-500/40 rounded-xl p-2.5 flex items-center gap-2.5 text-xs text-red-200 animate-pulse">
          <Waves size={16} className="text-red-400 shrink-0" />
          <span className="font-semibold">
            Tsunami Watch Active: Regional oceanic displacement monitoring engaged.
          </span>
        </div>
      )}

      {/* Key Domain Diagnostic Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {/* EARTHQUAKE METRICS */}
        {event.type === 'earthquake' && (
          <>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Magnitude</span>
              <span className="text-base font-bold font-mono text-red-400">
                M {event.magnitude?.toFixed(1) || '—'}
              </span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Depth</span>
              <span className="text-base font-bold font-mono text-slate-100">
                {event.depthKm != null ? `${event.depthKm} km` : '10 km'}
              </span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Intensity (MMI)</span>
              <span className="text-base font-bold font-mono text-amber-300">
                {event.mmi ? `MMI ${event.mmi.toFixed(1)}` : 'Moderate'}
              </span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Felt Reports</span>
              <span className="text-base font-bold font-mono text-slate-300">
                {event.feltReports ? `${event.feltReports.toLocaleString()}` : '0 reported'}
              </span>
            </div>
          </>
        )}

        {/* WILDFIRE METRICS */}
        {event.type === 'wildfire' && (
          <>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Estimated Area</span>
              <span className="text-base font-bold font-mono text-amber-400">
                {event.wildfireAcres ? `${event.wildfireAcres.toLocaleString()} ac` : 'Active Front'}
              </span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Containment</span>
              <span className="text-base font-bold font-mono text-emerald-400">
                {event.wildfireContainmentPercent != null ? `${event.wildfireContainmentPercent}%` : 'Uncontained'}
              </span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Fire Power</span>
              <span className="text-base font-bold font-mono text-orange-400">
                {event.fireFrpMw ? `${event.fireFrpMw} MW` : 'High Radiative'}
              </span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Thermal Sensor</span>
              <span className="text-base font-bold font-mono text-slate-300">MODIS / VIIRS</span>
            </div>
          </>
        )}

        {/* VOLCANO METRICS */}
        {event.type === 'volcano' && (
          <>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Aviation Code</span>
              <span
                className={`text-base font-bold font-mono ${
                  event.volcanoAviationColor === 'RED'
                    ? 'text-red-400'
                    : event.volcanoAviationColor === 'ORANGE'
                    ? 'text-orange-400'
                    : 'text-yellow-400'
                }`}
              >
                {event.volcanoAviationColor || 'ORANGE'}
              </span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Plume Altitude</span>
              <span className="text-base font-bold font-mono text-slate-100">
                {event.volcanoPlumeAltitudeKm ? `${event.volcanoPlumeAltitudeKm} km` : 'Active Vapors'}
              </span>
            </div>
            <div className="col-span-2 bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Status</span>
              <span className="text-xs font-semibold text-slate-300 truncate block">
                {event.volcanoActivityStatus || 'Effusive crater activity'}
              </span>
            </div>
          </>
        )}

        {/* CYCLONE METRICS */}
        {event.type === 'cyclone' && (
          <>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Classification</span>
              <span className="text-base font-bold font-mono text-blue-400">
                {event.cycloneCategory || 'Tropical Storm'}
              </span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Max Sustained Wind</span>
              <span className="text-base font-bold font-mono text-cyan-300">
                {event.cycloneWindSpeedKmh ? `${event.cycloneWindSpeedKmh} km/h` : '140 km/h'}
              </span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Central Pressure</span>
              <span className="text-base font-bold font-mono text-slate-100">
                {event.cyclonePressureHpa ? `${event.cyclonePressureHpa} hPa` : '960 hPa'}
              </span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Forward Vector</span>
              <span className="text-base font-bold font-mono text-slate-300 truncate block">
                {event.cycloneMovement || 'NW at 18 km/h'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Proximity & Station Relative Distance Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCoords}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
            title="Click to copy GPS coordinates"
          >
            {copiedCoords ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            <span>
              {event.lat.toFixed(2)}°, {event.lon.toFixed(2)}°
            </span>
          </button>

          {event.distanceKm != null && (
            <span className="text-[11px] font-mono text-cyan-300 flex items-center gap-1">
              <Navigation size={11} />
              {event.distanceKm.toLocaleString()} km from active station
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {event.sourceUrl && (
            <a
              href={event.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
              title="Open Official Telemetry Source"
            >
              <ExternalLink size={14} />
            </a>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <span>{isExpanded ? 'Less' : 'Deep Telemetry'}</span>
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* Deep Telemetry Expandable Details */}
      {isExpanded && (
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5 text-xs text-slate-300 animate-fadeIn">
          {event.description && (
            <p className="leading-relaxed text-slate-300">{event.description}</p>
          )}

          {event.tectonicPlate && (
            <div className="flex items-center justify-between text-[11px] font-mono border-t border-slate-800/80 pt-2">
              <span className="text-slate-400">Tectonic Lithosphere Domain:</span>
              <span className="text-cyan-300 font-semibold">{event.tectonicPlate}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-400">
            <span>Event Identification Token:</span>
            <span className="text-slate-300">{event.id}</span>
          </div>
        </div>
      )}
    </article>
  );
};
