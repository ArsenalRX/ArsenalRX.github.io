(function(ARX) {
  var canvas = document.getElementById('starfield');
  var ctx = canvas.getContext('2d');
  var constellationLines = [];
  var pulsarPhase = 0;

  function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }

  function createStars() {
    ARX.stars = [];
    var count = Math.floor((canvas.width * canvas.height) / ARX.STAR_DENSITY_DIVISOR);
    for (var i = 0; i < count; i++) {
      var depth = Math.random();
      var layer, parallaxSpeed, baseSize;
      if (depth < 0.4) {
        layer = 0; parallaxSpeed = 0.008; baseSize = depth * 1.2 + 0.3;
      } else if (depth < 0.75) {
        layer = 1; parallaxSpeed = 0.03; baseSize = depth * 1.8 + 0.5;
      } else {
        layer = 2; parallaxSpeed = 0.07; baseSize = depth * 2.5 + 0.8;
      }
      var colorType = Math.random();
      var r, g, b;
      if (colorType < 0.15) { r = 255; g = 40 + Math.random() * 40; b = 40 + Math.random() * 30; }
      else if (colorType < 0.55) { r = 220; g = 215; b = 230; }
      else if (colorType < 0.75) { r = 255; g = 235; b = 200; }
      else if (colorType < 0.88) { r = 200; g = 200; b = 220; }
      else { r = 255; g = 160; b = 160; }
      var star = {
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        size: baseSize, speed: depth * 0.5 + 0.1,
        opacity: depth * 0.5 + 0.25, pulse: Math.random() * Math.PI * 2,
        depth: depth, layer: layer, parallaxSpeed: parallaxSpeed, r: r, g: g, b: b,
        twinkleSpeed: Math.random() * 0.04 + 0.005,
        ox: 0, oy: 0,
      };
      star.ox = star.x;
      star.oy = star.y;
      ARX.stars.push(star);
    }
    constellationLines = [];
  }

  function spawnShootingStar() {
    var isCrimson = Math.random() > 0.5;
    ARX.shootingStars.push({
      x: Math.random() * canvas.width * 0.8, y: Math.random() * canvas.height * 0.4,
      len: Math.random() * 120 + 60, speed: Math.random() * 10 + 8,
      angle: (Math.PI / 4) + (Math.random() * 0.5 - 0.25), opacity: 1, life: 1,
      crimson: isCrimson,
    });
  }
  ARX.spawnShootingStar = spawnShootingStar;

  setInterval(function() { if (Math.random() > 0.6) spawnShootingStar(); }, ARX.SHOOTING_STAR_INTERVAL);
  setInterval(function() { for (var i = 0; i < ARX.METEOR_SHOWER_COUNT; i++) setTimeout(spawnShootingStar, i * 200); }, ARX.METEOR_SHOWER_INTERVAL);

  var lastStarTime = 0;
  function drawStars(timestamp) {
    requestAnimationFrame(drawStars);
    if (!ARX.tabVisible || timestamp - lastStarTime < ARX.STAR_FRAME_MS) return;
    lastStarTime = timestamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ARX.driftTime += 0.003;
    ARX.driftX = Math.sin(ARX.driftTime * 0.7) * 8;
    ARX.driftY = Math.cos(ARX.driftTime * 0.5) * 5;

    if (ARX.warpStrength > 0.01) {
      ARX.warpStrength *= 0.96;
    } else {
      ARX.warpStrength = 0;
    }

    var cx = canvas.width / 2, cy = canvas.height / 2;

    ARX.stars.forEach(function(star) {
      star.pulse += star.twinkleSpeed;
      var flicker = Math.sin(star.pulse) * 0.3 + 0.7;
      var px = star.parallaxSpeed;
      var dx = (ARX.mouseX - cx) * px + ARX.driftX * (star.layer * 0.5 + 0.5);
      var dy = (ARX.mouseY - cy) * px + ARX.driftY * (star.layer * 0.5 + 0.5);
      var sx = star.x + dx, sy = star.y + dy;

      if (ARX.lensActive && ARX.mouseX && ARX.mouseY) {
        var ldx = sx - ARX.mouseX, ldy = sy - ARX.mouseY;
        var ldist = Math.sqrt(ldx * ldx + ldy * ldy);
        var lensRadius = ARX.lensHolding ? ARX.LENS_RADIUS_HOLD : ARX.LENS_RADIUS_DEFAULT;
        if (ldist < lensRadius && ldist > 1) {
          var lnx = ldx / ldist, lny = ldy / ldist;
          if (ARX.lensHolding && ARX.lensHoldTime > 1.5) {
            var pull = Math.min(80 / (ldist * 0.5 + 1), 6);
            sx -= lnx * pull; sy -= lny * pull;
            sx += lny * pull * 0.3; sy -= lnx * pull * 0.3;
            if (ldist < 15) star.opacity *= 0.9;
          } else {
            var push = Math.min(2000 / (ldist * ldist + 100), 4);
            sx += lnx * push; sy += lny * push;
          }
        }
      }

      var drawSize = star.size;
      var streakLen = 0;
      if (ARX.warpStrength > 0.01) {
        var fromCX = star.x - cx, fromCY = star.y - cy;
        var dist = Math.sqrt(fromCX * fromCX + fromCY * fromCY) || 1;
        var nx = fromCX / dist, ny = fromCY / dist;
        var warpPush = ARX.warpStrength * (star.layer + 1) * 40;
        sx += nx * warpPush;
        sy += ny * warpPush;
        streakLen = ARX.warpStrength * (star.layer + 1) * 30;
      }

      if (streakLen > 2) {
        var fromCX2 = star.x - cx, fromCY2 = star.y - cy;
        var dist2 = Math.sqrt(fromCX2 * fromCX2 + fromCY2 * fromCY2) || 1;
        var nx2 = fromCX2 / dist2, ny2 = fromCY2 / dist2;
        var tailX = sx - nx2 * streakLen, tailY = sy - ny2 * streakLen;
        var isRedStreak = star.r > 200 && star.g < 100;
        var sr = isRedStreak ? '255, 45, 45' : star.r + ', ' + star.g + ', ' + star.b;
        ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(sx, sy);
        ctx.strokeStyle = 'rgba(' + sr + ', ' + (star.opacity * flicker) + ')';
        ctx.lineWidth = Math.min(star.size * 1.5, 3); ctx.stroke();
        ctx.beginPath(); ctx.arc(sx, sy, star.size * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + (isRedStreak ? '255, 80, 80' : '255, 255, 255') + ', ' + (star.opacity * flicker) + ')'; ctx.fill();
      } else {
        var dr = star.r, dg = star.g, db = star.b, dOp = star.opacity * flicker, dSize = drawSize;
        if (ARX.vizActive) {
          dSize *= (1 + ARX.vizBass * 0.5);
          dOp *= (0.7 + ARX.vizMids * 0.5);
          dr = Math.min(255, dr + ARX.vizBass * 60);
          db = Math.min(255, db + ARX.vizBass * 80);
        }
        ctx.beginPath();
        ctx.arc(sx, sy, dSize, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + (dr|0) + ', ' + (dg|0) + ', ' + (db|0) + ', ' + dOp + ')';
        ctx.fill();
      }
    });

    ARX.shootingStars.forEach(function(s, i) {
      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.life -= 0.012; s.opacity = s.life;
      if (s.life <= 0) { ARX.shootingStars.splice(i, 1); return; }
      var tailX = s.x - Math.cos(s.angle) * s.len;
      var tailY = s.y - Math.sin(s.angle) * s.len;
      var cr = s.crimson;
      ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = 'rgba(' + (cr ? '255, 60, 60' : '220, 220, 240') + ', ' + s.opacity + ')';
      ctx.lineWidth = cr ? 2 : 1.5; ctx.stroke();
    });

    pulsarPhase += 0.03;
    var pulsarBright = (Math.sin(pulsarPhase) * 0.5 + 0.5) * 0.6;
    ctx.beginPath(); ctx.arc(canvas.width - 60, 80, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 45, 45, ' + pulsarBright + ')'; ctx.fill();
    ctx.beginPath(); ctx.arc(canvas.width - 60, 80, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 45, 45, ' + (pulsarBright * 0.2) + ')'; ctx.fill();
  }

  resizeCanvas(); createStars(); requestAnimationFrame(drawStars);
  window.addEventListener('resize', function() { resizeCanvas(); createStars(); });

  // Expose canvas for scroll warp effect
  ARX._starfieldCanvas = canvas;
})(window.ARX);
