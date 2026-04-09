(function(ARX) {
  var OWNER = 'ArsenalRX';
  var REPO = 'arsenalrx.github.io';
  var TOKEN_KEY = 'arx_gh_token';
  var USER_KEY = 'arx_gh_user';

  // ========== AUTH STATE ==========
  ARX.auth = {
    token: sessionStorage.getItem(TOKEN_KEY) || null,
    user: sessionStorage.getItem(USER_KEY) || null,
    isOwner: function() {
      return !!(this.token && this.user && this.user.toLowerCase() === OWNER.toLowerCase());
    },
    listeners: [],
    onChange: function(fn) { this.listeners.push(fn); },
    notify: function() {
      var self = this;
      this.listeners.forEach(function(fn) { fn(self.isOwner()); });
    }
  };

  // ========== LOGIN / LOGOUT ==========
  function login() {
    var token = prompt('Enter GitHub Personal Access Token\n(needs "repo" scope):');
    if (!token || !token.trim()) return;
    token = token.trim();

    fetch('https://api.github.com/user', {
      headers: { 'Authorization': 'token ' + token }
    }).then(function(res) {
      if (!res.ok) throw new Error('Invalid token');
      return res.json();
    }).then(function(data) {
      if (data.login.toLowerCase() !== OWNER.toLowerCase()) {
        alert('Authenticated as ' + data.login + ', but only ' + OWNER + ' can edit.');
        return;
      }
      ARX.auth.token = token;
      ARX.auth.user = data.login;
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(USER_KEY, data.login);
      updateButton();
      ARX.auth.notify();
    }).catch(function() {
      alert('Authentication failed. Check your token.');
    });
  }

  function logout() {
    ARX.auth.token = null;
    ARX.auth.user = null;
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    updateButton();
    ARX.auth.notify();
  }
  ARX.auth.logout = logout;

  // ========== NAV BUTTON ==========
  var btn = document.createElement('button');
  btn.className = 'nav-auth-btn';
  btn.id = 'authToggle';
  btn.title = 'GitHub Login';
  btn.innerHTML =
    '<svg class="auth-icon-login" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>' +
      '<polyline points="10 17 15 12 10 7"/>' +
      '<line x1="15" y1="12" x2="3" y2="12"/>' +
    '</svg>' +
    '<svg class="auth-icon-logout" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none">' +
      '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>' +
      '<polyline points="16 17 21 12 16 7"/>' +
      '<line x1="21" y1="12" x2="9" y2="12"/>' +
    '</svg>';

  var musicToggle = document.getElementById('musicToggle');
  if (musicToggle && musicToggle.parentNode) {
    musicToggle.parentNode.insertBefore(btn, musicToggle.nextSibling);
  }

  btn.addEventListener('click', function() {
    if (ARX.auth.isOwner()) {
      if (confirm('Logout?')) logout();
    } else {
      login();
    }
  });

  function updateButton() {
    var loginIcon = btn.querySelector('.auth-icon-login');
    var logoutIcon = btn.querySelector('.auth-icon-logout');
    if (ARX.auth.isOwner()) {
      loginIcon.style.display = 'none';
      logoutIcon.style.display = '';
      btn.title = 'Logout (' + ARX.auth.user + ')';
      btn.classList.add('authenticated');
    } else {
      loginIcon.style.display = '';
      logoutIcon.style.display = 'none';
      btn.title = 'GitHub Login';
      btn.classList.remove('authenticated');
    }
  }

  // Validate stored token on load
  if (ARX.auth.token) {
    fetch('https://api.github.com/user', {
      headers: { 'Authorization': 'token ' + ARX.auth.token }
    }).then(function(res) {
      if (!res.ok) throw new Error('expired');
      return res.json();
    }).then(function(data) {
      if (data.login.toLowerCase() !== OWNER.toLowerCase()) throw new Error('wrong user');
      ARX.auth.user = data.login;
      updateButton();
      ARX.auth.notify();
    }).catch(function() {
      logout();
    });
  }
  updateButton();

  // ========== GITHUB API HELPERS ==========
  ARX.github = {
    owner: OWNER,
    repo: REPO,
    getFile: function(path) {
      return fetch('https://api.github.com/repos/' + OWNER + '/' + REPO + '/contents/' + path, {
        headers: { 'Authorization': 'token ' + ARX.auth.token }
      }).then(function(res) {
        if (!res.ok) throw new Error('Failed to fetch ' + path);
        return res.json();
      });
    },
    updateFile: function(path, content, message, sha) {
      return fetch('https://api.github.com/repos/' + OWNER + '/' + REPO + '/contents/' + path, {
        method: 'PUT',
        headers: {
          'Authorization': 'token ' + ARX.auth.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          content: btoa(unescape(encodeURIComponent(content))),
          sha: sha
        })
      }).then(function(res) {
        if (!res.ok) return res.json().then(function(e) { throw new Error(e.message); });
        return res.json();
      });
    }
  };
})(window.ARX);
