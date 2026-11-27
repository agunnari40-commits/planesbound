/* Planesbound PAS-6/13/15/18/19/23/24/27/33/37/39 — voyage + gates + icons + Web Audio */
(function () {
  const SAVE_KEY = "planesbound-game-v3";
  const SAVE_KEY_V2 = "planesbound-game-v2";
  const SAVE_KEY_LEGACY = "planesbound-game-v1";
  const PLAYER_KEY = "planesbound-player-being-v1";
  const COMPANION_KEY = "planesbound-companion-being-v1";
  const Gates = () => window.PlanesboundCombatGates;

  /** PAS-39: shared Web Audio module (`audio.js`). Fallback keeps play silent-safe if script missing. */
  const AudioCues = window.PlanesboundAudio || {
    hit() {},
    crit() {},
    miss() {},
    hurt() {},
    soft() {},
    kill() {},
    parry() {},
    roll() {},
    travel() {},
    target() {},
    quest() {},
    ui() {},
    isMuted: () => false,
    toggleMute: () => false,
    syncMusicForLocation() {},
    stopMusic() {},
    ensure() {},
  };

  function syncMuteButton() {
    const btn = el("gameMuteAudio");
    if (!btn || !AudioCues.isMuted) return;
    const on = !!AudioCues.isMuted();
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.textContent = on ? "Sound · Off" : "Sound · On";
    btn.title = on ? "Unmute combat cues and music bed" : "Mute all game audio";
  }

  let travelToastTimer = 0;
  let combatFloatSeq = 0;

  const LOCATIONS = {
    hub: {
      title: "Lighthouse Hub",
      theme: "parchment",
      fatigue: 0,
      blurb:
        "Atlas light holds the Inner Ring steady. Rest, counsel the companion, then cast off into the silvery thought-ocean.",
      companion: "Stone underfoot. When you cast off, I cast with you.",
    },
    "astral-sea": {
      title: "Astral Sea",
      theme: "astral",
      fatigue: 1,
      blurb:
        "Silver thought-currents braid the void. Color pools wait like doors; a Dust Lane runs Mineral-ward; Memory Isle and the Lighthouse pulse keep their own weather.",
      companion: "Three pulls: isle for memory, pulse for home, dust for shore-rumor.",
    },
    "memory-isle": {
      title: "Memory Isle",
      theme: "astral",
      fatigue: 1,
      blurb:
        "Crystal shoals of half-remembered worlds. Ani-thread scars glitter underfoot — a place that wants to be read, not rushed.",
      companion: "Read the scars. Perception is the honest skill here.",
    },
    "dust-lane": {
      title: "Dust Lane",
      theme: "astral",
      fatigue: 2,
      blurb:
        "Grit-road of spent color-pool ash. Pilots trade bearings mid-void. Athletics keeps the keel; Insight buys a kinder toll.",
      companion: "Hold the rail. Star Salt softens the lane’s bite.",
    },
    "lighthouse-bearing": {
      title: "Lighthouse Bearing",
      theme: "astral",
      fatigue: 1,
      blurb:
        "A clean Daystar pulse locks the Compass Orb. The hub road opens — Cross the Astral Sea is within reach.",
      companion: "Bearing locked. Home is a straight thought away.",
    },
    "color-pool": {
      title: "Color Pool",
      theme: "astral",
      fatigue: 1,
      blurb:
        "A prismatic curtain hangs in the void. The light tests travelers before Mineral grit answers.",
      companion: "Pools have teeth. Blade-thought or soft word — choose cleanly.",
    },
    "mineral-shore": {
      title: "Mineral Shore",
      theme: "parchment",
      fatigue: 1,
      blurb:
        "Landfall: living crystal and facet-glow. Ani’s hush hangs in the ore — the chapter’s edge if you claim it.",
      companion: "Shore. Token. Rest. Close the chapter when you will.",
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
    { w: 1, text: "Ani-thread snags the keel — you cut free with a whispered name." },
    {
      w: 1,
      text: "A drifting pouch of star-salt bumps the rail. You stow it.",
      item: {
        id: "star-salt",
        name: "Star Salt",
        desc: "Fine grit from a dead color pool. Softens Dust Lane travel and brightens trails.",
      },
    },
    {
      w: 1,
      text: "A scrap of Will-o’-Wisp counsel sticks to the mast: race when the dust sings.",
      item: {
        id: "wisp-scrap",
        name: "Wisp Scrap",
        desc: "Half a race charter. Points Mineral-ward; unlocks Dust Lane counsel.",
      },
    },
  ];

  const SKILL_ABILITY = {
    Perception: "wis",
    Insight: "wis",
    Athletics: "str",
    Survival: "wis",
    Investigation: "int",
  };

  /** @type {ReturnType<typeof defaultState>} */
  let state = defaultState();
  let activeTab = "status";
  let playOpen = false;
  let encounter = null;
  let combatGateRaf = 0;

  /** Encounter 3D stage (skinned meshes + hitboxes). */
  let stage = null;
  let stageBootGen = 0;
  let stageFlourishTimer = 0;

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
      chapterComplete: false,
      chapterAcked: false,
      isleChecked: false,
      dustChecked: false,
      poolChecked: false,
      flags: {},
      voyageLegs: 0,
      hp: 10,
      hpMax: 10,
      fatigue: 0,
      fatigueMax: 6,
      level: 1,
      milestoneGiven: false,
      equipped: null,
      lastRoll: null,
    };
  }

  function sheetSnapshot() {
    const sheet = window.PlanesboundSheets?.get?.("player");
    if (!sheet) return null;
    return sheet;
  }

  function syncVitalsFromSheet(s) {
    const sheet = sheetSnapshot();
    const sheetHp = Number(sheet?.hp);
    const sheetLevel = Number(sheet?.level);
    // Prefer the higher of voyage save vs sheet so a stale sheet never
    // downgrades a milestone level / hpMax already recorded in the save.
    const hpMax = Math.max(
      1,
      Number(s.hpMax) || 0,
      Number.isFinite(sheetHp) && sheetHp > 0 ? sheetHp : 0
    );
    const level = Math.max(
      1,
      Number(s.level) || 0,
      Number.isFinite(sheetLevel) && sheetLevel > 0 ? sheetLevel : 0
    );
    s.hpMax = hpMax;
    s.level = level;
    if (s.hp == null || s.hp > hpMax) s.hp = hpMax;
    if (s.hp < 1) s.hp = 1;
    return s;
  }

  function load() {
    try {
      const raw =
        localStorage.getItem(SAVE_KEY) ||
        localStorage.getItem(SAVE_KEY_V2) ||
        localStorage.getItem(SAVE_KEY_LEGACY);
      if (!raw) return syncVitalsFromSheet(defaultState());
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
      if (merged.questComplete && !merged.shoreQuestComplete && !merged.shoreQuestActive) {
        merged.shoreQuestActive = true;
      }
      if (
        !merged.shoreQuestComplete &&
        merged.objectives?.pool &&
        merged.objectives?.shore
      ) {
        // v2/v1 finished shore saves may lack shoreQuestComplete / chapter flags.
        merged.shoreQuestComplete = true;
        merged.shoreQuestActive = true;
      }
      if (merged.shoreQuestComplete && !merged.chapterComplete) {
        // Promote finished shore → chapter without requiring chapterReady
        // (that flag was only written together with chapterComplete).
        merged.chapterComplete = true;
        merged.flags.chapterReady = true;
      }
      return syncVitalsFromSheet(merged);
    } catch (_) {
      return syncVitalsFromSheet(defaultState());
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

  function persistSheetLevelHp() {
    try {
      const api = window.PlanesboundSheets;
      if (typeof api?.patch === "function") {
        api.patch("player", { level: state.level, hp: state.hpMax });
        return;
      }
      // Fallback when sheets API is unavailable: keep localStorage + any cached object in sync.
      const key = "planesbound-sheet-player-v1";
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const sheet = JSON.parse(raw);
      sheet.level = state.level;
      sheet.hp = state.hpMax;
      localStorage.setItem(key, JSON.stringify(sheet));
      const cached = api?.get?.("player");
      if (cached && typeof cached === "object") {
        cached.level = state.level;
        cached.hp = state.hpMax;
      }
    } catch (_) {
      /* ignore */
    }
  }

  function pushJournal(line) {
    state.journal.unshift(line);
    if (state.journal.length > 48) state.journal.length = 48;
  }

  function companionSay(line) {
    pushJournal(`Companion: ${line}`);
  }

  function nextObjectiveHint() {
    if (state.chapterComplete) return "Explore or begin a new voyage";
    if (!state.objectives.embark) return "Cast off into the Astral Sea";
    if (!state.objectives.discover) return "Seek a memory isle";
    if (!state.objectives.bearing) return "Lock a Lighthouse bearing";
    if (!state.objectives.pool) return "Touch a color pool";
    if (!state.objectives.shore) return "Make Mineral landfall";
    return "Chapter ready to close";
  }

  function spawnCombatFloat(text, kind) {
    const host = el("gameCombatFloats") || el("gameSceneViewport") || el("gameScene");
    if (!host || !text) return;
    const node = document.createElement("span");
    const k = kind || "hit";
    node.className = `game-combat-float game-combat-float--${k}`;
    node.textContent = text;
    const seq = ++combatFloatSeq;
    const x = 52 + ((seq * 13) % 28) - 14;
    const y = 38 + ((seq * 9) % 18) - 6;
    node.style.left = `${x}%`;
    node.style.top = `${y}%`;
    host.appendChild(node);
    setTimeout(() => node.remove(), 980);
  }

  function showTravelToast(title, hint) {
    let toast = el("gameTravelToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "gameTravelToast";
      toast.className = "game-travel-toast";
      toast.setAttribute("aria-live", "polite");
      toast.dataset.open = "false";
      el("gameScene")?.appendChild(toast);
    }
    toast.innerHTML = `<strong>${escapeHtml(title)}</strong>${
      hint ? `<span>${escapeHtml(hint)}</span>` : ""
    }`;
    toast.dataset.open = "true";
    if (travelToastTimer) clearTimeout(travelToastTimer);
    travelToastTimer = setTimeout(() => {
      toast.dataset.open = "false";
      travelToastTimer = 0;
    }, 1700);
  }

  function pulseSceneTravel() {
    const scene = el("gameScene");
    if (!scene) return;
    scene.dataset.travel = "pulse";
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      delete scene.dataset.travel;
      return;
    }
    setTimeout(() => {
      if (scene.dataset.travel === "pulse") delete scene.dataset.travel;
    }, 480);
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

  function abilityMod(abil) {
    const sheet = sheetSnapshot();
    const score = Number(sheet?.abilities?.[abil] ?? 10);
    return Math.floor((score - 10) / 2);
  }

  function hasSkillProf(skillName) {
    const sheet = sheetSnapshot();
    const skills = sheet?.skills || sheet?.skillProficiencies;
    if (skills && typeof skills === "object" && !Array.isArray(skills)) {
      return Object.entries(skills).some(([name, on]) => on && name.toLowerCase() === skillName.toLowerCase());
    }
    if (Array.isArray(skills)) {
      return skills.some((s) => String(s).toLowerCase() === skillName.toLowerCase());
    }
    return false;
  }

  function skillMod(skillName) {
    const abil = SKILL_ABILITY[skillName] || "wis";
    let mod = abilityMod(abil);
    if (hasSkillProf(skillName)) mod += 2 + Math.max(0, Math.floor((state.level || 1) / 4));
    else {
      // Being tradition soft fallback when sheet lacks the skill
      const id = state.playerBeingId || "human";
      if (/elf|aasimar|gnome/i.test(id) && /perception|insight|investigation/i.test(skillName)) mod += 1;
      if (/dwarf|orc|dragonborn/i.test(id) && /athletics|survival/i.test(skillName)) mod += 1;
    }
    if (state.equipped === "star-salt" && /survival|perception/i.test(skillName)) mod += 1;
    if (state.equipped === "clear-shard" && /insight|perception/i.test(skillName)) mod += 1;
    if (state.equipped === "void-line" && /athletics/i.test(skillName)) mod += 2;
    if (state.equipped === "prism-scale" && /athletics|insight/i.test(skillName)) mod += 1;
    if (state.fatigue >= state.fatigueMax - 1) mod -= 1;
    return mod;
  }

  function rollD20() {
    return 1 + Math.floor(Math.random() * 20);
  }

  function recordRoll(skill, roll, mod, dc, ok) {
    state.lastRoll = { skill, roll, mod, total: roll + mod, dc, ok, at: state.location };
  }

  function activeQuest() {
    if (!state.questComplete) return QUESTS["cross-astral-sea"];
    if (state.shoreQuestActive && !state.shoreQuestComplete) return QUESTS["inner-ring-shore"];
    return state.shoreQuestComplete ? QUESTS["inner-ring-shore"] : QUESTS["cross-astral-sea"];
  }

  function grantMilestone() {
    if (state.milestoneGiven) return;
    state.milestoneGiven = true;
    state.level = Math.max(state.level || 1, 1) + 1;
    state.hpMax += 4 + Math.max(0, abilityMod("con"));
    state.hp = state.hpMax;
    persistSheetLevelHp();
    pushJournal(
      `Milestone: the Lighthouse marks you Level ${state.level}. HP set to ${state.hp}/${state.hpMax}.`
    );
    companionSay("The Daystar noticed. Wear the boon lightly.");
  }

  function maybeChapterWin() {
    if (!state.shoreQuestComplete || state.chapterComplete) return;
    if (encounter) return; // defer until encounter is cleared
    state.chapterComplete = true;
    state.flags.chapterReady = true;
    pushJournal("Chapter complete: First Crossing of the Astral Sea — shore secured.");
    companionSay("Chapter closed. Continue exploring, or begin a new voyage from the hub.");
    save();
    showChapterComplete(true);
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
    AudioCues.quest();

    if (!state.questComplete && q1.objectives.every((o) => state.objectives[o.id])) {
      state.questComplete = true;
      state.shoreQuestActive = true;
      pushJournal(
        "Quest complete: Cross the Astral Sea. New charge: First Shore of the Inner Ring — seek a color pool."
      );
      grantMilestone();
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
    const astralish = (k) =>
      k === "astral-sea" ||
      k === "memory-isle" ||
      k === "lighthouse-bearing" ||
      k === "color-pool" ||
      k === "dust-lane";
    if (!(astralish(from) || astralish(to))) return;
    if (from === to) return;
    if (Math.random() > 0.55 && state.voyageLegs > 1) {
      const ev = pickTravelEvent();
      pushJournal(`Voyage: ${ev.text}`);
      if (ev.item) addItem(ev.item);
    }
  }

  function applyFatigue(loc) {
    const cost = LOCATIONS[loc]?.fatigue || 0;
    let adj = cost;
    if (loc === "dust-lane" && (hasItem("star-salt") || state.equipped === "star-salt")) adj = Math.max(0, cost - 1);
    if (adj <= 0) return;
    state.fatigue = Math.min(state.fatigueMax, (state.fatigue || 0) + adj);
    if (state.fatigue >= state.fatigueMax) {
      const dmg = 1;
      state.hp = Math.max(1, state.hp - dmg);
      pushJournal(`Fatigue peaks — you lose ${dmg} HP (now ${state.hp}/${state.hpMax}). Rest when you can.`);
    }
  }

  function shortRest() {
    if (encounter || stage?.flourishing) return;
    if (state.location !== "hub" && state.location !== "mineral-shore" && state.location !== "memory-isle") {
      pushJournal("Rest blocked: only hub, Memory Isle, or Mineral Shore offer safe short rest.");
      save();
      render();
      return;
    }
    const heal = Math.max(2, 2 + abilityMod("con") + Math.floor((state.level || 1) / 2));
    const before = state.hp;
    state.hp = Math.min(state.hpMax, state.hp + heal);
    state.fatigue = Math.max(0, state.fatigue - 3);
    pushJournal(`Short rest: recover ${state.hp - before} HP (${state.hp}/${state.hpMax}). Fatigue eases to ${state.fatigue}.`);
    companionSay(LOCATIONS[state.location]?.companion || "Rest while the Sea allows.");
    save();
    render();
  }

  function openIsleEncounter() {
    if (state.isleChecked || encounter) return;
    const mod = skillMod("Perception");
    encounter = {
      kind: "isle-check",
      skill: "Perception",
      title: "Isle scars — a reading",
      body: `Ani-thread scars spider across the crystal. Companion waits. Roll Perception (d20${mod ? ` + ${mod}` : ""}) vs DC 12.`,
      choices: [
        { id: "roll", label: "Roll Perception" },
        { id: "skip", label: "Leave the scars unread" },
      ],
      mod,
      dc: 12,
    };
    renderEncounter();
  }

  function openDustEncounter() {
    if (state.dustChecked || encounter) return;
    const ath = skillMod("Athletics");
    const ins = skillMod("Insight");
    encounter = {
      kind: "dust-check",
      title: "Dust Lane — grit and pilots",
      body: `Ash current shears the keel. Climb the rail (Athletics d20${ath ? ` + ${ath}` : ""} vs DC 13) or read the pilots (Insight d20${ins ? ` + ${ins}` : ""} vs DC 12).`,
      choices: [
        { id: "athletics", label: "Athletics — hold the rail" },
        { id: "insight", label: "Insight — bargain with pilots" },
        { id: "skip", label: "Push through blindly" },
      ],
      ath,
      ins,
      dcAth: 13,
      dcIns: 12,
    };
    renderEncounter();
  }

  function openPoolEncounter() {
    if (state.poolChecked || encounter) return;
    const ath = skillMod("Athletics");
    const ins = skillMod("Insight");
    encounter = {
      kind: "pool-skirmish",
      live: true,
      title: "Pool guardian — light with teeth",
      body: "A luminous coil bars the curtain. Target the foe, then strike, speak softly, or call your companion. Equipped gear and mid-fight Use decisions matter.",
      foeName: "Pool Coil",
      foeHp: 16,
      foeHpMax: 16,
      threat: 0,
      threatMax: 3,
      assistUsed: false,
      targeted: false,
      resolving: false,
      ath,
      ins,
      dc: 14,
      dcSoft: 12,
      choices: [],
      gates: Gates()?.createState?.() || null,
    };
    lastAppliedIncomingKey = null;
    syncLiveChoices();
    renderEncounter();
    ensureCombatGateLoop();
  }

  function stopCombatGateLoop() {
    if (combatGateRaf) {
      cancelAnimationFrame(combatGateRaf);
      combatGateRaf = 0;
    }
  }

  /** Dedup key for last applied incoming gate result (avoids dropped/double apply). */
  let lastAppliedIncomingKey = null;

  function applyIncomingGateResult(result) {
    if (!encounter?.live || !result) return;
    if (result.blocked === "iframe") {
      spawnCombatFloat("dodge", "miss");
      AudioCues.miss();
      stage?.showBeat?.("Roll i-frame — clean", 1000);
      pushJournal("Coil strike passes through your roll (i-frame).");
      companionSay("Feet — yes.");
      return;
    }
    if (result.blocked === "parry") {
      spawnCombatFloat("parry", "assist");
      AudioCues.hit();
      stage?.showBeat?.("Parry!", 1000);
      pushJournal("Parry catches the coil mid-lash.");
      companionSay("Window read.");
      return;
    }
    if (result.hit) {
      const dmg = result.damage || 2;
      state.hp = Math.max(1, state.hp - dmg);
      stage?.playFoeStrike?.();
      spawnCombatFloat(`−${dmg}`, "hurt");
      AudioCues.hurt();
      stage?.showBeat?.(`Coil strikes — −${dmg} HP`, 1200);
      pushJournal(`Threat breaks: coil lashes for ${dmg} HP (${state.hp}/${state.hpMax}).`);
      companionSay("Hold the line — threat reset.");
    }
  }

  /**
   * Tick gates and apply any newly committed incoming result exactly once.
   * Used by the rAF loop and by syncLiveChoices so a tick outside rAF cannot drop damage.
   */
  function flushGateTick(now) {
    const CG = Gates();
    if (!CG || !encounter?.live || !encounter.gates) return false;
    CG.tick(encounter.gates, now);
    const result = encounter.gates.lastResult;
    if (!result || result.type !== "incoming" || !encounter.gates.attackResolved) return false;
    const key = `${result.at}|${result.blocked}|${result.hit ? 1 : 0}|${result.damage || 0}`;
    if (key === lastAppliedIncomingKey) return false;
    lastAppliedIncomingKey = key;
    applyIncomingGateResult(result);
    save();
    return true;
  }

  function ensureCombatGateLoop() {
    if (combatGateRaf || !encounter?.live || !encounter.gates || !Gates()) return;
    let lastChoiceSig = "";
    const step = (now) => {
      combatGateRaf = 0;
      if (!encounter?.live || !encounter.gates) return;
      const applied = flushGateTick(now);
      if (applied) {
        render();
        lastChoiceSig = "";
      }
      // skipTick: rAF already flushed; avoid a second tick with a later now that could race.
      syncLiveChoices({ skipTick: true });
      const sig = (encounter.choices || [])
        .map((c) => `${c.id}:${c.disabled ? 1 : 0}`)
        .join("|");
      // Rebuild actions only when id/disabled flip — not when Parry label toggles NOW.
      if (sig !== lastChoiceSig) {
        lastChoiceSig = sig;
        renderEncounterChrome();
      } else {
        renderEncounterVitalsOnly();
      }
      combatGateRaf = requestAnimationFrame(step);
    };
    combatGateRaf = requestAnimationFrame(step);
  }

  function parryChoiceLabel(telegraph, parryOpen, sta, CG) {
    const cost = sta != null && CG ? ` · ${CG.ACTIONS.parry.stamina} STA` : "";
    if (parryOpen) return `Parry · NOW${cost}`;
    if (telegraph) return `Parry · wait window${cost}`;
    return `Parry · on telegraph${cost}`;
  }

  function renderEncounterVitalsOnly() {
    const vitals = el("gameEncounterVitals");
    if (!vitals || !encounter?.live) return;
    const g = encounter.gates;
    const staMax = g?.staminaMax || 100;
    const staNow = g ? Math.round(g.stamina) : staMax;
    const staPct = Math.max(0, Math.min(100, (staNow / Math.max(1, staMax)) * 100));
    const CG = Gates();
    const now = performance.now();
    const telegraph = !!(g && g.attackActive && !g.attackResolved);
    const parryOpen = !!(g && CG && CG.inParryWindow(g, now));
    const rolling = !!(g && CG && CG.isRolling(g, now));
    const staEl = vitals.querySelector(".game-vital--sta");
    if (staEl) {
      staEl.childNodes[0].textContent = `STA ${staNow}/${staMax}`;
      const bar = staEl.querySelector("b");
      if (bar) bar.style.width = `${staPct}%`;
    }
    vitals.dataset.parryOpen = parryOpen ? "true" : "false";
    let gate = vitals.querySelector(".game-vital--gate");
    if (telegraph || rolling) {
      if (!gate) {
        gate = document.createElement("span");
        gate.className = "game-vital game-vital--gate";
        vitals.appendChild(gate);
      }
      gate.classList.toggle("game-vital--parry-open", parryOpen);
      gate.classList.toggle("game-vital--rolling", rolling && !telegraph);
      gate.textContent = telegraph ? (parryOpen ? "PARRY NOW" : "TELEGRAPH") : "ROLL i-frame";
    } else if (gate) {
      gate.remove();
    }
    const parryBtn = el("gameEncounterActions")?.querySelector('[data-encounter-choice="parry"]');
    if (parryBtn) {
      parryBtn.classList.toggle("game-btn--parry-now", parryOpen);
      // Update label in place so focus / in-flight click is not destroyed at window open.
      const choice = encounter.choices?.find((c) => c.id === "parry");
      const label = parryChoiceLabel(telegraph, parryOpen, staNow, CG);
      if (choice) choice.label = label;
      // Prefer label span so PAS-37 icons are not wiped by in-place parry updates.
      const labelEl = parryBtn.querySelector(".game-btn-label");
      if (labelEl) {
        if (labelEl.textContent !== label) labelEl.textContent = label;
      } else if (parryBtn.textContent !== label) {
        parryBtn.textContent = label;
      }
    }
  }

  function syncLiveChoices(opts = {}) {
    if (!encounter?.live) return;
    const needTarget = !encounter.targeted;
    const busy = !!encounter.resolving;
    const companionLabel = beingName(state.companionBeingId, "Companion");
    const CG = Gates();
    const g = encounter.gates;
    const now = performance.now();
    // Tick + apply here unless the rAF step already flushed this frame.
    if (!opts.skipTick && g && CG) {
      if (flushGateTick(now)) render();
    }
    const sta = g ? Math.round(g.stamina) : null;
    const winded = (action) => (g && CG ? !CG.canAfford(g, action) : false);
    const telegraph = !!(g && g.attackActive && !g.attackResolved);
    const parryOpen = !!(g && CG && CG.inParryWindow(g, now));
    encounter.choices = [
      {
        id: "strike",
        label: needTarget
          ? "Strike (target foe first)"
          : `Strike · Athletics vs DC ${encounter.dc}${sta != null ? ` · ${CG.ACTIONS.strike.stamina} STA` : ""}`,
        disabled: needTarget || busy || winded("strike") || telegraph,
        kind: "strike",
      },
      {
        id: "soft",
        label: `Soft word · Insight vs DC ${encounter.dcSoft}${sta != null ? ` · ${CG.ACTIONS.soft.stamina} STA` : ""}`,
        disabled: busy || winded("soft") || telegraph,
        kind: "soft",
      },
      {
        id: "assist",
        label: encounter.assistUsed ? `${companionLabel} spent` : `${companionLabel} assist${sta != null ? ` · ${CG.ACTIONS.assist.stamina} STA` : ""}`,
        disabled: busy || encounter.assistUsed || needTarget || winded("assist") || telegraph,
        kind: "assist",
      },
      {
        id: "roll",
        label: `Roll · i-frames${sta != null ? ` · ${CG.ACTIONS.roll.stamina} STA` : ""}`,
        disabled: busy || winded("roll") || !!(g && CG?.isRolling(g, now)),
        kind: "roll",
      },
      {
        id: "parry",
        label: parryChoiceLabel(telegraph, parryOpen, sta, CG),
        disabled: busy || winded("parry") || !telegraph,
        kind: "parry",
      },
      {
        id: "slip",
        label: "Slip past (take 2 damage)",
        disabled: busy || telegraph,
        kind: "slip",
      },
    ];
  }

  function combatEquipBonus() {
    if (state.equipped === "void-line") return { dmg: 2, label: "Void Line" };
    if (state.equipped === "star-salt") return { dmg: 1, label: "Star Salt" };
    if (state.equipped === "clear-shard") return { dmg: 1, label: "Clear Shard" };
    if (state.equipped === "prism-scale") return { dmg: 1, label: "Prism Scale" };
    return { dmg: 0, label: null };
  }

  /** Esc cancel: close modal with no HP/fatigue/checked side effects. */
  function dismissEncounter() {
    if (!encounter) return;
    stopCombatGateLoop();
    encounter = null;
    teardownEncounterStage();
    renderEncounter();
    render();
    maybeChapterWin();
  }

  function encounterWantsStage(enc) {
    if (!enc) return false;
    return enc.kind === "pool-skirmish" || enc.kind === "isle-check" || enc.kind === "dust-check";
  }

  function clearStageFlourishTimer() {
    if (stageFlourishTimer) {
      clearTimeout(stageFlourishTimer);
      stageFlourishTimer = 0;
    }
  }

  function teardownEncounterStage() {
    stopCombatGateLoop();
    clearStageFlourishTimer();
    stageBootGen += 1; // invalidate any in-flight boot
    if (stage) {
      try {
        stage.dispose?.();
      } catch (_) {
        /* ignore */
      }
      stage = null;
    }
    const vp = el("gameSceneViewport");
    if (vp) {
      vp.dataset.active = "false";
      vp.setAttribute("aria-hidden", "true");
    }
    const sceneEl = el("gameScene");
    if (sceneEl) sceneEl.removeAttribute("data-stage");
    const tgt = el("gameSceneTarget");
    if (tgt) tgt.hidden = true;
    const floats = el("gameCombatFloats");
    if (floats) floats.replaceChildren();
    if (vp) delete vp.dataset.flash;
  }

  async function bootEncounterStage(enc) {
    clearStageFlourishTimer();
    if (stage) {
      try {
        stage.dispose?.();
      } catch (_) {
        /* ignore */
      }
      stage = null;
    }
    if (!encounterWantsStage(enc)) {
      const vp0 = el("gameSceneViewport");
      if (vp0) {
        vp0.dataset.active = "false";
        vp0.setAttribute("aria-hidden", "true");
      }
      el("gameScene")?.removeAttribute("data-stage");
      return;
    }
    const Wow = window.PlanesboundWowActors;
    const Video = window.PlanesboundVideoMode;
    const canvas = el("gameSceneCanvas");
    const vp = el("gameSceneViewport");
    if (!Wow?.createActor || !canvas || !vp) return;

    const gen = ++stageBootGen;
    vp.dataset.active = "true";
    vp.setAttribute("aria-hidden", "false");
    el("gameScene")?.setAttribute("data-stage", "true");

    let renderer = null;
    let actors = [];
    let animId = 0;
    let flashTimer = 0;

    const abortCleanup = () => {
      if (animId) cancelAnimationFrame(animId);
      animId = 0;
      if (flashTimer) {
        clearTimeout(flashTimer);
        flashTimer = 0;
      }
      if (vp) delete vp.dataset.flash;
      actors.forEach((a) => {
        try {
          a.dispose?.();
        } catch (_) {
          /* ignore */
        }
      });
      actors = [];
      if (renderer) {
        try {
          renderer.dispose();
        } catch (_) {
          /* ignore */
        }
        renderer = null;
      }
    };

    try {
      const T = await Wow.loadThree();
      if (gen !== stageBootGen || !encounter) {
        abortCleanup();
        return;
      }

      const syncSize = () => {
        const r = canvas.getBoundingClientRect();
        const width = Math.max(320, r.width || 640);
        const height = Math.max(220, r.height || 360);
        return { width, height };
      };
      void vp.offsetWidth;
      let { width, height } = syncSize();

      const rOpts = Video?.rendererOpts?.() || { antialias: true, alpha: true };
      renderer = new T.WebGLRenderer({
        canvas,
        antialias: !!rOpts.antialias,
        alpha: true,
        powerPreference: rOpts.powerPreference || "default",
      });
      if (Video?.applyRenderer) Video.applyRenderer(renderer, T);
      else renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      renderer.outputColorSpace = T.SRGBColorSpace;
      renderer.setClearColor(0x000000, 0);
      const vMode = Video?.getMode?.();
      if (renderer.shadowMap) {
        renderer.shadowMap.enabled = !!vMode?.shadows;
      }

      const scene = new T.Scene();
      // Static camera — no bob (PAS-18)
      const camera = new T.PerspectiveCamera(42, width / Math.max(1, height), 0.1, 80);
      camera.position.set(0, 1.9, 5.6);
      camera.lookAt(0, 1.15, 0);

      const poolBeat = enc?.kind === "pool-skirmish";
      scene.add(new T.HemisphereLight(poolBeat ? 0xd4e8ff : 0xc4d0ff, 0x1a1208, poolBeat ? 0.82 : 0.72));
      const key = new T.DirectionalLight(0xfff6ea, poolBeat ? 1.25 : 1.1);
      key.position.set(4, 8, 5);
      key.castShadow = !!vMode?.shadows;
      scene.add(key);
      const fill = new T.DirectionalLight(poolBeat ? 0x9ad0e8 : 0x7eb0c8, poolBeat ? 0.52 : 0.38);
      fill.position.set(-5, 3, -2);
      scene.add(fill);
      // PAS-34: prismatic rim light for Color Pool guardian beat (dream-loop chase)
      if (poolBeat) {
        const rim = new T.PointLight(0xc8a0ff, 0.55, 14, 2);
        rim.position.set(-1.2, 2.4, 1.5);
        scene.add(rim);
        const poolGlow = new T.PointLight(0x70d0ff, 0.7, 16, 2);
        poolGlow.position.set(1.4, 1.1, 0.4);
        scene.add(poolGlow);
      }

      const floor = new T.Mesh(
        new T.CircleGeometry(3.6, 48),
        new T.MeshStandardMaterial({
          color: 0x1a2230,
          roughness: 0.85,
          metalness: 0.1,
          transparent: true,
          opacity: 0.55,
        })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      const foeLabel =
        enc.foeName ||
        (enc.kind === "pool-skirmish"
          ? "Pool Coil"
          : enc.kind === "isle-check"
            ? "Memory Scar"
            : "Dust Pilot");
      const foeHpMax = enc.live ? enc.foeHpMax || 16 : 12;
      const foeHp = enc.live ? enc.foeHp ?? foeHpMax : foeHpMax;

      // Push into `actors` as each create succeeds so abortCleanup / catch dispose orphans
      const playerActor = await Wow.createActor({
        id: "stage-player",
        role: "player",
        url: Wow.MODEL.player,
        label: state.playerName || "Player",
        tint: 0xc5a059,
        x: -1.55,
        z: 0.55,
        scale: 1.0,
        hp: state.hp,
        hpMax: state.hpMax,
      });
      actors.push(playerActor);
      if (gen !== stageBootGen || !encounter) {
        abortCleanup();
        return;
      }

      const companionActor = await Wow.createActor({
        id: "stage-companion",
        role: "companion",
        url: Wow.MODEL.companion,
        label: beingName(state.companionBeingId),
        tint: 0x7eb0c8,
        x: -0.35,
        z: 1.05,
        scale: 0.98,
      });
      actors.push(companionActor);
      if (gen !== stageBootGen || !encounter) {
        abortCleanup();
        return;
      }

      const foeActor = await Wow.createActor({
        id: "stage-foe",
        role: "foe",
        url: Wow.MODEL.foe,
        label: foeLabel,
        tint: 0xb84a3a,
        x: 1.55,
        z: -0.15,
        scale: 1.08,
        hp: foeHp,
        hpMax: foeHpMax,
      });
      actors.push(foeActor);
      if (gen !== stageBootGen || !encounter) {
        abortCleanup();
        return;
      }
      playerActor.root.rotation.y = Math.PI * 0.28;
      companionActor.root.rotation.y = Math.PI * 0.42;
      foeActor.root.rotation.y = -Math.PI * 0.45;
      scene.add(playerActor.root, companionActor.root, foeActor.root);

      let selected = null;
      let hovered = null;
      const raycaster = new T.Raycaster();
      const reduced = Wow.prefersReducedMotion?.() || false;
      let last = performance.now();
      let disposed = false;
      let floatMsg = "";
      let floatUntil = 0;

      const hint = el("gameSceneHint");
      if (hint) {
        hint.textContent = enc.live
          ? "Target foe → Strike / Soft word / Assist · Inventory Use mid-fight · Esc clears"
          : "Click the foe hitbox to target · Esc clears";
      }

      function resize() {
        if (disposed || !renderer || !camera) return;
        ({ width, height } = syncSize());
        camera.aspect = width / Math.max(1, height);
        camera.updateProjectionMatrix();
        if (Video?.applyRenderer) Video.applyRenderer(renderer, T);
        renderer.setSize(width, height, false);
      }
      resize();
      window.addEventListener("resize", resize);

      function foeHpNow() {
        return encounter?.live ? encounter.foeHp : foeHpMax;
      }

      function setTargetHud(actor) {
        const box = el("gameSceneTarget");
        const nameEl = el("gameSceneTargetName");
        const meta = el("gameSceneTargetMeta");
        const bars = el("gameSceneTargetBars");
        const hpBar = el("gameSceneTargetHpBar");
        const threatBar = el("gameSceneTargetThreatBar");
        if (!box) return;
        if (!actor || actor.role !== "foe") {
          box.hidden = true;
          return;
        }
        if (nameEl) nameEl.textContent = foeLabel;
        const threat = encounter?.live ? encounter.threat : 0;
        const threatMax = encounter?.live ? encounter.threatMax || 1 : 1;
        const hp = foeHpNow();
        if (meta) {
          meta.textContent = encounter?.live
            ? `Hostile · HP ${hp}/${foeHpMax} · Threat ${threat}/${threatMax}`
            : "Hostile · mesh hitbox locked";
        }
        if (bars) bars.hidden = !encounter?.live;
        if (hpBar) hpBar.style.width = `${Math.max(0, Math.min(100, (hp / Math.max(1, foeHpMax)) * 100))}%`;
        if (threatBar) {
          threatBar.style.width = `${Math.max(0, Math.min(100, (threat / Math.max(1, threatMax)) * 100))}%`;
        }
        box.hidden = false;
        actor.setLabel?.(foeLabel, hp, foeHpMax);
      }

      function clearSel() {
        if (selected) selected.setSelected(false);
        selected = null;
        if (encounter?.live) {
          encounter.targeted = false;
          syncLiveChoices();
          renderEncounterChrome();
        }
        setTargetHud(null);
      }

      function pick(e) {
        const rect = canvas.getBoundingClientRect();
        const ndc = new T.Vector2(
          ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1,
          -((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1
        );
        raycaster.setFromCamera(ndc, camera);
        return Wow.pickActor(raycaster, actors, true);
      }

      const onMove = (e) => {
        if (disposed) return;
        const hit = pick(e);
        if (hit !== hovered) {
          if (hovered) hovered.setHovered(false);
          hovered = hit;
          if (hovered && hovered !== selected) hovered.setHovered(true);
        }
        canvas.style.cursor = hit && hit.role === "foe" ? "crosshair" : hit ? "pointer" : "default";
      };
      const onClick = (e) => {
        if (disposed) return;
        const hit = pick(e);
        if (hit && hit.role === "foe") {
          if (selected && selected !== hit) selected.setSelected(false);
          selected = hit;
          hit.setSelected(true);
          if (encounter?.live) {
            encounter.targeted = true;
            syncLiveChoices();
            renderEncounterChrome();
          }
          setTargetHud(hit);
          AudioCues.target();
          if (!reduced) {
            companionActor.play("idle");
            playerActor.play("attack", { once: true });
          }
          companionSay("Marked. I am with you.");
        } else if (hit && hit.role === "companion") {
          companionSay(LOCATIONS[state.location]?.companion || "Ready when you are.");
          AudioCues.soft();
          if (!reduced) companionActor.play("attack", { once: true });
        } else {
          clearSel();
        }
      };

      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("click", onClick);

      function tick(now) {
        if (disposed || gen !== stageBootGen) return;
        animId = requestAnimationFrame(tick);
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        for (const a of actors) a.update(dt);
        // Camera stays static — no bob
        renderer.render(scene, camera);
        if (floatMsg && now < floatUntil) {
          const beat = el("gameSceneBeat");
          if (beat) {
            beat.hidden = false;
            beat.textContent = floatMsg;
          }
        } else if (floatMsg && now >= floatUntil) {
          floatMsg = "";
          const beat = el("gameSceneBeat");
          if (beat) beat.hidden = true;
        }
      }
      animId = requestAnimationFrame(tick);

      if (!reduced) {
        playerActor.play("idle");
        companionActor.play("idle");
        foeActor.play("walk");
        setTimeout(() => {
          if (!disposed && gen === stageBootGen) foeActor.play("idle");
        }, 1600);
      }

      if (gen !== stageBootGen || !encounter) {
        abortCleanup();
        window.removeEventListener("resize", resize);
        return;
      }

      function flashStage(kind) {
        if (!vp || reduced) return;
        vp.dataset.flash = kind || "hit";
        if (flashTimer) clearTimeout(flashTimer);
        flashTimer = setTimeout(() => {
          if (vp.dataset.flash === kind) delete vp.dataset.flash;
          flashTimer = 0;
        }, 220);
      }

      stage = {
        gen,
        flourishing: false,
        live: !!enc.live,
        hasFoeTarget: () => selected?.role === "foe",
        refreshFoeHud() {
          if (selected?.role === "foe") setTargetHud(selected);
          else foeActor.setLabel?.(foeLabel, foeHpNow(), foeHpMax);
        },
        showBeat(text, ms = 1400) {
          floatMsg = text;
          floatUntil = performance.now() + ms;
          const beat = el("gameSceneBeat");
          if (beat) {
            beat.hidden = false;
            beat.textContent = text;
          }
        },
        playStrike({ hit, kill, assist, crit }) {
          if (reduced) return;
          playerActor.play("attack", { once: true });
          if (assist) companionActor.play("attack", { once: true });
          if (kill) foeActor.play("death", { once: true });
          else if (hit) foeActor.play("hit", { once: true });
          flashStage(hit ? (crit ? "crit" : "hit") : "miss");
        },
        playFoeStrike() {
          if (reduced) return;
          foeActor.play("attack", { once: true });
          playerActor.play("hit", { once: true });
          flashStage("hurt");
        },
        playSoft() {
          if (reduced) return;
          companionActor.play("attack", { once: true });
          flashStage("soft");
          foeActor.play("hit", { once: true });
        },
        playResolve(won) {
          if (reduced) return;
          if (won) {
            playerActor.play("attack", { once: true });
            companionActor.play("attack", { once: true });
            foeActor.play("death", { once: true });
          } else {
            foeActor.play("attack", { once: true });
            playerActor.play("hit", { once: true });
          }
        },
        clearSelection: clearSel,
        dispose() {
          disposed = true;
          window.removeEventListener("resize", resize);
          if (animId) cancelAnimationFrame(animId);
          animId = 0;
          canvas.removeEventListener("pointermove", onMove);
          canvas.removeEventListener("click", onClick);
          actors.forEach((a) => a.dispose());
          actors = [];
          if (renderer) {
            renderer.dispose();
            renderer = null;
          }
          canvas.style.cursor = "";
          const beat = el("gameSceneBeat");
          if (beat) beat.hidden = true;
        },
      };
    } catch (err) {
      console.warn("Encounter stage WebGL unavailable", err);
      abortCleanup();
      if (gen === stageBootGen) {
        stage = null;
        vp.dataset.active = "false";
        vp.setAttribute("aria-hidden", "true");
        el("gameScene")?.removeAttribute("data-stage");
      }
    }
  }

  function finishEncounter(flourishWon) {
    stopCombatGateLoop();
    const hadStage = !!stage;
    if (hadStage && stage) {
      stage.flourishing = true;
      if (flourishWon != null) stage.playResolve?.(!!flourishWon);
    }
    encounter = null;
    save();
    const node = el("gameEncounter");
    if (node) {
      node.hidden = true;
      node.dataset.open = "false";
      node.dataset.live = "false";
    }
    syncEncounterChromeLock(false);
    render();
    if (hadStage && stage) {
      clearStageFlourishTimer();
      const flourishGen = stage.gen;
      stageFlourishTimer = setTimeout(() => {
        stageFlourishTimer = 0;
        if (stage && stage.gen === flourishGen) {
          teardownEncounterStage();
        }
        maybeChapterWin();
      }, 1100);
    } else {
      teardownEncounterStage();
      maybeChapterWin();
    }
  }

  function foeCounterattack() {
    if (!encounter?.live) return;
    encounter.threat = 0;
    const CG = Gates();
    if (CG && encounter.gates) {
      encounter.gates.opts.foeDamage = state.hp <= state.hpMax / 2 ? 3 : 2;
      CG.beginFoeAttack(encounter.gates, performance.now());
      AudioCues.target();
      stage?.showBeat?.("Coil telegraphs — Roll or Parry!", 1100);
      pushJournal("Threat breaks into a telegraph — roll i-frames or parry the window.");
      companionSay("Window incoming.");
      ensureCombatGateLoop();
      syncLiveChoices();
      renderEncounterChrome();
      return;
    }
    const dmg = 2;
    state.hp = Math.max(1, state.hp - dmg);
    stage?.playFoeStrike?.();
    spawnCombatFloat(`−${dmg}`, "hurt");
    AudioCues.hurt();
    stage?.showBeat?.(`Coil strikes — −${dmg} HP`, 1200);
    pushJournal(`Threat breaks: coil lashes for ${dmg} HP (${state.hp}/${state.hpMax}).`);
    companionSay("Hold the line — threat reset.");
  }

  function gateSpendOrBail(actionId) {
    const CG = Gates();
    if (!CG || !encounter?.gates) return true;
    const spent = CG.spend(encounter.gates, actionId);
    if (!spent.ok) {
      companionSay("Winded — recover stamina.");
      stage?.showBeat?.("Not enough stamina", 900);
      AudioCues.miss();
      encounter.resolving = false;
      syncLiveChoices();
      renderEncounterChrome();
      return false;
    }
    return true;
  }

  function resolveLiveCombat(choiceId) {
    if (!encounter?.live || encounter.resolving) return;
    const CG = Gates();
    const now = performance.now();

    if (choiceId === "roll") {
      if (!CG || !encounter.gates) return;
      const r = CG.startRoll(encounter.gates, now);
      if (!r.ok) {
        companionSay("Winded — cannot roll.");
        stage?.showBeat?.("Stamina low", 800);
        AudioCues.miss();
        return;
      }
      spawnCombatFloat("roll", "miss");
      AudioCues.soft();
      stage?.showBeat?.("Rolling — i-frames", 900);
      pushJournal("You roll through the Astral grit (i-frame window open).");
      ensureCombatGateLoop();
      syncLiveChoices();
      renderEncounterChrome();
      return;
    }

    if (choiceId === "parry") {
      if (!CG || !encounter.gates) return;
      const r = CG.tryParry(encounter.gates, now);
      if (r.reason === "no_stamina") {
        companionSay("Arms heavy — no stamina to parry.");
        AudioCues.miss();
        return;
      }
      if (r.reason === "no_attack") {
        stage?.showBeat?.("No telegraph", 700);
        return;
      }
      if (r.ok) {
        spawnCombatFloat("parry", "assist");
        AudioCues.parry?.();
        stage?.showBeat?.("Parry!", 1000);
        pushJournal("Parry window caught — coil denied.");
        companionSay("Perfect timing.");
      } else if (r.reason === "early") {
        spawnCombatFloat("early", "miss");
        AudioCues.miss();
        stage?.showBeat?.("Parry early", 800);
        pushJournal("Parry too early — stamina spent, coil still coming.");
      } else if (r.reason === "late") {
        spawnCombatFloat("late", "miss");
        AudioCues.miss();
        stage?.showBeat?.("Parry late", 800);
        pushJournal("Parry too late — stamina spent.");
      }
      syncLiveChoices();
      renderEncounterChrome();
      return;
    }

    if (choiceId === "slip") {
      encounter.resolving = true;
      state.poolChecked = true;
      state.hp = Math.max(1, state.hp - 2);
      spawnCombatFloat("−2", "hurt");
      AudioCues.roll?.();
      AudioCues.hurt();
      pushJournal(`Skirmish: slip past — take 2 damage (${state.hp}/${state.hpMax}).`);
      companionSay("Discretion. The Mineral grit still waits.");
      recordRoll("Athletics", 0, 0, encounter.dc, false);
      finishEncounter(false);
      return;
    }

    if (choiceId === "strike" && !encounter.targeted) {
      companionSay("Mark the coil first — click its hitbox.");
      stage?.showBeat?.("Target the foe", 900);
      AudioCues.target();
      return;
    }

    encounter.resolving = true;
    syncLiveChoices();
    renderEncounterChrome();

    if (choiceId === "assist") {
      if (encounter.assistUsed || !encounter.targeted) {
        encounter.resolving = false;
        syncLiveChoices();
        renderEncounterChrome();
        return;
      }
      if (!gateSpendOrBail("assist")) return;
      encounter.assistUsed = true;
      const bonus = combatEquipBonus();
      const dmg = 3 + bonus.dmg;
      encounter.foeHp = Math.max(0, encounter.foeHp - dmg);
      const kill = encounter.foeHp <= 0;
      stage?.playStrike?.({ hit: true, kill, assist: true });
      spawnCombatFloat(`−${dmg}`, kill ? "kill" : "assist");
      if (kill) AudioCues.kill();
      else AudioCues.hit();
      stage?.showBeat?.(`${beingName(state.companionBeingId, "Companion")} assist −${dmg}`, 1100);
      stage?.refreshFoeHud?.();
      pushJournal(
        `${beingName(state.companionBeingId, "Companion")} assist deals ${dmg} to the coil (${encounter.foeHp}/${encounter.foeHpMax}).`
      );
      companionSay("Arrow of thought — yours.");
      if (kill) {
        state.poolChecked = true;
        addItem({
          id: "prism-scale",
          name: "Prism Scale",
          desc: "Shed from a pool guardian. Proof you faced the curtain’s teeth. Equip for a skirmish edge.",
        });
        pushJournal("Skirmish won — Prism Scale drops. The curtain yields.");
        finishEncounter(true);
        return;
      }
      encounter.threat = Math.min(encounter.threatMax, encounter.threat + 1);
      if (encounter.threat >= encounter.threatMax) foeCounterattack();
      encounter.resolving = false;
      syncLiveChoices();
      save();
      render();
      renderEncounterChrome();
      stage?.refreshFoeHud?.();
      return;
    }

    if (choiceId === "soft") {
      if (!gateSpendOrBail("soft")) return;
      const roll = rollD20();
      const mod = skillMod("Insight");
      const total = roll + mod;
      const ok = total >= encounter.dcSoft;
      recordRoll("Insight", roll, mod, encounter.dcSoft, ok);
      if (ok) {
        encounter.threat = Math.max(0, encounter.threat - 2);
        const softDmg = 2 + (state.equipped === "clear-shard" ? 2 : 0);
        encounter.foeHp = Math.max(0, encounter.foeHp - softDmg);
        const kill = encounter.foeHp <= 0;
        stage?.playSoft?.();
        spawnCombatFloat(`−${softDmg}`, kill ? "kill" : "soft");
        if (kill) AudioCues.kill();
        else AudioCues.soft();
        stage?.showBeat?.(`Soft word −${softDmg} · threat eases`, 1200);
        pushJournal(
          `Soft word: Insight ${roll}${mod ? `+${mod}` : ""} = ${total} vs DC ${encounter.dcSoft} — coil loosens (−${softDmg} HP, threat ${encounter.threat}).`
        );
        companionSay("Kindness cuts cleaner than steel here.");
      } else {
        encounter.threat = Math.min(encounter.threatMax, encounter.threat + 1);
        spawnCombatFloat("miss", "miss");
        AudioCues.miss();
        stage?.showBeat?.("Word glances off", 900);
        pushJournal(
          `Soft word: Insight ${roll}${mod ? `+${mod}` : ""} = ${total} vs DC ${encounter.dcSoft} — miss. Threat rises to ${encounter.threat}.`
        );
        companionSay("Try the blade-thought.");
      }
      stage?.refreshFoeHud?.();
      if (encounter.foeHp <= 0) {
        state.poolChecked = true;
        addItem({
          id: "prism-scale",
          name: "Prism Scale",
          desc: "Shed from a pool guardian. Proof you faced the curtain’s teeth. Equip for a skirmish edge.",
        });
        pushJournal("Skirmish won by word — Prism Scale drops.");
        finishEncounter(true);
        return;
      }
      if (encounter.threat >= encounter.threatMax) foeCounterattack();
      encounter.resolving = false;
      syncLiveChoices();
      save();
      render();
      renderEncounterChrome();
      stage?.refreshFoeHud?.();
      return;
    }

    // strike
    if (!gateSpendOrBail("strike")) return;
    const roll = rollD20();
    const mod = skillMod("Athletics");
    const total = roll + mod;
    const ok = total >= encounter.dc;
    recordRoll("Athletics", roll, mod, encounter.dc, ok);
    const bonus = combatEquipBonus();
    if (ok) {
      const crit = total >= encounter.dc + 5;
      const dmg = 4 + Math.floor(mod / 2) + bonus.dmg + (crit ? 2 : 0);
      encounter.foeHp = Math.max(0, encounter.foeHp - dmg);
      const kill = encounter.foeHp <= 0;
      stage?.playStrike?.({ hit: true, kill, assist: false, crit });
      spawnCombatFloat(crit ? `CRIT −${dmg}` : `−${dmg}`, kill ? "kill" : crit ? "crit" : "hit");
      if (kill) AudioCues.kill();
      else if (crit) AudioCues.crit();
      else AudioCues.hit();
      stage?.showBeat?.(
        `${bonus.label ? bonus.label + " · " : ""}${crit ? "Crit" : "Hit"} −${dmg}${kill ? " · fallen" : ""}`,
        1300
      );
      pushJournal(
        `Strike: Athletics ${roll}${mod ? `+${mod}` : ""} = ${total} vs DC ${encounter.dc} — hit for ${dmg} (${encounter.foeHp}/${encounter.foeHpMax}).`
      );
      companionSay(kill ? "Down. Curtain opens." : "Again — keep the pressure.");
    } else {
      encounter.threat = Math.min(encounter.threatMax, encounter.threat + 1);
      stage?.playStrike?.({ hit: false, kill: false, assist: false });
      spawnCombatFloat("miss", "miss");
      AudioCues.miss();
      stage?.showBeat?.(`Miss · threat ${encounter.threat}/${encounter.threatMax}`, 1100);
      pushJournal(
        `Strike: Athletics ${roll}${mod ? `+${mod}` : ""} = ${total} vs DC ${encounter.dc} — miss. Threat ${encounter.threat}/${encounter.threatMax}.`
      );
      companionSay("Reset your feet.");
    }
    stage?.refreshFoeHud?.();

    if (encounter.foeHp <= 0) {
      state.poolChecked = true;
      addItem({
        id: "prism-scale",
        name: "Prism Scale",
        desc: "Shed from a pool guardian. Proof you faced the curtain’s teeth. Equip for a skirmish edge.",
      });
      pushJournal("Skirmish won — Prism Scale drops. The curtain yields.");
      companionSay("Clean work. Mineral grit waits.");
      finishEncounter(true);
      return;
    }
    if (encounter.threat >= encounter.threatMax) foeCounterattack();
    encounter.resolving = false;
    syncLiveChoices();
    save();
    render();
    renderEncounterChrome();
    stage?.refreshFoeHud?.();
  }

  function resolveEncounter(choiceId) {
    if (!encounter) return;
    if (encounter.live) {
      resolveLiveCombat(choiceId);
      return;
    }
    const kind = encounter.kind;

    if (kind === "isle-check") {
      state.isleChecked = true;
      if (choiceId === "roll") {
        AudioCues.roll?.();
        const roll = rollD20();
        const mod = encounter.mod || 0;
        const total = roll + mod;
        const ok = total >= encounter.dc;
        recordRoll("Perception", roll, mod, encounter.dc, ok);
        if (ok) {
          pushJournal(
            `Encounter: Perception ${roll}${mod ? `+${mod}` : ""} = ${total} vs DC ${encounter.dc} — success. A clearer Memory Shard wakes.`
          );
          state.flags.isleInsight = true;
          addItem({
            id: "clear-shard",
            name: "Clear Memory Shard",
            desc: "A shard that answers when asked who you were. Equip for +Insight/Perception.",
          });
          companionSay("That shard remembers you kindly.");
          stage?.playResolve?.(true);
        } else {
          pushJournal(
            `Encounter: Perception ${roll}${mod ? `+${mod}` : ""} = ${total} vs DC ${encounter.dc} — miss. The scars stay opaque.`
          );
          companionSay("Opaque for now. The common shard still sings.");
          stage?.playResolve?.(false);
        }
      } else {
        pushJournal("Encounter: you leave the ani-thread unread. The isle does not judge.");
        recordRoll("Perception", 0, 0, encounter.dc, false);
        stage?.playResolve?.(false);
      }
    } else if (kind === "dust-check") {
      state.dustChecked = true;
      if (choiceId === "athletics") {
        AudioCues.roll?.();
        const roll = rollD20();
        const mod = encounter.ath || 0;
        const total = roll + mod;
        const ok = total >= encounter.dcAth;
        recordRoll("Athletics", roll, mod, encounter.dcAth, ok);
        if (ok) {
          pushJournal(
            `Encounter: Athletics ${roll}${mod ? `+${mod}` : ""} = ${total} vs DC ${encounter.dcAth} — success. You claim a Void Line from the rail.`
          );
          addItem({
            id: "void-line",
            name: "Void Line",
            desc: "Braided thought-rope. Equip for +Athletics on the Sea.",
          });
          companionSay("Good hands. That line will matter.");
          stage?.playResolve?.(true);
        } else {
          state.hp = Math.max(1, state.hp - 2);
          pushJournal(
            `Encounter: Athletics ${roll}${mod ? `+${mod}` : ""} = ${total} vs DC ${encounter.dcAth} — miss. You bruise for 2 HP (${state.hp}/${state.hpMax}).`
          );
          companionSay("Stay low. The ash is thicker than it looks.");
          stage?.playResolve?.(false);
        }
      } else if (choiceId === "insight") {
        AudioCues.roll?.();
        const roll = rollD20();
        const mod = encounter.ins || 0;
        const total = roll + mod;
        const ok = total >= encounter.dcIns;
        recordRoll("Insight", roll, mod, encounter.dcIns, ok);
        if (ok) {
          pushJournal(
            `Encounter: Insight ${roll}${mod ? `+${mod}` : ""} = ${total} vs DC ${encounter.dcIns} — success. Pilots gift Star Salt and a kinder bearing.`
          );
          addItem({
            id: "star-salt",
            name: "Star Salt",
            desc: "Fine grit from a dead color pool. Softens Dust Lane travel and brightens trails.",
          });
          state.fatigue = Math.max(0, state.fatigue - 1);
          companionSay("They liked your listening. Fatigue eases.");
          stage?.playResolve?.(true);
        } else {
          pushJournal(
            `Encounter: Insight ${roll}${mod ? `+${mod}` : ""} = ${total} vs DC ${encounter.dcIns} — miss. Pilots shrug and charge grit-toll.`
          );
          state.fatigue = Math.min(state.fatigueMax, state.fatigue + 1);
          companionSay("Cold market. We pay in sweat.");
          stage?.playResolve?.(false);
        }
      } else {
        state.hp = Math.max(1, state.hp - 1);
        state.fatigue = Math.min(state.fatigueMax, state.fatigue + 1);
        pushJournal(`Encounter: blind push — 1 HP and +1 fatigue (${state.hp}/${state.hpMax}, fatigue ${state.fatigue}).`);
        recordRoll("Athletics", 0, 0, encounter.dcAth, false);
        stage?.playResolve?.(false);
      }
    }

    finishEncounter(null);
  }

  function useItem(id) {
    if (!hasItem(id)) return;
    if (id === "memory-shard" || id === "clear-shard") {
      pushJournal(
        id === "clear-shard"
          ? "You press the Clear Memory Shard: a white-room echo — then the Sea again."
          : "You warm the Memory Shard: a brief white-room afterimage, then cold silver."
      );
      if (id === "clear-shard") {
        state.equipped = state.equipped === "clear-shard" ? null : "clear-shard";
        pushJournal(state.equipped === "clear-shard" ? "Equipped: Clear Memory Shard (+Insight/Perception)." : "Unequipped Clear Memory Shard.");
      }
      activeTab = "journal";
    } else if (id === "compass-orb") {
      pushJournal(
        state.location === "lighthouse-bearing"
          ? "Compass Orb flares — bearing locked. Hub road is honest."
          : "Compass Orb hums toward the Lighthouse. Follow the pulse when you can."
      );
      activeTab = "journal";
    } else if (id === "star-salt") {
      state.equipped = state.equipped === "star-salt" ? null : "star-salt";
      pushJournal(
        state.equipped === "star-salt"
          ? "Equipped Star Salt — Dust Lane softens; Survival/Perception edge."
          : "Unequipped Star Salt."
      );
      activeTab = "status";
    } else if (id === "void-line") {
      state.equipped = state.equipped === "void-line" ? null : "void-line";
      pushJournal(
        state.equipped === "void-line" ? "Equipped Void Line (+Athletics)." : "Unequipped Void Line."
      );
      activeTab = "status";
    } else if (id === "wisp-scrap") {
      pushJournal("Wisp Scrap: race when the dust sings — Dust Lane and Mineral know the start.");
      state.flags.wispCounsel = true;
      activeTab = "journal";
    } else if (id === "mineral-token") {
      pushJournal("Mineral Token marks you as a shore-walker. Atlas scribes nod.");
      activeTab = "journal";
    } else if (id === "prism-scale") {
      state.equipped = state.equipped === "prism-scale" ? null : "prism-scale";
      pushJournal(
        state.equipped === "prism-scale"
          ? "Equipped Prism Scale — skirmish edge while the spectrum holds."
          : "Unequipped Prism Scale."
      );
      activeTab = "status";
      if (encounter?.live) {
        syncLiveChoices();
        companionSay("Scale sings — mid-fight edge.");
        stage?.showBeat?.(state.equipped === "prism-scale" ? "Prism Scale ready" : "Unequipped", 900);
      }
    } else {
      pushJournal(`You turn the ${id} over in your hands. Not yet.`);
    }
    // Mid-fight equip refreshes combat chrome without dismissing the stage
    if (encounter?.live && (id === "void-line" || id === "star-salt" || id === "clear-shard" || id === "prism-scale")) {
      syncLiveChoices();
      stage?.showBeat?.(
        state.equipped ? `Equipped ${state.equipped}` : "Hands free",
        900
      );
    }
    save();
    render();
    if (encounter) renderEncounterChrome();
  }

  function travelTo(loc) {
    if (encounter || stage?.flourishing) return;
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
    if (loc === "mineral-shore" && !state.objectives.pool) {
      pushJournal("Travel blocked: touch a color pool before forcing Mineral landfall.");
      save();
      render();
      return;
    }
    if (loc === "dust-lane" && !state.objectives.embark) {
      pushJournal("Travel blocked: cast off before chasing the Dust Lane.");
      save();
      render();
      return;
    }
    if (loc === "dust-lane" && !(hasItem("wisp-scrap") || hasItem("star-salt") || state.flags.wispCounsel || state.questComplete)) {
      // Soft gate: still allow but companion warns — actually require a hint item OR quest1 done
      pushJournal("Travel soft-blocked: Dust Lane wants a Wisp Scrap, Star Salt, or a finished first crossing.");
      companionSay("Find a scrap or salt first — or finish the Lighthouse bearing.");
      save();
      render();
      return;
    }

    applyTravelBeat(from, loc);
    applyFatigue(loc);
    state.location = loc;

    const tip = LOCATIONS[loc]?.companion;
    if (tip && from !== loc) companionSay(tip);

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
    if (from !== loc) {
      pulseSceneTravel();
      showTravelToast(LOCATIONS[loc]?.title || loc, nextObjectiveHint());
      AudioCues.travel();
      AudioCues.syncMusicForLocation?.(loc);
    }

    const wantsIsle = loc === "memory-isle" && !state.isleChecked;
    const wantsDust = loc === "dust-lane" && !state.dustChecked;
    const wantsPool = loc === "color-pool" && !state.poolChecked;

    if (wantsIsle) {
      openIsleEncounter();
    } else if (wantsDust) {
      openDustEncounter();
    } else if (wantsPool) {
      openPoolEncounter();
    } else if (state.questComplete && !state.completeAcked && !state.shoreQuestComplete) {
      if (state.objectives.bearing && from !== "hub") showComplete(true);
    }

    // Never stack chapter-win on top of a fresh encounter modal.
    if (state.shoreQuestComplete && !encounter) maybeChapterWin();
  }

  function el(id) {
    return document.getElementById(id);
  }

  /** Sync Play-start roster pickers to the full beings catalog (PAS-29). */
  function syncStartBeingPickers(playerId, companionId) {
    const api = window.PlanesboundBeings;
    if (!api?.setSelection) return;
    const p = playerId || api.getPlayer?.()?.id || "human";
    const c = companionId || api.getCompanion?.()?.id || "human";
    api.setSelection(p, c);
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
    node.dataset.live = "false";
    node.setAttribute("role", "dialog");
    node.setAttribute("aria-modal", "false");
    node.innerHTML = `<div class="game-encounter-card" tabindex="-1">
      <div class="game-encounter-head">
        <h3 id="gameEncounterTitle"></h3>
        <p class="game-encounter-vitals" id="gameEncounterVitals" hidden></p>
      </div>
      <p id="gameEncounterBody"></p>
      <div class="game-encounter-actions" id="gameEncounterActions"></div>
    </div>`;
    // Dock under scene so voyage stays continuous (not a full-screen modal)
    const scene = el("gameScene");
    if (scene) scene.appendChild(node);
    else el("gameLayer")?.appendChild(node);
    node.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-encounter-choice]");
      if (!btn || btn.disabled) return;
      resolveEncounter(btn.dataset.encounterChoice);
    });
    return node;
  }

  function syncEncounterChromeLock(open) {
    const shell = el("gameShell");
    if (!shell) return;
    if (!open) {
      shell.removeAttribute("data-encounter");
      return;
    }
    // live = inventory/status usable mid-fight; check = travel locked, side still readable
    shell.setAttribute("data-encounter", encounter?.live ? "live" : "check");
  }

  function renderEncounterChrome() {
    const node = ensureEncounterDom();
    if (!node || !encounter) return;
    const title = el("gameEncounterTitle");
    const body = el("gameEncounterBody");
    const actions = el("gameEncounterActions");
    const vitals = el("gameEncounterVitals");
    if (title) title.textContent = encounter.title;
    if (body) {
      const eq = combatEquipBonus();
      const CG = Gates();
      const g = encounter.gates;
      const gateHud = g && CG ? ` · ${CG.describeHud(g, performance.now())}` : "";
      const liveHint = encounter.live
        ? ` You ${state.hp}/${state.hpMax} HP · Coil ${encounter.foeHp}/${encounter.foeHpMax} · Threat ${encounter.threat}/${encounter.threatMax}${eq.label ? ` · ${eq.label}` : ""}${gateHud}.`
        : "";
      body.textContent = encounter.body + liveHint;
    }
    if (vitals) {
      if (encounter.live) {
        vitals.hidden = false;
        const hpPct = Math.max(0, Math.min(100, (state.hp / Math.max(1, state.hpMax)) * 100));
        const foePct = Math.max(
          0,
          Math.min(100, (encounter.foeHp / Math.max(1, encounter.foeHpMax)) * 100)
        );
        const threatPct = Math.max(
          0,
          Math.min(100, (encounter.threat / Math.max(1, encounter.threatMax)) * 100)
        );
        const g = encounter.gates;
        const staMax = g?.staminaMax || 100;
        const staNow = g ? Math.round(g.stamina) : staMax;
        const staPct = Math.max(0, Math.min(100, (staNow / Math.max(1, staMax)) * 100));
        const CG = Gates();
        const now = performance.now();
        const telegraph = !!(g && g.attackActive && !g.attackResolved);
        const parryOpen = !!(g && CG && CG.inParryWindow(g, now));
        const rolling = !!(g && CG && CG.isRolling(g, now));
        const threatHot = encounter.threat >= Math.max(1, encounter.threatMax - 1);
        const last = state.lastRoll;
        const rollChip = last
          ? `<span class="game-vital game-vital--roll">${escapeHtml(last.skill)} ${last.total}/${last.dc} · ${last.ok ? "ok" : "miss"}</span>`
          : "";
        const gateChip = telegraph
          ? `<span class="game-vital game-vital--gate${parryOpen ? " game-vital--parry-open" : ""}">${parryOpen ? "PARRY NOW" : "TELEGRAPH"}</span>`
          : rolling
            ? `<span class="game-vital game-vital--gate game-vital--rolling">ROLL i-frame</span>`
            : "";
        vitals.dataset.threatHot = threatHot ? "true" : "false";
        vitals.dataset.parryOpen = parryOpen ? "true" : "false";
        vitals.innerHTML = `<span class="game-vital">You ${state.hp}/${state.hpMax}<i><b style="width:${hpPct}%"></b></i></span><span class="game-vital game-vital--sta">STA ${staNow}/${staMax}<i><b style="width:${staPct}%"></b></i></span><span class="game-vital game-vital--foe">Foe ${encounter.foeHp}/${encounter.foeHpMax}<i><b style="width:${foePct}%"></b></i></span><span class="game-vital game-vital--threat${threatHot ? " game-vital--threat-hot" : ""}">Threat ${encounter.threat}/${encounter.threatMax}<i><b style="width:${threatPct}%"></b></i></span>${gateChip}${rollChip}`;
      } else {
        vitals.hidden = true;
        delete vitals.dataset.threatHot;
        delete vitals.dataset.parryOpen;
      }
    }
    if (actions) {
      actions.innerHTML = encounter.choices
        .map((c) => {
          const primary =
            c.id === "roll" ||
            c.id === "parry" ||
            c.id === "fight" ||
            c.id === "strike" ||
            c.id === "athletics" ||
            c.id === "insight" ||
            c.id === "assist";
          const kind = c.kind || c.id;
          const urgent = c.id === "parry" && vitals?.dataset?.parryOpen === "true";
          const icon = actionIconSrc(kind) || actionIconSrc(c.id);
          const iconHtml = icon
            ? `<img class="game-btn-icon" src="${escapeAttr(icon)}" alt="" width="22" height="22" decoding="async" aria-hidden="true" />`
            : "";
          return `<button type="button" class="game-btn game-btn--iconed${primary ? " game-btn--astral" : ""}${urgent ? " game-btn--parry-now" : ""}" data-encounter-choice="${escapeAttr(c.id)}" data-kind="${escapeAttr(kind)}"${c.disabled ? " disabled" : ""}${encounter.resolving ? ' data-busy="true"' : ""}>${iconHtml}<span class="game-btn-label">${escapeHtml(c.label)}</span></button>`;
        })
        .join("");
    }
  }

  /** PAS-37 transparent action icons (brass/astral line art). */
  function actionIconSrc(kind) {
    const map = {
      strike: "art/ui-icons/icon-strike.png",
      athletics: "art/ui-icons/icon-strike.png",
      fight: "art/ui-icons/icon-strike.png",
      soft: "art/ui-icons/icon-soft.png",
      insight: "art/ui-icons/icon-soft.png",
      assist: "art/ui-icons/icon-assist.png",
      roll: "art/ui-icons/icon-roll.png",
      parry: "art/ui-icons/icon-parry.png",
      slip: "art/ui-icons/icon-slip.png",
      rest: "art/ui-icons/icon-rest.png",
      companion: "art/ui-icons/icon-companion.png",
    };
    return map[kind] || null;
  }

  function renderEncounter() {
    const node = ensureEncounterDom();
    if (!node) return;
    const open = !!encounter;
    node.hidden = !open;
    node.dataset.open = open ? "true" : "false";
    node.dataset.live = encounter?.live ? "true" : "false";
    syncEncounterChromeLock(open);
    if (!open) {
      if (!stage?.flourishing) teardownEncounterStage();
      return;
    }
    if (encounter.live) syncLiveChoices();
    renderEncounterChrome();
    requestAnimationFrame(() => node.querySelector(".game-encounter-card")?.focus?.());
    bootEncounterStage(encounter);
  }

  function showComplete(open) {
    const node = el("gameComplete");
    const shell = el("gameShell");
    if (!node) return;
    node.hidden = !open;
    node.dataset.open = open ? "true" : "false";
    node.dataset.mode = "quest";
    if (shell) {
      if (open) shell.setAttribute("inert", "");
      else shell.removeAttribute("inert");
    }
    if (open) {
      const title = el("gameCompleteTitle");
      const body = node.querySelector(".game-complete-body p:not(.eyebrow)");
      const eyebrow = node.querySelector(".game-complete-body .eyebrow");
      if (eyebrow) eyebrow.textContent = "Quest complete";
      if (title) title.textContent = "You crossed the Astral Sea";
      if (body) {
        body.textContent =
          "Embarked, discovered a memory isle, and locked a Lighthouse bearing. Next: seek a color pool toward the Mineral shore — Dust Lane helps if you carry salt or scrap.";
      }
      const newVoyage = el("gameNewVoyage");
      if (newVoyage) newVoyage.hidden = true;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          (el("gameContinueExplore") || node.querySelector(".game-complete-card"))?.focus?.();
        });
      });
    }
  }

  function showChapterComplete(open) {
    const node = el("gameComplete");
    const shell = el("gameShell");
    if (!node) return;
    node.hidden = !open;
    node.dataset.open = open ? "true" : "false";
    node.dataset.mode = "chapter";
    if (shell) {
      if (open) shell.setAttribute("inert", "");
      else shell.removeAttribute("inert");
    }
    if (open) {
      state.chapterAcked = false;
      const title = el("gameCompleteTitle");
      const body = node.querySelector(".game-complete-body p:not(.eyebrow)");
      const eyebrow = node.querySelector(".game-complete-body .eyebrow");
      if (eyebrow) eyebrow.textContent = "Chapter complete";
      if (title) title.textContent = "First Crossing — shore secured";
      if (body) {
        body.textContent = `You finished the chapter loop: voyage, encounters, rest, and Mineral landfall. Level ${state.level}, HP ${state.hp}/${state.hpMax}. Continue exploring the Sea, or begin a new voyage.`;
      }
      const newVoyage = el("gameNewVoyage");
      if (newVoyage) newVoyage.hidden = false;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          (el("gameContinueExplore") || node.querySelector(".game-complete-card"))?.focus?.();
        });
      });
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
      AudioCues.ensure?.();
      AudioCues.syncMusicForLocation?.(state.location || "hub");
      syncMuteButton();
    } else {
      AudioCues.stopMusic?.(true);
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
        const Beings = window.PlanesboundBeings;
        const pId = state.playerBeingId || "human";
        const cId = state.companionBeingId || "human";
        const pTrad =
          Beings?.all?.()?.find?.((b) => b.id === pId)?.tradition || "core";
        const cTrad =
          Beings?.all?.()?.find?.((b) => b.id === cId)?.tradition || "core";
        const pArt = escapeHtml(Beings?.artSrc?.(pId) || `art/races/${pId}.png`);
        const cArt = escapeHtml(Beings?.artSrc?.(cId) || `art/races/${cId}.png`);
        const pFb = escapeHtml(Beings?.placeholderSrc?.(pTrad) || "art/races/_placeholder-core.png");
        const cFb = escapeHtml(Beings?.placeholderSrc?.(cTrad) || "art/races/_placeholder-core.png");
        const hpPct = Math.max(0, Math.min(100, (state.hp / Math.max(1, state.hpMax)) * 100));
        const fatPct = Math.max(
          0,
          Math.min(100, (state.fatigue / Math.max(1, state.fatigueMax)) * 100)
        );
        party.innerHTML = `
          <div class="game-hud-portraits" aria-hidden="true">
            <img class="game-hud-portrait" src="${pArt}" alt="" width="42" height="42" loading="lazy" decoding="async" data-being="${escapeHtml(pId)}" onerror="this.onerror=null;this.src='${pFb}'" />
            <img class="game-hud-portrait game-hud-portrait--companion" src="${cArt}" alt="" width="42" height="42" loading="lazy" decoding="async" data-being="${escapeHtml(cId)}" onerror="this.onerror=null;this.src='${cFb}'" />
          </div>
          <div class="game-hud-party-copy">
            <strong>${escapeHtml(state.playerName || "Traveler")}</strong>
            <span>${escapeHtml(beingName(state.playerBeingId))} · L${state.level} · with ${escapeHtml(beingName(state.companionBeingId))}</span>
            <span class="game-hud-loc">${escapeHtml(loc.title)}${state.equipped ? ` · eq ${escapeHtml(state.equipped)}` : ""} · legs ${state.voyageLegs || 0}</span>
            <div class="game-hud-meters" aria-hidden="true">
              <div class="game-hud-meter game-hud-meter--hp" title="HP ${state.hp}/${state.hpMax}"><em>HP</em><i><b style="width:${hpPct}%"></b></i></div>
              <div class="game-hud-meter game-hud-meter--fat" title="Fatigue ${state.fatigue}/${state.fatigueMax}"><em>Fat</em><i><b style="width:${fatPct}%"></b></i></div>
            </div>
            <span class="game-hud-crumb">Next · ${escapeHtml(nextObjectiveHint())}</span>
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
      const last = state.lastRoll
        ? `Last roll: ${state.lastRoll.skill} ${state.lastRoll.total}/${state.lastRoll.dc} (${state.lastRoll.ok ? "ok" : "miss"})`
        : "Last roll: —";
      status.innerHTML = `
        <h3>Status</h3>
        <p class="game-meta-line">${escapeHtml(state.playerName)} · ${escapeHtml(beingName(state.playerBeingId))} · Level ${state.level}</p>
        <p class="game-meta-line">HP <strong>${state.hp}/${state.hpMax}</strong> · Fatigue <strong>${state.fatigue}/${state.fatigueMax}</strong></p>
        <p class="game-meta-line">Companion: <strong>${escapeHtml(beingName(state.companionBeingId))}</strong></p>
        <p class="game-meta-line">Location: <strong>${escapeHtml(loc.title)}</strong></p>
        <p class="game-meta-line">Voyage legs: ${state.voyageLegs || 0}${state.equipped ? ` · Equipped: ${escapeHtml(state.equipped)}` : ""}</p>
        <p class="game-meta-line">${escapeHtml(last)}</p>
        <p class="game-meta-line">Quest: ${
          state.chapterComplete
            ? "Chapter complete — explore or new voyage"
            : state.shoreQuestComplete
              ? "Inner Ring shore secured"
              : state.questComplete
                ? aq.title + (state.shoreQuestActive ? " (active)" : "")
                : QUESTS["cross-astral-sea"].title
        }</p>
        <div class="game-status-actions">
          <button type="button" class="game-btn game-btn--iconed" data-action="rest"><img class="game-btn-icon" src="art/ui-icons/icon-rest.png" alt="" width="20" height="20" decoding="async" aria-hidden="true" /><span class="game-btn-label">Short rest</span></button>
          ${
            state.chapterComplete
              ? `<button type="button" class="game-btn game-btn--astral" data-action="new-voyage">New voyage</button>`
              : ""
          }
        </div>`;
    }
    if (inv) {
      inv.innerHTML = `<h3>Inventory</h3><ul class="game-inv-list">${state.inventory
        .map(
          (i) =>
            `<li><div><strong>${escapeHtml(i.name)}</strong>${state.equipped === i.id ? " · equipped" : ""} — ${escapeHtml(i.desc)}</div>
            <button type="button" class="game-btn game-btn--ghost game-inv-use" data-use-item="${escapeAttr(i.id)}">Use</button></li>`
        )
        .join("")}</ul>`;
    }
    if (journal) {
      journal.innerHTML = `<h3>Journal</h3><ul>${state.journal
        .slice(0, 16)
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
        state.chapterComplete
          ? `<p class="game-meta-line">Chapter closed. Continue exploring, or choose New voyage from Status / hub to reset the chapter.</p>`
          : state.shoreQuestComplete
            ? `<p class="game-meta-line">Both voyages marked. Keep sailing or return to the hub atlas.</p>`
            : state.questComplete
              ? `<p class="game-meta-line">First crossing done. Dust Lane → color pool → Mineral shore.</p>`
              : `<p class="game-meta-line">Embark → isle → bearing (Dust Lane optional).</p>`
      }`;
    }

    document.querySelectorAll(".game-tab").forEach((tab) => {
      tab.setAttribute("aria-selected", tab.dataset.tab === activeTab ? "true" : "false");
    });
    document.querySelectorAll(".game-panel").forEach((panel) => {
      panel.dataset.active = panel.dataset.panel === activeTab ? "true" : "false";
    });

    window.PlanesboundArtMotion?.refresh?.();
    window.PlanesboundGame = api();
  }

  function iconedActionBtn(action, label, extraClass = "") {
    const src = actionIconSrc(action);
    const icon = src
      ? `<img class="game-btn-icon" src="${escapeAttr(src)}" alt="" width="20" height="20" decoding="async" aria-hidden="true" />`
      : "";
    return `<button type="button" class="game-btn game-btn--iconed${extraClass ? ` ${extraClass}` : ""}" data-action="${escapeAttr(action)}">${icon}<span class="game-btn-label">${escapeHtml(label)}</span></button>`;
  }

  function sceneActionsHtml() {
    const loc = state.location;
    const restBtn = iconedActionBtn("rest", "Short rest");
    const companionBtn = iconedActionBtn("companion", "Ask companion");
    if (loc === "hub") {
      const more = state.questComplete
        ? `<button type="button" class="game-btn game-btn--astral" data-travel="color-pool">Seek a color pool</button>
           <button type="button" class="game-btn" data-travel="dust-lane">Enter Dust Lane</button>`
        : "";
      const newVoyageBtn = state.chapterComplete
        ? `<button type="button" class="game-btn game-btn--astral" data-action="new-voyage">New voyage</button>`
        : "";
      return `<button type="button" class="game-btn game-btn--astral" data-travel="astral-sea">Cast off into the Astral Sea</button>
        ${more}
        ${newVoyageBtn}
        ${restBtn}
        ${companionBtn}
        <button type="button" class="game-btn game-btn--ghost" data-action="atlas">Browse atlas</button>`;
    }
    if (loc === "astral-sea") {
      const pool = state.questComplete
        ? `<button type="button" class="game-btn game-btn--astral" data-travel="color-pool">Approach a color pool</button>`
        : "";
      const dust =
        state.questComplete || hasItem("star-salt") || hasItem("wisp-scrap") || state.flags.wispCounsel
          ? `<button type="button" class="game-btn" data-travel="dust-lane">Follow Dust Lane</button>`
          : "";
      return `<button type="button" class="game-btn game-btn--astral" data-travel="memory-isle">Seek a memory isle</button>
        <button type="button" class="game-btn" data-travel="lighthouse-bearing">Follow Lighthouse pulse</button>
        ${dust}
        ${pool}
        ${companionBtn}
        <button type="button" class="game-btn game-btn--ghost" data-travel="hub">Return to hub</button>`;
    }
    if (loc === "memory-isle") {
      return `<button type="button" class="game-btn game-btn--astral" data-travel="lighthouse-bearing">Take bearing from the isle</button>
        <button type="button" class="game-btn" data-travel="astral-sea">Back to open Sea</button>
        ${restBtn}
        ${companionBtn}`;
    }
    if (loc === "dust-lane") {
      const pool = state.questComplete
        ? `<button type="button" class="game-btn game-btn--astral" data-travel="color-pool">Ride grit to a color pool</button>`
        : "";
      return `${pool}
        <button type="button" class="game-btn" data-travel="astral-sea">Back to open Sea</button>
        <button type="button" class="game-btn" data-travel="mineral-shore"${state.objectives.pool ? "" : " disabled"} title="Need color pool first">Force Mineral (needs pool)</button>
        ${companionBtn}`;
    }
    if (loc === "color-pool") {
      return `<button type="button" class="game-btn game-btn--astral" data-travel="mineral-shore">Step through toward Mineral</button>
        <button type="button" class="game-btn" data-travel="dust-lane">Sidestep into Dust Lane</button>
        <button type="button" class="game-btn" data-travel="astral-sea">Back to open Sea</button>
        ${companionBtn}`;
    }
    if (loc === "mineral-shore") {
      return `<button type="button" class="game-btn game-btn--astral" data-travel="hub">Return via Lighthouse roads</button>
        <button type="button" class="game-btn" data-travel="color-pool">Back through the pool</button>
        ${restBtn}
        ${companionBtn}
        <button type="button" class="game-btn game-btn--ghost" data-action="atlas">Browse atlas</button>`;
    }
    return `<button type="button" class="game-btn game-btn--astral" data-travel="hub">Ride bearing back to hub</button>
      <button type="button" class="game-btn" data-travel="astral-sea">Stay on the Astral Sea</button>
      <button type="button" class="game-btn" data-travel="dust-lane">Cut toward Dust Lane</button>
      ${companionBtn}`;
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
      syncStartBeingPickers(pref.playerBeingId || "human", pref.companionBeingId || "human");
      const nameInput = el("gamePlayerName");
      if (nameInput && !nameInput.value) nameInput.value = pref.name || state.playerName || "";
      nameInput?.focus();
      return;
    }
    setPlayOpen(true);
    showStart(false);
    render();
    resumeChapterWinIfNeeded();
  }

  /** Show chapter-win after load/cast-off when shore is done but not yet acknowledged. */
  function resumeChapterWinIfNeeded() {
    if (!state.chapterComplete || state.chapterAcked || encounter) return;
    showChapterComplete(true);
  }

  function freshVoyageState(name, playerBeingId, companionBeingId) {
    const base = syncVitalsFromSheet({
      ...defaultState(),
      started: true,
      playerName: name.slice(0, 40),
      playerBeingId,
      companionBeingId,
      journal: [
        `${name} (${beingName(playerBeingId)}) sets out with companion ${beingName(companionBeingId)}.`,
        "Chapter: First Crossing of the Astral Sea.",
      ],
    });
    // Start full — never inherit defaultState's 10 HP when the sheet max is higher.
    base.hp = base.hpMax;
    // Sheet already carries elevated progression from a prior chapter milestone.
    // Mark it given so New voyage / replay cannot stack another level-up.
    if ((base.level || 1) > 1) base.milestoneGiven = true;
    return base;
  }

  function castOffFromCreation() {
    const pref = prefillFromCreation();
    state = load();
    if (!state.started) {
      state = freshVoyageState(pref.name || "Traveler", pref.playerBeingId, pref.companionBeingId);
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
    // Migrated shore-finished saves set chapterComplete in load(); Cast off
    // must still surface the win modal (beginPlay already did).
    resumeChapterWinIfNeeded();
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
    state = freshVoyageState(name, playerBeingId, companionBeingId);
    syncRosterKeys();
    save();
    showStart(false);
    render();
  }

  function newVoyage() {
    const name = state.playerName || "Traveler";
    const playerBeingId = state.playerBeingId || "human";
    const companionBeingId = state.companionBeingId || "human";
    state = freshVoyageState(name, playerBeingId, companionBeingId);
    syncRosterKeys();
    save();
    showComplete(false);
    encounter = null;
    renderEncounter();
    render();
    // Hub stays quiet — stop any astral bed left from the previous chapter.
    AudioCues.syncMusicForLocation?.(state.location || "hub");
  }

  function exitPlay() {
    showComplete(false);
    encounter = null;
    clearStageFlourishTimer();
    teardownEncounterStage();
    renderEncounter();
    AudioCues.stopMusic?.(true);
    setPlayOpen(false);
  }

  function onSceneClick(e) {
    // Mid-fight inventory Use is allowed during live combat
    const useBtn = e.target.closest("[data-use-item]");
    if (useBtn) {
      if (stage?.flourishing) return;
      useItem(useBtn.dataset.useItem);
      return;
    }
    if (encounter || stage?.flourishing) return;
    const btn = e.target.closest("[data-travel], [data-action]");
    if (!btn || btn.disabled) return;
    if (btn.dataset.travel) {
      travelTo(btn.dataset.travel);
      return;
    }
    if (btn.dataset.action === "companion") {
      document.getElementById("openCompanion")?.click();
      return;
    }
    if (btn.dataset.action === "rest") {
      shortRest();
      return;
    }
    if (btn.dataset.action === "new-voyage") {
      newVoyage();
      return;
    }
    if (btn.dataset.action === "atlas") {
      exitPlay();
      document.getElementById("map")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function api() {
    return {
      getState: () => ({
        ...state,
        objectives: { ...state.objectives },
        flags: { ...state.flags },
        lastRoll: state.lastRoll ? { ...state.lastRoll } : null,
      }),
      getLocation: () => state.location,
      getLocationTitle: () => (LOCATIONS[state.location] || LOCATIONS.hub).title,
      getPlayerName: () => state.playerName,
      isPlayOpen: () => playOpen,
      isQuestComplete: () => !!state.questComplete,
      isChapterComplete: () => !!state.chapterComplete,
      open: beginPlay,
      castOff: castOffFromCreation,
      travelTo,
      /** PAS-39 audio surface for combat-gates / tests. */
      audio: () => window.PlanesboundAudio || AudioCues,
      counselContext: () => {
        const loc = LOCATIONS[state.location] || LOCATIONS.hub;
        const last = state.lastRoll;
        return {
          location: state.location,
          locationTitle: loc.title,
          playerName: state.playerName,
          playerBeing: beingName(state.playerBeingId),
          companionBeing: beingName(state.companionBeingId),
          questComplete: state.questComplete,
          shoreQuestComplete: state.shoreQuestComplete,
          chapterComplete: state.chapterComplete,
          objectives: { ...state.objectives },
          blurb: loc.blurb,
          companionHint: loc.companion,
          inventoryIds: state.inventory.map((i) => i.id),
          hp: state.hp,
          hpMax: state.hpMax,
          fatigue: state.fatigue,
          level: state.level,
          equipped: state.equipped,
          lastRoll: last
            ? `${last.skill} ${last.total} vs DC ${last.dc} (${last.ok ? "success" : "miss"}) at ${last.at}`
            : null,
        };
      },
    };
  }

  function wire() {
    el("openPlay")?.addEventListener("click", beginPlay);
    el("gameStartForm")?.addEventListener("submit", startCharacter);
    el("gameCancelStart")?.addEventListener("click", exitPlay);
    el("gameExit")?.addEventListener("click", exitPlay);
    el("gameMuteAudio")?.addEventListener("click", () => {
      AudioCues.toggleMute?.();
      AudioCues.ui?.();
      syncMuteButton();
      if (!AudioCues.isMuted?.() && playOpen) {
        AudioCues.syncMusicForLocation?.(state.location || "hub");
      }
    });
    syncMuteButton();
    el("gameSceneActions")?.addEventListener("click", onSceneClick);
    el("gameSide")?.addEventListener("click", onSceneClick);
    el("gameContinueExplore")?.addEventListener("click", () => {
      const mode = el("gameComplete")?.dataset.mode;
      if (mode === "chapter") state.chapterAcked = true;
      else state.completeAcked = true;
      save();
      showComplete(false);
    });
    el("gameNewVoyage")?.addEventListener("click", () => {
      newVoyage();
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
      if (el("gameComplete")?.dataset.open === "true") {
        e.preventDefault();
        const mode = el("gameComplete")?.dataset.mode;
        if (mode === "chapter") state.chapterAcked = true;
        else state.completeAcked = true;
        save();
        showComplete(false);
        return;
      }
      // Stage / flourish is a targeting window — never exitPlay while it lives
      if (encounter || stage) {
        e.preventDefault();
        if (stage?.hasFoeTarget?.()) {
          stage.clearSelection?.();
          return;
        }
        if (encounter) {
          dismissEncounter();
          return;
        }
        // Flourish (encounter already resolved): cancel timer + tear down this stage only
        clearStageFlourishTimer();
        teardownEncounterStage();
        maybeChapterWin();
        return;
      }
      e.preventDefault();
      exitPlay();
    });

    document.addEventListener("planesbound-beings-ready", () => {
      if (playOpen && el("gameStart")?.dataset.open === "true") {
        syncStartBeingPickers(
          el("gamePlayerBeing")?.value || "human",
          el("gameCompanionBeing")?.value || "human"
        );
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
