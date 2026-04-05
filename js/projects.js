(function(ARX) {
  // ========== PROJECT COUNT + STATS ==========
  function animateCount(el, target) {
    var current = 0;
    var step = Math.ceil(target / 30);
    var timer = setInterval(function() {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); el.classList.add('counted'); }
      el.textContent = current;
    }, 50);
  }

  // ========== 3D TILT ON PROJECT CARDS ==========
  var _tiltRAF = null;
  function tiltCard(e, card) {
    if (_tiltRAF) return;
    _tiltRAF = requestAnimationFrame(function() {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = 'perspective(' + ARX.CARD_TILT_PERSPECTIVE + 'px) rotateY(' + (x * ARX.TILT_MAX_DEG) + 'deg) rotateX(' + (-y * ARX.TILT_MAX_DEG) + 'deg) translateY(-4px)';
      _tiltRAF = null;
    });
  }
  function resetCard(card) { card.style.transform = ''; }

  // Event delegation for project card tilt
  var projectsContainer = document.getElementById('projects');
  if (projectsContainer) {
    projectsContainer.addEventListener('mousemove', function(e) {
      if (window.matchMedia('(pointer: coarse)').matches) return;
      var card = e.target.closest('.project-card');
      if (card) tiltCard(e, card);
    }, { passive: true });
    projectsContainer.addEventListener('mouseleave', function(e) {
      var card = e.target.closest('.project-card');
      if (card) resetCard(card);
    }, { passive: true });
    projectsContainer.addEventListener('mouseout', function(e) {
      var card = e.target.closest('.project-card');
      if (card && !card.contains(e.relatedTarget)) resetCard(card);
    }, { passive: true });
  }

  // ========== FETCH GITHUB STATS ==========
  (function() {
    var projectEl = document.getElementById('statProjects');
    var commitEl = document.getElementById('statCommits');

    function loadCache() {
      try { return JSON.parse(localStorage.getItem('ghStats') || '{}'); } catch (e) { return {}; }
    }

    var cached = loadCache();
    if (cached.ts && Date.now() - cached.ts < ARX.GITHUB_CACHE_TTL) {
      if (projectEl) animateCount(projectEl, cached.repos);
      if (commitEl) animateCount(commitEl, cached.commits);
      return;
    }

    fetch('https://api.github.com/users/ArsenalRX/repos?per_page=100&type=owner').then(function(reposRes) {
      var remaining = reposRes.headers.get('X-RateLimit-Remaining');
      if (remaining !== null && parseInt(remaining, 10) < 5) {
        if (cached.repos) {
          if (projectEl) animateCount(projectEl, cached.repos);
          if (commitEl) animateCount(commitEl, cached.commits);
          return Promise.reject('rate-limited');
        }
      }
      if (!reposRes.ok) throw new Error('HTTP ' + reposRes.status);
      return reposRes.json();
    }).then(function(repos) {
      if (!Array.isArray(repos)) throw new Error('bad response');
      if (projectEl) animateCount(projectEl, repos.length);

      return Promise.all(repos.map(function(repo) {
        return fetch('https://api.github.com/repos/ArsenalRX/' + repo.name + '/commits?per_page=1').then(function(r) {
          if (!r.ok) return 0;
          var link = r.headers.get('Link');
          if (link) {
            var match = link.match(/page=(\d+)>; rel="last"/);
            if (match) return parseInt(match[1], 10);
          }
          return r.json().then(function(data) { return Array.isArray(data) ? data.length : 0; });
        }).catch(function() { return 0; });
      })).then(function(counts) {
        var total = counts.reduce(function(s, n) { return s + n; }, 0);
        if (commitEl) animateCount(commitEl, total || 0);
        try { localStorage.setItem('ghStats', JSON.stringify({ repos: repos.length, commits: total || 0, ts: Date.now() })); } catch (e) {}
      });
    }).catch(function(err) {
      if (err === 'rate-limited') return;
      var stale = loadCache();
      if (stale.repos) {
        if (projectEl) animateCount(projectEl, stale.repos);
        if (commitEl) animateCount(commitEl, stale.commits);
      } else {
        if (projectEl) { projectEl.textContent = '?'; projectEl.title = 'GitHub API unavailable'; }
        if (commitEl) { commitEl.textContent = '?'; commitEl.title = 'GitHub API unavailable'; }
      }
    });
  })();

  // ========== PROJECT MODALS ==========
  var projectDetails = {
    'Nexus': {
      desc: 'A local abliterated 9B AI model with machine learning features built specifically for anti-cheat development and detection.',
      features: [
        'Real-time game memory pattern analysis',
        'Feature extraction from process behavior & API calls',
        'Local inference \u2014 no cloud dependency',
        'Custom ML pipeline for cheat signature detection',
      ],
      tech: ['Python', 'PyTorch', 'ML/AI'],
      status: 'Early Development',
      timeline: 'Started Oct 2025 \u2014 Active',
      preview: 'img/nexus.png',
      details: '<h4>Technical Breakdown</h4><p>Uses a fine-tuned 9B parameter model running locally for real-time analysis of game memory patterns. The ML pipeline handles feature extraction from process behavior, memory allocation patterns, and API call sequences to identify cheat signatures.</p>',
    },
    'Lightkeeper': {
      desc: 'A USCG ATON workplan tool \u2014 downloads Light List data, provides interactive maps across all 9 districts, and generates optimized multi-day trip workplans with route planning.',
      features: [
        'Downloads & parses official USCG Light List data',
        'Interactive Leaflet maps across all 9 USCG districts',
        'Multi-day trip optimization with route planning',
        'Offline-first with SQLite storage',
      ],
      tech: ['Python', 'Electron', 'Leaflet', 'SQLite'],
      status: 'Early Access \u2014 Testing',
      timeline: 'Started Oct 2025 \u2014 Active',
      preview: 'img/lightkeeper.png',
      details: '<h4>Technical Breakdown</h4><p>Built with Python backend and Electron frontend. Parses USCG Light List data, renders interactive Leaflet maps, and uses optimization algorithms to generate efficient multi-day route plans. Handles offline-first data with SQLite storage.</p>',
      link: 'https://github.com/ArsenalRX/lightkeeper-releases/releases/tag/v0.8.9.3',
    },
    'Imperium': {
      desc: 'A Windows hardware identity spoofer with a modern WPF interface and kernel-mode driver. Randomizes hardware fingerprints to make your PC appear as a different machine.',
      features: [
        'Kernel-mode driver for hardware ID interception',
        'Modern WPF interface for identity management',
        'Profile system for saving spoofed configurations',
        'Randomized fingerprint generation',
      ],
      tech: ['C#', 'C++', 'WPF', 'Kernel Driver'],
      status: 'Early Development',
      timeline: 'Started Oct 2025 \u2014 Active',
      preview: 'img/imperium.png',
      details: '<h4>Technical Breakdown</h4><p>Combines a WPF desktop app with a kernel-mode driver written in C++. The driver intercepts hardware ID queries at the kernel level, while the C# frontend provides a clean interface for managing spoofed identities and profiles.</p>',
    },
    'Amplifi': {
      desc: 'A social media automation platform with modules for Instagram, YouTube, Twitter/X, TikTok, Reddit, Spotify, and more. Automate engagement across 15+ platforms.',
      features: [
        '15+ platform modules \u2014 Instagram, YouTube, Twitter/X, TikTok, Reddit, and more',
        'Auto-follow, like, comment, subscribe, and repost',
        'Spotify & SoundCloud play generators',
        'Account creator & proxy support',
        'Session management & scheduler',
      ],
      tech: ['JavaScript', 'Electron', 'Node.js'],
      status: 'Early Development',
      timeline: 'Started Oct 2025 \u2014 Active',
      preview: 'img/amplifi.png',
      details: '<h4>Technical Breakdown</h4><p>Built with Electron and Node.js. Each platform module runs automated engagement tasks with configurable targeting \u2014 by hashtag, keyword, user, or channel. Includes proxy rotation, session logging, and a built-in scheduler for timed automation.</p>',
    },
    'The Codex': {
      desc: 'A native D&D 5e character tracker with full ruleset support, 2,000+ article encyclopedia, real-time multiplayer sessions, and Player/DM modes.',
      features: [
        '2,000+ SRD article encyclopedia',
        'Real-time WebSocket multiplayer sessions',
        'Player & Dungeon Master modes',
        'Full offline support \u2014 no account needed',
      ],
      tech: ['React', 'Tauri 2', 'Rust', 'SQLite', 'WebSocket'],
      status: 'Early Access \u2014 Testing',
      timeline: 'Started Oct 2025 \u2014 Active',
      preview: 'img/codex.png',
      details: '<h4>Technical Breakdown</h4><p>Built with React and Tauri 2 (Rust). Features a local SQLite database with 2,000+ SRD articles, WebSocket-based real-time multiplayer, and full offline support. No account required \u2014 all data stays on your machine.</p>',
      link: 'https://github.com/nisakson2000/dnd-tracker/releases/tag/v0.8.6',
    },
    'Ghosted': {
      desc: 'An app to track your personal data across 100s of data broker sites and remove it.',
      features: [
        'Scans 100+ data broker sites for your info',
        'Automated opt-out request submission',
        'Privacy score tracking over time',
        'Take back control of your digital footprint',
      ],
      tech: ['Rust', 'JavaScript', 'HTML/CSS'],
      status: 'Awaiting Update',
      timeline: 'Released Oct 2025 \u2014 Update Pending',
      preview: 'img/ghosted.png',
      details: '<h4>Technical Breakdown</h4><p>Rust-powered backend with JavaScript frontend. Crawls and monitors data broker sites for your personal information, then automates opt-out requests. Currently awaiting a major update for new broker APIs.</p>',
      link: 'https://github.com/ArsenalRX/Ghosted',
    },
    'VoxMorph': {
      desc: 'Real-time AI voice translator that converts your speech into another language using a synthetic voice.',
      features: [
        'Real-time speech recognition & translation',
        '15+ supported languages',
        'Synthetic voice output in target language',
        'Low-latency processing pipeline',
      ],
      tech: ['Python', 'Jupyter', 'Speech AI', 'NLP'],
      status: 'Completed \u2014 Live',
      timeline: 'Released Oct 2025',
      preview: 'img/voxmorph.png',
      details: '<h4>Technical Breakdown</h4><p>Uses speech recognition, neural machine translation, and text-to-speech synthesis in a Python pipeline. Supports 15+ languages with low-latency processing. Built as a Jupyter notebook for easy experimentation and deployment.</p>',
      link: 'https://github.com/ArsenalRX/voxmorph',
    },
  };

  function buildModalHTML(detail) {
    var html = '';

    // Preview screenshot
    if (detail.preview) {
      html += '<div class="modal-preview"><img src="' + detail.preview + '" alt="Project preview" loading="lazy" /></div>';
    }

    // Status & timeline header
    if (detail.status || detail.timeline) {
      html += '<div class="modal-status-row">';
      if (detail.status) html += '<span class="modal-status">' + detail.status + '</span>';
      if (detail.timeline) html += '<span class="modal-timeline">' + detail.timeline + '</span>';
      html += '</div>';
    }

    // Features list
    if (detail.features && detail.features.length) {
      html += '<div class="modal-section"><h4>Features</h4><ul class="modal-features">';
      detail.features.forEach(function(f) { html += '<li>' + f + '</li>'; });
      html += '</ul></div>';
    }

    // Tech stack
    if (detail.tech && detail.tech.length) {
      html += '<div class="modal-section"><h4>Tech Stack</h4><div class="modal-tech-tags">';
      detail.tech.forEach(function(t) { html += '<span class="modal-tech-tag">' + t + '</span>'; });
      html += '</div></div>';
    }

    // Existing details (technical breakdown)
    if (detail.details) {
      html += '<div class="modal-section">' + detail.details + '</div>';
    }

    return html;
  }

  var projectModal = document.getElementById('projectModal');
  var modalClose = document.getElementById('modalClose');

  document.querySelectorAll('.project-card').forEach(function(card) {
    card.addEventListener('click', function(e) {
      if (this.classList.contains('project-card-link')) return;
      e.preventDefault();
      e.stopPropagation();
      var nameEl = this.querySelector('.project-name');
      var name = nameEl ? nameEl.textContent.replace(/\s*v[\d.]+.*$/, '').trim() : '';
      var detail = projectDetails[name];
      if (!detail || !projectModal) return;

      document.getElementById('modalTitle').textContent = name;
      document.getElementById('modalDesc').textContent = detail.desc;
      document.getElementById('modalDetails').innerHTML = buildModalHTML(detail);

      var badges = this.querySelector('.project-badges');
      var tags = this.querySelector('.project-tags');
      document.getElementById('modalBadges').innerHTML = badges ? badges.innerHTML : '';
      document.getElementById('modalTags').innerHTML = tags ? tags.innerHTML : '';

      var linkRow = document.getElementById('modalLinkRow');
      linkRow.innerHTML = '';
      if (detail.link) {
        linkRow.innerHTML = '<a href="' + detail.link + '" target="_blank" class="btn btn-ghost" style="font-size:0.8rem;padding:8px 16px;">View Project <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg></a>';
      }
      projectModal.classList.add('open');
    });
  });

  if (modalClose) modalClose.addEventListener('click', function() { projectModal.classList.remove('open'); });
  if (projectModal) projectModal.addEventListener('click', function(e) { if (e.target === projectModal) projectModal.classList.remove('open'); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && projectModal && projectModal.classList.contains('open')) projectModal.classList.remove('open'); });

  // ========== TILT EFFECT ON ABOUT CARD ==========
  var glassCard = document.querySelector('.card-glass');
  if (glassCard) {
    glassCard.addEventListener('mousemove', function(e) {
      var rect = glassCard.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      glassCard.style.transform = 'rotateY(' + (x * 15) + 'deg) rotateX(' + (-y * 15) + 'deg)';
    });
    glassCard.addEventListener('mouseleave', function() { glassCard.style.transform = ''; });
  }
})(window.ARX);
