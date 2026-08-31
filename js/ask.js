/**
 * Interactive Ask AI / Command Palette (⌘K / Ctrl+K)
 * Answers questions about Jason Gil De La Cruz, his 8+ years technical leadership, Linux/Networking expertise, RAG/AI systems, and contact info.
 */

(function () {
    const overlay = document.getElementById('askOverlay');
    if (!overlay) return;

    const input = document.getElementById('askInput');
    const textEl = document.getElementById('askText');
    const bubble = document.getElementById('askBubble');
    const bubbleText = document.getElementById('askBubbleText');
    const askLoader = document.getElementById('askLoader');

    let isTypingResponse = false;
    let typeTimer = null;

    const KNOWLEDGE_BASE = [
        {
            keywords: ['who', 'about', 'bio', 'introduce', 'jason', 'summary'],
            answer: "I'm Jason Gil De La Cruz — Technical Lead & IT Manager with 8+ years of experience across Linux infrastructure, enterprise networking, SaaS/MSP operations, and Applied AI/RAG systems based in Makati City, Philippines."
        },
        {
            keywords: ['skill', 'stack', 'tech', 'networking', 'linux', 'tools', 'protocols'],
            answer: "My core expertise includes: Linux administration, Bash/Unix scripting, TCP/IP, DNS, DHCP, VPN, VLAN, Multi-WAN, HA/DRBD, tcpdump packet analysis, Docker, WSL2, Ubuntu, Tailscale, AWS, REST APIs, and local LLM deployment (Ollama, Open WebUI, Qwen, Gemma, MiniLM embeddings)."
        },
        {
            keywords: ['project', 'rag', 'knowledge', 'ai', 'build', 'pawi', 'automation', 'ocr'],
            answer: "Key projects include: 1) ANTlabs Local AI Knowledge Base (On-premise RAG system using WSL2, Docker, Ollama, Qwen/Gemma & MiniLM with a resumable Bash ingestion pipeline), 2) Browser OCR Automation Tool, 3) ANTlabs SaaS Operations App, and 4) PAWI Offline-first Expense Manager."
        },
        {
            keywords: ['experience', 'job', 'career', 'history', 'role', 'antlabs', 'wipro', 'lead'],
            answer: "Currently Technical Lead / IT Manager at ANTlabs (July 2024–Present), previously Subject Matter Expert (SME) and System Engineer. I lead escalation management for SaaS, MSP, enterprise, and hospitality environments across APAC, EMEA, and North America."
        },
        {
            keywords: ['cert', 'certification', 'education', 'degree', 'ccna', 'suse', 'training'],
            answer: "Bachelor's degree in ICT (IETI, 2016). Cisco CCNA Routing & Switching coursework (Intro, Routing/Switching, Scaling, Connecting Networks), SUSE Linux Enterprise Server 10, Six Sigma Yellow & Green Belt, and NC II Computer Hardware."
        },
        {
            keywords: ['contact', 'email', 'phone', 'reach', 'hire', 'message', 'location'],
            answer: "Reach me directly at JasonGil.Career@gmail.com or +63 998 565 5016. Based in Makati City, Philippines. Check out my GitHub at github.com/jasongil003!"
        },
        {
            keywords: ['typing', 'game', 'easter', 'egg', 'secret'],
            answer: "Press ⌘J (or Ctrl+J) to test your typing speed against my benchmark, or interact with the mini Dev Studio simulator in the bottom right corner (WASD to walk)!"
        }
    ];

    function searchAnswer(query) {
        const q = query.toLowerCase().trim();
        if (!q) return "Ask me anything about Jason's 8+ years of technical leadership, Linux & networking, private RAG AI systems, or contact details!";
        for (const item of KNOWLEDGE_BASE) {
            if (item.keywords.some(k => q.includes(k))) {
                return item.answer;
            }
        }
        return `Regarding "${query}": Jason specializes in enterprise Linux infrastructure, network troubleshooting, and applied AI systems. Feel free to reach out via JasonGil.Career@gmail.com!`;
    }

    function typeWriter(text, el, onComplete) {
        if (typeTimer) clearInterval(typeTimer);
        el.textContent = '';
        let i = 0;
        isTypingResponse = true;
        typeTimer = setInterval(() => {
            if (i < text.length) {
                el.textContent += text.charAt(i);
                i++;
                if (i % 3 === 0) {
                    window.siteSound?.play('tick');
                }
            } else {
                clearInterval(typeTimer);
                isTypingResponse = false;
                if (onComplete) onComplete();
            }
        }, 15);
    }

    function handleQuery(query) {
        if (!query.trim()) return;
        if (askLoader) askLoader.style.display = 'block';
        window.siteSound?.play('press');

        setTimeout(() => {
            if (askLoader) askLoader.style.display = 'none';
            const answer = searchAnswer(query);
            bubble.classList.add('is-on');
            typeWriter(answer, bubbleText, () => {
                window.siteSound?.play('chime');
            });
            input.value = '';
            textEl.textContent = '';
        }, 250);
    }

    window.askPrompt = function(preset) {
        textEl.textContent = preset;
        handleQuery(preset);
    };

    window.openAsk = function () {
        if (window.closeTyping) window.closeTyping();
        if (window.closeChat) window.closeChat();
        overlay.classList.add('is-visible');
        document.documentElement.style.overflow = 'hidden';
        requestAnimationFrame(() => {
            overlay.classList.add('is-open');
            input.focus();
        });
        window.siteSound?.play('open');
    };

    window.closeAsk = function () {
        overlay.classList.remove('is-open');
        document.documentElement.style.overflow = '';
        setTimeout(() => {
            overlay.classList.remove('is-visible');
            bubble.classList.remove('is-on');
            textEl.textContent = '';
            input.value = '';
            if (typeTimer) clearInterval(typeTimer);
        }, 300);
        window.siteSound?.play('close');
    };

    window.focusAsk = function () {
        input.focus();
    };

    input.addEventListener('input', () => {
        textEl.textContent = input.value;
        window.siteSound?.play('press');
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleQuery(input.value);
        } else if (e.key === 'Escape') {
            closeAsk();
        }
    });

    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
            e.preventDefault();
            if (overlay.classList.contains('is-visible')) {
                closeAsk();
            } else {
                openAsk();
            }
        }
    });
})();
