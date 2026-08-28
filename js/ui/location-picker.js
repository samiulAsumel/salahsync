// Country → city preset picker, with a live GPS option (via navigator.geolocation)
// and a manual "custom" fallback. The timezone is always an IANA name (not a
// stored offset), so DST regions stay correct — see core/timezone.js.
import { getSettings, updateSettings } from '../core/store.js';
import { COUNTRIES, TIMEZONES } from '../data/locations.js';
import { field, num, text } from './form-fields.js';
import { toast } from './toast.js';

// Transient GPS-detect UI state — never persisted, only drives the settings panel render.
const gpsState = { status: 'idle', error: null }; // status: idle | detecting | error

export function detectGpsLocation(rerender) {
  if (!navigator.geolocation) {
    gpsState.status = 'error';
    gpsState.error = 'এই ব্রাউজারে GPS সাপোর্ট নেই';
    rerender();
    return;
  }
  gpsState.status = 'detecting';
  gpsState.error = null;
  rerender();

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude: lat, longitude: lon, accuracy } = pos.coords;
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Dhaka';
      const s = structuredClone(getSettings());
      s.location = { mode: 'gps', name: `বর্তমান অবস্থান (${lat.toFixed(3)}, ${lon.toFixed(3)})`, lat, lon, tz, accuracy };
      updateSettings(s);
      gpsState.status = 'idle';
      rerender();
      // Desktop/laptop browsers have no GPS chip — they estimate from WiFi/IP,
      // which in Bangladesh often resolves to the ISP's Dhaka exit point rather
      // than the actual city. >20km accuracy is a sign of that, not a bug here.
      toast(accuracy > 20000
        ? `অবস্থান পাওয়া গেছে, কিন্তু নির্ভুলতা কম (±${Math.round(accuracy / 1000)} কিমি) — ভুল হলে নিচে 'দেশ' থেকে আপনার শহর সরাসরি বেছে নিন`
        : 'GPS থেকে অবস্থান পাওয়া গেছে');
    },
    (err) => {
      gpsState.status = 'error';
      gpsState.error = {
        1: 'অনুমতি দেওয়া হয়নি — ব্রাউজারের লোকেশন পারমিশন চেক করুন',
        2: 'অবস্থান পাওয়া যায়নি',
        3: 'সময় শেষ — আবার চেষ্টা করুন',
      }[err.code] ?? 'অজানা ত্রুটি';
      rerender();
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
  );
}

function formatAccuracy(meters) {
  if (meters == null) return '';
  return meters > 1500 ? `±${(meters / 1000).toFixed(1)} কিমি` : `±${Math.round(meters)} মি`;
}

export function locationSection(s) {
  const loc = s.location;
  const gpsLabel = gpsState.status === 'detecting' ? '📍 সনাক্ত করা হচ্ছে…' : '📍 বর্তমান অবস্থান (GPS)';
  const countryOptions =
    `<option value="gps" ${loc.mode === 'gps' ? 'selected' : ''}>${gpsLabel}</option>` +
    COUNTRIES.map((c) =>
      `<option value="${c.code}" ${loc.mode === 'preset' && loc.country === c.code ? 'selected' : ''}>${c.name}</option>`
    ).join('') +
    `<option value="custom" ${loc.mode === 'custom' ? 'selected' : ''}>অন্যান্য (কাস্টম)</option>`;

  let cityField = '';
  if (loc.mode === 'preset') {
    const country = COUNTRIES.find((c) => c.code === loc.country) ?? COUNTRIES[0];
    const cityOptions = country.cities.map((c) =>
      `<option value="${c.name}" ${loc.city === c.name ? 'selected' : ''}>${c.name}</option>`
    ).join('');
    cityField = field('শহর', `<select id="loc-city">${cityOptions}</select>`);
  }

  const customFields = loc.mode === 'custom' ? `
      ${field('স্থানের নাম', text('location.name', loc.name))}
      ${field('অক্ষাংশ (Lat)', num('location.lat', loc.lat, 0.0001))}
      ${field('দ্রাঘিমাংশ (Lon)', num('location.lon', loc.lon, 0.0001))}
      ${field('টাইমজোন', `<select data-path="location.tz" data-type="string">${TIMEZONES.map((tz) => `<option value="${tz}" ${loc.tz === tz ? 'selected' : ''}>${tz}</option>`).join('')}</select>`)}
  ` : '';

  const gpsAccuracyWarning = loc.mode === 'gps' && loc.accuracy > 20000
    ? `<p class="note" style="color:var(--danger)">নির্ভুলতা মাত্র ${formatAccuracy(loc.accuracy)} — এটা IP/WiFi-ভিত্তিক আনুমানিক অবস্থান, ডেস্কটপ/ল্যাপটপে GPS চিপ না থাকায় প্রায়ই ISP-র শহর (যেমন ঢাকা) দেখায়। সঠিক না হলে নিচের 'দেশ' থেকে সরাসরি আপনার শহর বেছে নিন।</p>`
    : '';
  const gpsNote = loc.mode === 'gps'
    ? (gpsState.status === 'error'
        ? `<p class="note" style="color:var(--danger)">${gpsState.error}</p>`
        : `<p class="note">${loc.name} · ${loc.lat.toFixed(3)}, ${loc.lon.toFixed(3)} · ${loc.tz}${loc.accuracy ? ` · নির্ভুলতা ${formatAccuracy(loc.accuracy)}` : ''}</p>`) +
      gpsAccuracyWarning +
      `<button type="button" id="btn-gps-refresh" class="btn-file">🔄 আবার সনাক্ত করুন</button>`
    : '';

  const presetNote = loc.mode === 'preset'
    ? `<p class="note">${loc.name} · ${loc.lat.toFixed(3)}, ${loc.lon.toFixed(3)} · ${COUNTRIES.find((c) => c.code === loc.country)?.tz ?? ''}</p>`
    : '';

  return `${field('দেশ', `<select id="loc-country">${countryOptions}</select>`)}${cityField}${customFields}${gpsNote}${presetNote}`;
}

// Handles input events targeting the location controls. Returns true if handled
// (caller should stop further processing of the event).
export function handleLocationInput(e, rerender) {
  if (e.target.id === 'loc-country') {
    const code = e.target.value;
    if (code === 'gps') {
      detectGpsLocation(rerender);
      return true;
    }
    const s = structuredClone(getSettings());
    if (code === 'custom') {
      s.location = { ...s.location, mode: 'custom' };
    } else {
      const country = COUNTRIES.find((c) => c.code === code);
      const city = country.cities[0];
      s.location = { mode: 'preset', country: code, city: city.name, name: `${city.name}, ${country.name}`, lat: city.lat, lon: city.lon, tz: country.tz };
    }
    updateSettings(s);
    rerender();
    return true;
  }
  if (e.target.id === 'loc-city') {
    const s = structuredClone(getSettings());
    const country = COUNTRIES.find((c) => c.code === s.location.country);
    const city = country.cities.find((c) => c.name === e.target.value);
    s.location = { ...s.location, city: city.name, name: `${city.name}, ${country.name}`, lat: city.lat, lon: city.lon, tz: country.tz };
    updateSettings(s);
    rerender();
    return true;
  }
  return false;
}
