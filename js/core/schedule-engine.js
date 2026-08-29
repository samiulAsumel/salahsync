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
import { computeWaqtTimes } from './waqt-times.js';
import { t, tBlock } from './i18n.js';

function resolveAnchors(settings, weekday) {
  const w = computeWaqtTimes(settings);

  const dayCfg = settings.office.perDay[weekday];
  const officeStart = dayCfg ? hhmmToMinutes(dayCfg.start) : null;
  const officeEnd = dayCfg ? hhmmToMinutes(dayCfg.end) : null;

  let bedtime = hhmmToMinutes(settings.sleep.bedtime);
  if (bedtime < 12 * 60) bedtime += 1440; // past-midnight bedtime, e.g. 00:30

  return {
    fajr: w.fajr.start, sunrise: w.sunrise, dhuhr: w.dhuhr.start, asr: w.asr.start, maghrib: w.maghrib.start, isha: w.isha.start,
    fajrJamaat: w.fajr.jamaat, dhuhrJamaat: w.dhuhr.jamaat, asrJamaat: w.asr.jamaat, maghribJamaat: w.maghrib.jamaat, ishaJamaat: w.isha.jamaat,
    jummaGo: w.dhuhr.jamaat - settings.durations.jamaatWalk,
    wakeUp: w.fajr.jamaat - settings.durations.tahajjud - settings.durations.sunnahTilawat,
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

// A flex block's `min` is either a literal number (e.g. windDown's 15) or a
// duration-key string (e.g. 'minMorningCoding') — resolve the latter so the
// too-short comparison actually runs against a number, not the key itself.
function minOf(min, durations) {
  if (typeof min === 'string') return durations[min] ?? 0;
  return min || 0;
}

/**
 * @param {Array} template block specs for one profile (workday/friday/saturday)
 * @param {Object} settings full settings object
 * @param {number} weekday 0=Sun..6=Sat
 * @param {string} profileKey 'workday'|'friday'|'saturday' — for localized warning text
 * @returns {{blocks:Array, warnings:Array<string>, anchors:Object}}
 */
export function resolveSchedule(template, settings, weekday, profileKey) {
  const anchors = resolveAnchors(settings, weekday);
  const durations = settings.durations;
  const blocks = [];
  const warnings = [];
  const byId = new Map();
  let pendingFlex = null;
  const labelOf = (spec) => tBlock(profileKey, spec.id, 'label') ?? spec.id;

  const closeFlex = (startOfNext) => {
    if (!pendingFlex) return;
    const actual = startOfNext - pendingFlex.start;
    const min = minOf(pendingFlex.min, durations);
    if (actual < 0) {
      warnings.push(t('warnings.flexNegative', { label: labelOf(pendingFlex) }));
    } else if (min && actual < min) {
      warnings.push(t('warnings.flexShort', { label: labelOf(pendingFlex), actual, min }));
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
      warnings.push(t('warnings.blockConflict', { label: labelOf(spec) }));
      continue;
    }
    if (end === startMin && spec.duration !== 0) continue; // degenerate zero-width segment; explicit duration:0 markers (wake, sleep, ...) are kept

    const resolved = { ...spec, start: startMin, end };
    blocks.push(resolved);
    byId.set(spec.id, resolved);
  }

  if (pendingFlex) closeFlex(pendingFlex.start + minOf(pendingFlex.min, durations));

  const sleepBlock = blocks.find((b) => b.id === 'sleep');
  const wakeAnchorBlock = blocks[0];
  let sleepMinutes = null;
  if (sleepBlock && wakeAnchorBlock) {
    sleepMinutes = 1440 - (sleepBlock.start - wakeAnchorBlock.start);
    if (sleepMinutes < settings.sleep.targetHours * 60) {
      warnings.push(t('warnings.sleepShort', { target: settings.sleep.targetHours, actual: Math.round(sleepMinutes / 60 * 10) / 10 }));
    }
  }

  const byCat = {};
  for (const b of blocks) {
    if (b.id === 'sleep' || b.id === 'wake') continue;
    byCat[b.cat] = (byCat[b.cat] || 0) + Math.max(0, b.end - b.start);
  }

  return { blocks, warnings, anchors, stats: { sleepMinutes, byCat } };
}
