(function(ARX) {
  var nav = document.getElementById('nav');
  var sections = document.querySelectorAll('.section');
  var navLinks = document.querySelectorAll('.nav-link');
  var scrollIndicator = document.getElementById('scrollIndicator');
  var _scrollTicking = false;

  window.addEventListener('scroll', function() {
    if (!_scrollTicking) {
      _scrollTicking = true;
      requestAnimationFrame(function() {
        var sy = window.scrollY;
        if (nav) nav.classList.toggle('scrolled', sy > 50);
        if (scrollIndicator) scrollIndicator.style.opacity = sy > 100 ? '0' : '1';

        var current = 'home';
        sections.forEach(function(section) {
          if (sy >= section.offsetTop - 200) current = section.getAttribute('id');
        });
        navLinks.forEach(function(link) {
          link.classList.toggle('active', link.dataset.section === current);
        });
        _scrollTicking = false;
      });
    }
  }, { passive: true });

  // ========== MOBILE MENU ==========
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    document.querySelectorAll('.mobile-link').forEach(function(link) {
      link.addEventListener('click', function() {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
      });
    });
  }

  // ========== SMOOTH SCROLL ==========
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      var target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (mobileMenu) mobileMenu.classList.remove('open');
      if (hamburger) hamburger.classList.remove('open');
    });
  });
})(window.ARX);
