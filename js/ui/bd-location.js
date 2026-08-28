// Bangladesh-specific বিভাগ → জেলা → উপজেলা cascading picker, split out of
// location-picker.js purely to keep both files under the 200-line limit.
import { getSettings, updateSettings } from '../core/store.js';
import { BD_DIVISIONS } from '../data/bd-geo.js';
import { field } from './form-fields.js';

export function firstBdLocation() {
  const division = BD_DIVISIONS[0];
  const district = division.districts[0];
  const upazila = district.upazilas[0];
  return {
    division: division.name, district: district.name, upazila: upazila.n,
    name: `${upazila.n}, ${district.name}, বাংলাদেশ`, lat: upazila.lat, lon: upazila.lon,
  };
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
    ${field('বিভাগ', `<select id="loc-division">${divisionOptions}</select>`)}
    ${field('জেলা', `<select id="loc-district">${districtOptions}</select>`)}
    ${field('উপজেলা', `<select id="loc-upazila">${upazilaOptions}</select>`)}
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

  s.location = {
    ...s.location, division: division.name, district: district.name, upazila: upazila.n,
    name: `${upazila.n}, ${district.name}, বাংলাদেশ`, lat: upazila.lat, lon: upazila.lon,
  };
  updateSettings(s);
  rerender();
  return true;
}
