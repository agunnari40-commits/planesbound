# Morrowroot — Game Build Package

Everything from the older Grok threads and files (game direction, play modes, art style, story arc, boards) gathered into one package Cursor can roll into the main build.

**Start here:** `CURSOR-HANDOFF.md` (what to build, in what order, how to know it's done).

## What's in it

| File / folder | What it is |
|---|---|
| `CURSOR-HANDOFF.md` | Design Handoff brief for the Cursor agent: scope, systems, data models, milestones, acceptance criteria, prompt block |
| `game-direction.md` | Identity, pillars, build decisions, name policy, scope, win / lose |
| `play-modes.md` | Every mode with rules, turn flow & win conditions: Party Board (+ minigames, Hearth Night), Homestead, Raid, Expedition, Card & Item, Will-o'-Wisp Race, Campaign, presets |
| `world-and-board.md` | The 40 acre homestead, Ten Towns, Dale board, Wheel board, gates, name crosswalk |
| `art-style.md` | Stylized 3D (hearthclay) look: palette, lighting, clock grade, specs, ornament rule, prompts, asset list |
| `story-apocrypha.md` | Full story arc: cosmos, realms, shores, BEYOND, timeline, cast, powers, clock, eight seasons, four endings, the Singularity |
| `open-questions.md` | Conflicts between sources, gaps, and the default used for each |
| `sources.md` | Every source (paths, transcripts, Pages) and which section came from where; chats still to fetch |
| `data/` | 14 JSON tables ready to load (modes, minigames, race courses, boards, realms, structures, cards, items, creatures, clock, seasons, endings, Ten Towns) — each record tagged `_src` |
| `private/` | Name crosswalk & denylist for the content lint. **Keep out of the shipped repo.** |
| `reference/` | Clean copies of the source documents (production handoff, apocrypha, complete story, style apocrypha v0.2, Singularity canon, legacy handoff, atlas folios) |
| `assets/maps/` | Campaign wheel map (no labels), orb overlay & coordinates, inner map & layout guide |
| `assets/planesbound-planes/` | 39 plane images from the live atlas — mood reference only (they read painterly; the game is 3D) |
| `assets/lore/` | Singularity vortex reference |
| `assets/screenshots/` | Live atlas & gazetteer views |

## How to read the tags
- **[S#]** — taken from source # in `sources.md`.
- **[FILLER]** — invented for this package from the mythos to close a gap. Implement it as data so the owner can change it.
- **[XWALK]** — a name match inferred by ring order or alignment.

## House rules baked in
Stylized 3D only · eight arrow Star of Chaos, never six pointed stars · the section beyond the shores is **BEYOND** · Ten Towns (never the old dale name) · original names in game, no published setting names · story text keeps "&" and no hyphens · style docs are "apocrypha".

## Biggest open items
Where the main build repo lives & its stack (Q10) · Ten Towns vs Ten Towns (Q1) · race rules & unlock (Q7) · minigame list (Q8) · missing legacy catalog & render folders (Q11) · style questions like target hardware & who builds the 3D (Q18).
