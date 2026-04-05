(function(ARX) {
  // ========== SPACE DUST PARTICLES ==========
  var spaceDust = document.getElementById('spaceDust');
  if (spaceDust) {
    for (var i = 0; i < 15; i++) {
      var p = document.createElement('div'); p.className = 'dust-particle';
      p.style.left = Math.random() * 100 + '%'; p.style.top = Math.random() * 100 + '%';
      p.style.width = (Math.random() * 2 + 1) + 'px'; p.style.height = p.style.width;
      p.style.animationDuration = (Math.random() * 20 + 15) + 's';
      p.style.animationDelay = (Math.random() * 20) + 's';
      p.style.opacity = Math.random() * 0.4 + 0.1;
      spaceDust.appendChild(p);
    }
  }

  // ========== FLOATING CODE FRAGMENTS ==========
  var codeSnippets = ['const life = "code";', 'fn main() {}', 'import * as future', '// TODO: conquer', 'let x = 42;', 'async fn build()', 'git push origin', '<Component />', 'pip install', 'npm run dev'];
  var heroSection = document.getElementById('home');
  if (heroSection) {
    for (var i = 0; i < 3; i++) {
      var frag = document.createElement('div'); frag.className = 'code-fragment';
      frag.textContent = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
      frag.style.left = (Math.random() * 80 + 10) + '%';
      frag.style.top = (Math.random() * 60 + 20) + '%';
      frag.style.animationDuration = (Math.random() * 15 + 20) + 's';
      frag.style.animationDelay = (Math.random() * 15) + 's';
      heroSection.appendChild(frag);
    }
  }

  // ========== CODE RAIN (sparse matrix-style) ==========
  var codeRainCanvas = document.getElementById('codeRain');
  var crCtx = codeRainCanvas ? codeRainCanvas.getContext('2d') : null;
  var codeChars = 'アイウエオカキクケコ0123456789ABCDEF{}[]<>/\\;:=+*&^%$#@!ffffffff0xDEAD';
  var codeColumns = [];

  function resizeCodeRain() {
    if (!codeRainCanvas) return;
    codeRainCanvas.width = window.innerWidth;
    codeRainCanvas.height = window.innerHeight;
    var colW = 20;
    var numCols = Math.floor(codeRainCanvas.width / colW);
    codeColumns = [];
    for (var i = 0; i < numCols; i++) {
      if (Math.random() > (1 - ARX.CODE_RAIN_ACTIVE_CHANCE)) {
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

  var lastCodeRainTime = 0;
  function drawCodeRain(timestamp) {
    if (!crCtx) { requestAnimationFrame(drawCodeRain); return; }
    if (!ARX.codeRainStarted) { requestAnimationFrame(drawCodeRain); return; }
    if (timestamp - lastCodeRainTime < ARX.CODE_RAIN_FRAME_MS) { requestAnimationFrame(drawCodeRain); return; }
    lastCodeRainTime = timestamp;
    crCtx.clearRect(0, 0, codeRainCanvas.width, codeRainCanvas.height);

    codeColumns.forEach(function(col) {
      col.timer += 0.016;
      if (col.timer > col.spawnRate) {
        col.timer = 0;
        col.chars.push({
          char: codeChars[Math.floor(Math.random() * codeChars.length)],
          y: col.y, opacity: 0.6 + Math.random() * 0.3, life: 1,
        });
        col.y += 16;
        if (col.y > codeRainCanvas.height + 50) col.y = -20;
        if (col.chars.length > col.maxChars) col.chars.shift();
      }
      col.chars.forEach(function(c, ci) {
        c.life -= 0.003;
        if (c.life <= 0) return;
        var isHead = ci === col.chars.length - 1;
        var alpha = c.life * c.opacity * 0.15;
        crCtx.font = '13px "Space Mono", monospace';
        crCtx.fillStyle = isHead
          ? 'rgba(255, 60, 60, ' + (alpha * 2.5) + ')'
          : 'rgba(180, 20, 20, ' + alpha + ')';
        crCtx.fillText(c.char, col.x, c.y);
      });
      col.chars = col.chars.filter(function(c) { return c.life > 0; });
    });

    requestAnimationFrame(drawCodeRain);
  }
  drawCodeRain();

  // Lazy load code rain when scrolled past hero
  var codeRainObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !ARX.codeRainStarted) {
        ARX.codeRainStarted = true;
      }
    });
  }, { threshold: 0 });
  var aboutSection = document.getElementById('about');
  if (aboutSection) codeRainObserver.observe(aboutSection);

  // ========== GLITCH BURSTS ==========
  var glitchOverlay = document.getElementById('glitchOverlay');

  function fireGlitch() {
    if (!glitchOverlay) return;
    glitchOverlay.classList.remove('active');
    void glitchOverlay.offsetWidth;
    glitchOverlay.classList.add('active');
    setTimeout(function() { glitchOverlay.classList.remove('active'); }, 350);
  }
  ARX.fireGlitch = fireGlitch;

  setInterval(function() {
    if (Math.random() > ARX.GLITCH_BURST_CHANCE) fireGlitch();
  }, ARX.GLITCH_BURST_INTERVAL);

  // ========== PERFORMANCE MODE ==========
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
    document.querySelectorAll('.nebula').forEach(function(n) { n.style.display = 'none'; });
    document.querySelectorAll('.space-rock').forEach(function(r) { r.style.display = 'none'; });
    document.querySelectorAll('.dust-particle').forEach(function(p) { p.style.display = 'none'; });
    if (codeRainCanvas) codeRainCanvas.style.display = 'none';
  }
})(window.ARX);
