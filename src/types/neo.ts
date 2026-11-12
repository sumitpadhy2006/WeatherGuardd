export interface NeoEstimatedDiameter {
  kilometers: {
    estimated_diameter_min: number;
    estimated_diameter_max: number;
  };
  meters: {
    estimated_diameter_min: number;
    estimated_diameter_max: number;
  };
  miles: {
    estimated_diameter_min: number;
    estimated_diameter_max: number;
  };
  feet: {
    estimated_diameter_min: number;
    estimated_diameter_max: number;
  };
}

export interface NeoCloseApproachData {
  close_approach_date: string;
  close_approach_date_full: string;
  epoch_date_close_approach: number;
  relative_velocity: {
    kilometers_per_second: string;
    kilometers_per_hour: string;
    miles_per_hour: string;
  };
  miss_distance: {
    astronomical: string;
    lunar: string;
    kilometers: string;
    miles: string;
  };
  orbiting_body: string;
}

export interface NeoOrbitClass {
  orbit_class_type: 'Apollo' | 'Aten' | 'Amor' | 'Atira' | 'IEO' | 'Parabolic Asteroid' | 'Other';
  orbit_class_description: string;
  orbit_class_range: string;
}

export interface NeoOrbitalData {
  orbit_id?: string;
  orbit_determination_date?: string;
  first_observation_date?: string;
  last_observation_date?: string;
  data_arc_in_days?: number;
  observations_used?: number;
  orbit_uncertainty?: string;
  minimum_orbit_intersection?: string; // MOID in AU
  jupiter_tisserand_invariant?: string;
  epoch_osculation?: string;
  eccentricity: string;
  semi_major_axis: string;
  inclination: string;
  ascending_node_longitude?: string;
  orbital_period: string;
  perihelion_distance: string;
  perihelion_argument?: string;
  aphelion_distance: string;
  perihelion_time?: string;
  mean_anomaly?: string;
  mean_motion?: string;
  equinox?: string;
  orbit_class?: NeoOrbitClass;
}

export interface SentryImpactData {
  spkId: string;
  designation: string;
  impact_probability: number; // e.g. 1 in 2700 (0.00037)
  impact_probability_str: string;
  v_infinity: number; // km/s
  palermo_scale_ave: number;
  palermo_scale_max: number;
  torino_scale: number;
  potential_impacts_count: number;
  potential_impact_years_range: string;
  energy_mt: number; // Megatons
}

export interface NeoHazardMetrics {
  torinoScale: number; // 0 to 10
  torinoRating: 'No Hazard' | 'Normal' | 'Meriting Attention' | 'Threatening' | 'Certain Collision';
  torinoColor: string; // Hex or tailwind class
  torinoDescription: string;
  palermoScale: number; // e.g. -8.5 to +1.0
  palermoRating: 'No Hazard' | 'Careful Monitoring' | 'Concern' | 'High Risk';
  hazardSeverityIndex: number; // 0 - 100 normalized score
  hazardLevel: 'Nominal' | 'Watch' | 'Elevated' | 'Critical';
  kineticEnergyMegatons: number; // Megatons of TNT
  craterDiameterMeters: number;
  tntEquivalentDescription: string;
  moidLunarDistances: number;
  velocityKms: number;
  closestMissDistanceLd: number;
  closestMissDistanceKm: number;
  closestApproachDate: string;
  isCloseApproachWithinMoonOrbit: boolean; // < 1.0 LD
  comparisonLandmark: {
    name: string;
    heightM: number;
    ratio: number;
    icon: string;
  };
}

export interface NearEarthObject {
  id: string;
  neo_reference_id: string;
  name: string;
  name_limited?: string;
  designation: string;
  nasa_jpl_url: string;
  absolute_magnitude_h: number;
  estimated_diameter: NeoEstimatedDiameter;
  is_potentially_hazardous_asteroid: boolean;
  is_sentry_object: boolean;
  sentry_data?: SentryImpactData;
  close_approach_data: NeoCloseApproachData[];
  orbital_data?: NeoOrbitalData;
  hazardScore: NeoHazardMetrics;
  spectralType?: string; // 'C-type' | 'S-type' | 'M-type' | 'V-type' | 'B-type' | 'X-type'
  compositionSummary?: string;
  albedo?: number;
  rotationPeriodHours?: number;
  discoveryYear?: number;
  futureEncounters?: NeoCloseApproachData[];
}

export interface NeoFeedSummary {
  element_count: number;
  hazardous_count: number;
  sentry_risk_count: number;
  closest_approach_today?: NearEarthObject;
  largest_asteroid_today?: NearEarthObject;
  fastest_asteroid_today?: NearEarthObject;
  most_hazardous_today?: NearEarthObject;
  closestWithinMoonOrbitCount: number;
  startDate: string;
  endDate: string;
  lastUpdated: number;
}

export interface NeoOverviewPayload {
  summary: NeoFeedSummary;
  asteroids: NearEarthObject[];
  sentryWatchlist: NearEarthObject[];
  famousAsteroids: NearEarthObject[];
  source: 'live_neows' | 'verified_jpl_horizons';
  lastUpdated: number;
}

export type NeoSortField = 'date' | 'distance' | 'size' | 'velocity' | 'hazardScore' | 'name' | 'magnitude';
export type NeoSortOrder = 'asc' | 'desc';
export type NeoSizeFilter = 'all' | 'small' | 'medium' | 'large' | 'city_killer' | 'planet_killer';
export type NeoOrbitFilter = 'all' | 'Apollo' | 'Aten' | 'Amor' | 'Atira';
