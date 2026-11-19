/**
 * PAS-9/12 — White room stage: static in space; click to enter creation display.
 */
(function () {
  let layer = null;
  let canvas = null;
  let fallback = null;
  let renderer = null;
  let scene = null;
  let camera = null;
  let controls = null;
  let animId = 0;
  let open = false;
  let THREE = null;
  /** Monotonic boot generation — Esc / re-open invalidates in-flight boots. */
  let bootGeneration = 0;
  let openingInFlight = false;
  /** @type {"exterior"|"interior"} */
  let viewMode = "exterior";
  let roomPickables = [];
  let raycaster = null;
  let pointerDown = null;
  let enterAnim = null;
  const keys = new Set();
  const clock = { last: 0 };

  function isBootCurrent(gen) {
    return open && gen === bootGeneration;
  }

  /** Live-scene gate for enter/exit — avoids stale bootGeneration races after teardown/re-open. */
  function isLiveBoot(gen) {
    return open && !!scene && scene.userData?.bootGen === gen && !!camera && !!controls;
  }

  function setHudMode(mode) {
    viewMode = mode;
    const sub = document.querySelector(".white-room-sub");
    const help = document.getElementById("whiteRoomHelp");
    const labels = document.getElementById("whiteRoomLabels");
    if (mode === "exterior") {
      if (sub) {
        sub.textContent =
          "A luminous chamber hangs in the Astral void. Click it to step inside the creation display.";
      }
      if (help) help.textContent = "Drag to look · Click the white room to enter · Esc to leave";
      if (labels) labels.style.opacity = "0";
      layer?.setAttribute("data-mode", "exterior");
    } else {
      if (sub) {
        sub.textContent =
          "Inside the white room — Player and Companion stand ready for the planes.";
      }
      if (help) help.textContent = "Drag to look · WASD / arrows to roam · Esc returns to space";
      if (labels) labels.style.opacity = "1";
      layer?.setAttribute("data-mode", "interior");
    }
  }

  function ensureDom() {
    if (layer) return;
    layer = document.createElement("div");
    layer.className = "white-room-layer";
    layer.id = "whiteRoomLayer";
    layer.setAttribute("data-open", "false");
    layer.setAttribute("data-mode", "exterior");
    layer.innerHTML = `
      <canvas class="white-room-canvas" id="whiteRoomCanvas" tabindex="0" aria-label="White room in space"></canvas>
      <div class="white-room-fallback" id="whiteRoomFallback" data-on="false" aria-hidden="true">
        <div class="white-room-fallback-stage" id="whiteRoomFallbackStage"></div>
      </div>
      <div class="white-room-hud">
        <div class="white-room-top">
          <div>
            <p class="white-room-kicker">Planesbound · after creation</p>
            <h2 class="white-room-title">The White Room</h2>
            <p class="white-room-sub">A luminous chamber hangs in the Astral void. Click it to step inside the creation display.</p>
          </div>
          <button type="button" class="white-room-exit" id="whiteRoomExit">Leave · Esc</button>
        </div>
        <p class="white-room-help" id="whiteRoomHelp">Drag to look · Click the white room to enter · Esc to leave</p>
        <div class="white-room-labels" id="whiteRoomLabels" aria-hidden="true" style="opacity:0"></div>
      </div>`;
    document.body.appendChild(layer);
    canvas = document.getElementById("whiteRoomCanvas");
    fallback = document.getElementById("whiteRoomFallback");
    document.getElementById("whiteRoomExit").addEventListener("click", close);
  }

  function party() {
    const playerSheet = window.PlanesboundSheets?.get?.("player");
    const companionSheet = window.PlanesboundSheets?.get?.("companion");
    const playerBeing = window.PlanesboundBeings?.getPlayer?.();
    const companionBeing = window.PlanesboundBeings?.getCompanion?.();
    return {
      player: {
        name: playerSheet?.name || "Player",
        race: playerSheet?.raceName || playerBeing?.name || "Human",
        raceId: playerSheet?.raceId || playerBeing?.id || "human",
        className: playerSheet?.className || "Adventurer",
        art: `art/races/${playerSheet?.raceId || playerBeing?.id || "human"}.png`,
      },
      companion: {
        name: companionSheet?.name || "Companion",
        race: companionSheet?.raceName || companionBeing?.name || "Human",
        raceId: companionSheet?.raceId || companionBeing?.id || "human",
        className: companionSheet?.className || "Counsel",
        art: `art/races/${companionSheet?.raceId || companionBeing?.id || "human"}.png`,
      },
    };
  }

  function updateLabels(p) {
    const el = document.getElementById("whiteRoomLabels");
    if (!el) return;
    el.innerHTML = `
      <div class="white-room-label"><strong>${escapeHtml(p.player.name)}</strong><span>${escapeHtml(p.player.race)} · ${escapeHtml(p.player.className)}</span></div>
      <div class="white-room-label"><strong>${escapeHtml(p.companion.name)}</strong><span>${escapeHtml(p.companion.race)} · ${escapeHtml(p.companion.className)}</span></div>`;
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showFallback(p) {
    fallback.dataset.on = "true";
    canvas.style.display = "none";
    setHudMode("exterior");
    document.getElementById("whiteRoomHelp").textContent =
      "2.5D · Click the white room to enter · Esc to leave";
    const stage = document.getElementById("whiteRoomFallbackStage");
    stage.innerHTML = `
      <button type="button" class="white-room-space-card" id="fallbackEnterRoom" aria-label="Enter the white room">
        <span class="white-room-space-card-kicker">Floating in space</span>
        <span class="white-room-space-card-room" aria-hidden="true"></span>
        <span class="white-room-space-card-cta">Click to enter</span>
      </button>
      <div class="white-room-fallback-interior" id="fallbackInterior" hidden>
        <figure class="white-room-figure">
          <div class="white-room-standee">
            <img class="white-room-standee-plate" src="art/figure-player.png" alt="" width="220" height="330" />
            <img class="white-room-standee-emblem" src="${p.player.art}" alt="" width="96" height="96" onerror="this.src='art/races/human.png'" />
          </div>
          <figcaption>${escapeHtml(p.player.name)}<span>${escapeHtml(p.player.race)} · ${escapeHtml(p.player.className)}</span></figcaption>
        </figure>
        <figure class="white-room-figure white-room-figure--companion">
          <div class="white-room-standee">
            <img class="white-room-standee-plate" src="art/figure-companion.png" alt="" width="220" height="330" />
            <img class="white-room-standee-emblem" src="${p.companion.art}" alt="" width="96" height="96" onerror="this.src='art/races/human.png'" />
          </div>
          <figcaption>${escapeHtml(p.companion.name)}<span>${escapeHtml(p.companion.race)} · ${escapeHtml(p.companion.className)}</span></figcaption>
        </figure>
      </div>`;
    document.getElementById("fallbackEnterRoom")?.addEventListener("click", () => {
      const card = document.getElementById("fallbackEnterRoom");
      const interior = document.getElementById("fallbackInterior");
      if (card) card.hidden = true;
      if (interior) interior.hidden = false;
      setHudMode("interior");
    });
  }

  /** 2.5D: Esc from interior returns to the space card (not full leave). */
  function returnFallbackToSpace() {
    const card = document.getElementById("fallbackEnterRoom");
    const interior = document.getElementById("fallbackInterior");
    if (interior) interior.hidden = true;
    if (card) card.hidden = false;
    setHudMode("exterior");
    document.getElementById("whiteRoomHelp").textContent =
      "2.5D · Click the white room to enter · Esc to leave";
  }

  async function loadThree() {
    if (THREE) return THREE;
    const mod = await import("https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js");
    THREE = mod;
    return THREE;
  }

  /** Lightweight orbit/pan without OrbitControls (avoids bare 'three' specifier). */
  function attachLookControls(cam, target, dom, opts) {
    const minR = opts?.minR ?? 3;
    const maxR = opts?.maxR ?? 40;
    const state = {
      dragging: false,
      moved: false,
      mode: "orbit",
      lx: 0,
      ly: 0,
      sx: 0,
      sy: 0,
      enabled: true,
      minR,
      maxR,
      spherical: {
        radius: opts?.radius ?? 16,
        phi: opts?.phi ?? 1.2,
        theta: opts?.theta ?? 0.35,
      },
    };
    const syncFromCam = () => {
      const offset = cam.position.clone().sub(target);
      state.spherical.radius = Math.max(state.minR, Math.min(state.maxR, offset.length()));
      state.spherical.theta = Math.atan2(offset.x, offset.z);
      state.spherical.phi = Math.acos(
        Math.min(1, Math.max(-1, offset.y / Math.max(0.001, state.spherical.radius)))
      );
    };
    const apply = () => {
      const { radius, phi, theta } = state.spherical;
      cam.position.set(
        target.x + radius * Math.sin(phi) * Math.sin(theta),
        target.y + radius * Math.cos(phi),
        target.z + radius * Math.sin(phi) * Math.cos(theta)
      );
      cam.lookAt(target);
    };
    const onDown = (e) => {
      if (!state.enabled) return;
      state.dragging = true;
      state.moved = false;
      state.mode = e.button === 2 || e.shiftKey ? "pan" : "orbit";
      state.lx = e.clientX;
      state.ly = e.clientY;
      state.sx = e.clientX;
      state.sy = e.clientY;
      pointerDown = { x: e.clientX, y: e.clientY, t: performance.now() };
      dom.setPointerCapture?.(e.pointerId);
    };
    const onMove = (e) => {
      if (!state.dragging || !state.enabled) return;
      const dx = e.clientX - state.lx;
      const dy = e.clientY - state.ly;
      state.lx = e.clientX;
      state.ly = e.clientY;
      if (Math.hypot(e.clientX - state.sx, e.clientY - state.sy) > 6) state.moved = true;
      if (state.mode === "pan") {
        const panSpeed = 0.004 * state.spherical.radius;
        const right = new THREE.Vector3();
        const up = new THREE.Vector3(0, 1, 0);
        cam.getWorldDirection(right);
        right.cross(up).normalize();
        const trueUp = new THREE.Vector3()
          .crossVectors(right, cam.getWorldDirection(new THREE.Vector3()).normalize())
          .normalize();
        target.addScaledVector(right, -dx * panSpeed);
        target.addScaledVector(trueUp, dy * panSpeed);
      } else {
        state.spherical.theta -= dx * 0.005;
        state.spherical.phi = Math.min(
          Math.PI * 0.48,
          Math.max(0.12, state.spherical.phi + dy * 0.005)
        );
      }
      apply();
    };
    const onUp = (e) => {
      const wasClick =
        state.dragging &&
        !state.moved &&
        pointerDown &&
        Math.hypot(e.clientX - pointerDown.x, e.clientY - pointerDown.y) < 8 &&
        performance.now() - pointerDown.t < 700;
      state.dragging = false;
      try {
        dom.releasePointerCapture?.(e.pointerId);
      } catch (_) {
        /* ignore */
      }
      if (wasClick && typeof state.onClick === "function") {
        state.onClick(e);
      }
      pointerDown = null;
    };
    const onWheel = (e) => {
      if (!state.enabled) return;
      e.preventDefault();
      state.spherical.radius = Math.min(
        state.maxR,
        Math.max(state.minR, state.spherical.radius * (e.deltaY > 0 ? 1.08 : 0.92))
      );
      apply();
    };
    dom.addEventListener("pointerdown", onDown);
    dom.addEventListener("pointermove", onMove);
    dom.addEventListener("pointerup", onUp);
    dom.addEventListener("pointercancel", onUp);
    dom.addEventListener("wheel", onWheel, { passive: false });
    dom.addEventListener("contextmenu", (e) => e.preventDefault());
    apply();
    return {
      target,
      state,
      apply,
      update() {
        /* no damping — kept for API parity */
      },
      dispose() {
        dom.removeEventListener("pointerdown", onDown);
        dom.removeEventListener("pointermove", onMove);
        dom.removeEventListener("pointerup", onUp);
        dom.removeEventListener("pointercancel", onUp);
        dom.removeEventListener("wheel", onWheel);
      },
      syncFromCam,
      setEnabled(v) {
        state.enabled = !!v;
      },
      setLimits(nextMin, nextMax) {
        state.minR = nextMin;
        state.maxR = nextMax;
        state.spherical.radius = Math.max(nextMin, Math.min(nextMax, state.spherical.radius));
      },
      setSpherical(radius, phi, theta) {
        if (radius != null) state.spherical.radius = radius;
        if (phi != null) state.spherical.phi = phi;
        if (theta != null) state.spherical.theta = theta;
        apply();
      },
      setOnClick(fn) {
        state.onClick = fn;
      },
    };
  }

  function loadSpaceSky(T, onOk) {
    const loader = new T.TextureLoader();
    loader.load(
      "art/space-sky.png",
      (tex) => {
        tex.colorSpace = T.SRGBColorSpace;
        tex.mapping = T.EquirectangularReflectionMapping;
        onOk(tex);
      },
      undefined,
      () => onOk(null)
    );
  }

  /** Procedural luminous surface maps — soft grain + glow, not flat fills. */
  function makeChamberMaps(T) {
    const size = 512;
    const wallCanvas = document.createElement("canvas");
    wallCanvas.width = wallCanvas.height = size;
    const wctx = wallCanvas.getContext("2d");
    const wallGrad = wctx.createLinearGradient(0, 0, 0, size);
    wallGrad.addColorStop(0, "#ffffff");
    wallGrad.addColorStop(0.35, "#f7f5f2");
    wallGrad.addColorStop(0.7, "#efece7");
    wallGrad.addColorStop(1, "#e6e2db");
    wctx.fillStyle = wallGrad;
    wctx.fillRect(0, 0, size, size);
    // Fine porcelain grain
    const wallImg = wctx.getImageData(0, 0, size, size);
    for (let i = 0; i < wallImg.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 14;
      wallImg.data[i] = Math.min(255, Math.max(0, wallImg.data[i] + n));
      wallImg.data[i + 1] = Math.min(255, Math.max(0, wallImg.data[i + 1] + n * 0.95));
      wallImg.data[i + 2] = Math.min(255, Math.max(0, wallImg.data[i + 2] + n * 0.85));
    }
    wctx.putImageData(wallImg, 0, 0);
    // Soft vertical cove highlight
    const cove = wctx.createLinearGradient(0, 0, 0, size);
    cove.addColorStop(0, "rgba(255,255,255,0.55)");
    cove.addColorStop(0.12, "rgba(255,255,255,0)");
    cove.addColorStop(0.88, "rgba(255,255,255,0)");
    cove.addColorStop(1, "rgba(245,240,230,0.28)");
    wctx.fillStyle = cove;
    wctx.fillRect(0, 0, size, size);

    const floorCanvas = document.createElement("canvas");
    floorCanvas.width = floorCanvas.height = size;
    const fctx = floorCanvas.getContext("2d");
    const floorGrad = fctx.createRadialGradient(size * 0.5, size * 0.55, size * 0.05, size * 0.5, size * 0.5, size * 0.72);
    floorGrad.addColorStop(0, "#ffffff");
    floorGrad.addColorStop(0.4, "#f4f1ec");
    floorGrad.addColorStop(0.78, "#e8e4dd");
    floorGrad.addColorStop(1, "#d9d4cb");
    fctx.fillStyle = floorGrad;
    fctx.fillRect(0, 0, size, size);
    const floorImg = fctx.getImageData(0, 0, size, size);
    for (let i = 0; i < floorImg.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 10;
      floorImg.data[i] = Math.min(255, Math.max(0, floorImg.data[i] + n));
      floorImg.data[i + 1] = Math.min(255, Math.max(0, floorImg.data[i + 1] + n));
      floorImg.data[i + 2] = Math.min(255, Math.max(0, floorImg.data[i + 2] + n * 0.9));
    }
    fctx.putImageData(floorImg, 0, 0);

    const emisCanvas = document.createElement("canvas");
    emisCanvas.width = emisCanvas.height = size;
    const ectx = emisCanvas.getContext("2d");
    ectx.fillStyle = "#1a1a1a";
    ectx.fillRect(0, 0, size, size);
    const eg = ectx.createLinearGradient(0, 0, 0, size);
    eg.addColorStop(0, "#ffffff");
    eg.addColorStop(0.18, "#6a6a6a");
    eg.addColorStop(0.5, "#2a2a2a");
    eg.addColorStop(0.85, "#505050");
    eg.addColorStop(1, "#c8c0b0");
    ectx.fillStyle = eg;
    ectx.fillRect(0, 0, size, size);

    const wallMap = new T.CanvasTexture(wallCanvas);
    wallMap.colorSpace = T.SRGBColorSpace;
    wallMap.anisotropy = 8;
    const floorMap = new T.CanvasTexture(floorCanvas);
    floorMap.colorSpace = T.SRGBColorSpace;
    floorMap.anisotropy = 8;
    const emisMap = new T.CanvasTexture(emisCanvas);
    emisMap.colorSpace = T.SRGBColorSpace;
    return { wallMap, floorMap, emisMap };
  }

  /** Hollow luminous chamber in the Astral void (open front, static). */
  function buildChamber(T) {
    const group = new T.Group();
    const pickables = [];
    const W = 9;
    const H = 5.2;
    const D = 9;
    const maps = makeChamberMaps(T);
    const wallMat = new T.MeshStandardMaterial({
      map: maps.wallMap,
      color: 0xffffff,
      roughness: 0.28,
      metalness: 0.04,
      emissive: 0xffffff,
      emissiveMap: maps.emisMap,
      emissiveIntensity: 0.42,
      side: T.DoubleSide,
      // Keep porcelain white — high env picks up purple sky tint
      envMapIntensity: 0.35,
    });
    const floorMat = new T.MeshStandardMaterial({
      map: maps.floorMap,
      color: 0xffffff,
      roughness: 0.24,
      metalness: 0.06,
      emissive: 0xf8f4ee,
      emissiveIntensity: 0.2,
      envMapIntensity: 0.4,
    });
    const ceilMat = new T.MeshStandardMaterial({
      map: maps.wallMap,
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.03,
      emissive: 0xffffff,
      emissiveIntensity: 0.52,
      side: T.DoubleSide,
      envMapIntensity: 0.3,
    });

    const addWall = (geo, pos, rot) => {
      const mesh = new T.Mesh(geo, wallMat);
      mesh.position.copy(pos);
      if (rot) mesh.rotation.set(rot.x || 0, rot.y || 0, rot.z || 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.roomPick = true;
      group.add(mesh);
      pickables.push(mesh);
    };

    const floor = new T.Mesh(new T.PlaneGeometry(W, D), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    floor.userData.roomPick = true;
    group.add(floor);
    pickables.push(floor);

    const ceiling = new T.Mesh(new T.PlaneGeometry(W, D), ceilMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = H;
    ceiling.userData.roomPick = true;
    group.add(ceiling);
    pickables.push(ceiling);

    // back, left, right — open toward +Z (camera approaches from +Z)
    addWall(new T.PlaneGeometry(W, H), new T.Vector3(0, H / 2, -D / 2), null);
    addWall(new T.PlaneGeometry(D, H), new T.Vector3(-W / 2, H / 2, 0), { y: Math.PI / 2 });
    addWall(new T.PlaneGeometry(D, H), new T.Vector3(W / 2, H / 2, 0), { y: -Math.PI / 2 });

    // Soft luminous shell — reads as a lit volume from space
    const rim = new T.Mesh(
      new T.BoxGeometry(W + 0.14, H + 0.14, D + 0.14),
      new T.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.35,
        metalness: 0.12,
        emissive: 0xf8f4ee,
        emissiveIntensity: 0.72,
        transparent: true,
        opacity: 0.34,
        side: T.BackSide,
        depthWrite: false,
      })
    );
    rim.position.y = H / 2;
    rim.userData.roomPick = true;
    group.add(rim);
    pickables.push(rim);

    // Outer glow halo (additive feel via soft translucent shell)
    const halo = new T.Mesh(
      new T.BoxGeometry(W + 0.55, H + 0.55, D + 0.55),
      new T.MeshBasicMaterial({
        color: 0xe8eef8,
        transparent: true,
        opacity: 0.11,
        side: T.BackSide,
        depthWrite: false,
      })
    );
    halo.position.y = H / 2;
    group.add(halo);

    // Cove light strips along ceiling edges (interior luminescence)
    const coveMat = new T.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.05,
      emissive: 0xfff8f0,
      emissiveIntensity: 1.1,
    });
    const coveBack = new T.Mesh(new T.BoxGeometry(W * 0.92, 0.04, 0.08), coveMat);
    coveBack.position.set(0, H - 0.08, -D / 2 + 0.06);
    group.add(coveBack);
    const coveL = new T.Mesh(new T.BoxGeometry(0.08, 0.04, D * 0.88), coveMat);
    coveL.position.set(-W / 2 + 0.06, H - 0.08, -0.15);
    group.add(coveL);
    const coveR = coveL.clone();
    coveR.position.x = W / 2 - 0.06;
    group.add(coveR);

    // Transparent volume for reliable click picking (must stay visible for raycasts)
    const pickVolume = new T.Mesh(
      new T.BoxGeometry(W + 0.4, H + 0.4, D + 0.4),
      new T.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
        colorWrite: false,
        side: T.DoubleSide,
      })
    );
    pickVolume.position.y = H / 2;
    pickVolume.userData.roomPick = true;
    group.add(pickVolume);
    pickables.push(pickVolume);

    // Gold threshold at the open front
    const threshold = new T.Mesh(
      new T.BoxGeometry(W * 0.92, 0.06, 0.18),
      new T.MeshStandardMaterial({
        color: 0xc5a059,
        roughness: 0.32,
        metalness: 0.65,
        emissive: 0xc5a059,
        emissiveIntensity: 0.48,
      })
    );
    threshold.position.set(0, 0.03, D / 2 - 0.05);
    threshold.userData.roomPick = true;
    group.add(threshold);
    pickables.push(threshold);

    group.position.y = 0.02;
    return { group, pickables, W, H, D };
  }

  function makeSpriteMaterial(T, url, tint) {
    const loader = new T.TextureLoader();
    const tex = loader.load(url, undefined, undefined, () => {
      tex.image = null;
    });
    tex.colorSpace = T.SRGBColorSpace;
    const mat = new T.SpriteMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      color: tint || 0xffffff,
    });
    return mat;
  }

  function loadTex(T, url, onOk) {
    const loader = new T.TextureLoader();
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = T.SRGBColorSpace;
        onOk(tex);
      },
      undefined,
      () => {
        loader.load("art/races/human.png", (tex) => {
          tex.colorSpace = T.SRGBColorSpace;
          onOk(tex);
        });
      }
    );
  }

  /**
   * Rich figure standee: painted plate + race medallion (no bare cylinders).
   * @param {"player"|"companion"} role
   */
  function makeFigure(T, url, x, tint, role) {
    const group = new T.Group();
    group.position.set(x, 0, 0);

    // Single billboard: plate + emblem + frame share one lookAt (local z stays on the standee)
    const billboard = new T.Group();
    billboard.position.y = 1.85;
    group.add(billboard);
    group.userData.billboard = billboard;

    const plateUrl =
      role === "companion" ? "art/figure-companion.png" : "art/figure-player.png";

    // depthWrite on plate so nearer standees occlude farther ones (no global renderOrder)
    const plateMat = new T.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.55,
      metalness: 0.08,
      transparent: true,
      alphaTest: 0.08,
      side: T.DoubleSide,
      depthWrite: true,
      depthTest: true,
    });
    loadTex(T, plateUrl, (tex) => {
      plateMat.map = tex;
      plateMat.needsUpdate = true;
    });
    const plate = new T.Mesh(new T.PlaneGeometry(2.2, 3.3), plateMat);
    plate.position.set(0, 0, 0);
    plate.castShadow = true;
    billboard.add(plate);

    const emblemMat = new T.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.45,
      metalness: 0.12,
      transparent: true,
      alphaTest: 0.08,
      side: T.DoubleSide,
      depthWrite: true,
      depthTest: true,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    loadTex(T, url, (tex) => {
      emblemMat.map = tex;
      emblemMat.needsUpdate = true;
    });
    // Local to this standee's plate only — depth buffer handles cross-standee occlusion
    const emblem = new T.Mesh(new T.CircleGeometry(0.42, 48), emblemMat);
    emblem.position.set(0, 0.7, 0.02);
    emblem.castShadow = true;
    billboard.add(emblem);

    const ring = new T.Mesh(
      new T.TorusGeometry(0.48, 0.022, 12, 48),
      new T.MeshStandardMaterial({
        color: tint || 0xc5a059,
        roughness: 0.35,
        metalness: 0.5,
        emissive: tint || 0xc5a059,
        emissiveIntensity: 0.4,
        depthWrite: true,
        depthTest: true,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      })
    );
    ring.position.set(0, 0.7, 0.025);
    billboard.add(ring);

    const base = new T.Mesh(
      new T.CylinderGeometry(0.55, 0.7, 0.1, 48),
      new T.MeshStandardMaterial({
        color: 0xe4e4e4,
        roughness: 0.3,
        metalness: 0.15,
        emissive: tint || 0xc5a059,
        emissiveIntensity: 0.08,
      })
    );
    base.position.y = 0.05;
    base.receiveShadow = true;
    base.castShadow = true;
    group.add(base);

    const floorRing = new T.Mesh(
      new T.TorusGeometry(0.78, 0.02, 10, 64),
      new T.MeshStandardMaterial({
        color: tint || 0xc5a059,
        roughness: 0.4,
        metalness: 0.4,
        emissive: tint || 0xc5a059,
        emissiveIntensity: 0.35,
      })
    );
    floorRing.rotation.x = Math.PI / 2;
    floorRing.position.y = 0.08;
    group.add(floorRing);

    return group;
  }

  async function bootWebGL(p, gen) {
    const T = await loadThree();
    if (!isBootCurrent(gen)) return false;

    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;

    teardownGl();
    if (!isBootCurrent(gen)) return false;

    renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.setClearColor(0x05060a, 1);

    scene = new T.Scene();
    scene.background = new T.Color(0x05060a);
    scene.fog = null;

    loadSpaceSky(T, (tex) => {
      if (!isBootCurrent(gen) || !scene) return;
      if (tex) {
        scene.background = tex;
        scene.environment = tex;
      }
    });

    camera = new T.PerspectiveCamera(48, w / h, 0.1, 400);
    camera.position.set(10, 6.5, 18);

    const orbitTarget = new T.Vector3(0, 2.4, 0);
    controls = attachLookControls(camera, orbitTarget, canvas, {
      radius: 18,
      phi: 1.15,
      theta: 0.45,
      minR: 8,
      maxR: 42,
    });

    raycaster = new T.Raycaster();
    roomPickables = [];

    const hemi = new T.HemisphereLight(0xc4d0ff, 0x0a0c14, 0.42);
    scene.add(hemi);
    const key = new T.DirectionalLight(0xfff6ea, 1.15);
    key.position.set(8, 14, 10);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 60;
    key.shadow.camera.left = -16;
    key.shadow.camera.right = 16;
    key.shadow.camera.top = 16;
    key.shadow.camera.bottom = -16;
    scene.add(key);
    const fill = new T.DirectionalLight(0x7eb0c8, 0.42);
    fill.position.set(-10, 6, -6);
    scene.add(fill);
    const roomFill = new T.PointLight(0xfff8f2, 0.85, 26, 1.6);
    roomFill.position.set(0, 3.8, 0.4);
    scene.add(roomFill);
    const coveGlow = new T.PointLight(0xe8f0ff, 0.35, 22, 2);
    coveGlow.position.set(0, 4.6, -1.5);
    scene.add(coveGlow);

    const chamber = buildChamber(T);
    scene.add(chamber.group);
    roomPickables = chamber.pickables.slice();

    const playerFig = makeFigure(T, p.player.art, -1.85, 0xc5a059, "player");
    const companionFig = makeFigure(T, p.companion.art, 1.85, 0x7eb0c8, "companion");
    playerFig.visible = false;
    companionFig.visible = false;
    playerFig.position.z = -0.6;
    companionFig.position.z = -0.6;
    // Parent under chamber so standees stay planted with the floor
    chamber.group.add(playerFig, companionFig);

    // Static near-field star dust (no idle spin)
    const moteGeo = new T.BufferGeometry();
    const moteCount = 220;
    const positions = new Float32Array(moteCount * 3);
    for (let i = 0; i < moteCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 90;
      positions[i * 3 + 1] = (Math.random() - 0.35) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 90;
    }
    moteGeo.setAttribute("position", new T.BufferAttribute(positions, 3));
    scene.add(
      new T.Points(
        moteGeo,
        new T.PointsMaterial({
          color: 0xe8eefc,
          size: 0.07,
          transparent: true,
          opacity: 0.72,
          depthWrite: false,
          sizeAttenuation: true,
        })
      )
    );

    fallback.dataset.on = "false";
    canvas.style.display = "block";
    setHudMode("exterior");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    enterAnim = null;
    /** Monotonic id so a newer enter/exit tween supersedes any in-flight rAF. */
    let camTweenId = 0;

    function animateCameraTo(endPos, endTarget, duration, done, opts) {
      if (!camera || !controls) {
        done?.();
        return;
      }
      // Widen/narrow orbit limits *before* sync/apply so the end pose is not clamped away
      if (opts?.limits) {
        controls.setLimits(opts.limits.minR, opts.limits.maxR);
      }
      if (reduced) {
        // Cancel any prior tween so a later rAF cannot snap over this reduced-motion pose
        camTweenId += 1;
        enterAnim = null;
        camera.position.copy(endPos);
        controls.target.copy(endTarget);
        camera.lookAt(endTarget);
        controls.syncFromCam?.();
        controls.apply?.();
        done?.();
        return;
      }
      const startPos = camera.position.clone();
      const startTarget = controls.target.clone();
      const t0 = performance.now();
      const tweenId = ++camTweenId;
      enterAnim = { gen, id: tweenId };
      const step = (t) => {
        // Only the latest tween owns the camera (Esc mid-enter must not leave dual rAFs)
        if (!isBootCurrent(gen) || !camera || !controls || enterAnim?.id !== tweenId) return;
        const u = Math.min(1, (t - t0) / duration);
        const e = 1 - Math.pow(1 - u, 3);
        camera.position.lerpVectors(startPos, endPos, e);
        controls.target.lerpVectors(startTarget, endTarget, e);
        camera.lookAt(controls.target);
        // Sync spherical from pose without re-applying (avoids mid-anim clamp jumps)
        controls.syncFromCam?.();
        if (u < 1) requestAnimationFrame(step);
        else {
          if (enterAnim?.id === tweenId) enterAnim = null;
          camera.position.copy(endPos);
          controls.target.copy(endTarget);
          camera.lookAt(endTarget);
          controls.syncFromCam?.();
          controls.apply?.();
          done?.();
        }
      };
      requestAnimationFrame(step);
    }

    function enterInterior() {
      if (viewMode === "interior" || !isLiveBoot(gen)) return;
      controls?.setEnabled(false);
      playerFig.visible = true;
      companionFig.visible = true;
      // HUD flips immediately; camera eases in (static chamber — no idle motion)
      setHudMode("interior");
      const endPos = new T.Vector3(0, 2.05, 3.8);
      const endTarget = new T.Vector3(0, 1.55, -0.8);
      animateCameraTo(
        endPos,
        endTarget,
        1400,
        () => {
          if (!isLiveBoot(gen)) return;
          controls?.setEnabled(true);
        },
        { limits: { minR: 2.2, maxR: 12 } }
      );
    }

    function returnToSpace() {
      if (viewMode !== "interior" || !isLiveBoot(gen)) return;
      keys.clear();
      controls?.setEnabled(false);
      playerFig.visible = false;
      companionFig.visible = false;
      setHudMode("exterior");
      const endPos = new T.Vector3(10, 6.5, 18);
      const endTarget = new T.Vector3(0, 2.4, 0);
      animateCameraTo(
        endPos,
        endTarget,
        1200,
        () => {
          if (!isLiveBoot(gen)) return;
          controls?.setSpherical(18, 1.15, 0.45);
          controls?.setEnabled(true);
        },
        { limits: { minR: 8, maxR: 42 } }
      );
    }

    // Expose for Esc / API while this boot is live (API wrappers read userData — never bind stale closures)
    scene.userData.bootGen = gen;
    scene.userData.enterInterior = enterInterior;
    scene.userData.returnToSpace = returnToSpace;

    function tryEnterFromPointer(e) {
      if (viewMode !== "exterior" || !camera || !raycaster || enterAnim) return false;
      const rect = canvas.getBoundingClientRect();
      const ndc = new T.Vector2(
        ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1,
        -((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1
      );
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(roomPickables, true);
      if (hits.length) {
        enterInterior();
        return true;
      }
      return false;
    }

    controls.setOnClick((e) => {
      tryEnterFromPointer(e);
    });

    // Backup click path (synthetic / accessibility) when orbit drag gating misses
    const onCanvasClick = (e) => {
      if (viewMode !== "exterior") return;
      tryEnterFromPointer(e);
    };
    canvas.addEventListener("click", onCanvasClick);
    scene.userData.removeClick = () => canvas.removeEventListener("click", onCanvasClick);

    clock.last = performance.now();

    function tick(now) {
      if (!isBootCurrent(gen) || !renderer || !camera) return;
      animId = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - clock.last) / 1000);
      clock.last = now;

      if (viewMode === "interior" && keys.size && camera && controls) {
        const speed = 4.2 * dt;
        const forward = new T.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        const right = new T.Vector3().crossVectors(forward, new T.Vector3(0, 1, 0)).normalize();
        const move = new T.Vector3();
        if (keys.has("KeyW") || keys.has("ArrowUp")) move.add(forward);
        if (keys.has("KeyS") || keys.has("ArrowDown")) move.sub(forward);
        if (keys.has("KeyD") || keys.has("ArrowRight")) move.add(right);
        if (keys.has("KeyA") || keys.has("ArrowLeft")) move.sub(right);
        if (move.lengthSq() > 0) {
          move.normalize().multiplyScalar(speed);
          camera.position.add(move);
          // Keep roam inside the chamber footprint
          camera.position.x = Math.max(-3.6, Math.min(3.6, camera.position.x));
          camera.position.z = Math.max(-3.2, Math.min(4.2, camera.position.z));
          camera.position.y = Math.max(1.4, Math.min(3.4, camera.position.y));
          controls.target.add(move);
          controls.target.x = Math.max(-3.2, Math.min(3.2, controls.target.x));
          controls.target.z = Math.max(-3.6, Math.min(3.2, controls.target.z));
          controls.syncFromCam?.();
        }
      }

      if (playerFig.visible) {
        [playerFig, companionFig].forEach((fig) => {
          const bb = fig.userData.billboard;
          if (bb) bb.lookAt(camera.position);
        });
      }

      // Static presentation — no chamber bob, figure float, or idle orbit
      chamber.group.position.y = 0.02;

      controls.update();
      renderer.render(scene, camera);
    }
    if (!isBootCurrent(gen)) {
      teardownGl();
      return false;
    }
    animId = requestAnimationFrame(tick);
    return true;
  }

  function onResize() {
    if (!open || !renderer || !camera || !canvas) return;
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  function onKeyDown(e) {
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      if (viewMode === "interior") {
        if (scene?.userData?.returnToSpace) {
          scene.userData.returnToSpace();
        } else if (fallback?.dataset?.on === "true") {
          returnFallbackToSpace();
        } else {
          close();
        }
      } else {
        close();
      }
      return;
    }
    if (viewMode === "interior") keys.add(e.code);
  }
  function onKeyUp(e) {
    keys.delete(e.code);
  }

  async function openRoom() {
    // Single in-flight open — bump generation so any prior await is ignored
    if (openingInFlight) {
      bootGeneration += 1;
    }
    openingInFlight = true;
    const gen = ++bootGeneration;

    ensureDom();
    teardownGl();
    const p = party();
    updateLabels(p);
    viewMode = "exterior";
    layer.setAttribute("data-open", "true");
    layer.setAttribute("data-mode", "exterior");
    open = true;
    document.body.style.overflow = "hidden";
    keys.clear();
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);

    try {
      const ok = await bootWebGL(p, gen);
      if (!isBootCurrent(gen)) return;
      if (ok) {
        canvas.focus({ preventScroll: true });
      } else if (isBootCurrent(gen)) {
        showFallback(p);
      }
    } catch (err) {
      if (!isBootCurrent(gen)) return;
      console.warn("White room WebGL unavailable, using 2.5D fallback", err);
      teardownGl();
      showFallback(p);
    } finally {
      if (gen === bootGeneration) openingInFlight = false;
    }
  }

  function teardownGl() {
    if (animId) cancelAnimationFrame(animId);
    animId = 0;
    enterAnim = null;
    roomPickables = [];
    raycaster = null;
    pointerDown = null;
    if (scene?.userData?.removeClick) {
      try {
        scene.userData.removeClick();
      } catch (_) {
        /* ignore */
      }
    }
    if (controls) {
      controls.dispose();
      controls = null;
    }
    if (renderer) {
      renderer.dispose();
      renderer = null;
    }
    scene = null;
    camera = null;
  }

  function close() {
    // Invalidate any in-flight boot (Esc during Three.js load)
    bootGeneration += 1;
    openingInFlight = false;
    viewMode = "exterior";
    if (!open && layer?.getAttribute("data-open") !== "true") {
      teardownGl();
      return;
    }
    open = false;
    keys.clear();
    window.removeEventListener("resize", onResize);
    window.removeEventListener("keydown", onKeyDown, true);
    window.removeEventListener("keyup", onKeyUp, true);
    teardownGl();
    if (layer) {
      layer.setAttribute("data-open", "false");
      layer.setAttribute("data-mode", "exterior");
    }
    if (fallback) {
      fallback.dataset.on = "false";
      canvas.style.display = "block";
    }
    document.body.style.overflow = "";
  }

  function init() {
    ensureDom();
    document.addEventListener("planesbound-enter-white-room", () => {
      if (!window.PlanesboundSheets?.bothComplete?.()) {
        // Still allow if sheets claim complete via localStorage edge
        const ok =
          window.PlanesboundSheets?.isComplete?.(window.PlanesboundSheets.get("player")) &&
          window.PlanesboundSheets?.isComplete?.(window.PlanesboundSheets.get("companion"));
        if (!ok) {
          window.PlanesboundSheets?.open?.("player");
          return;
        }
      }
      openRoom();
    });
    window.PlanesboundWhiteRoom = {
      open: openRoom,
      close,
      enter: () => scene?.userData?.enterInterior?.(),
      exitInterior: () => scene?.userData?.returnToSpace?.(),
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
