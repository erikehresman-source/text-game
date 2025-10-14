// ===================================================
// Universal Engine Bootstrap (Stage 2 Robustness Patch)
// engine.universal.js
// ===================================================
// Purpose: Dynamically loads all registered universal modules,
// wraps each in Safe.try() for stability, times their load durations,
// and provides a structured diagnostic summary.
//
// Dependencies: Safe (from core.universal.js) must be defined first.
// ===================================================

(async () => {
  const Engine = { modules: {}, version: "2.0-universal" };
  window.Engine = Engine;

  const startTime = performance.now();
  Safe?.log?.("[ENGINE] Bootstrap starting...");

  try {
    // Load module registry
    const regStart = performance.now();
    const response = await fetch("core/universal/registry.json");
    const registry = await response.json();
    const regEnd = performance.now();

    Safe?.log?.(`[ENGINE] Registry loaded in ${(regEnd - regStart).toFixed(2)}ms`);

    if (!registry.modules || !Array.isArray(registry.modules)) {
      Safe?.error?.("[ENGINE] Invalid registry format");
      return;
    }

    Safe?.log?.("[ENGINE] Loading modules:", registry.modules);

    const results = [];
    for (const moduleName of registry.modules) {
      const modulePath = `core/universal/${moduleName}.universal.js`;
      const modStart = performance.now();

      const result = Safe.try(async () => {
        await import(`../${modulePath}`);
        Engine.modules[moduleName] = { loaded: true };
        const modEnd = performance.now();
        const dur = (modEnd - modStart).toFixed(2);
        Safe?.log?.(`[ENGINE] ✅ Loaded: ${moduleName} (${dur}ms)`);
        results.push({ module: moduleName, status: "✅ OK", time: dur });
      }, moduleName);

      // Await each Safe.try() result explicitly
      await Promise.resolve(result);
    }

    // === Diagnostics Summary (with color) ===
const totalTime = (performance.now() - startTime).toFixed(2);
const failed = results.filter(r => r.status !== "✅ OK").length;
const color = failed
  ? (failed < results.length ? "color:orange" : "color:red")
  : "color:green";

// Automatically expand summary when there are errors or warnings
const openGroup = failed > 0 ? console.group : console.groupCollapsed;
openGroup("%c[ENGINE] Bootstrap Summary", `${color};font-weight:bold`);
for (const r of results) {
  const style = r.status === "✅ OK" ? "color:green" : "color:red";
  console.log(`%c• ${r.module.padEnd(16)} ${r.status} [${r.time}ms]`, style);
}
console.log(`%c${"=".repeat(48)}`, color);
console.log(`%c[ENGINE] Bootstrap complete in ${totalTime}ms`, color);
console.groupEnd();

  } catch (e) {
    Safe?.error?.("[ENGINE] Fatal error during bootstrap", e);
  }
})();