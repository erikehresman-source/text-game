// ======================================================
// Minimal Bootstrap Harness — Registry URL Verification
// ======================================================
(function(){
  const Safe = {
    log:  (...a) => console.log('[BOOT]', ...a),
    warn: (...a) => console.warn('[BOOT]', ...a),
    error: (...a) => console.error('[BOOT]', ...a)
  };

  const BOOT_URL = document.currentScript?.src || '';
  let BASE = BOOT_URL.replace(/[^/]+$/, '');
  if (!BASE.endsWith('/')) BASE += '/';

  // ✅ Detect GitHub Pages /docs/ deployment and correct BASE
  if (BASE.includes('/text-game/docs/')) {
    BASE = BASE.replace('/text-game/docs/', '/text-game/');
    Safe.warn('[BOOT] Adjusted BASE for GitHub Pages /docs/:', BASE);
  }

  function resolve(path) {
    return new URL(path, BASE).toString();
  }

  async function run() {
    const status = document.getElementById('status');
    const registryURL = resolve('core/universal/registry.json');
    Safe.log('BASE:', BASE);
    Safe.log('Resolved Registry URL:', registryURL);

    try {
      const res = await fetch(registryURL, { cache: 'no-store' });
      Safe.log('Response:', res.status, res.statusText);
      if (!res.ok) throw new Error(`Registry fetch failed ${res.status}`);

      const data = await res.json();
      Safe.log('Registry JSON:', data);

      status.className = 'ok';
      status.textContent = `✅ Loaded OK (${res.status}) → ${registryURL}`;
    } catch (err) {
      Safe.error('Registry Load Failed:', err);
      status.className = 'err';
      status.textContent = `❌ Failed → ${registryURL}\n(${err.message})`;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else run();
})();