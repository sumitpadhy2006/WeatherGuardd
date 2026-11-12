import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WeatherState } from './types';

interface SkySystemProps {
  timeOfDay: number;
  speed: number;
  setTimeOfDay: (time: number | ((prev: number) => number)) => void;
  weather: WeatherState;
}

export const SkySystem: React.FC<SkySystemProps> = ({ timeOfDay, speed, setTimeOfDay, weather }) => {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  
  // Calculate sun position based on time of day (0 to 24)
  // 6 = sunrise (East), 12 = noon (Zenith), 18 = sunset (West)
  const phi = Math.PI * (timeOfDay / 24 - 0.5); // -PI/2 at 0h, 0 at 12h, PI/2 at 24h
  const sunPosition = new THREE.Vector3(
    Math.sin(phi) * 100,
    Math.cos(phi) * 100,
    Math.cos(phi) * 20
  );

  useFrame((state, delta) => {
    if (speed > 0) {
      setTimeOfDay((prev) => (prev + speed * delta) % 24);
    }
  });

  const isNight = timeOfDay < 5 || timeOfDay > 19;
  const isOvercast = weather === 'overcast' || weather === 'heavy_rain' || weather === 'thunderstorm';

  return (
    <>
      <hemisphereLight 
        args={['#E0F7FA', '#4E342E', isOvercast ? 0.2 : (isNight ? 0.1 : 0.5)]} 
      />
      
      {!isNight && (
        <directionalLight
          ref={sunRef}
          position={sunPosition}
          color="#FFDFB0"
          intensity={isOvercast ? 0.3 : 2.0}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
      )}


      {/* Sky dome and stars removed in favor of 2D DynamicSky */}
      {/* Fog based on weather / time */}
      {weather === 'fog' ? (
        <fog attach="fog" args={['#a0aab5', 5, 100]} />
      ) : weather === 'heavy_rain' || weather === 'thunderstorm' ? (
        <fog attach="fog" args={['#3a4a5a', 10, 200]} />
      ) : timeOfDay >= 6 && timeOfDay < 10 ? (
        <fog attach="fog" args={['#FFE4B5', 30, 800]} /> // Morning mist
      ) : null}
    </>
  );
};
