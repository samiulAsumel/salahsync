import { nowMinutes, formatDate, toBanglaDigits, formatDuration } from '../core/time.js';
import { toHijri } from '../core/hijri.js';
import { t, tBlock, getLang } from '../core/i18n.js';

let timer = null;

export function startClock({ onTick, clockEl, dateEl, hijriOffset = 0 }) {
  stopClock();
  const tick = () => {
    const now = new Date();
    const lang = getLang();
    if (clockEl) {
      const period = now.getHours() < 12 ? 'AM' : 'PM';
      let h = now.getHours() % 12;
      if (h === 0) h = 12;
      const m = String(now.getMinutes()).padStart(2, '0');
      const sec = String(now.getSeconds()).padStart(2, '0');
      const clock = lang === 'en' ? `${h}:${m}:${sec}` : toBanglaDigits(`${h}:${m}:${sec}`);
      clockEl.textContent = `${clock} ${period}`;
    }
    if (dateEl) {
      const hj = toHijri(now, hijriOffset, lang);
      const day = lang === 'en' ? hj.day : toBanglaDigits(hj.day);
      const year = lang === 'en' ? hj.year : toBanglaDigits(hj.year);
      const hijriWord = lang === 'en' ? 'AH' : 'হিজরি';
      dateEl.textContent = `${formatDate(now, lang)} · ${day} ${hj.monthName} ${year} ${hijriWord}`;
    }
    onTick?.(nowMinutes(now));
  };
  tick();
  timer = setInterval(tick, 1000); // 1s so the clock's seconds actually tick
}

export function stopClock() {
  if (timer) clearInterval(timer);
  timer = null;
}

export function renderCountdown(el, blocks, nowMin, profileKey) {
  const upcoming = blocks.find((b) => b.start > nowMin);
  const current = [...blocks].reverse().find((b) => b.start <= nowMin && nowMin < b.end);
  if (!el) return;
  const lang = getLang();
  const labelOf = (b) => tBlock(profileKey, b.id, 'label') ?? b.id;
  if (current && current.end - nowMin < 240) {
    el.textContent = t('countdown.endingIn', { label: labelOf(current), duration: formatDuration(current.end - nowMin, lang) });
  } else if (upcoming) {
    el.textContent = t('countdown.upcoming', { label: labelOf(upcoming), duration: formatDuration(upcoming.start - nowMin, lang) });
  } else {
    el.textContent = '';
  }
}
