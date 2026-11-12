import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { SkySystem } from './SkySystem';
import { WeatherSystem } from './WeatherSystem';
import { EnvironmentControlTower } from './EnvironmentControlTower';
import { useClimate } from '../../context/ClimateContext';
import { useAtmosphere } from '../../context/AtmosphereContext';
import { WeatherState } from './types';
import { TimeOfDayStr } from '../effects/DynamicSky';

/**
 * Maps the rich AtmosphereContext computed state → ClimateContext WeatherState
 * so the 3D sky/weather system is always driven by real API data in auto-pilot mode.
 */
function mapAtmosphereToWeather(atmosphereState: string): WeatherState {
  switch (atmosphereState) {
    case 'clear_day':
    case 'clear_night':
    case 'golden_hour':
    case 'sunrise':
    case 'sunset':
    case 'dusk':
      return 'sunny';
    case 'partly_cloudy_day':
    case 'cloudy_night':
      return 'cloudy';
    case 'overcast_day':
      return 'overcast';
    case 'light_rain':
    case 'rainy_night':
      return 'light_rain';
    case 'heavy_rain':
      return 'heavy_rain';
    case 'thunderstorm':
    case 'tornado':
    case 'cyclone':
      return 'thunderstorm';
    case 'snow':
    case 'heavy_snow':
    case 'blizzard':
    case 'frost':
      return 'snow';
    case 'hail':
      return 'hail';
    case 'fog':
    case 'sandstorm':
      return 'fog';
    case 'windy':
      return 'windy';
    case 'heatwave':
    case 'cold_wave':
    case 'meteor_shower':
    case 'aurora':
    default:
      return 'sunny';
  }
}

/**
 * Maps the atmosphere state to a timeOfDay hour number for the 3D sky.
 */
function mapAtmosphereToTimeOfDay(atmosphereState: string, weatherData: any): number {
  // If the weather data has a real timestamp, derive the local solar hour
  if (weatherData?.timestamp) {
    const localDate = new Date(weatherData.timestamp * 1000);
    const hour = localDate.getHours() + localDate.getMinutes() / 60;
    return hour;
  }
  // Fallback based on state name
  switch (atmosphereState) {
    case 'sunrise': return 6.5;
    case 'golden_hour': return 7.5;
    case 'clear_day':
    case 'partly_cloudy_day':
    case 'overcast_day':
    case 'light_rain':
    case 'heavy_rain':
    case 'thunderstorm':
    case 'fog':
    case 'windy':
    case 'heatwave':
    case 'hail':
    case 'sandstorm':
      return 13;
    case 'sunset': return 19;
    case 'dusk': return 20;
    case 'clear_night':
    case 'cloudy_night':
    case 'rainy_night':
    case 'aurora':
    case 'meteor_shower':
      return 23;
    default: return 13;
  }
}

/** Inner component that syncs climate from atmosphere when in auto mode */
const AutoClimateSync: React.FC = () => {
  const { isAutoPilot, setWeather, setTimeOfDay } = useClimate();
  const { atmosphereState, weather: weatherData } = useAtmosphere();

  useEffect(() => {
    if (!isAutoPilot) return;
    const mappedWeather = mapAtmosphereToWeather(atmosphereState);
    const mappedTime = mapAtmosphereToTimeOfDay(atmosphereState, weatherData);
    setWeather(mappedWeather);
    setTimeOfDay(mappedTime);
  }, [isAutoPilot, atmosphereState, weatherData, setWeather, setTimeOfDay]);

  return null;
};

export const ClimateBackground: React.FC = React.memo(() => {
  const { timeOfDay, setTimeOfDay, weather, speed } = useClimate();
  const { weather: activeWeather, atmosphereState } = useAtmosphere();

  return (
    <>
      {/* Auto-sync climate from live weather API when not in manual mode */}
      <AutoClimateSync />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 2, 10], fov: 60 }}>
          <Suspense fallback={null}>
            <SkySystem timeOfDay={timeOfDay} speed={speed} setTimeOfDay={setTimeOfDay} weather={weather} />
            <WeatherSystem 
              weather={weather} 
              timeOfDay={timeOfDay} 
              windDeg={activeWeather?.windDeg ?? 90} 
              windSpeed={activeWeather?.windSpeed ?? 5} 
            />
          </Suspense>
        </Canvas>
      </div>
      <EnvironmentControlTower />
    </>
  );
});
