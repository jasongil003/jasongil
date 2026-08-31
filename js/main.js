/**
 * Master Portfolio Controller
 * Coordinates theme switching (with View Transitions), 3D Card Deck, Modals, GitHub Grid, and Toasts.
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

// ── 3D Spotlight Project Deck ────────────────────────────────────────────────
window.activateCard = function (card) {
    if (card.classList.contains('is-center')) return;
    const deck = card.closest('[data-deck]');
    if (!deck) return;

    const center = deck.querySelector('.deck-card.is-center');
    const isLeft = card.classList.contains('is-left');

    if (center) {
        center.classList.remove('is-center');
        center.classList.add(isLeft ? 'is-left' : 'is-right');
    }

    card.classList.remove('is-left', 'is-right');
    card.classList.add('is-center');
    window.siteSound?.play('toggle');
};

// ── Modals & Quick View ──────────────────────────────────────────────────────
window.openModal = function (name) {
    const modal = document.getElementById('siteModal');
    if (!modal) return;

    const panel = modal.querySelector(`[data-panel="${name}"]`);
    if (!panel) return;

    modal.querySelectorAll('[data-panel]').forEach(p => p.style.display = 'none');
    panel.style.display = 'block';

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
window.showToast = function (msg) {
    let toast = document.getElementById('siteToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'siteToast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2400);
};

// ── One-Click Email Copy ────────────────────────────────────────────────────
window.copyEmail = function (event) {
    if (event) event.stopPropagation();
    const email = 'JasonGil.Career@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
        window.showToast('Copied JasonGil.Career@gmail.com to clipboard!');
        window.siteSound?.play('success');
    }).catch(() => {
        window.showToast('Email: JasonGil.Career@gmail.com');
    });
};

// ── Mobile Navigation Drawer ─────────────────────────────────────────────────
window.openMobileNav = function () {
    const nav = document.getElementById('mobileNav');
    if (!nav) return;
    nav.style.display = 'flex';
    requestAnimationFrame(() => nav.classList.add('is-open'));
    document.documentElement.style.overflow = 'hidden';
    window.siteSound?.play('open');
};

window.closeMobileNav = function () {
    const nav = document.getElementById('mobileNav');
    if (!nav) return;
    nav.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    setTimeout(() => {
        nav.style.display = 'none';
    }, 300);
    window.siteSound?.play('close');
};

// ── Interactive GitHub Contribution Graph ────────────────────────────────────
function buildContributionGraph() {
    const container = document.getElementById('githubGrid');
    if (!container) return;
    container.innerHTML = '';

    const weeks = 42;
    const daysPerWeek = 7;
    const totalCells = weeks * daysPerWeek;

    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.className = 'contrib-cell';

        // Activity generator
        const r = Math.random();
        let lvl = 'lvl-0';
        let count = 0;
        if (r > 0.82) { lvl = 'lvl-4'; count = Math.floor(Math.random() * 8) + 12; }
        else if (r > 0.62) { lvl = 'lvl-3'; count = Math.floor(Math.random() * 5) + 7; }
        else if (r > 0.42) { lvl = 'lvl-2'; count = Math.floor(Math.random() * 4) + 3; }
        else if (r > 0.22) { lvl = 'lvl-1'; count = Math.floor(Math.random() * 2) + 1; }

        if (lvl !== 'lvl-0') {
            cell.classList.add(lvl);
        }

        cell.setAttribute('title', count > 0 ? `${count} commits on active sprint` : 'No commits');
        cell.addEventListener('mouseenter', () => {
            window.siteSound?.play('tick');
        });

        container.appendChild(cell);
    }
}

// ── Tech Stack Filtering ────────────────────────────────────────────────────
window.filterStack = function (category, btn) {
    document.querySelectorAll('.stack-btn').forEach(b => b.classList.remove('is-active'));
    if (btn) btn.classList.add('is-active');

    document.querySelectorAll('.stack-item').forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'inline-flex';
        } else {
            item.style.display = 'none';
        }
    });
    window.siteSound?.play('tap');
};

// ── Global Initializations ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    buildContributionGraph();

    // Attach click sound to interactive buttons and links
    document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('click', () => {
            if (!el.hasAttribute('data-cuelume-silent')) {
                window.siteSound?.play('press');
            }
        });
    });

    // Escape closes any open modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.closeModal();
            window.closeMobileNav();
        }
    });
});
