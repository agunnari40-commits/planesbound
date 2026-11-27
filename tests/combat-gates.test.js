"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const CG = require("../combat-gates.js");

function fresh(opts) {
  return CG.createState(opts);
}

describe("Planesbound combat gates — stamina", () => {
  it("1 starts at full stamina", () => {
    const s = fresh();
    assert.equal(s.stamina, 100);
    assert.equal(s.staminaMax, 100);
  });

  it("2 strike costs 18", () => {
    const s = fresh();
    const r = CG.spend(s, "strike");
    assert.equal(r.ok, true);
    assert.equal(r.cost, 18);
    assert.equal(s.stamina, 82);
  });

  it("3 soft costs 12", () => {
    const s = fresh();
    assert.equal(CG.spend(s, "soft").cost, 12);
    assert.equal(s.stamina, 88);
  });

  it("4 assist costs 10", () => {
    const s = fresh();
    assert.equal(CG.spend(s, "assist").cost, 10);
    assert.equal(s.stamina, 90);
  });

  it("5 roll costs 22", () => {
    const s = fresh();
    assert.equal(CG.spend(s, "roll").cost, 22);
    assert.equal(s.stamina, 78);
  });

  it("6 parry costs 16", () => {
    const s = fresh();
    assert.equal(CG.spend(s, "parry").cost, 16);
    assert.equal(s.stamina, 84);
  });

  it("7 unknown action fails", () => {
    const s = fresh();
    const r = CG.spend(s, "dance");
    assert.equal(r.ok, false);
    assert.equal(r.reason, "unknown_action");
    assert.equal(s.stamina, 100);
  });

  it("8 canAfford false when below cost", () => {
    const s = fresh({ staminaMax: 10 });
    s.stamina = 10;
    assert.equal(CG.canAfford(s, "strike"), false);
    assert.equal(CG.canAfford(s, "assist"), true);
  });

  it("9 spend fails with no_stamina", () => {
    const s = fresh();
    s.stamina = 5;
    const r = CG.spend(s, "strike");
    assert.equal(r.ok, false);
    assert.equal(r.reason, "no_stamina");
    assert.equal(s.stamina, 5);
  });

  it("10 actionCost exposes table", () => {
    assert.equal(CG.actionCost("strike"), 18);
    assert.equal(CG.actionCost("nope"), null);
  });

  it("11 multiple spends stack", () => {
    const s = fresh();
    CG.spend(s, "strike");
    CG.spend(s, "soft");
    CG.spend(s, "assist");
    assert.equal(s.stamina, 100 - 18 - 12 - 10);
  });

  it("12 staminaPct clamps", () => {
    const s = fresh();
    s.stamina = 50;
    assert.equal(CG.staminaPct(s), 0.5);
    s.stamina = 0;
    assert.equal(CG.staminaPct(s), 0);
  });

  it("13 regen restores over time", () => {
    const s = fresh({ staminaRegenPerMs: 0.1 });
    s.stamina = 50;
    s.now = 0;
    CG.tick(s, 100); // +10
    assert.equal(s.stamina, 60);
  });

  it("14 regen caps at max", () => {
    const s = fresh({ staminaRegenPerMs: 1 });
    s.stamina = 99;
    s.now = 0;
    CG.tick(s, 50);
    assert.equal(s.stamina, 100);
  });

  it("15 regen pauses while rolling", () => {
    const s = fresh({ staminaRegenPerMs: 1 });
    s.stamina = 50;
    CG.startRoll(s, 0); // spends 22 → 28
    const afterRoll = s.stamina;
    CG.tick(s, 100);
    assert.equal(s.stamina, afterRoll);
  });

  it("16 regen resumes after roll ends", () => {
    const s = fresh({ staminaRegenPerMs: 0.1, rollDurationMs: 200 });
    s.stamina = 50;
    CG.startRoll(s, 0);
    CG.tick(s, 250);
    assert.ok(s.stamina > 50 - 22);
  });

  it("17 custom staminaMax honored", () => {
    const s = fresh({ staminaMax: 40 });
    assert.equal(s.stamina, 40);
    assert.equal(CG.canAfford(s, "roll"), true);
    CG.spend(s, "roll");
    assert.equal(s.stamina, 18);
  });
});

describe("Planesbound combat gates — roll i-frames", () => {
  it("18 startRoll spends and sets window", () => {
    const s = fresh();
    const r = CG.startRoll(s, 1000);
    assert.equal(r.ok, true);
    assert.equal(s.rollStartedAt, 1000);
    assert.equal(s.rollUntil, 1000 + CG.DEFAULTS.rollDurationMs);
  });

  it("19 startRoll fails without stamina", () => {
    const s = fresh();
    s.stamina = 0;
    assert.equal(CG.startRoll(s, 0).reason, "no_stamina");
  });

  it("20 not invulnerable before roll", () => {
    const s = fresh();
    assert.equal(CG.isInvulnerable(s, 0), false);
  });

  it("21 not invulnerable in wind-up (0–39ms)", () => {
    const s = fresh();
    CG.startRoll(s, 0);
    assert.equal(CG.isInvulnerable(s, 20), false);
  });

  it("22 invulnerable at i-frame start", () => {
    const s = fresh();
    CG.startRoll(s, 0);
    assert.equal(CG.isInvulnerable(s, 40), true);
  });

  it("23 invulnerable mid i-frame", () => {
    const s = fresh();
    CG.startRoll(s, 0);
    assert.equal(CG.isInvulnerable(s, 180), true);
  });

  it("24 invulnerable at i-frame end", () => {
    const s = fresh();
    CG.startRoll(s, 0);
    assert.equal(CG.isInvulnerable(s, 320), true);
  });

  it("25 not invulnerable after i-frame end (recovery)", () => {
    const s = fresh();
    CG.startRoll(s, 0);
    assert.equal(CG.isInvulnerable(s, 350), false);
  });

  it("26 not invulnerable after roll ends", () => {
    const s = fresh();
    CG.startRoll(s, 0);
    assert.equal(CG.isInvulnerable(s, 500), false);
    assert.equal(CG.isRolling(s, 500), false);
  });

  it("27 isRolling true during duration", () => {
    const s = fresh();
    CG.startRoll(s, 100);
    assert.equal(CG.isRolling(s, 200), true);
  });

  it("28 incoming during i-frame is blocked", () => {
    const s = fresh();
    CG.startRoll(s, 0);
    CG.beginFoeAttack(s, 0);
    // hitAt = 420; still in i-frames at 200 if we force resolve at hitAt while rolling
    // Start attack so hit lands at 180 into roll
    const s2 = fresh({ attackHitAtMs: 180 });
    CG.startRoll(s2, 0);
    CG.beginFoeAttack(s2, 0);
    const r = CG.resolveIncoming(s2, 180);
    assert.equal(r.hit, false);
    assert.equal(r.blocked, "iframe");
  });

  it("29 incoming after i-frame hits", () => {
    const s = fresh({ attackHitAtMs: 350, rollDurationMs: 420 });
    CG.startRoll(s, 0);
    CG.beginFoeAttack(s, 0);
    const r = CG.resolveIncoming(s, 350);
    assert.equal(r.hit, true);
    assert.equal(r.blocked, "none");
    assert.equal(r.damage, 2);
  });

  it("30 second roll while exhausted fails", () => {
    const s = fresh();
    s.stamina = 22;
    assert.equal(CG.startRoll(s, 0).ok, true);
    assert.equal(CG.startRoll(s, 10).ok, false);
  });
});

describe("Planesbound combat gates — parry windows", () => {
  it("31 telegraph starts attack", () => {
    const s = fresh();
    const r = CG.beginFoeAttack(s, 1000);
    assert.equal(r.ok, true);
    assert.equal(r.hitAt, 1000 + 420);
    assert.equal(s.attackActive, true);
  });

  it("32 parry with no attack fails", () => {
    const s = fresh();
    assert.equal(CG.tryParry(s, 0).reason, "no_attack");
  });

  it("33 parry early fails", () => {
    const s = fresh();
    CG.beginFoeAttack(s, 0);
    // window opens at hitAt-90 = 330
    const r = CG.tryParry(s, 200);
    assert.equal(r.ok, false);
    assert.equal(r.reason, "early");
  });

  it("34 parry success at window open", () => {
    const s = fresh();
    CG.beginFoeAttack(s, 0);
    const r = CG.tryParry(s, 330); // 420-90
    assert.equal(r.ok, true);
    assert.equal(r.reason, "success");
    assert.equal(s.attackActive, false);
  });

  it("35 parry success at hitAt", () => {
    const s = fresh();
    CG.beginFoeAttack(s, 0);
    assert.equal(CG.tryParry(s, 420).ok, true);
  });

  it("36 parry success at window close", () => {
    const s = fresh();
    CG.beginFoeAttack(s, 0);
    assert.equal(CG.tryParry(s, 470).ok, true); // 420+50
  });

  it("37 parry late fails", () => {
    const s = fresh();
    CG.beginFoeAttack(s, 0);
    const r = CG.tryParry(s, 480);
    assert.equal(r.ok, false);
    assert.equal(r.reason, "late");
  });

  it("38 successful parry spends stamina", () => {
    const s = fresh();
    CG.beginFoeAttack(s, 0);
    CG.tryParry(s, 420);
    assert.equal(s.stamina, 84);
  });

  it("39 early parry still spends stamina", () => {
    const s = fresh();
    CG.beginFoeAttack(s, 0);
    CG.tryParry(s, 100);
    assert.equal(s.stamina, 84);
  });

  it("40 parry without stamina fails", () => {
    const s = fresh();
    s.stamina = 0;
    CG.beginFoeAttack(s, 0);
    assert.equal(CG.tryParry(s, 420).reason, "no_stamina");
  });

  it("41 inParryWindow false during telegraph", () => {
    const s = fresh();
    CG.beginFoeAttack(s, 0);
    assert.equal(CG.inParryWindow(s, 100), false);
  });

  it("42 inParryWindow true inside window", () => {
    const s = fresh();
    CG.beginFoeAttack(s, 0);
    assert.equal(CG.inParryWindow(s, 400), true);
  });

  it("43 resolveIncoming pending before hitAt", () => {
    const s = fresh();
    CG.beginFoeAttack(s, 0);
    const r = CG.resolveIncoming(s, 100);
    assert.equal(r.reason, "pending");
    assert.equal(r.hit, false);
  });

  it("44 resolveIncoming hits when no defense", () => {
    const s = fresh();
    CG.beginFoeAttack(s, 0);
    const r = CG.resolveIncoming(s, 420);
    assert.equal(r.hit, true);
    assert.equal(r.damage, 2);
  });

  it("45 successful parry prevents later resolve hit", () => {
    const s = fresh();
    CG.beginFoeAttack(s, 0);
    assert.equal(CG.tryParry(s, 420).ok, true);
    const r = CG.resolveIncoming(s, 500);
    assert.equal(r.reason, "idle");
    assert.equal(r.hit, false);
  });

  it("46 tick auto-resolves overdue hit", () => {
    const s = fresh({ foeDamage: 3 });
    CG.beginFoeAttack(s, 0);
    CG.tick(s, 500);
    assert.equal(s.attackResolved, true);
    assert.equal(s.lastResult.hit, true);
    assert.equal(s.lastResult.damage, 3);
  });

  it("47 custom parry window widths", () => {
    const s = fresh({ attackHitAtMs: 300, parryEarlyMs: 20, parryLateMs: 10 });
    CG.beginFoeAttack(s, 0);
    assert.equal(CG.tryParry(s, 270).reason, "early");
    const s2 = fresh({ attackHitAtMs: 300, parryEarlyMs: 20, parryLateMs: 10 });
    CG.beginFoeAttack(s2, 0);
    assert.equal(CG.tryParry(s2, 280).ok, true);
  });
});

describe("Planesbound combat gates — combined scenarios", () => {
  it("48 strike then foe attack without defense damages", () => {
    const s = fresh();
    assert.equal(CG.spend(s, "strike").ok, true);
    CG.beginFoeAttack(s, 1000);
    const r = CG.resolveIncoming(s, 1420);
    assert.equal(r.hit, true);
  });

  it("49 roll i-frames beat telegraph", () => {
    const s = fresh({ attackHitAtMs: 200 });
    CG.startRoll(s, 0);
    CG.beginFoeAttack(s, 0);
    assert.equal(CG.resolveIncoming(s, 200).blocked, "iframe");
  });

  it("50 describeHud shows STA and PARRY WINDOW", () => {
    const s = fresh();
    CG.beginFoeAttack(s, 0);
    const hud = CG.describeHud(s, 400);
    assert.match(hud, /STA/);
    assert.match(hud, /PARRY WINDOW/);
  });

  it("51 describeHud shows ROLL·i-frame", () => {
    const s = fresh();
    CG.startRoll(s, 0);
    assert.match(CG.describeHud(s, 100), /ROLL·i-frame/);
  });
});
