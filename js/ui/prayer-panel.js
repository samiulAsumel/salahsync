// Shows each waqt's start time plus its jamaat time — distinct from the jamaat
// times already inside the timeline blocks, so the two are visible at a glance
// together. Consumes the `anchors` resolveSchedule() already returns, so no
// extra time computation happens here.
import { formatTime } from '../core/time.js';
import { t, getLang } from '../core/i18n.js';

const WAQTS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
const JAMAAT_ANCHOR = { fajr: 'fajrJamaat', dhuhr: 'dhuhrJamaat', asr: 'asrJamaat', maghrib: 'maghribJamaat', isha: 'ishaJamaat' };

export function renderPrayerPanel(container, anchors) {
  const lang = getLang();
  const cells = WAQTS.map((key) => {
    const jamaatKey = JAMAAT_ANCHOR[key];
    const jamaatRow = jamaatKey
      ? `<span class="waqt-jamaat">${t('settings.colJamaat')} ${formatTime(anchors[jamaatKey], lang)}</span>`
      : '';
    return `
    <div class="waqt-cell">
      <span class="waqt-label">${t('prayer.' + key)}</span>
      <span class="waqt-time">${formatTime(anchors[key], lang)}</span>
      ${jamaatRow}
    </div>`;
  }).join('');
  container.innerHTML = cells;
}
