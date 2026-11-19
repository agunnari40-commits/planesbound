/* Planesbound PAS-6/13 — single-player browser play loop */
(function () {
  const SAVE_KEY = "planesbound-game-v2";
  const SAVE_KEY_LEGACY = "planesbound-game-v1";
  const PLAYER_KEY = "planesbound-player-being-v1";
  const COMPANION_KEY = "planesbound-companion-being-v1";

  const LOCATIONS = {
    hub: {
      title: "Lighthouse Hub",
      theme: "parchment",
      blurb:
        "The Inner Ring atlas waits below. Stock your bearings, ask the companion, then cast off into the silvery thought-ocean — or, after a crossing, seek a color pool toward the planes.",
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
    "color-pool": {
      title: "Color Pool",
      theme: "astral",
      blurb:
        "A prismatic curtain hangs in the void — a soft door toward the Inner Ring. Through it, mineral grit and Will-o’-Wisp rumor smell like shore.",
    },
    "mineral-shore": {
      title: "Mineral Shore",
      theme: "parchment",
      blurb:
        "First landfall past the Sea: stone that remembers fire. Dust pilots trade bearings; the Will-o’-Wisp Race is a rumor on every tongue.",
    },
  };

  const QUESTS = {
    "cross-astral-sea": {
      id: "cross-astral-sea",
      title: "Cross the Astral Sea",
      objectives: [
        { id: "embark", label: "Leave the hub into the Astral Sea" },
        { id: "discover", label: "Discover a memory isle" },
        { id: "bearing", label: "Take a Lighthouse bearing home" },
      ],
    },
    "inner-ring-shore": {
      id: "inner-ring-shore",
      title: "First Shore of the Inner Ring",
      objectives: [
        { id: "pool", label: "Touch a color pool on the Sea" },
        { id: "shore", label: "Make landfall on the Mineral shore" },
      ],
    },
  };

  const TRAVEL_EVENTS = [
    { w: 3, text: "A silver current shoulders the hull — no cost, only a colder sky." },
    { w: 2, text: "Color-pool glitter slides past the rail; companion notes a door that is not yet yours." },
    { w: 2, text: "Thought-whales distant as thunder. The Compass Orb ticks once, then stills." },
    { w: 1, text: "Ani-thread snags the keel — you cut free with a whispered name.", item: null },
    {
      w: 1,
      text: "A drifting pouch of star-salt bumps the rail. You stow it.",
      item: {
        id: "star-salt",
        name: "Star Salt",
        desc: "Fine grit from a dead color pool. Useful for trails and trades.",
      },
    },
    {
      w: 1,
      text: "A scrap of Will-o’-Wisp counsel sticks to the mast: race when the dust sings.",
      item: {
        id: "wisp-scrap",
        name: "Wisp Scrap",
        desc: "Half a race charter. Points Mineral-ward.",
      },
    },
  ];

  /** @type {ReturnType<typeof defaultState>} */
  let state = defaultState();
  let activeTab = "status";
  let playOpen = false;
  let encounter = null; // { kind, title, body, choices }

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
        pool: false,
        shore: false,
      },
      questComplete: false,
      shoreQuestActive: false,
      shoreQuestComplete: false,
      completeAcked: false,
      isleChecked: false,
      flags: {},
      voyageLegs: 0,
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem(SAVE_KEY_LEGACY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      const base = defaultState();
      const merged = {
        ...base,
        ...parsed,
        objectives: { ...base.objectives, ...(parsed.objectives || {}) },
        inventory: Array.isArray(parsed.inventory) ? parsed.inventory : base.inventory,
        journal: Array.isArray(parsed.journal) ? parsed.journal : base.journal,
        flags: { ...(parsed.flags || {}) },
      };
      // v1 saves finished quest 1 without shoreQuestActive — activate Inner Ring shore chase
      if (merged.questComplete && !merged.shoreQuestComplete && !merged.shoreQuestActive) {
        merged.shoreQuestActive = true;
      }
      // If they already visited pool+shore in a broken migrate, finish the second quest
      if (
        merged.shoreQuestActive &&
        !merged.shoreQuestComplete &&
        merged.objectives?.pool &&
        merged.objectives?.shore
      ) {
        merged.shoreQuestComplete = true;
      }
      return merged;
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

  function sheetName(role) {
    const sheet = window.PlanesboundSheets?.get?.(role);
    return (sheet?.name || "").trim();
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

  function pushJournal(line) {
    state.journal.unshift(line);
    if (state.journal.length > 40) state.journal.length = 40;
  }

  function hasItem(id) {
    return state.inventory.some((i) => i.id === id);
  }

  function addItem(item) {
    if (!item?.id || hasItem(item.id)) return false;
    state.inventory.push(item);
    pushJournal(`Inventory: gained ${item.name}.`);
    return true;
  }

  function activeQuest() {
    if (!state.questComplete) return QUESTS["cross-astral-sea"];
    if (state.shoreQuestActive && !state.shoreQuestComplete) return QUESTS["inner-ring-shore"];
    return state.shoreQuestComplete ? QUESTS["inner-ring-shore"] : QUESTS["cross-astral-sea"];
  }

  function markObjective(id) {
    if (state.objectives[id]) return;
    state.objectives[id] = true;
    const q1 = QUESTS["cross-astral-sea"];
    const q2 = QUESTS["inner-ring-shore"];
    const label =
      q1.objectives.find((o) => o.id === id)?.label ||
      q2.objectives.find((o) => o.id === id)?.label ||
      id;
    pushJournal(`Objective complete: ${label}`);

    if (!state.questComplete && q1.objectives.every((o) => state.objectives[o.id])) {
      state.questComplete = true;
      state.shoreQuestActive = true;
      pushJournal(
        "Quest complete: Cross the Astral Sea. New charge: First Shore of the Inner Ring — seek a color pool."
      );
    }
    if (
      state.shoreQuestActive &&
      !state.shoreQuestComplete &&
      q2.objectives.every((o) => state.objectives[o.id])
    ) {
      state.shoreQuestComplete = true;
      pushJournal("Quest complete: First Shore of the Inner Ring. The atlas opens wider.");
      if (!hasItem("mineral-token")) {
        addItem({
          id: "mineral-token",
          name: "Mineral Token",
          desc: "A grit-stamped token from the shore. Proof of landfall past the Sea.",
        });
      }
    }
    save();
  }

  function pickTravelEvent() {
    const total = TRAVEL_EVENTS.reduce((s, e) => s + e.w, 0);
    let r = Math.random() * total;
    for (const e of TRAVEL_EVENTS) {
      r -= e.w;
      if (r <= 0) return e;
    }
    return TRAVEL_EVENTS[0];
  }

  function applyTravelBeat(from, to) {
    state.voyageLegs += 1;
    // Soft exploration beats on Astral legs (not hub shuttles)
    const astralish = (k) =>
      k === "astral-sea" || k === "memory-isle" || k === "lighthouse-bearing" || k === "color-pool";
    if (!(astralish(from) || astralish(to))) return;
    if (from === to) return;
    if (Math.random() > 0.55 && state.voyageLegs > 1) {
      const ev = pickTravelEvent();
      pushJournal(`Voyage: ${ev.text}`);
      if (ev.item) addItem(ev.item);
    }
  }

  function skillMod() {
    // Sheets store skills as { Perception: true, ... }; also accept arrays
    const sheet = window.PlanesboundSheets?.get?.("player");
    const skills = sheet?.skills || sheet?.skillProficiencies;
    const relevant = /perception|investigation|insight|survival/i;
    if (skills && typeof skills === "object" && !Array.isArray(skills)) {
      const hit = Object.entries(skills).some(([name, on]) => on && relevant.test(name));
      if (hit) return 3;
    } else if (Array.isArray(skills) && skills.length) {
      const hit = skills.find((s) => relevant.test(String(s)));
      if (hit) return 3;
    }
    const id = state.playerBeingId || "human";
    if (/elf|aasimar|gnome/i.test(id)) return 2;
    if (/dwarf|orc|dragonborn/i.test(id)) return 1;
    return 0;
  }

  function rollD20() {
    return 1 + Math.floor(Math.random() * 20);
  }

  function openIsleEncounter() {
    if (state.isleChecked || encounter) return;
    const mod = skillMod();
    encounter = {
      kind: "isle-check",
      title: "Isle scars — a reading",
      body: `Ani-thread scars spider across the crystal. Companion waits. Roll Perception (d20${mod ? ` + ${mod}` : ""}) against DC 12 to claim a clearer memory.`,
      choices: [
        { id: "roll", label: "Roll Perception" },
        { id: "skip", label: "Leave the scars unread" },
      ],
      mod,
      dc: 12,
    };
    renderEncounter();
  }

  function resolveEncounter(choiceId) {
    if (!encounter) return;
    if (encounter.kind === "isle-check") {
      state.isleChecked = true;
      if (choiceId === "roll") {
        const roll = rollD20();
        const total = roll + (encounter.mod || 0);
        if (total >= encounter.dc) {
          pushJournal(
            `Encounter: Perception ${roll}${encounter.mod ? `+${encounter.mod}` : ""} = ${total} vs DC ${encounter.dc} — success. A clearer Memory Shard wakes.`
          );
          state.flags.isleInsight = true;
          addItem({
            id: "clear-shard",
            name: "Clear Memory Shard",
            desc: "A shard that answers when asked who you were.",
          });
        } else {
          pushJournal(
            `Encounter: Perception ${roll}${encounter.mod ? `+${encounter.mod}` : ""} = ${total} vs DC ${encounter.dc} — miss. The scars stay opaque; the common shard still sings faintly.`
          );
        }
      } else {
        pushJournal("Encounter: you leave the ani-thread unread. The isle does not judge.");
      }
    }
    encounter = null;
    save();
    renderEncounter();
    render();
  }

  function useItem(id) {
    if (!hasItem(id)) return;
    if (id === "memory-shard" || id === "clear-shard") {
      pushJournal(
        id === "clear-shard"
          ? "You press the Clear Memory Shard: a white-room echo — player and companion standing ready — then the Sea again."
          : "You warm the Memory Shard: a brief white-room afterimage, then cold silver."
      );
      activeTab = "journal";
    } else if (id === "compass-orb") {
      pushJournal(
        state.location === "lighthouse-bearing"
          ? "Compass Orb flares — bearing locked. Hub road is honest."
          : "Compass Orb hums toward the Lighthouse. Follow the pulse when you can."
      );
      activeTab = "journal";
    } else if (id === "star-salt") {
      pushJournal("You taste Star Salt — trails on the Sea look brighter for a breath.");
      state.flags.starSalt = true;
      activeTab = "journal";
    } else if (id === "wisp-scrap") {
      pushJournal("Wisp Scrap: race when the dust sings — Mineral shore knows the start line.");
      activeTab = "journal";
    } else if (id === "mineral-token") {
      pushJournal("Mineral Token marks you as a shore-walker. Atlas scribes nod.");
      activeTab = "journal";
    } else {
      pushJournal(`You turn the ${id} over in your hands. Not yet.`);
    }
    save();
    render();
  }

  function travelTo(loc) {
    if (!LOCATIONS[loc]) return;
    const from = state.location;

    if (loc === "lighthouse-bearing" && !hasItem("compass-orb")) {
      pushJournal("Travel blocked: without a Compass Orb the Lighthouse pulse will not lock.");
      save();
      render();
      return;
    }
    if (loc === "color-pool" && !state.questComplete && !state.objectives.embark) {
      pushJournal("Travel blocked: cast off into the Astral Sea before chasing color pools.");
      save();
      render();
      return;
    }
    if (loc === "mineral-shore" && !state.objectives.pool && !state.questComplete) {
      pushJournal("Travel blocked: touch a color pool before forcing Mineral landfall.");
      save();
      render();
      return;
    }

    applyTravelBeat(from, loc);
    state.location = loc;

    if (loc === "astral-sea") markObjective("embark");
    if (loc === "memory-isle") {
      markObjective("discover");
      if (!hasItem("memory-shard")) {
        addItem({
          id: "memory-shard",
          name: "Memory Shard",
          desc: "A cold crystal of recollection from a drifting isle.",
        });
        pushJournal("Discovery: claimed a Memory Shard on the isle.");
      }
    }
    if (loc === "lighthouse-bearing") markObjective("bearing");
    if (loc === "color-pool") markObjective("pool");
    if (loc === "mineral-shore") markObjective("shore");

    save();
    render();

    // Prefer isle encounter over quest-complete modal — never stack both
    const wantsIsle = loc === "memory-isle" && !state.isleChecked;
    if (wantsIsle) {
      openIsleEncounter();
    } else if (state.questComplete && !state.completeAcked && !state.shoreQuestComplete) {
      if (state.objectives.bearing && from !== "hub") showComplete(true);
    }
    if (state.shoreQuestComplete && !state.flags.shoreAcked) {
      state.flags.shoreAcked = true;
      pushJournal("Shore secured. Continue exploring or return to the hub atlas.");
      save();
    }
  }

  function el(id) {
    return document.getElementById(id);
  }

  function fillBeingSelect(selectEl, selectedId) {
    if (!selectEl) return;
    const api = window.PlanesboundBeings;
    const beings = api?.all?.() || [{ id: "human", name: "Human", tradition: "core" }];
    const preferred = [
      "human",
      "aasimar",
      "elf",
      "dwarf",
      "tiefling",
      "dragonborn",
      "halfling",
      "gnome",
      "orc",
      "goblin",
    ];
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

  function ensureEncounterDom() {
    let node = el("gameEncounter");
    if (node) return node;
    node = document.createElement("div");
    node.id = "gameEncounter";
    node.className = "game-encounter";
    node.hidden = true;
    node.dataset.open = "false";
    node.setAttribute("role", "dialog");
    node.setAttribute("aria-modal", "true");
    node.innerHTML = `<div class="game-encounter-card" tabindex="-1">
      <h3 id="gameEncounterTitle"></h3>
      <p id="gameEncounterBody"></p>
      <div class="game-encounter-actions" id="gameEncounterActions"></div>
    </div>`;
    el("gameLayer")?.appendChild(node);
    node.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-encounter-choice]");
      if (!btn) return;
      resolveEncounter(btn.dataset.encounterChoice);
    });
    return node;
  }

  function renderEncounter() {
    const node = ensureEncounterDom();
    if (!node) return;
    const open = !!encounter;
    node.hidden = !open;
    node.dataset.open = open ? "true" : "false";
    if (!open) return;
    const title = el("gameEncounterTitle");
    const body = el("gameEncounterBody");
    const actions = el("gameEncounterActions");
    if (title) title.textContent = encounter.title;
    if (body) body.textContent = encounter.body;
    if (actions) {
      actions.innerHTML = encounter.choices
        .map(
          (c) =>
            `<button type="button" class="game-btn${c.id === "roll" ? " game-btn--astral" : ""}" data-encounter-choice="${escapeAttr(c.id)}">${escapeHtml(c.label)}</button>`
        )
        .join("");
    }
    requestAnimationFrame(() => node.querySelector(".game-encounter-card")?.focus?.());
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
        const pArt = `art/races/${escapeHtml(state.playerBeingId || "human")}.png`;
        const cArt = `art/races/${escapeHtml(state.companionBeingId || "human")}.png`;
        party.innerHTML = `
          <div class="game-hud-portraits" aria-hidden="true">
            <img class="game-hud-portrait" src="${pArt}" alt="" width="42" height="42" loading="lazy" decoding="async" onerror="this.src='art/races/human.png'" />
            <img class="game-hud-portrait game-hud-portrait--companion" src="${cArt}" alt="" width="42" height="42" loading="lazy" decoding="async" onerror="this.src='art/races/human.png'" />
          </div>
          <div class="game-hud-party-copy">
            <strong>${escapeHtml(state.playerName || "Traveler")}</strong>
            <span>${escapeHtml(beingName(state.playerBeingId))} · companion ${escapeHtml(beingName(state.companionBeingId))} · ${escapeHtml(loc.title)}</span>
          </div>`;
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

    const status = el("gamePanelStatus");
    const inv = el("gamePanelInventory");
    const journal = el("gamePanelJournal");
    const quest = el("gamePanelQuest");
    const aq = activeQuest();
    if (status) {
      status.innerHTML = `
        <h3>Status</h3>
        <p class="game-meta-line">${escapeHtml(state.playerName)} · ${escapeHtml(beingName(state.playerBeingId))}</p>
        <p class="game-meta-line">${escapeHtml(beingLine(state.playerBeingId))}</p>
        <p class="game-meta-line">Companion: <strong>${escapeHtml(beingName(state.companionBeingId))}</strong></p>
        <p class="game-meta-line">Location: <strong>${escapeHtml(loc.title)}</strong></p>
        <p class="game-meta-line">Voyage legs: ${state.voyageLegs || 0}</p>
        <p class="game-meta-line">Quest: ${
          state.shoreQuestComplete
            ? "Inner Ring shore secured — explore freely"
            : state.questComplete
              ? aq.title + (state.shoreQuestActive ? " (active)" : "")
              : QUESTS["cross-astral-sea"].title
        }</p>`;
    }
    if (inv) {
      inv.innerHTML = `<h3>Inventory</h3><ul class="game-inv-list">${state.inventory
        .map(
          (i) =>
            `<li><div><strong>${escapeHtml(i.name)}</strong> — ${escapeHtml(i.desc)}</div>
            <button type="button" class="game-btn game-btn--ghost game-inv-use" data-use-item="${escapeAttr(i.id)}">Use</button></li>`
        )
        .join("")}</ul>`;
    }
    if (journal) {
      journal.innerHTML = `<h3>Journal</h3><ul>${state.journal
        .slice(0, 14)
        .map((j) => `<li>${escapeHtml(j)}</li>`)
        .join("")}</ul>`;
    }
    if (quest) {
      const objs = aq.objectives;
      quest.innerHTML = `<h3>${escapeHtml(aq.title)}</h3><ul>${objs
        .map(
          (o) =>
            `<li class="game-obj" data-done="${state.objectives[o.id] ? "true" : "false"}">${escapeHtml(o.label)}</li>`
        )
        .join("")}</ul>${
        state.shoreQuestComplete
          ? `<p class="game-meta-line">Both voyages marked. Keep sailing or return to the hub atlas.</p>`
          : state.questComplete
            ? `<p class="game-meta-line">First crossing done. Seek a color pool → Mineral shore.</p>`
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
      const more = state.questComplete
        ? `<button type="button" class="game-btn game-btn--astral" data-travel="color-pool">Seek a color pool</button>`
        : "";
      return `<button type="button" class="game-btn game-btn--astral" data-travel="astral-sea">Cast off into the Astral Sea</button>
        ${more}
        <button type="button" class="game-btn" data-action="companion">Ask companion</button>
        <button type="button" class="game-btn game-btn--ghost" data-action="atlas">Browse atlas</button>`;
    }
    if (loc === "astral-sea") {
      const pool = state.questComplete
        ? `<button type="button" class="game-btn game-btn--astral" data-travel="color-pool">Approach a color pool</button>`
        : "";
      return `<button type="button" class="game-btn game-btn--astral" data-travel="memory-isle">Seek a memory isle</button>
        <button type="button" class="game-btn" data-travel="lighthouse-bearing">Follow Lighthouse pulse</button>
        ${pool}
        <button type="button" class="game-btn" data-action="companion">Ask companion</button>
        <button type="button" class="game-btn game-btn--ghost" data-travel="hub">Return to hub</button>`;
    }
    if (loc === "memory-isle") {
      return `<button type="button" class="game-btn game-btn--astral" data-travel="lighthouse-bearing">Take bearing from the isle</button>
        <button type="button" class="game-btn" data-travel="astral-sea">Back to open Sea</button>
        <button type="button" class="game-btn" data-action="companion">Ask companion</button>`;
    }
    if (loc === "color-pool") {
      return `<button type="button" class="game-btn game-btn--astral" data-travel="mineral-shore">Step through toward Mineral</button>
        <button type="button" class="game-btn" data-travel="astral-sea">Back to open Sea</button>
        <button type="button" class="game-btn" data-action="companion">Ask companion</button>`;
    }
    if (loc === "mineral-shore") {
      return `<button type="button" class="game-btn game-btn--astral" data-travel="hub">Return via Lighthouse roads</button>
        <button type="button" class="game-btn" data-travel="color-pool">Back through the pool</button>
        <button type="button" class="game-btn" data-action="companion">Ask companion</button>
        <button type="button" class="game-btn game-btn--ghost" data-action="atlas">Browse atlas</button>`;
    }
    // lighthouse-bearing
    return `<button type="button" class="game-btn game-btn--astral" data-travel="hub">Ride bearing back to hub</button>
      <button type="button" class="game-btn" data-travel="astral-sea">Stay on the Astral Sea</button>
      <button type="button" class="game-btn" data-action="companion">Ask companion</button>`;
  }

  function prefillFromCreation() {
    const playerBeing = window.PlanesboundBeings?.getPlayer?.()?.id || localStorage.getItem(PLAYER_KEY) || "human";
    const companionBeing =
      window.PlanesboundBeings?.getCompanion?.()?.id || localStorage.getItem(COMPANION_KEY) || "human";
    const name = sheetName("player") || beingName(playerBeing, "Traveler");
    return { name, playerBeingId: playerBeing, companionBeingId: companionBeing };
  }

  function beginPlay() {
    state = load();
    if (!state.started) {
      setPlayOpen(true);
      showStart(true);
      const pref = prefillFromCreation();
      // Unstarted defaults are always "human" — prefer live creation roster/sheet picks
      fillBeingSelect(el("gamePlayerBeing"), pref.playerBeingId || "human");
      fillBeingSelect(el("gameCompanionBeing"), pref.companionBeingId || "human");
      const nameInput = el("gamePlayerName");
      if (nameInput && !nameInput.value) nameInput.value = pref.name || state.playerName || "";
      nameInput?.focus();
      return;
    }
    setPlayOpen(true);
    showStart(false);
    render();
  }

  /** Handoff from white room / completed sheets into a fresh or continued voyage. */
  function castOffFromCreation() {
    const pref = prefillFromCreation();
    state = load();
    if (!state.started) {
      state = {
        ...defaultState(),
        started: true,
        playerName: (pref.name || "Traveler").slice(0, 40),
        playerBeingId: pref.playerBeingId,
        companionBeingId: pref.companionBeingId,
        journal: [
          `${pref.name || "Traveler"} (${beingName(pref.playerBeingId)}) leaves the White Room with companion ${beingName(pref.companionBeingId)}.`,
          "First quest: Cross the Astral Sea.",
        ],
      };
      syncRosterKeys();
      save();
    }
    window.PlanesboundWhiteRoom?.close?.();
    setPlayOpen(true);
    showStart(false);
    showComplete(false);
    encounter = null;
    renderEncounter();
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
    encounter = null;
    renderEncounter();
    setPlayOpen(false);
  }

  function onSceneClick(e) {
    const useBtn = e.target.closest("[data-use-item]");
    if (useBtn) {
      useItem(useBtn.dataset.useItem);
      return;
    }
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
      getState: () => ({ ...state, objectives: { ...state.objectives }, flags: { ...state.flags } }),
      getLocation: () => state.location,
      getLocationTitle: () => (LOCATIONS[state.location] || LOCATIONS.hub).title,
      getPlayerName: () => state.playerName,
      isPlayOpen: () => playOpen,
      isQuestComplete: () => !!state.questComplete,
      open: beginPlay,
      castOff: castOffFromCreation,
      travelTo,
      counselContext: () => {
        const loc = LOCATIONS[state.location] || LOCATIONS.hub;
        return {
          location: state.location,
          locationTitle: loc.title,
          playerName: state.playerName,
          playerBeing: beingName(state.playerBeingId),
          companionBeing: beingName(state.companionBeingId),
          questComplete: state.questComplete,
          shoreQuestComplete: state.shoreQuestComplete,
          objectives: { ...state.objectives },
          blurb: loc.blurb,
          inventoryIds: state.inventory.map((i) => i.id),
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
    el("gameSide")?.addEventListener("click", onSceneClick);
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
      if (e.defaultPrevented) return;
      const companionOpen = document.getElementById("companionDialog")?.dataset.open === "true";
      if (companionOpen) return;
      // Topmost modal first: quest-complete sits above encounter when both exist
      if (el("gameComplete")?.dataset.open === "true") {
        e.preventDefault();
        state.completeAcked = true;
        save();
        showComplete(false);
        return;
      }
      if (encounter) {
        e.preventDefault();
        resolveEncounter("skip");
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

    document.addEventListener("planesbound-cast-off", () => {
      castOffFromCreation();
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
    ensureEncounterDom();
  });
})();
