(function(ARX) {
  // ========== SECRETS TRACKER ==========
  var TOTAL_SECRETS = 5; // konami, bloopin, liminal, footer triple-click, 'r' click
  function getFoundSecrets() {
    try { return JSON.parse(sessionStorage.getItem('secretsFound') || '[]'); } catch (e) { return []; }
  }
  function markSecret(name) {
    var found = getFoundSecrets();
    if (found.indexOf(name) === -1) {
      found.push(name);
      try { sessionStorage.setItem('secretsFound', JSON.stringify(found)); } catch (e) {}
    }
  }

  // ========== KONAMI CODE EASTER EGG ==========
  var konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
  var konamiIndex = 0;

  document.addEventListener('keydown', function(e) {
    if (e.keyCode === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) { konamiIndex = 0; activateEasterEgg(); }
    } else { konamiIndex = 0; }
  });

  function activateEasterEgg() {
    markSecret('konami');
    document.body.style.transition = 'filter 0.5s ease';
    document.body.style.filter = 'hue-rotate(180deg)';
    setTimeout(function() { document.body.style.filter = 'hue-rotate(360deg)'; setTimeout(function() { document.body.style.filter = ''; }, 500); }, 2000);
    for (var i = 0; i < 25; i++) setTimeout(function() { if (ARX.spawnShootingStar) ARX.spawnShootingStar(); }, i * 80);
    for (var i = 0; i < 100; i++) {
      ARX.particles.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 300,
        y: window.innerHeight / 2 + (Math.random() - 0.5) * 300,
        vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
        size: Math.random() * 5 + 2, life: 1, decay: Math.random() * 0.01 + 0.005,
        color: ['255, 45, 45', '255, 107, 107', '255, 215, 0', '0, 255, 100'][Math.floor(Math.random() * 4)],
      });
    }
  }

  // ========== CLIPBOARD INTERCEPTOR ==========
  (function() {
    var toast = document.getElementById('clipboardToast');
    document.addEventListener('copy', function(e) {
      if (sessionStorage.getItem('clipIntercepted')) return;
      sessionStorage.setItem('clipIntercepted', '1');
      var sel = window.getSelection().toString();
      e.clipboardData.setData('text/plain', sel + '\n/* intercepted by arsenalrx -- you didn\'t think I\'d notice, did you? */');
      e.preventDefault();
      var hudSt = document.getElementById('hudStatus');
      if (hudSt) {
        hudSt.textContent = 'CLIPBOARD INTERCEPTED';
        hudSt.style.color = '#ff2d2d';
        setTimeout(function() { hudSt.textContent = 'NOMINAL'; hudSt.style.color = ''; }, 2000);
      }
      if (toast) {
        toast.style.left = (ARX.mouseX + 15) + 'px';
        toast.style.top = (ARX.mouseY - 30) + 'px';
        toast.classList.add('visible');
        setTimeout(function() { toast.classList.remove('visible'); }, 2500);
      }
    });
  })();

  // ========== BLOOPIN EASTER EGG ==========
  var bloopinActive = false;
  var bloopinOverlay = null, bloopinInterval = null, bloopinAudio = null;

  ARX.terminalCommands[atob('Ymxvb3Bpbg==')] = function() {
    if (bloopinActive) return '<span style="color:#00ff00;">BLOOPIN IS ALREADY HAPPENING</span>';
    bloopinActive = true;
    markSecret('bloopin');
    if (ARX.siteMusic) ARX.siteMusic.mute();

    bloopinOverlay = document.createElement('div');
    bloopinOverlay.className = 'bloopin-overlay';
    var img1 = document.createElement('img');
    img1.src = 'bloopin1.png'; img1.id = 'bloopImg1';
    var img2 = document.createElement('img');
    img2.src = 'bloopin2.png'; img2.id = 'bloopImg2'; img2.style.opacity = '0';
    var hint = document.createElement('div');
    hint.className = 'bloopin-text'; hint.textContent = 'press ESC to end the madness';
    bloopinOverlay.appendChild(img1); bloopinOverlay.appendChild(img2); bloopinOverlay.appendChild(hint);
    document.body.appendChild(bloopinOverlay);

    bloopinAudio = new Audio('music/bloopin.mp3');
    bloopinAudio.volume = 0.4; bloopinAudio.loop = true;
    bloopinAudio.play().catch(function() {});

    var showFirst = true;
    var beatMs = 60000 / 130;
    bloopinInterval = setInterval(function() {
      if (!bloopinActive) return;
      showFirst = !showFirst;
      img1.style.opacity = showFirst ? '1' : '0';
      img2.style.opacity = showFirst ? '0' : '1';
      var activeImg = showFirst ? img1 : img2;
      activeImg.classList.remove('pulse'); void activeImg.offsetWidth; activeImg.classList.add('pulse');
      bloopinOverlay.classList.remove('beat'); void bloopinOverlay.offsetWidth; bloopinOverlay.classList.add('beat');
      var rot = (Math.random() - 0.5) * 20;
      var scale = 0.9 + Math.random() * 0.3;
      activeImg.style.transform = 'rotate(' + rot + 'deg) scale(' + scale + ')';
    }, beatMs);

    return '<span style="color:#00ff00;">\n  \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\n  \u2551   \uD83D\uDC31 B L O O P I N \uD83D\uDC31        \u2551\n  \u2551   press ESC to escape       \u2551\n  \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d</span>';
  };

  // ========== LIMINAL DREAMCORE EASTER EGG ==========
  var liminalActive = false;
  var liminalOverlay = null, liminalAudio = null, liminalSlideInterval = null, liminalGlitchInterval = null;
  var liminalImages = ['liminal1.jpg', 'liminal2.jpg', 'liminal3.jpg', 'liminal4.jpg'];
  var liminalTexts = [
    { text: 'Do you remember this place?', size: '2rem', x: '15%', y: '20%' },
    { text: 'You\'ve been here before.', size: '1.4rem', x: '55%', y: '35%' },
    { text: 'The exit is behind you.', size: '1.1rem', x: '25%', y: '70%' },
    { text: 'It\'s 3:47 AM', size: '1.8rem', x: '65%', y: '60%' },
    { text: 'Nobody is coming.', size: '1rem', x: '40%', y: '85%' },
    { text: 'This isn\'t real.', size: '1.6rem', x: '10%', y: '50%' },
    { text: 'You never left.', size: '1.3rem', x: '70%', y: '15%' },
    { text: 'The lights are humming.', size: '0.9rem', x: '50%', y: '45%' },
  ];

  ARX.terminalCommands[atob('bGltaW5hbA==')] = function() {
    if (liminalActive) return '<span style="color:#c4b277;">You\'re already here.</span>';
    liminalActive = true;
    markSecret('liminal');
    if (ARX.siteMusic) ARX.siteMusic.mute();

    liminalOverlay = document.createElement('div');
    liminalOverlay.className = 'liminal-overlay';

    liminalImages.forEach(function(src, i) {
      var img = document.createElement('img');
      img.className = 'liminal-slide' + (i === 0 ? ' active' : '');
      img.src = src; img.loading = 'eager';
      liminalOverlay.appendChild(img);
    });

    var vhs = document.createElement('div'); vhs.className = 'liminal-vhs-track'; liminalOverlay.appendChild(vhs);
    var grain = document.createElement('div'); grain.className = 'liminal-grain'; liminalOverlay.appendChild(grain);
    var hum = document.createElement('div'); hum.className = 'liminal-hum'; liminalOverlay.appendChild(hum);
    var glitchFrame = document.createElement('div'); glitchFrame.className = 'liminal-glitch-frame'; liminalOverlay.appendChild(glitchFrame);

    liminalTexts.forEach(function(t, i) {
      var el = document.createElement('div'); el.className = 'liminal-text';
      el.textContent = t.text;
      el.style.cssText = 'font-size:' + t.size + '; left:' + t.x + '; top:' + t.y + '; animation-delay:' + (i * -1.2) + 's;';
      liminalOverlay.appendChild(el);
    });

    var ts = document.createElement('div'); ts.className = 'liminal-timestamp';
    ts.textContent = 'REC \u25cf 03:47 AM \u2014 2009/07/14'; liminalOverlay.appendChild(ts);
    var hint = document.createElement('div'); hint.className = 'liminal-hint';
    hint.textContent = 'press ESC to wake up'; liminalOverlay.appendChild(hint);
    document.body.appendChild(liminalOverlay);

    liminalAudio = new Audio('music/liminal.mp3');
    liminalAudio.volume = 0.25; liminalAudio.loop = true;
    liminalAudio.play().catch(function() {});

    var currentSlide = 0;
    var slides = liminalOverlay.querySelectorAll('.liminal-slide');
    liminalSlideInterval = setInterval(function() {
      if (!liminalActive) return;
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, 6000);

    liminalGlitchInterval = setInterval(function() {
      if (!liminalActive) return;
      if (Math.random() > 0.6) {
        glitchFrame.classList.remove('flash'); void glitchFrame.offsetWidth; glitchFrame.classList.add('flash');
      }
    }, 4000);

    return '<span style="color:#c4b277; font-family: \'Times New Roman\', serif;">\n  . . . . . . . . . . . . . . . . .\n\n      You noclipped out of reality.\n\n      The fluorescent lights are humming.\n      The shelves are empty.\n      You\'ve been here before.\n\n      press ESC to wake up\n\n  . . . . . . . . . . . . . . . . .</span>';
  };

  // Escape key to exit easter eggs
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && (bloopinActive || liminalActive)) {
      ARX.terminalCommands.stop();
    }
  });

  // Double-tap to exit on mobile
  var lastTapTime = 0;
  document.addEventListener('touchend', function() {
    if (!bloopinActive && !liminalActive) return;
    var now = Date.now();
    if (now - lastTapTime < 400) { ARX.terminalCommands.stop(); lastTapTime = 0; }
    else { lastTapTime = now; }
  });

  // Stop command
  ARX.terminalCommands.stop = function() {
    if (liminalActive) {
      liminalActive = false;
      if (liminalSlideInterval) { clearInterval(liminalSlideInterval); liminalSlideInterval = null; }
      if (liminalGlitchInterval) { clearInterval(liminalGlitchInterval); liminalGlitchInterval = null; }
      if (liminalOverlay) {
        liminalOverlay.style.transition = 'opacity 1.5s ease'; liminalOverlay.style.opacity = '0';
        setTimeout(function() { if (liminalOverlay) { liminalOverlay.remove(); liminalOverlay = null; } }, 1500);
      }
      if (liminalAudio) {
        var fadeOut = setInterval(function() {
          if (liminalAudio && liminalAudio.volume > 0.02) {
            liminalAudio.volume = Math.max(0, liminalAudio.volume - 0.03);
          } else {
            if (liminalAudio) { liminalAudio.pause(); liminalAudio = null; }
            clearInterval(fadeOut);
          }
        }, 50);
      }
      if (ARX.siteMusic && !ARX.siteMusic.muted) ARX.siteMusic.unmute();
      return '<span style="color:#c4b277; font-family: \'Times New Roman\', serif;">You wake up. Was it real?</span>';
    }
    if (bloopinActive) {
      bloopinActive = false;
      if (bloopinInterval) { clearInterval(bloopinInterval); bloopinInterval = null; }
      if (bloopinOverlay) { bloopinOverlay.remove(); bloopinOverlay = null; }
      if (bloopinAudio) { bloopinAudio.pause(); bloopinAudio = null; }
      if (ARX.siteMusic && !ARX.siteMusic.muted) ARX.siteMusic.unmute();
      return '<span style="color:#f85149;">Bloopin stopped. You survived.</span>';
    }
    return 'Nothing to stop.';
  };

  // ========== SECRETS COMMAND ==========
  ARX.terminalCommands.secrets = function() {
    var found = getFoundSecrets();
    var count = found.length;
    var names = ['konami', 'bloopin', 'liminal', 'footer', 'hint-r'];
    var labels = ['Konami Code', 'Bloopin', 'Liminal Space', 'Footer Secret', 'The Hidden R'];
    var html = '<span style="color:var(--accent2);">\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\n\u2551  SECRETS: ' + count + '/' + TOTAL_SECRETS + ' discovered             \u2551\n\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563\n';
    for (var i = 0; i < names.length; i++) {
      var discovered = found.indexOf(names[i]) !== -1;
      var icon = discovered ? '<span style="color:#00ff66;">\u2713</span>' : '<span style="color:var(--text-dim);">\u2022</span>';
      var label = discovered ? '<span class="cmd-highlight">' + labels[i] + '</span>' : '<span style="color:var(--text-dim);">' + labels[i] + '</span>';
      html += '\u2551  ' + icon + ' ' + label;
      // pad to align
      var pad = 32 - labels[i].length;
      for (var j = 0; j < pad; j++) html += ' ';
      html += '\u2551\n';
    }
    html += '\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d</span>';
    if (count === TOTAL_SECRETS) html += '\n<span style="color:#00ff66;">All secrets found! You are a true explorer.</span>';
    return html;
  };

  // ========== HIDDEN HINT ==========
  function setupSecretHint() {
    var terminalTitle = document.querySelector('#terminal .section-title .title-text');
    if (!terminalTitle) return;
    var checkChars = setInterval(function() {
      var chars = terminalTitle.querySelectorAll('.title-char');
      if (chars.length === 0) return;
      clearInterval(checkChars);
      chars.forEach(function(charEl) {
        var letter = charEl.textContent.toLowerCase();
        var idx = Array.from(chars).indexOf(charEl);
        if (idx === 14 && letter === 'r') {
          charEl.classList.add('secret-hint');
          charEl.addEventListener('click', function() {
            markSecret('hint-r');
            var secretLine = document.createElement('div');
            secretLine.className = 'terminal-line';
            var _s1 = atob('Ymxvb3Bpbg=='), _s2 = atob('bGltaW5hbA==');
            secretLine.innerHTML = '<span class="terminal-output" style="color: var(--accent2);">\n  \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\n  \u2551  SECRET COMMANDS UNLOCKED        \u2551\n  \u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563\n  \u2551  <span class="cmd-highlight">' + _s1 + '</span>  \u2014 \uD83D\uDC31 alien cat madness   \u2551\n  \u2551  <span class="cmd-highlight">' + _s2 + '</span>  \u2014 noclip out of reality  \u2551\n  \u2551  <span class="cmd-highlight">ESC</span>      \u2014 end the madness        \u2551\n  \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d</span>';
            if (ARX.terminalBody) {
              ARX.terminalBody.appendChild(secretLine);
              ARX.terminalBody.scrollTop = ARX.terminalBody.scrollHeight;
            }
            document.querySelector('#terminal').scrollIntoView({ behavior: 'smooth' });
            charEl.style.color = 'var(--accent)';
            charEl.style.textShadow = '0 0 10px var(--accent-glow)';
            setTimeout(function() { charEl.style.color = ''; charEl.style.textShadow = ''; }, 1500);
          });
        }
      });
    }, 500);
  }
  setupSecretHint();

  // Mark footer triple-click secret
  var footerContent = document.getElementById('footerContent');
  if (footerContent) {
    var footerClicks = 0, footerClickTimer = null;
    footerContent.addEventListener('click', function() {
      footerClicks++;
      clearTimeout(footerClickTimer);
      footerClickTimer = setTimeout(function() { footerClicks = 0; }, 500);
      if (footerClicks >= 3) {
        footerClicks = 0;
        markSecret('footer');
      }
    });
  }
})(window.ARX);
