/** PAS-39 — node tests for mute + cue registry (no real AudioContext). */
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { createAudio, MUTE_KEY } = require("./audio.js");

describe("PlanesboundAudio", () => {
  it("lists combat cue names including parry and roll", () => {
    const audio = createAudio();
    for (const name of ["hit", "miss", "hurt", "soft", "kill", "parry", "roll", "crit"]) {
      assert.ok(audio.cueNames.includes(name), `missing cue ${name}`);
      assert.equal(typeof audio[name], "function");
    }
  });

  it("mute gates tone playback without throwing", () => {
    const audio = createAudio();
    audio.setMuted(true);
    assert.equal(audio.isMuted(), true);
    assert.doesNotThrow(() => {
      audio.hit();
      audio.parry();
      audio.roll();
      audio.startMusic("astral-sea");
    });
    audio.setMuted(false);
    assert.equal(audio.isMuted(), false);
  });

  it("toggleMute flips state", () => {
    const audio = createAudio();
    const a = audio.isMuted();
    const b = audio.toggleMute();
    assert.equal(b, !a);
    assert.equal(MUTE_KEY, "planesbound-audio-mute-v1");
  });

  it("music mute keeps location so unmute can resume", () => {
    const audio = createAudio();
    audio.startMusic("astral-sea");
    assert.equal(audio.getMusicLocation(), "astral-sea");
    audio.setMusicMuted(true);
    assert.equal(audio.isMusicMuted(), true);
    assert.equal(audio.getMusicLocation(), "astral-sea");
    audio.setMusicMuted(false);
    assert.equal(audio.isMusicMuted(), false);
    assert.equal(audio.getMusicLocation(), "astral-sea");
  });
});
