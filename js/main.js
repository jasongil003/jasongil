/**
 * Master Portfolio Controller
 * Coordinates themes, accessible dialogs, navigation, and small page interactions.
 */

// ── Theme Manager ────────────────────────────────────────────────────────────
(function () {
    const KEY = 'portfolio_theme';
    const root = document.documentElement;
    const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    let animT;

    function getPref() {
        try {
            const v = localStorage.getItem(KEY);
            return (v === 'dark' || v === 'light' || v === 'system') ? v : 'system';
        } catch (e) {
            return 'system';
        }
    }

    function isDark(pref) {
        return pref === 'dark' || (pref === 'system' && !!mq && mq.matches);
    }

    function setClass(pref) {
        root.classList.toggle('dark', isDark(pref));
        document.querySelectorAll('[data-theme-opt]').forEach(el => {
            el.classList.toggle('is-active', el.getAttribute('data-theme-opt') === pref);
        });
    }

    function crossfade(pref) {
        root.classList.add('theme-anim');
        setClass(pref);
        clearTimeout(animT);
        animT = setTimeout(() => {
            root.classList.remove('theme-anim');
        }, 500);
    }

    function reveal(pref, x, y) {
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            clearTimeout(animT);
            root.classList.remove('theme-anim');
            setClass(pref);
            return;
        }
        if (!document.startViewTransition) {
            crossfade(pref);
            return;
        }
        const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
        const vt = document.startViewTransition(() => {
            setClass(pref);
        });
        vt.ready.then(() => {
            root.animate(
                {
                    clipPath: [
                        `circle(0px at ${x}px ${y}px)`,
                        `circle(${r}px at ${x}px ${y}px)`
                    ]
                },
                {
                    duration: 500,
                    easing: 'cubic-bezier(.32,.08,.24,1)',
                    pseudoElement: '::view-transition-new(root)'
                }
            );
        }).catch(() => crossfade(pref));
    }

    window.setTheme = function (pref, ev) {
        try { localStorage.setItem(KEY, pref); } catch (e) {}
        window.siteSound?.play('toggle');
        const x = (ev && ev.clientX) || window.innerWidth / 2;
        const y = (ev && ev.clientY) || window.innerHeight / 2;
        reveal(pref, x, y);
    };

    setClass(getPref());
    if (mq) mq.addEventListener('change', () => {
        if (getPref() === 'system') setClass('system');
    });
})();

// ── Modals & Quick View ──────────────────────────────────────────────────────
window.openModal = function (name) {
    const modal = document.getElementById('siteModal');
    if (!modal) return;

    const panel = modal.querySelector(`[data-panel="${name}"]`);
    if (!panel) return;

    modal.querySelectorAll('[data-panel]').forEach(p => p.style.display = 'none');
    panel.style.display = 'block';
    const title = panel.querySelector('h3');
    modal.setAttribute('aria-label', title?.textContent.trim() || 'Portfolio details');

    modal.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
    window.siteSound?.play('open');
};

window.closeModal = function () {
    const modal = document.getElementById('siteModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    window.siteSound?.play('close');
};

// ── Toast Notification System ────────────────────────────────────────────────
let toastTimer;
window.showToast = function (msg) {
    let toast = document.getElementById('siteToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'siteToast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2400);
};

// ── One-Click Profile Link Copy ──────────────────────────────────────────────
window.copyProfile = async function (event) {
    if (event) event.stopPropagation();
    const githubUrl = 'https://github.com/jasongil003';
    try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(githubUrl);
        window.showToast('Copied GitHub link (github.com/jasongil003)!');
        window.siteSound?.play('success');
    } catch (error) {
        window.showToast('GitHub: github.com/jasongil003');
    }
};

// ── Mobile Navigation Drawer ─────────────────────────────────────────────────
let mobileCloseTimer;
let mobileOpenFrame;
window.openMobileNav = function () {
    const nav = document.getElementById('mobileNav');
    if (!nav) return;
    clearTimeout(mobileCloseTimer);
    cancelAnimationFrame(mobileOpenFrame);
    nav.style.display = 'flex';
    mobileOpenFrame = requestAnimationFrame(() => nav.classList.add('is-open'));
    document.documentElement.style.overflow = 'hidden';
    window.siteSound?.play('open');
};

window.closeMobileNav = function () {
    const nav = document.getElementById('mobileNav');
    if (!nav) return;
    clearTimeout(mobileCloseTimer);
    cancelAnimationFrame(mobileOpenFrame);
    nav.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    mobileCloseTimer = setTimeout(() => {
        nav.style.display = 'none';
    }, 300);
    window.siteSound?.play('close');
};

// ── Shared Dialog Keyboard and Focus Management ──────────────────────────────
function initializeDialogs() {
    const specs = [
        ['siteModal', 'openModal', 'closeModal', 0],
        ['mobileNav', 'openMobileNav', 'closeMobileNav', 0],
        ['askOverlay', 'openAsk', 'closeAsk', 320],
        ['typingOverlay', 'openTyping', 'closeTyping', 320],
        ['chatOverlay', 'openChat', 'closeChat', 320]
    ];
    const dialogs = [];
    const backgroundState = new Map();
    const desktop = window.matchMedia('(min-width: 1024px)');
    const focusSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    let active = null;
    let previousOverflow = '';

    function focusable(dialog) {
        return [...dialog.querySelectorAll(focusSelector)].filter(el =>
            el.tabIndex >= 0 && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden'
        );
    }

    function syncAccessibility() {
        backgroundState.forEach((inert, el) => { el.inert = inert; });
        backgroundState.clear();
        if (active) {
            [...document.body.children].forEach(el => {
                if (el === active.element || el.contains(active.element) || el.id === 'siteToast') return;
                backgroundState.set(el, el.inert);
                el.inert = true;
            });
        }
        dialogs.forEach(entry => {
            entry.element.inert = entry !== active;
            entry.element.setAttribute('aria-hidden', String(entry !== active));
        });
        document.querySelectorAll('[aria-controls="mobileNav"], button[onclick="openMobileNav()"]')
            .forEach(button => button.setAttribute('aria-expanded', String(active?.element.id === 'mobileNav')));
        document.documentElement.style.overflow = active ? 'hidden' : previousOverflow;
    }

    specs.forEach(([id, openName, closeName, closingDelay]) => {
        const element = document.getElementById(id);
        const originalOpen = window[openName];
        const originalClose = window[closeName];
        if (!element || !originalOpen || !originalClose) return;
        const entry = { element, opener: null, pending: null, closedUntil: 0, closeName };
        dialogs.push(entry);
        element.tabIndex = -1;

        window[openName] = function (...args) {
            if (active === entry) return;
            if (id === 'mobileNav' && desktop.matches) return;
            if (id === 'siteModal' && ![...element.querySelectorAll('[data-panel]')].some(panel => panel.dataset.panel === args[0])) return;
            const origin = active && active.element.contains(document.activeElement) ? active.opener : document.activeElement;
            dialogs.forEach(other => {
                if (other !== entry && (other === active || other.pending)) window[other.closeName]();
            });
            clearTimeout(entry.pending);
            entry.opener = origin;

            const show = () => {
                entry.pending = null;
                previousOverflow = document.documentElement.style.overflow;
                originalOpen(...args);
                active = entry;
                syncAccessibility();
                if (!element.contains(document.activeElement)) {
                    const first = id === 'typingOverlay' ? element : focusable(element)[0] || element;
                    first.focus({ preventScroll: true });
                }
            };
            const delay = Math.max(0, entry.closedUntil - Date.now());
            if (delay) entry.pending = setTimeout(show, delay);
            else show();
        };

        window[closeName] = function () {
            clearTimeout(entry.pending);
            entry.pending = null;
            if (active !== entry) return;
            originalClose();
            entry.closedUntil = Date.now() + closingDelay;
            active = null;
            syncAccessibility();
            requestAnimationFrame(() => {
                if (active !== entry) element.classList.remove('is-open');
            });
            if (entry.opener?.isConnected && !entry.opener.closest('[inert]') && entry.opener.getClientRects().length) {
                entry.opener.focus({ preventScroll: true });
            }
        };
    });

    document.addEventListener('keydown', event => {
        if (!active) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopImmediatePropagation();
            window[active.closeName]();
        } else if (event.key === 'Tab') {
            event.preventDefault();
            event.stopImmediatePropagation();
            const targets = focusable(active.element);
            const index = targets.indexOf(document.activeElement);
            const next = event.shiftKey ? (index <= 0 ? targets.length - 1 : index - 1) : (index + 1) % targets.length;
            (targets[next] || active.element).focus({ preventScroll: true });
        } else if (active.element.id === 'typingOverlay' && event.key === ' ' && event.target.closest('button')) {
            event.stopImmediatePropagation();
        }
    }, true);

    document.addEventListener('focusin', event => {
        if (active && !active.element.contains(event.target)) {
            (focusable(active.element)[0] || active.element).focus({ preventScroll: true });
        }
    });
    desktop.addEventListener('change', event => {
        if (event.matches) window.closeMobileNav();
    });
    syncAccessibility();
}

// ── Global Initializations ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initializeDialogs();

    document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('click', () => {
            if (!el.hasAttribute('data-cuelume-silent')) window.siteSound?.play('press');
        });
    });
});
// Load the optional game only when its Lab panel is opened.
const playground = document.querySelector('.playground-details');
playground?.addEventListener('toggle', function () {
    if (!this.open || this.dataset.loaded) return;
    this.dataset.loaded = 'true';
    const script = document.createElement('script');
    script.src = 'js/game.js?v=orbit-impact-2';
    script.onerror = () => { delete this.dataset.loaded; window.showToast?.('Game could not load. Close and reopen the panel to retry.'); };
    document.body.appendChild(script);
});
