// Minute-based time helpers. All schedule math happens in "minutes since 00:00",
// wrapped mod 1440 so pre-midnight/post-midnight blocks (Tahajjud, sleep) stay simple.

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

const PERIOD_LABELS = [
  { upto: 5 * 60, label: 'রাত' },
  { upto: 6 * 60, label: 'ভোর' },
  { upto: 12 * 60, label: 'সকাল' },
  { upto: 15 * 60, label: 'দুপুর' },
  { upto: 18 * 60, label: 'বিকাল' },
  { upto: 20 * 60, label: 'সন্ধ্যা' },
  { upto: 24 * 60, label: 'রাত' },
];

// Formats minutes as "সকাল ৫:৩০" — period word + 12-hour Bangla-digit clock.
export function formatBanglaTime(mins) {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440;
  const period = PERIOD_LABELS.find((p) => m < p.upto)?.label ?? 'রাত';
  let h = Math.floor(m / 60) % 12;
  if (h === 0) h = 12;
  const mm = m % 60;
  const clock = mm === 0 ? `${h}` : `${h}:${String(mm).padStart(2, '0')}`;
  return `${period} ${toBanglaDigits(clock)}`;
}

export function formatBanglaRange(startMins, endMins) {
  return `${formatBanglaTime(startMins)} – ${formatBanglaTime(endMins)}`;
}

export function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
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

export function formatBanglaDate(date = new Date()) {
  const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  return `${WEEKDAY_NAMES_BN[date.getDay()]}, ${toBanglaDigits(date.getDate())} ${months[date.getMonth()]} ${toBanglaDigits(date.getFullYear())}`;
}

export function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
