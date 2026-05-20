(function() {
  // ========== CURSOR GLOW ==========
  var glow = document.getElementById('cursorGlow');
  if (glow && !window.matchMedia('(pointer: coarse)').matches) {
    var gx = 0, gy = 0, tx = 0, ty = 0;
    document.addEventListener('mousemove', function(e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function animateGlow() {
      gx += (tx - gx) * 0.15;
      gy += (ty - gy) * 0.15;
      glow.style.transform = 'translate(' + gx + 'px, ' + gy + 'px)';
      requestAnimationFrame(animateGlow);
    })();
  }

  // ========== HERO TEXT SPLIT ANIMATION ==========
  var heroName = document.getElementById('heroName');
  if (heroName) {
    var html = heroName.innerHTML;
    var result = '';
    var charIndex = 0;
    var inTag = false;
    for (var i = 0; i < html.length; i++) {
      if (html[i] === '<') { inTag = true; result += html[i]; continue; }
      if (html[i] === '>') { inTag = false; result += html[i]; continue; }
      if (inTag) { result += html[i]; continue; }
      if (html[i] === ' ') { result += ' '; continue; }
      result += '<span class="hero-char" style="animation-delay:' + (charIndex * 0.06) + 's">' + html[i] + '</span>';
      charIndex++;
    }
    heroName.innerHTML = result;
    heroName.classList.add('hero-name-animated');
  }

  // ========== STAGGERED CARD REVEALS ==========
  var grids = document.querySelectorAll('.projects-grid, .cyber-focus-cards, .skills-pills');
  grids.forEach(function(grid) {
    var cards = grid.children;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          for (var i = 0; i < cards.length; i++) {
            (function(idx) {
              setTimeout(function() {
                cards[idx].classList.add('stagger-in');
              }, idx * 100);
            })(i);
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    observer.observe(grid);
  });

  // ========== MAGNETIC BUTTONS ==========
  var buttons = document.querySelectorAll('.btn');
  if (!window.matchMedia('(pointer: coarse)').matches) {
    buttons.forEach(function(btn) {
      btn.addEventListener('mousemove', function(e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + (x * 0.15) + 'px, ' + (y * 0.15) + 'px)';
      });
      btn.addEventListener('mouseleave', function() {
        btn.style.transform = '';
        btn.style.transition = 'transform 0.4s ease';
        setTimeout(function() { btn.style.transition = ''; }, 400);
      });
    });
  }

  // ========== TILT ON PROJECT CARDS ==========
  if (!window.matchMedia('(pointer: coarse)').matches) {
    document.addEventListener('mousemove', function(e) {
      var card = e.target.closest('.project-card, .cyber-card, .stat-card');
      if (!card) return;
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = 'perspective(800px) rotateY(' + (x * 6) + 'deg) rotateX(' + (-y * 6) + 'deg) translateY(-3px)';
    }, { passive: true });
    document.addEventListener('mouseout', function(e) {
      var card = e.target.closest('.project-card, .cyber-card, .stat-card');
      if (card && !card.contains(e.relatedTarget)) card.style.transform = '';
    }, { passive: true });
  }
})();
