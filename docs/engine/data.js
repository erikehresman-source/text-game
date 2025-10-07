// -----------------------------------------------------------
// Global Game Data
// -----------------------------------------------------------
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

// -----------------------------------------------------------
// Dynamic Story File Discovery
// -----------------------------------------------------------
async function populateStoryDropdown() {
  const select = document.getElementById("storyFile");
  if (!select) return;

  try {
    // Attempt to load the directory listing of /games/
    const response = await fetch("games/");
    const text = await response.text();

    // Match any .json filenames in the response
    const matches = [...text.matchAll(/href="([^"]+\.json)"/g)];
    const files = matches.map(m => m[1]);

    // Fallback list if GitHub Pages doesn't allow directory listing
    const fallback = ["demo.json", "sample2.json", "sample3.json", "test_scenario.json"];
    const storyFiles = files.length ? files : fallback;

    // Populate dropdown
    select.innerHTML = "";
    storyFiles.forEach(file => {
      const opt = document.createElement("option");
      opt.value = file;
      opt.textContent = file;
      select.appendChild(opt);
    });

    console.log("📁 Story files loaded into dropdown:", storyFiles);
  } catch (err) {
    console.warn("⚠️ Could not auto-load story list; using fallback:", err);
  }
}

// Make functions globally accessible
window.loadStoryData = loadStoryData;
window.populateStoryDropdown = populateStoryDropdown;

// -----------------------------------------------------------
// Initialize dropdown when page loads
// -----------------------------------------------------------
document.addEventListener("DOMContentLoaded", populateStoryDropdown);