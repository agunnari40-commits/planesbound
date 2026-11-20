# Play Modes

Every mode, with rules, turn flow & win conditions. Tags: **[S#]** = sourced (see `sources.md`), **[FILLER]** = invented for this package (owner may overrule), **[XWALK]** = inferred name match. Numbers marked *tunable* are playtest starting values.

The original Design Handoff (Black Winter Wheel) listed five core modes: Board/Party, Homestead Survival, Planar Expedition, Raid Defense, Card/Item [S5]. The Morrowroot apocrypha kept all five as layers that unlock in order [S1], & the production handoff turned them into one season loop [S3]. The Planesbound atlas adds the Will-o'-Wisp Race [S8]. This file restores all of them as selectable modes in the main build **and** keeps them composable inside the campaign.

| # | Mode | Standalone? | Inside campaign? | v1 | Source |
|---|---|---|---|---|---|
| 1 | Party Board ("Mario Party for D&D") | Yes (Hearth Night) | Yes (board turns) | In | [S5] [S3] + [FILLER] minigames |
| 2 | Homestead Survival | Yes (Endless Winter) | Yes | In (turn based) | [S5] [S3] |
| 3 | Raid Defense | Yes (Raid Gauntlet) | Yes (season climax) | In | [S5] [S3] |
| 4 | Planar Expedition (Veilway) | No (needs campaign state) | Yes | In, 5 realms | [S5] [S3] |
| 5 | Card & Item | Deck editor only | Yes (all modes use cards) | In | [S5] [S3] |
| 6 | Will-o'-Wisp Race: Lighthouse Race (outer) & Inner Ring race | Yes | Yes (optional Lighthouse activity) | In [FILLER scope] | [S8] + [FILLER] rules |
| 7 | Campaign (8 seasons) | n/a | n/a | In | [S1] [S2] [S3] |
| — | Real-time homestead | — | — | Out of v1 | [S3] |
| — | Far Worlds via the Askew | — | — | Out of v1 | [S1] [S3] |

**Seat configurations (all modes):** solo with AI companions filling empty seats; local hotseat (first test mode); online co-op 2–4, host authoritative. A dropped client's seat passes to AI until rejoin. [S3]

**Roster:** playable Hunter, Snow Crowned Tracker, Mother Aspect, Ani; the Gravesworn travels with Ani as an AI ally. [S3]

**Cooperative core:** the party wins or loses together. Each player earns **Boasts** (Best Hunt, Boldest Rescue, Longest Watch, Warmest Hand, …) for bragging & cosmetics only; Boasts never decide victory. [S1] [S3]

---

## 1. Party Board — "Mario Party for D&D"

**Sourced core.** Shared map, turn-based movement, mini-games, item cards, shared events; "closest to Mario Party." [S5] Two board layers: the **Dale board** (the forty acres, the Ten Towns, the Rimeward, Bearing Head) & the **Wheel board** (Axlestone hub, Hinge Towns with Antlerbrook nearest the hub, one space per cameo realm). One hex costs 1 Stamina; 4 Stamina per character per turn (*tunable*). [S3] Space actions: hunt, build, trade, gather, craft; then resolve an event. [S3]

**What the old handoff wanted that the production handoff dropped: minigames.** Restored here as [FILLER].

### 1.1 Space types [FILLER, built from S3 actions]
| Space | Effect on landing/ending move |
|---|---|
| Hunt | Snowfield hunt (1 Stamina + 1 Ember → 1d4+1 Food) or big game if marked (2 Stamina → 2d4+2 Food + 1 Hide). Yield −1 per clock step. [S3] |
| Trade (a Hearth town) | Trade at that town's goods (see `world-and-board.md`). Closed from Glasswater on. [S1] |
| Build | Take one build action on the homestead grid. [S3] |
| Gather | +2 Timber or +1 Stone (*tunable*) [FILLER] |
| Event | Draw from the dale deck (or cameo deck on the Wheel board). [S3] |
| Hearth | Remove all Chill; +1 Warmth to the household (*tunable*) [FILLER] |
| Frost | +1 Chill; from Long Hush on, triggers a co-op "Winter" minigame to cancel it [FILLER] |
| Burr | A Nightburr may root here: roll 1d6, on 1 it roots (spends a banked hold or pushes the clock) [FILLER trigger; effect S2] |
| Boast | Draw a Boast challenge; succeed for a Boast tally [FILLER] |
| Gate | Veilway entry (1 Lightshard per traveler) — Dale board → Wheel board [S3] |
| Lighthouse | Bearing Head: start the Lighthouse Race or (when lit) cleanse a frost thrall [S1] + [FILLER] |

### 1.2 Turn flow (one board turn) 
1. **Mana tick:** each character gains 3 mana (max 10, carries over). [S3]
2. **Move:** spend Stamina 1 per hex (default) **or**, in *Party Dice* rule [FILLER], roll 1d6 + 1 for hexes and keep Stamina for actions. Party Dice is the default in Hearth Night; Stamina movement is the default in Campaign.
3. **Space action:** one action (hunt, build, trade, gather, craft). [S3]
4. **Event:** resolve one event card. [S3]
5. **End check:** ending a turn outside any Warmth radius adds 1 Chill (*tunable*); from Long Hush on, 3+ Chill outside warmth = possessed for one round. [S1] [S3]
6. **Household jobs:** assigned household members resolve their jobs. [S3]
7. **Round minigame [FILLER]:** after every player has moved, play one minigame. Format is chosen by the colour of the spaces players ended on (Mario Party convention): all warm → free-for-all; mixed → 2v2 or 1v3; any Frost/Burr → co-op vs the Winter.

### 1.3 Minigames [FILLER — names & rules invented from the lore & the old homestead activity list]
All are phone-friendly (one or two inputs), 30–60 s, live 3D in the hearthclay look.

| id | Name | Format | Play | Reward |
|---|---|---|---|---|
| mg_hide_rack_rush | Hide Rack Rush | FFA | Stretch & pin hides before frost creeps across them (old handoff: curing hides [S5]) | Winner +1 Hide |
| mg_sled_shed_sprint | Sled Shed Sprint | 2v2 | Teams assemble a sled from falling parts, then race it down the yard (sled building [S5]) | Winning team +1 Timber each |
| mg_barn_raising | Barn Raising | Co-op | Time pushes on ropes to lift wall frames together (barn raising [S5]) | +1 build action on the Barn |
| mg_antler_chime | Antler Chime | FFA | Rhythm: step on chiming antlers in the Shedding Yards in time [S2 site] | Winner +1 Food |
| mg_bellows | Bellows Keeper | 1v3 | One player keeps the forge hot; three try to bank sparks safely (Eldest at the forge [S2]) | Winner +1 Ember |
| mg_brindle_ice_fishing | Ford Fishing | FFA | Hold the line steady through Brindle Ford ice [S2 town] | Winner +2 Food |
| mg_owlgate_post | Owlgate Post | FFA | Memory: route owls with notes to the right towns [S2 town] | Winner peeks next event |
| mg_drumrest_rhythm | Drumrest Rhythm | Co-op | Keep a drumbeat the Long Hush cannot silence [S2] | Cancels this round's Chill |
| mg_churnglint_riddle | Churnglint's Riddle | FFA quiz | Answer a riddle; the answer always points east [S1] [S2] | +1 Warmth to household |
| mg_fizzlet_feed | Fizzlet Feed | FFA push-your-luck | Feed the Fizzlet sparks; overfeed & it pops [S1] | Highest safe total +1 Lightshard |
| mg_lantern_line | Lantern Line | Co-op vs Winter | Shield a row of small lights in a rising wind (Singularity canon motif [S6]) | Removes 1 Chill from everyone |
| mg_wisp_dash | Wisp Dash | FFA | One leg of the Will-o'-Wisp Race as a sprint | Winner +1 Lightshard |

Children never appear as playable or at risk in minigames; children may appear only in safe homestead minigames as non-interactive background (Barn Raising, Hide Rack Rush) [S1 children rule].

### 1.4 Hearth Night (standalone party session) [FILLER]
- 2–4 players (AI fills), Dale board only, **10 board rounds** (*tunable*), Party Dice movement, a minigame every round, clock locked at Hoarstep.
- **Shared loss:** household Warmth hits 0. **Shared win:** survive 10 rounds & a closing single raid wave (6 frost raiders [S3]).
- **Bragging title:** most Boasts is crowned *Keeper of the Hearth* (cosmetic only; Boasts never decide victory [S1]).

---

## 2. Homestead Survival

**Sourced.** Management of the 40-acre claim: hunting, sled building, curing hides, barn raising, defending against raids [S5]. Structures on a 12 × 12 grid; household members work assigned jobs [S3]. v1 is turn based; real time is out of v1 [S3].

**Resources** [S3]: per player Timber 6, Stone 4, Food 3, Ember 2, Lightshard 1 at start; shared household Warmth 10; Chill per character; Hide & Stamina secondary. Each character eats 1 Food at dawn; without a Smokehouse half of stored Food spoils (*tunable*).

**Structures** [S3]: Palisade segment (3 Timber, 1 Stone; +2 raid defense) · Smokehouse (4 Timber, 2 Stone; Food never spoils) · Forge (3 Stone, 2 Ember, 1 Lightshard; crafting) · Warding Lantern (2 Lightshard, 1 Stone; +3 Warmth radius, blocks possession; requires Forge). Also in v1 content: Hearth, Storehouse, Hide Rack, Barn, Sled Shed, Watch Post [S3] — their costs are [FILLER] in `data/structures.json`.

**Household jobs** [S3]: Eldest Child works the forge; Middle Child the stores; Youngest listens with the Fizzlet; Hearth Father runs defenses & never leaves the cabin. The Tithe Chest keeps the homestead livable; the Churnglint above it trades riddles for Warmth.

**Dawn phase** [S3]: apply clock stage effects, spoil unsmoked Food, pay Ani's light tithe, refresh Stamina & mana.

**Endless Winter (standalone) [FILLER]:** homestead + raids only; clock advances every 2 seasons with no holds; score = seasons survived. Loss: Warmth 0 at a dawn & still 0 at season close [S3 default], or the clock reaches Last Bell.

---

## 3. Raid Defense

**Sourced** [S3]: fought on the homestead in 5 ft squares. Order: players, household, enemies. Each point of raid defense absorbs 1 damage per round before structures take hits. First raid: 6 frost raiders, 3 HP & 1 damage each, arriving on turn 4. If an enemy reaches the cabin, the children are frightened: lose 2 Food & 2 Warmth. The Hearth Father fights from the cabin as a fixed defender. Stillmarrow doubles every raid. Creature families: frost raider, Nightburr thrall, slide beast, frost thrall [S3]. Old handoff threats (frost giants, yetis, orcs, ice mephits, possessed black frost dragons) are **legacy names** — map them to these families or new original names; do not ship the old names [S3 denylist].

**Raid round flow** [S3 order; details FILLER]
1. Mana tick (+3).
2. Players act (move in 5 ft squares, attack, play cards).
3. Household acts (Hearth Father fires from the cabin; Fizzlet carries orders).
4. Enemies act by behaviour (`rush_nearest_structure`, `seek_lantern`, …).
5. Raid defense absorbs damage; then structures take hits.
6. Check: wave broken → raid won; cabin reached → fright; hearth fallen → season lost [S3 "until it breaks or the hearth falls"].

**Fright display rule:** children are never shown in raids; fright reads as a shuttered cabin window & the Hearth Father's portrait [S3] [S4].

**Raid Gauntlet (standalone) [FILLER]:** 12 raid waves (3 per clock stage) back to back with a build phase of 2 actions between waves.

**Signature raids** (campaign): Six frost raiders · Slide beast stampede · Nightburr thralls hunting the Warding Lantern · The Crack Swarm · The Silent Raid (no calls; Fizzlet carries orders) · The Askew Leak · The Frozen Muster (doubled) · The Last Muster (breaks when the counter oath is spoken) [S2] [S3].

---

## 4. Planar Expedition (the Veilway)

**Sourced** [S3]: entering costs 1 Lightshard per traveler (*tunable*). A traveler spends turns 2–4 in a realm folio & returns for the raid. Each folio has an alignment effect, a gate condition, a hazard, an objective, & a 12-card expedition deck; draw 2, play 1 each turn. Veilway is shut until the first raid is survived [S2] [S3].

**v1 folios** [S2]:
| Realm | Objective | Hazard | Shard |
|---|---|---|---|
| Antlerwild with Rimmerdale | Mark the Fork Hollow & carry a trophy home | Slide fog: end a turn in it & drift one hex east | The Fall |
| The Churn, eastern edge | Uproot the Nightburr soldering the seam | Thought made matter: each failed Wisdom save adds 1 Chill | The Drift |
| Underheart | Reach the Grazing Deep & hear the Beast out | Ceiling shift: each turn roll 1d6; on 1 the hex collapses | The Bell |
| Geodehall | Uproot the Dim Nursery Nightburr & rest Ani at the Seat | Fading charge: Lightshard costs +1 per turn here | The Hidden Light |
| The Sifting | Recover the Needlesphere, then the Morrowseed | Memory drift: each turn forget one card in hand | The Oath (+ the Cut & the First Lamp) |

Alignment effects & gate conditions exist in the data model examples only for Antlerwild & Underheart [S3]; the other three are [FILLER] in `data/realms.json`.

Every other realm appears only as a Wheel board space & a cameo event card in v1 [S1].

---

## 5. Card & Item

**Sourced** [S3]: mana max 10; +3 at the start of every board turn & raid round; unspent mana carries over (*tunable*). Three attunement slots per character. Saves use six ability scores. Thirteen damage types (Acid, Bludgeoning, Cold, Fire, Force, Lightning, Necrotic, Piercing, Poison, Psychic, Radiant, Slashing, Thunder); Cold is the winter's signature, Necrotic the Nightburrs'; most foes resist one & fear Fire or Radiant.

**Starter cards** [S1]: Hearth Spark (2 mana; remove 2 Chill from one ally within 30 ft) · Antler Call (3 mana; summon a hunt spirit for 2 rounds, 1d6 per round to one beast) · True Bearing (1 mana; peek at the next event card & the clock's trigger).

**Template item: the Hushcube** [S1] (the reshuffled Tesseract Prison from the old handoff [S5]): wondrous, requires attunement, 7 mana, 20 ft, one creature, Wisdom save; on failure stunned 1 round & Xd8 necrotic where X = Nightburrs on board (min 1); on failure all Hope & Courage effects end & can't be reapplied until its next turn ends.

**Deck editor:** 6 starter cards per playable character (24 total) & 12 item cards incl. 3 quest items in v1 content [S3].

---

## 6. Will-o'-Wisp Race

**Sourced** [S8, live Planesbound client]: two courses, nine legs each, stepped through on the Lighthouse folio ("Inner Ring & Will-o'-Wisp Race" button).

- **The Slide Circuit (outer).** "Wisps run the Outer Wheel to keep a bearing while the hub is occupied. The Lighthouse is the start. Limbo is the wound." Finish: "The wisp holds at the Lighthouse, or it has already consumed the runner. The Fourth Sundering has not stopped. Run it again if the bearing slips."
- **Along the leylines (inner).** "Wisps race the Inner Ring because the Outer hub cannot hold the middle. Ethereal is the curtain-road. Positive & Negative are not legs. They are how the race ends if you miss a turn." Finish: "The wisp is back in the mist, or you are. The ring is still turning."
- Mineral is a race waypoint, not a leg ("Start at the lamp"); Dust is not a leg [S8] [S9].

**Owner naming.** The owner refers to the outer course as the **Lighthouse Race** & the inner as the **Inner Ring & Will-o'-Wisp Race** (brief). This package treats them as: `race_lighthouse` = Slide Circuit, `race_inner_ring` = Along the leylines. [interpretation]

### 6.1 Legs (game names [XWALK], atlas names in brackets, keeper's notes [S8] rewritten without outside names)
**Lighthouse Race (outer):** 1 Magpie Light [Lighthouse] — light the stair, last true bearing · 2 Antlerwild via Antlerbrook [Beastlands] — do not hunt long · 3 the Rimeward [Ice Wall] — cross only if the lattice still sings · 4 the Cogwold [Mechanus] — one missed gear & the wisp goes dark · 5 Lanternmere [Celestia] — do not skip the mountain; no Nightburr blight on this slope · 6 Brightfallow [Elysium] — rest is a trap; take water & leave · 7 Revelhollow [Arborea] — do not drink with the hosts; the blighted oak is a lie · 8 Wrenchwind [Ysgard] — jump or fall, the wisp does not wait · 9 the Churn [Limbo] — hold a shape or become weather; the Regent's shadow hides in the soup.

**Inner Ring race:** 1 the Veilway [Ethereal] — call the wisp, the mist is the starting gate · 2 Emberstrand [Fire] — hold the heat, nothing to drink · 3 Magmaseam [Magma] — stone that has not chosen, keep moving · 4 Underheart [Earth] — Beast home, do not hunt, you are a guest · 5 Brineseam [Ooze] — every step a contract with mud · 6 Tidewell [Water] — no surface unless you make one · 7 Rimeseam [Ice] — para-elemental cold, not the Rimeward · 8 Galeveil [Air] — no floor unless you make one · 9 Smokeseam [Smoke] — find the curtain before the bank closes. Fail endings: Kindling Shore [Positive] or Ebbing Dark [Negative]. Waypoint: Geodehall [Mineral].

(Atlas notes name "Gulthias blight" & "Shade's Third"; in game strings these become "Nightburr blight" & "the Regent's shadow" [XWALK, FILLER].)

### 6.2 Rules [FILLER]
- **Setup:** each runner carries one wisp & a **Bearing** track starting at 3. Lighthouse Race starts at Bearing Head; Inner Ring race starts at the Veilway (reached from the lit Magpie Light).
- **Leg turn:** roll 1d6 + leg modifier (+1 if you carry a Lightshard you choose to burn; +1 Mother Aspect breath once per race) vs the leg's difficulty (3–5, in `data/race_courses.json`). Success: advance. Fail: lose 1 Bearing & stay. Each leg also applies its note as a twist (e.g. Brightfallow: the next fail costs 2 Bearing if you rested; Cogwold: a fail here costs your next turn).
- **Miss a turn:** Bearing 0 on the Lighthouse Race = the wisp consumes the runner (out; returns home with 1 Chill). On the Inner Ring race = the runner is flung out of the ring & is out: odd roll, Kindling Shore (remove all Chill but lose 2 Food: it "heals until it burns"); even roll, the Ebbing Dark (+2 Chill: it "unmakes slowly") [S1 shore text].
- **Win:** first runner to clear leg 9 & return to the start (Lighthouse Race: the wisp "holds at the Lighthouse"; Inner Ring race: "back in the mist"). Co-op variant: the party wins if all runners finish before the shared clock of 12 race turns expires.
- **Rewards (campaign):** each finisher +1 Lightshard; first finisher Boast "Truest Bearing"; passing the Geodehall waypoint refunds 1 Lightshard. No holds are granted (protects the clock math in [S2]).
- **Repeatable:** "Run it again if the bearing slips" — once per season in campaign; unlimited standalone.
- **Unlock [FILLER]:** standalone, both races are always available. In campaign, the Lighthouse Race opens once the Veilway opens (after the first raid), & the Inner Ring race opens once the Magpie Light is relit (season 7), because the curtain road is thrown from the lit lamp [S8]. See `open-questions.md` Q7.

---

## 7. Campaign (the full arc)

**Sourced** [S1] [S2] [S3]: one session = one season = 4 board turns + 1 raid; autosave at season close (keep last 3 seasons). Eight seasons, one realm focus & one signature raid each (see `story-apocrypha.md` §10).

**Season flow** [S3]: Dawn → Board turns 1–4 (expeditions run turns 2–4) → Raid on turn 4 → Close (Boasts, clock advance/hold check, autosave).

**Clock** [S2] [S3]: five stages; advance at each season close; a hold cancels the next advance; earned by uprooting a Nightburr or relighting the Magpie Light; bank max 1; a rooting Nightburr spends the hold or pushes the clock at once; each uprooted Nightburr brightens the Hearthsun one notch.

**Gravesworn ember rule** [S1] [S3]: ember max 3; −1 per clock step; refills when Ani rests in Geodehall; at 0 or when possessed it fights as a foe that round; defeating it returns it as an ally with 1 ember; never lost.

**Morrowseed win path** [S3] — three tracks on one campaign panel:
- *Light:* the Eldest Child forges the new lens (Magpie Lens: Forge, 3 Lightshard + 2 Stone) & Ani lights the lamp from Geodehall's stored light.
- *Bearing:* recover the Needlesphere from the Sifting & pass the beam through it.
- *Seed:* recover the Morrowseed from the Sifting, strike the bargain with the Old Beast, & plant it at the root fork. Finale adds the Youngest speaking the counter oath (at the hearth, not in the raid [S4]).

**Win** [S1]: relight the Magpie Light, deliver the true bearing to the cut taproot, & plant the Morrowseed in Antlerwild before Last Bell.
**Lose** [S1]: clock reaches Last Bell; household hearth cold for a full season (default test: Warmth 0 at dawn & still 0 at season close [S3]); or Ani's light is extinguished (Ani has a hard floor of 1 light that only possession or a story scene can breach [S3]).

**Ending triggers** (production defaults [S3], checked in this order):
1. **Hard cost** if the Dim Nursery Nightburr is still rooted when the lens is set.
2. else **Mercy** if the party chose to spare the Old Beast, the Churnglint & the Regent at their scenes.
3. else **Bittersweet** if the party asked the Moot why the lamp was forbidden during the season 7 bargain.
4. else **Main**.
