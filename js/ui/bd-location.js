// Bangladesh-specific বিভাগ → জেলা → উপজেলা cascading picker, split out of
// location-picker.js purely to keep both files under the 200-line limit.
import { getSettings, updateSettings } from '../core/store.js';
import { BD_DIVISIONS } from '../data/bd-geo.js';
import { field } from './form-fields.js';
import { t, getLang } from '../core/i18n.js';

// Division/district/upazila names have no reliable bulk English transliteration
// source (same reasoning as world-geo.js's city names) — they stay Bangla-script
// in both languages; only the field labels and country-name suffix translate.
const countrySuffix = () => (getLang() === 'en' ? 'Bangladesh' : 'বাংলাদেশ');

// `name` is NOT stored language-baked — it's recomputed from division/district/upazila
// via bdLocationDisplayName() at render time, so a later language toggle re-translates
// the country suffix without needing a fresh selection.
export function bdLocationDisplayName(loc) {
  return `${loc.upazila}, ${loc.district}, ${countrySuffix()}`;
}

export function firstBdLocation() {
  const division = BD_DIVISIONS[0];
  const district = division.districts[0];
  const upazila = district.upazilas[0];
  const loc = { division: division.name, district: district.name, upazila: upazila.n, lat: upazila.lat, lon: upazila.lon };
  return { ...loc, name: bdLocationDisplayName(loc) };
}

export function bdLocationFields(loc) {
  const division = BD_DIVISIONS.find((d) => d.name === loc.division) ?? BD_DIVISIONS[0];
  const district = division.districts.find((d) => d.name === loc.district) ?? division.districts[0];
  const divisionOptions = BD_DIVISIONS.map((d) =>
    `<option value="${d.name}" ${d.name === division.name ? 'selected' : ''}>${d.name}</option>`).join('');
  const districtOptions = division.districts.map((d) =>
    `<option value="${d.name}" ${d.name === district.name ? 'selected' : ''}>${d.name}</option>`).join('');
  const upazilaOptions = district.upazilas.map((u) =>
    `<option value="${u.n}" ${u.n === loc.upazila ? 'selected' : ''}>${u.n}</option>`).join('');

  return `
    ${field(t('loc.division'), `<select id="loc-division">${divisionOptions}</select>`)}
    ${field(t('loc.district'), `<select id="loc-district">${districtOptions}</select>`)}
    ${field(t('loc.upazila'), `<select id="loc-upazila">${upazilaOptions}</select>`)}
  `;
}

// Returns true if it handled the event (caller should stop further processing).
export function handleBdLocationInput(e, rerender) {
  const id = e.target.id;
  if (!['loc-division', 'loc-district', 'loc-upazila'].includes(id)) return false;

  const s = structuredClone(getSettings());
  let division = BD_DIVISIONS.find((d) => d.name === s.location.division) ?? BD_DIVISIONS[0];
  let district = division.districts.find((d) => d.name === s.location.district) ?? division.districts[0];
  let upazila = district.upazilas.find((u) => u.n === s.location.upazila) ?? district.upazilas[0];

  if (id === 'loc-division') {
    division = BD_DIVISIONS.find((d) => d.name === e.target.value);
    district = division.districts[0];
    upazila = district.upazilas[0];
  } else if (id === 'loc-district') {
    district = division.districts.find((d) => d.name === e.target.value);
    upazila = district.upazilas[0];
  } else {
    upazila = district.upazilas.find((u) => u.n === e.target.value);
  }

  const nextLoc = { ...s.location, division: division.name, district: district.name, upazila: upazila.n, lat: upazila.lat, lon: upazila.lon };
  s.location = { ...nextLoc, name: bdLocationDisplayName(nextLoc) };
  updateSettings(s);
  rerender();
  return true;
}
