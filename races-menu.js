/* Planesbound PAS-3 — left races dock + virtualized being pickers */
(function () {
  const ROW = 36;
  const OVERSCAN = 8;
  const PLAYER_KEY = "planesbound-player-being-v1";
  const COMPANION_KEY = "planesbound-companion-being-v1";

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
      if (nameEl) nameEl.textContent = b.name;
      if (lineEl) lineEl.textContent = b.line;
      if (tagEl) tagEl.textContent = b.tradition;
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
          `<span class="being-dot" data-trad="${escapeHtml(b.tradition)}"></span>` +
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
    if (!panel || !btn) return;
    if (open) {
      if (openList && openList !== role) setListOpen(openList, false);
      openList = role;
      panel.hidden = false;
      panel.dataset.open = "true";
      btn.setAttribute("aria-expanded", "true");
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

    // Drag-to-scroll feel
    let dragging = false;
    let startY = 0;
    let startScroll = 0;
    viewport?.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      dragging = true;
      startY = e.clientY;
      startScroll = viewport.scrollTop;
      viewport.setPointerCapture(e.pointerId);
      viewport.classList.add("is-dragging");
    });
    viewport?.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      viewport.scrollTop = startScroll - (e.clientY - startY);
    });
    const endDrag = (e) => {
      if (!dragging) return;
      dragging = false;
      viewport.classList.remove("is-dragging");
      try {
        viewport.releasePointerCapture(e.pointerId);
      } catch (_) {
        /* ignore */
      }
    };
    viewport?.addEventListener("pointerup", endDrag);
    viewport?.addEventListener("pointercancel", endDrag);

    list?.addEventListener("click", (e) => {
      const row = e.target.closest(".being-row");
      if (!row) return;
      pick(row.dataset.role, row.dataset.id);
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

    // Expose for companion integration
    window.PlanesboundBeings = {
      getPlayer: () => byId(selected.player),
      getCompanion: () => byId(selected.companion),
      all: () => beings.slice(),
      count: () => beings.length,
    };

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
