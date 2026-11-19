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
  let listenersWired = false;

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
      p.paused = false;
      if (!p.animId) p.tick?.(performance.now());
    });
  }

  /**
   * Mini 3D stage inside player/companion roster screens.
   * Falls back to static race art when Performance mode or WebGL fails.
   */
  async function mountPortrait(role) {
    const screen = document.querySelector(`.being-card--${role} .being-screen`);
    const img = document.getElementById(`${role}BeingPortrait`);
    if (!screen || !img) return null;

    const existing = portraits.get(role);
    if (existing) {
      existing.dispose();
      portraits.delete(role);
    }

    const mode = getMode();
    let canvas = screen.querySelector(".being-portrait-stage");
    if (!mode.portrait3d) {
      if (canvas) canvas.remove();
      img.hidden = false;
      screen.dataset.videoPath = "still";
      return null;
    }

    const Wow = window.PlanesboundWowActors;
    if (!Wow?.createActor) {
      img.hidden = false;
      screen.dataset.videoPath = "still";
      return null;
    }

    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.className = "being-portrait-stage";
      canvas.setAttribute("aria-hidden", "true");
      const wrap = img.closest(".being-portrait") || screen;
      wrap.appendChild(canvas);
    }

    try {
      const T = await Wow.loadThree();
      const opts = rendererOpts();
      const renderer = new T.WebGLRenderer({
        canvas,
        antialias: opts.antialias,
        alpha: true,
        powerPreference: opts.powerPreference,
      });
      applyRenderer(renderer, T);
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = T.SRGBColorSpace;

      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(32, 1, 0.1, 40);
      // Static framed bust — no camera bob
      camera.position.set(0, 1.45, 2.55);
      camera.lookAt(0, 1.15, 0);

      scene.add(new T.HemisphereLight(0xc4d0ff, 0x1a1208, 0.75));
      const key = new T.DirectionalLight(0xfff6ea, 1.05);
      key.position.set(2.2, 4, 3);
      scene.add(key);
      const fill = new T.DirectionalLight(role === "companion" ? 0x7eb0c8 : 0xc5a059, 0.4);
      fill.position.set(-2.5, 2, -1);
      scene.add(fill);

      const modelUrl = role === "companion" ? Wow.MODEL.companion : Wow.MODEL.player;
      const being =
        role === "companion"
          ? window.PlanesboundBeings?.getCompanion?.()
          : window.PlanesboundBeings?.getPlayer?.();
      const actor = await Wow.createActor({
        id: `portrait-${role}`,
        role,
        url: modelUrl,
        label: being?.name || role,
        tint: role === "companion" ? 0x7eb0c8 : 0xc5a059,
        x: 0,
        z: 0,
        scale: 1.05,
      });
      actor.root.rotation.y = role === "companion" ? -0.2 : 0.2;
      scene.add(actor.root);
      actor.play("idle");

      let disposed = false;
      let paused = document.hidden;
      let animId = 0;
      let last = performance.now();

      function resize() {
        if (disposed) return;
        const parent = canvas.parentElement;
        const r = parent?.getBoundingClientRect?.() || canvas.getBoundingClientRect();
        const w = Math.max(64, r.width || 128);
        const h = Math.max(64, r.height || 128);
        const dpr = Math.min(window.devicePixelRatio || 1, mode.portraitDprCap);
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(dpr);
        renderer.setSize(w, h, false);
      }
      resize();

      function tick(now) {
        if (disposed) return;
        animId = requestAnimationFrame(tick);
        if (paused) return;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        actor.update(dt);
        // Subtle idle presence without camera motion
        if (!prefersReducedMotion()) {
          actor.root.rotation.y = (role === "companion" ? -0.2 : 0.2) + Math.sin(now * 0.0006) * 0.04;
        }
        renderer.render(scene, camera);
      }
      animId = requestAnimationFrame(tick);

      const handle = {
        paused,
        animId,
        tick,
        dispose() {
          disposed = true;
          if (animId) cancelAnimationFrame(animId);
          animId = 0;
          try {
            actor.dispose();
          } catch (_) {
            /* ignore */
          }
          try {
            renderer.dispose();
          } catch (_) {
            /* ignore */
          }
          canvas.remove();
          img.hidden = false;
          screen.dataset.videoPath = "still";
        },
        resize,
      };
      portraits.set(role, handle);
      img.hidden = true;
      screen.dataset.videoPath = "stage3d";
      window.addEventListener("resize", resize);
      const prevDispose = handle.dispose;
      handle.dispose = () => {
        window.removeEventListener("resize", resize);
        prevDispose();
      };
      return handle;
    } catch (err) {
      console.warn("Portrait stage unavailable", err);
      if (canvas) canvas.remove();
      img.hidden = false;
      screen.dataset.videoPath = "still";
      return null;
    }
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
    // Defer portrait boots until actors + beings are ready
    const boot = () => {
      ensureSelectOptions(document.querySelector("[data-video-mode-select]"));
      syncSelects();
      refreshPortraitStages();
    };
    if (window.PlanesboundWowActors && window.PlanesboundBeings) boot();
    else {
      document.addEventListener("planesbound-beings-ready", boot, { once: true });
      // Fallback if beings event already fired
      setTimeout(boot, 800);
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
