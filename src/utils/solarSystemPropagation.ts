// Solar System Radiation Propagation Utility

export type PlanetId = 'sun' | 'mercury' | 'venus' | 'earth' | 'moon' | 'mars' | 'phobos' | 'deimos' | 'jupiter' | 'ganymede' | 'callisto' | 'io' | 'europa' | 'saturn' | 'titan' | 'rhea' | 'iapetus' | 'enceladus' | 'mimas' | 'uranus' | 'titania' | 'oberon' | 'miranda' | 'neptune' | 'triton';

export interface PlanetPropagationData {
  id: PlanetId;
  name: string;
  distanceAu: number;
  distanceKm: number;
  travelTimeSeconds: number;
  travelTimeFormatted: string;
  arrivalDate: Date | null;
  relevance: string;
  colorHex: string;
}

const AU_IN_KM = 149597870.7;
const SPEED_OF_LIGHT_KMS = 299792.458;
const SECONDS_PER_AU = AU_IN_KM / SPEED_OF_LIGHT_KMS;

// Average distances from the Sun in Astronomical Units (AU)
const PLANET_CONSTANTS: Array<{ id: PlanetId; name: string; distanceAu: number; relevance: string; colorHex: string }> = [
  { id: 'sun', name: 'Sun', distanceAu: 0.000, relevance: 'Source of space weather. Generates solar flares, CMEs, and solar wind.', colorHex: '#FBBF24' },
  { id: 'mercury', name: 'Mercury', distanceAu: 0.387, relevance: 'Extreme surface radiation exposure. No atmosphere to block x-rays.', colorHex: '#9CA3AF' },
  { id: 'venus', name: 'Venus', distanceAu: 0.723, relevance: 'Thick atmosphere absorbs x-rays. Minimal surface impact.', colorHex: '#FCD34D' },
  { id: 'earth', name: 'Earth', distanceAu: 1.000, relevance: 'Potential HF radio disruption and ionospheric disturbance on sunlit side.', colorHex: '#60A5FA' },
  { id: 'moon', name: 'Moon', distanceAu: 1.002, relevance: 'No atmosphere or magnetic field. Extreme radiation risk to surface operations and equipment.', colorHex: '#cbd5e1' },
  { id: 'mars', name: 'Mars', distanceAu: 1.524, relevance: 'Thin atmosphere provides minimal shielding. Radiation risk to surface operations.', colorHex: '#F87171' },
  { id: 'phobos', name: 'Phobos', distanceAu: 1.524, relevance: 'Inner moon of Mars. No atmosphere. High radiation exposure risk.', colorHex: '#8b5a2b' },
  { id: 'deimos', name: 'Deimos', distanceAu: 1.524, relevance: 'Outer moon of Mars. Small, irregular asteroid-like body. High radiation exposure risk.', colorHex: '#b0a69a' },
  { id: 'jupiter', name: 'Jupiter', distanceAu: 5.203, relevance: 'Massive magnetosphere interacts with radiation. Intense auroras.', colorHex: '#FBBF24' },
  { id: 'ganymede', name: 'Ganymede', distanceAu: 5.203, relevance: 'Largest moon in the solar system. Has its own magnetic field and an underground saltwater ocean.', colorHex: '#cbd5e1' },
  { id: 'callisto', name: 'Callisto', distanceAu: 5.203, relevance: 'Heavily cratered, ancient frozen crust.', colorHex: '#94a3b8' },
  { id: 'io', name: 'Io', distanceAu: 5.203, relevance: 'Most volcanically active world in the solar system.', colorHex: '#fcd34d' },
  { id: 'europa', name: 'Europa', distanceAu: 5.203, relevance: 'Super-smooth ice sheet hiding a global liquid ocean.', colorHex: '#e2e8f0' },
  { id: 'saturn', name: 'Saturn', distanceAu: 9.537, relevance: 'Ring system and magnetosphere interactions. Auroral activity.', colorHex: '#FDE68A' },
  { id: 'titan', name: 'Titan', distanceAu: 9.537, relevance: 'Second-largest moon. Has a dense atmosphere and liquid methane/ethane lakes.', colorHex: '#fb923c' },
  { id: 'rhea', name: 'Rhea', distanceAu: 9.537, relevance: 'Medium-sized icy moon of Saturn.', colorHex: '#cbd5e1' },
  { id: 'iapetus', name: 'Iapetus', distanceAu: 9.537, relevance: 'Two-toned "Yin-Yang" appearance with a massive equatorial mountain wall.', colorHex: '#f8fafc' },
  { id: 'enceladus', name: 'Enceladus', distanceAu: 9.537, relevance: 'Shoots massive geysers of water vapor from surface cracks. Supplies the E-ring.', colorHex: '#e2e8f0' },
  { id: 'mimas', name: 'Mimas', distanceAu: 9.537, relevance: 'The "Death Star" moon due to its colossal Herschel impact crater.', colorHex: '#94a3b8' },
  { id: 'uranus', name: 'Uranus', distanceAu: 19.191, relevance: 'Asymmetric magnetic field interaction.', colorHex: '#93C5FD' },
  { id: 'titania', name: 'Titania', distanceAu: 19.191, relevance: 'Largest moon of Uranus. Composed of rock and ice.', colorHex: '#cbd5e1' },
  { id: 'oberon', name: 'Oberon', distanceAu: 19.191, relevance: 'Second largest Uranian moon.', colorHex: '#94a3b8' },
  { id: 'miranda', name: 'Miranda', distanceAu: 19.191, relevance: 'Chaotic landscape with the tallest known cliff in the solar system (Verona Rupes).', colorHex: '#e2e8f0' },
  { id: 'neptune', name: 'Neptune', distanceAu: 30.069, relevance: 'Distant and weak solar radiation effects.', colorHex: '#3B82F6' },
  { id: 'triton', name: 'Triton', distanceAu: 30.069, relevance: 'Captured rogue planet in retrograde orbit. Features active nitrogen geysers.', colorHex: '#bfdbfe' },
];

export function formatTravelTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins < 60) {
    if (secs === 0) return `~${mins} min`;
    return `~${mins}m ${secs}s`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `~${hours}h ${remainingMins}m`;
}

export function getPlanetPropagation(peakTime: string | number | null | undefined): PlanetPropagationData[] {
  const peakDate = peakTime ? new Date(peakTime) : null;
  const peakTimeMs = peakDate ? peakDate.getTime() : null;

  return PLANET_CONSTANTS.map(p => {
    const travelTimeSeconds = p.distanceAu * SECONDS_PER_AU;
    
    let arrivalDate = null;
    if (peakTimeMs) {
      arrivalDate = new Date(peakTimeMs + travelTimeSeconds * 1000);
    }

    return {
      id: p.id,
      name: p.name,
      distanceAu: p.distanceAu,
      distanceKm: p.distanceAu * AU_IN_KM,
      travelTimeSeconds,
      travelTimeFormatted: formatTravelTime(travelTimeSeconds),
      arrivalDate,
      relevance: p.relevance,
      colorHex: p.colorHex
    };
  });
}
