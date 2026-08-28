let container = null;

function ensureContainer() {
  if (container) return container;
  container = document.createElement('div');
  container.id = 'toast-stack';
  container.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none';
  document.body.appendChild(container);
  return container;
}

export function toast(message, { type = 'info', duration = 2600 } = {}) {
  const el = document.createElement('div');
  const tone = {
    info: 'bg-forest text-paper',
    warn: 'bg-gold text-forest-deep',
    error: 'bg-red-700 text-white',
  }[type] || 'bg-forest text-paper';
  el.className = `${tone} px-4 py-2 rounded shadow-lg text-sm font-medium opacity-0 translate-y-2 transition-all duration-200`;
  el.textContent = message;
  ensureContainer().appendChild(el);
  requestAnimationFrame(() => {
    el.classList.remove('opacity-0', 'translate-y-2');
  });
  setTimeout(() => {
    el.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => el.remove(), 250);
  }, duration);
}
