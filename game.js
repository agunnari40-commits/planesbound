/* Planesbound PAS-6 — single-player browser game loop */
(function () {
  const SAVE_KEY = "planesbound-game-v1";
  const PLAYER_KEY = "planesbound-player-being-v1";
  const COMPANION_KEY = "planesbound-companion-being-v1";

  const LOCATIONS = {
    hub: {
      title: "Lighthouse Hub",
      theme: "parchment",
      blurb:
        "The Inner Ring atlas waits below. Stock your bearings, ask the companion, then cast off into the silvery thought-ocean.",
    },
    "astral-sea": {
      title: "Astral Sea",
      theme: "astral",
      blurb:
        "Thought-currents silver the void. Color pools shimmer like doors. Somewhere ahead, a memory isle and a Lighthouse bearing.",
    },
    "memory-isle": {
      title: "Memory Isle",
      theme: "astral",
      blurb:
        "Crystallized recollection rises from the Sea — a discovery beat. Ani-thread scars glitter underfoot; a wisp-path points toward home.",
    },
    "lighthouse-bearing": {
      title: "Lighthouse Bearing",
      theme: "astral",
      blurb:
        "A clean Daystar pulse locks your Compass Orb. The hub road opens — Cross the Astral Sea is within reach.",
    },
  };

  const QUEST = {
    id: "cross-astral-sea",
    title: "Cross the Astral Sea",
    objectives: [
      { id: "embark", label: "Leave the hub into the Astral Sea" },
      { id: "discover", label: "Discover a memory isle" },
      { id: "bearing", label: "Take a Lighthouse bearing home" },
    ],
  };

  /** @type {ReturnType<typeof defaultState>} */
  let state = defaultState();
  let activeTab = "status";
  let playOpen = false;

  function defaultState() {
    return {
      started: false,
      playerName: "",
      playerBeingId: "human",
      companionBeingId: "human",
      location: "hub",
      inventory: [
        {
          id: "compass-orb",
          name: "Compass Orb",
          desc: "Thin planar bearing toward the Lighthouse when the Daystar pulse is clean.",
        },
      ],
      journal: ["Character folio opened. First quest: Cross the Astral Sea."],
      objectives: {
        embark: false,
        discover: false,
        bearing: false,
      },
      questComplete: false,
      completeAcked: false,
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return { ...defaultState(), ...parsed, objectives: { ...defaultState().objectives, ...(parsed.objectives || {}) } };
    } catch (_) {
      return defaultState();
    }
  }

  function save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  function beingName(id, fallback) {
    const api = window.PlanesboundBeings;
    const b = api?.all?.()?.find((x) => x.id === id);
    return b?.name || fallback || id;
  }

  function beingLine(id) {
    const api = window.PlanesboundBeings;
    const b = api?.all?.()?.find((x) => x.id === id);
    return b?.line || "";
  }

  function syncRosterKeys() {
    localStorage.setItem(PLAYER_KEY, state.playerBeingId);
    localStorage.setItem(COMPANION_KEY, state.companionBeingId);
    const api = window.PlanesboundBeings;
    if (api && typeof api.setSelection === "function") {
      api.setSelection(state.playerBeingId, state.companionBeingId);
      return;
    }
    document.dispatchEvent(
      new CustomEvent("planesbound-beings-changed", {
        detail: {
          player: { id: state.playerBeingId, name: beingName(state.playerBeingId) },
          companion: { id: state.companionBeingId, name: beingName(state.companionBeingId) },
        },
      })
    );
  }

  function markObjective(id) {
    if (state.objectives[id]) return;
    state.objectives[id] = true;
    const label = QUEST.objectives.find((o) => o.id === id)?.label || id;
    state.journal.unshift(`Objective complete: ${label}`);
    if (QUEST.objectives.every((o) => state.objectives[o.id])) {
      state.questComplete = true;
      state.journal.unshift("Quest complete: Cross the Astral Sea. You may continue exploring.");
    }
    save();
  }

  function travelTo(loc) {
    if (!LOCATIONS[loc]) return;
    state.location = loc;
    if (loc === "astral-sea") markObjective("embark");
    if (loc === "memory-isle") {
      markObjective("discover");
      if (!state.inventory.some((i) => i.id === "memory-shard")) {
        state.inventory.push({
          id: "memory-shard",
          name: "Memory Shard",
          desc: "A cold crystal of recollection from a drifting isle.",
        });
        state.journal.unshift("Discovery: claimed a Memory Shard on the isle.");
      }
    }
    if (loc === "lighthouse-bearing") markObjective("bearing");
    save();
    render();
    if (state.questComplete && !state.completeAcked) showComplete(true);
  }

  function el(id) {
    return document.getElementById(id);
  }

  function fillBeingSelect(selectEl, selectedId) {
    if (!selectEl) return;
    const api = window.PlanesboundBeings;
    const beings = api?.all?.() || [{ id: "human", name: "Human", tradition: "core" }];
    // Keep list usable: Human first, then a curated slice + current selection
    const preferred = ["human", "aasimar", "elf", "dwarf", "tiefling", "dragonborn", "halfling", "gnome", "orc", "goblin"];
    const byId = new Map(beings.map((b) => [b.id, b]));
    const picks = [];
    preferred.forEach((id) => {
      if (byId.has(id)) picks.push(byId.get(id));
    });
    beings.slice(0, 80).forEach((b) => {
      if (!picks.some((p) => p.id === b.id)) picks.push(b);
    });
    if (selectedId && byId.has(selectedId) && !picks.some((p) => p.id === selectedId)) {
      picks.unshift(byId.get(selectedId));
    }
    selectEl.innerHTML = picks
      .map(
        (b) =>
          `<option value="${escapeAttr(b.id)}"${b.id === selectedId ? " selected" : ""}>${escapeHtml(b.name)} (${escapeHtml(b.tradition)})</option>`
      )
      .join("");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  function showComplete(open) {
    const node = el("gameComplete");
    const shell = el("gameShell");
    if (!node) return;
    node.hidden = !open;
    node.dataset.open = open ? "true" : "false";
    if (shell) {
      if (open) shell.setAttribute("inert", "");
      else shell.removeAttribute("inert");
    }
    if (open) {
      const focusComplete = () => {
        const btn = el("gameContinueExplore");
        const card = node.querySelector(".game-complete-card");
        (btn || card)?.focus?.();
      };
      requestAnimationFrame(() => requestAnimationFrame(focusComplete));
    }
  }

  function setPlayOpen(open) {
    playOpen = open;
    const layer = el("gameLayer");
    if (!layer) return;
    layer.hidden = !open;
    layer.dataset.open = open ? "true" : "false";
    document.body.classList.toggle("game-active", open);
    if (open) {
      document.getElementById("companionDialog")?.setAttribute("data-game-mode", "1");
    }
    render();
  }

  function showStart(show) {
    const start = el("gameStart");
    const shell = el("gameShell");
    if (!start || !shell) return;
    start.hidden = !show;
    start.dataset.open = show ? "true" : "false";
    shell.hidden = show;
    shell.dataset.open = show ? "false" : "true";
  }

  function render() {
    const loc = LOCATIONS[state.location] || LOCATIONS.hub;
    const hud = el("gameHud");
    const scene = el("gameScene");
    const side = el("gameSide");
    if (hud) {
      hud.dataset.theme = loc.theme;
      const party = el("gameHudParty");
      if (party) {
        party.innerHTML = `<strong>${escapeHtml(state.playerName || "Traveler")}</strong><span>${escapeHtml(beingName(state.playerBeingId))} · companion ${escapeHtml(beingName(state.companionBeingId))} · ${escapeHtml(loc.title)}</span>`;
      }
    }
    if (scene) {
      scene.dataset.loc = state.location;
      const title = el("gameSceneTitle");
      const blurb = el("gameSceneBlurb");
      const actions = el("gameSceneActions");
      if (title) title.textContent = loc.title;
      if (blurb) blurb.textContent = loc.blurb;
      if (actions) actions.innerHTML = sceneActionsHtml();
    }
    if (side) side.dataset.theme = loc.theme;

    // panels
    const status = el("gamePanelStatus");
    const inv = el("gamePanelInventory");
    const journal = el("gamePanelJournal");
    const quest = el("gamePanelQuest");
    if (status) {
      status.innerHTML = `
        <h3>Status</h3>
        <p class="game-meta-line">${escapeHtml(state.playerName)} · ${escapeHtml(beingName(state.playerBeingId))}</p>
        <p class="game-meta-line">${escapeHtml(beingLine(state.playerBeingId))}</p>
        <p class="game-meta-line">Companion: <strong>${escapeHtml(beingName(state.companionBeingId))}</strong></p>
        <p class="game-meta-line">Location: <strong>${escapeHtml(loc.title)}</strong></p>
        <p class="game-meta-line">Quest: ${state.questComplete ? "Complete — explore freely" : QUEST.title}</p>`;
    }
    if (inv) {
      inv.innerHTML = `<h3>Inventory</h3><ul>${state.inventory
        .map((i) => `<li><strong>${escapeHtml(i.name)}</strong> — ${escapeHtml(i.desc)}</li>`)
        .join("")}</ul>`;
    }
    if (journal) {
      journal.innerHTML = `<h3>Journal</h3><ul>${state.journal
        .slice(0, 12)
        .map((j) => `<li>${escapeHtml(j)}</li>`)
        .join("")}</ul>`;
    }
    if (quest) {
      quest.innerHTML = `<h3>${escapeHtml(QUEST.title)}</h3><ul>${QUEST.objectives
        .map(
          (o) =>
            `<li class="game-obj" data-done="${state.objectives[o.id] ? "true" : "false"}">${escapeHtml(o.label)}</li>`
        )
        .join("")}</ul>${
        state.questComplete
          ? `<p class="game-meta-line">First crossing done. Keep sailing the Sea or return to the hub atlas.</p>`
          : `<p class="game-meta-line">Embark → discover an isle → take a bearing.</p>`
      }`;
    }

    document.querySelectorAll(".game-tab").forEach((tab) => {
      tab.setAttribute("aria-selected", tab.dataset.tab === activeTab ? "true" : "false");
    });
    document.querySelectorAll(".game-panel").forEach((panel) => {
      panel.dataset.active = panel.dataset.panel === activeTab ? "true" : "false";
    });

    window.PlanesboundGame = api();
  }

  function sceneActionsHtml() {
    const loc = state.location;
    if (loc === "hub") {
      return `<button type="button" class="game-btn game-btn--astral" data-travel="astral-sea">Cast off into the Astral Sea</button>
        <button type="button" class="game-btn" data-action="companion">Ask companion</button>
        <button type="button" class="game-btn game-btn--ghost" data-action="atlas">Browse atlas</button>`;
    }
    if (loc === "astral-sea") {
      return `<button type="button" class="game-btn game-btn--astral" data-travel="memory-isle">Seek a memory isle</button>
        <button type="button" class="game-btn" data-travel="lighthouse-bearing">Follow Lighthouse pulse</button>
        <button type="button" class="game-btn" data-action="companion">Ask companion</button>
        <button type="button" class="game-btn game-btn--ghost" data-travel="hub">Return to hub</button>`;
    }
    if (loc === "memory-isle") {
      return `<button type="button" class="game-btn game-btn--astral" data-travel="lighthouse-bearing">Take bearing from the isle</button>
        <button type="button" class="game-btn" data-travel="astral-sea">Back to open Sea</button>
        <button type="button" class="game-btn" data-action="companion">Ask companion</button>`;
    }
    // lighthouse-bearing
    return `<button type="button" class="game-btn game-btn--astral" data-travel="hub">Ride bearing back to hub</button>
      <button type="button" class="game-btn" data-travel="astral-sea">Stay on the Astral Sea</button>
      <button type="button" class="game-btn" data-action="companion">Ask companion</button>`;
  }

  function beginPlay() {
    state = load();
    if (!state.started) {
      setPlayOpen(true);
      showStart(true);
      fillBeingSelect(el("gamePlayerBeing"), state.playerBeingId || "human");
      fillBeingSelect(el("gameCompanionBeing"), state.companionBeingId || "human");
      const nameInput = el("gamePlayerName");
      if (nameInput && !nameInput.value) nameInput.value = state.playerName || "";
      nameInput?.focus();
      return;
    }
    setPlayOpen(true);
    showStart(false);
    render();
  }

  function startCharacter(ev) {
    ev?.preventDefault?.();
    const name = (el("gamePlayerName")?.value || "").trim();
    const playerBeingId = el("gamePlayerBeing")?.value || "human";
    const companionBeingId = el("gameCompanionBeing")?.value || "human";
    if (!name) {
      el("gamePlayerName")?.focus();
      return;
    }
    state = {
      ...defaultState(),
      started: true,
      playerName: name.slice(0, 40),
      playerBeingId,
      companionBeingId,
      journal: [
        `${name} (${beingName(playerBeingId)}) sets out with companion ${beingName(companionBeingId)}.`,
        "First quest: Cross the Astral Sea.",
      ],
    };
    syncRosterKeys();
    save();
    showStart(false);
    render();
  }

  function exitPlay() {
    showComplete(false);
    setPlayOpen(false);
  }

  function onSceneClick(e) {
    const btn = e.target.closest("[data-travel], [data-action]");
    if (!btn) return;
    if (btn.dataset.travel) {
      travelTo(btn.dataset.travel);
      return;
    }
    if (btn.dataset.action === "companion") {
      document.getElementById("openCompanion")?.click();
      return;
    }
    if (btn.dataset.action === "atlas") {
      exitPlay();
      document.getElementById("map")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function api() {
    return {
      getState: () => ({ ...state, objectives: { ...state.objectives } }),
      getLocation: () => state.location,
      getLocationTitle: () => (LOCATIONS[state.location] || LOCATIONS.hub).title,
      getPlayerName: () => state.playerName,
      isPlayOpen: () => playOpen,
      isQuestComplete: () => !!state.questComplete,
      counselContext: () => {
        const loc = LOCATIONS[state.location] || LOCATIONS.hub;
        return {
          location: state.location,
          locationTitle: loc.title,
          playerName: state.playerName,
          playerBeing: beingName(state.playerBeingId),
          companionBeing: beingName(state.companionBeingId),
          questComplete: state.questComplete,
          objectives: { ...state.objectives },
          blurb: loc.blurb,
        };
      },
    };
  }

  function wire() {
    el("openPlay")?.addEventListener("click", beginPlay);
    el("gameStartForm")?.addEventListener("submit", startCharacter);
    el("gameCancelStart")?.addEventListener("click", exitPlay);
    el("gameExit")?.addEventListener("click", exitPlay);
    el("gameSceneActions")?.addEventListener("click", onSceneClick);
    el("gameContinueExplore")?.addEventListener("click", () => {
      state.completeAcked = true;
      save();
      showComplete(false);
    });
    el("gameTabs")?.addEventListener("click", (e) => {
      const tab = e.target.closest(".game-tab");
      if (!tab) return;
      activeTab = tab.dataset.tab || "status";
      render();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape" || !playOpen) return;
      // Companion closes first (stopPropagation); never also exit Play on same keypress
      if (e.defaultPrevented) return;
      const companionOpen = document.getElementById("companionDialog")?.dataset.open === "true";
      if (companionOpen) return;
      if (el("gameComplete")?.dataset.open === "true") {
        e.preventDefault();
        state.completeAcked = true;
        save();
        showComplete(false);
        return;
      }
      e.preventDefault();
      exitPlay();
    });

    document.addEventListener("planesbound-beings-ready", () => {
      if (playOpen && el("gameStart")?.dataset.open === "true") {
        fillBeingSelect(el("gamePlayerBeing"), el("gamePlayerBeing")?.value || "human");
        fillBeingSelect(el("gameCompanionBeing"), el("gameCompanionBeing")?.value || "human");
      }
    });

    window.PlanesboundGame = api();
  }

  function ensureDomReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ensureDomReady(() => {
    state = load();
    wire();
  });
})();
