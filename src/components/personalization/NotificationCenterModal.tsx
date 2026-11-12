import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  Trash2,
  ExternalLink,
  CloudRain,
  Wind,
  Radio,
  Activity,
  Sun,
  Flame,
  ShieldAlert,
  Clock,
  Filter,
  CheckCheck,
} from 'lucide-react';
import { usePersonalization } from '../../context/PersonalizationContext';
import { AlertCategory, SmartAlertNotification } from '../../types/personalization';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const {
    alerts,
    unreadAlertsCount,
    markAlertAsRead,
    markAllAlertsAsRead,
    dismissAlert,
    clearAllAlerts,
  } = usePersonalization();

  const [activeFilter, setActiveFilter] = useState<string>('all');

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter((alert) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !alert.isRead;
    if (activeFilter === 'rain') return alert.category === 'rain';
    if (activeFilter === 'aqi') return alert.category === 'aqi';
    if (activeFilter === 'cyclone') return alert.category === 'cyclone';
    if (activeFilter === 'earthquake') return alert.category === 'earthquake';
    if (activeFilter === 'astronomy') return alert.category === 'eclipse' || alert.category === 'meteor_shower';
    return true;
  });

  const getCategoryIcon = (category: AlertCategory) => {
    switch (category) {
      case 'rain':
        return <CloudRain size={16} className="text-blue-400" />;
      case 'aqi':
        return <Wind size={16} className="text-amber-400" />;
      case 'cyclone':
        return <Radio size={16} className="text-cyan-400" />;
      case 'earthquake':
        return <Activity size={16} className="text-red-400" />;
      case 'eclipse':
        return <Sun size={16} className="text-purple-400" />;
      case 'meteor_shower':
        return <Flame size={16} className="text-orange-400" />;
      default:
        return <Bell size={16} className="text-slate-400" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse';
      case 'warning':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'advisory':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-slate-900/90 relative">
          <div className="flex items-start gap-3 pr-8 sm:pr-0">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Bell size={20} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight leading-tight">
                  Smart Alerts
                </h2>
                {unreadAlertsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-bold font-mono text-[10px] whitespace-nowrap">
                    {unreadAlertsCount} New
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono leading-tight">
                Real-time multi-hazard bulletins
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {unreadAlertsCount > 0 && (
              <button
                onClick={markAllAlertsAsRead}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all flex items-center gap-1 cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck size={14} />
                <span>Read All</span>
              </button>
            )}

            {alerts.length > 0 && (
              <button
                onClick={clearAllAlerts}
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition-all cursor-pointer flex items-center gap-1"
                title="Clear all alerts"
              >
                <Trash2 size={16} />
              </button>
            )}

            <button
              onClick={onClose}
              className="absolute sm:static top-4 right-4 p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filters / Tabs */}
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto flex-nowrap no-scrollbar scroll-smooth text-xs font-mono">
          {[
            { id: 'all', label: `All (${alerts.length})` },
            { id: 'unread', label: `Unread (${unreadAlertsCount})` },
            { id: 'rain', label: 'Rain' },
            { id: 'aqi', label: 'AQI' },
            { id: 'cyclone', label: 'Cyclones' },
            { id: 'earthquake', label: 'Seismic' },
            { id: 'astronomy', label: 'Astronomy & Space' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id as any)}
              className={`shrink-0 px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                activeFilter === cat.id
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800/50 hover:bg-slate-700 text-slate-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <ShieldAlert size={32} className="mx-auto text-slate-600" />
              <p className="text-sm font-mono">No notifications in this category</p>
              <span className="text-xs text-slate-600 block">
                Atmosphere and geophysical radars are actively scanning.
              </span>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col space-y-2 ${
                  alert.isRead
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                    : 'bg-slate-900/90 border-slate-700/80 shadow-lg ring-1 ring-white/5'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                      {getCategoryIcon(alert.category)}
                    </div>
                    <div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 ml-2">
                        {alert.locationName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      title="Dismiss"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="text-sm font-bold text-white">{alert.title}</div>
                <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-slate-500">
                    Source: {alert.triggerSource.replace('_', ' ')} {alert.fcmSent && '• Web Push Sent'}
                  </span>

                  <div className="flex items-center gap-2">
                    {!alert.isRead && (
                      <button
                        onClick={() => markAlertAsRead(alert.id)}
                        className="text-[11px] font-mono text-slate-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 size={12} /> Mark Read
                      </button>
                    )}

                    {alert.actionLabel && alert.actionTab && (
                      <button
                        onClick={() => {
                          markAlertAsRead(alert.id);
                          onClose();
                          if (onNavigateTab && alert.actionTab) {
                            onNavigateTab(alert.actionTab);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-mono text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <span>{alert.actionLabel}</span>
                        <ExternalLink size={11} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
