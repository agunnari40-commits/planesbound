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

### Play mode (PAS-6)

Single-player browser slice — no network AI required:

1. Open the hub and tap **Play · Cross the Astral Sea**.
2. Name your traveler, keep/pick a player being (Human default), pick a companion being → **Begin voyage**.
3. From the hub scene, **Cast off into the Astral Sea**.
4. **Seek a memory isle**, then **Follow Lighthouse pulse** / take a bearing (quest completes; keep exploring).
5. Ask the **Companion** anytime — counsel uses your location + party (Esc exits play / closes dialogs).

Save key: `localStorage` `planesbound-game-v1`. Files: `game.js`, `game.css`.

## Grok Build / planesbound.grok.me

This tree is Grok-ready as multi-file static HTML:

- Entry: `index.html`
- Players view: `players.html`
- Art assets: `art/`
- Fallback: `404.html`

Publish by uploading this repo root (or pointing Grok Build at it) so `planesbound.grok.me` serves `index.html`. There is no `scripts/package-grok.mjs` in this seed — ship the HTML + `art/` as-is.

## Source

Seeded from [sporebatglow/planesbound-inner-planes](https://github.com/sporebatglow/planesbound-inner-planes).
