> LEGACY (copied 2026-11-19 for the game build package). This is the original Design Handoff, "Black Winter Wheel". The Morrowroot files in this folder supersede its names, lore & art direction. It is kept because it is the source of the play modes (Mario Party style board, homestead survival, planar expedition, raid defense, card & item). It contains outside names; do not ship them in strings or art. The word that named the old one page style doc has been swapped to "apocrypha" per owner rule.

# D&D Simulator Game — Design Handoff for Bots / Wisps

**Project Codename:** Black Winter Wheel  
**Style:** Mario Party for D&D, full Outer Planes travel, survival + party game hybrid  
**Tone:** Hard Black Winter survival that can turn into cute homestead moments or full planar war  
**Primary Setting:** Ten Towns / 40-acre claimed homestead under the Black Winter, with gates to the Outer Planes

---

## 1. High-Level Vision

Build a multiplayer party-game / board-game style D&D simulator that can also drop into real-time survival, hunting, homestead building, and planar exploration.

Players move around a shared board or open map (starting in Ten Towns), trigger events, collect resources, fight, craft, build, and eventually open gates to the Outer Planes. The game should support:

- Short party-game sessions (Mario Party style mini-games, board movement, shared events)
- Longer campaign sessions (homestead management, hunting parties, raids by frost giants / yetis / orcs)
- Full planar travel using the Outer Planes data already prepared

The Black Winter is both the environment and a living antagonist. It possesses creatures (black frost dragons, ice mephit Nyarlathotep avatars, etc.) and tries to claim the homestead.

---

## 2. Core Game Modes

1. **Board / Party Mode**  
   Shared map, turn-based movement, mini-games, item cards, shared events. Closest to Mario Party.

2. **Homestead Survival Mode**  
   Real-time or turn-based management of the 40-acre claim. Hunting, sled building, curing hides, barn raising, defending against raids.

3. **Planar Expedition Mode**  
   Use the Outer Planes JSON. Travel through gates, explore layers, deal with alignment effects, gather planar resources or allies.

4. **Raid Defense Mode**  
   Frost Giants, Yetis, Abominable Yeti, Orcs, Ice Mephits, possessed Black Frost Dragons attacking the homestead or Ten Towns.

5. **Card / Item Mode**  
   Collect and play magical object cards (see Tesseract Prison example). Mana costs, attunement, area effects.

---

## 3. Setting & Key Locations

- **40-acre claimed land** in Ten Towns under the Black Winter.  
  Home base. Foundation for new barn. Cabin. Fire pit. Sled construction area.

- **Ten Towns** (especially Bryn Shander).  
  Frozen streets, lanterns, wooden halls, markets. Can be threatened by ice mephit Nyarlathotep avatars or other Black Winter possessions.

- **The Lighthouse**  
  Recurring visual and narrative motif. Seam between worlds. Glowing gate symbol (vertical cyan-purple bars) on ice mountains.

- **Outer Planes**  
  Full data already exists in `outer-planes.json`. Includes Arcadia, Celestia, Bytopia, Elysium, the Beastlands, Arborea, Ysgard, Limbo, Pandemonium, the Abyss, Carceri, Hades, Gehenna, the Nine Hells, Acheron, Mechanus, and more. Use the JSON for travel, inhabitants, structure, and gate conditions.

---

## 4. Key Characters (Player & Allies)

- **Player Character**  
  Tall rugged male humanoid hunter. Short dark hair. No animal features. Protection hunter. Prefers not to be depicted as a bat.

- **Young Moonstone Dragon** (aspect of "mom")  
  Ally and power. Quiet moments, breath weapons, planar insight.

- **Mara**  
  White-haired female humanoid protection hunter. Hunting partner. Plans barn raising and expeditions.

- **Garrick**  
  Male father protection hunter. Stays with kids and homestead. Offers frostberry mead toasts.

- **Ava "Echo"**  
  Static Sprite. Helps with homestead building and watching the kids.

- **Kids** (Tobin, Saline, Lira)  
  Present on the claim but keep them off-screen during hard action / raids. They help with foundation work and curing hides in safe scenes.

- **The Wight**  
  Undead warrior (white hair, skeletal face, red eyes, purple armor, bloodied sword, skull trophies). Can be ally or force of the Black Winter. Fought a possessed black frost dragon under the glowing mountain gate.

---

## 5. Threats & Black Winter Forces

- Frost Giants
- Yetis & Abominable Yeti
- Orcs
- Ice Mephits
- Black Frost Dragons (demonic, possessed by the Black Winter)
- Nyarlathotep avatar in ice-mephit form (one huge glowing eye, horns, bat wings of frost and shadow) that has appeared in Ten Towns over a blood-stained chest

The Black Winter can possess creatures and open rifts.

---

## 6. Sample Magical Object — Tesseract Prison

**Name:** Tesseract Prison  
**Type:** Magical Object  
**Mana Cost:** 7 (TRP)  
**Requires Attunement**

Action to activate. 20-foot radius.  
Enemies who fail a Wisdom save are trapped in a mental tesseract of hopelessness, becoming Stunned & unable to act for 1 round, & take Xd8 necrotic damage.  
Nullifies any Hope or Courage effects in the area.  
The tesseract whispers cruel truths to its wielder.

Visual style: Ornate golden border, dark starry background, central cracked black cube with screaming faces and purple-red energy cracks. Clean 3D, not cluttered.

---

## 7. Art Direction & Existing Assets

**Style keywords:**  
Cinematic dark fantasy, Black Winter hard vibe, ornate item cards, high detail, strong 3D, teal/cyan aurora, purple necrotic energy, gold luck light, ice, blood that freezes, lanterns against snow.

**Existing image assets:**  
- `/workspace/artifacts/imagine_images/` (recent generations)  
- `/workspace/artifacts/rendered/` (earlier card and scene renders)  
- Conversation history contains many Render Generated Image results (Tesseract Prison iterations, Ten Towns scenes, Wight vs Black Frost Dragon, Ice Mephit Nyarlathotep, Civilization panorama, Tymora / Sylvanas crossover, etc.)

**Recurring motifs:**  
Glowing vertical bar gate on ice mountains, blood-stained chests, lighthouse, moonstone crescent shrine, cosmic wheels / Outer Planes, frost and necrotic purple.

---

## 8. Mechanics Notes

- 13 D&D damage types are in play (Acid, Bludgeoning, Cold, Fire, Force, Lightning, Necrotic, Piercing, Poison, Psychic, Radiant, Slashing, Thunder). Cold and Necrotic are especially common in the Black Winter.
- Attunement is required for major items.
- Homestead has resource loops: hunting (owlbears, yeti), sled building, hide curing, barn foundation, defense.
- Planar travel uses the existing `outer-planes.json` structure (alignment effects, gate conditions, layers, inhabitants).

---

## 9. Build Team Decisions (filled in; override any of these freely)

1. **Engine: Godot 4, with a web export.** Light, free, and strong at 2D/2.5D boards and minigames, and the web build lets friends join from a link. *Mythos tie-in:* Godot's scene tree mirrors Yggdrasil, one world tree with every plane as a branch scene.
2. **Order of build: turn-based board first, homestead second.** The board is the fastest way to test fun. The 40-acre claim is the first board, so homestead work arrives as board spaces (hunt, cure hides, raise barn) before it becomes real-time. *Mythos tie-in:* the board is a Wheel of Fate, as with the Norns' threads and the Great Wheel, so the Black Winter advances one stage each round like a turning season (Fimbulwinter, the three winters that come before Ragnarok).
3. **Outer Planes in v1: five gates, light touch.** Make the Lighthouse hub plus the Beastlands, Limbo, Mechanus, and Elysium interactive, each with its alignment effect and one gate condition from the JSON. The rest show on the map as locked "future gates." *Mythos tie-in:* Beastlands for the hunt and Artemis/Pan, Limbo for Chaos and Tiamat, Mechanus for Kronos and fate, and Elysium for the Elysian Fields that make travelers forget to leave.
4. **Netcode: online co-op for 2 to 4 players, host-authoritative, turn-based.** A turn-based game needs only simple room sync, so skip real-time netcode until Homestead Survival goes real-time. Local hot-seat comes first as the test mode. *Mythos tie-in:* the party gathers like Odin's einherjar, a small hall of heroes against the coming winter.
5. **Art pipeline: lock a one-page style apocrypha, then generate on demand.** The apocrypha fixes the palette (teal-cyan aurora, necrotic purple, gold luck light), the card frame, the lighthouse and gate motifs, and the descriptor sheet for each character (no bat form for the player). New art is made from scratch, with old renders used only as inspiration. *Mythos tie-in:* motifs borrow from Norse ice-and-fire cosmology (Niflheim and Muspelheim) and from Cthulhu-mythos dread kept at the edges, such as Nyarlathotep's eye.
6. **Story tie: stay tight to the homestead for v1, open the sandbox after.** The first version is the claim, Ten Towns, and the Lighthouse. Planar expansion opens only once the player first clears a Black Winter raid. *Mythos tie-in:* the hero's journey, with a safe hearth, a threshold (the gate), and a return, like Odysseus's Ithaca, so the 40 acres is always the home worth defending.

---

## 10. Immediate Next Steps Suggested for Bots

- Ingest `outer-planes.json` as the planar data model.
- Prototype a simple board or hex map of the 40-acre claim + nearby Ten Towns.
- Implement one item card system using the Tesseract Prison as the template.
- Create a basic raid encounter (Frost Giants + Ice Mephits).
- Lock character visual descriptors so future art stays consistent (no bat form for player).

---

**Prepared for handoff.**  
The Black Winter is still outside the door.  
The claim is still 40 acres.  
The wheels are still turning.

---

*Original location: the legacy Design Handoff file in /workspace/artifacts/ (see sources.md, S5)*  
*Related data: `/workspace/artifacts/outer-planes.json`*
