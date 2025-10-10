// eventLoader.js
// Loads external JSON event packs dynamically

let eventPool = [];

async function loadEvents(filePath = "events/space.json") {
  try {
    const response = await fetch(filePath);
    const data = await response.json();
    if (Array.isArray(data.events)) {
      eventPool = data.events;
      console.log(`Loaded ${eventPool.length} events from ${filePath}`);
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
  const container = document.getElementById("game-text");
  const choicesDiv = document.getElementById("choices");

  container.textContent = eventData.text;
  choicesDiv.innerHTML = "";

  eventData.choices.forEach(choice => {
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