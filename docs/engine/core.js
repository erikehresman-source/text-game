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
    console.log('✅ Game loaded:', data);
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

function initGame() {
  const saved = loadGame();

  const textBox = document.getElementById('text-box');
  const choicesBox = document.getElementById('choices');

  if (saved) {
    textBox.innerHTML = `
      <p>Continue where you left off?</p>
    `;
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

    // HUD
  hudBox.textContent = `Scene: ${gameState.currentScene} | Health: ${gameState.health} | Score: ${gameState.score} | Inventory: ${gameState.inventory.length ? gameState.inventory.join(', ') : "None"}`;

  // Auto-save visual feedback
  showMessage("Progress saved", "neutral");
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
/* ===========================
   Load Scenes from JSON (modular data loading, GitHub-safe)
=========================== */

const gamePath = './games/demo.json';

// 🧭 Debug: show the path being fetched
console.log("📁 Attempting to fetch:", gamePath);

document.body.insertAdjacentHTML('beforeend', `<p style="color:lime;font-family:monospace;">Attempting: ${gamePath}</p>`);

fetch(gamePath)
  .then(response => {
    console.log("🔎 Fetch response:", response.status, response.statusText);
    if (!response.ok) throw new Error(`Scene file not found: ${response.status}`);
    return response.json();
  })
  .then(data => {
    scenes = data;
    console.log("✅ Scenes loaded successfully:", scenes);
    initGame();
  })
  .catch(err => {
    console.error("❌ Failed to load scenes:", err);
    document.getElementById("text-box").textContent =
      "Error loading game. Check console for details.";
  });

/* ==========================================================
   Initialize Game
   ========================================================== */
//window.onload = initGame;

