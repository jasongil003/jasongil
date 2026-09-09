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

    function initializeContentOrder() {
        const contact = document.getElementById('contact');
        const lab = document.getElementById('lab');
        if (contact && lab && contact.parentElement === lab.parentElement) {
            lab.parentElement.insertBefore(contact, lab);
        }

        document.querySelectorAll('.primary-nav, .drawer-links').forEach(nav => {
            const contactLink = nav.querySelector('a[href="#contact"]');
            const labLink = nav.querySelector('a[href="#lab"]');
            if (contactLink && labLink) nav.insertBefore(contactLink, labLink);
        });

        const contactKicker = contact?.querySelector('.section-kicker');
        const labKicker = lab?.querySelector('.section-kicker');
        if (contactKicker) contactKicker.textContent = '05 / CONTACT';
        if (labKicker) labKicker.textContent = '06 / LAB';
    }

    function initializeContactActions() {
        const actions = document.querySelector('#contact .hero-actions');
        if (!actions) return;

        const github = actions.querySelector('a[href*="github.com"]');
        if (github) {
            github.target = '_blank';
            github.rel = 'noopener';
        }

        const linkedIn = actions.querySelector('a[href*="linkedin.com"]');
        if (linkedIn) {
            linkedIn.href = 'https://ph.linkedin.com/in/jason-gil-028249165';
            linkedIn.target = '_blank';
            linkedIn.rel = 'noopener';
            linkedIn.textContent = 'LinkedIn ↗';
            linkedIn.setAttribute('aria-label', 'Jason Gil on LinkedIn, opens in a new tab');
        }

        if (!actions.querySelector('.resume-placeholder')) {
            const resume = document.createElement('button');
            resume.type = 'button';
            resume.className = 'button-secondary resume-placeholder';
            resume.disabled = true;
            resume.setAttribute('aria-disabled', 'true');
            resume.title = 'Resume file has not been published yet';
            resume.textContent = 'Resume · not published yet';
            actions.appendChild(resume);
        }
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

    function initializeProjectMedia() {
        document.querySelectorAll('.deck-card').forEach(card => {
            if (card.querySelector('.project-media')) return;
            const title = card.querySelector('h3')?.textContent.trim() || 'Project';
            const media = document.createElement('div');
            const placeholder = document.createElement('div');
            const label = document.createElement('strong');
            const note = document.createElement('span');

            media.className = 'project-media';
            media.setAttribute('role', 'img');
            media.setAttribute('aria-label', `${title} screenshot placeholder`);
            placeholder.className = 'project-media-placeholder';
            label.textContent = title;
            note.textContent = 'Screenshot space reserved · add real project media when available';
            placeholder.append(label, note);
            media.appendChild(placeholder);

            const heading = card.querySelector('h3');
            if (heading) heading.insertAdjacentElement('afterend', media);
        });
    }

    function initializeSpecularTracking() {
        if (!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches) return;
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

        document.querySelectorAll('.hero-note, .deck-card').forEach(surface => {
            let frame = 0;
            surface.addEventListener('pointermove', event => {
                cancelAnimationFrame(frame);
                frame = requestAnimationFrame(() => {
                    const rect = surface.getBoundingClientRect();
                    const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
                    const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
                    surface.style.setProperty('--glass-specular-x', `${x.toFixed(1)}%`);
                    surface.style.setProperty('--glass-specular-y', `${y.toFixed(1)}%`);
                });
            }, { passive: true });
            surface.addEventListener('pointerleave', () => {
                cancelAnimationFrame(frame);
                surface.style.removeProperty('--glass-specular-x');
                surface.style.removeProperty('--glass-specular-y');
            }, { passive: true });
        });
    }

    function initializeScrollEdge() {
        let scheduled = false;
        const sync = () => {
            scheduled = false;
            root.classList.toggle('is-scrolled', window.scrollY > 12);
        };
        const schedule = () => {
            if (scheduled) return;
            scheduled = true;
            requestAnimationFrame(sync);
        };
        sync();
        window.addEventListener('scroll', schedule, { passive: true });
    }

    function initialize() {
        initializeContentOrder();
        initializeAppearanceControls();
        initializeContactActions();
        initializeNavigationSurfaces();
        initializeProjectMedia();
        initializeSectionNavigation();
        initializeSpecularTracking();
        initializeScrollEdge();
        root.classList.add('liquid-glass-ready');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize, { once: true });
    } else {
        initialize();
    }
})();
