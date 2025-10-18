// ===== Safe Logging Utility (Global, executes immediately) =====
const DEBUG = /[?&]debug=1/.test(location.search);

if (typeof window.Safe !== 'undefined') {
  console.warn('[ENGINE:CORE] Safe already defined — using existing instance.');
} else {
  console.log('[ENGINE:CORE] Safe utility registered globally');
}

window.Safe = {
  log:  (...a) => { if (DEBUG) console.log('[ENGINE]', ...a); },
  info: (...a) => console.info('[ENGINE]', ...a),
  warn: (...a) => console.warn('[ENGINE]', ...a),
  error: (...a) => console.error('[ENGINE]', ...a),
  try(fn, label = 'block') {
    try { return fn(); }
    catch (e) {
      console.error(`[ENGINE] ${label} failed:`, e);
      return undefined;
    }
  }
};



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
    if (window.location.hostname.includes("localhost")) console.log("✅ Game loaded:", data);
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
  
  if (window.HUD && typeof HUD.updateHUD === "function") {
  HUD.updateHUD(gameState);
}
  updateScene();
}

// ===== Scene validation =====
function validateScene(scene) {
  if (!scene || typeof scene !== 'object') return 'Scene object is missing.';
  if (typeof scene.text !== 'string')       return 'Scene.text must be a string.';
  if (!Array.isArray(scene.choices))        return 'Scene.choices must be an array.';
  for (let i = 0; i < scene.choices.length; i++) {
    const opt = scene.choices[i];
    if (!opt || typeof opt !== 'object')       return `Choice[${i}] is not an object.`;
    if (typeof opt.text !== 'string')          return `Choice[${i}].text must be a string.`;
    if (opt.nextScene && typeof opt.nextScene !== 'string') return `Choice[${i}].nextScene must be a string.`;
  }
  return null; // valid
}


function updateScene() {
	if (!scenes || !Object.keys(scenes).length) return console.warn("Scenes not yet loaded");
	
	const err = validateScene(scenes[gameState.currentScene]);
if (err) {
  Safe.warn('Invalid scene detected:', err, scenes[gameState.currentScene]);
  const textBox = document.getElementById('text-box');
  if (textBox) textBox.innerHTML = `<p style="color:red;">⚠️ Scene data error: ${err}</p>`;
  return;
}
	
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
    if (choice.effect) applyEffectSafe(choice.effect);
	
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
    if (!maybeTriggerEvent()) {
  updateScene();
}
  };

  choicesBox.appendChild(btn);
});

 

  // Auto-save visual feedback
showMessage("Progress saved", "neutral");

// ✅ Update HUD after scene change
if (window.HUD && typeof HUD.updateHUD === "function") {
  HUD.updateHUD(gameState);
}

}
  
/* ==========================================================
   Random Event Trigger System
   ========================================================== */
   
   // ===== Safe Effect Application =====
function applyEffectSafe(effect) {
  if (!effect) return;
  try {
    if (typeof applyEffect === 'function') {
      applyEffect(effect);
    } else {
      Safe.warn('applyEffect() not defined. Skipping effect:', effect);
    }
  } catch (e) {
    Safe.warn('applyEffect failed:', e, effect);
  }
}
   
function maybeTriggerEvent() {
  if (Math.random() < 0.3) { // 30% chance per scene
    const randomEvent = getRandomEvent();
    if (randomEvent) {
      displayEvent(randomEvent);
      return true;
    }
  }
  return false;
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
if (!scenes || !Object.keys(scenes).length) {
  console.error("❌ No scenes loaded or file missing:", filename);
  const textBox = document.getElementById('text-box');
  if (textBox) textBox.innerHTML = `<p style="color: red;">⚠️ Story file not found or invalid: ${filename}</p>`;
  return;
}

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



window.addEventListener("DOMContentLoaded", async () => {
  HUD.createHUD();       // ✅ Builds HUD once DOM is ready
  
  Safe.try(() => AudioManager.init(), "AudioManager.init");

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
  
  // ✅ Load random events before starting the game
 
 // --- Robust integration check for eventLoader.js ---
if (typeof loadEvents !== "function") {
  Safe.warn("⚠️ eventLoader.js not found or loadEvents() missing. Events will be disabled.");
} else {
  try {
    await loadEvents("events/defaultEvents.json");
    Safe.info("✅ Events file loaded successfully from /events/");
  } catch (err) {
    Safe.error("❌ Failed to load events file:", err);
  }
}
 

  // ✅ Then start engine
  initializeEngine();
 
  
  
/* ==========================================================
   Settings Menu System (Sound + Install)
   ========================================================== */

const settingsButton = document.getElementById("settingsButton");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettings = document.getElementById("closeSettings");
const soundToggle = document.getElementById("soundToggle");
const installAppButton = document.getElementById("installAppButton");

let soundEnabled = true;
let deferredPrompt;

// Show/hide settings panel
if (settingsButton && settingsPanel) {
  settingsButton.addEventListener("click", () => {
    settingsPanel.classList.toggle("hidden");

    // Optional refinement: debounce AudioManager reinitialization
    if (AudioManager && !AudioManager._refreshing) {
      AudioManager._refreshing = true;
	  Safe.log("🔁 Reinitializing AudioManager (debounced)");
      setTimeout(() => {
        AudioManager.init();
        AudioManager._refreshing = false;
      }, 200); // Adjust timing if needed (200ms = safe UI refresh window)
    }
  });
}

if (closeSettings && settingsPanel) {
  closeSettings.addEventListener("click", () => {
    settingsPanel.classList.add("hidden");
  });
}

// Handle sound toggle
if (soundToggle) {
  soundToggle.addEventListener("change", (e) => {
    soundEnabled = e.target.checked;
    console.log("🔊 Sound " + (soundEnabled ? "enabled" : "disabled"));
    if (AudioManager) { if (soundEnabled) AudioManager.setVolume(1); else AudioManager.toggleMute(); } 
  });
}

// Capture install prompt
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installAppButton) {
    installAppButton.style.display = "block";
  }
});

// Manual install trigger
if (installAppButton) {
  installAppButton.addEventListener("click", async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      console.log("📦 Install result:", choice.outcome);
      deferredPrompt = null;
    } else {
      alert("Install not available — try adding to Home Screen manually.");
    }
  });
}


}); // <-- closes the DOMContentLoaded listener properly

// === Development Debug: Optional Random Event Trigger ===
if (window.__DEBUG__) {
  setTimeout(() => {
    const events = window.eventsData?.events;
    if (events?.length) {
      const eventData = events[Math.floor(Math.random() * events.length)];
      Safe.log("🎲 Triggering debug test event:", eventData.id);
      if (typeof displayEvent === "function") displayEvent(eventData);
      else Safe.warn("displayEvent() not found or not loaded.");
    } else {
      Safe.warn("No events available to trigger (debug).");
    }
  }, 3000);
}

if (typeof AudioManager !== "undefined" && AudioManager && !AudioManager._initialized) {
  Safe.try(() => {
    AudioManager.init();
    AudioManager._initialized = true;
  }, "AudioManager init (post-core)");
}
