(function () {
    'use strict';

    const root = document.documentElement;

    function ensureV2Styles() {
        if (document.querySelector('link[data-portfolio-v2]')) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/portfolio-v2.css?v=20260910';
        link.dataset.portfolioV2 = 'true';
        document.head.appendChild(link);
    }

    function updateMetadata() {
        const description = 'Jason Gil is a Technical Lead focused on infrastructure, networking, complex technical escalations, automation, and applied AI systems.';
        const title = 'Jason Gil — Technical Lead | Infrastructure, Networking & Applied AI';
        document.title = title;
        document.querySelector('meta[name="description"]')?.setAttribute('content', description);
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);
    }

    function updateHero() {
        const eyebrow = document.querySelector('.hero-main .eyebrow');
        const role = document.querySelector('.hero-main .hero-role');
        const description = document.querySelector('.hero-main .hero-description');
        const location = document.querySelector('.hero-main .hero-location');
        const secondary = document.querySelector('.hero-main .button-secondary');
        const portraitLabel = document.querySelector('.hero-note .note-top span:first-child');

        if (eyebrow) eyebrow.textContent = 'Technical Lead · Infrastructure · Applied AI';
        if (role) role.textContent = 'I solve difficult systems problems and build tools that make technical teams stronger.';
        if (description) description.textContent = 'My work spans Linux infrastructure, enterprise networking, technical escalation leadership, private AI knowledge systems, and practical automation built from real operational problems.';
        if (location) location.innerHTML = 'Makati City, Philippines <span class="location-divider">/</span> Supporting teams globally';
        if (secondary) {
            secondary.textContent = 'Let\'s talk ↗';
            secondary.setAttribute('aria-label', 'Contact Jason Gil');
        }
        if (portraitLabel) portraitLabel.textContent = 'JASON GIL / TECHNICAL LEAD';
    }

    function updateCapabilityStrip() {
        const boxes = Array.from(document.querySelectorAll('.stats-grid .stat-box'));
        const items = [
            ['Linux + Networks', 'RCA · HA/DRBD · Routing'],
            ['Global Escalations', 'APAC · EMEA · North America'],
            ['Private AI', 'RAG · Ollama · Vector Search'],
            ['Automation', 'Bash · APIs · OCR Workflows']
        ];

        boxes.forEach((box, index) => {
            const item = items[index];
            if (!item) return;
            box.removeAttribute('onclick');
            box.setAttribute('aria-disabled', 'true');
            box.tabIndex = -1;
            const headline = box.querySelector('.font-pixel');
            const detail = box.querySelector('.font-mono:last-child');
            if (headline) headline.textContent = item[0];
            if (detail) detail.textContent = item[1];
        });
    }

    function createSupportOSVisual() {
        const visual = document.createElement('div');
        visual.className = 'supportos-visual';
        visual.setAttribute('role', 'img');
        visual.setAttribute('aria-label', 'Conceptual product map of SupportOS capabilities: cases, knowledge, SSH, AI assistance, and vulnerability intelligence');
        visual.innerHTML = `
            <div class="supportos-windowbar"><i></i><i></i><i></i><span>SupportOS · Operations Workspace</span></div>
            <div class="supportos-app">
                <div class="supportos-rail" aria-hidden="true"><span>OS</span><span>KB</span><span>SSH</span><span>CVE</span><span>AI</span></div>
                <div class="supportos-canvas">
                    <div class="supportos-module"><b>Case workspace</b><small>Investigation context, notes, evidence and ownership in one place.</small><span class="supportos-status">Active development</span></div>
                    <div class="supportos-module"><b>Knowledge + RAG</b><small>Scoped retrieval across technical documentation and private knowledge.</small></div>
                    <div class="supportos-module"><b>SSH workstation</b><small>Remote operations remain usable independently of AI availability.</small></div>
                    <div class="supportos-module"><b>Vulnerability intelligence</b><small>CVE awareness alongside operational support workflows.</small></div>
                    <div class="supportos-module is-wide"><b>AI assistance without replacing engineering judgment</b><small>Architecture keeps remote operations, access boundaries, knowledge retrieval and model providers as explicit capabilities.</small></div>
                </div>
            </div>`;
        return visual;
    }

    function addProjectSignal(card, labels) {
        if (!card || card.querySelector('.project-signal')) return;
        const signal = document.createElement('div');
        signal.className = 'project-signal';
        labels.forEach(label => {
            const item = document.createElement('span');
            item.textContent = label;
            signal.appendChild(item);
        });
        const problem = card.querySelector('.project-problem');
        if (problem) problem.insertAdjacentElement('afterend', signal);
    }

    function updateProjects() {
        const section = document.getElementById('projects');
        if (!section) return;
        const title = section.querySelector('.section-title');
        const intro = section.querySelector('.section-intro');
        if (title) title.textContent = 'Work built from real operational problems.';
        if (intro) intro.textContent = 'A few projects that show how I think about support engineering, private knowledge, automation, and product design.';

        const cards = Array.from(section.querySelectorAll('.deck-card'));
        const support = cards.find(card => /SupportOS/i.test(card.querySelector('h3')?.textContent || ''));
        const privateAI = cards.find(card => /Private AI/i.test(card.querySelector('h3')?.textContent || ''));
        const renamer = cards.find(card => /Smart Document Renamer/i.test(card.querySelector('h3')?.textContent || ''));

        if (support && !support.classList.contains('project-featured')) {
            support.classList.add('project-featured');
            const media = support.querySelector('.project-media');
            if (media) media.remove();
            const copy = document.createElement('div');
            copy.className = 'project-copy';
            while (support.firstChild) copy.appendChild(support.firstChild);
            support.append(copy, createSupportOSVisual());
            const problem = copy.querySelector('.project-problem');
            if (problem) problem.textContent = 'Support engineers lose time and context switching between cases, vendor documentation, internal knowledge, terminals, vulnerability feeds, and AI tools.';
            const facts = Array.from(copy.querySelectorAll('.project-facts dd'));
            if (facts[0]) facts[0].textContent = 'A unified technical support workspace combining cases, knowledge retrieval, AI assistance, WebSocket SSH, workstation-style tools, and vulnerability intelligence.';
            if (facts[1]) facts[1].textContent = 'Working MVP foundation with active stabilization, testing, and feature development.';
        }

        if (privateAI) {
            addProjectSignal(privateAI, ['Local inference', 'Semantic retrieval', 'Private documents']);
        }
        if (renamer) {
            addProjectSignal(renamer, ['OCR extraction', 'Human validation', 'Batch export']);
        }
    }

    function createEngineeringProof() {
        if (document.querySelector('.engineering-proof')) return;
        const projects = document.getElementById('projects');
        if (!projects) return;

        const section = document.createElement('section');
        section.className = 'engineering-proof';
        section.id = 'engineering';
        section.innerHTML = `
            <div class="section-header">
                <div>
                    <p class="section-kicker">02 / ENGINEERING</p>
                    <h2 class="section-title">The work behind the titles.</h2>
                    <p class="section-intro">The parts of engineering I spend time on when systems are failing, teams need clarity, or repetitive work should become a tool.</p>
                </div>
            </div>
            <div class="engineering-proof-grid">
                <article><span>01 / RCA</span><h3>Complex technical escalations</h3><p>Packet captures, service logs, Bash diagnostics, configuration review, evidence gathering, and root-cause analysis across Linux and network systems.</p></article>
                <article><span>02 / RESILIENCE</span><h3>High availability and recovery</h3><p>DRBD replication checks, controlled failover, patch validation, service continuity checks, and disaster-recovery readiness.</p></article>
                <article><span>03 / NETWORKS</span><h3>Enterprise networking</h3><p>DNS, DHCP, VLANs, VPN, routing, authentication, PMS integrations, port forwarding, and Multi-WAN troubleshooting.</p></article>
                <article><span>04 / APPLIED AI</span><h3>Private knowledge systems</h3><p>Local inference, document ingestion, embeddings, vector search, RAG workflows, and automation that keeps operational knowledge usable.</p></article>
            </div>`;
        projects.insertAdjacentElement('afterend', section);
    }

    function updateExperience() {
        const section = document.getElementById('experience');
        if (!section) return;
        const kicker = section.querySelector('.section-kicker');
        const title = section.querySelector('.section-title');
        const intro = section.querySelector('.section-intro');
        if (kicker) kicker.textContent = '03 / EXPERIENCE';
        if (title) title.textContent = 'From resolving incidents to leading the investigation.';
        if (intro) intro.textContent = 'My progression has moved from frontline support into systems engineering, subject-matter ownership, escalation leadership, and building better support workflows.';

        if (!section.querySelector('.career-story')) {
            const story = document.createElement('div');
            story.className = 'career-story';
            story.innerHTML = `
                <div><h3>A career built by going deeper into the problem.</h3></div>
                <div>
                    <p>Each role added a different layer: first owning incidents, then administering systems, then becoming a technical escalation point, and now leading complex investigations while improving how engineering knowledge is shared and reused.</p>
                    <div class="career-path"><span>Support</span><span>System Engineer</span><span>SME</span><span>Technical Lead</span></div>
                </div>`;
            section.querySelector('.section-header')?.insertAdjacentElement('afterend', story);
        }
    }

    function updateRemainingSections() {
        const stack = document.getElementById('stack');
        const about = document.getElementById('about');
        const certifications = document.getElementById('certifications');
        const contact = document.getElementById('contact');
        const lab = document.getElementById('lab');

        if (stack) {
            stack.querySelector('.section-kicker').textContent = '04 / EXPERTISE';
            stack.querySelector('.section-title').textContent = 'A focused technical toolkit.';
            stack.querySelector('.section-intro').textContent = 'I care more about using the right tool for the investigation than collecting a long list of badges.';
        }

        if (about) {
            about.querySelector('.section-kicker').textContent = '05 / APPROACH';
            about.querySelector('.section-title').textContent = 'Evidence first. Practical by design.';
        }

        if (certifications) {
            const ccnaTitle = Array.from(certifications.querySelectorAll('h3')).find(el => /Cisco CCNA/i.test(el.textContent));
            if (ccnaTitle) ccnaTitle.textContent = 'Cisco CCNA Routing & Switching Coursework';
        }

        if (contact) {
            contact.querySelector('.section-kicker').textContent = '06 / CONTACT';
            contact.querySelector('.section-title').textContent = 'Have a difficult technical problem?';
            contact.querySelector('.section-intro').textContent = 'Infrastructure, troubleshooting, support engineering, automation, or applied AI — let’s talk.';
            const linkedIn = contact.querySelector('a[href*="linkedin.com"]');
            if (linkedIn) {
                linkedIn.href = 'https://ph.linkedin.com/in/jason-gil-028249165';
                linkedIn.target = '_blank';
                linkedIn.rel = 'noopener';
                linkedIn.textContent = 'LinkedIn ↗';
            }
            const github = contact.querySelector('a[href*="github.com"]');
            if (github) {
                github.target = '_blank';
                github.rel = 'noopener';
            }
        }

        if (lab) {
            lab.querySelector('.section-kicker').textContent = '07 / LAB';
            lab.querySelector('.section-title').textContent = 'Experiments, prototypes, and things I build for fun.';
            lab.querySelector('.section-intro').textContent = 'The less serious corner of the portfolio — interactive demos, experiments, and small tools.';
        }
    }

    function reorderSections() {
        const projects = document.getElementById('projects');
        const engineering = document.getElementById('engineering');
        const experience = document.getElementById('experience');
        const stack = document.getElementById('stack');
        const about = document.getElementById('about');
        const certifications = document.getElementById('certifications');
        const contact = document.getElementById('contact');
        const lab = document.getElementById('lab');
        const footer = document.querySelector('main footer');
        const parent = projects?.parentElement;
        if (!parent) return;

        [projects, engineering, experience, stack, about, certifications, contact, lab, footer].filter(Boolean).forEach(node => parent.appendChild(node));

        document.querySelectorAll('.primary-nav, .drawer-links').forEach(nav => {
            const desired = ['projects', 'engineering', 'experience', 'stack', 'about', 'contact', 'lab'];
            desired.forEach(id => {
                let link = nav.querySelector(`a[href="#${id}"]`);
                if (!link && id === 'engineering') {
                    link = document.createElement('a');
                    link.href = '#engineering';
                    link.textContent = 'Engineering';
                    if (nav.classList.contains('drawer-links')) link.addEventListener('click', () => window.closeMobileNav?.());
                }
                if (link) nav.appendChild(link);
            });
        });
    }

    function initializeSectionNavigation() {
        const ids = ['projects', 'engineering', 'experience', 'stack', 'about', 'contact', 'lab'];
        const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
        if (!sections.length) return;

        const setActive = id => {
            document.querySelectorAll('.primary-nav a[href^="#"], .drawer-links a[href^="#"]').forEach(link => {
                const active = link.getAttribute('href') === `#${id}`;
                link.classList.toggle('is-active', active);
                if (active) link.setAttribute('aria-current', 'location');
                else link.removeAttribute('aria-current');
            });
        };

        if (!('IntersectionObserver' in window)) {
            setActive(sections[0].id);
            return;
        }

        const visibility = new Map();
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => visibility.set(entry.target.id, entry.intersectionRatio));
            const best = sections.map(section => ({ id: section.id, ratio: visibility.get(section.id) || 0 })).sort((a, b) => b.ratio - a.ratio)[0];
            if (best?.ratio > 0) setActive(best.id);
        }, { rootMargin: '-18% 0px -58% 0px', threshold: [0, .12, .3, .55, .8] });

        sections.forEach(section => observer.observe(section));
    }

    function cleanAppearanceControls() {
        document.querySelectorAll('.glass-intensity-control').forEach(control => control.remove());
        document.querySelectorAll('.sidebar-nav .sound-toggle-btn, .drawer-footer .sound-toggle-btn').forEach(button => button.remove());
    }

    function initialize() {
        ensureV2Styles();
        updateMetadata();
        updateHero();
        updateCapabilityStrip();
        updateProjects();
        createEngineeringProof();
        updateExperience();
        updateRemainingSections();
        reorderSections();
        cleanAppearanceControls();
        initializeSectionNavigation();
        root.classList.add('portfolio-v2-ready');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize, { once: true });
    } else {
        initialize();
    }
})();
