import { Body, HelioVector, GeoVector, MakeTime } from 'astronomy-engine';
import { PlanetId } from './solarSystemPropagation';

/**
 * Calculates the current orbital angle (heliocentric ecliptic longitude) 
 * for a given planet using astronomy-engine.
 * 
 * @param planetId The id of the planet.
 * @param date The date to calculate for (defaults to now).
 * @returns The angle in radians.
 */
export function getRealtimePlanetAngle(planetId: PlanetId, date: Date = new Date()): number {
  if (planetId === 'sun') return 0;

  const time = MakeTime(date);

  try {
    if (planetId === 'moon') {
      // For the Moon, we want its angle relative to Earth, not the Sun!
      const geoVector = GeoVector(Body.Moon, time, true);
      // We map the geocentric x, y to our X, Z plane.
      return Math.atan2(geoVector.y, geoVector.x);
    }

    // Map string IDs to astronomy-engine Body enums
    const bodyMap: Record<string, Body> = {
      mercury: Body.Mercury,
      venus: Body.Venus,
      earth: Body.Earth,
      mars: Body.Mars,
      jupiter: Body.Jupiter,
      saturn: Body.Saturn,
      uranus: Body.Uranus,
      neptune: Body.Neptune,
    };

    const body = bodyMap[planetId.toLowerCase()];
    if (!body) return 0;

    // Get heliocentric coordinates (relative to Sun)
    const helioVector = HelioVector(body, time);
    
    // Calculate angle in radians
    // helioVector.x and helioVector.y are in the ecliptic plane.
    return Math.atan2(helioVector.y, helioVector.x);
  } catch (err) {
    console.error(`Failed to calculate angle for ${planetId}:`, err);
    return 0;
  }
}
