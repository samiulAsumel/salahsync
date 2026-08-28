// Custom time picker: a themed button (shows "৯:০০ AM"/"9:00 AM") that opens a
// popover with hour/minute/AM-PM steppers — replaces the native <input type="time">,
// whose segmented click targets proved fiddly and looked inconsistent across browsers.
import { toBanglaDigits } from '../core/time.js';
import { getLang } from '../core/i18n.js';

let popover = null;
// Track WHICH field is active by (container, path) instead of caching the actual
// <input>/<button> nodes — a caller may re-render the container mid-interaction
// (e.g. settings.js refreshing the "manual override" highlight after an edit),
// which replaces those nodes; re-querying by path on every click stays correct.
let activeContainer = null;
let activePath = null;

function formatDisplay(hhmm) {
  const [h24, m] = hhmm.split(':').map(Number);
  const period = h24 < 12 ? 'AM' : 'PM';
  let h = h24 % 12;
  if (h === 0) h = 12;
  const mm = String(m).padStart(2, '0');
  const lang = getLang();
  const clock = lang === 'en' ? `${h}:${mm}` : `${toBanglaDigits(h)}:${toBanglaDigits(mm)}`;
  return `${clock} ${period}`;
}

// Renders a button + a paired hidden <input> that carries the real data-path/value —
// settings.js's existing container.oninput delegation picks up changes automatically.
export function timeField(path, value) {
  return `<button type="button" class="time-picker-btn" data-time-for="${path}">${formatDisplay(value)}</button><input type="hidden" data-path="${path}" data-type="string" value="${value}">`;
}

function currentInput() {
  return activeContainer?.querySelector(`input[type="hidden"][data-path="${activePath}"]`) ?? null;
}
function currentButton() {
  return activeContainer?.querySelector(`.time-picker-btn[data-time-for="${activePath}"]`) ?? null;
}

function updatePopoverDisplay(hhmm) {
  const [h24, m] = hhmm.split(':').map(Number);
  let h = h24 % 12;
  if (h === 0) h = 12;
  const lang = getLang();
  popover.querySelector('[data-part="hour"]').textContent = lang === 'en' ? h : toBanglaDigits(h);
  popover.querySelector('[data-part="minute"]').textContent = lang === 'en' ? String(m).padStart(2, '0') : toBanglaDigits(String(m).padStart(2, '0'));
  popover.querySelector('.time-popover-ampm').textContent = h24 < 12 ? 'AM' : 'PM';
}

function closePopover() {
  popover?.classList.add('hidden');
  activeContainer = null;
  activePath = null;
}

function ensurePopover() {
  if (popover) return popover;
  popover = document.createElement('div');
  popover.className = 'time-popover hidden';
  popover.innerHTML = `
    <div class="time-popover-row">
      <button type="button" data-step="hour" data-delta="-1">−</button>
      <span class="time-popover-val" data-part="hour"></span>
      <button type="button" data-step="hour" data-delta="1">+</button>
    </div>
    <div class="time-popover-row">
      <button type="button" data-step="minute" data-delta="-1">−</button>
      <span class="time-popover-val" data-part="minute"></span>
      <button type="button" data-step="minute" data-delta="1">+</button>
    </div>
    <button type="button" class="time-popover-ampm" data-step="ampm"></button>
  `;
  document.body.appendChild(popover);

  popover.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-step]');
    const input = currentInput();
    if (!btn || !input) return;
    let [h, m] = input.value.split(':').map(Number);
    if (btn.dataset.step === 'hour') h = ((h + Number(btn.dataset.delta)) % 24 + 24) % 24;
    else if (btn.dataset.step === 'minute') m = ((m + Number(btn.dataset.delta)) % 60 + 60) % 60;
    else h = (h + 12) % 24;
    const hhmm = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    input.value = hhmm;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    updatePopoverDisplay(hhmm);
    // The oninput handler may have re-rendered the container (new button node) —
    // re-resolve rather than reuse whatever `btn`'s sibling used to be.
    const freshBtn = currentButton();
    if (freshBtn) freshBtn.textContent = formatDisplay(hhmm);
  });

  document.addEventListener('click', (e) => {
    if (popover.classList.contains('hidden')) return;
    if (popover.contains(e.target) || e.target.closest('.time-picker-btn')) return;
    closePopover();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePopover(); });

  return popover;
}

// Idempotent (assignment, not addEventListener) so re-calling after a settings
// panel re-render never stacks duplicate listeners on the long-lived container.
export function wireTimePickers(container) {
  container.onclick = (e) => {
    const btn = e.target.closest('.time-picker-btn');
    if (!btn) return;
    const path = btn.dataset.timeFor;
    const input = container.querySelector(`input[type="hidden"][data-path="${path}"]`);
    if (!input) return;
    activeContainer = container;
    activePath = path;
    const pop = ensurePopover();
    updatePopoverDisplay(input.value);
    pop.classList.remove('hidden');
    const rect = btn.getBoundingClientRect();
    pop.style.top = `${Math.min(rect.bottom + 6, window.innerHeight - 160)}px`;
    pop.style.left = `${Math.min(rect.left, window.innerWidth - 140)}px`;
  };
}
