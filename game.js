/* Planesbound PAS-6/13/15 — single-player completed chapter voyage */
(function () {
  const SAVE_KEY = "planesbound-game-v3";
  const SAVE_KEY_V2 = "planesbound-game-v2";
  const SAVE_KEY_LEGACY = "planesbound-game-v1";
  const PLAYER_KEY = "planesbound-player-being-v1";
  const COMPANION_KEY = "planesbound-companion-being-v1";

  const LOCATIONS = {
    hub: {
      title: "Lighthouse Hub",
      theme: "parchment",
      fatigue: 0,
      blurb:
        "The Inner Ring atlas waits below. Stock your bearings, rest if weary, ask the companion, then cast off into the silvery thought-ocean.",
      companion: "The hub is honest stone. I will follow when you cast off — say the word.",
    },
    "astral-sea": {
      title: "Astral Sea",
      theme: "astral",
      fatigue: 1,
      blurb:
        "Thought-currents silver the void. Color pools shimmer like doors. A Dust Lane whispers Mineral-ward; a memory isle and Lighthouse pulse wait ahead.",
      companion: "Currents pull three ways: isle for memory, pulse for home, dust for shore-rumor.",
    },
    "memory-isle": {
      title: "Memory Isle",
      theme: "astral",
      fatigue: 1,
      blurb:
        "Crystallized recollection rises from the Sea. Ani-thread scars glitter underfoot — a place that wants to be read.",
      companion: "Read the scars carefully. Perception is the honest skill here.",
    },
    "dust-lane": {
      title: "Dust Lane",
      theme: "astral",
      fatigue: 2,
      blurb:
        "A grit-road of dead color-pool ash. Dust pilots trade bearings mid-void. Athletics keeps the keel true; Insight buys a kinder price.",
      companion: "Hold the rail. If you have Star Salt, the lane sings softer.",
    },
    "lighthouse-bearing": {
      title: "Lighthouse Bearing",
      theme: "astral",
      fatigue: 1,
      blurb:
        "A clean Daystar pulse locks your Compass Orb. The hub road opens — Cross the Astral Sea is within reach.",
      companion: "Bearing locked. Home is a straight thought away.",
    },
    "color-pool": {
      title: "Color Pool",
      theme: "astral",
      fatigue: 1,
      blurb:
        "A prismatic curtain hangs in the void. Something in the light tests travelers before Mineral grit.",
      companion: "Pools have teeth. Ready a blade-thought or a soft word.",
    },
    "mineral-shore": {
      title: "Mineral Shore",
      theme: "parchment",
      fatigue: 1,
      blurb:
        "First landfall past the Sea: stone that remembers fire. Ani’s hush hangs in the facets — chapter’s edge.",
      companion: "Shore. Token. Rest. The chapter can close here if you will it.",
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
        merged.shoreQuestActive &&
        !merged.shoreQuestComplete &&
        merged.objectives?.pool &&
        merged.objectives?.shore
      ) {
        merged.shoreQuestComplete = true;
      }
      if (merged.shoreQuestComplete && !merged.chapterComplete && merged.flags?.chapterReady) {
        merged.chapterComplete = true;
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
    encounter = {
      kind: "pool-skirmish",
      title: "Pool guardian — light with teeth",
      body: `A luminous coil bars the curtain. Skirmish: Athletics (d20${ath ? ` + ${ath}` : ""} vs DC 14) or take a bruise and slip past.`,
      choices: [
        { id: "fight", label: "Opposed Athletics" },
        { id: "slip", label: "Slip past (take 2 damage)" },
      ],
      ath,
      dc: 14,
    };
    renderEncounter();
  }

  /** Esc cancel: close modal with no HP/fatigue/checked side effects. */
  function dismissEncounter() {
    if (!encounter) return;
    encounter = null;
    renderEncounter();
    render();
  }

  function resolveEncounter(choiceId) {
    if (!encounter) return;
    const kind = encounter.kind;

    if (kind === "isle-check") {
      state.isleChecked = true;
      if (choiceId === "roll") {
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
        } else {
          pushJournal(
            `Encounter: Perception ${roll}${mod ? `+${mod}` : ""} = ${total} vs DC ${encounter.dc} — miss. The scars stay opaque.`
          );
          companionSay("Opaque for now. The common shard still sings.");
        }
      } else {
        pushJournal("Encounter: you leave the ani-thread unread. The isle does not judge.");
        recordRoll("Perception", 0, 0, encounter.dc, false);
      }
    } else if (kind === "dust-check") {
      state.dustChecked = true;
      if (choiceId === "athletics") {
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
        } else {
          state.hp = Math.max(1, state.hp - 2);
          pushJournal(
            `Encounter: Athletics ${roll}${mod ? `+${mod}` : ""} = ${total} vs DC ${encounter.dcAth} — miss. You bruise for 2 HP (${state.hp}/${state.hpMax}).`
          );
          companionSay("Stay low. The ash is thicker than it looks.");
        }
      } else if (choiceId === "insight") {
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
        } else {
          pushJournal(
            `Encounter: Insight ${roll}${mod ? `+${mod}` : ""} = ${total} vs DC ${encounter.dcIns} — miss. Pilots shrug and charge grit-toll.`
          );
          state.fatigue = Math.min(state.fatigueMax, state.fatigue + 1);
          companionSay("Cold market. We pay in sweat.");
        }
      } else {
        state.hp = Math.max(1, state.hp - 1);
        state.fatigue = Math.min(state.fatigueMax, state.fatigue + 1);
        pushJournal(`Encounter: blind push — 1 HP and +1 fatigue (${state.hp}/${state.hpMax}, fatigue ${state.fatigue}).`);
        recordRoll("Athletics", 0, 0, encounter.dcAth, false);
      }
    } else if (kind === "pool-skirmish") {
      state.poolChecked = true;
      if (choiceId === "fight") {
        const roll = rollD20();
        const mod = encounter.ath || 0;
        const total = roll + mod;
        const ok = total >= encounter.dc;
        recordRoll("Athletics", roll, mod, encounter.dc, ok);
        if (ok) {
          pushJournal(
            `Skirmish: Athletics ${roll}${mod ? `+${mod}` : ""} = ${total} vs DC ${encounter.dc} — success. The coil unravels; a Prism Scale drops.`
          );
          addItem({
            id: "prism-scale",
            name: "Prism Scale",
            desc: "Shed from a pool guardian. Proof you faced the curtain’s teeth.",
          });
          companionSay("Clean strike. The curtain respects you.");
        } else {
          state.hp = Math.max(1, state.hp - 3);
          pushJournal(
            `Skirmish: Athletics ${roll}${mod ? `+${mod}` : ""} = ${total} vs DC ${encounter.dc} — miss. Light bites for 3 HP (${state.hp}/${state.hpMax}). You still pass.`
          );
          companionSay("We are through — bruised, but through.");
        }
      } else {
        state.hp = Math.max(1, state.hp - 2);
        pushJournal(`Skirmish: slip past — take 2 damage (${state.hp}/${state.hpMax}).`);
        recordRoll("Athletics", 0, 0, encounter.dc, false);
        companionSay("Discretion. The Mineral grit still waits.");
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
      pushJournal("Prism Scale catches Sea-light — companion smiles at the spectrum.");
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

    if (state.shoreQuestComplete) maybeChapterWin();
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
            `<button type="button" class="game-btn${c.id === "roll" || c.id === "fight" || c.id === "athletics" || c.id === "insight" ? " game-btn--astral" : ""}" data-encounter-choice="${escapeAttr(c.id)}">${escapeHtml(c.label)}</button>`
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
            <span>${escapeHtml(beingName(state.playerBeingId))} · L${state.level} · HP ${state.hp}/${state.hpMax} · Fat ${state.fatigue}/${state.fatigueMax}</span>
            <span class="game-hud-loc">${escapeHtml(loc.title)}${state.equipped ? ` · eq ${escapeHtml(state.equipped)}` : ""}</span>
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
          <button type="button" class="game-btn" data-action="rest">Short rest</button>
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

  function sceneActionsHtml() {
    const loc = state.location;
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
        <button type="button" class="game-btn" data-action="rest">Short rest</button>
        <button type="button" class="game-btn" data-action="companion">Ask companion</button>
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
        <button type="button" class="game-btn" data-action="companion">Ask companion</button>
        <button type="button" class="game-btn game-btn--ghost" data-travel="hub">Return to hub</button>`;
    }
    if (loc === "memory-isle") {
      return `<button type="button" class="game-btn game-btn--astral" data-travel="lighthouse-bearing">Take bearing from the isle</button>
        <button type="button" class="game-btn" data-travel="astral-sea">Back to open Sea</button>
        <button type="button" class="game-btn" data-action="rest">Short rest</button>
        <button type="button" class="game-btn" data-action="companion">Ask companion</button>`;
    }
    if (loc === "dust-lane") {
      const pool = state.questComplete
        ? `<button type="button" class="game-btn game-btn--astral" data-travel="color-pool">Ride grit to a color pool</button>`
        : "";
      return `${pool}
        <button type="button" class="game-btn" data-travel="astral-sea">Back to open Sea</button>
        <button type="button" class="game-btn" data-travel="mineral-shore"${state.objectives.pool ? "" : " disabled"} title="Need color pool first">Force Mineral (needs pool)</button>
        <button type="button" class="game-btn" data-action="companion">Ask companion</button>`;
    }
    if (loc === "color-pool") {
      return `<button type="button" class="game-btn game-btn--astral" data-travel="mineral-shore">Step through toward Mineral</button>
        <button type="button" class="game-btn" data-travel="dust-lane">Sidestep into Dust Lane</button>
        <button type="button" class="game-btn" data-travel="astral-sea">Back to open Sea</button>
        <button type="button" class="game-btn" data-action="companion">Ask companion</button>`;
    }
    if (loc === "mineral-shore") {
      return `<button type="button" class="game-btn game-btn--astral" data-travel="hub">Return via Lighthouse roads</button>
        <button type="button" class="game-btn" data-travel="color-pool">Back through the pool</button>
        <button type="button" class="game-btn" data-action="rest">Short rest</button>
        <button type="button" class="game-btn" data-action="companion">Ask companion</button>
        <button type="button" class="game-btn game-btn--ghost" data-action="atlas">Browse atlas</button>`;
    }
    return `<button type="button" class="game-btn game-btn--astral" data-travel="hub">Ride bearing back to hub</button>
      <button type="button" class="game-btn" data-travel="astral-sea">Stay on the Astral Sea</button>
      <button type="button" class="game-btn" data-travel="dust-lane">Cut toward Dust Lane</button>
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
    if (state.chapterComplete && !state.chapterAcked) showChapterComplete(true);
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
      if (encounter) {
        e.preventDefault();
        dismissEncounter();
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
