// Global data/config used by the engine
window.GameData = {
  baseStats: { health: 100, score: 0 },
  defaultInventory: []
};

// -----------------------------------------------------------
// Story Loader Function (makes JSON available to core.js)
// -----------------------------------------------------------
async function loadStoryData(filename) {
  try {
    const response = await fetch(filename);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    console.log("✅ Story file loaded:", filename);
    return data;
  } catch (err) {
    console.error("❌ Failed to load story file:", filename, err);
    return {};
  }
}

// Make loadStoryData globally accessible
window.loadStoryData = loadStoryData;