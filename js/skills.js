(function(ARX) {
  var skillDescriptions = {
    'Python': 'Versatile powerhouse for AI, automation, scripting, and backend development.',
    'JavaScript': 'The language of the web \u2014 powers interactivity, animations, and full-stack apps.',
    'TypeScript': 'Type-safe JavaScript \u2014 catches bugs early and scales to large codebases.',
    'C#': 'Object-oriented language for .NET, desktop apps, game dev, and enterprise software.',
    'C++': 'High-performance systems language \u2014 game engines, drivers, and low-level programming.',
    'Rust': 'Memory-safe systems language \u2014 fast, reliable, and perfect for native apps.',
    '.NET': 'Microsoft framework for building desktop, web, and enterprise applications.',
    'Node.js': 'JavaScript runtime for building scalable server-side applications.',
    'React': 'Component-based UI library for building fast, dynamic web interfaces.',
    'Docker': 'Containerization platform \u2014 package and deploy apps anywhere consistently.',
    'Git & GitHub': 'Version control and collaboration \u2014 track changes, manage code, and work with teams.',
    'Linux': 'Open-source OS \u2014 servers, development environments, and system administration.',
    'AI & ML': 'Machine learning and artificial intelligence \u2014 training models and building smart systems.',
    'Windows': 'Primary development platform \u2014 deep knowledge of Windows internals, drivers, and system APIs.',
    'Fedora': 'Red Hat-based Linux distro \u2014 development, servers, and containerized workflows.',
  };

  var centerLabel = document.getElementById('hoveredSkill');
  var skillsCenter = document.getElementById('skillsCenter');
  var isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
  var activeSkillCard = null;

  if (isTouchDevice && centerLabel) {
    centerLabel.innerHTML = 'Tap a skill to learn more';
  }

  function showSkillInfo(card) {
    var name = card.dataset.skill;
    var desc = skillDescriptions[name] || '';
    centerLabel.innerHTML = '<strong>' + name + '</strong><br><span style="font-size:0.8rem;font-weight:400;opacity:0.8;">' + desc + '</span>';
    var icon = document.getElementById('skillInfoIcon');
    if (icon) icon.textContent = name.charAt(0);
    skillsCenter.classList.add('active');
  }

  function clearSkillInfo() {
    centerLabel.innerHTML = isTouchDevice ? 'Tap a skill to learn more' : 'Hover a skill to learn more';
    var icon = document.getElementById('skillInfoIcon');
    if (icon) icon.textContent = '?';
    skillsCenter.classList.remove('active');
    activeSkillCard = null;
  }

  document.querySelectorAll('.skill-card').forEach(function(card) {
    card.addEventListener('mouseenter', function() { showSkillInfo(card); });
    card.addEventListener('mouseleave', clearSkillInfo);
    card.addEventListener('click', function(e) {
      e.stopPropagation();
      if (activeSkillCard === card) { clearSkillInfo(); }
      else { activeSkillCard = card; showSkillInfo(card); }
    });
  });

  document.addEventListener('click', function() { if (activeSkillCard) clearSkillInfo(); });
})(window.ARX);
