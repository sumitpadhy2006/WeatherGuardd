import React, { useState } from 'react';
import {
  Bell,
  CloudRain,
  Wind,
  Activity,
  Radio,
  Flame,
  Sun,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Send,
  Sparkles,
  Shield,
  Smartphone,
} from 'lucide-react';
import { usePersonalization } from '../../context/PersonalizationContext';
import { AlertCategory } from '../../types/personalization';

export const SmartAlertsConfig: React.FC = () => {
  const {
    settings,
    updateSettings,
    triggerSimulatedAlert,
    requestPushPermission,
    firestoreSyncStatus,
  } = usePersonalization();

  const [testCategory, setTestCategory] = useState<AlertCategory>('rain');
  const [testFired, setTestFired] = useState(false);

  const handleTestTrigger = (cat: AlertCategory) => {
    triggerSimulatedAlert(cat);
    setTestFired(true);
    setTimeout(() => setTestFired(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Bell size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Smart Alert Engine & Trigger Rules
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                FCM & Firestore Synced
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure multi-hazard early warning thresholds for rain, AQI, cyclones, earthquakes, eclipses & meteor showers.
            </p>
          </div>
        </div>

        {/* Web Push Permission Button */}
        <div className="flex items-center gap-2">
          {settings.channelWebPush ? (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
              <CheckCircle2 size={13} />
              Web Push / FCM Active
            </div>
          ) : (
            <button
              onClick={requestPushPermission}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <Smartphone size={14} />
              Enable Push Notifications
            </button>
          )}
        </div>
      </div>

      {/* 6 Alert Categories Config Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* 1. Rain Alerts */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudRain size={16} className="text-blue-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Rain Alerts</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableRainAlerts}
                onChange={(e) => updateSettings({ enableRainAlerts: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500" />
            </label>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-400 font-mono">
              <span>POP Threshold:</span>
              <span className="text-white font-bold">{settings.rainProbabilityThreshold}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="90"
              step="5"
              disabled={!settings.enableRainAlerts}
              value={settings.rainProbabilityThreshold}
              onChange={(e) => updateSettings({ rainProbabilityThreshold: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
            />
            <span className="text-[10px] text-slate-500 block">
              Triggers when rain probability exceeds {settings.rainProbabilityThreshold}%.
            </span>
          </div>
        </div>

        {/* 2. AQI Alerts */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind size={16} className="text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">AQI Alerts</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableAqiAlerts}
                onChange={(e) => updateSettings({ enableAqiAlerts: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
            </label>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-400 font-mono">
              <span>Category Trigger:</span>
              <span className="text-amber-400 font-bold">{settings.aqiThresholdCategory} (AQI &gt; 100)</span>
            </div>
            <select
              value={settings.aqiThresholdCategory}
              disabled={!settings.enableAqiAlerts}
              onChange={(e) => updateSettings({ aqiThresholdCategory: e.target.value as any })}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200"
            >
              <option value="Moderate">Moderate (AQI 51-100+)</option>
              <option value="Poor">Poor / Unhealthy (AQI 101-200+)</option>
              <option value="Very Poor">Very Poor (AQI 201-300+)</option>
              <option value="Hazardous">Hazardous (AQI 301-500)</option>
            </select>
          </div>
        </div>

        {/* 3. Cyclone Alerts */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio size={16} className="text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Cyclone Alerts</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableCycloneAlerts}
                onChange={(e) => updateSettings({ enableCycloneAlerts: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500" />
            </label>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-400 font-mono">
              <span>Surveillance Radius:</span>
              <span className="text-cyan-400 font-bold">{settings.cycloneRadiusKm} km</span>
            </div>
            <input
              type="range"
              min="200"
              max="1500"
              step="50"
              disabled={!settings.enableCycloneAlerts}
              value={settings.cycloneRadiusKm}
              onChange={(e) => updateSettings({ cycloneRadiusKm: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="text-[10px] text-slate-500 block">
              Notifies for all tropical cyclones within {settings.cycloneRadiusKm} km.
            </span>
          </div>
        </div>

        {/* 4. Earthquake Alerts */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-red-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Earthquake Alerts</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableEarthquakeAlerts}
                onChange={(e) => updateSettings({ enableEarthquakeAlerts: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500" />
            </label>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-400 font-mono">
              <span>Min Magnitude:</span>
              <span className="text-red-400 font-bold">M{settings.earthquakeMinMagnitude.toFixed(1)}+</span>
            </div>
            <input
              type="range"
              min="3.5"
              max="7.0"
              step="0.5"
              disabled={!settings.enableEarthquakeAlerts}
              value={settings.earthquakeMinMagnitude}
              onChange={(e) => updateSettings({ earthquakeMinMagnitude: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-400"
            />
            <span className="text-[10px] text-slate-500 block">
              Triggers for quakes $M\ge{settings.earthquakeMinMagnitude.toFixed(1)}$ & tsunami warnings.
            </span>
          </div>
        </div>

        {/* 5. Eclipse Alerts */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun size={16} className="text-purple-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Eclipse Alerts</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableEclipseAlerts}
                onChange={(e) => updateSettings({ enableEclipseAlerts: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500" />
            </label>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-400 font-mono">
              <span>Advance Notice:</span>
              <span className="text-purple-300 font-bold">{settings.eclipseAdvanceHours} Hours Before</span>
            </div>
            <select
              value={settings.eclipseAdvanceHours}
              disabled={!settings.enableEclipseAlerts}
              onChange={(e) => updateSettings({ eclipseAdvanceHours: Number(e.target.value) })}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200"
            >
              <option value="12">12 Hours Before Totality</option>
              <option value="24">24 Hours Before Totality</option>
              <option value="48">48 Hours Before Totality</option>
              <option value="72">3 Days Before Totality</option>
            </select>
          </div>
        </div>

        {/* 6. Meteor Shower Alerts */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-orange-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Meteor Shower Alerts</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableMeteorShowerAlerts}
                onChange={(e) => updateSettings({ enableMeteorShowerAlerts: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
            </label>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-400 font-mono">
              <span>Min Peak ZHR Rate:</span>
              <span className="text-orange-400 font-bold">{settings.meteorMinZhr} meteors/hr</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="10"
              disabled={!settings.enableMeteorShowerAlerts}
              value={settings.meteorMinZhr}
              onChange={(e) => updateSettings({ meteorMinZhr: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-400"
            />
            <span className="text-[10px] text-slate-500 block">
              Notifies for major showers (Perseids, Geminids, Quadrantids).
            </span>
          </div>
        </div>
      </div>

      {/* Test Alert Simulator Section */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send size={16} className="text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Instant Alert Dispatcher & Notification Simulator
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Fires live toast, in-app notification center & Web Push
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <button
            onClick={() => handleTestTrigger('rain')}
            className="p-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs font-mono font-bold flex flex-col items-center gap-1 transition-all cursor-pointer"
          >
            <CloudRain size={16} />
            <span>Rain Alert</span>
          </button>

          <button
            onClick={() => handleTestTrigger('aqi')}
            className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-mono font-bold flex flex-col items-center gap-1 transition-all cursor-pointer"
          >
            <Wind size={16} />
            <span>AQI Alert</span>
          </button>

          <button
            onClick={() => handleTestTrigger('cyclone')}
            className="p-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold flex flex-col items-center gap-1 transition-all cursor-pointer"
          >
            <Radio size={16} />
            <span>Cyclone Alert</span>
          </button>

          <button
            onClick={() => handleTestTrigger('earthquake')}
            className="p-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-mono font-bold flex flex-col items-center gap-1 transition-all cursor-pointer"
          >
            <Activity size={16} />
            <span>Quake Alert</span>
          </button>

          <button
            onClick={() => handleTestTrigger('eclipse')}
            className="p-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-mono font-bold flex flex-col items-center gap-1 transition-all cursor-pointer"
          >
            <Sun size={16} />
            <span>Eclipse Alert</span>
          </button>

          <button
            onClick={() => handleTestTrigger('meteor_shower')}
            className="p-2.5 rounded-xl border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 text-xs font-mono font-bold flex flex-col items-center gap-1 transition-all cursor-pointer"
          >
            <Flame size={16} />
            <span>Meteor Alert</span>
          </button>
        </div>

        {testFired && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Smart Alert Dispatched & Logged to Firestore. Check Notification Center!
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
