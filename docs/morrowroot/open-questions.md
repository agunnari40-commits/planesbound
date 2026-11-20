# Open Questions — Conflicts & Gaps Found

Each item: what conflicts, where, and the **default this package uses** so the build is never blocked. Owner can overrule any default; most are a data/string change.

## Naming
**Q1 — Ten Towns vs Ten Hearths.** The owner's current vocabulary (and memory [S13]) says *Ten Towns*; the reshuffled lore and every production file said *the Ten Hearths* [S1] [S2] [S3]. The Ten Towns rename was applied only to the legacy handoff, after the reshuffle [S11]. *Default (owner confirmed for this roll-in):* ship **Ten Towns** everywhere; legacy "Ten Hearths" is not player-facing. Keep `ten_towns` as the string-table key (and map any legacy `ten_hearths` alias to it).

**Q2 — How much older vocabulary may ship?** The owner ordered "remove all official names … no already-used names anywhere" [S11]. But the owner still talks in atlas terms: Black Winter, the Lighthouse, Inner Ring, Will-o'-Wisp Race, Lighthouse Race. *Default:* generic words (lighthouse, inner ring, will-o'-wisp, black winter) are allowed as **epithets** in strings ("the Pitchfrost, the Black Winter"); proper names from published settings are not (denylist).

**Q3 — The atlas and the game use different names for the same places.** Planesbound (live) is a Planescape-named gazetteer [S8] [S9]; the game is Morrowroot. *Default:* the game never shows atlas names; the crosswalk lives in `private/` for the lint and for humans. If the owner wants an in-game atlas or a link to planesbound.grok.me, decide whether it shows atlas or game names.

## Lore
**Q4 — Sundering numbering.** Atlas: City of Shade is "Shade's secret Third Sundering"; the "Fourth Sundering has not stopped" (dark seeds soldering planes) [S8] [S9]. Morrowroot: the *Bell Splitting* is the public Third; the *Quiet Shear* is the secret Fourth (counted fourth because Ledgerfast's clerks found it last); the Nightburrs are present-day [S1] [S2]. *Default:* Morrowroot numbering.

**Q5 — What sits at the hub.** Atlas: the Beastlands has been pulled *into* the hub where the Outlands should be [S8]. Morrowroot: the Axlestone is the hub, Antlerbrook (Antlerwild's gate town) stands *nearest* it [S1]. *Default:* Axlestone space drawn inside the wild (art matches the atlas), Antlerbrook as the hub's first ring space.

**Q13 — Dust, Mineral, Earth and the Ani arc.** Atlas: Dust = "Pilots of the Agentic Body", heroes of the Ani arch who run roads to stop Earth sealing Ani's leadership into the delve; Mineral "a closed room does not open twice"; Mineral & Dust are adjacent stories to the race, not legs [S8] [S9]. Morrowroot: the Sifting is memory & truth; the Old Beast hides Mineral to protect it, and is not a villain [S1]. *Default:* Morrowroot motives; "pilots" flavor is unused.

**Q14 — Gulthias blight** appears on the atlas (Celestia, Arborea, Ooze) [S8] with no Morrowroot equivalent. *Default:* race notes render it as "Nightburr blight" [FILLER].

**Q15 — Loose realm matches.** The 16 outer realms align one-to-one by ring order, but four fits are loose (Gnashmoor, Carrion Tiers, Ledgerfast, Tallow Spires) and Wrenchwind ↔ Ysgard is by alignment only. Matters only for layout & the race. *Default:* as in `story-apocrypha.md` §2.

**Q16 — Legacy threats with no home.** The original handoff's frost giants, yetis, orcs, ice mephits, the possessed black frost dragon, and the eye avatar over the blood-stained chest [S5]. The last became the Churnglint over the Tithe Chest [S1]; the rest collapse into four creature families [S3]. A possessed dragon fight under the glowing mountain gate was a signature legacy image. *Default:* no dragon foe in v1; candidate for a later "possessed glimmerhusk" story beat (would need owner OK because the Mother Aspect is a glimmerhusk).

**Q12 — Singularity placement.** Canon is recorded uncut [S6]. A shorter gazetteer draft exists [S7] but rewords the owner's text and was flagged not ready; the Planesbound WW4 entry was offered once and is awaiting the owner's yes (no publishing until then) [S13]. *Default (game):* a codex page after the Last Muster + new 3D hero art (P61). Owner to confirm the in-game placement and whether the game should also say "WW4".

## Modes & systems
**Q6 — Raid grid scale.** 12 × 12 homestead grid (each cell ≈110 ft on 40 acres) vs raids "in 5 ft squares" [S3]. *Default:* 32 × 32 tactical zoom of the cabin compound.

**Q7 — Will-o'-Wisp Race rules.** The atlas gives legs, notes, start/finish lines and the "miss a turn" endings only [S8]; there are no rules, rewards, or unlock timing. "Lighthouse Race" = outer Slide Circuit and "Inner Ring & Will-o'-Wisp Race" = inner leyline course is an interpretation of the owner's wording. *Default:* rules in `play-modes.md` §6; no holds granted (protects clock math); inner race unlocks when the lamp is relit.

**Q8 — Minigames.** The legacy handoff asked for Mario Party style minigames [S5]; no later file defines any. All 12 minigames, the round-end minigame rule and Hearth Night are [FILLER]. Confirm the list, count and whether minigames can affect campaign resources.

**Q17 — Ani as playable and a lose condition** [S3 §9.3]. *Default:* playable with a hard floor of 1 light that only possession or a story scene can breach.

**Q19 — Hushcube area.** Legacy Tesseract Prison: 20 ft radius [S5]; apocrypha: one creature at 20 ft [S1]. *Resolved:* apocrypha wins.

**Q20 — Children in minigames.** Rule: never in raids or danger [S1] [S4]. *Default:* children are non-interactive background in two safe homestead minigames only.

## Art
**Q9 — Gate glyph & legacy palette.** The legacy motif "glowing gate symbol (vertical cyan-purple bars) on ice mountains" and "teal/cyan aurora, gold luck light, purple necrotic" [S5] are on the v0.2 never-list as palette drift [S4 §13.1]. *Default:* redesign the gate as vertical Frostglass/Rime bars with a ≤3% violet edge.

**Q21 — Atlas art is not the game's art.** Planesbound's plane images and maps read as painted 2D [S8]; the game is stylized 3D [S4] [S12]. *Default:* atlas images = layout & mood reference; all board art is rebuilt in hearthclay 3D.

**Q18 — Style apocrypha's own open questions (still unanswered)** [S4 §15]: hearthclay vs low poly/toon; skin tones & ages; Mother Aspect wings/size; target phone & browser (drives every budget); CC0 base meshes as reference only?; card frame mode A or B; live 3D tokens or sprites; Compatibility vs Forward+; who builds the 3D and whether AI meshes are allowed; image tool to format prompts for; Acid/Poison green; rarity tiers; phone zoom for 12 × 12 grids.

## Build & sources
**Q10 — Where is "our game"?** No game repository exists on the box. The package targets the production stack (Godot 4, GDScript, web export) [S3]. If the main build is a different stack (for example the Planesbound site is a React app built in grok.com Build), keep the rules core and `data/` as-is and port only the engine layer.

**Q11 — Missing legacy files.** The original handoff points to `outer-planes.json`, `/workspace/artifacts/imagine_images/` and `/workspace/artifacts/rendered/` [S5]; they were on "the Simulator's machine" and were never on this box [S11]. The production handoff's converter assumes the catalog may never arrive [S3 §4]. *Default:* author the five folios by hand (done in part in `data/realms.json`). The parent should check the original grok.com chat for these (see `sources.md` §4).

**Q22 — No transcript of the owner's main chat with Blits was readable** from this run (only the voice call log and the teammate bot transcripts). Decisions made only in that chat may be missing.

**Q23 — Legacy filename.** The original handoff on the box still carries the old style-doc word in its filename (see `sources.md`, S5). Not renamed (read-only task); recommend renaming it to `design-handoff-original.md`.
