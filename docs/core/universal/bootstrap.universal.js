// =====================================================
// UniversalBootstrap v2.0
// Modular Initialization System for Universal Engine
// =====================================================

(() => {
	// --- Path Resolution Base ---
// Derive BASE directory from this bootstrap file's own location
const BOOT_URL = document.currentScript?.src || '';
const BASE = BOOT_URL.replace(/[^/]+$/, '');   // e.g. https://.../core/universal/
  const ENGINE_TAG = '[ENGINE:BOOT]';
  const registryPath = './registry.json';

  // --- Unified Safe Logging ---
  const Safe = {
    log: (...a) => console.log(ENGINE_TAG, ...a),
    info: (...a) => console.info(ENGINE_TAG, ...a),
    warn: (...a) => console.warn(ENGINE_TAG, ...a),
    error: (...a) => console.error(ENGINE_TAG, ...a),
    try(fn, label = 'block') {
      try { return fn(); }
      catch (e) {
        console.error(`${ENGINE_TAG} ${label} failed:`, e);
        return undefined;
      }
    }
  };

  // --- Module Tracker ---
  const EngineState = {
    version: '2.0-beta',
    initialized: [],
    failed: [],
  };

  // --- Load Module Registry ---
// --- Load Module Registry ---
async function loadRegistry() {
  const REGISTRY_URL = `${BASE}core/universal/registry.json`;
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
function resolveModuleUrl(nameOrPath) {
  // absolute or root paths stay untouched
  if (/^https?:\/\//.test(nameOrPath) || nameOrPath.startsWith('/')) return nameOrPath;
  // if caller includes subfolders, respect them
  if (nameOrPath.includes('/')) return `${BASE}${nameOrPath}`;
  // default: treat as universal module key
  return `${BASE}${nameOrPath}.universal.js`;
}


// --- Dynamic Module Loader ---
async function loadModule(name) {
  const map = {
  core: resolveModuleUrl("core/universal/core.universal.js"),
  audio: resolveModuleUrl("core/universal/audio.universal.js"),
  event: resolveModuleUrl("core/universal/event.universal.js"),
  engine: resolveModuleUrl("core/universal/engine.universal.js"),
  ui: "engine/ui.js",
  hud: "engine/hud.js",
  player: "engine/player.js",
  data: "engine/data.js"
};

  const src = map[name];
  Safe.info(`[ENGINE:BOOT] Loading module: ${name} from ${src}`);

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

  // --- Launch ---
  window.addEventListener('DOMContentLoaded', init);
})();