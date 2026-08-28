// Offline solar prayer-time calculation — condensed version of the widely-used
// praytimes.org algorithm. No network/API dependency; recomputed per calendar day.

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
const dsin = (d) => Math.sin(d * D2R);
const dcos = (d) => Math.cos(d * D2R);
const dtan = (d) => Math.tan(d * D2R);
const darcsin = (x) => Math.asin(x) * R2D;
const darccos = (x) => Math.acos(Math.min(1, Math.max(-1, x))) * R2D;
const darccot = (x) => Math.atan2(1, x) * R2D;
const fixHour = (h) => (((h % 24) + 24) % 24);

export const CALC_METHODS = {
  MWL: { fajr: 18, isha: 17, name: 'মুসলিম ওয়ার্ল্ড লীগ' },
  KARACHI: { fajr: 18, isha: 18, name: 'করাচি বিশ্ববিদ্যালয়' },
  EGYPT: { fajr: 19.5, isha: 17.5, name: 'মিশর জেনারেল অথরিটি' },
  MAKKAH: { fajr: 18.5, ishaMinAfterMaghrib: 90, name: 'উম্মুল কুরা, মক্কা' },
};

function julianDate(year, month, day) {
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

// Sun's declination + the equation of time (hours), evaluated at jd + dayFraction.
function sunPosition(jd) {
  const D = jd - 2451545.0;
  const g = fixHour(357.529 + 0.98560028 * D) ;
  const q = fixHour(280.459 + 0.98564736 * D);
  const L = fixHour(q + 1.915 * dsin(g) + 0.02 * dsin(2 * g));
  const e = 23.439 - 0.00000036 * D;
  const RA = Math.atan2(dcos(e) * dsin(L), dcos(L)) * R2D / 15;
  const eqt = q / 15 - fixHour(RA);
  const declination = darcsin(dsin(e) * dsin(L));
  return { declination, eqt };
}

function midDay(jDate, dayFraction, lng) {
  const { eqt } = sunPosition(jDate + dayFraction);
  return fixHour(12 - eqt);
}

function sunAngleTime(jDate, dayFraction, lat, angle, direction) {
  const { declination } = sunPosition(jDate + dayFraction);
  const noon = midDay(jDate, dayFraction);
  const ratio = (-dsin(angle) - dsin(declination) * dsin(lat)) / (dcos(declination) * dcos(lat));
  if (ratio < -1 || ratio > 1) return null; // polar edge case: sun never reaches this angle
  const t = darccos(ratio) / 15;
  return noon + (direction === 'ccw' ? -t : t);
}

function asrAngleTime(jDate, dayFraction, lat, shadowFactor) {
  const { declination } = sunPosition(jDate + dayFraction);
  const angle = -darccot(shadowFactor + dtan(Math.abs(lat - declination)));
  return sunAngleTime(jDate, dayFraction, lat, angle, 'cw');
}

/**
 * Compute the 6 daily waqts for a given date/location.
 * @returns {{fajr:number,sunrise:number,dhuhr:number,asr:number,maghrib:number,isha:number}} minutes since 00:00 local clock time
 */
export function computePrayerTimes({ date, lat, lon, tzOffsetMinutes, method = 'MWL', asrMadhab = 'hanafi' }) {
  const jDate = julianDate(date.getFullYear(), date.getMonth() + 1, date.getDate()) - lon / (15 * 24);
  const cfg = CALC_METHODS[method] ?? CALC_METHODS.MWL;
  const shadowFactor = asrMadhab === 'hanafi' ? 2 : 1;
  const tz = tzOffsetMinutes / 60;

  const dhuhrH = midDay(jDate, 12 / 24);
  const fajrH = sunAngleTime(jDate, 5 / 24, lat, cfg.fajr, 'ccw');
  const sunriseH = sunAngleTime(jDate, 6 / 24, lat, 0.833, 'ccw');
  const maghribH = sunAngleTime(jDate, 18 / 24, lat, 0.833, 'cw');
  const ishaH = cfg.ishaMinAfterMaghrib
    ? (maghribH ?? dhuhrH) + cfg.ishaMinAfterMaghrib / 60
    : sunAngleTime(jDate, 19 / 24, lat, cfg.isha, 'cw');
  const asrH = asrAngleTime(jDate, 13 / 24, lat, shadowFactor);

  // Each *_H value is a solar-noon-relative hour at the lon-adjusted jDate; add the
  // timezone/longitude correction once to land on the local civil clock.
  const toLocalMinutes = (h) => (h == null ? null : Math.round(fixHour(h + tz - lon / 15) * 60));

  return {
    fajr: toLocalMinutes(fajrH),
    sunrise: toLocalMinutes(sunriseH),
    dhuhr: toLocalMinutes(dhuhrH),
    asr: toLocalMinutes(asrH),
    maghrib: toLocalMinutes(maghribH),
    isha: toLocalMinutes(ishaH),
  };
}
