import { describe, it, expect } from 'vitest';
import { resolveSchedule } from '../../js/core/schedule-engine.js';
import { WORKDAY, FRIDAY, SATURDAY } from '../../js/data/templates.js';
import { DEFAULT_SETTINGS } from '../../js/data/defaults.js';

const PROFILES = [
  { template: WORKDAY, key: 'workday', weekday: 0 },
  { template: FRIDAY, key: 'friday', weekday: 5 },
  { template: SATURDAY, key: 'saturday', weekday: 6 },
];

describe('resolveSchedule', () => {
  it('keeps every block in non-decreasing chronological order with no inverted ranges', () => {
    const settings = structuredClone(DEFAULT_SETTINGS);
    for (const { template, key, weekday } of PROFILES) {
      const { blocks } = resolveSchedule(template, settings, weekday, key);
      for (let i = 0; i < blocks.length; i++) {
        expect(blocks[i].end).toBeGreaterThanOrEqual(blocks[i].start);
        if (i > 0) expect(blocks[i].start).toBeGreaterThanOrEqual(blocks[i - 1].start);
      }
    }
  });

  it('places the exercise block right after the Fajr routine on every profile', () => {
    const settings = structuredClone(DEFAULT_SETTINGS);
    const cases = [
      { template: WORKDAY, key: 'workday', weekday: 0, after: 'mosqueReturn', before: 'morningCode' },
      { template: FRIDAY, key: 'friday', weekday: 5, after: 'fajrJamaat', before: 'earlyCoding' },
      { template: SATURDAY, key: 'saturday', weekday: 6, after: 'fajrJamaat', before: 'earlyCoding' },
    ];
    for (const { template, key, weekday, after, before } of cases) {
      const { blocks } = resolveSchedule(template, settings, weekday, key);
      const byId = Object.fromEntries(blocks.map((b) => [b.id, b]));
      expect(byId.exercise).toBeDefined();
      expect(byId.exercise.end - byId.exercise.start).toBe(settings.durations.exercise);
      expect(byId.exercise.start).toBe(byId[after].end);
      expect(byId[before].start).toBe(byId.exercise.end);
    }
  });

  it('flags default settings as short on sleep (documents the known tight bootstrap routine)', () => {
    const settings = structuredClone(DEFAULT_SETTINGS);
    const { stats } = resolveSchedule(WORKDAY, settings, 0, 'workday');
    expect(stats.sleepMinutes).toBeLessThan(settings.sleep.targetHours * 60);
  });

  it('resolves a string flex minimum (e.g. minWeekendCoding) to a number, not NaN', () => {
    // Regression test: closeFlex() used to compare `actual < pendingFlex.min` where
    // min could be the literal string 'minWeekendCoding' instead of its resolved
    // value, so the too-short comparison silently always evaluated to false.
    const settings = structuredClone(DEFAULT_SETTINGS);
    settings.durations.minWeekendCoding = 999999; // force an impossible-to-meet minimum
    const { warnings } = resolveSchedule(FRIDAY, settings, 5, 'friday');
    expect(warnings.some((w) => w.includes('999999') || /কমপক্ষে/.test(w))).toBe(true);
  });

  it('computes byCat stats that sum to the total scheduled (non-sleep/wake) time', () => {
    const settings = structuredClone(DEFAULT_SETTINGS);
    const { blocks, stats } = resolveSchedule(WORKDAY, settings, 0, 'workday');
    const expectedTotal = blocks
      .filter((b) => b.id !== 'sleep' && b.id !== 'wake')
      .reduce((sum, b) => sum + Math.max(0, b.end - b.start), 0);
    const actualTotal = Object.values(stats.byCat).reduce((a, b) => a + b, 0);
    expect(actualTotal).toBe(expectedTotal);
  });
});
