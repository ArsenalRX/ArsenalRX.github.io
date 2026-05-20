// ========== SHARED NAMESPACE + CONSTANTS ==========
window.ARX = {
  TYPEWRITER_TYPE_SPEED: 80,
  TYPEWRITER_DELETE_SPEED: 40,
  TYPEWRITER_PAUSE: 2000,
  TYPEWRITER_SWITCH_DELAY: 500,
  GITHUB_CACHE_TTL: 600000,
  TILT_MAX_DEG: 8,
  CARD_TILT_PERSPECTIVE: 800,

  // Shared state
  tabVisible: true,
  mouseX: 0,
  mouseY: 0,
  particles: [],

  // Cross-module references
  terminalCommands: {},
  terminalBody: null,
  terminalInput: null,
};

document.addEventListener('visibilitychange', function() {
  window.ARX.tabVisible = !document.hidden;
});
