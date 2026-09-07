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
            // The legacy overlays clean up after their closing transition. Let that
            // cleanup finish before reopening so its timer cannot hide a new dialog.
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
            // Opening animations in legacy overlays run in the next frame.
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
            // Keep Space available to activate dialog controls during the typing game.
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

// ── Private AI Project Presentation ──────────────────────────────────────────
function enhancePrivateAiProject() {
    const projectCard = [...document.querySelectorAll('.deck-card')].find(card =>
        card.querySelector('h3')?.textContent.includes('ANTlabs Local AI Knowledge Base')
    );

    if (projectCard) {
        const actions = projectCard.querySelector('.project-actions');
        const githubProfileLink = actions?.querySelector('a[href="https://github.com/jasongil003"]');
        githubProfileLink?.remove();

        const detailsButton = actions?.querySelector('button');
        if (detailsButton) {
            detailsButton.textContent = 'More details';
            detailsButton.setAttribute('onclick', "openModal('rag')");
            detailsButton.setAttribute('aria-label', 'View more details about the private ANTlabs Local AI Knowledge Base');
        }

        const summary = projectCard.querySelector('.mt-3.text-xs.leading-relaxed.text-gray-600');
        if (summary) {
            summary.textContent = 'Private RAG knowledge system on WSL2 Ubuntu, Docker, local Qwen/Gemma LLMs, and Tailscale for secure remote access. A resumable Bash pipeline indexes thousands of technical documents for semantic RCA retrieval. The source repository remains private to protect internal knowledge and security-sensitive implementation details.';
        }
    }

    const ragPanel = document.querySelector('[data-panel="rag"]');
    if (!ragPanel || ragPanel.querySelector('[data-private-ai-note]')) return;

    const securityNote = document.createElement('div');
    securityNote.setAttribute('data-private-ai-note', '');
    securityNote.className = 'mt-4 p-3 rounded-lg border border-gray-200 bg-gray-50';
    securityNote.innerHTML = `
        <p class="font-mono text-[10px] uppercase tracking-wider text-gray-400">Security &amp; access</p>
        <p class="mt-1 text-xs text-gray-600 leading-relaxed">
            This project is intentionally kept in a private repository because it works with internal technical knowledge and includes security-sensitive deployment details. The portfolio shares the architecture and outcomes without exposing protected source code or company data.
        </p>
    `;

    const projectAction = ragPanel.querySelector('.modal-action');
    if (projectAction) projectAction.insertAdjacentElement('beforebegin', securityNote);
    else ragPanel.appendChild(securityNote);

    const linkedInAction = document.createElement('a');
    linkedInAction.className = 'modal-action';
    linkedInAction.href = 'https://www.linkedin.com/feed/update/urn:li:activity:7498185839668154368/';
    linkedInAction.target = '_blank';
    linkedInAction.rel = 'noopener';
    linkedInAction.innerHTML = 'Read the project update on LinkedIn <span aria-hidden="true">↗</span>';
    ragPanel.appendChild(linkedInAction);
}

// ── Global Initializations ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    enhancePrivateAiProject();
    initializeDialogs();
    buildContributionGraph();

    // Attach click sound to interactive buttons and links
    document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('click', () => {
            if (!el.hasAttribute('data-cuelume-silent')) {
                window.siteSound?.play('press');
            }
        });
    });

});