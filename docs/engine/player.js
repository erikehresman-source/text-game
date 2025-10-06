// player.js — Handles player stats and inventory
const player = {
  health: 100,
  score: 0,
  inventory: [],

  applyEffect(effect) {
    if (effect.health) player.health += effect.health;
    if (effect.score) player.score += effect.score;
    if (effect.inventoryAdd) player.inventory.push(effect.inventoryAdd);
    if (effect.inventoryRemove) {
      player.inventory = player.inventory.filter(i => i !== effect.inventoryRemove);
    }
    updateHUD();
  },

  hasItem(item) {
    return player.inventory.includes(item);
  }
};