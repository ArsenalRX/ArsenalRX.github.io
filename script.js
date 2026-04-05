// ========== CONSTANTS ==========
const STAR_DENSITY_DIVISOR = 10000;
const STAR_FRAME_MS = 50;            // ~20fps starfield
const PARTICLE_FRAME_MS = 33;        // ~30fps particles
const MOUSE_THROTTLE_MS = 16;        // ~60fps mouse tracking
const SHOOTING_STAR_INTERVAL = 5000;
const METEOR_SHOWER_INTERVAL = 45000;
const METEOR_SHOWER_COUNT = 8;
const TYPEWRITER_TYPE_SPEED = 80;
const TYPEWRITER_DELETE_SPEED = 40;
const TYPEWRITER_PAUSE = 2000;
const TYPEWRITER_SWITCH_DELAY = 500;
const GREETING_SCRAMBLE_SPEED = 40;
const HERO_GLITCH_INTERVAL = 6000;
const HERO_GLITCH_CHANCE = 0.85;
const TITLE_CHAR_DELAY_MS = 50;
const WARP_INITIAL_STRENGTH = 1.5;
const SCROLL_WARP_THRESHOLD = 30;
const SCROLL_DECAY_INTERVAL = 250;
const CODE_RAIN_FRAME_MS = 33;
const CODE_RAIN_ACTIVE_CHANCE = 0.08;  // ~8% of columns active
const GLITCH_BURST_INTERVAL = 8000;
const GLITCH_BURST_CHANCE = 0.92;
const HUD_FLICKER_INTERVAL = 4000;
const TERMINAL_IDLE_TIMEOUT = 10000;
const TERMINAL_DEMO_STEP_DELAY = 3000;
const TERMINAL_DEMO_TYPE_SPEED = 80;
const GITHUB_CACHE_TTL = 600000;       // 10 minutes
const GHOST_SPAWN_DELAY = 60000;       // 60 seconds
const PACKET_SNIFFER_DELAY = 15000;    // 15 seconds
const PACKET_MAX_LINES = 8;
const LENS_RADIUS_DEFAULT = 200;
const LENS_RADIUS_HOLD = 300;
const TILT_MAX_DEG = 12;
const CARD_TILT_PERSPECTIVE = 600;

// ========== GLOBAL PERFORMANCE: pause when tab hidden ==========
let _tabVisible = true;
document.addEventListener('visibilitychange', () => { _tabVisible = !document.hidden; });

// ========== THREE-LAYER PARALLAX STARFIELD ==========
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let stars = [];
let shootingStars = [];
let mouseX = 0, mouseY = 0;
let constellationLines = [];

// Ambient drift — scene is never static
let driftTime = 0;
let driftX = 0, driftY = 0;

// Warp state
let warpActive = false;
let warpStrength = 0;

// Feature forward declarations (used in drawStars before their full init)
let lensActive = false;
let lensHolding = false;
let lensHoldTime = 0;
let vizActive = false;
let vizBass = 0, vizMids = 0, vizTreble = 0;

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }

function createStars() {
  stars = [];
  const count = Math.floor((canvas.width * canvas.height) / STAR_DENSITY_DIVISOR);
  for (let i = 0; i < count; i++) {
    // Three layers: background (0-0.33), mid (0.33-0.66), foreground (0.66-1)
    const depth = Math.random();
    let layer, parallaxSpeed, baseSize;
    if (depth < 0.4) {
      layer = 0; parallaxSpeed = 0.008; baseSize = depth * 1.2 + 0.3; // background: tiny, barely moves
    } else if (depth < 0.75) {
      layer = 1; parallaxSpeed = 0.03; baseSize = depth * 1.8 + 0.5; // mid: medium, moderate movement
    } else {
      layer = 2; parallaxSpeed = 0.07; baseSize = depth * 2.5 + 0.8; // foreground: bright, fast movement
    }

    // Crimson-infected starfield: ~15% deep red, rest white/warm
    const colorType = Math.random();
    let r, g, b;
    if (colorType < 0.15) { r = 255; g = 40 + Math.random() * 40; b = 40 + Math.random() * 30; } // CRIMSON infected
    else if (colorType < 0.55) { r = 220; g = 215; b = 230; } // cool white
    else if (colorType < 0.75) { r = 255; g = 235; b = 200; } // warm white
    else if (colorType < 0.88) { r = 200; g = 200; b = 220; } // dim white
    else { r = 255; g = 160; b = 160; } // soft red tint

    stars.push({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      size: baseSize, speed: depth * 0.5 + 0.1,
      opacity: depth * 0.5 + 0.25, pulse: Math.random() * Math.PI * 2,
      depth, layer, parallaxSpeed, r, g, b,
      twinkleSpeed: Math.random() * 0.04 + 0.005,
      // Store original position for warp effect
      ox: 0, oy: 0,
    });
    stars[stars.length - 1].ox = stars[stars.length - 1].x;
    stars[stars.length - 1].oy = stars[stars.length - 1].y;
  }

  constellationLines = [];
}

function spawnShootingStar() {
  // Red/white split — some crimson traces, some white
  const isCrimson = Math.random() > 0.5;
  shootingStars.push({
    x: Math.random() * canvas.width * 0.8, y: Math.random() * canvas.height * 0.4,
    len: Math.random() * 120 + 60, speed: Math.random() * 10 + 8,
    angle: (Math.PI / 4) + (Math.random() * 0.5 - 0.25), opacity: 1, life: 1,
    crimson: isCrimson,
  });
}

// Shooting stars — rare, surprising
setInterval(() => { if (Math.random() > 0.6) spawnShootingStar(); }, SHOOTING_STAR_INTERVAL);
// Meteor shower
setInterval(() => { for (let i = 0; i < METEOR_SHOWER_COUNT; i++) setTimeout(() => spawnShootingStar(), i * 200); }, METEOR_SHOWER_INTERVAL);

// Pulsar beacon
let pulsarPhase = 0;

let lastStarTime = 0;
function drawStars(timestamp) {
  requestAnimationFrame(drawStars);
  // Skip when tab hidden or throttle to ~20fps
  if (!_tabVisible || timestamp - lastStarTime < STAR_FRAME_MS) return;
  lastStarTime = timestamp;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Ambient drift (sine wave, never static)
  driftTime += 0.003;
  driftX = Math.sin(driftTime * 0.7) * 8;
  driftY = Math.cos(driftTime * 0.5) * 5;

  // Warp decay
  if (warpStrength > 0.01) {
    warpStrength *= 0.96;
  } else {
    warpStrength = 0;
  }

  const cx = canvas.width / 2, cy = canvas.height / 2;

  // Draw stars with three-layer parallax
  stars.forEach(star => {
    star.pulse += star.twinkleSpeed;
    const flicker = Math.sin(star.pulse) * 0.3 + 0.7;

    // Three-layer parallax: each layer moves at different speed
    const px = star.parallaxSpeed;
    const dx = (mouseX - cx) * px + driftX * (star.layer * 0.5 + 0.5);
    const dy = (mouseY - cy) * px + driftY * (star.layer * 0.5 + 0.5);
    let sx = star.x + dx, sy = star.y + dy;

    // Gravitational lensing effect (Feature 5)
    if (lensActive && mouseX && mouseY) {
      const ldx = sx - mouseX, ldy = sy - mouseY;
      const ldist = Math.sqrt(ldx * ldx + ldy * ldy);
      const lensRadius = lensHolding ? LENS_RADIUS_HOLD : LENS_RADIUS_DEFAULT;
      if (ldist < lensRadius && ldist > 1) {
        const lnx = ldx / ldist, lny = ldy / ldist;
        if (lensHolding && lensHoldTime > 1.5) {
          // Attraction mode — spiral inward
          const pull = Math.min(80 / (ldist * 0.5 + 1), 6);
          sx -= lnx * pull; sy -= lny * pull;
          // Spiral tangent
          sx += lny * pull * 0.3; sy -= lnx * pull * 0.3;
          if (ldist < 15) star.opacity *= 0.9; // fade at center
        } else {
          // Repulsion mode — push outward
          const push = Math.min(2000 / (ldist * ldist + 100), 4);
          sx += lnx * push; sy += lny * push;
        }
      }
    }

    // Warp effect — stars streak away from center
    let drawSize = star.size;
    let streakLen = 0;
    if (warpStrength > 0.01) {
      const fromCX = star.x - cx, fromCY = star.y - cy;
      const dist = Math.sqrt(fromCX * fromCX + fromCY * fromCY) || 1;
      const nx = fromCX / dist, ny = fromCY / dist;
      const warpPush = warpStrength * (star.layer + 1) * 40;
      sx += nx * warpPush;
      sy += ny * warpPush;
      streakLen = warpStrength * (star.layer + 1) * 30;
    }

    // Draw star
    if (streakLen > 2) {
      // Warp streak — elongated toward vanishing point
      const fromCX = star.x - cx, fromCY = star.y - cy;
      const dist = Math.sqrt(fromCX * fromCX + fromCY * fromCY) || 1;
      const nx = fromCX / dist, ny = fromCY / dist;
      const tailX = sx - nx * streakLen, tailY = sy - ny * streakLen;
      // Warp streaks — mix of red and white
      const isRedStreak = star.r > 200 && star.g < 100;
      const sr = isRedStreak ? '255, 45, 45' : `${star.r}, ${star.g}, ${star.b}`;
      ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(sx, sy);
      ctx.strokeStyle = `rgba(${sr}, ${star.opacity * flicker})`;
      ctx.lineWidth = Math.min(star.size * 1.5, 3); ctx.stroke();
      ctx.beginPath(); ctx.arc(sx, sy, star.size * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${isRedStreak ? '255, 80, 80' : '255, 255, 255'}, ${star.opacity * flicker})`; ctx.fill();
    } else {
      // Apply threat red-shift and audio visualizer modulation
      let dr = star.r, dg = star.g, db = star.b, dOp = star.opacity * flicker, dSize = drawSize;
      if (vizActive) {
        dSize *= (1 + vizBass * 0.5);
        dOp *= (0.7 + vizMids * 0.5);
        // Color shift: bass=purple, treble=white
        dr = Math.min(255, dr + vizBass * 60);
        db = Math.min(255, db + vizBass * 80);
      }
      ctx.beginPath();
      ctx.arc(sx, sy, dSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${dr|0}, ${dg|0}, ${db|0}, ${dOp})`;
      ctx.fill();
    }
  });

  // Shooting stars
  shootingStars.forEach((s, i) => {
    s.x += Math.cos(s.angle) * s.speed;
    s.y += Math.sin(s.angle) * s.speed;
    s.life -= 0.012; s.opacity = s.life;
    if (s.life <= 0) { shootingStars.splice(i, 1); return; }
    const tailX = s.x - Math.cos(s.angle) * s.len;
    const tailY = s.y - Math.sin(s.angle) * s.len;
    const cr = s.crimson;
    ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(s.x, s.y);
    ctx.strokeStyle = `rgba(${cr ? '255, 60, 60' : '220, 220, 240'}, ${s.opacity})`;
    ctx.lineWidth = cr ? 2 : 1.5; ctx.stroke();
  });

  // Pulsar beacon
  pulsarPhase += 0.03;
  const pulsarBright = (Math.sin(pulsarPhase) * 0.5 + 0.5) * 0.6;
  ctx.beginPath(); ctx.arc(canvas.width - 60, 80, 2, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 45, 45, ${pulsarBright})`; ctx.fill();
  ctx.beginPath(); ctx.arc(canvas.width - 60, 80, 8, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 45, 45, ${pulsarBright * 0.2})`; ctx.fill();

}

resizeCanvas(); createStars(); requestAnimationFrame(drawStars);
window.addEventListener('resize', () => { resizeCanvas(); createStars(); });

// ========== CURSOR PARTICLE TRAIL ==========
const particleCanvas = document.getElementById('cursorParticles');
const pCtx = particleCanvas.getContext('2d');
let particles = [];
let prevMouseX = -1, prevMouseY = -1, mouseHasMoved = false;

function resizeParticleCanvas() { particleCanvas.width = window.innerWidth; particleCanvas.height = window.innerHeight; }
resizeParticleCanvas();
window.addEventListener('resize', resizeParticleCanvas);

function spawnParticles(x, y, speed) {
  const count = Math.min(Math.floor(speed / 3), 4);
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x + (Math.random() - 0.5) * 10, y: y + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 3 + 1, life: 1, decay: Math.random() * 0.03 + 0.02,
      color: Math.random() > 0.5 ? '255, 45, 45' : '255, 107, 107',
    });
  }
}

let lastParticleTime = 0;
function drawParticles(timestamp) {
  requestAnimationFrame(drawParticles);
  // Skip when tab hidden, throttle to ~30fps, or skip if empty
  if (!_tabVisible || timestamp - lastParticleTime < PARTICLE_FRAME_MS) return;
  lastParticleTime = timestamp;
  if (particles.length === 0) { pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height); return; }
  pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.life -= p.decay; p.size *= 0.98;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    pCtx.beginPath(); pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    pCtx.fillStyle = `rgba(${p.color}, ${p.life * 0.6})`; pCtx.fill();
    if (p.size > 1.2) {
      pCtx.beginPath(); pCtx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
      pCtx.fillStyle = `rgba(${p.color}, ${p.life * 0.15})`; pCtx.fill();
    }
  }
}
requestAnimationFrame(drawParticles);

// ========== ROTATING RETICLE CURSOR ==========
const reticle = document.getElementById('reticle');
let reticleVisible = false;

// ========== MOUSE TRACKING (throttled) ==========
let _lastMouseMove = 0;
document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;

  // Reticle follows immediately (GPU-composited via transform)
  if (reticle) {
    reticle.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    if (!reticleVisible) {
      reticleVisible = true;
      reticle.classList.add('visible');
      document.body.classList.add('reticle-active');
    }
  }

  // Throttle particle spawning to ~60fps
  const now = performance.now();
  if (now - _lastMouseMove < MOUSE_THROTTLE_MS) return;
  _lastMouseMove = now;

  if (!mouseHasMoved) { mouseHasMoved = true; prevMouseX = e.clientX; prevMouseY = e.clientY; return; }
  const dx = e.clientX - prevMouseX, dy = e.clientY - prevMouseY;
  const speed = Math.sqrt(dx * dx + dy * dy);
  // Cursor particle trail disabled for performance
  prevMouseX = e.clientX; prevMouseY = e.clientY;
}, { passive: true });

document.addEventListener('mouseleave', () => {
  if (reticle) { reticle.classList.remove('visible'); reticleVisible = false; }
});

// ========== CLICK SPARKLE BURST ==========
document.addEventListener('click', e => {
  if (e.target.closest('a, button, input, .nav, .terminal')) return;
  for (let i = 0; i < 4; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'click-sparkle';
    const angle = (Math.PI * 2 / 4) * i;
    const dist = 20 + Math.random() * 20;
    sparkle.style.left = (e.clientX + Math.cos(angle) * dist) + 'px';
    sparkle.style.top = (e.clientY + Math.sin(angle) * dist) + 'px';
    sparkle.style.background = Math.random() > 0.5 ? 'var(--accent)' : 'var(--accent2)';
    sparkle.style.width = sparkle.style.height = (Math.random() * 4 + 2) + 'px';
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 600);
  }
});

// ========== BUTTON RIPPLE EFFECT ==========
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    const rect = this.getBoundingClientRect();
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top = (e.clientY - rect.top) + 'px';
    ripple.style.width = ripple.style.height = Math.max(rect.width, rect.height) + 'px';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// ========== TYPEWRITER ==========
const phrases = ['Developer & Creator', 'Building cool things', 'Always learning', 'Open source enthusiast', 'Turning ideas into code'];
let phraseIndex = 0, charIndex = 0, isDeleting = false;
const typewriterEl = document.getElementById('typewriter');

function typewrite() {
  const currentPhrase = phrases[phraseIndex];
  if (isDeleting) { typewriterEl.textContent = currentPhrase.substring(0, charIndex - 1); charIndex--; }
  else { typewriterEl.textContent = currentPhrase.substring(0, charIndex + 1); charIndex++; }
  let speed = isDeleting ? TYPEWRITER_DELETE_SPEED : TYPEWRITER_TYPE_SPEED;
  if (!isDeleting && charIndex === currentPhrase.length) { speed = TYPEWRITER_PAUSE; isDeleting = true; }
  else if (isDeleting && charIndex === 0) { isDeleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; speed = TYPEWRITER_SWITCH_DELAY; }
  setTimeout(typewrite, speed);
}
typewrite();

// ========== GREETING TEXT SCRAMBLE ==========
const greetingEl = document.querySelector('.greeting-text');
if (greetingEl) {
  const original = greetingEl.textContent;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let iterations = 0;
  const scrambleInterval = setInterval(() => {
    greetingEl.textContent = original.split('').map((char, i) => {
      if (i < iterations) return original[i];
      return chars[Math.floor(Math.random() * chars.length)];
    }).join('');
    iterations += 0.5;
    if (iterations >= original.length) clearInterval(scrambleInterval);
  }, GREETING_SCRAMBLE_SPEED);
}

// ========== HERO NAME GLITCH ==========
const heroName = document.getElementById('heroName');
setInterval(() => {
  if (Math.random() > HERO_GLITCH_CHANCE) {
    heroName.classList.add('glitch');
    setTimeout(() => heroName.classList.remove('glitch'), 300);
  }
}, HERO_GLITCH_INTERVAL);

// ========== SECTION TITLE LETTER-BY-LETTER ASSEMBLY ==========
function assembleTitle(titleEl) {
  const textSpan = titleEl.querySelector('.title-text');
  if (!textSpan || textSpan.dataset.assembled) return;
  textSpan.dataset.assembled = '1';

  const text = textSpan.textContent;
  textSpan.textContent = '';
  const chars = [];

  for (let i = 0; i < text.length; i++) {
    const span = document.createElement('span');
    span.className = 'title-char';
    span.textContent = text[i] === ' ' ? '\u00A0' : text[i];
    textSpan.appendChild(span);
    chars.push(span);
  }

  // Reveal letters one by one like a signal being received
  chars.forEach((charEl, i) => {
    setTimeout(() => {
      charEl.classList.add('revealed');
    }, i * TITLE_CHAR_DELAY_MS + 100);
  });

  // After all letters, slide out the divider line
  setTimeout(() => {
    titleEl.classList.add('title-assembled');
  }, chars.length * TITLE_CHAR_DELAY_MS + 200);
}

// ========== SCROLL REVEAL (with title assembly) ==========
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
        // If this is a section title, trigger letter assembly
        if (entry.target.classList.contains('section-title')) {
          assembleTitle(entry.target);
        }
      }, i * 100);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
revealElements.forEach(el => revealObserver.observe(el));

// ========== ARRIVAL PULSE ==========
const arrivalPulse = document.getElementById('arrivalPulse');
const sectionColors = {
  home: '#ff2d2d',
  about: '#ff2d2d',
  projects: '#ff6b6b',
  skills: '#ff2d2d',
  terminal: '#00ff66',
  contact: '#ff6b6b',
};

function fireArrivalPulse(sectionId) {
  if (!arrivalPulse) return;
  arrivalPulse.classList.remove('active');
  arrivalPulse.style.borderColor = sectionColors[sectionId] || 'var(--accent)';
  // Force reflow
  void arrivalPulse.offsetWidth;
  arrivalPulse.classList.add('active');
  setTimeout(() => arrivalPulse.classList.remove('active'), 900);
}

// ========== WARP TUNNEL ON NAV JUMP ==========
const warpOverlay = document.getElementById('warpOverlay');

function triggerWarp(targetSectionId) {
  // Phase 1: Stars elongate into streaks (warp in)
  warpStrength = WARP_INITIAL_STRENGTH;
  if (warpOverlay) warpOverlay.classList.add('active');

  // Fire glitch burst + HUD breach on every jump
  fireGlitch();
  if (typeof hudBreach === 'function') hudBreach();

  // Flare the nebulas
  document.querySelectorAll('.nebula').forEach(n => {
    n.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    n.style.opacity = '0.35';
    n.style.transform = 'scale(1.15)';
  });

  // Phase 2: Flash and collapse (0.5s later)
  setTimeout(() => {
    if (warpOverlay) {
      warpOverlay.classList.remove('active');
      warpOverlay.classList.add('flash');
      warpOverlay.style.background = `radial-gradient(circle at center, ${sectionColors[targetSectionId] || 'rgba(255,255,255,0.3)'}33 0%, transparent 60%)`;
    }
    // Spawn burst of shooting stars
    for (let i = 0; i < 6; i++) setTimeout(() => spawnShootingStar(), i * 50);
  }, 500);

  // Phase 3: Clear flash, fire arrival pulse
  setTimeout(() => {
    if (warpOverlay) {
      warpOverlay.classList.remove('flash');
      warpOverlay.style.background = '';
    }
    fireArrivalPulse(targetSectionId);

    // Settle nebulas
    document.querySelectorAll('.nebula').forEach(n => {
      n.style.transition = 'opacity 1.5s ease, transform 1.5s ease';
      n.style.opacity = '';
      n.style.transform = '';
    });
  }, 900);
}

// ========== NEBULA BREATHING (sine wave) ==========
let nebulaBreathTime = 0;
const nebulas = document.querySelectorAll('.nebula');

// Nebula breathing handled by CSS animation (removed JS rAF loop for performance)

// ========== SPACE DUST PARTICLES ==========
const spaceDust = document.getElementById('spaceDust');
if (spaceDust) {
  for (let i = 0; i < 15; i++) {
    const p = document.createElement('div'); p.className = 'dust-particle';
    p.style.left = Math.random() * 100 + '%'; p.style.top = Math.random() * 100 + '%';
    p.style.width = (Math.random() * 2 + 1) + 'px'; p.style.height = p.style.width;
    p.style.animationDuration = (Math.random() * 20 + 15) + 's';
    p.style.animationDelay = (Math.random() * 20) + 's';
    p.style.opacity = Math.random() * 0.4 + 0.1;
    spaceDust.appendChild(p);
  }
}

// ========== FLOATING CODE FRAGMENTS ==========
const codeSnippets = ['const life = "code";', 'fn main() {}', 'import * as future', '// TODO: conquer', 'let x = 42;', 'async fn build()', 'git push origin', '<Component />', 'pip install', 'npm run dev'];
const heroSection = document.getElementById('home');
if (heroSection) {
  for (let i = 0; i < 3; i++) {
    const frag = document.createElement('div'); frag.className = 'code-fragment';
    frag.textContent = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
    frag.style.left = (Math.random() * 80 + 10) + '%';
    frag.style.top = (Math.random() * 60 + 20) + '%';
    frag.style.animationDuration = (Math.random() * 15 + 20) + 's';
    frag.style.animationDelay = (Math.random() * 15) + 's';
    heroSection.appendChild(frag);
  }
}

// ========== WARP SPEED ON FAST SCROLL ==========
let lastScrollY = 0, scrollSpeed = 0;
const starfieldCanvas = document.getElementById('starfield');

// ========== UNIFIED SCROLL HANDLER (single listener, throttled via rAF) ==========
const nav = document.getElementById('nav');
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');
const rocketBtn = document.getElementById('rocketBtn');
const scrollIndicator = document.getElementById('scrollIndicator');
let _scrollTicking = false;

window.addEventListener('scroll', () => {
  const currentY = window.scrollY;
  scrollSpeed = Math.abs(currentY - lastScrollY);
  lastScrollY = currentY;

  if (!_scrollTicking) {
    _scrollTicking = true;
    requestAnimationFrame(() => {
      const sy = window.scrollY;

      // Warp speed on fast scroll
      if (scrollSpeed > SCROLL_WARP_THRESHOLD) {
        const stretch = Math.min(1 + scrollSpeed * 0.002, 1.1);
        starfieldCanvas.style.transition = 'none';
        starfieldCanvas.style.transform = `scaleY(${stretch})`;
        starfieldCanvas.style.filter = `blur(${Math.min(scrollSpeed * 0.03, 2)}px) brightness(1.15)`;
        if (scrollSpeed > 60 && Math.random() > 0.6) spawnShootingStar();
      }

      // Nav scroll effect
      nav.classList.toggle('scrolled', sy > 50);
      if (scrollIndicator) scrollIndicator.style.opacity = sy > 100 ? '0' : '1';

      // Current section detection (single loop for nav + HUD)
      let current = 'home';
      sections.forEach(section => { if (sy >= section.offsetTop - 200) current = section.getAttribute('id'); });
      navLinks.forEach(link => link.classList.toggle('active', link.dataset.section === current));
      updateHudSector(current);

      // Rocket button
      rocketBtn.classList.toggle('visible', sy > 500);

      _scrollTicking = false;
    });
  }
}, { passive: true });

// Scroll speed decay (reduced from 10x/sec to 4x/sec)
setInterval(() => {
  if (scrollSpeed < 5) {
    starfieldCanvas.style.transition = 'transform 0.6s ease, filter 0.6s ease';
    starfieldCanvas.style.transform = 'scaleY(1)';
    starfieldCanvas.style.filter = 'none';
  }
  scrollSpeed *= 0.8;
}, SCROLL_DECAY_INTERVAL);
rocketBtn.addEventListener('click', () => {
  rocketBtn.classList.add('launching');
  triggerWarp('home');
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      particles.push({
        x: window.innerWidth - 56 + (Math.random() - 0.5) * 10,
        y: window.innerHeight - 56 + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 3, vy: Math.random() * 3 + 1,
        size: Math.random() * 4 + 1, life: 1, decay: 0.02,
        color: Math.random() > 0.5 ? '255, 165, 0' : '255, 215, 0',
      });
    }, i * 30);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => rocketBtn.classList.remove('launching'), 800);
});

// ========== MOBILE MENU ==========
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
document.querySelectorAll('.mobile-link').forEach(link => { link.addEventListener('click', () => mobileMenu.classList.remove('open')); });

// ========== PROJECT COUNT + STATS ==========
function animateCount(el, target) {
  let current = 0;
  const step = Math.ceil(target / 30);
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); el.classList.add('counted'); }
    el.textContent = current;
  }, 50);
}

// ========== 3D TILT ON PROJECT CARDS (rAF throttled) ==========
let _tiltRAF = null;
function tiltCard(e, card) {
  if (_tiltRAF) return;
  _tiltRAF = requestAnimationFrame(() => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(${CARD_TILT_PERSPECTIVE}px) rotateY(${x * TILT_MAX_DEG}deg) rotateX(${-y * TILT_MAX_DEG}deg) translateY(-4px)`;
    _tiltRAF = null;
  });
}
function resetCard(card) { card.style.transform = ''; }

// Event delegation for project card tilt (replaces inline handlers)
const projectsContainer = document.getElementById('projects');
if (projectsContainer) {
  projectsContainer.addEventListener('mousemove', function(e) {
    // Disable tilt on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const card = e.target.closest('.project-card');
    if (card) tiltCard(e, card);
  }, { passive: true });
  projectsContainer.addEventListener('mouseleave', function(e) {
    const card = e.target.closest('.project-card');
    if (card) resetCard(card);
  }, { passive: true });
  // Also reset when moving between cards
  projectsContainer.addEventListener('mouseout', function(e) {
    const card = e.target.closest('.project-card');
    if (card && !card.contains(e.relatedTarget)) resetCard(card);
  }, { passive: true });
}

// ========== FETCH GITHUB STATS (repos + commits, cached with stale fallback) ==========
async function fetchGitHubStats() {
  const projectEl = document.getElementById('statProjects');
  const commitEl = document.getElementById('statCommits');

  // Helper: load stale cache (any age)
  function loadCache() {
    try { return JSON.parse(localStorage.getItem('ghStats') || '{}'); } catch { return {}; }
  }

  // Use cached data if fresh
  const cached = loadCache();
  if (cached.ts && Date.now() - cached.ts < GITHUB_CACHE_TTL) {
    if (projectEl) animateCount(projectEl, cached.repos);
    if (commitEl) animateCount(commitEl, cached.commits);
    return;
  }

  try {
    const reposRes = await fetch('https://api.github.com/users/ArsenalRX/repos?per_page=100&type=owner');

    // Check rate limit headers
    const remaining = reposRes.headers.get('X-RateLimit-Remaining');
    if (remaining !== null && parseInt(remaining, 10) < 5) {
      // Nearly rate-limited — use stale cache if available
      if (cached.repos) {
        if (projectEl) animateCount(projectEl, cached.repos);
        if (commitEl) animateCount(commitEl, cached.commits);
        return;
      }
    }

    if (!reposRes.ok) throw new Error('HTTP ' + reposRes.status);
    const repos = await reposRes.json();
    if (!Array.isArray(repos)) throw new Error('bad response');

    if (projectEl) animateCount(projectEl, repos.length);

    const counts = await Promise.all(repos.map(async repo => {
      try {
        const r = await fetch(`https://api.github.com/repos/ArsenalRX/${repo.name}/commits?per_page=1`);
        if (!r.ok) return 0;
        const link = r.headers.get('Link');
        if (link) {
          const match = link.match(/page=(\d+)>; rel="last"/);
          if (match) return parseInt(match[1], 10);
        }
        const data = await r.json();
        return Array.isArray(data) ? data.length : 0;
      } catch { return 0; }
    }));
    const total = counts.reduce((s, n) => s + n, 0);
    if (commitEl) animateCount(commitEl, total || 0);

    // Cache results
    try { localStorage.setItem('ghStats', JSON.stringify({ repos: repos.length, commits: total || 0, ts: Date.now() })); } catch {}
  } catch {
    // Fallback: use stale cache, or show "?" with tooltip
    const stale = loadCache();
    if (stale.repos) {
      if (projectEl) animateCount(projectEl, stale.repos);
      if (commitEl) animateCount(commitEl, stale.commits);
    } else {
      if (projectEl) { projectEl.textContent = '?'; projectEl.title = 'GitHub API unavailable'; }
      if (commitEl) { commitEl.textContent = '?'; commitEl.title = 'GitHub API unavailable'; }
    }
  }
}
fetchGitHubStats();

// ========== SKILLS HOVER ==========
const skillDescriptions = {
  'Python': 'Versatile powerhouse for AI, automation, scripting, and backend development.',
  'JavaScript': 'The language of the web — powers interactivity, animations, and full-stack apps.',
  'TypeScript': 'Type-safe JavaScript — catches bugs early and scales to large codebases.',
  'C#': 'Object-oriented language for .NET, desktop apps, game dev, and enterprise software.',
  'C++': 'High-performance systems language — game engines, drivers, and low-level programming.',
  'Rust': 'Memory-safe systems language — fast, reliable, and perfect for native apps.',
  '.NET': 'Microsoft framework for building desktop, web, and enterprise applications.',
  'Node.js': 'JavaScript runtime for building scalable server-side applications.',
  'React': 'Component-based UI library for building fast, dynamic web interfaces.',
  'Docker': 'Containerization platform — package and deploy apps anywhere consistently.',
  'Git & GitHub': 'Version control and collaboration — track changes, manage code, and work with teams.',
  'Linux': 'Open-source OS — servers, development environments, and system administration.',
  'AI & ML': 'Machine learning and artificial intelligence — training models and building smart systems.',
  'Windows': 'Primary development platform — deep knowledge of Windows internals, drivers, and system APIs.',
  'Fedora': 'Red Hat-based Linux distro — development, servers, and containerized workflows.',
};
const centerLabel = document.getElementById('hoveredSkill');
const skillsCenter = document.getElementById('skillsCenter');

const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
let activeSkillCard = null;

// Update label text for touch devices
if (isTouchDevice && centerLabel) {
  centerLabel.innerHTML = 'Tap a skill to learn more';
}

function showSkillInfo(card) {
  const name = card.dataset.skill;
  const desc = skillDescriptions[name] || '';
  centerLabel.innerHTML = `<strong>${name}</strong><br><span style="font-size:0.8rem;font-weight:400;opacity:0.8;">${desc}</span>`;
  const icon = document.getElementById('skillInfoIcon');
  if (icon) icon.textContent = name.charAt(0);
  skillsCenter.classList.add('active');
}

function clearSkillInfo() {
  centerLabel.innerHTML = isTouchDevice ? 'Tap a skill to learn more' : 'Hover a skill to learn more';
  const icon = document.getElementById('skillInfoIcon');
  if (icon) icon.textContent = '?';
  skillsCenter.classList.remove('active');
  activeSkillCard = null;
}

document.querySelectorAll('.skill-card').forEach(card => {
  card.addEventListener('mouseenter', () => showSkillInfo(card));
  card.addEventListener('mouseleave', clearSkillInfo);
  // Touch/click support
  card.addEventListener('click', (e) => {
    e.stopPropagation();
    if (activeSkillCard === card) {
      clearSkillInfo();
    } else {
      activeSkillCard = card;
      showSkillInfo(card);
    }
  });
});

// Tap outside to dismiss on touch
document.addEventListener('click', () => { if (activeSkillCard) clearSkillInfo(); });

// ========== INTERACTIVE TERMINAL ==========
const terminalInput = document.getElementById('terminalInput');
const terminalBody = document.getElementById('terminalBody');
let commandHistory = [];
let historyIndex = -1;

const terminalCommands = {
  help: () => `Available commands:
  <span class="cmd-highlight">about</span>     - Learn about me
  <span class="cmd-highlight">skills</span>    - View my skills
  <span class="cmd-highlight">projects</span>  - See my projects
  <span class="cmd-highlight">contact</span>   - How to reach me
  <span class="cmd-highlight">github</span>    - Open my GitHub
  <span class="cmd-highlight">neofetch</span>  - System info
  <span class="cmd-highlight">ls</span>        - List project files
  <span class="cmd-highlight">whoami</span>    - Who are you?
  <span class="cmd-highlight">date</span>      - Current date
  <span class="cmd-highlight">secret</span>    - ???
  <span class="cmd-highlight">hack</span>      - Hack the mainframe
  <span class="cmd-highlight">clear</span>     - Clear terminal`,

  about: () => `Hi! I'm <span class="cmd-highlight">Evan</span>, aka <span class="cmd-highlight">ArsenalRX</span>.
  I'm a developer who loves building interactive web experiences,
  exploring AI, and turning ideas into reality through code.
  When I'm not coding, I play hockey and ride dirtbikes.`,

  skills: () => `<span class="cmd-highlight">Languages:</span> Python, JavaScript, TypeScript, C#, C++, Rust
  <span class="cmd-highlight">Frameworks:</span> React, .NET, Node.js
  <span class="cmd-highlight">Tools:</span> Docker, Git, Linux, Windows, Fedora
  <span class="cmd-highlight">Interests:</span> AI/ML, Systems Programming, UI/UX`,

  projects: () => { document.querySelector('#projects').scrollIntoView({ behavior: 'smooth' }); return 'Navigating to projects...'; },

  contact: () => `Email: <span class="cmd-highlight">faterivalz@gmail.com</span>
  GitHub: <span class="cmd-highlight">github.com/ArsenalRX</span>`,

  github: () => { window.open('https://github.com/ArsenalRX', '_blank'); return 'Opening GitHub profile...'; },

  neofetch: () => `<span class="cmd-highlight">
       ___      </span>  visitor@arsenalrx
<span class="cmd-highlight">      /   \\     </span>  ─────────────────
<span class="cmd-highlight">     / E.  \\    </span>  <span class="cmd-highlight">OS:</span> Web Browser
<span class="cmd-highlight">    /  ___  \\   </span>  <span class="cmd-highlight">Host:</span> arsenalrx.github.io
<span class="cmd-highlight">   /  /   \\  \\  </span>  <span class="cmd-highlight">Resolution:</span> ${window.innerWidth}x${window.innerHeight}
<span class="cmd-highlight">  /__/     \\__\\ </span>  <span class="cmd-highlight">Theme:</span> Space Dark
                  <span class="cmd-highlight">Terminal:</span> ArsenalRX v1.0
                  <span class="cmd-highlight">Projects:</span> ${document.querySelectorAll('.project-card').length}
                  <span class="cmd-highlight">Uptime:</span> Always online`,

  ls: () => `<span style="color:#58a6ff;">projects/</span>  <span style="color:#58a6ff;">skills/</span>  <span style="color:#58a6ff;">config/</span>
  index.html   style.css    script.js
  README.md    .gitignore   package.json`,

  cat: () => `Usage: cat <filename>
  Try: cat README.md`,

  'cat readme.md': () => `# ArsenalRX Portfolio
  Built with vanilla HTML, CSS, and JavaScript.
  Featuring: starfield, particle trails, and space vibes.
  <span class="cmd-highlight">*</span> Zero frameworks. Pure code.`,

  secret: () => `<span style="color: var(--accent2);">
  ╔══════════════════════════════════╗
  ║  You found the secret!          ║
  ║  Try the Konami Code too ;)     ║
  ║  ↑↑↓↓←→←→BA                    ║
  ╚══════════════════════════════════╝</span>`,

  hack: () => {
    document.body.style.transition = 'filter 0.3s';
    document.body.style.filter = 'hue-rotate(120deg) saturate(2)';
    for (let i = 0; i < 25; i++) setTimeout(() => spawnShootingStar(), i * 80);
    setTimeout(() => { document.body.style.filter = ''; }, 3000);
    return `<span style="color:#00ff00;">
  [*] Accessing mainframe...
  [*] Bypassing firewall.......done
  [*] Decrypting files..........done
  [*] Access granted.
  [!] Just kidding. Nice try though ;)</span>`;
  },

  clear: () => '__CLEAR__',
  date: () => `Current date: <span class="cmd-highlight">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>`,
  whoami: () => `You are a <span class="cmd-highlight">visitor</span> exploring Evan's portfolio. Welcome!`,
};

if (terminalInput) {
  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) { historyIndex++; terminalInput.value = commandHistory[commandHistory.length - 1 - historyIndex]; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) { historyIndex--; terminalInput.value = commandHistory[commandHistory.length - 1 - historyIndex]; }
      else { historyIndex = -1; terminalInput.value = ''; }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const partial = terminalInput.value.trim().toLowerCase();
      const match = Object.keys(terminalCommands).find(cmd => cmd.startsWith(partial) && cmd !== partial);
      if (match) terminalInput.value = match;
    } else if (e.key === 'Enter') {
      const cmd = terminalInput.value.trim().toLowerCase();
      if (!cmd) return;
      commandHistory.push(cmd);
      historyIndex = -1;

      const cmdLine = document.createElement('div');
      cmdLine.className = 'terminal-line';
      cmdLine.innerHTML = `<span class="terminal-prompt">visitor@arsenalrx:~$</span> ${cmd}`;
      terminalBody.appendChild(cmdLine);

      if (terminalCommands[cmd]) {
        const result = terminalCommands[cmd]();
        if (result === '__CLEAR__') { terminalBody.innerHTML = ''; }
        else if (result === null || result === undefined) { /* async command handles own output */ }
        else if (result instanceof Promise) {
          result.then(r => { if (r) { const ol = document.createElement('div'); ol.className = 'terminal-line'; ol.innerHTML = `<span class="terminal-output">${r}</span>`; terminalBody.appendChild(ol); terminalBody.scrollTop = terminalBody.scrollHeight; } });
        }
        else {
          const outputLine = document.createElement('div');
          outputLine.className = 'terminal-line';
          outputLine.innerHTML = `<span class="terminal-output">${result}</span>`;
          terminalBody.appendChild(outputLine);
        }
      } else {
        const errorLine = document.createElement('div');
        errorLine.className = 'terminal-line';
        errorLine.innerHTML = `<span class="terminal-output" style="color: #f85149;">Command not found: ${cmd}. Type <span class="cmd-highlight">help</span> for available commands.</span>`;
        terminalBody.appendChild(errorLine);
      }
      terminalInput.value = '';
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }
  });
}

// ========== TERMINAL AUTO-DEMO MODE ==========
let terminalIdleTimer = null;
let autoDemo = false;
const demoCommands = ['help', 'neofetch', 'skills', 'ls', 'about'];
let demoIndex = 0;

function startAutoDemo() {
  if (autoDemo) return;
  autoDemo = true;
  demoIndex = 0;
  runDemoStep();
}

function runDemoStep() {
  if (!autoDemo || demoIndex >= demoCommands.length) { autoDemo = false; return; }
  const cmd = demoCommands[demoIndex];
  let i = 0;
  terminalInput.value = '';
  const typeInterval = setInterval(() => {
    terminalInput.value += cmd[i]; i++;
    if (i >= cmd.length) {
      clearInterval(typeInterval);
      setTimeout(() => {
        terminalInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        demoIndex++;
        setTimeout(() => runDemoStep(), TERMINAL_DEMO_STEP_DELAY);
      }, 500);
    }
  }, TERMINAL_DEMO_TYPE_SPEED);
}

function resetIdleTimer() {
  if (autoDemo) { autoDemo = false; }
  clearTimeout(terminalIdleTimer);
  terminalIdleTimer = setTimeout(startAutoDemo, TERMINAL_IDLE_TIMEOUT);
}

const terminalSection = document.getElementById('terminal');
const terminalObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) resetIdleTimer();
    else { clearTimeout(terminalIdleTimer); autoDemo = false; }
  });
}, { threshold: 0.3 });
if (terminalSection) terminalObserver.observe(terminalSection);
if (terminalInput) {
  terminalInput.addEventListener('focus', () => { autoDemo = false; clearTimeout(terminalIdleTimer); });
  terminalInput.addEventListener('blur', resetIdleTimer);
}

// ========== TILT EFFECT ON ABOUT CARD ==========
const glassCard = document.querySelector('.card-glass');
if (glassCard) {
  glassCard.addEventListener('mousemove', e => {
    const rect = glassCard.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    glassCard.style.transform = `rotateY(${x * 15}deg) rotateX(${-y * 15}deg)`;
  });
  glassCard.addEventListener('mouseleave', () => { glassCard.style.transform = ''; });
}

// ========== FOOTER ==========
document.getElementById('currentYear').textContent = new Date().getFullYear();

const footerContent = document.getElementById('footerContent');
const footerSecret = document.getElementById('footerSecret');
if (footerContent && footerSecret) {
  let footerClicks = 0;
  footerContent.addEventListener('click', () => {
    footerClicks++;
    if (footerClicks >= 3) { footerSecret.classList.add('show'); footerClicks = 0; }
  });
}

// ========== SMOOTH SCROLL WITH WARP TUNNEL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const href = this.getAttribute('href');
    const target = document.querySelector(href);
    if (target) {
      const sectionId = href.replace('#', '');
      triggerWarp(sectionId);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Arrival pulse only fires on nav click jumps (via triggerWarp), not on scroll

// ========== KONAMI CODE EASTER EGG ==========
const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
let konamiIndex = 0;

document.addEventListener('keydown', e => {
  if (e.keyCode === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) { konamiIndex = 0; activateEasterEgg(); }
  } else { konamiIndex = 0; }
});

function activateEasterEgg() {
  document.body.style.transition = 'filter 0.5s ease';
  document.body.style.filter = 'hue-rotate(180deg)';
  setTimeout(() => { document.body.style.filter = 'hue-rotate(360deg)'; setTimeout(() => { document.body.style.filter = ''; }, 500); }, 2000);
  for (let i = 0; i < 25; i++) setTimeout(() => spawnShootingStar(), i * 80);
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 300,
      y: window.innerHeight / 2 + (Math.random() - 0.5) * 300,
      vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
      size: Math.random() * 5 + 2, life: 1, decay: Math.random() * 0.01 + 0.005,
      color: ['255, 45, 45', '255, 107, 107', '255, 215, 0', '0, 255, 100'][Math.floor(Math.random() * 4)],
    });
  }
}

// ========== CODE RAIN (sparse matrix-style) ==========
let codeRainStarted = false;
const codeRainCanvas = document.getElementById('codeRain');
const crCtx = codeRainCanvas ? codeRainCanvas.getContext('2d') : null;
const codeChars = 'アイウエオカキクケコ0123456789ABCDEF{}[]<>/\\;:=+*&^%$#@!ffffffff0xDEAD';
let codeColumns = [];

function resizeCodeRain() {
  if (!codeRainCanvas) return;
  codeRainCanvas.width = window.innerWidth;
  codeRainCanvas.height = window.innerHeight;
  const colW = 20;
  const numCols = Math.floor(codeRainCanvas.width / colW);
  codeColumns = [];
  // Sparse — only ~8% of columns are active
  for (let i = 0; i < numCols; i++) {
    if (Math.random() > (1 - CODE_RAIN_ACTIVE_CHANCE)) {
      codeColumns.push({
        x: i * colW,
        y: Math.random() * codeRainCanvas.height,
        speed: Math.random() * 0.8 + 0.3,
        chars: [],
        maxChars: Math.floor(Math.random() * 8 + 4),
        timer: 0,
        spawnRate: Math.random() * 3 + 2,
      });
    }
  }
}
resizeCodeRain();
window.addEventListener('resize', resizeCodeRain);

let lastCodeRainTime = 0;
function drawCodeRain(timestamp) {
  if (!crCtx) { requestAnimationFrame(drawCodeRain); return; }
  // Don't draw until scrolled past hero
  if (!codeRainStarted) { requestAnimationFrame(drawCodeRain); return; }
  // Throttle to ~30fps
  if (timestamp - lastCodeRainTime < CODE_RAIN_FRAME_MS) { requestAnimationFrame(drawCodeRain); return; }
  lastCodeRainTime = timestamp;
  crCtx.clearRect(0, 0, codeRainCanvas.width, codeRainCanvas.height);

  codeColumns.forEach(col => {
    col.timer += 0.016;
    // Spawn new char
    if (col.timer > col.spawnRate) {
      col.timer = 0;
      col.chars.push({
        char: codeChars[Math.floor(Math.random() * codeChars.length)],
        y: col.y,
        opacity: 0.6 + Math.random() * 0.3,
        life: 1,
      });
      col.y += 16;
      if (col.y > codeRainCanvas.height + 50) col.y = -20;
      if (col.chars.length > col.maxChars) col.chars.shift();
    }

    // Draw chars
    col.chars.forEach((c, ci) => {
      c.life -= 0.003;
      if (c.life <= 0) return;
      const isHead = ci === col.chars.length - 1;
      const alpha = c.life * c.opacity * 0.15;
      crCtx.font = '13px "Space Mono", monospace';
      crCtx.fillStyle = isHead
        ? `rgba(255, 60, 60, ${alpha * 2.5})`
        : `rgba(180, 20, 20, ${alpha})`;
      crCtx.fillText(c.char, col.x, c.y);
    });

    col.chars = col.chars.filter(c => c.life > 0);
  });

  requestAnimationFrame(drawCodeRain);
}
drawCodeRain();

// ========== GLITCH BURSTS ==========
const glitchOverlay = document.getElementById('glitchOverlay');

function fireGlitch() {
  if (!glitchOverlay) return;
  glitchOverlay.classList.remove('active');
  void glitchOverlay.offsetWidth;
  glitchOverlay.classList.add('active');
  setTimeout(() => glitchOverlay.classList.remove('active'), 350);
}

// Random glitch bursts — occasional (reduced frequency)
setInterval(() => {
  if (Math.random() > GLITCH_BURST_CHANCE) fireGlitch();
}, GLITCH_BURST_INTERVAL);

// ========== CORNER HUD READOUTS ==========
const hudSys = document.getElementById('hudSys');
const hudSignal = document.getElementById('hudSignal');
const hudStatus = document.getElementById('hudStatus');
const hudSector = document.getElementById('hudSector');
const hudAddr = document.getElementById('hudAddr');
const hudReadouts = document.querySelectorAll('.hud-readout');

const sectorNames = {
  home: 'HOME', about: 'IDENT', projects: 'OPS',
  skills: 'ARSENAL', terminal: 'CLI', contact: 'COMMS'
};
const sectorAddrs = {
  home: '0xFF01', about: '0xAB02', projects: '0xC303',
  skills: '0xD404', terminal: '0xE505', contact: '0xF606'
};

// Cycle hex codes
function randomHex() {
  return '0x' + Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

// Flicker the HUD values (reduced frequency for performance)
setInterval(() => {
  if (hudSys && Math.random() > 0.7) {
    hudSys.textContent = randomHex();
    hudSys.style.opacity = '0.5';
    setTimeout(() => { hudSys.style.opacity = '1'; }, 100);
  }
  if (hudAddr && Math.random() > 0.8) {
    const origAddr = hudAddr.textContent;
    hudAddr.textContent = randomHex();
    setTimeout(() => { hudAddr.textContent = origAddr; }, 150);
  }
  // Signal bars flicker
  if (hudSignal && Math.random() > 0.85) {
    const bars = Math.floor(Math.random() * 4) + 1;
    hudSignal.textContent = '|'.repeat(bars) + ' '.repeat(4 - bars);
    setTimeout(() => { hudSignal.textContent = '||||'; }, 200);
  }
}, HUD_FLICKER_INTERVAL);

// Update HUD sector on scroll
let currentHudSector = 'home';
function updateHudSector(sectionId) {
  if (sectionId === currentHudSector) return;
  currentHudSector = sectionId;
  if (hudSector) hudSector.textContent = sectorNames[sectionId] || sectionId.toUpperCase();
  if (hudAddr) hudAddr.textContent = sectorAddrs[sectionId] || randomHex();
}


// BREACH mode on warp jump
function hudBreach() {
  hudReadouts.forEach(h => h.classList.add('breach'));
  if (hudStatus) hudStatus.textContent = 'BREACH';
  // Quick flicker of all values
  if (hudSys) hudSys.textContent = randomHex();
  if (hudSignal) hudSignal.textContent = '||| ';
  setTimeout(() => {
    hudReadouts.forEach(h => h.classList.remove('breach'));
    if (hudStatus) hudStatus.textContent = 'NOMINAL';
    if (hudSignal) hudSignal.textContent = '||||';
  }, 1500);
}

// ========== PERFORMANCE MODE ==========
if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
  document.querySelectorAll('.nebula').forEach(n => n.style.display = 'none');
  document.querySelectorAll('.space-rock').forEach(r => r.style.display = 'none');
  document.querySelectorAll('.dust-particle').forEach(p => p.style.display = 'none');
  if (codeRainCanvas) codeRainCanvas.style.display = 'none';
}

// ========== BACKGROUND MUSIC (invisible, auto-play) ==========
const siteMusic = {
  audio: null,
  started: false,
  muted: false,
  volume: 0.3,

  init() {
    this.audio = new Audio('music/snowfall.mp3');
    this.audio.loop = true;
    this.audio.preload = 'auto';
    this.audio.volume = this.volume;

    const musicBtn = document.getElementById('musicToggle');
    const iconOn = musicBtn?.querySelector('.music-icon-on');
    const iconOff = musicBtn?.querySelector('.music-icon-off');

    // Show muted state initially (autoplay likely blocked)
    if (musicBtn) { musicBtn.classList.add('muted'); }
    if (iconOn) iconOn.style.display = 'none';
    if (iconOff) iconOff.style.display = '';

    const onFirstPlay = () => {
      this.started = true;
      this.muted = false;
      if (musicBtn) musicBtn.classList.remove('muted');
      if (iconOn) iconOn.style.display = '';
      if (iconOff) iconOff.style.display = 'none';
      // Show "Now playing" toast
      this.showNowPlaying();
    };

    // Try autoplay immediately
    this.audio.play().then(onFirstPlay).catch(() => {});

    // Keep retrying on user interaction until it works
    const tryPlay = () => {
      if (this.started || this.muted) return;
      this.audio.play().then(() => {
        onFirstPlay();
        events.forEach(evt => document.removeEventListener(evt, tryPlay, true));
      }).catch(() => {});
    };
    const events = ['click', 'keydown', 'scroll', 'touchstart', 'mousemove', 'mousedown', 'pointerdown'];
    events.forEach(evt => document.addEventListener(evt, tryPlay, true));

    // Toggle button
    if (musicBtn) {
      musicBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });
    }
  },

  toggle() {
    const musicBtn = document.getElementById('musicToggle');
    const iconOn = musicBtn?.querySelector('.music-icon-on');
    const iconOff = musicBtn?.querySelector('.music-icon-off');

    if (this.muted) {
      this.muted = false;
      this.audio.volume = this.volume;
      this.audio.play().catch(() => {});
      this.started = true;
      if (musicBtn) musicBtn.classList.remove('muted');
      if (iconOn) iconOn.style.display = '';
      if (iconOff) iconOff.style.display = 'none';
    } else {
      this.muted = true;
      this.audio.volume = 0;
      if (musicBtn) musicBtn.classList.add('muted');
      if (iconOn) iconOn.style.display = 'none';
      if (iconOff) iconOff.style.display = '';
    }
  },

  showNowPlaying() {
    const toast = document.createElement('div');
    toast.className = 'now-playing-toast';
    toast.textContent = '♪ Now playing: Snowfall';
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('visible'));
    });
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  },

  mute() { if (this.audio) { this.audio.volume = 0; this.muted = true; } },
  unmute() { if (this.audio) { this.audio.volume = this.volume; this.muted = false; } },
};

siteMusic.init();

// ========== CONTACT FORM HANDLING ==========
const contactForm = document.getElementById('contactForm');
const transmissionSent = document.getElementById('transmissionSent');
if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    try {
      await fetch(this.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      });
      contactForm.style.display = 'none';
      contactForm.previousElementSibling.style.display = 'none'; // hide text
      if (transmissionSent) transmissionSent.classList.add('show');
    } catch(err) {
      // Fallback: just show success anyway (Formspree handles it)
      contactForm.style.display = 'none';
      if (transmissionSent) transmissionSent.classList.add('show');
    }
  });
}

// ========== PROJECT MODALS ==========
const projectDetails = {
  'Nexus': {
    desc: 'A local abliterated 9B AI model with machine learning features built specifically for anti-cheat development and detection.',
    details: '<h4>Technical Breakdown</h4><p>Uses a fine-tuned 9B parameter model running locally for real-time analysis of game memory patterns. The ML pipeline handles feature extraction from process behavior, memory allocation patterns, and API call sequences to identify cheat signatures.</p>',
  },
  'Lightkeeper': {
    desc: 'A USCG ATON workplan tool — downloads Light List data, provides interactive maps across all 9 districts, and generates optimized multi-day trip workplans with route planning.',
    details: '<h4>Technical Breakdown</h4><p>Built with Python backend and Electron frontend. Parses USCG Light List data, renders interactive Leaflet maps, and uses optimization algorithms to generate efficient multi-day route plans. Handles offline-first data with SQLite storage.</p>',
    link: 'https://github.com/ArsenalRX/lightkeeper-releases/releases/tag/v0.8.9.3',
  },
  'Imperium': {
    desc: 'A Windows hardware identity spoofer with a modern WPF interface and kernel-mode driver. Randomizes hardware fingerprints to make your PC appear as a different machine.',
    details: '<h4>Technical Breakdown</h4><p>Combines a WPF desktop app with a kernel-mode driver written in C++. The driver intercepts hardware ID queries at the kernel level, while the C# frontend provides a clean interface for managing spoofed identities and profiles.</p>',
  },
  'The Codex': {
    desc: 'A native D&D 5e character tracker with full ruleset support, 2,000+ article encyclopedia, real-time multiplayer sessions, and Player/DM modes.',
    details: '<h4>Technical Breakdown</h4><p>Built with React and Tauri 2 (Rust). Features a local SQLite database with 2,000+ SRD articles, WebSocket-based real-time multiplayer, and full offline support. No account required — all data stays on your machine.</p>',
    link: 'https://github.com/nisakson2000/dnd-tracker/releases/tag/v0.8.6',
  },
  'Ghosted': {
    desc: 'An app to track your personal data across 100s of data broker sites and remove it.',
    details: '<h4>Technical Breakdown</h4><p>Rust-powered backend with JavaScript frontend. Crawls and monitors data broker sites for your personal information, then automates opt-out requests. Currently awaiting a major update for new broker APIs.</p>',
    link: 'https://github.com/ArsenalRX/Ghosted',
  },
  'VoxMorph': {
    desc: 'Real-time AI voice translator that converts your speech into another language using a synthetic voice.',
    details: '<h4>Technical Breakdown</h4><p>Uses speech recognition, neural machine translation, and text-to-speech synthesis in a Python pipeline. Supports 15+ languages with low-latency processing. Built as a Jupyter notebook for easy experimentation and deployment.</p>',
    link: 'https://github.com/ArsenalRX/voxmorph',
  },
};

const projectModal = document.getElementById('projectModal');
const modalClose = document.getElementById('modalClose');

document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', function(e) {
    // Don't intercept link cards' default link behavior
    if (this.classList.contains('project-card-link') && e.target.closest('a')) return;
    e.preventDefault();
    e.stopPropagation();
    const name = this.querySelector('.project-name')?.textContent;
    const detail = projectDetails[name];
    if (!detail || !projectModal) return;

    document.getElementById('modalTitle').textContent = name;
    document.getElementById('modalDesc').textContent = detail.desc;
    document.getElementById('modalDetails').innerHTML = detail.details || '';

    // Copy badges and tags
    const badges = this.querySelector('.project-badges');
    const tags = this.querySelector('.project-tags');
    document.getElementById('modalBadges').innerHTML = badges ? badges.innerHTML : '';
    document.getElementById('modalTags').innerHTML = tags ? tags.innerHTML : '';

    // Link row
    const linkRow = document.getElementById('modalLinkRow');
    linkRow.innerHTML = '';
    if (detail.link) {
      linkRow.innerHTML = `<a href="${detail.link}" target="_blank" class="btn btn-ghost" style="font-size:0.8rem;padding:8px 16px;">View Project <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg></a>`;
    }

    projectModal.classList.add('open');
  });
});

if (modalClose) modalClose.addEventListener('click', () => projectModal.classList.remove('open'));
if (projectModal) projectModal.addEventListener('click', (e) => { if (e.target === projectModal) projectModal.classList.remove('open'); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && projectModal?.classList.contains('open')) projectModal.classList.remove('open'); });

// ========== NEW TERMINAL COMMANDS ==========
// Music command
terminalCommands.music = () => {
  siteMusic.toggle();
  return siteMusic.muted
    ? `<span style="color:#f85149;">♪ Music: MUTED</span>`
    : `<span style="color:#00ff66;">♪ Music: ON</span> — Now playing: <span class="cmd-highlight">Snowfall</span>`;
};

// Theme command
let themeActive = false;
terminalCommands.theme = () => {
  if (themeActive) return 'Theme is already shifting...';
  themeActive = true;
  const hues = [120, 200, 280, 60, 0];
  let idx = 0;
  document.body.style.transition = 'filter 0.5s ease';
  const cycle = setInterval(() => {
    document.body.style.filter = `hue-rotate(${hues[idx]}deg)`;
    idx++;
    if (idx >= hues.length) {
      clearInterval(cycle);
      setTimeout(() => { document.body.style.filter = ''; themeActive = false; }, 1000);
    }
  }, 800);
  return `<span style="color:#00ff66;">[*] Cycling color schemes...</span> Returning to default in ${hues.length + 1} seconds.`;
};

// Matrix command
terminalCommands.matrix = () => {
  const matrixCanvas = document.createElement('canvas');
  matrixCanvas.className = 'matrix-flood';
  matrixCanvas.width = window.innerWidth;
  matrixCanvas.height = window.innerHeight;
  document.body.appendChild(matrixCanvas);
  const mCtx = matrixCanvas.getContext('2d');
  const cols = Math.floor(matrixCanvas.width / 16);
  const drops = Array(cols).fill(0);
  const matrixChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
  let frames = 0;
  const maxFrames = 150; // ~5 seconds at 30fps

  function drawMatrix() {
    mCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    mCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    mCtx.fillStyle = '#0f0';
    mCtx.font = '14px "Space Mono", monospace';
    for (let i = 0; i < drops.length; i++) {
      const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
      mCtx.fillStyle = Math.random() > 0.95 ? '#fff' : `rgba(0, 255, 0, ${0.5 + Math.random() * 0.5})`;
      mCtx.fillText(char, i * 16, drops[i] * 16);
      if (drops[i] * 16 > matrixCanvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
    frames++;
    if (frames < maxFrames) {
      requestAnimationFrame(drawMatrix);
    } else {
      matrixCanvas.style.transition = 'opacity 0.5s';
      matrixCanvas.style.opacity = '0';
      setTimeout(() => matrixCanvas.remove(), 500);
    }
  }
  drawMatrix();
  return `<span style="color:#00ff00;">[*] Entering the Matrix...</span> Wake up, Neo.`;
};

// Weather command
terminalCommands.weather = async () => {
  const loadingLine = document.createElement('div');
  loadingLine.className = 'terminal-line';
  loadingLine.innerHTML = '<span class="terminal-output" style="color:#ffb432;">Fetching weather data...</span>';
  terminalBody.appendChild(loadingLine);
  terminalBody.scrollTop = terminalBody.scrollHeight;

  try {
    // Use free wttr.in API
    const res = await fetch('https://wttr.in/?format=%l:+%C+%t+%w+%h');
    const text = await res.text();
    loadingLine.innerHTML = `<span class="terminal-output"><span class="cmd-highlight">Weather Report:</span> ${text.trim()}</span>`;
  } catch {
    loadingLine.innerHTML = '<span class="terminal-output" style="color:#f85149;">Failed to fetch weather data. Try again later.</span>';
  }
  terminalBody.scrollTop = terminalBody.scrollHeight;
  return null;
};

// Easter egg #1
let bloopinActive = false;
let bloopinOverlay = null;
let bloopinInterval = null;
let bloopinAudio = null;

// Obfuscated command registration
terminalCommands[atob('Ymxvb3Bpbg==')] = () => {
  if (bloopinActive) return '<span style="color:#00ff00;">BLOOPIN IS ALREADY HAPPENING</span>';
  bloopinActive = true;
  siteMusic.mute();

  // Create overlay
  bloopinOverlay = document.createElement('div');
  bloopinOverlay.className = 'bloopin-overlay';

  const img1 = document.createElement('img');
  img1.src = 'bloopin1.png';
  img1.id = 'bloopImg1';
  const img2 = document.createElement('img');
  img2.src = 'bloopin2.png';
  img2.id = 'bloopImg2';
  img2.style.opacity = '0';

  const hint = document.createElement('div');
  hint.className = 'bloopin-text';
  hint.textContent = 'press ESC to end the madness';

  bloopinOverlay.appendChild(img1);
  bloopinOverlay.appendChild(img2);
  bloopinOverlay.appendChild(hint);
  document.body.appendChild(bloopinOverlay);

  // Play local mp3
  bloopinAudio = new Audio('music/bloopin.mp3');
  bloopinAudio.volume = 0.4;
  bloopinAudio.loop = true;
  bloopinAudio.play().catch(() => {});

  // Beat cycle — swap images and pulse
  let showFirst = true;
  const bpm = 130;
  const beatMs = 60000 / bpm;

  bloopinInterval = setInterval(() => {
    if (!bloopinActive) return;
    showFirst = !showFirst;
    img1.style.opacity = showFirst ? '1' : '0';
    img2.style.opacity = showFirst ? '0' : '1';

    const activeImg = showFirst ? img1 : img2;
    activeImg.classList.remove('pulse');
    void activeImg.offsetWidth;
    activeImg.classList.add('pulse');

    bloopinOverlay.classList.remove('beat');
    void bloopinOverlay.offsetWidth;
    bloopinOverlay.classList.add('beat');

    const rot = (Math.random() - 0.5) * 20;
    const scale = 0.9 + Math.random() * 0.3;
    activeImg.style.transform = `rotate(${rot}deg) scale(${scale})`;
  }, beatMs);

  return `<span style="color:#00ff00;">
  ╔═══════════════════════════════╗
  ║   🐱 B L O O P I N 🐱        ║
  ║   press ESC to escape       ║
  ╚═══════════════════════════════╝</span>`;
};


// Easter egg #2
let liminalActive = false;
let liminalOverlay = null;
let liminalAudio = null;
let liminalSlideInterval = null;
let liminalGlitchInterval = null;

const liminalImages = [
  'liminal1.jpg',
  'liminal2.jpg',
  'liminal3.jpg',
  'liminal4.jpg',
];

const liminalTexts = [
  { text: 'Do you remember this place?', size: '2rem', x: '15%', y: '20%' },
  { text: 'You\'ve been here before.', size: '1.4rem', x: '55%', y: '35%' },
  { text: 'The exit is behind you.', size: '1.1rem', x: '25%', y: '70%' },
  { text: 'It\'s 3:47 AM', size: '1.8rem', x: '65%', y: '60%' },
  { text: 'Nobody is coming.', size: '1rem', x: '40%', y: '85%' },
  { text: 'This isn\'t real.', size: '1.6rem', x: '10%', y: '50%' },
  { text: 'You never left.', size: '1.3rem', x: '70%', y: '15%' },
  { text: 'The lights are humming.', size: '0.9rem', x: '50%', y: '45%' },
];

terminalCommands[atob('bGltaW5hbA==')] = () => {
  if (liminalActive) return '<span style="color:#c4b277;">You\'re already here.</span>';
  liminalActive = true;

  // Mute site music if playing
  siteMusic.mute();

  // Create overlay
  liminalOverlay = document.createElement('div');
  liminalOverlay.className = 'liminal-overlay';

  // Add images as slides
  liminalImages.forEach((src, i) => {
    const img = document.createElement('img');
    img.className = 'liminal-slide' + (i === 0 ? ' active' : '');
    img.src = src;
    img.loading = 'eager';
    liminalOverlay.appendChild(img);
  });

  // VHS tracking line
  const vhs = document.createElement('div');
  vhs.className = 'liminal-vhs-track';
  liminalOverlay.appendChild(vhs);

  // Grain
  const grain = document.createElement('div');
  grain.className = 'liminal-grain';
  liminalOverlay.appendChild(grain);

  // Fluorescent hum bar
  const hum = document.createElement('div');
  hum.className = 'liminal-hum';
  liminalOverlay.appendChild(hum);

  // Glitch frame
  const glitchFrame = document.createElement('div');
  glitchFrame.className = 'liminal-glitch-frame';
  liminalOverlay.appendChild(glitchFrame);

  // Dreamcore floating text
  liminalTexts.forEach((t, i) => {
    const el = document.createElement('div');
    el.className = 'liminal-text';
    el.textContent = t.text;
    el.style.cssText = `font-size:${t.size}; left:${t.x}; top:${t.y}; animation-delay:${i * -1.2}s;`;
    liminalOverlay.appendChild(el);
  });

  // Timestamp
  const ts = document.createElement('div');
  ts.className = 'liminal-timestamp';
  ts.textContent = 'REC ● 03:47 AM — 2009/07/14';
  liminalOverlay.appendChild(ts);

  // Hint
  const hint = document.createElement('div');
  hint.className = 'liminal-hint';
  hint.textContent = 'press ESC to wake up';
  liminalOverlay.appendChild(hint);

  document.body.appendChild(liminalOverlay);

  // Play audio
  liminalAudio = new Audio('music/liminal.mp3');
  liminalAudio.volume = 0.25;
  liminalAudio.loop = true;
  liminalAudio.play().catch(() => {});

  // Slideshow — slow crossfade between images
  let currentSlide = 0;
  const slides = liminalOverlay.querySelectorAll('.liminal-slide');
  liminalSlideInterval = setInterval(() => {
    if (!liminalActive) return;
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }, 6000);

  // Random glitch flashes
  liminalGlitchInterval = setInterval(() => {
    if (!liminalActive) return;
    if (Math.random() > 0.6) {
      glitchFrame.classList.remove('flash');
      void glitchFrame.offsetWidth;
      glitchFrame.classList.add('flash');
    }
  }, 4000);

  return `<span style="color:#c4b277; font-family: 'Times New Roman', serif;">
  . . . . . . . . . . . . . . . . .

      You noclipped out of reality.

      The fluorescent lights are humming.
      The shelves are empty.
      You've been here before.

      press ESC to wake up

  . . . . . . . . . . . . . . . . .</span>`;
};

// Escape key to exit easter eggs
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && (bloopinActive || liminalActive)) {
    terminalCommands.stop();
  }
});
// Double-tap to exit easter eggs on mobile
let lastTapTime = 0;
document.addEventListener('touchend', () => {
  if (!bloopinActive && !liminalActive) return;
  const now = Date.now();
  if (now - lastTapTime < 400) {
    terminalCommands.stop();
    lastTapTime = 0;
  } else {
    lastTapTime = now;
  }
});

// Update stop command to handle easter eggs
const _originalStop = terminalCommands.stop;
terminalCommands.stop = () => {
  // Handle egg #2
  if (liminalActive) {
    liminalActive = false;
    if (liminalSlideInterval) { clearInterval(liminalSlideInterval); liminalSlideInterval = null; }
    if (liminalGlitchInterval) { clearInterval(liminalGlitchInterval); liminalGlitchInterval = null; }
    if (liminalOverlay) {
      liminalOverlay.style.transition = 'opacity 1.5s ease';
      liminalOverlay.style.opacity = '0';
      setTimeout(() => { if (liminalOverlay) { liminalOverlay.remove(); liminalOverlay = null; } }, 1500);
    }
    if (liminalAudio) {
      // Fade out audio
      const fadeOut = setInterval(() => {
        if (liminalAudio && liminalAudio.volume > 0.02) {
          liminalAudio.volume = Math.max(0, liminalAudio.volume - 0.03);
        } else {
          if (liminalAudio) { liminalAudio.pause(); liminalAudio = null; }
          clearInterval(fadeOut);
        }
      }, 50);
    }
    if (!siteMusic.muted) siteMusic.unmute();
    return '<span style="color:#c4b277; font-family: \'Times New Roman\', serif;">You wake up. Was it real?</span>';
  }
  // Handle egg #1
  if (bloopinActive) {
    bloopinActive = false;
    if (bloopinInterval) { clearInterval(bloopinInterval); bloopinInterval = null; }
    if (bloopinOverlay) { bloopinOverlay.remove(); bloopinOverlay = null; }
    if (bloopinAudio) { bloopinAudio.pause(); bloopinAudio = null; }
    if (!siteMusic.muted) siteMusic.unmute();
    return '<span style="color:#f85149;">Bloopin stopped. You survived.</span>';
  }
  return 'Nothing to stop.';
};

// Trail command
let trailMode = 0;
const trailModes = [
  { name: 'Crimson (default)', colors: ['255, 45, 45', '255, 107, 107'] },
  { name: 'Cyber Blue', colors: ['0, 180, 255', '0, 230, 255'] },
  { name: 'Toxic Green', colors: ['0, 255, 100', '100, 255, 0'] },
  { name: 'Gold', colors: ['255, 200, 0', '255, 165, 0'] },
  { name: 'Purple Haze', colors: ['180, 0, 255', '255, 0, 200'] },
];
terminalCommands.trail = () => {
  trailMode = (trailMode + 1) % trailModes.length;
  return `Cursor trail: <span class="cmd-highlight">${trailModes[trailMode].name}</span>`;
};


// Update help to include new commands
terminalCommands.help = () => `Available commands:
  <span class="cmd-highlight">about</span>     - Learn about me
  <span class="cmd-highlight">skills</span>    - View my skills
  <span class="cmd-highlight">projects</span>  - See my projects
  <span class="cmd-highlight">contact</span>   - How to reach me
  <span class="cmd-highlight">github</span>    - Open my GitHub
  <span class="cmd-highlight">neofetch</span>  - System info
  <span class="cmd-highlight">ls</span>        - List project files
  <span class="cmd-highlight">whoami</span>    - Who are you?
  <span class="cmd-highlight">date</span>      - Current date
  <span class="cmd-highlight">music</span>     - Toggle music on/off
  <span class="cmd-highlight">theme</span>     - Cycle color schemes
  <span class="cmd-highlight">matrix</span>    - Enter the Matrix
  <span class="cmd-highlight">weather</span>   - Current weather
  <span class="cmd-highlight">trail</span>     - Change cursor trail color
  <span class="cmd-highlight">secret</span>    - ???
  <span class="cmd-highlight">hack</span>      - Hack the mainframe
  <span class="cmd-highlight">clear</span>     - Clear terminal`;

// Handle async commands (weather returns null, output already added)
const _origKeydown = terminalInput ? terminalInput.onkeydown : null;

// ========== HIDDEN HINT ==========
function setupSecretHint() {
  const terminalTitle = document.querySelector('#terminal .section-title .title-text');
  if (!terminalTitle) return;
  // Wait for title assembly to finish, then find the 'l' characters
  const checkChars = setInterval(() => {
    const chars = terminalTitle.querySelectorAll('.title-char');
    if (chars.length === 0) return;
    clearInterval(checkChars);
    // "Interactive Terminal" — find the last 'l' (the ending of "Terminal")
    // Actually find all chars and look for specific letters
    chars.forEach(charEl => {
      const letter = charEl.textContent.toLowerCase();
      // The 'r' in Terminal (not Interactive) — it's around index 14
      // "Interactive Terminal" = I(0) n(1) t(2) e(3) r(4) a(5) c(6) t(7) i(8) v(9) e(10) (11) T(12) e(13) r(14) m(15) i(16) n(17) a(18) l(19)
      const idx = Array.from(chars).indexOf(charEl);
      if (idx === 14 && letter === 'r') {
        charEl.style.cursor = 'pointer';
        charEl.addEventListener('click', () => {
          // Show secret commands in terminal
          const secretLine = document.createElement('div');
          secretLine.className = 'terminal-line';
          const _s1 = atob('Ymxvb3Bpbg=='), _s2 = atob('bGltaW5hbA==');
          secretLine.innerHTML = `<span class="terminal-output" style="color: var(--accent2);">
  ╔═══════════════════════════════════╗
  ║  SECRET COMMANDS UNLOCKED        ║
  ╠═══════════════════════════════════╣
  ║  <span class="cmd-highlight">${_s1}</span>  — 🐱 alien cat madness   ║
  ║  <span class="cmd-highlight">${_s2}</span>  — noclip out of reality  ║
  ║  <span class="cmd-highlight">ESC</span>      — end the madness        ║
  ╚═══════════════════════════════════╝</span>`;
          terminalBody.appendChild(secretLine);
          terminalBody.scrollTop = terminalBody.scrollHeight;

          // Scroll to terminal
          document.querySelector('#terminal').scrollIntoView({ behavior: 'smooth' });

          // Brief glow on the R
          charEl.style.color = 'var(--accent)';
          charEl.style.textShadow = '0 0 10px var(--accent-glow)';
          setTimeout(() => { charEl.style.color = ''; charEl.style.textShadow = ''; }, 1500);
        });
      }
    });
  }, 500);
}
setupSecretHint();

// ========== SESSION COUNTER ==========
function trackSession() {
  const hudSessions = document.getElementById('hudVisitors');
  if (!hudSessions) return;
  try {
    // Only count once per browser session
    if (!sessionStorage.getItem('arsenalrx-session-counted')) {
      let count = parseInt(localStorage.getItem('arsenalrx-sessions') || '0');
      count++;
      localStorage.setItem('arsenalrx-sessions', count.toString());
      sessionStorage.setItem('arsenalrx-session-counted', '1');
    }
    const count = parseInt(localStorage.getItem('arsenalrx-sessions') || '0');
    hudSessions.textContent = count.toLocaleString();
  } catch {
    hudSessions.textContent = '---';
  }
}
trackSession();

// ========== LAZY LOAD CODE RAIN ==========
// Code rain only starts when scrolled past hero
const codeRainObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !codeRainStarted) {
      codeRainStarted = true;
      // Code rain is already running, this is just a marker
    }
  });
}, { threshold: 0 });
const aboutSection = document.getElementById('about');
if (aboutSection) codeRainObserver.observe(aboutSection);

// ╔══════════════════════════════════════════════════════════════╗
// ║  FEATURE 1: CLIPBOARD INTERCEPTOR                           ║
// ╚══════════════════════════════════════════════════════════════╝
(function() {
  const toast = document.getElementById('clipboardToast');
  document.addEventListener('copy', function(e) {
    if (sessionStorage.getItem('clipIntercepted')) return;
    sessionStorage.setItem('clipIntercepted', '1');
    const sel = window.getSelection().toString();
    e.clipboardData.setData('text/plain', sel + '\n/* intercepted by arsenalrx -- you didn\'t think I\'d notice, did you? */');
    e.preventDefault();
    // Flash HUD
    const hudSt = document.getElementById('hudStatus');
    if (hudSt) {
      hudSt.textContent = 'CLIPBOARD INTERCEPTED';
      hudSt.style.color = '#ff2d2d';
      setTimeout(() => { hudSt.textContent = 'NOMINAL'; hudSt.style.color = ''; }, 2000);
    }
    // Toast near cursor
    if (toast) {
      toast.style.left = (mouseX + 15) + 'px';
      toast.style.top = (mouseY - 30) + 'px';
      toast.classList.add('visible');
      setTimeout(() => toast.classList.remove('visible'), 2500);
    }
  });
})();


// ╔══════════════════════════════════════════════════════════════╗
// ║  FEATURE 3: GHOST CURSOR                                    ║
// ╚══════════════════════════════════════════════════════════════╝
let ghostActive = false;
let ghostX = window.innerWidth / 2, ghostY = window.innerHeight / 2;
let ghostVX = 0, ghostVY = 0;
let ghostWaypointX = 0, ghostWaypointY = 0;
let ghostTime = 0;
let ghostSpawned = false;
const ghostEl = document.getElementById('ghostReticle');

function pickGhostWaypoint() {
  // Pick random position, sometimes near project cards or links
  const targets = document.querySelectorAll('.project-card, .nav-link, .btn, .skill-card');
  if (Math.random() > 0.4 && targets.length) {
    const t = targets[Math.floor(Math.random() * targets.length)];
    const r = t.getBoundingClientRect();
    ghostWaypointX = r.left + r.width / 2 + (Math.random() - 0.5) * 40;
    ghostWaypointY = r.top + r.height / 2 + (Math.random() - 0.5) * 40;
  } else {
    ghostWaypointX = Math.random() * window.innerWidth;
    ghostWaypointY = Math.random() * window.innerHeight;
  }
}

function updateGhost() {
  if (!ghostActive || !ghostEl) { requestAnimationFrame(updateGhost); return; }

  ghostTime += 0.02;
  // Move toward waypoint with sine wave drift
  const toX = ghostWaypointX - ghostX + Math.sin(ghostTime * 1.3) * 30;
  const toY = ghostWaypointY - ghostY + Math.cos(ghostTime * 0.9) * 20;
  const dist = Math.sqrt(toX * toX + toY * toY);

  // Flee from real cursor
  const realDX = ghostX - mouseX, realDY = ghostY - mouseY;
  const realDist = Math.sqrt(realDX * realDX + realDY * realDY);
  let fleeX = 0, fleeY = 0;
  if (realDist < 120 && realDist > 0) {
    const fleeStr = (120 - realDist) * 0.15;
    fleeX = (realDX / realDist) * fleeStr;
    fleeY = (realDY / realDist) * fleeStr;
  }

  if (dist > 5) {
    ghostVX += (toX / dist) * 0.4 + fleeX;
    ghostVY += (toY / dist) * 0.4 + fleeY;
  }
  if (dist < 50) pickGhostWaypoint();

  ghostVX *= 0.92; ghostVY *= 0.92;
  ghostX += ghostVX; ghostY += ghostVY;
  ghostX = Math.max(0, Math.min(window.innerWidth, ghostX));
  ghostY = Math.max(0, Math.min(window.innerHeight, ghostY));

  ghostEl.style.left = ghostX + 'px';
  ghostEl.style.top = ghostY + 'px';

  // Ghost particle trail (blue)
  if (Math.abs(ghostVX) + Math.abs(ghostVY) > 1) {
    particles.push({
      x: ghostX + (Math.random() - 0.5) * 6, y: ghostY + (Math.random() - 0.5) * 6,
      vx: (Math.random() - 0.5) * 1, vy: (Math.random() - 0.5) * 1,
      size: Math.random() * 2 + 0.5, life: 0.7, decay: 0.03,
      color: '100, 180, 255',
    });
  }

  requestAnimationFrame(updateGhost);
}

// Spawn ghost after delay
setTimeout(() => {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  ghostSpawned = true;
  ghostActive = true;
  ghostX = window.innerWidth * 0.7; ghostY = window.innerHeight * 0.3;
  pickGhostWaypoint();
  if (ghostEl) ghostEl.classList.add('visible');
  updateGhost();
}, GHOST_SPAWN_DELAY);

// Terminal command
terminalCommands.ghost = () => {
  if (!ghostSpawned) {
    ghostSpawned = true;
    ghostActive = true;
    ghostX = window.innerWidth * 0.7; ghostY = window.innerHeight * 0.3;
    pickGhostWaypoint();
    if (ghostEl) ghostEl.classList.add('visible');
    updateGhost();
    return '<span style="color:#64b4ff;">Ghost cursor activated.</span>';
  }
  ghostActive = !ghostActive;
  if (ghostEl) ghostEl.classList.toggle('visible', ghostActive);
  return ghostActive
    ? '<span style="color:#64b4ff;">Ghost cursor: ON</span>'
    : '<span style="color:#7d8590;">Ghost cursor: OFF</span>';
};

// ╔══════════════════════════════════════════════════════════════╗
// ║  FEATURE 4: PACKET SNIFFER DISPLAY                          ║
// ╚══════════════════════════════════════════════════════════════╝
const packetSniffer = document.getElementById('packetSniffer');
const packetBody = document.getElementById('packetSnifferBody');
const packetHeader = document.getElementById('packetSnifferHeader');
let packetVisible = false;
let packetInterval = null;

const packetProtocols = ['TCP', 'UDP', 'HTTPS', 'TLS', 'DNS', 'SSH', 'WSS', 'ICMP'];
const packetHosts = ['cdn.arsenalrx.io', 'api.github.com', 'fonts.gstatic.com', '10.0.0.1', '192.168.1.1', 'edge.fastly.net', 'dns.google', 'registry.npmjs.org', 'pypi.org', 'crates.io'];
const packetAlerts = [
  'ALERT: Unauthorized port scan detected on :4444',
  'ALERT: Suspicious payload in packet #0xFE3A',
  'ALERT: Brute force attempt from 91.132.x.x',
  'ALERT: Anomalous TLS handshake intercepted',
  'ALERT: DNS exfiltration pattern matched',
];

function generatePacketLine() {
  const proto = packetProtocols[Math.floor(Math.random() * packetProtocols.length)];
  const host = packetHosts[Math.floor(Math.random() * packetHosts.length)];
  const port = [80, 443, 22, 8080, 3000, 5432, 27017][Math.floor(Math.random() * 7)];
  const size = Math.floor(Math.random() * 2048) + 64;
  return `${proto} ${host}:${port} ${size}B`;
}

function addPacketLine() {
  if (!packetBody) return;
  const isAlert = Math.random() < 0.03;
  const div = document.createElement('div');
  div.className = 'packet-line' + (isAlert ? ' alert' : '');
  div.textContent = isAlert
    ? packetAlerts[Math.floor(Math.random() * packetAlerts.length)]
    : `[${new Date().toLocaleTimeString('en-US', {hour12:false})}] ${generatePacketLine()}`;
  packetBody.appendChild(div);
  while (packetBody.children.length > PACKET_MAX_LINES) packetBody.removeChild(packetBody.firstChild);
  packetBody.scrollTop = packetBody.scrollHeight;
}

function startPacketSniffer() {
  if (packetInterval) return;
  packetInterval = setInterval(addPacketLine, 500 + Math.random() * 500);
}

function stopPacketSniffer() {
  if (packetInterval) { clearInterval(packetInterval); packetInterval = null; }
}

// Fade in after delay
setTimeout(() => {
  if (window.innerWidth <= 768) return;
  packetVisible = true;
  if (packetSniffer) packetSniffer.classList.add('visible');
  startPacketSniffer();
}, PACKET_SNIFFER_DELAY);

// Collapse toggle
if (packetHeader) {
  packetHeader.addEventListener('click', () => {
    if (packetSniffer) packetSniffer.classList.toggle('collapsed');
  });
}

// Terminal command
terminalCommands.sniff = () => {
  packetVisible = !packetVisible;
  if (packetSniffer) packetSniffer.classList.toggle('visible', packetVisible);
  if (packetVisible) startPacketSniffer(); else stopPacketSniffer();
  return packetVisible
    ? '<span style="color:#00ff66;">Packet sniffer: ON</span>'
    : '<span style="color:#f85149;">Packet sniffer: OFF</span>';
};

// ╔══════════════════════════════════════════════════════════════╗
// ║  FEATURE 5: GRAVITATIONAL LENSING CURSOR                   ║
// ╚══════════════════════════════════════════════════════════════╝
// lensActive, lensHolding, lensHoldTime declared at top of file
lensActive = true;
let lensHoldInterval = null;
let lensShockwave = false;
let lensShockwaveTime = 0;

document.addEventListener('mousedown', e => {
  if (e.target.closest('a, button, input, textarea, .nav, .terminal, .mobile-menu, .packet-sniffer')) return;
  lensHolding = true;
  lensHoldTime = 0;
  lensHoldInterval = setInterval(() => { lensHoldTime += 0.05; }, 50);
});

document.addEventListener('mouseup', () => {
  if (lensHolding && lensHoldTime > 1.5) {
    // Shockwave release
    lensShockwave = true;
    lensShockwaveTime = 0;
    // Push all nearby stars outward
    const cx = canvas.width / 2, cy = canvas.height / 2;
    stars.forEach(star => {
      const px = star.parallaxSpeed;
      const dx = (mouseX - cx) * px + driftX * (star.layer * 0.5 + 0.5);
      const dy = (mouseY - cy) * px + driftY * (star.layer * 0.5 + 0.5);
      const sx = star.x + dx, sy = star.y + dy;
      const ldx = sx - mouseX, ldy = sy - mouseY;
      const ldist = Math.sqrt(ldx * ldx + ldy * ldy);
      if (ldist < 400 && ldist > 0) {
        star.x += (ldx / ldist) * (200 / (ldist + 50));
        star.y += (ldy / ldist) * (200 / (ldist + 50));
      }
    });
    // Spawn 10 shooting stars
    for (let i = 0; i < 10; i++) setTimeout(() => spawnShootingStar(), i * 60);
    // Flash effect
    if (warpOverlay) {
      warpOverlay.style.background = 'radial-gradient(circle at ' + mouseX + 'px ' + mouseY + 'px, rgba(255,255,255,0.3) 0%, transparent 50%)';
      warpOverlay.classList.add('flash');
      setTimeout(() => { warpOverlay.classList.remove('flash'); warpOverlay.style.background = ''; }, 300);
    }
  }
  lensHolding = false;
  lensHoldTime = 0;
  if (lensHoldInterval) { clearInterval(lensHoldInterval); lensHoldInterval = null; }
});

// ╔══════════════════════════════════════════════════════════════╗
// ║  FEATURE 6: AUDIO VISUALIZER                                ║
// ╚══════════════════════════════════════════════════════════════╝
// vizActive, vizBass, vizMids, vizTreble declared at top of file
let vizContext = null, vizAnalyser = null, vizDataArray = null, vizSource = null;
let vizBarsEl = null;

function initVisualizer() {
  if (vizContext) return true;
  try {
    vizContext = new (window.AudioContext || window.webkitAudioContext)();
    vizAnalyser = vizContext.createAnalyser();
    vizAnalyser.fftSize = 256;
    vizDataArray = new Uint8Array(vizAnalyser.frequencyBinCount);
    vizSource = vizContext.createMediaElementSource(siteMusic.audio);
    vizSource.connect(vizAnalyser);
    vizAnalyser.connect(vizContext.destination);
    return true;
  } catch (err) {
    return false;
  }
}

function updateVisualizer() {
  if (!vizActive || !vizAnalyser) { requestAnimationFrame(updateVisualizer); return; }
  vizAnalyser.getByteFrequencyData(vizDataArray);

  // Bass: bins 0-10
  let bassSum = 0;
  for (let i = 0; i < 10; i++) bassSum += vizDataArray[i];
  vizBass = bassSum / (10 * 255);

  // Mids: bins 10-40
  let midSum = 0;
  for (let i = 10; i < 40; i++) midSum += vizDataArray[i];
  vizMids = midSum / (30 * 255);

  // Treble: bins 40+
  let trebSum = 0;
  const trebCount = vizDataArray.length - 40;
  for (let i = 40; i < vizDataArray.length; i++) trebSum += vizDataArray[i];
  vizTreble = trebSum / (trebCount * 255);

  // Treble spike shooting stars
  if (vizTreble > 0.5 && Math.random() > 0.7) spawnShootingStar();

  // Update HUD bars
  if (vizBarsEl) {
    const bars = vizBarsEl.querySelectorAll('span');
    if (bars[0]) bars[0].style.height = Math.max(2, vizBass * 10) + 'px';
    if (bars[1]) bars[1].style.height = Math.max(2, vizMids * 10) + 'px';
    if (bars[2]) bars[2].style.height = Math.max(2, vizTreble * 10) + 'px';
  }

  requestAnimationFrame(updateVisualizer);
}

terminalCommands.visualize = () => {
  vizActive = !vizActive;
  if (vizActive) {
    // Start music if not playing
    if (!siteMusic.started || siteMusic.muted) {
      siteMusic.muted = false;
      siteMusic.unmute();
      if (siteMusic.audio) siteMusic.audio.play().catch(() => {});
      siteMusic.started = true;
    }
    if (!initVisualizer()) {
      vizActive = false;
      return '<span style="color:#f85149;">Audio visualizer failed to initialize.</span>';
    }
    // Add HUD bars
    const hudTR = document.getElementById('hudTR');
    if (hudTR && !vizBarsEl) {
      const line = document.createElement('div');
      line.className = 'hud-line';
      line.innerHTML = 'VIZ: <span class="hud-viz-bars"><span style="height:2px"></span><span style="height:2px"></span><span style="height:2px"></span></span>';
      hudTR.appendChild(line);
      vizBarsEl = line.querySelector('.hud-viz-bars');
    }
    updateVisualizer();
    return '<span style="color:#00ff66;">Audio visualizer: ON</span> — Music reactive mode active.';
  } else {
    vizBass = 0; vizMids = 0; vizTreble = 0;
    if (vizBarsEl) { vizBarsEl.closest('.hud-line').remove(); vizBarsEl = null; }
    return '<span style="color:#f85149;">Audio visualizer: OFF</span>';
  }
};

// ╔══════════════════════════════════════════════════════════════╗
// ║  FEATURE 7: ORBITAL COMMAND MAP                             ║
// ╚══════════════════════════════════════════════════════════════╝
const orbitalCanvas = document.getElementById('orbitalMap');
const orbCtx = orbitalCanvas ? orbitalCanvas.getContext('2d') : null;
let orbitalActive = false;
let orbitalTime = 0;
let orbitalHover = -1;
let orbitalMX = 0, orbitalMY = 0;
let orbitalParticles = [];

const planets = [
  { name: 'About',    section: 'about',    radius: 80,  speed: 0.015, size: 8,  colors: ['#ff4444','#cc2222'], angle: 0 },
  { name: 'Projects', section: 'projects',  radius: 130, speed: 0.010, size: 12, colors: ['#ffaa00','#cc7700'], angle: Math.PI * 0.4 },
  { name: 'Skills',   section: 'skills',    radius: 180, speed: 0.007, size: 14, colors: ['#2299ff','#00cc66'], angle: Math.PI * 0.9 },
  { name: 'Terminal', section: 'terminal',  radius: 230, speed: 0.005, size: 10, colors: ['#ff3333','#992222'], angle: Math.PI * 1.3 },
  { name: 'Contact',  section: 'contact',   radius: 290, speed: 0.003, size: 18, colors: ['#cc8855','#aa6633'], angle: Math.PI * 1.7 },
  { name: 'GitHub',   section: '__github',  radius: 340, speed: 0.002, size: 15, colors: ['#ddcc66','#bbaa44'], angle: Math.PI * 0.2, hasRings: true },
];

function resizeOrbital() {
  if (orbitalCanvas) {
    orbitalCanvas.width = window.innerWidth;
    orbitalCanvas.height = window.innerHeight;
  }
}
resizeOrbital();
window.addEventListener('resize', resizeOrbital);

function drawOrbitalMap() {
  if (!orbitalActive || !orbCtx) { return; }
  requestAnimationFrame(drawOrbitalMap);
  orbitalTime += 0.016;

  const W = orbitalCanvas.width, H = orbitalCanvas.height;
  const cx = W / 2, cy = H / 2;
  orbCtx.clearRect(0, 0, W, H);

  // Subtle background stars
  orbCtx.fillStyle = 'rgba(255,255,255,0.3)';
  for (let i = 0; i < 80; i++) {
    const bx = ((i * 137.5) % W), by = ((i * 231.7) % H);
    orbCtx.fillRect(bx, by, 1, 1);
  }

  // Sun at center
  const sunPulse = 1 + Math.sin(orbitalTime * 2) * 0.1;
  const sunGrad = orbCtx.createRadialGradient(cx, cy, 0, cx, cy, 30 * sunPulse);
  sunGrad.addColorStop(0, 'rgba(255,200,50,1)');
  sunGrad.addColorStop(0.4, 'rgba(255,120,20,0.8)');
  sunGrad.addColorStop(1, 'rgba(255,60,10,0)');
  orbCtx.beginPath(); orbCtx.arc(cx, cy, 30 * sunPulse, 0, Math.PI * 2);
  orbCtx.fillStyle = sunGrad; orbCtx.fill();
  // Sun glow
  orbCtx.beginPath(); orbCtx.arc(cx, cy, 50, 0, Math.PI * 2);
  orbCtx.fillStyle = 'rgba(255,150,30,0.08)'; orbCtx.fill();
  // Sun label
  orbCtx.fillStyle = 'rgba(255,200,100,0.6)';
  orbCtx.font = '10px "Space Mono", monospace';
  orbCtx.textAlign = 'center';
  orbCtx.fillText('HOME', cx, cy + 45);

  orbitalHover = -1;

  planets.forEach((p, i) => {
    p.angle += p.speed;
    const px = cx + Math.cos(p.angle) * p.radius;
    const py = cy + Math.sin(p.angle) * p.radius * 0.5; // elliptical

    // Orbit ring
    orbCtx.beginPath();
    orbCtx.ellipse(cx, cy, p.radius, p.radius * 0.5, 0, 0, Math.PI * 2);
    orbCtx.strokeStyle = 'rgba(255,255,255,0.06)';
    orbCtx.lineWidth = 1;
    orbCtx.stroke();

    // Planet body
    const pGrad = orbCtx.createRadialGradient(px - p.size * 0.3, py - p.size * 0.3, 0, px, py, p.size);
    pGrad.addColorStop(0, p.colors[0]);
    pGrad.addColorStop(1, p.colors[1]);
    orbCtx.beginPath(); orbCtx.arc(px, py, p.size, 0, Math.PI * 2);
    orbCtx.fillStyle = pGrad; orbCtx.fill();
    // Glow
    orbCtx.beginPath(); orbCtx.arc(px, py, p.size * 2, 0, Math.PI * 2);
    orbCtx.fillStyle = p.colors[0].replace(')', ',0.1)').replace('rgb', 'rgba');
    orbCtx.fill();

    // Saturn rings
    if (p.hasRings) {
      orbCtx.beginPath();
      orbCtx.ellipse(px, py, p.size * 2.2, p.size * 0.5, -0.3, 0, Math.PI * 2);
      orbCtx.strokeStyle = 'rgba(220,200,100,0.4)';
      orbCtx.lineWidth = 2;
      orbCtx.stroke();
    }

    // Mars tiny moons
    if (p.name === 'Terminal') {
      const mx = px + Math.cos(orbitalTime * 3) * (p.size + 8);
      const my = py + Math.sin(orbitalTime * 3) * (p.size + 5);
      orbCtx.beginPath(); orbCtx.arc(mx, my, 2, 0, Math.PI * 2);
      orbCtx.fillStyle = 'rgba(200,150,150,0.6)'; orbCtx.fill();
    }

    // Hover detection
    const hdx = orbitalMX - px, hdy = orbitalMY - py;
    if (Math.sqrt(hdx * hdx + hdy * hdy) < p.size + 10) {
      orbitalHover = i;
      // Label
      orbCtx.fillStyle = 'rgba(255,255,255,0.9)';
      orbCtx.font = 'bold 12px "Space Mono", monospace';
      orbCtx.textAlign = 'center';
      orbCtx.fillText(p.name, px, py - p.size - 12);
      // Highlight ring
      orbCtx.beginPath(); orbCtx.arc(px, py, p.size + 5, 0, Math.PI * 2);
      orbCtx.strokeStyle = 'rgba(255,255,255,0.3)';
      orbCtx.lineWidth = 1;
      orbCtx.stroke();
    }

    // Store current position for click detection
    p._px = px; p._py = py;
  });

  // Comet trail at cursor
  orbitalParticles.push({
    x: orbitalMX, y: orbitalMY,
    size: Math.random() * 2 + 1, life: 1, decay: 0.04,
  });
  if (orbitalParticles.length > 40) orbitalParticles.shift();
  for (let i = orbitalParticles.length - 1; i >= 0; i--) {
    const op = orbitalParticles[i];
    op.life -= op.decay;
    if (op.life <= 0) { orbitalParticles.splice(i, 1); continue; }
    orbCtx.beginPath(); orbCtx.arc(op.x, op.y, op.size * op.life, 0, Math.PI * 2);
    orbCtx.fillStyle = `rgba(255,150,80,${op.life * 0.5})`;
    orbCtx.fill();
  }

  // Instructions
  orbCtx.fillStyle = 'rgba(255,255,255,0.25)';
  orbCtx.font = '11px "Space Mono", monospace';
  orbCtx.textAlign = 'center';
  orbCtx.fillText('Click a planet to navigate  |  ESC to close', cx, H - 30);
}

function openOrbitalMap() {
  if (!orbitalCanvas) return;
  orbitalActive = true;
  resizeOrbital();
  orbitalCanvas.classList.add('active');
  drawOrbitalMap();
}

function closeOrbitalMap() {
  orbitalActive = false;
  if (orbitalCanvas) orbitalCanvas.classList.remove('active');
  orbitalParticles = [];
}

// Mouse tracking for orbital map
if (orbitalCanvas) {
  orbitalCanvas.addEventListener('mousemove', e => {
    orbitalMX = e.clientX; orbitalMY = e.clientY;
  });

  orbitalCanvas.addEventListener('click', e => {
    if (orbitalHover >= 0) {
      const p = planets[orbitalHover];
      closeOrbitalMap();
      if (p.section === '__github') {
        window.open('https://github.com/ArsenalRX', '_blank');
      } else {
        triggerWarp(p.section);
        setTimeout(() => {
          document.getElementById(p.section)?.scrollIntoView({ behavior: 'smooth' });
        }, 600);
      }
    } else {
      closeOrbitalMap();
    }
  });
}

// ESC to close orbital map
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && orbitalActive) { closeOrbitalMap(); e.stopPropagation(); }
});

// Terminal command
terminalCommands.map = () => {
  openOrbitalMap();
  return '<span style="color:#ffaa00;">Orbital command map opened.</span>';
};

// Triple-click nav logo to open map
const navLogo = document.querySelector('.nav-logo');
let logoClickCount = 0, logoClickTimer = null;
if (navLogo) {
  navLogo.addEventListener('click', e => {
    logoClickCount++;
    if (logoClickCount >= 3) {
      logoClickCount = 0;
      clearTimeout(logoClickTimer);
      openOrbitalMap();
      return;
    }
    clearTimeout(logoClickTimer);
    logoClickTimer = setTimeout(() => { logoClickCount = 0; }, 500);
  });
}

// ╔══════════════════════════════════════════════════════════════╗
// ║  UPDATE HELP COMMAND                                        ║
// ╚══════════════════════════════════════════════════════════════╝
terminalCommands.help = () => `Available commands:
  <span class="cmd-highlight">about</span>      - Learn about me
  <span class="cmd-highlight">skills</span>     - View my skills
  <span class="cmd-highlight">projects</span>   - See my projects
  <span class="cmd-highlight">contact</span>    - How to reach me
  <span class="cmd-highlight">github</span>     - Open my GitHub
  <span class="cmd-highlight">neofetch</span>   - System info
  <span class="cmd-highlight">ls</span>         - List project files
  <span class="cmd-highlight">whoami</span>     - Who are you?
  <span class="cmd-highlight">date</span>       - Current date
  <span class="cmd-highlight">music</span>      - Toggle music on/off
  <span class="cmd-highlight">theme</span>      - Cycle color schemes
  <span class="cmd-highlight">matrix</span>     - Enter the Matrix
  <span class="cmd-highlight">weather</span>    - Current weather
  <span class="cmd-highlight">trail</span>      - Change cursor trail color
  <span class="cmd-highlight">ghost</span>      - Toggle ghost cursor
  <span class="cmd-highlight">sniff</span>      - Toggle packet sniffer
  <span class="cmd-highlight">visualize</span>  - Music-reactive visualizer
  <span class="cmd-highlight">map</span>        - Orbital command map
  <span class="cmd-highlight">secret</span>     - ???
  <span class="cmd-highlight">hack</span>       - Hack the mainframe
  <span class="cmd-highlight">clear</span>      - Clear terminal`;
