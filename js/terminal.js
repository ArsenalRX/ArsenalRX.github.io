(function(ARX) {
  var terminalInput = document.getElementById('terminalInput');
  var terminalBody = document.getElementById('terminalBody');
  ARX.terminalInput = terminalInput;
  ARX.terminalBody = terminalBody;

  var commandHistory = [];
  var historyIndex = -1;

  var terminalCommands = {
    help: function() { return 'Loading...'; }, // overwritten at bottom

    about: function() { return 'Hi! I\'m <span class="cmd-highlight">Evan</span>, aka <span class="cmd-highlight">ArsenalRX</span>.\n  I\'m a developer who loves building interactive web experiences,\n  exploring AI, and turning ideas into reality through code.\n  When I\'m not coding, I play hockey and ride dirtbikes.'; },

    skills: function() { return '<span class="cmd-highlight">Languages:</span> Python, JavaScript, TypeScript, C#, C++, Rust\n  <span class="cmd-highlight">Frameworks:</span> React, .NET, Node.js\n  <span class="cmd-highlight">Tools:</span> Docker, Git, Linux, Windows, Fedora\n  <span class="cmd-highlight">Interests:</span> AI/ML, Systems Programming, UI/UX'; },

    projects: function() { document.querySelector('#projects').scrollIntoView({ behavior: 'smooth' }); return 'Navigating to projects...'; },

    contact: function() { return 'Email: <span class="cmd-highlight">faterivalz@gmail.com</span>\n  GitHub: <span class="cmd-highlight">github.com/ArsenalRX</span>'; },

    github: function() { window.open('https://github.com/ArsenalRX', '_blank'); return 'Opening GitHub profile...'; },

    neofetch: function() { return '<span class="cmd-highlight">\n       ___      </span>  visitor@arsenalrx\n<span class="cmd-highlight">      /   \\     </span>  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n<span class="cmd-highlight">     / E.  \\    </span>  <span class="cmd-highlight">OS:</span> Web Browser\n<span class="cmd-highlight">    /  ___  \\   </span>  <span class="cmd-highlight">Host:</span> arsenalrx.github.io\n<span class="cmd-highlight">   /  /   \\  \\  </span>  <span class="cmd-highlight">Resolution:</span> ' + window.innerWidth + 'x' + window.innerHeight + '\n<span class="cmd-highlight">  /__/     \\__\\ </span>  <span class="cmd-highlight">Theme:</span> Space Dark\n                  <span class="cmd-highlight">Terminal:</span> ArsenalRX v1.0\n                  <span class="cmd-highlight">Projects:</span> ' + document.querySelectorAll('.project-card').length + '\n                  <span class="cmd-highlight">Uptime:</span> Always online'; },

    ls: function() { return '<span style="color:#58a6ff;">projects/</span>  <span style="color:#58a6ff;">skills/</span>  <span style="color:#58a6ff;">config/</span>\n  index.html   style.css    script.js\n  README.md    .gitignore   package.json'; },

    cat: function() { return 'Usage: cat <filename>\n  Try: cat README.md'; },

    'cat readme.md': function() { return '# ArsenalRX Portfolio\n  Built with vanilla HTML, CSS, and JavaScript.\n  Featuring: starfield, particle trails, and space vibes.\n  <span class="cmd-highlight">*</span> Zero frameworks. Pure code.'; },

    secret: function() { return '<span style="color: var(--accent2);">\n  \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\n  \u2551  You found the secret!          \u2551\n  \u2551  Try the Konami Code too ;)     \u2551\n  \u2551  \u2191\u2191\u2193\u2193\u2190\u2192\u2190\u2192BA                    \u2551\n  \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d</span>'; },

    hack: function() {
      document.body.style.transition = 'filter 0.3s';
      document.body.style.filter = 'hue-rotate(120deg) saturate(2)';
      for (var i = 0; i < 25; i++) setTimeout(function() { if (ARX.spawnShootingStar) ARX.spawnShootingStar(); }, i * 80);
      setTimeout(function() { document.body.style.filter = ''; }, 3000);
      return '<span style="color:#00ff00;">\n  [*] Accessing mainframe...\n  [*] Bypassing firewall.......done\n  [*] Decrypting files..........done\n  [*] Access granted.\n  [!] Just kidding. Nice try though ;)</span>';
    },

    clear: function() { return '__CLEAR__'; },
    date: function() { return 'Current date: <span class="cmd-highlight">' + new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + '</span>'; },
    whoami: function() { return 'You are a <span class="cmd-highlight">visitor</span> exploring Evan\'s portfolio. Welcome!'; },

    music: function() {
      if (ARX.siteMusic) ARX.siteMusic.toggle();
      return (ARX.siteMusic && ARX.siteMusic.muted)
        ? '<span style="color:#f85149;">\u266a Music: MUTED</span>'
        : '<span style="color:#00ff66;">\u266a Music: ON</span> \u2014 Now playing: <span class="cmd-highlight">Snowfall</span>';
    },

    theme: function() {
      var themeActive = terminalCommands._themeActive;
      if (themeActive) return 'Theme is already shifting...';
      terminalCommands._themeActive = true;
      var hues = [120, 200, 280, 60, 0];
      var idx = 0;
      document.body.style.transition = 'filter 0.5s ease';
      var cycle = setInterval(function() {
        document.body.style.filter = 'hue-rotate(' + hues[idx] + 'deg)';
        idx++;
        if (idx >= hues.length) {
          clearInterval(cycle);
          setTimeout(function() { document.body.style.filter = ''; terminalCommands._themeActive = false; }, 1000);
        }
      }, 800);
      return '<span style="color:#00ff66;">[*] Cycling color schemes...</span> Returning to default in ' + (hues.length + 1) + ' seconds.';
    },
    _themeActive: false,

    matrix: function() {
      var matrixCanvas = document.createElement('canvas');
      matrixCanvas.className = 'matrix-flood';
      matrixCanvas.width = window.innerWidth;
      matrixCanvas.height = window.innerHeight;
      document.body.appendChild(matrixCanvas);
      var mCtx = matrixCanvas.getContext('2d');
      var cols = Math.floor(matrixCanvas.width / 16);
      var drops = Array(cols).fill(0);
      var matrixChars = '\u30A2\u30A4\u30A6\u30A8\u30AA\u30AB\u30AD\u30AF\u30B1\u30B3\u30B5\u30B7\u30B9\u30BB\u30BD\u30BF\u30C1\u30C4\u30C6\u30C8\u30CA\u30CB\u30CC\u30CD\u30CE\u30CF\u30D2\u30D5\u30D8\u30DB\u30DE\u30DF\u30E0\u30E1\u30E2\u30E4\u30E6\u30E8\u30E9\u30EA\u30EB\u30EC\u30ED\u30EF\u30F2\u30F30123456789ABCDEF';
      var frames = 0;
      var maxFrames = 150;
      function drawMatrix() {
        mCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        mCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
        mCtx.font = '14px "Space Mono", monospace';
        for (var i = 0; i < drops.length; i++) {
          var char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          mCtx.fillStyle = Math.random() > 0.95 ? '#fff' : 'rgba(0, 255, 0, ' + (0.5 + Math.random() * 0.5) + ')';
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
          setTimeout(function() { matrixCanvas.remove(); }, 500);
        }
      }
      drawMatrix();
      return '<span style="color:#00ff00;">[*] Entering the Matrix...</span> Wake up, Neo.';
    },

    weather: function() {
      var loadingLine = document.createElement('div');
      loadingLine.className = 'terminal-line';
      loadingLine.innerHTML = '<span class="terminal-output" style="color:#ffb432;">Fetching weather data...</span>';
      terminalBody.appendChild(loadingLine);
      terminalBody.scrollTop = terminalBody.scrollHeight;
      fetch('https://wttr.in/?format=%l:+%C+%t+%w+%h').then(function(res) {
        return res.text();
      }).then(function(text) {
        loadingLine.innerHTML = '<span class="terminal-output"><span class="cmd-highlight">Weather Report:</span> ' + text.trim() + '</span>';
      }).catch(function() {
        loadingLine.innerHTML = '<span class="terminal-output" style="color:#f85149;">Failed to fetch weather data. Try again later.</span>';
      }).finally(function() {
        terminalBody.scrollTop = terminalBody.scrollHeight;
      });
      return null;
    },

    trail: function() {
      var trailModes = [
        { name: 'Crimson (default)', colors: ['255, 45, 45', '255, 107, 107'] },
        { name: 'Cyber Blue', colors: ['0, 180, 255', '0, 230, 255'] },
        { name: 'Toxic Green', colors: ['0, 255, 100', '100, 255, 0'] },
        { name: 'Gold', colors: ['255, 200, 0', '255, 165, 0'] },
        { name: 'Purple Haze', colors: ['180, 0, 255', '255, 0, 200'] },
      ];
      terminalCommands._trailMode = ((terminalCommands._trailMode || 0) + 1) % trailModes.length;
      return 'Cursor trail: <span class="cmd-highlight">' + trailModes[terminalCommands._trailMode].name + '</span>';
    },
    _trailMode: 0,

    stop: function() { return 'Nothing to stop.'; },
  };
  ARX.terminalCommands = terminalCommands;

  if (terminalInput) {
    terminalInput.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) { historyIndex++; terminalInput.value = commandHistory[commandHistory.length - 1 - historyIndex]; }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex > 0) { historyIndex--; terminalInput.value = commandHistory[commandHistory.length - 1 - historyIndex]; }
        else { historyIndex = -1; terminalInput.value = ''; }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        var partial = terminalInput.value.trim().toLowerCase();
        var match = Object.keys(terminalCommands).find(function(cmd) { return cmd.startsWith(partial) && cmd !== partial && !cmd.startsWith('_'); });
        if (match) terminalInput.value = match;
      } else if (e.key === 'Enter') {
        var cmd = terminalInput.value.trim().toLowerCase();
        if (!cmd) return;
        commandHistory.push(cmd);
        historyIndex = -1;

        var cmdLine = document.createElement('div');
        cmdLine.className = 'terminal-line';
        cmdLine.innerHTML = '<span class="terminal-prompt">visitor@arsenalrx:~$</span> ' + cmd;
        terminalBody.appendChild(cmdLine);

        if (terminalCommands[cmd]) {
          var result = terminalCommands[cmd]();
          if (result === '__CLEAR__') { terminalBody.innerHTML = ''; }
          else if (result === null || result === undefined) { /* async */ }
          else if (result instanceof Promise) {
            result.then(function(r) { if (r) { var ol = document.createElement('div'); ol.className = 'terminal-line'; ol.innerHTML = '<span class="terminal-output">' + r + '</span>'; terminalBody.appendChild(ol); terminalBody.scrollTop = terminalBody.scrollHeight; } });
          } else {
            var outputLine = document.createElement('div');
            outputLine.className = 'terminal-line';
            outputLine.innerHTML = '<span class="terminal-output">' + result + '</span>';
            terminalBody.appendChild(outputLine);
          }
        } else {
          var errorLine = document.createElement('div');
          errorLine.className = 'terminal-line';
          errorLine.innerHTML = '<span class="terminal-output" style="color: #f85149;">Command not found: ' + cmd + '. Type <span class="cmd-highlight">help</span> for available commands.</span>';
          terminalBody.appendChild(errorLine);
        }
        terminalInput.value = '';
        terminalBody.scrollTop = terminalBody.scrollHeight;
      }
    });
  }

  // ========== TERMINAL AUTO-DEMO MODE ==========
  var terminalIdleTimer = null;
  var autoDemo = false;
  var demoCommands = ['help', 'neofetch', 'skills', 'ls', 'about'];
  var demoIndex = 0;

  function startAutoDemo() {
    if (autoDemo) return;
    autoDemo = true;
    demoIndex = 0;
    runDemoStep();
  }

  function runDemoStep() {
    if (!autoDemo || demoIndex >= demoCommands.length) { autoDemo = false; return; }
    var cmd = demoCommands[demoIndex];
    var i = 0;
    terminalInput.value = '';
    var typeInterval = setInterval(function() {
      terminalInput.value += cmd[i]; i++;
      if (i >= cmd.length) {
        clearInterval(typeInterval);
        setTimeout(function() {
          terminalInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
          demoIndex++;
          setTimeout(runDemoStep, ARX.TERMINAL_DEMO_STEP_DELAY);
        }, 500);
      }
    }, ARX.TERMINAL_DEMO_TYPE_SPEED);
  }

  function resetIdleTimer() {
    if (autoDemo) { autoDemo = false; }
    clearTimeout(terminalIdleTimer);
    terminalIdleTimer = setTimeout(startAutoDemo, ARX.TERMINAL_IDLE_TIMEOUT);
  }

  var terminalSection = document.getElementById('terminal');
  var terminalObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) resetIdleTimer();
      else { clearTimeout(terminalIdleTimer); autoDemo = false; }
    });
  }, { threshold: 0.3 });
  if (terminalSection) terminalObserver.observe(terminalSection);
  if (terminalInput) {
    terminalInput.addEventListener('focus', function() { autoDemo = false; clearTimeout(terminalIdleTimer); });
    terminalInput.addEventListener('blur', resetIdleTimer);
  }

  // Final help command (after all commands registered)
  terminalCommands.help = function() { return 'Available commands:\n  <span class="cmd-highlight">about</span>      - Learn about me\n  <span class="cmd-highlight">skills</span>     - View my skills\n  <span class="cmd-highlight">projects</span>   - See my projects\n  <span class="cmd-highlight">contact</span>    - How to reach me\n  <span class="cmd-highlight">github</span>     - Open my GitHub\n  <span class="cmd-highlight">neofetch</span>   - System info\n  <span class="cmd-highlight">ls</span>         - List project files\n  <span class="cmd-highlight">whoami</span>     - Who are you?\n  <span class="cmd-highlight">date</span>       - Current date\n  <span class="cmd-highlight">music</span>      - Toggle music on/off\n  <span class="cmd-highlight">theme</span>      - Cycle color schemes\n  <span class="cmd-highlight">matrix</span>     - Enter the Matrix\n  <span class="cmd-highlight">weather</span>    - Current weather\n  <span class="cmd-highlight">trail</span>      - Change cursor trail color\n  <span class="cmd-highlight">ghost</span>      - Toggle ghost cursor\n  <span class="cmd-highlight">sniff</span>      - Toggle packet sniffer\n  <span class="cmd-highlight">visualize</span>  - Music-reactive visualizer\n  <span class="cmd-highlight">map</span>        - Orbital command map\n  <span class="cmd-highlight">secret</span>     - ???\n  <span class="cmd-highlight">hack</span>       - Hack the mainframe\n  <span class="cmd-highlight">clear</span>      - Clear terminal'; };
})(window.ARX);
