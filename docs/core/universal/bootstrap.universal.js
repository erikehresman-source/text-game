// =====================================================
// UniversalBootstrap v2.0
// Modular Initialization System for Universal Engine
// =====================================================

// --- SAFETY FALLBACK: Create Safe if not loaded yet ---
if (typeof window.Safe === 'undefined') {
  window.Safe = {
    log: (...a) => console.log('[BOOT]', ...a),
    warn: (...a) => console.warn('[BOOT]', ...a),
    error: (...a) => console.error('[BOOT]', ...a),
    try: (fn, label = 'boot') => {
      try { return fn(); } catch (e) { console.error(`[BOOT] ${label} failed:`, e); }
    }
  };
  console.warn('[BOOT] Safe utility fallback created (core not loaded yet)');
}

// =====================================================
// Bootstrap Runtime
// =====================================================
(() => {
  // --- Path Resolution Base ---
  const BOOT_URL = document.currentScript?.src || '';
  const BASE = BOOT_URL.replace(/[^/]+$/, '');
  const ENGINE_TAG = '[ENGINE:BOOT]';
  const registryPath = './registry.json';

  

  // --- Module Tracker ---
  const EngineState = {
    version: '2.0-beta',
    initialized: [],
    failed: [],
  };

  
// --- Load Module Registry ---
async function loadRegistry() {
  const REGISTRY_URL = resolveModuleUrl("core/universal/registry.json");
  Safe.log(`[ENGINE:BOOT] Loading module registry from: ${REGISTRY_URL}`);
  try {
    const res = await fetch(REGISTRY_URL, { cache: "no-store" });
if (!res.ok) {
  throw new Error(`[ENGINE:BOOT] Registry fetch failed (${res.status}) at ${REGISTRY_URL}`);
}
    const data = await res.json();
	if (!data.modules || typeof data.modules !== 'object') {
  throw new Error(`[ENGINE:BOOT] Invalid registry format — expected { modules: {...} }`);
}
    Safe.log(`✅ Registry loaded v${data.version}`, data.modules);
    return data;
  } catch (err) {
    Safe.error("Registry load failed:", err);
    throw err;
  }
}

// --- Resolve Module URLs Relative to BASE ---
function resolveModuleUrl(modulePath) {
  try {
    const path = window.location.pathname || '';
    // Detect if running inside a /docs/ folder (GitHub Pages or similar)
    const prefix = path.includes('/docs/') ? 'docs/' : '';
    const url = `${BASE}${prefix}${modulePath}`.replace(/\/{2,}/g, '/');
    Safe.log(`Resolved module path: ${url}`);
    return url;
  } catch (err) {
    Safe.error('resolveModuleUrl failed:', err);
    return modulePath;
  }
}


// --- Dynamic Module Loader ---
async function loadModule(name) {
  const map = {
  core: resolveModuleUrl("core/universal/core.universal.js"),
  audio: resolveModuleUrl("core/universal/audio.universal.js"),
  event: resolveModuleUrl("core/universal/event.universal.js"),
  engine: resolveModuleUrl("core/universal/engine.universal.js"),
  ui: resolveModuleUrl("engine/ui.js"),
  hud: resolveModuleUrl("engine/hud.js"),
  player: resolveModuleUrl("engine/player.js"),
  data: resolveModuleUrl("engine/data.js")
};

  const src = map[name];
  Safe.log(`[ENGINE:BOOT] Loading module: ${name} from ${src}`);

  try {
    await import(src);
	if (!src) throw new Error(`No source path resolved for module '${name}'`);
    Safe.log(`✅ ${name} module initialized`);
    EngineState.initialized.push(name);
  } catch (err) {
    Safe.error(`❌ ${name} module failed:`, err);
    EngineState.failed.push(name);
  }
}

  // --- Engine Startup ---
  async function init() {
    Safe.log('Initializing Universal Engine Bootstrap...');
    try {
		Safe.log(`[ENGINE:BOOT] Active path root: ${EnginePaths?.root || 'core/universal/'}`);
      const registry = await loadRegistry();

      // --- Universal Module Loader (Array/Object Compatible) ---
const moduleList = Array.isArray(registry.modules)
  ? registry.modules
  : Object.keys(registry.modules);

for (const name of moduleList) {
  await loadModule(name);
}

// ===== Initialize HUD after modules load =====
Safe.try(() => {
  if (window.HUD && typeof HUD.createHUD === 'function') {
    HUD.createHUD();
    Safe.log('[BOOT] HUD initialized');
  } else {
    Safe.warn('[BOOT] HUD module not found or createHUD missing');
  }
}, 'HUD Initialization');

      Safe.info('Universal Engine Initialized', {
        initialized: EngineState.initialized,
        failed: EngineState.failed,
      });

      if (EngineState.failed.length === 0) {
        Safe.log('🟢 All modules loaded successfully.');
      } else {
        Safe.warn('⚠️ Some modules failed:', EngineState.failed);
      }

    } catch (e) {
      Safe.error('Fatal initialization error:', e);
    }
  }
  
  Safe.log('Bootstrap path check:', {
  origin: window.location.origin,
  pathname: window.location.pathname,
  test_core_path: resolveModuleUrl("core/universal/core.universal.js")
});
  
Safe.log('[ENGINE:BOOT] Awaiting DOMContentLoaded...');
  // --- Launch ---
  window.addEventListener('DOMContentLoaded', init);
})();