# Planesbound

Inner Planes gazetteer / campaign hub for Planesbound.

## Local preview

Static site — no build step required:

```bash
python3 -m http.server 5173 --bind 0.0.0.0
```

Then open `http://localhost:5173/` (hub: `index.html`, players gazetteer: `players.html`).

## Grok Build / planesbound.grok.me

This tree is Grok-ready as multi-file static HTML:

- Entry: `index.html`
- Players view: `players.html`
- Art assets: `art/`
- Fallback: `404.html`

Publish by uploading this repo root (or pointing Grok Build at it) so `planesbound.grok.me` serves `index.html`. There is no `scripts/package-grok.mjs` in this seed — ship the HTML + `art/` as-is.

## Source

Seeded from [sporebatglow/planesbound-inner-planes](https://github.com/sporebatglow/planesbound-inner-planes).
