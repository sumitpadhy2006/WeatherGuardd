// astronomyMath.ts
// Mathematical utilities for predicting planetary and lunar states

/**
 * Calculates the lunar phase for any given date.
 * Returns a value between 0 and 1, where 0/1 is New Moon, 0.5 is Full Moon.
 */
export const getMoonPhaseValue = (date: Date): number => {
  // Convert JS date to Julian Date
  const jd = (date.getTime() / 86400000) + 2440587.5;
  
  // Known New Moon epoch: Jan 6, 2000, 18:14 UTC
  const newMoonJd = 2451550.25972; 
  
  // Average length of a synodic month
  const synodicMonth = 29.53058867;
  
  const phase = ((jd - newMoonJd) % synodicMonth) / synodicMonth;
  return phase < 0 ? phase + 1 : phase;
};

export const getMoonPhaseName = (phase: number): string => {
  if (phase < 0.03 || phase > 0.97) return 'New Moon';
  if (phase < 0.22) return 'Waxing Crescent';
  if (phase < 0.28) return 'First Quarter';
  if (phase < 0.47) return 'Waxing Gibbous';
  if (phase < 0.53) return 'Full Moon';
  if (phase < 0.72) return 'Waning Gibbous';
  if (phase < 0.78) return 'Last Quarter';
  return 'Waning Crescent';
};

/**
 * Simplified heuristic for eclipses (they occur near nodes when phase is 0 or 0.5).
 * Real eclipse calculation requires complex JPL ephemeris, but this is a lightweight 
 * approximation used to highlight "Eclipse Seasons" on the calendar.
 */
export const isEclipseSeason = (date: Date): boolean => {
  // Eclipse seasons happen approx every 173.3 days.
  // We'll use a known eclipse epoch (e.g., April 8, 2024 total solar eclipse)
  const epoch = new Date('2024-04-08T18:00:00Z').getTime();
  const msInDay = 86400000;
  const daysSinceEpoch = (date.getTime() - epoch) / msInDay;
  
  // A draconic month (node to node) is 27.21222 days.
  // We check if the sun is near the node.
  const eclipseCycleDays = 173.31; 
  
  const cycleOffset = Math.abs((daysSinceEpoch % eclipseCycleDays) / eclipseCycleDays);
  // If we are within 5% of an eclipse season node
  return cycleOffset < 0.05 || cycleOffset > 0.95;
};

export const getMajorMeteorShower = (date: Date): string | null => {
  const month = date.getMonth();
  const day = date.getDate();
  
  if (month === 0 && day >= 3 && day <= 4) return 'Quadrantids';
  if (month === 3 && day >= 21 && day <= 22) return 'Lyrids';
  if (month === 4 && day >= 5 && day <= 6) return 'Eta Aquariids';
  if (month === 7 && day >= 11 && day <= 13) return 'Perseids';
  if (month === 9 && day >= 20 && day <= 22) return 'Orionids';
  if (month === 10 && day >= 17 && day <= 18) return 'Leonids';
  if (month === 11 && day >= 13 && day <= 15) return 'Geminids';
  
  return null;
};
