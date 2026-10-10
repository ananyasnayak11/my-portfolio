(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const storedTheme = (() => { try { return localStorage.getItem('ananya-theme'); } catch { return null; } })();
  if (storedTheme) root.dataset.theme = storedTheme;
  function syncThemeButton() {
    const dark = root.dataset.theme === 'dark';
    themeToggle.textContent = dark ? '☀' : '☾';
    themeToggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    themeToggle.title = dark ? 'Switch to light theme' : 'Switch to dark theme';
  }
  syncThemeButton();
  themeToggle.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('ananya-theme', root.dataset.theme); } catch {}
    syncThemeButton();
  });

  const nav = document.getElementById('nav');
  document.getElementById('menuToggle').addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

  const sections = [...document.querySelectorAll('main section[id]')];
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          nav.querySelectorAll('a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
        }
      });
    }, { rootMargin: '-25% 0px -65% 0px' });
    sections.forEach(section => navObserver.observe(section));
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
    }), { threshold: .08 });
    document.querySelectorAll('.section-kicker,.section-heading,.glass-card,.timeline-item,.project-card,.experience-card,.achievement-card,.skill-group').forEach(el => {
      el.classList.add('reveal'); revealObserver.observe(el);
    });
  }

  document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(b => b.classList.toggle('active', b === button));
    document.querySelectorAll('.project-card').forEach(card => {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
    });
  }));

  const dialog = document.getElementById('projectDialog');
  document.querySelectorAll('.project-card').forEach(card => card.addEventListener('click', () => {
    document.getElementById('dialogTitle').textContent = card.dataset.title;
    document.getElementById('dialogType').textContent = card.dataset.type;
    document.getElementById('dialogDescription').textContent = card.dataset.description;
    const tools = document.getElementById('dialogTools');
    tools.replaceChildren(...card.dataset.tools.split(' · ').map(tool => {
      const span = document.createElement('span'); span.textContent = tool; return span;
    }));
    dialog.showModal();
  }));
  document.getElementById('dialogClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

  let score = 0;
  const target = document.getElementById('sparkTarget');
  const arena = document.getElementById('gameArena');
  const scoreEl = document.getElementById('score');
  const gameMessage = document.getElementById('gameMessage');
  function moveTarget() {
    const maxX = Math.max(0, arena.clientWidth - target.offsetWidth);
    const maxY = Math.max(0, arena.clientHeight - target.offsetHeight - 12);
    target.style.left = Math.floor(Math.random() * maxX) + 'px';
    target.style.top = Math.floor(Math.random() * maxY) + 'px';
  }
  target.addEventListener('click', () => {
    if (score >= 10) return;
    score++; scoreEl.textContent = score;
    if (score >= 10) { gameMessage.textContent = 'You caught every spark! 🎉'; target.textContent = '✓'; }
    else { gameMessage.textContent = ['Nice!','Great catch!','You’re quick!','Keep going!'][Math.floor(Math.random()*4)]; moveTarget(); }
  });
  document.getElementById('resetGame').addEventListener('click', () => {
    score = 0; scoreEl.textContent = '0'; target.textContent = '✦'; gameMessage.textContent = 'Ready?'; moveTarget();
  });
  window.addEventListener('resize', moveTarget);
  moveTarget();

  const quizResults = {
    create: 'You might be a thoughtful experience-builder: you notice people’s needs and enjoy making technology easier to use. ✨',
    data: 'You might be a pattern explorer: you enjoy connecting clues, asking “why?” and finding meaning in information. 📊',
    ai: 'You might be an imaginative problem-solver: you’re curious about how smart tools can help people do more. 🤖'
  };
  document.querySelectorAll('#quizOptions button').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('#quizOptions button').forEach(b => b.classList.toggle('selected', b === button));
    document.getElementById('quizResult').textContent = quizResults[button.dataset.answer];
  }));
  const quotes = [
    '“You don’t have to know everything to begin. You only need to begin.”',
    '“Small progress is still progress. Keep showing up.”',
    '“Your first try is allowed to be a learning experience.”',
    '“You are not behind. You are building at your own pace.”',
    '“Curiosity turns ‘I can’t’ into ‘What if I try?’”',
    '“Make something useful. Make something joyful. Make it yours.”'
  ];
  let quoteIndex = 0;
  document.getElementById('newQuote').addEventListener('click', () => {
    quoteIndex = (quoteIndex + 1) % quotes.length;
    const box = document.getElementById('quoteBox');
    box.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}], {duration:350});
    box.textContent = quotes[quoteIndex];
  });

  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(message) {
    toast.textContent = message; toast.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2300);
  }
  document.getElementById('copyEmail').addEventListener('click', async () => {
    const email = 'ananyasnayak18@gmail.com';
    try {
      await navigator.clipboard.writeText(email);
      document.getElementById('copyStatus').textContent = 'Email copied — see you in your inbox! ✨';
      showToast('Email copied to clipboard!');
    } catch {
      document.getElementById('copyStatus').textContent = email;
      showToast('Your email is shown above — copy it from there.');
    }
  });

  // Animated, lightweight star particles. Pauses when the tab is hidden.
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  let particles = [], w = 0, h = 0, raf = 0;
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const count = Math.min(65, Math.floor(w / 19));
    particles = Array.from({length:count}, () => ({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.7+.4,vx:(Math.random()-.5)*.22,vy:Math.random()*.25+.04,phase:Math.random()*6.28}));
  }
  function drawStars() {
    ctx.clearRect(0,0,w,h);
    const dark = root.dataset.theme === 'dark';
    const color = dark ? '170,160,255' : '109,103,204';
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.phase += .02;
      if (p.y > h+5) {p.y=-5;p.x=Math.random()*w;}
      if (p.x < -5) p.x=w+5; if(p.x>w+5)p.x=-5;
      const alpha = .12 + (Math.sin(p.phase)+1)*.17;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(${color},${alpha})`; ctx.fill();
    });
    raf = requestAnimationFrame(drawStars);
  }
  resizeCanvas(); drawStars();
  window.addEventListener('resize', resizeCanvas);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else drawStars();
  });
})();