import React from 'react';
import { CurrentWeatherPayload } from '../../types';
import { Shield, Plane, Construction, Truck, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface OperationalFeasibilityProps {
  weather: CurrentWeatherPayload;
}

export const OperationalFeasibility: React.FC<OperationalFeasibilityProps> = ({ weather }) => {
  // Logic checks
  const windLimit = 35; // km/h
  const tempHighLimit = 38; // C
  const tempLowLimit = -5; // C
  const visibilityLimit = 5; // km
  
  const windViolated = weather.windSpeed > windLimit || (weather.windGust && weather.windGust > windLimit);
  const tempViolated = weather.temp > tempHighLimit || weather.temp < tempLowLimit;
  const visViolated = weather.visibilityKm < visibilityLimit;
  const rainViolated = weather.hourly?.[0]?.pop > 0.6;

  const checks = [
    {
      id: 'drone',
      label: 'Drone & UAV Ops',
      icon: <Plane size={16} />,
      status: windViolated || rainViolated ? 'critical' : 'optimal',
      reason: windViolated ? `High winds (${weather.windSpeed}km/h)` : rainViolated ? 'Precipitation risk' : 'Clear conditions',
    },
    {
      id: 'construction',
      label: 'Heavy Machinery & Crane',
      icon: <Construction size={16} />,
      status: windViolated || tempViolated ? 'critical' : 'optimal',
      reason: windViolated ? 'Wind exceeds safety limit' : tempViolated ? 'Extreme temperature warning' : 'Within safety margins',
    },
    {
      id: 'aviation',
      label: 'Aviation VFR',
      icon: <Shield size={16} />,
      status: visViolated ? 'critical' : 'optimal',
      reason: visViolated ? `Poor visibility (${weather.visibilityKm}km)` : 'Clear horizon',
    },
    {
      id: 'logistics',
      label: 'Outdoor Logistics',
      icon: <Truck size={16} />,
      status: rainViolated ? 'warning' : 'optimal',
      reason: rainViolated ? 'Slippery surfaces expected' : 'Optimal transit conditions',
    },
  ];

  return (
    <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-6 w-full shadow-2xl overflow-hidden relative group h-full">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
          <Shield size={20} />
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight">
          Operational Feasibility
        </h3>
      </div>

      <div className="space-y-3">
        {checks.map((check, idx) => (
          <motion.div
            key={check.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`flex items-center justify-between p-3 rounded-xl border ${
              check.status === 'optimal' 
                ? 'bg-emerald-500/10 border-emerald-500/20' 
                : check.status === 'warning'
                ? 'bg-amber-500/10 border-amber-500/20'
                : 'bg-rose-500/10 border-rose-500/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={
                check.status === 'optimal' ? 'text-emerald-400' :
                check.status === 'warning' ? 'text-amber-400' : 'text-rose-400'
              }>
                {check.icon}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-200">{check.label}</div>
                <div className="text-xs text-slate-400">{check.reason}</div>
              </div>
            </div>
            <div>
              {check.status === 'optimal' && <CheckCircle size={18} className="text-emerald-500" />}
              {check.status === 'warning' && <AlertTriangle size={18} className="text-amber-500" />}
              {check.status === 'critical' && <XCircle size={18} className="text-rose-500" />}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
