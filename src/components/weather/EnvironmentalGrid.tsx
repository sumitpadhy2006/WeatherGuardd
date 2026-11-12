import React, { useState } from 'react';
import { CurrentWeatherPayload, UserPreferences } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { AQISpeedometer } from '../common/AQISpeedometer';
import { WindCompass } from '../common/WindCompass';
import {
  formatTemperatureWithUnit,
  formatWindSpeed,
  formatPressure,
} from '../../utils/formatters';
import {
  getWindCardinal,
  getBeaufortScale,
  calculateSunBurnTimeMinutes,
} from '../../utils/calculations';
import {
  Wind,
  Sun,
  Droplets,
  Gauge,
  Eye,
  CloudRain,
  Thermometer,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Compass,
  ShieldCheck,
  ChevronRight,
  Info,
  Timer,
} from 'lucide-react';

interface EnvironmentalGridProps {
  weather: CurrentWeatherPayload;
  preferences: UserPreferences;
}

export const EnvironmentalGrid: React.FC<EnvironmentalGridProps> = ({
  weather,
  preferences,
}) => {
  const [activeModalMetric, setActiveModalMetric] = useState<string | null>(null);

  const windCardinal = getWindCardinal(weather.windDeg);
  const beaufort = getBeaufortScale(weather.windSpeed);
  const burnTime = calculateSunBurnTimeMinutes(weather.uvIndex, 2);

  // AQI Spectrum categorization
  const aqi = weather.airQuality.aqi;
  let aqiCategory = weather.airQuality.category;
  let aqiBadgeVariant: 'emerald' | 'cyan' | 'amber' | 'crimson' = 'emerald';
  let aqiGradient = 'from-emerald-400 to-emerald-500';

  if (aqi > 150) {
    aqiBadgeVariant = 'crimson';
    aqiGradient = 'from-red-500 to-purple-600';
  } else if (aqi > 100) {
    aqiBadgeVariant = 'amber';
    aqiGradient = 'from-amber-400 to-red-500';
  } else if (aqi > 50) {
    aqiBadgeVariant = 'cyan';
    aqiGradient = 'from-emerald-400 to-amber-400';
  }
  const aqiFillPercent = Math.min(100, Math.max(5, (aqi / 300) * 100));

  // UV Index Level
  const uv = weather.uvIndex;
  let uvLevel = 'Low';
  let uvBadgeVariant: 'emerald' | 'cyan' | 'amber' | 'crimson' = 'emerald';
  if (uv >= 11) {
    uvLevel = 'Extreme';
    uvBadgeVariant = 'crimson';
  } else if (uv >= 8) {
    uvLevel = 'Very High';
    uvBadgeVariant = 'crimson';
  } else if (uv >= 6) {
    uvLevel = 'High';
    uvBadgeVariant = 'amber';
  } else if (uv >= 3) {
    uvLevel = 'Moderate';
    uvBadgeVariant = 'cyan';
  }
  const uvFillPercent = Math.min(100, Math.max(5, (uv / 12) * 100));

  // Humidity Comfort classification
  let humidityComfort = 'Comfortable';
  if (weather.humidity < 30) humidityComfort = 'Dry';
  else if (weather.humidity > 70) humidityComfort = 'Humid & Muggy';
  else if (weather.humidity > 60) humidityComfort = 'Moderate';

  // Visibility Clarity
  let visibilityClarity = 'Exceptional';
  if (weather.visibilityKm < 2) visibilityClarity = 'Dense Fog';
  else if (weather.visibilityKm < 5) visibilityClarity = 'Moderate Fog';
  else if (weather.visibilityKm < 10) visibilityClarity = 'Light Haze';

  // Wind Unit and Numbers
  const speedUnit = preferences?.speedUnit || (preferences?.units === 'imperial' ? 'mph' : 'km/h');
  let numericWindSpeed = Math.round(weather.windSpeed);
  let numericWindGust = weather.windGust ? Math.round(weather.windGust) : Math.round(weather.windSpeed * 1.45);

  if (speedUnit === 'mph') {
    numericWindSpeed = Math.round(weather.windSpeed * 0.621371);
    numericWindGust = Math.round((weather.windGust || weather.windSpeed * 1.45) * 0.621371);
  } else if (speedUnit === 'm/s') {
    numericWindSpeed = Math.round((weather.windSpeed / 3.6) * 10) / 10;
    numericWindGust = Math.round(((weather.windGust || weather.windSpeed * 1.45) / 3.6) * 10) / 10;
  } else if (speedUnit === 'knots') {
    numericWindSpeed = Math.round(weather.windSpeed * 0.539957);
    numericWindGust = Math.round((weather.windGust || weather.windSpeed * 1.45) * 0.539957);
  }

  const windSpeedStr = `${numericWindSpeed} ${speedUnit}`;
  const windGustStr = `${numericWindGust} ${speedUnit}`;
  const windDirectionStr = `${weather.windDeg}° ${windCardinal}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-cyan-400" />
          <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-200">
            Environmental Diagnostics & Metrics
          </h2>
        </div>
        <span className="text-xs font-mono text-slate-400">8 Real-Time Indices</span>
      </div>

      {/* 2x4 Dense Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* ======================================================== */}
        {/* TILE 1: AIR QUALITY INDEX (SPEEDOMETER GAUGE)            */}
        {/* ======================================================== */}
        <button
          onClick={() => setActiveModalMetric('aqi')}
          className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900/80 border border-white/10 hover:border-emerald-500/40 backdrop-blur-2xl transition-all text-left flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex flex-col items-start gap-1 w-full">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 w-full min-w-0">
              <Wind size={14} className="text-emerald-400 shrink-0" />
              <span className="font-semibold text-slate-300 uppercase tracking-wider truncate">AQI</span>
            </div>
            <Badge variant={aqiBadgeVariant} size="sm">
              {aqiCategory}
            </Badge>
          </div>

          {/* Speedometer Dial Container */}
          <div className="my-1 w-full flex items-center justify-center">
            <AQISpeedometer aqi={aqi} showCategory={false} />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/5 pt-1.5 w-full">
            <span>PM2.5: <strong className="text-slate-200">{weather.airQuality.pm2_5}</strong></span>
            <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">Details →</span>
          </div>
        </button>

        {/* ======================================================== */}
        {/* TILE 2: UV INDEX & RADIATION                             */}
        {/* ======================================================== */}
        <button
          onClick={() => setActiveModalMetric('uv')}
          className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900/80 border border-white/10 hover:border-amber-500/40 backdrop-blur-2xl transition-all text-left flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex flex-col items-start gap-1 w-full">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 w-full min-w-0">
              <Sun size={14} className="text-amber-400 shrink-0" />
              <span className="font-semibold text-slate-300 uppercase tracking-wider truncate">UV INDEX</span>
            </div>
            <Badge variant={uvBadgeVariant} size="sm">
              {uvLevel}
            </Badge>
          </div>

          <div className="my-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-white">{uv}</span>
              <span className="text-xs font-mono text-slate-400">/ 12</span>
            </div>
            {/* UV Spectrum Bar */}
            <div className="w-full h-1.5 bg-slate-950/80 rounded-full overflow-hidden mt-1.5 relative border border-white/5">
              <div
                style={{ width: `${uvFillPercent}%` }}
                className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-purple-500 rounded-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/5 pt-1.5 w-full">
            <span>Burn Time: <strong className="text-amber-300">~{burnTime}m</strong></span>
            <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">Details →</span>
          </div>
        </button>

        {/* ======================================================== */}
        {/* TILE 3: WIND VECTOR & COMPASS (EXACT APPLE WEATHER BOX)  */}
        {/* ======================================================== */}
        <button
          onClick={() => setActiveModalMetric('wind')}
          className="col-span-2 sm:col-span-2 lg:col-span-2 p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900/80 border border-white/10 hover:border-cyan-500/40 backdrop-blur-2xl transition-all text-left flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs text-slate-400 w-full min-w-0">
            <Wind size={15} className="text-slate-400 shrink-0" />
            <span className="font-semibold uppercase tracking-wider text-slate-400 truncate">WIND</span>
          </div>

          {/* Main Body: Left 3 rows + Right Compass */}
          <div className="my-auto grid grid-cols-1 sm:grid-cols-12 gap-3 items-center py-1 w-full">
            {/* Left Data List */}
            <div className="sm:col-span-7 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200">Wind</span>
                <span className="text-sm font-medium font-mono text-slate-200">{windSpeedStr}</span>
              </div>
              <div className="border-b border-white/10" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200">Gusts</span>
                <span className="text-sm font-medium font-mono text-slate-200">{windGustStr}</span>
              </div>
              <div className="border-b border-white/10" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200">Direction</span>
                <span className="text-sm font-medium font-mono text-slate-200">{windDirectionStr}</span>
              </div>
            </div>

            {/* Right Compass Dial */}
            <div className="sm:col-span-5 flex items-center justify-center">
              <WindCompass
                speed={numericWindSpeed}
                speedUnit={speedUnit}
                windDeg={weather.windDeg}
                size={120}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/5 pt-1.5 w-full">
            <span>Scale: <strong className="text-slate-200">{beaufort.label}</strong></span>
            <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">Details →</span>
          </div>
        </button>

        {/* ======================================================== */}
        {/* TILE 4: HUMIDITY & DEW POINT                             */}
        {/* ======================================================== */}
        <button
          onClick={() => setActiveModalMetric('humidity')}
          className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900/80 border border-white/10 hover:border-blue-500/40 backdrop-blur-2xl transition-all text-left flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex flex-col items-start gap-1 w-full">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 w-full min-w-0">
              <Droplets size={14} className="text-blue-400 shrink-0" />
              <span className="font-semibold text-slate-300 uppercase tracking-wider truncate">HUMIDITY</span>
            </div>
            <span className="text-[11px] text-blue-300 font-mono">
              {humidityComfort}
            </span>
          </div>

          <div className="my-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-white">{weather.humidity}</span>
              <span className="text-xs font-mono text-blue-400 font-bold">%</span>
            </div>
            {/* Humidity Moisture Bar */}
            <div className="w-full h-1.5 bg-slate-950/80 rounded-full overflow-hidden mt-1.5 relative border border-white/5">
              <div
                style={{ width: `${weather.humidity}%` }}
                className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/5 pt-1.5 w-full">
            <span>Dew Point: <strong className="text-slate-200">{formatTemperatureWithUnit(weather.dewPoint, preferences)}</strong></span>
            <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">Details →</span>
          </div>
        </button>

        {/* ======================================================== */}
        {/* TILE 5: BAROMETRIC PRESSURE                              */}
        {/* ======================================================== */}
        <button
          onClick={() => setActiveModalMetric('pressure')}
          className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900/80 border border-white/10 hover:border-amber-500/40 backdrop-blur-2xl transition-all text-left flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex flex-col items-start gap-1 w-full">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 w-full min-w-0">
              <Gauge size={14} className="text-amber-400 shrink-0" />
              <span className="font-semibold text-slate-300 uppercase tracking-wider truncate">BAROMETER</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono">
              {weather.pressureTendency === 'rising' ? (
                <span className="text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp size={12} /> Rising
                </span>
              ) : weather.pressureTendency === 'falling' ? (
                <span className="text-amber-400 flex items-center gap-0.5">
                  <TrendingDown size={12} /> Falling
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-0.5">
                  <Minus size={12} /> Steady
                </span>
              )}
            </div>
          </div>

          <div className="my-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-white">
                {formatPressure(weather.pressure, preferences)}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono block mt-1">
              Standard Atmospheric Pressure
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/5 pt-1.5 w-full">
            <span>Trend: <strong className="text-slate-200">{weather.pressureTendency || 'Steady'}</strong></span>
            <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">Details →</span>
          </div>
        </button>

        {/* ======================================================== */}
        {/* TILE 6: VISIBILITY & CLARITY                             */}
        {/* ======================================================== */}
        <button
          onClick={() => setActiveModalMetric('visibility')}
          className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900/80 border border-white/10 hover:border-purple-500/40 backdrop-blur-2xl transition-all text-left flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex flex-col items-start gap-1 w-full">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 w-full min-w-0">
              <Eye size={14} className="text-purple-400 shrink-0" />
              <span className="font-semibold text-slate-300 uppercase tracking-wider truncate">VISIBILITY</span>
            </div>
            <span className="text-[11px] text-purple-300 font-mono">
              {visibilityClarity}
            </span>
          </div>

          <div className="my-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-white">{weather.visibilityKm}</span>
              <span className="text-xs font-mono text-slate-400">km</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono block mt-1">
              Clear horizon threshold
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/5 pt-1.5 w-full">
            <span>Clarity: <strong className="text-slate-200">{visibilityClarity}</strong></span>
            <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">Details →</span>
          </div>
        </button>

        {/* ======================================================== */}
        {/* TILE 7: PRECIPITATION INTENSITY                          */}
        {/* ======================================================== */}
        <button
          onClick={() => setActiveModalMetric('rain')}
          className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900/80 border border-white/10 hover:border-cyan-500/40 backdrop-blur-2xl transition-all text-left flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex flex-col items-start gap-1 w-full">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 w-full min-w-0">
              <CloudRain size={14} className="text-cyan-400 shrink-0" />
              <span className="font-semibold text-slate-300 uppercase tracking-wider truncate">PRECIPITATION</span>
            </div>
            <span className="text-[11px] text-cyan-300 font-mono">
              {weather.hourly[0]?.pop ? `${Math.round(weather.hourly[0].pop * 100)}% Chance` : '0%'}
            </span>
          </div>

          <div className="my-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-white">
                {weather.hourly[0]?.rainMm ? `${weather.hourly[0].rainMm}` : '0.0'}
              </span>
              <span className="text-xs font-mono text-slate-400">mm / hr</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono block mt-1">
              24h Total: {weather.daily[0]?.rainMm || 0} mm
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/5 pt-1.5 w-full">
            <span>Cloud Deck: <strong className="text-slate-200">{weather.cloudCoverPercent}%</strong></span>
            <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">Details →</span>
          </div>
        </button>

        {/* ======================================================== */}
        {/* TILE 8: FEELS LIKE & THERMAL COMFORT                     */}
        {/* ======================================================== */}
        <button
          onClick={() => setActiveModalMetric('thermal')}
          className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900/80 border border-white/10 hover:border-rose-500/40 backdrop-blur-2xl transition-all text-left flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex flex-col items-start gap-1 w-full">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 w-full min-w-0">
              <Thermometer size={14} className="text-rose-400 shrink-0" />
              <span className="font-semibold text-slate-300 uppercase tracking-wider truncate">FEELS LIKE</span>
            </div>
            <span className="text-[11px] text-rose-300 font-mono">
              Apparent Temp
            </span>
          </div>

          <div className="my-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-white">
                {formatTemperatureWithUnit(weather.feelsLike, preferences)}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono block mt-1">
              Actual: {formatTemperatureWithUnit(weather.temp, preferences)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/5 pt-1.5 w-full">
            <span>Delta: <strong className="text-slate-200">{Math.round((weather.feelsLike - weather.temp) * 10) / 10}°</strong></span>
            <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">Details →</span>
          </div>
        </button>
      </div>

      {/* Progressive Disclosure Modal for Deep Metric Analytics */}
      {activeModalMetric && (
        <Modal
          isOpen={!!activeModalMetric}
          onClose={() => setActiveModalMetric(null)}
          title={`Diagnostic: ${
            activeModalMetric === 'aqi'
              ? 'Air Quality & Pollutant Chemistry'
              : activeModalMetric === 'uv'
              ? 'UV Radiation & Solar Irradiance'
              : activeModalMetric === 'wind'
              ? 'Wind Vector Dynamics & Turbulence'
              : activeModalMetric === 'humidity'
              ? 'Psychrometric Moisture & Dew Point'
              : activeModalMetric === 'pressure'
              ? 'Barometric Tendency & Altimetry'
              : activeModalMetric === 'visibility'
              ? 'Optical Clarity & Atmospheric Extinction'
              : activeModalMetric === 'rain'
              ? 'Precipitation Kinetics & Cloud Ceiling'
              : 'Thermal Apparent Comfort Model'
          }`}
          maxWidth="xl"
        >
          <div className="space-y-4 text-slate-200">
            {activeModalMetric === 'aqi' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 flex flex-col items-center justify-center space-y-3">
                  <div className="w-full flex items-center justify-between">
                    <span className="text-xs text-slate-400 uppercase font-mono">Real-Time AQI Gauge</span>
                    <Badge variant={aqiBadgeVariant} size="sm">
                      {weather.airQuality.category} ({weather.airQuality.aqi})
                    </Badge>
                  </div>
                  <div className="py-2 w-full flex justify-center">
                    <AQISpeedometer aqi={aqi} showCategory={true} />
                  </div>
                  <p className="text-xs text-slate-300 text-center leading-relaxed max-w-sm">
                    {weather.airQuality.healthRecommendation}
                  </p>
                </div>

                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 pt-1">
                  Chemical Pollutant Concentrations
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono">
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-white/10">
                    <span className="text-[11px] text-slate-400 block">PM2.5</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">{weather.airQuality.pm2_5} µg/m³</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-white/10">
                    <span className="text-[11px] text-slate-400 block">PM10</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">{weather.airQuality.pm10} µg/m³</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-white/10">
                    <span className="text-[11px] text-slate-400 block">O₃ Ozone</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">{weather.airQuality.o3} µg/m³</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-white/10">
                    <span className="text-[11px] text-slate-400 block">NO₂</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">{weather.airQuality.no2} µg/m³</span>
                  </div>
                </div>
              </div>
            )}

            {activeModalMetric === 'uv' && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Solar UV Index</span>
                    <span className="text-2xl font-bold font-mono text-amber-300 mt-1 block">
                      {weather.uvIndex} / 12 ({uvLevel})
                    </span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                      <Timer size={12} className="text-amber-400" />
                      Fair Skin Burn Time
                    </span>
                    <span className="text-base font-bold text-amber-200 mt-1 block">
                      ~{burnTime} minutes
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/40 border border-white/10 text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-amber-400 block mb-1">Photoprotection Recommendation:</span>
                  {weather.uvIndex >= 6
                    ? 'High solar UV radiation detected. Broad-spectrum SPF 30+, UV400 sunglasses, and protective headwear strongly advised.'
                    : 'Low-to-moderate solar irradiance. Standard outdoor exposure requires minimal photoprotection.'}
                </div>
              </div>
            )}

            {activeModalMetric === 'wind' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 flex flex-col items-center justify-center space-y-3">
                  <div className="w-full flex items-center justify-between">
                    <span className="text-xs text-slate-400 uppercase font-mono">Live Compass & Vector</span>
                    <span className="text-xs font-mono font-bold text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/20">
                      {windDirectionStr}
                    </span>
                  </div>

                  <div className="py-2">
                    <WindCompass
                      speed={numericWindSpeed}
                      speedUnit={speedUnit}
                      windDeg={weather.windDeg}
                      size={150}
                    />
                  </div>

                  <div className="w-full grid grid-cols-2 gap-2 text-center pt-2 border-t border-white/10 font-mono text-xs">
                    <div className="p-2 rounded-lg bg-slate-900/60">
                      <span className="text-slate-400 block text-[11px]">Sustained Speed</span>
                      <span className="text-white font-bold">{windSpeedStr}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/60">
                      <span className="text-slate-400 block text-[11px]">Peak Gusts</span>
                      <span className="text-white font-bold">{windGustStr}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/40 border border-white/10 text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-cyan-400 block mb-1">Meteorological Assessment:</span>
                  Atmospheric flow originating at azimuth {weather.windDeg}° ({windCardinal}). Current wind force corresponds to Beaufort scale <strong>{beaufort.label}</strong> with low-level boundary turbulence.
                </div>
              </div>
            )}

            {activeModalMetric === 'humidity' && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Relative Humidity</span>
                    <span className="text-2xl font-bold font-mono text-blue-300 mt-1 block">
                      {weather.humidity}%
                    </span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs text-slate-400 block">Dew Point</span>
                    <span className="text-base font-bold text-slate-200 mt-1 block">
                      {formatTemperatureWithUnit(weather.dewPoint, preferences)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 p-3 rounded-xl bg-slate-950/40 border border-white/10 leading-relaxed">
                  Dew point indicates moisture saturation. When air temperature cools to{' '}
                  {formatTemperatureWithUnit(weather.dewPoint, preferences)}, relative humidity reaches 100% and condensation occurs.
                </p>
              </div>
            )}

            {activeModalMetric === 'pressure' && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Sea-Level Pressure</span>
                    <span className="text-2xl font-bold font-mono text-amber-300 mt-1 block">
                      {formatPressure(weather.pressure, preferences)}
                    </span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs text-slate-400 block">Barometric Tendency</span>
                    <span className="text-sm font-bold text-slate-200 mt-1 block capitalize">
                      {weather.pressureTendency || 'Steady'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 p-3 rounded-xl bg-slate-950/40 border border-white/10 leading-relaxed">
                  Rising pressure typically signals stable anti-cyclonic weather and clearing skies. Falling pressure signals cyclonic convergence and potential precipitation.
                </p>
              </div>
            )}

            {activeModalMetric === 'visibility' && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Surface Visibility</span>
                    <span className="text-2xl font-bold font-mono text-purple-300 mt-1 block">
                      {weather.visibilityKm} km
                    </span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs text-slate-400 block">Optical Clarity</span>
                    <span className="text-sm font-bold text-slate-200 mt-1 block">
                      {visibilityClarity}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 p-3 rounded-xl bg-slate-950/40 border border-white/10 leading-relaxed">
                  Optical transmittance across horizontal line-of-sight. Clear visibility allows unhindered aviation visual flight rules (VFR) and unobstructed landscape photography.
                </p>
              </div>
            )}

            {activeModalMetric === 'rain' && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Precipitation Probability</span>
                    <span className="text-2xl font-bold font-mono text-cyan-300 mt-1 block">
                      {weather.hourly[0]?.pop ? `${Math.round(weather.hourly[0].pop * 100)}%` : '0%'}
                    </span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs text-slate-400 block">Total Cloud Cover</span>
                    <span className="text-sm font-bold text-slate-200 mt-1 block">
                      {weather.cloudCoverPercent}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeModalMetric === 'thermal' && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Apparent Thermal Index</span>
                    <span className="text-2xl font-bold font-mono text-rose-300 mt-1 block">
                      {formatTemperatureWithUnit(weather.feelsLike, preferences)}
                    </span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs text-slate-400 block">Dry Bulb Temperature</span>
                    <span className="text-sm font-bold text-slate-200 mt-1 block">
                      {formatTemperatureWithUnit(weather.temp, preferences)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 p-3 rounded-xl bg-slate-950/40 border border-white/10 leading-relaxed">
                  Calculated using psychrometric vapor pressure, wind convective chill, and relative humidity to reflect human skin physiological thermal perception.
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
