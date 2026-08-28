// Shows the raw waqt (adhan) start times — distinct from the jamaat times already
// inside the timeline blocks. Consumes the `anchors` resolveSchedule() already
// returns, so no extra time computation happens here.
import { formatTime } from '../core/time.js';
import { t, getLang } from '../core/i18n.js';

const WAQTS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

export function renderPrayerPanel(container, anchors) {
  const lang = getLang();
  const cells = WAQTS.map((key) => `
    <div class="waqt-cell">
      <span class="waqt-label">${t('prayer.' + key)}</span>
      <span class="waqt-time">${formatTime(anchors[key], lang)}</span>
    </div>`).join('');
  container.innerHTML = cells;
}
