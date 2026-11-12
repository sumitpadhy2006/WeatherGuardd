import {
  CurrentWeatherPayload,
  EarthWatchEvent,
  FarmerAdvisoryData,
  StudentDashboardData,
  TravelerDashboardData,
  PhotographerOpticsData,
  AstronomyEnthusiastData,
  SmartAlertNotification,
  NotificationRuleSettings,
  UserRole,
} from '../types';

/**
 * Generate Comprehensive Farmer Agro-Meteorological Advisory
 */
export const calculateFarmerAdvisory = (
  weather: CurrentWeatherPayload
): FarmerAdvisoryData => {
  const temp = weather.temp;
  const humidity = weather.humidity;
  const windSpeedKmh = weather.windSpeed;
  const pop = weather.hourly?.[0]?.pop ?? 0.2;
  const isRaining = weather.condition.main.toLowerCase().includes('rain');
  const uv = weather.uvIndex;

  // Evapotranspiration estimate (ET0 mm/day simplified Hargreaves/Penman-Monteith proxy)
  const solarRadProxy = Math.max(2, uv * 2.8);
  const et0 = Math.max(1.2, parseFloat(((0.0023 * (temp + 17.8) * Math.sqrt(Math.max(1, weather.tempMax - weather.tempMin)) * solarRadProxy) / 2.5).toFixed(1)));

  // Soil moisture estimation based on recent humidity, temp and rain
  let soilMoisture = Math.min(95, Math.max(18, Math.round(humidity * 0.55 + (isRaining ? 35 : -5) - temp * 0.4)));
  const soilTemp = Math.round(temp * 0.85 + 2);

  // Spray Window Viability
  let sprayViability: 'Optimal' | 'Caution' | 'Unfavorable' = 'Optimal';
  let sprayReason = 'Calm winds, dry canopy, and moderate humidity.';

  if (windSpeedKmh > 20) {
    sprayViability = 'Unfavorable';
    sprayReason = `High wind speeds (${Math.round(windSpeedKmh)} km/h) risk drift contamination. Hold chemical spraying.`;
  } else if (isRaining || pop > 0.5) {
    sprayViability = 'Unfavorable';
    sprayReason = 'Precipitation will wash off agrochemicals before absorption.';
  } else if (temp > 30) {
    sprayViability = 'Caution';
    sprayReason = 'High ambient temperature risks chemical droplet rapid evaporation and foliage scorch.';
  } else if (windSpeedKmh > 12) {
    sprayViability = 'Caution';
    sprayReason = 'Moderate breeze; recommend low-drift nozzles.';
  }

  // Frost Risk
  let frostRisk: 'None' | 'Low' | 'Moderate' | 'High' | 'Severe' = 'None';
  let frostWindow = undefined;
  if (weather.tempMin < 0) {
    frostRisk = 'Severe';
    frostWindow = '03:00 - 07:00 AM (Hard Freeze Warning)';
  } else if (weather.tempMin < 3) {
    frostRisk = 'High';
    frostWindow = '04:00 - 06:30 AM (Ground Frost Likely)';
  } else if (weather.tempMin < 6 && humidity > 80) {
    frostRisk = 'Moderate';
    frostWindow = 'Early Dawn';
  } else if (weather.tempMin < 8) {
    frostRisk = 'Low';
  }

  // Irrigation Recommendation
  let irrigation: 'No Irrigation Needed' | 'Light Irrigation Recommended' | 'Heavy Irrigation Required' | 'Hold (Rain Imminent)' = 'Light Irrigation Recommended';
  if (pop > 0.6 || isRaining) {
    irrigation = 'Hold (Rain Imminent)';
  } else if (soilMoisture > 70) {
    irrigation = 'No Irrigation Needed';
  } else if (soilMoisture < 35 && et0 > 4.5) {
    irrigation = 'Heavy Irrigation Required';
  } else {
    irrigation = 'Light Irrigation Recommended';
  }

  // GDD Base 10C
  const avgTemp = (weather.tempMax + weather.tempMin) / 2;
  const gdd = Math.max(0, parseFloat((avgTemp - 10).toFixed(1)));

  // Pest risk
  let pestRisk: 'Low' | 'Medium' | 'Elevated' | 'High' = 'Low';
  if (humidity > 80 && temp > 22) {
    pestRisk = 'High';
  } else if (humidity > 70 && temp > 18) {
    pestRisk = 'Elevated';
  } else if (temp > 15) {
    pestRisk = 'Medium';
  }

  return {
    soilMoisturePercent: soilMoisture,
    soilTempCelsius: soilTemp,
    evapotranspirationEt0Mm: et0,
    sprayWindowViability: sprayViability,
    sprayWindowReason: sprayReason,
    frostRisk,
    frostWindowEstimated: frostWindow,
    irrigationRecommendation: irrigation,
    growingDegreeDaysGdd: gdd,
    pestRiskIndex: pestRisk,
    harvestWindowForecast: [
      { day: 'Today', condition: weather.condition.description, dryingSpeed: et0 > 4 ? 'Fast' : 'Moderate', workability: isRaining ? 'Muddy' : 'Optimal' },
      { day: 'Tomorrow', condition: 'Partly Cloudy', dryingSpeed: 'Moderate', workability: 'Optimal' },
      { day: 'Day 3', condition: 'Sunny / Dry', dryingSpeed: 'Fast', workability: 'Optimal' },
    ],
    cropAdvice: [
      `Daily reference ET0 is ${et0} mm/day. Plan drip or pivot irrigation accordingly.`,
      sprayViability === 'Optimal'
        ? 'Pesticide and foliar fertilizer application window is OPEN with minimal wind drift.'
        : `Pesticide window: ${sprayReason}`,
      frostRisk !== 'None'
        ? `Deploy frost mitigation cloth, orchard wind machines, or under-canopy sprinklers (${frostWindow}).`
        : 'Night minimum temperature is safe above vegetative chilling thresholds.',
      `Current Growing Degree Days (GDD Base 10°C): +${gdd} heat units accrued today.`,
    ],
  };
};

/**
 * Generate Student Campus & Commute Weather Dashboard
 */
export const calculateStudentDashboard = (
  weather: CurrentWeatherPayload
): StudentDashboardData => {
  const pop = weather.hourly?.[0]?.pop ?? 0.1;
  const isRaining = weather.condition.main.toLowerCase().includes('rain');
  const temp = weather.temp;
  const aqi = weather.airQuality.aqi;
  const uv = weather.uvIndex;
  const windSpeed = weather.windSpeed;

  let commuteRating: 'Clear' | 'Carry Umbrella' | 'Heavy Rain Warning' | 'Extreme Weather' = 'Clear';
  if (pop > 0.7 || isRaining) {
    commuteRating = pop > 0.85 ? 'Heavy Rain Warning' : 'Carry Umbrella';
  } else if (pop > 0.35) {
    commuteRating = 'Carry Umbrella';
  } else if (temp > 40 || windSpeed > 55) {
    commuteRating = 'Extreme Weather';
  }

  // Transit mode advice
  const walkingStatus: 'Good' | 'Fair' | 'Not Recommended' =
    isRaining || temp > 36 || aqi > 4 ? 'Not Recommended' : pop > 0.4 ? 'Fair' : 'Good';
  const cyclingStatus: 'Good' | 'Fair' | 'Not Recommended' =
    windSpeed > 35 || isRaining || aqi > 3 ? 'Not Recommended' : pop > 0.3 ? 'Fair' : 'Good';
  const transitStatus: 'Recommended' | 'Standard' | 'Delays Possible' =
    isRaining || windSpeed > 45 ? 'Delays Possible' : 'Recommended';

  // Outdoor sports score
  let outdoorSportsIndex = 90;
  if (isRaining) outdoorSportsIndex -= 45;
  if (pop > 0.5) outdoorSportsIndex -= 25;
  if (temp > 33) outdoorSportsIndex -= 20;
  if (temp < 5) outdoorSportsIndex -= 25;
  if (aqi >= 4) outdoorSportsIndex -= 35;
  if (uv > 8) outdoorSportsIndex -= 15;
  outdoorSportsIndex = Math.max(10, Math.min(100, outdoorSportsIndex));

  let outdoorVerdict: 'Excellent' | 'Good' | 'Fair' | 'Avoid Outdoor Sports' = 'Good';
  if (outdoorSportsIndex >= 85) outdoorVerdict = 'Excellent';
  else if (outdoorSportsIndex >= 65) outdoorVerdict = 'Good';
  else if (outdoorSportsIndex >= 40) outdoorVerdict = 'Fair';
  else outdoorVerdict = 'Avoid Outdoor Sports';

  // Study comfort score
  const studyScore = Math.max(30, Math.min(98, Math.round(100 - Math.abs(temp - 21) * 2 - (aqi > 2 ? aqi * 10 : 0))));

  // UV protection
  let uvProtection: 'No Protection Needed' | 'Sunglasses & Hat' | 'SPF 30+ & Shade' | 'Stay Indoors' = 'No Protection Needed';
  if (uv >= 9) uvProtection = 'Stay Indoors';
  else if (uv >= 6) uvProtection = 'SPF 30+ & Shade';
  else if (uv >= 3) uvProtection = 'Sunglasses & Hat';

  return {
    campusCommuteRating: commuteRating,
    transitModeAdvice: {
      walking: {
        status: walkingStatus,
        text: walkingStatus === 'Good' ? 'Great time for a campus walk between lectures.' : 'Slick footpaths or high rain probability.',
      },
      cycling: {
        status: cyclingStatus,
        text: cyclingStatus === 'Good' ? 'Safe cycling conditions on campus paths.' : 'Wet roads or gusty headwinds risk skidding.',
      },
      publicTransit: {
        status: transitStatus,
        text: transitStatus === 'Delays Possible' ? 'Weather-related shuttle or bus delays expected.' : 'Campus shuttle running on regular schedule.',
      },
    },
    outdoorSportsIndex,
    outdoorSportsVerdict: outdoorVerdict,
    studyComfortScore: studyScore,
    studyComfortNotes: `Library & dorm indoor study index is ${studyScore}/100. Outdoor air quality is ${weather.airQuality.category}.`,
    uvProtectionLevel: uvProtection,
    examDayWeatherOutlook: [
      { timeSlot: '08:00 AM (Morning Exam)', temp: `${Math.round(weather.tempMin + 2)}°C`, rainProb: Math.round(pop * 100), advisory: 'Carry light layer & student ID' },
      { timeSlot: '12:30 PM (Mid-day Break)', temp: `${Math.round(temp)}°C`, rainProb: Math.round(pop * 80), advisory: 'Stay hydrated near campus commons' },
      { timeSlot: '04:30 PM (Evening Class)', temp: `${Math.round(weather.tempMax - 1)}°C`, rainProb: Math.round(pop * 110), advisory: 'Umbrella recommended for commute home' },
    ],
  };
};

/**
 * Generate Traveler Multi-City & Packing Dashboard
 */
export const calculateTravelerDashboard = (
  weather: CurrentWeatherPayload
): TravelerDashboardData => {
  const currentCityName = weather.location.name;
  const temp = weather.temp;
  const isRain = weather.condition.main.toLowerCase().includes('rain');

  const packingList = [
    temp < 10 ? 'Heavy Thermal Jacket & Gloves' : temp < 20 ? 'Light Fleece / Cardigan' : 'Breathable Cotton / Linen Apparel',
    isRain || (weather.hourly?.[0]?.pop ?? 0) > 0.4 ? 'Compact Travel Umbrella & Waterproof Backpack Cover' : 'UV Sunglasses & Sun Hat',
    'Universal Power Adapter & Portable Power Bank',
    weather.uvIndex > 5 ? 'Sunscreen SPF 50+ Broad Spectrum' : 'Hydration Flask',
    'Comfortable Walking Footwear',
  ];

  return {
    itinerary: [
      {
        id: 'city_1',
        cityName: currentCityName,
        country: weather.location.country || 'Current Station',
        dates: 'Today - Day 2',
        tempRange: `${Math.round(weather.tempMin)}° - ${Math.round(weather.tempMax)}°C`,
        weatherCondition: weather.condition.description,
        icon: weather.condition.icon,
        rainChance: Math.round((weather.hourly?.[0]?.pop ?? 0.2) * 100),
        flightTurbulenceRisk: weather.windSpeed > 40 ? 'Moderate' : 'Low',
        packingChecklist: ['Local currency', 'Comfortable shoes', 'Jacket'],
        localAlerts: weather.airQuality.aqi > 3 ? ['Air Quality Advisory (Wear N95 if sensitive)'] : ['No severe weather disruptions'],
      },
      {
        id: 'city_2',
        cityName: 'Tokyo, Japan',
        country: 'JP',
        dates: 'Day 3 - Day 5',
        tempRange: '14° - 22°C',
        weatherCondition: 'Scattered Clouds',
        icon: '03d',
        rainChance: 25,
        flightTurbulenceRisk: 'Low',
        packingChecklist: ['PASMO/Suica transit card', 'Walking sneakers', 'Light jacket'],
        localAlerts: ['Smooth flight corridor'],
      },
      {
        id: 'city_3',
        cityName: 'Paris, France',
        country: 'FR',
        dates: 'Day 6 - Day 9',
        tempRange: '11° - 19°C',
        weatherCondition: 'Light Morning Drizzle',
        icon: '10d',
        rainChance: 60,
        flightTurbulenceRisk: 'Moderate',
        packingChecklist: ['Trench coat / Umbrella', 'Scarf', 'Camera gear'],
        localAlerts: ['Occasional shower bursts'],
      },
    ],
    generalPackingAdvice: packingList,
    jetlagSunlightAdvice: 'Get 30-45 minutes of natural morning sunlight exposure between 08:00 AM - 09:30 AM to reset circadian melatonin rhythms.',
    localTimeAndSun: {
      localTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timezoneName: Intl.DateTimeFormat().resolvedOptions().timeZone,
      daylightRemainingHours: Math.max(0, parseFloat(((weather.celestial.sunset - Date.now() / 1000) / 3600).toFixed(1))),
    },
    emergencyServicesNumber: weather.location.country === 'US' ? '911' : weather.location.country === 'IN' ? '112' : '112 / Local Police',
  };
};

/**
 * Generate Photographer Golden Hour & Optical Atmosphere Optics
 */
export const calculatePhotographerOptics = (
  weather: CurrentWeatherPayload
): PhotographerOpticsData => {
  const celestial = weather.celestial;
  const cloudCover = weather.cloudCoverPercent;
  const humidity = weather.humidity;
  const visibility = weather.visibilityKm;

  // Cloud layers estimate
  const lowCloud = Math.min(100, Math.round(cloudCover * 0.4 + (humidity > 80 ? 20 : 0)));
  const midCloud = Math.min(100, Math.round(cloudCover * 0.35));
  const highCloud = Math.min(100, Math.round(cloudCover * 0.25));

  // Sunset drama calculation (sweet spot is 30-65% high/mid clouds, low base)
  let dramaScore = 65;
  if (cloudCover >= 30 && cloudCover <= 70) dramaScore += 25;
  else if (cloudCover > 90) dramaScore -= 40;
  else if (cloudCover < 10) dramaScore -= 20;

  // Fog & mist prediction
  const dewPointDiff = Math.abs(weather.temp - weather.dewPoint);
  const fogChance = dewPointDiff < 2.5 && humidity > 85 ? 85 : dewPointDiff < 4 ? 45 : 10;

  const sunriseDate = new Date(celestial.sunrise * 1000);
  const sunsetDate = new Date(celestial.sunset * 1000);

  const formatHourMin = (d: Date, offsetMins = 0) => {
    const target = new Date(d.getTime() + offsetMins * 60000);
    return target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return {
    goldenHourMorning: {
      start: formatHourMin(sunriseDate, -20),
      end: formatHourMin(sunriseDate, +40),
      quality: cloudCover < 75 ? 'Pristine' : 'Cloudy',
    },
    goldenHourEvening: {
      start: formatHourMin(sunsetDate, -45),
      end: formatHourMin(sunsetDate, +15),
      quality: cloudCover < 80 ? 'Pristine' : 'Good',
    },
    blueHourMorning: {
      start: formatHourMin(sunriseDate, -45),
      end: formatHourMin(sunriseDate, -20),
      mood: 'Deep indigo gradient sky with warm horizon glow',
    },
    blueHourEvening: {
      start: formatHourMin(sunsetDate, +15),
      end: formatHourMin(sunsetDate, +45),
      mood: 'Crisp city lights contrast with cobalt atmosphere',
    },
    cloudCeiling: {
      lowCloudPercent: lowCloud,
      midCloudPercent: midCloud,
      highCloudPercent: highCloud,
      cloudBaseMeters: Math.round(Math.max(300, (weather.temp - weather.dewPoint) * 125)),
      dramaticSunsetScore: Math.min(100, Math.max(10, dramaScore)),
    },
    sunAzimuthDegrees: Math.round(celestial.sunAzimuthDeg || 215),
    sunElevationDegrees: Math.round(celestial.sunElevationDeg || 32),
    moonAzimuthDegrees: 110,
    moonElevationDegrees: 48,
    moonIlluminationPercent: celestial.moonIlluminationPercent,
    moonPhaseName: celestial.moonPhaseName,
    fogMistForecast: {
      chancePercent: fogChance,
      predictedValleyFog: fogChance > 50,
      goldenMistTime: fogChance > 40 ? `${formatHourMin(sunriseDate, -15)} - ${formatHourMin(sunriseDate, +30)}` : undefined,
    },
    lensRecommendation:
      dramaScore > 75
        ? '16-35mm Ultra-wide (Capture high-altitude cirrus cloud burn)'
        : visibility < 8
        ? '85mm or 70-200mm Telephoto (Atmospheric compression & misty layers)'
        : '24-70mm f/2.8 All-around Landscape & Portrait',
  };
};

/**
 * Generate Astronomy Enthusiast Night Sky & Dark Sky Dashboard
 */
export const calculateAstronomyDashboard = (
  weather: CurrentWeatherPayload
): AstronomyEnthusiastData => {
  const cloudCover = weather.cloudCoverPercent;
  const humidity = weather.humidity;
  const moonIllum = weather.celestial.moonIlluminationPercent;

  // Bortle class estimation (assume suburb class 4-5 default, adjusted by visibility)
  const bortle = weather.visibilityKm > 15 ? 4 : weather.visibilityKm > 10 ? 5 : 6;
  const limitingMag = parseFloat((7.0 - bortle * 0.4).toFixed(1));

  // Stargazing index (0-100)
  let stargazingScore = 100 - cloudCover * 0.6 - moonIllum * 0.3 - (humidity > 80 ? 15 : 0);
  stargazingScore = Math.max(5, Math.min(100, Math.round(stargazingScore)));

  return {
    bortleDarkSkyClass: bortle,
    bortleDescription: `Class ${bortle}: Rural/Suburban Transition Sky. Milky Way visible overhead in clear season.`,
    nakedEyeLimitingMagnitude: limitingMag,
    nightCloudForecast: [
      { hour: '21:00', cloudCoverPercent: Math.round(cloudCover * 0.9), transparencyRating: 'Good', seeingConditions: 'Steady' },
      { hour: '00:00', cloudCoverPercent: Math.round(cloudCover * 0.7), transparencyRating: 'Excellent', seeingConditions: 'Steady' },
      { hour: '03:00', cloudCoverPercent: Math.round(cloudCover * 0.8), transparencyRating: 'Good', seeingConditions: 'Moderate' },
      { hour: '05:00', cloudCoverPercent: Math.round(cloudCover * 1.1), transparencyRating: 'Average', seeingConditions: 'Turbulent' },
    ],
    activeMeteorShowers: [
      {
        name: 'Perseids Meteor Shower',
        radiantConstellation: 'Perseus (NE Sky)',
        peakDate: 'August 12 - 13',
        zenithalHourlyRateZhr: 100,
        moonInterference: moonIllum > 60 ? 'Significant' : 'Low',
        viewingWindow: '00:30 AM - Dawn',
      },
      {
        name: 'Geminids Meteor Shower',
        radiantConstellation: 'Gemini',
        peakDate: 'December 13 - 14',
        zenithalHourlyRateZhr: 120,
        moonInterference: 'None',
        viewingWindow: '22:00 PM - 05:00 AM',
      },
      {
        name: 'Leonids Meteor Shower',
        radiantConstellation: 'Leo',
        peakDate: 'November 17 - 18',
        zenithalHourlyRateZhr: 15,
        moonInterference: 'Low',
        viewingWindow: '02:00 AM - Dawn',
      },
    ],
    upcomingEclipses: [
      {
        type: 'Total Solar',
        date: 'August 12, 2026',
        visibilityRegion: 'Greenland, Iceland, Spain & North Atlantic',
        countdownDays: 14,
        peakUtc: '17:47 UTC',
      },
      {
        type: 'Total Lunar',
        date: 'September 07, 2026',
        visibilityRegion: 'Europe, Africa, Asia, Australia',
        countdownDays: 40,
        peakUtc: '18:12 UTC',
      },
      {
        type: 'Annular Solar',
        date: 'February 06, 2027',
        visibilityRegion: 'South America, Antarctica, West Africa',
        countdownDays: 192,
        peakUtc: '16:00 UTC',
      },
    ],
    satellitePasses: [
      {
        target: 'ISS (International Space Station)',
        time: '20:42 PM',
        durationMinutes: 6,
        maxElevationDegrees: 78,
        brightnessMagnitude: -3.4,
      },
      {
        target: 'Tiangong',
        time: '21:55 PM',
        durationMinutes: 4,
        maxElevationDegrees: 52,
        brightnessMagnitude: -1.8,
      },
      {
        target: 'Hubble',
        time: '04:18 AM',
        durationMinutes: 5,
        maxElevationDegrees: 44,
        brightnessMagnitude: 1.2,
      },
    ],
    stargazingIndex: stargazingScore,
  };
};

/**
 * Smart Alert Evaluator Engine (Rain, AQI, Cyclone, Earthquake, Eclipse, Meteor Shower)
 */
export const evaluateSmartAlerts = (
  weather: CurrentWeatherPayload | null,
  earthWatchEvents: EarthWatchEvent[] = [],
  settings: NotificationRuleSettings,
  userRole: UserRole = 'general'
): SmartAlertNotification[] => {
  const alerts: SmartAlertNotification[] = [];
  const now = Date.now();

  if (weather) {
    const pop = weather.hourly?.[0]?.pop ?? 0;
    const isRaining = weather.condition.main.toLowerCase().includes('rain');
    const aqi = weather.airQuality.aqi;
    const locName = weather.location.name;

    // 1. Rain Alerts
    if (settings.enableRainAlerts) {
      if (isRaining || pop >= settings.rainProbabilityThreshold / 100) {
        alerts.push({
          id: `rain_alert_${now}`,
          category: 'rain',
          severity: pop > 0.8 || weather.hourly?.[0]?.rainMm && weather.hourly[0].rainMm > 5 ? 'warning' : 'advisory',
          title: isRaining ? `Precipitation Active in ${locName}` : `High Rain Probability (${Math.round(pop * 100)}%) Imminent`,
          message: isRaining
            ? `Current weather reports ${weather.condition.description} with intensity ${weather.hourly?.[0]?.rainMm || 2.5} mm/h.`
            : `Precipitation probability is expected to reach ${Math.round(pop * 100)}% within the next ${settings.rainTimingLeadMinutes} minutes.`,
          timestamp: now - 1000 * 60 * 5,
          locationName: locName,
          actionLabel: 'View Radar Feed',
          actionTab: 'weather',
          isRead: false,
          triggerSource: 'auto_weather',
          metadata: { rainProbability: pop, rainMm: weather.hourly?.[0]?.rainMm },
        });
      }
    }

    // 2. AQI Alerts
    if (settings.enableAqiAlerts) {
      if (aqi >= 3 || weather.airQuality.pm2_5 > 35.4) {
        const severity: 'advisory' | 'warning' | 'critical' = aqi >= 5 ? 'critical' : aqi >= 4 ? 'warning' : 'advisory';
        alerts.push({
          id: `aqi_alert_${now}`,
          category: 'aqi',
          severity,
          title: `Air Quality Alert: ${weather.airQuality.category} (AQI ${aqi}/5, PM2.5: ${weather.airQuality.pm2_5} µg/m³)`,
          message: `${weather.airQuality.healthRecommendation} Dominant pollutant: ${weather.airQuality.dominantPollutant}.`,
          timestamp: now - 1000 * 60 * 18,
          locationName: locName,
          actionLabel: 'Check Health Advisory',
          actionTab: 'weather',
          isRead: false,
          triggerSource: 'auto_weather',
          metadata: { aqiValue: aqi, pm25: weather.airQuality.pm2_5 },
        });
      }
    }
  }

  // 3. Cyclone Alerts (From EarthWatch or active meteorological tracking)
  if (settings.enableCycloneAlerts) {
    const nearbyCyclones = earthWatchEvents.filter(
      (e) => e.type === 'cyclone' && (e.distanceKm ? e.distanceKm <= settings.cycloneRadiusKm : true)
    );

    if (nearbyCyclones.length > 0) {
      const cyc = nearbyCyclones[0];
      alerts.push({
        id: `cyclone_alert_${cyc.id}`,
        category: 'cyclone',
        severity: 'critical',
        title: `Cyclone Emergency Track: ${cyc.title}`,
        message: `${cyc.cycloneCategory || 'Tropical Cyclone'} active ${cyc.distanceKm ? `approx ${Math.round(cyc.distanceKm)} km away` : 'in your region'} with sustained winds up to ${cyc.cycloneWindSpeedKmh || 140} km/h.`,
        timestamp: cyc.timestamp || now - 1000 * 60 * 30,
        locationName: cyc.place,
        actionLabel: 'View Storm Track Radar',
        actionTab: 'earthwatch',
        isRead: false,
        triggerSource: 'auto_earthwatch',
        metadata: { cycloneCategory: cyc.cycloneCategory, windSpeed: cyc.cycloneWindSpeedKmh },
      });
    } else {
      // Provide active sample track if user requested
      alerts.push({
        id: `cyclone_advisory_active`,
        category: 'cyclone',
        severity: 'advisory',
        title: 'Tropical Cyclone Surveillance (Regional Ocean Basin)',
        message: 'Active low-pressure vortex monitored 780 km offshore. Current movement WNW at 18 km/h.',
        timestamp: now - 1000 * 60 * 60,
        locationName: 'Coastal Oceanic Zone',
        actionLabel: 'Open EarthWatch Tracker',
        actionTab: 'earthwatch',
        isRead: true,
        triggerSource: 'auto_earthwatch',
      });
    }
  }

  // 4. Earthquake Alerts (From USGS / Global Seismic feed)
  if (settings.enableEarthquakeAlerts) {
    const nearbyQuakes = earthWatchEvents.filter(
      (e) => e.type === 'earthquake' && (e.magnitude ?? 0) >= settings.earthquakeMinMagnitude
    );

    if (nearbyQuakes.length > 0) {
      const q = nearbyQuakes[0];
      alerts.push({
        id: `quake_alert_${q.id}`,
        category: 'earthquake',
        severity: (q.magnitude ?? 0) >= 6.0 ? 'critical' : 'warning',
        title: `Seismic Alert: M${q.magnitude?.toFixed(1)} Earthquake detected`,
        message: `Epicenter at ${q.place}. Depth: ${q.depthKm || 10} km. ${q.tsunamiRisk ? 'Tsunami warning in effect.' : 'No immediate tsunami threat generated.'}`,
        timestamp: q.timestamp || now - 1000 * 60 * 45,
        locationName: q.place,
        actionLabel: 'Inspect Seismic Waveform',
        actionTab: 'earthwatch',
        isRead: false,
        triggerSource: 'auto_earthwatch',
        metadata: { earthquakeMagnitude: q.magnitude, depthKm: q.depthKm },
      });
    } else {
      // Sample recent seismic notice
      alerts.push({
        id: `quake_sample_pacific`,
        category: 'earthquake',
        severity: 'advisory',
        title: 'Seismic Monitoring: M5.2 Earthquake (Pacific Ring of Fire)',
        message: 'USGS automated detection: depth 24 km, undersea strike-slip tectonic event.',
        timestamp: now - 1000 * 60 * 90,
        locationName: 'Pacific Rim Seismic Zone',
        actionLabel: 'View EarthWatch Map',
        actionTab: 'earthwatch',
        isRead: true,
        triggerSource: 'auto_earthwatch',
      });
    }
  }

  // 5. Eclipse Alerts
  if (settings.enableEclipseAlerts) {
    alerts.push({
      id: `eclipse_alert_2026`,
      category: 'eclipse',
      severity: 'info',
      title: 'Astronomical Alert: Total Solar Eclipse Approaching',
      message: 'Total Solar Eclipse path of totality across Greenland, Iceland & Spain on August 12, 2026. Peak totality window: 17:47 UTC.',
      timestamp: now - 1000 * 60 * 120,
      locationName: 'Global Astronomical Track',
      actionLabel: 'View Astronomy Forecast',
      actionTab: 'space',
      isRead: false,
      triggerSource: 'auto_astronomy',
      metadata: { eclipseTime: '2026-08-12 17:47 UTC' },
    });
  }

  // 6. Meteor Shower Alerts
  if (settings.enableMeteorShowerAlerts) {
    alerts.push({
      id: `meteor_alert_perseids`,
      category: 'meteor_shower',
      severity: 'info',
      title: 'Perseids Meteor Shower Peak Tonight (ZHR ~100)',
      message: 'Optimal stargazing radiant window in constellation Perseus (NE horizon) between 00:30 AM and dawn. Clear skies expected in dark sky zones.',
      timestamp: now - 1000 * 60 * 180,
      locationName: 'Night Sky Hemisphere',
      actionLabel: 'Open Stargazing Radar',
      actionTab: 'space',
      isRead: false,
      triggerSource: 'auto_astronomy',
      metadata: { meteorZhr: 100 },
    });
  }

  return alerts;
};
