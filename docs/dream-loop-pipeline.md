# Dream-loop pipeline stub (PAS-34)

Browser chase of a same-camera target still. **No Unity / UE6.** Blind judges are deferred (pipeline step 4).

## Tool status

| Tool | Status | Notes |
|------|--------|-------|
| Seedream MCP/API | **Unavailable** in this agent environment | Blocker documented; use closest available image tool |
| Cursor `GenerateImage` | Used for PAS-34 target | Reference: live Color Pool combat capture |
| Krea MCP | Needs auth | Optional upgrade when connected |

## Steps

1. Capture live hub / voyage / combat PNGs (1280×720+).
2. Score with `/cursor/stores/self/docs/screenshot-rubric.md` (5 criteria × 5 = 25).
3. Generate same-camera **target** (`combat-color-pool-target.jpg`).
4. Gap list → CSS / Three presentation edits only.
5. Recapture **after**; rescore. Stop when after ≥ before + 2 **or** after ≥ 18/25.
6. Artifacts live under `/cursor/stores/self/media/dream-loop/`.

## Local verify

```bash
# static serve repo root, then open Play with a mid-voyage save
python3 -m http.server 8766 --bind 127.0.0.1
# travel to Color Pool → live dock → screenshot
```

## Repo polish shipped with PAS-34

- `game.css`: Color Pool prismatic curtain overlay + translucent live dock
- `game.js`: pool-skirmish prismatic rim / pool glow lights on the Three stage
