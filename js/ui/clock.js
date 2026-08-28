import { nowMinutes, formatBanglaDate, toBanglaDigits, formatDuration } from '../core/time.js';
import { toHijri } from '../core/hijri.js';

let timer = null;

export function startClock({ onTick, clockEl, dateEl, hijriOffset = 0 }) {
  stopClock();
  const tick = () => {
    const now = new Date();
    if (clockEl) {
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      clockEl.textContent = toBanglaDigits(`${h}:${m}`);
    }
    if (dateEl) {
      const hj = toHijri(now, hijriOffset);
      dateEl.textContent = `${formatBanglaDate(now)} · ${toBanglaDigits(hj.day)} ${hj.monthName} ${toBanglaDigits(hj.year)} হিজরি`;
    }
    onTick?.(nowMinutes(now));
  };
  tick();
  timer = setInterval(tick, 15000);
}

export function stopClock() {
  if (timer) clearInterval(timer);
  timer = null;
}

export function renderCountdown(el, blocks, nowMin) {
  const upcoming = blocks.find((b) => b.start > nowMin);
  const current = [...blocks].reverse().find((b) => b.start <= nowMin && nowMin < b.end);
  if (!el) return;
  if (current && current.end - nowMin < 240) {
    el.textContent = `"${current.label}" শেষ হতে আর ${formatDuration(current.end - nowMin)}`;
  } else if (upcoming) {
    el.textContent = `পরবর্তী: "${upcoming.label}" — ${formatDuration(upcoming.start - nowMin)} পর`;
  } else {
    el.textContent = '';
  }
}
