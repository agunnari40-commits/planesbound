/**
 * PAS-16 — WoW-like skinned actors + mesh/bone hitboxes (Three.js).
 * Loads glTF with Idle/Walk/Attack clips; raycast against pose-tracking capsules.
 */
(function () {
  let THREE = null;
  let GLTFLoader = null;
  let SkeletonUtils = null;
  const cache = new Map();

  async function loadThree() {
    if (THREE) return THREE;
    const mod = await import("https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js");
    THREE = mod;
    return THREE;
  }

  async function loadExtras() {
    await loadThree();
    if (!GLTFLoader) {
      // Prefer addons path so importmap resolves the bare "three" dependency
      const mod = await import("three/addons/loaders/GLTFLoader.js");
      GLTFLoader = mod.GLTFLoader;
    }
    if (!SkeletonUtils) {
      // Named exports: { clone, retarget, ... } — not a SkeletonUtils namespace object
      SkeletonUtils = await import("three/addons/utils/SkeletonUtils.js");
    }
    return { THREE, GLTFLoader, SkeletonUtils };
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function loadGltf(url) {
    return loadExtras().then(({ GLTFLoader: Loader }) => {
      if (cache.has(url)) return cache.get(url);
      const promise = new Promise((resolve, reject) => {
        new Loader().load(url, resolve, undefined, reject);
      });
      cache.set(url, promise);
      return promise;
    });
  }

  function findClip(clips, names) {
    const list = clips || [];
    for (const name of names) {
      const hit = list.find((c) => c.name && c.name.toLowerCase() === name.toLowerCase());
      if (hit) return hit;
    }
    for (const name of names) {
      const hit = list.find((c) => c.name && c.name.toLowerCase().includes(name.toLowerCase()));
      if (hit) return hit;
    }
    return list[0] || null;
  }

  function collectBones(root) {
    const bones = [];
    root.traverse((o) => {
      if (o.isBone) bones.push(o);
    });
    return bones;
  }

  function pickBone(bones, patterns) {
    for (const pat of patterns) {
      const re = new RegExp(pat, "i");
      const hit = bones.find((b) => re.test(b.name));
      if (hit) return hit;
    }
    return null;
  }

  function tintMaterials(root, tintHex) {
    if (tintHex == null) return;
    const tint = new THREE.Color(tintHex);
    root.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        if (!m || !m.color) return;
        m.color.lerp(tint, 0.18);
        if ("emissive" in m) {
          m.emissive = tint.clone().multiplyScalar(0.08);
          m.userData.baseEmissive = m.emissive.clone();
          m.userData.baseEmissiveIntensity = m.emissiveIntensity ?? 0.15;
        }
        m.userData.baseColor = m.color.clone();
        m.needsUpdate = true;
      });
    });
  }

  function setGlow(root, mode) {
    // mode: null | "hover" | "select"
    root.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        if (!m || !("emissive" in m)) return;
        const base = m.userData.baseEmissive || new THREE.Color(0x000000);
        const baseI = m.userData.baseEmissiveIntensity ?? 0.12;
        if (mode === "select") {
          m.emissive.set(0xc5a059);
          m.emissiveIntensity = Math.max(0.55, baseI + 0.45);
        } else if (mode === "hover") {
          m.emissive.set(0x7eb0c8);
          m.emissiveIntensity = Math.max(0.35, baseI + 0.28);
        } else {
          m.emissive.copy(base);
          m.emissiveIntensity = baseI;
        }
      });
    });
  }

  /**
   * Pose-tracking hit volumes:
   * - Primary body capsule + head sphere fitted each frame from the skinned AABB
   *   (tracks animated silhouette; reliable for raycasts — skinned mesh raycast uses bind pose)
   * - Optional bone markers when a skeleton is present (debug assist)
   */
  function buildHitVolumes(T, root, opts) {
    const group = new T.Group();
    group.name = "hitVolumes";
    const debug = !!opts?.debug;
    const bodyMat = new T.MeshBasicMaterial({
      color: 0x7eb0c8,
      transparent: true,
      opacity: debug ? 0.28 : 0,
      depthWrite: false,
      wireframe: debug,
    });
    const headMat = new T.MeshBasicMaterial({
      color: 0xc5a059,
      transparent: true,
      opacity: debug ? 0.32 : 0,
      depthWrite: false,
      wireframe: debug,
    });

    // Boxes/spheres — avoid non-uniform CapsuleGeometry scale (breaks raycasts)
    const body = new T.Mesh(new T.BoxGeometry(1, 1, 1), bodyMat);
    body.userData.hitVolume = true;
    body.userData.kind = "body";
    group.add(body);

    const head = new T.Mesh(new T.SphereGeometry(1, 12, 10), headMat);
    head.userData.hitVolume = true;
    head.userData.kind = "head";
    group.add(head);

    const volumes = [body, head];
    const bones = collectBones(root);
    const headBone = pickBone(bones, ["head", "neck", "Head", "mixamorigHead"]);
    const hipsBone = pickBone(bones, ["hips", "pelvis", "root", "Hips", "mixamorigHips"]);
    const box = new T.Box3();
    const tmp = new T.Vector3();

    function expandFromBones() {
      box.makeEmpty();
      if (!bones.length) return false;
      for (const b of bones) {
        b.getWorldPosition(tmp);
        box.expandByPoint(tmp);
      }
      return !box.isEmpty();
    }

    function update() {
      root.updateWorldMatrix(true, true);
      const parent = group.parent;
      // SkinnedMesh bind-pose AABB is wrong for targeting — prefer live bone positions
      const fromBones = expandFromBones();
      let minY = 0;
      let maxY = 1.8;
      let cx = 0;
      let cz = 0;
      if (fromBones) {
        const worldMin = box.min.clone();
        const worldMax = box.max.clone();
        const worldCenter = box.getCenter(new T.Vector3());
        if (parent) {
          parent.worldToLocal(worldMin);
          parent.worldToLocal(worldMax);
          parent.worldToLocal(worldCenter);
        }
        minY = Math.min(worldMin.y, worldMax.y);
        maxY = Math.max(worldMin.y, worldMax.y);
        cx = worldCenter.x;
        cz = worldCenter.z;
      } else {
        // Fallback humanoid capsule in actor-local space
        minY = 0;
        maxY = 1.85;
        cx = 0;
        cz = 0;
      }
      // Keep a readable WoW-like vertical volume even if bones cluster
      if (maxY - minY < 1.1) {
        maxY = Math.max(maxY, minY + 1.7);
      }
      // Never bury the capsule under the floor — feet at y≈0
      minY = Math.max(0, minY);
      maxY = Math.max(maxY, minY + 1.55);
      const h = Math.max(1.55, maxY - minY);
      const r = 0.55;
      body.scale.set(r * 2, h, r * 2);
      body.position.set(cx, minY + h * 0.5, cz);

      const headR = 0.24;
      head.scale.setScalar(headR);
      if (headBone) {
        headBone.getWorldPosition(tmp);
        if (parent) parent.worldToLocal(tmp);
        head.position.copy(tmp);
      } else {
        head.position.set(cx, maxY - headR * 0.2, cz);
      }
      // Ensure hips/root stay inside body capsule horizontally
      if (hipsBone) {
        hipsBone.getWorldPosition(tmp);
        if (parent) parent.worldToLocal(tmp);
        body.position.x = tmp.x;
        body.position.z = tmp.z;
        head.position.x = tmp.x * 0.25 + head.position.x * 0.75;
        head.position.z = tmp.z * 0.25 + head.position.z * 0.75;
      }
    }

    function setDebug(on) {
      bodyMat.opacity = on ? 0.28 : 0;
      headMat.opacity = on ? 0.32 : 0;
      bodyMat.wireframe = !!on;
      headMat.wireframe = !!on;
      bodyMat.needsUpdate = true;
      headMat.needsUpdate = true;
    }

    // Seed once so first pick works before the first tick
    update();

    return { group, volumes, update, setDebug };
  }

  function createNameplate(T, label, opts) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    const draw = (text, hp, hpMax) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(8,10,14,0.72)";
      ctx.strokeStyle = "rgba(197,160,89,0.85)";
      ctx.lineWidth = 4;
      roundRect(ctx, 16, 16, 480, 96, 14);
      ctx.fill();
      ctx.stroke();
      ctx.font = "600 36px Cinzel, Georgia, serif";
      ctx.fillStyle = "#e7dcc6";
      ctx.textAlign = "center";
      ctx.fillText(String(text || "Target").slice(0, 28), 256, 58);
      if (hpMax != null && hpMax > 0) {
        const pct = Math.max(0, Math.min(1, (hp ?? hpMax) / hpMax));
        ctx.fillStyle = "rgba(40,30,20,0.9)";
        ctx.fillRect(48, 72, 416, 18);
        ctx.fillStyle = pct > 0.35 ? "#3d8f5a" : "#b84a3a";
        ctx.fillRect(48, 72, 416 * pct, 18);
        ctx.strokeStyle = "rgba(231,220,198,0.45)";
        ctx.strokeRect(48, 72, 416, 18);
      }
      tex.needsUpdate = true;
    };
    const tex = new T.CanvasTexture(canvas);
    tex.colorSpace = T.SRGBColorSpace;
    const mat = new T.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new T.Sprite(mat);
    sprite.scale.set(1.6, 0.4, 1);
    sprite.position.y = opts?.y ?? 2.15;
    sprite.renderOrder = 20;
    draw(label, opts?.hp, opts?.hpMax);
    return {
      sprite,
      set(text, hp, hpMax) {
        draw(text, hp, hpMax);
      },
      setVisible(v) {
        sprite.visible = !!v;
      },
    };
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /**
   * @returns {Promise<object>} actor handle
   */
  async function createActor(opts) {
    const { THREE: T, SkeletonUtils: SU } = await loadExtras();
    const url = opts.url;
    const gltf = await loadGltf(url);
    const root = SU.clone(gltf.scene);
    root.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        o.frustumCulled = false;
        if (o.material) {
          // Clone materials per actor so tint/glow never leak across instances
          if (Array.isArray(o.material)) {
            o.material = o.material.map((m) => (m && m.clone ? m.clone() : m));
          } else if (o.material.clone) {
            o.material = o.material.clone();
          }
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m) => {
            if (!m) return;
            if (m.map) m.map.colorSpace = T.SRGBColorSpace;
            if ("emissive" in m) {
              m.userData.baseEmissive = m.emissive.clone();
              m.userData.baseEmissiveIntensity = m.emissiveIntensity ?? 0.12;
            }
            if (m.color) m.userData.baseColor = m.color.clone();
          });
        }
      }
    });
    tintMaterials(root, opts.tint);

    const scale = opts.scale ?? 1.05;
    root.scale.setScalar(scale);
    // Fit feet to ground: shift so min Y ≈ 0
    root.updateMatrixWorld(true);
    const box = new T.Box3().setFromObject(root);
    if (Number.isFinite(box.min.y)) root.position.y -= box.min.y;

    const wrap = new T.Group();
    wrap.name = opts.id || "actor";
    wrap.add(root);
    if (opts.position) wrap.position.copy(opts.position);
    else if (opts.x != null) wrap.position.set(opts.x, 0, opts.z ?? 0);

    const mixer = new T.AnimationMixer(root);
    const clips = gltf.animations || [];
    const clipIdle = findClip(clips, ["Idle", "idle"]);
    const clipWalk = findClip(clips, ["Walk", "walk", "Run", "run"]);
    const clipAttack = findClip(clips, ["Attack", "attack", "Special", "special"]);
    const clipHit = findClip(clips, ["Hit", "hit", "Impact", "impact"]);
    const clipDeath = findClip(clips, ["Death", "death", "Die", "die"]);
    let current = null;
    let currentName = "";

    function play(name, { fade = 0.2, loop = true, once = false } = {}) {
      let clip = null;
      if (name === "idle") clip = clipIdle;
      else if (name === "walk") clip = clipWalk || clipIdle;
      else if (name === "attack") clip = clipAttack || clipIdle;
      else if (name === "hit") clip = clipHit || clipIdle;
      else if (name === "death") {
        clip = clipDeath || clipHit || clipIdle;
        once = true;
        loop = false;
      } else clip = findClip(clips, [name]) || clipIdle;
      if (!clip) return;
      if (currentName === name && current && !once) return;
      const next = mixer.clipAction(clip);
      next.reset();
      next.setLoop(once || !loop ? T.LoopOnce : T.LoopRepeat, Infinity);
      next.clampWhenFinished = !!(once || !loop);
      next.enabled = true;
      if (prefersReducedMotion() && name !== "idle") {
        // Freeze on idle pose under reduced motion
        if (clipIdle) {
          const idleAct = mixer.clipAction(clipIdle);
          idleAct.reset().play();
          idleAct.paused = true;
          current = idleAct;
          currentName = "idle";
        }
        return;
      }
      if (current && current !== next) current.fadeOut(fade);
      next.fadeIn(fade).play();
      current = next;
      currentName = name;
      if (once) {
        const onDone = (e) => {
          if (e.action !== next) return;
          mixer.removeEventListener("finished", onDone);
          // Hold death pose; otherwise return to idle for hit/attack flourishes
          if (name !== "death") play("idle");
        };
        mixer.addEventListener("finished", onDone);
      }
    }

    play("idle", { fade: 0 });

    const hit = buildHitVolumes(T, root, { debug: !!opts.debug });
    wrap.add(hit.group);
    hit.volumes.forEach((v) => {
      v.userData.actorId = opts.id;
      v.userData.actorRole = opts.role;
    });
    root.traverse((o) => {
      if (o.isMesh) {
        o.userData.actorId = opts.id;
        o.userData.actorRole = opts.role;
        o.userData.actorMesh = true;
      }
    });

    const plate = createNameplate(T, opts.label || opts.id || "Actor", {
      y: opts.nameplateY ?? 2.2,
      hp: opts.hp,
      hpMax: opts.hpMax,
    });
    plate.setVisible(false);
    wrap.add(plate.sprite);

    let selected = false;
    let hovered = false;

    function refreshGlow() {
      setGlow(root, selected ? "select" : hovered ? "hover" : null);
    }

    const actor = {
      id: opts.id,
      role: opts.role,
      root: wrap,
      model: root,
      mixer,
      hitVolumes: hit.volumes,
      play,
      update(dt) {
        mixer.update(dt);
        hit.update();
      },
      setHovered(v) {
        hovered = !!v;
        refreshGlow();
      },
      setSelected(v) {
        selected = !!v;
        plate.setVisible(selected);
        refreshGlow();
      },
      setLabel(text, hp, hpMax) {
        plate.set(text, hp, hpMax);
      },
      setDebug(on) {
        hit.setDebug(on);
      },
      getPickables() {
        // Prefer hit volumes (pose-tracking); also expose meshes for refinement
        return hit.volumes.concat(
          (() => {
            const meshes = [];
            root.traverse((o) => {
              if (o.isMesh) meshes.push(o);
            });
            return meshes;
          })()
        );
      },
      dispose() {
        mixer.stopAllAction();
        wrap.removeFromParent();
      },
    };
    wrap.userData.actor = actor;
    return actor;
  }

  /**
   * Pointer pick helper — prefers hit-volume capsules, falls back to mesh.
   */
  function pickActor(raycaster, actors, preferVolumes = true) {
    const vols = [];
    const meshes = [];
    for (const a of actors) {
      if (!a?.root?.visible) continue;
      for (const v of a.hitVolumes || []) vols.push(v);
      a.model?.traverse((o) => {
        if (o.isMesh) meshes.push(o);
      });
    }
    if (preferVolumes && vols.length) {
      const hits = raycaster.intersectObjects(vols, false);
      if (hits.length) {
        const id = hits[0].object.userData.actorId;
        return actors.find((a) => a.id === id) || null;
      }
    }
    const meshHits = raycaster.intersectObjects(meshes, false);
    if (meshHits.length) {
      const id = meshHits[0].object.userData.actorId;
      return actors.find((a) => a.id === id) || null;
    }
    return null;
  }

  const MODEL = {
    player: "art/models/player.glb",
    companion: "art/models/companion.glb",
    foe: "art/models/foe.glb",
  };

  window.PlanesboundWowActors = {
    loadThree,
    loadExtras,
    loadGltf,
    createActor,
    pickActor,
    MODEL,
    prefersReducedMotion,
  };
})();
