import { UserPreferences } from '../types';

/**
 * Converts Temperature from Celsius to user configured unit
 */
export function toUserTemp(tempC: number, prefs?: Partial<UserPreferences>): number {
  const isFahrenheit = prefs?.tempUnit === 'F' || prefs?.units === 'imperial';
  if (isFahrenheit) {
    return Math.round((tempC * 9) / 5 + 32);
  }
  return Math.round(tempC);
}

export function formatTemperature(tempC: number, prefs?: Partial<UserPreferences>): string {
  const isFahrenheit = prefs?.tempUnit === 'F' || prefs?.units === 'imperial';
  if (isFahrenheit) {
    const tempF = Math.round((tempC * 9) / 5 + 32);
    return `${tempF}°`;
  }
  return `${Math.round(tempC)}°`;
}

export function formatTemperatureWithUnit(tempC: number, prefs?: Partial<UserPreferences>): string {
  const isFahrenheit = prefs?.tempUnit === 'F' || prefs?.units === 'imperial';
  if (isFahrenheit) {
    const tempF = Math.round((tempC * 9) / 5 + 32);
    return `${tempF}°F`;
  }
  return `${Math.round(tempC)}°C`;
}

/**
 * Converts Wind Speed from km/h (or m/s) to user configured unit
 */
export function formatWindSpeed(speedKmh: number, prefs?: Partial<UserPreferences>): string {
  const unit = prefs?.speedUnit || (prefs?.units === 'imperial' ? 'mph' : 'km/h');
  switch (unit) {
    case 'mph':
      return `${Math.round(speedKmh * 0.621371)} mph`;
    case 'm/s':
      return `${Math.round((speedKmh / 3.6) * 10) / 10} m/s`;
    case 'knots':
      return `${Math.round(speedKmh * 0.539957)} kts`;
    case 'km/h':
    default:
      return `${Math.round(speedKmh)} km/h`;
  }
}

/**
 * Converts Pressure from hPa to user configured unit
 */
export function formatPressure(pressureHpa: number, prefs?: Partial<UserPreferences>): string {
  const unit = prefs?.pressureUnit || 'hPa';
  switch (unit) {
    case 'inHg':
      return `${(pressureHpa * 0.02953).toFixed(2)} inHg`;
    case 'mmHg':
      return `${Math.round(pressureHpa * 0.750062)} mmHg`;
    case 'hPa':
    default:
      return `${Math.round(pressureHpa)} hPa`;
  }
}

/**
 * Formats precipitation amount
 */
export function formatPrecipitation(mm: number, prefs?: Partial<UserPreferences>): string {
  const unit = prefs?.rainUnit || (prefs?.units === 'imperial' ? 'in' : 'mm');
  if (unit === 'in') {
    return `${(mm * 0.0393701).toFixed(2)} in`;
  }
  return `${Math.round(mm * 10) / 10} mm`;
}

/**
 * Formats UNIX epoch timestamp to localized 12h/24h time string
 */
export function formatTime(timestampSec: number): string {
  const date = new Date(timestampSec * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Formats timestamp to Day Name (e.g. "Today", "Mon", "Tue")
 */
export function formatDayName(timestampSec: number, index: number = 0): string {
  if (index === 0) return 'Today';
  const date = new Date(timestampSec * 1000);
  return date.toLocaleDateString([], { weekday: 'short' });
}

/**
 * Formats geographic coordinates into clean scientific notation (e.g. "47.6°N 122.3°W")
 */
export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(1)}°${latDir} ${Math.abs(lon).toFixed(1)}°${lonDir}`;
}

/**
 * Formats distance in km or miles
 */
export function formatDistanceKm(distanceKm: number, prefs?: Partial<UserPreferences>): string {
  const isImperial = prefs?.units === 'imperial';
  if (isImperial) {
    const miles = Math.round(distanceKm * 0.621371);
    return `${miles.toLocaleString()} mi`;
  }
  return `${Math.round(distanceKm).toLocaleString()} km`;
}

/**
 * Returns initials from a full name string
 */
export function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

