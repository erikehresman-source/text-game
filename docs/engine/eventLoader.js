// eventLoader.js
// Loads external JSON event packs dynamically

let eventPool = [];

async function loadEvents(filePath = "events/demo.json") {
  try {
    const response = await fetch(filePath);
    const data = await response.json();
    if (Array.isArray(data.events)) {
      eventPool = data.events;
      console.log(`Loaded ${eventPool.length} events from ${filePath}`);
	  window.eventsData = { events: eventPool }; // ✅ make events globally accessible
    } else {
      console.error("Invalid event format in", filePath);
    }
  } catch (error) {
    console.error("Error loading events:", error);
  }
}

function getRandomEvent() {
  if (eventPool.length === 0) return null;
  return eventPool[Math.floor(Math.random() * eventPool.length)];
}

function displayEvent(eventData) {
  const container = document.getElementById("story") || document.getElementById("event-container");
  const choicesDiv = document.getElementById("choices");

  if (!container) {
    console.warn("⚠️ Event container not found in DOM.");
    return;
  }


  container.textContent = eventData.text;
  choicesDiv.innerHTML = "";

  (eventData.options || eventData.choices || []).forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice.text;
    btn.onclick = () => {
      if (choice.effect) {
        if (choice.effect.health) player.health += choice.effect.health;
        if (choice.effect.score) player.score += choice.effect.score;
      }
      container.textContent = choice.result || "You continue your journey.";
      setTimeout(() => renderScene(currentSceneId), 1000);
    };
    choicesDiv.appendChild(btn);
  });
}

// Make accessible globally
window.loadEvents = loadEvents;
window.getRandomEvent = getRandomEvent;
window.displayEvent = displayEvent;

function applyEffect(effect, value, item) {
  switch (effect) {
    case "gain_item":
      player.inventory.push(item);
      console.log(`🧰 Item gained: ${item}`);
      break;
    case "gain_score":
      player.score += value;
      console.log(`⭐ Score +${value}`);
      break;
    case "damage":
      player.health -= value;
      console.log(`💥 Damage taken: ${value}`);
      break;
    case "random_damage":
      const dmg = Math.floor(Math.random() * value);
      player.health -= dmg;
      console.log(`⚠️ Random damage: ${dmg}`);
      break;
    case "none":
    default:
      console.log("No effect.");
      break;
  }
  HUD.updateHUD(); // refreshes the bottom bar
}