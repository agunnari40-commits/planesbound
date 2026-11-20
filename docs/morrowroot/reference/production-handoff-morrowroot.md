# Morrowroot: Production Handoff

*Gameplay build package for the Morrowroot Apocrypha. Sources rank in this order: the apocrypha (`story-apocrypha.md`), then the finished story, "Finishing the Wheel" (`story-complete.md`), then this package. Where they differ, the higher source wins. Numbers marked "tunable" are starting values for playtest.*

---

## 1. The Pitch: Hold the Hearth, Find the Bearing

**Format.** Cooperative survival party game for 1 to 4 players, browser first.

**Logline.** A hunter's household holds forty acres against a living winter while the wild beyond them slides toward chaos. Relight a black & white lighthouse, carry its bearing to a cut root, & plant a seed before the Last Bell rings.

**The fantasy.** You claim a homestead in Rimmerdale, the frozen north of Antlerwild. Days happen on a hex board: hunt, trade with the Ten Hearths, build, roll events. Each season ends in a raid on the homestead. Between raids the party walks the Veilway into realms that hold a buried history. The Pitchfrost cannot be killed, only answered.

**Pillars**

1. **Home is worth defending.** Every system feeds or threatens the forty acres. The hearth is the heartbeat.
2. **The winter is a clock, not a boss.** The Pitchfrost escalates in visible stages. Players race it, then answer it.
3. **Together, with bragging rights.** The party wins or loses as one; Boasts reward flair, never victory.
4. **Short sessions, long story.** One season fits one sitting; four to eight seasons tell the whole tale.
5. **Warmth is a weapon.** Cold gathers on bodies as Chill, Warmth spends it away, & neglect invites possession.

**Tone.** Hard frontier survival with soft homestead moments. Children are never harmed. The Hunter never shapeshifts.

---

## 2. The Loop: One Season, One Sitting

**Season structure**

1. **Dawn.** Apply clock stage effects, spoil unsmoked Food, pay Ani's light tithe, refresh Stamina & mana.
2. **Board turns 1 to 4.** Each player moves, takes one space action (hunt, build, trade, gather, craft), then resolves an event. Household members work assigned jobs.
3. **Raid.** The wave arrives on turn 4 & is fought in tactical rounds until it breaks or the hearth falls.
4. **Close.** Award Boasts, check clock advancement, autosave. The session ends here.

**Campaign arc.** Eight seasons, one realm focus & one signature raid each. Season beats, household moments & realm folios are written out in `story-complete.md`; build from it.

| Season | Stage in play | Realm | Signature raid |
|---|---|---|---|
| 1 | zero | Rimmerdale only (Veilway shut until this raid is survived) | Six frost raiders |
| 2 | Hoarstep | Antlerwild | Slide beast stampede |
| 3 | Glasswater | The Churn, eastern edge | Nightburr thralls hunting the Warding Lantern |
| 4 | Glasswater | Underheart (the Ani & Old Beast quarrel, mid campaign hinge) | The Crack Swarm |
| 5 | Long Hush | Geodehall | The Silent Raid |
| 6 | Long Hush | The Sifting | The Askew Leak |
| 7 | Stillmarrow | The Sifting deep, then Underheart | The Frozen Muster, doubled |
| 8 | Stillmarrow | Antlerwild, at the root fork | The Last Muster, broken by the counter oath |

**Players.** The playable roster is the Hunter, the Snow Crowned Tracker, the Mother Aspect & Ani; the Gravesworn travels with Ani as an AI ally. Solo fills empty seats with AI companions. Online coop seats 2 to 4.

**Boasts.** Per player tallies such as Best Hunt, Boldest Rescue, Longest Watch & Warmest Hand. They unlock cosmetics only.

**Win.** Relight the Magpie Light, deliver the true bearing to the cut taproot, & plant the Morrowseed in Antlerwild before Last Bell. A win lands on one of four endings (main, mercy, hard cost, bittersweet), chosen by campaign state; triggers are in section 9.

**Lose.** The clock reaches Last Bell; household Warmth sits at zero for a full season; or Ani's light is extinguished.

---

## 3. Systems: The Machine Room

| System | Purpose | Inputs → Outputs | v1 | Depends on | Size |
|---|---|---|---|---|---|
| Board & hex movement | Shared map of the dale & the Rimwheel | Stamina, position → space actions, event draws | In | Data model | M |
| Event deck | Surprise, story beats, realm cameos | Draws, clock stage, tags → choices, resource changes, clock pushes | In | Board, clock | M |
| Homestead building | Forty acre grid of structures & household jobs | Resources, build actions → defense, Warmth radius, crafting, storage | In | Resources | M |
| Resources | The economy | Hunts, gathering, trade → costs paid for builds, cards, travel | In | None | S |
| Hunting | Food & Hide supply | Stamina, Ember, clock stage → Food, Hide, hunt events | In | Board, resources, clock | S |
| Raid tactical rounds | The season's climax | Wave data, structures, party → damage, fright, loot, Boasts | In | Homestead, cards, creatures | L |
| Pitchfrost clock & possession | Escalation & pressure | Season end, Nightburrs, Chill → stage effects, possessed characters | In | Resources, raids | M |
| Gravesworn ember rule | Ally who can turn | Clock steps, Ani's rests → ally or foe state | In | Clock, raids | S |
| Morrowseed win path | Campaign spine | Quest items, expedition finds → victory | In | Expeditions, homestead | M |
| Card & item mode | Abilities, artifacts, deckbuilding | Deck, mana, attunement, targets → effects, damage | In | Data model | L |
| Planar expedition (Veilway) | Story realms & rare loot | Expedition deck, supplies, Lightshard → shards, quest items | In, five realms | Cards, board | L |
| Far Worlds via the Askew | Crossover content | n/a | Out | n/a | n/a |
| Real time homestead | Survival sim mode | n/a | Out | n/a | n/a |

**Board.** Two layers. The Dale board holds the forty acres, the Ten Hearths (Kettlecross market, Coldharrow nearest the Rimeward), the Rimeward & Bearing Head. The Wheel board holds the Axlestone, the Hinge Towns with Antlerbrook nearest the hub, & one space per cameo realm. One hex costs 1 Stamina; each character has 4 Stamina per turn (tunable).

**Resources.** Timber, Stone, Food, Ember & Lightshard are per player; start at 6, 4, 3, 2 & 1. Warmth is a shared household pool starting at 10. Chill is tracked per character; ending a turn outside any Warmth radius adds 1 Chill (tunable). Hide & Stamina are secondary counters. Each character eats 1 Food at dawn; without a Smokehouse half of stored Food spoils (tunable).

**Hunting.** Snowfield hunts cost 1 Stamina & 1 Ember & yield 1d4+1 Food. Big game costs 2 Stamina & yields 2d4+2 Food plus 1 Hide. Yield drops by 1 per clock step. Each hunt also rolls its realm's hunt table for an encounter.

**Homestead.** Structures sit on a 12 by 12 grid. Palisade segment (3 Timber, 1 Stone): +2 raid defense. Smokehouse (4 Timber, 2 Stone): Food never spoils. Forge (3 Stone, 2 Ember, 1 Lightshard): crafting. Warding Lantern (2 Lightshard, 1 Stone): +3 Warmth radius, blocks possession. The Eldest Child works the forge, the Middle Child the stores, the Youngest listens with the Fizzlet. The Tithe Chest under the floor keeps the homestead livable; the Churnglint above it trades riddles for Warmth.

**Raids.** Fought on the homestead grid in 5 ft squares. Order: players, then household, then enemies. Each point of raid defense absorbs 1 damage per round before structures take hits. The first raid is 6 frost raiders, 3 HP & 1 damage each. If an enemy reaches the cabin, the children are frightened: lose 2 Food & 2 Warmth. The Hearth Father never leaves the cabin & fights from it as a fixed defender.

**Clock & possession.** Stages advance at each season's close. A **hold** cancels the next advance; uprooting a Nightburr or relighting the Magpie Light earns one, & only one hold can be banked. A Nightburr that roots spends a banked hold, or pushes the clock at once if none is banked. Each uprooted Nightburr also brightens the Hearthsun one notch on the campaign panel. The full story spends four advances & three holds, landing the finale in season 8. Hoarstep cuts hunt yield; Glasswater closes trade with the Ten Hearths; Long Hush silences the outdoors & enables possession; Stillmarrow doubles raids; Last Bell ends the game. From Long Hush on, a character ending a turn outside warmth with 3 or more Chill is possessed for one round & acts under AI control as a foe. A Warmth card or the Mother Aspect's breath breaks it early. Three possessions in one session make a frost thrall, cleansed only at the Magpie Light.

**Gravesworn.** Ember maximum 3 (tunable). It loses 1 ember per clock step & refills when Ani rests in Geodehall. At zero, or when possessed, it fights as a foe for that round. Defeating it as a foe returns it as an ally with 1 ember; it is never lost.

**Morrowseed path.** Three tracks shown on one campaign panel. *Light:* the Eldest Child forges the new lens, & Ani lights the lamp from Geodehall's stored light. *Bearing:* recover the Needlesphere from the Sifting & pass the beam through it. *Seed:* recover the Morrowseed from the Sifting, strike the bargain with the Old Beast, & plant it at the root fork. The finale scene adds the Youngest speaking the Emberbond's counter oath.

**Cards & items.** Mana maximum 10; each character gains 3 mana at the start of every board turn & raid round, unspent mana carries over (tunable). Three attunement slots per character. Saves use six ability scores. Thirteen damage types: Acid, Bludgeoning, Cold, Fire, Force, Lightning, Necrotic, Piercing, Poison, Psychic, Radiant, Slashing, Thunder. Cold is the winter's signature, Necrotic the Nightburrs'; most foes resist one & fear Fire or Radiant. Starter cards: Hearth Spark, Antler Call, True Bearing. Template item: the Hushcube.

**Expeditions.** Entering the Veilway costs 1 Lightshard per traveler (tunable). A traveler spends turns 2 to 4 in a realm folio & returns for the raid. Each folio has an alignment effect, a gate condition, a hazard, an objective, & a 12 card expedition deck; draw 2, play 1 each turn.

---

## 4. Data Model: The Ledger

All content ships as JSON under `data/`, one file per table, validated against JSON Schema at load. Ids are snake case & stable forever.

### Realms
Fields: `id, name, ring` (outer, shore, seam, beyond, hub), `leaning, element, interactive, board_space, alignment_effect, gate_condition, hazard, hunt_table, event_tags, source_ref`.
```json
{"id":"antlerwild","name":"Antlerwild","ring":"outer","leaning":"good_untamed","element":null,"interactive":true,"board_space":"wheel_07","alignment_effect":{"id":"endless_hunt","text":"Hunts yield 1 extra Food; fleeing costs double Stamina."},"gate_condition":"Carry a trophy from a big game hunt.","hazard":"slide_fog","hunt_table":"ht_herd_roads","event_tags":["hunt","slide"],"source_ref":"src_0007"}
{"id":"underheart","name":"Underheart","ring":"shore","leaning":"neutral","element":"earth","interactive":true,"board_space":"wheel_19","alignment_effect":{"id":"stone_weight","text":"Movement costs 1 extra Stamina; Stone gathering doubles."},"gate_condition":"Pay Ani's season tithe in advance.","hazard":"ceiling_shift","hunt_table":"ht_underheart","event_tags":["old_beast","lock"],"source_ref":"src_0021"}
```

**Converting the outer planes catalog.** The original catalog may not be on this machine; the converter assumes plane records carrying a name, alignment, layers, inhabitants, alignment effects & gate conditions.
1. Match each source plane to a apocrypha realm by leaning for the outer band, by element for shores & seams.
2. Keep structure only: layer count, alignment effect mechanics, gate condition mechanics.
3. Drop every source name, proper noun & lore line. Inhabitants become generic creature families or new names from the apocrypha.
4. Write a `source_ref` code, never the source name. The code to name map stays in a private file outside the repo.
5. A build lint fails on any token from a private denylist of source names.
6. Planes with no apocrypha match are skipped & logged.

### Cards
Fields: `id, name, kind` (ability, warmth, response), `mana_cost, range_ft, target, damage, save, effects, owner, rarity, art_ref`.
```json
{"id":"hearth_spark","name":"Hearth Spark","kind":"warmth","mana_cost":2,"range_ft":30,"target":"ally","damage":null,"save":null,"effects":[{"op":"remove_chill","amount":2}],"owner":"any","rarity":"starter","art_ref":"card_hearth_spark"}
{"id":"antler_call","name":"Antler Call","kind":"ability","mana_cost":3,"range_ft":0,"target":"self","damage":{"dice":"1d6","type":"piercing","per_round":true,"target":"beast"},"save":null,"effects":[{"op":"summon","id":"hunt_spirit","rounds":2}],"owner":"any","rarity":"starter","art_ref":"card_antler_call"}
```

### Items
Fields: `id, name, rarity, attunement, mana_cost, range_ft, target, save, damage, conditions, extra_effects, craft, flavor`.
```json
{"id":"hushcube","name":"Hushcube","rarity":"wondrous","attunement":true,"mana_cost":7,"range_ft":20,"target":"one_creature","save":{"stat":"wis","on_fail":true},"damage":{"dice":"Xd8","x":"nightburrs_on_board","x_min":1,"type":"necrotic"},"conditions":[{"id":"stunned","rounds":1}],"extra_effects":[{"op":"end_effects","tags":["hope","courage"],"lock_until":"target_next_turn_end"}],"craft":null,"flavor":"Grey crystal holding a sliver of the Ebbing Dark."}
{"id":"magpie_lens","name":"Magpie Lens","rarity":"quest","attunement":false,"mana_cost":0,"range_ft":0,"target":"none","save":null,"damage":null,"conditions":[],"extra_effects":[{"op":"unlock","id":"track_light"}],"craft":{"structure":"forge","crafter":"eldest_child","cost":{"lightshard":3,"stone":2}},"flavor":"Ground by the Eldest Child for the dark lamp."}
```

### Creatures
Fields: `id, name, family` (frost_raider, nightburr_thrall, slide_beast, frost_thrall), `hp, damage, damage_type, move_sq, resist, vulnerable, behavior, wave_cost`.
```json
{"id":"frost_raider","name":"Frost Raider","family":"frost_raider","hp":3,"damage":1,"damage_type":"cold","move_sq":6,"resist":["cold"],"vulnerable":["fire"],"behavior":"rush_nearest_structure","wave_cost":3}
{"id":"burr_thrall","name":"Nightburr Thrall","family":"nightburr_thrall","hp":5,"damage":2,"damage_type":"necrotic","move_sq":4,"resist":["necrotic"],"vulnerable":["radiant"],"behavior":"seek_lantern","wave_cost":5}
```

### Structures
Fields: `id, name, cost, effect, hp, footprint, requires, build_actions`.
```json
{"id":"palisade_segment","name":"Palisade Segment","cost":{"timber":3,"stone":1},"effect":{"raid_defense":2},"hp":6,"footprint":[1,1],"requires":[],"build_actions":1}
{"id":"warding_lantern","name":"Warding Lantern","cost":{"lightshard":2,"stone":1},"effect":{"warmth_radius":3,"blocks_possession":true},"hp":4,"footprint":[1,1],"requires":["forge"],"build_actions":1}
```

### Events
Fields: `id, name, deck` (dale, cameo, expedition), `realm, clock_min, clock_max, text, choices, tags`. Each choice: `label, cost, outcome`.
```json
{"id":"herd_in_fog","name":"Herd in the Fog","deck":"dale","realm":"antlerwild","clock_min":0,"clock_max":4,"text":"A herd walks east into fog that should not move.","choices":[{"label":"Follow","cost":{"stamina":2},"outcome":{"food":4,"chill":1}},{"label":"Mark the edge","cost":{},"outcome":{"boast":"longest_watch"}}],"tags":["slide"]}
{"id":"ledger_bell","name":"A Promise Recorded","deck":"cameo","realm":"ledgerfast","clock_min":0,"clock_max":4,"text":"A clerk offers to record your oath to the dale.","choices":[{"label":"Swear","cost":{"ember":1},"outcome":{"warmth":2}},{"label":"Decline","cost":{},"outcome":{}}],"tags":["oath"]}
```

### Clock stages
Fields: `index, id, name, text, effects`.
```json
{"index":1,"id":"hoarstep","name":"Hoarstep","text":"Frost at dawn.","effects":[{"op":"hunt_yield_penalty","amount":1}]}
{"index":3,"id":"long_hush","name":"Long Hush","text":"Sound dies outdoors.","effects":[{"op":"enable_possession","chill_threshold":3}]}
```

### Characters
Fields: `id, name, role` (player, ally, household, npc), `playable, hp, stamina, abilities, starter_deck, rules, raid_presence, descriptor_ref, never_depict`.
```json
{"id":"hunter","name":"The Hunter","role":"player","playable":true,"hp":12,"stamina":4,"abilities":{"str":3,"dex":2,"con":2,"int":0,"wis":1,"cha":0},"starter_deck":["antler_call","true_bearing"],"rules":[],"raid_presence":"field","descriptor_ref":"desc_hunter","never_depict":["bat_form","shapeshift"]}
{"id":"gravesworn","name":"The Gravesworn","role":"ally","playable":false,"hp":14,"stamina":4,"abilities":{"str":3,"dex":1,"con":3,"int":0,"wis":1,"cha":0},"starter_deck":[],"rules":["ember_rule"],"raid_presence":"field","descriptor_ref":"desc_gravesworn","never_depict":[]}
```

---

## 5. Content Slate: What to Write for v1

| Content | v1 count | Notes |
|---|---|---|
| Event cards, dale deck | 40 | Spread across clock stages; 8 touch household arcs |
| Event cards, realm cameos | 28 | One per noninteractive realm, seam & place beyond the rim |
| Hunt tables | 6 | Rimmerdale snowfield, Rimmerdale big game, Antlerwild herd roads, Churn edge, Underheart, Sifting; 12 entries each |
| Raid waves | 12 | 3 per clock stage before Last Bell; the eight signature raids from section 2 are among them; Stillmarrow doubles automatically |
| Creatures | 8 | 2 per family |
| Starter cards | 24 | 6 per playable character, including the three apocrypha cards |
| Item cards | 12 | Hushcube is the template; 3 quest items |
| Structures | 10 | The four apocrypha structures plus Hearth, Storehouse, Hide Rack, Barn, Sled Shed, Watch Post |
| Realm folios | 5 | Antlerwild with Rimmerdale, the Churn's eastern edge, Underheart, Geodehall, the Sifting; each 12 expedition cards, 1 objective, 1 shard of the Shear |
| Story scenes | 10 | First raid, Tithe Chest, Ani's arrival, Old Beast quarrel, bargain, lens, lamp, Regent, planting, counter oath |
| Household beats | 64 | One per character per season, written in `story-complete.md`; delivered as dale events or season close vignettes |
| Ending scenes | 4 | Main, mercy, hard cost & bittersweet, each with household, Ani & Gravesworn outcomes & an epilogue |
| Ten Hearths | 10 | Each town's trade, rumor & finale role from `story-complete.md` |
| Lore codex | 30 | Collectible entries found through hunts, expeditions & events |

---

## 6. Art Direction: The Look Book

**Everything is 3D.** The look is "hearthclay": stylised matte 3D with chunky, hand sculpted forms that read as clay, felted wool, worn timber, poured ice & cold stone, lit by one small warm light in a large cold scene. The full spec lives in `morrowroot-style-apocrypha.md` (v0.2, 3D): palette & lighting, materials, texture & polycount budgets, rigs, card frame, realm kits, naming & prompt sheets. Where this section & the style apocrypha differ, the style apocrypha wins.

**Style apocrypha first.** One locked page before any production art: palette of frost blues, ember ambers, magpie black & white; lanterns against snow; frost that creeps across UI as the clock advances. Necrotic effects read as cold violet smoke, kept as a small accent. Every asset is generated from scratch to the style apocrypha. Prior renders serve as mood reference only, never as source, & nothing from them carries an outside name or likeness.

**Character descriptor sheets.** One sheet each, rendered from the 3D model: orthographic front, side & back, a three quarter view, plus expression views:
* **Hunter:** tall, rugged, short dark hair, human, no animal features. Never a bat form, never shapeshifting.
* **Snow Crowned Tracker:** white hair, reads snow like script.
* **Mother Aspect:** young glimmerhusk, scales like moon pale feldspar, warm breath glow.
* **Ani:** drifting will light, glow shifting quartz white to amber with mood.
* **Gravesworn:** barrow hunter undead, frost in the ribs, ember glow in the chest.
* **Hearth Father, Fizzlet, three children, Churnglint, Hollow Regent, Old Beast.**

**Children rule.** Children appear only in safe scenes. They are never shown in raids; fright reads as a shuttered cabin window & the Hearth Father's portrait.

**Card frame template.** A 3D lit, embossed frame with card art pre-rendered from 3D scenes. Name bar, mana gem, art window, type line with attunement mark, rules box, damage type icon, rarity pip. Thirteen damage icons, with Cold & Necrotic drawn first.

**UI screens.** Rendered over live 3D backdrops. Title, lobby & join, roster pick, Dale board, Wheel board, homestead grid, raid view, card hand & deck editor, expedition folio, campaign panel (clock & Morrowseed tracks), event card overlay, Boasts tally, settings, save & load.

**Audio.** Wind beds that thin as the clock climbs until Long Hush mutes outdoor ambience; hearth crackle as the safety cue; a bell motif per clock stage; magpie calls at Bearing Head; Fizzlet static stings.

---

## 7. Tech: The Engine Room

**Engine.** Godot 4 (current stable), GDScript, web export as the primary target with desktop builds for test. Use single threaded web export to avoid cross origin isolation headers on hosting.

**Rendering.** Web export uses Godot's Compatibility renderer. Board tokens, the homestead, the raid view, the card inspect view & UI backdrops run as live 3D. Card art, damage icons, hero stills, event overlays & descriptor sheets are pre-rendered from the same 3D scenes. Models ship as glTF binary (`.glb`), Y up, 1 unit = 1 metre; textures as albedo, normal (OpenGL Y+) & packed ORM. Polycount, texture & memory budgets follow style apocrypha section 4.

**Networking.** Host authoritative, turn based. Clients send intents; the host validates, resolves with a seeded RNG, & broadcasts state snapshots. Browsers cannot use ENet, so use WebSocketMultiplayerPeer through a small relay server. Local hotseat is the first test mode. A dropped client's seat passes to AI until rejoin.

**Saves.** The host owns the save. Autosave at season close as versioned JSON in `user://` (IndexedDB on web), plus export & import of a save file for moving campaigns between machines. Keep the last 3 seasons as rollback slots.

**Repo structure**
```
morrowroot/
  data/            realms, cards, items, creatures, structures, events, clock, characters
  schemas/         JSON Schema per table
  tools/           plane converter, content lint, denylist check
  game/
    core/          state, rules, rng, save
    board/         hex maps, movement
    homestead/     grid, structures, jobs
    raid/          tactical rounds, ai
    cards/         deck, mana, effects
    expedition/    folios, Veilway
    net/           host, client, relay protocol
    ui/            screens
  assets/          export/ (glb models, textures, renders), audio, fonts; .blend sources stay outside the import path
  tests/           rules tests, golden saves
  server/          relay
```

Rules code stays free of scene nodes so it runs headless in tests & on the host. Milestones follow in section 8.

---

## 8. Milestones: The Road to v1

| Milestone | Scope | Exit criteria |
|---|---|---|
| M0 Data & prototype board | Schemas, loaders, lint, Dale board, movement, event draws, hotseat | All eight tables validate; 4 turns playable hotseat; denylist lint passes |
| M1 Homestead & card system | Grid, four apocrypha structures, resources, hunting, mana, attunement, three starter cards, Hushcube | Full season of board turns without raid; every apocrypha number reproduced by rules tests |
| M2 First raid | Raid grid, frost raiders, raid defense, fright, Hearth Father | The first raid winnable & losable; season closes & autosaves |
| M3 Clock & possession | Five stages, Nightburr pushes, Chill, possession, frost thrall, Gravesworn ember | Clock reaches Last Bell & ends the game; possession breaks by both apocrypha methods |
| M4 Antlerwild slice | Veilway, Antlerwild folio, Wheel board, Morrowseed panel | One full campaign path playable solo with AI companions, start to win |
| M5 Coop | Relay, lobby, host authority, rejoin, save ownership | 4 browsers finish a season over the internet with no desync in 10 runs |
| M6 v1 content pass | Remaining folios, all section 5 content, final art & audio | Content counts met; 8 season campaign completes & all four endings are reachable; QA sign off on the checklist |

---

## 9. Risks & Open Questions

1. **Clock math.** Resolved by the finished story: the hold rule in section 3 carries the campaign to season 8.
2. **Mana economy.** The apocrypha fixes costs, not income. *Default:* the income in section 3, tuned in M1.
3. **Ani as playable.** Ani is also a lose condition. *Default:* playable, with a hard floor of 1 light that only possession or a story scene can breach.
4. **Expedition absence.** Travelers away leave the raid thin. *Default:* travelers return for every raid; AI fills empty seats.
5. **Catalog unavailable.** The source file may never arrive. *Default:* author the five folios by hand; run the converter later for cameo data.
6. **Web networking.** Relay hosting adds ops cost. *Default:* one small relay instance; hotseat & solo work offline.
7. **Name leakage.** Old renders & notes carry outside names. *Default:* denylist lint on data & strings, & art briefs written only from descriptor sheets.
8. **Hearth cold rule.** "A full season" needs a precise test. *Default:* Warmth at zero at dawn & still zero at season close.
9. **Web 3D performance.** Live 3D in a phone browser can stutter. *Default:* hold the style apocrypha budgets, pre-render hero art, & check frame rate on a midrange phone from M0 onward.
10. **Ending triggers.** The story defines four endings but only one trigger. *Default:* hard cost if the Dim Nursery Nightburr is still rooted when the lens is set (Geodehall's store runs dry); otherwise mercy if the party chose to spare the Old Beast, the Churnglint & the Regent at their scenes; otherwise bittersweet if the party asked the Moot why the lamp was forbidden during the season 7 bargain; otherwise main.
11. **Askew Leak creatures.** The season 6 wrong angle beasts have no creature family. *Default:* a slide beast variant, so v1 keeps four families.
12. **Duskmarrow on the Wheel board.** *Default:* a hidden space, revealed in season 8.
13. **Story items held for expansions.** The Morrowseed's sibling cutting & Ossuarch's call stay silent in v1. The children show no visible aging until the epilogues. Ani has no pronoun; write around it.

---

## 10. Prompt Blocks

**Gameplay engineer**
```
You are building Morrowroot in Godot 4 (GDScript, web export, host authoritative coop 2 to 4). Source of truth: the Morrowroot Apocrypha, then the finished story (story-complete.md), then this handoff. Implement the milestone named below. Keep rules code free of scene nodes & cover every apocrypha number with a rules test. Load content only from data/ JSON validated by schemas/. Use a seeded RNG owned by the host. Report: what shipped, tests added, exit criteria status, open issues.
Milestone: [M0 to M6]
```

**Narrative designer**
```
You write content for Morrowroot. Follow the season beats, household moments & realm folios in the finished story (story-complete.md). Use only names from the Morrowroot Apocrypha & the finished story; Ani is the only named person; invent no outside names. Children are never harmed & never appear in raids. The Pitchfrost is answered, not killed. Write [count] [event cards / hunt table entries / folio cards] as JSON matching schemas/[table].json, with ids in snake case, short evocative text, & mechanical outcomes using existing resources only. Flag any lore you had to assume.
```

**Artist**
```
Create original stylised 3D art for Morrowroot from scratch in the "hearthclay" look (matte, hand sculpted, PBR), following the style apocrypha v0.2: frost blues, ember ambers, magpie black & white, lanterns against snow, violet only as a Necrotic accent. Work from the descriptor sheet for [character / prop / environment kit / card / screen]. The Hunter is tall, rugged, short dark hair, fully human, never a bat form. Children appear only in safe homestead scenes. Prior renders are mood reference only; copy nothing. Deliver: [asset] as a .blend source & a .glb export (Y up, 1 unit = 1 metre) with albedo, normal & ORM maps, LODs within the style apocrypha budgets, & a pre-rendered still at [size], named per style apocrypha section 13.2.
```

**QA**
```
Test Morrowroot build [version] against handoff section 8 exit criteria for [milestone]. Verify: apocrypha numbers (resources, hunts, builds, first raid, cards, Hushcube), clock stage effects, possession entry & both break methods, Gravesworn ember flips, win & three lose conditions, hold banking & all four ending triggers, save & reload at season close, coop desync & rejoin. Also check that no outside names appear in text or art & that no child appears in a raid. Report each issue with steps, expected, actual, severity.
```
