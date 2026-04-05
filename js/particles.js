(function(ARX) {
  // ========== CURSOR PARTICLE TRAIL ==========
  var particleCanvas = document.getElementById('cursorParticles');
  var pCtx = particleCanvas.getContext('2d');
  var prevMouseX = -1, prevMouseY = -1, mouseHasMoved = false;

  function resizeParticleCanvas() { particleCanvas.width = window.innerWidth; particleCanvas.height = window.innerHeight; }
  resizeParticleCanvas();
  window.addEventListener('resize', resizeParticleCanvas);

  function spawnParticles(x, y, speed) {
    var count = Math.min(Math.floor(speed / 3), 4);
    for (var i = 0; i < count; i++) {
      ARX.particles.push({
        x: x + (Math.random() - 0.5) * 10, y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1, life: 1, decay: Math.random() * 0.03 + 0.02,
        color: Math.random() > 0.5 ? '255, 45, 45' : '255, 107, 107',
      });
    }
  }
  ARX.spawnParticles = spawnParticles;

  var lastParticleTime = 0;
  function drawParticles(timestamp) {
    requestAnimationFrame(drawParticles);
    if (!ARX.tabVisible || timestamp - lastParticleTime < ARX.PARTICLE_FRAME_MS) return;
    lastParticleTime = timestamp;
    if (ARX.particles.length === 0) { pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height); return; }
    pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    for (var i = ARX.particles.length - 1; i >= 0; i--) {
      var p = ARX.particles[i];
      p.x += p.vx; p.y += p.vy; p.life -= p.decay; p.size *= 0.98;
      if (p.life <= 0) { ARX.particles.splice(i, 1); continue; }
      pCtx.beginPath(); pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      pCtx.fillStyle = 'rgba(' + p.color + ', ' + (p.life * 0.6) + ')'; pCtx.fill();
      if (p.size > 1.2) {
        pCtx.beginPath(); pCtx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        pCtx.fillStyle = 'rgba(' + p.color + ', ' + (p.life * 0.15) + ')'; pCtx.fill();
      }
    }
  }
  requestAnimationFrame(drawParticles);

  // ========== ROTATING RETICLE CURSOR ==========
  var reticle = document.getElementById('reticle');
  var reticleVisible = false;

  // ========== MOUSE TRACKING (throttled) ==========
  var _lastMouseMove = 0;
  document.addEventListener('mousemove', function(e) {
    ARX.mouseX = e.clientX; ARX.mouseY = e.clientY;
    if (reticle) {
      reticle.style.transform = 'translate(' + (e.clientX - 16) + 'px, ' + (e.clientY - 16) + 'px)';
      if (!reticleVisible) {
        reticleVisible = true;
        reticle.classList.add('visible');
        document.body.classList.add('reticle-active');
      }
    }
    var now = performance.now();
    if (now - _lastMouseMove < ARX.MOUSE_THROTTLE_MS) return;
    _lastMouseMove = now;
    if (!mouseHasMoved) { mouseHasMoved = true; prevMouseX = e.clientX; prevMouseY = e.clientY; return; }
    prevMouseX = e.clientX; prevMouseY = e.clientY;
  }, { passive: true });

  document.addEventListener('mouseleave', function() {
    if (reticle) { reticle.classList.remove('visible'); reticleVisible = false; }
  });

  // ========== CLICK SPARKLE BURST ==========
  document.addEventListener('click', function(e) {
    if (e.target.closest('a, button, input, .nav, .terminal')) return;
    for (var i = 0; i < 4; i++) {
      var sparkle = document.createElement('div');
      sparkle.className = 'click-sparkle';
      var angle = (Math.PI * 2 / 4) * i;
      var dist = 20 + Math.random() * 20;
      sparkle.style.left = (e.clientX + Math.cos(angle) * dist) + 'px';
      sparkle.style.top = (e.clientY + Math.sin(angle) * dist) + 'px';
      sparkle.style.background = Math.random() > 0.5 ? 'var(--accent)' : 'var(--accent2)';
      sparkle.style.width = sparkle.style.height = (Math.random() * 4 + 2) + 'px';
      document.body.appendChild(sparkle);
      setTimeout(function(el) { el.remove(); }, 600, sparkle);
    }
  });

  // ========== BUTTON RIPPLE EFFECT ==========
  document.querySelectorAll('.btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      var ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      var rect = this.getBoundingClientRect();
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top = (e.clientY - rect.top) + 'px';
      ripple.style.width = ripple.style.height = Math.max(rect.width, rect.height) + 'px';
      this.appendChild(ripple);
      setTimeout(function() { ripple.remove(); }, 600);
    });
  });
})(window.ARX);
