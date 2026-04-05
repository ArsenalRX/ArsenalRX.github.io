(function(ARX) {
  var hudSys = document.getElementById('hudSys');
  var hudSignal = document.getElementById('hudSignal');
  var hudStatus = document.getElementById('hudStatus');
  var hudSector = document.getElementById('hudSector');
  var hudAddr = document.getElementById('hudAddr');
  var hudReadouts = document.querySelectorAll('.hud-readout');

  var sectorNames = {
    home: 'HOME', about: 'IDENT', projects: 'OPS',
    skills: 'ARSENAL', terminal: 'CLI', contact: 'COMMS'
  };
  var sectorAddrs = {
    home: '0xFF01', about: '0xAB02', projects: '0xC303',
    skills: '0xD404', terminal: '0xE505', contact: '0xF606'
  };

  function randomHex() {
    return '0x' + Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  }

  // Flicker the HUD values
  setInterval(function() {
    if (hudSys && Math.random() > 0.7) {
      hudSys.textContent = randomHex();
      hudSys.style.opacity = '0.5';
      setTimeout(function() { hudSys.style.opacity = '1'; }, 100);
    }
    if (hudAddr && Math.random() > 0.8) {
      var origAddr = hudAddr.textContent;
      hudAddr.textContent = randomHex();
      setTimeout(function() { hudAddr.textContent = origAddr; }, 150);
    }
    if (hudSignal && Math.random() > 0.85) {
      var bars = Math.floor(Math.random() * 4) + 1;
      hudSignal.textContent = '|'.repeat(bars) + ' '.repeat(4 - bars);
      setTimeout(function() { hudSignal.textContent = '||||'; }, 200);
    }
  }, ARX.HUD_FLICKER_INTERVAL);

  // Update HUD sector on scroll
  var currentHudSector = 'home';
  ARX.updateHudSector = function(sectionId) {
    if (sectionId === currentHudSector) return;
    currentHudSector = sectionId;
    if (hudSector) hudSector.textContent = sectorNames[sectionId] || sectionId.toUpperCase();
    if (hudAddr) hudAddr.textContent = sectorAddrs[sectionId] || randomHex();
  };

  // BREACH mode on warp jump
  function hudBreach() {
    hudReadouts.forEach(function(h) { h.classList.add('breach'); });
    if (hudStatus) hudStatus.textContent = 'BREACH';
    if (hudSys) hudSys.textContent = randomHex();
    if (hudSignal) hudSignal.textContent = '||| ';
    setTimeout(function() {
      hudReadouts.forEach(function(h) { h.classList.remove('breach'); });
      if (hudStatus) hudStatus.textContent = 'NOMINAL';
      if (hudSignal) hudSignal.textContent = '||||';
    }, 1500);
  }
  ARX.hudBreach = hudBreach;

  // ========== SESSION COUNTER ==========
  function trackSession() {
    var hudSessions = document.getElementById('hudVisitors');
    if (!hudSessions) return;
    try {
      if (!sessionStorage.getItem('arsenalrx-session-counted')) {
        var count = parseInt(localStorage.getItem('arsenalrx-sessions') || '0');
        count++;
        localStorage.setItem('arsenalrx-sessions', count.toString());
        sessionStorage.setItem('arsenalrx-session-counted', '1');
      }
      var count = parseInt(localStorage.getItem('arsenalrx-sessions') || '0');
      hudSessions.textContent = count.toLocaleString();
    } catch (e) {
      hudSessions.textContent = '---';
    }
  }
  trackSession();
})(window.ARX);
