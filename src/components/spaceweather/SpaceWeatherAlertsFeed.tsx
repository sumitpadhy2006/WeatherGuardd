import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Radio,
  Zap,
  Satellite,
  Compass,
  Sparkles,
  Info,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { SpaceWeatherAlertItem } from '../../types/spaceweather';

interface SpaceWeatherAlertsFeedProps {
  alerts: SpaceWeatherAlertItem[];
}

export const SpaceWeatherAlertsFeed: React.FC<SpaceWeatherAlertsFeedProps> = ({ alerts }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<SpaceWeatherAlertItem | null>(alerts[0] || null);

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'all') return true;
    return a.severity === filterSeverity;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'alert':
      case 'emergency':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/60 font-extrabold animate-pulse';
      case 'warning':
      case 'watch':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold';
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
  };

  return (
    <div className="space-y-6" id="space-weather-alerts-module">
      <div className="bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold shadow-lg shadow-rose-500/10">
              <Bell size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                NASA DONKI & NOAA Space Weather Alerts
              </h3>
              <p className="text-xs text-slate-400">
                Official space weather notifications, solar radiation watches & technological infrastructure impact assessments
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl p-1 font-mono text-xs">
            {['all', 'alert', 'warning', 'watch', 'info'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  filterSeverity === sev
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Alerts List */}
          <div className="lg:col-span-6 space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {filteredAlerts.map((alert) => {
              const isSelected = selectedAlert?.id === alert.id;
              const sevBadge = getSeverityBadge(alert.severity);

              return (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`bg-slate-950/70 border rounded-2xl p-4 transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)] bg-slate-900/90'
                      : 'border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border uppercase ${sevBadge}`}>
                      {alert.severity} • {alert.messageType}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(alert.messageIssueTime).toUTCString().slice(5, 22)}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-100 leading-snug">
                    {alert.title}
                  </h4>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
                    {alert.messageBody}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Selected Alert Detailed Impact Assessment Panel */}
          <div className="lg:col-span-6">
            {selectedAlert ? (
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">Active Bulletin</span>
                    <h4 className="text-sm font-bold text-slate-100">{selectedAlert.id}</h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs border uppercase ${getSeverityBadge(selectedAlert.severity)}`}>
                    {selectedAlert.severity}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Summary & Scientific Context</span>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed bg-slate-900/50 border border-slate-800/60 rounded-xl p-3">
                    {selectedAlert.messageBody}
                  </p>
                </div>

                {/* Infrastructure Impact Matrix */}
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Critical Infrastructure Impact Matrix
                  </span>

                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-2.5 flex items-start gap-2.5">
                      <Zap size={15} className="text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-200 block text-[11px]">Power Grids & Transformers</span>
                        <span className="text-slate-400 font-sans text-xs">{selectedAlert.impacts.powerGrid}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-2.5 flex items-start gap-2.5">
                      <Satellite size={15} className="text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-200 block text-[11px]">Spacecraft & Satellites</span>
                        <span className="text-slate-400 font-sans text-xs">{selectedAlert.impacts.spacecraft}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-2.5 flex items-start gap-2.5">
                      <Radio size={15} className="text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-200 block text-[11px]">High-Frequency Aviation Radio</span>
                        <span className="text-slate-400 font-sans text-xs">{selectedAlert.impacts.hfRadio}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-2.5 flex items-start gap-2.5">
                      <Compass size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-200 block text-[11px]">GNSS / GPS Navigation</span>
                        <span className="text-slate-400 font-sans text-xs">{selectedAlert.impacts.gnssGps}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
                Select an alert from the list to view detailed impacts.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
