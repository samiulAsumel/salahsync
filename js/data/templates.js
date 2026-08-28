// Declarative block lists for each day profile. Every time value is derived —
// nothing here is a hard-coded clock time. See core/schedule-engine.js for how
// `start`/`end`/`flex` specs resolve against the anchors computed in resolveAnchors().
//
// Display text (label/note) lives in i18n/strings.bn.js + strings.en.js under
// `schedule.<profileKey>.<blockId>.label`/`.note`, looked up via core/i18n.js's
// tBlock() — this file stays purely structural so it never needs a translation pass.

const withinOffice = (anchors, key) =>
  anchors.officeStart != null && anchors.officeEnd != null &&
  anchors[key] > anchors.officeStart && anchors[key] < anchors.officeEnd;

const wake = { id: 'wake', cat: 'ibadah', start: { anchor: 'wakeUp' }, duration: 0 };
const tahajjud = { id: 'tahajjud', cat: 'ibadah', start: { after: 'wake' }, duration: 'tahajjud' };
const fajrJamaat = { id: 'fajrJamaat', cat: 'ibadah', prayerKey: 'fajr', start: { anchor: 'fajrJamaat' }, duration: 'jamaatBuffer' };

export const WORKDAY = [
  wake,
  tahajjud,
  { id: 'sunnahTilawat', cat: 'ibadah', start: { after: 'tahajjud' }, duration: 'sunnahTilawat' },
  fajrJamaat,
  { id: 'mosqueReturn', cat: 'personal', start: { after: 'fajrJamaat' }, duration: 'mosqueReturn' },
  { id: 'morningCode', cat: 'learning', start: { after: 'mosqueReturn' }, flex: true, min: 'minMorningCoding' },
  { id: 'breakfast', cat: 'personal', end: { anchor: 'leaveHome' }, duration: 'breakfast' },
  { id: 'leaveHome', cat: 'office', start: { anchor: 'leaveHome' }, duration: 0 },
  // Each office segment's end falls back to officeEnd if the next prayer time
  // doesn't actually land inside office hours (e.g. a short early-close day).
  { id: 'office1', cat: 'office', start: { anchor: 'officeStart' }, end: (a) => (withinOffice(a, 'dhuhrJamaat') ? a.dhuhrJamaat : a.officeEnd) },
  { id: 'dhuhrBreak', cat: 'ibadah', prayerKey: 'dhuhr', start: { anchor: 'dhuhrJamaat' }, duration: 'jamaatBuffer', skipIf: (a) => !withinOffice(a, 'dhuhrJamaat') },
  { id: 'office2', cat: 'office', start: { after: 'dhuhrBreak' }, end: (a) => (withinOffice(a, 'asrJamaat') ? a.asrJamaat : a.officeEnd) },
  { id: 'asrBreak', cat: 'ibadah', prayerKey: 'asr', start: { anchor: 'asrJamaat' }, duration: 'jamaatBuffer', skipIf: (a) => !withinOffice(a, 'asrJamaat') },
  { id: 'office3', cat: 'office', start: { after: 'asrBreak' }, end: (a) => (withinOffice(a, 'maghribJamaat') ? a.maghribJamaat : a.officeEnd) },
  { id: 'maghribBreak', cat: 'ibadah', prayerKey: 'maghrib', start: { anchor: 'maghribJamaat' }, duration: 'jamaatBuffer', skipIf: (a) => !withinOffice(a, 'maghribJamaat') },
  { id: 'office4', cat: 'office', start: { after: 'maghribBreak' }, end: { anchor: 'officeEnd' } },
  { id: 'arriveHome', cat: 'personal', start: { anchor: 'arriveHome' }, duration: 0 },
  { id: 'ishaMeal', cat: 'ibadah', start: { after: 'arriveHome' }, duration: 'ishaMeal' },
  { id: 'codingPractice', cat: 'learning', start: { after: 'ishaMeal' }, duration: 'codingPractice' },
  { id: 'reading', cat: 'learning', start: { after: 'codingPractice' }, duration: 'reading' },
  { id: 'windDown', cat: 'rest', start: { after: 'reading' }, flex: true, min: 15 },
  { id: 'sleep', cat: 'rest', start: { anchor: 'bedtime' }, duration: 0 },
];

export const FRIDAY = [
  wake,
  tahajjud,
  { id: 'sunnahTilawat', cat: 'ibadah', start: { after: 'tahajjud' }, duration: 'sunnahTilawat' },
  fajrJamaat,
  { id: 'earlyCoding', cat: 'learning', start: { after: 'fajrJamaat' }, duration: 'weekendEarlyCoding' },
  { id: 'breakfast', cat: 'personal', start: { after: 'earlyCoding' }, duration: 'breakfast' },
  { id: 'lateCoding', cat: 'learning', start: { after: 'breakfast' }, flex: true, min: 'minWeekendCoding' },
  { id: 'jummaPrep', cat: 'ibadah', end: { anchor: 'jummaGo' }, duration: 'jummaPrep' },
  { id: 'goToMosque', cat: 'ibadah', start: { anchor: 'jummaGo' }, duration: 'jamaatWalk' },
  { id: 'jummaPrayer', cat: 'ibadah', prayerKey: 'jumma', start: { after: 'goToMosque' }, duration: 'jummaDuration' },
  { id: 'lunchRest', cat: 'personal', start: { after: 'jummaPrayer' }, duration: 'lunchRest' },
  { id: 'familyTime', cat: 'personal', start: { after: 'lunchRest' }, flex: true, min: 30 },
  { id: 'asr', cat: 'ibadah', prayerKey: 'asr', start: { anchor: 'asrJamaat' }, duration: 'jamaatBuffer' },
  { id: 'eveningCoding', cat: 'learning', start: { after: 'asr' }, flex: true, min: 20 },
  { id: 'maghrib', cat: 'ibadah', prayerKey: 'maghrib', start: { anchor: 'maghribJamaat' }, duration: 'jamaatBuffer' },
  { id: 'lightCoding', cat: 'learning', start: { after: 'maghrib' }, duration: 'eveningLightCoding' },
  { id: 'isha', cat: 'ibadah', prayerKey: 'isha', start: { anchor: 'ishaJamaat' }, duration: 'jamaatBuffer' },
  { id: 'windDown', cat: 'rest', start: { after: 'isha' }, flex: true, min: 15 },
  { id: 'sleep', cat: 'rest', start: { anchor: 'bedtime' }, duration: 0 },
];

export const SATURDAY = [
  wake,
  tahajjud,
  { id: 'sunnahTilawat', cat: 'ibadah', start: { after: 'tahajjud' }, duration: 'sunnahTilawat' },
  fajrJamaat,
  { id: 'earlyCoding', cat: 'learning', start: { after: 'fajrJamaat' }, duration: 'weekendEarlyCoding' },
  { id: 'breakfast', cat: 'personal', start: { after: 'earlyCoding' }, duration: 'breakfast' },
  { id: 'lateCoding', cat: 'learning', start: { after: 'breakfast' }, flex: true, min: 'minWeekendCoding' },
  { id: 'dhuhr', cat: 'ibadah', prayerKey: 'dhuhr', start: { anchor: 'dhuhrJamaat' }, duration: 'jamaatBuffer' },
  { id: 'lunchRest', cat: 'personal', start: { after: 'dhuhr' }, duration: 'lunchRest' },
  { id: 'personalTime', cat: 'personal', start: { after: 'lunchRest' }, flex: true, min: 30 },
  { id: 'asr', cat: 'ibadah', prayerKey: 'asr', start: { anchor: 'asrJamaat' }, duration: 'jamaatBuffer' },
  { id: 'afternoonReading', cat: 'learning', start: { after: 'asr' }, duration: 'afternoonReading' },
  { id: 'maghrib', cat: 'ibadah', prayerKey: 'maghrib', start: { anchor: 'maghribJamaat' }, duration: 'jamaatBuffer' },
  { id: 'weekReview', cat: 'personal', start: { after: 'maghrib' }, duration: 'weekReview' },
  { id: 'isha', cat: 'ibadah', prayerKey: 'isha', start: { anchor: 'ishaJamaat' }, duration: 'jamaatBuffer' },
  { id: 'windDown', cat: 'rest', start: { after: 'isha' }, flex: true, min: 15 },
  { id: 'sleep', cat: 'rest', start: { anchor: 'bedtime' }, duration: 0 },
];

export const PROFILES = {
  workday: { key: 'workday', template: WORKDAY },
  friday: { key: 'friday', template: FRIDAY },
  saturday: { key: 'saturday', template: SATURDAY },
};

export function profileForWeekday(weekday) {
  if (weekday === 5) return 'friday';
  if (weekday === 6) return 'saturday';
  return 'workday';
}
