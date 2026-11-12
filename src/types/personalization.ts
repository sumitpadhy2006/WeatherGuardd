import { GeoLocationItem, CurrentWeatherPayload } from './index';

export type UserRole =
  | 'general'
  | 'farmer'
  | 'student'
  | 'traveler'
  | 'photographer'
  | 'astronomy';

export type PrimaryUserType =
  | 'Student'
  | 'Teacher / Professor'
  | 'Farmer'
  | 'Agriculture Worker'
  | 'Driver'
  | 'Delivery Partner'
  | 'Traveler'
  | 'Tourist Guide'
  | 'Photographer'
  | 'Videographer'
  | 'Hiker / Trekker'
  | 'Runner'
  | 'Cyclist'
  | 'Outdoor Sports'
  | 'Fisherman'
  | 'Marine Worker'
  | 'Pilot / Aviation Professional'
  | 'Drone Operator'
  | 'Construction Worker'
  | 'Emergency / Disaster Response'
  | 'Researcher'
  | 'Astronomy Enthusiast'
  | 'Weather Enthusiast'
  | 'General User'
  | 'Other';

export type UserInterest =
  | 'Travel'
  | 'Photography'
  | 'Stargazing'
  | 'Astronomy'
  | 'Running'
  | 'Cycling'
  | 'Hiking'
  | 'Outdoor Activities'
  | 'Farming'
  | 'Gardening'
  | 'Marine'
  | 'Aviation'
  | 'Drones'
  | 'Weather Monitoring'
  | 'Disaster Awareness'
  | 'Solar Energy'
  | 'Environmental Monitoring'
  | 'Space Science';

export type SavedPlaceLabel =
  | 'Home'
  | 'College'
  | 'School'
  | 'Office'
  | 'Farm'
  | 'Village'
  | 'Family'
  | 'Travel'
  | 'Custom';

export interface SavedLocationRecord {
  locationId: string;
  label: SavedPlaceLabel;
  nickname?: string;
  city: string;
  state?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  isDefault?: boolean;
  alertEnabled?: boolean;
  createdAt: number;
  updatedAt?: number;
}

export interface AlertRuleRecord {
  ruleId: string;
  name: string;
  category: AlertCategory;
  locationId?: string;
  radiusKm?: number;
  thresholdValue?: number;
  thresholdOperator?: 'gte' | 'lte' | 'eq';
  enabled: boolean;
  createdAt: number;
  updatedAt?: number;
}

export interface UserWeatherPreferences {
  tempUnit: 'C' | 'F';
  speedUnit: 'km/h' | 'mph' | 'm/s' | 'knots';
  pressureUnit: 'hPa' | 'inHg' | 'mmHg';
  rainUnit: 'mm' | 'in';
  timeFormat: '12h' | '24h';
  defaultLocationId?: string;
  defaultMapStyle?: 'standard' | 'dark' | 'satellite' | 'terrain' | 'radar';
  defaultWeatherLayer?: 'radar' | 'wind' | 'clouds' | 'temp' | 'precipitation' | 'pressure';
  forecastPreference?: 'hourly' | 'daily' | 'detailed';
}

export interface UserNotificationPreferences {
  channelPush: boolean;
  channelInApp: boolean;
  channelEmail: boolean;
  criticalAlertsOnly: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // e.g. "22:00"
  quietHoursEnd: string; // e.g. "07:00"
  soundEnabled: boolean;
  soundVolume?: number;
  vibrationEnabled: boolean;
  language: string; // e.g. "en"
  fcmToken?: string | null;
  fcmPermissionStatus?: 'default' | 'granted' | 'denied' | 'unsupported';
}

export interface UserAlertPreferences {
  // Weather Alerts
  enableRain: boolean;
  rainThresholdPercent: number; // e.g. 70
  enableHeavyRain: boolean;
  enableThunderstorm: boolean;
  enableLightning: boolean;
  enableStrongWind: boolean;
  windThresholdKmh: number; // e.g. 50
  enableCyclone: boolean;
  cycloneRadiusKm: number; // e.g. 500
  enableFlood: boolean;
  enableHeatwave: boolean;
  enableColdWave: boolean;
  enableFog: boolean;
  enableAqi: boolean;
  aqiThresholdValue: number; // e.g. 150
  enableUv: boolean;
  uvThresholdValue: number; // e.g. 8

  // Earth Alerts
  enableEarthquake: boolean;
  earthquakeMinMagnitude: number; // e.g. 4.5
  earthquakeRadiusKm: number; // e.g. 500 (50, 100, 250, 500, 1000)
  enableTsunami: boolean;
  enableVolcano: boolean;
  enableWildfire: boolean;

  // Space Weather Alerts
  enableSolarFlare: boolean;
  enableCme: boolean;
  enableGeomagneticStorm: boolean;
  enableAurora: boolean;

  // Astronomy Alerts
  enableEclipse: boolean;
  eclipseAdvanceHours: number; // e.g. 24
  enableMeteorShower: boolean;
  meteorMinZhr: number; // e.g. 20
  enableFullMoon: boolean;
  enableNewMoon: boolean;
  enableCelestialEvents: boolean;
}

export interface UserAstronomyPreferences {
  enableStargazingAlerts: boolean;
  minStargazingScore: number; // e.g. 70
  preferredObservationLocationId?: string;
  enablePlanetVisibility: boolean;
  enableSatellitePasses: boolean;
  enableDeepSkyTargets: boolean;
  nightVisionRedModeAuto: boolean;
}

export interface UserSpaceWeatherPreferences {
  enableSolarFlareAlerts: boolean;
  minFlareClass: 'C' | 'M' | 'X';
  enableGeomagneticStormAlerts: boolean;
  minKpIndex: number; // e.g. 5
  enableAuroraVisibilityAlerts: boolean;
  viewingLatitudeThreshold: number;
}

export interface UserAccessibilityPreferences {
  reducedMotion: boolean;
  animationIntensity: 'off' | 'subtle' | 'standard' | 'high';
  contrastMode: 'standard' | 'high_contrast';
  fontScale: 'normal' | 'large';
  screenReaderOptimized: boolean;
}

export interface UserAddress {
  line1: string;
  line2: string;
  country: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
}

export interface FullUserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  profilePhotoUrl?: string | null;
  phoneNumber?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  emailVerified: boolean;
  isAnonymous: boolean;
  primaryUserType: PrimaryUserType;
  specificProfession?: string;
  address?: UserAddress;
  interests: UserInterest[];
  role: UserRole;
  createdAt: number;
  updatedAt: number;
  lastLoginAt: number;
  weatherPreferences: UserWeatherPreferences;
  notificationPreferences: UserNotificationPreferences;
  alertPreferences: UserAlertPreferences;
  astronomyPreferences: UserAstronomyPreferences;
  spaceWeatherPreferences: UserSpaceWeatherPreferences;
  accessibilityPreferences: UserAccessibilityPreferences;
  savedLocationsCount: number;
}

export type AlertCategory =
  | 'rain'
  | 'aqi'
  | 'cyclone'
  | 'earthquake'
  | 'eclipse'
  | 'meteor_shower'
  | 'space_weather'
  | 'system';

export type AlertSeverity = 'info' | 'advisory' | 'warning' | 'critical';

export interface SmartAlertNotification {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: number;
  locationName: string;
  actionLabel?: string;
  actionTab?: string;
  isRead: boolean;
  readAt?: number;
  triggerSource: 'auto_weather' | 'auto_earthwatch' | 'auto_astronomy' | 'fcm_push' | 'custom_rule' | 'simulation';
  fcmSent?: boolean;
  metadata?: {
    rainProbability?: number;
    aqiValue?: number;
    cycloneCategory?: string;
    earthquakeMagnitude?: number;
    eclipseTime?: string;
    meteorZhr?: number;
    [key: string]: any;
  };
}

export interface NotificationRuleSettings {
  // Rain
  enableRainAlerts: boolean;
  rainProbabilityThreshold: number; // e.g. 50%
  rainTimingLeadMinutes: number; // e.g. 30 mins before

  // AQI
  enableAqiAlerts: boolean;
  aqiThresholdCategory: 'Moderate' | 'Poor' | 'Very Poor' | 'Hazardous';
  aqiThresholdValue: number; // e.g. 100 or 150

  // Cyclone
  enableCycloneAlerts: boolean;
  cycloneRadiusKm: number; // e.g. 500 km
  cycloneMinCategory: string; // 'Tropical Storm' or 'Category 1'

  // Earthquake
  enableEarthquakeAlerts: boolean;
  earthquakeMinMagnitude: number; // e.g. 4.5
  earthquakeRadiusKm: number; // e.g. 600 km

  // Eclipse
  enableEclipseAlerts: boolean;
  eclipseAdvanceHours: number; // e.g. 24 hours

  // Meteor Shower
  enableMeteorShowerAlerts: boolean;
  meteorMinZhr: number; // Zenithal Hourly Rate e.g. 20

  // Channels
  channelInApp: boolean;
  channelWebPush: boolean;
  channelSound: boolean;
  fcmToken?: string | null;
  fcmPermissionStatus: 'default' | 'granted' | 'denied' | 'unsupported';
}

export interface FirestoreUserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  profilePhotoUrl?: string | null;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  primaryUserType?: PrimaryUserType;
  specificProfession?: string;
  interests?: UserInterest[];
  address?: UserAddress;
  role: UserRole;
  createdAt: number;
  lastActive: number;
  fcmToken?: string | null;
  weatherPreferences?: Partial<UserWeatherPreferences>;
  notificationPreferences?: Partial<UserNotificationPreferences>;
  alertPreferences?: Partial<UserAlertPreferences>;
  astronomyPreferences?: Partial<UserAstronomyPreferences>;
  spaceWeatherPreferences?: Partial<UserSpaceWeatherPreferences>;
  accessibilityPreferences?: Partial<UserAccessibilityPreferences>;
  notificationSettings?: NotificationRuleSettings;
  savedLocationsCount?: number;
  activeStationId?: string;
  roleCustomData?: Record<string, any>;
}

// -------------------------------------------------------------
// Role-Specific Metrics & Data Models
// -------------------------------------------------------------

export interface FarmerAdvisoryData {
  soilMoisturePercent: number;
  soilTempCelsius: number;
  evapotranspirationEt0Mm: number; // ET0 mm/day
  sprayWindowViability: 'Optimal' | 'Caution' | 'Unfavorable';
  sprayWindowReason: string;
  frostRisk: 'None' | 'Low' | 'Moderate' | 'High' | 'Severe';
  frostWindowEstimated?: string;
  irrigationRecommendation: 'No Irrigation Needed' | 'Light Irrigation Recommended' | 'Heavy Irrigation Required' | 'Hold (Rain Imminent)';
  growingDegreeDaysGdd: number;
  pestRiskIndex: 'Low' | 'Medium' | 'Elevated' | 'High';
  harvestWindowForecast: {
    day: string;
    condition: string;
    dryingSpeed: 'Fast' | 'Moderate' | 'Slow';
    workability: 'Optimal' | 'Fair' | 'Muddy';
  }[];
  cropAdvice: string[];
}

export interface StudentDashboardData {
  campusCommuteRating: 'Clear' | 'Carry Umbrella' | 'Heavy Rain Warning' | 'Extreme Weather';
  transitModeAdvice: {
    walking: { status: 'Good' | 'Fair' | 'Not Recommended'; text: string };
    cycling: { status: 'Good' | 'Fair' | 'Not Recommended'; text: string };
    publicTransit: { status: 'Recommended' | 'Standard' | 'Delays Possible'; text: string };
  };
  outdoorSportsIndex: number; // 0-100
  outdoorSportsVerdict: 'Excellent' | 'Good' | 'Fair' | 'Avoid Outdoor Sports';
  studyComfortScore: number; // 0-100 (based on indoor temp/humidity/outdoor AQI)
  studyComfortNotes: string;
  uvProtectionLevel: 'No Protection Needed' | 'Sunglasses & Hat' | 'SPF 30+ & Shade' | 'Stay Indoors';
  examDayWeatherOutlook: {
    timeSlot: string;
    temp: string;
    rainProb: number;
    advisory: string;
  }[];
}

export interface TravelItineraryCity {
  id: string;
  cityName: string;
  country: string;
  dates: string;
  tempRange: string;
  weatherCondition: string;
  icon: string;
  rainChance: number;
  flightTurbulenceRisk: 'Low' | 'Moderate' | 'High';
  packingChecklist: string[];
  localAlerts: string[];
}

export interface TravelerDashboardData {
  itinerary: TravelItineraryCity[];
  generalPackingAdvice: string[];
  jetlagSunlightAdvice: string;
  localTimeAndSun: {
    localTime: string;
    timezoneName: string;
    daylightRemainingHours: number;
  };
  emergencyServicesNumber: string;
}

export interface PhotographerOpticsData {
  goldenHourMorning: { start: string; end: string; quality: 'Pristine' | 'Good' | 'Cloudy' };
  goldenHourEvening: { start: string; end: string; quality: 'Pristine' | 'Good' | 'Cloudy' };
  blueHourMorning: { start: string; end: string; mood: string };
  blueHourEvening: { start: string; end: string; mood: string };
  cloudCeiling: {
    lowCloudPercent: number;
    midCloudPercent: number;
    highCloudPercent: number;
    cloudBaseMeters: number;
    dramaticSunsetScore: number; // 0-100
  };
  sunAzimuthDegrees: number;
  sunElevationDegrees: number;
  moonAzimuthDegrees: number;
  moonElevationDegrees: number;
  moonIlluminationPercent: number;
  moonPhaseName: string;
  fogMistForecast: {
    chancePercent: number;
    predictedValleyFog: boolean;
    goldenMistTime?: string;
  };
  lensRecommendation: string;
}

export interface AstronomyEnthusiastData {
  bortleDarkSkyClass: number; // 1 (Pristine dark) to 9 (Inner city)
  bortleDescription: string;
  nakedEyeLimitingMagnitude: number; // e.g. 6.5
  nightCloudForecast: {
    hour: string;
    cloudCoverPercent: number;
    transparencyRating: 'Excellent' | 'Good' | 'Average' | 'Poor';
    seeingConditions: 'Steady' | 'Moderate' | 'Turbulent';
  }[];
  activeMeteorShowers: {
    name: string;
    radiantConstellation: string;
    peakDate: string;
    zenithalHourlyRateZhr: number;
    moonInterference: 'None' | 'Low' | 'Significant' | 'High';
    viewingWindow: string;
  }[];
  upcomingEclipses: {
    type: 'Total Solar' | 'Annular Solar' | 'Partial Solar' | 'Total Lunar' | 'Partial Lunar';
    date: string;
    visibilityRegion: string;
    countdownDays: number;
    peakUtc: string;
  }[];
  satellitePasses: {
    target: 'ISS (International Space Station)' | 'Hubble' | 'Tiangong' | 'Starlink Train';
    time: string;
    durationMinutes: number;
    maxElevationDegrees: number;
    brightnessMagnitude: number;
  }[];
  stargazingIndex: number; // 0-100
}
