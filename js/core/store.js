// Versioned localStorage persistence. Bump SCHEMA_VERSION + add a migration
// step whenever the settings/log shape changes, so old saved data keeps working.

import { DEFAULT_SETTINGS } from '../data/defaults.js';

const STORAGE_KEY = 'daily-routine-app:v1';
export const SCHEMA_VERSION = 7;

const OLD_STATUS_TO_CODE = { জামাত: 'jamaat', একাকী: 'alone', কাযা: 'qaza', বাকি: 'pending' };

function migrate(raw) {
  if (!raw || typeof raw !== 'object') return freshState();
  if (raw.version === SCHEMA_VERSION) return raw;
  const merged = { ...freshState(), ...raw, version: SCHEMA_VERSION };
  const loc = merged.settings.location;
  // v1 → v2: location switched from a flat lat/lon/tzOffsetMinutes to a
  // country/city preset (or custom) shape with an IANA `tz` string.
  if (!loc?.tz) {
    merged.settings.location = {
      ...structuredClone(DEFAULT_SETTINGS.location),
      name: raw.settings?.location?.name ?? DEFAULT_SETTINGS.location.name,
      lat: raw.settings?.location?.lat ?? DEFAULT_SETTINGS.location.lat,
      lon: raw.settings?.location?.lon ?? DEFAULT_SETTINGS.location.lon,
      mode: 'custom',
    };
  } else if (loc.mode === 'preset' && loc.country === 'BD' && !loc.upazila) {
    // v2 → v3: Bangladesh dropped its flat city list for a বিভাগ→জেলা→উপজেলা
    // hierarchy (data/bd-geo.js). No reliable city→upazila mapping, so fall
    // back to the Mongla default rather than guessing.
    merged.settings.location = structuredClone(DEFAULT_SETTINGS.location);
  }
  if (merged.settings.language === undefined) merged.settings.language = 'bn';
  // v3 → v4: prayer status values switched from Bangla display text (which broke
  // once English mode existed) to stable codes; translate any old logs in place.
  for (const day of Object.values(merged.logs)) {
    for (const [k, v] of Object.entries(day.prayers ?? {})) {
      if (OLD_STATUS_TO_CODE[v]) day.prayers[k] = OLD_STATUS_TO_CODE[v];
    }
  }
  // v4 → v5: waqtManualOffset (offset-based) and the Fajr-only manual-jamaat
  // special case were replaced by a per-waqt direct start/end/jamaat override
  // (prayerManual) shared by all 5 waqts. An offset alone can't be converted to
  // an absolute time, so it's dropped; the old Fajr override carries over.
  if (!merged.settings.prayerManual) {
    merged.settings.prayerManual = structuredClone(DEFAULT_SETTINGS.prayerManual);
    if (raw.settings?.fajrMode === 'manual' && raw.settings?.manualFajrJamaat) {
      merged.settings.prayerManual.fajr.jamaat = raw.settings.manualFajrJamaat;
    }
  }
  delete merged.settings.waqtManualOffset;
  delete merged.settings.fajrMode;
  delete merged.settings.manualFajrJamaat;
  // v5 → v6: five separate post-jamaat durations (fajrJamaatDuration, jamaatPrayer,
  // officeBreakDhuhr/Asr/Maghrib) collapsed into one shared jamaatBuffer — every
  // waqt now gets the same 25-min gap before the next activity starts.
  if (merged.settings.durations && merged.settings.durations.jamaatBuffer === undefined) {
    merged.settings.durations.jamaatBuffer = DEFAULT_SETTINGS.durations.jamaatBuffer;
  }
  if (merged.settings.durations) {
    delete merged.settings.durations.fajrJamaatDuration;
    delete merged.settings.durations.jamaatPrayer;
    delete merged.settings.durations.officeBreakDhuhr;
    delete merged.settings.durations.officeBreakAsr;
    delete merged.settings.durations.officeBreakMaghrib;
  }
  // v6 → v7: added a post-Fajr exercise/walk block to every profile.
  if (merged.settings.durations && merged.settings.durations.exercise === undefined) {
    merged.settings.durations.exercise = DEFAULT_SETTINGS.durations.exercise;
  }
  return merged;
}

function freshState() {
  return {
    version: SCHEMA_VERSION,
    settings: structuredClone(DEFAULT_SETTINGS),
    logs: {}, // dateKey -> { prayers: {fajr:'jamaat'|'alone'|'qaza'|'pending', ...}, habits: {id:number|boolean}, note:string }
  };
}

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return migrate(raw);
  } catch {
    return freshState();
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  listeners.forEach((fn) => fn(state));
}

export function getState() {
  return state;
}

export function getSettings() {
  return state.settings;
}

export function updateSettings(patch) {
  state.settings = { ...state.settings, ...patch };
  persist();
}

export function getDayLog(key) {
  return state.logs[key] ?? { prayers: {}, habits: {}, note: '' };
}

export function setPrayerStatus(dateKey, prayerId, status) {
  const day = state.logs[dateKey] ?? { prayers: {}, habits: {}, note: '' };
  day.prayers = { ...day.prayers, [prayerId]: status };
  state.logs[dateKey] = day;
  persist();
}

export function setHabitValue(dateKey, habitId, value) {
  const day = state.logs[dateKey] ?? { prayers: {}, habits: {}, note: '' };
  day.habits = { ...day.habits, [habitId]: value };
  state.logs[dateKey] = day;
  persist();
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function exportJSON() {
  return JSON.stringify(state, null, 2);
}

export function importJSON(text) {
  const parsed = JSON.parse(text);
  state = migrate(parsed);
  persist();
}

export function resetSettings() {
  state.settings = structuredClone(DEFAULT_SETTINGS);
  persist();
}
