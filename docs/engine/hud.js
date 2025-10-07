// Very small HUD module (global)
window.HUD = (function () {
  let el;

  function ensure() {
    if (!el) el = document.getElementById("hud");
    return el;
  }

  function createHUD() {
    const root = ensure();
    if (!root) return;
    root.innerHTML = `
      <div id="hud-bar" style="opacity:.85; padding:.5rem 1rem; border-radius:8px;">
        <span id="hud-scene"></span>
        <span id="hud-health" style="margin-left:1rem;"></span>
        <span id="hud-score"  style="margin-left:1rem;"></span>
        <span id="hud-inv"    style="margin-left:1rem;"></span>
      </div>
    `;
  }

  function updateHUD(state) {
    const root = ensure();
    if (!root) return;
    const s = state || (window.Player ? window.Player.getState() : null);
    if (!s) return;
    root.querySelector("#hud-scene").textContent  = `Scene: ${s.currentScene}`;
    root.querySelector("#hud-health").textContent = `Health: ${s.health}`;
    root.querySelector("#hud-score").textContent  = `Score: ${s.score}`;
    root.querySelector("#hud-inv").textContent    = `Inventory: ${s.inventory.length ? s.inventory.join(", ") : "None"}`;
  }

  return { createHUD, updateHUD };
})();