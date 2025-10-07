try { if (typeof eruda !== "undefined") eruda.init(); } catch (e) {}

// ===============================
// Text Adventure Engine (core.js)
// JSON-driven + Game State + Save/Load
// ===============================

// Global state
let gameState = {
  currentScene: "start",
  health: 100,
  score: 0,
  inventory: []
};

let scenes = {};

// HUD integration
let hudReady = false;

/* ==========================================================
   Persistent Save/Load System for Text Adventure Engine
   ========================================================== */

function saveGame() {
  try {
    const saveData = {
      currentScene: gameState.currentScene,
      health: gameState.health,
      score: gameState.score,
      inventory: gameState.inventory
    };
    localStorage.setItem('textAdventureSave', JSON.stringify(saveData));
    console.log('✅ Game saved:', saveData);
  } catch (err) {
    console.error('❌ Save failed:', err);
  }
}

function loadGame() {
  try {
    const savedData = localStorage.getItem('textAdventureSave');
    if (!savedData) return null;
    const data = JSON.parse(savedData);
    if (window.location.hostname.includes("localhost")) console.log("✅ Game saved:", saveData);
    return data;
  } catch (err) {
    console.error('❌ Load failed:', err);
    return null;
  }
}

function clearSave() {
  localStorage.removeItem('textAdventureSave');
  console.log('🧹 Save data cleared');
}

/* ==========================================================
   Modified Game Init – handles “Continue / New Game”
   ========================================================== */



/* ==========================================================
   Game Start & Update Functions
   ========================================================== */

function startNewGame() {
  gameState = {
    currentScene: "start",
    health: 100,
    score: 0,
    inventory: []
  };
  updateScene();
}

function updateScene() {
	if (!scenes || !Object.keys(scenes).length) return console.warn("Scenes not yet loaded");
  const scene = scenes[gameState.currentScene];
  if (!scene) {
    console.error('Scene not found:', gameState.currentScene);
    return;
  }

  const textBox = document.getElementById('text-box');
  const choicesBox = document.getElementById('choices');
  const hudBox = document.getElementById('hud');

  // Scene text
  textBox.innerHTML = `<p>${scene.text}</p>`;

  // Choices
  choicesBox.innerHTML = '';
  // Render choices dynamically based on state
scene.choices.forEach(choice => {
  // Check for requirements before showing
  if (choice.requires) {
    const missing = choice.requires.filter(req => !gameState.inventory.includes(req));
    if (missing.length > 0) return; // Skip if requirements not met
  }

  const btn = document.createElement("button");
  btn.textContent = choice.text;

  btn.onclick = () => {
    // Apply effects
    if (choice.effect) applyEffect(choice.effect);
	
	// Show visual feedback for effects
if (choice.effect) {
  const effects = Object.entries(choice.effect)
    .map(([key, val]) => `${key} ${val > 0 ? "+" : ""}${val}`)
    .join(", ");
  showMessage(`Effect: ${effects}`, "neutral");
}

// If items added
if (choice.adds && choice.adds.length > 0) {
  const added = choice.adds.join(", ");
  showMessage(`Item added: ${added}`, "neutral");
}

// If items removed
if (choice.removes && choice.removes.length > 0) {
  const removed = choice.removes.join(", ");
  showMessage(`Item used: ${removed}`, "neutral");
}

    // Add inventory items (new syntax)
    if (choice.adds) {
      choice.adds.forEach(item => {
        if (!gameState.inventory.includes(item)) gameState.inventory.push(item);
      });
    }

    // Remove items if needed
    if (choice.removes) {
      choice.removes.forEach(item => {
        const idx = gameState.inventory.indexOf(item);
        if (idx !== -1) gameState.inventory.splice(idx, 1);
      });
    }

    // Update scene and save
    gameState.currentScene = choice.nextScene;
    saveGame();
    updateScene();
  };

  choicesBox.appendChild(btn);
});

 

  // Auto-save visual feedback
  showMessage("Progress saved", "neutral");
// Update HUD after scene change
if (typeof updateHUD === "function") updateHUD(gameState);

}
  




/* ==========================================================
   Dynamic Message Feedback System
   ========================================================== */

function showMessage(text, type = "neutral") {
  const box = document.getElementById("message-box");
  if (!box) return;

  const msg = document.createElement("div");
  msg.className = `message ${type}`;
  msg.textContent = text;

  box.appendChild(msg);

  // Remove after fade-out
  setTimeout(() => {
    msg.remove();
  }, 2500);
 }
/* ==========================================================
   Modular Initialization – Connects with data.js, ui.js, player.js
   ========================================================== */

async function initializeEngine(filename = "games/demo.json") {
  scenes = await loadStoryData(filename);
  if (!scenes) return;

  console.log("🎮 Engine initialized with scenes:", Object.keys(scenes));

  // Check if save exists
  const saved = loadGame();
  if (saved) {
    const textBox = document.getElementById('text-box');
    const choicesBox = document.getElementById('choices');
    textBox.innerHTML = `<p>Continue where you left off?</p>`;
    choicesBox.innerHTML = `
      <button id="continue">Continue</button>
      <button id="newgame">New Game</button>
    `;
    document.getElementById('continue').onclick = () => {
      gameState = saved;
      updateScene();
    };
    document.getElementById('newgame').onclick = () => {
      clearSave();
      startNewGame();
    };
  } else {
    startNewGame();
  }
}

/* ==========================================================
   Initialize Game
   ========================================================== */
// Auto-start when DOM is ready

// Optional Story Selector
const storySelect = document.createElement("select");
storySelect.id = "story-select";
["demo.json", "sample2.json", "sample3.json"].forEach(name => {
  const opt = document.createElement("option");
  opt.value = name;
  opt.textContent = name;
  storySelect.appendChild(opt);
});
storySelect.onchange = () => initializeEngine(storySelect.value);
document.body.insertBefore(storySelect, document.body.firstChild);

window.addEventListener("DOMContentLoaded", () => initializeEngine());

