let timeOffset = 0;
let isSynced = false;

const OriginalDate = window.Date;

// @ts-ignore
window.Date = function SyncedDate(...args: any[]) {
  if (new.target) {
    // Called with new
    if (args.length === 0) return new OriginalDate(OriginalDate.now() + timeOffset);
    if (args.length === 1) return new OriginalDate(args[0]);
    if (args.length === 2) return new OriginalDate(args[0], args[1]);
    if (args.length === 3) return new OriginalDate(args[0], args[1], args[2]);
    if (args.length === 4) return new OriginalDate(args[0], args[1], args[2], args[3]);
    if (args.length === 5) return new OriginalDate(args[0], args[1], args[2], args[3], args[4]);
    if (args.length === 6) return new OriginalDate(args[0], args[1], args[2], args[3], args[4], args[5]);
    return new OriginalDate(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
  } else {
    // Called without new
    return new OriginalDate(OriginalDate.now() + timeOffset).toString();
  }
} as unknown as typeof Date;

window.Date.now = () => OriginalDate.now() + timeOffset;
window.Date.parse = OriginalDate.parse;
window.Date.UTC = OriginalDate.UTC;
window.Date.prototype = OriginalDate.prototype;

export const syncTimeWithServer = async () => {
  if (isSynced) return;
  try {
    const start = performance.now();
    const res = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC');
    const data = await res.json();
    const end = performance.now();
    
    const serverTime = new OriginalDate(data.utc_datetime).getTime();
    const localTime = OriginalDate.now();
    
    timeOffset = serverTime - localTime + ((end - start) / 2);
    isSynced = true;
    
    console.log(`[TimeSync] Synced with live server. Offset: ${timeOffset}ms`);
  } catch (error) {
    console.error('[TimeSync] Failed to sync time from server:', error);
  }
};
