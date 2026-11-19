# Being race art

Original procedural emblem portraits for the Beings Roster.

- **Core (25):** Distinct palette + motif per race (`human.png`, `elf.png`, …).
- **Long tail:** Unique hash-tinted emblems per being id (420 total in `data/beings.json`).
- **Fallbacks:** `_placeholder.png`, `_placeholder-{core,srd,folklore,original}.png`.

Generated locally with Pillow (no scraped game art). Wire-up: `races-menu.js` → card portraits + list thumbs.