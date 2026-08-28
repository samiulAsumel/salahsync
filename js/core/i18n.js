// Dictionary-based i18n. Keys are dot-paths into strings.bn.js/strings.en.js
// (kept in exact sync — see the key-count check in the two files' generation).
import { getSettings } from './store.js';
import { STRINGS_BN } from '../i18n/strings.bn.js';
import { STRINGS_EN } from '../i18n/strings.en.js';

const DICTS = { bn: STRINGS_BN, en: STRINGS_EN };

export function getLang() {
  return getSettings().language === 'en' ? 'en' : 'bn';
}

function lookup(dict, key) {
  return key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), dict);
}

// t('schedule.workday.wake.label') or t('warnings.sleepShort', { target: 7, actual: 5 })
export function t(key, params) {
  const lang = getLang();
  let str = lookup(DICTS[lang], key);
  if (str === undefined) str = lookup(DICTS.bn, key);
  if (str === undefined) return key;
  if (params) {
    for (const [k, v] of Object.entries(params)) str = str.replaceAll(`{${k}}`, v);
  }
  return str;
}

// Schedule block text lives at schedule.<profileKey>.<blockId>.label/.note — returns
// null for a missing note (most blocks have no note) instead of the raw key.
export function tBlock(profileKey, blockId, field) {
  const key = `schedule.${profileKey}.${blockId}.${field}`;
  const lang = getLang();
  let str = lookup(DICTS[lang], key) ?? lookup(DICTS.bn, key);
  return str === undefined ? null : str;
}
