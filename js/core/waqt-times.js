// Single source of truth for each waqt's start/end/jamaat time — used by both
// schedule-engine.js (building the day's blocks) and ui/settings.js + ui/prayer-
// panel.js (displaying/editing them), so the manual-override logic lives once.
import { computePrayerTimes } from './prayer-times.js';
import { getTzOffsetMinutes } from './timezone.js';
import { hhmmToMinutes } from './time.js';

const WAQTS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

/**
 * @returns {{fajr,dhuhr,asr,maghrib,isha: {start,end,jamaat}, sunrise:number}} all in minutes-since-midnight
 */
export function computeWaqtTimes(settings, date = new Date()) {
  const raw = computePrayerTimes({
    date,
    lat: settings.location.lat,
    lon: settings.location.lon,
    tzOffsetMinutes: getTzOffsetMinutes(settings.location.tz, date),
    method: settings.calcMethod,
    asrMadhab: settings.asrMadhab,
  });
  const manual = settings.prayerManual;
  const jo = settings.jamaatOffset;

  const result = { sunrise: raw.sunrise };
  for (const key of WAQTS) {
    const m = manual[key] || {};
    const start = m.start ? hhmmToMinutes(m.start) : raw[key];
    const jamaat = m.jamaat ? hhmmToMinutes(m.jamaat) : start + jo[key];
    result[key] = { start, jamaat, autoStart: raw[key], autoJamaat: raw[key] + jo[key] };
  }
  // "End" defaults to the fiqh rule that a waqt's window closes when the next
  // begins (Isha wraps to next day's Fajr) — editable per-waqt like start/jamaat.
  const auto = {
    fajr: raw.sunrise, dhuhr: result.asr.start, asr: result.maghrib.start,
    maghrib: result.isha.start, isha: result.fajr.start + 1440,
  };
  for (const key of WAQTS) {
    const m = manual[key] || {};
    result[key].end = m.end ? hhmmToMinutes(m.end) : auto[key];
    result[key].autoEnd = auto[key];
  }
  return result;
}
