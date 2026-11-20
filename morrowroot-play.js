/* Morrowroot Play UI — mode picker + inlay into existing game layer. */
(function () {
  const SAVE_KEY = "planesbound-morrowroot-v1";
  const Core = () => window.PlanesboundMorrowrootCore;
  const Data = () => window.PlanesboundMorrowrootData;

  /** @type {any} */
  let modeState = null;
  let selectedMode = "astral_voyage";
  let selectedCourse = "race_lighthouse";
  let active = false;

  function el(id) {
    return document.getElementById(id);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function save() {
    try {
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({ selectedMode, selectedCourse, modeState })
      );
    } catch (_) {
      /* ignore quota */
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      selectedMode = data.selectedMode || selectedMode;
      selectedCourse = data.selectedCourse || selectedCourse;
      modeState = data.modeState || null;
    } catch (_) {
      /* ignore */
    }
  }

  function isMorrowrootMode(id) {
    return id && id !== "astral_voyage";
  }

  function fillModeSelect() {
    const sel = el("gameModeSelect");
    if (!sel || !Core()) return;
    const cur = selectedMode;
    sel.innerHTML = Core().MODE_CHOICES.map((m) => {
      const label = m.filler ? `${m.name} · filler` : m.name;
      return `<option value="${escapeHtml(m.id)}">${escapeHtml(label)}</option>`;
    }).join("");
    sel.value = cur;
    updateModeBlurb();
    updateCourseVisibility();
  }

  function updateModeBlurb() {
    const blurb = el("gameModeBlurb");
    const choice = Core()?.MODE_CHOICES.find((m) => m.id === selectedMode);
    if (blurb && choice) {
      blurb.textContent = choice.blurb;
    }
    const title = el("gameStartTitle");
    if (title && choice) {
      title.textContent =
        selectedMode === "astral_voyage" ? "Cross the Astral Sea" : choice.name;
    }
  }

  function updateCourseVisibility() {
    const wrap = el("gameRaceCourseField");
    if (!wrap) return;
    wrap.hidden = selectedMode !== "wisp_race";
  }

  function resourcesHtml(r) {
    if (!r) return "";
    const keys = [
      "timber",
      "stone",
      "food",
      "ember",
      "lightshard",
      "hide",
      "warmth",
      "chill",
      "stamina",
      "mana",
      "bearing",
      "raidDefense",
    ];
    return keys
      .filter((k) => r[k] != null)
      .map((k) => `<span class="mr-chip"><em>${escapeHtml(k)}</em> ${r[k]}</span>`)
      .join("");
  }

  function renderModeScene() {
    if (!modeState || !active) return;
    const title = el("gameSceneTitle");
    const blurb = el("gameSceneBlurb");
    const actions = el("gameSceneActions");
    const scene = el("gameScene");
    if (!title || !blurb || !actions || !scene) return;

    scene.dataset.loc = "morrowroot";
    scene.dataset.mode = modeState.modeId;
    const choice = Core().MODE_CHOICES.find((m) => m.id === modeState.modeId);
    title.textContent = choice?.name || modeState.modeId;
    const stageName =
      Data()?.items("clock_stages")?.[modeState.clockStage]?.name ||
      `Clock ${modeState.clockStage}`;
    blurb.textContent = modeState.done
      ? modeState.won
        ? "Shared win — the household holds."
        : "Shared loss — the winter took the round."
      : `${stageName}. Season ${modeState.season || 1}. ${modeState.filler ? "[FILLER rules in play.]" : ""}`;

    const buttons = [];
    if (!modeState.done) {
      buttons.push(...actionButtonsFor(modeState));
    } else {
      buttons.push(
        `<button type="button" class="game-btn game-btn--astral" data-mr="restart">Play again</button>`
      );
      buttons.push(
        `<button type="button" class="game-btn game-btn--ghost" data-mr="hub">Back to mode select</button>`
      );
    }
    buttons.push(
      `<button type="button" class="game-btn game-btn--ghost" data-action="atlas">Browse atlas</button>`
    );
    actions.innerHTML = buttons.join("");

    renderSidePanels();
  }

  function actionButtonsFor(s) {
    const out = [];
    switch (s.modeId) {
      case "hearth_night":
      case "party_board":
        if (s.meta.phase === "raid" || s.meta.closingRaid) {
          out.push(`<button type="button" class="game-btn game-btn--astral" data-mr="step">Fight raid round</button>`);
        } else {
          out.push(`<button type="button" class="game-btn game-btn--astral" data-mr="step">Next board round</button>`);
        }
        break;
      case "campaign":
        if (s.meta.phase === "dawn") {
          out.push(`<button type="button" class="game-btn game-btn--astral" data-mr="dawn">Resolve dawn</button>`);
        } else if (s.meta.phase === "board") {
          out.push(`<button type="button" class="game-btn game-btn--astral" data-mr="step">Board turn</button>`);
        } else if (s.meta.phase === "raid") {
          out.push(`<button type="button" class="game-btn game-btn--astral" data-mr="step">Raid round</button>`);
        } else if (s.meta.phase === "close") {
          out.push(`<button type="button" class="game-btn game-btn--astral" data-mr="close">Season close</button>`);
          out.push(`<button type="button" class="game-btn" data-mr="hold">Close with hold</button>`);
        }
        break;
      case "homestead":
      case "endless_winter":
        out.push(`<button type="button" class="game-btn game-btn--astral" data-mr="hunt">Hunt</button>`);
        out.push(`<button type="button" class="game-btn" data-mr="build" data-structure="palisade_segment">Build Palisade</button>`);
        out.push(`<button type="button" class="game-btn" data-mr="build" data-structure="smokehouse">Build Smokehouse</button>`);
        out.push(`<button type="button" class="game-btn" data-mr="build" data-structure="warding_lantern">Build Warding Lantern</button>`);
        out.push(`<button type="button" class="game-btn" data-mr="dawn">Advance dawn</button>`);
        break;
      case "raid":
      case "raid_gauntlet":
        out.push(`<button type="button" class="game-btn game-btn--astral" data-mr="step">Raid round</button>`);
        break;
      case "expedition":
        if (!s.meta.realmId) {
          const realms = (Data()?.items("realms") || []).slice(0, 5);
          for (const r of realms) {
            out.push(
              `<button type="button" class="game-btn" data-mr="realm" data-realm="${escapeHtml(r.id)}">${escapeHtml(r.name)}</button>`
            );
          }
        } else {
          out.push(`<button type="button" class="game-btn game-btn--astral" data-mr="step">Expedition turn</button>`);
        }
        break;
      case "cards":
        out.push(`<button type="button" class="game-btn" data-mr="mana">Mana tick (+3)</button>`);
        for (const id of s.hand || []) {
          const c = Data()?.byId("cards", id);
          out.push(
            `<button type="button" class="game-btn game-btn--astral" data-mr="card" data-card="${escapeHtml(id)}">Play ${escapeHtml(c?.name || id)}</button>`
          );
        }
        break;
      case "wisp_race":
        out.push(`<button type="button" class="game-btn game-btn--astral" data-mr="leg">Run next leg</button>`);
        out.push(`<button type="button" class="game-btn" data-mr="leg-shard">Burn Lightshard (+1)</button>`);
        if (!s.flags.motherBreathUsed) {
          out.push(`<button type="button" class="game-btn" data-mr="leg-breath">Mother Aspect breath</button>`);
        }
        break;
      default:
        out.push(`<button type="button" class="game-btn game-btn--astral" data-mr="step">Continue</button>`);
    }
    return out;
  }

  function renderSidePanels() {
    if (!modeState) return;
    const status = el("gamePanelStatus");
    const inv = el("gamePanelInventory");
    const journal = el("gamePanelJournal");
    const quest = el("gamePanelQuest");
    const towns = Data()?.str("ten_towns", "Ten Towns");

    if (status) {
      status.innerHTML = `
        <p class="game-meta-line">Mode: <strong>${escapeHtml(modeState.modeId)}</strong>${
          modeState.filler ? ' <span class="mr-filler">FILLER</span>' : ""
        }</p>
        <p class="game-meta-line">${escapeHtml(towns)} · BEYOND stays beyond the shores</p>
        <div class="mr-resources">${resourcesHtml(modeState.resources)}</div>
        <p class="game-meta-line">Clock stage ${modeState.clockStage} · Holds ${modeState.holds}</p>
      `;
    }
    if (inv) {
      const structs = (modeState.structures || [])
        .map((id) => Data()?.byId("structures", id)?.name || id)
        .join(", ");
      inv.innerHTML = `
        <p class="game-meta-line">Hand: ${(modeState.hand || []).map(escapeHtml).join(", ") || "—"}</p>
        <p class="game-meta-line">Structures: ${escapeHtml(structs || "none")}</p>
      `;
    }
    if (journal) {
      const lines = (modeState.log || []).slice(-12).reverse();
      journal.innerHTML = lines
        .map((l) => `<p class="game-journal-line">${escapeHtml(l)}</p>`)
        .join("") || '<p class="game-meta-line">No log yet.</p>';
    }
    if (quest) {
      const meta = modeState.meta || {};
      quest.innerHTML = `
        <p class="game-meta-line">Phase: ${escapeHtml(String(meta.phase || "—"))}</p>
        <p class="game-meta-line">Round ${meta.round || meta.boardTurn || 0}${
          meta.roundsMax ? ` / ${meta.roundsMax}` : ""
        }</p>
        <p class="game-meta-line">${
          modeState.done
            ? modeState.won
              ? "Outcome: win"
              : "Outcome: loss"
            : "In progress"
        }</p>
      `;
    }

    const hud = el("gameHudParty");
    if (hud) {
      hud.innerHTML = `
        <div class="game-hud-vitals">
          <span>Warmth ${modeState.resources.warmth}</span>
          <span>Chill ${modeState.resources.chill}</span>
          <span>Mana ${modeState.resources.mana}/${modeState.resources.manaMax}</span>
        </div>
      `;
    }
  }

  function openShellForMode() {
    el("gameStart").hidden = true;
    el("gameStart").dataset.open = "false";
    el("gameShell").hidden = false;
    el("gameShell").dataset.open = "true";
    const gameApi = window.PlanesboundGame;
    if (gameApi?.setPlayOpen) {
      gameApi.setPlayOpen(true);
    } else {
      document.body.classList.add("game-active");
      const layer = el("gameLayer");
      if (layer) {
        layer.hidden = false;
        layer.dataset.open = "true";
      }
      renderModeScene();
    }
    el("gameSceneViewport")?.setAttribute("data-active", "false");
  }

  function beginMorrowroot(name) {
    const start = () => {
      if (!Core()) return;
      const opts = {};
      if (selectedMode === "wisp_race") opts.courseId = selectedCourse;
      modeState = Core().freshModeState(selectedMode, opts);
      modeState.playerName = name || "Traveler";
      pushStartLog(modeState);
      active = true;
      save();
      openShellForMode();
    };
    if (Data()?.isReady?.()) {
      start();
      return;
    }
    Data()
      ?.loadAll?.()
      .then(start)
      .catch((err) => {
        console.error(err);
        alert("Morrowroot data failed to load. Check data/morrowroot/.");
      });
  }

  function deactivate() {
    active = false;
    // Keep modeState in localStorage via save(); clear live flag only
    save();
  }

  function pushStartLog(state) {
    const towns = Data()?.str("ten_towns", "Ten Towns");
    state.log.push(
      `${state.playerName} opens ${state.modeId}. ${towns} stand against the Pitchfrost.`
    );
    if (state.filler) state.log.push("This mode uses [FILLER] rules — easy to swap via data/.");
  }

  function onMrAction(btn) {
    if (!modeState || !Core()) return;
    const act = btn.dataset.mr;
    if (act === "restart") {
      beginMorrowroot(modeState.playerName);
      return;
    }
    if (act === "hub") {
      active = false;
      modeState = null;
      save();
      showStartForModes();
      return;
    }

    let action = {};
    if (act === "dawn") action = { type: "dawn" };
    else if (act === "close") action = { type: "close" };
    else if (act === "hold") action = { type: "hold" };
    else if (act === "hunt") action = { type: "hunt" };
    else if (act === "build") action = { type: "build", structureId: btn.dataset.structure };
    else if (act === "realm") action = { realmId: btn.dataset.realm };
    else if (act === "card") action = { cardId: btn.dataset.card };
    else if (act === "mana") action = {};
    else if (act === "leg") action = {};
    else if (act === "leg-shard") action = { burnShard: true };
    else if (act === "leg-breath") action = { motherBreath: true };
    else action = {};

    modeState = Core().step(modeState, action);
    save();
    renderModeScene();
  }

  function showStartForModes() {
    const start = el("gameStart");
    const shell = el("gameShell");
    if (start) {
      start.hidden = false;
      start.dataset.open = "true";
    }
    if (shell) {
      shell.hidden = true;
      shell.dataset.open = "false";
    }
    active = false;
  }

  function onStartSubmitIntercept(ev) {
    selectedMode = el("gameModeSelect")?.value || "astral_voyage";
    selectedCourse = el("gameRaceCourse")?.value || "race_lighthouse";
    save();
    if (!isMorrowrootMode(selectedMode)) {
      // Let game.js handle Astral voyage
      return;
    }
    ev.preventDefault();
    ev.stopImmediatePropagation();
    const name = (el("gamePlayerName")?.value || "").trim();
    if (!name) {
      el("gamePlayerName")?.focus();
      return;
    }
    beginMorrowroot(name);
  }

  function wire() {
    load();
    fillModeSelect();
    el("gameModeSelect")?.addEventListener("change", () => {
      selectedMode = el("gameModeSelect").value;
      updateModeBlurb();
      updateCourseVisibility();
      save();
    });
    el("gameRaceCourse")?.addEventListener("change", () => {
      selectedCourse = el("gameRaceCourse").value;
      save();
    });

    // Capture-phase so we can divert away from voyage start
    el("gameStartForm")?.addEventListener("submit", onStartSubmitIntercept, true);

    el("gameSceneActions")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-mr]");
      if (!btn || !active) return;
      e.preventDefault();
      e.stopPropagation();
      onMrAction(btn);
    });

    document.addEventListener("planesbound-morrowroot-ready", () => {
      fillModeSelect();
      const tests = Core()?.runRulesTests?.();
      if (tests && !tests.ok) {
        console.warn("Morrowroot rules tests:", tests.failures);
      } else if (tests?.ok) {
        console.info("Morrowroot rules tests OK");
      }
    });
  }

  function api() {
    return {
      isActive: () => active,
      deactivate,
      getModeState: () => (modeState ? { ...modeState, resources: { ...modeState.resources } } : null),
      getSelectedMode: () => selectedMode,
      render: renderModeScene,
    };
  }

  function boot() {
    wire();
    window.PlanesboundMorrowrootPlay = api();
    Data()
      ?.loadAll?.()
      .catch((err) => console.error("Morrowroot data load failed", err));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
