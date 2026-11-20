# Game Direction

## Identity
- **Working title:** Morrowroot. **Codename:** Black Winter Wheel. [S3] [S5]
- **One-line style:** "Mario Party for D&D" — a party board game with survival and full planar travel. [S5] [S13]
- **Format:** cooperative survival party game, 1–4 players, browser first. [S3]
- **Logline:** A hunter's household holds forty acres against a living winter while the wild beyond them slides toward chaos. Relight a black & white lighthouse, carry its bearing to a cut root, & plant a seed before the Last Bell rings. [S3]
- **Tone:** hard Black Winter survival that can turn into cute homestead moments or full planar war [S5]; hard frontier survival with soft homestead moments [S3]. Children are never harmed. The Hunter never shapeshifts. [S3]

## Pillars [S3]
1. **Home is worth defending.** Every system feeds or threatens the forty acres. The hearth is the heartbeat.
2. **The winter is a clock, not a boss.** The Pitchfrost escalates in visible stages. Players race it, then answer it.
3. **Together, with bragging rights.** The party wins or loses as one; Boasts reward flair, never victory.
4. **Short sessions, long story.** One season fits one sitting; four to eight seasons tell the whole tale.
5. **Warmth is a weapon.** Cold gathers on bodies as Chill, Warmth spends it away, & neglect invites possession.
6. **[FILLER] The party is a party.** Every board round ends in a quick minigame; the board should feel like a game night first and a survival sim second. (Restores the "Mario Party" intent of [S5] that the production handoff dropped.)

## Build decisions (owner-delegated, filled by the team on 2026-10-14) [S5 §9] [S11]
The owner asked the team to pick fillers itself and to draw on the mythos when stuck [S11] [S13]. Decisions and their mythic tie-ins:

| Decision | Choice | Mythic tie-in (as filled) |
|---|---|---|
| Engine | Godot 4, web export (single-threaded), Compatibility renderer | one world tree with every plane as a branch scene |
| Build order | turn-based board first; homestead arrives as board spaces before it becomes real-time | the board is a wheel of fate; the winter advances one stage per turning season |
| Planes in v1 | five interactive realms; the rest are board spaces + cameo cards | the hunt realm, chaos, clockwork fate, the resting fields (as first filled) → now Antlerwild, the Churn edge, Underheart, Geodehall, the Sifting [S1] |
| Netcode | online co-op 2–4, host-authoritative, turn-based; local hotseat first | a small hall of heroes against the coming winter |
| Art pipeline | lock a style apocrypha first, then generate from scratch | ice-and-fire cosmology; dread kept at the edges |
| Story tie | tight homestead focus for v1; planar expansion opens after the first raid | the safe hearth, the threshold, the return |

(The first fill named specific mythologies and outside planes; the owner then ordered the whole story reshuffled into original names [S11], so the build ships the Morrowroot equivalents.)

## Name policy (read before writing any string)
1. **Ship original Morrowroot names** in all player-facing strings and art. Ani is the only named person; every other character goes by role. [S11] [S1] [S3]
2. **Denylist lint** fails the build on any outside source name (legacy plane names, legacy NPC names, franchise names). [S3 §4, §9.7]
3. **Never** use the retired dale name; where the older naming is wanted, it is **Ten Towns**. [S13]
4. Never use the word for the old style doc; it is **apocrypha**. [S13]
5. The far-worlds section is **BEYOND**. [S13]
6. Co-written story text uses "&" and no hyphens. [S13] [S11]
7. All display strings come from a string table keyed by stable snake_case ids, so a later owner decision on naming (Q1–Q3 in `open-questions.md`) is a data change, not a code change. [FILLER]

## Source ranking for the build
1. Owner decisions recorded in this package (marked [S11], [S12], [S13]).
2. Story: Morrowroot Apocrypha [S1] → Finishing the Wheel [S2].
3. Systems/tech: Production Handoff [S3]; art: Style Apocrypha v0.2 3D [S4].
4. This package's [FILLER] (lowest; replace freely).
5. Legacy Design Handoff [S5] and the Planesbound atlas [S8]: source of modes, motifs and layout, **not** of shipped names.

## Scope
**v1 in:** board & hex movement, event deck, homestead building, resources, hunting, raids, clock & possession, Gravesworn ember rule, Morrowseed win path, cards & items, five Veilway folios [S3]; restored Party Board minigames and Hearth Night, Will-o'-Wisp races, standalone Endless Winter and Raid Gauntlet [FILLER].
**v1 out:** real-time homestead, the Far Worlds via the Askew, Ossuarch's call, the second cutting [S3].

## Win / lose (campaign) [S1]
Win: relight the Magpie Light, deliver the true bearing to the cut taproot, & plant the Morrowseed in Antlerwild before Last Bell (one of four endings). Lose: Last Bell; hearth cold for a full season; or Ani's light extinguished.

## The newest canon: WW4 Singularity
Owner canon from 2026-11-10 ("Winter is possessed, there's a Wyrm in you eating you alive, & we will Win if we follow The Way.") is recorded uncut in `story-apocrypha.md` §12 [S6]. Its theme — protect a small light by hand in a rising wind, keep the local weirdnesses worth keeping — is the game's own spine (the Magpie Light, the Warding Lantern, Ani, the Ten Towns' odd trades). Build impact: one codex page + one hero image (P61) [FILLER placement].
