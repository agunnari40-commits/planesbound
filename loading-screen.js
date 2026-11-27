/* Planesbound PAS-31 — helical Astral Sea loading screen */
(function () {
  const MIN_MS = 2600;
  const SKIP_AFTER_MS = 1400;

  /** Planesbound shores riding the Daystar helix (not solar planets). */
  const BODIES = [
    { id: "fire", name: "Fire", color: "#c45a2c", radius: 18, speed: 1.35, phase: 0.2, size: 3.2 },
    { id: "water", name: "Water", color: "#3d8eb5", radius: 26, speed: 1.05, phase: 1.1, size: 3.4 },
    { id: "air", name: "Air", color: "#9ec4e8", radius: 34, speed: 0.88, phase: 2.0, size: 3.1 },
    { id: "earth", name: "Earth", color: "#8a7350", radius: 42, speed: 0.72, phase: 2.8, size: 3.6 },
    { id: "dust", name: "Dust", color: "#b8a078", radius: 52, speed: 0.58, phase: 0.7, size: 2.8 },
    { id: "mineral", name: "Mineral", color: "#d7ecff", radius: 62, speed: 0.48, phase: 3.4, size: 3.3 },
    { id: "ethereal", name: "Ethereal", color: "#c9a0ff", radius: 74, speed: 0.38, phase: 4.2, size: 2.6 },
    { id: "astral", name: "Astral Sea", color: "#7eb0c8", radius: 88, speed: 0.3, phase: 5.1, size: 4.0 },
    { id: "void", name: "Digital Void", color: "#7dffb3", radius: 102, speed: 0.24, phase: 1.6, size: 2.9 },
  ];

  const MARKERS = [
    { label: "Inner Ring · bearing", depth: 0.22, color: "#9ec4e8" },
    { label: "Ethereal curtain", depth: 0.48, color: "#c9a0ff" },
    { label: "Astral envelope", depth: 0.72, color: "#3d6cff" },
    { label: "Schism wake", depth: 0.9, color: "#7dffb3" },
  ];

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
  const TRAIL_MAX = 140;

  const gates = {
    dom: document.readyState !== "loading",
    beings: false,
    fonts: false,
    minTime: false,
  };

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
  }

  function seedStars() {
    const n = Math.floor((w * h) / 4200);
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.2,
      a: Math.random() * 0.55 + 0.15,
      tw: Math.random() * Math.PI * 2,
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

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    root.dataset.done = "true";
    root.setAttribute("aria-busy", "false");
    if (animId) cancelAnimationFrame(animId);
    animId = 0;
    document.dispatchEvent(new CustomEvent("planesbound-loading-done"));
    setTimeout(() => {
      try {
        root.remove();
      } catch (_) {
        /* ignore */
      }
    }, 700);
  }

  function project(x, y, z, t) {
    // Soft perspective camera dollying back + slight yaw over time.
    // Floor the denominator so long ?loadingHold=1 runs never flip scale negative
    // (Canvas ellipse/arc/createRadialGradient throw IndexSizeError on r < 0).
    const camZ = 220 + t * 8;
    const yaw = t * 0.08;
    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);
    const rx = x * cos - z * sin;
    const rz = x * sin + z * cos;
    const ry = y - t * 2.2;
    const denom = Math.max(48, camZ + rz);
    const f = Math.max(0.05, 520 / denom);
    return {
      x: w * 0.52 + rx * f,
      y: h * 0.48 + ry * f,
      s: f,
      depth: rz,
    };
  }

  function drawShell(cx, cy, rx, ry, color, alpha, phase) {
    const erx = Math.max(0.5, Math.abs(rx));
    const ery = Math.max(0.5, Math.abs(ry));
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(phase * 0.02);
    ctx.beginPath();
    ctx.ellipse(0, 0, erx, ery, 0, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 1.25;
    ctx.stroke();
    // wire latitude hints
    for (let i = 1; i < 4; i++) {
      const k = i / 4;
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
      ctx.globalAlpha = alpha * 0.35;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawFrame(now) {
    try {
      drawFrameInner(now);
    } catch (err) {
      // Keep the capture loop alive if a single frame throws (e.g. hold mode).
      console.warn("[pb-loading] frame error", err);
    }
    if (!dismissed) animId = requestAnimationFrame(drawFrame);
  }

  function drawFrameInner(now) {
    const t = (now - startedAt) / 1000;
    const travel = t * (14 + displayProgress * 22);

    ctx.fillStyle = "#02010a";
    ctx.fillRect(0, 0, w, h);

    // faint milky band
    const band = ctx.createLinearGradient(0, h * 0.35, 0, h * 0.65);
    band.addColorStop(0, "rgba(80,90,140,0)");
    band.addColorStop(0.5, "rgba(120,140,200,0.08)");
    band.addColorStop(1, "rgba(80,90,140,0)");
    ctx.fillStyle = band;
    ctx.fillRect(0, 0, w, h);

    for (const s of stars) {
      const tw = reduced ? s.a : s.a * (0.65 + 0.35 * Math.sin(t * 1.4 + s.tw));
      ctx.fillStyle = `rgba(220,230,255,${tw})`;
      ctx.fillRect(s.x, s.y, s.r, s.r);
    }

    // Core path (Daystar) moving in +Z of local helix frame
    const coreLocal = { x: 0, y: 0, z: travel };
    const core = project(coreLocal.x, coreLocal.y, coreLocal.z, t);

    // Outer schism wakes (behind)
    const wake = project(0, 0, travel - 90, t);
    drawShell(wake.x + 40, wake.y - 10, 120 * wake.s, 70 * wake.s, "#2f8f5b", 0.22, t);
    drawShell(wake.x + 55, wake.y + 30, 95 * wake.s, 55 * wake.s, "#8b3a6b", 0.18, -t);

    // Astral envelope around core (filled haze + wire)
    const coreRx = Math.max(0.5, 118 * core.s);
    const coreRy = Math.max(0.5, 88 * core.s);
    const coreInner = Math.max(0.5, 8 * core.s);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(core.x, core.y, coreRx, coreRy, t * 0.05, 0, Math.PI * 2);
    const shellFill = ctx.createRadialGradient(core.x, core.y, coreInner, core.x, core.y, coreRx);
    shellFill.addColorStop(0, "rgba(90,40,160,0.22)");
    shellFill.addColorStop(0.55, "rgba(40,80,220,0.12)");
    shellFill.addColorStop(1, "rgba(20,40,120,0)");
    ctx.fillStyle = shellFill;
    ctx.fill();
    ctx.restore();
    drawShell(core.x, core.y, 95 * core.s, 72 * core.s, "#3d6cff", 0.45, t * 0.6);
    drawShell(core.x, core.y, 128 * core.s, 98 * core.s, "#b06bff", 0.28, -t * 0.4);
    drawShell(core.x, core.y, 155 * core.s, 118 * core.s, "#7dffb3", 0.12, t * 0.25);

    // Helical trails + bodies
    BODIES.forEach((b, i) => {
      const hist = trailHist[i];
      if (!reduced) {
        // Sample several helix points per frame so coils read as corkscrews, not flat rings.
        for (let s = 0; s < 3; s++) {
          const tt = t - s * 0.045;
          const ang = tt * b.speed + b.phase;
          const lx = Math.cos(ang) * b.radius;
          const ly = Math.sin(ang) * b.radius * 0.42;
          const lz = travel - ang * 5.8 - s * 1.2;
          hist.push({ x: lx, y: ly, z: lz });
        }
        while (hist.length > TRAIL_MAX) hist.shift();
      } else if (!hist.length) {
        for (let k = 0; k < 70; k++) {
          const ang = k * 0.28 + b.phase;
          hist.push({
            x: Math.cos(ang) * b.radius,
            y: Math.sin(ang) * b.radius * 0.42,
            z: travel - 90 + k * 3.1,
          });
        }
      }

      ctx.beginPath();
      hist.forEach((p, idx) => {
        const pr = project(p.x, p.y, p.z, t);
        if (idx === 0) ctx.moveTo(pr.x, pr.y);
        else ctx.lineTo(pr.x, pr.y);
      });
      ctx.strokeStyle = b.color;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.globalAlpha = 1;

      const tip = hist[hist.length - 1];
      if (!tip) return;
      const p = project(tip.x, tip.y, tip.z, t);
      const r = Math.max(1.6, b.size * p.s * 0.9);
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // label
      ctx.font = "600 11px ui-monospace, Menlo, monospace";
      ctx.fillStyle = "rgba(230,240,255,0.92)";
      ctx.strokeStyle = "rgba(10,14,28,0.55)";
      ctx.lineWidth = 3;
      const lx = p.x + 10;
      const ly = p.y - 8;
      ctx.beginPath();
      ctx.moveTo(p.x + r + 1, p.y);
      ctx.lineTo(lx - 2, ly + 3);
      ctx.strokeStyle = "rgba(200,220,255,0.45)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillText(b.name, lx, ly);
    });

    // Daystar core
    const glowR = Math.max(1, 28 * core.s);
    const glow = ctx.createRadialGradient(core.x, core.y, 0, core.x, core.y, glowR);
    glow.addColorStop(0, "#fff2c8");
    glow.addColorStop(0.25, "#ff8a3d");
    glow.addColorStop(1, "rgba(255,100,40,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(core.x, core.y, glowR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(core.x, core.y, Math.max(3, 5.5 * core.s), 0, Math.PI * 2);
    ctx.fillStyle = "#ffe7a8";
    ctx.fill();

    // Direction arrow + brand label near core
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(core.x + 12 * core.s, core.y - 18 * core.s);
    ctx.lineTo(core.x + 38 * core.s, core.y - 28 * core.s);
    ctx.lineTo(core.x + 34 * core.s, core.y - 22 * core.s);
    ctx.moveTo(core.x + 38 * core.s, core.y - 28 * core.s);
    ctx.lineTo(core.x + 30 * core.s, core.y - 30 * core.s);
    ctx.stroke();
    ctx.font = "600 11px ui-monospace, Menlo, monospace";
    ctx.fillText("Daystar bearing →", core.x + 42 * core.s, core.y - 30 * core.s);

    // Depth markers
    MARKERS.forEach((m, i) => {
      const mz = travel - 40 - i * 28;
      const p = project(110 + i * 8, -40 + i * 12, mz, t);
      ctx.fillStyle = m.color;
      ctx.globalAlpha = 0.85;
      ctx.font = "10px ui-monospace, Menlo, monospace";
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

    // Fallback if beings already ready or never fires
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

    // Fonts gate: never stall forever if Google Fonts / document.fonts hangs
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

    // Soft progress while waiting
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
    }, SKIP_AFTER_MS);
  }

  skipBtn?.addEventListener("click", () => {
    // Ignore clicks while skip is still hidden (opacity-only was bypassable via hover)
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

  resize();
  window.addEventListener("resize", resize);
  setStatus("Opening the Astral Sea…");
  watchAssets();
  animId = requestAnimationFrame(drawFrame);
})();
