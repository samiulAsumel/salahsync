// Declarative block lists for each day profile. Every time value is derived —
// nothing here is a hard-coded clock time. See core/schedule-engine.js for how
// `start`/`end`/`flex` specs resolve against the anchors computed in resolveAnchors().

const withinOffice = (anchors, key) =>
  anchors.officeStart != null && anchors.officeEnd != null &&
  anchors[key] > anchors.officeStart && anchors[key] < anchors.officeEnd;

const wake = (note) => ({ id: 'wake', label: 'ঘুম থেকে ওঠা, অজু', cat: 'ibadah', start: { anchor: 'wakeUp' }, duration: 0, note });
const tahajjud = { id: 'tahajjud', label: 'তাহাজ্জুদ', cat: 'ibadah', start: { after: 'wake' }, duration: 'tahajjud', note: '২ রাকাত + সংক্ষিপ্ত দোয়া' };
const fajrJamaat = { id: 'fajrJamaat', label: 'ফজর জামাত (মসজিদে)', cat: 'ibadah', prayerKey: 'fajr', start: { anchor: 'fajrJamaat' }, duration: 'fajrJamaatDuration' };

export const WORKDAY = [
  wake(),
  tahajjud,
  { id: 'sunnahTilawat', label: 'ফজরের সুন্নত + তিলাওয়াত', cat: 'ibadah', start: { after: 'tahajjud' }, duration: 'sunnahTilawat', note: 'কুরআন তিলাওয়াত / জিকির — জামাতের অপেক্ষায়' },
  fajrJamaat,
  { id: 'mosqueReturn', label: 'মসজিদ থেকে ফেরা / প্রস্তুতি', cat: 'personal', start: { after: 'fajrJamaat' }, duration: 'mosqueReturn' },
  { id: 'morningCode', label: 'কোডিং শেখা', cat: 'learning', start: { after: 'mosqueReturn' }, flex: true, min: 'minMorningCoding', note: 'নতুন টপিক — মাথা সবচেয়ে ফ্রেশ থাকা সময়' },
  { id: 'breakfast', label: 'নাস্তা + রেডি', cat: 'personal', end: { anchor: 'leaveHome' }, duration: 'breakfast' },
  { id: 'leaveHome', label: 'অফিসের উদ্দেশ্যে বের হওয়া', cat: 'office', start: { anchor: 'leaveHome' }, duration: 0 },
  // Each office segment's end falls back to officeEnd if the next prayer time
  // doesn't actually land inside office hours (e.g. a short early-close day).
  { id: 'office1', label: 'অফিস', cat: 'office', start: { anchor: 'officeStart' }, end: (a) => (withinOffice(a, 'dhuhrJamaat') ? a.dhuhrJamaat : a.officeEnd) },
  { id: 'dhuhrBreak', label: 'যোহরের বিরতি', cat: 'ibadah', prayerKey: 'dhuhr', start: { anchor: 'dhuhrJamaat' }, duration: 'officeBreakDhuhr', skipIf: (a) => !withinOffice(a, 'dhuhrJamaat') },
  { id: 'office2', label: 'অফিস', cat: 'office', start: { after: 'dhuhrBreak' }, end: (a) => (withinOffice(a, 'asrJamaat') ? a.asrJamaat : a.officeEnd) },
  { id: 'asrBreak', label: 'আসরের বিরতি', cat: 'ibadah', prayerKey: 'asr', start: { anchor: 'asrJamaat' }, duration: 'officeBreakAsr', skipIf: (a) => !withinOffice(a, 'asrJamaat') },
  { id: 'office3', label: 'অফিস', cat: 'office', start: { after: 'asrBreak' }, end: (a) => (withinOffice(a, 'maghribJamaat') ? a.maghribJamaat : a.officeEnd) },
  { id: 'maghribBreak', label: 'মাগরিবের বিরতি', cat: 'ibadah', prayerKey: 'maghrib', start: { anchor: 'maghribJamaat' }, duration: 'officeBreakMaghrib', skipIf: (a) => !withinOffice(a, 'maghribJamaat') },
  { id: 'office4', label: 'অফিস', cat: 'office', start: { after: 'maghribBreak' }, end: { anchor: 'officeEnd' }, note: 'দিনের শেষ কর্ম-ব্লক' },
  { id: 'arriveHome', label: 'বাসায় ফেরা', cat: 'personal', start: { anchor: 'arriveHome' }, duration: 0 },
  { id: 'ishaMeal', label: 'এশা + খাবার', cat: 'ibadah', start: { after: 'arriveHome' }, duration: 'ishaMeal' },
  { id: 'codingPractice', label: 'কোডিং প্র্যাকটিস', cat: 'learning', start: { after: 'ishaMeal' }, duration: 'codingPractice' },
  { id: 'reading', label: 'বই পড়া', cat: 'learning', start: { after: 'codingPractice' }, duration: 'reading' },
  { id: 'windDown', label: 'গোছানো, ঘুমের প্রস্তুতি', cat: 'rest', start: { after: 'reading' }, flex: true, min: 15 },
  { id: 'sleep', label: 'ঘুম', cat: 'rest', start: { anchor: 'bedtime' }, duration: 0 },
];

export const FRIDAY = [
  wake(),
  tahajjud,
  { id: 'sunnahTilawat', label: 'ফজরের সুন্নত + সূরা কাহফ তিলাওয়াত', cat: 'ibadah', start: { after: 'tahajjud' }, duration: 'sunnahTilawat', note: 'জুম্মাবারের সুন্নত আমল' },
  fajrJamaat,
  { id: 'earlyCoding', label: 'কোডিং শেখা', cat: 'learning', start: { after: 'fajrJamaat' }, duration: 'weekendEarlyCoding', note: 'অফিস নেই — জটিল টপিক বা প্রজেক্টের জন্য দীর্ঘ সেশন' },
  { id: 'breakfast', label: 'নাস্তা', cat: 'personal', start: { after: 'earlyCoding' }, duration: 'breakfast' },
  { id: 'lateCoding', label: 'কোডিং প্র্যাকটিস / প্রজেক্ট কাজ', cat: 'learning', start: { after: 'breakfast' }, flex: true, min: 'minWeekendCoding' },
  { id: 'jummaPrep', label: 'গোসল, ভালো কাপড়, খুশবু', cat: 'ibadah', end: { anchor: 'jummaGo' }, duration: 'jummaPrep', note: 'সুন্নত আমল' },
  { id: 'goToMosque', label: 'মসজিদে যাওয়া', cat: 'ibadah', start: { anchor: 'jummaGo' }, duration: 'jamaatWalk', note: 'খুতবার আগে পৌঁছানো সুন্নত' },
  { id: 'jummaPrayer', label: 'জুম্মার নামাজ ও খুতবা', cat: 'ibadah', prayerKey: 'jumma', start: { after: 'goToMosque' }, duration: 'jummaDuration', note: 'স্থানীয় মসজিদের সময় অনুযায়ী সমন্বয় করুন' },
  { id: 'lunchRest', label: 'দুপুরের খাবার, বিশ্রাম', cat: 'personal', start: { after: 'jummaPrayer' }, duration: 'lunchRest' },
  { id: 'familyTime', label: 'পরিবারের সময় / বই পড়া', cat: 'personal', start: { after: 'lunchRest' }, flex: true, min: 30 },
  { id: 'asr', label: 'আসর নামাজ', cat: 'ibadah', prayerKey: 'asr', start: { anchor: 'asrJamaat' }, duration: 'jamaatPrayer' },
  { id: 'eveningCoding', label: 'হালকা কোডিং প্র্যাকটিস', cat: 'learning', start: { after: 'asr' }, flex: true, min: 20 },
  { id: 'maghrib', label: 'মাগরিব নামাজ', cat: 'ibadah', prayerKey: 'maghrib', start: { anchor: 'maghribJamaat' }, duration: 'jamaatPrayer' },
  { id: 'lightCoding', label: 'হালকা কাজ', cat: 'learning', start: { after: 'maghrib' }, duration: 'eveningLightCoding' },
  { id: 'isha', label: 'এশা নামাজ', cat: 'ibadah', prayerKey: 'isha', start: { anchor: 'ishaJamaat' }, duration: 'jamaatPrayer' },
  { id: 'windDown', label: 'ঘুমের প্রস্তুতি', cat: 'rest', start: { after: 'isha' }, flex: true, min: 15 },
  { id: 'sleep', label: 'ঘুম', cat: 'rest', start: { anchor: 'bedtime' }, duration: 0 },
];

export const SATURDAY = [
  wake(),
  tahajjud,
  { id: 'sunnahTilawat', label: 'ফজরের সুন্নত + তিলাওয়াত/জিকির', cat: 'ibadah', start: { after: 'tahajjud' }, duration: 'sunnahTilawat' },
  fajrJamaat,
  { id: 'earlyCoding', label: 'কোডিং শেখা', cat: 'learning', start: { after: 'fajrJamaat' }, duration: 'weekendEarlyCoding', note: 'সপ্তাহের সবচেয়ে বড় সেশন — নতুন/জটিল টপিক' },
  { id: 'breakfast', label: 'নাস্তা', cat: 'personal', start: { after: 'earlyCoding' }, duration: 'breakfast' },
  { id: 'lateCoding', label: 'কোডিং প্র্যাকটিস / প্রজেক্ট কাজ', cat: 'learning', start: { after: 'breakfast' }, flex: true, min: 'minWeekendCoding', note: 'পোর্ট টুলস, পোর্টফোলিও ইত্যাদি' },
  { id: 'dhuhr', label: 'যোহর নামাজ, খাবার, বিশ্রাম', cat: 'ibadah', prayerKey: 'dhuhr', start: { anchor: 'dhuhrJamaat' }, duration: 'jamaatPrayer' },
  { id: 'lunchRest', label: 'খাবার, বিশ্রাম / ন্যাপ', cat: 'personal', start: { after: 'dhuhr' }, duration: 'lunchRest' },
  { id: 'personalTime', label: 'পরিবারের সময় / ব্যক্তিগত কাজ', cat: 'personal', start: { after: 'lunchRest' }, flex: true, min: 30 },
  { id: 'asr', label: 'আসর নামাজ', cat: 'ibadah', prayerKey: 'asr', start: { anchor: 'asrJamaat' }, duration: 'jamaatPrayer' },
  { id: 'afternoonReading', label: 'বই পড়া / হালকা কাজ', cat: 'learning', start: { after: 'asr' }, duration: 'afternoonReading' },
  { id: 'maghrib', label: 'মাগরিব নামাজ', cat: 'ibadah', prayerKey: 'maghrib', start: { anchor: 'maghribJamaat' }, duration: 'jamaatPrayer' },
  { id: 'weekReview', label: 'সপ্তাহের রিভিউ ও পরের সপ্তাহের পরিকল্পনা', cat: 'personal', start: { after: 'maghrib' }, duration: 'weekReview' },
  { id: 'isha', label: 'এশা নামাজ', cat: 'ibadah', prayerKey: 'isha', start: { anchor: 'ishaJamaat' }, duration: 'jamaatPrayer' },
  { id: 'windDown', label: 'ঘুমের প্রস্তুতি', cat: 'rest', start: { after: 'isha' }, flex: true, min: 15 },
  { id: 'sleep', label: 'ঘুম', cat: 'rest', start: { anchor: 'bedtime' }, duration: 0 },
];

export const PROFILES = {
  workday: { key: 'workday', label: 'কর্মদিবস', sub: 'রবি – বৃহস্পতি', template: WORKDAY },
  friday: { key: 'friday', label: 'জুম্মাবার', sub: 'শুক্রবার', template: FRIDAY },
  saturday: { key: 'saturday', label: 'শনিবার', sub: 'সাপ্তাহিক ছুটি', template: SATURDAY },
};

export function profileForWeekday(weekday) {
  if (weekday === 5) return 'friday';
  if (weekday === 6) return 'saturday';
  return 'workday';
}
