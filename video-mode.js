/**
 * PAS-19 — Video / render quality mode for player & companion surfaces.
 * Shared presets for encounter stage, white-room, and roster portrait stages.
 * High prefers live 3D; Performance falls back to static stills.
 */
(function () {
  const KEY = "planesbound-video-mode-v1";
  const MODES = {
    high: {
      id: "high",
      label: "High",
      pixelRatioCap: 2,
      antialias: true,
      shadows: true,
      shadowMap: 2048,
      portrait3d: true,
      portraitDprCap: 2,
    },
    balanced: {
      id: "balanced",
      label: "Balanced",
      pixelRatioCap: 1.5,
      antialias: true,
      shadows: true,
      shadowMap: 1024,
      portrait3d: true,
      portraitDprCap: 1.25,
    },
    performance: {
      id: "performance",
      label: "Performance",
      pixelRatioCap: 1,
      antialias: false,
      shadows: false,
      shadowMap: 512,
      portrait3d: false,
      portraitDprCap: 1,
    },
  };

  /** @type {keyof typeof MODES} */
  let current = "balanced";
  /** @type {Map<string, any>} */
  const portraits = new Map();
  /** Per-role mount generation — invalidate overlapping async boots */
  const mountGen = { player: 0, companion: 0 };
  let listenersWired = false;
  let bootArmed = false;

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function detectDefault() {
    try {
      const cores = navigator.hardwareConcurrency || 4;
      const mem = navigator.deviceMemory || 4;
      if (cores <= 2 || mem <= 2) return "performance";
      if (cores >= 8 && mem >= 8) return "high";
    } catch (_) {
      /* ignore */
    }
    return "balanced";
  }

  function load() {
    const raw = localStorage.getItem(KEY);
    if (raw && MODES[raw]) current = raw;
    else current = detectDefault();
    return current;
  }

  function getMode() {
    return MODES[current] || MODES.balanced;
  }

  function getId() {
    return current;
  }

  function setMode(id) {
    if (!MODES[id]) return getMode();
    current = id;
    localStorage.setItem(KEY, id);
    document.documentElement.dataset.videoMode = id;
    document.dispatchEvent(
      new CustomEvent("planesbound-video-mode", { detail: { id, mode: getMode() } })
    );
    refreshPortraitStages();
    syncSelects();
    return getMode();
  }

  function applyRenderer(renderer, THREE) {
    const mode = getMode();
    const dpr = Math.min(window.devicePixelRatio || 1, mode.pixelRatioCap);
    renderer.setPixelRatio(dpr);
    if ("antialias" in renderer) {
      /* antialias is constructor-only; callers pass it at create time */
    }
    if (renderer.shadowMap) {
      renderer.shadowMap.enabled = !!mode.shadows;
      if (THREE?.PCFSoftShadowMap) {
        renderer.shadowMap.type = mode.shadows ? THREE.PCFSoftShadowMap : THREE.BasicShadowMap;
      }
    }
    return { dpr, mode };
  }

  function rendererOpts() {
    const mode = getMode();
    return { antialias: !!mode.antialias, alpha: true, powerPreference: mode.id === "high" ? "high-performance" : "default" };
  }

  function syncSelects() {
    document.querySelectorAll("[data-video-mode-select]").forEach((sel) => {
      if (sel.value !== current) sel.value = current;
    });
    document.querySelectorAll("[data-video-mode-label]").forEach((el) => {
      el.textContent = getMode().label;
    });
  }

  function ensureSelectOptions(sel) {
    if (!sel || sel.dataset.filled === "1") return;
    sel.innerHTML = Object.values(MODES)
      .map((m) => `<option value="${m.id}">${m.label}</option>`)
      .join("");
    sel.dataset.filled = "1";
    sel.value = current;
  }

  function wireUi() {
    if (listenersWired) return;
    listenersWired = true;
    document.addEventListener("change", (e) => {
      const sel = e.target?.closest?.("[data-video-mode-select]");
      if (!sel) return;
      setMode(sel.value);
    });
    document.addEventListener("planesbound-beings-changed", () => {
      refreshPortraitStages();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pausePortraits();
      else resumePortraits();
    });
  }

  function pausePortraits() {
    portraits.forEach((p) => {
      p.paused = true;
    });
  }

  function resumePortraits() {
    portraits.forEach((p) => {
      const wasPaused = !!p.paused;
      p.paused = false;
      // Loop keeps scheduling while paused; reset dt baseline on resume
      if (wasPaused) p.last = performance.now();
    });
  }

  /**
   * Roster avatar mounts (PAS-30).
   * Always show the selected being's race art still. Generic GLB busts hid the
   * 420-roster identity; encounter stages still use WoW actors separately.
   */
  async function mountPortrait(role) {
    const screen = document.querySelector(`.being-card--${role} .being-screen`);
    const img = document.getElementById(`${role}BeingPortrait`);
    if (!screen || !img) return null;

    const existing = portraits.get(role);
    if (existing) {
      try {
        existing.dispose();
      } catch (_) {
        /* ignore */
      }
      portraits.delete(role);
    }

    screen.querySelectorAll(".being-portrait-stage").forEach((node) => node.remove());

    const being =
      role === "companion"
        ? window.PlanesboundBeings?.getCompanion?.()
        : window.PlanesboundBeings?.getPlayer?.();
    const Beings = window.PlanesboundBeings;
    if (Beings?.applyPortrait) Beings.applyPortrait(img, being);
    else if (being) {
      img.src = Beings?.artSrc?.(being) || `art/races/${being.id || "human"}.png`;
      img.dataset.being = being.id || "";
      img.hidden = false;
    }

    img.hidden = false;
    // Force visible still even if a prior stage3d CSS rule left opacity 0.
    screen.dataset.videoPath = "still";
    return null;
  }

  function refreshPortraitStages() {
    ["player", "companion"].forEach((role) => {
      mountPortrait(role);
    });
  }

  function init() {
    load();
    document.documentElement.dataset.videoMode = current;
    wireUi();
    document.querySelectorAll("[data-video-mode-select]").forEach(ensureSelectOptions);
    syncSelects();
    // Single boot path — avoid event + timeout double-mount race (Bugbot #1)
    const boot = () => {
      if (bootArmed) return;
      bootArmed = true;
      ensureSelectOptions(document.querySelector("[data-video-mode-select]"));
      syncSelects();
      refreshPortraitStages();
    };
    if (window.PlanesboundWowActors && window.PlanesboundBeings) {
      boot();
    } else {
      document.addEventListener("planesbound-beings-ready", boot, { once: true });
      setTimeout(() => {
        if (!bootArmed && window.PlanesboundWowActors) boot();
      }, 800);
    }
  }

  window.PlanesboundVideoMode = {
    KEY,
    MODES,
    load,
    getMode,
    getId,
    setMode,
    applyRenderer,
    rendererOpts,
    refreshPortraitStages,
    mountPortrait,
    init,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
