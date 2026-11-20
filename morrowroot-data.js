/* Morrowroot data loader — 14 tables + string table (PAS roll-in). */
(function () {
  const BASE = "data/morrowroot";
  const TABLES = [
    "game_modes",
    "minigames",
    "race_courses",
    "board_dale",
    "board_wheel",
    "ten_towns",
    "seasons",
    "endings",
    "clock_stages",
    "realms",
    "structures",
    "cards",
    "items",
    "creatures",
  ];

  /** @type {Record<string, any>} */
  const cache = Object.create(null);
  let strings = Object.create(null);
  let ready = false;
  let readyPromise = null;

  async function fetchJson(path) {
    const res = await fetch(path, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Morrowroot data missing: ${path} (${res.status})`);
    return res.json();
  }

  function validateTable(id, raw) {
    if (!raw || typeof raw !== "object") throw new Error(`Invalid table ${id}`);
    // Board tables are plain objects; others wrap { items: [...] }
    if (id === "board_dale" || id === "board_wheel") {
      if (!Array.isArray(raw.spaces)) throw new Error(`${id} needs spaces[]`);
      return raw;
    }
    if (!Array.isArray(raw.items)) throw new Error(`${id} needs items[]`);
    for (const row of raw.items) {
      if (!row || typeof row !== "object") {
        throw new Error(`${id} row invalid`);
      }
      // seasons table keys on season number (CURSOR-HANDOFF §3); normalize id
      if ((!row.id || typeof row.id !== "string") && row.season != null) {
        row.id = `season_${row.season}`;
      }
      if (typeof row.id !== "string" || !row.id) {
        throw new Error(`${id} row missing id`);
      }
    }
    return raw;
  }

  async function loadAll() {
    if (ready) return cache;
    if (readyPromise) return readyPromise;
    readyPromise = (async () => {
      const entries = await Promise.all(
        TABLES.map(async (id) => {
          const raw = await fetchJson(`${BASE}/${id}.json`);
          return [id, validateTable(id, raw)];
        })
      );
      for (const [id, data] of entries) cache[id] = data;
      strings = await fetchJson(`${BASE}/strings/en.json`);
      // Ban check on player-facing strings (lightweight; full denylist lives outside repo)
      const banned = [/\bbible\b/i, /icewind\s*dale/i, /ten\s*hearths/i];
      for (const [k, v] of Object.entries(strings)) {
        if (k.startsWith("_")) continue;
        const text = String(v);
        for (const re of banned) {
          if (re.test(text) && k !== "ten_hearths") {
            throw new Error(`Banned term in string ${k}: ${text}`);
          }
        }
      }
      ready = true;
      document.dispatchEvent(new CustomEvent("planesbound-morrowroot-ready"));
      return cache;
    })();
    return readyPromise;
  }

  function table(id) {
    return cache[id] || null;
  }

  function items(id) {
    const t = cache[id];
    return t?.items ? t.items.slice() : [];
  }

  function byId(tableId, rowId) {
    return items(tableId).find((r) => r.id === rowId) || null;
  }

  function str(key, fallback) {
    if (key === "ten_hearths") return strings.ten_towns || "Ten Towns";
    return strings[key] != null ? strings[key] : fallback != null ? fallback : key;
  }

  function modes() {
    const gm = cache.game_modes;
    if (!gm) return [];
    return {
      items: gm.items || [],
      presets: gm.presets || [],
      seat_modes: gm.seat_modes || [],
    };
  }

  window.PlanesboundMorrowrootData = {
    loadAll,
    isReady: () => ready,
    table,
    items,
    byId,
    str,
    modes,
    TABLES: TABLES.slice(),
  };
})();
