/**
 * PAS-9 — 5e parchment character sheets for Player & Companion.
 * Persists to localStorage; unlocks white room when both are complete.
 */
(function () {
  const STORAGE = {
    player: "planesbound-sheet-player-v1",
    companion: "planesbound-sheet-companion-v1",
  };

  const ABILS = ["str", "dex", "con", "int", "wis", "cha"];
  const ABIL_LABEL = { str: "STR", dex: "DEX", con: "CON", int: "INT", wis: "WIS", cha: "CHA" };

  /** SRD-safe core classes for player & companion sheets (race/being = 420 roster). */
  const CLASSES = [
    "Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk",
    "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard",
  ];
  const BACKGROUNDS = [
    "Acolyte", "Charlatan", "Criminal", "Entertainer", "Folk Hero",
    "Guild Artisan", "Hermit", "Noble", "Outlander", "Sage", "Sailor", "Soldier",
  ];
  const SKILLS = [
    ["Acrobatics", "dex"], ["Animal Handling", "wis"], ["Arcana", "int"],
    ["Athletics", "str"], ["Deception", "cha"], ["History", "int"],
    ["Insight", "wis"], ["Intimidation", "cha"], ["Investigation", "int"],
    ["Medicine", "wis"], ["Nature", "int"], ["Perception", "wis"],
    ["Performance", "cha"], ["Persuasion", "cha"], ["Religion", "int"],
    ["Sleight of Hand", "dex"], ["Stealth", "dex"], ["Survival", "wis"],
  ];

  const DEFAULT_PACK = {
    Fighter: "Chain mail, martial weapon, shield, explorer's pack, 10 gp",
    Wizard: "Spellbook, arcane focus, scholar's pack, dagger, 10 gp",
    Rogue: "Leather armor, shortsword, shortbow, thieves' tools, burglar's pack",
    Cleric: "Scale mail, holy symbol, mace, shield, priest's pack",
    Ranger: "Scale mail, longbow, shortsword ×2, explorer's pack",
    Bard: "Leather armor, rapier, lute, entertainer's pack",
    Barbarian: "Greataxe, handaxe ×2, explorer's pack, 4 javelins",
    Druid: "Leather armor, wooden shield, scimitar, explorer's pack, herbalism kit",
    Monk: "Shortsword, dart ×10, explorer's pack, 10 gp",
    Paladin: "Chain mail, martial weapon, shield, holy symbol, priest's pack",
    Sorcerer: "Light crossbow, arcane focus, dungeoneer's pack, 2 daggers",
    Warlock: "Leather armor, light crossbow, arcane focus, scholar's pack, 2 daggers",
  };

  const sheets = { player: null, companion: null };
  let layer = null;
  let openRole = null;

  function mod(score) {
    const n = Number(score) || 10;
    return Math.floor((n - 10) / 2);
  }
  function fmtMod(score) {
    const m = mod(score);
    return m >= 0 ? `+${m}` : `${m}`;
  }

  function blankSheet(role, raceId, raceName) {
    return {
      role,
      name: "",
      raceId: raceId || "human",
      raceName: raceName || "Human",
      className: "",
      background: "",
      level: 1,
      abilities: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
      hp: 10,
      ac: 10,
      speed: 30,
      skills: {},
      features: "",
      equipment: "",
      complete: false,
      updatedAt: Date.now(),
    };
  }

  function load(role) {
    try {
      const raw = localStorage.getItem(STORAGE[role]);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object") return null;
      return data;
    } catch {
      return null;
    }
  }

  function save(role, data) {
    data.updatedAt = Date.now();
    sheets[role] = data;
    localStorage.setItem(STORAGE[role], JSON.stringify(data));
    syncReadyChips();
    document.dispatchEvent(
      new CustomEvent("planesbound-sheets-changed", {
        detail: { role, sheet: data, bothReady: bothComplete() },
      })
    );
  }

  function syncRaceOntoSheet(role) {
    const being =
      role === "player"
        ? window.PlanesboundBeings?.getPlayer?.()
        : window.PlanesboundBeings?.getCompanion?.();
    if (!being) return sheets[role];
    let s = sheets[role] || load(role) || blankSheet(role, being.id, being.name);
    if (s.raceId !== being.id) {
      s.raceId = being.id;
      s.raceName = being.name;
      s.complete = false;
      if (!s.features) {
        s.features = (being.line || being.blurb || being.summary || "").slice(0, 280);
      }
      save(role, s);
    } else {
      sheets[role] = s;
    }
    return s;
  }

  function isComplete(s) {
    if (!s) return false;
    if (s.complete) return true;
    const named = String(s.name || "").trim().length >= 2;
    const classed = Boolean(s.className);
    const bg = Boolean(s.background);
    const abilsOk = ABILS.every((a) => Number(s.abilities?.[a]) >= 3);
    const skillCount = Object.values(s.skills || {}).filter(Boolean).length;
    return named && classed && bg && abilsOk && skillCount >= 2 && String(s.equipment || "").trim().length > 4;
  }

  function bothComplete() {
    return isComplete(sheets.player || load("player")) && isComplete(sheets.companion || load("companion"));
  }

  function ensureLayer() {
    if (layer) return layer;
    layer = document.createElement("div");
    layer.className = "sheet-layer";
    layer.id = "characterSheetLayer";
    layer.setAttribute("data-open", "false");
    layer.innerHTML = `<div class="sheet-frame" data-role="player" id="characterSheetFrame" role="dialog" aria-modal="true" aria-labelledby="sheetTitle"></div>`;
    document.body.appendChild(layer);
    layer.addEventListener("click", (e) => {
      if (e.target === layer) close();
    });
    return layer;
  }

  function portraitUrl(raceId) {
    return `art/races/${raceId || "human"}.png`;
  }

  function renderSheet(role) {
    ensureLayer();
    const frame = document.getElementById("characterSheetFrame");
    const s = syncRaceOntoSheet(role);
    sheets[role] = s;
    frame.dataset.role = role;
    const ready = isComplete(s);
    const kicker = role === "player" ? "Player character · parchment white paper" : "Companion · astral white paper";
    const title = role === "player" ? "Character Sheet" : "Companion Sheet";

    const abilHtml = ABILS.map(
      (a) => `
      <div class="ability-box">
        <strong>${ABIL_LABEL[a]}</strong>
        <input type="number" min="3" max="20" data-abil="${a}" value="${s.abilities[a] ?? 10}" aria-label="${ABIL_LABEL[a]} score" />
        <div class="ability-mod" data-mod="${a}">${fmtMod(s.abilities[a])}</div>
      </div>`
    ).join("");

    const classOpts = CLASSES.map((c) => `<option value="${escapeHtml(c)}"></option>`).join("");
    const bgOpts = BACKGROUNDS.map((b) => `<option value="${escapeHtml(b)}"></option>`).join("");

    const skillsHtml = SKILLS.map(([name, abl]) => {
      const checked = s.skills?.[name] ? "checked" : "";
      return `<label class="skill-row"><input type="checkbox" data-skill="${name}" ${checked} /> ${name} <span aria-hidden="true">(${abl})</span></label>`;
    }).join("");

    frame.innerHTML = `
      <div class="sheet-top">
        <div>
          <p class="sheet-kicker">${kicker}</p>
          <h2 id="sheetTitle">${title}</h2>
          <p class="sheet-status" data-ready="${ready}">${ready ? "Sheet complete — ready for the white room." : "Fill name, class, background, abilities & at least 2 skills."}</p>
        </div>
        <div class="sheet-actions">
          <button type="button" class="sheet-btn sheet-btn--ghost" data-act="close">Close</button>
          <button type="button" class="sheet-btn" data-act="defaults">Apply class kit</button>
          <button type="button" class="sheet-btn sheet-btn--primary" data-act="complete">${ready ? "Update ready" : "Mark complete"}</button>
        </div>
      </div>
      <div class="sheet-body">
        <div class="sheet-portrait-col">
          <img class="sheet-portrait" src="${portraitUrl(s.raceId)}" alt="" width="132" height="132" loading="lazy" onerror="this.src='art/races/human.png'" />
          <p class="sheet-race-line">${escapeHtml(s.raceName)} · race from 420 roster</p>
        </div>
        <div style="display:grid;gap:0.65rem">
          <div class="sheet-grid-2">
            <div class="sheet-field">
              <label for="sheetName">Character name</label>
              <input id="sheetName" data-field="name" value="${escapeAttr(s.name)}" maxlength="48" autocomplete="off" placeholder="Name on the sheet…" />
            </div>
            <div class="sheet-field">
              <label for="sheetLevel">Level</label>
              <input id="sheetLevel" type="number" min="1" max="20" data-field="level" value="${s.level || 1}" />
            </div>
          </div>
          <div class="sheet-grid-2">
            <div class="sheet-field">
              <label for="sheetClass">Class</label>
              <input id="sheetClass" list="sheetClassList" data-field="className" value="${escapeHtml(s.className || "")}" placeholder="Search class…" autocomplete="off" />
              <datalist id="sheetClassList">${classOpts}</datalist>
            </div>
            <div class="sheet-field">
              <label for="sheetBg">Background</label>
              <input id="sheetBg" list="sheetBgList" data-field="background" value="${escapeHtml(s.background || "")}" placeholder="Search background…" autocomplete="off" />
              <datalist id="sheetBgList">${bgOpts}</datalist>
            </div>
          </div>
          <div class="sheet-abilities" aria-label="Ability scores">${abilHtml}</div>
          <div class="sheet-grid-3">
            <div class="sheet-field"><label for="sheetHp">Hit points</label><input id="sheetHp" type="number" min="1" data-field="hp" value="${s.hp || 10}" /></div>
            <div class="sheet-field"><label for="sheetAc">Armor class</label><input id="sheetAc" type="number" min="1" data-field="ac" value="${s.ac || 10}" /></div>
            <div class="sheet-field"><label for="sheetSp">Speed</label><input id="sheetSp" type="number" min="0" step="5" data-field="speed" value="${s.speed || 30}" /></div>
          </div>
        </div>
        <div style="display:grid;gap:0.65rem">
          <div class="sheet-panel">
            <h3>Skills</h3>
            <div class="skills-grid">${skillsHtml}</div>
          </div>
          <div class="sheet-field">
            <label for="sheetFeat">Features & traits</label>
            <textarea id="sheetFeat" data-field="features" rows="4" placeholder="Racial traits, class features…">${escapeHtml(s.features || "")}</textarea>
          </div>
          <div class="sheet-field">
            <label for="sheetEq">Equipment</label>
            <textarea id="sheetEq" data-field="equipment" rows="3" placeholder="Weapons, armor, pack…">${escapeHtml(s.equipment || "")}</textarea>
          </div>
        </div>
      </div>`;

    wireFrame(role, frame);
  }

  function escapeAttr(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }
  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function readFromFrame(role, frame) {
    const s = { ...(sheets[role] || blankSheet(role)) };
    frame.querySelectorAll("[data-field]").forEach((el) => {
      const key = el.dataset.field;
      if (el.type === "number") s[key] = Number(el.value) || 0;
      else s[key] = el.value;
    });
    s.abilities = { ...(s.abilities || {}) };
    frame.querySelectorAll("[data-abil]").forEach((el) => {
      s.abilities[el.dataset.abil] = Math.min(20, Math.max(3, Number(el.value) || 10));
    });
    s.skills = {};
    frame.querySelectorAll("[data-skill]").forEach((el) => {
      if (el.checked) s.skills[el.dataset.skill] = true;
    });
    return s;
  }

  function applyClassKit(s) {
    const cls = s.className || "Fighter";
    s.equipment = DEFAULT_PACK[cls] || DEFAULT_PACK.Fighter;
    const conMod = mod(s.abilities.con);
    const dexMod = mod(s.abilities.dex);
    const hitDie = {
      Barbarian: 12, Fighter: 10, Paladin: 10, Ranger: 10,
      Bard: 8, Cleric: 8, Druid: 8, Monk: 8, Rogue: 8, Warlock: 8,
      Sorcerer: 6, Wizard: 6,
    }[cls] || 8;
    s.hp = Math.max(1, hitDie + conMod);
    s.ac = 10 + dexMod + (cls === "Barbarian" ? Math.max(0, mod(s.abilities.con)) : cls === "Monk" ? Math.max(0, mod(s.abilities.wis)) : 0);
    if (["Fighter", "Paladin", "Cleric"].includes(cls)) s.ac = Math.max(s.ac, 16);
    if (["Rogue", "Ranger", "Bard", "Warlock"].includes(cls)) s.ac = Math.max(s.ac, 11 + dexMod);
    if (!s.features) {
      s.features = `${s.raceName} traits · ${cls} features (level ${s.level || 1})`;
    }
    return s;
  }

  function wireFrame(role, frame) {
    frame.querySelectorAll("[data-abil]").forEach((el) => {
      el.addEventListener("input", () => {
        const m = frame.querySelector(`[data-mod="${el.dataset.abil}"]`);
        if (m) m.textContent = fmtMod(el.value);
        persistSoft(role, frame);
      });
    });
    frame.querySelectorAll("[data-field], [data-skill]").forEach((el) => {
      el.addEventListener("change", () => persistSoft(role, frame));
      el.addEventListener("input", () => persistSoft(role, frame));
    });
    frame.querySelectorAll("[data-act]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const act = btn.dataset.act;
        if (act === "close") {
          persistSoft(role, frame);
          close();
          return;
        }
        if (act === "defaults") {
          let s = readFromFrame(role, frame);
          s = applyClassKit(s);
          save(role, s);
          renderSheet(role);
          return;
        }
        if (act === "complete") {
          let s = readFromFrame(role, frame);
          if (!s.className) s.className = "Fighter";
          if (!s.background) s.background = "Folk Hero";
          if (!String(s.name || "").trim()) {
            s.name = role === "player" ? `Voyager ${s.raceName}` : `Echo ${s.raceName}`;
          }
          if (!String(s.equipment || "").trim()) s = applyClassKit(s);
          const skillKeys = Object.keys(s.skills || {});
          if (skillKeys.length < 2) {
            s.skills = { ...(s.skills || {}), Perception: true, Insight: true };
          }
          s.complete = true;
          save(role, s);
          renderSheet(role);
          if (bothComplete()) {
            setTimeout(() => {
              close();
              document.dispatchEvent(new CustomEvent("planesbound-enter-white-room"));
            }, 350);
          } else {
            const other = role === "player" ? "companion" : "player";
            setTimeout(() => openSheet(other), 280);
          }
        }
      });
    });
  }

  function persistSoft(role, frame) {
    const s = readFromFrame(role, frame);
    s.complete = isComplete({ ...s, complete: false }) ? s.complete : false;
    if (!isComplete({ ...s, complete: false })) s.complete = false;
    else if (sheets[role]?.complete) s.complete = true;
    save(role, s);
    const st = frame.querySelector(".sheet-status");
    if (st) {
      const ready = isComplete(s);
      st.dataset.ready = String(ready);
      st.textContent = ready
        ? "Sheet complete — ready for the white room."
        : "Fill name, class, background, abilities & at least 2 skills.";
    }
  }

  function openSheet(role) {
    openRole = role;
    ensureLayer();
    renderSheet(role);
    layer.setAttribute("data-open", "true");
    document.body.style.overflow = "hidden";
    const focusEl = layer.querySelector("#sheetName");
    requestAnimationFrame(() => {
      focusEl?.focus();
      window.PlanesboundArtMotion?.refresh?.();
    });
  }

  function close() {
    if (!layer) return;
    if (openRole) {
      const frame = document.getElementById("characterSheetFrame");
      if (frame) persistSoft(openRole, frame);
    }
    layer.setAttribute("data-open", "false");
    openRole = null;
    document.body.style.overflow = "";
  }

  function syncReadyChips() {
    ["player", "companion"].forEach((role) => {
      const chip = document.querySelector(`[data-sheet-ready="${role}"]`);
      if (!chip) return;
      const s = sheets[role] || load(role);
      const ready = isComplete(s);
      chip.dataset.ready = String(ready);
      chip.textContent = ready ? "Sheet ready" : "Sheet incomplete";
    });
    const cta = document.getElementById("enterWhiteRoomBtn");
    if (cta) cta.hidden = !bothComplete();
  }

  function injectDockUi() {
    const dock = document.getElementById("racesDock");
    if (!dock || dock.dataset.sheetUi === "1") return;
    dock.dataset.sheetUi = "1";

    ["player", "companion"].forEach((role) => {
      const card = dock.querySelector(`.being-card--${role}`);
      if (!card) return;
      const chip = document.createElement("span");
      chip.className = "being-ready-chip";
      chip.dataset.sheetReady = role;
      chip.dataset.ready = "false";
      chip.textContent = "Sheet incomplete";
      const label = card.querySelector(".card-label");
      if (label) label.insertAdjacentElement("afterend", chip);
      else card.prepend(chip);

      const row = document.createElement("div");
      row.className = "sheet-launch-row";
      row.innerHTML = `<button type="button" class="sheet-btn" data-open-sheet="${role}">Open ${role === "player" ? "player" : "companion"} sheet</button>`;
      const list = card.querySelector(".being-list");
      if (list) card.insertBefore(row, list);
      else card.appendChild(row);
    });

    const cta = document.createElement("button");
    cta.type = "button";
    cta.id = "enterWhiteRoomBtn";
    cta.className = "white-room-cta";
    cta.hidden = true;
    cta.textContent = "Enter the White Room";
    const stack = dock.querySelector(".races-stack") || dock;
    stack.appendChild(cta);

    dock.addEventListener("click", (e) => {
      const openBtn = e.target.closest("[data-open-sheet]");
      if (openBtn) {
        e.preventDefault();
        openSheet(openBtn.dataset.openSheet);
        return;
      }
      if (e.target.closest("#enterWhiteRoomBtn")) {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent("planesbound-enter-white-room"));
      }
    });
  }

  function onRacePicked(role) {
    syncRaceOntoSheet(role);
    syncReadyChips();
    // Character-creation loop: open sheet for the role just picked
    openSheet(role);
  }

  function init() {
    sheets.player = load("player");
    sheets.companion = load("companion");
    injectDockUi();
    syncReadyChips();

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && layer?.getAttribute("data-open") === "true") {
        e.stopPropagation();
        close();
      }
    });

    document.addEventListener("planesbound-beings-changed", () => {
      syncRaceOntoSheet("player");
      syncRaceOntoSheet("companion");
      syncReadyChips();
    });

    document.addEventListener("planesbound-race-picked", (e) => {
      const role = e.detail?.role;
      // Play-start picks omit this event; ignore legacy source:"start" if any.
      if (e.detail?.source === "start") return;
      if (role === "player" || role === "companion") onRacePicked(role);
    });

    window.PlanesboundSheets = {
      open: openSheet,
      close,
      get: (role) => sheets[role] || load(role),
      /** Merge fields into a role sheet and update in-memory cache + localStorage. */
      patch: (role, fields) => {
        if (role !== "player" && role !== "companion") return null;
        if (!fields || typeof fields !== "object") return null;
        const s = sheets[role] || load(role) || blankSheet(role, "human", role === "player" ? "Traveler" : "Companion");
        Object.assign(s, fields);
        save(role, s);
        return s;
      },
      bothComplete,
      isComplete,
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
