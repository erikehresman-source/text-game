// engine/hud.js
// Simple modular HUD controller

export function initHUD(containerId = 'hud') {
  const hud = document.getElementById(containerId);
  if (!hud) return console.warn('HUD container not found.');

  hud.innerHTML = `
    <div id="hud-health">❤️ Health: 100</div>
    <div id="hud-score">⭐ Score: 0</div>
    <div id="hud-inventory">🎒 Inventory: None</div>
  `;
}

export function updateHUD(state) {
  document.getElementById('hud-health').textContent = `❤️ Health: ${state.health}`;
  document.getElementById('hud-score').textContent = `⭐ Score: ${state.score}`;
  const inv = state.inventory && state.inventory.length > 0
    ? state.inventory.join(', ')
    : 'None';
  document.getElementById('hud-inventory').textContent = `🎒 Inventory: ${inv}`;
}