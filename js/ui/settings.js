import { getSettings, updateSettings, resetSettings, exportJSON, importJSON } from '../core/store.js';
import { CALC_METHODS } from '../core/prayer-times.js';
import { field, num, time, setPath } from './form-fields.js';
import { locationSection, handleLocationInput, detectGpsLocation } from './location-picker.js';
import { t, getLang } from '../core/i18n.js';
import { toast } from './toast.js';

const WD_SHORT_BN = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি'];
const WD_SHORT_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];

function officeRows(s) {
  const lang = getLang();
  const names = lang === 'en' ? WD_SHORT_EN : WD_SHORT_BN.map((n) => n + 'বার');
  return [0, 1, 2, 3, 4].map((d) => `
    <div class="office-row">
      <span>${names[d]}</span>
      ${time(`office.perDay.${d}.start`, s.office.perDay[d].start)}
      ${time(`office.perDay.${d}.end`, s.office.perDay[d].end)}
    </div>`).join('');
}

const waqtGrid = (s) => `
  <div class="grid-5">
    ${field(t('prayer.fajr'), num('waqtManualOffset.fajr', s.waqtManualOffset.fajr))}
    ${field(t('prayer.sunrise'), num('waqtManualOffset.sunrise', s.waqtManualOffset.sunrise))}
    ${field(t('prayer.dhuhr'), num('waqtManualOffset.dhuhr', s.waqtManualOffset.dhuhr))}
    ${field(t('prayer.asr'), num('waqtManualOffset.asr', s.waqtManualOffset.asr))}
    ${field(t('prayer.maghrib'), num('waqtManualOffset.maghrib', s.waqtManualOffset.maghrib))}
  </div>`;

export function renderSettingsPanel(container) {
  const s = getSettings();
  container.innerHTML = `
    <section><h3>${t('settings.sectionLocation')}</h3>
      ${locationSection(s)}
      ${field(t('settings.fieldCalcMethod'), `<select data-path="calcMethod" data-type="string">${Object.keys(CALC_METHODS).map((k) => `<option value="${k}" ${s.calcMethod === k ? 'selected' : ''}>${t('calcMethod.' + k)}</option>`).join('')}</select>`)}
      ${field(t('settings.fieldAsrMadhab'), `<select data-path="asrMadhab" data-type="string"><option value="hanafi" ${s.asrMadhab === 'hanafi' ? 'selected' : ''}>${t('settings.madhabHanafi')}</option><option value="shafi" ${s.asrMadhab === 'shafi' ? 'selected' : ''}>${t('settings.madhabShafi')}</option></select>`)}
    </section>

    <section><h3>${t('settings.sectionFajr')}</h3>
      ${field(t('settings.fieldFajrMode'), `<select data-path="fajrMode" data-type="string"><option value="auto" ${s.fajrMode === 'auto' ? 'selected' : ''}>${t('settings.fajrModeAuto')}</option><option value="manual" ${s.fajrMode === 'manual' ? 'selected' : ''}>${t('settings.fajrModeManual')}</option></select>`)}
      ${field(t('settings.fieldManualFajr'), time('manualFajrJamaat', s.manualFajrJamaat))}
    </section>

    <section><h3>${t('settings.sectionWaqtOffset')}</h3>${waqtGrid(s)}</section>

    <section><h3>${t('settings.sectionJamaatOffset')}</h3>
      <div class="grid-5">
        ${field(t('prayer.fajr'), num('jamaatOffset.fajr', s.jamaatOffset.fajr))}
        ${field(t('prayer.dhuhr'), num('jamaatOffset.dhuhr', s.jamaatOffset.dhuhr))}
        ${field(t('prayer.asr'), num('jamaatOffset.asr', s.jamaatOffset.asr))}
        ${field(t('prayer.maghrib'), num('jamaatOffset.maghrib', s.jamaatOffset.maghrib))}
        ${field(t('prayer.isha'), num('jamaatOffset.isha', s.jamaatOffset.isha))}
      </div>
    </section>

    <section><h3>${t('settings.sectionOffice')}</h3>${officeRows(s)}</section>

    <section><h3>${t('settings.sectionCommuteSleep')}</h3>
      ${field(t('settings.fieldCommuteTo'), num('commute.toOffice', s.commute.toOffice))}
      ${field(t('settings.fieldCommuteFrom'), num('commute.fromOffice', s.commute.fromOffice))}
      ${field(t('settings.fieldBedtime'), time('sleep.bedtime', s.sleep.bedtime))}
      ${field(t('settings.fieldTargetSleep'), num('sleep.targetHours', s.sleep.targetHours, 0.5))}
      ${field(t('settings.fieldHijriOffset'), num('hijriDayOffset', s.hijriDayOffset))}
    </section>

    <section><h3>${t('settings.sectionDurations')}</h3>
      <div class="grid-2">
        ${Object.entries(s.durations).map(([k, v]) => field(t('duration.' + k), num(`durations.${k}`, v))).join('')}
      </div>
    </section>

    <section><h3>${t('settings.sectionData')}</h3>
      <div class="data-actions">
        <button type="button" id="btn-export">${t('settings.btnExport')}</button>
        <label class="btn-file">${t('settings.btnImport')}<input type="file" id="btn-import" accept="application/json" class="hidden"></label>
        <button type="button" id="btn-reset">${t('settings.btnReset')}</button>
      </div>
    </section>
  `;
}

// Assignment-style handlers (container.oninput = ...) instead of addEventListener
// so re-calling this after an internal re-render (location change, import, reset)
// never stacks duplicate listeners on the long-lived panel container.
export function wireSettingsPanel(container, onChange) {
  const rerender = () => {
    renderSettingsPanel(container);
    wireSettingsPanel(container, onChange);
    onChange?.();
  };

  container.oninput = (e) => {
    if (handleLocationInput(e, rerender)) return;
    const path = e.target.dataset.path;
    if (!path) return;
    const s = structuredClone(getSettings());
    const raw = e.target.value;
    setPath(s, path, e.target.dataset.type === 'number' ? Number(raw) : raw);
    updateSettings(s);
    onChange?.();
  };

  container.querySelector('#btn-gps-refresh')?.addEventListener('click', () => detectGpsLocation(rerender));

  container.querySelector('#btn-export')?.addEventListener('click', () => {
    const blob = new Blob([exportJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `daily-routine-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  container.querySelector('#btn-import')?.addEventListener('change', async (e) => {
    const fileInput = e.target;
    const f = fileInput.files[0];
    if (!f) return;
    try {
      importJSON(await f.text());
      toast(t('settings.toastImported'));
      rerender();
    } catch {
      toast(t('settings.toastImportError'), { type: 'error' });
    } finally {
      fileInput.value = '';
    }
  });

  container.querySelector('#btn-reset')?.addEventListener('click', () => {
    if (!confirm(t('settings.confirmReset'))) return;
    resetSettings();
    rerender();
    toast(t('settings.toastReset'));
  });
}
