// Player state + helpers (global)
window.Player = (function () {
  let state = {
    currentScene: "start",
    health: 100,
    score: 0,
    inventory: []
  };

  function getState() { return { ...state }; }
  function setState(patch) { Object.assign(state, patch); }
  function reset() {
    state = {
      currentScene: "start",
      health: 100,
      score: 0,
      inventory: []
    };
  }
  function have(item) { return state.inventory.includes(item); }
  function add(item) { if (!have(item)) state.inventory.push(item); }
  function remove(item) { state.inventory = state.inventory.filter(i => i !== item); }

  return { getState, setState, reset, have, add, remove };
})();