// Default settings — Mongla, Bangladesh baseline matching the original
// daily-routine.html numbers (Fajr wake 4:00, office 9:00-20:00, 15 min commute).

export const DEFAULT_SETTINGS = {
  location: {
    mode: 'preset', // 'preset' = country+city below | 'custom' = manual name/lat/lon/tz
    country: 'BD', city: 'মংলা',
    name: 'মংলা, বাংলাদেশ', lat: 22.4892, lon: 89.6006, tz: 'Asia/Dhaka',
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
  fontFamily: 'nikosh',
};

export const HABITS = [
  { id: 'tilawat', label: 'তিলাওয়াত', unit: 'পৃষ্ঠা', type: 'count', target: 5 },
  { id: 'azkarMorning', label: 'সকালের আজকার', type: 'checkbox' },
  { id: 'azkarEvening', label: 'সন্ধ্যার আজকার', type: 'checkbox' },
  { id: 'durood', label: 'দরুদ শরীফ', unit: 'বার', type: 'count', target: 100 },
  { id: 'istighfar', label: 'ইস্তিগফার', unit: 'বার', type: 'count', target: 100 },
  { id: 'codingMinutes', label: 'কোডিং', unit: 'মিনিট', type: 'count', target: 180 },
  { id: 'readingPages', label: 'বই পড়া', unit: 'পৃষ্ঠা', type: 'count', target: 20 },
  { id: 'exercise', label: 'ব্যায়াম', type: 'checkbox' },
  { id: 'waterLiters', label: 'পানি', unit: 'লিটার', type: 'count', target: 3 },
];

export const PRAYER_LABELS = {
  fajr: 'ফজর', dhuhr: 'যোহর', asr: 'আসর', maghrib: 'মাগরিব', isha: 'এশা', jumma: 'জুম্মা',
};

export const PRAYER_STATUSES = ['জামাত', 'একাকী', 'কাযা', 'বাকি'];
