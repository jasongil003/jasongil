/**
 * Interactive Speed Typing Test (⌘J / Ctrl+J)
 * Real-time WPM calculation, accuracy tracking, keyboard heatmap animation, sound integration.
 */

(function () {
    const overlay = document.getElementById('typingOverlay');
    if (!overlay) return;

    const wordsEl = document.getElementById('ttWords');
    const kbEl = document.getElementById('ttKeyboard');
    const elWpm = document.getElementById('ttWpm');
    const elAcc = document.getElementById('ttAcc');
    const elTime = document.getElementById('ttTime');
    const rWpm = document.getElementById('ttResWpm');
    const rAcc = document.getElementById('ttResAcc');
    const rRaw = document.getElementById('ttResRaw');
    const rTime = document.getElementById('ttResTime');
    const verdictEl = document.getElementById('ttVerdict');

    const BENCHMARK_WPM = 115;

    const WORD_BANK = (
        'linux networking routing tcpdump packet vlan subnet gateway failover ' +
        'drbd docker ubuntu tailscale ollama qwen gemma embedding vector search ' +
        'troubleshooting incident escalation authentication postman api bash shell ' +
        'diagnostics architecture knowledge automation monitoring infrastructure'
    ).split(' ');

    const KB_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
    const N_WORDS = 24;

    let words = [], wordEls = [], wi = 0, ci = 0;
    let started = false, finished = false, startTime = 0, timerInterval = null;
    let raw = 0, correct = 0;
    let isOpen = false;

    const caretEl = document.createElement('span');
    caretEl.className = 'tt-caret';

    function buildKeyboard() {
        kbEl.innerHTML = '';
        KB_ROWS.forEach(row => {
            const r = document.createElement('div');
            r.className = 'tt-krow';
            for (const ch of row) {
                const k = document.createElement('span');
                k.className = 'tt-key';
                k.dataset.key = ch;
                k.textContent = ch;
                r.appendChild(k);
            }
            kbEl.appendChild(r);
        });
        const spaceRow = document.createElement('div');
        spaceRow.className = 'tt-krow';
        const sp = document.createElement('span');
        sp.className = 'tt-key space';
        sp.dataset.key = ' ';
        sp.textContent = 'space';
        spaceRow.appendChild(sp);
        kbEl.appendChild(spaceRow);
    }

    function keyEl(ch) {
        return kbEl.querySelector(`.tt-key[data-key="${ch}"]`);
    }

    function flashKey(ch) {
        const k = keyEl(ch);
        if (k) {
            k.classList.add('active');
            setTimeout(() => k.classList.remove('active'), 120);
        }
    }

    function highlightNext() {
        kbEl.querySelectorAll('.tt-key.next').forEach(k => k.classList.remove('next'));
        if (finished || !wordEls[wi]) return;
        const cur = wordEls[wi];
        let nc = null;
        if (ci < cur.word.length) nc = cur.word[ci];
        else if (wi < words.length - 1) nc = ' ';
        if (nc) {
            const k = keyEl(nc);
            if (k) k.classList.add('next');
        }
    }

    function genWords() {
        words = [];
        for (let i = 0; i < N_WORDS; i++) {
            words.push(WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]);
        }
    }

    function buildText() {
        wordsEl.innerHTML = '';
        wordEls = [];
        words.forEach(w => {
            const wEl = document.createElement('span');
            wEl.className = 'tt-word';
            const chars = [];
            for (const ch of w) {
                const c = document.createElement('span');
                c.className = 'tt-char';
                c.textContent = ch;
                wEl.appendChild(c);
                chars.push(c);
            }
            wordsEl.appendChild(wEl);
            wordEls.push({ el: wEl, chars, word: w });
        });
        wordsEl.appendChild(caretEl);
    }

    function moveCaret() {
        const cur = wordEls[wi];
        if (!cur) return;
        let left = 0, top = 0;
        if (ci < cur.chars.length) {
            const el = cur.chars[ci];
            left = el.offsetLeft;
            top = el.offsetTop;
        } else if (cur.chars.length > 0) {
            const el = cur.chars[cur.chars.length - 1];
            left = el.offsetLeft + el.offsetWidth;
            top = el.offsetTop;
        }
        caretEl.style.left = left + 'px';
        caretEl.style.top = top + 'px';
    }

    function start() {
        started = true;
        startTime = Date.now();
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(updateStats, 150);
    }

    function updateStats() {
        if (!started || finished) return;
        const elapsedSec = (Date.now() - startTime) / 1000;
        const currentWpm = elapsedSec > 0.5 ? Math.round((correct / 5) / (elapsedSec / 60)) : 0;
        const currentAcc = raw > 0 ? Math.round((correct / raw) * 100) : 100;

        elWpm.textContent = currentWpm;
        elAcc.textContent = currentAcc;
        elTime.textContent = Math.floor(elapsedSec);
    }

    function handleChar(k) {
        if (finished) return;
        if (!started) start();
        const cur = wordEls[wi];
        if (!cur) return;

        if (ci < cur.word.length) {
            const el = cur.chars[ci];
            const ok = (k === cur.word[ci]);
            el.classList.add(ok ? 'correct' : 'incorrect');
            raw++;
            if (ok) correct++;
            ci++;
            window.siteSound?.play(ok ? 'tick' : 'press');
        } else if (cur.chars.length - cur.word.length < 8) {
            const extra = document.createElement('span');
            extra.className = 'tt-char extra';
            extra.textContent = k;
            cur.el.appendChild(extra);
            cur.chars.push(extra);
            raw++;
            ci++;
            window.siteSound?.play('press');
        }

        moveCaret();
        highlightNext();

        if (wi === words.length - 1 && ci >= cur.word.length) {
            finish();
        }
    }

    function handleSpace() {
        if (finished || !started) return;
        if (wi < words.length - 1) {
            wi++;
            ci = 0;
            window.siteSound?.play('release');
            moveCaret();
            highlightNext();
        }
    }

    function handleBackspace() {
        if (finished) return;
        if (ci > 0) {
            ci--;
            const cur = wordEls[wi];
            if (ci >= cur.word.length) {
                const extra = cur.chars.pop();
                if (extra) extra.remove();
            } else {
                cur.chars[ci].classList.remove('correct', 'incorrect');
            }
            window.siteSound?.play('click');
        } else if (wi > 0) {
            wi--;
            ci = wordEls[wi].chars.length;
            window.siteSound?.play('click');
        }
        moveCaret();
        highlightNext();
    }

    function finish() {
        if (finished) return;
        finished = true;
        if (timerInterval) clearInterval(timerInterval);

        const elapsedSec = Math.max(0.5, (Date.now() - startTime) / 1000);
        const finalWpm = Math.round((correct / 5) / (elapsedSec / 60));
        const finalRaw = Math.round((raw / 5) / (elapsedSec / 60));
        const finalAcc = raw > 0 ? Math.round((correct / raw) * 100) : 100;

        rWpm.textContent = finalWpm;
        rAcc.textContent = finalAcc;
        rRaw.textContent = finalRaw;
        rTime.textContent = elapsedSec.toFixed(1);

        const beat = finalWpm >= BENCHMARK_WPM;
        verdictEl.innerHTML = beat
            ? `<span style="color:#22c55e;">⚡ Awesome! You beat Jason's benchmark (${BENCHMARK_WPM} WPM)!</span>`
            : `<span>Good speed! Jason's benchmark is ${BENCHMARK_WPM} WPM. Give it another shot!</span>`;

        overlay.classList.add('show-results');
        window.siteSound?.play(beat ? 'success' : 'chime');
    }

    function reset() {
        finished = false;
        started = false;
        startTime = 0;
        wi = 0;
        ci = 0;
        raw = 0;
        correct = 0;
        if (timerInterval) clearInterval(timerInterval);
        overlay.classList.remove('show-results');
        elWpm.textContent = '0';
        elAcc.textContent = '100';
        elTime.textContent = '0';
        genWords();
        buildText();
        requestAnimationFrame(() => {
            moveCaret();
            highlightNext();
        });
    }
    window.ttRestart = reset;

    window.openTyping = function () {
        if (window.closeAsk) window.closeAsk();
        if (window.closeChat) window.closeChat();
        overlay.classList.add('is-visible');
        document.documentElement.style.overflow = 'hidden';
        requestAnimationFrame(() => {
            overlay.classList.add('is-open');
        });
        isOpen = true;
        reset();
        window.siteSound?.play('open');
    };

    window.closeTyping = function () {
        if (!isOpen) return;
        isOpen = false;
        if (timerInterval) clearInterval(timerInterval);
        document.documentElement.style.overflow = '';
        overlay.classList.remove('is-open');
        setTimeout(() => {
            overlay.classList.remove('is-visible');
        }, 280);
        window.siteSound?.play('close');
    };

    buildKeyboard();

    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && (e.key === 'j' || e.key === 'J')) {
            e.preventDefault();
            isOpen ? closeTyping() : openTyping();
            return;
        }

        if (!isOpen) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            closeTyping();
            return;
        }

        if (e.key === 'Tab') {
            e.preventDefault();
            reset();
            return;
        }

        if (e.key === 'Backspace') {
            e.preventDefault();
            flashKey('backspace');
            handleBackspace();
            return;
        }

        if (e.key === ' ') {
            e.preventDefault();
            flashKey(' ');
            handleSpace();
            return;
        }

        if (e.key.length === 1 && /[a-z]/i.test(e.key) && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            const ch = e.key.toLowerCase();
            flashKey(ch);
            handleChar(ch);
        }
    });
})();

