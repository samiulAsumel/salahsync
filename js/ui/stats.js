import { dateKey, toBanglaDigits, WEEKDAY_NAMES_BN } from '../core/time.js';

function lastNDates(n) {
  const out = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push(d);
  }
  return out;
}

export function computeFajrStreak(state) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const log = state.logs[dateKey(d)];
    const status = log?.prayers?.fajr;
    if (status === 'জামাত') { streak++; continue; }
    if (i === 0 && !status) continue; // today not logged yet — don't break the streak
    break;
  }
  return streak;
}

export function computeJamaatPercent(state, days = 7) {
  const dates = lastNDates(days);
  let total = 0;
  let jamaat = 0;
  for (const d of dates) {
    const prayers = state.logs[dateKey(d)]?.prayers ?? {};
    for (const status of Object.values(prayers)) {
      total++;
      if (status === 'জামাত') jamaat++;
    }
  }
  return total ? Math.round((jamaat / total) * 100) : 0;
}

export function renderStreakPanel(container, state) {
  const streak = computeFajrStreak(state);
  const pct = computeJamaatPercent(state, 7);
  container.innerHTML = `
    <div class="streak-card"><span class="streak-num">${toBanglaDigits(streak)}</span><span class="streak-label">ফজর জামাত স্ট্রিক (দিন)</span></div>
    <div class="streak-card"><span class="streak-num">${toBanglaDigits(pct)}%</span><span class="streak-label">গত ৭ দিনের জামাত হার</span></div>
  `;
}

export function renderWeeklyChart(container, state, habitId, days = 7) {
  const dates = lastNDates(days);
  const values = dates.map((d) => Number(state.logs[dateKey(d)]?.habits?.[habitId]) || 0);
  const max = Math.max(1, ...values);
  const w = 280, h = 90, barW = w / days - 6;
  const bars = values.map((v, i) => {
    const barH = Math.max(2, (v / max) * (h - 20));
    const x = i * (w / days) + 3;
    const y = h - barH - 16;
    const label = WEEKDAY_NAMES_BN[dates[i].getDay()].slice(0, 1);
    return `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="2" fill="var(--forest)" opacity="${i === days - 1 ? 1 : 0.55}"/>
      <text x="${x + barW / 2}" y="${h - 4}" text-anchor="middle" font-size="9" fill="var(--muted)">${label}</text>`;
  }).join('');
  container.innerHTML = `<svg viewBox="0 0 ${w} ${h}" class="w-full h-24">${bars}</svg>`;
}
