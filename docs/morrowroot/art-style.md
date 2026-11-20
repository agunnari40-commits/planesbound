# Art Style — Stylized 3D ("hearthclay")

**All art direction is stylized 3D. Nothing ships as painted 2D.** The owner moved the whole game to 3D ("go 3d") and the style doc was rebuilt as v0.2 3D [S12] [S4]. The full spec — 16 sections, 60 pasteable prompts — is copied verbatim at `reference/morrowroot-style-apocrypha-v0.2-3d.md`. **Where this summary and that file differ, that file wins.**

Lineage: legacy keywords in the original handoff ("cinematic dark fantasy, teal/cyan aurora, purple necrotic, gold luck light") [S5] → v0.1 "frost gouache" painted 2D (superseded, backup only) → **v0.2 "hearthclay" stylised matte PBR 3D (current)** [S4] [S12]. The Planesbound plane art in `assets/planesbound-planes/` is **mood and layout reference only**; it is the atlas's look, not the game's, and nothing is copied from it [S4 from-scratch rule].

---

## 1. Look in one line
A small warm light in a very large cold place, sculpted by hand. [S4 §1]

- **Medium:** chunky hand-sculpted forms with bevelled edges reading as matte clay, felted wool, worn timber, poured ice and cold stone. PBR but matte and simple; broad palette colour fields; soft normal detail; no photoreal micro-noise. [S4 §1]
- **Live 3D in Godot (Compatibility renderer, web):** board tokens, homestead structures, raid view, card inspect view, UI backdrops with slow camera drift. **Pre-rendered from the same 3D scenes:** card art windows, damage icons, hero stills, event overlays, descriptor sheets. [S4 §1] [S3 §7]
- **Signature image:** lanterns against snow. [S3 §6]
- **Hero art:** full bleed and sharp on phones, no black bars. [S13] [S4 §3.4]

## 2. Locked palette (22 hexes) [S4 §2.1]

| Group | Swatches |
|---|---|
| Magpie | Magpie Black `#0D1014` · Magpie White `#F5F7F6` |
| Frost blues | Nightfrost `#14263B` · Deepice `#2B4F73` · Glacier `#5A8FB5` · Rime `#A5CDE3` · Frostglass `#D6EAF4` |
| Ember ambers | Cinder `#4A2214` · Ember Deep `#A9441C` · Ember Amber `#E7872B` · Lantern Gold `#F6B84A` · Quartz White `#FFF6E6` (Ani's core, lens beam core, Hearthsun centre only) |
| Neutrals | Cairn Grey `#6F7A86` · Slate `#3A444F` · Bone `#D9D0BE` · Moonscale `#E3E9EE` · Scale Shade `#9AA9B8` · Brass `#B58A45` · Hide `#6E4B34` |
| Necrotic accent only | Cold Violet `#6B4FA0` · Violet Shadow `#2F2150` · Violet Mist `#A592D6` |

**Area budget per finished image:** cold/neutral 65–80%, warm 15–30% (never below 5%), violet under 5% (target ≤3%), measured on the rendered composite. A hero image with no warm source fails review. [S4 §2.2]

**Lighting defaults:** cold Frostglass key from the upper left ~45°; Glacier sky fill (snow shadows read blue, never grey); exactly one visible warm source (Lantern Gold → Ember Amber falloff); cold Rime rim + warm rim on the lantern side; Filmic tonemap; no bloom on web (fake glow with emissive + halo cards); baked AO; height fog in Rime/Glacier; vignette ≤25%. [S4 §2.3] A pixel-level palette audit (violet, warm, drift ΔE) is in [S4 §2.4] — implement it as a CI tool (see CURSOR-HANDOFF).

**Clock-stage grade** via global shader param `clock_stage` 0–5 [S4 §2.5]:

| Stage | Frost creep on UI | Warm pool | Saturation |
|---|---|---|---|
| Zero | 0% | 100% | 0% |
| Hoarstep | 10% | 90% | −5% |
| Glasswater | 25% | 75% | −10% (water roughness 0.1) |
| Long Hush | 45% | 60% | −20% |
| Stillmarrow | 65% | 45% | −30% |
| Last Bell | 85% | 30% | −40% |

Frost never covers text, buttons or the focal zone; it is a normal + albedo overlay with a world-up mask.

## 3. Production specs (defaults, mobile-web first) [S4 §4]
- **Textures:** albedo `_alb` (sRGB), normal `_nrm` (OpenGL Y+), packed ORM `_orm` (R=AO, G=roughness, B=metal), optional `_emi`. Max 3 reads per material (+emissive when needed). Texel density: characters 512 px/m, hero props 1024, near env 256, terrain 128.
- **Sizes:** hero character 1024 (desktop 2048), hero prop 1024, small prop 256–512, kit atlas 2048, icons 256 master, hero stills 1440×3360 (desktop 3840×2160).
- **Budgets:** ≤64 MB VRAM per gameplay scene (96 MB hero); first web download <25 MB with realms on demand; gameplay scenes 150k tris / 120 draw calls; ≤300 particles.
- **Polycounts (LOD0 mobile):** adult humanoids 12k; Hollow Regent 14k; Eldest/Middle Child 9k; Youngest 8k; Mother Aspect 20k; Ani 600; Fizzlet 1.5k; Churnglint 2.5k; creatures 5k; cabin 6k; town cottage 2k; Magpie Light set 18k; hex tile 800; board token 3k. Desktop ≈2×. [S4 §4.2]
- **Mesh:** glTF 2.0 `.glb`, Y up, 1 unit = 1 m, −Z forward, ≤4 bone influences. One shared humanoid rig (56 bones hero / 32 mid) + special rigs for Ani, Gravesworn, Mother Aspect, Fizzlet, Churnglint, Old Beast. [S4 §4, §6]
- **Cameras:** board & homestead 35° pitch, 25° FOV fixed; hero portraits 40–50 mm; descriptor sheets orthographic + 3/4 at 35°. [S4 §4.3]
- **Lighthouse:** 30 m tower, 5 m base, black lantern room, white shaft with two black bands, black plinth, Brass lamp frame, 12-facet lens; four beam states. [S4 §10]

## 4. Characters — descriptor essentials [S1] [S3 §6] [S4 §5]
- **Hunter:** tall, rugged, short dark hair, fully human, no animal features. **Never a bat form, never shapeshifting.**
- **Snow Crowned Tracker:** white hair; reads snow like script.
- **Mother Aspect:** young glimmerhusk dragon; scales like moon-pale feldspar (Moonscale/Scale Shade); warm breath glow; default folded husk-plate wing-cases.
- **Ani:** drifting will-light, quartz white → amber with mood. **No face, no humanoid body.** Never violet.
- **Gravesworn:** barrow-hunter undead, frost in the ribs, ember glow in the chest (foe state: rime over the ember).
- **Hearth Father, Fizzlet, three children, Churnglint, Hollow Regent, Old Beast:** owner-approved defaults in [S4 §5.5–5.11].
- **Children rule:** safe homestead scenes only; never in raids; fright = shuttered window + the Hearth Father's portrait. The Youngest speaks the counter oath at the hearth beside the Tithe Chest, never in raid art. The Middle Child's sled beat shows only the loaded sled leaving the yard. [S4 owner decisions]
- **Pitchfrost:** weather only, never a creature or boss. [S4 owner decisions]

## 5. Ornament & symbol rules
- **No six-pointed stars anywhere** (no hexagrams, no Metatron-cube hexagram layouts). Where a star sigil is wanted, use the **eight-arrow Star of Chaos** (eight arrows radiating from one center point). [S13] [S10]
- Sigils and runes go only on blank dark panel areas around images, never on hero art, cards or icons. [S13]
- Note for the build: an older Planesbound mockup (`/workspace/mockup.jpg`, not copied here) shows a hexagram sigil on the BEYOND panel — do **not** reuse it.

## 6. Never-list (summary of [S4 §13.1])
Outside names/IP/likenesses; bat form or animal features on the Hunter; children in raids or in danger; violet ≥5% or for non-Necrotic use; palette drift (teal-cyan aurora, gold-luck light, purple armour, red eyes, skull trophies); black bars/letterboxing; text/numbers/logos in renders; a face or body on Ani; the Pitchfrost as a creature; the Hearth Father leaving the cabin in a raid; gore; copying any legacy render; photoreal skin/fur, glossy plastic, neon rims, lens flares, chromatic aberration, off-palette god rays, unapproved pack assets. Plus: no six-pointed stars [S13].

## 7. Naming convention [S4 §13.2]
`<cat>_<id>[_<variant>][_<view>]_v<NN>.<ext>`, lowercase snake_case. 3D cats: `mdl`, `chr`, `rig`, `anim`, `tex` (`alb|nrm|orm|emi`), `mat`, `kit`, `render`; 2D-output cats: `desc`, `card`, `frame`, `icon`, `ui`, `realm`, `scene`, `tile`, `tok`, `fx`. `art_ref` in data = filename stem without version. Versions never overwritten; `wip/` → `approved/`; engine imports only from `export/`.

## 8. Prompts
The shared preamble, lighting lines, framing lines and negative list are in [S4 §14.1]; **P01–P60** (13 roles × turnaround + portrait, card frame A/B, Hushcube, five realms, lighthouse beam states 0–3, eight UI backdrops, 13 damage icons) are in [S4 §14]. Prompt output is concept/reference only; game assets are modelled from scratch.

**New prompts added by this package [FILLER]** — each must be prefixed with the shared preamble + scene lighting line + the relevant framing line from [S4 §14.1], and end with the shared negative list plus `six-pointed star, hexagram`:

- **P61 — WW4 Singularity hero (portrait 9:21).** "A blue-white vortex of light and poured-ice shards spiralling up from a moonlit clearing in a snowy pine forest, sculpted as chunky matte clay ice and felted snow, Frostglass and Rime light at the vortex core, Deepice and Nightfrost shadows, one tiny Lantern Gold lantern held on a post at the clearing's edge as the only warm source, a small light in a rising wind, snow streaming toward the vortex." (Owner wants new stylized 3D vortex art for this canon [S13]; `assets/lore/singularity-vortex.jpg` is the owner's reference image, mood only.)
- **P62 — Star of Chaos panel ornament (1:1, object lighting).** "An eight-arrow star of chaos ornament: eight slim arrows radiating from a single center point at equal 45-degree spacing, embossed Brass on a Nightfrost panel, matte, bevelled, no other symbols."
- **P63 — Will-o'-Wisp race token (1:1, object lighting).** "A tiny Leylit wisp: a drifting ball of quartz-white light with a short ribbon tail, held in a brass lantern cage, matte sculpted brass, no face."
- **P64–P75 — Minigame set dressing** (one per minigame in `play-modes.md` §1.3), e.g. "a hide rack of stretched hides in the snow beside a timber cabin, frost creeping across the hides, one hearth glow through the cabin window".

## 9. Asset list (v1)
Counts from [S3 §5–6] and [S4]; [FILLER] rows are new for the restored modes.

| Group | Items | Count | Source |
|---|---|---|---|
| Characters (rigged) | Hunter, Tracker, Mother Aspect, Ani, Hearth Father, Gravesworn, Fizzlet, Eldest, Middle, Youngest, Churnglint, Hollow Regent, Old Beast (modular) | 13 | [S4 §5] |
| Descriptor sheets | ortho front/side/back + 3/4 + expressions, per role | 13 | [S3 §6] |
| Creatures | 2 per family: frost raider, Nightburr thrall, slide beast, frost thrall | 8 | [S3 §5] |
| Structures | Palisade, Smokehouse, Forge, Warding Lantern, Hearth, Storehouse, Hide Rack, Barn, Sled Shed, Watch Post (+ cabin hero) | 10 (+1) | [S3 §5] |
| Hero props | Tithe Chest, Needlesphere, Magpie Lens, Hushcube, Warding Lantern, Morrowseed | 6 | [S1] [S4] |
| Set piece | Magpie Light + Bearing Head + cairn, 4 beam states | 1 | [S4 §10] |
| Realm kits | Antlerwild/Rimmerdale, Churn edge, Underheart, Geodehall, Sifting | 5 | [S4 §9] |
| Dale board | hex tile set (snow, forest, river, town, road, Rimeward, headland), 10 Hearth town minis | ~12 tiles + 10 | [S3] [S4 §4.2] |
| Wheel board | 16 outer realm space tiles, 13 shore/seam tiles, 4 BEYOND tiles, Axlestone, Hinge Town marker, hidden Duskmarrow | ~36 | [S3] [FILLER] |
| Board tokens | 4 playable + Gravesworn + Ani | 6 | [S4 §4.2] |
| Card frame | mode A (flat) + mode B (slab) | 2 | [S4 §7] |
| Card art | 24 starter + 12 items + 68 event cards | 104 | [S3 §5] |
| Damage icons | 13 (Cold, Necrotic first) | 13 | [S4 §7.3] |
| UI screens | title, lobby/join, roster, Dale board, Wheel board, homestead grid, raid view, hand & deck editor, expedition folio, campaign panel, event overlay, Boasts tally, settings, save/load | 14 | [S3 §6] |
| Minigame scenes | 12 small 3D vignettes reusing homestead and town kits | 12 | [FILLER] |
| Race | wisp token, 18 leg markers, 2 course boards | 21 | [FILLER] |
| Codex | 30 lore codex entries + WW4 Singularity page | 31 | [S2] [S6] |
| Ornament | Star of Chaos panel ornament | 1 | [S13] |
| Audio | wind beds thinning by stage, hearth crackle, bell motif per stage, magpie calls, Fizzlet stings | — | [S3 §6] |

## 10. Reference images included in this package
| Path | What | Use |
|---|---|---|
| `assets/maps/campaign-map-nolabels.jpeg` | live Planesbound Wheel map, nameplates removed (1600×900) | Wheel board layout template |
| `assets/maps/wheel-overlay-orbs-aligned.jpg` | the same map with Inner orbs at the aligned positions | orb placement check |
| `assets/maps/inner-orb-coords-wheel-view.csv` | Inner orb percent centers on the Wheel view | data |
| `assets/maps/inner-map.jpeg`, `inner-map-layout-guide.jpg` | Planesbound Inner Ring map + layout guide | Inner Ring / race board layout |
| `assets/planesbound-planes/*.jpeg` | 39 live atlas plane images (downloaded from planesbound.grok.me on 2026-11-19) | mood only |
| `assets/lore/singularity-vortex.jpg` | owner's Singularity image | mood only for P61 |
| `assets/screenshots/*` | live atlas screenshots (wheel, inner, folio view, an older labeled wheel) | UI/UX reference for the atlas look |

Excluded on purpose: `/workspace/mockup.jpg` (hexagram sigil on the BEYOND panel) and the graphics filter test video and frames in `/workspace/artifacts/filters/` (not part of the stylized 3D direction).
