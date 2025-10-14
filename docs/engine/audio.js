// ===== audio.js =====
// Universal Engine Audio Manager
// Provides centralized, safe, toggleable audio playback.

window.AudioManager = (function() {
  const sounds = {};
  const state = {
    muted: false,
    volume: 1.0,
  };

  const Safe = window.Safe || { try: (fn) => { try { return fn(); } catch (e) { console.error(e); } } };

  function loadSound(id, src) {
    Safe.try(() => {
      const audio = new Audio(src);
      audio.preload = 'auto';
      sounds[id] = audio;
    }, `loadSound(${id})`);
  }

  function play(id, loop = false) {
    Safe.try(() => {
      if (state.muted || !sounds[id]) return;
      const audio = sounds[id];
      audio.loop = loop;
      audio.volume = state.volume;
      audio.currentTime = 0;
      audio.play();
    }, `play(${id})`);
  }

  function stop(id) {
    Safe.try(() => {
      if (!sounds[id]) return;
      sounds[id].pause();
      sounds[id].currentTime = 0;
    }, `stop(${id})`);
  }

  function toggleMute() {
    state.muted = !state.muted;
    localStorage.setItem('audioMuted', state.muted);
    return state.muted;
  }

  function setVolume(v) {
    state.volume = Math.min(1, Math.max(0, v));
    localStorage.setItem('audioVolume', state.volume);
  }

  function loadPrefs() {
    state.muted = localStorage.getItem('audioMuted') === 'true';
    state.volume = parseFloat(localStorage.getItem('audioVolume')) || 1.0;
  }

  function init() {
    loadPrefs();
    Safe.info('[AudioManager] Initialized', state);
  }

  return { loadSound, play, stop, toggleMute, setVolume, init, state };
})();