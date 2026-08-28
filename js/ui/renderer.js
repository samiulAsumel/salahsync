import { formatRange, formatTime, formatDuration, toBanglaDigits } from '../core/time.js';
import { t, tBlock, getLang } from '../core/i18n.js';
import { PRAYER_STATUSES } from '../data/defaults.js';

const CAT_COLOR = {
  ibadah: 'var(--forest)', learning: 'var(--gold)', office: 'var(--navy)',
  personal: 'var(--muted)', rest: '#6b7280',
};

const STAT_CATS = ['sleep', 'learning', 'office', 'ibadah'];

export function renderStats(container, stats) {
  const lang = getLang();
  const cards = STAT_CATS.map((cat) => {
    const mins = cat === 'sleep' ? (stats.sleepMinutes ?? 0) : (stats.byCat[cat] ?? 0);
    return `<div class="stat"><span class="stat-num">${formatDuration(mins, lang)}</span><span class="stat-label">${t('stat.' + cat)}</span></div>`;
  }).join('');
  container.innerHTML = cards;
}

export function renderWarnings(container, warnings) {
  if (!warnings.length) { container.innerHTML = ''; container.classList.add('hidden'); return; }
  container.classList.remove('hidden');
  container.innerHTML = `<h3>${t('warnings.header')}</h3><ul>${warnings.map((w) => `<li>${w}</li>`).join('')}</ul>`;
}

function prayerToggle(block, status) {
  const buttons = PRAYER_STATUSES.map((code) => {
    const active = status === code;
    return `<button type="button" class="ptoggle${active ? ' active' : ''}" data-prayer="${block.prayerKey}" data-status="${code}">${t('prayerStatus.' + code)}</button>`;
  }).join('');
  return `<div class="prayer-toggle" role="group" aria-label="${t('prayer.' + block.prayerKey)}">${buttons}</div>`;
}

function blockRow(block, dayLog, profileKey) {
  const lang = getLang();
  const color = CAT_COLOR[block.cat] ?? CAT_COLOR.personal;
  const timeText = block.end === block.start ? formatTime(block.start, lang) : formatRange(block.start, block.end, lang);
  const status = block.prayerKey ? (dayLog.prayers?.[block.prayerKey] ?? null) : null;
  const label = tBlock(profileKey, block.id, 'label') ?? block.id;
  const note = tBlock(profileKey, block.id, 'note');
  return `
  <li class="row" data-block-id="${block.id}" data-start="${block.start}" data-end="${block.end}">
    <span class="time">${timeText}</span>
    <span class="spine"><span class="node" style="--dot:${color}"><svg width="7" height="7"><circle cx="3.5" cy="3.5" r="3" fill="${color}"/></svg></span></span>
    <div class="content">
      <p class="activity">${label}</p>
      ${note ? `<p class="note">${note}</p>` : ''}
      ${block.durationActual != null ? `<p class="note">${t('timeline.flexActual', { duration: formatDuration(block.durationActual, lang) })}</p>` : ''}
      ${block.prayerKey ? prayerToggle(block, status) : ''}
    </div>
  </li>`;
}

function gapRow(startMin, endMin) {
  const lang = getLang();
  const mins = endMin - startMin;
  if (mins < 5) return '';
  const minsText = lang === 'en' ? mins : toBanglaDigits(mins);
  return `
  <li class="row gap-row" data-start="${startMin}" data-end="${endMin}">
    <span class="time">${formatRange(startMin, endMin, lang)}</span>
    <span class="spine"><span class="node"></span></span>
    <div class="content"><p class="activity">${t('timeline.freeTime')}</p><p class="note">${t('timeline.bufferMinutes', { n: minsText })}</p></div>
  </li>`;
}

export function renderTimeline(container, blocks, dayLog, profileKey) {
  let html = '';
  for (let i = 0; i < blocks.length; i++) {
    html += blockRow(blocks[i], dayLog, profileKey);
    const next = blocks[i + 1];
    if (next && next.start > blocks[i].end) html += gapRow(blocks[i].end, next.start);
  }
  container.innerHTML = html;
}

export function highlightNow(container, nowMin) {
  container.querySelectorAll('.row').forEach((row) => {
    const s = Number(row.dataset.start);
    const e = Number(row.dataset.end);
    const isNow = nowMin >= s && (nowMin < e || (s === e && Math.abs(nowMin - s) < 1));
    row.classList.toggle('is-now', isNow);
    row.classList.toggle('is-past', nowMin > e && !isNow);
  });
}
