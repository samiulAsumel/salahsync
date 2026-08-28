// Versioned localStorage persistence. Bump SCHEMA_VERSION + add a migration
// step whenever the settings/log shape changes, so old saved data keeps working.

import { DEFAULT_SETTINGS } from '../data/defaults.js';

const STORAGE_KEY = 'daily-routine-app:v1';
export const SCHEMA_VERSION = 2;

function migrate(raw) {
  if (!raw || typeof raw !== 'object') return freshState();
  if (raw.version === SCHEMA_VERSION) return raw;
  const merged = { ...freshState(), ...raw, version: SCHEMA_VERSION };
  // v1 → v2: location switched from a flat lat/lon/tzOffsetMinutes to a
  // country/city preset (or custom) shape with an IANA `tz` string.
  if (!merged.settings.location?.tz) {
    merged.settings.location = {
      ...structuredClone(DEFAULT_SETTINGS.location),
      name: raw.settings?.location?.name ?? DEFAULT_SETTINGS.location.name,
      lat: raw.settings?.location?.lat ?? DEFAULT_SETTINGS.location.lat,
      lon: raw.settings?.location?.lon ?? DEFAULT_SETTINGS.location.lon,
      mode: 'custom',
    };
  }
  return merged;
}

function freshState() {
  return {
    version: SCHEMA_VERSION,
    settings: structuredClone(DEFAULT_SETTINGS),
    logs: {}, // dateKey -> { prayers: {fajr:'jamaat'|'alone'|'qaza'|'none', ...}, habits: {id:number|boolean}, note:string }
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
