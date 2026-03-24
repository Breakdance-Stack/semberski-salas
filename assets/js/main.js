// --- Semberski Salas ---
// Partial-Loader, Burger-Menü, Auto-Hide Header, FAQ Accordion

function getRootPrefix() {
  var parts = window.location.pathname.split('/').filter(Boolean);
  var ghPages = document.documentElement.dataset.repo;
  var after = parts;
  if (ghPages) {
    var idx = parts.indexOf(ghPages);
    if (idx !== -1) after = parts.slice(idx + 1);
  }
  return '../'.repeat(Math.max(0, after.length - 1));
}

function resolveRootToken(s) {
  return (s || '').replace(/\{\{ROOT\}\}/g, getRootPrefix());
}

async function loadIncludes() {
  var targets = document.querySelectorAll('[data-include]');
  for (var el of targets) {
    var url = el.getAttribute('data-include');
    if (!url) continue;
    url = resolveRootToken(url);
    try {
      var res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      el.innerHTML = resolveRootToken(await res.text());
    } catch (e) {
      console.error('Include failed:', e);
    }
  }
}

function initBurger() {
  var btn = document.querySelector('[data-burger]');
  var menu = document.querySelector('[data-mobile-menu]');
  if (!btn || !menu) return;
  btn.addEventListener('click', function() {
    var isHidden = menu.hasAttribute('hidden');
    if (isHidden) menu.removeAttribute('hidden');
    else menu.setAttribute('hidden', '');
    btn.setAttribute('aria-expanded', String(isHidden));
  });
  menu.addEventListener('click', function(e) {
    if (e.target.tagName === 'A') {
      menu.setAttribute('hidden', '');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

function highlightActiveNav() {
  var path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, [data-mobile-menu] a').forEach(function(a) {
    var href = a.getAttribute('href');
    if (!href) return;
    var linkPage = href.split('/').pop().split('#')[0];
    if (linkPage === path) {
      a.classList.add('active');
    }
  });
}

// Auto-hide header: hide on scroll down, show on scroll up
function initAutoHideHeader() {
  var header = document.getElementById('siteHeader');
  if (!header) return;
  var lastY = 0;
  var ticking = false;
  window.addEventListener('scroll', function() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (y > 120) {
        header.classList.add('header-shadow');
        if (y > lastY && y > 200) header.classList.add('header-hidden');
        else header.classList.remove('header-hidden');
      } else {
        header.classList.remove('header-shadow');
        header.classList.remove('header-hidden');
      }
      lastY = y;
      ticking = false;
    });
  }, { passive: true });
}

// FAQ Accordion
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var item = btn.closest('.faq-item');
      var answer = item.querySelector('.faq-answer');
      var isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(function(el) {
        el.classList.remove('open');
        el.querySelector('.faq-answer').style.maxHeight = '0';
      });
      // Open clicked if it was closed
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

// Lightbox for gallery
function initLightbox() {
  var lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  var lbImg = lightbox.querySelector('img');
  document.querySelectorAll('.gallery-item img').forEach(function(img) {
    img.addEventListener('click', function() {
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });
  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

(async function() {
  await loadIncludes();
  initBurger();
  highlightActiveNav();
  initAutoHideHeader();
  initFAQ();
  initLightbox();
})();
