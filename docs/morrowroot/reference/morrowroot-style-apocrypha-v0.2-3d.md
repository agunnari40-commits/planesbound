# Morrowroot Style Apocrypha v0.2 (3D)

*Status: draft for sign-off. v0.2 replaces the v0.1 painted 2D direction ("frost gouache") with a stylised 3D direction, by owner decision. Every number is either quoted from the sources (marked **[src]**) or is a stated **default** that can change. Source of truth for lore: the Morrowroot Apocrypha, then the Production Handoff. All art is made from scratch to this page. Prior renders are mood reference only and nothing is copied from them.*

*Owner decisions folded in (marked **[owner]**): the whole game is 3D. All flagged defaults for the Hearth Father, three children, Fizzlet, Churnglint, Hollow Regent and Old Beast are approved. The Youngest speaks the counter oath at the hearth beside the Tithe Chest and never in raid art. Children never appear in raids. The Middle Child's sled beat shows only the loaded sled leaving the yard. The Churn uses the locked colours with roles swapped. The Pitchfrost is weather only and never a creature.*

---

## 1. Look and medium

**Default medium: "hearthclay", stylised matte PBR 3D.** Chunky, hand-sculpted forms with bevelled edges, read as matte clay, felted wool, worn timber, poured ice and cold stone. Materials are physically based (PBR) but kept matte and simple: broad colour fields from the locked palette, soft normal-map detail, no photoreal micro-noise. Light is the hero: one small warm source in a large cold scene.

**Why this fits the sources**
- **Tone:** hard frontier survival with soft homestead moments, and a mythic saga cosmos **[src: Handoff §1, Apocrypha "Build Decisions"]**. Matte, rounded, tactile forms carry both. Glossy photoreal rendering would push toward cold spectacle.
- **Pipeline:** Godot 4 with a browser-first, single-threaded web export **[src: Handoff §7]**. Browser export uses the **Compatibility renderer**, so this direction is built to run on it: baked or faked AO and glow, at most one shadowed directional light, a few omni lights, and compressed textures. Polycounts in §4 are defaults sized for mobile web.
- **Palette lock:** frost blues, ember ambers and magpie black and white **[src]**. Albedo is authored straight from the 22 locked hexes, and light colours are also palette hexes, so the render stays inside the lock. §2.4 adds a palette audit for rendered output.
- **Hero art:** it has to be sharp and full bleed on phones **[owner request]**. Big readable forms, one warm focal light and pre-rendered hero stills survive small screens.
- **Signature image:** "lanterns against snow" **[src: Handoff §6]**. A cool, bright, blue-shadowed snow field with one small hot pool of light is easy to light and easy to read in 3D.

**How 3D is delivered (defaults)**
- **Live 3D in engine:** board tokens, homestead structures, raid view, the card inspect view, UI backdrops with slow camera drift.
- **Pre-rendered from the same 3D scenes:** card art windows, damage icons, hero stills, event overlays, character descriptor sheets. Pre-rendering lets hero art use depth of field, soft shadows and glow that the web renderer cannot afford live.

**Mood in one line:** a small warm light in a very large cold place, sculpted by hand.

*This is a default. If the owner picks a different 3D flavour (for example faceted low poly or toon shaded), only §1, §3.2 and §4 change. The palette, characters, card layout and never-list still hold.*

---

## 2. Locked palette and lighting

### 2.1 Colour table (unchanged, 22 colours)

| # | Name | Hex | Role |
|---|---|---|---|
| 1 | Magpie Black | `#0D1014` | Deepest shadow, magpie dark bands, text on light panels |
| 2 | Magpie White | `#F5F7F6` | Magpie white bands, top-value snow, text on dark panels |
| 3 | Nightfrost | `#14263B` | Shadow base for night and snow scenes, UI panel fill, card frame body |
| 4 | Deepice | `#2B4F73` | Core shadow in snow, deep water and ice, Cold-type dark |
| 5 | Glacier | `#5A8FB5` | Mid-tone snow and ice, sky fill, card-kind tint (ability) |
| 6 | Rime | `#A5CDE3` | Light ice, frost on surfaces, rim light on the cold side |
| 7 | Frostglass | `#D6EAF4` | Lit snow, frost highlights, key light colour, Cold icon highlight |
| 8 | Cinder | `#4A2214` | Warm shadow: interiors, hide, wood, lantern-side shadow |
| 9 | Ember Deep | `#A9441C` | Hearth glow edge, ember glow falloff, warm midtone |
| 10 | Ember Amber | `#E7872B` | Main lantern, ember and fire colour |
| 11 | Lantern Gold | `#F6B84A` | Lantern core, highlights on warm lit surfaces, Hearthsun |
| 12 | Quartz White | `#FFF6E6` | Hottest value. Ani's core, lens beam core and Hearthsun centre only |
| 13 | Cairn Grey | `#6F7A86` | Stone, Underheart, Hushcube crystal body |
| 14 | Slate | `#3A444F` | Dark stone, iron, armour, card-kind tint (response) |
| 15 | Bone | `#D9D0BE` | The Sifting dust, bone, Gravesworn bone, parchment |
| 16 | Moonscale | `#E3E9EE` | Mother Aspect feldspar scales (base) |
| 17 | Scale Shade | `#9AA9B8` | Feldspar scale shadow and sheen turn |
| 18 | Brass | `#B58A45` | Needlesphere rings, lamp frame, lens mount, item-card trim |
| 19 | Hide | `#6E4B34` | Leather, fur trim, cabin timber midtone |
| 20 | Cold Violet | `#6B4FA0` | **Necrotic accent only** (core) |
| 21 | Violet Shadow | `#2F2150` | Necrotic accent shadow |
| 22 | Violet Mist | `#A592D6` | Necrotic smoke highlight |

**Skin tones** are not defined in the sources (see §15). Default: author skin albedo as a ramp that blends Hide and Ember Amber toward Nightfrost shadows, with the lit side warm and the shadow side cool. Use no new hue. Skin PBR: roughness 0.6, metal 0.0, no subsurface in web builds (fake it with a warm Ember Deep rim on the shadow terminator).

### 2.2 Area budget (per finished image or screen)

| Group | Colours | Share of area |
|---|---|---|
| Cold / neutral field | 3–7 (Nightfrost to Frostglass) plus Magpie Black and White, and the neutrals 13–17 | **65–80%** |
| Warm family | 8–12, plus Brass and Hide where lit | **15–30%**, and never below 5% |
| **Necrotic violet** | 20–22 | **Hard cap under 5% of image area, target 3% or less** |

- Violet appears only for Necrotic effects: Nightburrs, Nightburr thralls, the Hushcube's cracks, the Necrotic icon, the Regent's seams, and cold violet smoke.
- Violet never fills a background, a frame or a UI panel, and never appears on Ani.
- The cap is measured on the **composed, rendered** asset. A card is measured as a whole card. A UI screen is measured as the whole screen. Emissive glow and particles count.
- A hero image with no warm source fails review.

### 2.3 Lighting setup (3D defaults)

| Light | Role | Settings (defaults) |
|---|---|---|
| **Key (cold sky/moon)** | Directional, the global key. From the **upper left, about 45° up and 45° around from camera-left**, so shadows fall to the lower right | Colour Frostglass `#D6EAF4` (about 9000 K feel). Energy 1.0. Soft shadows. The only shadow-casting directional light |
| **Fill (sky ambient)** | Ambient, from the sky | Colour Glacier `#5A8FB5`, energy 0.5–0.6. **Shadows in snow read blue** (Glacier to Deepice), never grey or black |
| **Warm source** | **One visible warm source per hero image**: lantern, hearth, ember, Ani or the lighthouse beam | Omni, colour Lantern Gold `#F6B84A` shading to Ember Amber `#E7872B` at the falloff (about 2400 K feel). Energy 1.5–2.5. Pool radius **1.5–3× the height of the nearest figure**. Falloff reaches Ember Deep `#A9441C` at the edge |
| **Rim** | Separation, cold side and warm side | Cold Rime `#A5CDE3` rim on the side away from the warm source. Warm rim on the lantern side. Rim width 3–4% of figure height. In engine, material rim (0.25–0.35) plus an unshadowed low-energy back directional (0.3) |

Rules:
1. **Warm is small, cool is large.** Warm family 15–30% of image area, cold/neutral 65–80%, violet under 5% (§2.2).
2. **Shadow colour.** Snow shadows are Glacier or Deepice. Pure Magpie Black only in interiors, magpie markings and the Underheart void.
3. **No mid-temperature white light.** Every light is a palette hex. Light colour multiplies albedo, so author albedo slightly brighter than the target render (see §2.4).
4. **Tonemap and exposure (defaults):** Filmic, exposure 1.0, white point 6.0. No bloom on web. Fake glow with additive halo cards and emissive materials. Pre-renders may use real bloom at 0.15 strength, capped so it never leaves the palette.
5. **Ambient occlusion:** baked into the AO channel of the ORM map (§4.1) and into vertex colour for environment kits. No screen-space AO on web.
6. **Vignette:** capped at 25% darkening, never reaching pure black. This prevents baked-in black bars.
7. **Fog:** height fog tinted Rime or Glacier outdoors. Density 0.005–0.02 (default). Fog colour is always a palette hex.
8. **Hero stills (pre-rendered):** the setup above, plus depth of field at f/2.8 equivalent on the background only. Focal plane on the figure's face or lantern.

### 2.4 Palette audit for renders (new for 3D)
Lighting shifts colour, so audit the **render**, not the textures.
- **Violet check:** count pixels with hue 250°–290° and saturation above 25%. Must be under 5% of the composed image.
- **Warm check:** pixels in the 15°–45° hue band with value above 35% must be 15–30% (hero images).
- **Drift check:** quantise the render to the 22 hexes plus their lit and shadow ramps. More than 8% of pixels farther than ΔE 18 from any palette ramp fails (default threshold). Teal-cyan, green and magenta drift are the usual cause.
- Run the audit on the final composed asset (card, screen, hero crop).

### 2.5 Clock stages [src: five stages]
All numbers are defaults. In 3D they drive a global shader parameter `clock_stage` (0–5): frost overlay on materials, warm light energy scale, and a saturation grade.

| Stage | Frost creep on UI border | Warm pool size | Saturation | Notes |
|---|---|---|---|---|
| Zero | 0% | 100% | 0% | Clean frame |
| Hoarstep | 10% | 90% | -5% | Frost at dawn, rime on window edges |
| Glasswater | 25% | 75% | -10% | Rivers read as glass, hard reflections (water roughness drops to 0.1) |
| Long Hush | 45% | 60% | -20% | Outdoor scenes drop contrast, no motion streaks, quiet |
| Stillmarrow | 65% | 45% | -30% | Figures can be shown frozen mid-step |
| Last Bell | 85% | 30% | -40% | Hearth is the only warm shape left |

Frost creep never covers text, buttons or the focal zone. In 3D, frost is a normal-map and albedo overlay (Frostglass, roughness 0.3) blended by `clock_stage` with a world-up mask, so it collects on upward faces first.

---

## 3. Shape language, materials, phone readability

### 3.1 Shape language

| Subject | Shape rule |
|---|---|
| Homestead and people | Rounded-square masses, heavy timber, chamfered corners, vertical rectangles for figures |
| Hunt realm | Long diagonals (antler, herd roads), pine triangles in repeated rows |
| Cold and the Pitchfrost | Hexagonal crystals and layered flat courses (the Rimeward is poured in layers) |
| Light and Leylit | Spheres and teardrops with a trailing wisp |
| Gravesworn | Long narrow triangles and ribs |
| The Churn | Open, unfinished edges, thread-like unravelling, meshes that stop mid-line |
| Magpie Light | Tall tapered cylinder with bold stripes |
| Necrotic | Spiked burr and curling smoke, small and sharp |
| Hex board | Pointy-top hexagon prism. Default tile footprint 256 × 296 px in screen space (width 256, height 256 × 2/√3) |

### 3.2 Materials and rendering rules (replaces the old ink-contour rules)
- **Characters:** **no ink contour.** Separation comes from value contrast and the cold/warm rim light (§2.3). Optional for tokens at 96 px or smaller: a 1.5 px Nightfrost inverted-hull edge, default off, test first.
- **Proportions (stylised):** head about 105% of true scale, hands and boots about 110–115%, chunky silhouettes, simplified fingers. Sculpted bevels everywhere, minimum bevel 1.5% of the object's largest dimension, so edges catch the key light.
- **Material families (roughness / metal, defaults):** snow 0.80 / 0; poured ice 0.15–0.30 / 0; timber and hide 0.70–0.85 / 0; wool and fur 0.90 / 0; stone 0.75 / 0; bone 0.55 / 0; feldspar scales 0.35 / 0; Brass 0.40 / 1.0; iron and Slate gear 0.55 / 0.8; lantern glass 0.20 / 0 plus emissive.
- **Metal** is allowed only on Brass, iron and lantern frames. All other materials are dielectric.
- **Emissive** is allowed only on: lanterns, ember, hearth, Ani, lens and beam, the Gravesworn's chest ember, the Fizzlet's arcs, Geodehall crystals, the Hushcube's cracks, icon cores. Emissive colours are palette hexes.
- **Value steps:** keep large forms to three readable value steps (light, mid, shadow) plus one accent glow. Detail smaller than 1.5% of figure height is dropped.
- **Surface grain:** one shared soft, felt-like grain normal at 2% of texture width on all assets, so everything looks made by one hand.
- **No text, numbers, logos or watermarks inside generated or rendered art.** All lettering is set in engine.

### 3.3 Readability at phone size (defaults)
- **Silhouette test:** every character, creature and prop must be identifiable as a flat black silhouette at **64 px tall**, from the game camera and from the descriptor-sheet side view.
- **Token size:** board tokens are rendered or shown at 64–96 px. At 64 px the head is at least 1/6 of figure height.
- **Value contrast:** subject versus background at least 30 L\* apart.
- **UI text contrast:** 4.5:1 or better. Icon-to-background contrast 3:1 or better.
- **Minimum on-screen text:** 12 px at the smallest displayed size. Minimum icon 24 px for damage icons, 32 px preferred.
- **Touch targets:** 48 px minimum.
- **Colour per character:** no more than 2 hue families plus neutrals. Do not rely on colour alone to tell damage types or rarities apart. Shape carries the meaning.

### 3.4 Hero art canvas and safe zones (phone full bleed)
- **Portrait master:** **1440 × 3360 px (9:21)**. Render at 2880 × 6720 where the tool allows, then downsample. Fill the whole canvas. No empty or letterboxed edge.
- **Cover-fit only:** the engine fills the screen by **cover**, never contain. There are no black bars at any aspect ratio. In 3D, a camera that renders the master aspect is cropped, never letterboxed. Keep a **15% overscan** of real scene around the 9:16 core so every crop is filled with geometry, never a stretched edge.
- **Centred crops from the master:**

| Device ratio | Crop size | Top offset |
|---|---|---|
| 9:21 | 1440 × 3360 | 0 |
| 9:20 | 1440 × 3200 | 80 |
| 9:19.5 | 1440 × 3120 | 120 |
| 9:16 | 1440 × 2560 | 400 |

- **9:16 core:** everything essential sits inside y 400–2960.
- **Focal zone (default):** x 108–1332 (7.5% side margins), y 592–2672. This leaves 192 px at the top of the narrowest crop for the status area and 288 px at the bottom for the home indicator and button row.
- **Face height:** the face or key focal point is centred at y 1000–1500.
- **Edge check (QA):** the outer 16 px strip on each side must show rendered detail. A uniform dark or light strip of 4 px or more fails.
- **Landscape companion:** hero art that also appears on desktop gets a separate **3840 × 2160** camera setup, not a crop of the portrait.
- **Export:** WebP, quality 85 (default). Atlas pages at most 2048 × 2048 for browser mobile safety (default).

---

## 4. 3D production specs (all defaults, mobile-web friendly, Godot 4 export)

### 4.1 PBR texture set and packing
| Map | File suffix | Colour space | Content |
|---|---|---|---|
| Albedo | `_alb` | sRGB | Palette-derived colour. Alpha only for cutout foliage and frost cards |
| Normal | `_nrm` | Linear | **OpenGL convention (Y+)**, as Godot expects. Tangent space |
| ORM packed | `_orm` | Linear | **R = ambient occlusion, G = roughness, B = metallic** (Godot's packed channel layout) |
| Emissive | `_emi` | sRGB | Only for assets that need it (§3.2). Skip the file otherwise |

- Three texture reads per material is the default ceiling (albedo, normal, ORM). Emissive is a fourth only when needed. Flat-colour props may drop the normal map.
- **Environment kits** use vertex colour for large-scale AO and tint, and share trim sheets.
- **Texel density (defaults):** characters **512 px/m** (a 1.9 m figure spans about 1000 px of a 1024 map, so one 1024 map holds a full body at the mobile tier). Hero props 1024 px/m. Environment near props 256 px/m. Terrain and ground 128 px/m. Trim sheets 256 px/m. Keep density within ±20% inside a scene so grain reads the same.
- **Texture sizes (power of two):**

| Asset class | Mobile tier | Desktop tier |
|---|---|---|
| Hero character (full body) | 1024 | 2048 |
| Face close-up map (hero cameras only) | 512 | 1024 |
| Mid character, child, creature | 1024 | 2048 |
| Hero prop (lantern, Hushcube, lens) | 1024 | 2048 |
| Small prop | 256–512 | 512–1024 |
| Environment kit atlas or trim sheet | 2048 | 2048 |
| Terrain tile (tileable) | 1024 | 2048 |
| Icon renders | 256 master | 256 master |
| Hero stills | 1440 × 3360 | 3840 × 2160 |

- **Memory budgets (defaults):** at most 64 MB of compressed VRAM textures per gameplay scene and 96 MB for a hero scene. First-load download target under 25 MB for the web build, with realms loaded on demand. Import with VRAM compression and mipmaps on. Normal maps import as RG-compressed.
- **Mesh format:** glTF 2.0 binary (`.glb`), Y up, 1 unit = 1 metre, applied transforms, triangulated on export, forward axis −Z (Godot convention). Max 4 bone influences per vertex. Vertex colours only where noted.
- **Shadows (web, defaults):** the key directional is the only shadow caster, 1 cascade for fixed-camera scenes, 1024 map. Lantern omni lights do not cast real shadows on mobile. Use baked contact shadows (AO) and a soft blob decal under figures.
- **Lights per scene (defaults):** 1 directional key, 1 back rim (no shadow), at most 4 dynamic omni lights, at most 2 touching one object. Everything else is emissive material or additive halo cards.
- **Scene budgets (defaults):** gameplay scenes 150,000 visible triangles and 120 draw calls. Hero and title scenes 250,000 triangles and 160 draw calls. At most 300 live particles per scene.

### 4.2 Polycount budgets (triangles, LOD0, defaults)

| Asset | LOD0 mobile | LOD1 | LOD2 | LOD3 |
|---|---|---|---|---|
| Hunter, Snow Crowned Tracker, Hearth Father, Gravesworn | 12,000 | 6,000 | 2,500 | impostor quad |
| Hollow Regent (coat cloth included) | 14,000 | 7,000 | 3,000 | impostor quad |
| Eldest Child, Middle Child | 9,000 | 4,500 | 2,000 | impostor quad |
| Youngest | 8,000 | 4,000 | 1,800 | impostor quad |
| Mother Aspect | 20,000 | 10,000 | 4,000 | impostor quad |
| Ani (core sphere, halo cards, wisp ribbon) | 600 | 300 | 120 | single billboard |
| Fizzlet (core, arc spikes, tail ribbon) | 1,500 | 800 | 300 | single billboard |
| Churnglint (eye, shard body) | 2,500 | 1,200 | 500 | single billboard |
| Old Beast, per modular part (head 25,000; flank section 20,000; back ridge 12,000; tooth-groove gallery wall 8,000) | as listed | 50% | 20% | none (parts are never far) |
| Frost raider, Nightburr thrall, slide beast, frost thrall | 5,000 | 2,500 | 1,000 | impostor quad |
| Hero prop (Warding Lantern 3,000; Hushcube 1,500; Needlesphere ring set 4,000; lens 2,500) | 1,500–5,000 | 50% | 20% | none |
| Small prop (tools, barrels, signs) | 150–800 | 50% | none | none |
| Environment kit piece (wall, floor, fence, arch) | 200–2,500 | 50% | 20% | none |
| Tree (pine, antler arch) | 500 | 250 | billboard | billboard |
| Cabin (hero building) | 6,000 | 3,000 | 1,200 | box |
| Town cottage (Rimmerdale, Ten Hearths) | 2,000 | 1,000 | 400 | box |
| Magpie Light lighthouse set piece (§10) | 18,000 total | 8,000 | 2,500 | silhouette quad |
| Hex tile with decor | 800 | 400 | 150 | none |
| Board token (live 3D) | 3,000 | 1,500 | 600 | sprite |

- **Desktop tier** uses about 2× these budgets and 2× texture size. Author the mobile tier first and derive the desktop tier.
- **LOD switch (defaults, screen height fraction):** LOD0 over 40%, LOD1 15–40%, LOD2 5–15%, LOD3 under 5%. Use Godot's automatic mesh LOD plus visibility ranges for kits.
- **Board tokens** may also ship as 256 px pre-rendered turntable sprites (8 angles) instead of live meshes. Default: live mesh up to 24 tokens on screen, sprites beyond.

### 4.3 Camera and render defaults
- **Hero portrait camera:** 40–50 mm full-frame equivalent, eye height, pitch 0 to −5° (Hunter: +3° low angle). For a 9:21 render, vertical FOV about 40° (default), checked against the overscan rule in §3.4.
- **Wide realm shots:** 28–35 mm equivalent, camera height 1.2–1.6 m, horizon placement per §9.
- **Descriptor sheets:** orthographic front, side and back, then a 3/4 view at 35° yaw. Neutral Nightfrost-to-Glacier gradient backdrop, key light as §2.3. Sheet canvas 4096 × 2560.
- **Board and homestead cameras:** perspective, 35° pitch down, 25° FOV (default), fixed. A phone zoom mode for 12 × 12 grids is an open question.

---

## 5. Character descriptor sheets (3D)

**Sheet format (default):** canvas 4096 × 2560. Orthographic front, side and back turnaround at one scale, a 3/4 beauty view, and an expression row of 6 on the head (neutral, alert, warm, afraid, resolve, tired). Beings with no face use a mood-state row instead. A flat-colour **silhouette strip** at 64 px sits in the corner for the §3.3 test. Heights below are defaults (scale: Hunter = 1.90 m = 1.00) pending §15.

| Role | Height (m / relative) | LOD0 budget (§4.2) |
|---|---|---|
| Hunter | 1.90 / 1.00 | 12,000 |
| Snow Crowned Tracker | 1.75 / 0.92 | 12,000 |
| Hearth Father | 1.88 / 0.99, heavier | 12,000 |
| Gravesworn | 2.00 / 1.05 | 12,000 |
| Hollow Regent | 2.09 / 1.10 | 14,000 |
| Eldest Child | 1.52 / 0.80 | 9,000 |
| Middle Child | 1.33 / 0.70 | 9,000 |
| Youngest | 1.05 / 0.55 | 8,000 |
| Mother Aspect | shoulder 1.9, length 4.75 | 20,000 |
| Churnglint | 0.57 / 0.30 | 2,500 |
| Fizzlet | 0.38 / 0.20 | 1,500 |
| Ani | core 0.23 m, halo up to 0.95 m | 600 |
| Old Beast | at least 38 m (20×), shown in parts | modular |

### 5.1 The Hunter (player)
- **Silhouette:** tallest human figure, about 7.5 heads. Vertical rectangle with a broad hide coat and a single flat-top hat or hood. Reads as a straight upright block.
- **Key features:** tall, rugged, short dark hair (Magpie Black), weathered face, hide and wool layers, antler-handled hunting kit. Fully human. Chunky stylised hands and boots.
- **3D materials:** coat Hide with wool-trim roughness 0.9, Slate iron fittings (metal 0.8), antler handle Bone, lantern Brass with a Lantern Gold emissive core.
- **Palette:** Hide and Cinder for clothes, Slate for gear, Ember Amber for the carried lantern, Rime rim light.
- **Do:** show him in the warm pool of his own lantern. Show practical hunting gear.
- **Never:** bat form, wings, fangs, animal ears, claws, shapeshifting, or bat motifs on gear, cloak edges or heraldry. No animal features of any kind.

### 5.2 The Snow Crowned Tracker
- **Silhouette:** slimmer than the Hunter, with a bright white hair-crown shape above the head.
- **Key features:** white hair worn up like a crown (default reading of "Snow Crowned"). A gloved hand that traces tracks. Light snowshoes. Reads snow like script, so show finger-tracing on snow.
- **3D materials:** hair as chunky sculpted strand clumps (not cards) in Magpie White and Frostglass, roughness 0.7. Coat Deepice and Glacier wool. One Ember Amber lantern clip (metal 0.6).
- **Variants:** possessed (rime across the eyes as a frost overlay, flat hush expression, no violet) and frost thrall (rime-covered, held still, frost overlay at 100%).
- **Do:** make her the "reader" of the scene, looking at the ground.
- **Never:** red eyes, fantasy tiara, or any animal feature.

### 5.3 The Mother Aspect
- **Silhouette:** young four-legged dragon, rounded and compact, with a long neck and folded wing-cases. About draft-horse size.
- **Key features:** young glimmerhusk. **Moon-pale feldspar scales** with a pearl sheen. A warm glow in the throat and breath. Protective, mothering stance. Newly hatched, so the head is slightly large for the body.
- **Wings (default):** folded **husk plates**, layered overlapping feldspar plates that fan open like a beetle's cases, with **no skin membrane**, so they never read as bat wings. Open span about 1.6× body length.
- **3D materials:** scales are overlapping plates in the normal map with a 0.35 roughness ORM, Moonscale albedo, Scale Shade in the plate gaps, and a Rime fresnel sheen from the material rim (no iridescence shader on web). Throat emissive Lantern Gold, breath edge Ember Amber.
- **Palette:** Moonscale with Scale Shade, Rime sheen, Lantern Gold breath glow and Ember Amber breath edge.
- **Do:** show her between a danger and the homestead. Show warm breath thawing frost (the frost overlay retreating).
- **Never:** bat-style wings or membrane, red or black scales, an adult elder look, or violet anywhere.

### 5.4 Ani
- **Silhouette:** a drifting teardrop of light with a trailing wisp tail. No limbs and no body.
- **Key features:** a will light that goes from quartz white to amber with mood. Core diameter about 0.12 of Hunter height, with a halo up to 0.5.
- **3D build:** an unlit emissive core sphere, an additive camera-facing halo card, and a ribbon wisp tail. It casts a real omni light (the scene's warm source when present). No mesh body, no face, no eyes.
- **Mood map (default):** calm is Quartz White. Curious is Lantern Gold. Stubborn is Ember Amber. Lonely is a dim Ember Deep with a smaller halo. Resolve is Quartz White with a sharpened core.
- **Palette:** Quartz White, Lantern Gold, Ember Amber, Ember Deep. Ani is the brightest value in any image.
- **Do:** express emotion through colour, halo size and wisp shape. Give the sheet a mood-state row instead of faces.
- **Never:** humanoid body, a face, or violet. Do not assign a pronoun in art notes. The sources set none.

### 5.5 The Hearth Father **[owner: defaults approved]**
- **Silhouette:** broad and solid, about 1.0 height but heavier. A square, planted figure.
- **Key features:** seasoned hunter. Weathered, grey at the temples and a trimmed beard. Heavy coat. Always at or in the cabin during raids, at a window or door, shutters closed.
- **3D materials:** heavy wool coat roughness 0.9, Hide and Cinder, Slate fittings, Ember Amber window light as his key.
- **Portrait:** a framed bust of him is the fright signifier. It is a 3D prop (timber frame, Brass corner studs, a sculpted bust relief) lit by the window slit. It exists as an in-world prop and as a UI badge render (open question 4).
- **Do:** show him fixed at the cabin, as a defender.
- **Never:** show him leaving the cabin during a raid.

### 5.6 The Gravesworn
- **Silhouette:** tall, angular, long narrow triangles. A visible rib cage with a hunter's hood or antler cap. About 1.05 height.
- **Key features:** undead barrow hunter. **Frost in the ribs**: layered rime shaped like the Rimeward's poured courses. **Ember in the chest**: a glow that stands for Ani's ember. Weathered old hunter gear and bone.
- **3D layers:** rib cage mesh in Bone (roughness 0.55), up to three stacked **rime shell** meshes over the ribs (frost level 0–3), and a chest ember cavity with an emissive coal and a small omni light.
- **Ember readout (default):** 3 embers is full amber glow, 2 is half, 1 is a small coal, 0 is a dark coal. The foe state keeps the same figure with rime climbing over the chest. Never use violet for foe state. Parameters are in §6.2.
- **Palette:** Bone, Slate, Cairn Grey, Rime and Frostglass for frost, Ember Amber and Ember Deep for the ember.
- **Do:** show the ember as the warm focal point.
- **Never:** red eyes, purple armour, skull trophies, or a bloodied sword. Eye sockets carry a faint Rime pinprick only.

### 5.7 The Fizzlet **[owner: defaults approved]**
- **Silhouette:** a round fuzz-ball of static with 6–8 spiky arcs and a short trailing tail. About 0.2 height.
- **Key features:** crackling static sprite. Carries messages through frost and sparks fires. Overfed state: swollen and bright, with a hairline crack of light ("blows up if overfed").
- **3D build:** a soft emissive core, 6–8 arc spikes made of thin camera-facing ribbons that flicker, and a 4-bone tail ribbon. The message ribbon is a separate trail effect.
- **Palette:** Frostglass and Rime body, Lantern Gold sparks, Quartz White at the arc tips.
- **Do:** keep it small and readable. Show messages as a trailing ribbon.
- **Never:** a face with mouth or teeth, or violet. A Pebblefold cosmetic is out of v1.

### 5.8 The three children (safe homestead scenes only) **[owner: defaults approved]**
- **Eldest Child** tends the forge. **Middle Child** keeps the stores. **Youngest** talks to the Fizzlet and listens to the ice.
- **Silhouette and size (defaults):** relative heights 0.80, 0.70 and 0.55 of the Hunter. Bundled winter clothes, round hat shapes. No visible aging until the epilogues.
- **Key features:** Eldest has a leather apron and a burnt thumb wrap. Middle has a ledger and a ring of keys. Youngest keeps the Fizzlet close and has bare mittens and a tilted head.
- **3D build:** the same humanoid rig as adults (§6.1) with child proportions: head about 125% of true scale, bigger relative hands. Wool and leather roughness 0.9.
- **Palette:** Hide, Cinder, Ember Amber work light, Glacier and Rime for outer clothes.
- **Do:** show them at the forge, in the cellar or stores, by the hearth, at a window in safe scenes. The Youngest speaks the counter oath **at the hearth beside the Tithe Chest** (a safe scene, never raid art).
- **Middle Child's sled beat:** show only the **loaded sled leaving the yard**, never a child on the road.
- **Never:** show them in a raid or a combat scene, in danger, injured or bloodied, or on the road away from the homestead. Never show children's silhouettes behind the shutters in a raid.
- **Fright signifier (all raids):** a cabin window with closed shutters, one thin Ember Amber slit of light, and the **Hearth Father's portrait** (framed bust) beside it or as a UI badge. No child is shown, implied or silhouetted.

### 5.9 The Churnglint **[owner: defaults approved]**
- **Silhouette:** a small hovering ice-sprite body about 0.3 height, with a single large eye. Slightly asymmetric and unfinished at one edge.
- **Key features:** chaos eye avatar in ice sprite form. It hovers over the Tithe Chest. Trades riddles for warmth.
- **3D build:** a large eye sphere (Magpie Black pupil, Ember Amber iris ring) inside a ring of loose ice shards. One shard edge is an open, unfinished boundary (the Churn look). Colours may sit in "wrong" places (see §9, the Churn).
- **Palette:** Frostglass and Rime body, an Ember Amber iris ring, and Magpie Black pupil.
- **Do:** make the eye the focal point and the body fragile.
- **Never:** horns, bat wings, a copy of any existing creature, or tentacles.

### 5.10 The Hollow Regent **[owner: defaults approved]**
- **Silhouette:** tall, thin keeper figure in a long coat, about 1.1 height. The coat has a hollow chest cavity where a lantern should hang.
- **Key features:** master of Duskmarrow and first keeper of the Magpie Light. Magpie black and white keeper's coat, worn and old. An unlit lantern in the hollow. Tiny cold violet smoke at the seams.
- **3D build:** sculpted cloth coat with a secondary cloth bone chain. The chest cavity is a real hole in the mesh with a dark inner shell (Magpie Black) and an unlit Brass lantern prop. Violet smoke is a small particle effect plus seam emissive, about 2% of the figure.
- **Palette:** Magpie Black and White, Nightfrost, Slate, Brass trim. Violet only at seams.
- **Do:** show the figure as sorrowful and dignified. Hint at the keeper role through the coat and lamp.
- **Never:** a monster or skull face, or a violet-filled figure. No gender is stated in the sources, so write around it.

### 5.11 The Old Beast **[owner: defaults approved]**
- **Silhouette:** a vast, low, rounded grazer fused with bedrock. A long slow head lowered to the stone. At least 20× Hunter height, so it never fits a phone frame whole.
- **Key features:** ancient grazer of stone, no villain. Mineral ridges on the back, teeth grooves in the stone, clouded failing eyes (its eyes are going blind **[src: story-complete]**).
- **3D build:** modular static parts (§4.2) that blend into bedrock with a shared stone material and vertex-colour blend, so the join with the floor is invisible. A lantern prop is always in frame for scale.
- **Palette:** Cairn Grey, Slate, Cinder, Bone. Faint Ember Amber only in the clouded eyes and small crack glows.
- **Do:** show it in parts (head, flank, tooth grooves) with a lantern for scale.
- **Never:** make it a monster or jailer figure. No horns, no red eyes, no violet.

### 5.12 Creature families (quick notes, full sheets later)
- **Frost raiders:** poured, not born. Hex-faceted ice figures with tracks pointing backward. Cold blues only. Ice roughness 0.2.
- **Nightburr thralls:** burr-husk bodies burning violet at the seams. Violet cap still applies (§2.2).
- **Slide beasts:** herd animals unmoored by the drift. Antlered and panicked, not malicious.
- **Frost thrall:** a person frozen mid-step, rime over the eyes.
- **Pitchfrost [owner]:** weather only, never a creature. Art is frost script on glass and glass-still landscapes, driven by `clock_stage`. It has no body, face or form at any stage.

---

## 6. Rigging notes (defaults)

### 6.1 Humanoid standard (Hunter, Tracker, Hearth Father, Gravesworn, Hollow Regent, three children)
- **One shared humanoid skeleton**, mapped to Godot's humanoid bone profile through a `BoneMap`, so animations retarget across all humanoid roles. Child roles use the same bones with a different rest scale. Retarget from a T-pose rest (arms out, palms down). If a CC0 animation library is used as a motion reference, retarget it through the same `BoneMap` and check the foot-contact height.
- **Bone count budget:**

| Region | Mobile tier | Bones |
|---|---|---|
| Core body | root, hips, 3 spine, neck, head, 2 shoulders, 2 upper arms, 2 forearms, 2 hands, 2 upper legs, 2 lower legs, 2 feet, 2 toes | 23 |
| Hands | **mitten-plus-thumb:** 2 bones per hand (thumb chain and a combined finger block) | 4 |
| Face (hero cameras only) | jaw, 2 brows, 2 upper lids, 2 lower lids, 4 mouth corners and lips | up to 12 |
| Secondary | coat or cloth tails, hair mass, hat, lantern swing, scarf | up to 8 |
| **Total hero rig** | | **≤ 56** |
| **Total mid-distance rig (LOD1)** | no face bones, hands as one block each | **≤ 32** |

- **Finger limit:** the mobile tier never exceeds 2 deform bones per hand (thumb and finger block). Full five-finger rigs (15 bones per hand) are desktop tier only and only for the Hunter, Tracker and Hearth Father. Chunky mittened hands read better at phone size anyway.
- **Face limit:** hero close-ups use 6 expression blend shapes (neutral, alert, warm, afraid, resolve, tired) plus blink and jaw-open, 8 shape keys in total, no more. Mid and far LODs drop shape keys and face bones. Faceless roles (Ani, Fizzlet) have none.
- **Skinning:** max 4 influences per vertex, weights normalised. A forearm twist bone only if needed (counts against the secondary budget).
- **Base animation set (defaults):** idle (3 variants), walk, run, work loops (forge, ledger, hearth), lantern raise, flinch (adults only), defend-at-window (Hearth Father). 30 fps, exact loops, root motion off.

### 6.2 Special rigs

| Role | Rig |
|---|---|
| **Ani** | **No skeleton for a body and no face.** A root node with three parts: emissive core, additive halo card, and a wisp ribbon driven by a **6-bone chain** (`wisp_01` to `wisp_06`) plus shader parameters: `mood_color` (a palette hex), `core_size`, `halo_scale` (1.0 to 4.0 times the core), `core_sharp` (0–1), `bob_amp`. Mood map in §5.4. No eyes, mouth or limbs may appear through any parameter. |
| **Gravesworn** | Humanoid standard plus a **rib set** parented rigid to the chest bone (no deform). Parameters `frost_level` 0–3 (0 clean bone, 1 rime on lower ribs, 2 rime to mid ribs, 3 rime climbing over the chest; foe state is level 3 over the ember) and `ember_level` 0–3. **Ember levels:** 0 = dark Cinder coal, emission 0, light off. 1 = small Ember Deep coal, emission 0.6, light energy 0.2, 25% of the cavity. 2 = Ember Amber at half the cavity, emission 1.5, light energy 0.6. 3 = full Lantern Gold to Ember Amber glow, emission 2.5, light energy 1.2. The chest ember is the image's warm source when present. Rime shells are static meshes with an alpha-free frost albedo, so there is no sorting cost. |
| **Mother Aspect** | Quadruped creature rig: root, hips, 5 spine, 6-bone neck, head, jaw, 8-bone tail, 4 legs × 4 bones (thigh, shin, foot, toe). **Wing-cases:** per side 1 shoulder, 1 arm, and 5 plate-fan bones that rotate like a hand fan (plates overlap, no membrane, no stretching). Throat glow parameter `breath_level` 0–1. **Total ≤ 64 bones.** Scale plates are texture and normal map, not geometry. |
| **Fizzlet** | No body skeleton: a sphere core with a shader that pulses spikes. Arc spikes are 6–8 separate ribbon meshes with random-phase flicker. Tail is a **4-bone chain**. Parameters `charge` 0–1 and `overfed` 0–1 (swell up to 1.8×, hairline crack emissive at 0.8 and above). |
| **Churnglint** | 8 bones at most: eye root, 6 shard bones with slow independent bobbing, 1 iris bone. One shard is deliberately unclosed. |
| **Old Beast** | Not a character rig. Modular static meshes plus a **12-bone spine and neck chain** for very slow breathing and head-lowering (cycle 12 s or longer). Eye clouding is a material parameter `eye_cloud` 0–1. Never rig it to walk. |
| **Thralls and frost thrall** | Use the humanoid or creature standard rig. Thralls freeze by pausing animation and raising `frost_level`. |

---

## 7. Card frame spec (3D)

**Canvas (unchanged positions):** 5:7 portrait, master **1500 × 2100 px**, with a 36 px bleed (generation canvas **1572 × 2172**). Corner radius 56 px. Text safe inset 60 px from the trim.
**Display scale check:** a hand card shown 336 px wide is scale 0.224. Name text 72 px becomes 16 px. Rules text 54 px becomes 12 px, which is the floor.

**Two delivery modes (owner choice, default A):**
- **A. Flat frame over a 3D art window (default).** The frame is a flat 1500 × 2100 image rendered once from a 3D model (a Nightfrost slab with bevelled edges lit from the upper left, Magpie White keyline raised 6 px). The art window is a transparent hole, with the pre-rendered 3D art image behind it. Rules text, name and numbers are set in engine over flat, matte panels. Cheap, crisp and consistent.
- **B. Frame as a rendered 3D object.** Used only for the card inspect view and hand-fan tilt: a 12-triangle slab mesh with the frame texture set (albedo, normal, ORM at 1024 × 1432 mobile tier, 2048 × 2867 desktop tier), real light from the upper left, and slight parallax on the art window. Text still lives in a flat overlay quad so it stays sharp.
- Positions, sizes and text rules are identical in both modes.

### 7.1 Element positions (at 1500 × 2100, origin top left)

| Element | Position and size | Notes |
|---|---|---|
| Name bar | x 90–1410, y 90–220 (1320 × 130) | Name in one line, 72 px, auto-shrink to 56 px minimum. Text area x 270–1380. Flat matte band, bevel only at the outer edge |
| Mana gem | Circle 140 px, centre (160, 160) | **Top left**, so it stays visible in a fanned hand. Holds 0–10 (two digits **[src: mana max 10]**), 64 px bold. A faceted gem with an emissive core (Glacier by default), digits set in engine on top |
| Art window | x 90–1410, y 245–985 (1320 × 740, about 16:9) | Pre-rendered 3D art. Generate at **1584 × 888** (1.2× bleed) and crop centre. Inset bevel of 6 px around the window |
| Type line | x 90–1410, y 1010–1100 (1320 × 90) | Type text 54 px, x 120–1290 |
| Attunement mark | 70 × 70 px, centre (1355, 1055) | At right end of the type line. Present only on items that require attunement |
| Rules box | x 90–1410, y 1125–1895 (1320 × 770) | Inner padding 40, so text area 1240 × 690. Rules text 54 px minimum, line height 67 px. **Flat matte field**, no emboss or noise stronger than 4%, so text keeps 4.5:1 |
| Damage icon | 80 × 80 px at x 120, y 1922 | Footer strip y 1915–2010. Dice text 56 px beside it at x 215 |
| Rarity pip | 64 × 64 px, centre (1322, 1962) | Right end of the footer strip |
| Bottom margin | y 2010–2100 | Empty frame |

### 7.2 Frame rules
- **Frame material (3D):** Nightfrost slab, roughness 0.7, metal 0, with a Magpie White raised keyline of 6 px. Item cards add a Brass trim of 8 px (metal 1.0, roughness 0.4). The frame never changes with rarity. The pip carries rarity.
- **Bevel and light:** bevel 6 px on outer edges, highlights on the upper-left edges in Frostglass, shadows on the lower-right edges in Magpie Black at 40%. Baked once from the §2.3 key. The same light direction applies to every card, icon and button.
- **Card-kind tint on the name bar (default):** ability is Glacier, warmth is Ember Amber, response is Slate **[src: kinds ability, warmth, response]**.
- **Attunement mark:** an open ring with an Ember Amber dot in the gap, rendered as a small raised Brass ring with an emissive dot. It reads as a lit wick, not a lock.
- **Rarity pips (shape plus colour, raised 3D tokens):** starter is a hollow circle in Rime, wondrous is a diamond in Lantern Gold, quest is a diamond split Magpie Black and Magpie White **[src: starter, wondrous, quest]**. More tiers are reserved (see §15).
- **Art window:** full bleed inside its rectangle. No black bars. Art content stays 60 px inside the window edges for the name bar and gem overlap.
- **Rules text capacity (default test):** about 45 characters per line at 54 px, about 10 lines.
- **Violet:** the frame has none. Violet on a card comes only from the art window or the Necrotic icon, and the whole card stays under 5%.

### 7.3 The 13 damage icons (embossed, 3D-lit)

The sources define all **13** damage types **[src: Handoff §3 lists 13]**. Draw **Cold first, then Necrotic**, then the rest in alphabetical order.

**Build:** each icon is a small 3D object (an extruded, bevelled glyph on a round Nightfrost medallion) rendered at **256 × 256 px** with the §2.3 key from the upper left and a 4 px drop shadow to the lower right. Emboss height 10% of icon width. Medallion rim in Magpie White. **Emissive** cores are allowed where noted. Export sizes 96, 48 and 32 px, re-rendered from the 3D scene at each size with a simplified bevel, not only downscaled. Minimum display 24 px. Icons are distinguished by shape first, colour second. A 4 px Frostglass keyline around the medallion keeps them readable on dark panels.

| # | Type | Shape (silhouette) | Main palette | Emissive core |
|---|---|---|---|---|
| 1 | **Cold** | Hexagonal rime crystal with six short spurs | Rime, Frostglass, Deepice | Yes, soft Frostglass |
| 2 | **Necrotic** | Spiked burr seed with a curling smoke wisp | Cold Violet, Violet Shadow, Violet Mist | Yes, small Violet Mist |
| 3 | Acid | Teardrop with a bitten notch and two drips | Bone, Ember Amber | No |
| 4 | Bludgeoning | Mallet head, three-quarter view | Slate, Cairn Grey | No |
| 5 | Fire | Single tall flame with a small inner flame | Ember Amber, Lantern Gold | Yes |
| 6 | Force | Concentric rings with a solid centre dot | Glacier, Frostglass | Yes, centre dot |
| 7 | Lightning | Forked bolt with a short fork | Quartz White, Lantern Gold | Yes |
| 8 | Piercing | Narrow arrowhead pointing down-left | Cairn Grey, Magpie White | No |
| 9 | Poison | Teardrop with a small pair of fang marks | Bone, Slate | No |
| 10 | Psychic | Spiral with an eye-shaped notch | Frostglass, Deepice | Faint |
| 11 | Radiant | Eight-ray burst around a disc | Lantern Gold, Quartz White | Yes |
| 12 | Slashing | Three parallel diagonal claw cuts | Magpie White, Slate | No |
| 13 | Thunder | Bell shape with two sound arcs | Brass, Frostglass | No |

- Acid and Poison use no green. The palette has none (see §15).
- Violet appears only in the Necrotic icon, in the glyph and its core, never the medallion.
- Emissive glow never leaves the 256 px canvas and never exceeds 12% of the medallion area.

---

## 8. Hushcube item card (3D object)

**Sources:** *Wondrous item, requires attunement.* Cost 7 mana, range 20 ft, one creature, Wisdom save **[src: Apocrypha; where the Handoff and the Apocrypha differ, the Apocrypha wins]**. A cube of grey crystal that holds a sliver of the Ebbing Dark (raw death chill).

**Text for the card (from sources):**
- *Type line:* Wondrous item, with the attunement mark.
- *Stats:* Cost 7. Range 20 ft, one creature. Save Wisdom.
- *Effect:* Target makes a Wisdom save. On failure it is stunned for 1 round and takes Xd8 necrotic damage, where X is the number of Nightburrs on the board (minimum 1).
- *Silence:* On failure, all Hope & Courage effects on the target end and cannot be applied until its next turn ends.
- *Flavor:* Grey crystal holding a sliver of the Ebbing Dark.
- *Footer:* Necrotic icon with "Xd8", wondrous pip.

**Layout check (default):** the stats chip row (80 px), effect (4 lines), Silence (3 lines) and flavor (2 lines) come to about 687 px against 690 px of room. If it overflows, drop the flavor first, never the effect or Silence text.

**The 3D object:**
- **Form:** a grey crystal **cube**, 0.20 m a side, edges chamfered at about 4% of edge length. Faces are slightly uneven, as if cleaved, not machined. Inner fracture planes are visible through the faces.
- **Mesh:** hero prop, **1,500 triangles LOD0**, 1024 × 1024 texture set. A separate **crack mesh** (thin inset channels) carries the emissive cracks. Smoke is a small particle or card system, not geometry.
- **Materials:** body Cairn Grey `#6F7A86`, roughness 0.25, with a Slate inner core visible through the faces. Facet edges catch Rime. Cracks are emissive **Violet Mist `#A592D6`** in a Violet Shadow `#2F2150` channel. Violet is thin lines and a small smoke wisp only.
- **Violet budget:** at most **8% of the art window** (about 2.5% of the whole card). The whole card stays under 5%.
- **Light:** key from the upper left in Frostglass. A small warm Ember Amber rim and one Lantern Gold glint on one facet. Nightfrost field with drifting snow motes. Silence is shown as a tiny cracked bell silhouette in a lower corner, and the cube casts a hush: no sparks, no streaks.
- **Turnaround views (descriptor sheet, 4096 × 2560):** front, back, left, right, top, bottom, 3/4 front-left (hero angle, about 30° yaw and 20° pitch) and 3/4 back-right. Orthographic, same scale, same light. The card art uses the hero angle with a slight tilt.
- **Never:** golden border, starry void background, screaming faces, purple-red energy cracks, violet filling the backdrop, or anything copied from prior renders.

---

## 9. Five realm looks (3D environments)

**Common to all realms:** built from modular kits (§4.2 budgets), the global key in §2.3 unless the realm overrides it, vertex-colour AO, fog tinted from the palette. Hero shots are **9:21 portrait renders** with the §3.4 overscan. Camera defaults are listed per realm.

### 9.1 Palette and light

| | Antlerwild with Rimmerdale | The Churn, eastern edge | Underheart | Geodehall | The Sifting |
|---|---|---|---|---|---|
| **Palette bias** | Cold field 70, warm 25, violet 0–1. Glacier and Frostglass dominant, Hide in timber, Ember Amber from windows and lanterns | Locked ramps with roles swapped **[owner]**: amber shadows, blue highlights, flat unlit patches. Ember Deep as the "copper" accent. Violet 3–5 at soldered seams | Cairn Grey, Slate, Nightfrost, Cinder. Warm family 10–15, Ember Amber only from lanterns | Quartz White, Lantern Gold, Rime inside crystal. Slate rock. Violet only at the Dim Nursery Nightburr, under 3 | Bone, Cairn Grey, desaturated Ember Deep. Frost blues sparse, Glacier at distance. Brass for the Needlesphere |
| **Light setup** | Key as §2.3. Low overcast pale-blue sky. Long Glacier shadows. Lantern pools at windows and herd camps (omni, 1.5–3× figure height). East horizon: the Rimeward's glare as an emissive Frostglass horizon strip and moving slide-fog cards | **No single source.** Two opposing directionals: the key (upper left) at 1.0 and a counter-key from low right at 0.45, so shadows fall two ways. Light also comes up from the ground. Overriding the global key rule is allowed here. About 20% of surfaces use unlit flat-colour materials | Point lanterns only, **falloff within 3 body heights (about 5.7 m)**. Ambient 0, everything beyond is Magpie Black. Ceiling cracks add a faint violet smoke card (under 3%) | Light is emitted by crystals and stacked in walls: up-glow and edge-glow. No sky, no snow, no key directional. Global `charge` parameter 1.0 to 0.2 scales emissive and light energy as charge fades | Flat hazy light: soft low-contrast key (0.8) with wide soft shadows, Bone-tinted fog (density 0.03). Floating dust motes, at most 200. Warm pools small and blurred |
| **Camera and composition** | 35 mm equiv, height 1.3 m, pitch −3°. Portrait: **horizon at y 2200**, tall pines up to the top, one lantern in the lower third (y 2400–2800) | 28 mm equiv, height 1.5 m, pitch 0°, no roll. Portrait: unfinished ground in the lower third, the sky dissolving into open mesh edges at the top | 30 mm equiv, height 1.2 m, pitch +8°. Portrait: ceiling cracks above, lantern and figure small below (figure about 12% of frame height) | 35 mm equiv, height 1.0 m, pitch +10°. Portrait: tall crystal wall, **Ani as the brightest point** in the focal zone (y 1000–1500) | 40 mm equiv, height 1.4 m, pitch −2°. Portrait: dune line low (y 2300), a dust column rising through the upper frame |

### 9.2 Kit pieces (LOD0 triangles)

| Realm | Kit pieces |
|---|---|
| Antlerwild with Rimmerdale | Pine row (500), antler arch (900), palisade segment (300), cabin (6,000), Warding Lantern (3,000), Smokehouse (2,500), Rimmerdale cottage × 4 variants (2,000), Kettlecross market stall (800), Coldharrow gate (1,800), herd-road decal strips, drift snow mound (300), Shedding Yards antler pile (600), Fork Hollow sinking-bowl terrain tile, Rimeward ice-ring hex columns (1,200 each) |
| The Churn, eastern edge | Fraying Shelf edge strip (open-boundary mesh, 600), thread-bundle cluster (400), Thoughtpool well ring (900), Driftmeadow torn plate (1,500), Seam Mender string span (200), soldered seam with Nightburr (1,200), flat unlit slab (150) |
| Underheart | Tunnel straight (1,200), corner (1,400), Chewstone gallery wall with tooth grooves (2,500), Ceiling Seal vault (3,000), mortar band (400), ceiling crack with smoke card (500), stone shelf (600), partial Old Beast head (25,000, hero only) |
| Geodehall | Quartz crystal cluster (1,500), Lantern Seat throne (3,500), Charge Well shaft ring (1,200), Dim Nursery cradle (900), Facet Steward tally wall (2,000), stacked crystal wall (1,800), dim Nightburr (1,500, violet under 3) |
| The Sifting | Dune heightfield tile (2,000), Sawdust Bank (800), Hourglass Steppe grain-rise particle volume, Settling Pool (still dust plane, 200), Needlesphere ring set (4,000, half buried), Grain Reader pattern decals (flat), bone fragment set (400) |

**Hero composition rule:** Antlerwild: low horizon, tall pines, one lantern in the lower third. Churn: unfinished ground in the lower third. Underheart: ceiling cracks above, lantern and figure small below. Geodehall: tall crystal wall, Ani brightest. Sifting: dune line low, dust column rising.

**Hazards as art cues (from folios):** slide fog (Antlerwild, as moving fog cards), thought made matter (Churn, floating solid shapes), ceiling shift (Underheart, offset vault courses), fading charge (Geodehall, dimming `charge`), memory drift (Sifting, patterns half-dissolved in dust).

**Realm notes**
- **Antlerwild:** the Ten Hearths towns share one cottage kit with 4 roof variants, so towns read as a family.
- **The Churn:** "colours without names" is answered **[owner]** by the locked colours with roles swapped, never a new hue. Meshes may stop mid-line, with open edges and loose threads.
- **Underheart:** beware of crushing blacks. Keep a floor of Nightfrost on the darkest faces so detail reads on phones, except beyond the lantern falloff.
- **Geodehall:** keep Slate rock in the lower third so the crystals have contrast. The warm family comes from Lantern Gold in crystal cores.
- **The Sifting:** use scale clues (a lantern, a bone), because dunes give no horizon cues.

---

## 10. Magpie Light lighthouse (3D set piece)

- **Place:** Bearing Head, the Rimeward's eastern headland. A cairn (the Bearing Stone) stands at its base.
- **Form (defaults):** tall round tapered tower, **30 m tall, 5 m base diameter** (about 6:1), top diameter 3.5 m (taper about 30%). Black lantern room and gallery, white shaft with **two broad black bands**, black plinth. Magpie Black and Magpie White only on the stonework, Brass on the lamp frame. Stone is sculpted with visible block courses and chamfers, matte (roughness 0.75), with snow collecting on upward faces and frost along the gallery.
- **Model budget (LOD0, 18,000 triangles total):** tower 5,000, gallery and rail 1,500, lantern room 3,000, lens 2,500 (12 clean facets in a Brass mount), cairn 1,000, headland terrain 5,000. LOD1 8,000, LOD2 2,500, LOD3 silhouette quad.
- **Lens:** forged by the Eldest Child from quartz and a sliver of the first lens. Brass mount, facets that split light cleanly.
- **Composition:** fits a portrait frame well. Tower on the vertical axis, about 70% of frame height, cairn and snow at the bottom, the beam crossing east (to the right of frame). Camera 35 mm equiv, height 2 m, pitch +12°.
- **Light:** key as §2.3. In the dark state the warm source is a small Ember Amber glow at the keeper's door or a lantern at the cairn, so the image still has one warm source.
- **Beam states** (global parameter `beam_state` 0–3). The beam is an additive cone mesh (24 segments, about 48 triangles, opacity at most 0.35) plus one spot light, never a volumetric:
  - **0 Dark:** unlit lens, frost normal overlay on the glass, no glow, no beam. This is the starting state.
  - **1 Lit by Mineral light:** a **Quartz White `#FFF6E6` core to Lantern Gold `#F6B84A` edge** beam, **clean hard edges**, steady, no flicker. This is the main ending.
  - **2 Lit by Leylit light:** a flickering **Ember Amber `#E7872B`** beam, flicker 6–9 Hz at 15% amplitude, with up to 40 faint drifting motes. This is the hard-cost state.
  - **3 Through the Needlesphere:** the beam passes through 3–5 nested Brass rings (`#B58A45`, each ring 1.3× the previous radius) and **bends east toward the root** (two cone segments with a kink at the rings). The bead of sap glows Lantern Gold.
- **Never:** a gate with glowing vertical bars, cyan or purple glow, or a Leylit body shown burning.

---

## 11. UI screens rendered over 3D (Handoff §6)

**Design base (default):** portrait 1080 × 1920 and landscape 1920 × 1080, anchored layouts. The 3D scene renders into a background viewport, with 2D UI on a separate layer on top. Hero backdrops are pre-rendered to the §3.4 master and cover-fit.

**Readability over 3D (defaults):**
- **Panels:** Nightfrost `#14263B` at 85–92% opacity with a Magpie White keyline. Text only sits on panels, never directly on the 3D scene.
- **Backdrop treatment:** behind panels, darken the 3D scene by at most 35% and blur it (Gaussian, sigma about 6 px at 1080 width). No pure Magpie Black is added. Palette tint only.
- **Depth of field:** the focal figure or lantern stays sharp. Background and midground blur at an f/2.8 equivalent in pre-renders, and by blurred layer cards live. Never blur the UI itself.
- **Contrast:** **4.5:1** for body text measured against the worst-case composite (panel over the brightest part of the backdrop), 3:1 for icons and large text.
- **Targets:** **48 px** minimum touch target, 8 px spacing. Text 12 px floor.
- **Safe zones:** top 192 px and bottom 288 px at 1440 × 3360 are reserved (scaled for 1080 × 1920: 100 px and 150 px). No buttons or key text in the outer 7.5% side margins.
- **Frost creep** follows the §2.5 clock table as a border overlay, never over text or buttons.
- **Highlight rule:** warm highlights mark the active choice. No violet in UI except the Necrotic icon and the Gloamwound disc rim.

| # | Screen | 3D backdrop and notes |
|---|---|---|
| 1 | Title | Hero 3D lighthouse still, portrait master. Dark or lit by campaign state. Logo set in engine |
| 2 | Lobby and join | Four seat slots 1–4 **[src]**. Seat shown as a 3D lantern on a shelf. Empty seat is an unlit lantern. Backdrop: the cabin interior, blurred |
| 3 | Roster pick | Hunter, Tracker, Mother Aspect, Ani **[src: playable roster]**. Live 3D turntable per pick. Gravesworn shown as Ani's escort, not selectable |
| 4 | Dale board | Hex board of the dale as a lit 3D tabletop. Forty acres, Ten Hearths, Rimeward, Bearing Head. Clock frost on the border |
| 5 | Wheel board | The Rimwheel as a 3D wheel with Axlestone, Hinge Towns, Antlerbrook nearest the hub. Duskmarrow hidden until season eight |
| 6 | Homestead grid | 12 × 12 grid **[src]**. Structure tiles 128 px footprint, live 3D structures. Warm radius shown as an amber light pool on the ground |
| 7 | Raid view | 5 ft squares **[src]**. **No children.** Fright is the **shuttered window and the Hearth Father's portrait** (3D prop or badge). Hearth Father fixed at the cabin |
| 8 | Card hand and deck editor | Cards per §7. Mana gem top left stays visible in a fan. Backdrop: blurred cabin table |
| 9 | Expedition folio | One of five realm folios, with the §9 realm hero render as header art |
| 10 | Campaign panel | Clock track with five stages, and the three Morrowseed tracks (Light, Bearing, Seed). Hearthsun brightens one notch per Nightburr uprooted. Gloamwound drawn as a Magpie Black disc with a thin Cold Violet rim, under 1% of screen |
| 11 | Event card overlay | Hero-style 3D render, 16:9 art window like the cards |
| 12 | Boasts tally | Best Hunt, Boldest Rescue, Longest Watch, Warmest Hand **[src]**. Cosmetic only, never styled as victory. Trophies as small 3D props on a shelf |
| 13 | Settings | Minimal, text 12 px floor, flat Nightfrost panel over a static blurred backdrop |
| 14 | Save and load | Three rollback slots **[src: last 3 seasons]**. Slot art is a small 3D season lantern |

---

## 12. CC0 base meshes and the from-scratch rule

**The rule:** all art is made from scratch **[src: Handoff §6]**. Prior renders are mood reference only. **Default for any outside pack: reference and proportion aid only.** Do not import, trace, re-skin or ship pack assets in the game unless the owner explicitly decides otherwise (open question 17). Even CC0 packs risk looking like other games.

| Pack (CC0 per the earlier research) | Possible use if the owner allows it | Where the from-scratch rule bites |
|---|---|---|
| Quaternius Universal Base Characters | Proportion check and a **blockout base** for the humanoid roles. Bone naming reference | Final Hunter, Tracker, Hearth Father, children, Gravesworn and Regent are sculpted and textured from scratch. Child proportions need new work |
| Quaternius Universal Animation Library | Rig-compatibility test and **motion reference** for idle, walk, run. Retarget test through `BoneMap` | Final clips for forge, ledger, hearth and defend-at-window are custom. Do not ship library clips unmodified without a decision |
| Quaternius Medieval Village MegaKit | Scale and **modular-grid reference** for cabin, palisade and Rimmerdale cottage kits | Chunky chamfered frontier timber is a different shape language, so kits are rebuilt |
| Quaternius Ultimate Nature Pack | **Tree and rock silhouette study** for pines and Underheart stone | Pines in repeated rows, antler arches and hex ice columns are new models |
| Kenney Fantasy Town Kit and Nature Kit | Modular snapping reference and **blockout placeholders** for early level tests | Placeholder only. Replace before any art review, and never in a hero image |

- **Licence note:** Quaternius's licence page now describes a newer licence that bars reselling assets as a standalone pack. Check each pack's page and licence file at the time of use.
- **Placeholder policy (only if the owner permits blockouts):** blockout meshes live in a `blockout/` folder, carry a flat Slate material, never enter `approved/`, and are removed before a release candidate.
- **Not suitable as a source:** copyleft packs (CC-BY-SA, GPL) such as the Ryzom or Flare art, because share-alike terms would attach to derived assets.

---

## 13. Never-list and naming

### 13.1 Global never-list
1. **Outside names, IP and likenesses.** None in prompts, art, filenames, text or metadata. Prior renders are mood reference only, and their style, palette and motifs are not to be repeated.
2. **A bat form or bat motif on the Hunter.** Also no wings, fangs or animal features.
3. **Children in raids,** or children hurt, bloodied, in danger or away from the homestead. No child silhouettes behind shutters.
4. **Violet at 5% or more of image area,** or violet for anything but Necrotic effects.
5. **Palette drift:** teal-cyan aurora, gold-luck light, purple armour, red eyes, skull trophies, and any hue outside §2.
6. **Black bars, letterboxes, pillarboxes, baked-in borders** on hero art.
7. **Text, numbers, logos or watermarks in generated or rendered art.**
8. **A face or humanoid body on Ani.**
9. **The Pitchfrost shown as a creature or boss.** It is weather and a clock, answered not killed. Frost script and glass-still landscapes only.
10. **The Hearth Father leaving the cabin in a raid.**
11. **Gore.** The Tithe Chest's fresh stain is a small, stylised mark only.
12. **Copying any asset from `design-apocrypha.md` or earlier renders.**
13. **(3D)** Photoreal skin or fur, a glossy plastic look, neon rim lights, lens flares and chromatic aberration, off-palette volumetric god rays, and any imported pack asset shipped without an owner decision (§12).

### 13.2 Naming convention (3D)
- **Pattern:** `<cat>_<id>[_<variant>][_<view>]_v<NN>.<ext>`. Lowercase ASCII, snake_case, no spaces.
- **Categories kept for 2D outputs:** `desc` (descriptor sheet render), `card`, `frame`, `icon`, `ui`, `realm`, `scene`, `tile`, `tok` (token), `fx`.
- **Categories new for 3D:**

| Cat | Meaning | Pattern and example |
|---|---|---|
| `mdl` | Static mesh | `mdl_<id>[_<variant>]_lod<N>_v<NN>.glb`, e.g. `mdl_cabin_hearthfather_lod0_v01.glb` |
| `chr` | Skinned character or creature mesh | `chr_<id>[_<variant>]_lod<N>_v<NN>.glb`, e.g. `chr_gravesworn_lod1_v01.glb` |
| `rig` | Skeleton and bone map only | `rig_<class>_v<NN>.glb`, e.g. `rig_humanoid_v01.glb`, `rig_dragon_v01.glb` |
| `anim` | Animation clip | `anim_<class>_<action>_v<NN>.glb`, e.g. `anim_humanoid_idle_a_v01.glb` |
| `tex` | Texture map | `tex_<id>_<map>_v<NN>.png`, where `<map>` is `alb`, `nrm`, `orm` or `emi`, e.g. `tex_hunter_orm_v01.png` |
| `mat` | Engine material | `mat_<id>[_<variant>]_v<NN>.tres`, e.g. `mat_snow_drift_v01.tres` |
| `kit` | Environment kit piece | `kit_<realm>_<piece>_lod<N>_v<NN>.glb`, e.g. `kit_antlerwild_pine_a_lod0_v01.glb` |
| `render` | Pre-rendered still from a 3D scene | `render_<id>[_<variant>]_<view>_v<NN>.png`, e.g. `render_hunter_turnaround_v01.png`, `render_lighthouse_beam1_v01.webp` |

- **ids** match the data model **[src: Handoff §4]**. `art_ref` equals the filename stem without the version.
- **Existing examples still valid:** `desc_hunter_front_v01.png`, `card_hearth_spark_v01.webp`, `icon_dmg_cold_v01.png`, `realm_underheart_hero_v01.webp`, `tok_gravesworn_ember2_v01.png`, `ui_campaign_panel_v01.png`.
- **Versions** are never overwritten. A signed-off file moves to `approved/`, work in progress stays in `wip/`.
- **Source files:** default `.blend` per asset with the same stem, plus layered texture sources (PNG or `.kra`), exported to `.glb` and PNG/WebP. The engine imports only from `export/`.
- **Prompt preamble:** see §14. Every generator prompt starts with the shared block, then the item text.

---

## 14. 3D PROMPT SHEETS (for the image tool)

> **Read this first:** these prompt sheets are **instructions for your image tool** (Grok Imagine, Midjourney, Stable Diffusion or similar). They are **not finished art**. Nothing here has been rendered. Treat every output as a concept or reference render until it passes the §2.4 palette audit, the §3.3 readability tests and art review. Final game assets are modelled, textured and rigged from scratch to §4 to §6. Output from an image tool is mood and layout reference only.

**How to use**
- Every prompt below is **pasteable on its own**. It already contains the shared preamble, the item text, the framing, the aspect ratio and an Avoid line.
- **Aspect ratio:** each prompt states it in words ("Aspect ratio 9:21"). In Midjourney also add `--ar 9:21` (or `--ar 8:5`, `--ar 5:7`, `--ar 16:9`, `--ar 1:1`) and move the Avoid list after `--no`. In Stable Diffusion set the canvas size and paste the Avoid list into the negative prompt. In Grok Imagine use the closest supported ratio.
- **If 9:21 is not available:** generate at 9:16 and extend the top and bottom (outpaint) to 1440 × 3360, then run the §3.4 edge check. Never fill the extension with black.
- Image tools often ignore negatives written as sentences. Always also paste the Avoid line into the tool's negative field where there is one.
- **Resolution:** generate at the largest size the tool allows, then upscale or downsample to the masters in §3.4 and §7.
- **No baked-in text:** all lettering, numbers and logos are set in engine. Reject any output with letters in it.
- **Children rule:** no prompt shows a child in a raid, in danger, or away from the homestead. Fright is a shuttered window and the Hearth Father's portrait only.
- **Outside names:** none appear in any prompt. Do not add any when you edit prompts.

### 14.1 Shared preamble block

Every prompt starts with this core. Scene and character prompts add the scene lighting line. Object, frame and icon prompts add the object lighting line.

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image.
```

**Scene lighting line (characters in scenes, realms, lighthouse, UI backdrops):**
```
About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light.
```

**Object lighting line (turnaround sheets, card frame, Hushcube sheet, icons):**
```
Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light.
```

**Phone framing line (portrait scenes):**
```
Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image.
```

**Sheet framing line (turnarounds):**
```
Sheet framing: wide landscape sheet on a smooth Nightfrost-to-Glacier gradient backdrop that fills the whole canvas, no black bars, no border, no text or labels.
```

**Shared negative list (also ends every prompt, with item-specific additions):**
```
text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses
```

### 14.2 Index of prompt sheets

| Group | Prompts |
|---|---|
| Characters (13 roles, turnaround and portrait each) | P01–P26: Hunter, Snow Crowned Tracker, Mother Aspect, Ani, Hearth Father, Gravesworn, Fizzlet, Eldest Child, Middle Child, Youngest, Churnglint, Hollow Regent, Old Beast |
| Card frame | P27 flat frame (mode A), P28 slab as 3D object (mode B) |
| Hushcube | P29 turnaround sheet, P30 card art window |
| Realms | P31–P35: Antlerwild with Rimmerdale, Churn eastern edge, Underheart, Geodehall, the Sifting |
| Magpie Light lighthouse | P36–P39: beam states 0 to 3 |
| Key UI backdrops | P40–P47: title, lobby, roster pick, Dale board, homestead grid, raid view (fright signifier), campaign panel, event overlay |
| 13 damage icons | P48–P60: Cold, Necrotic, then Acid to Thunder |


#### Characters

**P01. Hunter: turnaround sheet** (aspect 8:5, 4096 x 2560)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Character turnaround sheet of the Hunter: a tall, rugged, fully human man about 7.5 heads tall with short dark hair and a weathered face, broad hide and wool coat, flat-top hat or hood, antler-handled hunting kit, Slate iron fittings, chunky stylised hands and boots, carrying a Brass lantern with a Lantern Gold glow. Orthographic front, side and back views at identical scale in a neutral pose, one 3/4 beauty view, and a row of six head expressions (neutral, alert, warm, afraid, resolve, tired). A small flat black silhouette strip at the corner. One small warm accent glow only from carried or worn light. Sheet framing: wide landscape sheet on a smooth Nightfrost-to-Glacier gradient backdrop that fills the whole canvas, no black bars, no border, no text or labels. Aspect ratio 8:5. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; bat motifs, wings, fangs, animal ears, claws, shapeshifting, horns, helmet with animal features.
```

**P02. Hunter: portrait** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. Hunter portrait: waist-up, standing in the warm pool of his own lantern in deep snow at dusk, slight low camera angle, calm determined look, pines far behind. Subject: the Hunter: a tall, rugged, fully human man about 7.5 heads tall with short dark hair and a weathered face, broad hide and wool coat, flat-top hat or hood, antler-handled hunting kit, Slate iron fittings, chunky stylised hands and boots, carrying a Brass lantern with a Lantern Gold glow. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; bat motifs, wings, fangs, animal ears, claws, shapeshifting, horns, helmet with animal features.
```

**P03. Snow Crowned Tracker: turnaround sheet** (aspect 8:5, 4096 x 2560)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Character turnaround sheet of the Snow Crowned Tracker: a slim woman about 0.92 of the Hunter's height with bright white hair worn up like a crown, deep blue and Glacier wool coat, light snowshoes, a gloved hand tracing tracks in snow, one small Ember Amber lantern clip on her belt. Orthographic front, side and back views at identical scale in a neutral pose, one 3/4 beauty view, and a row of six head expressions (neutral, alert, warm, afraid, resolve, tired). A small flat black silhouette strip at the corner. One small warm accent glow only from carried or worn light. Sheet framing: wide landscape sheet on a smooth Nightfrost-to-Glacier gradient backdrop that fills the whole canvas, no black bars, no border, no text or labels. Aspect ratio 8:5. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; red eyes, tiara, crown jewellery, animal features, violet.
```

**P04. Snow Crowned Tracker: portrait** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. Tracker portrait: three-quarter view, kneeling in snow reading tracks with one gloved finger, looking down at the ground, a small lantern beside her. Subject: the Snow Crowned Tracker: a slim woman about 0.92 of the Hunter's height with bright white hair worn up like a crown, deep blue and Glacier wool coat, light snowshoes, a gloved hand tracing tracks in snow, one small Ember Amber lantern clip on her belt. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; red eyes, tiara, crown jewellery, animal features, violet.
```

**P05. Mother Aspect: turnaround sheet** (aspect 8:5, 4096 x 2560)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Character turnaround sheet of the Mother Aspect: a young four-legged dragon, rounded and compact, draft-horse sized, long neck, slightly large head, moon-pale feldspar scales (#E3E9EE with shadows #9AA9B8) with a pearl sheen, folded wing-cases made of layered overlapping scale plates with no skin membrane, a warm Lantern Gold glow in the throat and breath. Orthographic front, side and back views at the same scale, a 3/4 beauty view, a row showing the wing-cases folded and fanned open like plates, and three head studies (calm, alert, protective). Neutral stance. Sheet framing: wide landscape sheet on a smooth Nightfrost-to-Glacier gradient backdrop that fills the whole canvas, no black bars, no border, no text or labels. Aspect ratio 8:5. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; bat wings, skin membrane wings, red scales, black scales, adult elder dragon, violet, horns like a demon.
```

**P06. Mother Aspect: portrait** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. Mother Aspect portrait: standing protectively between the viewer and a small cabin behind her, folded wing-cases, warm breath melting frost on the snow in front of her, the throat glow is the one warm source. Subject: the Mother Aspect: a young four-legged dragon, rounded and compact, draft-horse sized, long neck, slightly large head, moon-pale feldspar scales (#E3E9EE with shadows #9AA9B8) with a pearl sheen, folded wing-cases made of layered overlapping scale plates with no skin membrane, a warm Lantern Gold glow in the throat and breath. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; bat wings, skin membrane wings, red scales, black scales, adult elder dragon, violet, horns like a demon.
```

**P07. Ani: turnaround sheet** (aspect 8:5, 4096 x 2560)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Character design sheet of Ani: a drifting will light, a glowing teardrop of light with a short trailing wisp tail and a soft halo, no limbs, no body, no face, quartz white (#FFF6E6) shifting to amber (#E7872B). Show the same light in five mood states in a row (calm quartz white, curious Lantern Gold, stubborn Ember Amber, lonely dim Ember Deep with a smaller halo, resolve quartz white with a sharpened core), plus one large beauty view and a scale marker silhouette of the Hunter's height next to it. No face on the light, ever. Sheet framing: wide landscape sheet on a smooth Nightfrost-to-Glacier gradient backdrop that fills the whole canvas, no black bars, no border, no text or labels. Aspect ratio 8:5. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; humanoid body, face, eyes, mouth, limbs, hands, violet, gendered character design.
```

**P08. Ani: portrait** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. Ani portrait: Ani floats alone, centred, as the brightest point in a dark blue snowy forest clearing, halo lighting nearby snow and pine branches, a calm quartz-white glow. Subject: Ani: a drifting will light, a glowing teardrop of light with a short trailing wisp tail and a soft halo, no limbs, no body, no face, quartz white (#FFF6E6) shifting to amber (#E7872B). Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; humanoid body, face, eyes, mouth, limbs, hands, violet, gendered character design.
```

**P09. Hearth Father: turnaround sheet** (aspect 8:5, 4096 x 2560)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Character turnaround sheet of the Hearth Father: a seasoned, broad, solid, heavier hunter about as tall as the Hunter, grey at the temples with a trimmed beard, heavy wool coat in Hide and Cinder with Slate fittings, planted square stance. Orthographic front, side and back views at identical scale in a neutral pose, one 3/4 beauty view, and a row of six head expressions (neutral, alert, warm, afraid, resolve, tired). A small flat black silhouette strip at the corner. One small warm accent glow only from carried or worn light. Sheet framing: wide landscape sheet on a smooth Nightfrost-to-Glacier gradient backdrop that fills the whole canvas, no black bars, no border, no text or labels. Aspect ratio 8:5. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; leaving the cabin, outdoors in a raid, children, weapons drawn at a person, gore, violet.
```

**P10. Hearth Father: portrait** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. Hearth Father portrait: waist-up inside a timber cabin at a window with closed shutters, a thin Ember Amber slit of light across his face and coat, a framed bust portrait on the wall beside the window, he stands guard. Subject: the Hearth Father: a seasoned, broad, solid, heavier hunter about as tall as the Hunter, grey at the temples with a trimmed beard, heavy wool coat in Hide and Cinder with Slate fittings, planted square stance. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; leaving the cabin, outdoors in a raid, children, weapons drawn at a person, gore, violet.
```

**P11. Gravesworn: turnaround sheet** (aspect 8:5, 4096 x 2560)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Character turnaround sheet of the Gravesworn: a tall, angular undead barrow hunter about 1.05 of the Hunter's height, visible bone rib cage (Bone #D9D0BE), hunter's hood or antler cap, weathered old hunter gear, layered rime frost (#A5CDE3, #D6EAF4) growing over the ribs in poured layers, a glowing Ember Amber coal in the chest cavity. Orthographic front, side and back views at identical scale in a neutral pose, one 3/4 beauty view, and a row of six head expressions (neutral, alert, warm, afraid, resolve, tired). A small flat black silhouette strip at the corner. One small warm accent glow only from carried or worn light. Sheet framing: wide landscape sheet on a smooth Nightfrost-to-Glacier gradient backdrop that fills the whole canvas, no black bars, no border, no text or labels. Aspect ratio 8:5. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; red eyes, purple armour, skull trophies, bloodied sword, gore, violet, glowing violet energy.
```

**P12. Gravesworn: portrait** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. Gravesworn portrait: standing in a frozen barrow field at night, the chest ember is the single warm light, rime on the ribs catching a cold rim light, quiet and mournful, not menacing. Subject: the Gravesworn: a tall, angular undead barrow hunter about 1.05 of the Hunter's height, visible bone rib cage (Bone #D9D0BE), hunter's hood or antler cap, weathered old hunter gear, layered rime frost (#A5CDE3, #D6EAF4) growing over the ribs in poured layers, a glowing Ember Amber coal in the chest cavity. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; red eyes, purple armour, skull trophies, bloodied sword, gore, violet, glowing violet energy.
```

**P13. Fizzlet: turnaround sheet** (aspect 8:5, 4096 x 2560)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Character design sheet of the Fizzlet: a tiny round fuzz-ball of crackling static about 0.2 of the Hunter's height with 6 to 8 spiky arcs and a short trailing tail, Frostglass and Rime body, Lantern Gold sparks, Quartz White arc tips, no face. Show front, side and back views at the same scale, a row of three states (calm, charged, overfed: swollen and bright with a hairline crack of light), and one 3/4 beauty view. Sheet framing: wide landscape sheet on a smooth Nightfrost-to-Glacier gradient backdrop that fills the whole canvas, no black bars, no border, no text or labels. Aspect ratio 8:5. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; face, mouth, teeth, eyes, violet, cute animal features.
```

**P14. Fizzlet: portrait** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. Fizzlet portrait: the Fizzlet floating at the centre carrying a thin ribbon of message light through falling snow, sparks lighting nearby frost, the sparks are the one warm source. Subject: the Fizzlet: a tiny round fuzz-ball of crackling static about 0.2 of the Hunter's height with 6 to 8 spiky arcs and a short trailing tail, Frostglass and Rime body, Lantern Gold sparks, Quartz White arc tips, no face. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; face, mouth, teeth, eyes, violet, cute animal features.
```

**P15. Eldest Child: turnaround sheet** (aspect 8:5, 4096 x 2560)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Character turnaround sheet of the Eldest Child: a young child about 0.8 of the Hunter's height in bundled winter clothes and a round hat, leather forge apron, a wrapped burnt thumb, chunky stylised proportions, safe homestead character only. Orthographic front, side and back views at identical scale in a neutral pose, one 3/4 beauty view, and a row of six head expressions (neutral, alert, warm, afraid, resolve, tired). A small flat black silhouette strip at the corner. One small warm accent glow only from carried or worn light. Sheet framing: wide landscape sheet on a smooth Nightfrost-to-Glacier gradient backdrop that fills the whole canvas, no black bars, no border, no text or labels. Aspect ratio 8:5. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; raid, combat, danger, injury, blood, weapons, outdoors on the road, violet.
```

**P16. Eldest Child: portrait** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. Eldest Child portrait: at the homestead forge, hammering a small piece of quartz-bright metal, the forge fire is the one warm light, indoors, safe and focused. Subject: the Eldest Child: a young child about 0.8 of the Hunter's height in bundled winter clothes and a round hat, leather forge apron, a wrapped burnt thumb, chunky stylised proportions, safe homestead character only. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; raid, combat, danger, injury, blood, weapons, outdoors on the road, violet.
```

**P17. Middle Child: turnaround sheet** (aspect 8:5, 4096 x 2560)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Character turnaround sheet of the Middle Child: a young child about 0.7 of the Hunter's height in bundled winter clothes and a round hat, carrying a ledger and a ring of keys, chunky stylised proportions, safe homestead character only. Orthographic front, side and back views at identical scale in a neutral pose, one 3/4 beauty view, and a row of six head expressions (neutral, alert, warm, afraid, resolve, tired). A small flat black silhouette strip at the corner. One small warm accent glow only from carried or worn light. Sheet framing: wide landscape sheet on a smooth Nightfrost-to-Glacier gradient backdrop that fills the whole canvas, no black bars, no border, no text or labels. Aspect ratio 8:5. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; raid, combat, danger, injury, blood, weapons, a sled on the road, away from the homestead, violet.
```

**P18. Middle Child: portrait** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. Middle Child portrait: in the cabin stores with shelves of jars and sacks, writing in a ledger by a small lantern, indoors, safe and tidy. Subject: the Middle Child: a young child about 0.7 of the Hunter's height in bundled winter clothes and a round hat, carrying a ledger and a ring of keys, chunky stylised proportions, safe homestead character only. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; raid, combat, danger, injury, blood, weapons, a sled on the road, away from the homestead, violet.
```

**P19. Youngest: turnaround sheet** (aspect 8:5, 4096 x 2560)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Character turnaround sheet of the Youngest: a small child about 0.55 of the Hunter's height in bundled winter clothes with bare mittens and a tilted head, chunky stylised proportions, safe homestead character only. Orthographic front, side and back views at identical scale in a neutral pose, one 3/4 beauty view, and a row of six head expressions (neutral, alert, warm, afraid, resolve, tired). A small flat black silhouette strip at the corner. One small warm accent glow only from carried or worn light. Sheet framing: wide landscape sheet on a smooth Nightfrost-to-Glacier gradient backdrop that fills the whole canvas, no black bars, no border, no text or labels. Aspect ratio 8:5. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; raid, combat, danger, injury, blood, weapons, a window with shutters under attack, away from the homestead, violet.
```

**P20. Youngest: portrait** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. Youngest portrait: sitting by the hearth with a small Fizzlet static-ball beside them, a closed wooden Tithe Chest nearby, listening with a tilted head, the hearth is the one warm light, indoors, safe and quiet. Subject: the Youngest: a small child about 0.55 of the Hunter's height in bundled winter clothes with bare mittens and a tilted head, chunky stylised proportions, safe homestead character only. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; raid, combat, danger, injury, blood, weapons, a window with shutters under attack, away from the homestead, violet.
```

**P21. Churnglint: turnaround sheet** (aspect 8:5, 4096 x 2560)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Character turnaround sheet of the Churnglint: a small hovering ice-sprite about 0.3 of the Hunter's height built around one large eye with an Ember Amber iris ring and a Magpie Black pupil, surrounded by loose Frostglass and Rime ice shards, slightly asymmetric with one unfinished open edge. Orthographic front, side and back views at identical scale in a neutral pose, one 3/4 beauty view, and a row of six head expressions (neutral, alert, warm, afraid, resolve, tired). A small flat black silhouette strip at the corner. One small warm accent glow only from carried or worn light. Sheet framing: wide landscape sheet on a smooth Nightfrost-to-Glacier gradient backdrop that fills the whole canvas, no black bars, no border, no text or labels. Aspect ratio 8:5. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; horns, bat wings, tentacles, a copy of any existing creature, violet, multiple eyes.
```

**P22. Churnglint: portrait** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. Churnglint portrait: hovering above a closed wooden Tithe Chest in a dim cabin, the eye is the focal point, a small warm lantern glow below. Subject: the Churnglint: a small hovering ice-sprite about 0.3 of the Hunter's height built around one large eye with an Ember Amber iris ring and a Magpie Black pupil, surrounded by loose Frostglass and Rime ice shards, slightly asymmetric with one unfinished open edge. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; horns, bat wings, tentacles, a copy of any existing creature, violet, multiple eyes.
```

**P23. Hollow Regent: turnaround sheet** (aspect 8:5, 4096 x 2560)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Character turnaround sheet of the Hollow Regent: a tall, thin keeper figure about 1.1 of the Hunter's height in a long worn Magpie Black and Magpie White keeper's coat with Brass trim, a hollow cavity in the chest where an unlit Brass lantern hangs, a thread of tiny cold violet smoke at the coat seams only, sorrowful and dignified, no gender specified. Orthographic front, side and back views at identical scale in a neutral pose, one 3/4 beauty view, and a row of six head expressions (neutral, alert, warm, afraid, resolve, tired). A small flat black silhouette strip at the corner. One small warm accent glow only from carried or worn light. Sheet framing: wide landscape sheet on a smooth Nightfrost-to-Glacier gradient backdrop that fills the whole canvas, no black bars, no border, no text or labels. Aspect ratio 8:5. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; skull face, monster face, horns, violet-filled body, red eyes, gore.
```

**P24. Hollow Regent: portrait** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. Hollow Regent portrait: standing at the foot of a snowy stair in a cold hall, the unlit lantern in the chest cavity, the only warm light a distant small ember, the violet smoke under 2% of the image. Subject: the Hollow Regent: a tall, thin keeper figure about 1.1 of the Hunter's height in a long worn Magpie Black and Magpie White keeper's coat with Brass trim, a hollow cavity in the chest where an unlit Brass lantern hangs, a thread of tiny cold violet smoke at the coat seams only, sorrowful and dignified, no gender specified. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; skull face, monster face, horns, violet-filled body, red eyes, gore.
```

**P25. Old Beast: turnaround sheet** (aspect 8:5, 4096 x 2560)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Modular parts sheet of the Old Beast: a vast, low, rounded stone grazer fused with bedrock, mineral ridges along its back, teeth grooves worn into the stone, a long slow head lowered to the floor, clouded failing eyes with a faint Ember Amber glimmer, Cairn Grey, Slate, Cinder and Bone, no villain. Show four parts at one scale with a small Brass lantern beside each for scale: the head lowered to the stone, the flank section, the mineral back ridge, and a tooth-groove gallery wall. Neutral even lighting. Sheet framing: wide landscape sheet on a smooth Nightfrost-to-Glacier gradient backdrop that fills the whole canvas, no black bars, no border, no text or labels. Aspect ratio 8:5. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; horns, red eyes, monster or jailer look, violet, the whole creature fitting in frame.
```

**P26. Old Beast: portrait** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. Old Beast portrait: only the head and the start of the flank are visible, lowered to the stone floor of a vast cavern, a small Brass lantern on the floor in the lower third gives the scale and is the one warm light. Subject: the Old Beast: a vast, low, rounded stone grazer fused with bedrock, mineral ridges along its back, teeth grooves worn into the stone, a long slow head lowered to the floor, clouded failing eyes with a faint Ember Amber glimmer, Cairn Grey, Slate, Cinder and Bone, no villain. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; horns, red eyes, monster or jailer look, violet, the whole creature fitting in frame.
```

#### Card frame

**P27. Card frame: blank flat frame (mode A)** (aspect 5:7, 1500 x 2100)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Blank trading-card frame, front view, flat orthographic, a Nightfrost #14263B slab with softly bevelled edges, a raised Magpie White #F5F7F6 keyline, rounded corners. Layout from the top: a name bar band across the top, a round faceted mana gem at the top left with a Glacier glow, a large empty 16:9 art window with a thin inset bevel (fill the window with flat mid-grey Glacier #5A8FB5 so it can be replaced), a type line band with a small raised Brass ring and an Ember Amber dot at its right end, a large flat matte empty rules panel, and a footer strip with an empty round medallion socket on the left and an empty diamond socket on the right. All panels are blank and smooth, no ornament inside the panels, no text. Light from the upper left, bevel highlights on the upper-left edges, soft shadows on the lower-right edges. Frame framing: the card fills the entire canvas edge to edge, no background, no black bars. Aspect ratio 5:7 (1500 x 2100). Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; wooden or gold border, ornate filigree, text in the panels, violet, glow around the frame.
```

**P28. Card frame: slab as a 3D object (mode B, inspect view)** (aspect 5:7)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. A single blank card slab as a 3D object for an inspect view, seen at a slight three-quarter angle tilted about 12 degrees, thick Nightfrost #14263B slab with bevelled edges, a raised Magpie White keyline, empty art window, empty rules panel, round faceted mana gem at the top left, soft cold shadow on a Glacier snow-blue backdrop, the card edge catching a small warm Ember Amber rim from the lower right. Framing: the card slab is centred and fills about 80% of the height, the backdrop fills the whole canvas, no black bars. No text. Aspect ratio 5:7. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; gold border, ornate filigree, text on the card, violet.
```

#### Hushcube

**P29. Hushcube: turnaround sheet** (aspect 8:5, 4096 x 2560)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Object turnaround sheet of the Hushcube: a grey crystal cube 0.2 m a side, Cairn Grey #6F7A86 with slightly uneven cleaved faces, chamfered edges that catch Rime #A5CDE3, a darker Slate core visible through the faces, inner fracture planes, thin hairline cracks glowing Violet Mist #A592D6 inside Violet Shadow #2F2150 channels, a small wisp of cold violet smoke, violet under 8% of the image. Show eight orthographic views at one scale and one light: front, back, left, right, top, bottom, 3/4 front-left, 3/4 back-right. Sheet framing: wide landscape sheet on a smooth Nightfrost-to-Glacier gradient backdrop that fills the whole canvas, no black bars, no border, no text or labels. Aspect ratio 8:5 (4096 x 2560). Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; golden border, starry void, screaming faces, purple-red energy cracks, violet filling the background.
```

**P30. Hushcube: card art window** (aspect 16:9, 1584 x 888)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. Card art window image: a single grey crystal cube (Cairn Grey #6F7A86, chamfered edges catching Rime #A5CDE3) centred and slightly tilted on a Nightfrost #14263B field with drifting snow motes, thin hairline cracks leaking a small wisp of cold violet smoke (Violet Mist #A592D6), violet under 8% of the image, a warm Ember Amber rim from the upper left and one small Lantern Gold glint on one facet, a tiny cracked bell silhouette in the lower right corner, a quiet hush with no sparks and no streaks. Keep the important content 60 px away from every edge. Framing: the image fills the entire canvas edge to edge, no black bars, no border, no text. Aspect ratio 16:9 (1584 x 888). Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; golden border, starry void, screaming faces, purple-red energy cracks, violet filling the background.
```

#### Realms

**P31. Antlerwild with Rimmerdale: hero environment** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. Antlerwild with Rimmerdale realm hero environment. A snowy hunt realm at dusk: low overcast pale-blue sky, tall repeating rows of dark pine, a long diagonal herd road braiding across deep snow, a plain of dropped antlers, a small timber village with chunky heavy-timber cottages and a palisade, far on the east horizon a pale glare from a huge ring of poured ice with drifting slide-fog. Long Glacier shadows. Low horizon about 65% down the frame, tall pines rising to the top, one Warding Lantern on a post in the lower third as the single warm light, its pool about 2 to 3 times the height of a nearby fence post. Camera: 35 mm lens, camera height 1.3 m, level. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; figures, children, bat shapes, violet, green aurora.
```

**P32. The Churn, eastern edge: hero environment** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. The Churn, eastern edge realm hero environment. A land that is unfinished: the ground unravels into loose threads and open mesh edges at the lower third and the sky dissolves into open edges at the top, a torn plate of meadow floating with a few antlered herd animals, wells of still liquid, a thin string of a seam mender across a gap, a soldered seam with small violet smoke (violet 3 to 5% only). Use the locked colours with roles swapped: shadows are Ember Amber and Ember Deep, highlights are Frostglass and Rime, some flat unlit patches. Two soft light directions, one from the upper left and a weaker one from low right, so shadows fall two ways. Forms stop mid-line. A single small copper-amber lantern glow is the one warm source. Camera: 28 mm lens, camera height 1.5 m, level, no tilt. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; new colours, rainbow, neon, green, bat shapes.
```

**P33. Underheart: hero environment** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. Underheart realm hero environment. A deep stone cavern of dark gallery tunnels: Cairn Grey and Slate walls with repeating tooth grooves, a fused stone ceiling vault with thin cracks leaking a faint wisp of violet smoke (violet under 3%), mortar bands, the partial rounded flank of a vast stone creature in the dark. Only point lanterns light the scene: one small Brass lantern with a small figure near it in the lower third, the light falling off within about 3 body heights, everything beyond sinking into Magpie Black with a faint Nightfrost floor so detail still reads. Ceiling cracks fill the upper frame. Camera: 30 mm lens, camera height 1.2 m, tilted up 8 degrees. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; sky, snow, daylight, red glow, lava, bat shapes.
```

**P34. Geodehall: hero environment** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. Geodehall realm hero environment. A vast hall of glowing crystal: a tall wall of stacked quartz crystal in Quartz White, Lantern Gold and Rime, Slate rock at the base, a quartz throne, deep shafts in the floor, half-glowing cradles in an alcove, a tally wall of carved marks. Light is emitted by the crystals only (up-glow and edge-glow), no sky and no snow. Ani, a small teardrop will light with no body and no face, floats in the upper middle as the brightest point and the single warm source. A small dim Nightburr husk in a far alcove with a tiny wisp of violet (violet under 3%). Camera: 35 mm lens, camera height 1.0 m, tilted up 10 degrees. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; sky, snow, rainbow crystals, cyan or teal glow, face on the light.
```

**P35. The Sifting: hero environment** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. The Sifting realm hero environment. A drifting desert of fine pale dust: Bone-coloured dunes with a low dune line about 68% down the frame, a slow column of dust and floating grains rising through the upper frame, a still pool of settled dust, a half-buried set of nested Brass rings (a Needlesphere), faded patterns half dissolving in the sand, a small bone fragment for scale. Flat hazy light with long soft shadows, hazy Bone-tinted fog, floating dust motes. Desaturated Ember Deep, sparse Glacier blue at the far distance. One small blurred Ember Amber lantern in the lower third is the single warm source. Camera: 40 mm lens, camera height 1.4 m, tilted down 2 degrees. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; green oasis, palm trees, bright sun, bat shapes, violet.
```

#### Magpie Light lighthouse

**P36. Lighthouse: Beam state 0: dark** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. The Magpie Light lighthouse on a snowy headland called Bearing Head: a tall round tapered tower about 6 times taller than its base width, white stone shaft with two broad Magpie Black bands, black plinth, black gallery and lantern room, Brass lamp frame and a clean faceted lens, matte sculpted stone blocks with chamfers, snow collecting on upward faces and frost on the gallery, a stone cairn at its base, a small figure-free snowy headland, cold blue dusk sky over a pale distant ring of ice to the east. The tower stands on the vertical centre axis and fills about 70% of the frame height, cairn and snow at the bottom, the beam runs to the right (east). Camera 35 mm, low, tilted up 12 degrees. The lamp is unlit: frost on the lens glass, no glow, no beam. The only warm light is one small Ember Amber window glow at the keeper's door at the base. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; any beam of light, glowing vertical bars, cyan or purple glow.
```

**P37. Lighthouse: Beam state 1: lit by Mineral light** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. The Magpie Light lighthouse on a snowy headland called Bearing Head: a tall round tapered tower about 6 times taller than its base width, white stone shaft with two broad Magpie Black bands, black plinth, black gallery and lantern room, Brass lamp frame and a clean faceted lens, matte sculpted stone blocks with chamfers, snow collecting on upward faces and frost on the gallery, a stone cairn at its base, a small figure-free snowy headland, cold blue dusk sky over a pale distant ring of ice to the east. The tower stands on the vertical centre axis and fills about 70% of the frame height, cairn and snow at the bottom, the beam runs to the right (east). Camera 35 mm, low, tilted up 12 degrees. The lamp is lit by Mineral light: a steady beam with a Quartz White #FFF6E6 core fading to Lantern Gold #F6B84A at the edge, clean hard edges, no flicker, crossing east to the right of the frame. The beam is the single warm light. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; cyan or purple glow, glowing vertical bars, rainbow beam, lens flare.
```

**P38. Lighthouse: Beam state 2: lit by Leylit light** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. The Magpie Light lighthouse on a snowy headland called Bearing Head: a tall round tapered tower about 6 times taller than its base width, white stone shaft with two broad Magpie Black bands, black plinth, black gallery and lantern room, Brass lamp frame and a clean faceted lens, matte sculpted stone blocks with chamfers, snow collecting on upward faces and frost on the gallery, a stone cairn at its base, a small figure-free snowy headland, cold blue dusk sky over a pale distant ring of ice to the east. The tower stands on the vertical centre axis and fills about 70% of the frame height, cairn and snow at the bottom, the beam runs to the right (east). Camera 35 mm, low, tilted up 12 degrees. The lamp is lit by Leylit light: a flickering Ember Amber #E7872B beam with soft uneven edges and a few faint drifting motes, crossing east to the right of the frame. The beam is the single warm light. No burning body or fire creature. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; a burning creature, a body made of fire, cyan or purple glow, glowing vertical bars.
```

**P39. Lighthouse: Beam state 3: through the Needlesphere** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. The Magpie Light lighthouse on a snowy headland called Bearing Head: a tall round tapered tower about 6 times taller than its base width, white stone shaft with two broad Magpie Black bands, black plinth, black gallery and lantern room, Brass lamp frame and a clean faceted lens, matte sculpted stone blocks with chamfers, snow collecting on upward faces and frost on the gallery, a stone cairn at its base, a small figure-free snowy headland, cold blue dusk sky over a pale distant ring of ice to the east. The tower stands on the vertical centre axis and fills about 70% of the frame height, cairn and snow at the bottom, the beam runs to the right (east). Camera 35 mm, low, tilted up 12 degrees. The beam passes through 3 to 5 nested Brass #B58A45 rings floating beside the lamp and bends toward the east and downward to a far root-like horizon, a small bead of sap glowing Lantern Gold at the centre ring. Beam core Quartz White to Lantern Gold. The bead and beam are the single warm light. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21. Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; cyan or purple glow, glowing vertical bars, a gate, a portal.
```

#### Key UI backdrops

**P40. UI: Title backdrop** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. Title screen backdrop: the Magpie Light lighthouse tall and small-scale on a distant snowy headland at dusk, the lamp dark, the sky above empty and calm so a logo can be placed later (leave the upper 25% as plain soft Glacier-to-Nightfrost sky, no logo, no text), a single small warm lantern glow at a keeper's door. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21 (1440 x 3360). Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; any text or logo, a beam of light, violet.
```

**P41. UI: Lobby and join backdrop** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. Lobby backdrop: the inside of a timber cabin, a long shelf with four brass lanterns in a row, one lit and three unlit, a frosted window, a heavy plank table, softly out of focus (shallow depth of field) so UI panels can sit on top, the lit lantern is the single warm source. No people. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21 (1440 x 3360). Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; people, children, text, violet.
```

**P42. UI: Roster pick backdrop** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. Roster pick backdrop: an empty round hearth room with four low stone plinths in an arc and a warm hearth glow behind them, Nightfrost walls, snow drifting at the doorway, no characters, a soft blurred background, the hearth is the single warm source. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21 (1440 x 3360). Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; people, characters, children, text, violet.
```

**P43. UI: Dale board backdrop** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. Dale board backdrop: a lit 3D tabletop board of a snowy dale made of pointy-top hexagonal tiles (pines, a river of glass-like ice, a ring of poured ice to the east, a tiny lighthouse at the far east edge), seen from 35 degrees above, no pieces or tokens, frost creeping on the wooden board border, a single small lantern at the lower edge of the board as the one warm source. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21 (1440 x 3360). Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; tokens, figures, children, text, violet.
```

**P44. UI: Homestead grid backdrop** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. Homestead grid backdrop: a snowy 12 by 12 square homestead ground seen from 35 degrees above with a timber cabin, a forge with a small fire, a stores shed, a palisade, a smokehouse and a warding lantern, a soft amber pool of light on the snow around the cabin, no people. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21 (1440 x 3360). Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; people, children, raid, enemies, text, violet.
```

**P45. UI: Raid view backdrop (fright signifier)** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. Raid view backdrop: the closed-shutter window of a timber cabin at night, one thin Ember Amber slit of light between the shutters, a framed carved bust portrait of an older bearded man in a wooden frame with Brass corner studs hanging on the wall beside the window, blue snow and frost on the window edge outside. No person is visible, no silhouette behind the shutters, no child, implied or shown. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21 (1440 x 3360). Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; any person, any silhouette behind the shutters, children, enemies, gore, violet.
```

**P46. UI: Campaign panel backdrop** (aspect 9:21, 1440 x 3360)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. Campaign panel backdrop: a frosted cabin window at dawn with frost growing from the edges inward (about 40% covered, keeping the centre clear), a small gold sun low behind the glass and a small round dark disc near it with a thin cold violet rim (under 1% of the image), a hearth lantern on the sill as the warm source. Soft out-of-focus. Phone framing: vertical full-bleed image that fills the whole canvas edge to edge with real scene detail, sharp to the edges, no black bars, no letterbox, no border. Keep the subject inside the central 9:16 area with the focal point about 40% down from the top and extra scene above and below. No text or letters in the image. Aspect ratio 9:21 (1440 x 3360). Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; violet over 1%, text, numbers, people.
```

**P47. UI: Event card overlay art** (aspect 16:9, 1584 x 888)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. About 65-80% of the image is cold or neutral colour and 15-30% is warm. Lighting: soft cold key light from the upper left at about 45 degrees, blue shadows in the snow, exactly one small visible warm light source (a lantern, hearth, ember or glow) against the snow, a cold Rime rim light on one side and a warm rim on the lantern side, no mid-temperature white light. Event card hero art: a single wooden trail marker post in deep snow with one lit Brass lantern hanging from it, a faint herd road behind, calm blue dusk, a wide cinematic scene with the lantern slightly left of centre as the single warm source. Framing: the image fills the entire canvas edge to edge, no black bars, no border, no text. Aspect ratio 16:9 (1584 x 888). Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; people, children, text, violet.
```

#### Damage icons

**P48. Icon 01: Cold** (aspect 1:1, 1024 x 1024 master)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Game damage-type icon number 1 of 13, the Cold icon: a hexagonal rime crystal with six short spurs, Rime #A5CDE3, Frostglass #D6EAF4 and Deepice #2B4F73, soft Frostglass inner glow. A bold simple extruded, bevelled glyph embossed on a round Nightfrost #14263B medallion with a Magpie White rim, emboss height about 10% of the icon width, a thin Frostglass keyline around the medallion, a soft 4 px drop shadow to the lower right, centred, readable at 24 px, shape reads before colour. Plain Nightfrost-dark square backdrop. Framing: one icon centred and filling about 85% of the square canvas, backdrop fills the canvas, no text. Aspect ratio 1:1 (generate 1024 x 1024, deliver 256). Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; violet, red.
```

**P49. Icon 02: Necrotic** (aspect 1:1, 1024 x 1024 master)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Game damage-type icon number 2 of 13, the Necrotic icon: a spiked burr seed with one curling wisp of smoke, Cold Violet #6B4FA0, Violet Shadow #2F2150 and Violet Mist #A592D6, a small Violet Mist glowing core. The violet is only in the glyph, never in the medallion. A bold simple extruded, bevelled glyph embossed on a round Nightfrost #14263B medallion with a Magpie White rim, emboss height about 10% of the icon width, a thin Frostglass keyline around the medallion, a soft 4 px drop shadow to the lower right, centred, readable at 24 px, shape reads before colour. Plain Nightfrost-dark square backdrop. Framing: one icon centred and filling about 85% of the square canvas, backdrop fills the canvas, no text. Aspect ratio 1:1 (generate 1024 x 1024, deliver 256). Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; violet in the medallion rim, skull, bones, red.
```

**P50. Icon 03: Acid** (aspect 1:1, 1024 x 1024 master)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Game damage-type icon number 3 of 13, the Acid icon: a teardrop with a bitten notch and two drips, Bone #D9D0BE and Ember Amber #E7872B, no green. A bold simple extruded, bevelled glyph embossed on a round Nightfrost #14263B medallion with a Magpie White rim, emboss height about 10% of the icon width, a thin Frostglass keyline around the medallion, a soft 4 px drop shadow to the lower right, centred, readable at 24 px, shape reads before colour. Plain Nightfrost-dark square backdrop. Framing: one icon centred and filling about 85% of the square canvas, backdrop fills the canvas, no text. Aspect ratio 1:1 (generate 1024 x 1024, deliver 256). Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; green, violet.
```

**P51. Icon 04: Bludgeoning** (aspect 1:1, 1024 x 1024 master)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Game damage-type icon number 4 of 13, the Bludgeoning icon: a mallet head in three-quarter view, Slate #3A444F and Cairn Grey #6F7A86. A bold simple extruded, bevelled glyph embossed on a round Nightfrost #14263B medallion with a Magpie White rim, emboss height about 10% of the icon width, a thin Frostglass keyline around the medallion, a soft 4 px drop shadow to the lower right, centred, readable at 24 px, shape reads before colour. Plain Nightfrost-dark square backdrop. Framing: one icon centred and filling about 85% of the square canvas, backdrop fills the canvas, no text. Aspect ratio 1:1 (generate 1024 x 1024, deliver 256). Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; violet, blood.
```

**P52. Icon 05: Fire** (aspect 1:1, 1024 x 1024 master)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Game damage-type icon number 5 of 13, the Fire icon: a single tall flame with a small inner flame, Ember Amber #E7872B and Lantern Gold #F6B84A, glowing emissive core. A bold simple extruded, bevelled glyph embossed on a round Nightfrost #14263B medallion with a Magpie White rim, emboss height about 10% of the icon width, a thin Frostglass keyline around the medallion, a soft 4 px drop shadow to the lower right, centred, readable at 24 px, shape reads before colour. Plain Nightfrost-dark square backdrop. Framing: one icon centred and filling about 85% of the square canvas, backdrop fills the canvas, no text. Aspect ratio 1:1 (generate 1024 x 1024, deliver 256). Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; violet, red, blue flame.
```

**P53. Icon 06: Force** (aspect 1:1, 1024 x 1024 master)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Game damage-type icon number 6 of 13, the Force icon: concentric rings with a solid centre dot, Glacier #5A8FB5 and Frostglass #D6EAF4, the centre dot glowing. A bold simple extruded, bevelled glyph embossed on a round Nightfrost #14263B medallion with a Magpie White rim, emboss height about 10% of the icon width, a thin Frostglass keyline around the medallion, a soft 4 px drop shadow to the lower right, centred, readable at 24 px, shape reads before colour. Plain Nightfrost-dark square backdrop. Framing: one icon centred and filling about 85% of the square canvas, backdrop fills the canvas, no text. Aspect ratio 1:1 (generate 1024 x 1024, deliver 256). Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; violet, cyan, teal.
```

**P54. Icon 07: Lightning** (aspect 1:1, 1024 x 1024 master)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Game damage-type icon number 7 of 13, the Lightning icon: a forked bolt with one short fork, Quartz White #FFF6E6 and Lantern Gold #F6B84A, glowing. A bold simple extruded, bevelled glyph embossed on a round Nightfrost #14263B medallion with a Magpie White rim, emboss height about 10% of the icon width, a thin Frostglass keyline around the medallion, a soft 4 px drop shadow to the lower right, centred, readable at 24 px, shape reads before colour. Plain Nightfrost-dark square backdrop. Framing: one icon centred and filling about 85% of the square canvas, backdrop fills the canvas, no text. Aspect ratio 1:1 (generate 1024 x 1024, deliver 256). Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; violet, blue electricity, cyan.
```

**P55. Icon 08: Piercing** (aspect 1:1, 1024 x 1024 master)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Game damage-type icon number 8 of 13, the Piercing icon: a narrow arrowhead pointing down-left, Cairn Grey #6F7A86 and Magpie White #F5F7F6. A bold simple extruded, bevelled glyph embossed on a round Nightfrost #14263B medallion with a Magpie White rim, emboss height about 10% of the icon width, a thin Frostglass keyline around the medallion, a soft 4 px drop shadow to the lower right, centred, readable at 24 px, shape reads before colour. Plain Nightfrost-dark square backdrop. Framing: one icon centred and filling about 85% of the square canvas, backdrop fills the canvas, no text. Aspect ratio 1:1 (generate 1024 x 1024, deliver 256). Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; violet, blood.
```

**P56. Icon 09: Poison** (aspect 1:1, 1024 x 1024 master)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Game damage-type icon number 9 of 13, the Poison icon: a teardrop with a small pair of fang marks, Bone #D9D0BE and Slate #3A444F, no green. A bold simple extruded, bevelled glyph embossed on a round Nightfrost #14263B medallion with a Magpie White rim, emboss height about 10% of the icon width, a thin Frostglass keyline around the medallion, a soft 4 px drop shadow to the lower right, centred, readable at 24 px, shape reads before colour. Plain Nightfrost-dark square backdrop. Framing: one icon centred and filling about 85% of the square canvas, backdrop fills the canvas, no text. Aspect ratio 1:1 (generate 1024 x 1024, deliver 256). Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; green, violet, skull.
```

**P57. Icon 10: Psychic** (aspect 1:1, 1024 x 1024 master)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Game damage-type icon number 10 of 13, the Psychic icon: a spiral with an eye-shaped notch, Frostglass #D6EAF4 and Deepice #2B4F73, a faint inner glow. A bold simple extruded, bevelled glyph embossed on a round Nightfrost #14263B medallion with a Magpie White rim, emboss height about 10% of the icon width, a thin Frostglass keyline around the medallion, a soft 4 px drop shadow to the lower right, centred, readable at 24 px, shape reads before colour. Plain Nightfrost-dark square backdrop. Framing: one icon centred and filling about 85% of the square canvas, backdrop fills the canvas, no text. Aspect ratio 1:1 (generate 1024 x 1024, deliver 256). Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; violet, a real eye with iris, magenta.
```

**P58. Icon 11: Radiant** (aspect 1:1, 1024 x 1024 master)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Game damage-type icon number 11 of 13, the Radiant icon: an eight-ray burst around a solid disc, Lantern Gold #F6B84A and Quartz White #FFF6E6, glowing. A bold simple extruded, bevelled glyph embossed on a round Nightfrost #14263B medallion with a Magpie White rim, emboss height about 10% of the icon width, a thin Frostglass keyline around the medallion, a soft 4 px drop shadow to the lower right, centred, readable at 24 px, shape reads before colour. Plain Nightfrost-dark square backdrop. Framing: one icon centred and filling about 85% of the square canvas, backdrop fills the canvas, no text. Aspect ratio 1:1 (generate 1024 x 1024, deliver 256). Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; violet, rainbow.
```

**P59. Icon 12: Slashing** (aspect 1:1, 1024 x 1024 master)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Game damage-type icon number 12 of 13, the Slashing icon: three parallel diagonal claw cuts, Magpie White #F5F7F6 and Slate #3A444F. A bold simple extruded, bevelled glyph embossed on a round Nightfrost #14263B medallion with a Magpie White rim, emboss height about 10% of the icon width, a thin Frostglass keyline around the medallion, a soft 4 px drop shadow to the lower right, centred, readable at 24 px, shape reads before colour. Plain Nightfrost-dark square backdrop. Framing: one icon centred and filling about 85% of the square canvas, backdrop fills the canvas, no text. Aspect ratio 1:1 (generate 1024 x 1024, deliver 256). Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; violet, blood.
```

**P60. Icon 13: Thunder** (aspect 1:1, 1024 x 1024 master)

```
Original stylised 3D render for a frozen-homestead fantasy game. Matte PBR look: chunky hand-sculpted forms with bevelled edges, felted wool, worn timber, poured ice and cold stone, soft matte materials, simple broad colour fields, no photoreal skin, no glossy plastic. Palette: frost blues (Nightfrost #14263B, Deepice #2B4F73, Glacier #5A8FB5, Rime #A5CDE3, Frostglass #D6EAF4), ember ambers (Cinder #4A2214, Ember Deep #A9441C, Ember Amber #E7872B, Lantern Gold #F6B84A, Quartz White #FFF6E6), magpie black #0D1014 and magpie white #F5F7F6, neutrals (Cairn Grey #6F7A86, Slate #3A444F, Bone #D9D0BE, Brass #B58A45, Hide #6E4B34). Cold violet (#6B4FA0, #2F2150, #A592D6) only as a tiny necrotic accent, under 5% of the image. Lighting: soft cold key light from the upper left at about 45 degrees, shadows falling to the lower right, cold Rime rim light, a small warm accent glow only where stated, no mid-temperature white light. Game damage-type icon number 13 of 13, the Thunder icon: a bell shape with two sound arcs, Brass #B58A45 and Frostglass #D6EAF4. A bold simple extruded, bevelled glyph embossed on a round Nightfrost #14263B medallion with a Magpie White rim, emboss height about 10% of the icon width, a thin Frostglass keyline around the medallion, a soft 4 px drop shadow to the lower right, centred, readable at 24 px, shape reads before colour. Plain Nightfrost-dark square backdrop. Framing: one icon centred and filling about 85% of the square canvas, backdrop fills the canvas, no text. Aspect ratio 1:1 (generate 1024 x 1024, deliver 256). Avoid: text, letters, numbers, logos, watermarks, black bars, letterbox, borders, children in raid scenes, bat form, bat wings, red eyes, teal or cyan or green or magenta tints, violet over 5% of the image, photoreal skin, glossy plastic, neon, lens flare, outside franchise names, brands or likenesses; violet, lightning bolts.
```

---

## 15. Open questions

1. **3D flavour:** is "hearthclay" (stylised matte PBR, chunky sculpted forms) the right 3D look, or should it move toward faceted low poly or toon shading? Only §1, §3.2 and §4 would change.
2. **Skin tones and ages:** no source states the Hunter's, Tracker's or Hearth Father's skin tone, build or age, or the children's ages and genders. Defaults are provisional.
3. **Mother Aspect:** default is folded husk-plate wing-cases (no membrane), draft-horse size. Confirm wings, wing look and size.
4. **Hearth Father's portrait:** default is both an in-world 3D framed bust and a UI badge render. Confirm.
5. **Hollow Regent and Old Beast:** approved defaults are in §5. Any further look beyond them?
6. ~~Churn colours~~ **Resolved [owner]:** locked colours with roles swapped.
7. **Acid and Poison:** allow one muted green? Default is no (shape plus Bone and Ember only).
8. **Rarity tiers:** sources only show starter, wondrous and quest. Are more tiers coming?
9. **Platform priority:** is mobile portrait the primary layout, with desktop landscape secondary? 12 × 12 grids may need a phone zoom mode.
10. **Hex orientation:** pointy-top assumed.
11. ~~Pitchfrost~~ **Resolved [owner]:** weather only, never a creature.
12. **Ani:** no pronoun assumed. Still correct?
13. **Gravesworn foe state:** rime over the ember (frost level 3) as default. Confirm.
14. **Clock-stage percentages and light shrink in §2.5** are defaults. Confirm or tune after playtest.
15. ~~Story scenes that touch the children rule~~ **Resolved [owner]:** the Youngest speaks the oath at the hearth beside the Tithe Chest, never in raid art. Middle Child's sled beat shows only the loaded sled leaving the yard.
16. **Target hardware:** the polycount, texture and scene budgets in §4 are mobile-web defaults. What is the lowest phone and browser to support? Budgets may need to drop or rise.
17. **Outside packs:** the default in §12 is reference and proportion aid only. Does the owner allow CC0 blockouts or any shipped pack assets, or is everything strictly from scratch?
18. **Card frame mode:** flat frame over 3D art (A, default) or also the 3D slab for inspect and hand fan (B)?
19. **Tokens:** live 3D meshes (default up to 24 on screen) or pre-rendered turntable sprites only?
20. **Renderer and engine version:** the specs assume Godot 4 stable with the Compatibility renderer for web. Confirm, or note if a native build with the Forward+ renderer is planned (that would allow real-time glow and SSAO).
21. **Who builds the 3D:** a human modeller, an in-house pipeline, or AI-assisted mesh generation? Any AI-generated mesh still has to follow the from-scratch and never-list rules, and the image-tool terms for commercial use need checking.

---

## Appendix: gaps found in the sources

1. **Older file conflicts.** `design-apocrypha.md` is an earlier handoff with outside names, a teal-cyan, gold and purple palette, a bat-adjacent chaos avatar and a different item-card look. It was not used. Recommend marking it deprecated.
2. **Physical descriptions.** The sources give none for the Hearth Father, three children, Fizzlet, Churnglint, Hollow Regent or Old Beast. The owner approved the defaults in §5. Still missing: skin tone, build and age for the Hunter, Tracker and Hearth Father, and the children's ages and genders. The Tracker is defined only by white hair. The Mother Aspect has no wing or size spec in the sources (§5.3 is a default).
3. **13 damage types** are listed only in the Production Handoff §3. The Apocrypha does not list them. All 13 are defined in §7.3.
4. **Hearth Father's portrait** is named as the fright signifier but never defined in the sources. §5.5 and the raid backdrop prompt define it as a framed bust.
5. **No technical art numbers** in the sources: resolutions, aspect ratios, target devices, orientation, polycounts, texture sizes. Every number in §3, §4, §6 and §10 is a default. The lighthouse dimensions (30 m, 5 m base) and the character heights are invented defaults.
6. **Churn "colours without names"** conflicted with a locked palette. Resolved by the owner: locked colours with roles swapped.
7. **Rarity tiers:** only starter, wondrous and quest appear in the data samples.
8. **Hushcube range:** the Apocrypha says one creature at 20 ft. The earlier file says a 20 ft radius. The Apocrypha was followed.
9. **Children-rule conflicts in the finished story (resolved by the owner):** Season 8, the Youngest speaks the counter oath at the hearth beside the Tithe Chest, never shown in raid art (the raid shows the Tithe Chest glow, the Fizzlet carrying words, and the shuttered window with the Hearth Father's portrait). Seasons 4 and 6, the Middle Child's sled trade shows only the loaded sled leaving the yard.
10. **Pitchfrost** is weather only (owner). It still has no defined look beyond frost script and glass-still landscapes. **Gloamwound and Hearthsun** have no art spec beyond colour (black sun versus gold sun).
11. **Web renderer limits (new for 3D).** The Compatibility renderer used for Godot 4 web export lacks real-time SSAO, SDFGI and volumetric fog, and glow is limited. That is why hero art is pre-rendered and glow is faked with emissive materials and halo cards. This changes if the target changes (question 20).
12. **Image-tool limits (new).** Many tools do not support 9:21, cannot guarantee palette hexes, and ignore negative sentences. §14 gives a fallback (generate 9:16 and extend) and the §2.4 palette audit catches drift.
