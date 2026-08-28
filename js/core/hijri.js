// Gregorian → Hijri via the tabular (Kuwaiti) algorithm, plus a user-adjustable
// day offset since real moon sighting in Bangladesh often differs by ±1 day.

const HIJRI_MONTHS_BN = [
  'মুহররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি', 'জমাদিউল আউয়াল', 'জমাদিউস সানি',
  'রজব', 'শাবান', 'রমজান', 'শাওয়াল', 'জিলক্বদ', 'জিলহজ্জ',
];

function gregorianToJdn(y, m, d) {
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  return d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 + Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;
}

function jdnToHijri(jdn) {
  const islamicEpoch = 1948440; // JDN of 1 Muharram 1 AH
  let l = jdn - islamicEpoch + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) +
    (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
  l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) -
    (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  const month = Math.floor((24 * l) / 709);
  const day = l - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { year, month, day };
}

export function toHijri(date = new Date(), dayOffset = 0) {
  const jdn = gregorianToJdn(date.getFullYear(), date.getMonth() + 1, date.getDate()) + dayOffset;
  const h = jdnToHijri(jdn);
  return { year: h.year, month: h.month, day: h.day, monthName: HIJRI_MONTHS_BN[h.month - 1] };
}

