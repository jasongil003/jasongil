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
            detailsButton.setAttribute('aria-label', 'View the private AI troubleshooting and engineering knowledge platform case study');
        }

        const summary = projectCard.querySelector('.mt-3.text-xs.leading-relaxed.text-gray-600');
        if (summary) {
            summary.textContent = 'Private AI troubleshooting and engineering knowledge platform using local RAG, vector search, and evidence-aware retrieval. Built to turn internal documentation, case history, RCA findings, and troubleshooting experience into reusable engineering knowledge without exposing protected source code or company data.';
        }
    }

    const ragPanel = document.querySelector('[data-panel="rag"]');
    if (!ragPanel || ragPanel.dataset.caseStudyEnhanced === 'true') return;
    ragPanel.dataset.caseStudyEnhanced = 'true';

    // Keep this enhancement isolated to the RAG panel so the other portfolio modals
    // and their existing styling/behavior remain untouched.
    ragPanel.style.maxHeight = '72vh';
    ragPanel.style.overflowY = 'auto';
    ragPanel.style.paddingRight = '0.35rem';

    ragPanel.innerHTML = `
        <p class="modal-kicker">Private applied AI · Engineering case study</p>
        <h3 class="modal-title">Private AI Troubleshooting &amp; Engineering Knowledge Platform</h3>
        <p class="modal-lead">
            Turning years of technical documentation, support cases, RCA findings, and troubleshooting experience into reusable engineering knowledge — while keeping sensitive information inside a private environment.
        </p>

        <div class="modal-detail-grid">
            <div class="modal-detail"><span>Knowledge corpus</span><strong>2,700+ internal documents</strong></div>
            <div class="modal-detail"><span>Deployment</span><strong>Local / private infrastructure</strong></div>
            <div class="modal-detail"><span>Inference</span><strong>Ollama · Qwen · Gemma</strong></div>
            <div class="modal-detail"><span>Retrieval</span><strong>MiniLM · Vector search · RAG</strong></div>
        </div>

        <div class="mt-5">
            <p class="modal-kicker">01 — The problem</p>
            <p class="mt-2 text-xs text-gray-600 leading-relaxed">
                The challenge was not a lack of technical knowledge. It was the time required to find and reuse it. Troubleshooting knowledge was scattered across documentation, historical cases, commands, logs, runbooks, known-good baselines, failure signatures, and lessons learned.
            </p>
            <div class="mt-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                <p class="text-sm text-ink leading-relaxed"><strong>“We weren't lacking technical knowledge. We were lacking a fast way to find and reuse it.”</strong></p>
            </div>
        </div>

        <div class="mt-5">
            <p class="modal-kicker">02 — Design questions</p>
            <ul class="modal-points">
                <li>What information do engineers need during troubleshooting?</li>
                <li>How can thousands of documents be searched quickly?</li>
                <li>How can previous investigations become reusable engineering knowledge?</li>
                <li>How can internal information remain private?</li>
                <li>How can the system avoid confidently inventing technical answers?</li>
            </ul>
        </div>

        <div class="mt-5">
            <p class="modal-kicker">03 — High-level architecture</p>
            <div class="mt-2 p-3 rounded-lg border border-gray-200 bg-gray-50 font-mono text-[11px] leading-relaxed text-gray-600" style="overflow-x:auto; white-space:pre;">Technical Engineer
       ↓
   Open WebUI
       ↓ Ask / Search
RAG Retrieval + Vector Search
       ↓
┌──────────────────────┬──────────────────────┐
│ Technical Knowledge  │ Engineering Memory   │
│ Docs · Runbooks      │ Cases · RCA          │
│ References · Baseline│ Lessons · Failures   │
└──────────┬───────────┴──────────┬───────────┘
           └──────────┬───────────┘
                      ↓
              Local Models
            Qwen / Gemma / Ollama
                      ↓
              Grounded Answer
         Sources · Evidence · Steps</div>
            <p class="mt-3 text-xs text-gray-600 leading-relaxed">
                Underneath the workflow is a locally hosted stack: Windows → WSL Ubuntu → Docker → Ollama → Open WebUI → Vector Database → Private Knowledge Base.
            </p>
        </div>

        <div class="mt-5">
            <p class="modal-kicker">04 — Retrieval &amp; engineering memory</p>
            <p class="mt-2 text-xs text-gray-600 leading-relaxed">
                The retrieval pipeline started with more than 2,700 internal Markdown documents, including runbooks, case files, troubleshooting notes, known-good baselines, failure signatures, and technical references. Local Qwen and Gemma models were tested through Ollama on modest hardware.
            </p>
            <div class="mt-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                <p class="text-xs text-gray-600 leading-relaxed"><strong class="text-ink">Key lesson:</strong> retrieval often matters more than model size. A smaller model grounded in the correct documentation can be more useful than a larger model guessing about systems outside its training data.</p>
            </div>
        </div>

        <div class="mt-5">
            <p class="modal-kicker">05 — Knowledge operations</p>
            <p class="mt-2 text-xs text-gray-600 leading-relaxed">
                Every investigation should have the potential to become reusable knowledge. Engineering memory is structured around a repeatable lifecycle:
            </p>
            <div class="mt-3 p-3 rounded-lg border border-gray-200 bg-gray-50 font-mono text-xs text-ink" style="overflow-x:auto; white-space:nowrap;">
                Symptom → Evidence → Finding → Root Cause → Resolution → Validation
            </div>
            <ul class="modal-points">
                <li>Validated engineering findings and investigation records.</li>
                <li>Failure signatures, case notes, and technical references.</li>
                <li>Compatibility information, known baselines, and lessons learned.</li>
            </ul>
        </div>

        <div class="mt-5">
            <p class="modal-kicker">06 — Evidence &amp; trust model</p>
            <p class="mt-2 text-xs text-gray-600 leading-relaxed"><strong class="text-ink">Never store a guess as a fact.</strong> The system prioritizes verified evidence and trusted documentation before relying on general technical knowledge or the language model itself.</p>
            <div class="modal-detail-grid mt-3">
                <div class="modal-detail"><span>VERIFIED</span><strong>Supported by evidence or trusted documentation</strong></div>
                <div class="modal-detail"><span>INFERENCE</span><strong>Derived from evidence but not fully confirmed</strong></div>
                <div class="modal-detail"><span>GENERAL KNOWLEDGE</span><strong>Relevant, but not verified against the environment</strong></div>
                <div class="modal-detail"><span>NEGATIVE TEST</span><strong>“I couldn't verify this from the available technical knowledge.”</strong></div>
            </div>
            <p class="mt-3 text-xs text-gray-600 leading-relaxed"><strong class="text-ink">Evidence builds trust.</strong> Engineers should be able to see where an answer came from and distinguish validated findings from unverified reasoning.</p>
        </div>

        <div class="mt-5">
            <p class="modal-kicker">07 — Resumable ingestion pipeline</p>
            <p class="mt-2 text-xs text-gray-600 leading-relaxed">
                Thousands of documents introduce processing failures, duplicates, formatting differences, and interrupted jobs. The importer is designed to be resumable and observable rather than restarting from zero after every interruption.
            </p>
            <ul class="modal-points">
                <li>Tracks successfully processed and failed documents.</li>
                <li>Records failure reasons and document paths.</li>
                <li>Uses content hashes to identify previously processed files.</li>
                <li>Supports recovery from interrupted ingestion jobs.</li>
            </ul>
        </div>

        <div class="mt-5">
            <p class="modal-kicker">08 — Target workflow</p>
            <div class="mt-2 p-3 rounded-lg border border-gray-200 bg-gray-50 font-mono text-[11px] leading-relaxed text-gray-600" style="overflow-x:auto; white-space:pre;">Engineer asks a question
        ↓
Search private knowledge
        ↓
Retrieve relevant cases + documentation
        ↓
Compare available evidence
        ↓
Reason over the evidence
        ↓
Return grounded answer with sources
        ↓
Document the investigation
        ↓
Preserve validated lessons
        ↓
Make the next investigation faster</div>
        </div>

        <div class="mt-5">
            <p class="modal-kicker">09 — What real testing changed</p>
            <p class="mt-2 text-xs text-gray-600 leading-relaxed">
                The project is still evolving. Some models did not perform well, documents failed during ingestion, hardware limitations forced design changes, and retrieval approaches had to be redesigned after real testing. Those failures became part of the engineering process rather than being hidden from it.
            </p>
        </div>

        <div class="mt-5">
            <p class="modal-kicker">10 — Three lessons</p>
            <div class="space-y-3 mt-2">
                <div class="p-3 rounded-lg border border-gray-200 bg-gray-50"><strong class="text-ink text-xs">1. Retrieval beats model size.</strong><p class="mt-1 text-xs text-gray-600 leading-relaxed">A smaller local model with the right context can outperform a larger model working without the right information.</p></div>
                <div class="p-3 rounded-lg border border-gray-200 bg-gray-50"><strong class="text-ink text-xs">2. Private AI is practical.</strong><p class="mt-1 text-xs text-gray-600 leading-relaxed">Useful AI-assisted search and reasoning can be delivered without sending internal documentation to external services.</p></div>
                <div class="p-3 rounded-lg border border-gray-200 bg-gray-50"><strong class="text-ink text-xs">3. Evidence builds trust.</strong><p class="mt-1 text-xs text-gray-600 leading-relaxed">An AI answer should not carry the same weight as a validated engineering finding when its sources cannot be verified.</p></div>
            </div>
        </div>

        <div class="mt-5">
            <p class="modal-kicker">11 — Next</p>
            <ul class="modal-points">
                <li>Incremental knowledge synchronization.</li>
                <li>Stronger failure-signature matching.</li>
                <li>Better document classification and retrieval accuracy.</li>
                <li>Automated knowledge quality checks.</li>
            </ul>
        </div>

        <div class="mt-5 p-3 rounded-lg border border-gray-200 bg-gray-50" data-private-ai-note>
            <p class="font-mono text-[10px] uppercase tracking-wider text-gray-400">Security &amp; access</p>
            <p class="mt-1 text-xs text-gray-600 leading-relaxed">
                The source repository is intentionally private because this project works with internal technical knowledge and includes security-sensitive deployment details. This case study describes the architecture, engineering approach, and lessons without exposing protected source code, credentials, customer data, or company-confidential content.
            </p>
        </div>

        <div class="mt-5 p-3 rounded-lg border border-gray-200">
            <p class="text-sm text-ink leading-relaxed"><strong>AI is only one component. The real project is turning troubleshooting experience into reusable engineering knowledge.</strong></p>
        </div>

        <a class="modal-action" href="https://www.linkedin.com/feed/update/urn:li:activity:7498185839668154368/" target="_blank" rel="noopener">Read the full project write-up on LinkedIn <span aria-hidden="true">↗</span></a>
    `;
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