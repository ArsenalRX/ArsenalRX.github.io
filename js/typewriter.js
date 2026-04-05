(function(ARX) {
  // ========== TYPEWRITER ==========
  var phrases = ['Developer & Creator', 'Building cool things', 'Always learning', 'Open source enthusiast', 'Turning ideas into code'];
  var phraseIndex = 0, charIndex = 0, isDeleting = false;
  var typewriterEl = document.getElementById('typewriter');

  function typewrite() {
    var currentPhrase = phrases[phraseIndex];
    if (isDeleting) { typewriterEl.textContent = currentPhrase.substring(0, charIndex - 1); charIndex--; }
    else { typewriterEl.textContent = currentPhrase.substring(0, charIndex + 1); charIndex++; }
    var speed = isDeleting ? ARX.TYPEWRITER_DELETE_SPEED : ARX.TYPEWRITER_TYPE_SPEED;
    if (!isDeleting && charIndex === currentPhrase.length) { speed = ARX.TYPEWRITER_PAUSE; isDeleting = true; }
    else if (isDeleting && charIndex === 0) { isDeleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; speed = ARX.TYPEWRITER_SWITCH_DELAY; }
    setTimeout(typewrite, speed);
  }
  typewrite();

  // ========== GREETING TEXT SCRAMBLE ==========
  var greetingEl = document.querySelector('.greeting-text');
  if (greetingEl) {
    var original = greetingEl.textContent;
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    var iterations = 0;
    var scrambleInterval = setInterval(function() {
      greetingEl.textContent = original.split('').map(function(char, i) {
        if (i < iterations) return original[i];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      iterations += 0.5;
      if (iterations >= original.length) clearInterval(scrambleInterval);
    }, ARX.GREETING_SCRAMBLE_SPEED);
  }

  // ========== HERO NAME GLITCH ==========
  var heroName = document.getElementById('heroName');
  setInterval(function() {
    if (Math.random() > ARX.HERO_GLITCH_CHANCE) {
      heroName.classList.add('glitch');
      setTimeout(function() { heroName.classList.remove('glitch'); }, 300);
    }
  }, ARX.HERO_GLITCH_INTERVAL);

  // ========== SECTION TITLE LETTER-BY-LETTER ASSEMBLY ==========
  function assembleTitle(titleEl) {
    var textSpan = titleEl.querySelector('.title-text');
    if (!textSpan || textSpan.dataset.assembled) return;
    textSpan.dataset.assembled = '1';
    var text = textSpan.textContent;
    textSpan.textContent = '';
    var charEls = [];
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement('span');
      span.className = 'title-char';
      span.textContent = text[i] === ' ' ? '\u00A0' : text[i];
      textSpan.appendChild(span);
      charEls.push(span);
    }
    charEls.forEach(function(charEl, i) {
      setTimeout(function() { charEl.classList.add('revealed'); }, i * ARX.TITLE_CHAR_DELAY_MS + 100);
    });
    setTimeout(function() { titleEl.classList.add('title-assembled'); }, charEls.length * ARX.TITLE_CHAR_DELAY_MS + 200);
  }

  // ========== SCROLL REVEAL (with title assembly) ==========
  var revealElements = document.querySelectorAll('.reveal');
  var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry, i) {
      if (entry.isIntersecting) {
        setTimeout(function() {
          entry.target.classList.add('visible');
          if (entry.target.classList.contains('section-title')) {
            assembleTitle(entry.target);
          }
        }, i * 100);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  revealElements.forEach(function(el) { revealObserver.observe(el); });
  ARX.revealObserver = revealObserver;
})(window.ARX);
