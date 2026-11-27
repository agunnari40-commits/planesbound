/* Planesbound PAS-3/29/30 — virtualized pickers + race/being avatar art */
(function () {
  const ROW = 40;
  const OVERSCAN = 8;
  const PLAYER_KEY = "planesbound-player-being-v1";
  const COMPANION_KEY = "planesbound-companion-being-v1";
  const ART_DIR = "art/races";
  const TRADITIONS = new Set(["core", "srd", "folklore", "original"]);

  /** Shared selection roles. Each mount binds UI ids via `prefix`. */
  const MOUNTS = [
    { role: "player", prefix: "player" },
    { role: "companion", prefix: "companion" },
    { role: "player", prefix: "gamePlayer", startForm: true },
    { role: "companion", prefix: "gameCompanion", startForm: true },
  ];

  /** Extra avatar slots outside picker mounts (companion handout, etc.). */
  const EXTRA_PORTRAITS = [
    { role: "player", id: "handoutPlayerPortrait" },
    { role: "companion", id: "handoutCompanionPortrait" },
  ];

  function traditionKey(tradition) {
    const t = String(tradition || "core").toLowerCase();
    return TRADITIONS.has(t) ? t : "core";
  }

  function placeholderSrc(tradition) {
    return `${ART_DIR}/_placeholder-${traditionKey(tradition)}.png`;
  }

  /** Primary race art path for a being object or id string. */
  function raceArtSrc(beingOrId) {
    if (!beingOrId) return `${ART_DIR}/_placeholder.png`;
    if (typeof beingOrId === "string") return `${ART_DIR}/${beingOrId}.png`;
    if (beingOrId.id) return `${ART_DIR}/${beingOrId.id}.png`;
    return `${ART_DIR}/_placeholder.png`;
  }

  function bindPortraitFallback(img, being) {
    if (!img) return;
    img.onerror = () => {
      const next = placeholderSrc(being?.tradition);
      if (img.dataset.fallback === "tradition") {
        img.onerror = null;
        img.src = `${ART_DIR}/_placeholder.png`;
        return;
      }
      img.dataset.fallback = "tradition";
      img.src = next;
    };
  }

  function applyPortrait(img, being) {
    if (!img || !being) return;
    delete img.dataset.fallback;
    img.alt = `${being.name} portrait`;
    img.dataset.being = being.id;
    img.dataset.tradition = being.tradition || "core";
    bindPortraitFallback(img, being);
    const src = raceArtSrc(being);
    if (img.getAttribute("src") !== src) img.src = src;
  }

  /** @type {{id:string,name:string,tradition:string,line:string}[]} */
  let beings = [];
  /** @type {Record<string, typeof beings>} */
  const filtered = {};
  let selected = { player: "human", companion: "human" };
  /** open key = `${prefix}` of the open mount */
  let openMount = null;

  const dock = () => document.getElementById("racesDock");
  const countEl = () => document.getElementById("racesCount");

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function byId(id) {
    return beings.find((b) => b.id === id) || beings[0];
  }

  function ids(prefix) {
    return {
      toggle: `${prefix}BeingToggle`,
      list: `${prefix}BeingList`,
      search: `${prefix}BeingSearch`,
      viewport: `${prefix}BeingViewport`,
      spacer: `${prefix}BeingSpacer`,
      window: `${prefix}BeingWindow`,
      name: `${prefix}BeingName`,
      line: `${prefix}BeingLine`,
      tag: `${prefix}BeingTag`,
      label: `${prefix}BeingLabel`,
      count: `${prefix}BeingCount`,
      hidden: `${prefix}Being`,
      // One portrait id per mount prefix (dock + Play-start each have their own).
      portrait: `${prefix}BeingPortrait`,
    };
  }

  function persist() {
    localStorage.setItem(PLAYER_KEY, selected.player);
    localStorage.setItem(COMPANION_KEY, selected.companion);
    document.dispatchEvent(
      new CustomEvent("planesbound-beings-changed", {
        detail: {
          player: byId(selected.player),
          companion: byId(selected.companion),
        },
      })
    );
    renderAllPicks();
  }

  function renderMountPick(mount) {
    const role = mount.role;
    const b = byId(selected[role]);
    const id = ids(mount.prefix);
    const nameEl = document.getElementById(id.name);
    const lineEl = document.getElementById(id.line);
    const tagEl = document.getElementById(id.tag);
    const labelEl = document.getElementById(id.label);
    const hidden = document.getElementById(id.hidden);
    const countNode = document.getElementById(id.count);
    if (nameEl) nameEl.textContent = b.name;
    if (lineEl) lineEl.textContent = b.line;
    if (tagEl) tagEl.textContent = b.tradition;
    if (labelEl) {
      labelEl.textContent = `${b.name} · ${b.tradition}`;
    }
    if (hidden && "value" in hidden) hidden.value = b.id;
    if (countNode) countNode.textContent = String(beings.length);
    applyPortrait(document.getElementById(id.portrait), b);
  }

  function renderExtraPortraits() {
    EXTRA_PORTRAITS.forEach(({ role, id }) => {
      applyPortrait(document.getElementById(id), byId(selected[role]));
    });
  }

  function renderAllPicks() {
    MOUNTS.forEach(renderMountPick);
    renderExtraPortraits();
  }

  function applyFilter(mount) {
    const id = ids(mount.prefix);
    const q = (document.getElementById(id.search)?.value || "").trim().toLowerCase();
    filtered[mount.prefix] = !q
      ? beings.slice()
      : beings.filter(
          (b) =>
            b.name.toLowerCase().includes(q) ||
            b.tradition.toLowerCase().includes(q) ||
            b.line.toLowerCase().includes(q) ||
            b.id.toLowerCase().includes(q)
        );
    const viewport = document.getElementById(id.viewport);
    if (viewport) viewport.scrollTop = 0;
    renderVirtual(mount);
  }

  function renderVirtual(mount) {
    const id = ids(mount.prefix);
    const viewport = document.getElementById(id.viewport);
    const spacer = document.getElementById(id.spacer);
    const windowEl = document.getElementById(id.window);
    if (!viewport || !spacer || !windowEl) return;

    const list = filtered[mount.prefix] || [];
    spacer.style.height = `${list.length * ROW}px`;
    const scrollTop = viewport.scrollTop;
    let start = Math.max(0, Math.floor(scrollTop / ROW) - OVERSCAN);
    const visible = Math.ceil(viewport.clientHeight / ROW) + OVERSCAN * 2;
    let end = Math.min(list.length, start + visible);
    windowEl.style.transform = `translateY(${start * ROW}px)`;

    const parts = [];
    for (let i = start; i < end; i++) {
      const b = list[i];
      const active = b.id === selected[mount.role] ? "true" : "false";
      parts.push(
        `<button type="button" class="being-row" data-prefix="${escapeHtml(mount.prefix)}" data-role="${mount.role}" data-id="${escapeHtml(
          b.id
        )}" data-active="${active}" style="height:${ROW}px">` +
          `<img class="being-thumb" src="${escapeHtml(raceArtSrc(b))}" alt="" width="24" height="24" loading="lazy" decoding="async" data-trad="${escapeHtml(
            b.tradition
          )}" onerror="this.onerror=null;this.src='${escapeHtml(placeholderSrc(b.tradition))}'" />` +
          `<span class="being-name">${escapeHtml(b.name)}</span>` +
          `<span class="being-trad">${escapeHtml(b.tradition)}</span>` +
          `</button>`
      );
    }
    windowEl.innerHTML = parts.join("");
  }

  function pick(role, beingId, closePrefix) {
    selected[role] = beingId;
    persist();
    MOUNTS.filter((m) => m.role === role).forEach(renderVirtual);
    const mount = closePrefix ? mountByPrefix(closePrefix) : null;
    // Dock picks open the sheet creation loop; Play-start picks must not.
    if (!mount?.startForm) {
      document.dispatchEvent(
        new CustomEvent("planesbound-race-picked", {
          detail: { role, being: byId(beingId), source: "dock" },
        })
      );
    }
    if (closePrefix) setListOpen(closePrefix, false);
  }

  function mountByPrefix(prefix) {
    return MOUNTS.find((m) => m.prefix === prefix) || null;
  }

  function setListOpen(prefix, open) {
    const mount = mountByPrefix(prefix);
    if (!mount) return;
    const id = ids(prefix);
    const panel = document.getElementById(id.list);
    const btn = document.getElementById(id.toggle);
    const card = panel?.closest(".being-card, .game-field--picker");
    if (!panel || !btn) return;
    if (open) {
      if (openMount && openMount !== prefix) setListOpen(openMount, false);
      openMount = prefix;
      panel.hidden = false;
      panel.dataset.open = "true";
      btn.setAttribute("aria-expanded", "true");
      card?.classList.add("is-list-open");
      applyFilter(mount);
      requestAnimationFrame(() => {
        const viewport = document.getElementById(id.viewport);
        const list = filtered[prefix] || [];
        const idx = Math.max(
          0,
          list.findIndex((b) => b.id === selected[mount.role])
        );
        if (viewport) viewport.scrollTop = Math.max(0, idx * ROW - ROW * 3);
        renderVirtual(mount);
        document.getElementById(id.search)?.focus();
      });
    } else {
      if (openMount === prefix) openMount = null;
      panel.hidden = true;
      panel.dataset.open = "false";
      btn.setAttribute("aria-expanded", "false");
      card?.classList.remove("is-list-open");
    }
  }

  function wireMount(mount) {
    const id = ids(mount.prefix);
    const toggle = document.getElementById(id.toggle);
    const viewport = document.getElementById(id.viewport);
    const search = document.getElementById(id.search);
    const list = document.getElementById(id.list);
    if (!toggle || !list) return;

    filtered[mount.prefix] = beings.slice();

    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      const open = list.dataset.open !== "true";
      setListOpen(mount.prefix, open);
    });

    search?.addEventListener("input", () => applyFilter(mount));
    // Prevent Enter in search from submitting #gameStartForm (or any parent form).
    search?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    viewport?.addEventListener(
      "scroll",
      () => renderVirtual(mount),
      { passive: true }
    );

    const DRAG_THRESHOLD = 6;
    let pointerActive = false;
    let dragging = false;
    let startY = 0;
    let startScroll = 0;
    let pointerId = null;

    viewport?.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      pointerActive = true;
      dragging = false;
      startY = e.clientY;
      startScroll = viewport.scrollTop;
      pointerId = e.pointerId;
    });
    viewport?.addEventListener("pointermove", (e) => {
      if (!pointerActive || e.pointerId !== pointerId) return;
      const dy = e.clientY - startY;
      if (!dragging && Math.abs(dy) >= DRAG_THRESHOLD) {
        dragging = true;
        viewport.setPointerCapture(e.pointerId);
        viewport.classList.add("is-dragging");
      }
      if (dragging) {
        viewport.scrollTop = startScroll - dy;
      }
    });
    let suppressClick = false;
    const endDrag = (e) => {
      if (!pointerActive || (pointerId != null && e.pointerId !== pointerId)) return;
      const wasDragging = dragging;
      pointerActive = false;
      dragging = false;
      pointerId = null;
      viewport.classList.remove("is-dragging");
      if (wasDragging) {
        suppressClick = true;
        try {
          viewport.releasePointerCapture(e.pointerId);
        } catch (_) {
          /* ignore */
        }
      }
    };
    viewport?.addEventListener("pointerup", endDrag);
    viewport?.addEventListener("pointercancel", endDrag);

    list.addEventListener("click", (e) => {
      if (suppressClick) {
        suppressClick = false;
        return;
      }
      const row = e.target.closest(".being-row");
      if (!row) return;
      pick(row.dataset.role, row.dataset.id, row.dataset.prefix || mount.prefix);
    });
  }

  async function init() {
    const res = await fetch("data/beings.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load beings catalog");
    const data = await res.json();
    beings = Array.isArray(data.beings) ? data.beings : [];
    if (!beings.length || beings[0].id !== "human") {
      const human = beings.find((b) => b.id === "human");
      beings = human ? [human, ...beings.filter((b) => b.id !== "human")] : beings;
    }

    selected.player = localStorage.getItem(PLAYER_KEY) || "human";
    selected.companion = localStorage.getItem(COMPANION_KEY) || "human";
    if (!byId(selected.player)) selected.player = "human";
    if (!byId(selected.companion)) selected.companion = "human";

    if (countEl()) {
      countEl().textContent = `${beings.length} races & beings`;
    }

    MOUNTS.forEach(wireMount);
    renderAllPicks();

    // Capture so Play's Escape → exitPlay handler does not also fire.
    document.addEventListener(
      "keydown",
      (e) => {
        if (e.key !== "Escape" || !openMount) return;
        e.preventDefault();
        e.stopPropagation();
        setListOpen(openMount, false);
      },
      true
    );

    document.addEventListener("click", (e) => {
      if (!openMount) return;
      const id = ids(openMount);
      const panel = document.getElementById(id.list);
      const toggle = document.getElementById(id.toggle);
      if (panel?.contains(e.target) || toggle?.contains(e.target)) return;
      setListOpen(openMount, false);
    });

    window.PlanesboundBeings = {
      getPlayer: () => byId(selected.player),
      getCompanion: () => byId(selected.companion),
      all: () => beings.slice(),
      count: () => beings.length,
      artSrc: raceArtSrc,
      placeholderSrc,
      applyPortrait,
      setSelection(playerId, companionId) {
        if (playerId && byId(playerId)) selected.player = playerId;
        if (companionId && byId(companionId)) selected.companion = companionId;
        localStorage.setItem(PLAYER_KEY, selected.player);
        localStorage.setItem(COMPANION_KEY, selected.companion);
        renderAllPicks();
        MOUNTS.forEach((m) => {
          filtered[m.prefix] = beings.slice();
          renderVirtual(m);
        });
        document.dispatchEvent(
          new CustomEvent("planesbound-beings-changed", {
            detail: {
              player: byId(selected.player),
              companion: byId(selected.companion),
            },
          })
        );
      },
    };

    document.addEventListener("planesbound-beings-changed", (e) => {
      const p = e.detail?.player?.id;
      const c = e.detail?.companion?.id;
      let changed = false;
      if (p && byId(p) && selected.player !== p) {
        selected.player = p;
        changed = true;
      }
      if (c && byId(c) && selected.companion !== c) {
        selected.companion = c;
        changed = true;
      }
      if (changed) renderAllPicks();
    });

    document.dispatchEvent(
      new CustomEvent("planesbound-beings-ready", {
        detail: { count: beings.length },
      })
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      init().catch((err) => console.error(err));
    });
  } else {
    init().catch((err) => console.error(err));
  }
})();
