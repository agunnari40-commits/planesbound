# Sources — Where Every Section Came From

Tags used across the package: **[S#]** = taken from that source · **[FILLER]** = invented for this package from the mythos, needs owner OK · **[XWALK]** = name match inferred by ring order / alignment. All times America/Detroit (ET).

## 1. Source register (ranked: higher wins on conflict)

| # | Source | Location | What it gave | Rank |
|---|---|---|---|---|
| S1 | **Morrowroot Apocrypha** (reshuffled lore, original names) | `/workspace/artifacts/story-apocrypha.md` (copy: `reference/morrowroot-apocrypha.md`) | Cosmos, 16 realms + 4 shores + BEYOND, cast, Sunderings, homestead, powers, clock, banned names | 1 (lore) |
| S2 | **Finishing the Wheel** (complete story) | `/workspace/artifacts/story-complete.md` (copy: `reference/finishing-the-wheel.md`) | 8 seasons, 5 expedition folios, Ten Towns, timeline, four endings, 30 codex entries | 1 (lore) |
| S3 | **Morrowroot Production Handoff** | `/workspace/artifacts/production-handoff.md` (copy: `reference/production-handoff-morrowroot.md`) | Systems, numbers, JSON schemas, content slate, tech stack, milestones M0–M6, defaults §9, prompt blocks | 1 (systems) |
| S4 | **Morrowroot Style Apocrypha v0.2 (3D)** | `/workspace/artifacts/morrowroot-style-apocrypha.md` (copy: `reference/morrowroot-style-apocrypha-v0.2-3d.md`) | Hearthclay 3D look, 22 hex palette, budgets, specs, prompts P01–P60, never-list, open questions §15 | 1 (art) |
| S5 | **Legacy Design Handoff "Black Winter Wheel"** (DEPRECATED, Ten Towns edit) | `/workspace/artifacts/design-*.md` (only match; legacy filename uses the retired style-doc word) (sanitized copy: `reference/design-handoff-original-black-winter-wheel.md`) | Original vision: board + Mario Party minigames, Civ homestead, Wheel, 40 acres, cabin, spells, threats | 3 |
| S6 | **Singularity canon (owner's words, uncut)** | `/workspace/artifacts/lore/singularity-canon.md` (copy: `reference/singularity-canon.md`) | WW4 / Singularity text, quoted verbatim in `story-apocrypha.md` §12 | 1 (that entry) |
| S7 | Singularity gazetteer draft (NOT ready) | `/workspace/artifacts/lore/singularity-gazetteer-entry.md` | Shorter wording — not used for text because it rewords the owner | — |
| S8 | **Planesbound live bundle** | `/workspace/r.js`, `/workspace/all.html`; live site planesbound.grok.me (extracted: `reference/planesbound-folios.json`) | 40 atlas folios, map coordinates, inner orbs, Will-o'-Wisp race legs & notes, plane images | 2 (layout & race) |
| S9 | **Planesbound Gazetteer** Page | canvas `b94c85be` (Oct 14–15 2026) | Gazetteer prose, Ani arc, Fourth Sundering, labeled wheel | 2 |
| S10 | Overmap alignment brief | `/workspace/artifacts/overmap-align/SHIP-BRIEF.md`, `proposed-nest-coords.csv` | Inner orb positions on the wheel view | 2 |
| S11 | **Owner decision log (voice call with Blits)** | `/home/box/agent-data/agents/1b3764a8-0503-420f-9433-95e16442a81f/voice-calls/call-d8e69cc5-6324-465e-a854-16c4bbf4a08f.json` — Oct 14 2026, ~11:45 PM ET | Gap list; fill open questions from mythos; reshuffle to original names (Ani only named person); tree → Morrowroot in Antlerwild; 77 "and" → "&", hyphens removed; Icewind → Ten Towns (4 swaps); production handoff built; outer-planes.json & art folders on the Simulator's machine | 1 (decisions) |
| S12 | **Officer Opus transcript** | agent `15b6243c-0415-45f1-bebb-6c54f9daf1fc`, positions 9–20 | Art handoff → v0.1 → owner "go 3d" → v0.2 3D; Blits relaying "apocrypha, never the old word" & "everything 3D" | 1 (art direction) |
| S13 | **Bot memory** (RecallMemory) | this bot's memory store | Ten Towns rule, apocrypha rule, & / no hyphens, BEYOND, ornament rule (eight arrow Star of Chaos, no hexagrams), Singularity canon status, Planesbound publishing via grok.com chat, gazetteer style | 1 (rules) |
| S14 | Oldest handoff attachment | sand-data attachment `01M4YV196X38YQY7R9VV4C0FA8.md` | Same as S5 before edits — uses retired terms; not copied | 4 |

**Superseded, not used:** `/workspace/*.bak.md`; sand-data attachments `8ef2…`, `cae9…` (older Morrowroot lore versions under the retired title), `ec3d…` (style v0.1, painted 2D — overruled by "go 3d"), `e31544…` (handoff before the Ten Towns edit).

**Searched, nothing game related:** Google Drive (both connectors); Notion (only "Unified Digital Accounts Hub"); teammate agents Won `58675c70` (Gmail / Moonton), Zero `d4dd516e` (PC maintenance), Barthrall'imew `a4f4c355` (budget Page). Blits' own main chat transcript was not readable from this run (see open question Q22).

## 2. Section → source map

| Package file / section | Sources |
|---|---|
| `game-direction.md` identity, pillars 1–5 | S3 §1, S1, S2, S5 |
| `game-direction.md` pillar 6 | [FILLER] from S5 |
| `game-direction.md` name policy | S11, S13, S3 §2 |
| `play-modes.md` Party Board, minigames, Hearth Night | S5 (intent); rules [FILLER] |
| `play-modes.md` Homestead / Endless Winter | S3 §3, S1; Endless Winter [FILLER] |
| `play-modes.md` Raid, Raid Gauntlet | S3 §3; Gauntlet [FILLER] |
| `play-modes.md` Expeditions | S2 folios, S3 §5 |
| `play-modes.md` Card & Item | S3 §3–4, S1 powers |
| `play-modes.md` Will-o'-Wisp Race | S8 legs/notes; rules [FILLER] |
| `play-modes.md` Campaign & endings | S2, S3 §3 |
| `world-and-board.md` homestead, Ten Towns | S1, S2, S5 (40 acres); 12×12 layout [FILLER] |
| `world-and-board.md` Dale & Wheel boards | S8, S9, S10 coordinates; Dale hex coords [FILLER] |
| `world-and-board.md` crosswalk | S1 × S8 [XWALK] |
| `art-style.md` | S4 (all), S12, S13 ornament rule; P61–P75 [FILLER] |
| `story-apocrypha.md` §1–11 | S1, S2 |
| `story-apocrypha.md` §12 Singularity | S6 verbatim; placement & threading [FILLER] |
| `story-apocrypha.md` §13 banned names | S1, S3 §2 |
| `CURSOR-HANDOFF.md` | S3 (spine), S4 §11–12, plus all of the above |
| `data/*.json` | per record `_src` field |
| `assets/maps/` | S8, S10 (wheel overlay, inner map, coords CSV) |
| `assets/planesbound-planes/` | S8 (live site images) — mood reference only |
| `assets/lore/singularity-vortex.jpg` | S6 companion image |
| `assets/screenshots/` | S8 live site, S9 |
| `open-questions.md` | all, plus S4 §15 and S3 §9 |

## 3. Excluded on purpose
- `/workspace/mockup.jpg` (its sigil is a six pointed star, against the ornament rule).
- `filters/` experiments and unrelated preview images.
- Any retired title, the old dale name, or publisher names (scrubbed from all copies; see `private/denylist.txt`).

## 4. Chats to fetch next (grok.com) — for the parent agent
1. **"Outer Planes Campaign Map"** — https://grok.com/c/23ddbfed-8894-4dd9-bf49-4b407541f3e3 — the grok.com Build chat that publishes Planesbound. May hold race rules, unpublished folios, and the hub decision (Q5, Q7).
2. **The original "D&D Simulator Game / Design Handoff" chat(s)** on the Simulator's machine — URL not found anywhere on the box. They hold `outer-planes.json`, the `imagine_images/` & `rendered/` folders, and the render history (Tesseract Prison iterations, Ten Towns scenes, Wight vs Black Frost Dragon, ice mephit avatar, civilization panorama). Needed for Q11 & Q16.
