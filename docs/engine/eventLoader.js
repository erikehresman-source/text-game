// eventLoader.js
// Loads external JSON event packs dynamically (Robust version)

(() => {
	Safe.log("🧩 eventLoader module initialized");
  let eventPool = [];

  async function loadEvents(filePath = "events/demo.json") {
    return Safe.try(async () => {
      const response = await fetch(filePath, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status} on ${filePath}`);

      const data = await response.json();
      if (!data || !Array.isArray(data.events)) {
        Safe.warn("Invalid or missing event list in", filePath);
        return;
      }

      eventPool = data.events;
      window.eventsData = { events: eventPool };
      Safe.log(`✅ Loaded ${eventPool.length} events from ${filePath}`);
    }, "loadEvents");
  }

  function getRandomEvent() {
    return Safe.try(() => {
      if (!Array.isArray(eventPool) || eventPool.length === 0) {
        Safe.warn("No events available in pool.");
        return null;
      }
      return eventPool[Math.floor(Math.random() * eventPool.length)];
    }, "getRandomEvent");
  }

  function displayEvent(eventData) {
    Safe.try(() => {
      if (!eventData) return Safe.warn("displayEvent called with null data.");

      const container = document.getElementById("story") || document.getElementById("event-container");
      const choicesDiv = document.getElementById("choices");

      if (!container || !choicesDiv) {
        Safe.warn("Event or choices container missing from DOM.");
        return;
      }

      container.textContent = eventData.text || "(No description)";
      choicesDiv.innerHTML = "";

      const options = eventData.options || eventData.choices || [];
      if (!options.length) {
        const btn = document.createElement("button");
        btn.textContent = "Continue";
        btn.onclick = () => renderScene?.(window.currentSceneId);
        choicesDiv.appendChild(btn);
        return;
      }

      options.forEach(choice => {
        const btn = document.createElement("button");
        btn.textContent = choice.text || "Continue";
        btn.onclick = () => Safe.try(() => {
          if (choice.effect) applyEffect(choice.effect, choice.value ?? 0, choice.item);
          container.textContent = choice.result || "You continue your journey.";
          setTimeout(() => renderScene?.(window.currentSceneId), 800);
        }, "choiceHandler");
        choicesDiv.appendChild(btn);
      });
    }, "displayEvent");
  }

  function applyEffect(effect, value, item) {
    Safe.try(() => {
      const p = window.player ?? {};
      switch (effect) {
        case "gain_item":
          p.inventory?.push?.(item);
          Safe.log(`🧰 Item gained: ${item}`);
          break;
        case "gain_score":
          p.score = (p.score ?? 0) + value;
          Safe.log(`⭐ Score +${value}`);
          break;
        case "damage":
          p.health = Math.max(0, (p.health ?? 0) - value);
          Safe.log(`💥 Damage taken: ${value}`);
          break;
        case "random_damage":
          const dmg = Math.floor(Math.random() * value);
          p.health = Math.max(0, (p.health ?? 0) - dmg);
          Safe.log(`⚠️ Random damage: ${dmg}`);
          break;
        default:
          Safe.log("No effect or unknown effect type.");
      }
      HUD?.updateHUD?.();
    }, "applyEffect");
  }

  // Make accessible globally
  window.loadEvents = loadEvents;
  window.getRandomEvent = getRandomEvent;
  window.displayEvent = displayEvent;
})();