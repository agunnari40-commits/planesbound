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
    { sel: ".white-room-standee-emblem", kind: "portrait", host: true },
  ];

  const BG_RULES = [
    { sel: ".map", cls: "art-live-bg art-live-bg--map art-live-host art-live-host--map" },
    { sel: ".quest-art", cls: "art-live-bg art-live-bg--quest art-live-host art-live-host--hero" },
    { sel: ".game-scene", cls: "art-live-bg art-live-bg--scene art-live-veil" },
    { sel: ".game-start", cls: "art-live-bg art-live-bg--hud" },
    { sel: ".game-hud", cls: "art-live-bg art-live-bg--hud" },
    { sel: ".game-side[data-theme=\"astral\"]", cls: "art-live-bg art-live-bg--hud" },
    { sel: ".races-dock", cls: "art-live-bg art-live-bg--dock" },
    { sel: ".white-room-fallback", cls: "art-live-bg art-live-bg--scene art-live-veil" },
    { sel: ".companion-sheet", cls: "art-live-bg art-live-bg--hud" },
    { sel: ".companion-banner", cls: "art-live-bg art-live-bg--quest" },
    { sel: ".sheet-frame", cls: "art-live-veil" },
  ];

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
    // Prefer existing overflow hosts (portrait circles, hero frames)
    const overflowHost =
      parent.classList.contains("being-portrait") ||
      parent.classList.contains("hero") ||
      parent.classList.contains("white-room-figure-stage") ||
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
        // Also pause host with the image
        const host = el.closest(".art-live-host");
        if (host && !watched.has(host)) observe(host);
      });
    }

    for (const rule of BG_RULES) {
      scope.querySelectorAll(rule.sel).forEach((el) => {
        if (el.dataset.artBg === "1") return;
        el.dataset.artBg = "1";
        rule.cls.split(/\s+/).forEach((c) => el.classList.add(c));
        observe(el);
      });
    }
  }

  function setPaused(el, paused) {
    el.dataset.artPaused = paused ? "true" : "false";
    const host = el.closest?.(".art-live-host");
    if (host) host.dataset.artPaused = paused ? "true" : "false";
  }

  function bootObserver() {
    if (io) return;
    io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setPaused(entry.target, !entry.isIntersecting);
        }
      },
      { root: null, rootMargin: "40px", threshold: 0.02 }
    );
  }

  function onVisibility() {
    const paused = document.hidden || prefersReduced();
    document.querySelectorAll(".art-live, .art-live-bg, .art-live-host, .art-live-veil").forEach((el) => {
      if (paused) el.dataset.artPaused = "true";
      else if (el.dataset.artPaused === "true" && !el.classList.contains("art-live")) {
        // keep IO-driven pause for offscreen; refresh will re-sync
      }
    });
    if (!paused) enhance(document);
  }

  function boot() {
    bootObserver();
    enhance(document);

    // Dynamic folio / game / sheets / races re-render
    const mo = new MutationObserver((mutations) => {
      if (prefersReduced()) return;
      let needs = false;
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length) {
          needs = true;
          break;
        }
      }
      if (needs) enhance(document);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    REDUCED.addEventListener?.("change", () => {
      if (prefersReduced()) {
        document.querySelectorAll(".art-live, .art-live-bg").forEach((el) => {
          el.dataset.artPaused = "true";
        });
      } else {
        enhance(document);
      }
    });
    document.addEventListener("visibilitychange", onVisibility);
  }

  window.PlanesboundArtMotion = {
    enhance,
    prefersReduced,
    refresh: () => enhance(document),
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
