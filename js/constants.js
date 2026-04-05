// ========== SHARED NAMESPACE + CONSTANTS ==========
window.ARX = {
  // Constants
  STAR_DENSITY_DIVISOR: 10000,
  STAR_FRAME_MS: 50,
  PARTICLE_FRAME_MS: 33,
  MOUSE_THROTTLE_MS: 16,
  SHOOTING_STAR_INTERVAL: 5000,
  METEOR_SHOWER_INTERVAL: 45000,
  METEOR_SHOWER_COUNT: 8,
  TYPEWRITER_TYPE_SPEED: 80,
  TYPEWRITER_DELETE_SPEED: 40,
  TYPEWRITER_PAUSE: 2000,
  TYPEWRITER_SWITCH_DELAY: 500,
  GREETING_SCRAMBLE_SPEED: 40,
  HERO_GLITCH_INTERVAL: 6000,
  HERO_GLITCH_CHANCE: 0.85,
  TITLE_CHAR_DELAY_MS: 50,
  WARP_INITIAL_STRENGTH: 1.5,
  SCROLL_WARP_THRESHOLD: 30,
  SCROLL_DECAY_INTERVAL: 250,
  CODE_RAIN_FRAME_MS: 33,
  CODE_RAIN_ACTIVE_CHANCE: 0.08,
  GLITCH_BURST_INTERVAL: 8000,
  GLITCH_BURST_CHANCE: 0.92,
  HUD_FLICKER_INTERVAL: 4000,
  TERMINAL_IDLE_TIMEOUT: 10000,
  TERMINAL_DEMO_STEP_DELAY: 3000,
  TERMINAL_DEMO_TYPE_SPEED: 80,
  GITHUB_CACHE_TTL: 600000,
  GHOST_SPAWN_DELAY: 60000,
  PACKET_SNIFFER_DELAY: 15000,
  PACKET_MAX_LINES: 8,
  LENS_RADIUS_DEFAULT: 200,
  LENS_RADIUS_HOLD: 300,
  TILT_MAX_DEG: 12,
  CARD_TILT_PERSPECTIVE: 600,

  // Shared mutable state
  tabVisible: true,
  mouseX: 0,
  mouseY: 0,
  particles: [],
  stars: [],
  shootingStars: [],
  warpStrength: 0,
  driftTime: 0,
  driftX: 0,
  driftY: 0,
  lensActive: false,
  lensHolding: false,
  lensHoldTime: 0,
  vizActive: false,
  vizBass: 0,
  vizMids: 0,
  vizTreble: 0,
  codeRainStarted: false,

  // Cross-module references (set by owning modules)
  siteMusic: null,
  terminalCommands: {},
  terminalBody: null,
  terminalInput: null,

  // Cross-module functions (set by owning modules)
  spawnShootingStar: null,
  fireGlitch: null,
  hudBreach: null,
  triggerWarp: null,
  fireArrivalPulse: null,
  spawnParticles: null,
};

// Pause animations when tab hidden
document.addEventListener('visibilitychange', function() {
  window.ARX.tabVisible = !document.hidden;
});
