import { getSettings, updateSettings, resetSettings, exportJSON, importJSON } from '../core/store.js';
import { CALC_METHODS } from '../core/prayer-times.js';
import { toast } from './toast.js';

const WD_LABELS = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি'];
const DURATION_LABELS = {
  tahajjud: 'তাহাজ্জুদ', sunnahTilawat: 'ফজরের সুন্নত+তিলাওয়াত', mosqueReturn: 'মসজিদ থেকে ফেরা',
  jamaatWalk: 'মসজিদে যাওয়ার সময়', fajrJamaatDuration: 'ফজর জামাতের দৈর্ঘ্য', jamaatPrayer: 'ওয়াক্ত নামাজের দৈর্ঘ্য',
  breakfast: 'নাস্তা', ishaMeal: 'এশা + খাবার', codingPractice: 'সন্ধ্যার কোডিং প্র্যাকটিস', reading: 'বই পড়া',
  windDown: 'ঘুমের প্রস্তুতি (সর্বনিম্ন)', minMorningCoding: 'সকালের কোডিং (সর্বনিম্ন)', minWeekendCoding: 'ছুটির কোডিং (সর্বনিম্ন)',
  weekendEarlyCoding: 'ছুটির সকালের কোডিং', jummaPrep: 'জুম্মার প্রস্তুতি', jummaDuration: 'জুম্মার নামাজ+খুতবা',
  lunchRest: 'দুপুরের খাবার+বিশ্রাম', eveningLightCoding: 'সন্ধ্যার হালকা কাজ', afternoonReading: 'বিকেলের পড়া',
  weekReview: 'সপ্তাহের রিভিউ', officeBreakDhuhr: 'যোহরের অফিস-বিরতি', officeBreakAsr: 'আসরের অফিস-বিরতি', officeBreakMaghrib: 'মাগরিবের অফিস-বিরতি',
};

function setPath(obj, path, value) {
  const keys = path.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
  cur[keys[keys.length - 1]] = value;
}

const field = (label, input) => `<label class="field"><span>${label}</span>${input}</label>`;
const num = (path, val, step = 1) => `<input type="number" step="${step}" data-path="${path}" data-type="number" value="${val}">`;
const time = (path, val) => `<input type="time" data-path="${path}" data-type="string" value="${val}">`;
const text = (path, val) => `<input type="text" data-path="${path}" data-type="string" value="${val}">`;

function officeRows(s) {
  return [0, 1, 2, 3, 4].map((d) => `
    <div class="office-row">
      <span>${WD_LABELS[d]}বার</span>
      ${time(`office.perDay.${d}.start`, s.office.perDay[d].start)}
      ${time(`office.perDay.${d}.end`, s.office.perDay[d].end)}
    </div>`).join('');
}

export function renderSettingsPanel(container) {
  const s = getSettings();
  container.innerHTML = `
    <section><h3>অবস্থান ও হিসাব পদ্ধতি</h3>
      ${field('স্থানের নাম', text('location.name', s.location.name))}
      ${field('অক্ষাংশ (Lat)', num('location.lat', s.location.lat, 0.0001))}
      ${field('দ্রাঘিমাংশ (Lon)', num('location.lon', s.location.lon, 0.0001))}
      ${field('টাইমজোন অফসেট (মিনিট, UTC থেকে)', num('location.tzOffsetMinutes', s.location.tzOffsetMinutes, 30))}
      ${field('হিসাব পদ্ধতি', `<select data-path="calcMethod" data-type="string">${Object.entries(CALC_METHODS).map(([k, v]) => `<option value="${k}" ${s.calcMethod === k ? 'selected' : ''}>${v.name}</option>`).join('')}</select>`)}
      ${field('আসরের মাযহাব', `<select data-path="asrMadhab" data-type="string"><option value="hanafi" ${s.asrMadhab === 'hanafi' ? 'selected' : ''}>হানাফি</option><option value="shafi" ${s.asrMadhab === 'shafi' ? 'selected' : ''}>শাফেঈ</option></select>`)}
    </section>

    <section><h3>ফজর</h3>
      ${field('মোড', `<select data-path="fajrMode" data-type="string"><option value="auto" ${s.fajrMode === 'auto' ? 'selected' : ''}>স্বয়ংক্রিয় (হিসাব থেকে)</option><option value="manual" ${s.fajrMode === 'manual' ? 'selected' : ''}>ম্যানুয়াল</option></select>`)}
      ${field('ফজর জামাত (ম্যানুয়াল হলে)', time('manualFajrJamaat', s.manualFajrJamaat))}
    </section>

    <section><h3>জামাত অফসেট (আজান থেকে মিনিট)</h3>
      <div class="grid-5">
        ${field('ফজর', num('jamaatOffset.fajr', s.jamaatOffset.fajr))}
        ${field('যোহর', num('jamaatOffset.dhuhr', s.jamaatOffset.dhuhr))}
        ${field('আসর', num('jamaatOffset.asr', s.jamaatOffset.asr))}
        ${field('মাগরিব', num('jamaatOffset.maghrib', s.jamaatOffset.maghrib))}
        ${field('এশা', num('jamaatOffset.isha', s.jamaatOffset.isha))}
      </div>
    </section>

    <section><h3>অফিস (রবি–বৃহস্পতি)</h3>${officeRows(s)}</section>

    <section><h3>যাতায়াত ও ঘুম</h3>
      ${field('অফিসে যেতে সময় (মিনিট)', num('commute.toOffice', s.commute.toOffice))}
      ${field('অফিস থেকে ফিরতে সময় (মিনিট)', num('commute.fromOffice', s.commute.fromOffice))}
      ${field('ঘুমানোর সময়', time('sleep.bedtime', s.sleep.bedtime))}
      ${field('লক্ষ্য ঘুম (ঘণ্টা)', num('sleep.targetHours', s.sleep.targetHours, 0.5))}
      ${field('হিজরি দিন সমন্বয়', num('hijriDayOffset', s.hijriDayOffset))}
    </section>

    <section><h3>সময়কাল (মিনিট)</h3>
      <div class="grid-2">
        ${Object.entries(s.durations).map(([k, v]) => field(DURATION_LABELS[k] ?? k, num(`durations.${k}`, v))).join('')}
      </div>
    </section>

    <section><h3>ডেটা</h3>
      <div class="data-actions">
        <button type="button" id="btn-export">এক্সপোর্ট (JSON)</button>
        <label class="btn-file">ইম্পোর্ট<input type="file" id="btn-import" accept="application/json" class="hidden"></label>
        <button type="button" id="btn-reset">রিসেট</button>
      </div>
    </section>
  `;
}

export function wireSettingsPanel(container, onChange) {
  container.addEventListener('input', (e) => {
    const path = e.target.dataset.path;
    if (!path) return;
    const s = structuredClone(getSettings());
    const raw = e.target.value;
    setPath(s, path, e.target.dataset.type === 'number' ? Number(raw) : raw);
    updateSettings(s);
    onChange?.();
  });

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
      toast('ব্যাকআপ থেকে ডেটা লোড হয়েছে');
      onChange?.();
      renderSettingsPanel(container);
    } catch {
      toast('ফাইলটি সঠিক নয়', { type: 'error' });
    } finally {
      fileInput.value = '';
    }
  });

  container.querySelector('#btn-reset')?.addEventListener('click', () => {
    if (!confirm('সব সেটিংস ডিফল্টে ফিরিয়ে দিতে চান?')) return;
    resetSettings();
    renderSettingsPanel(container);
    onChange?.();
    toast('সেটিংস রিসেট হয়েছে');
  });
}
