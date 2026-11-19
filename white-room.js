/**
 * PAS-9 — Endless white room stage (Three.js WebGL + 2.5D fallback).
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
  const keys = new Set();
  const clock = { last: 0 };

  function isBootCurrent(gen) {
    return open && gen === bootGeneration;
  }

  function ensureDom() {
    if (layer) return;
    layer = document.createElement("div");
    layer.className = "white-room-layer";
    layer.id = "whiteRoomLayer";
    layer.setAttribute("data-open", "false");
    layer.innerHTML = `
      <canvas class="white-room-canvas" id="whiteRoomCanvas" tabindex="0" aria-label="White room stage"></canvas>
      <div class="white-room-fallback" id="whiteRoomFallback" data-on="false" aria-hidden="true">
        <div class="white-room-fallback-stage" id="whiteRoomFallbackStage"></div>
      </div>
      <div class="white-room-hud">
        <div class="white-room-top">
          <div>
            <p class="white-room-kicker">Planesbound · after creation</p>
            <h2 class="white-room-title">The White Room</h2>
            <p class="white-room-sub">An endless pale void. Player and Companion stand ready — parchment minds in a blank stage before the planes.</p>
          </div>
          <button type="button" class="white-room-exit" id="whiteRoomExit">Leave · Esc</button>
        </div>
        <div class="white-room-labels" id="whiteRoomLabels" aria-hidden="true"></div>
        <p class="white-room-help" id="whiteRoomHelp">Drag to look · WASD / arrows to roam · Esc to leave</p>
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
    document.getElementById("whiteRoomHelp").textContent =
      "Presentation stage (2.5D) · Esc to leave";
    const stage = document.getElementById("whiteRoomFallbackStage");
    stage.innerHTML = `
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
      </figure>`;
  }

  async function loadThree() {
    if (THREE) return THREE;
    const mod = await import("https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js");
    THREE = mod;
    return THREE;
  }

  /** Lightweight orbit/pan without OrbitControls (avoids bare 'three' specifier). */
  function attachLookControls(cam, target, dom) {
    const state = {
      dragging: false,
      mode: "orbit",
      lx: 0,
      ly: 0,
      spherical: { radius: 7.5, phi: 1.15, theta: 0 },
    };
    const syncFromCam = () => {
      const offset = cam.position.clone().sub(target);
      state.spherical.radius = Math.max(3, Math.min(28, offset.length()));
      state.spherical.theta = Math.atan2(offset.x, offset.z);
      state.spherical.phi = Math.acos(Math.min(1, Math.max(-1, offset.y / state.spherical.radius)));
    };
    syncFromCam();
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
      state.dragging = true;
      state.mode = e.button === 2 || e.shiftKey ? "pan" : "orbit";
      state.lx = e.clientX;
      state.ly = e.clientY;
      dom.setPointerCapture?.(e.pointerId);
    };
    const onMove = (e) => {
      if (!state.dragging) return;
      const dx = e.clientX - state.lx;
      const dy = e.clientY - state.ly;
      state.lx = e.clientX;
      state.ly = e.clientY;
      if (state.mode === "pan") {
        const panSpeed = 0.004 * state.spherical.radius;
        const right = new THREE.Vector3();
        const up = new THREE.Vector3(0, 1, 0);
        cam.getWorldDirection(right);
        right.cross(up).normalize();
        const trueUp = new THREE.Vector3().crossVectors(right, cam.getWorldDirection(new THREE.Vector3()).normalize()).normalize();
        target.addScaledVector(right, -dx * panSpeed);
        target.addScaledVector(trueUp, dy * panSpeed);
      } else {
        state.spherical.theta -= dx * 0.005;
        state.spherical.phi = Math.min(Math.PI * 0.48, Math.max(0.12, state.spherical.phi + dy * 0.005));
      }
      apply();
    };
    const onUp = (e) => {
      state.dragging = false;
      try {
        dom.releasePointerCapture?.(e.pointerId);
      } catch (_) {
        /* ignore */
      }
    };
    const onWheel = (e) => {
      e.preventDefault();
      state.spherical.radius = Math.min(28, Math.max(3, state.spherical.radius * (e.deltaY > 0 ? 1.08 : 0.92)));
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
    };
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

    const plateMat = new T.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.55,
      metalness: 0.08,
      transparent: true,
      side: T.DoubleSide,
      depthWrite: false,
    });
    loadTex(T, plateUrl, (tex) => {
      plateMat.map = tex;
      plateMat.needsUpdate = true;
    });
    const plate = new T.Mesh(new T.PlaneGeometry(2.2, 3.3), plateMat);
    plate.position.set(0, 0, 0);
    plate.castShadow = true;
    plate.renderOrder = 1;
    billboard.add(plate);

    const emblemMat = new T.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.45,
      metalness: 0.12,
      transparent: true,
      side: T.DoubleSide,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    loadTex(T, url, (tex) => {
      emblemMat.map = tex;
      emblemMat.needsUpdate = true;
    });
    // Local to plate: slightly above center, tiny z so it sits on the painted standee
    const emblem = new T.Mesh(new T.CircleGeometry(0.42, 48), emblemMat);
    emblem.position.set(0, 0.7, 0.02);
    emblem.castShadow = true;
    emblem.renderOrder = 2;
    billboard.add(emblem);

    const ring = new T.Mesh(
      new T.TorusGeometry(0.48, 0.022, 12, 48),
      new T.MeshStandardMaterial({
        color: tint || 0xc5a059,
        roughness: 0.35,
        metalness: 0.5,
        emissive: tint || 0xc5a059,
        emissiveIntensity: 0.4,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      })
    );
    ring.position.set(0, 0.7, 0.025);
    ring.renderOrder = 3;
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

    // Tear down any leftover GL before attaching a new renderer to the canvas
    teardownGl();
    if (!isBootCurrent(gen)) return false;

    renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.setClearColor(0xf7f7f7, 1);

    scene = new T.Scene();
    scene.background = new T.Color(0xf4f4f4);
    scene.fog = new T.Fog(0xf4f4f4, 14, 42);

    camera = new T.PerspectiveCamera(48, w / h, 0.1, 200);
    camera.position.set(0, 2.4, 6.2);

    const orbitTarget = new T.Vector3(0, 1.1, 0);
    controls = attachLookControls(camera, orbitTarget, canvas);

    const hemi = new T.HemisphereLight(0xffffff, 0xe8e8e8, 0.95);
    scene.add(hemi);
    const key = new T.DirectionalLight(0xffffff, 1.15);
    key.position.set(4, 10, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 40;
    key.shadow.camera.left = -12;
    key.shadow.camera.right = 12;
    key.shadow.camera.top = 12;
    key.shadow.camera.bottom = -12;
    scene.add(key);
    const fill = new T.DirectionalLight(0xd7ecff, 0.35);
    fill.position.set(-6, 4, -4);
    scene.add(fill);

    // Infinite-feeling floor
    const floor = new T.Mesh(
      new T.CircleGeometry(80, 96),
      new T.MeshStandardMaterial({
        color: 0xececec,
        roughness: 0.35,
        metalness: 0.04,
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Subtle horizon disc for depth
    const horizon = new T.Mesh(
      new T.RingGeometry(28, 48, 96),
      new T.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.55,
        side: T.DoubleSide,
      })
    );
    horizon.rotation.x = -Math.PI / 2;
    horizon.position.y = 0.02;
    scene.add(horizon);

    const playerFig = makeFigure(T, p.player.art, -1.85, 0xc5a059, "player");
    const companionFig = makeFigure(T, p.companion.art, 1.85, 0x7eb0c8, "companion");
    scene.add(playerFig, companionFig);

    // Soft floating motes
    const moteGeo = new T.BufferGeometry();
    const moteCount = 80;
    const positions = new Float32Array(moteCount * 3);
    for (let i = 0; i < moteCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = Math.random() * 8 + 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    moteGeo.setAttribute("position", new T.BufferAttribute(positions, 3));
    const motes = new T.Points(
      moteGeo,
      new T.PointsMaterial({ color: 0xffffff, size: 0.06, transparent: true, opacity: 0.55 })
    );
    scene.add(motes);

    fallback.dataset.on = "false";
    canvas.style.display = "block";
    document.getElementById("whiteRoomHelp").textContent =
      "Drag to look · WASD / arrows to roam · Esc to leave";

    clock.last = performance.now();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function tick(now) {
      if (!isBootCurrent(gen) || !renderer || !camera) return;
      animId = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - clock.last) / 1000);
      clock.last = now;

      // WASD roam in camera-local XZ
      if (keys.size && camera && controls) {
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
          controls.target.add(move);
          controls.syncFromCam?.();
        }
      }

      // One lookAt per standee — emblem/frame are children of the plate billboard
      [playerFig, companionFig].forEach((fig) => {
        const bb = fig.userData.billboard;
        if (bb) bb.lookAt(camera.position);
      });

      if (!reduced) {
        playerFig.position.y = Math.sin(now * 0.0012) * 0.04;
        companionFig.position.y = Math.sin(now * 0.0012 + 1.2) * 0.04;
        motes.rotation.y = now * 0.00005;
      }

      controls.update();
      renderer.render(scene, camera);
    }
    if (!isBootCurrent(gen)) {
      teardownGl();
      return false;
    }
    animId = requestAnimationFrame(tick);

    // Cinematic intro ease
    if (!reduced) {
      const start = { x: 0, y: 3.6, z: 9.5 };
      const end = { x: 0, y: 2.4, z: 6.2 };
      camera.position.set(start.x, start.y, start.z);
      const t0 = performance.now();
      const intro = (t) => {
        if (!isBootCurrent(gen) || !camera) return;
        const u = Math.min(1, (t - t0) / 1600);
        const e = 1 - Math.pow(1 - u, 3);
        camera.position.set(
          start.x + (end.x - start.x) * e,
          start.y + (end.y - start.y) * e,
          start.z + (end.z - start.z) * e
        );
        if (u < 1) requestAnimationFrame(intro);
      };
      requestAnimationFrame(intro);
    }
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
      close();
      return;
    }
    keys.add(e.code);
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
    layer.setAttribute("data-open", "true");
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
    if (layer) layer.setAttribute("data-open", "false");
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
    window.PlanesboundWhiteRoom = { open: openRoom, close };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
