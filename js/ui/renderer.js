import { formatBanglaRange, formatBanglaTime, formatDuration, toBanglaDigits } from '../core/time.js';
import { PRAYER_LABELS, PRAYER_STATUSES } from '../data/defaults.js';

const CAT_META = {
  ibadah: { color: 'var(--forest)', label: 'ইবাদত' },
  learning: { color: 'var(--gold)', label: 'শেখা' },
  office: { color: 'var(--navy)', label: 'অফিস' },
  personal: { color: 'var(--muted)', label: 'ব্যক্তিগত' },
  rest: { color: '#6b7280', label: 'বিশ্রাম' },
};

const STAT_CARDS = [
  { cat: 'sleep', label: 'ঘুম' },
  { cat: 'learning', label: 'শেখা' },
  { cat: 'office', label: 'অফিস' },
  { cat: 'ibadah', label: 'ইবাদত' },
];

export function renderStats(container, stats) {
  const cards = STAT_CARDS.map(({ cat, label }) => {
    const mins = cat === 'sleep' ? (stats.sleepMinutes ?? 0) : (stats.byCat[cat] ?? 0);
    return `<div class="stat"><span class="stat-num">${formatDuration(mins)}</span><span class="stat-label">${label}</span></div>`;
  }).join('');
  container.innerHTML = cards;
}

export function renderWarnings(container, warnings) {
  if (!warnings.length) { container.innerHTML = ''; container.classList.add('hidden'); return; }
  container.classList.remove('hidden');
  container.innerHTML = `<h3>সমন্বয় প্রয়োজন</h3><ul>${warnings.map((w) => `<li>${w}</li>`).join('')}</ul>`;
}

function prayerToggle(block, status) {
  const buttons = PRAYER_STATUSES.map((s) => {
    const active = status === s;
    return `<button type="button" class="ptoggle${active ? ' active' : ''}" data-prayer="${block.prayerKey}" data-status="${s}">${s}</button>`;
  }).join('');
  return `<div class="prayer-toggle" role="group" aria-label="${PRAYER_LABELS[block.prayerKey] ?? ''} স্ট্যাটাস">${buttons}</div>`;
}

function blockRow(block, dayLog) {
  const meta = CAT_META[block.cat] ?? CAT_META.personal;
  const timeText = block.end === block.start ? formatBanglaTime(block.start) : formatBanglaRange(block.start, block.end);
  const status = block.prayerKey ? (dayLog.prayers?.[block.prayerKey] ?? null) : null;
  return `
  <li class="row" data-block-id="${block.id}" data-start="${block.start}" data-end="${block.end}">
    <span class="time">${timeText}</span>
    <span class="spine"><span class="node" style="--dot:${meta.color}"><svg width="7" height="7"><circle cx="3.5" cy="3.5" r="3" fill="${meta.color}"/></svg></span></span>
    <div class="content">
      <p class="activity">${block.label}</p>
      ${block.note ? `<p class="note">${block.note}</p>` : ''}
      ${block.durationActual != null ? `<p class="note">নমনীয় সময়: ${formatDuration(block.durationActual)}</p>` : ''}
      ${block.prayerKey ? prayerToggle(block, status) : ''}
    </div>
  </li>`;
}

function gapRow(startMin, endMin) {
  const mins = endMin - startMin;
  if (mins < 5) return '';
  return `
  <li class="row gap-row" data-start="${startMin}" data-end="${endMin}">
    <span class="time">${formatBanglaRange(startMin, endMin)}</span>
    <span class="spine"><span class="node"></span></span>
    <div class="content"><p class="activity">ফাঁকা সময়</p><p class="note">${toBanglaDigits(mins)} মিনিট বাফার</p></div>
  </li>`;
}

export function renderTimeline(container, blocks, dayLog) {
  let html = '';
  for (let i = 0; i < blocks.length; i++) {
    html += blockRow(blocks[i], dayLog);
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
