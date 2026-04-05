(function(ARX) {
  // ========== ARRIVAL PULSE ==========
  var arrivalPulse = document.getElementById('arrivalPulse');
  var sectionColors = {
    home: '#ff2d2d', about: '#ff2d2d', projects: '#ff6b6b',
    skills: '#ff2d2d', terminal: '#00ff66', contact: '#ff6b6b',
  };

  function fireArrivalPulse(sectionId) {
    if (!arrivalPulse) return;
    arrivalPulse.classList.remove('active');
    arrivalPulse.style.borderColor = sectionColors[sectionId] || 'var(--accent)';
    void arrivalPulse.offsetWidth;
    arrivalPulse.classList.add('active');
    setTimeout(function() { arrivalPulse.classList.remove('active'); }, 900);
  }
  ARX.fireArrivalPulse = fireArrivalPulse;

  // ========== WARP TUNNEL ON NAV JUMP ==========
  var warpOverlay = document.getElementById('warpOverlay');
  ARX._warpOverlay = warpOverlay;

  function triggerWarp(targetSectionId) {
    ARX.warpStrength = ARX.WARP_INITIAL_STRENGTH;
    if (warpOverlay) warpOverlay.classList.add('active');
    if (ARX.fireGlitch) ARX.fireGlitch();
    if (ARX.hudBreach) ARX.hudBreach();

    document.querySelectorAll('.nebula').forEach(function(n) {
      n.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      n.style.opacity = '0.35';
      n.style.transform = 'scale(1.15)';
    });

    setTimeout(function() {
      if (warpOverlay) {
        warpOverlay.classList.remove('active');
        warpOverlay.classList.add('flash');
        warpOverlay.style.background = 'radial-gradient(circle at center, ' + (sectionColors[targetSectionId] || 'rgba(255,255,255,0.3)') + '33 0%, transparent 60%)';
      }
      for (var i = 0; i < 6; i++) setTimeout(function() { if (ARX.spawnShootingStar) ARX.spawnShootingStar(); }, i * 50);
    }, 500);

    setTimeout(function() {
      if (warpOverlay) {
        warpOverlay.classList.remove('flash');
        warpOverlay.style.background = '';
      }
      fireArrivalPulse(targetSectionId);
      document.querySelectorAll('.nebula').forEach(function(n) {
        n.style.transition = 'opacity 1.5s ease, transform 1.5s ease';
        n.style.opacity = '';
        n.style.transform = '';
      });
    }, 900);
  }
  ARX.triggerWarp = triggerWarp;

  // ========== WARP SPEED ON FAST SCROLL ==========
  var lastScrollY = 0, scrollSpeed = 0;
  var starfieldCanvas = document.getElementById('starfield');
  var nav = document.getElementById('nav');
  var sections = document.querySelectorAll('.section');
  var navLinks = document.querySelectorAll('.nav-link');
  var rocketBtn = document.getElementById('rocketBtn');
  var scrollIndicator = document.getElementById('scrollIndicator');
  var _scrollTicking = false;

  window.addEventListener('scroll', function() {
    var currentY = window.scrollY;
    scrollSpeed = Math.abs(currentY - lastScrollY);
    lastScrollY = currentY;

    if (!_scrollTicking) {
      _scrollTicking = true;
      requestAnimationFrame(function() {
        var sy = window.scrollY;
        if (scrollSpeed > ARX.SCROLL_WARP_THRESHOLD) {
          var stretch = Math.min(1 + scrollSpeed * 0.002, 1.1);
          starfieldCanvas.style.transition = 'none';
          starfieldCanvas.style.transform = 'scaleY(' + stretch + ')';
          starfieldCanvas.style.filter = 'blur(' + Math.min(scrollSpeed * 0.03, 2) + 'px) brightness(1.15)';
          if (scrollSpeed > 60 && Math.random() > 0.6 && ARX.spawnShootingStar) ARX.spawnShootingStar();
        }
        nav.classList.toggle('scrolled', sy > 50);
        if (scrollIndicator) scrollIndicator.style.opacity = sy > 100 ? '0' : '1';
        var current = 'home';
        sections.forEach(function(section) { if (sy >= section.offsetTop - 200) current = section.getAttribute('id'); });
        navLinks.forEach(function(link) { link.classList.toggle('active', link.dataset.section === current); });
        if (ARX.updateHudSector) ARX.updateHudSector(current);
        rocketBtn.classList.toggle('visible', sy > 500);
        _scrollTicking = false;
      });
    }
  }, { passive: true });

  // Scroll speed decay
  setInterval(function() {
    if (scrollSpeed < 5) {
      starfieldCanvas.style.transition = 'transform 0.6s ease, filter 0.6s ease';
      starfieldCanvas.style.transform = 'scaleY(1)';
      starfieldCanvas.style.filter = 'none';
    }
    scrollSpeed *= 0.8;
  }, ARX.SCROLL_DECAY_INTERVAL);

  // Rocket button
  rocketBtn.addEventListener('click', function() {
    rocketBtn.classList.add('launching');
    triggerWarp('home');
    for (var i = 0; i < 20; i++) {
      (function(idx) {
        setTimeout(function() {
          ARX.particles.push({
            x: window.innerWidth - 56 + (Math.random() - 0.5) * 10,
            y: window.innerHeight - 56 + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 3, vy: Math.random() * 3 + 1,
            size: Math.random() * 4 + 1, life: 1, decay: 0.02,
            color: Math.random() > 0.5 ? '255, 165, 0' : '255, 215, 0',
          });
        }, idx * 30);
      })(i);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(function() { rocketBtn.classList.remove('launching'); }, 800);
  });

  // ========== MOBILE MENU ==========
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  hamburger.addEventListener('click', function() { mobileMenu.classList.toggle('open'); });
  document.querySelectorAll('.mobile-link').forEach(function(link) {
    link.addEventListener('click', function() { mobileMenu.classList.remove('open'); });
  });

  // ========== SMOOTH SCROLL WITH WARP TUNNEL ==========
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      var href = this.getAttribute('href');
      var target = document.querySelector(href);
      if (target) {
        var sectionId = href.replace('#', '');
        triggerWarp(sectionId);
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})(window.ARX);
