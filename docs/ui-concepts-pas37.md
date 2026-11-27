# PAS-37 — UI concepts → dock chrome + icons

## Tooling

| Tool | Status |
|------|--------|
| Seedream | Unavailable in this environment |
| Cursor GenerateImage | Used for 6 concept plates |

## Concepts (`/cursor/stores/self/media/pas37-ui-concepts/`)

| # | File | Idea |
|---|------|------|
| 01 | `pas37-concept-01-brass-dock.jpg` | Brass/astral combat dock with icon tiles |
| 02 | `pas37-concept-02-companion-chrome.jpg` | Companion parchment + brass corners |
| 03 | `pas37-concept-03-slim-hud.jpg` | Slim top HUD strip |
| 04 | `pas37-concept-04-radial-wheel.jpg` | Radial combat wheel |
| 05 | `pas37-concept-05-icon-rail.jpg` | Vertical icon rail |
| 06 | `pas37-concept-06-hybrid-kept.jpg` | Hybrid kept dream-loop translucent dock |

## Selection

**Picked: concept 06 (hybrid-kept)** with icon language from 01.

Why: PAS-35 blind keep favored Color Pool **after** (prismatic pool readable behind a translucent dock). Concept 06 continues that chrome instead of a radial wheel or heavy parchment rebuild. Icons from 01 wire into the existing action row without fighting the kept hierarchy.

## Icons (`/cursor/stores/self/media/pas37-icons/` + repo `art/ui-icons/`)

Transparent PNGs (128×128, RGBA):

- `icon-strike.png`, `icon-soft.png`, `icon-assist.png`
- `icon-roll.png`, `icon-parry.png`, `icon-slip.png`
- `icon-rest.png`, `icon-companion.png`

Brass `#c5a059` + astral `#9ec4e8` / teal parry line art on clear alpha.

## Implementation (browser)

- Live encounter card: translucent astral glass + brass hairline (hybrid-kept)
- Encounter / travel / status actions: `game-btn--iconed` with PNG icons
- HUD Companion button: companion chrome treatment
- Roll/Parry icon maps ready for PAS-33 merge

## Out of scope

- Unity / UE6
- Blind re-judge (PAS-35 already kept winners)
- Touching #19 / #20 Bugbot branches
