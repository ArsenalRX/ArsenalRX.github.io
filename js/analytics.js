(function(ARX) {
  // ========== VISITOR ANALYTICS ==========
  var ANALYTICS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbx_U07Fuug4Q7VMDsnPjIHyM8W6nvU4WFsVfDwyv2n0xM2YDMDmq2JRNmznQUtWhvwQ/exec';

  if (!ANALYTICS_ENDPOINT) return;

  var sessionId = sessionStorage.getItem('arxSessionId');
  if (!sessionId) {
    sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
    sessionStorage.setItem('arxSessionId', sessionId);
  }

  var visitStart = Date.now();
  var visitorIP = null;
  var visitorGeo = null;
  var clicks = [];
  var copies = [];
  var scrollMax = 0;
  var sectionsViewed = [];
  var sectionTimes = {};
  var rageClicks = [];
  var idleTotal = 0;
  var lastActivity = Date.now();
  var exitIntents = 0;
  var viewOrder = [];
  var deviceInfo = {};
  var fingerprints = {};

  // ========== IP + GEO ==========
  function tryGeoAPI(url, parser) {
    return fetch(url).then(function(r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    }).then(parser);
  }

  tryGeoAPI('https://ipapi.co/json/', function(data) {
    visitorIP = data.ip;
    visitorGeo = {
      city: data.city, region: data.region, country: data.country_name,
      isp: data.org || '',
      lat: data.latitude, lng: data.longitude
    };
  }).catch(function() {
    return tryGeoAPI('https://ipwho.is/', function(data) {
      if (data.success === false) throw new Error('fail');
      visitorIP = data.ip;
      visitorGeo = {
        city: data.city, region: data.region, country: data.country,
        isp: data.connection ? data.connection.isp : '',
        lat: data.latitude, lng: data.longitude
      };
    });
  }).catch(function() {
    return tryGeoAPI('https://api.ipify.org?format=json', function(data) {
      visitorIP = data.ip;
    });
  }).catch(function() {
    visitorIP = 'unknown';
  });

  // ========== DEVICE / HARDWARE INFO ==========
  deviceInfo.screen = screen.width + 'x' + screen.height;
  deviceInfo.colorDepth = screen.colorDepth;
  deviceInfo.pixelRatio = window.devicePixelRatio || 1;
  deviceInfo.touch = navigator.maxTouchPoints > 0 && navigator.maxTouchPoints < 256;
  deviceInfo.memory = navigator.deviceMemory || null;
  deviceInfo.cores = navigator.hardwareConcurrency || null;
  deviceInfo.lang = navigator.language;
  deviceInfo.languages = (navigator.languages || []).join(', ');
  deviceInfo.doNotTrack = navigator.doNotTrack === '1' || window.doNotTrack === '1';
  deviceInfo.cookiesEnabled = navigator.cookieEnabled;
  deviceInfo.localStorage = (function() { try { localStorage.setItem('_t', '1'); localStorage.removeItem('_t'); return true; } catch(e) { return false; } })();
  deviceInfo.platform = navigator.platform || '';
  deviceInfo.pdfViewer = navigator.pdfViewerEnabled || false;
  deviceInfo.darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  deviceInfo.reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  deviceInfo.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  deviceInfo.utmSource = (location.search.match(/utm_source=([^&]+)/) || [])[1] || '';
  deviceInfo.utmMedium = (location.search.match(/utm_medium=([^&]+)/) || [])[1] || '';
  deviceInfo.utmCampaign = (location.search.match(/utm_campaign=([^&]+)/) || [])[1] || '';

  // Connection info
  if (navigator.connection) {
    deviceInfo.connectionType = navigator.connection.effectiveType || '';
    deviceInfo.downlink = navigator.connection.downlink || '';
    deviceInfo.saveData = navigator.connection.saveData || false;
  }

  // GPU via WebGL
  try {
    var c = document.createElement('canvas');
    var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    if (gl) {
      var ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        deviceInfo.gpuVendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL);
        deviceInfo.gpu = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
      }
    }
  } catch(e) {}

  // Ad blocker detection
  (function() {
    var bait = document.createElement('div');
    bait.className = 'ad ads adsbox ad-placement doubleclick';
    bait.style.cssText = 'position:absolute;top:-999px;left:-999px;width:1px;height:1px;';
    bait.innerHTML = '&nbsp;';
    document.body.appendChild(bait);
    setTimeout(function() {
      deviceInfo.adBlocker = (bait.offsetHeight === 0 || bait.clientHeight === 0 || getComputedStyle(bait).display === 'none');
      bait.remove();
    }, 200);
  })();

  // ========== FINGERPRINTING ==========
  // Canvas fingerprint
  try {
    var cv = document.createElement('canvas');
    cv.width = 200; cv.height = 50;
    var cx = cv.getContext('2d');
    cx.textBaseline = 'top';
    cx.font = '14px Arial';
    cx.fillStyle = '#f60';
    cx.fillRect(50, 0, 100, 30);
    cx.fillStyle = '#069';
    cx.fillText('fingerprint', 2, 15);
    cx.fillStyle = 'rgba(102,204,0,0.7)';
    cx.fillText('fingerprint', 4, 17);
    var canvasData = cv.toDataURL();
    // Simple hash
    var hash = 0;
    for (var i = 0; i < canvasData.length; i++) {
      hash = ((hash << 5) - hash) + canvasData.charCodeAt(i);
      hash = hash & hash;
    }
    fingerprints.canvas = Math.abs(hash).toString(16);
  } catch(e) {}

  // Audio fingerprint
  try {
    var audioCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 44100, 44100);
    var osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(10000, audioCtx.currentTime);
    var comp = audioCtx.createDynamicsCompressor();
    comp.threshold.setValueAtTime(-50, audioCtx.currentTime);
    comp.knee.setValueAtTime(40, audioCtx.currentTime);
    comp.ratio.setValueAtTime(12, audioCtx.currentTime);
    comp.attack.setValueAtTime(0, audioCtx.currentTime);
    comp.release.setValueAtTime(0.25, audioCtx.currentTime);
    osc.connect(comp);
    comp.connect(audioCtx.destination);
    osc.start(0);
    audioCtx.startRendering().then(function(buffer) {
      var data = buffer.getChannelData(0);
      var sum = 0;
      for (var i = 4500; i < 5000; i++) sum += Math.abs(data[i]);
      fingerprints.audio = sum.toFixed(6);
    }).catch(function() {});
  } catch(e) {}

  // WebGL renderer hash
  try {
    var cv2 = document.createElement('canvas');
    var gl2 = cv2.getContext('webgl');
    if (gl2) {
      var renderer = gl2.getParameter(gl2.RENDERER);
      var vendor = gl2.getParameter(gl2.VENDOR);
      fingerprints.webgl = vendor + '~' + renderer;
    }
  } catch(e) {}

  // Font detection (check for common fonts)
  try {
    var testFonts = ['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
      'Comic Sans MS', 'Impact', 'Trebuchet MS', 'Palatino', 'Lucida Console',
      'Segoe UI', 'Helvetica Neue', 'Consolas', 'Fira Code', 'JetBrains Mono'];
    var detected = [];
    var span = document.createElement('span');
    span.style.cssText = 'position:absolute;left:-9999px;font-size:72px;';
    span.textContent = 'm';
    document.body.appendChild(span);
    span.style.fontFamily = 'monospace';
    var baseW = span.offsetWidth;
    var baseH = span.offsetHeight;
    for (var fi = 0; fi < testFonts.length; fi++) {
      span.style.fontFamily = '"' + testFonts[fi] + '", monospace';
      if (span.offsetWidth !== baseW || span.offsetHeight !== baseH) {
        detected.push(testFonts[fi]);
      }
    }
    span.remove();
    fingerprints.fonts = detected.join(', ');
  } catch(e) {}

  // ========== CLICK TRACKING ==========
  var recentClicks = [];
  document.addEventListener('click', function(e) {
    var now = Date.now();
    var elapsed = now - visitStart;
    var target = e.target.closest('a, button, .project-card, .blog-card, .nav-link, .skill-node, .terminal, input, .mobile-link');
    var label = '';
    var tag = e.target.tagName.toLowerCase();
    if (target) {
      if (target.href) label = target.href;
      else if (target.classList.contains('project-card')) label = 'Project: ' + ((target.querySelector('.project-title') || {}).textContent || '').trim();
      else if (target.classList.contains('blog-card')) label = 'Blog: ' + ((target.querySelector('.blog-title') || {}).textContent || '').trim();
      else if (target.classList.contains('skill-node')) label = 'Skill: ' + ((target.querySelector('.skill-label') || {}).textContent || '').trim();
      else label = (target.textContent || '').trim().substring(0, 60);
      tag = target.tagName.toLowerCase();
    } else {
      label = 'bg:' + tag;
    }
    clicks.push({ t: elapsed, tag: tag, label: (label || '').substring(0, 80), x: e.clientX, y: e.clientY });

    // Rage click detection (3+ clicks within 500ms in similar area)
    recentClicks.push({ time: now, x: e.clientX, y: e.clientY });
    recentClicks = recentClicks.filter(function(c) { return now - c.time < 800; });
    if (recentClicks.length >= 3) {
      var first = recentClicks[0];
      var allClose = recentClicks.every(function(c) {
        return Math.abs(c.x - first.x) < 50 && Math.abs(c.y - first.y) < 50;
      });
      if (allClose) {
        rageClicks.push({ t: elapsed, x: e.clientX, y: e.clientY, count: recentClicks.length });
        recentClicks = [];
      }
    }
  }, true);

  // ========== COPY TRACKING ==========
  document.addEventListener('copy', function() {
    var sel = (window.getSelection() || '').toString().substring(0, 200);
    copies.push({ t: Date.now() - visitStart, text: sel });
  });

  // ========== SCROLL DEPTH ==========
  var docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
  window.addEventListener('scroll', function() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var winHeight = window.innerHeight;
    var pct = Math.round((scrollTop + winHeight) / docHeight * 100);
    if (pct > scrollMax) scrollMax = Math.min(pct, 100);
    lastActivity = Date.now();
  }, { passive: true });

  // ========== SECTION VIEW TRACKING ==========
  var sectionNames = ['home', 'about', 'nightreign', 'projects', 'skills', 'blog', 'terminal', 'contact'];
  var currentSection = null;
  var sectionEnterTime = 0;

  var sectionObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
        var id = entry.target.id;
        if (id && id !== currentSection) {
          // Record time spent in previous section
          if (currentSection && sectionEnterTime) {
            if (!sectionTimes[currentSection]) sectionTimes[currentSection] = 0;
            sectionTimes[currentSection] += Math.round((Date.now() - sectionEnterTime) / 1000);
          }
          currentSection = id;
          sectionEnterTime = Date.now();
          if (sectionsViewed.indexOf(id) === -1) sectionsViewed.push(id);
          if (viewOrder.length === 0 || viewOrder[viewOrder.length - 1] !== id) viewOrder.push(id);
        }
      }
    });
  }, { threshold: 0.3 });

  sectionNames.forEach(function(name) {
    var el = document.getElementById(name);
    if (el) sectionObserver.observe(el);
  });

  // ========== IDLE TIME TRACKING ==========
  var IDLE_THRESHOLD = 15000; // 15 seconds of no activity = idle
  var idleCheckInterval = setInterval(function() {
    var now = Date.now();
    if (now - lastActivity > IDLE_THRESHOLD) {
      idleTotal += 5; // Add 5 seconds each check
    }
  }, 5000);

  // Reset activity on any interaction
  ['mousemove', 'keydown', 'touchstart'].forEach(function(evt) {
    document.addEventListener(evt, function() { lastActivity = Date.now(); }, { passive: true });
  });

  // ========== EXIT INTENT ==========
  document.addEventListener('mouseout', function(e) {
    if (e.clientY <= 0 && e.relatedTarget === null) {
      exitIntents++;
    }
  });

  // ========== BUILD PAYLOAD ==========
  function buildPayload() {
    // Finalize current section time
    if (currentSection && sectionEnterTime) {
      if (!sectionTimes[currentSection]) sectionTimes[currentSection] = 0;
      var extra = Math.round((Date.now() - sectionEnterTime) / 1000);
      // Don't double count, store a snapshot
      var stCopy = {};
      for (var k in sectionTimes) stCopy[k] = sectionTimes[k];
      stCopy[currentSection] = (stCopy[currentSection] || 0) + extra;
    }

    var meta = {
      device: deviceInfo,
      fingerprints: fingerprints,
      scrollDepth: scrollMax,
      sectionsViewed: sectionsViewed,
      sectionTimes: stCopy || sectionTimes,
      viewOrder: viewOrder,
      rageClicks: rageClicks,
      idleTime: idleTotal,
      exitIntents: exitIntents,
      pageLoadTime: 0,
      windowSize: window.innerWidth + 'x' + window.innerHeight
    };

    // Page load timing
    if (window.performance && performance.timing) {
      var t = performance.timing;
      meta.pageLoadTime = t.loadEventEnd - t.navigationStart;
      meta.dnsTime = t.domainLookupEnd - t.domainLookupStart;
      meta.connectTime = t.connectEnd - t.connectStart;
      meta.ttfb = t.responseStart - t.navigationStart;
      meta.domReady = t.domContentLoadedEventEnd - t.navigationStart;
    }

    return {
      sid: sessionId,
      ip: visitorIP,
      geo: visitorGeo,
      ua: navigator.userAgent,
      referrer: document.referrer || '(direct)',
      screen: screen.width + 'x' + screen.height,
      lang: navigator.language,
      timeOnSite: Math.round((Date.now() - visitStart) / 1000),
      clicks: clicks,
      copies: copies,
      timestamp: new Date().toISOString(),
      page: location.pathname,
      meta: meta
    };
  }

  // ========== SEND DATA ==========
  var lastSendTime = 0;

  function sendAnalytics(force) {
    if (sessionStorage.getItem('devAuth') === '1') return;
    var now = Date.now();
    if (!force && now - lastSendTime < 25000) return;
    lastSendTime = now;
    var payload = buildPayload();
    var jsonStr = JSON.stringify(payload);
    try {
      // Use hidden form + iframe to POST to Apps Script (avoids CORS entirely)
      var iframe = document.createElement('iframe');
      iframe.name = 'arxPost' + now;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      var form = document.createElement('form');
      form.method = 'POST';
      form.action = ANALYTICS_ENDPOINT;
      form.target = iframe.name;
      form.style.display = 'none';
      var input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'data';
      input.value = jsonStr;
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
      setTimeout(function() { form.remove(); iframe.remove(); }, 5000);
    } catch(e) {}
  }

  // Send on page unload
  window.addEventListener('beforeunload', function() { sendAnalytics(true); });
  window.addEventListener('pagehide', function() { sendAnalytics(true); });

  // Periodic send every 30s
  setInterval(function() { sendAnalytics(false); }, 30000);

  // Initial send after 10s (once IP is likely resolved)
  setTimeout(function() { sendAnalytics(false); }, 10000);

  // ========== DEV ANALYTICS PANEL ==========
  ARX.showAnalyticsPanel = function() {
    var existing = document.getElementById('analyticsPanel');
    if (existing) { existing.remove(); return; }

    var panel = document.createElement('div');
    panel.id = 'analyticsPanel';
    panel.className = 'analytics-panel';
    panel.innerHTML =
      '<div class="analytics-header">' +
        '<span class="analytics-title">&gt;_ VISITOR ANALYTICS</span>' +
        '<button class="analytics-close" id="analyticsPanelClose">&times;</button>' +
      '</div>' +
      '<div class="analytics-body">' +
        '<div class="analytics-loading">Fetching visitor data...</div>' +
      '</div>';
    document.body.appendChild(panel);
    requestAnimationFrame(function() { panel.classList.add('open'); });

    document.getElementById('analyticsPanelClose').addEventListener('click', function() {
      panel.classList.remove('open');
      setTimeout(function() { panel.remove(); }, 300);
    });

    // Fetch analytics data
    fetch(ANALYTICS_ENDPOINT, { redirect: 'follow' })
      .then(function(resp) { return resp.json(); })
      .then(function(data) {
        renderAnalytics(panel.querySelector('.analytics-body'), data);
      })
      .catch(function() {
        // Fallback: JSONP if fetch fails (CORS)
        var cbName = '_arxCb' + Date.now();
        var timeout = setTimeout(function() {
          delete window[cbName];
          panel.querySelector('.analytics-body').innerHTML =
            '<div class="analytics-error">Timed out fetching data.</div>';
        }, 12000);
        window[cbName] = function(data) {
          clearTimeout(timeout);
          delete window[cbName];
          renderAnalytics(panel.querySelector('.analytics-body'), data);
        };
        var s = document.createElement('script');
        s.src = ANALYTICS_ENDPOINT + '?callback=' + cbName;
        s.onload = function() { s.remove(); };
        s.onerror = function() {
          clearTimeout(timeout);
          delete window[cbName];
          s.remove();
          panel.querySelector('.analytics-body').innerHTML =
            '<div class="analytics-error">Failed to load analytics data. Check deployment.</div>';
        };
        document.head.appendChild(s);
      });
  };

  function renderAnalytics(container, data) {
    if (!data || !data.visitors || data.visitors.length === 0) {
      container.innerHTML = '<div class="analytics-empty">No visitor data yet.</div>';
      return;
    }

    var visitors = data.visitors;
    visitors.sort(function(a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });

    // Parse meta for each visitor
    visitors.forEach(function(v) {
      if (typeof v.meta === 'string') {
        try { v.meta = JSON.parse(v.meta); } catch(e) { v.meta = {}; }
      }
      if (!v.meta) v.meta = {};
    });

    // Summary stats
    var uniqueIPs = {};
    var totalClicks = 0;
    var totalTime = 0;
    var totalRage = 0;
    var avgScroll = 0;
    visitors.forEach(function(v) {
      if (v.ip) uniqueIPs[v.ip] = true;
      totalClicks += (v.clicks ? v.clicks.length : 0);
      totalTime += (v.timeOnSite || 0);
      totalRage += (v.meta.rageClicks ? v.meta.rageClicks.length : 0);
      avgScroll += (v.meta.scrollDepth || 0);
    });
    var avgTime = Math.round(totalTime / visitors.length);
    avgScroll = Math.round(avgScroll / visitors.length);

    var html =
      '<div class="analytics-stats">' +
        statBox(Object.keys(uniqueIPs).length, 'Unique IPs') +
        statBox(visitors.length, 'Sessions') +
        statBox(totalClicks, 'Clicks') +
        statBox(formatTime(avgTime), 'Avg Time') +
        statBox(avgScroll + '%', 'Avg Scroll') +
        statBox(totalRage, 'Rage Clicks') +
      '</div>';

    // Visitor table
    html += '<div class="analytics-table-wrap"><table class="analytics-table"><thead><tr>' +
      '<th>IP</th><th>Location</th><th>When</th><th>Time</th><th>Scroll</th><th>Clicks</th><th>Browser</th><th>Device</th>' +
    '</tr></thead><tbody>';

    visitors.forEach(function(v) {
      var loc = v.geo ? (v.geo.city + ', ' + v.geo.region) : '—';
      var when = v.timestamp ? formatAgo(v.timestamp) : '—';
      var dur = formatTime(v.timeOnSite || 0);
      var scroll = (v.meta.scrollDepth || 0) + '%';
      var clickCount = v.clicks ? v.clicks.length : 0;
      var browser = parseBrowserShort(v.ua || '');
      var deviceStr = '';
      if (v.meta.device) {
        var d = v.meta.device;
        deviceStr = (d.touch ? 'Mobile' : 'Desktop');
        if (d.cores) deviceStr += ' ' + d.cores + 'c';
        if (d.memory) deviceStr += '/' + d.memory + 'GB';
      }

      html += '<tr class="analytics-row">' +
        '<td class="mono">' + escHtml(v.ip || '—') + '</td>' +
        '<td>' + escHtml(loc) + '</td>' +
        '<td>' + when + '</td>' +
        '<td>' + dur + '</td>' +
        '<td>' + scroll + '</td>' +
        '<td>' + clickCount + '</td>' +
        '<td>' + escHtml(browser) + '</td>' +
        '<td>' + escHtml(deviceStr) + '</td>' +
      '</tr>';

      // Expandable detail row
      var details = buildDetailHTML(v);
      html += '<tr class="analytics-detail-row hidden"><td colspan="8"><div class="analytics-details">' + details + '</div></td></tr>';
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;

    container.querySelectorAll('.analytics-row').forEach(function(row) {
      row.addEventListener('click', function() {
        var next = row.nextElementSibling;
        if (next && next.classList.contains('analytics-detail-row')) {
          next.classList.toggle('hidden');
        }
      });
    });
  }

  function buildDetailHTML(v) {
    var h = '';
    var m = v.meta || {};
    var d = m.device || {};

    // Map
    if (v.geo && v.geo.lat && v.geo.lng) {
      h += '<div class="detail-section detail-map-section">' +
        '<strong>Location</strong> — ' + escHtml((v.geo.city || '') + ', ' + (v.geo.region || '') + ', ' + (v.geo.country || '')) + '<br>' +
        '<iframe class="analytics-map" src="https://www.openstreetmap.org/export/embed.html?bbox=' +
          (v.geo.lng - 0.05) + ',' + (v.geo.lat - 0.03) + ',' + (v.geo.lng + 0.05) + ',' + (v.geo.lat + 0.03) +
          '&layer=mapnik&marker=' + v.geo.lat + ',' + v.geo.lng + '" loading="lazy"></iframe>' +
        '</div>';
    }

    // Device info
    h += '<div class="detail-section"><strong>Device</strong><br>';
    h += row('Screen', (d.screen || '—') + ' @' + (d.pixelRatio || 1) + 'x, ' + (d.colorDepth || '?') + 'bit');
    h += row('Window', m.windowSize || '—');
    h += row('GPU', d.gpu || '—');
    h += row('CPU Cores', d.cores || '—');
    h += row('RAM', d.memory ? d.memory + ' GB' : '—');
    h += row('Touch', d.touch ? 'Yes' : 'No');
    h += row('Platform', d.platform || '—');
    h += row('Dark Mode', d.darkMode ? 'Yes' : 'No');
    h += row('Reduced Motion', d.reducedMotion ? 'Yes' : 'No');
    h += '</div>';

    // Network
    h += '<div class="detail-section"><strong>Network</strong><br>';
    h += row('ISP', (v.geo ? v.geo.isp : '') || '—');
    h += row('Timezone', d.timezone || '—');
    if (d.connectionType) h += row('Connection', d.connectionType + (d.downlink ? ' / ' + d.downlink + ' Mbps' : ''));
    if (d.saveData) h += row('Data Saver', 'ON');
    h += row('Referrer', v.referrer || '(direct)');
    if (d.utmSource) h += row('UTM', d.utmSource + ' / ' + (d.utmMedium || '') + ' / ' + (d.utmCampaign || ''));
    h += '</div>';

    // Browser
    h += '<div class="detail-section"><strong>Browser</strong><br>';
    h += row('UA', '<span style="word-break:break-all;font-size:0.55rem">' + escHtml(v.ua || '') + '</span>');
    h += row('Language', d.lang + (d.languages ? ' (' + d.languages + ')' : ''));
    h += row('DNT', d.doNotTrack ? 'Enabled' : 'Disabled');
    h += row('Cookies', d.cookiesEnabled ? 'Yes' : 'No');
    h += row('LocalStorage', d.localStorage ? 'Yes' : 'No');
    h += row('Ad Blocker', d.adBlocker ? 'YES' : 'No');
    h += row('PDF Viewer', d.pdfViewer ? 'Yes' : 'No');
    h += '</div>';

    // Fingerprints
    var fp = m.fingerprints || {};
    if (fp.canvas || fp.audio || fp.webgl || fp.fonts) {
      h += '<div class="detail-section"><strong>Fingerprints</strong><br>';
      if (fp.canvas) h += row('Canvas', fp.canvas);
      if (fp.audio) h += row('Audio', fp.audio);
      if (fp.webgl) h += row('WebGL', '<span style="word-break:break-all;font-size:0.55rem">' + escHtml(fp.webgl) + '</span>');
      if (fp.fonts) h += row('Fonts', '<span style="font-size:0.55rem">' + escHtml(fp.fonts) + '</span>');
      h += '</div>';
    }

    // Performance
    if (m.pageLoadTime) {
      h += '<div class="detail-section"><strong>Performance</strong><br>';
      h += row('Page Load', m.pageLoadTime + 'ms');
      if (m.ttfb) h += row('TTFB', m.ttfb + 'ms');
      if (m.dnsTime) h += row('DNS', m.dnsTime + 'ms');
      if (m.domReady) h += row('DOM Ready', m.domReady + 'ms');
      h += '</div>';
    }

    // Behavior
    h += '<div class="detail-section"><strong>Behavior</strong><br>';
    h += row('Scroll Depth', (m.scrollDepth || 0) + '%');
    h += row('Idle Time', formatTime(m.idleTime || 0));
    h += row('Exit Intents', m.exitIntents || 0);
    if (m.sectionsViewed) h += row('Sections Seen', m.sectionsViewed.join(', '));
    if (m.viewOrder) h += row('View Order', m.viewOrder.join(' → '));
    if (m.sectionTimes) {
      var stParts = [];
      for (var s in m.sectionTimes) {
        if (m.sectionTimes[s] > 0) stParts.push(s + ': ' + m.sectionTimes[s] + 's');
      }
      if (stParts.length) h += row('Time/Section', stParts.join(', '));
    }
    h += '</div>';

    // Rage clicks
    if (m.rageClicks && m.rageClicks.length > 0) {
      h += '<div class="detail-section"><strong>Rage Clicks (' + m.rageClicks.length + ')</strong><br>';
      m.rageClicks.forEach(function(rc) {
        h += '<span class="mono dim">[' + formatTime(Math.round(rc.t / 1000)) + ']</span> at (' + rc.x + ', ' + rc.y + ') x' + rc.count + '<br>';
      });
      h += '</div>';
    }

    // Clicks
    if (v.clicks && v.clicks.length > 0) {
      h += '<div class="detail-section"><strong>Clicks (' + v.clicks.length + ')</strong><br>';
      v.clicks.slice(0, 30).forEach(function(c) {
        h += '<span class="mono dim">[' + formatTime(Math.round(c.t / 1000)) + ']</span> ' + escHtml(c.label || c.tag) + '<br>';
      });
      if (v.clicks.length > 30) h += '<span class="dim">...and ' + (v.clicks.length - 30) + ' more</span><br>';
      h += '</div>';
    }

    // Copies
    if (v.copies && v.copies.length > 0) {
      h += '<div class="detail-section"><strong>Copies (' + v.copies.length + ')</strong><br>';
      v.copies.forEach(function(c) {
        h += '<span class="mono dim">[' + formatTime(Math.round(c.t / 1000)) + ']</span> "' + escHtml(c.text) + '"<br>';
      });
      h += '</div>';
    }

    return h;
  }

  function row(label, val) {
    return '<span class="detail-label">' + label + ':</span> ' + val + '<br>';
  }

  function statBox(num, label) {
    return '<div class="analytics-stat"><span class="stat-num">' + num + '</span><span class="stat-label">' + label + '</span></div>';
  }

  function formatTime(seconds) {
    if (seconds < 60) return seconds + 's';
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return m + 'm ' + s + 's';
  }

  function formatAgo(ts) {
    var diff = Math.round((Date.now() - new Date(ts).getTime()) / 1000);
    if (diff < 60) return diff + 's ago';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  }

  function parseBrowserShort(ua) {
    var m;
    if ((m = ua.match(/Edg\/(\d+)/))) return 'Edge ' + m[1];
    if ((m = ua.match(/OPR\/(\d+)/))) return 'Opera ' + m[1];
    if ((m = ua.match(/Firefox\/(\d+)/))) return 'FF ' + m[1];
    if ((m = ua.match(/Chrome\/(\d+)/))) return 'Chrome ' + m[1];
    if ((m = ua.match(/Version\/(\d+).*Safari/))) return 'Safari ' + m[1];
    return 'Other';
  }

  function escHtml(str) {
    var d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

})(window.ARX);
