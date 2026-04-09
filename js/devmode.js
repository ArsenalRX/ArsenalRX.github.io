(function(ARX) {
  ARX.devMode = false;
  ARX.blogDirty = false;

  // Editable HTML sections
  var editableSections = [
    { sel: '.about-text', label: 'About' },
    { sel: '.nightreign-content', label: 'NightReign Banner' },
    { sel: '.hero-alias', label: 'Hero Alias' },
    { sel: '.contact-text', label: 'Contact Text' },
    { sel: '.footer-tagline', label: 'Footer Tagline' },
  ];

  var htmlDirty = false;
  var originalHTML = {};

  // ========== TOAST ==========
  var toast = document.createElement('div');
  toast.className = 'dev-toast';
  document.body.appendChild(toast);

  function showToast(msg, isError) {
    toast.textContent = msg;
    toast.className = 'dev-toast' + (isError ? ' dev-toast-error' : '');
    toast.classList.add('show');
    setTimeout(function() { toast.classList.remove('show'); }, 3000);
  }
  ARX.devShowToast = showToast;

  // ========== TOOLBAR ==========
  var toolbar = document.createElement('div');
  toolbar.className = 'dev-toolbar';
  toolbar.innerHTML =
    '<div class="dev-toolbar-left">' +
      '<span class="dev-toolbar-badge">DEV MODE</span>' +
      '<span class="dev-toolbar-user" id="devUser"></span>' +
    '</div>' +
    '<div class="dev-toolbar-right">' +
      '<button class="dev-btn dev-btn-save" id="devSaveAll">Save to GitHub</button>' +
      '<button class="dev-btn dev-btn-cancel" id="devExit">Exit Dev Mode</button>' +
    '</div>';
  document.body.appendChild(toolbar);

  document.getElementById('devSaveAll').addEventListener('click', saveAll);
  document.getElementById('devExit').addEventListener('click', exitDevMode);

  // ========== ENTER / EXIT ==========
  function enterDevMode() {
    if (!ARX.auth || !ARX.auth.isOwner()) return;
    ARX.devMode = true;
    document.body.classList.add('dev-mode-active');
    toolbar.classList.add('visible');
    document.getElementById('devUser').textContent = ARX.auth.user;

    editableSections.forEach(function(sec) {
      var el = document.querySelector(sec.sel);
      if (!el) return;
      originalHTML[sec.sel] = el.innerHTML;
      el.setAttribute('contenteditable', 'true');
      el.classList.add('dev-editable');
      el.addEventListener('input', onHTMLEdit);

      var label = document.createElement('div');
      label.className = 'dev-editable-label';
      label.textContent = sec.label;
      el.style.position = 'relative';
      el.appendChild(label);
    });

    document.querySelectorAll('.project-desc').forEach(function(el) {
      el.setAttribute('contenteditable', 'true');
      el.classList.add('dev-editable');
      el.addEventListener('input', onHTMLEdit);
    });

    showToast('Dev mode active \u2014 edit highlighted sections, then save');
  }

  function exitDevMode() {
    if (ARX.blogDirty || htmlDirty) {
      if (!confirm('You have unsaved changes. Exit anyway?')) return;
    }
    ARX.devMode = false;
    ARX.blogDirty = false;
    htmlDirty = false;
    document.body.classList.remove('dev-mode-active');
    toolbar.classList.remove('visible');

    editableSections.forEach(function(sec) {
      var el = document.querySelector(sec.sel);
      if (!el) return;
      el.removeAttribute('contenteditable');
      el.classList.remove('dev-editable');
      el.removeEventListener('input', onHTMLEdit);
      var label = el.querySelector('.dev-editable-label');
      if (label) label.remove();
      if (originalHTML[sec.sel]) el.innerHTML = originalHTML[sec.sel];
    });

    document.querySelectorAll('.project-desc').forEach(function(el) {
      el.removeAttribute('contenteditable');
      el.classList.remove('dev-editable');
      el.removeEventListener('input', onHTMLEdit);
    });

    originalHTML = {};
    if (ARX.renderBlogCards) ARX.renderBlogCards();
  }

  function onHTMLEdit() { htmlDirty = true; }

  // ========== SAVE ==========
  function saveAll() {
    var btn = document.getElementById('devSaveAll');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    var promises = [];
    if (ARX.blogDirty) promises.push(saveBlogFile());
    if (htmlDirty) promises.push(saveHTMLFile());

    if (!promises.length) {
      showToast('No changes to save');
      btn.disabled = false;
      btn.textContent = 'Save to GitHub';
      return;
    }

    Promise.all(promises).then(function() {
      ARX.blogDirty = false;
      htmlDirty = false;

      // Update stored originals
      editableSections.forEach(function(sec) {
        var el = document.querySelector(sec.sel);
        if (!el) return;
        var clone = el.cloneNode(true);
        var labels = clone.querySelectorAll('.dev-editable-label');
        labels.forEach(function(l) { l.remove(); });
        originalHTML[sec.sel] = clone.innerHTML;
      });

      showToast('Saved to GitHub! Live in ~1 min.');
      btn.disabled = false;
      btn.textContent = 'Save to GitHub';
    }).catch(function(err) {
      showToast('Save failed: ' + err.message, true);
      btn.disabled = false;
      btn.textContent = 'Save to GitHub';
    });
  }

  // ========== SAVE BLOG ==========
  function saveBlogFile() {
    return ARX.github.getFile('js/blog.js').then(function(file) {
      // Decode current file content
      var raw = decodeURIComponent(escape(atob(file.content.replace(/\n/g, ''))));

      // Find the blogPosts array and replace just the data portion
      var dataStart = raw.indexOf('var blogPosts = [');
      var dataEnd = findMatchingBracket(raw, raw.indexOf('[', dataStart));
      if (dataStart === -1 || dataEnd === -1) throw new Error('Could not locate blogPosts array in blog.js');

      // Generate new data
      var newData = generatePostsArray(ARX.blogPosts);
      var updated = raw.substring(0, dataStart) + 'var blogPosts = ' + newData + raw.substring(dataEnd + 1);

      return ARX.github.updateFile('js/blog.js', updated, 'Update blog posts via dev mode', file.sha);
    });
  }

  function findMatchingBracket(str, openPos) {
    var depth = 0;
    var inStr = false;
    var strChar = '';
    for (var i = openPos; i < str.length; i++) {
      var c = str[i];
      var prev = i > 0 ? str[i - 1] : '';
      if (inStr) {
        if (c === strChar && prev !== '\\') inStr = false;
        continue;
      }
      if (c === "'" || c === '"' || c === '`') { inStr = true; strChar = c; continue; }
      if (c === '[') depth++;
      if (c === ']') { depth--; if (depth === 0) return i; }
    }
    return -1;
  }

  function generatePostsArray(posts) {
    var lines = ['['];
    posts.forEach(function(post, i) {
      lines.push('    {');
      lines.push('      id: ' + JSON.stringify(post.id) + ',');
      lines.push('      title: ' + JSON.stringify(post.title) + ',');
      lines.push('      date: ' + JSON.stringify(post.date) + ',');
      lines.push('      tags: ' + JSON.stringify(post.tags) + ',');
      lines.push('      excerpt: ' + JSON.stringify(post.excerpt) + ',');
      lines.push('      content: ' + JSON.stringify(post.content) + ',');
      lines.push('    }' + (i < posts.length - 1 ? ',' : ''));
    });
    lines.push('  ]');
    return lines.join('\n');
  }

  // ========== SAVE HTML ==========
  function saveHTMLFile() {
    return ARX.github.getFile('index.html').then(function(file) {
      var raw = decodeURIComponent(escape(atob(file.content.replace(/\n/g, ''))));

      editableSections.forEach(function(sec) {
        var el = document.querySelector(sec.sel);
        if (!el) return;

        var clone = el.cloneNode(true);
        clone.querySelectorAll('.dev-editable-label').forEach(function(l) { l.remove(); });
        clone.removeAttribute('contenteditable');
        clone.classList.remove('dev-editable');
        clone.style.position = '';
        var newInner = clone.innerHTML;

        var old = originalHTML[sec.sel];
        if (old && old !== newInner) {
          raw = raw.replace(old, newInner);
        }
      });

      return ARX.github.updateFile('index.html', raw, 'Update site content via dev mode', file.sha);
    });
  }

  // ========== DEV TOGGLE BUTTON ==========
  function createDevToggle() {
    var existing = document.getElementById('devModeToggle');
    if (existing) existing.remove();

    if (!ARX.auth || !ARX.auth.isOwner()) return;

    var toggle = document.createElement('button');
    toggle.className = 'dev-mode-toggle';
    toggle.id = 'devModeToggle';
    toggle.title = 'Toggle Dev Mode';
    toggle.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
        '<polyline points="16 18 22 12 16 6"/>' +
        '<polyline points="8 6 2 12 8 18"/>' +
      '</svg>';
    document.body.appendChild(toggle);

    toggle.addEventListener('click', function() {
      if (ARX.devMode) {
        exitDevMode();
        toggle.classList.remove('active');
      } else {
        enterDevMode();
        toggle.classList.add('active');
      }
    });
  }

  // Listen for auth state changes
  if (ARX.auth) {
    ARX.auth.onChange(function(isOwner) {
      createDevToggle();
      if (!isOwner && ARX.devMode) exitDevMode();
    });
    if (ARX.auth.isOwner()) createDevToggle();
  }
})(window.ARX);
