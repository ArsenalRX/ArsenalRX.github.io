(function() {
  // ========== SCROLL PROGRESS BAR ==========
  var progressBar = document.getElementById('scrollProgress');
  var topBtn = document.getElementById('topBtn');

  function updateScroll() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = progress + '%';
    if (topBtn) topBtn.classList.toggle('visible', scrollTop > 400);
  }
  window.addEventListener('scroll', updateScroll, { passive: true });

  if (topBtn) {
    topBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ========== REVEAL ON SCROLL ==========
  var reveals = document.querySelectorAll('.reveal');
  var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(function(el) { revealObserver.observe(el); });

  // ========== NAV SCROLL STYLE ==========
  var nav = document.getElementById('nav');
  window.addEventListener('scroll', function() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // ========== CURRENT YEAR ==========
  var yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
