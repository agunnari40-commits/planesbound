/* Planesbound PAS-41 — helical Astral Sea loading (brass/astral + Grokbot wisps) */
(function () {
  const MIN_MS = 2600;
  const SKIP_AFTER_MS = 1400;

  /** Inner shores riding the Daystar helix — larger radii, slower orbital speeds. */
  const BODIES = [
    { id: "fire", name: "Fire", color: "#c45a2c", radius: 34, speed: 0.42, phase: 0.2, size: 5.2 },
    { id: "water", name: "Water", color: "#4a7a9a", radius: 48, speed: 0.34, phase: 1.1, size: 5.4 },
    { id: "air", name: "Air", color: "#9ec4e8", radius: 62, speed: 0.28, phase: 2.0, size: 5.0 },
    { id: "earth", name: "Earth", color: "#8a7350", radius: 76, speed: 0.24, phase: 2.8, size: 5.6 },
    { id: "dust", name: "Dust", color: "#b8a078", radius: 92, speed: 0.2, phase: 0.7, size: 4.6 },
    { id: "mineral", name: "Mineral", color: "#d7ecff", radius: 110, speed: 0.16, phase: 3.4, size: 5.5 },
    { id: "ethereal", name: "Ethereal", color: "#c5a059", radius: 130, speed: 0.13, phase: 4.2, size: 4.4 },
    { id: "astral", name: "Astral Sea", color: "#7eb0c8", radius: 152, speed: 0.1, phase: 5.1, size: 6.2 },
    { id: "void", name: "Digital Void", color: "#a89070", radius: 176, speed: 0.08, phase: 1.6, size: 4.8 },
  ];

  const MARKERS = [
    { label: "Inner Ring · bearing", depth: 0.22, color: "#c5a059" },
    { label: "Ethereal curtain", depth: 0.48, color: "#9ec4e8" },
    { label: "Astral envelope", depth: 0.72, color: "#7eb0c8" },
    { label: "Schism wake", depth: 0.9, color: "#b8a078" },
  ];

  /** Grokbot / Ani will-o’-wisp sprites (art-division race + quest still). */
  const WISP_SRC = "art/races/will-o-wisp.png";
  const WISP_QUEST_SRC = "art/will-o-wisp-race-quest.png";

  const root = document.getElementById("pbLoading");
  const canvas = document.getElementById("pbLoadingCanvas");
  const readoutEl = document.getElementById("pbLoadingReadout");
  const barEl = document.getElementById("pbLoadingBarFill");
  const statusEl = document.getElementById("pbLoadingStatus");
  const skipBtn = document.getElementById("pbLoadingSkip");
  if (!root || !canvas) return;

  const ctx = canvas.getContext("2d", { alpha: false });
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let progress = 0.04;
  let displayProgress = 0.04;
  let startedAt = performance.now();
  let done = false;
  let dismissed = false;
  let animId = 0;
  let dpr = 1;
  let w = 0;
  let h = 0;
  let stars = [];
  const trailHist = BODIES.map(() => []);
  const TRAIL_MAX = 160;
  /** Free-floating Grokbot wisps drifting the envelope. */
  let wisps = [];
  let wispImg = null;
  let wispReady = false;

  const gates = {
    dom: document.readyState !== "loading",
    beings: false,
    fonts: false,
    minTime: false,
  };

  function loadWispArt() {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      wispImg = img;
      wispReady = true;
    };
    img.onerror = () => {
      wispReady = false;
    };
    img.src = WISP_SRC;
    // Warm quest art into HTTP cache for atlas (not drawn full-bleed).
    const warm = new Image();
    warm.src = WISP_QUEST_SRC;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, window.innerWidth);
    h = Math.max(1, window.innerHeight);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedStars();
    seedWisps();
  }

  function seedStars() {
    const n = Math.floor((w * h) / 4800);
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.25,
      a: Math.random() * 0.45 + 0.12,
      tw: Math.random() * Math.PI * 2,
      warm: Math.random() > 0.72,
    }));
  }

  function seedWisps() {
    const n = Math.max(10, Math.floor((w * h) / 90000));
    wisps = Array.from({ length: n }, () => ({
      ang: Math.random() * Math.PI * 2,
      rad: 40 + Math.random() * 150,
      z: Math.random() * 200 - 80,
      speed: 0.08 + Math.random() * 0.12,
      phase: Math.random() * Math.PI * 2,
      size: 10 + Math.random() * 16,
    }));
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function setProgress(p, label) {
    progress = Math.max(progress, Math.min(1, p));
    if (label) setStatus(label);
    refreshChrome();
    maybeComplete();
  }

  function refreshChrome() {
    displayProgress += (progress - displayProgress) * 0.12;
    const pct = Math.round(displayProgress * 1000) / 10;
    const valueNow = Math.round(displayProgress * 100);
    const elapsed = ((performance.now() - startedAt) / 1000) * (0.85 + displayProgress);
    const depth = displayProgress * 128.4;
    if (readoutEl) {
      readoutEl.innerHTML =
        `Elapsed crossing: <strong>${elapsed.toFixed(1)} ly-echo</strong><br>` +
        `Daystar bearing: <strong>${depth.toFixed(1)} planes</strong><br>` +
        `Manifest: <strong>${pct.toFixed(1)}%</strong>`;
    }
    if (barEl) barEl.style.width = `${Math.max(2, displayProgress * 100)}%`;
    const barTrack = document.getElementById("pbLoadingBar");
    if (barTrack) barTrack.setAttribute("aria-valuenow", String(valueNow));
  }

  function markGate(key) {
    gates[key] = true;
    maybeComplete();
  }

  const holdOpen =
    typeof location !== "undefined" &&
    /(?:\?|&)loadingHold=1(?:&|$)/.test(location.search || "");

  function ready() {
    if (holdOpen) return false;
    return gates.dom && gates.beings && gates.fonts && gates.minTime;
  }

  function maybeComplete() {
    if (done || !ready()) return;
    done = true;
    setProgress(1, "Bearing locked");
    setTimeout(dismiss, reduced ? 120 : 420);
  }

  function atlasLayers() {
    return [document.querySelector(".app-shell"), document.getElementById("pageVeil")].filter(Boolean);
  }

  function setAtlasInert(on) {
    atlasLayers().forEach((el) => {
      if (on) el.setAttribute("inert", "");
      else el.removeAttribute("inert");
      el.setAttribute("aria-hidden", on ? "true" : "false");
    });
  }

  function overlayFocusables() {
    const nodes = [
      ...root.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ),
    ];
    if (root.getAttribute("tabindex") === "-1") nodes.unshift(root);
    return nodes.filter((el) => {
      if (el === root) return true;
      if (el.hasAttribute("disabled") || el.getAttribute("aria-hidden") === "true") return false;
      return true;
    });
  }

  function focusOverlay() {
    if (!root.hasAttribute("tabindex")) root.setAttribute("tabindex", "-1");
    try {
      root.focus({ preventScroll: true });
    } catch (_) {
      try {
        root.focus();
      } catch (__) {
        /* ignore */
      }
    }
  }

  function trapOverlayFocus(e) {
    if (dismissed || e.key !== "Tab") return;
    const list = overlayFocusables();
    if (!list.length) {
      e.preventDefault();
      focusOverlay();
      return;
    }
    const first = list[0];
    const last = list[list.length - 1];
    const active = document.activeElement;
    if (e.shiftKey) {
      if (active === first || !root.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else if (active === last || !root.contains(active)) {
      e.preventDefault();
      first.focus();
    }
  }

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    document.removeEventListener("keydown", trapOverlayFocus, true);
    setAtlasInert(false);
    root.dataset.done = "true";
    root.setAttribute("aria-busy", "false");
    root.removeAttribute("tabindex");
    if (animId) cancelAnimationFrame(animId);
    animId = 0;
    document.dispatchEvent(new CustomEvent("planesbound-loading-done"));
    const restore =
      document.getElementById("openPlay") ||
      document.getElementById("videoModeSelect") ||
      document.querySelector(".app-shell button, .app-shell select, #pageMain");
    setTimeout(() => {
      try {
        if (restore && typeof restore.focus === "function") restore.focus({ preventScroll: true });
      } catch (_) {
        /* ignore */
      }
      try {
        root.remove();
      } catch (__) {
        /* ignore */
      }
    }, 700);
  }

  function project(x, y, z, t) {
    // Slower dolly/yaw; larger focal scale so the whole wheel reads bigger.
    const camZ = 200 + t * 3.2;
    const yaw = t * 0.028;
    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);
    const rx = x * cos - z * sin;
    const rz = x * sin + z * cos;
    const ry = y - t * 0.85;
    const denom = Math.max(48, camZ + rz);
    const f = Math.max(0.05, 720 / denom);
    return {
      x: w * 0.5 + rx * f,
      y: h * 0.5 + ry * f,
      s: f,
      depth: rz,
    };
  }

  function drawShell(cx, cy, rx, ry, color, alpha, phase) {
    const erx = Math.max(0.5, Math.abs(rx));
    const ery = Math.max(0.5, Math.abs(ry));
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(phase * 0.008);
    ctx.beginPath();
    ctx.ellipse(0, 0, erx, ery, 0, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    for (let i = 1; i < 3; i++) {
      const k = i / 3;
      ctx.beginPath();
      ctx.ellipse(
        0,
        0,
        Math.max(0.5, erx * Math.sin(Math.PI * k)),
        Math.max(0.5, Math.abs(ery * Math.cos(Math.PI * (k - 0.5)))),
        0,
        0,
        Math.PI * 2
      );
      ctx.globalAlpha = alpha * 0.28;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawWispSprite(px, py, size, alpha) {
    const s = Math.max(8, size);
    ctx.save();
    ctx.globalAlpha = alpha;
    if (wispReady && wispImg) {
      ctx.shadowColor = "rgba(197,160,89,0.55)";
      ctx.shadowBlur = s * 0.55;
      ctx.drawImage(wispImg, px - s / 2, py - s / 2, s, s);
      ctx.shadowBlur = 0;
    } else {
      const g = ctx.createRadialGradient(px, py, 0, px, py, s * 0.55);
      g.addColorStop(0, "rgba(255,242,200,0.95)");
      g.addColorStop(0.35, "rgba(197,160,89,0.7)");
      g.addColorStop(1, "rgba(126,176,200,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, s * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawFrame(now) {
    try {
      drawFrameInner(now);
    } catch (err) {
      console.warn("[pb-loading] frame error", err);
    }
    if (!dismissed) animId = requestAnimationFrame(drawFrame);
  }

  function drawFrameInner(now) {
    const t = (now - startedAt) / 1000;
    // Much slower forward travel so coils read as a majestic wheel.
    const travel = t * (5.5 + displayProgress * 8);

    ctx.fillStyle = "#08060c";
    ctx.fillRect(0, 0, w, h);

    // Brass–astral milky band (no neon violet wash)
    const band = ctx.createLinearGradient(0, h * 0.28, 0, h * 0.72);
    band.addColorStop(0, "rgba(154,122,56,0)");
    band.addColorStop(0.45, "rgba(126,176,200,0.07)");
    band.addColorStop(0.55, "rgba(197,160,89,0.06)");
    band.addColorStop(1, "rgba(154,122,56,0)");
    ctx.fillStyle = band;
    ctx.fillRect(0, 0, w, h);

    for (const s of stars) {
      const tw = reduced ? s.a : s.a * (0.7 + 0.3 * Math.sin(t * 0.9 + s.tw));
      ctx.fillStyle = s.warm ? `rgba(242,230,201,${tw})` : `rgba(220,230,245,${tw})`;
      ctx.fillRect(s.x, s.y, s.r, s.r);
    }

    const coreLocal = { x: 0, y: 0, z: travel };
    const core = project(coreLocal.x, coreLocal.y, coreLocal.z, t);

    const wake = project(0, 0, travel - 120, t);
    drawShell(wake.x + 48, wake.y - 12, 168 * wake.s, 98 * wake.s, "rgba(154,122,56,0.55)", 0.2, t);
    drawShell(wake.x + 64, wake.y + 36, 132 * wake.s, 78 * wake.s, "rgba(126,176,200,0.5)", 0.16, -t);

    const coreRx = Math.max(0.5, 168 * core.s);
    const coreRy = Math.max(0.5, 124 * core.s);
    const coreInner = Math.max(0.5, 12 * core.s);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(core.x, core.y, coreRx, coreRy, t * 0.018, 0, Math.PI * 2);
    const shellFill = ctx.createRadialGradient(core.x, core.y, coreInner, core.x, core.y, coreRx);
    shellFill.addColorStop(0, "rgba(197,160,89,0.2)");
    shellFill.addColorStop(0.45, "rgba(126,176,200,0.1)");
    shellFill.addColorStop(1, "rgba(20,24,40,0)");
    ctx.fillStyle = shellFill;
    ctx.fill();
    ctx.restore();
    drawShell(core.x, core.y, 135 * core.s, 100 * core.s, "#c5a059", 0.42, t * 0.22);
    drawShell(core.x, core.y, 178 * core.s, 132 * core.s, "#9ec4e8", 0.28, -t * 0.16);
    drawShell(core.x, core.y, 218 * core.s, 160 * core.s, "#7eb0c8", 0.14, t * 0.1);

    // Free Grokbot wisps drifting the envelope
    wisps.forEach((wp) => {
      if (!reduced) {
        wp.ang += wp.speed * 0.016;
        wp.z += 0.35;
        if (wp.z > travel + 40) wp.z = travel - 180;
      }
      const lx = Math.cos(wp.ang + wp.phase) * wp.rad;
      const ly = Math.sin(wp.ang + wp.phase) * wp.rad * 0.48;
      const p = project(lx, ly, wp.z, t);
      const pulse = 0.55 + 0.35 * Math.sin(t * 0.7 + wp.phase);
      drawWispSprite(p.x, p.y, wp.size * p.s * 0.04, pulse * 0.85);
    });

    BODIES.forEach((b, i) => {
      const hist = trailHist[i];
      if (!reduced) {
        for (let s = 0; s < 2; s++) {
          const tt = t - s * 0.08;
          const ang = tt * b.speed + b.phase;
          const lx = Math.cos(ang) * b.radius;
          const ly = Math.sin(ang) * b.radius * 0.48;
          const lz = travel - ang * 4.2 - s * 1.6;
          hist.push({ x: lx, y: ly, z: lz });
        }
        while (hist.length > TRAIL_MAX) hist.shift();
      } else if (!hist.length) {
        for (let k = 0; k < 80; k++) {
          const ang = k * 0.22 + b.phase;
          hist.push({
            x: Math.cos(ang) * b.radius,
            y: Math.sin(ang) * b.radius * 0.48,
            z: travel - 120 + k * 3.4,
          });
        }
      }

      // Soft brass/astral trail (painterly, not HUD neon)
      ctx.beginPath();
      hist.forEach((p, idx) => {
        const pr = project(p.x, p.y, p.z, t);
        if (idx === 0) ctx.moveTo(pr.x, pr.y);
        else ctx.lineTo(pr.x, pr.y);
      });
      ctx.strokeStyle = b.color;
      ctx.globalAlpha = 0.38;
      ctx.lineWidth = 2.1;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      ctx.globalAlpha = 0.16;
      ctx.lineWidth = 5.5;
      ctx.stroke();
      ctx.globalAlpha = 1;

      const tip = hist[hist.length - 1];
      if (!tip) return;
      const p = project(tip.x, tip.y, tip.z, t);
      const spriteSize = Math.max(18, b.size * p.s * 1.85);
      drawWispSprite(p.x, p.y, spriteSize, 0.95);

      // Brass serif-ish labels (canvas approximates Cinzel with serif stack)
      ctx.font = "600 13px Cinzel, 'Times New Roman', serif";
      ctx.fillStyle = "rgba(242,230,201,0.94)";
      const lx = p.x + spriteSize * 0.42;
      const ly = p.y - spriteSize * 0.2;
      ctx.beginPath();
      ctx.moveTo(p.x + spriteSize * 0.28, p.y);
      ctx.lineTo(lx - 2, ly + 3);
      ctx.strokeStyle = "rgba(197,160,89,0.55)";
      ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.strokeStyle = "rgba(12,10,8,0.55)";
      ctx.lineWidth = 3.5;
      ctx.strokeText(b.name, lx, ly);
      ctx.fillText(b.name, lx, ly);
    });

    // Daystar / Lighthouse core — brass ember
    const glowR = Math.max(1, 42 * core.s);
    const glow = ctx.createRadialGradient(core.x, core.y, 0, core.x, core.y, glowR);
    glow.addColorStop(0, "#fff4d4");
    glow.addColorStop(0.2, "#e8c878");
    glow.addColorStop(0.55, "#c5a059");
    glow.addColorStop(1, "rgba(154,122,56,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(core.x, core.y, glowR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(core.x, core.y, Math.max(4, 8 * core.s), 0, Math.PI * 2);
    ctx.fillStyle = "#f2e6c9";
    ctx.fill();

    ctx.strokeStyle = "rgba(197,160,89,0.75)";
    ctx.fillStyle = "rgba(242,230,201,0.9)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(core.x + 16 * core.s, core.y - 24 * core.s);
    ctx.lineTo(core.x + 48 * core.s, core.y - 36 * core.s);
    ctx.lineTo(core.x + 42 * core.s, core.y - 28 * core.s);
    ctx.moveTo(core.x + 48 * core.s, core.y - 36 * core.s);
    ctx.lineTo(core.x + 38 * core.s, core.y - 38 * core.s);
    ctx.stroke();
    ctx.font = "600 12px Cinzel, 'Times New Roman', serif";
    ctx.fillText("Daystar bearing →", core.x + 52 * core.s, core.y - 38 * core.s);

    MARKERS.forEach((m, i) => {
      const mz = travel - 55 - i * 36;
      const p = project(150 + i * 10, -55 + i * 14, mz, t);
      ctx.fillStyle = m.color;
      ctx.globalAlpha = 0.88;
      ctx.font = "600 11px 'Source Serif 4', Georgia, serif";
      ctx.fillText(`${m.label} · ${Math.round(m.depth * 120)} depth`, p.x, p.y);
      ctx.globalAlpha = 1;
    });

    refreshChrome();
  }

  function watchAssets() {
    document.addEventListener(
      "planesbound-beings-ready",
      () => {
        setProgress(0.82, "Roster manifested");
        markGate("beings");
      },
      { once: true }
    );

    const poll = setInterval(() => {
      if (window.PlanesboundBeings?.count?.() > 0) {
        clearInterval(poll);
        setProgress(0.82, "Roster manifested");
        markGate("beings");
      }
    }, 200);
    setTimeout(() => {
      clearInterval(poll);
      if (!gates.beings) {
        setProgress(0.75, "Charting shores");
        markGate("beings");
      }
    }, 8000);

    const FONT_TIMEOUT_MS = 8000;
    const finishFonts = () => {
      if (gates.fonts) return;
      setProgress(0.55, "Ink & type set");
      markGate("fonts");
    };
    if (document.fonts?.ready) {
      Promise.race([
        document.fonts.ready.then(() => "ready"),
        new Promise((resolve) => setTimeout(() => resolve("timeout"), FONT_TIMEOUT_MS)),
      ])
        .then(finishFonts)
        .catch(finishFonts);
    } else {
      finishFonts();
    }

    if (gates.dom) setProgress(0.2, "Atlas frame up");
    else {
      document.addEventListener(
        "DOMContentLoaded",
        () => {
          gates.dom = true;
          setProgress(0.2, "Atlas frame up");
          maybeComplete();
        },
        { once: true }
      );
    }

    const soft = setInterval(() => {
      if (done) {
        clearInterval(soft);
        return;
      }
      if (progress < 0.7) setProgress(progress + 0.015, statusEl?.textContent || "Crossing…");
    }, 180);

    setTimeout(() => {
      gates.minTime = true;
      setProgress(Math.max(progress, 0.9), "Locking bearing");
      maybeComplete();
    }, MIN_MS);

    setTimeout(() => {
      if (!skipBtn) return;
      skipBtn.dataset.show = "true";
      skipBtn.disabled = false;
      skipBtn.removeAttribute("aria-hidden");
      if (document.activeElement === root || !root.contains(document.activeElement)) {
        try {
          skipBtn.focus({ preventScroll: true });
        } catch (_) {
          skipBtn.focus();
        }
      }
    }, SKIP_AFTER_MS);
  }

  skipBtn?.addEventListener("click", () => {
    if (skipBtn.dataset.show !== "true" || skipBtn.disabled) return;
    Object.keys(gates).forEach((k) => {
      gates[k] = true;
    });
    setProgress(1, "Entered");
    if (holdOpen) {
      done = true;
      dismiss();
      return;
    }
    maybeComplete();
  });

  window.PlanesboundLoading = {
    setProgress,
    complete: () => {
      Object.keys(gates).forEach((k) => {
        gates[k] = true;
      });
      maybeComplete();
    },
    isDone: () => dismissed,
  };

  function armModalFocus() {
    setAtlasInert(true);
    root.setAttribute("tabindex", "-1");
    document.addEventListener("keydown", trapOverlayFocus, true);
    focusOverlay();
  }

  loadWispArt();
  resize();
  window.addEventListener("resize", resize);
  setStatus("Opening the Astral Sea…");
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", armModalFocus, { once: true });
  } else {
    armModalFocus();
  }
  watchAssets();
  animId = requestAnimationFrame(drawFrame);
})();
