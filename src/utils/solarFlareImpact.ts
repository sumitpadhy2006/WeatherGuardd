export interface AffectedRegion {
  name: string;
  isAffected: boolean;
}

/**
 * Calculates a very rough approximation of the subsolar longitude given a UTC time.
 * This determines which side of the Earth is facing the sun.
 * 
 * @param date The UTC date of the event
 * @returns Longitude in degrees (-180 to 180) where the sun is directly overhead
 */
export const getSubsolarLongitude = (date: Date): number => {
  // Rough calculation:
  // At 12:00 UTC, the subsolar longitude is roughly 0 (Prime Meridian).
  // The Earth rotates 15 degrees per hour.
  const hoursUTC = date.getUTCHours() + date.getUTCMinutes() / 60;
  let longitude = (12 - hoursUTC) * 15;
  
  if (longitude > 180) longitude -= 360;
  if (longitude < -180) longitude += 360;
  
  return longitude;
};

/**
 * Determines which major regions are potentially affected (on the sunlit side)
 * by a sudden ionospheric disturbance (like a solar flare).
 * 
 * @param eventTime The time of the solar flare (peak time is best)
 * @returns List of potentially affected regions
 */
export const getPotentiallyAffectedRegions = (eventTime: string | null): AffectedRegion[] => {
  if (!eventTime) {
    return [];
  }

  const date = new Date(eventTime);
  const subsolarLon = getSubsolarLongitude(date);

  // Define some very rough longitude bounds for major regions
  // A region is considered "sunlit" if its longitude is within roughly 90 degrees of the subsolar longitude.
  const regions = [
    { name: 'North America', centerLon: -100 },
    { name: 'South America', centerLon: -60 },
    { name: 'Europe / Africa', centerLon: 15 },
    { name: 'Asia', centerLon: 90 },
    { name: 'Australia / Pacific', centerLon: 140 },
  ];

  return regions
    .map(region => {
      // Calculate shortest angular distance
      let diff = Math.abs(region.centerLon - subsolarLon);
      if (diff > 180) {
        diff = 360 - diff;
      }
      
      // If the center is within 90 degrees, it's roughly on the day side
      return {
        name: region.name,
        isAffected: diff <= 90
      };
    })
    .filter(region => region.isAffected);
};
