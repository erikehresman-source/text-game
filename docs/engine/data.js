// data.js — Handles loading of story JSON
async function loadStoryData(filename = "demo.json") {
  const path = `games/${filename}`;
  console.log("📘 Loading story file:", path);
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load ${path} (${response.status})`);
    const data = await response.json();
    console.log("✅ Story loaded successfully:", Object.keys(data));
    return data;
  } catch (err) {
    console.error("❌ Story loading failed:", err);
    document.getElementById("text-box").textContent = "Error loading story data.";
    return null;
  }
}