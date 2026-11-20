# CURSOR HANDOFF — Morrowroot (main build roll in)

> Design Handoff style brief for a Cursor coding agent. Read this file first, then `game-direction.md`, `play-modes.md`, `world-and-board.md`, `art-style.md`, `story-apocrypha.md`. The spine is the production handoff in `reference/production-handoff-morrowroot.md` [S3]; this brief adds the modes, boards, minigames, race and data the owner asked to bring back from the older files [S5] [S8]. Tags: [S#] sourced, [FILLER] invented (needs owner OK), [XWALK] inferred name match. Sources in `sources.md`.

---

## 0. Before you write code
1. **Find the existing game repo** ("our game", "main build"). No repo exists in this package's source box (open question Q10). Inspect its stack, folder layout, save format and what is already built.
2. **If it is Godot 4:** merge into the S3 repo shape (§7 of S3). **If it is anything else** (for example a React / web app): keep this package's rules as a headless, engine agnostic core (pure functions over a state object + seeded RNG) and port only rendering, input and net.
3. Copy `data/` into the repo's data folder. Copy `private/` **outside** the shipped repo (CI secret or a sibling folder); it holds the denylist and crosswalk and must never ship in a build.
4. Never ship text from `reference/` or `assets/planesbound-planes/` directly; they are reference only.

## 1. Scope

**In v1** [S3 §3 unless marked]
- Party Board on two layers: Dale board & Wheel board (hex, Stamina movement, space actions, event deck).
- Homestead building on the 12 × 12 grid, resources, hunting, household jobs.
- Raid tactical rounds (32 × 32 tactical zoom of the compound, [FILLER] Q6).
- Pitchfrost clock (5 stages + holds), possession, frost thrall, Gravesworn ember rule.
- Morrowseed win path (Light, Bearing, Seed tracks) & four endings.
- Card & item mode (mana, attunement, 13 damage types, saves).
- Planar expeditions through the Veilway (five folios).
- **Minigames** (12, round end of Party Board) & **Hearth Night** standalone party session [FILLER, intent from S5].
- **Will-o'-Wisp Race**: Lighthouse Race (outer Slide Circuit) & Inner Ring race (along the leylines) [S8 legs, FILLER rules].
- Online coop 2–4 seats + hotseat + solo with AI companions.

**Out of v1** [S3]: Far Worlds via the Askew, real time homestead, Endless Winter & Raid Gauntlet are **post v1 presets** [FILLER] (data exists; gate behind a flag).

## 2. Systems to implement

| # | System | Rules live in | Key numbers (all tunable, all must have a rules test) |
|---|---|---|---|
| 1 | Season loop | `play-modes.md` §7, S3 §2 | Dawn → board turns 1–4 → raid on turn 4 → close; 8 seasons |
| 2 | Board & movement | `world-and-board.md`, `data/board_dale.json`, `data/board_wheel.json` | 1 hex = 1 Stamina; 4 Stamina/turn |
| 3 | Resources | S3 §3 | Timber 6, Stone 4, Food 3, Ember 2, Lightshard 1 per player; Warmth 10 shared; 1 Chill per turn ended outside warmth; 1 Food each at dawn; half unsmoked Food spoils |
| 4 | Hunting | S3 §3 | Snowfield 1 Stamina + 1 Ember → 1d4+1 Food; big game 2 Stamina → 2d4+2 Food + 1 Hide; −1 yield per clock step |
| 5 | Homestead | `data/structures.json` | Palisade 3T 1S +2 defense; Smokehouse 4T 2S no spoil; Forge 3S 2E 1L; Warding Lantern 2L 1S +3 radius, blocks possession; 6 more structures [FILLER stats] |
| 6 | Raid | `play-modes.md` §3 | Order players → household → enemies; 1 defense absorbs 1 damage/round; first raid 6 raiders 3 HP 1 dmg; enemy at cabin → −2 Food −2 Warmth; Hearth Father fixed defender |
| 7 | Clock & possession | `data/clock_stages.json` | Advance each close; one banked hold max; rooted Nightburr spends hold or pushes; from Long Hush, ≥3 Chill outside warmth = possessed 1 round; 3 possessions/session = frost thrall |
| 8 | Gravesworn | S3 §3 | Ember max 3; −1 per clock step; refills when Ani rests in Geodehall; at 0 or possessed fights as foe; defeated → returns ally with 1 ember |
| 9 | Morrowseed path & endings | `data/endings.json`, S3 §9 | 3 tracks; story spends 4 advances & 3 holds → finale season 8 |
| 10 | Cards & items | `data/cards.json`, `data/items.json` | Mana max 10, +3 per turn/round, carries over; 3 attunement slots; 13 damage types |
| 11 | Expeditions | `data/realms.json`, S2 folios | 1 Lightshard per traveler; turns 2–4 in folio; 12 card deck, draw 2 play 1 |
| 12 | Minigames | `data/minigames.json`, `play-modes.md` §1.3 | [FILLER] round end, winner takes a small reward that never grants holds |
| 13 | Will-o'-Wisp Race | `data/race_courses.json`, `play-modes.md` §6 | [FILLER] rules; "miss a turn" endings from atlas [S8]; never grants holds |
| 14 | Modes & presets | `data/game_modes.json` | Campaign, Party Board, Hearth Night, Race, Endless Winter, Raid Gauntlet; seat modes |
| 15 | Net | S3 §7 | Host authoritative, intents → validate → seeded resolve → snapshot; WebSocketMultiplayerPeer via relay; dropped seat → AI until rejoin |
| 16 | Saves | S3 §7 | Host owns save; autosave at close; versioned JSON; export/import; last 3 seasons rollback |
| 17 | Strings | §3 below | All player facing names through a string table keyed by id |

Lose: clock reaches Last Bell; Warmth 0 for a full season; Ani's light out (Ani has a floor of 1, Q17).

## 3. Data models
- **Existing tables (schemas in S3 §4):** realms, cards, items, creatures, structures, clock stages — provided in `data/`. **Still to author** from S3 §4–5 & S2: `events.json`, `characters.json`, full expedition decks (12 cards × 5 folios), creature stat blocks beyond the 8 given.
- **New tables in this package (write JSON Schemas for them):**
  - `game_modes` — `id, name, in_campaign, standalone_preset, v1, _src` + top level `presets`, `seat_modes`.
  - `minigames` — `id, name, format, inputs, duration_s, winner_reward, children_interactive, art_ref, _src`.
  - `race_courses` — `id, name, atlas_name, ring, start, finish, bearing_start, legs[{n, realm, atlas_id, note, difficulty}], finish_text, fail_text, _src`.
  - `board_dale` — `width, height, orientation, spaces[{id, q, r, type, _src}]` (axial hex).
  - `board_wheel` — `spaces[{id, atlas_id, view, x_pct, y_pct, w_pct, h_pct, _src}]`, `wheel_inner_orbs[{id, atlas_id, x_pct, y_pct, size}]`, `hidden[]` (percent coordinates of the atlas map, `assets/maps/`).
  - `ten_towns` (`id, name, trade`), `seasons` (`season, stage_in_play, realm, signature_raid, hold_earned`), `endings` (`id, order, trigger`).
  - Table files wrap records as `{ _about, _tags, items: [...] }`; the two boards are plain objects.
  - **string table** — `strings/<locale>.json`: `{ "<id>": "<display name>" }`, plus aliases (for example `ten_towns`, Q1).
- Every record keeps `_src` (S# or FILLER). Strip `_src` in release builds or keep as debug metadata.
- Ids: snake case, stable forever. Content is validated at load; invalid data fails the build.

## 4. Priorities & milestones
S3 milestones M0–M6 stand (see `reference/production-handoff-morrowroot.md` §8). Additions:

| Milestone | Adds | Acceptance |
|---|---|---|
| **M0** (+) | Load all 14 `data/` tables + new schemas; string table; denylist lint in CI | All tables validate; lint passes on data, strings, UI text |
| M1–M3 | as S3 | as S3 |
| **M3.5 Party Board & minigames** | Round end minigame hook, 4 minigames first (one per mode), results feed rewards | 4 minigames playable hotseat & online; rewards never change the clock |
| M4 | as S3 (Antlerwild slice, Wheel board) | as S3 |
| M5 | as S3 (coop) | as S3 |
| **M5.5 Hearth Night & Race** | Hearth Night session, Lighthouse Race, Inner Ring race | A full Hearth Night & both races finish 4 seats online; fail endings fire |
| M6 | as S3 + remaining 8 minigames, presets behind flag | as S3 |

Order of work if time is short: season loop → homestead → raid → clock → Morrowseed → cards → expeditions → coop → minigames → race → presets.

## 5. Acceptance criteria (global)
1. **Rules tests** reproduce every sourced number in §2 (one test per number) and the clock math: four advances & three holds land the finale in season 8.
2. **All four endings** reachable from scripted golden saves.
3. **Coop:** 4 browsers finish a season with no desync in 10 runs; rejoin restores the seat.
4. **Denylist lint** (`private/denylist.txt`) passes on `data/`, strings, UI text, and asset filenames. Add the retired dale name locally (not written in this package).
5. **Palette audit tool:** renders checked against the 22 hex palette; violet under 5% of area, warm 15–30% [S4].
6. **Children rule:** children never appear in raids, danger, or as targets [S1] [S4].
7. **Ornament rule:** no six pointed stars or hexagram shapes anywhere; chaos / Askew motifs use the eight arrow Star of Chaos [S13].
8. **3D only:** live 3D for board, homestead, raid, card inspect; 2D art only as pre-renders of the same 3D scenes [S3 §7] [S4].
9. Naming: section and UI say **BEYOND**; no retired names; **Ten Towns** everywhere (legacy Ten Hearths is not player-facing).
10. Story text co written with the owner keeps "&" for "and" and no hyphens (see `story-apocrypha.md`; do not "fix" it).

## 6. Art pipeline (summary — full spec in `art-style.md`)
Hearthclay stylized matte PBR; `.glb`, Y up, 1 unit = 1 m; albedo + normal (OpenGL Y+) + packed ORM; name `<cat>_<id>_v<NN>`; `clock_stage` shader parameter drives the five stage grade; prompts P01–P60 [S4] + P61–P75 [FILLER]. `assets/` in this package is reference only.

## 7. Prompt block for the Cursor agent
```
You are integrating the Morrowroot game build package into our existing game repo.
1. Inspect the repo: stack, structure, what exists. Report a gap list against CURSOR-HANDOFF.md §2 before coding.
2. Add data/ tables and write JSON Schemas for every table (S3 §4 + the new ones in §3). Fail the build on invalid data.
3. Implement the rules core headless (no scene nodes / no UI imports), with a seeded RNG, and a rules test per sourced number.
4. Add the denylist lint reading private/denylist.txt from outside the repo (env path). Run it in CI.
5. Follow milestones M0 → M6 with M3.5 and M5.5. Stop at each milestone and show the acceptance results.
6. Anything tagged [FILLER] is a default: implement it behind data so it can change without code.
7. Never ship text from reference/ or images from assets/planesbound-planes/.
8. Open questions are in open-questions.md; use the stated default and leave a TODO with the Q number.
```
