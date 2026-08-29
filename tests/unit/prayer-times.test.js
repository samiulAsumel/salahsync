import { describe, it, expect } from 'vitest';
import { computePrayerTimes, CALC_METHODS } from '../../js/core/prayer-times.js';

// Fixed calendar date so results are deterministic regardless of when the
// suite runs. Expected minute values were cross-checked against the app's
// own display for these exact coordinates/date.
const DATE = new Date(2026, 7, 30); // 30 Aug 2026

describe('computePrayerTimes', () => {
  it('matches the known Mongla, Bangladesh times (default app location)', () => {
    const t = computePrayerTimes({ date: DATE, lat: 22.4942, lon: 89.6016, tzOffsetMinutes: 360 });
    expect(t).toEqual({ fajr: 270, sunrise: 346, dhuhr: 719, asr: 987, maghrib: 1093, isha: 1164 });
  });

  it('recomputes correctly for a different hemisphere/timezone (London)', () => {
    const t = computePrayerTimes({ date: DATE, lat: 51.5074, lon: -0.1278, tzOffsetMinutes: 60 });
    expect(t).toEqual({ fajr: 262, sunrise: 383, dhuhr: 778, asr: 1050, maghrib: 1175, isha: 1288 });
  });

  it('keeps every waqt in chronological order', () => {
    const t = computePrayerTimes({ date: DATE, lat: 22.4942, lon: 89.6016, tzOffsetMinutes: 360 });
    expect(t.fajr).toBeLessThan(t.sunrise);
    expect(t.sunrise).toBeLessThan(t.dhuhr);
    expect(t.dhuhr).toBeLessThan(t.asr);
    expect(t.asr).toBeLessThan(t.maghrib);
    expect(t.maghrib).toBeLessThan(t.isha);
  });

  it('gives Shafi Asr an earlier time than Hanafi (shorter shadow factor)', () => {
    const shafi = computePrayerTimes({ date: DATE, lat: 22.4942, lon: 89.6016, tzOffsetMinutes: 360, asrMadhab: 'shafi' });
    const hanafi = computePrayerTimes({ date: DATE, lat: 22.4942, lon: 89.6016, tzOffsetMinutes: 360, asrMadhab: 'hanafi' });
    expect(shafi.asr).toBeLessThan(hanafi.asr);
  });

  it('derives Isha from a fixed minutes-after-Maghrib offset under MAKKAH', () => {
    const t = computePrayerTimes({ date: DATE, lat: 22.4942, lon: 89.6016, tzOffsetMinutes: 360, method: 'MAKKAH' });
    expect(t.isha).toBe(t.maghrib + CALC_METHODS.MAKKAH.ishaMinAfterMaghrib);
  });

  it('returns null for Fajr/Isha at high latitude in polar summer instead of crashing', () => {
    const t = computePrayerTimes({ date: new Date(2026, 5, 21), lat: 78, lon: 15, tzOffsetMinutes: 120 });
    expect(t.fajr).toBeNull();
    expect(t.isha).toBeNull();
    expect(t.sunrise).not.toBeNull();
  });
});
