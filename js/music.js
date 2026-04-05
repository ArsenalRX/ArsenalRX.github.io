(function(ARX) {
  var siteMusic = {
    audio: null,
    started: false,
    muted: false,
    volume: 0.3,

    init: function() {
      this.audio = new Audio('music/snowfall.mp3');
      this.audio.loop = true;
      this.audio.preload = 'auto';
      this.audio.volume = this.volume;

      var musicBtn = document.getElementById('musicToggle');
      var iconOn = musicBtn ? musicBtn.querySelector('.music-icon-on') : null;
      var iconOff = musicBtn ? musicBtn.querySelector('.music-icon-off') : null;
      var self = this;

      // Show muted state initially
      if (musicBtn) musicBtn.classList.add('muted');
      if (iconOn) iconOn.style.display = 'none';
      if (iconOff) iconOff.style.display = '';

      var onFirstPlay = function() {
        self.started = true;
        self.muted = false;
        if (musicBtn) musicBtn.classList.remove('muted');
        if (iconOn) iconOn.style.display = '';
        if (iconOff) iconOff.style.display = 'none';
        self.showNowPlaying();
      };

      this.audio.play().then(onFirstPlay).catch(function() {});

      var tryPlay = function() {
        if (self.started || self.muted) return;
        self.audio.play().then(function() {
          onFirstPlay();
          events.forEach(function(evt) { document.removeEventListener(evt, tryPlay, true); });
        }).catch(function() {});
      };
      var events = ['click', 'keydown', 'scroll', 'touchstart', 'mousemove', 'mousedown', 'pointerdown'];
      events.forEach(function(evt) { document.addEventListener(evt, tryPlay, true); });

      if (musicBtn) {
        musicBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          self.toggle();
        });
      }
    },

    toggle: function() {
      var musicBtn = document.getElementById('musicToggle');
      var iconOn = musicBtn ? musicBtn.querySelector('.music-icon-on') : null;
      var iconOff = musicBtn ? musicBtn.querySelector('.music-icon-off') : null;

      if (this.muted) {
        this.muted = false;
        this.audio.volume = this.volume;
        this.audio.play().catch(function() {});
        this.started = true;
        if (musicBtn) musicBtn.classList.remove('muted');
        if (iconOn) iconOn.style.display = '';
        if (iconOff) iconOff.style.display = 'none';
      } else {
        this.muted = true;
        this.audio.volume = 0;
        if (musicBtn) musicBtn.classList.add('muted');
        if (iconOn) iconOn.style.display = 'none';
        if (iconOff) iconOff.style.display = '';
      }
    },

    showNowPlaying: function() {
      var toast = document.createElement('div');
      toast.className = 'now-playing-toast';
      toast.textContent = '\u266a Now playing: Snowfall';
      document.body.appendChild(toast);
      requestAnimationFrame(function() {
        requestAnimationFrame(function() { toast.classList.add('visible'); });
      });
      setTimeout(function() {
        toast.classList.remove('visible');
        setTimeout(function() { toast.remove(); }, 500);
      }, 3000);
    },

    mute: function() { if (this.audio) { this.audio.volume = 0; this.muted = true; } },
    unmute: function() { if (this.audio) { this.audio.volume = this.volume; this.muted = false; } },
  };

  siteMusic.init();
  ARX.siteMusic = siteMusic;
})(window.ARX);
