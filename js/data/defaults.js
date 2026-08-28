// Default settings — Mongla, Bangladesh baseline matching the original
// daily-routine.html numbers (Fajr wake 4:00, office 9:00-20:00, 15 min commute).
// Display text for habits/prayers/etc. lives in i18n/strings.bn.js + strings.en.js —
// this file keeps only stable ids/codes so language never needs a data migration.

export const DEFAULT_SETTINGS = {
  language: 'bn', // 'bn' | 'en'
  location: {
    mode: 'preset', // 'preset' = country+city (or BD division/district/upazila) | 'custom' | 'gps'
    country: 'BD', division: 'খুলনা', district: 'বাগেরহাট', upazila: 'মংলা',
    name: 'মংলা, বাগেরহাট, বাংলাদেশ', lat: 22.4942, lon: 89.6016, tz: 'Asia/Dhaka',
  },
  calcMethod: 'MWL',
  asrMadhab: 'hanafi',
  fajrMode: 'auto', // 'auto' = solar calc | 'manual' = use manualFajrJamaat
  manualFajrJamaat: '05:00',
  jamaatOffset: { fajr: 25, dhuhr: 10, asr: 10, maghrib: 5, isha: 15 }, // minutes after adhan
  waqtManualOffset: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },

  office: {
    perDay: {
      0: { start: '09:00', end: '20:00' }, // Sunday
      1: { start: '09:00', end: '20:00' },
      2: { start: '09:00', end: '20:00' },
      3: { start: '09:00', end: '20:00' },
      4: { start: '09:00', end: '18:30' }, // Thursday — early close
    },
  },
  commute: { toOffice: 15, fromOffice: 15 },

  sleep: { bedtime: '23:00', targetHours: 7 },
  durations: {
    tahajjud: 20, sunnahTilawat: 40, jamaatWalk: 15, mosqueReturn: 15,
    fajrJamaatDuration: 30, jamaatPrayer: 15,
    breakfast: 30, ishaMeal: 30, codingPractice: 30, reading: 60, windDown: 45,
    minMorningCoding: 45, minWeekendCoding: 90,
    weekendEarlyCoding: 210, jummaPrep: 30, jummaDuration: 60, lunchRest: 90,
    eveningLightCoding: 45, afternoonReading: 45, weekReview: 30,
    officeBreakDhuhr: 15, officeBreakAsr: 10, officeBreakMaghrib: 10,
  },

  hijriDayOffset: 0,
  theme: 'light',
};

export const HABITS = [
  { id: 'tilawat', unitKey: 'pages', type: 'count', target: 5 },
  { id: 'azkarMorning', type: 'checkbox' },
  { id: 'azkarEvening', type: 'checkbox' },
  { id: 'durood', unitKey: 'times', type: 'count', target: 100 },
  { id: 'istighfar', unitKey: 'times', type: 'count', target: 100 },
  { id: 'codingMinutes', unitKey: 'minutes', type: 'count', target: 180 },
  { id: 'readingPages', unitKey: 'pages', type: 'count', target: 20 },
  { id: 'exercise', type: 'checkbox' },
  { id: 'waterLiters', unitKey: 'liters', type: 'count', target: 3 },
];

export const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'jumma'];
export const PRAYER_STATUSES = ['jamaat', 'alone', 'qaza', 'pending'];
