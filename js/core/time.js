// Minute-based time helpers. All schedule math happens in "minutes since 00:00",
// wrapped mod 1440 so pre-midnight/post-midnight blocks (Tahajjud, sleep) stay simple.
// Display formatting takes an explicit `lang` ('bn'|'en', default 'bn') — callers
// pass core/i18n.js's getLang() so every UI surface can switch languages in one place.

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBanglaDigits(input) {
  return String(input).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

export function hhmmToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToHHMM(mins) {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

const PERIOD_LABELS_BN = [
  { upto: 5 * 60, label: 'রাত' }, { upto: 6 * 60, label: 'ভোর' }, { upto: 12 * 60, label: 'সকাল' },
  { upto: 15 * 60, label: 'দুপুর' }, { upto: 18 * 60, label: 'বিকাল' }, { upto: 20 * 60, label: 'সন্ধ্যা' },
  { upto: 24 * 60, label: 'রাত' },
];

// bn: "সকাল ৫:৩০" (period word + Bangla-digit 12h clock). en: "5:30 AM".
export function formatTime(mins, lang = 'bn') {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440;
  let h = Math.floor(m / 60) % 12;
  if (h === 0) h = 12;
  const mm = m % 60;
  if (lang === 'en') {
    const ampm = Math.floor(((Math.round(mins) % 1440) + 1440) % 1440 / 60) < 12 ? 'AM' : 'PM';
    return `${h}:${String(mm).padStart(2, '0')} ${ampm}`;
  }
  const period = PERIOD_LABELS_BN.find((p) => m < p.upto)?.label ?? 'রাত';
  const clock = mm === 0 ? `${h}` : `${h}:${String(mm).padStart(2, '0')}`;
  return `${period} ${toBanglaDigits(clock)}`;
}

export function formatRange(startMins, endMins, lang = 'bn') {
  return `${formatTime(startMins, lang)} – ${formatTime(endMins, lang)}`;
}

export function formatDuration(mins, lang = 'bn') {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (lang === 'en') {
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  }
  if (h > 0 && m > 0) return `${toBanglaDigits(h)} ঘণ্টা ${toBanglaDigits(m)} মিনিট`;
  if (h > 0) return `${toBanglaDigits(h)} ঘণ্টা`;
  return `${toBanglaDigits(m)} মিনিট`;
}

export function nowMinutes(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
}

// Bangladesh week: 0=Sun..6=Sat, but Friday(5)/Saturday(6) are the off-days.
export function todayProfile(date = new Date()) {
  const day = date.getDay();
  if (day === 5) return 'friday';
  if (day === 6) return 'saturday';
  return 'workday';
}

export const WEEKDAY_NAMES_BN = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
export const WEEKDAY_NAMES_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_BN = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function formatDate(date = new Date(), lang = 'bn') {
  if (lang === 'en') return `${WEEKDAY_NAMES_EN[date.getDay()]}, ${date.getDate()} ${MONTHS_EN[date.getMonth()]} ${date.getFullYear()}`;
  return `${WEEKDAY_NAMES_BN[date.getDay()]}, ${toBanglaDigits(date.getDate())} ${MONTHS_BN[date.getMonth()]} ${toBanglaDigits(date.getFullYear())}`;
}

export function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
