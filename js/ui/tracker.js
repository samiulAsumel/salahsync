import { HABITS } from '../data/defaults.js';
import { toBanglaDigits } from '../core/time.js';
import { t, getLang } from '../core/i18n.js';
import { setHabitValue } from '../core/store.js';

const digits = (n) => (getLang() === 'en' ? n : toBanglaDigits(n));

function habitRow(habit, value) {
  const label = t('habit.' + habit.id);
  if (habit.type === 'checkbox') {
    const checked = !!value;
    return `
    <label class="habit-row">
      <input type="checkbox" data-habit="${habit.id}" ${checked ? 'checked' : ''}>
      <span>${label}</span>
    </label>`;
  }
  const v = value || 0;
  const unit = habit.unitKey ? t('unit.' + habit.unitKey) : '';
  const pct = habit.target ? Math.min(100, Math.round((v / habit.target) * 100)) : 0;
  return `
  <div class="habit-row habit-count">
    <span class="habit-name">${label}${unit ? ` <em>(${unit})</em>` : ''}</span>
    <div class="habit-controls">
      <button type="button" data-habit-step="${habit.id}" data-delta="-1">−</button>
      <input type="number" min="0" data-habit="${habit.id}" value="${v}">
      <button type="button" data-habit-step="${habit.id}" data-delta="1">+</button>
    </div>
    ${habit.target ? `<div class="habit-bar"><div class="habit-bar-fill" style="width:${pct}%"></div></div><span class="habit-target">${digits(v)}/${digits(habit.target)}</span>` : ''}
  </div>`;
}

export function renderHabits(container, dayLog) {
  container.innerHTML = HABITS.map((h) => habitRow(h, dayLog.habits?.[h.id])).join('');
}

export function wireHabits(container, dateKey, onChange) {
  container.addEventListener('change', (e) => {
    const id = e.target.dataset.habit;
    if (!id) return;
    const habit = HABITS.find((h) => h.id === id);
    const value = habit.type === 'checkbox' ? e.target.checked : Math.max(0, Number(e.target.value) || 0);
    setHabitValue(dateKey, id, value);
    onChange?.();
  });
  container.addEventListener('click', (e) => {
    const id = e.target.dataset.habitStep;
    if (!id) return;
    const delta = Number(e.target.dataset.delta);
    const input = container.querySelector(`input[data-habit="${id}"]`);
    const next = Math.max(0, (Number(input.value) || 0) + delta);
    input.value = next;
    setHabitValue(dateKey, id, next);
    onChange?.();
  });
}
