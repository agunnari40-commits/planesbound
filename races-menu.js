/* Planesbound PAS-3 — left races dock + virtualized being pickers */
(function () {
  const ROW = 40;
  const OVERSCAN = 8;
  const PLAYER_KEY = "planesbound-player-being-v1";
  const COMPANION_KEY = "planesbound-companion-being-v1";
  const ART_DIR = "art/races";

  function raceArtSrc(being) {
    if (!being) return `${ART_DIR}/_placeholder.png`;
    return `${ART_DIR}/${being.id}.png`;
  }

  /** @type {{id:string,name:string,tradition:string,line:string}[]} */
  let beings = [];
  let filtered = { player: [], companion: [] };
  let selected = { player: "human", companion: "human" };
  let openList = null; // 'player' | 'companion' | null

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
    renderPicks();
  }

  function renderPicks() {
    ["player", "companion"].forEach((role) => {
      const b = byId(selected[role]);
      const nameEl = document.getElementById(`${role}BeingName`);
      const lineEl = document.getElementById(`${role}BeingLine`);
      const tagEl = document.getElementById(`${role}BeingTag`);
      const portrait = document.getElementById(`${role}BeingPortrait`);
      if (nameEl) nameEl.textContent = b.name;
      if (lineEl) lineEl.textContent = b.line;
      if (tagEl) tagEl.textContent = b.tradition;
      if (portrait) {
        portrait.alt = `${b.name} portrait`;
        portrait.dataset.being = b.id;
        portrait.dataset.tradition = b.tradition;
        portrait.src = raceArtSrc(b);
        portrait.onerror = () => {
          portrait.onerror = null;
          portrait.src = `${ART_DIR}/_placeholder-${b.tradition || "core"}.png`;
        };
      }
    });
  }

  function applyFilter(role) {
    const q = (document.getElementById(`${role}BeingSearch`)?.value || "")
      .trim()
      .toLowerCase();
    filtered[role] = !q
      ? beings.slice()
      : beings.filter(
          (b) =>
            b.name.toLowerCase().includes(q) ||
            b.tradition.toLowerCase().includes(q) ||
            b.line.toLowerCase().includes(q)
        );
    const viewport = document.getElementById(`${role}BeingViewport`);
    if (viewport) viewport.scrollTop = 0;
    renderVirtual(role);
  }

  function renderVirtual(role) {
    const viewport = document.getElementById(`${role}BeingViewport`);
    const spacer = document.getElementById(`${role}BeingSpacer`);
    const windowEl = document.getElementById(`${role}BeingWindow`);
    if (!viewport || !spacer || !windowEl) return;

    const list = filtered[role];
    spacer.style.height = `${list.length * ROW}px`;
    const scrollTop = viewport.scrollTop;
    let start = Math.max(0, Math.floor(scrollTop / ROW) - OVERSCAN);
    const visible = Math.ceil(viewport.clientHeight / ROW) + OVERSCAN * 2;
    let end = Math.min(list.length, start + visible);
    windowEl.style.transform = `translateY(${start * ROW}px)`;

    const parts = [];
    for (let i = start; i < end; i++) {
      const b = list[i];
      const active = b.id === selected[role] ? "true" : "false";
      parts.push(
        `<button type="button" class="being-row" data-role="${role}" data-id="${escapeHtml(
          b.id
        )}" data-active="${active}" style="height:${ROW}px">` +
          `<img class="being-thumb" src="${escapeHtml(raceArtSrc(b))}" alt="" width="24" height="24" loading="lazy" decoding="async" data-trad="${escapeHtml(
            b.tradition
          )}" onerror="this.onerror=null;this.src='${ART_DIR}/_placeholder-${escapeHtml(
            b.tradition || "core"
          )}.png'" />` +
          `<span class="being-name">${escapeHtml(b.name)}</span>` +
          `<span class="being-trad">${escapeHtml(b.tradition)}</span>` +
          `</button>`
      );
    }
    windowEl.innerHTML = parts.join("");
  }

  function pick(role, id) {
    selected[role] = id;
    persist();
    renderVirtual(role);
  }

  function setListOpen(role, open) {
    const panel = document.getElementById(`${role}BeingList`);
    const btn = document.getElementById(`${role}BeingToggle`);
    const card = panel?.closest(".being-card");
    if (!panel || !btn) return;
    if (open) {
      if (openList && openList !== role) setListOpen(openList, false);
      openList = role;
      panel.hidden = false;
      panel.dataset.open = "true";
      btn.setAttribute("aria-expanded", "true");
      card?.classList.add("is-list-open");
      applyFilter(role);
      requestAnimationFrame(() => {
        const viewport = document.getElementById(`${role}BeingViewport`);
        const idx = Math.max(
          0,
          filtered[role].findIndex((b) => b.id === selected[role])
        );
        if (viewport) viewport.scrollTop = Math.max(0, idx * ROW - ROW * 3);
        renderVirtual(role);
        document.getElementById(`${role}BeingSearch`)?.focus();
      });
    } else {
      if (openList === role) openList = null;
      panel.hidden = true;
      panel.dataset.open = "false";
      btn.setAttribute("aria-expanded", "false");
      card?.classList.remove("is-list-open");
    }
  }

  function wireRole(role) {
    const toggle = document.getElementById(`${role}BeingToggle`);
    const viewport = document.getElementById(`${role}BeingViewport`);
    const search = document.getElementById(`${role}BeingSearch`);
    const list = document.getElementById(`${role}BeingList`);

    toggle?.addEventListener("click", () => {
      const open = list?.dataset.open !== "true";
      setListOpen(role, open);
    });

    search?.addEventListener("input", () => applyFilter(role));

    viewport?.addEventListener(
      "scroll",
      () => renderVirtual(role),
      { passive: true }
    );

    // Drag-to-scroll only after movement; never capture on plain tap (keeps row clicks)
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

    list?.addEventListener("click", (e) => {
      if (suppressClick) {
        suppressClick = false;
        return;
      }
      const row = e.target.closest(".being-row");
      if (!row) return;
      pick(row.dataset.role, row.dataset.id);
      setListOpen(row.dataset.role || role, false);
    });
  }

  async function init() {
    const res = await fetch("data/beings.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load beings catalog");
    const data = await res.json();
    beings = Array.isArray(data.beings) ? data.beings : [];
    if (!beings.length || beings[0].id !== "human") {
      const human = beings.find((b) => b.id === "human");
      beings = human
        ? [human, ...beings.filter((b) => b.id !== "human")]
        : beings;
    }

    selected.player = localStorage.getItem(PLAYER_KEY) || "human";
    selected.companion = localStorage.getItem(COMPANION_KEY) || "human";
    if (!byId(selected.player)) selected.player = "human";
    if (!byId(selected.companion)) selected.companion = "human";

    if (countEl()) {
      countEl().textContent = `${beings.length} beings`;
    }

    wireRole("player");
    wireRole("companion");
    renderPicks();
    filtered.player = beings.slice();
    filtered.companion = beings.slice();

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && openList) {
        setListOpen(openList, false);
      }
    });

    document.addEventListener("click", (e) => {
      if (!openList) return;
      const dockEl = dock();
      if (dockEl && !dockEl.contains(e.target)) {
        setListOpen(openList, false);
      }
    });

    // Expose for companion + Play voyage integration
    window.PlanesboundBeings = {
      getPlayer: () => byId(selected.player),
      getCompanion: () => byId(selected.companion),
      all: () => beings.slice(),
      count: () => beings.length,
      setSelection(playerId, companionId) {
        if (playerId && byId(playerId)) selected.player = playerId;
        if (companionId && byId(companionId)) selected.companion = companionId;
        localStorage.setItem(PLAYER_KEY, selected.player);
        localStorage.setItem(COMPANION_KEY, selected.companion);
        renderPicks();
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
      if (changed) renderPicks();
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
