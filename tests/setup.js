// core/store.js reads localStorage at module load time — Node has no such
// global, so the app's core modules (which transitively import store.js via
// i18n.js) would throw on import under plain Node. A minimal in-memory stand-in
// is enough; tests never assert on persistence itself.
if (typeof globalThis.localStorage === 'undefined') {
  const backing = new Map();
  globalThis.localStorage = {
    getItem: (key) => (backing.has(key) ? backing.get(key) : null),
    setItem: (key, value) => backing.set(key, String(value)),
    removeItem: (key) => backing.delete(key),
    clear: () => backing.clear(),
  };
}
