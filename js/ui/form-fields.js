// Tiny HTML-field builders shared by the settings panel and the location picker.
export function setPath(obj, path, value) {
  const keys = path.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
  cur[keys[keys.length - 1]] = value;
}

export const field = (label, input) => `<label class="field"><span>${label}</span>${input}</label>`;
export const num = (path, val, step = 1) => `<input type="number" step="${step}" data-path="${path}" data-type="number" value="${val}">`;
export const text = (path, val) => `<input type="text" data-path="${path}" data-type="string" value="${val}">`;
// Time fields use the custom picker in ./time-picker.js instead of native
// <input type="time"> — its segmented click targets were fiddly and looked
// inconsistent across browsers.
