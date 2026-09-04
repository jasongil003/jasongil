(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js');

  const themeToggle = document.getElementById('theme-toggle');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const menuToggle = document.getElementById('menu-toggle');
  const primaryNav = document.getElementById('primary-nav');
  const navLinks = primaryNav ? [...primaryNav.querySelectorAll('a[href^="#"]')] : [];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const getTheme = () => root.dataset.theme === 'light' ? 'light' : 'dark';

  function syncThemeControls() {
    const theme = getTheme();
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    }
    if (themeColor) {
      themeColor.setAttribute('content', theme === 'dark' ? '#08110f' : '#f5f8f7');
    }
  }

  function setTheme(theme) {
    root.dataset.theme = theme;
    try {
      localStorage.setItem('jason-portfolio-theme', theme);
    } catch (error) {
      // The selected theme still works for the current session.
    }
    syncThemeControls();
  }

  syncThemeControls();

  themeToggle?.addEventListener('click', () => {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  });

  function setMenu(open) {
    if (!menuToggle || !primaryNav) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    primaryNav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  }

  menuToggle?.addEventListener('click', () => {
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1050) setMenu(false);
  });

  const revealItems = [...document.querySelectorAll('[data-reveal]')];
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 65}ms`;
      revealObserver.observe(item);
    });
  }

  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${visible.target.id}`);
      });
    }, { rootMargin: '-20% 0px -62% 0px', threshold: [0.05, 0.25, 0.5] });

    sections.forEach((section) => sectionObserver.observe(section));
  }

  const year = document.getElementById('current-year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
