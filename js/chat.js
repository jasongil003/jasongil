/**
 * Interactive Community Guestbook & Presence Heartbeat
 * Persistent guestbook messages in localStorage with DiceBear avatars and device detection.
 */

(function () {
    const overlay = document.getElementById('chatOverlay');
    if (!overlay) return;

    const messagesEl = document.getElementById('chatMessages');
    const countEl = document.getElementById('chatCount');
    const form = document.getElementById('chatForm');
    const inputEl = document.getElementById('chatInput');
    const promptEl = document.getElementById('chatPrompt');
    const sendEl = document.getElementById('chatSend');

    let phase = 'name';
    let chatName = '';
    const STORAGE_KEY = 'portfolio_guestbook_messages';

    const DEFAULT_MESSAGES = [
        {
            id: 1,
            name: 'Sophia Chen',
            location: 'San Francisco, US',
            device: 'Mac',
            message: 'Super slick portfolio! Loving the halftone aesthetic and retro sound effects 🔥',
            time: '2h ago'
        },
        {
            id: 2,
            name: 'Marcus Vance',
            location: 'London, UK',
            device: 'iPhone',
            message: 'The project case studies are clear and easy to explore. Great engineering!',
            time: '5h ago'
        },
        {
            id: 3,
            name: 'Elena Rostova',
            location: 'Berlin, DE',
            device: 'Windows',
            message: 'Loved the typing test easter egg! 138 WPM is no joke 😄',
            time: '1d ago'
        }
    ];

    function getMessages() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return DEFAULT_MESSAGES;
    }

    function saveMessages(msgs) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
        } catch (e) {}
    }

    function detectDevice() {
        const ua = navigator.userAgent || '';
        if (/iPhone|iPod/.test(ua)) return 'iPhone';
        if (/iPad/.test(ua)) return 'iPad';
        if (/Android/.test(ua)) return 'Android';
        if (/Macintosh|Mac OS X/.test(ua)) return 'Mac';
        if (/Windows/.test(ua)) return 'Windows';
        if (/Linux/.test(ua)) return 'Linux';
        return 'Device';
    }

    function renderMessages() {
        const msgs = getMessages();
        messagesEl.innerHTML = '';
        msgs.forEach(m => {
            const item = document.createElement('div');
            item.className = 'chat-item';

            const avatar = document.createElement('img');
            avatar.className = 'chat-avatar';
            avatar.alt = m.name;
            avatar.src = `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(m.name)}&radius=50&backgroundColor=f1f1f1`;

            const body = document.createElement('div');
            body.className = 'chat-body';

            const author = document.createElement('div');
            author.className = 'chat-author';
            author.innerHTML = `<strong>${escapeHtml(m.name)}</strong> · <span>${escapeHtml(m.location || 'Online')}</span> · <span>${escapeHtml(m.device || 'Web')}</span> · <span>${m.time || 'just now'}</span>`;

            const bubble = document.createElement('div');
            bubble.className = 'chat-bubble';
            bubble.textContent = m.message;

            body.appendChild(author);
            body.appendChild(bubble);
            item.appendChild(avatar);
            item.appendChild(body);
            messagesEl.appendChild(item);
        });

        if (countEl) {
            countEl.textContent = `${msgs.length} messages`;
        }
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function setPhase(newPhase) {
        phase = newPhase;
        if (phase === 'name') {
            promptEl.textContent = "what's your name?";
            inputEl.placeholder = 'your name';
            sendEl.textContent = 'next ↵';
        } else {
            promptEl.innerHTML = `chatting as <b>${escapeHtml(chatName)}</b>`;
            inputEl.placeholder = 'leave a message in the guestbook...';
            sendEl.textContent = 'send ↵';
        }
        inputEl.value = '';
        inputEl.focus();
    }

    window.openChat = function () {
        if (window.closeAsk) window.closeAsk();
        if (window.closeTyping) window.closeTyping();
        overlay.classList.add('is-visible');
        document.documentElement.style.overflow = 'hidden';
        requestAnimationFrame(() => {
            overlay.classList.add('is-open');
        });
        renderMessages();
        setPhase(chatName ? 'message' : 'name');
        window.siteSound?.play('open');
    };

    window.closeChat = function () {
        overlay.classList.remove('is-open');
        document.documentElement.style.overflow = '';
        setTimeout(() => {
            overlay.classList.remove('is-visible');
        }, 280);
        window.siteSound?.play('close');
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = inputEl.value.trim();
        if (!val) return;

        if (phase === 'name') {
            chatName = val;
            try { localStorage.setItem('portfolio_chat_name', chatName); } catch (e) {}
            setPhase('message');
            window.siteSound?.play('toggle');
            return;
        }

        const msgs = getMessages();
        const newMsg = {
            id: Date.now(),
            name: chatName,
            location: 'Earth',
            device: detectDevice(),
            message: val,
            time: 'just now'
        };
        msgs.push(newMsg);
        saveMessages(msgs);
        renderMessages();
        inputEl.value = '';
        window.siteSound?.play('success');

        if (window.showToast) {
            window.showToast('Message posted to guestbook!');
        }
    });

    try {
        const saved = localStorage.getItem('portfolio_chat_name');
        if (saved) chatName = saved;
    } catch (e) {}

    // Simulated presence counter
    function updatePresence() {
        const count = 3 + Math.floor(Math.random() * 4);
        document.querySelectorAll('.presence-num').forEach(el => {
            el.textContent = count;
        });
    }
    updatePresence();
    setInterval(updatePresence, 20000);
})();
