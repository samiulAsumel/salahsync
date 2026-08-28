// Resolves a block template list (see data/templates.js) into concrete
// start/end minute-of-day times, given a set of computed anchors.
//
// Block spec shapes:
//   { start:{anchor}, duration }              fixed block anchored at a point
//   { start:{after:blockId}, duration }        chained after a previous block
//   { start:{anchor}, end:{anchor} }           explicit range (duration derived)
//   { end:{anchor}, duration }                 back-computed start = anchor − duration
//   { end:(anchors)=>minutes }                 computed end, e.g. "next prayer or officeEnd"
//   { flex:true, min }                         fills the gap up to the NEXT block's start

import { hhmmToMinutes } from './time.js';
import { computePrayerTimes } from './prayer-times.js';

function resolveAnchors(settings, weekday) {
  const raw = computePrayerTimes({
    date: new Date(),
    lat: settings.location.lat,
    lon: settings.location.lon,
    tzOffsetMinutes: settings.location.tzOffsetMinutes,
    method: settings.calcMethod,
    asrMadhab: settings.asrMadhab,
  });
  const off = settings.waqtManualOffset;
  const adhan = {
    fajr: raw.fajr + off.fajr,
    sunrise: raw.sunrise + off.sunrise,
    dhuhr: raw.dhuhr + off.dhuhr,
    asr: raw.asr + off.asr,
    maghrib: raw.maghrib + off.maghrib,
    isha: raw.isha + off.isha,
  };
  const jo = settings.jamaatOffset;
  const fajrJamaat = settings.fajrMode === 'manual'
    ? hhmmToMinutes(settings.manualFajrJamaat)
    : adhan.fajr + jo.fajr;

  const dayCfg = settings.office.perDay[weekday];
  const officeStart = dayCfg ? hhmmToMinutes(dayCfg.start) : null;
  const officeEnd = dayCfg ? hhmmToMinutes(dayCfg.end) : null;

  let bedtime = hhmmToMinutes(settings.sleep.bedtime);
  if (bedtime < 12 * 60) bedtime += 1440; // past-midnight bedtime, e.g. 00:30

  return {
    ...adhan,
    fajrJamaat,
    dhuhrJamaat: adhan.dhuhr + jo.dhuhr,
    asrJamaat: adhan.asr + jo.asr,
    maghribJamaat: adhan.maghrib + jo.maghrib,
    ishaJamaat: adhan.isha + jo.isha,
    jummaGo: adhan.dhuhr + jo.dhuhr - settings.durations.jamaatWalk,
    wakeUp: fajrJamaat - settings.durations.tahajjud - settings.durations.sunnahTilawat,
    officeStart, officeEnd,
    leaveHome: officeStart != null ? officeStart - settings.commute.toOffice : null,
    arriveHome: officeEnd != null ? officeEnd + settings.commute.fromOffice : null,
    bedtime,
  };
}

function durationOf(spec, durations) {
  if (typeof spec.duration === 'number') return spec.duration;
  if (typeof spec.duration === 'string') return durations[spec.duration] ?? 0;
  return 0;
}

/**
 * @param {Array} template block specs for one profile (workday/friday/saturday)
 * @param {Object} settings full settings object
 * @param {number} weekday 0=Sun..6=Sat
 * @returns {{blocks:Array, warnings:Array<string>, anchors:Object}}
 */
export function resolveSchedule(template, settings, weekday) {
  const anchors = resolveAnchors(settings, weekday);
  const durations = settings.durations;
  const blocks = [];
  const warnings = [];
  const byId = new Map();
  let pendingFlex = null;

  const closeFlex = (startOfNext) => {
    if (!pendingFlex) return;
    const actual = startOfNext - pendingFlex.start;
    if (actual < 0) {
      warnings.push(`"${pendingFlex.label}" ব্লকে সময় ঋণাত্মক — আগের ধাপগুলো পুনরায় দেখুন।`);
    } else if (pendingFlex.min && actual < pendingFlex.min) {
      warnings.push(`"${pendingFlex.label}" মাত্র ${actual} মিনিট পাচ্ছে (কমপক্ষে ${pendingFlex.min} মিনিট দরকার) — সময় সমন্বয় করুন।`);
    }
    pendingFlex.end = startOfNext;
    pendingFlex.durationActual = Math.max(0, actual);
    blocks.push(pendingFlex);
    byId.set(pendingFlex.id, pendingFlex);
    pendingFlex = null;
  };

  for (const spec of template) {
    if (spec.skipIf && spec.skipIf(anchors)) continue;

    let startMin;
    if (spec.start?.anchor) {
      startMin = anchors[spec.start.anchor] + (spec.start.offset || 0);
    } else if (spec.start?.after) {
      const prev = byId.get(spec.start.after);
      startMin = prev ? prev.end : (blocks.length ? blocks[blocks.length - 1].end : anchors.wakeUp);
    } else if (spec.end?.anchor) {
      // No explicit start: back-compute it from the end anchor minus this block's duration.
      startMin = anchors[spec.end.anchor] - durationOf(spec, durations);
    } else {
      startMin = blocks.length ? blocks[blocks.length - 1].end : anchors.wakeUp;
    }

    if (startMin == null) continue; // anchor unavailable (e.g. no office that day)

    closeFlex(startMin);

    if (spec.flex) {
      pendingFlex = { ...spec, start: startMin, end: null };
      continue;
    }

    let end;
    if (typeof spec.end === 'function') end = spec.end(anchors);
    else if (spec.end?.anchor) end = anchors[spec.end.anchor];
    else end = startMin + durationOf(spec, durations);

    if (end < startMin) {
      warnings.push(`"${spec.label}" সময়সীমা বৈপরীত্যপূর্ণ (অফিস/নামাজের সময় সেটিংস মিলিয়ে দেখুন) — ব্লকটি বাদ দেওয়া হয়েছে।`);
      continue;
    }
    if (end === startMin && spec.duration !== 0) continue; // degenerate zero-width segment; explicit duration:0 markers (wake, sleep, ...) are kept

    const resolved = { ...spec, start: startMin, end };
    blocks.push(resolved);
    byId.set(spec.id, resolved);
  }

  if (pendingFlex) closeFlex(pendingFlex.start + (pendingFlex.min || 0));

  const sleepBlock = blocks.find((b) => b.id === 'sleep');
  const wakeAnchorBlock = blocks[0];
  let sleepMinutes = null;
  if (sleepBlock && wakeAnchorBlock) {
    sleepMinutes = 1440 - (sleepBlock.start - wakeAnchorBlock.start);
    if (sleepMinutes < settings.sleep.targetHours * 60) {
      warnings.push(`লক্ষ্যমাত্রার (${settings.sleep.targetHours} ঘণ্টা) চেয়ে ঘুম কম হচ্ছে — প্রায় ${Math.round(sleepMinutes / 60 * 10) / 10} ঘণ্টা।`);
    }
  }

  const byCat = {};
  for (const b of blocks) {
    if (b.id === 'sleep' || b.id === 'wake') continue;
    byCat[b.cat] = (byCat[b.cat] || 0) + Math.max(0, b.end - b.start);
  }

  return { blocks, warnings, anchors, stats: { sleepMinutes, byCat } };
}
