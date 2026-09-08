/** Orbit Impact — original retro arcade shooter. WASD/arrows move, Space fires. */
(function () {
    const wrap = document.getElementById('pgWrap');
    const box = document.getElementById('pgBox');
    const canvas = document.getElementById('pgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 380, H = 280;
    const keys = { up: false, down: false, left: false, right: false, fire: false };
    const stars = Array.from({ length: 54 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: Math.random() > .82 ? 2 : 1, v: 18 + Math.random() * 46 }));
    let game, previous = 0;

    function reset() {
        game = { phase: 'intro', score: 0, hull: 3, elapsed: 0, spawn: .65, cooldown: 0, flash: 0,
            player: { x: 52, y: H / 2, r: 10, inv: 0 }, bullets: [], enemies: [], particles: [] };
    }
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    const hit = (a, b) => Math.abs(a.x - b.x) < a.r + b.r && Math.abs(a.y - b.y) < a.r + b.r;

    function launch() {
        if (game.phase === 'playing') return;
        reset(); game.phase = 'playing'; box.classList.add('is-playing');
        canvas.setAttribute('aria-label', 'Orbit Impact in progress. Move with WASD or arrow keys and fire with Space.');
        window.siteSound?.play('tap');
    }
    function burst(x, y, color, amount) {
        for (let i = 0; i < amount; i++) {
            const angle = Math.random() * Math.PI * 2, speed = 35 + Math.random() * 100;
            game.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: .28 + Math.random() * .32, color });
        }
    }
    function shoot() {
        if (game.phase !== 'playing' || game.cooldown > 0) return;
        game.cooldown = .15; game.bullets.push({ x: game.player.x + 14, y: game.player.y, r: 2, vx: 360 });
        window.siteSound?.play('press');
    }
    function spawnEnemy() {
        const heavy = Math.random() < Math.min(.27, game.elapsed / 100);
        game.enemies.push({ x: W + 20, y: 30 + Math.random() * (H - 60), r: heavy ? 13 : 9, hp: heavy ? 3 : 1,
            v: heavy ? 65 : 98 + Math.random() * 38, color: heavy ? '#a855f7' : '#f43f5e', spin: Math.random() * Math.PI * 2 });
    }
    function damage() {
        if (game.player.inv > 0) return;
        game.hull--; game.player.inv = 1; game.flash = .18; burst(game.player.x, game.player.y, '#fbbf24', 18); window.siteSound?.play('collision');
        if (!game.hull) { game.phase = 'gameover'; box.classList.remove('is-playing'); canvas.setAttribute('aria-label', `Game over. Score ${game.score}. Press Enter or click to restart.`); }
    }
    function update(dt) {
        stars.forEach(s => { s.x -= s.v * dt; if (s.x < -2) { s.x = W + 2; s.y = Math.random() * H; } });
        if (game.phase !== 'playing') return;
        game.elapsed += dt; game.spawn -= dt; game.cooldown -= dt; game.player.inv -= dt; game.flash -= dt;
        const speed = 152, p = game.player;
        if (keys.up) p.y -= speed * dt; if (keys.down) p.y += speed * dt; if (keys.left) p.x -= speed * dt; if (keys.right) p.x += speed * dt;
        p.x = clamp(p.x, 18, W - 54); p.y = clamp(p.y, 18, H - 18); if (keys.fire) shoot();
        if (game.spawn <= 0) { spawnEnemy(); game.spawn = Math.max(.34, .92 - game.elapsed / 85) + Math.random() * .32; }
        game.bullets.forEach(b => b.x += b.vx * dt); game.enemies.forEach(e => { e.x -= e.v * dt; e.spin += dt * 4; });
        game.particles.forEach(particle => { particle.x += particle.vx * dt; particle.y += particle.vy * dt; particle.life -= dt; });
        game.bullets.forEach(b => game.enemies.forEach(e => {
            if (!b.dead && !e.dead && hit(b, e)) { b.dead = true; e.hp--; burst(b.x, b.y, '#67e8f9', 4);
                if (e.hp <= 0) { e.dead = true; game.score += e.r > 10 ? 30 : 10; burst(e.x, e.y, e.color, e.r > 10 ? 18 : 10); window.siteSound?.play('success'); }
            }
        }));
        game.enemies.forEach(e => { if (!e.dead && hit(p, e)) { e.dead = true; damage(); } });
        game.bullets = game.bullets.filter(b => !b.dead && b.x < W + 8); game.enemies = game.enemies.filter(e => !e.dead && e.x > -28); game.particles = game.particles.filter(particle => particle.life > 0);
    }
    function label(value, x, y, align, color, size) { ctx.fillStyle = color; ctx.font = `600 ${size}px "Geist Mono", monospace`; ctx.textAlign = align; ctx.fillText(value, x, y); }
    function ship(p) {
        if (p.inv > 0 && Math.floor(p.inv * 12) % 2 === 0) return;
        ctx.save(); ctx.translate(Math.round(p.x), Math.round(p.y));
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(-14, -2, 7, 4); ctx.fillStyle = '#e4e4e7'; ctx.fillRect(-7, -7, 12, 14); ctx.fillStyle = '#67e8f9'; ctx.fillRect(3, -4, 7, 8); ctx.fillStyle = '#0f172a'; ctx.fillRect(-4, -3, 5, 6); ctx.fillStyle = '#fb7185'; ctx.fillRect(-10, -10, 4, 5); ctx.fillRect(-10, 5, 4, 5); ctx.restore();
    }
    function enemy(e) {
        ctx.save(); ctx.translate(Math.round(e.x), Math.round(e.y));
        if (e.r > 10) { ctx.fillStyle = '#581c87'; ctx.fillRect(-13, -11, 26, 22); ctx.fillStyle = e.color; ctx.fillRect(-9, -8, 18, 16); ctx.fillStyle = '#f5f3ff'; ctx.fillRect(-3, -3, 6, 6); }
        else { ctx.rotate(Math.floor(e.spin * 2) % 2 ? .18 : -.18); ctx.fillStyle = '#881337'; ctx.fillRect(-9, -7, 18, 14); ctx.fillStyle = e.color; ctx.fillRect(-5, -10, 10, 20); ctx.fillStyle = '#fecdd3'; ctx.fillRect(-2, -2, 4, 4); }
        ctx.restore();
    }
    function render() {
        ctx.fillStyle = '#080b16'; ctx.fillRect(0, 0, W, H); stars.forEach(s => { ctx.fillStyle = s.s === 2 ? '#94a3b8' : '#475569'; ctx.fillRect(Math.round(s.x), Math.round(s.y), s.s, s.s); });
        ctx.fillStyle = 'rgba(59,130,246,.12)'; ctx.fillRect(0, 0, W, 1); ctx.fillRect(0, H - 1, W, 1);
        if (game.phase === 'playing') { game.bullets.forEach(b => { ctx.fillStyle = '#67e8f9'; ctx.fillRect(Math.round(b.x), Math.round(b.y - 1), 7, 3); }); game.enemies.forEach(enemy); ship(game.player); game.particles.forEach(p => { ctx.globalAlpha = Math.max(0, p.life * 2); ctx.fillStyle = p.color; ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2); }); ctx.globalAlpha = 1; }
        label('ORBIT IMPACT', 12, 18, 'left', '#67e8f9', 10); label(`SCORE ${String(game.score).padStart(4, '0')}`, W - 12, 18, 'right', '#e4e4e7', 10); label(`HULL ${'◆'.repeat(game.hull)}${'◇'.repeat(3 - game.hull)}`, 12, H - 12, 'left', game.hull ? '#fbbf24' : '#fb7185', 9);
        if (game.flash > 0) { ctx.fillStyle = `rgba(251,113,133,${game.flash * 2})`; ctx.fillRect(0, 0, W, H); }
        if (game.phase !== 'playing') { ctx.fillStyle = 'rgba(8,11,22,.74)'; ctx.fillRect(0, 0, W, H); const failed = game.phase === 'gameover'; label(failed ? 'MISSION FAILED' : 'SECTOR CLEAR?', W / 2, 105, 'center', '#f8fafc', 18); label(failed ? `FINAL SCORE ${game.score}` : 'DEFEND THE NETWORK', W / 2, 128, 'center', '#67e8f9', 10); label(failed ? 'CLICK OR PRESS ENTER TO RETRY' : 'CLICK TO LAUNCH', W / 2, 165, 'center', '#fbbf24', 10); if (!failed) label('WASD / ARROWS TO MOVE · SPACE TO FIRE', W / 2, 187, 'center', '#94a3b8', 8); }
    }
    function loop(now) { if (document.hidden || !canvas.closest('details')?.open) { previous = now; requestAnimationFrame(loop); return; } const dt = Math.min(.032, (now - previous) / 1000 || 0); previous = now; update(dt); render(); requestAnimationFrame(loop); }
    function setKey(event, pressed) { const map = { w: 'up', arrowup: 'up', s: 'down', arrowdown: 'down', a: 'left', arrowleft: 'left', d: 'right', arrowright: 'right', ' ': 'fire' }; const control = map[event.key.toLowerCase()]; if (!control) return false; event.preventDefault(); keys[control] = pressed; if (pressed && control === 'fire') shoot(); return true; }
    canvas.addEventListener('keydown', event => { if ((event.key === 'Enter' || event.key === ' ') && game.phase !== 'playing') { event.preventDefault(); launch(); return; } setKey(event, true); });
    canvas.addEventListener('keyup', event => setKey(event, false)); canvas.addEventListener('click', () => { canvas.focus({ preventScroll: true }); launch(); }); canvas.addEventListener('blur', () => Object.keys(keys).forEach(key => keys[key] = false)); document.addEventListener('visibilitychange', () => previous = performance.now());
    const initializeGame = () => { canvas.width = W; canvas.height = H; reset(); render(); previous = performance.now(); requestAnimationFrame(loop); wrap?.classList.add('is-on'); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeGame, { once: true });
    else initializeGame();
})();
