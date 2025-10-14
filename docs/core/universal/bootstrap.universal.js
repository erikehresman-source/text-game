// =====================================================
// UniversalBootstrap v2.0
// Modular Initialization System for Universal Engine
// =====================================================

(() => {
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
async function loadRegistry() {
  const registryPath = EnginePaths?.resolve?.("registry.json") || "core/universal/registry.json";
  Safe.log(`[ENGINE:BOOT] Loading module registry from: ${registryPath}`);
  try {
    const res = await fetch(registryPath, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch registry: ${res.status}`);
    const data = await res.json();
    Safe.log(`✅ Registry loaded v${data.version}`, data.modules);
    return data;
  } catch (err) {
    Safe.error("Registry load failed:", err);
    throw err;
  }
}

// --- Dynamic Module Loader ---
async function loadModule(name) {
  const map = {
    core: EnginePaths.resolve("core.universal.js"),
    audio: EnginePaths.resolve("audio.universal.js"),
    event: EnginePaths.resolve("event.universal.js"),
    engine: EnginePaths.resolve("engine.universal.js"),
    ui: "engine/ui.js",
    hud: "engine/hud.js",
    player: "engine/player.js",
    data: "engine/data.js"
  };

  const src = map[name];
  Safe.info(`[ENGINE:BOOT] Loading module: ${name} from ${src}`);

  try {
    await import(src);
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

      for (const name of registry.modules) {
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