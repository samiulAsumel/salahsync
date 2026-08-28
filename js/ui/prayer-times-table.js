// The direct start/end/jamaat editor for each of the 5 waqts — split out of
// settings.js purely to keep both files under the 200-line limit.
import { computeWaqtTimes } from '../core/waqt-times.js';
import { minutesToHHMM } from '../core/time.js';
import { timeField } from './time-picker.js';
import { t } from '../core/i18n.js';

export const WAQTS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export function prayerTimesTable(s) {
  const w = computeWaqtTimes(s);
  const header = `
    <div class="ptt-row ptt-header">
      <span></span><span>${t('settings.colStart')}</span><span>${t('settings.colEnd')}</span><span>${t('settings.colJamaat')}</span>
    </div>`;
  const rows = WAQTS.map((key) => {
    const p = w[key];
    const m = s.prayerManual[key] || {};
    const cell = (field, val) => `<span class="${m[field] ? 'ptt-manual' : ''}">${timeField(`prayerManual.${key}.${field}`, minutesToHHMM(val))}</span>`;
    return `
    <div class="ptt-row">
      <span class="ptt-name">${t('prayer.' + key)}</span>
      ${cell('start', p.start)}${cell('end', p.end)}${cell('jamaat', p.jamaat)}
    </div>`;
  }).join('');
  return `
    <div class="ptt">${header}${rows}</div>
    <button type="button" id="btn-reset-prayer-times" class="btn-file">${t('settings.btnResetPrayerTimes')}</button>
  `;
}
