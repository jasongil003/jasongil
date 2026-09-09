(function () {
    'use strict';

    const root = document.documentElement;
    const GLASS_KEY = 'portfolio_glass_intensity';
    const VALID_GLASS = new Set(['clear', 'balanced', 'tinted']);

    function getGlassPreference() {
        try {
            const saved = localStorage.getItem(GLASS_KEY);
            return VALID_GLASS.has(saved) ? saved : 'balanced';
        } catch (error) {
            return 'balanced';
        }
    }

    function syncGlassButtons(pref) {
        document.querySelectorAll('[data-glass-opt]').forEach(button => {
            const active = button.dataset.glassOpt === pref;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', String(active));
        });
    }

    window.setGlassIntensity = function (pref) {
        if (!VALID_GLASS.has(pref)) return;
        root.dataset.glass = pref;
        try { localStorage.setItem(GLASS_KEY, pref); } catch (error) {}
        syncGlassButtons(pref);
        window.siteSound?.play('toggle');
    };

    function buildGlassControl() {
        const group = document.createElement('div');
        group.className = 'glass-intensity-control';
        group.setAttribute('role', 'group');
        group.setAttribute('aria-label', 'Liquid Glass intensity');
        ['clear', 'balanced', 'tinted'].forEach(pref => {
            const button = document.createElement('button');
            button.type = 'button';
            button.dataset.glassOpt = pref;
            button.textContent = pref[0].toUpperCase() + pref.slice(1);
            button.setAttribute('aria-label', `${button.textContent} Liquid Glass intensity`);
            button.addEventListener('click', () => window.setGlassIntensity(pref));
            group.appendChild(button);
        });
        return group;
    }

    function initializeAppearanceControls() {
        const pref = getGlassPreference();
        root.dataset.glass = pref;

        document.querySelectorAll('.theme-switch').forEach(themeSwitch => {
            const parent = themeSwitch.parentElement;
            if (!parent || parent.querySelector('.glass-intensity-control')) return;
            themeSwitch.insertAdjacentElement('afterend', buildGlassControl());
        });
        syncGlassButtons(pref);
    }

    function setActiveNavigation(id) {
        document.querySelectorAll('.primary-nav a[href^="#"], .drawer-links a[href^="#"]').forEach(link => {
            const active = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('is-active', active);
            if (active) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    }

    function initializeSectionNavigation() {
        const ids = ['projects', 'experience', 'stack', 'about', 'contact', 'lab'];
        const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
        if (!sections.length) return;

        if (!('IntersectionObserver' in window)) {
            setActiveNavigation(sections[0].id);
            return;
        }

        const visibility = new Map();
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => visibility.set(entry.target.id, entry.intersectionRatio));
            const best = sections
                .map(section => ({ id: section.id, ratio: visibility.get(section.id) || 0 }))
                .sort((a, b) => b.ratio - a.ratio)[0];
            if (best?.ratio > 0) setActiveNavigation(best.id);
        }, {
            rootMargin: '-18% 0px -58% 0px',
            threshold: [0, .12, .3, .55, .8]
        });

        sections.forEach(section => observer.observe(section));
    }

    function initializeNavigationSurfaces() {
        document.querySelector('.sidebar-nav')?.setAttribute('data-glass-surface', 'strong');
        document.querySelector('.mobile-header')?.setAttribute('data-glass-surface', 'strong');
        document.querySelector('.mobile-nav-drawer')?.setAttribute('data-glass-surface', 'strong');
    }

    function initialize() {
        initializeAppearanceControls();
        initializeNavigationSurfaces();
        initializeSectionNavigation();
        root.classList.add('liquid-glass-ready');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize, { once: true });
    } else {
        initialize();
    }
})();
