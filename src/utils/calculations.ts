/**
 * Precision scientific meteorological and astronomical calculations for WeatherGuard
 */

/**
 * Calculates accurate Dew Point using the Magnus-Tetens approximation formula
 */
export function calculateDewPoint(tempC: number, relativeHumidityPercent: number): number {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * tempC) / (b + tempC)) + Math.log(Math.max(1, relativeHumidityPercent) / 100);
  const dewPoint = (b * alpha) / (a - alpha);
  return Math.round(dewPoint * 10) / 10;
}

/**
 * Calculates Australian Apparent Temperature / Heat Index / Wind Chill Feels-Like
 */
export function calculateFeelsLike(tempC: number, humidityPercent: number, windSpeedMs: number): number {
  const e = (humidityPercent / 100) * 6.105 * Math.exp((17.27 * tempC) / (237.7 + tempC));
  // Australian Bureau of Meteorology Apparent Temp formula
  const at = tempC + 0.33 * e - 0.7 * windSpeedMs - 4.0;
  return Math.round(at * 10) / 10;
}

/**
 * Calculates Stargazing Quality Index (SQI: 0 - 100)
 * Evaluates Cloud Cover (50%), Moon Illumination & Elevation (25%), Humidity (15%), and Wind (10%)
 */
export function calculateStargazingScore(
  cloudCoverPercent: number,
  moonIlluminationPercent: number,
  humidityPercent: number,
  windSpeedKmh: number
): { score: number; rating: 'Pristine' | 'Good' | 'Fair' | 'Poor'; factors: string[] } {
  let score = 100;
  const factors: string[] = [];

  // Cloud penalty (up to 55 points)
  const cloudPenalty = (cloudCoverPercent / 100) * 55;
  score -= cloudPenalty;
  if (cloudCoverPercent > 60) factors.push('High cloud obstruction');
  else if (cloudCoverPercent > 20) factors.push('Scattered light clouds');

  // Moon penalty (up to 25 points)
  const moonPenalty = (moonIlluminationPercent / 100) * 25;
  score -= moonPenalty;
  if (moonIlluminationPercent > 70) factors.push('Bright moonlight glare');
  else if (moonIlluminationPercent < 20) factors.push('Ideal dark-sky window');

  // Humidity penalty (fog/dew potential, up to 12 points)
  if (humidityPercent > 80) {
    score -= 12;
    factors.push('High moisture/dew haze');
  } else if (humidityPercent > 60) {
    score -= 6;
  }

  // Wind turbulence penalty (seeing instability, up to 8 points)
  if (windSpeedKmh > 30) {
    score -= 8;
    factors.push('Wind jitter degrades telescope seeing');
  }

  const finalScore = Math.max(5, Math.min(100, Math.round(score)));

  let rating: 'Pristine' | 'Good' | 'Fair' | 'Poor' = 'Poor';
  if (finalScore >= 80) rating = 'Pristine';
  else if (finalScore >= 65) rating = 'Good';
  else if (finalScore >= 45) rating = 'Fair';

  return { score: finalScore, rating, factors };
}

/**
 * Estimates safe sun exposure burn time based on UV Index and Fitzpatrick Skin Type
 * Type I: Very Fair, Type II: Fair, Type III: Medium, Type IV: Olive/Dark
 */
export function calculateSunBurnTimeMinutes(uvIndex: number, skinType: 1 | 2 | 3 | 4 = 2): number {
  if (uvIndex <= 1) return 180; // Minimal burn risk
  const baseMinutesByType = {
    1: 67, // Very sensitive
    2: 100, // Fair
    3: 150, // Medium
    4: 200, // Olive / Dark
  };
  const minutes = (baseMinutesByType[skinType] / uvIndex) * 1.5;
  return Math.max(8, Math.round(minutes));
}

/**
 * Returns wind direction 16-point cardinal compass text from degrees (0-360)
 */
export function getWindCardinal(deg: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW'
  ];
  const index = Math.round(((deg % 360) / 22.5)) % 16;
  return directions[index];
}

/**
 * Returns Beaufort wind scale description and rating
 */
export function getBeaufortScale(speedKmh: number): { scale: number; label: string; effect: string } {
  if (speedKmh < 1) return { scale: 0, label: 'Calm', effect: 'Smoke rises vertically' };
  if (speedKmh <= 5) return { scale: 1, label: 'Light Air', effect: 'Smoke drift indicates direction' };
  if (speedKmh <= 11) return { scale: 2, label: 'Light Breeze', effect: 'Leaves rustle; vanes moved by wind' };
  if (speedKmh <= 19) return { scale: 3, label: 'Gentle Breeze', effect: 'Leaves and small twigs in constant motion' };
  if (speedKmh <= 28) return { scale: 4, label: 'Moderate Breeze', effect: 'Raises dust and loose paper' };
  if (speedKmh <= 38) return { scale: 5, label: 'Fresh Breeze', effect: 'Small trees in leaf begin to sway' };
  if (speedKmh <= 49) return { scale: 6, label: 'Strong Breeze', effect: 'Large branches in motion; umbrellas hard to use' };
  if (speedKmh <= 61) return { scale: 7, label: 'Near Gale', effect: 'Whole trees in motion; resistance walking against wind' };
  if (speedKmh <= 74) return { scale: 8, label: 'Gale', effect: 'Twigs break off trees; progress generally impeded' };
  return { scale: 9, label: 'Severe Gale / Storm', effect: 'Slight structural damage occurs' };
}

/**
 * Evaluates lifestyle & operational decision indices
 */
export interface LifestyleScores {
  running: { score: number; status: 'Ideal' | 'Good' | 'Fair' | 'Poor'; advice: string };
  droneFlight: { score: number; status: 'Safe' | 'Caution' | 'Unsafe'; advice: string };
  agriculturalSpraying: { score: number; status: 'Favorable' | 'Suboptimal' | 'Do Not Spray'; advice: string };
  outdoorEvents: { score: number; status: 'Excellent' | 'Good' | 'Challenging'; advice: string };
}

export function evaluateLifestyleIndices(
  tempC: number,
  humidity: number,
  windSpeedKmh: number,
  pop: number,
  aqi: number,
  uvIndex: number
): LifestyleScores {
  // Running score
  let runScore = 100;
  if (tempC > 28 || tempC < 0) runScore -= 30;
  else if (tempC > 23 || tempC < 6) runScore -= 15;
  if (humidity > 80 && tempC > 20) runScore -= 20;
  if (pop > 0.4) runScore -= 25;
  if (aqi > 100) runScore -= 40;
  if (windSpeedKmh > 30) runScore -= 15;
  runScore = Math.max(10, Math.min(100, runScore));

  let runStatus: 'Ideal' | 'Good' | 'Fair' | 'Poor' = 'Poor';
  let runAdvice = 'Adverse conditions for high-exertion cardio.';
  if (runScore >= 80) {
    runStatus = 'Ideal';
    runAdvice = 'Optimal thermal balance & pristine atmospheric clarity.';
  } else if (runScore >= 60) {
    runStatus = 'Good';
    runAdvice = 'Pleasant conditions; stay hydrated.';
  } else if (runScore >= 40) {
    runStatus = 'Fair';
    runAdvice = 'Tolerable; moderate your pacing.';
  }

  // Drone flight score
  let droneScore = 100;
  if (windSpeedKmh > 35) droneScore -= 50;
  else if (windSpeedKmh > 22) droneScore -= 25;
  if (pop > 0.2) droneScore -= 40;
  droneScore = Math.max(10, Math.min(100, droneScore));

  let droneStatus: 'Safe' | 'Caution' | 'Unsafe' = 'Safe';
  let droneAdvice = 'Low wind shear; safe for stable flight and gimbal capture.';
  if (droneScore < 45 || windSpeedKmh > 35 || pop > 0.4) {
    droneStatus = 'Unsafe';
    droneAdvice = 'High wind gusts or moisture pose serious motor/flyaway risks.';
  } else if (droneScore < 75) {
    droneStatus = 'Caution';
    droneAdvice = 'Moderate gusts; monitor battery and keep line of sight.';
  }

  // Agricultural spraying score (Requires wind between 5-15 km/h, 0 rain, low temp/high humidity to prevent drift)
  let sprayStatus: 'Favorable' | 'Suboptimal' | 'Do Not Spray' = 'Favorable';
  let sprayAdvice = 'Optimal wind velocity & low drift evaporation risk.';
  let sprayScore = 90;

  if (windSpeedKmh > 20 || pop > 0.3 || tempC > 30) {
    sprayStatus = 'Do Not Spray';
    sprayScore = 20;
    sprayAdvice = pop > 0.3 ? 'Imminent rain wash-off risk.' : 'Excessive wind drift or heat volatilization.';
  } else if (windSpeedKmh < 4 || windSpeedKmh > 15 || tempC > 26) {
    sprayStatus = 'Suboptimal';
    sprayScore = 55;
    sprayAdvice = windSpeedKmh < 4 ? 'Atmospheric inversion risk (calm air drift).' : 'Marginal wind drift.';
  }

  // Outdoor events
  let eventStatus: 'Excellent' | 'Good' | 'Challenging' = 'Excellent';
  let eventAdvice = 'Clear skies and comfortable ambient temperature.';
  let eventScore = 95;
  if (pop > 0.5 || tempC < 5 || tempC > 35 || windSpeedKmh > 40) {
    eventStatus = 'Challenging';
    eventScore = 30;
    eventAdvice = pop > 0.5 ? 'High rain probability; shelter required.' : 'Severe temperature or wind conditions.';
  } else if (pop > 0.2 || uvIndex > 8 || tempC > 30) {
    eventStatus = 'Good';
    eventScore = 70;
    eventAdvice = 'Generally fine; provide shade and hydration.';
  }

  return {
    running: { score: runScore, status: runStatus, advice: runAdvice },
    droneFlight: { score: droneScore, status: droneStatus, advice: droneAdvice },
    agriculturalSpraying: { score: sprayScore, status: sprayStatus, advice: sprayAdvice },
    outdoorEvents: { score: eventScore, status: eventStatus, advice: eventAdvice },
  };
}
