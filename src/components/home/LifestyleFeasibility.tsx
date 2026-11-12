import React from 'react';
import { CurrentWeatherPayload } from '../../types';
import { Activity, Sun, Umbrella, HeartPulse, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LifestyleFeasibilityProps {
  weather: CurrentWeatherPayload;
}

export const LifestyleFeasibility: React.FC<LifestyleFeasibilityProps> = ({ weather }) => {
  // Logic checks
  const aqiLimit = 100;
  const uvLimit = 6;
  const rainViolated = weather.hourly?.[0]?.pop > 0.4;
  const uvViolated = weather.uvIndex >= uvLimit && weather.isDay;
  const aqiViolated = weather.airQuality.aqi > aqiLimit;
  
  // Heat index calculation approximation
  const heatIndexViolated = weather.temp > 32 && weather.humidity > 60;

  const checks = [
    {
      id: 'fitness',
      label: 'Outdoor Fitness',
      icon: <Activity size={16} />,
      status: aqiViolated || heatIndexViolated ? 'critical' : rainViolated ? 'warning' : 'optimal',
      reason: aqiViolated ? `Poor Air Quality (${weather.airQuality.aqi} AQI)` : heatIndexViolated ? 'High heat index' : 'Good conditions',
    },
    {
      id: 'commuting',
      label: 'Commuting & Transit',
      icon: <Umbrella size={16} />,
      status: rainViolated ? 'warning' : 'optimal',
      reason: rainViolated ? 'Bring an umbrella' : 'Clear commute',
    },
    {
      id: 'sun',
      label: 'Sun Exposure',
      icon: <Sun size={16} />,
      status: uvViolated ? 'warning' : 'optimal',
      reason: uvViolated ? `High UV (${weather.uvIndex}) - SPF needed` : 'Safe exposure',
    },
    {
      id: 'health',
      label: 'Respiratory Health',
      icon: <HeartPulse size={16} />,
      status: aqiViolated ? 'warning' : 'optimal',
      reason: aqiViolated ? 'Sensitive groups should stay indoors' : 'Good air quality',
    },
  ];

  return (
    <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-6 w-full shadow-2xl overflow-hidden relative group h-full">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
          <Activity size={20} />
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight">
          Lifestyle Feasibility
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
