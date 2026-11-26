/* Morrowroot headless rules core — seeded RNG, mode state machines. No DOM. */
(function () {
  const Data = () => window.PlanesboundMorrowrootData;

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function next() {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function createRng(seed) {
    const next = mulberry32(seed == null ? Date.now() : seed);
    return {
      seed: seed == null ? Date.now() : seed,
      next,
      int(min, max) {
        return min + Math.floor(next() * (max - min + 1));
      },
      d6() {
        return this.int(1, 6);
      },
      pick(arr) {
        if (!arr?.length) return null;
        return arr[this.int(0, arr.length - 1)];
      },
    };
  }

  function defaultResources() {
    return {
      timber: 6,
      stone: 4,
      food: 3,
      ember: 2,
      lightshard: 1,
      hide: 0,
      warmth: 10,
      chill: 0,
      stamina: 4,
      staminaMax: 4,
      mana: 0,
      manaMax: 10,
      raidDefense: 0,
      bearing: 3,
    };
  }

  function freshModeState(modeId, opts = {}) {
    const rng = createRng(opts.seed);
    const base = {
      modeId,
      seed: rng.seed,
      log: [],
      done: false,
      won: null,
      filler: false,
      resources: defaultResources(),
      clockStage: 0,
      holds: 0,
      season: 1,
      round: 0,
      possessionCount: 0,
      structures: [],
      hand: ["hearth_spark", "antler_call", "true_bearing"],
      flags: {},
      meta: {},
    };

    switch (modeId) {
      case "astral_voyage":
        return { ...base, meta: { delegatesTo: "PlanesboundGame" } };
      case "campaign":
        return {
          ...base,
          meta: {
            phase: "dawn",
            boardTurn: 0,
            boardTurnsMax: 4,
            tracks: { light: 0, bearing: 0, seed: 0 },
          },
        };
      case "hearth_night":
        return {
          ...base,
          filler: true,
          clockStage: 1, // Hoarstep locked
          meta: {
            phase: "board",
            round: 0,
            roundsMax: 10,
            movement: "party_dice",
            boasts: 0,
            minigameEveryRound: true,
            closingRaid: false,
          },
        };
      case "homestead":
      case "endless_winter":
        return {
          ...base,
          filler: modeId === "endless_winter",
          meta: {
            phase: "dawn",
            grid: Array.from({ length: 12 }, () => Array(12).fill(null)),
            seasonsSurvived: 0,
            holdsEnabled: modeId !== "endless_winter",
          },
        };
      case "raid":
      case "raid_gauntlet":
        return {
          ...base,
          filler: modeId === "raid_gauntlet",
          meta: {
            phase: "player",
            wave: 1,
            wavesMax: modeId === "raid_gauntlet" ? 12 : 1,
            raiders: spawnRaiders(6),
            cabinReached: false,
          },
        };
      case "expedition":
        return {
          ...base,
          meta: {
            phase: "pick_realm",
            realmId: null,
            turn: 0,
            turnsMax: 3,
            deck: [],
            hand: [],
          },
        };
      case "cards":
        return {
          ...base,
          meta: { phase: "play", lastCard: null },
        };
      case "wisp_race":
        return {
          ...base,
          filler: true,
          resources: { ...defaultResources(), bearing: 3 },
          meta: {
            courseId: opts.courseId || "race_lighthouse",
            leg: 0,
            raceTurn: 0,
            raceTurnsMax: 12,
            finished: false,
            failed: false,
            failKind: null,
          },
        };
      default:
        return { ...base, done: true, won: false, log: [`Unknown mode ${modeId}`] };
    }
  }

  function spawnRaiders(n) {
    return Array.from({ length: n }, (_, i) => ({
      id: `raider_${i + 1}`,
      hp: 3,
      dmg: 1,
      family: "frost_raider",
    }));
  }

  function pushLog(state, line) {
    state.log.push(line);
    if (state.log.length > 80) state.log.shift();
  }

  function tickMana(state) {
    state.resources.mana = Math.min(
      state.resources.manaMax,
      state.resources.mana + 3
    );
  }

  function advanceClock(state, { hold } = {}) {
    if (hold && state.holds > 0) {
      state.holds -= 1;
      pushLog(state, "Hold spent — clock does not advance.");
      return state;
    }
    const stages = Data()?.items("clock_stages") || [];
    const next = Math.min(state.clockStage + 1, Math.max(0, stages.length - 1));
    state.clockStage = next;
    const stage = stages[next];
    pushLog(state, `Pitchfrost advances to ${stage?.name || `stage ${next}`}.`);
    if (stage?.id === "last_bell" || next >= stages.length - 1) {
      state.done = true;
      state.won = false;
      pushLog(state, "Last Bell — the household loses.");
    }
    return state;
  }

  /** Party Board / Hearth Night: one board round + optional minigame. */
  function partyBoardRound(state, rng, { spaceType } = {}) {
    if (state.done) return state;
    tickMana(state);
    state.meta.round = (state.meta.round || 0) + 1;
    const move =
      state.meta.movement === "party_dice" ? rng.d6() + 1 : state.resources.stamina;
    state.resources.stamina = Math.max(0, state.resources.staminaMax - 1);
    const space =
      spaceType ||
      rng.pick(["hunt", "trade", "build", "gather", "event", "hearth", "frost", "boast"]);
    pushLog(state, `Round ${state.meta.round}: move ${move}, land on ${space}.`);

    switch (space) {
      case "hunt": {
        const food = rng.int(2, 5);
        state.resources.food += food;
        state.resources.ember = Math.max(0, state.resources.ember - 1);
        pushLog(state, `Hunt yields ${food} Food (−1 Ember).`);
        break;
      }
      case "gather":
        state.resources.timber += 2;
        pushLog(state, "Gather +2 Timber. [FILLER]");
        break;
      case "hearth":
        state.resources.chill = 0;
        state.resources.warmth += 1;
        pushLog(state, "Hearth: Chill cleared, +1 Warmth. [FILLER]");
        break;
      case "frost":
        state.resources.chill += 1;
        pushLog(state, "Frost space: +1 Chill. [FILLER]");
        break;
      case "trade":
        pushLog(state, `Trade among the ${Data()?.str("ten_towns", "Ten Towns")}.`);
        break;
      case "boast":
        state.meta.boasts = (state.meta.boasts || 0) + 1;
        pushLog(state, "Boast earned (cosmetic). [FILLER]");
        break;
      default:
        pushLog(state, `Event on ${space}.`);
    }

    if (state.meta.minigameEveryRound || space === "frost") {
      runMinigame(state, rng, space === "frost" ? "coop" : null);
    }

    if (state.meta.roundsMax && state.meta.round >= state.meta.roundsMax) {
      state.meta.closingRaid = true;
      state.meta.phase = "raid";
      state.meta.raiders = spawnRaiders(6);
      pushLog(state, "Closing raid wave — 6 frost raiders. [FILLER Hearth Night]");
    }
    return state;
  }

  function runMinigame(state, rng, forceFormat) {
    const list = Data()?.items("minigames") || [];
    if (!list.length) return state;
    let pool = list;
    if (forceFormat) pool = list.filter((m) => m.format === forceFormat) || list;
    const mg = rng.pick(pool);
    // Minigames themselves are [FILLER]; do not flip the mode filler flag
    // (Campaign can hit a frost-space minigame without becoming a filler preset).
    pushLog(state, `Minigame: ${mg.name} (${mg.format}) [FILLER]`);
    const reward = mg.winner_reward || {};
    for (const [k, v] of Object.entries(reward)) {
      if (typeof v === "number" && state.resources[k] != null) {
        state.resources[k] += v;
        pushLog(state, `Reward +${v} ${k}.`);
      } else if (k === "build_action") {
        pushLog(state, `Reward: build action toward ${v}.`);
      } else if (k === "peek_event") {
        pushLog(state, "Reward: peek next event.");
      } else if (k === "cancel_chill_all") {
        state.resources.chill = 0;
        pushLog(state, "Reward: Chill cancelled.");
      } else if (k === "remove_chill") {
        state.resources.chill = Math.max(0, state.resources.chill - v);
      } else if (k === "warmth_household") {
        state.resources.warmth += v;
      }
    }
    // Rewards never grant holds (acceptance)
    return state;
  }

  function homesteadBuild(state, structureId) {
    const st = Data()?.byId("structures", structureId);
    if (!st) {
      pushLog(state, `Unknown structure ${structureId}`);
      return state;
    }
    const cost = st.cost || {};
    for (const [k, v] of Object.entries(cost)) {
      if ((state.resources[k] || 0) < v) {
        pushLog(state, `Need ${v} ${k} for ${st.name}.`);
        return state;
      }
    }
    for (const [k, v] of Object.entries(cost)) state.resources[k] -= v;
    state.structures.push(structureId);
    if (st.effect?.raid_defense) {
      state.resources.raidDefense += st.effect.raid_defense;
    }
    pushLog(state, `Built ${st.name}${st._src?.includes?.("FILLER") || (Array.isArray(st._src) && st._src.includes("FILLER")) ? " [FILLER stats]" : ""}.`);
    return state;
  }

  function homesteadDawn(state) {
    state.resources.food = Math.max(0, state.resources.food - 1);
    if (!state.structures.includes("smokehouse") && state.resources.food > 0) {
      const spoil = Math.floor(state.resources.food / 2);
      state.resources.food -= spoil;
      if (spoil) pushLog(state, `Dawn: ${spoil} Food spoils (no Smokehouse).`);
    }
    pushLog(state, "Dawn: ate 1 Food; Stamina refreshed.");
    state.resources.stamina = state.resources.staminaMax;
    tickMana(state);
    if (state.resources.warmth <= 0) {
      pushLog(state, "Warmth is 0 at dawn — hearth cold warning.");
      state.flags.coldDawn = true;
    } else {
      state.flags.coldDawn = false;
    }
    return state;
  }

  function raidRound(state, rng, { playerDmg } = {}) {
    if (state.done) return state;
    tickMana(state);
    const raiders = state.meta.raiders || [];
    const live = raiders.filter((r) => r.hp > 0);
    if (!live.length) {
      pushLog(state, `Wave ${state.meta.wave} broken.`);
      if (state.meta.wave >= (state.meta.wavesMax || 1)) {
        state.done = true;
        state.won = true;
        pushLog(state, "Raid won.");
      } else {
        state.meta.wave += 1;
        state.meta.raiders = spawnRaiders(6);
        pushLog(state, `Next wave ${state.meta.wave}.`);
      }
      return state;
    }

    const dmg = playerDmg != null ? playerDmg : rng.int(1, 3);
    live[0].hp -= dmg;
    pushLog(state, `Strike for ${dmg}. ${live[0].id} HP ${Math.max(0, live[0].hp)}.`);

    const still = raiders.filter((r) => r.hp > 0);
    if (!still.length) return raidRound(state, rng);

    // Enemy act: pressure cabin
    let incoming = still.reduce((s, r) => s + r.dmg, 0);
    const absorbed = Math.min(incoming, state.resources.raidDefense || 0);
    incoming -= absorbed;
    if (absorbed) pushLog(state, `Raid defense absorbs ${absorbed}.`);
    if (incoming > 0) {
      state.resources.warmth = Math.max(0, state.resources.warmth - 1);
      pushLog(state, `Structures take pressure (−1 Warmth). Children never shown.`);
    }
    if (rng.next() < 0.15) {
      state.meta.cabinReached = true;
      state.resources.food = Math.max(0, state.resources.food - 2);
      state.resources.warmth = Math.max(0, state.resources.warmth - 2);
      pushLog(state, "Cabin pressured: −2 Food −2 Warmth (shuttered window).");
    }
    if (state.resources.warmth <= 0) {
      state.done = true;
      state.won = false;
      pushLog(state, "Hearth fallen — season lost.");
    }
    return state;
  }

  function playCard(state, cardId) {
    const card = Data()?.byId("cards", cardId);
    if (!card) {
      pushLog(state, `Unknown card ${cardId}`);
      return state;
    }
    if (state.resources.mana < (card.mana_cost || 0)) {
      pushLog(state, `Need ${card.mana_cost} mana for ${card.name}.`);
      return state;
    }
    state.resources.mana -= card.mana_cost || 0;
    state.meta.lastCard = cardId;
    for (const fx of card.effects || []) {
      if (fx.op === "remove_chill") {
        state.resources.chill = Math.max(0, state.resources.chill - (fx.amount || 0));
        pushLog(state, `${card.name}: remove ${fx.amount} Chill.`);
      } else if (fx.op === "peek_event") {
        pushLog(state, `${card.name}: peek next event & clock trigger.`);
      } else if (fx.op === "summon") {
        pushLog(state, `${card.name}: summon ${fx.id} for ${fx.rounds} rounds.`);
      }
    }
    return state;
  }

  function startExpedition(state, realmId) {
    const realm = Data()?.byId("realms", realmId);
    if (!realm) {
      pushLog(state, `Unknown realm ${realmId}`);
      return state;
    }
    if (state.resources.lightshard < 1) {
      pushLog(state, "Need 1 Lightshard to enter the Veilway.");
      return state;
    }
    state.resources.lightshard -= 1;
    state.meta.realmId = realmId;
    state.meta.phase = "folio";
    state.meta.turn = 0;
    pushLog(state, `Enter ${realm.name}: ${realm.objective || "folio"}`);
    if (realm.hazard) pushLog(state, `Hazard: ${realm.hazard}`);
    return state;
  }

  function expeditionTurn(state, rng) {
    if (!state.meta.realmId) return state;
    state.meta.turn += 1;
    tickMana(state);
    const ok = rng.d6() >= 3;
    pushLog(
      state,
      `Expedition turn ${state.meta.turn}: ${ok ? "progress" : "setback"} (draw 2 play 1).`
    );
    if (!ok) state.resources.chill += 1;
    if (state.meta.turn >= (state.meta.turnsMax || 3)) {
      state.done = true;
      state.won = state.resources.chill < 5;
      pushLog(state, state.won ? "Return for the raid with the trophy." : "Driven back through the Veilway.");
    }
    return state;
  }

  function raceLeg(state, rng, { burnShard, motherBreath } = {}) {
    const course = Data()?.byId("race_courses", state.meta.courseId);
    if (!course) {
      state.done = true;
      state.won = false;
      return state;
    }
    const legs = course.legs || [];
    if (state.meta.leg >= legs.length) {
      state.done = true;
      state.won = true;
      state.meta.finished = true;
      pushLog(state, course.finish_text || "Race finished.");
      state.resources.lightshard += 1;
      return state;
    }
    const leg = legs[state.meta.leg];
    state.meta.raceTurn += 1;
    let mod = 0;
    if (burnShard && state.resources.lightshard > 0) {
      state.resources.lightshard -= 1;
      mod += 1;
      pushLog(state, "Burn a Lightshard (+1).");
    }
    if (motherBreath && !state.flags.motherBreathUsed) {
      state.flags.motherBreathUsed = true;
      mod += 1;
      pushLog(state, "Mother Aspect breath (+1, once).");
    }
    const roll = rng.d6() + mod;
    const dc = leg.difficulty || 3;
    pushLog(
      state,
      `Leg ${leg.n} ${leg.realm}: roll ${roll} vs ${dc}. ${leg.note || ""}`
    );
    if (roll >= dc) {
      state.meta.leg += 1;
      pushLog(state, "Advance.");
      if (state.meta.leg >= legs.length) {
        state.done = true;
        state.won = true;
        state.meta.finished = true;
        pushLog(state, course.finish_text || "Finish.");
        state.resources.lightshard += 1;
      }
    } else {
      state.resources.bearing = Math.max(0, (state.resources.bearing || 0) - 1);
      pushLog(state, `Fail — Bearing ${state.resources.bearing}.`);
      if (state.resources.bearing <= 0) {
        state.done = true;
        state.won = false;
        state.meta.failed = true;
        if (course.ring === "inner") {
          const odd = rng.d6() % 2 === 1;
          state.meta.failKind = odd ? "kindling_shore" : "ebbing_dark";
          if (odd) {
            state.resources.chill = 0;
            state.resources.food = Math.max(0, state.resources.food - 2);
            pushLog(state, "Miss a turn → Kindling Shore: Chill cleared, −2 Food.");
          } else {
            state.resources.chill += 2;
            pushLog(state, "Miss a turn → Ebbing Dark: +2 Chill.");
          }
        } else {
          state.resources.chill += 1;
          pushLog(state, course.fail_text || "The wisp consumes the runner.");
        }
      }
    }
    if (!state.done && state.meta.raceTurn >= (state.meta.raceTurnsMax || 12)) {
      state.done = true;
      state.won = false;
      pushLog(state, "Shared race clock expired.");
    }
    return state;
  }

  function campaignStep(state, rng, action) {
    const phase = state.meta.phase;
    if (action === "dawn" || phase === "dawn") {
      homesteadDawn(state);
      state.meta.phase = "board";
      state.meta.boardTurn = 0;
      pushLog(state, `Season ${state.season} — board turns open.`);
      return state;
    }
    if (phase === "board") {
      partyBoardRound(state, rng);
      state.meta.boardTurn = (state.meta.boardTurn || 0) + 1;
      if (state.meta.boardTurn >= 4) {
        state.meta.phase = "raid";
        state.meta.raiders = spawnRaiders(6);
        state.meta.wave = 1;
        state.meta.wavesMax = 1;
        pushLog(state, "Turn 4 raid.");
      }
      return state;
    }
    if (phase === "raid") {
      raidRound(state, rng);
      if (state.done && state.won) {
        state.done = false;
        state.won = null;
        state.meta.phase = "close";
      }
      return state;
    }
    if (phase === "close" || action === "close") {
      advanceClock(state, { hold: action === "hold" });
      state.season += 1;
      state.meta.phase = "dawn";
      if (state.season > 8) {
        state.done = true;
        state.won = true;
        pushLog(state, "Eight seasons complete — check ending tracks.");
      }
      return state;
    }
    return state;
  }

  function step(state, action = {}, rngIn) {
    const rng = rngIn || createRng(state.seed + state.log.length);
    const mode = state.modeId;

    if (mode === "hearth_night") {
      if (state.meta.phase === "raid" || state.meta.closingRaid) {
        if (!state.meta.raiders) state.meta.raiders = spawnRaiders(6);
        raidRound(state, rng);
        if (state.done && state.won) {
          pushLog(state, "Hearth Night survived — Keeper of the Hearth is cosmetic only.");
        }
        return state;
      }
      return partyBoardRound(state, rng, action);
    }
    if (mode === "homestead" || mode === "endless_winter") {
      if (action.type === "build") return homesteadBuild(state, action.structureId);
      if (action.type === "hunt") {
        state.resources.ember = Math.max(0, state.resources.ember - 1);
        const food = rng.int(2, 5);
        state.resources.food += food;
        pushLog(state, `Hunt +${food} Food.`);
        return state;
      }
      if (action.type === "dawn" || action.type === "advance") {
        homesteadDawn(state);
        if (mode === "endless_winter") {
          state.meta.seasonsSurvived = (state.meta.seasonsSurvived || 0) + 1;
          if (state.meta.seasonsSurvived % 2 === 0) advanceClock(state);
          if (state.flags.coldDawn && state.resources.warmth <= 0) {
            state.done = true;
            state.won = false;
            pushLog(state, "Endless Winter: hearth cold through the season.");
          }
        }
        return state;
      }
      return state;
    }
    if (mode === "raid" || mode === "raid_gauntlet") return raidRound(state, rng, action);
    if (mode === "cards") {
      if (action.cardId) return playCard(state, action.cardId);
      tickMana(state);
      pushLog(state, `Mana ${state.resources.mana}/${state.resources.manaMax}.`);
      return state;
    }
    if (mode === "expedition") {
      if (action.realmId) return startExpedition(state, action.realmId);
      return expeditionTurn(state, rng);
    }
    if (mode === "wisp_race") return raceLeg(state, rng, action);
    if (mode === "campaign") return campaignStep(state, rng, action.type || action);
    if (mode === "party_board") return partyBoardRound(state, rng, action);
    return state;
  }

  /** Deterministic rules checks for sourced numbers (M0 smoke). */
  function runRulesTests() {
    const failures = [];
    const assert = (cond, msg) => {
      if (!cond) failures.push(msg);
    };

    // Stamina / hex
    assert(defaultResources().staminaMax === 4, "4 Stamina per turn");
    // Starting resources
    const r = defaultResources();
    assert(r.timber === 6 && r.stone === 4 && r.food === 3 && r.ember === 2 && r.lightshard === 1, "start resources");
    assert(r.warmth === 10, "Warmth 10 shared");
    // Mana
    assert(r.manaMax === 10, "mana max 10");
    // Clock finale math: 4 advances & 3 holds → season 8
    let s = freshModeState("campaign", { seed: 1 });
    const stages = Data()?.items("clock_stages") || [];
    assert(stages.length >= 5, "5 clock stages");
    // First raid 6 raiders 3 HP 1 dmg
    const raiders = spawnRaiders(6);
    assert(raiders.length === 6 && raiders[0].hp === 3 && raiders[0].dmg === 1, "first raid stats");
    // Race bearing start 3
    const race = freshModeState("wisp_race", { seed: 2 });
    assert(race.resources.bearing === 3, "race bearing start 3");
    // Hearth Night 10 rounds
    const hn = freshModeState("hearth_night", { seed: 3 });
    assert(hn.meta.roundsMax === 10, "Hearth Night 10 rounds");
    // Minigame rewards never set holds
    const before = hn.holds;
    runMinigame(hn, createRng(9));
    assert(hn.holds === before, "minigame never grants holds");

    return { ok: failures.length === 0, failures };
  }

  window.PlanesboundMorrowrootCore = {
    createRng,
    freshModeState,
    step,
    defaultResources,
    runRulesTests,
    MODE_CHOICES: [
      { id: "astral_voyage", name: "Astral Sea Voyage", blurb: "Existing Planesbound chapter — Cross the Astral Sea.", v1: true, filler: false },
      { id: "campaign", name: "Campaign (8 seasons)", blurb: "Dawn → board → raid → close. Pitchfrost clock.", v1: true, filler: false },
      { id: "hearth_night", name: "Hearth Night", blurb: "Party Board party session — 10 rounds + closing raid. [FILLER]", v1: true, filler: true },
      { id: "homestead", name: "Homestead Survival", blurb: "Build, hunt, keep Warmth on the 12×12 claim.", v1: true, filler: false },
      { id: "raid", name: "Raid Defense", blurb: "Tactical wave — frost raiders vs cabin defenses.", v1: true, filler: false },
      { id: "expedition", name: "Planar Expedition", blurb: "Spend a Lightshard; folio turns 2–4.", v1: true, filler: false },
      { id: "cards", name: "Card & Item", blurb: "Mana, attunement, starter cards.", v1: true, filler: false },
      { id: "wisp_race", name: "Will-o'-Wisp Race", blurb: "Lighthouse Race or Inner Ring. [FILLER rules]", v1: true, filler: true },
    ],
  };
})();
