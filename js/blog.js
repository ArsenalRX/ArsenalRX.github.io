(function(ARX) {
  // ========== BLOG POSTS DATA ==========
  var blogPosts = [
    {
      id: 'builtin-nexus',
      title: 'Building Nexus \u2014 A Local AI for Anti-Cheat Detection',
      date: '2026-04-02',
      tags: ['AI/ML', 'Python', 'Anti-Cheat'],
      excerpt: 'How I built an abliterated 9B parameter AI model that runs locally and detects cheats in real-time by analyzing game memory patterns, process behavior, and API call sequences.',
      content: '<p>Anti-cheat has always been a cat-and-mouse game. Commercial solutions like EAC and BattlEye work, but they\'re black boxes \u2014 you can\'t study them, extend them, or learn from them. I wanted to build something I could actually understand and control. That\'s how <strong>Nexus</strong> started.</p>' +
        '<h4>Why Local?</h4>' +
        '<p>Cloud-based detection adds latency, costs money, and requires an internet connection. Nexus runs a fine-tuned 9B parameter model entirely on your machine. No API keys, no subscriptions, no data leaving your system. It\'s your AI, running on your hardware.</p>' +
        '<h4>The ML Pipeline</h4>' +
        '<p>The core pipeline has three stages: <strong>feature extraction</strong>, <strong>pattern analysis</strong>, and <strong>signature classification</strong>. Feature extraction monitors process behavior \u2014 memory allocation patterns, API call sequences, DLL injection attempts, and suspicious thread creation. These features get fed into the model for real-time analysis.</p>' +
        '<h4>Abliteration</h4>' +
        '<p>The base model needed to be uncensored to be useful for security research. I used abliteration techniques to remove the safety filters that would otherwise prevent the model from analyzing potentially malicious code patterns. This lets Nexus reason about cheat mechanisms without refusing to engage with the content.</p>' +
        '<h4>Training Data</h4>' +
        '<p>Building the training dataset was the hardest part. I collected samples of known cheat signatures, memory manipulation patterns, and legitimate game behavior to create a balanced dataset. The model needs to distinguish between a game legitimately allocating memory and a cheat injecting code into a process \u2014 and the difference is often subtle.</p>' +
        '<h4>What\'s Next</h4>' +
        '<p>Nexus is still in early development. The current focus is improving detection accuracy and reducing false positives. Long-term, I want to add real-time overlay alerts and a plugin system so other developers can extend the detection modules.</p>',
    },
    {
      id: 'builtin-portfolio',
      title: 'Building a Cyberpunk Portfolio from Scratch',
      date: '2026-04-02',
      tags: ['Web Dev', 'CSS', 'JavaScript'],
      excerpt: 'How I built this portfolio with zero frameworks \u2014 just vanilla HTML, CSS, and JavaScript. From parallax starfields to terminal emulators, here\'s the breakdown.',
      content: '<p>When I set out to build my portfolio, I had one rule: <strong>no frameworks</strong>. No React, no Tailwind, no build tools. Just raw HTML, CSS, and JavaScript.</p>' +
        '<h4>The Starfield</h4>' +
        '<p>The three-layer parallax starfield uses a single <code>&lt;canvas&gt;</code> element with stars at different depths. Each layer scrolls at a different speed relative to mouse movement, creating that depth illusion. Shooting stars are spawned on random intervals with velocity curves that accelerate and fade.</p>' +
        '<h4>The Terminal</h4>' +
        '<p>The terminal emulator is a custom-built input handler that intercepts keystrokes, maintains command history (arrow keys), and supports tab completion. Commands are stored as functions in an object, making it trivially extensible. The auto-demo mode kicks in after idle timeout and types commands automatically.</p>' +
        '<h4>Performance on Edge</h4>' +
        '<p>Edge\'s rendering pipeline handles canvas differently than Chrome/Firefox. I had to throttle particle counts, defer code rain initialization, and use <code>requestAnimationFrame</code> budgets to keep things smooth. The key insight: fewer particles with longer lifetimes look better than many particles with short ones.</p>' +
        '<h4>Easter Eggs</h4>' +
        '<p>I hid several secrets throughout the site. The Konami code triggers a particle explosion. There are hidden terminal commands that activate full-screen experiences. And there\'s a clickable letter in one of the section titles\u2026 but I\'ll let you find that one yourself.</p>',
    },
    {
      id: 'builtin-lightkeeper',
      title: 'Building Lightkeeper \u2014 Route Planning for the Coast Guard',
      date: '2026-03-06',
      tags: ['Python', 'Electron', 'Maps'],
      excerpt: 'How I built a workplan tool for USCG Aids to Navigation teams \u2014 parsing Light List data, rendering interactive maps, and optimizing multi-day route plans.',
      content: '<p>The U.S. Coast Guard maintains thousands of aids to navigation \u2014 buoys, lights, beacons, and dayboards that keep maritime traffic safe. The teams responsible for servicing these aids need to plan multi-day trips across their districts, and the existing tools for doing that are... not great. That\'s where <strong>Lightkeeper</strong> comes in.</p>' +
        '<h4>The Problem</h4>' +
        '<p>USCG ATON teams work across 9 districts, each with hundreds of aids. Planning a workplan means figuring out which aids need servicing, grouping them geographically, and building an optimized route that minimizes travel time across multiple days. Doing this manually with spreadsheets and paper charts is slow and error-prone.</p>' +
        '<h4>Parsing the Light List</h4>' +
        '<p>The Coast Guard publishes Light List data \u2014 a massive catalog of every aid to navigation in the country. Lightkeeper downloads and parses this data automatically, extracting coordinates, aid types, service schedules, and condition reports. The parser handles the messy formatting inconsistencies across different district publications.</p>' +
        '<h4>Interactive Maps</h4>' +
        '<p>The map interface uses <strong>Leaflet</strong> to render all aids across any of the 9 districts. You can filter by aid type, service status, or priority. Clicking an aid shows its full details \u2014 location, last service date, condition, and any outstanding discrepancies. The map supports offline tiles so teams can use it in areas with limited connectivity.</p>' +
        '<h4>Route Optimization</h4>' +
        '<p>This was the hardest part. Given a set of aids that need servicing and a number of available days, Lightkeeper generates an optimized multi-day route plan. The algorithm considers travel distances between aids, time required at each stop, crew shift limits, and geographic clustering. It\'s not a perfect traveling salesman solution, but it gets close enough to be genuinely useful.</p>' +
        '<h4>The Stack</h4>' +
        '<p>Python handles the backend \u2014 data parsing, route optimization, and the API layer. The frontend is Electron with Leaflet for maps. All data is stored locally in SQLite, so the app works fully offline after the initial Light List download. No accounts, no cloud dependencies.</p>' +
        '<h4>Where It Stands</h4>' +
        '<p>Lightkeeper is in early access and actively being tested. The core features work, but I\'m still refining the route optimizer and adding support for custom waypoints and fuel stop planning.</p>',
    },
    {
      id: 'builtin-codex',
      title: 'Why I Chose Tauri Over Electron for The Codex',
      date: '2026-03-13',
      tags: ['Rust', 'React', 'Desktop Apps'],
      excerpt: 'Electron is the easy choice for desktop apps. Here\'s why I went with Tauri 2 + Rust instead, and what I learned along the way.',
      content: '<p>When my friend and I started building <strong>The Codex</strong> \u2014 a D&D 5e character tracker \u2014 Electron was the obvious choice. We\'d both used it before, the ecosystem is mature, and you can ship fast.</p>' +
        '<p>But Electron apps are <em>heavy</em>. A blank Electron app ships at ~150MB. For a character sheet app, that felt wrong.</p>' +
        '<h4>Enter Tauri 2</h4>' +
        '<p>Tauri uses the system\'s native webview instead of bundling Chromium, and the backend is written in Rust. Our final binary is under 10MB. Memory usage is a fraction of an equivalent Electron app.</p>' +
        '<h4>The Rust Learning Curve</h4>' +
        '<p>The trade-off is the Rust backend. If you\'re coming from JavaScript/TypeScript, Rust\'s ownership model is a wall. But once it clicks, you write code that\'s fast by default and catches entire categories of bugs at compile time.</p>' +
        '<h4>SQLite Integration</h4>' +
        '<p>Tauri\'s plugin system made SQLite integration straightforward. We store 2,000+ SRD articles locally, so the app works completely offline. No accounts, no cloud, no subscriptions. Your data stays on your machine.</p>' +
        '<h4>Would I Use Tauri Again?</h4>' +
        '<p>Absolutely. For apps that need to feel native and lightweight, Tauri is the clear winner. For rapid prototyping where bundle size doesn\'t matter, Electron still has its place.</p>',
    },
  ];

  // ========== DEV LOGIN ==========
  var DEV_PASS_HASH = 'e52522a505f68250e81747aa5386c5c60196c1680f1c89762ab1ab0fbaae39b8';
  var devLoggedIn = false;

  function sha256(str) {
    var buf = new TextEncoder().encode(str);
    return crypto.subtle.digest('SHA-256', buf).then(function(hash) {
      return Array.from(new Uint8Array(hash)).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
    });
  }

  function getCustomPosts() {
    try { return JSON.parse(localStorage.getItem('blogCustomPosts') || '[]'); } catch (e) { return []; }
  }

  function saveCustomPosts(posts) {
    try { localStorage.setItem('blogCustomPosts', JSON.stringify(posts)); } catch (e) {}
  }

  // Built-in post overrides (edits stored in localStorage)
  function getBuiltinOverrides() {
    try { return JSON.parse(localStorage.getItem('blogBuiltinOverrides') || '{}'); } catch (e) { return {}; }
  }

  function saveBuiltinOverrides(overrides) {
    try { localStorage.setItem('blogBuiltinOverrides', JSON.stringify(overrides)); } catch (e) {}
  }

  // Deleted built-in post IDs
  function getDeletedBuiltins() {
    try { return JSON.parse(localStorage.getItem('blogDeletedBuiltins') || '[]'); } catch (e) { return []; }
  }

  function saveDeletedBuiltins(ids) {
    try { localStorage.setItem('blogDeletedBuiltins', JSON.stringify(ids)); } catch (e) {}
  }

  function getAllPosts() {
    var deleted = getDeletedBuiltins();
    var overrides = getBuiltinOverrides();

    // Apply overrides to built-in posts, skip deleted ones
    var builtins = blogPosts.filter(function(p) {
      return deleted.indexOf(p.id) === -1;
    }).map(function(p) {
      var o = overrides[p.id];
      if (o) {
        return { id: p.id, title: o.title || p.title, date: o.date || p.date, tags: o.tags || p.tags, excerpt: o.excerpt || p.excerpt, content: o.content || p.content, builtin: true };
      }
      return { id: p.id, title: p.title, date: p.date, tags: p.tags, excerpt: p.excerpt, content: p.content, builtin: true };
    });

    var custom = getCustomPosts();
    var all = builtins.concat(custom);
    all.sort(function(a, b) { return b.date.localeCompare(a.date); });
    return all;
  }

  // ========== RENDER BLOG CARDS ==========
  var blogGrid = document.getElementById('blogGrid');
  if (!blogGrid) return;

  function renderAllCards() {
    blogGrid.innerHTML = '';
    var allPosts = getAllPosts();

    // Add "New Post" button if logged in
    if (devLoggedIn) {
      var newBtn = document.createElement('div');
      newBtn.className = 'blog-card blog-card-new visible';
      newBtn.innerHTML = '<div class="blog-new-icon">+</div><span class="blog-new-label">New Write-up</span>';
      newBtn.addEventListener('click', function() { openEditor(); });
      blogGrid.appendChild(newBtn);
    }

    allPosts.forEach(function(post) {
      var card = document.createElement('div');
      card.className = 'blog-card reveal';

      var tagsHTML = post.tags.map(function(t) {
        return '<span class="blog-tag">' + t + '</span>';
      }).join('');

      var editBtns = '';
      if (devLoggedIn) {
        editBtns = '<div class="blog-card-actions">' +
          '<button class="blog-action-btn blog-edit-btn" data-id="' + post.id + '">Edit</button>' +
          '<button class="blog-action-btn blog-delete-btn" data-id="' + post.id + '">Delete</button>' +
          '</div>';
      }

      card.innerHTML =
        '<div class="blog-card-header">' +
          '<span class="blog-date">' + formatDate(post.date) + '</span>' +
          '<div class="blog-tags">' + tagsHTML + '</div>' +
        '</div>' +
        '<h3 class="blog-title">' + post.title + '</h3>' +
        '<p class="blog-excerpt">' + post.excerpt + '</p>' +
        '<span class="blog-read-more">Read more <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>' +
        editBtns;

      card.addEventListener('click', function(e) {
        if (e.target.closest('.blog-action-btn')) return;
        openBlogModal(post);
      });

      // Edit/delete handlers
      if (devLoggedIn) {
        card.querySelector('.blog-edit-btn').addEventListener('click', function() { openEditor(post); });
        card.querySelector('.blog-delete-btn').addEventListener('click', function() {
          if (!confirm('Delete "' + post.title + '"?')) return;
          if (post.builtin) {
            var deleted = getDeletedBuiltins();
            if (deleted.indexOf(post.id) === -1) deleted.push(post.id);
            saveDeletedBuiltins(deleted);
          } else {
            var posts = getCustomPosts().filter(function(p) { return p.id !== post.id; });
            saveCustomPosts(posts);
          }
          renderAllCards();
        });
      }

      blogGrid.appendChild(card);
      if (ARX.revealObserver) ARX.revealObserver.observe(card);
    });
  }

  renderAllCards();

  function formatDate(dateStr) {
    var d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // ========== BLOG MODAL ==========
  var blogModal = document.createElement('div');
  blogModal.className = 'blog-modal-overlay';
  blogModal.id = 'blogModal';
  blogModal.innerHTML =
    '<div class="blog-modal">' +
      '<button class="modal-close" id="blogModalClose">&times;</button>' +
      '<div class="blog-modal-header">' +
        '<div class="blog-modal-meta" id="blogModalMeta"></div>' +
        '<h2 class="blog-modal-title" id="blogModalTitle"></h2>' +
      '</div>' +
      '<div class="blog-modal-body" id="blogModalBody"></div>' +
    '</div>';
  document.body.appendChild(blogModal);

  var blogModalClose = document.getElementById('blogModalClose');
  blogModalClose.addEventListener('click', function() { blogModal.classList.remove('open'); });
  blogModal.addEventListener('click', function(e) { if (e.target === blogModal) blogModal.classList.remove('open'); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && blogModal.classList.contains('open')) blogModal.classList.remove('open'); });

  function openBlogModal(post) {
    var tagsHTML = post.tags.map(function(t) {
      return '<span class="blog-tag">' + t + '</span>';
    }).join('');

    document.getElementById('blogModalMeta').innerHTML =
      '<span class="blog-date">' + formatDate(post.date) + '</span>' +
      '<div class="blog-tags">' + tagsHTML + '</div>';
    document.getElementById('blogModalTitle').textContent = post.title;
    document.getElementById('blogModalBody').innerHTML = post.content;
    blogModal.classList.add('open');
  }

  // ========== BLOG EDITOR MODAL ==========
  var editorModal = document.createElement('div');
  editorModal.className = 'blog-modal-overlay';
  editorModal.id = 'blogEditorModal';
  editorModal.innerHTML =
    '<div class="blog-modal blog-editor">' +
      '<button class="modal-close" id="blogEditorClose">&times;</button>' +
      '<h2 class="blog-modal-title">Write-up Editor</h2>' +
      '<div class="editor-form">' +
        '<div class="editor-row">' +
          '<label>Title</label>' +
          '<input type="text" id="editorTitle" placeholder="Post title" />' +
        '</div>' +
        '<div class="editor-row">' +
          '<label>Date</label>' +
          '<input type="date" id="editorDate" />' +
        '</div>' +
        '<div class="editor-row">' +
          '<label>Tags <span style="color:var(--text-dim);font-size:0.7rem">(comma separated)</span></label>' +
          '<input type="text" id="editorTags" placeholder="Python, AI, Web Dev" />' +
        '</div>' +
        '<div class="editor-row">' +
          '<label>Excerpt</label>' +
          '<textarea id="editorExcerpt" rows="2" placeholder="Short summary shown on the card"></textarea>' +
        '</div>' +
        '<div class="editor-row">' +
          '<label>Content <span style="color:var(--text-dim);font-size:0.7rem">(HTML supported: &lt;h4&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;code&gt;)</span></label>' +
          '<textarea id="editorContent" rows="12" placeholder="<p>Your write-up content here...</p>"></textarea>' +
        '</div>' +
        '<div class="editor-actions">' +
          '<button class="btn btn-primary glow-border" id="editorSave">Publish</button>' +
          '<button class="btn btn-ghost" id="editorCancel">Cancel</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(editorModal);

  var _editingId = null;
  var _editingBuiltin = false;

  document.getElementById('blogEditorClose').addEventListener('click', function() { editorModal.classList.remove('open'); });
  editorModal.addEventListener('click', function(e) { if (e.target === editorModal) editorModal.classList.remove('open'); });
  document.getElementById('editorCancel').addEventListener('click', function() { editorModal.classList.remove('open'); });

  document.getElementById('editorSave').addEventListener('click', function() {
    var title = document.getElementById('editorTitle').value.trim();
    var date = document.getElementById('editorDate').value;
    var tags = document.getElementById('editorTags').value.split(',').map(function(t) { return t.trim(); }).filter(Boolean);
    var excerpt = document.getElementById('editorExcerpt').value.trim();
    var content = document.getElementById('editorContent').value.trim();

    if (!title || !date || !content) { alert('Title, date, and content are required.'); return; }

    if (_editingBuiltin && _editingId) {
      // Save override for built-in post
      var overrides = getBuiltinOverrides();
      overrides[_editingId] = { title: title, date: date, tags: tags, excerpt: excerpt, content: content };
      saveBuiltinOverrides(overrides);
    } else if (_editingId) {
      // Edit existing custom post
      var posts = getCustomPosts();
      posts = posts.map(function(p) {
        if (p.id === _editingId) { p.title = title; p.date = date; p.tags = tags; p.excerpt = excerpt; p.content = content; }
        return p;
      });
      saveCustomPosts(posts);
    } else {
      // New custom post
      var posts = getCustomPosts();
      posts.push({ id: Date.now().toString(), title: title, date: date, tags: tags, excerpt: excerpt, content: content, custom: true });
      saveCustomPosts(posts);
    }
    _editingId = null;
    _editingBuiltin = false;
    editorModal.classList.remove('open');
    renderAllCards();
  });

  function openEditor(post) {
    if (post) {
      _editingId = post.id;
      _editingBuiltin = !!post.builtin;
      document.getElementById('editorTitle').value = post.title;
      document.getElementById('editorDate').value = post.date;
      document.getElementById('editorTags').value = post.tags.join(', ');
      document.getElementById('editorExcerpt').value = post.excerpt;
      document.getElementById('editorContent').value = post.content;
    } else {
      _editingId = null;
      _editingBuiltin = false;
      document.getElementById('editorTitle').value = '';
      document.getElementById('editorDate').value = new Date().toISOString().split('T')[0];
      document.getElementById('editorTags').value = '';
      document.getElementById('editorExcerpt').value = '';
      document.getElementById('editorContent').value = '';
    }
    editorModal.classList.add('open');
  }

  // ========== DEV LOGIN MODAL ==========
  var loginModal = document.createElement('div');
  loginModal.className = 'dev-login-overlay';
  loginModal.id = 'devLoginModal';
  loginModal.innerHTML =
    '<div class="dev-login-modal">' +
      '<div class="dev-login-header">' +
        '<span class="dev-login-icon">&gt;_</span>' +
        '<span class="dev-login-label">AUTHENTICATION REQUIRED</span>' +
      '</div>' +
      '<div class="dev-login-body">' +
        '<label class="dev-login-field-label">Enter access code</label>' +
        '<input type="password" id="devPassInput" class="dev-login-input" placeholder="&#x2022;&#x2022;&#x2022;&#x2022;" autocomplete="off" spellcheck="false" />' +
        '<div class="dev-login-error" id="devLoginError">Access denied.</div>' +
        '<div class="dev-login-actions">' +
          '<button class="btn btn-primary glow-border dev-login-submit" id="devLoginSubmit">Authenticate</button>' +
          '<button class="btn btn-ghost dev-login-cancel" id="devLoginCancel">Cancel</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(loginModal);

  var devPassInput = document.getElementById('devPassInput');
  var devLoginError = document.getElementById('devLoginError');

  var failedAttempts = 0;

  function closeLoginModal() {
    loginModal.classList.remove('open');
    devPassInput.value = '';
    devLoginError.classList.remove('visible');
  }

  function attemptLogin() {
    var pass = devPassInput.value;
    if (!pass) return;
    sha256(pass).then(function(hash) {
      if (hash === DEV_PASS_HASH) {
        failedAttempts = 0;
        devLoggedIn = true;
        sessionStorage.setItem('devAuth', '1');
        devBtn.textContent = 'Dev Mode';
        devBtn.classList.add('active');
        renderAllCards();
        closeLoginModal();
      } else {
        failedAttempts++;
        devLoginError.classList.add('visible');
        devPassInput.value = '';
        devPassInput.focus();
        setTimeout(function() { devLoginError.classList.remove('visible'); }, 2000);
      }
    });
  }

  // ========== (hack screen removed) ==========

  document.getElementById('devLoginSubmit').addEventListener('click', function() { attemptLogin(); });
  document.getElementById('devLoginCancel').addEventListener('click', closeLoginModal);
  loginModal.addEventListener('click', function(e) { if (e.target === loginModal) closeLoginModal(); });
  devPassInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') attemptLogin(); if (e.key === 'Escape') closeLoginModal(); });

  // ========== DEV LOGIN BUTTON ==========
  var devBtn = document.getElementById('devLoginBtn');
  var devBtnMobile = document.getElementById('devLoginBtnMobile');
  var analyticsBtn = null;

  function setDevState(loggedIn) {
    devLoggedIn = loggedIn;
    var btns = [devBtn, devBtnMobile].filter(Boolean);
    btns.forEach(function(b) {
      b.textContent = loggedIn ? 'Dev Mode' : 'Dev Login';
      if (loggedIn) b.classList.add('active'); else b.classList.remove('active');
    });
    renderAllCards();
    // Show/hide analytics button
    if (loggedIn) {
      if (!analyticsBtn && ARX.showAnalyticsPanel) {
        analyticsBtn = document.createElement('button');
        analyticsBtn.className = 'dev-analytics-btn';
        analyticsBtn.textContent = 'Analytics';
        analyticsBtn.addEventListener('click', function() { ARX.showAnalyticsPanel(); });
        if (devBtn && devBtn.parentNode) devBtn.parentNode.insertBefore(analyticsBtn, devBtn.nextSibling);
      }
      if (analyticsBtn) analyticsBtn.style.display = '';
    } else {
      if (analyticsBtn) analyticsBtn.style.display = 'none';
      var ap = document.getElementById('analyticsPanel');
      if (ap) { ap.classList.remove('open'); setTimeout(function() { ap.remove(); }, 300); }
    }
  }

  function handleDevClick() {
    if (devLoggedIn) {
      sessionStorage.removeItem('devAuth');
      setDevState(false);
      return;
    }
    loginModal.classList.add('open');
    setTimeout(function() { devPassInput.focus(); }, 100);
    // Close mobile menu if open
    var mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) mobileMenu.classList.remove('open');
  }

  if (devBtn) devBtn.addEventListener('click', handleDevClick);
  if (devBtnMobile) devBtnMobile.addEventListener('click', handleDevClick);

  if (sessionStorage.getItem('devAuth') === '1') {
    setDevState(true);
  }

  // Update attemptLogin to use setDevState
  var _origAttemptLogin = attemptLogin;
  attemptLogin = function() {
    var pass = devPassInput.value;
    if (!pass) return;
    sha256(pass).then(function(hash) {
      if (hash === DEV_PASS_HASH) {
        failedAttempts = 0;
        sessionStorage.setItem('devAuth', '1');
        setDevState(true);
        closeLoginModal();
      } else {
        failedAttempts++;
        devLoginError.classList.add('visible');
        devPassInput.value = '';
        devPassInput.focus();
        setTimeout(function() { devLoginError.classList.remove('visible'); }, 2000);
      }
    });
  };
})(window.ARX);
