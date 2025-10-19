// ======================================================
//  ENGINE.UNIVERSAL.JS – Hardened + Path-Aware Revision
// ======================================================

// --- Engine Bootstrap ---
async function bootstrapEngine() {
  if (window.Safe && Safe.log) Safe.log("[ENGINE] Bootstrap starting...");
  // Moved here from lower section for early path visibility
  if (window.Safe && Safe.log) Safe.log("[ENGINE] Active base path:", window.location.pathname);

  try {
    const regStart = performance.now();
    const registryPath = resolveModuleUrl("core/universal/registry.json");
    const response = await fetch(registryPath, { cache: "no-store" });
    if (!response.ok) {
      Safe.error("[ENGINE] Registry fetch failed:", response.status, registryPath);
      return;
    }

    const registry = await response.json();
    const regEnd = performance.now();

    if (window.Safe && Safe.log)
      Safe.log(
        `[ENGINE] Registry loaded in ${(regEnd - regStart).toFixed(2)}ms from:`,
        registryPath
      );

    if (!registry.modules) {
      Safe.error("[ENGINE] Registry missing modules field", registry);
      return;
    }

    const moduleList = Array.isArray(registry.modules)
      ? registry.modules
      : Object.keys(registry.modules);

    if (window.Safe && Safe.log)
      Safe.log("[ENGINE] Loading modules:", moduleList);

    const results = [];
    const startAll = performance.now();

    for (const mod of moduleList) {
      const modStart = performance.now();
      const modulePath = resolveModuleUrl(mod);

      try {
        await import(modulePath);
        const modEnd = performance.now();
        results.push({ mod, ok: true, time: modEnd - modStart });

        if (window.Safe && Safe.log)
          Safe.log(`✅ Loaded: ${mod} (${(modEnd - modStart).toFixed(2)}ms)`);
      } catch (err) {
        const modEnd = performance.now();
        results.push({ mod, ok: false, err, time: modEnd - modStart });
        Safe.error(`❌ Failed: ${mod}`, err);
      }
    }

    const endAll = performance.now();

    if (window.Safe && Safe.groupCollapsed)
      Safe.groupCollapsed(
        `[ENGINE] Summary: ${(endAll - startAll).toFixed(2)}ms total`
      );

    for (const r of results) {
      const label = r.ok ? "✅" : "❌";
      Safe.log(`${label} ${r.mod} (${r.time.toFixed(2)}ms)`);
    }

    if (window.Safe && Safe.groupEnd) Safe.groupEnd();

    // Post-bootstrap initialization
    Safe.try(async () => {
      const audioModule = window.AudioManager || window.AudioEngine;
      if (audioModule && audioModule.init) {
        Safe.log("[ENGINE] Initializing Audio...");
        await audioModule.init();
      }
    }, "Audio init");

    Safe.try(() => {
      if (window.HUD && HUD.init) {
        Safe.log("[ENGINE] Initializing HUD...");
        HUD.init();
      }
    }, "HUD init");

  } catch (e) {
    Safe.error("[ENGINE] Bootstrap failed:", e);
  }
}

// --- Auto-run bootstrap on load ---
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapEngine);
} else {
  bootstrapEngine();
}