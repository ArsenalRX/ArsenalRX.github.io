(function(ARX) {
  var contactForm = document.getElementById('contactForm');
  var transmissionSent = document.getElementById('transmissionSent');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var form = this;
      var formData = new FormData(form);
      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      }).then(function() {
        form.style.display = 'none';
        form.previousElementSibling.style.display = 'none';
        if (transmissionSent) transmissionSent.classList.add('show');
      }).catch(function() {
        form.style.display = 'none';
        if (transmissionSent) transmissionSent.classList.add('show');
      });
    });
  }

  // ========== FOOTER ==========
  document.getElementById('currentYear').textContent = new Date().getFullYear();

  var footerContent = document.getElementById('footerContent');
  var footerSecret = document.getElementById('footerSecret');
  if (footerContent && footerSecret) {
    var footerClicks = 0;
    footerContent.addEventListener('click', function() {
      footerClicks++;
      if (footerClicks >= 3) { footerSecret.classList.add('show'); footerClicks = 0; }
    });
  }
})(window.ARX);
