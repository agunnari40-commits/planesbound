/**
 * PAS-14 — Planesbound art-in-motion
 * Dreamy CSS loops on still frames + pause when offscreen / reduced-motion.
 */
(function () {
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)");

  const IMG_RULES = [
    { sel: "img.hero-art", kind: "hero", host: true },
    { sel: "img.being-screen-art", kind: "panel", host: true },
    { sel: ".being-portrait img", kind: "portrait", host: true },
    { sel: "img.sheet-portrait", kind: "portrait", host: true },
    { sel: "img.game-hud-portrait", kind: "portrait", host: true },
    { sel: "img.thumb", kind: "thumb", host: false },
    { sel: "img.being-thumb", kind: "thumb", host: false },
    { sel: ".white-room-standee-plate", kind: "standee", host: true },
    // Emblem uses centered kenburns (keeps translateX(-50%))
    { sel: ".white-room-standee-emblem", kind: "emblem", host: true },
  ];

  const BG_RULES = [
    // Single-layer photo art — position drift is safe
    // Map: overlay-only motion — never pan/zoom bg (hotspots are % of the box)
    { sel: ".map", cls: "art-live-bg art-live-bg--map art-live-host art-live-host--map" },
    { sel: ".quest-art", cls: "art-live-bg art-live-bg--photo art-live-bg--quest art-live-host art-live-host--hero" },
    { sel: ".game-scene", cls: "art-live-bg art-live-bg--photo art-live-bg--scene art-live-veil" },
    { sel: ".white-room-fallback", cls: "art-live-bg art-live-bg--photo art-live-bg--scene art-live-veil" },
    { sel: ".companion-banner", cls: "art-live-bg art-live-bg--photo art-live-bg--quest" },
    // Multi-layer chrome — shim under content (never filter the whole panel)
    { sel: ".game-start", cls: "art-live-bg art-live-bg--layered", shim: true },
    { sel: ".game-hud", cls: "art-live-bg art-live-bg--layered", shim: true },
    { sel: ".game-side[data-theme=\"astral\"]", cls: "art-live-bg art-live-bg--layered", shim: true },
    { sel: ".races-dock", cls: "art-live-bg art-live-bg--layered art-live-bg--dock", shim: true },
    { sel: ".companion-sheet", cls: "art-live-bg art-live-bg--layered", shim: true },
    { sel: ".sheet-frame", cls: "art-live-veil" },
  ];

  const LIVE_SEL = ".art-live, .art-live-bg, .art-live-host, .art-live-veil";
  const watched = new WeakSet();
  let io = null;

  function prefersReduced() {
    return REDUCED.matches;
  }

  function ensureHost(el, kind) {
    const parent = el.parentElement;
    if (!parent) return;
    if (parent.classList.contains("art-live-host")) {
      parent.classList.add(`art-live-host--${kind}`);
      return;
    }
    const overflowHost =
      parent.classList.contains("being-portrait") ||
      parent.classList.contains("hero") ||
      parent.classList.contains("white-room-figure-stage") ||
      parent.classList.contains("white-room-standee") ||
      getComputedStyle(parent).overflow === "hidden";
    if (overflowHost) {
      parent.classList.add("art-live-host", `art-live-host--${kind}`);
      return;
    }
    parent.classList.add("art-live-host", `art-live-host--${kind}`);
  }

  function markLive(el, kind) {
    if (!el || el.dataset.artLive === "1") return;
    el.dataset.artLive = "1";
    el.classList.add("art-live", `art-live--${kind}`);
    if (!prefersReduced()) observe(el);
  }

  function observe(el) {
    if (!io || watched.has(el)) return;
    watched.add(el);
    io.observe(el);
  }

  function enhance(root) {
    const scope = root && root.querySelectorAll ? root : document;
    if (prefersReduced()) return;

    for (const rule of IMG_RULES) {
      scope.querySelectorAll(rule.sel).forEach((el) => {
        markLive(el, rule.kind);
        if (rule.host) ensureHost(el, rule.kind);
        const host = el.closest(".art-live-host");
        if (host && !watched.has(host)) observe(host);
      });
    }

    for (const rule of BG_RULES) {
      scope.querySelectorAll(rule.sel).forEach((el) => {
        if (el.dataset.artBg === "1") {
          if (rule.shim) ensureBgShim(el);
          return;
        }
        el.dataset.artBg = "1";
        rule.cls.split(/\s+/).forEach((c) => el.classList.add(c));
        if (rule.shim) ensureBgShim(el);
        observe(el);
      });
    }
  }

  /** Background-only motion layer — z-index -1 so labels/buttons stay unfiltered. */
  function ensureBgShim(el) {
    if (!el || el.querySelector(":scope > .art-live-bg-shim")) return;
    const shim = document.createElement("span");
    shim.className = "art-live-bg-shim";
    shim.setAttribute("aria-hidden", "true");
    el.insertBefore(shim, el.firstChild);
  }

  function setPaused(el, paused) {
    el.dataset.artPaused = paused ? "true" : "false";
    const host = el.closest?.(".art-live-host");
    if (host) host.dataset.artPaused = paused ? "true" : "false";
  }

  function isInViewport(el) {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.right > 0 && r.top < (window.innerHeight || 0) && r.left < (window.innerWidth || 0);
  }

  /** Recompute pause from tab visibility + reduced-motion + viewport. */
  function syncPauseState() {
    const forcePause = document.hidden || prefersReduced();
    document.querySelectorAll(LIVE_SEL).forEach((el) => {
      if (forcePause) setPaused(el, true);
      else setPaused(el, !isInViewport(el));
    });
  }

  function bootObserver() {
    if (io) return;
    io = new IntersectionObserver(
      (entries) => {
        if (document.hidden || prefersReduced()) return;
        for (const entry of entries) {
          setPaused(entry.target, !entry.isIntersecting);
        }
      },
      { root: null, rootMargin: "40px", threshold: 0.02 }
    );
  }

  function onVisibility() {
    if (document.hidden || prefersReduced()) {
      document.querySelectorAll(LIVE_SEL).forEach((el) => setPaused(el, true));
      return;
    }
    // Tab visible again — clear freeze and re-sync with viewport
    enhance(document);
    syncPauseState();
  }

  function boot() {
    bootObserver();
    enhance(document);
    syncPauseState();

    const mo = new MutationObserver((mutations) => {
      if (prefersReduced()) return;
      let needs = false;
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length) {
          needs = true;
          break;
        }
      }
      if (needs) {
        enhance(document);
        syncPauseState();
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    REDUCED.addEventListener?.("change", () => {
      if (prefersReduced()) {
        document.querySelectorAll(LIVE_SEL).forEach((el) => setPaused(el, true));
      } else {
        enhance(document);
        syncPauseState();
      }
    });
    document.addEventListener("visibilitychange", onVisibility);
  }

  window.PlanesboundArtMotion = {
    enhance,
    prefersReduced,
    refresh: () => {
      enhance(document);
      syncPauseState();
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
