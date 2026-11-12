import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WeatherState } from '../components/climate3d/types';

interface ClimateContextType {
  timeOfDay: number;
  setTimeOfDay: (time: number) => void;
  weather: WeatherState;
  setWeather: (weather: WeatherState) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  isAutoPilot: boolean;
  setIsAutoPilot: (auto: boolean) => void;
  isControlTowerOpen: boolean;
  setControlTowerOpen: (open: boolean) => void;
}

const ClimateContext = createContext<ClimateContextType | undefined>(undefined);

export const ClimateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [timeOfDay, setTimeOfDay] = useState(12);
  const [weather, setWeather] = useState<WeatherState>('sunny');
  const [speed, setSpeed] = useState(0); // 0 = static, >0 = animated cycle (manual demo only)
  const [isAutoPilot, setIsAutoPilot] = useState(true); // true = API-driven, false = manual
  const [isControlTowerOpen, setControlTowerOpen] = useState(false);

  return (
    <ClimateContext.Provider 
      value={{ 
        timeOfDay, setTimeOfDay, 
        weather, setWeather, 
        speed, setSpeed,
        isAutoPilot, setIsAutoPilot,
        isControlTowerOpen, setControlTowerOpen 
      }}
    >
      {children}
    </ClimateContext.Provider>
  );
};

export const useClimate = () => {
  const context = useContext(ClimateContext);
  if (!context) throw new Error('useClimate must be used within a ClimateProvider');
  return context;
};
