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

  // Expose for devmode
  ARX.blogPosts = blogPosts;

  // ========== RENDER BLOG CARDS ==========
  var blogGrid = document.getElementById('blogGrid');
  if (!blogGrid) return;

  function renderAllCards() {
    blogGrid.innerHTML = '';

    blogPosts.forEach(function(post) {
      var card = document.createElement('div');
      card.className = 'blog-card reveal';

      var tagsHTML = post.tags.map(function(t) {
        return '<span class="blog-tag">' + t + '</span>';
      }).join('');

      card.innerHTML =
        '<div class="blog-card-header">' +
          '<span class="blog-date">' + formatDate(post.date) + '</span>' +
          '<div class="blog-tags">' + tagsHTML + '</div>' +
        '</div>' +
        '<h3 class="blog-title">' + post.title + '</h3>' +
        '<p class="blog-excerpt">' + post.excerpt + '</p>' +
        '<span class="blog-read-more">Read more <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>';

      card.addEventListener('click', function() {
        openBlogModal(post);
      });

      blogGrid.appendChild(card);
      if (ARX.revealObserver) ARX.revealObserver.observe(card);
    });
  }

  renderAllCards();
  ARX.renderBlogCards = renderAllCards;

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
      '<div class="blog-modal-actions" id="blogModalActions"></div>' +
    '</div>';
  document.body.appendChild(blogModal);

  var blogModalClose = document.getElementById('blogModalClose');
  blogModalClose.addEventListener('click', closeBlogModal);
  blogModal.addEventListener('click', function(e) { if (e.target === blogModal) closeBlogModal(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && blogModal.classList.contains('open')) closeBlogModal(); });

  var currentEditPost = null;

  function closeBlogModal() {
    blogModal.classList.remove('open');
    currentEditPost = null;
  }

  function openBlogModal(post) {
    currentEditPost = post;
    var tagsHTML = post.tags.map(function(t) {
      return '<span class="blog-tag">' + t + '</span>';
    }).join('');

    document.getElementById('blogModalMeta').innerHTML =
      '<span class="blog-date">' + formatDate(post.date) + '</span>' +
      '<div class="blog-tags">' + tagsHTML + '</div>';
    document.getElementById('blogModalTitle').textContent = post.title;
    document.getElementById('blogModalBody').innerHTML = post.content;

    // Show edit button if in dev mode
    var actions = document.getElementById('blogModalActions');
    actions.innerHTML = '';
    if (ARX.devMode && ARX.auth && ARX.auth.isOwner()) {
      var editBtn = document.createElement('button');
      editBtn.className = 'dev-btn dev-btn-edit';
      editBtn.textContent = 'Edit Post';
      editBtn.addEventListener('click', function() { enterBlogEdit(post); });
      actions.appendChild(editBtn);
    }

    blogModal.classList.add('open');
  }

  ARX.openBlogModal = openBlogModal;

  function enterBlogEdit(post) {
    var modal = blogModal.querySelector('.blog-modal');

    var metaEl = document.getElementById('blogModalMeta');
    var titleEl = document.getElementById('blogModalTitle');
    var bodyEl = document.getElementById('blogModalBody');
    var actionsEl = document.getElementById('blogModalActions');

    metaEl.innerHTML =
      '<div class="dev-edit-row">' +
        '<label>Date:</label><input type="date" class="dev-input" id="editPostDate" value="' + post.date + '" />' +
      '</div>' +
      '<div class="dev-edit-row">' +
        '<label>Tags (comma-separated):</label><input type="text" class="dev-input" id="editPostTags" value="' + post.tags.join(', ') + '" />' +
      '</div>';

    titleEl.innerHTML = '<input type="text" class="dev-input dev-input-title" id="editPostTitle" value="' + post.title.replace(/"/g, '&quot;') + '" />';

    bodyEl.innerHTML =
      '<div class="dev-edit-row">' +
        '<label>Excerpt:</label>' +
        '<textarea class="dev-textarea dev-textarea-sm" id="editPostExcerpt">' + escapeHTML(post.excerpt) + '</textarea>' +
      '</div>' +
      '<div class="dev-edit-row">' +
        '<label>Content (HTML):</label>' +
        '<textarea class="dev-textarea" id="editPostContent">' + escapeHTML(post.content) + '</textarea>' +
      '</div>';

    actionsEl.innerHTML = '';
    var saveBtn = document.createElement('button');
    saveBtn.className = 'dev-btn dev-btn-save';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', function() { saveBlogEdit(post); });

    var cancelBtn = document.createElement('button');
    cancelBtn.className = 'dev-btn dev-btn-cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', function() { openBlogModal(post); });

    actionsEl.appendChild(saveBtn);
    actionsEl.appendChild(cancelBtn);
  }

  function saveBlogEdit(post) {
    var title = document.getElementById('editPostTitle').value.trim();
    var date = document.getElementById('editPostDate').value.trim();
    var tags = document.getElementById('editPostTags').value.split(',').map(function(t) { return t.trim(); }).filter(Boolean);
    var excerpt = document.getElementById('editPostExcerpt').value.trim();
    var content = document.getElementById('editPostContent').value.trim();

    if (!title || !content) { alert('Title and content are required.'); return; }

    // Update in-memory
    post.title = title;
    post.date = date;
    post.tags = tags;
    post.excerpt = excerpt;
    post.content = content;

    // Re-render cards
    renderAllCards();

    // Mark blog as dirty for devmode save
    ARX.blogDirty = true;

    // Show updated modal
    openBlogModal(post);

    if (ARX.devShowToast) ARX.devShowToast('Blog post updated (unsaved)');
  }

  function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
})(window.ARX);
