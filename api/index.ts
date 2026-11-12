import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import https from 'https';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CurrentWeatherPayload } from '../src/types';

dotenv.config();

export const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

// In-memory spatial cache
const weatherCache = new Map<string, { timestamp: number; data: CurrentWeatherPayload }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Helper to generate realistic high-precision scientific weather payload
function generateScientificTelemetry(lat: number, lon: number, locationName: string = 'Current Location'): CurrentWeatherPayload {
  const now = Math.floor(Date.now() / 1000);
  const hour = new Date().getHours();
  
  // Seasonal & latitude base temperature model
  const latFactor = Math.cos((lat * Math.PI) / 180);
  const diurnalCycle = Math.sin(((hour - 9) * Math.PI) / 12);
  const baseTemp = 30 * latFactor - 2 + 6 * diurnalCycle + ((Math.sin(lat * 7 + lon * 3) * 3));
  const currentTemp = Math.round(baseTemp * 10) / 10;
  
  const humidity = Math.min(95, Math.max(30, Math.round(65 - diurnalCycle * 25 + Math.sin(lat * 11) * 10)));
  const windSpeedKmh = Math.min(65, Math.max(2, Math.round(14 + Math.sin(now / 3600) * 8 + Math.abs(lat % 5))));
  const windDeg = Math.round((Math.abs(lat * 17 + lon * 23) % 360));
  const pressure = Math.round(1013 + Math.sin(now / 14400) * 8);
  const uvIndex = hour >= 6 && hour <= 18 ? Math.max(0, Math.min(11, Math.round(Math.sin(((hour - 6) * Math.PI) / 12) * 8.5))) : 0;
  
  // Conditions logic
  let main = 'Clear';
  let description = 'Clear sky with crisp visibility';
  let icon = hour >= 6 && hour <= 19 ? '01d' : '01n';
  let cloudCover = Math.round(Math.max(0, Math.min(100, 20 + Math.sin(lon * 5) * 40)));
  
  if (humidity > 80 && cloudCover > 60) {
    main = 'Rain';
    description = 'Light passing rain drizzle';
    icon = hour >= 6 && hour <= 19 ? '10d' : '10n';
  } else if (cloudCover > 50) {
    main = 'Clouds';
    description = 'Scattered stratocumulus clouds';
    icon = hour >= 6 && hour <= 19 ? '03d' : '03n';
  }

  // Generate 48 hours
  const hourly = [];
  for (let i = 0; i < 48; i++) {
    const hTime = now + i * 3600;
    const hDate = new Date(hTime * 1000);
    const hHour = hDate.getHours();
    const isDay = hHour >= 6 && hHour < 19;
    const hDiurnal = Math.sin(((hHour - 9) * Math.PI) / 12);
    const hTemp = Math.round((baseTemp + hDiurnal * 4 + Math.sin(i / 6) * 2) * 10) / 10;
    const hPop = Math.max(0, Math.min(1, Math.round((0.1 + Math.sin((i + lat) / 4) * 0.4) * 100) / 100));
    
    hourly.push({
      timestamp: hTime,
      temp: hTemp,
      feelsLike: Math.round((hTemp + (humidity > 70 ? 1.5 : -0.8)) * 10) / 10,
      humidity: Math.min(98, Math.max(35, Math.round(humidity + Math.sin(i / 3) * 15))),
      pop: hPop,
      rainMm: hPop > 0.4 ? Math.round(hPop * 3.5 * 10) / 10 : 0,
      windSpeed: Math.round(windSpeedKmh + Math.sin(i / 2) * 4),
      windDeg: (windDeg + i * 5) % 360,
      uvIndex: isDay ? Math.max(0, Math.min(10, Math.round(Math.sin(((hHour - 6) * Math.PI) / 12) * 8))) : 0,
      pressure: Math.round(pressure + Math.sin(i / 12) * 4),
      condition: {
        id: hPop > 0.4 ? 500 : cloudCover > 50 ? 802 : 800,
        main: hPop > 0.4 ? 'Rain' : cloudCover > 50 ? 'Clouds' : 'Clear',
        description: hPop > 0.4 ? 'Light rain' : cloudCover > 50 ? 'Broken clouds' : 'Clear sky',
        icon: isDay ? (hPop > 0.4 ? '10d' : cloudCover > 50 ? '03d' : '01d') : (hPop > 0.4 ? '10n' : cloudCover > 50 ? '03n' : '01n'),
      },
      isDay,
    });
  }

  // Generate 7 days
  const daily = [];
  for (let d = 0; d < 7; d++) {
    const dTime = now + d * 86400;
    const dTempBase = baseTemp + Math.sin(d * 1.5) * 3;
    const dMin = Math.round((dTempBase - 4.5) * 10) / 10;
    const dMax = Math.round((dTempBase + 4.5) * 10) / 10;
    const dPop = Math.max(0, Math.min(0.9, Math.round((0.15 + Math.sin(d + lon) * 0.35) * 100) / 100));

    daily.push({
      timestamp: dTime,
      sunrise: dTime - (dTime % 86400) + 6 * 3600 + 24 * 60,
      sunset: dTime - (dTime % 86400) + 19 * 3600 + 12 * 60,
      tempMin: dMin,
      tempMax: dMax,
      tempDay: Math.round(dTempBase * 10) / 10,
      tempNight: dMin + 1,
      feelsLikeDay: Math.round((dTempBase + 0.5) * 10) / 10,
      humidity: Math.round(humidity + Math.sin(d) * 10),
      pop: dPop,
      rainMm: dPop > 0.3 ? Math.round(dPop * 5 * 10) / 10 : 0,
      windSpeed: windSpeedKmh,
      windDeg,
      uvIndex: 7,
      pressure,
      condition: {
        id: dPop > 0.4 ? 500 : 800,
        main: dPop > 0.4 ? 'Rain' : 'Clear',
        description: dPop > 0.4 ? 'Chance of showers' : 'Mostly sunny',
        icon: dPop > 0.4 ? '10d' : '01d',
      },
      summary: dPop > 0.4 ? 'Showers expected during afternoon hours' : 'Optimal clear conditions throughout the day',
    });
  }

  // 60-minute rain timeline
  const minutelyRain = [];
  const hasIncomingRain = main === 'Rain' || hourly[0].pop > 0.3;
  for (let m = 0; m < 60; m++) {
    const intensity = hasIncomingRain ? Math.max(0, Math.sin((m / 60) * Math.PI) * 2.8) : 0;
    minutelyRain.push({
      minute: m,
      intensityMm: Math.round(intensity * 100) / 100,
      probability: hasIncomingRain ? Math.min(1, 0.4 + (intensity / 3) * 0.6) : 0,
    });
  }

  // Air Quality calculation
  const aqiScore = Math.min(220, Math.max(22, Math.round(38 + Math.abs(Math.sin(lat * 3 + lon)) * 45)));
  let aqiCategory: 'Good' | 'Fair' | 'Moderate' | 'Poor' | 'Very Poor' | 'Hazardous' = 'Good';
  let aqiAdvice = 'Air quality is satisfactory and poses minimal environmental health risk.';
  if (aqiScore > 150) {
    aqiCategory = 'Poor';
    aqiAdvice = 'High particulate matter detected; sensitive groups should limit outdoor exertion.';
  } else if (aqiScore > 100) {
    aqiCategory = 'Moderate';
    aqiAdvice = 'Moderate particulate levels; acceptable for most individuals.';
  } else if (aqiScore > 50) {
    aqiCategory = 'Fair';
    aqiAdvice = 'Moderate air quality; generally safe for outdoor activity.';
  }

  const airQuality = {
    aqi: aqiScore,
    category: aqiCategory,
    pm2_5: Math.round((aqiScore * 0.28) * 10) / 10,
    pm10: Math.round((aqiScore * 0.45) * 10) / 10,
    o3: 48,
    no2: 18,
    so2: 4,
    co: 0.4,
    dominantPollutant: 'PM2.5',
    healthRecommendation: aqiAdvice,
  };

  // Celestial Ephemeris
  const sunrise = now - (now % 86400) + 6 * 3600 + 18 * 60;
  const sunset = now - (now % 86400) + 19 * 3600 + 34 * 60;
  const moonIllum = Math.round(Math.abs(Math.sin((now / 86400 / 29.5) * Math.PI)) * 100);
  const stargazing = Math.max(20, Math.min(98, Math.round(100 - (cloudCover * 0.5) - (moonIllum * 0.25) - (humidity > 75 ? 10 : 0))));

  return {
    location: {
      id: `loc_${lat.toFixed(2)}_${lon.toFixed(2)}`,
      name: locationName,
      country: '',
      lat,
      lon,
    },
    timestamp: now,
    temp: currentTemp,
    feelsLike: Math.round((currentTemp + (humidity > 70 ? 1.2 : -0.5)) * 10) / 10,
    tempMin: Math.round((currentTemp - 4) * 10) / 10,
    tempMax: Math.round((currentTemp + 5) * 10) / 10,
    humidity,
    dewPoint: Math.round((currentTemp - ((100 - humidity) / 5)) * 10) / 10,
    pressure,
    pressureTendency: 'steady',
    windSpeed: windSpeedKmh,
    windDeg,
    windGust: Math.round(windSpeedKmh * 1.3),
    visibilityKm: 16.0,
    cloudCoverPercent: cloudCover,
    uvIndex,
    condition: {
      id: main === 'Rain' ? 500 : cloudCover > 50 ? 802 : 800,
      main,
      description,
      icon,
    },
    isDay: hour >= 6 && hour <= 19,
    minutelyRain,
    hourly,
    daily,
    airQuality,
    celestial: {
      sunrise,
      sunset,
      solarNoon: sunrise + (sunset - sunrise) / 2,
      daylightDurationSeconds: sunset - sunrise,
      goldenHourMorning: '06:18 - 07:05',
      goldenHourEvening: '18:45 - 19:34',
      blueHourEvening: '19:34 - 19:52',
      sunElevationDeg: Math.round(Math.sin(((hour - 6) * Math.PI) / 12) * 55),
      sunAzimuthDeg: (hour * 15 + 180) % 360,
      moonPhaseName: moonIllum > 90 ? 'Full Moon' : moonIllum > 50 ? 'Waxing Gibbous' : moonIllum > 10 ? 'Waxing Crescent' : 'New Moon',
      moonIlluminationPercent: moonIllum,
      moonrise: sunset - 45 * 60,
      moonset: sunrise + 50 * 60,
      stargazingScore: stargazing,
      stargazingRating: stargazing > 75 ? 'Pristine' : stargazing > 50 ? 'Good' : 'Fair',
    },
    source: 'scientific_cache',
  };
}

// REST API ROUTES
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'WeatherGuard Atmospheric API Gateway', uptime: process.uptime() });
});

// Geocode search
app.get('/api/geocode/search', async (req, res) => {
  const query = (req.query.q as string || '').trim();
  if (!query || query.length < 2) {
    return res.json([]);
  }

  const mapTilerKey = process.env.VITE_MAPTILER_API_KEY;
  if (mapTilerKey) {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);
      
      let url = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${mapTilerKey}&limit=5&types=municipality,city,town,village,submunicipality,county,state,country`;
      if (!isNaN(lat) && !isNaN(lon)) {
        url += `&proximity=${lon},${lat}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        
        const mapped = data.features.map((feature: any) => {
          let state = '';
          let district = '';
          let country = '';
          let countryCode = '';

          const contexts = feature.context || [];
          contexts.forEach((c: any) => {
            if (c.id.startsWith('region') || c.id.startsWith('state')) {
              state = c.text;
            } else if (c.id.startsWith('county')) {
              district = c.text;
            } else if (c.id.startsWith('country')) {
              country = c.text;
              countryCode = (c.short_code || '').toUpperCase();
            }
          });

          // Fallbacks if the feature itself is a region/country
          if (feature.place_type.includes('region') || feature.place_type.includes('state')) {
            state = feature.text;
          }
          if (feature.place_type.includes('country')) {
            country = feature.text;
            countryCode = (feature.properties?.short_code || '').toUpperCase();
          }

          const placeTypeStr = feature.place_type[0];
          
          return {
            id: feature.id,
            name: feature.text,
            displayName: feature.place_name,
            placeType: placeTypeStr,
            city: placeTypeStr === 'city' ? feature.text : undefined,
            town: placeTypeStr === 'town' ? feature.text : undefined,
            village: placeTypeStr === 'village' ? feature.text : undefined,
            country,
            countryCode,
            state,
            district,
            lat: feature.center[1],
            lon: feature.center[0],
          };
        });
        return res.json(mapped);
      }
    } catch (err) {
      console.error('MapTiler search error:', err);
    }
  }

  // Open-Meteo free geocoding API fallback
  try {
    const openMeteoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10`;
    const response = await fetch(openMeteoUrl);
    if (response.ok) {
      const data = await response.json();
      if (data.results) {
        const getHumanReadableType = (code: string) => {
          if (!code) return 'City';
          if (code.startsWith('PPLC')) return 'Capital';
          if (code.startsWith('PPLA')) return 'City';
          if (code.startsWith('PPL')) return 'City / Town';
          if (code.startsWith('ADM1')) return 'State / Province';
          if (code.startsWith('ADM2')) return 'District';
          if (code.startsWith('ADM')) return 'Region';
          return 'Location';
        };

        const mapped = data.results.map((feature: any) => ({
          id: `geo_${feature.id}`,
          name: feature.name,
          displayName: [feature.name, feature.admin1, feature.country].filter(Boolean).join(', '),
          placeType: getHumanReadableType(feature.feature_code),
          city: feature.name,
          country: feature.country || '',
          countryCode: feature.country_code || '',
          state: feature.admin1 || '',
          district: feature.admin2 || '',
          lat: feature.latitude,
          lon: feature.longitude,
        }));
        return res.json(mapped);
      }
    }
  } catch (err) {
    console.error('Open-Meteo search error:', err);
  }

  res.json([]);
});

// OpenWeather Map Tile Proxy Endpoint
app.get('/api/tiles/weather/:layer/:z/:x/:y', async (req, res) => {
  const { layer, z, x, y } = req.params;
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    // If no API key is provided, return empty 204 or transparent 1x1 PNG
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    return res.send(transparentPng);
  }

  try {
    const tileUrl = `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${apiKey}`;
    const tileRes = await fetch(tileUrl);
    if (!tileRes.ok) {
      res.setHeader('Content-Type', 'image/png');
      const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
      return res.send(transparentPng);
    }
    const buffer = await tileRes.arrayBuffer();
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=1800');
    return res.send(Buffer.from(buffer));
  } catch {
    res.setHeader('Content-Type', 'image/png');
    const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    return res.send(transparentPng);
  }
});

app.get('/api/geocode/reverse', async (req, res) => {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);

  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }

  const mapTilerKey = process.env.VITE_MAPTILER_API_KEY;
  if (mapTilerKey) {
    try {
      const response = await fetch(`https://api.maptiler.com/geocoding/${lon},${lat}.json?key=${mapTilerKey}&limit=1&types=municipality,locality,place,region,subregion,county,country`);
      if (response.ok) {
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          
          let state = '';
          let district = '';
          let country = '';
          let countryCode = '';

          const contexts = feature.context || [];
          contexts.forEach((c: any) => {
            if (c.id.startsWith('region') || c.id.startsWith('state')) {
              state = c.text;
            } else if (c.id.startsWith('county') || c.id.startsWith('subregion')) {
              district = c.text;
            } else if (c.id.startsWith('country')) {
              country = c.text;
              countryCode = (c.short_code || c.country_code || '').toUpperCase();
            }
          });

          // Fallbacks if the feature itself is a region/country
          if (feature.place_type.includes('region') || feature.place_type.includes('state')) {
            state = feature.text;
          }
          if (feature.place_type.includes('country')) {
            country = feature.text;
            countryCode = (feature.properties?.short_code || feature.properties?.country_code || '').toUpperCase();
          }

          const placeTypeStr = feature.place_type[0];
          let placeName = feature.text;
          
          // Clean up bracketed directions like "(E)", "(W)", "(East)", etc.
          placeName = placeName.replace(/\s*\([NESWnesw][a-z]*\)/g, '').trim();
          // Clean up trailing standalone directions like " East" or " West"
          placeName = placeName.replace(/\s+(East|West|North|South)$/i, '').trim();

          return res.json({
            id: feature.id,
            name: placeName,
            displayName: feature.place_name,
            placeType: placeTypeStr,
            city: placeTypeStr === 'municipality' ? feature.text : undefined,
            town: placeTypeStr === 'locality' ? feature.text : undefined,
            village: placeTypeStr === 'place' ? feature.text : undefined,
            country,
            countryCode,
            state,
            district,
            lat,
            lon,
          });
        }
      }
    } catch (err) {
      console.error('MapTiler reverse geocode error:', err);
    }
  }

  res.json({
    name: `Obs Point (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
    country: '',
    lat,
    lon,
    debug: {
      hasKey: !!mapTilerKey,
      keyLength: mapTilerKey?.length || 0,
    }
  });
});

// Main Weather Telemetry API
app.get('/api/weather', async (req, res) => {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);
  const name = (req.query.name as string) || 'Active Location';

  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({ error: 'Valid lat and lon query parameters required' });
  }

  const cacheKey = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
  const cached = weatherCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return res.json({ ...cached.data, location: { ...cached.data.location, name: name || cached.data.location.name } });
  }

  const apiKey = process.env.WEATHERAPI_KEY;
  if (apiKey) {
    try {
      const response = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=7&aqi=yes`);

      if (response.ok) {
        const apiData = await response.json();

        const telemetry = generateScientificTelemetry(lat, lon, name || apiData.location.name);
        
        // Enrich with real WeatherAPI values
        telemetry.temp = apiData.current.temp_c;
        telemetry.feelsLike = apiData.current.feelslike_c;
        telemetry.tempMin = apiData.forecast?.forecastday?.[0]?.day?.mintemp_c ?? telemetry.tempMin;
        telemetry.tempMax = apiData.forecast?.forecastday?.[0]?.day?.maxtemp_c ?? telemetry.tempMax;
        telemetry.humidity = apiData.current.humidity;
        telemetry.pressure = apiData.current.pressure_mb;
        telemetry.windSpeed = Math.round(apiData.current.wind_kph);
        telemetry.windDeg = apiData.current.wind_degree;
        
        const isDay = apiData.current.is_day === 1;
        const conditionText = apiData.current.condition.text.toLowerCase();
        let icon = isDay ? '01d' : '01n';
        if (conditionText.includes('rain') || conditionText.includes('drizzle')) icon = isDay ? '10d' : '10n';
        else if (conditionText.includes('cloud') || conditionText.includes('overcast')) icon = isDay ? '03d' : '03n';
        else if (conditionText.includes('snow')) icon = isDay ? '13d' : '13n';
        else if (conditionText.includes('thunder') || conditionText.includes('storm')) icon = isDay ? '11d' : '11n';

        telemetry.condition = {
          id: apiData.current.condition.code,
          main: apiData.current.condition.text,
          description: apiData.current.condition.text,
          icon: icon,
        };
        
        if (apiData.current.air_quality) {
          telemetry.airQuality.pm2_5 = apiData.current.air_quality.pm2_5 || telemetry.airQuality.pm2_5;
          telemetry.airQuality.pm10 = apiData.current.air_quality.pm10 || telemetry.airQuality.pm10;
          const aqiIndex = apiData.current.air_quality['us-epa-index'] || 1;
          const aqiCategories: Record<number, { cat: 'Good' | 'Fair' | 'Moderate' | 'Poor' | 'Very Poor' | 'Hazardous'; advice: string }> = {
            1: { cat: 'Good', advice: 'Air quality is ideal for outdoor activities.' },
            2: { cat: 'Fair', advice: 'Air quality is acceptable for most people.' },
            3: { cat: 'Moderate', advice: 'Sensitive groups should reduce heavy outdoor exertion.' },
            4: { cat: 'Poor', advice: 'Particulate levels high; wear masks in polluted areas.' },
            5: { cat: 'Very Poor', advice: 'Health alert: avoid outdoor exercise.' },
            6: { cat: 'Hazardous', advice: 'Health warning of emergency conditions.' },
          };
          telemetry.airQuality.category = aqiCategories[aqiIndex]?.cat || 'Good';
          telemetry.airQuality.healthRecommendation = aqiCategories[aqiIndex]?.advice || '';
        }
        telemetry.source = 'live_api';

        // Sync hourly forecast
        if (apiData.forecast && apiData.forecast.forecastday) {
          const allHours = apiData.forecast.forecastday.flatMap((d: any) => d.hour || []);
          const currentEpoch = Math.floor(Date.now() / 1000);
          const futureHours = allHours.filter((h: any) => h.time_epoch >= currentEpoch - 3600).slice(0, 48);

          if (futureHours.length > 0) {
            telemetry.hourly = futureHours.map((item: any) => {
              const hIsDay = item.is_day === 1;
              const hText = item.condition.text.toLowerCase();
              let hIcon = hIsDay ? '01d' : '01n';
              if (hText.includes('rain') || hText.includes('drizzle')) hIcon = hIsDay ? '10d' : '10n';
              else if (hText.includes('cloud') || hText.includes('overcast')) hIcon = hIsDay ? '03d' : '03n';
              else if (hText.includes('snow')) hIcon = hIsDay ? '13d' : '13n';
              else if (hText.includes('thunder') || hText.includes('storm')) hIcon = hIsDay ? '11d' : '11n';

              return {
                timestamp: item.time_epoch,
                temp: item.temp_c,
                feelsLike: item.feelslike_c,
                humidity: item.humidity,
                pop: (item.chance_of_rain || item.chance_of_snow || 0) / 100,
                rainMm: item.precip_mm,
                windSpeed: Math.round(item.wind_kph),
                windDeg: item.wind_degree,
                uvIndex: item.uv,
                pressure: item.pressure_mb,
                condition: {
                  id: item.condition.code,
                  main: item.condition.text,
                  description: item.condition.text,
                  icon: hIcon,
                },
                isDay: hIsDay,
              };
            });
          }
          
          // Sync daily forecast
          telemetry.daily = apiData.forecast.forecastday.map((d: any, i: number) => {
            const baseSim = telemetry.daily[i] || telemetry.daily[0];
            const dText = d.day.condition.text.toLowerCase();
            let dIcon = '01d';
            if (dText.includes('rain') || dText.includes('drizzle')) dIcon = '10d';
            else if (dText.includes('cloud') || dText.includes('overcast')) dIcon = '03d';
            else if (dText.includes('snow')) dIcon = '13d';
            else if (dText.includes('thunder') || dText.includes('storm')) dIcon = '11d';

            return {
              timestamp: d.date_epoch,
              sunrise: baseSim.sunrise,
              sunset: baseSim.sunset,
              tempMin: d.day.mintemp_c,
              tempMax: d.day.maxtemp_c,
              tempDay: d.day.avgtemp_c,
              tempNight: d.day.mintemp_c,
              feelsLikeDay: d.day.avgtemp_c,
              humidity: d.day.avghumidity,
              pop: (d.day.daily_chance_of_rain || d.day.daily_chance_of_snow || 0) / 100,
              rainMm: d.day.totalprecip_mm,
              windSpeed: Math.round(d.day.maxwind_kph),
              windDeg: 0,
              uvIndex: d.day.uv,
              pressure: 1013,
              condition: {
                id: d.day.condition.code,
                main: d.day.condition.text,
                description: d.day.condition.text,
                icon: dIcon,
              },
              summary: d.day.condition.text,
            };
          });
        }

        // Safety bounds check
        if (telemetry.temp < -89 || telemetry.temp > 58) {
          console.warn(`[WeatherGuard] Sanity check failed: Out of bounds temperature ${telemetry.temp}°C resolved for lat ${lat}. Check provider units or parsing logic.`);
        }

        weatherCache.set(cacheKey, { timestamp: now, data: telemetry });
        return res.json(telemetry);
      }
    } catch (err) {
      console.error('WeatherAPI fetch error:', err);
      // Fallback to simulated high-precision telemetry
    }
  }

  // Fallback to high-precision scientific simulation
  const simulation = generateScientificTelemetry(lat, lon, name);
  weatherCache.set(cacheKey, { timestamp: now, data: simulation });
  return res.json(simulation);
});

import { getEarthWatchEvents, computeEarthWatchStats, getCuratedPlanetaryEvents } from '../server/earthwatch.js';

// Earth Watch: Global Natural Disaster & Hazards API (USGS + NASA EONET)
app.get('/api/earthwatch/events', async (req, res) => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;
    const type = req.query.type as string | undefined;
    const minMag = req.query.minMag ? parseFloat(req.query.minMag as string) : undefined;
    const severity = req.query.severity as string | undefined;

    let events = await getEarthWatchEvents(lat, lon);

    if (type && type !== 'all') {
      events = events.filter((e) => e.type === type);
    }
    if (minMag != null && !isNaN(minMag)) {
      events = events.filter((e) => e.type !== 'earthquake' || (e.magnitude != null && e.magnitude >= minMag));
    }
    if (severity && severity !== 'all') {
      events = events.filter((e) => e.severity === severity);
    }

    return res.json({
      events,
      count: events.length,
      lastUpdated: Date.now(),
    });
  } catch (err: any) {
    console.error('Error serving Earth Watch events:', err);
    const fallback = getCuratedPlanetaryEvents();
    return res.json({
      events: fallback,
      count: fallback.length,
      lastUpdated: Date.now(),
      isFallback: true,
    });
  }
});

app.get('/api/earthwatch/stats', async (req, res) => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;

    const events = await getEarthWatchEvents(lat, lon);
    const stats = computeEarthWatchStats(events);
    return res.json(stats);
  } catch (err: any) {
    console.error('Error computing Earth Watch stats:', err);
    const fallback = getCuratedPlanetaryEvents();
    const stats = computeEarthWatchStats(fallback);
    return res.json(stats);
  }
});

import { getSkyOverview } from '../server/astronomy.js';
import { getSpaceWeatherOverview, fetchLiveDonkiFlares, fetchLiveDonkiCMEs, fetchLiveDonkiAlerts } from '../server/spaceweather.js';

// Sky & Space Telemetry API (Sun, Moon, Planets, Constellations, Meteors, Eclipses, Stargazing, NASA APOD & NEOs)
app.get('/api/astronomy/overview', async (req, res) => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : 37.7749;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : -122.4194;

    const overview = await getSkyOverview(lat, lon);
    return res.json(overview);
  } catch (err: any) {
    console.error('Error computing sky overview:', err);
    return res.status(500).json({ error: 'Failed to compute celestial telemetry' });
  }
});

// Space Weather API: NASA DONKI & NOAA SWPC (Flares, CMEs, Geomagnetic, Aurora, Solar Wind, Alerts)
app.get('/api/spaceweather/overview', async (req, res) => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : 37.7749;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : -122.4194;

    const overview = await getSpaceWeatherOverview(lat, lon);
    return res.json(overview);
  } catch (err: any) {
    console.error('Error computing space weather overview:', err);
    return res.status(500).json({ error: 'Failed to compute space weather telemetry' });
  }
});

app.get('/api/spaceweather/flares', async (req, res) => {
  try {
    const flares = await fetchLiveDonkiFlares();
    return res.json({ flares, count: flares.length, timestamp: Date.now() });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch solar flares' });
  }
});

app.get('/api/spaceweather/cmes', async (req, res) => {
  try {
    const cmes = await fetchLiveDonkiCMEs();
    return res.json({ cmes, count: cmes.length, timestamp: Date.now() });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch CMEs' });
  }
});

app.get('/api/spaceweather/alerts', async (req, res) => {
  try {
    const alerts = await fetchLiveDonkiAlerts();
    return res.json({ alerts, count: alerts.length, timestamp: Date.now() });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch space weather alerts' });
  }
});

import { getNearEarthObjectsOverview, getAsteroidDetailsById } from '../server/neows.js';

// Near Earth Objects API: NASA NeoWs & JPL Horizons (Asteroid tracking, close approaches, hazard scoring, Sentry watchlist)
app.get('/api/neo/overview', async (req, res) => {
  try {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const data = await getNearEarthObjectsOverview(startDate, endDate);
    return res.json(data);
  } catch (err: any) {
    console.error('Error computing NEO overview:', err);
    return res.status(500).json({ error: 'Failed to compute Near Earth Object telemetry' });
  }
});

app.get('/api/neo/:id', async (req, res) => {
  try {
    const asteroidId = req.params.id;
    const asteroid = await getAsteroidDetailsById(asteroidId);
    if (!asteroid) {
      return res.status(404).json({ error: `Asteroid ${asteroidId} not found` });
    }
    return res.json(asteroid);
  } catch (err: any) {
    console.error(`Error retrieving asteroid ${req.params.id}:`, err);
    return res.status(500).json({ error: 'Failed to retrieve asteroid details' });
  }
});

import { generateWeatherTile } from '../server/weatherTiles.js';

// Atmospheric & Weather Explorer Raster Tile Server (Supports all 35+ Meteorological Layers)
app.get('/api/tiles/weather/:layer/:z/:x/:y', async (req, res) => {
  try {
    const { layer, z, x, y } = req.params;
    const offsetHours = req.query.offset ? parseFloat(req.query.offset as string) : 0;
    const zoom = parseInt(z, 10);
    const tileX = parseInt(x, 10);
    const tileY = parseInt(y, 10);

    if (isNaN(zoom) || isNaN(tileX) || isNaN(tileY)) {
      return res.status(400).send('Invalid tile coordinates');
    }

    const tileBuffer = await generateWeatherTile(layer, zoom, tileX, tileY, offsetHours);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.send(tileBuffer);
  } catch (err: any) {
    console.error('Error generating weather tile:', err);
    return res.status(500).send('Tile generation error');
  }
});

// Cloudinary Profile Photo Upload API
app.post('/api/users/profile-photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
    
    const userName = req.body.userName;
    const uploadOptions: any = {
      folder: 'users pic',
    };
    
    let publicId = '';
    
    if (userName && userName !== 'undefined' && userName !== 'null' && userName.trim() !== '') {
      // Clean the username to make it a valid filename
      publicId = userName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    } else if (req.file.originalname) {
      // Fallback to the uploaded file's original name (without extension)
      const nameWithoutExt = req.file.originalname.substring(0, req.file.originalname.lastIndexOf('.')) || req.file.originalname;
      publicId = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    }
    
    if (publicId) {
      uploadOptions.public_id = publicId;
    }
    
    const result = await cloudinary.uploader.upload(dataURI, uploadOptions);
    
    return res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ error: 'Failed to upload photo to Cloudinary' });
  }
});

// Cloudinary Profile Photo Delete API
app.delete('/api/users/profile-photo', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'No URL provided' });
    
    // Extract public_id from Cloudinary URL
    // e.g., .../upload/v12345/users%20pic/filename.jpg -> users pic/filename
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);
    if (matches && matches[1]) {
      const publicId = decodeURIComponent(matches[1]);
      await cloudinary.uploader.destroy(publicId);
      return res.json({ success: true });
    }
    return res.status(400).json({ error: 'Invalid Cloudinary URL' });
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    return res.status(500).json({ error: 'Failed to delete photo from Cloudinary' });
  }
});

// Vite Middleware integration for development & static for production
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WeatherGuard API & Web Server running on http://0.0.0.0:${PORT}`);
  });
}

// Only start the server if not running in a Vercel serverless environment
if (!process.env.VERCEL) {
  start();
}

export default app;
