/**
 * motion.js — Premium motion design system
 *
 * Sections:
 *   1.  Feature flags & helpers
 *   2.  Magnetic buttons
 *   3.  Orb parallax (cursor-driven)
 *   4.  Hero card parallax (cursor-driven)
 *   5.  Spotlight (cursor glow on panels)
 *   6.  3D tilt (panels, cards)
 *   7.  ScrollTrigger scroll reveals
 *   8.  Hero entrance animation
 *   9.  Auth section reveal
 *  10.  Sticky topbar
 *  11.  Error shake micro-interaction
 *  12.  Status pill bounce
 *  13.  Input focus micro-interaction
 *  14.  Toast GSAP override
 *  15.  Metric card stagger
 *  16.  App-shell entrance on login
 *  17.  MutationObserver for dynamic content
 *  18.  Boot
 *
 * Requires: GSAP 3 + ScrollTrigger (loaded before this file via defer)
 * Respects: prefers-reduced-motion, touch devices
 */

(function () {
  "use strict";

  // ─── 1. FEATURE FLAGS & HELPERS ─────────────────────────────────────────────
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TOUCH   = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  const HAS_GSAP = typeof gsap !== "undefined";
  const HAS_ST   = typeof ScrollTrigger !== "undefined";

  const EASE_OUT    = "power3.out";
  const EASE_SPRING = "elastic.out(1, 0.4)";
  const EASE_BACK   = "back.out(1.6)";

  const lerp = (a, b, t) => a + (b - a) * t;
  const $    = (s) => document.querySelector(s);
  const $$   = (s) => Array.from(document.querySelectorAll(s));

  if (HAS_GSAP && HAS_ST) {
    gsap.registerPlugin(ScrollTrigger);
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
      const k  = el.classList.contains("primary-btn") ? 0.28 : 0.16;
      gsap.to(el, { x: dx * k, y: dy * k, duration: 0.35, ease: "power2.out" });
    });

    el.addEventListener("mouseleave", () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: EASE_SPRING });
    });
  }

  // ─── 3. ORB PARALLAX (cursor) ───────────────────────────────────────────────
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

  // ─── 4. HERO CARD PARALLAX (cursor) ─────────────────────────────────────────
  function initHeroParallax() {
    if (TOUCH || REDUCED || !HAS_GSAP) return;

    const hero = $(".ls-hero");
    if (!hero) return;

    const layers = [
      { el: $(".hv-card-a"), sx: 0.028, sy: 0.022 },
      { el: $(".hv-card-b"), sx: -0.02, sy: 0.026 },
      { el: $(".hv-card-c"), sx: 0.014, sy: -0.018 },
    ];
    const textLayer = $(".ls-hero-text");

    let busy = false;
    hero.addEventListener("mousemove", (e) => {
      if (busy) return;
      busy = true;
      requestAnimationFrame(() => {
        const cx = hero.clientWidth  / 2;
        const cy = hero.clientHeight / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;

        layers.forEach(({ el, sx, sy }) => {
          if (el) gsap.to(el, { x: dx * sx, y: dy * sy, duration: 0.9, ease: "power2.out", overwrite: "auto" });
        });

        if (textLayer) {
          gsap.to(textLayer, { x: dx * 0.006, y: dy * 0.004, duration: 1.2, ease: "power2.out", overwrite: "auto" });
        }

        busy = false;
      });
    });

    hero.addEventListener("mouseleave", () => {
      layers.forEach(({ el }) => {
        if (el) gsap.to(el, { x: 0, y: 0, duration: 1.2, ease: EASE_SPRING });
      });
      if (textLayer) gsap.to(textLayer, { x: 0, y: 0, duration: 1.2, ease: EASE_SPRING });
    });
  }

  // ─── 5. SPOTLIGHT (cursor glow inside panels) ───────────────────────────────
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

  // ─── 6. 3D TILT ─────────────────────────────────────────────────────────────
  const _tilted = new WeakSet();

  function applyTilt(el, deg = 4) {
    if (_tilted.has(el) || TOUCH || REDUCED || !HAS_GSAP) return;
    _tilted.add(el);

    el.style.transformStyle = "preserve-3d";

    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      gsap.to(el, { rotateY: x * deg, rotateX: -y * deg, transformPerspective: 900, duration: 0.45, ease: "power2.out" });
    });

    el.addEventListener("mouseleave", () => {
      gsap.to(el, { rotateX: 0, rotateY: 0, transformPerspective: 900, duration: 0.75, ease: EASE_SPRING });
    });
  }

  // ─── 7. SCROLL TRIGGER REVEALS ──────────────────────────────────────────────
  function initScrollReveal() {
    if (REDUCED || !HAS_GSAP || !HAS_ST) {
      // Fallback: just make all reveal elements visible
      $$(".ls-reveal").forEach((el) => {
        el.style.opacity  = "1";
        el.style.transform = "none";
      });
      return;
    }

    // Feature cards staggered reveal
    gsap.to(".ls-features .ls-reveal:not(.ls-section-headline):not(.ls-eyebrow)", {
      opacity: 1, y: 0,
      duration: 0.65,
      stagger: 0.1,
      ease: EASE_OUT,
      scrollTrigger: {
        trigger: ".ls-features",
        start: "top 78%",
        once: true,
      },
    });

    // Features section headline + eyebrow
    gsap.to(".ls-features .ls-eyebrow, .ls-features .ls-section-headline", {
      opacity: 1, y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: EASE_OUT,
      scrollTrigger: {
        trigger: ".ls-features",
        start: "top 82%",
        once: true,
      },
    });

    // How-it-works headline + eyebrow
    gsap.to(".ls-how .ls-eyebrow, .ls-how .ls-section-headline", {
      opacity: 1, y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: EASE_OUT,
      scrollTrigger: {
        trigger: ".ls-how",
        start: "top 80%",
        once: true,
      },
    });

    // Steps staggered
    gsap.to(".ls-step", {
      opacity: 1, y: 0,
      duration: 0.65,
      stagger: 0.14,
      ease: EASE_OUT,
      scrollTrigger: {
        trigger: ".ls-how",
        start: "top 72%",
        once: true,
      },
    });

    // Auth section reveal
    gsap.fromTo(
      ".ls-auth .ls-eyebrow, .ls-auth-headline",
      { opacity: 0, y: 24 },
      {
        opacity: 1, y: 0,
        duration: 0.65,
        stagger: 0.1,
        ease: EASE_OUT,
        scrollTrigger: {
          trigger: ".ls-auth",
          start: "top 78%",
          once: true,
        },
      }
    );

    gsap.fromTo(
      ".ls-auth-panel",
      { opacity: 0, y: 40, scale: 0.97 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.8,
        ease: EASE_BACK,
        scrollTrigger: {
          trigger: ".ls-auth",
          start: "top 68%",
          once: true,
        },
      }
    );
  }

  // ─── 8. HERO ENTRANCE ANIMATION ─────────────────────────────────────────────
  function playHeroEntrance() {
    if (REDUCED || !HAS_GSAP) return;
    if (!$(".ls-hero")) return;

    const tl = gsap.timeline({ delay: 0.05 });

    tl.fromTo(".ls-eyebrow",
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.5, ease: EASE_OUT }
    )
    .fromTo(".ls-headline",
      { opacity: 0, y: 28, skewY: 1.5 },
      { opacity: 1, y: 0, skewY: 0, duration: 0.7, ease: EASE_OUT },
      "-=0.3"
    )
    .fromTo(".ls-sub",
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.55, ease: EASE_OUT },
      "-=0.35"
    )
    .fromTo(".ls-cta",
      { opacity: 0, y: 14, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: EASE_BACK },
      "-=0.25"
    )
    .fromTo(".hv-card-a",
      { opacity: 0, x: 36, y: -16 },
      { opacity: 1, x: 0, y: 0, duration: 0.75, ease: EASE_OUT },
      "-=0.55"
    )
    .fromTo(".hv-card-b",
      { opacity: 0, x: 24, y: 24 },
      { opacity: 1, x: 0, y: 0, duration: 0.65, ease: EASE_OUT },
      "-=0.5"
    )
    .fromTo(".hv-card-c",
      { opacity: 0, x: -20, y: 20 },
      { opacity: 1, x: 0, y: 0, duration: 0.65, ease: EASE_OUT },
      "-=0.4"
    )
    .fromTo(".ls-scroll-hint",
      { opacity: 0 },
      { opacity: 1, duration: 0.5 },
      "-=0.15"
    );
  }

  // ─── 9. STICKY TOPBAR ───────────────────────────────────────────────────────
  function initStickyTopbar() {
    const bar = $(".topbar");
    if (!bar) return;
    window.addEventListener("scroll",
      () => bar.classList.toggle("topbar-scrolled", scrollY > 28),
      { passive: true }
    );
  }

  // ─── 10. ERROR SHAKE ────────────────────────────────────────────────────────
  function shake(el) {
    if (!el) return;
    el.classList.remove("motion-shake");
    void el.offsetWidth;
    el.classList.add("motion-shake");
    el.addEventListener("animationend", () => el.classList.remove("motion-shake"), { once: true });
  }

  function hookFeedback() {
    ["#login-feedback", "#signup-feedback"].forEach((sel) => {
      const fb = $(sel);
      if (!fb) return;
      new MutationObserver(() => {
        if (fb.textContent.trim()) shake(fb.closest("form") || fb.parentElement);
      }).observe(fb, { childList: true, characterData: true, subtree: true });
    });
  }

  // ─── 11. STATUS PILL BOUNCE ─────────────────────────────────────────────────
  function hookStatusPill() {
    if (!HAS_GSAP) return;
    const pill = $("#summary-status");
    if (!pill) return;
    let prev = "neutral";
    new MutationObserver(() => {
      const now = pill.classList.contains("good") ? "good"
                : pill.classList.contains("bad")  ? "bad"
                : "neutral";
      if (now !== prev) {
        prev = now;
        gsap.fromTo(pill,
          { scale: 0.75, opacity: 0.3 },
          { scale: 1, opacity: 1, duration: 0.55, ease: EASE_SPRING }
        );
      }
    }).observe(pill, { attributes: true, attributeFilter: ["class"] });
  }

  // ─── 12. INPUT FOCUS MICRO-INTERACTION ──────────────────────────────────────
  function initInputInteractions() {
    if (!HAS_GSAP || REDUCED) return;
    document.addEventListener("focusin", (e) => {
      const label = e.target.closest?.("input, textarea, select")?.closest("label");
      if (label) gsap.to(label, { scale: 1.006, duration: 0.2, ease: "power1.out", transformOrigin: "left center" });
    });
    document.addEventListener("focusout", (e) => {
      const label = e.target.closest?.("input, textarea, select")?.closest("label");
      if (label) gsap.to(label, { scale: 1, duration: 0.3, ease: EASE_SPRING, transformOrigin: "left center" });
    });
  }

  // ─── 13. TOAST GSAP OVERRIDE ────────────────────────────────────────────────
  function hookToast() {
    if (!HAS_GSAP) return;
    const toast = $("#toast");
    if (!toast) return;
    new MutationObserver(() => {
      if (toast.classList.contains("visible")) {
        gsap.fromTo(toast,
          { y: 60, opacity: 0, scale: 0.88 },
          { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: EASE_BACK }
        );
      } else {
        gsap.to(toast, { y: 40, opacity: 0, scale: 0.9, duration: 0.3, ease: "power2.in" });
      }
    }).observe(toast, { attributes: true, attributeFilter: ["class"] });
  }

  // ─── 14. METRIC CARD STAGGER ────────────────────────────────────────────────
  function hookMacroSummary() {
    if (!HAS_GSAP) return;
    const container = $("#macro-summary");
    if (!container) return;
    new MutationObserver(() => {
      const cards = container.querySelectorAll(".metric-card");
      if (!cards.length) return;
      cards.forEach((card, i) => {
        applyTo(card);
        if (!REDUCED) {
          gsap.fromTo(card,
            { opacity: 0, y: 16, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.45, delay: i * 0.08, ease: EASE_BACK }
          );
        }
      });
    }).observe(container, { childList: true });
  }

  // ─── 15. APP-SHELL ENTRANCE (on login) ──────────────────────────────────────
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

  // ─── 16. APPLY EFFECTS TO AN ELEMENT ────────────────────────────────────────
  function applyTo(el) {
    if (!el?.matches) return;
    if (el.matches(".primary-btn, .ghost-btn"))  applyMagnetic(el);
    if (el.matches(".panel, .ls-auth-panel"))    { applySpotlight(el); applyTilt(el, 3.5); }
    if (el.matches(".ls-feature-card"))          { applySpotlight(el); applyTilt(el, 4); }
    if (el.matches(".metric-card"))              applyTilt(el, 6);
    if (el.matches(".history-card"))             { applySpotlight(el); applyTilt(el, 3); }
    if (el.matches(".meal-card"))                applyTilt(el, 2.5);
    if (el.matches(".admin-card"))               applyTilt(el, 3);
  }

  function applySubtree(root) {
    const sel = ".primary-btn,.ghost-btn,.panel,.ls-feature-card,.ls-auth-panel,.metric-card,.history-card,.meal-card,.admin-card";
    root.querySelectorAll?.(sel).forEach(applyTo);
  }

  // ─── 17. MUTATION WATCHER ───────────────────────────────────────────────────
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

  // ─── 18. BOOT ───────────────────────────────────────────────────────────────
  function boot() {
    // Cursor: system default — no custom cursor
    initOrbParallax();
    initHeroParallax();
    initScrollReveal();
    initStickyTopbar();
    initInputInteractions();
    initMutationWatcher();
    initAppShellReveal();
    hookFeedback();
    hookStatusPill();
    hookToast();
    hookMacroSummary();
    applySubtree(document);
    playHeroEntrance();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
