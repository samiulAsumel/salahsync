// Country → city preset picker, with a live GPS option (via navigator.geolocation)
// and a manual "custom" fallback. The timezone is always an IANA name (not a
// stored offset), so DST regions stay correct — see core/timezone.js.
import { getSettings, updateSettings } from '../core/store.js';
import { WORLD_COUNTRIES } from '../data/world-geo.js';
import { TIMEZONES } from '../data/locations.js';
import { field, num, text } from './form-fields.js';
import { toast } from './toast.js';
import { t, getLang } from '../core/i18n.js';
import { bdLocationFields, handleBdLocationInput, firstBdLocation, bdLocationDisplayName } from './bd-location.js';

// Transient GPS-detect UI state — never persisted, only drives the settings panel render.
const gpsState = { status: 'idle', error: null }; // status: idle | detecting | error
const GPS_ACCURACY_WARN_METERS = 1000;

const countryName = (c) => (getLang() === 'en' ? c.en : c.bn);

// `loc.name` may have been composed in a language the user has since switched
// away from (stored purely for JSON-export readability) — always re-derive the
// DISPLAYED name from stable fields (city/country codes, division/district/
// upazila) so a language toggle retranslates it without a fresh selection.
export function getLocationDisplayName(loc) {
  if (loc.mode === 'gps') return `${t('loc.currentLocationName')} (${loc.lat.toFixed(3)}, ${loc.lon.toFixed(3)})`;
  if (loc.mode === 'custom') return loc.name;
  if (loc.country === 'BD') return bdLocationDisplayName(loc);
  const country = WORLD_COUNTRIES.find((c) => c.code === loc.country);
  return country ? `${loc.city}, ${countryName(country)}` : loc.name;
}

export function detectGpsLocation(rerender) {
  if (!navigator.geolocation) {
    gpsState.status = 'error';
    gpsState.error = t('loc.gpsNotSupported');
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
      s.location = { mode: 'gps', name: `${t('loc.currentLocationName')} (${lat.toFixed(3)}, ${lon.toFixed(3)})`, lat, lon, tz, accuracy };
      updateSettings(s);
      gpsState.status = 'idle';
      rerender();
      // Desktop/laptop browsers have no GPS chip — they estimate from WiFi/IP,
      // which often resolves to the ISP's hub city rather than the actual one.
      toast(accuracy > GPS_ACCURACY_WARN_METERS
        ? t('loc.toastLowAccuracy', { accuracy: formatAccuracy(accuracy) })
        : t('loc.toastFound'));
    },
    (err) => {
      gpsState.status = 'error';
      gpsState.error = { 1: t('loc.errPermission'), 2: t('loc.errUnavailable'), 3: t('loc.errTimeout') }[err.code] ?? t('loc.errUnknown');
      rerender();
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
  );
}

function formatAccuracy(meters) {
  if (meters == null) return '';
  const lang = getLang();
  if (meters > 1500) return lang === 'en' ? `±${(meters / 1000).toFixed(1)} km` : `±${(meters / 1000).toFixed(1)} কিমি`;
  return lang === 'en' ? `±${Math.round(meters)} m` : `±${Math.round(meters)} মি`;
}

export function locationSection(s) {
  const loc = s.location;
  const gpsLabel = gpsState.status === 'detecting' ? t('loc.gpsDetecting') : t('loc.gpsLabel');
  const countryOptions =
    `<option value="gps" ${loc.mode === 'gps' ? 'selected' : ''}>${gpsLabel}</option>` +
    `<option value="BD" ${loc.mode === 'preset' && loc.country === 'BD' ? 'selected' : ''}>${getLang() === 'en' ? 'Bangladesh' : 'বাংলাদেশ'}</option>` +
    WORLD_COUNTRIES.map((c) =>
      `<option value="${c.code}" ${loc.mode === 'preset' && loc.country === c.code ? 'selected' : ''}>${countryName(c)}</option>`
    ).join('') +
    `<option value="custom" ${loc.mode === 'custom' ? 'selected' : ''}>${t('loc.custom')}</option>`;

  let cityField = '';
  let cityTz = null;
  if (loc.mode === 'preset' && loc.country === 'BD') {
    cityField = bdLocationFields(loc);
  } else if (loc.mode === 'preset') {
    const country = WORLD_COUNTRIES.find((c) => c.code === loc.country) ?? WORLD_COUNTRIES[0];
    const cityOptions = country.cities.map((c) =>
      `<option value="${c.name}" ${loc.city === c.name ? 'selected' : ''}>${c.name}</option>`
    ).join('');
    cityField = field(t('loc.city'), `<select id="loc-city">${cityOptions}</select>`);
    cityTz = country.cities.find((c) => c.name === loc.city)?.tz ?? loc.tz;
  }

  const customFields = loc.mode === 'custom' ? `
      ${field(t('loc.fieldName'), text('location.name', loc.name))}
      ${field(t('loc.fieldLat'), num('location.lat', loc.lat, 0.0001))}
      ${field(t('loc.fieldLon'), num('location.lon', loc.lon, 0.0001))}
      ${field(t('loc.fieldTz'), `<select data-path="location.tz" data-type="string">${TIMEZONES.map((tz) => `<option value="${tz}" ${loc.tz === tz ? 'selected' : ''}>${tz}</option>`).join('')}</select>`)}
  ` : '';

  const gpsAccuracyWarning = loc.mode === 'gps' && loc.accuracy > GPS_ACCURACY_WARN_METERS
    ? `<p class="note" style="color:var(--danger)">${t('loc.warningLowAccuracy', { accuracy: formatAccuracy(loc.accuracy) })}</p>`
    : '';
  const gpsNote = loc.mode === 'gps'
    ? (gpsState.status === 'error'
        ? `<p class="note" style="color:var(--danger)">${gpsState.error}</p>`
        : `<p class="note">${getLocationDisplayName(loc)} · ${loc.lat.toFixed(3)}, ${loc.lon.toFixed(3)} · ${loc.tz}${loc.accuracy ? ` · ${t('loc.accuracyLabel')} ${formatAccuracy(loc.accuracy)}` : ''}</p>`) +
      gpsAccuracyWarning +
      `<button type="button" id="btn-gps-refresh" class="btn-file">${t('loc.gpsRefresh')}</button>`
    : '';

  const presetNote = loc.mode === 'preset' && loc.country !== 'BD'
    ? `<p class="note">${getLocationDisplayName(loc)} · ${loc.lat.toFixed(3)}, ${loc.lon.toFixed(3)} · ${cityTz ?? ''}</p>`
    : '';

  return `${field(t('loc.country'), `<select id="loc-country">${countryOptions}</select>`)}${cityField}${customFields}${gpsNote}${presetNote}`;
}

// Handles input events targeting the location controls. Returns true if handled
// (caller should stop further processing of the event).
export function handleLocationInput(e, rerender) {
  if (handleBdLocationInput(e, rerender)) return true;

  if (e.target.id === 'loc-country') {
    const code = e.target.value;
    if (code === 'gps') {
      detectGpsLocation(rerender);
      return true;
    }
    const s = structuredClone(getSettings());
    if (code === 'custom') {
      s.location = { ...s.location, mode: 'custom' };
    } else if (code === 'BD') {
      s.location = { mode: 'preset', country: 'BD', tz: 'Asia/Dhaka', ...firstBdLocation() };
    } else {
      const country = WORLD_COUNTRIES.find((c) => c.code === code);
      const city = country.cities[0];
      s.location = { mode: 'preset', country: code, city: city.name, name: `${city.name}, ${countryName(country)}`, lat: city.lat, lon: city.lon, tz: city.tz };
    }
    updateSettings(s);
    rerender();
    return true;
  }
  if (e.target.id === 'loc-city') {
    const s = structuredClone(getSettings());
    const country = WORLD_COUNTRIES.find((c) => c.code === s.location.country);
    const city = country.cities.find((c) => c.name === e.target.value);
    s.location = { ...s.location, city: city.name, name: `${city.name}, ${countryName(country)}`, lat: city.lat, lon: city.lon, tz: city.tz };
    updateSettings(s);
    rerender();
    return true;
  }
  return false;
}
