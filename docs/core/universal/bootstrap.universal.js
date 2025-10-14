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
    Safe.log('Loading module registry...');
    try {
      const res = await fetch(registryPath);
      if (!res.ok) throw new Error(`Failed to fetch ${registryPath}`);
      const data = await res.json();
      Safe.log(`Loaded registry v${data.version}`, data.modules);
      return data;
    } catch (err) {
      Safe.error('Registry load failed:', err);
      throw err;
    }
  }

  // --- Dynamic Module Loader ---
  async function loadModule(name) {
    const path = `./${name}.universal.js`;
    Safe.info(`Loading module: ${name}`);
    try {
      await import(path);
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