/**
 * motion.js — Premium motion design system
 * Custom cursor · Magnetic buttons · Orb parallax · Spotlight
 * 3D tilt · Scroll reveal · Sticky topbar · Error shake · Micro-interactions
 *
 * Requires: GSAP 3 (loaded before this file)
 * Respects: prefers-reduced-motion, touch devices
 */

(function () {
  "use strict";

  // ─── Feature flags ──────────────────────────────────────────────────────────
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TOUCH   = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  const HAS_GSAP = typeof gsap !== "undefined";

  // ─── Easing constants (physics-feel) ────────────────────────────────────────
  const EASE_OUT    = "power3.out";
  const EASE_SPRING = "elastic.out(1, 0.4)";
  const EASE_BACK   = "back.out(1.6)";

  // ─── Utility ────────────────────────────────────────────────────────────────
  const lerp  = (a, b, t) => a + (b - a) * t;
  const $     = (sel)     => document.querySelector(sel);
  const $$    = (sel)     => Array.from(document.querySelectorAll(sel));

  // ─── 1. CUSTOM CURSOR ───────────────────────────────────────────────────────
  function initCursor() {
    if (TOUCH || REDUCED || !HAS_GSAP) return;

    const dot  = $("#cursor-dot");
    const ring = $("#cursor-ring");
    if (!dot || !ring) return;

    let mx = innerWidth / 2,  my = innerHeight / 2;
    let rx = mx, ry = my;
    let visible = false;

    // Dot follows instantly; ring lerps behind via ticker
    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;

      if (!visible) {
        visible = true;
        gsap.to([dot, ring], { opacity: 1, duration: 0.35, ease: EASE_OUT });
      }
      gsap.to(dot, { x: mx, y: my, duration: 0.05, ease: "none" });
    });

    document.addEventListener("mouseleave", () => {
      visible = false;
      gsap.to([dot, ring], { opacity: 0, duration: 0.4 });
    });

    gsap.ticker.add(() => {
      rx = lerp(rx, mx, 0.1);
      ry = lerp(ry, my, 0.1);
      gsap.set(ring, { x: rx, y: ry });
    });

    // ── Cursor states ──
    const BTN_SEL  = "a, button, [role='button'], .history-card, .meal-card, label, .status-pill";
    const TEXT_SEL = "input, textarea, select";

    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(TEXT_SEL)) {
        // text cursor: slim vertical bar
        gsap.to(ring, { scaleX: 0.1, scaleY: 1.4, duration: 0.25, ease: EASE_OUT });
        gsap.to(dot,  { scale: 0, duration: 0.2 });
      } else if (e.target.closest(BTN_SEL)) {
        // interactive: expand ring, shrink dot
        gsap.to(dot,  { scale: 0.5,  duration: 0.25 });
        gsap.to(ring, { scale: 1.55, opacity: 0.65, duration: 0.3, ease: EASE_OUT });
      }
    });

    document.addEventListener("mouseout", (e) => {
      const next = e.relatedTarget;
      if (next?.closest(BTN_SEL) || next?.closest(TEXT_SEL)) return;
      gsap.to(dot,  { scale: 1, duration: 0.5, ease: EASE_SPRING });
      gsap.to(ring, { scale: 1, scaleX: 1, scaleY: 1, opacity: 1, duration: 0.5, ease: EASE_SPRING });
    });

    document.addEventListener("mousedown", () => {
      gsap.to(dot,  { scale: 0.35, duration: 0.1 });
      gsap.to(ring, { scale: 0.7,  duration: 0.1 });
    });

    document.addEventListener("mouseup", () => {
      gsap.to(dot,  { scale: 1, duration: 0.55, ease: EASE_SPRING });
      gsap.to(ring, { scale: 1, duration: 0.55, ease: EASE_SPRING });
    });
  }

  // ─── 2. MAGNETIC BUTTONS ────────────────────────────────────────────────────
  const _magnetized = new WeakSet();

  function applyMagnetic(el) {
    if (_magnetized.has(el) || TOUCH || REDUCED || !HAS_GSAP) return;
    _magnetized.add(el);

    el.addEventListener("mousemove", (e) => {
      const r  = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width  / 2);
      const dy = e.clientY - (r.top  + r.height / 2);
      const k  = el.classList.contains("primary-btn") ? 0.3 : 0.18;
      gsap.to(el, { x: dx * k, y: dy * k, duration: 0.35, ease: "power2.out" });
    });

    el.addEventListener("mouseleave", () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: EASE_SPRING });
    });
  }

  // ─── 3. CURSOR PARALLAX ON BACKGROUND ORBS ──────────────────────────────────
  function initOrbParallax() {
    if (REDUCED || !HAS_GSAP) return;

    const config = [
      { sel: ".orb-1", sx:  22, sy:  16 },
      { sel: ".orb-2", sx: -16, sy: -22 },
      { sel: ".orb-3", sx:  12, sy:  14 },
      { sel: ".orb-4", sx: -10, sy:  10 },
    ];

    let busy = false;
    document.addEventListener("mousemove", (e) => {
      if (busy) return;
      busy = true;
      requestAnimationFrame(() => {
        const nx = (e.clientX / innerWidth  - 0.5) * 2;
        const ny = (e.clientY / innerHeight - 0.5) * 2;
        config.forEach(({ sel, sx, sy }) => {
          const el = $(sel);
          if (el) gsap.to(el, { x: nx * sx, y: ny * sy, duration: 2.8, ease: "power2.out", overwrite: "auto" });
        });
        busy = false;
      });
    });
  }

  // ─── 4. SPOTLIGHT ON PANELS (cursor-proximity glow) ─────────────────────────
  const _spotlit = new WeakSet();

  function applySpotlight(el) {
    if (_spotlit.has(el) || REDUCED) return;
    _spotlit.add(el);

    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--spot-x", `${e.clientX - r.left}px`);
      el.style.setProperty("--spot-y", `${e.clientY - r.top}px`);
      el.classList.add("spotlight-on");
    });

    el.addEventListener("mouseleave", () => el.classList.remove("spotlight-on"));
  }

  // ─── 5. 3D TILT ─────────────────────────────────────────────────────────────
  const _tilted = new WeakSet();

  function applyTilt(el, deg = 4) {
    if (_tilted.has(el) || TOUCH || REDUCED || !HAS_GSAP) return;
    _tilted.add(el);

    el.style.transformStyle = "preserve-3d";

    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      gsap.to(el, {
        rotateY: x * deg, rotateX: -y * deg,
        transformPerspective: 900,
        duration: 0.45, ease: "power2.out",
      });
    });

    el.addEventListener("mouseleave", () => {
      gsap.to(el, {
        rotateX: 0, rotateY: 0,
        transformPerspective: 900,
        duration: 0.75, ease: EASE_SPRING,
      });
    });
  }

  // ─── 6. SCROLL REVEAL ───────────────────────────────────────────────────────
  let _revealObs;

  function initScrollReveal() {
    if (REDUCED || !HAS_GSAP) return;

    _revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el    = entry.target;
          const delay = parseFloat(el.dataset.revealDelay || 0);
          gsap.fromTo(el,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.65, delay, ease: EASE_OUT, clearProps: "transform" }
          );
          _revealObs.unobserve(el);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -44px 0px" }
    );
  }

  function watchReveal(el) {
    if (!_revealObs) return;
    const r = el.getBoundingClientRect();
    if (r.top >= innerHeight) {
      gsap.set(el, { opacity: 0, y: 30 });
      _revealObs.observe(el);
    }
  }

  // ─── 7. STICKY TOPBAR ───────────────────────────────────────────────────────
  function initStickyTopbar() {
    const bar = $(".topbar");
    if (!bar) return;
    window.addEventListener("scroll",
      () => bar.classList.toggle("topbar-scrolled", scrollY > 28),
      { passive: true }
    );
  }

  // ─── 8. ERROR SHAKE ─────────────────────────────────────────────────────────
  function shake(el) {
    if (!el) return;
    el.classList.remove("motion-shake");
    void el.offsetWidth; // force reflow to restart animation
    el.classList.add("motion-shake");
    el.addEventListener("animationend", () => el.classList.remove("motion-shake"), { once: true });
  }

  function hookFeedback() {
    ["#login-feedback", "#signup-feedback"].forEach((sel) => {
      const fb = $(sel);
      if (!fb) return;
      new MutationObserver(() => {
        if (fb.textContent.trim()) {
          const target = fb.closest("form") || fb.parentElement;
          shake(target);
        }
      }).observe(fb, { childList: true, characterData: true, subtree: true });
    });
  }

  // ─── 9. SUCCESS PILL BOUNCE ─────────────────────────────────────────────────
  function hookStatusPill() {
    if (!HAS_GSAP) return;
    const pill = $("#summary-status");
    if (!pill) return;

    let prev = "neutral";
    new MutationObserver(() => {
      const now = pill.classList.contains("good")
        ? "good" : pill.classList.contains("bad")
        ? "bad" : "neutral";
      if (now !== prev) {
        prev = now;
        gsap.fromTo(pill,
          { scale: 0.75, opacity: 0.3 },
          { scale: 1, opacity: 1, duration: 0.55, ease: EASE_SPRING }
        );
      }
    }).observe(pill, { attributes: true, attributeFilter: ["class"] });
  }

  // ─── 10. AUTH-SCREEN ENTRANCE ───────────────────────────────────────────────
  function playAuthEntrance() {
    if (REDUCED || !HAS_GSAP) return;
    const authScreen = $("#auth-screen");
    if (!authScreen || authScreen.classList.contains("app-hidden")) return;

    gsap.fromTo(".auth-hero-badge",
      { opacity: 0, scale: 0.6, rotation: -12 },
      { opacity: 1, scale: 1,   rotation: 0, duration: 0.7, delay: 0.05, ease: EASE_BACK }
    );
    gsap.fromTo(".auth-hero",
      { opacity: 0, x: -24 },
      { opacity: 1, x: 0, duration: 0.7, delay: 0.1, ease: EASE_OUT }
    );
    gsap.fromTo(".auth-panel",
      { opacity: 0, x: 24 },
      { opacity: 1, x: 0, duration: 0.7, delay: 0.18, ease: EASE_OUT }
    );
  }

  // ─── 11. APP-SHELL ENTRANCE (on login) ──────────────────────────────────────
  function initAppShellReveal() {
    if (REDUCED || !HAS_GSAP) return;
    const shell = $("#app-shell");
    if (!shell) return;

    new MutationObserver(() => {
      if (shell.classList.contains("app-hidden")) return;
      const sections = Array.from(shell.querySelectorAll(":scope > section, :scope > .grid-layout"));
      gsap.fromTo(sections,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.07, ease: EASE_OUT, clearProps: "transform" }
      );
    }).observe(shell, { attributes: true, attributeFilter: ["class"] });
  }

  // ─── 12. INPUT FOCUS MICRO-INTERACTION ──────────────────────────────────────
  function initInputInteractions() {
    if (!HAS_GSAP) return;

    document.addEventListener("focusin", (e) => {
      const input = e.target.closest("input, textarea, select");
      if (!input) return;
      const label = input.closest("label");
      if (label && !REDUCED) {
        gsap.to(label, { scale: 1.005, duration: 0.2, ease: "power1.out", transformOrigin: "left center" });
      }
    });

    document.addEventListener("focusout", (e) => {
      const input = e.target.closest("input, textarea, select");
      if (!input) return;
      const label = input.closest("label");
      if (label && !REDUCED) {
        gsap.to(label, { scale: 1, duration: 0.25, ease: EASE_SPRING, transformOrigin: "left center" });
      }
    });
  }

  // ─── 13. TOAST ENTRANCE (hijack existing toast) ─────────────────────────────
  function hookToast() {
    if (!HAS_GSAP) return;
    const toast = $("#toast");
    if (!toast) return;

    new MutationObserver(() => {
      if (toast.classList.contains("visible")) {
        gsap.fromTo(toast,
          { y: 60, opacity: 0, scale: 0.9 },
          { y: 0,  opacity: 1, scale: 1,   duration: 0.5, ease: EASE_BACK }
        );
      } else {
        gsap.to(toast, { y: 40, opacity: 0, scale: 0.92, duration: 0.3, ease: "power2.in" });
      }
    }).observe(toast, { attributes: true, attributeFilter: ["class"] });
  }

  // ─── 14. APPLY EFFECTS TO A SINGLE ELEMENT ──────────────────────────────────
  function applyTo(el) {
    if (!el?.matches) return;
    if (el.matches(".primary-btn, .ghost-btn")) applyMagnetic(el);
    if (el.matches(".panel"))                   { applySpotlight(el); applyTilt(el, 3.5); }
    if (el.matches(".metric-card"))              applyTilt(el, 6);
    if (el.matches(".history-card"))             { applySpotlight(el); applyTilt(el, 3); }
    if (el.matches(".meal-card"))                applyTilt(el, 2.5);
    if (el.matches(".admin-card"))               applyTilt(el, 3);
  }

  function applySubtree(root) {
    const sel = ".primary-btn,.ghost-btn,.panel,.metric-card,.history-card,.meal-card,.admin-card";
    root.querySelectorAll?.(sel).forEach(applyTo);
  }

  // ─── 15. MUTATION WATCHER (dynamic content) ──────────────────────────────────
  function initMutationWatcher() {
    let timer;
    new MutationObserver((mutations) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        mutations.forEach((m) => {
          m.addedNodes.forEach((n) => {
            if (n.nodeType !== 1) return;
            applyTo(n);
            applySubtree(n);
          });
        });
      }, 60);
    }).observe(document.body, { childList: true, subtree: true });
  }

  // ─── 16. METRIC BAR STAGGER (enhance existing animate) ──────────────────────
  function hookMacroSummary() {
    if (!HAS_GSAP) return;
    const container = $("#macro-summary");
    if (!container) return;

    new MutationObserver(() => {
      const cards = container.querySelectorAll(".metric-card");
      if (!cards.length) return;
      cards.forEach((card, i) => {
        applyTo(card);
        watchReveal(card);
        // Re-stagger entrance
        if (!REDUCED) {
          gsap.fromTo(card,
            { opacity: 0, y: 16, scale: 0.96 },
            { opacity: 1, y: 0,  scale: 1, duration: 0.45, delay: i * 0.08, ease: EASE_BACK }
          );
        }
      });
    }).observe(container, { childList: true });
  }

  // ─── BOOT ────────────────────────────────────────────────────────────────────
  function boot() {
    initScrollReveal();
    if (!TOUCH) initCursor();
    initOrbParallax();
    initStickyTopbar();
    initInputInteractions();
    initMutationWatcher();
    initAppShellReveal();
    hookFeedback();
    hookStatusPill();
    hookToast();
    hookMacroSummary();
    applySubtree(document);
    playAuthEntrance();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
