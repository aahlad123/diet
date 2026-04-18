/* ── NutriLog Star Field ──
   Login page : stars attracted to cursor + blast on login
   Dashboard  : stars scatter inward as entrance effect
*/
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const IS_LOGIN = !document.getElementById('app-shell');

  /* ── Canvas ── */
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  /* Ensure auth card stays above canvas on login page */
  if (IS_LOGIN) {
    const screen = document.getElementById('auth-screen');
    if (screen) screen.style.zIndex = '20';
  }

  let W = 0, H = 0;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* ── Palette ── */
  const COLORS = [
    '#c084fc', '#a855f7', '#818cf8',
    '#f9a8d4', '#e879f9', '#d8b4fe', '#ffffff',
  ];

  /* ── Star factory ── */
  function makeStar(scatter) {
    const s = {
      r          : 0.7 + Math.random() * 2.0,
      color      : COLORS[(Math.random() * COLORS.length) | 0],
      phase      : Math.random() * Math.PI * 2,
      twinkleSpd : 0.5 + Math.random() * 1.4,
      baseAlpha  : 0.20 + Math.random() * 0.80,
      vx: 0, vy: 0,
      x: 0, y: 0,
      tx: 0, ty: 0,
      settling: false,
      alpha: 1,
    };

    if (scatter) {
      /* Start outside viewport, fly to a random destination */
      const angle = Math.random() * Math.PI * 2;
      const r     = Math.max(W, H) * (0.9 + Math.random() * 0.6);
      s.x = W / 2 + Math.cos(angle) * r;
      s.y = H / 2 + Math.sin(angle) * r;
      s.tx = 20 + Math.random() * (W - 40);
      s.ty = 20 + Math.random() * (H - 40);
      const dx = s.tx - s.x, dy = s.ty - s.y;
      const d  = Math.sqrt(dx * dx + dy * dy) || 1;
      const spd = 12 + Math.random() * 10;
      s.vx = dx / d * spd;
      s.vy = dy / d * spd;
      s.settling = true;
    } else {
      s.x = Math.random() * W;
      s.y = Math.random() * H;
      s.vx = (Math.random() - 0.5) * 0.5;
      s.vy = (Math.random() - 0.5) * 0.5;
    }
    return s;
  }

  const COUNT = IS_LOGIN ? 220 : 140;
  const stars = [];
  for (let i = 0; i < COUNT; i++) stars.push(makeStar(!IS_LOGIN));

  /* ── Mouse tracking (login page only) ── */
  let mx = -9999, my = -9999;
  if (IS_LOGIN) {
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    window.addEventListener('mouseleave', () => { mx = -9999; my = -9999; }, { passive: true });
  }

  let blasting = false;

  /* ── Per-star physics ── */
  function update(s, t) {
    if (s.settling) {
      const dx = s.tx - s.x, dy = s.ty - s.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 2) {
        s.settling = false;
        s.vx *= 0.05; s.vy *= 0.05;
      } else {
        /* Ease toward target — decelerate gently */
        s.vx = s.vx * 0.86 + (dx / d) * 0.55;
        s.vy = s.vy * 0.86 + (dy / d) * 0.55;
      }
    } else if (IS_LOGIN) {
      /* Cursor attraction */
      const dx = mx - s.x, dy = my - s.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      const ATTRACT_R = 240;
      if (d < ATTRACT_R && d > 0) {
        const strength = (1 - d / ATTRACT_R) * (1 - d / ATTRACT_R) * 1.4;
        s.vx += (dx / d) * strength;
        s.vy += (dy / d) * strength;
      }
      /* Natural wandering when far from cursor */
      s.vx += (Math.random() - 0.5) * 0.06;
      s.vy += (Math.random() - 0.5) * 0.06;
      s.vx *= 0.90;
      s.vy *= 0.90;
    } else {
      /* Dashboard: slow ambient drift */
      s.vx += (Math.random() - 0.5) * 0.04;
      s.vy += (Math.random() - 0.5) * 0.04;
      s.vx *= 0.994;
      s.vy *= 0.994;
    }

    /* Speed cap */
    const spd = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
    const cap = blasting ? 90 : (IS_LOGIN ? 7 : 2.5);
    if (spd > cap) { s.vx = s.vx / spd * cap; s.vy = s.vy / spd * cap; }

    s.x += s.vx;
    s.y += s.vy;

    /* Wrap edges */
    if (s.x < -12) s.x = W + 12;
    else if (s.x > W + 12) s.x = -12;
    if (s.y < -12) s.y = H + 12;
    else if (s.y > H + 12) s.y = -12;

    /* Twinkle */
    const nearCursor = IS_LOGIN
      ? Math.max(0, 1 - Math.sqrt((mx - s.x) ** 2 + (my - s.y) ** 2) / 200)
      : 0;
    const twinkle = 0.45 + 0.55 * Math.sin(t * s.twinkleSpd + s.phase);
    s.alpha = Math.min(1, s.baseAlpha * twinkle + nearCursor * 0.5);
  }

  function draw(s) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, s.alpha));
    ctx.fillStyle   = s.color;
    ctx.shadowColor = s.color;
    ctx.shadowBlur  = s.r * 5;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /* ── Blast API (called by app.js after successful login) ── */
  window.triggerStarBlast = function (ox, oy, callback) {
    blasting = true;
    const bx = (typeof ox === 'number') ? ox : W / 2;
    const by = (typeof oy === 'number') ? oy : H / 2;

    /* Give every star an explosive outward velocity */
    stars.forEach(s => {
      s.settling = false;
      const dx = s.x - bx, dy = s.y - by;
      const d  = Math.sqrt(dx * dx + dy * dy) || 1;
      const pwr = 20 + Math.random() * 28;
      s.vx = dx / d * pwr + (Math.random() - 0.5) * 12;
      s.vy = dy / d * pwr + (Math.random() - 0.5) * 12;
      s.baseAlpha = 1;
    });

    /* Purple radial flash that fades out, then navigate */
    const flash = document.createElement('div');
    flash.style.cssText = [
      'position:fixed;inset:0;z-index:9999;pointer-events:none;',
      'background:radial-gradient(ellipse 75% 55% at 50% 50%,',
      '  rgba(168,85,247,0.96) 0%,',
      '  rgba(109,40,217,0.85) 40%,',
      '  rgba(9,6,15,0.97) 100%);',
      'opacity:0;transition:opacity 0.14s ease;',
    ].join('');
    document.body.appendChild(flash);

    requestAnimationFrame(() => {
      flash.style.opacity = '1';
      /* Hold at full brightness briefly, then fade */
      setTimeout(() => {
        flash.style.transition = 'opacity 0.65s cubic-bezier(0.4,0,0.2,1)';
        flash.style.opacity    = '0';
        setTimeout(() => {
          flash.remove();
          if (callback) callback();
        }, 680);
      }, 200);
    });
  };

  /* ── Render loop ── */
  let t = 0;
  (function frame() {
    ctx.clearRect(0, 0, W, H);
    t += 0.016;
    for (let i = 0; i < stars.length; i++) {
      update(stars[i], t);
      draw(stars[i]);
    }
    requestAnimationFrame(frame);
  })();

})();
