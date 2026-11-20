# Planesbound

Inner Planes gazetteer / campaign hub for Planesbound.

## Local preview

Static site — no build step required:

```bash
python3 -m http.server 5173 --bind 0.0.0.0
```

Then open `http://localhost:5173/` (hub: `index.html`, players gazetteer: `players.html`).

### Astral Sea + companion (PAS-2)

- Tap **Astral Sea** on the Inner Ring map (or its rail chip) for the silvery thought-ocean folio (`art/astral-sea.png`).
- **Companion handout** opens a parchment player-notes + browser-local superintelligence companion panel (Esc closes; notes persist in `localStorage`).

### Beings roster (PAS-3)

- Left **Beings Roster** dock: independent Player + Companion race/being pickers.
- Catalog: `data/beings.json` (Human first; hundreds of entries). Legal sourcing — folklore/myth names, SRD-safe staples, original coinages; original blurbs only.
- Virtualized wheel/drag lists in `races-menu.js`.

### Play mode (PAS-6 + Morrowroot modes)

Single-player browser slice — no network AI required:

1. Open the hub and tap **Play · Cross the Astral Sea**.
2. Choose a **play mode** (Astral Sea Voyage is the original chapter; Campaign, Hearth Night, Homestead, Raid, Expedition, Cards, and Will-o'-Wisp Race inlay Morrowroot rules).
3. Name your traveler, keep/pick beings → **Begin**.
4. For Astral Sea Voyage: from the hub scene, **Cast off into the Astral Sea**, then isle → lighthouse bearing. Mid-voyage, **Other play modes** returns to the mode picker without wiping the atlas.
5. Ask the **Companion** anytime (Esc exits play / closes dialogs).

Save keys: `localStorage` `planesbound-game-v1` (voyage) and `planesbound-morrowroot-v1` (mode session). Files: `game.js`, `game.css`, `morrowroot-*.js`, `data/morrowroot/`.

Design docs: `docs/morrowroot/` (CURSOR-HANDOFF, play-modes, art-style, story-apocrypha, open-questions). Canonical town name is **Ten Towns**. Far section label is **BEYOND**. Records tagged `_src: FILLER` are placeholders—easy to swap in JSON.

## Grok Build / planesbound.grok.me

This tree is Grok-ready as multi-file static HTML:

- Entry: `index.html`
- Players view: `players.html`
- Art assets: `art/`
- Fallback: `404.html`

Do **not** publish this branch to the live `planesbound.grok.me` site from agent work—ship via an reviewed PR only. There is no `scripts/package-grok.mjs` in this seed.

## Source

Seeded from [sporebatglow/planesbound-inner-planes](https://github.com/sporebatglow/planesbound-inner-planes).
