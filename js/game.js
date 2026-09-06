/**
 * Retro 2D Canvas Playground Game
 * Top-down developer workspace with character controls, furniture collision, wandering AI NPCs, and retro sound FX.
 */

(function () {
    const wrap = document.getElementById('pgWrap');
    const box = document.getElementById('pgBox');
    const canvas = document.getElementById('pgCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const TILE = 32;
    const MAP_W = 16;
    const MAP_H = 12;
    let VIEW_W = 380;
    let VIEW_H = 280;

    let isRunning = false;
    let rafId = null;

    // Player entity
    const player = {
        x: 6 * TILE,
        y: 6 * TILE,
        w: 20,
        h: 24,
        speed: 2.8,
        dir: 'down',
        frame: 0,
        animTimer: 0,
        name: 'You'
    };

    // Simulated office NPCs
    const npcs = [
        { x: 3 * TILE, y: 3 * TILE, w: 20, h: 24, dir: 'right', name: 'Jason (Lead)', color: '#38bdf8', timer: 0 },
        { x: 12 * TILE, y: 8 * TILE, w: 20, h: 24, dir: 'up', name: 'Alex (AI Dev)', color: '#a855f7', timer: 0 },
        { x: 11 * TILE, y: 3 * TILE, w: 20, h: 24, dir: 'down', name: 'Sam (Cloud)', color: '#10b981', timer: 0 }
    ];

    // Office Furniture Objects
    const OBJECTS = [
        { type: 'desk', x: 2 * TILE, y: 2 * TILE, w: 2 * TILE, h: 1.5 * TILE, label: 'Workstation 1' },
        { type: 'desk', x: 10 * TILE, y: 2 * TILE, w: 2 * TILE, h: 1.5 * TILE, label: 'Workstation 2' },
        { type: 'server', x: 14 * TILE, y: 1 * TILE, w: 1 * TILE, h: 2.5 * TILE, label: 'GPU Cluster' },
        { type: 'table', x: 7 * TILE, y: 8 * TILE, w: 3 * TILE, h: 2 * TILE, label: 'Meeting Table' },
        { type: 'plant', x: 1 * TILE, y: 10 * TILE, w: 1 * TILE, h: 1 * TILE, label: 'Bonsai' },
        { type: 'plant', x: 14 * TILE, y: 10 * TILE, w: 1 * TILE, h: 1 * TILE, label: 'Monstera' }
    ];

    const keys = { w: false, a: false, s: false, d: false };
    let lastStepSound = 0;

    function checkCollision(nx, ny, w, h) {
        // Map borders
        if (nx < 8 || nx + w > MAP_W * TILE - 8 || ny < 8 || ny + h > MAP_H * TILE - 8) {
            return true;
        }
        // Furniture
        for (const obj of OBJECTS) {
            if (
                nx < obj.x + obj.w &&
                nx + w > obj.x &&
                ny < obj.y + obj.h &&
                ny + h > obj.y
            ) {
                return true;
            }
        }
        return false;
    }

    function updatePlayer() {
        let dx = 0, dy = 0;
        if (keys.w) { dy -= player.speed; player.dir = 'up'; }
        if (keys.s) { dy += player.speed; player.dir = 'down'; }
        if (keys.a) { dx -= player.speed; player.dir = 'left'; }
        if (keys.d) { dx += player.speed; player.dir = 'right'; }

        if (dx !== 0 && dy !== 0) {
            dx *= 0.7071;
            dy *= 0.7071;
        }

        const isMoving = dx !== 0 || dy !== 0;

        if (isMoving) {
            if (!checkCollision(player.x + dx, player.y, player.w, player.h)) {
                player.x += dx;
            } else {
                window.siteSound?.play('collision');
            }

            if (!checkCollision(player.x, player.y + dy, player.w, player.h)) {
                player.y += dy;
            } else {
                window.siteSound?.play('collision');
            }

            player.animTimer += 1;
            if (player.animTimer > 8) {
                player.frame = (player.frame + 1) % 4;
                player.animTimer = 0;
            }

            const now = Date.now();
            if (now - lastStepSound > 220) {
                lastStepSound = now;
                window.siteSound?.play('step');
            }
        } else {
            player.frame = 0;
        }
    }

    function updateNPCs() {
        npcs.forEach(npc => {
            npc.timer++;
            if (npc.timer > 120 + Math.random() * 60) {
                npc.timer = 0;
                const dirs = ['up', 'down', 'left', 'right', 'idle'];
                npc.dir = dirs[Math.floor(Math.random() * dirs.length)];
            }
            let ndx = 0, ndy = 0;
            if (npc.dir === 'up') ndy = -0.6;
            if (npc.dir === 'down') ndy = 0.6;
            if (npc.dir === 'left') ndx = -0.6;
            if (npc.dir === 'right') ndx = 0.6;

            if (ndx !== 0 || ndy !== 0) {
                if (!checkCollision(npc.x + ndx, npc.y + ndy, npc.w, npc.h)) {
                    npc.x += ndx;
                    npc.y += ndy;
                }
            }
        });
    }

    function drawPixelCharacter(x, y, color, isPlayer, dir, frame) {
        ctx.save();
        ctx.translate(Math.round(x), Math.round(y));

        // Soft shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(10, 22, 9, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs / walk animation
        ctx.fillStyle = '#27272a';
        const legOffset = frame % 2 === 0 ? 1 : -1;
        ctx.fillRect(5 + legOffset, 16, 4, 6);
        ctx.fillRect(11 - legOffset, 16, 4, 6);

        // Body / Shirt
        ctx.fillStyle = color;
        ctx.fillRect(4, 8, 12, 9);

        // Head
        ctx.fillStyle = '#fed7aa'; // Skin tone
        ctx.fillRect(5, 1, 10, 8);

        // Hair
        ctx.fillStyle = '#18181b';
        ctx.fillRect(4, 0, 12, 3);
        ctx.fillRect(4, 3, 2, 3);

        // Eyes
        ctx.fillStyle = '#09090b';
        if (dir === 'left') {
            ctx.fillRect(6, 4, 2, 2);
        } else if (dir === 'right') {
            ctx.fillRect(12, 4, 2, 2);
        } else if (dir !== 'up') {
            ctx.fillRect(7, 4, 2, 2);
            ctx.fillRect(11, 4, 2, 2);
        }

        ctx.restore();
    }

    function render() {
        const isDark = document.documentElement.classList.contains('dark');
        ctx.fillStyle = isDark ? '#121216' : '#f8fafc';
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);

        // Grid lines
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < VIEW_W; x += TILE) {
            ctx.moveTo(x + 0.5, 0);
            ctx.lineTo(x + 0.5, VIEW_H);
        }
        for (let y = 0; y < VIEW_H; y += TILE) {
            ctx.moveTo(0, y + 0.5);
            ctx.lineTo(VIEW_W, y + 0.5);
        }
        ctx.stroke();

        // Draw Furniture
        OBJECTS.forEach(obj => {
            ctx.fillStyle = isDark ? '#27272a' : '#e2e8f0';
            ctx.strokeStyle = isDark ? '#3f3f46' : '#cbd5e1';
            ctx.lineWidth = 1;
            ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
            ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);

            // Details on furniture
            if (obj.type === 'desk') {
                ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
                ctx.fillRect(obj.x + 8, obj.y + 4, 16, 12); // Monitor
            } else if (obj.type === 'server') {
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(obj.x + 6, obj.y + 8, 4, 4); // Status LED
                ctx.fillStyle = '#38bdf8';
                ctx.fillRect(obj.x + 6, obj.y + 20, 4, 4);
            } else if (obj.type === 'plant') {
                ctx.fillStyle = '#16a34a';
                ctx.beginPath();
                ctx.arc(obj.x + obj.w / 2, obj.y + obj.h / 2, 10, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Draw NPCs
        npcs.forEach(npc => {
            drawPixelCharacter(npc.x, npc.y, npc.color, false, npc.dir, 0);
            ctx.fillStyle = isDark ? '#a1a1aa' : '#71717a';
            ctx.font = '9px "Geist Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(npc.name, npc.x + 10, npc.y - 4);
        });

        // Draw Player
        drawPixelCharacter(player.x, player.y, isDark ? '#f43f5e' : '#e11d48', true, player.dir, player.frame);
        ctx.fillStyle = isDark ? '#ffffff' : '#000000';
        ctx.font = '600 10px "Geist Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('You (WASD)', player.x + 10, player.y - 5);
    }

    function loop() {
        updatePlayer();
        updateNPCs();
        render();
        if (isRunning) {
            rafId = requestAnimationFrame(loop);
        }
    }

    function handleKey(e, isDown) {
        const k = e.key.toLowerCase();
        if (k === 'w' || k === 'arrowup') keys.w = isDown;
        if (k === 'a' || k === 'arrowleft') keys.a = isDown;
        if (k === 's' || k === 'arrowdown') keys.s = isDown;
        if (k === 'd' || k === 'arrowright') keys.d = isDown;
    }

    canvas.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
            e.preventDefault();
            handleKey(e, true);
        }
    });

    canvas.addEventListener('keyup', (e) => {
        handleKey(e, false);
    });

    canvas.addEventListener('focus', () => {
        box.classList.add('is-playing');
        window.siteSound?.play('tap');
    });

    canvas.addEventListener('blur', () => {
        box.classList.remove('is-playing');
        keys.w = keys.a = keys.s = keys.d = false;
    });

    function start() {
        if (isRunning) return;
        isRunning = true;
        VIEW_W = canvas.width = 380;
        VIEW_H = canvas.height = 280;
        rafId = requestAnimationFrame(loop);
    }

    document.addEventListener('DOMContentLoaded', () => {
        start();
        setTimeout(() => {
            if (wrap) wrap.classList.add('is-on');
        }, 1000);
    });
})();

