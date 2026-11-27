# Planesbound self-scoring screenshot rubric (PAS-34)

Score live captures of **hub**, **voyage**, and **combat** before dream-loop polish. Use 0–5 per criterion (half-steps allowed). Target for a keepable hero beat: **≥ 18 / 25** and no criterion below 2.

## Scenes

| Beat | How to capture | What must read in-frame |
|------|----------------|-------------------------|
| Hub | Play → Lighthouse Hub, first viewport | Brand/place identity, HUD, cast-off CTA, readable parchment/astral UI |
| Voyage | Astral Sea (or Memory Isle) mid-travel | Full-bleed still as dominant plane, travel actions, location title |
| Combat | Color Pool live skirmish dock open | Foe stage + encounter card, HP/threat (and STA when PAS-33 merged), actionable choices |

Store scored PNGs under `/cursor/stores/self/media/dream-loop/` with names:

- `hub-before.png` / `hub-after.png`
- `voyage-before.png` / `voyage-after.png`
- `combat-color-pool-before.png` / `combat-color-pool-after.png`
- `combat-color-pool-target.png` (dream-loop same-camera repaint)

## Criteria (5 each → 25)

1. **Composition** — One clear hero plane; not a dashboard of competing cards. First viewport has a dominant edge-to-edge scene or stage.
2. **Identity** — Planesbound / Astral Sea reads without the nav. Still or stage matches the named location (hub / sea / color pool).
3. **Hierarchy** — One primary action group; vitals/HUD support rather than overpower. Combat: dock readable without covering the whole stage.
4. **Atmosphere** — Depth/vignette/light; not flat flat-color UI. Gradients or stills carry mood; avoid generic purple-glow AI sludge.
5. **Legibility** — Type contrast, vitals bars, and CTAs readable at 1280×720. No clipped labels; reduced-motion still usable.

## Scoring sheet

```
Scene: ____________  Capture: before | after
Composition __/5
Identity     __/5
Hierarchy    __/5
Atmosphere   __/5
Legibility   __/5
Total        __/25
Notes:
```

## Dream-loop procedure

1. Capture **before** shot for the hero beat (prefer Color Pool combat or Color Pool voyage still).
2. Produce a **same-camera target** (Seedream preferred; if unavailable, document blocker and use closest image tool / stub).
3. Score before vs target: list gaps (palette, pool glow, dock chrome, stage framing).
4. Change browser CSS / Three presentation only — no Unity.
5. Capture **after**; score again. Loop until after ≥ before + 2 points **or** after ≥ 18/25.
6. Blind judges are **out of scope** for PAS-34 (pipeline step 4 next).

## PAS-34 scores (Color Pool hero)

See `/cursor/stores/self/internal/pas34-dream-loop.md` for filled sheets and tool blockers.
