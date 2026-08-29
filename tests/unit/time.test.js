import { describe, it, expect } from 'vitest';
import {
  toBanglaDigits, hhmmToMinutes, minutesToHHMM, formatTime, formatRange,
  formatDuration, dateKey, WEEKDAY_NAMES_BN, WEEKDAY_NAMES_EN, todayProfile,
} from '../../js/core/time.js';

describe('toBanglaDigits', () => {
  it('maps every ASCII digit to its Bangla counterpart', () => {
    expect(toBanglaDigits('0123456789')).toBe('০১২৩৪৫৬৭৮৯');
  });

  it('leaves non-digit characters untouched', () => {
    expect(toBanglaDigits('4:30 PM')).toBe('৪:৩০ PM');
  });
});

describe('hhmmToMinutes / minutesToHHMM', () => {
  it('round-trips a normal time', () => {
    expect(hhmmToMinutes('04:30')).toBe(270);
    expect(minutesToHHMM(270)).toBe('04:30');
  });

  it('wraps minutes past midnight into the next day', () => {
    expect(minutesToHHMM(1440)).toBe('00:00');
    expect(minutesToHHMM(1500)).toBe('01:00');
  });

  it('wraps negative minutes back into the previous day', () => {
    expect(minutesToHHMM(-30)).toBe('23:30');
  });
});

describe('formatTime', () => {
  it('formats English as 12h clock with AM/PM', () => {
    expect(formatTime(0, 'en')).toBe('12:00 AM');
    expect(formatTime(12 * 60, 'en')).toBe('12:00 PM');
    expect(formatTime(13 * 60 + 5, 'en')).toBe('1:05 PM');
  });

  it('formats Bangla with a period word and Bangla digits', () => {
    expect(formatTime(4 * 60 + 30, 'bn')).toBe('রাত ৪:৩০');
    expect(formatTime(9 * 60, 'bn')).toBe('সকাল ৯');
  });
});

describe('formatRange', () => {
  it('joins two formatted times with an en dash', () => {
    expect(formatRange(60, 90, 'en')).toBe('1:00 AM – 1:30 AM');
  });
});

describe('formatDuration', () => {
  it('formats hours and minutes in English', () => {
    expect(formatDuration(125, 'en')).toBe('2h 5m');
    expect(formatDuration(60, 'en')).toBe('1h');
    expect(formatDuration(45, 'en')).toBe('45m');
  });

  it('formats hours and minutes in Bangla with Bangla digits', () => {
    expect(formatDuration(125, 'bn')).toBe('২ ঘণ্টা ৫ মিনিট');
    expect(formatDuration(45, 'bn')).toBe('৪৫ মিনিট');
  });
});

describe('dateKey', () => {
  it('formats a date as YYYY-MM-DD regardless of locale', () => {
    expect(dateKey(new Date(2026, 7, 30))).toBe('2026-08-30');
  });
});

describe('todayProfile', () => {
  it('maps Friday/Saturday to their own profiles and everything else to workday', () => {
    expect(todayProfile(new Date(2026, 7, 28))).toBe('friday'); // Fri
    expect(todayProfile(new Date(2026, 7, 29))).toBe('saturday'); // Sat
    expect(todayProfile(new Date(2026, 7, 30))).toBe('workday'); // Sun
  });
});

describe('WEEKDAY_NAMES', () => {
  it('has 7 full (non-abbreviated) names in both languages, Sunday first', () => {
    expect(WEEKDAY_NAMES_EN).toHaveLength(7);
    expect(WEEKDAY_NAMES_BN).toHaveLength(7);
    expect(WEEKDAY_NAMES_EN[0]).toBe('Sunday');
    expect(WEEKDAY_NAMES_BN[0]).toBe('রবিবার');
  });
});
