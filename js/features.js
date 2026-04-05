(function(ARX) {
  // ╔══════════════════════════════════════════════════════════════╗
  // ║  GHOST CURSOR                                               ║
  // ╚══════════════════════════════════════════════════════════════╝
  var ghostActive = false;
  var ghostX = window.innerWidth / 2, ghostY = window.innerHeight / 2;
  var ghostVX = 0, ghostVY = 0;
  var ghostWaypointX = 0, ghostWaypointY = 0;
  var ghostTime = 0;
  var ghostSpawned = false;
  var ghostEl = document.getElementById('ghostReticle');

  function pickGhostWaypoint() {
    var targets = document.querySelectorAll('.project-card, .nav-link, .btn, .skill-card');
    if (Math.random() > 0.4 && targets.length) {
      var t = targets[Math.floor(Math.random() * targets.length)];
      var r = t.getBoundingClientRect();
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
    var toX = ghostWaypointX - ghostX + Math.sin(ghostTime * 1.3) * 30;
    var toY = ghostWaypointY - ghostY + Math.cos(ghostTime * 0.9) * 20;
    var dist = Math.sqrt(toX * toX + toY * toY);
    var realDX = ghostX - ARX.mouseX, realDY = ghostY - ARX.mouseY;
    var realDist = Math.sqrt(realDX * realDX + realDY * realDY);
    var fleeX = 0, fleeY = 0;
    if (realDist < 120 && realDist > 0) {
      var fleeStr = (120 - realDist) * 0.15;
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
    if (Math.abs(ghostVX) + Math.abs(ghostVY) > 1) {
      ARX.particles.push({
        x: ghostX + (Math.random() - 0.5) * 6, y: ghostY + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 1, vy: (Math.random() - 0.5) * 1,
        size: Math.random() * 2 + 0.5, life: 0.7, decay: 0.03,
        color: '100, 180, 255',
      });
    }
    requestAnimationFrame(updateGhost);
  }

  setTimeout(function() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    ghostSpawned = true; ghostActive = true;
    ghostX = window.innerWidth * 0.7; ghostY = window.innerHeight * 0.3;
    pickGhostWaypoint();
    if (ghostEl) ghostEl.classList.add('visible');
    updateGhost();
  }, ARX.GHOST_SPAWN_DELAY);

  ARX.terminalCommands.ghost = function() {
    if (!ghostSpawned) {
      ghostSpawned = true; ghostActive = true;
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
  // ║  PACKET SNIFFER DISPLAY                                     ║
  // ╚══════════════════════════════════════════════════════════════╝
  var packetSniffer = document.getElementById('packetSniffer');
  var packetBody = document.getElementById('packetSnifferBody');
  var packetHeader = document.getElementById('packetSnifferHeader');
  var packetVisible = false;
  var packetInterval = null;

  var packetProtocols = ['TCP', 'UDP', 'HTTPS', 'TLS', 'DNS', 'SSH', 'WSS', 'ICMP'];
  var packetHosts = ['cdn.arsenalrx.io', 'api.github.com', 'fonts.gstatic.com', '10.0.0.1', '192.168.1.1', 'edge.fastly.net', 'dns.google', 'registry.npmjs.org', 'pypi.org', 'crates.io'];
  var packetAlerts = [
    'ALERT: Unauthorized port scan detected on :4444',
    'ALERT: Suspicious payload in packet #0xFE3A',
    'ALERT: Brute force attempt from 91.132.x.x',
    'ALERT: Anomalous TLS handshake intercepted',
    'ALERT: DNS exfiltration pattern matched',
  ];

  function generatePacketLine() {
    var proto = packetProtocols[Math.floor(Math.random() * packetProtocols.length)];
    var host = packetHosts[Math.floor(Math.random() * packetHosts.length)];
    var port = [80, 443, 22, 8080, 3000, 5432, 27017][Math.floor(Math.random() * 7)];
    var size = Math.floor(Math.random() * 2048) + 64;
    return proto + ' ' + host + ':' + port + ' ' + size + 'B';
  }

  function addPacketLine() {
    if (!packetBody) return;
    var isAlert = Math.random() < 0.03;
    var div = document.createElement('div');
    div.className = 'packet-line' + (isAlert ? ' alert' : '');
    div.textContent = isAlert
      ? packetAlerts[Math.floor(Math.random() * packetAlerts.length)]
      : '[' + new Date().toLocaleTimeString('en-US', {hour12:false}) + '] ' + generatePacketLine();
    packetBody.appendChild(div);
    while (packetBody.children.length > ARX.PACKET_MAX_LINES) packetBody.removeChild(packetBody.firstChild);
    packetBody.scrollTop = packetBody.scrollHeight;
  }

  function startPacketSniffer() {
    if (packetInterval) return;
    packetInterval = setInterval(addPacketLine, 500 + Math.random() * 500);
  }

  function stopPacketSniffer() {
    if (packetInterval) { clearInterval(packetInterval); packetInterval = null; }
  }

  setTimeout(function() {
    if (window.innerWidth <= 768) return;
    packetVisible = true;
    if (packetSniffer) packetSniffer.classList.add('visible');
    startPacketSniffer();
  }, ARX.PACKET_SNIFFER_DELAY);

  if (packetHeader) {
    packetHeader.addEventListener('click', function() {
      if (packetSniffer) packetSniffer.classList.toggle('collapsed');
    });
  }

  ARX.terminalCommands.sniff = function() {
    packetVisible = !packetVisible;
    if (packetSniffer) packetSniffer.classList.toggle('visible', packetVisible);
    if (packetVisible) startPacketSniffer(); else stopPacketSniffer();
    return packetVisible
      ? '<span style="color:#00ff66;">Packet sniffer: ON</span>'
      : '<span style="color:#f85149;">Packet sniffer: OFF</span>';
  };

  // ╔══════════════════════════════════════════════════════════════╗
  // ║  GRAVITATIONAL LENSING CURSOR                               ║
  // ╚══════════════════════════════════════════════════════════════╝
  ARX.lensActive = true;
  var lensHoldInterval = null;

  document.addEventListener('mousedown', function(e) {
    if (e.target.closest('a, button, input, textarea, .nav, .terminal, .mobile-menu, .packet-sniffer')) return;
    ARX.lensHolding = true;
    ARX.lensHoldTime = 0;
    lensHoldInterval = setInterval(function() { ARX.lensHoldTime += 0.05; }, 50);
  });

  document.addEventListener('mouseup', function() {
    if (ARX.lensHolding && ARX.lensHoldTime > 1.5) {
      var canvas = document.getElementById('starfield');
      var cx = canvas.width / 2, cy = canvas.height / 2;
      ARX.stars.forEach(function(star) {
        var px = star.parallaxSpeed;
        var dx = (ARX.mouseX - cx) * px + ARX.driftX * (star.layer * 0.5 + 0.5);
        var dy = (ARX.mouseY - cy) * px + ARX.driftY * (star.layer * 0.5 + 0.5);
        var sx = star.x + dx, sy = star.y + dy;
        var ldx = sx - ARX.mouseX, ldy = sy - ARX.mouseY;
        var ldist = Math.sqrt(ldx * ldx + ldy * ldy);
        if (ldist < 400 && ldist > 0) {
          star.x += (ldx / ldist) * (200 / (ldist + 50));
          star.y += (ldy / ldist) * (200 / (ldist + 50));
        }
      });
      for (var i = 0; i < 10; i++) setTimeout(function() { if (ARX.spawnShootingStar) ARX.spawnShootingStar(); }, i * 60);
      var warpOverlay = ARX._warpOverlay;
      if (warpOverlay) {
        warpOverlay.style.background = 'radial-gradient(circle at ' + ARX.mouseX + 'px ' + ARX.mouseY + 'px, rgba(255,255,255,0.3) 0%, transparent 50%)';
        warpOverlay.classList.add('flash');
        setTimeout(function() { warpOverlay.classList.remove('flash'); warpOverlay.style.background = ''; }, 300);
      }
    }
    ARX.lensHolding = false;
    ARX.lensHoldTime = 0;
    if (lensHoldInterval) { clearInterval(lensHoldInterval); lensHoldInterval = null; }
  });

  // ╔══════════════════════════════════════════════════════════════╗
  // ║  AUDIO VISUALIZER                                           ║
  // ╚══════════════════════════════════════════════════════════════╝
  var vizContext = null, vizAnalyser = null, vizDataArray = null, vizSource = null;
  var vizBarsEl = null;

  function initVisualizer() {
    if (vizContext) return true;
    try {
      vizContext = new (window.AudioContext || window.webkitAudioContext)();
      vizAnalyser = vizContext.createAnalyser();
      vizAnalyser.fftSize = 256;
      vizDataArray = new Uint8Array(vizAnalyser.frequencyBinCount);
      vizSource = vizContext.createMediaElementSource(ARX.siteMusic.audio);
      vizSource.connect(vizAnalyser);
      vizAnalyser.connect(vizContext.destination);
      return true;
    } catch (err) { return false; }
  }

  function updateVisualizer() {
    if (!ARX.vizActive || !vizAnalyser) { requestAnimationFrame(updateVisualizer); return; }
    vizAnalyser.getByteFrequencyData(vizDataArray);
    var bassSum = 0;
    for (var i = 0; i < 10; i++) bassSum += vizDataArray[i];
    ARX.vizBass = bassSum / (10 * 255);
    var midSum = 0;
    for (var i = 10; i < 40; i++) midSum += vizDataArray[i];
    ARX.vizMids = midSum / (30 * 255);
    var trebSum = 0;
    var trebCount = vizDataArray.length - 40;
    for (var i = 40; i < vizDataArray.length; i++) trebSum += vizDataArray[i];
    ARX.vizTreble = trebSum / (trebCount * 255);
    if (ARX.vizTreble > 0.5 && Math.random() > 0.7 && ARX.spawnShootingStar) ARX.spawnShootingStar();
    if (vizBarsEl) {
      var bars = vizBarsEl.querySelectorAll('span');
      if (bars[0]) bars[0].style.height = Math.max(2, ARX.vizBass * 10) + 'px';
      if (bars[1]) bars[1].style.height = Math.max(2, ARX.vizMids * 10) + 'px';
      if (bars[2]) bars[2].style.height = Math.max(2, ARX.vizTreble * 10) + 'px';
    }
    requestAnimationFrame(updateVisualizer);
  }

  ARX.terminalCommands.visualize = function() {
    ARX.vizActive = !ARX.vizActive;
    if (ARX.vizActive) {
      if (!ARX.siteMusic.started || ARX.siteMusic.muted) {
        ARX.siteMusic.muted = false;
        ARX.siteMusic.unmute();
        if (ARX.siteMusic.audio) ARX.siteMusic.audio.play().catch(function() {});
        ARX.siteMusic.started = true;
      }
      if (!initVisualizer()) {
        ARX.vizActive = false;
        return '<span style="color:#f85149;">Audio visualizer failed to initialize.</span>';
      }
      var hudTR = document.getElementById('hudTR');
      if (hudTR && !vizBarsEl) {
        var line = document.createElement('div');
        line.className = 'hud-line';
        line.innerHTML = 'VIZ: <span class="hud-viz-bars"><span style="height:2px"></span><span style="height:2px"></span><span style="height:2px"></span></span>';
        hudTR.appendChild(line);
        vizBarsEl = line.querySelector('.hud-viz-bars');
      }
      updateVisualizer();
      return '<span style="color:#00ff66;">Audio visualizer: ON</span> \u2014 Music reactive mode active.';
    } else {
      ARX.vizBass = 0; ARX.vizMids = 0; ARX.vizTreble = 0;
      if (vizBarsEl) { vizBarsEl.closest('.hud-line').remove(); vizBarsEl = null; }
      return '<span style="color:#f85149;">Audio visualizer: OFF</span>';
    }
  };

  // ╔══════════════════════════════════════════════════════════════╗
  // ║  ORBITAL COMMAND MAP                                        ║
  // ╚══════════════════════════════════════════════════════════════╝
  var orbitalCanvas = document.getElementById('orbitalMap');
  var orbCtx = orbitalCanvas ? orbitalCanvas.getContext('2d') : null;
  var orbitalActive = false;
  var orbitalTime = 0;
  var orbitalHover = -1;
  var orbitalMX = 0, orbitalMY = 0;
  var orbitalParticles = [];

  var planets = [
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
    if (!orbitalActive || !orbCtx) return;
    requestAnimationFrame(drawOrbitalMap);
    orbitalTime += 0.016;
    var W = orbitalCanvas.width, H = orbitalCanvas.height;
    var cx = W / 2, cy = H / 2;
    orbCtx.clearRect(0, 0, W, H);
    orbCtx.fillStyle = 'rgba(255,255,255,0.3)';
    for (var i = 0; i < 80; i++) {
      var bx = ((i * 137.5) % W), by = ((i * 231.7) % H);
      orbCtx.fillRect(bx, by, 1, 1);
    }
    var sunPulse = 1 + Math.sin(orbitalTime * 2) * 0.1;
    var sunGrad = orbCtx.createRadialGradient(cx, cy, 0, cx, cy, 30 * sunPulse);
    sunGrad.addColorStop(0, 'rgba(255,200,50,1)');
    sunGrad.addColorStop(0.4, 'rgba(255,120,20,0.8)');
    sunGrad.addColorStop(1, 'rgba(255,60,10,0)');
    orbCtx.beginPath(); orbCtx.arc(cx, cy, 30 * sunPulse, 0, Math.PI * 2);
    orbCtx.fillStyle = sunGrad; orbCtx.fill();
    orbCtx.beginPath(); orbCtx.arc(cx, cy, 50, 0, Math.PI * 2);
    orbCtx.fillStyle = 'rgba(255,150,30,0.08)'; orbCtx.fill();
    orbCtx.fillStyle = 'rgba(255,200,100,0.6)';
    orbCtx.font = '10px "Space Mono", monospace';
    orbCtx.textAlign = 'center';
    orbCtx.fillText('HOME', cx, cy + 45);

    orbitalHover = -1;
    planets.forEach(function(p, i) {
      p.angle += p.speed;
      var px = cx + Math.cos(p.angle) * p.radius;
      var py = cy + Math.sin(p.angle) * p.radius * 0.5;
      orbCtx.beginPath();
      orbCtx.ellipse(cx, cy, p.radius, p.radius * 0.5, 0, 0, Math.PI * 2);
      orbCtx.strokeStyle = 'rgba(255,255,255,0.06)';
      orbCtx.lineWidth = 1; orbCtx.stroke();
      var pGrad = orbCtx.createRadialGradient(px - p.size * 0.3, py - p.size * 0.3, 0, px, py, p.size);
      pGrad.addColorStop(0, p.colors[0]); pGrad.addColorStop(1, p.colors[1]);
      orbCtx.beginPath(); orbCtx.arc(px, py, p.size, 0, Math.PI * 2);
      orbCtx.fillStyle = pGrad; orbCtx.fill();
      orbCtx.beginPath(); orbCtx.arc(px, py, p.size * 2, 0, Math.PI * 2);
      orbCtx.fillStyle = p.colors[0].replace(')', ',0.1)').replace('rgb', 'rgba');
      orbCtx.fill();
      if (p.hasRings) {
        orbCtx.beginPath(); orbCtx.ellipse(px, py, p.size * 2.2, p.size * 0.5, -0.3, 0, Math.PI * 2);
        orbCtx.strokeStyle = 'rgba(220,200,100,0.4)'; orbCtx.lineWidth = 2; orbCtx.stroke();
      }
      if (p.name === 'Terminal') {
        var mx = px + Math.cos(orbitalTime * 3) * (p.size + 8);
        var my = py + Math.sin(orbitalTime * 3) * (p.size + 5);
        orbCtx.beginPath(); orbCtx.arc(mx, my, 2, 0, Math.PI * 2);
        orbCtx.fillStyle = 'rgba(200,150,150,0.6)'; orbCtx.fill();
      }
      var hdx = orbitalMX - px, hdy = orbitalMY - py;
      if (Math.sqrt(hdx * hdx + hdy * hdy) < p.size + 10) {
        orbitalHover = i;
        orbCtx.fillStyle = 'rgba(255,255,255,0.9)';
        orbCtx.font = 'bold 12px "Space Mono", monospace';
        orbCtx.textAlign = 'center';
        orbCtx.fillText(p.name, px, py - p.size - 12);
        orbCtx.beginPath(); orbCtx.arc(px, py, p.size + 5, 0, Math.PI * 2);
        orbCtx.strokeStyle = 'rgba(255,255,255,0.3)'; orbCtx.lineWidth = 1; orbCtx.stroke();
      }
      p._px = px; p._py = py;
    });

    orbitalParticles.push({ x: orbitalMX, y: orbitalMY, size: Math.random() * 2 + 1, life: 1, decay: 0.04 });
    if (orbitalParticles.length > 40) orbitalParticles.shift();
    for (var i = orbitalParticles.length - 1; i >= 0; i--) {
      var op = orbitalParticles[i];
      op.life -= op.decay;
      if (op.life <= 0) { orbitalParticles.splice(i, 1); continue; }
      orbCtx.beginPath(); orbCtx.arc(op.x, op.y, op.size * op.life, 0, Math.PI * 2);
      orbCtx.fillStyle = 'rgba(255,150,80,' + (op.life * 0.5) + ')'; orbCtx.fill();
    }
    orbCtx.fillStyle = 'rgba(255,255,255,0.25)';
    orbCtx.font = '11px "Space Mono", monospace';
    orbCtx.textAlign = 'center';
    orbCtx.fillText('Click a planet to navigate  |  ESC to close', cx, H - 30);
  }

  function openOrbitalMap() {
    if (!orbitalCanvas) return;
    orbitalActive = true; resizeOrbital();
    orbitalCanvas.classList.add('active');
    drawOrbitalMap();
  }

  function closeOrbitalMap() {
    orbitalActive = false;
    if (orbitalCanvas) orbitalCanvas.classList.remove('active');
    orbitalParticles = [];
  }

  if (orbitalCanvas) {
    orbitalCanvas.addEventListener('mousemove', function(e) { orbitalMX = e.clientX; orbitalMY = e.clientY; });
    orbitalCanvas.addEventListener('click', function() {
      if (orbitalHover >= 0) {
        var p = planets[orbitalHover];
        closeOrbitalMap();
        if (p.section === '__github') {
          window.open('https://github.com/ArsenalRX', '_blank');
        } else {
          if (ARX.triggerWarp) ARX.triggerWarp(p.section);
          setTimeout(function() {
            var el = document.getElementById(p.section);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 600);
        }
      } else { closeOrbitalMap(); }
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && orbitalActive) { closeOrbitalMap(); e.stopPropagation(); }
  });

  ARX.terminalCommands.map = function() {
    openOrbitalMap();
    return '<span style="color:#ffaa00;">Orbital command map opened.</span>';
  };

  // Triple-click nav logo to open map
  var navLogo = document.querySelector('.nav-logo');
  var logoClickCount = 0, logoClickTimer = null;
  if (navLogo) {
    navLogo.addEventListener('click', function() {
      logoClickCount++;
      if (logoClickCount >= 3) {
        logoClickCount = 0; clearTimeout(logoClickTimer);
        openOrbitalMap(); return;
      }
      clearTimeout(logoClickTimer);
      logoClickTimer = setTimeout(function() { logoClickCount = 0; }, 500);
    });
  }
})(window.ARX);
