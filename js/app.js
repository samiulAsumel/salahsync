import { getState, getSettings, getDayLog, setPrayerStatus, updateSettings } from './core/store.js';
import { resolveSchedule } from './core/schedule-engine.js';
import { PROFILES, profileForWeekday } from './data/templates.js';
import { dateKey, todayProfile } from './core/time.js';
import { t, getLang } from './core/i18n.js';
import { renderTimeline, renderStats, renderWarnings, highlightNow } from './ui/renderer.js';
import { renderHabits, wireHabits } from './ui/tracker.js';
import { renderStreakPanel, renderWeeklyChart } from './ui/stats.js';
import { renderPrayerPanel } from './ui/prayer-panel.js';
import { startClock, renderCountdown } from './ui/clock.js';
import { renderSettingsPanel, wireSettingsPanel } from './ui/settings.js';
import { getLocationDisplayName } from './ui/location-picker.js';
import { toast } from './ui/toast.js';

const el = (id) => document.getElementById(id);
const PROFILE_WEEKDAY = { workday: 0, friday: 5, saturday: 6 };

let activeProfile = todayProfile();
let lastResolved = null;

function currentWeekdayForProfile(profileKey) {
  if (profileKey !== 'workday') return PROFILE_WEEKDAY[profileKey];
  const real = new Date().getDay();
  return real >= 0 && real <= 4 ? real : 0;
}

function renderChrome() {
  document.documentElement.lang = getLang();
  el('app-eyebrow').textContent = t('app.eyebrow');
  el('app-title').textContent = t('app.title');
  el('habits-title').textContent = t('section.habits');
  el('progress-title').textContent = t('section.progress');
  el('settings-title-text').textContent = t('settingsTitle');
  el('footer-location').textContent = getLocationDisplayName(getSettings().location);
  el('footer-app-name').textContent = t('footer.appName');
  el('theme-toggle').title = t('tooltip.theme');
  el('install-btn').title = t('tooltip.install');
  el('print-btn').title = t('tooltip.print');
  el('settings-toggle').title = t('tooltip.settings');
  el('lang-toggle').title = t('tooltip.lang');
  for (const key of ['workday', 'friday', 'saturday']) {
    document.querySelector(`#tabs [data-profile="${key}"]`).textContent = t('tabs.' + key);
  }
}

function render() {
  const settings = getSettings();
  const weekday = currentWeekdayForProfile(activeProfile);
  const result = resolveSchedule(PROFILES[activeProfile].template, settings, weekday, activeProfile);
  lastResolved = result;
  const today = dateKey();
  const dayLog = getDayLog(today);

  el('footer-location').textContent = getLocationDisplayName(settings.location);
  renderPrayerPanel(el('prayer-panel'), result.anchors);
  renderStats(el('stats-cards'), result.stats);
  renderWarnings(el('warnings-banner'), result.warnings);
  renderTimeline(el('timeline'), result.blocks, dayLog, activeProfile);
  renderHabits(el('habits-panel'), dayLog);
  renderStreakPanel(el('streak-panel'), getState());
  renderWeeklyChart(el('chart-panel'), getState(), 'codingMinutes');

  document.querySelectorAll('#tabs [data-profile]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.profile === activeProfile);
  });
  el('profile-sub').textContent = t('profile.' + activeProfile + '.sub');
  tick();
}

function tick() {
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  if (activeProfile === todayProfile()) {
    highlightNow(el('timeline'), nowMin);
    renderCountdown(el('countdown'), lastResolved?.blocks ?? [], nowMin, activeProfile);
  } else {
    el('countdown').textContent = '';
  }
}

function setupTabs() {
  el('tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-profile]');
    if (!btn) return;
    activeProfile = btn.dataset.profile;
    render();
  });
}

function setupTimelineDelegation() {
  el('timeline').addEventListener('click', (e) => {
    const btn = e.target.closest('.ptoggle');
    if (!btn) return;
    setPrayerStatus(dateKey(), btn.dataset.prayer, btn.dataset.status);
    render();
  });
}

function setupHabits() {
  wireHabits(el('habits-panel'), dateKey(), () => {
    renderStreakPanel(el('streak-panel'), getState());
    renderWeeklyChart(el('chart-panel'), getState(), 'codingMinutes');
  });
}

function refreshSettingsPanel() {
  const panel = el('settings-content');
  renderSettingsPanel(panel);
  wireSettingsPanel(panel, () => { render(); toast(t('settings.toastUpdated')); });
}

function setupSettings() {
  refreshSettingsPanel();
  const open = () => { el('settings-drawer').classList.add('open'); };
  const close = () => { el('settings-drawer').classList.remove('open'); };
  el('settings-toggle').addEventListener('click', open);
  el('settings-close').addEventListener('click', close);
  el('settings-backdrop').addEventListener('click', close);
}

function setupTheme() {
  const apply = (theme) => {
    document.documentElement.dataset.theme = theme;
    el('theme-toggle').textContent = theme === 'dark' ? '☀️' : '🌙';
  };
  apply(getSettings().theme);
  el('theme-toggle').addEventListener('click', () => {
    const next = getSettings().theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: next });
    apply(next);
  });
}

function setupLanguage() {
  el('lang-toggle').addEventListener('click', () => {
    const next = getLang() === 'en' ? 'bn' : 'en';
    updateSettings({ language: next });
    renderChrome();
    refreshSettingsPanel();
    render();
    startClock({ onTick: tick, clockEl: el('now-clock'), dateEl: el('now-date'), hijriOffset: getSettings().hijriDayOffset });
  });
}

function setupPrint() {
  el('print-btn').addEventListener('click', () => window.print());
}

function setupPWA() {
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    el('install-btn').classList.remove('hidden');
  });
  el('install-btn').addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    el('install-btn').classList.add('hidden');
  });
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

function init() {
  renderChrome();
  setupTabs();
  setupTimelineDelegation();
  setupHabits();
  setupSettings();
  setupTheme();
  setupLanguage();
  setupPrint();
  setupPWA();
  startClock({ onTick: tick, clockEl: el('now-clock'), dateEl: el('now-date'), hijriOffset: getSettings().hijriDayOffset });
  render();
}

document.addEventListener('DOMContentLoaded', init);
