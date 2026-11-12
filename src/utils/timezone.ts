import { GeoLocationItem } from '../types';

/**
 * Maps known cities and countries to IANA timezone identifiers.
 */
export function getTimezoneForLocation(location: GeoLocationItem): string {
  if (location.timezone) {
    return location.timezone;
  }

  const name = (location.name || '').toLowerCase().trim();
  const country = (location.country || '').toUpperCase().trim();
  const state = (location.state || '').toLowerCase().trim();
  const lat = location.lat;
  const lon = location.lon;

  // India
  if (
    country === 'IN' ||
    country === 'INDIA' ||
    name.includes('mumbai') ||
    name.includes('delhi') ||
    name.includes('bangalore') ||
    name.includes('bengaluru') ||
    name.includes('kolkata') ||
    name.includes('calcutta') ||
    name.includes('chennai') ||
    name.includes('hyderabad') ||
    name.includes('pune') ||
    name.includes('ahmedabad') ||
    name.includes('jaipur') ||
    name.includes('lucknow') ||
    name.includes('chandigarh') ||
    name.includes('bhubaneswar') ||
    name.includes('goa') ||
    name.includes('kerala') ||
    name.includes('odisha')
  ) {
    return 'Asia/Kolkata';
  }

  // United Kingdom
  if (
    country === 'GB' ||
    country === 'UK' ||
    name.includes('london') ||
    name.includes('manchester') ||
    name.includes('edinburgh') ||
    name.includes('birmingham') ||
    name.includes('glasgow')
  ) {
    return 'Europe/London';
  }

  // Japan
  if (
    country === 'JP' ||
    country === 'JAPAN' ||
    name.includes('tokyo') ||
    name.includes('osaka') ||
    name.includes('kyoto') ||
    name.includes('yokohama') ||
    name.includes('sapporo') ||
    name.includes('fukuoka')
  ) {
    return 'Asia/Tokyo';
  }

  // United States & regions
  if (country === 'US' || country === 'USA' || country === 'UNITED STATES') {
    if (
      state.includes('washington') ||
      state.includes('california') ||
      state.includes('oregon') ||
      state.includes('nevada') ||
      name.includes('seattle') ||
      name.includes('los angeles') ||
      name.includes('san francisco') ||
      name.includes('san diego') ||
      name.includes('portland') ||
      name.includes('las vegas') ||
      lon < -114
    ) {
      return 'America/Los_Angeles';
    }

    if (
      state.includes('colorado') ||
      state.includes('arizona') ||
      state.includes('utah') ||
      state.includes('new mexico') ||
      name.includes('denver') ||
      name.includes('phoenix') ||
      name.includes('salt lake') ||
      (lon >= -114 && lon < -104)
    ) {
      return state.includes('arizona') || name.includes('phoenix')
        ? 'America/Phoenix'
        : 'America/Denver';
    }

    if (
      state.includes('illinois') ||
      state.includes('texas') ||
      state.includes('minnesota') ||
      state.includes('missouri') ||
      name.includes('chicago') ||
      name.includes('houston') ||
      name.includes('dallas') ||
      name.includes('austin') ||
      name.includes('minneapolis') ||
      (lon >= -104 && lon < -85)
    ) {
      return 'America/Chicago';
    }

    // Default US Eastern
    return 'America/New_York';
  }

  // France
  if (country === 'FR' || name.includes('paris') || name.includes('nice') || name.includes('lyon')) {
    return 'Europe/Paris';
  }

  // Germany
  if (country === 'DE' || name.includes('berlin') || name.includes('munich') || name.includes('frankfurt')) {
    return 'Europe/Berlin';
  }

  // Italy
  if (country === 'IT' || name.includes('rome') || name.includes('milan') || name.includes('venice')) {
    return 'Europe/Rome';
  }

  // Spain
  if (country === 'ES' || name.includes('madrid') || name.includes('barcelona') || name.includes('seville')) {
    return 'Europe/Madrid';
  }

  // UAE / Dubai
  if (country === 'AE' || name.includes('dubai') || name.includes('abu dhabi')) {
    return 'Asia/Dubai';
  }

  // Singapore
  if (country === 'SG' || name.includes('singapore')) {
    return 'Asia/Singapore';
  }

  // China / Hong Kong
  if (
    country === 'CN' ||
    country === 'HK' ||
    name.includes('beijing') ||
    name.includes('shanghai') ||
    name.includes('hong kong') ||
    name.includes('shenzhen') ||
    name.includes('guangzhou')
  ) {
    return 'Asia/Shanghai';
  }

  // Australia
  if (country === 'AU' || country === 'AUSTRALIA') {
    if (name.includes('perth') || lon < 125) {
      return 'Australia/Perth';
    }
    if (name.includes('adelaide')) {
      return 'Australia/Adelaide';
    }
    if (name.includes('brisbane')) {
      return 'Australia/Brisbane';
    }
    return 'Australia/Sydney';
  }

  // Canada
  if (country === 'CA' || country === 'CANADA') {
    if (name.includes('vancouver') || lon < -115) {
      return 'America/Vancouver';
    }
    if (name.includes('calgary') || name.includes('edmonton')) {
      return 'America/Edmonton';
    }
    if (name.includes('winnipeg')) {
      return 'America/Winnipeg';
    }
    return 'America/Toronto';
  }

  // Brazil
  if (country === 'BR' || name.includes('sao paulo') || name.includes('rio')) {
    return 'America/Sao_Paulo';
  }

  // Iceland
  if (country === 'IS' || name.includes('reykjavik')) {
    return 'Atlantic/Reykjavik';
  }

  // Egypt
  if (country === 'EG' || name.includes('cairo')) {
    return 'Africa/Cairo';
  }

  // South Korea
  if (country === 'KR' || name.includes('seoul')) {
    return 'Asia/Seoul';
  }

  // New Zealand
  if (country === 'NZ' || name.includes('auckland') || name.includes('wellington')) {
    return 'Pacific/Auckland';
  }

  // Russia (Moscow)
  if (country === 'RU' || name.includes('moscow')) {
    return 'Europe/Moscow';
  }

  // Saudi Arabia
  if (country === 'SA' || name.includes('riyadh')) {
    return 'Asia/Riyadh';
  }

  // South Africa
  if (country === 'ZA' || name.includes('johannesburg') || name.includes('cape town')) {
    return 'Africa/Johannesburg';
  }

  // Indonesia
  if (country === 'ID' || name.includes('jakarta') || name.includes('bali')) {
    return 'Asia/Jakarta';
  }

  // Thailand
  if (country === 'TH' || name.includes('bangkok')) {
    return 'Asia/Bangkok';
  }

  // Turkey
  if (country === 'TR' || name.includes('istanbul')) {
    return 'Europe/Istanbul';
  }

  // Mexico
  if (country === 'MX' || name.includes('mexico')) {
    return 'America/Mexico_City';
  }

  // Argentina
  if (country === 'AR' || name.includes('buenos aires')) {
    return 'America/Argentina/Buenos_Aires';
  }

  // Fallback by longitude bands
  if (lon >= 65 && lon <= 90 && lat >= 5 && lat <= 38) return 'Asia/Kolkata';
  if (lon >= 125 && lon <= 145 && lat >= 25 && lat <= 50) return 'Asia/Tokyo';
  if (lon >= -10 && lon <= 35 && lat >= 35 && lat <= 70) return 'Europe/Paris';
  if (lon >= -125 && lon <= -110 && lat >= 30 && lat <= 55) return 'America/Los_Angeles';
  if (lon >= -85 && lon <= -65 && lat >= 25 && lat <= 50) return 'America/New_York';
  if (lon >= 110 && lon <= 155 && lat <= -10) return 'Australia/Sydney';

  // Generic UTC approximation fallback
  const offsetHours = Math.round(lon / 15);
  if (offsetHours === 0) return 'UTC';
  
  // Try standard IANA Etc/GMT format
  // Note: Etc/GMT+X is inverted in POSIX (Etc/GMT-5 is UTC+5)
  if (offsetHours > 0) {
    return `Etc/GMT-${offsetHours}`;
  } else {
    return `Etc/GMT+${Math.abs(offsetHours)}`;
  }
}

export interface FormattedLocationTime {
  timeFormatted: string; // e.g. "10:42:15 PM" or "22:42:15"
  hours: string; // "10" or "22"
  minutes: string; // "42"
  seconds: string; // "15"
  ampm?: string; // "AM" or "PM"
  dateFormatted: string; // e.g. "01 Sep 2026"
  dayName: string; // e.g. "Tuesday"
  timezoneName: string; // e.g. "IST", "PST", "JST", "GMT+5:30"
  timezoneCode: string; // e.g. "Asia/Kolkata"
  offsetString: string; // e.g. "UTC+5:30"
}

/**
 * Returns formatted local time, date, and day for a given location in real time.
 */
export function getLocalTimeDetails(
  location: GeoLocationItem,
  date: Date = new Date(),
  use24Hour: boolean = false
): FormattedLocationTime {
  const timeZone = getTimezoneForLocation(location);

  try {
    // Format Time: hr, min, sec
    const timeOptions: Intl.DateTimeFormatOptions = {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: !use24Hour,
    };
    const timeFormatter = new Intl.DateTimeFormat('en-US', timeOptions);
    const timeParts = timeFormatter.formatToParts(date);

    let hours = '00';
    let minutes = '00';
    let seconds = '00';
    let ampm = '';

    timeParts.forEach((p) => {
      if (p.type === 'hour') hours = p.value;
      if (p.type === 'minute') minutes = p.value;
      if (p.type === 'second') seconds = p.value;
      if (p.type === 'dayPeriod') ampm = p.value.toUpperCase();
    });

    const timeFormatted = ampm ? `${hours}:${minutes}:${seconds} ${ampm}` : `${hours}:${minutes}:${seconds}`;

    // Format Date: date mon yr (e.g. "01 Sep 2026")
    const dateOptions: Intl.DateTimeFormatOptions = {
      timeZone,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };
    const dateFormatter = new Intl.DateTimeFormat('en-GB', dateOptions); // en-GB outputs "01 Sep 2026"
    const dateFormatted = dateFormatter.format(date);

    // Format Day: (e.g. "Tuesday")
    const dayOptions: Intl.DateTimeFormatOptions = {
      timeZone,
      weekday: 'long',
    };
    const dayFormatter = new Intl.DateTimeFormat('en-US', dayOptions);
    const dayName = dayFormatter.format(date);

    // Format Timezone abbreviation / display name
    let timezoneName = 'LOCAL';
    try {
      const tzOptions: Intl.DateTimeFormatOptions = {
        timeZone,
        timeZoneName: 'short',
      };
      const tzParts = new Intl.DateTimeFormat('en-US', tzOptions).formatToParts(date);
      const tzPart = tzParts.find((p) => p.type === 'timeZoneName');
      if (tzPart) {
        timezoneName = tzPart.value;
      }
    } catch {
      timezoneName = timeZone.split('/').pop()?.replace('_', ' ') || 'LOC';
    }

    // Calculate offset string like "UTC+5:30"
    let offsetString = '';
    try {
      const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
      const locDate = new Date(date.toLocaleString('en-US', { timeZone }));
      const diffMinutes = Math.round((locDate.getTime() - utcDate.getTime()) / 60000);
      const sign = diffMinutes >= 0 ? '+' : '-';
      const absMinutes = Math.abs(diffMinutes);
      const diffH = Math.floor(absMinutes / 60);
      const diffM = absMinutes % 60;
      offsetString = `UTC${sign}${diffH}${diffM > 0 ? `:${diffM.toString().padStart(2, '0')}` : ''}`;
    } catch {
      offsetString = 'UTC';
    }

    // Map common timezones to familiar codes
    if (timeZone === 'Asia/Kolkata') timezoneName = 'IST';
    else if (timeZone === 'Asia/Tokyo') timezoneName = 'JST';
    else if (timeZone === 'Asia/Dubai') timezoneName = 'GST';
    else if (timeZone === 'Asia/Singapore') timezoneName = 'SGT';
    else if (timeZone === 'Europe/London') timezoneName = timezoneName.includes('GMT') || timezoneName.includes('BST') ? timezoneName : 'GMT/BST';
    else if (timeZone === 'America/New_York') timezoneName = timezoneName.includes('EDT') || timezoneName.includes('EST') ? timezoneName : 'EST';
    else if (timeZone === 'America/Los_Angeles') timezoneName = timezoneName.includes('PDT') || timezoneName.includes('PST') ? timezoneName : 'PST';

    return {
      timeFormatted,
      hours,
      minutes,
      seconds,
      ampm,
      dateFormatted,
      dayName,
      timezoneName,
      timezoneCode: timeZone,
      offsetString,
    };
  } catch {
    // Fallback in case of timezone formatting exception
    const d = new Date();
    return {
      timeFormatted: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      hours: d.getHours().toString().padStart(2, '0'),
      minutes: d.getMinutes().toString().padStart(2, '0'),
      seconds: d.getSeconds().toString().padStart(2, '0'),
      ampm: d.getHours() >= 12 ? 'PM' : 'AM',
      dateFormatted: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      dayName: d.toLocaleDateString('en-US', { weekday: 'long' }),
      timezoneName: 'LOCAL',
      timezoneCode: 'UTC',
      offsetString: 'UTC',
    };
  }
}
