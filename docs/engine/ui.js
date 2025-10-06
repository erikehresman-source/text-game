// ui.js — User interface and display controls
function displayScene(scene) {
  const textBox = document.getElementById("text-box");
  const choiceBox = document.getElementById("choice-box");
  textBox.textContent = scene.text;

  choiceBox.innerHTML = "";
  scene.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice.text;

    // Disable if requirement not met
    if (choice.requires && !choice.requires.every(r => player.hasItem(r))) {
      btn.disabled = true;
    }

    btn.onclick = () => nextScene(choice);
    choiceBox.appendChild(btn);
  });

  updateHUD(scene);
}

function updateHUD(scene = {}) {
  const hud = document.getElementById("hud");
  const inv = player.inventory.length ? player.inventory.join(", ") : "None";
  hud.textContent = `Scene: ${scene.id || "?"} | Health: ${player.health} | Score: ${player.score} | Inventory: ${inv}`;
}