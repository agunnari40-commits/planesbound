/* Planesbound PAS-33 — stamina / roll i-frames / parry windows (pure logic) */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) root.PlanesboundCombatGates = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const ACTIONS = Object.freeze({
    strike: { stamina: 18, label: "Strike" },
    soft: { stamina: 12, label: "Soft word" },
    assist: { stamina: 10, label: "Assist" },
    roll: { stamina: 22, label: "Roll" },
    parry: { stamina: 16, label: "Parry" },
  });

  const DEFAULTS = Object.freeze({
    staminaMax: 100,
    staminaRegenPerMs: 0.014, // ~14 / sec
    rollDurationMs: 420,
    rollIFrameStartMs: 40,
    rollIFrameEndMs: 320,
    /** Attack timeline: telegraph → hit → recover */
    attackTelegraphMs: 420,
    attackHitAtMs: 420,
    attackRecoverMs: 180,
    /** Parry succeeds if pressed in [hitAt - early, hitAt + late] */
    parryEarlyMs: 90,
    parryLateMs: 50,
    foeDamage: 2,
  });

  function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }

  function mergeOpts(opts) {
    return { ...DEFAULTS, ...(opts || {}) };
  }

  /** Fresh combatant timing state for a live encounter. */
  function createState(opts) {
    const o = mergeOpts(opts);
    return {
      opts: o,
      stamina: o.staminaMax,
      staminaMax: o.staminaMax,
      rollUntil: -1,
      rollStartedAt: null,
      attackStartedAt: null,
      attackActive: false,
      attackResolved: false,
      lastParryAt: null,
      lastResult: null,
      now: null,
    };
  }

  function actionCost(actionId) {
    return ACTIONS[actionId]?.stamina ?? null;
  }

  function canAfford(state, actionId) {
    const cost = actionCost(actionId);
    if (cost == null) return false;
    return state.stamina >= cost;
  }

  function spend(state, actionId) {
    const cost = actionCost(actionId);
    if (cost == null) return { ok: false, reason: "unknown_action" };
    if (state.stamina < cost) return { ok: false, reason: "no_stamina", cost, stamina: state.stamina };
    state.stamina = clamp(state.stamina - cost, 0, state.staminaMax);
    return { ok: true, cost, stamina: state.stamina };
  }

  function tick(state, nowMs) {
    const prev = state.now == null ? nowMs : state.now;
    const dt = Math.max(0, nowMs - prev);
    state.now = nowMs;
    if (dt > 0 && !isRolling(state, nowMs)) {
      state.stamina = clamp(state.stamina + dt * state.opts.staminaRegenPerMs, 0, state.staminaMax);
    }
    // Auto-resolve overdue foe hits (caller may also poll resolveIncoming)
    if (state.attackActive && !state.attackResolved && nowMs >= state.attackStartedAt + state.opts.attackHitAtMs) {
      resolveIncoming(state, nowMs);
    }
    return state;
  }

  function isRolling(state, nowMs) {
    const t = nowMs ?? state.now ?? 0;
    return state.rollUntil > 0 && t < state.rollUntil;
  }

  function rollElapsed(state, nowMs) {
    const t = nowMs ?? state.now;
    if (state.rollStartedAt == null || state.rollStartedAt < 0) return null;
    if (t == null) return null;
    return t - state.rollStartedAt;
  }

  function isInvulnerable(state, nowMs) {
    const elapsed = rollElapsed(state, nowMs);
    if (elapsed == null) return false;
    const { rollIFrameStartMs, rollIFrameEndMs, rollDurationMs } = state.opts;
    if (elapsed < 0 || elapsed > rollDurationMs) return false;
    return elapsed >= rollIFrameStartMs && elapsed <= rollIFrameEndMs;
  }

  function startRoll(state, nowMs) {
    const spent = spend(state, "roll");
    if (!spent.ok) return { ok: false, reason: spent.reason };
    state.now = nowMs;
    state.rollStartedAt = nowMs;
    state.rollUntil = nowMs + state.opts.rollDurationMs;
    state.lastResult = { type: "roll", at: nowMs };
    return { ok: true, until: state.rollUntil, iFrame: [state.opts.rollIFrameStartMs, state.opts.rollIFrameEndMs] };
  }

  function beginFoeAttack(state, nowMs) {
    state.now = nowMs;
    state.attackStartedAt = nowMs;
    state.attackActive = true;
    state.attackResolved = false;
    state.lastResult = { type: "telegraph", at: nowMs };
    return {
      ok: true,
      hitAt: nowMs + state.opts.attackHitAtMs,
      window: parryWindow(state, nowMs),
    };
  }

  function parryWindow(state, nowMs) {
    const start = state.attackStartedAt != null ? state.attackStartedAt : nowMs ?? 0;
    const hitAt = start + state.opts.attackHitAtMs;
    return {
      open: hitAt - state.opts.parryEarlyMs,
      close: hitAt + state.opts.parryLateMs,
      hitAt,
    };
  }

  function inParryWindow(state, nowMs) {
    if (!state.attackActive || state.attackResolved) return false;
    const w = parryWindow(state, nowMs);
    return nowMs >= w.open && nowMs <= w.close;
  }

  function tryParry(state, nowMs) {
    state.now = nowMs;
    if (!state.attackActive || state.attackResolved) {
      return { ok: false, reason: "no_attack" };
    }
    const spent = spend(state, "parry");
    if (!spent.ok) return { ok: false, reason: spent.reason };

    const w = parryWindow(state, nowMs);
    state.lastParryAt = nowMs;
    if (nowMs < w.open) {
      state.lastResult = { type: "parry", ok: false, reason: "early", at: nowMs };
      return { ok: false, reason: "early", window: w };
    }
    if (nowMs > w.close) {
      state.lastResult = { type: "parry", ok: false, reason: "late", at: nowMs };
      return { ok: false, reason: "late", window: w };
    }
    state.attackResolved = true;
    state.attackActive = false;
    state.lastResult = { type: "parry", ok: true, reason: "success", at: nowMs };
    return { ok: true, reason: "success", window: w };
  }

  /**
   * Resolve a pending foe hit at/after hitAt.
   * Prefer tryParry during the window; i-frames negate damage without spending parry.
   */
  function resolveIncoming(state, nowMs) {
    state.now = nowMs;
    if (!state.attackActive || state.attackResolved) {
      return { hit: false, blocked: "none", reason: "idle" };
    }
    const hitAt = state.attackStartedAt + state.opts.attackHitAtMs;
    if (nowMs < hitAt) {
      return { hit: false, blocked: "none", reason: "pending", hitAt };
    }

    state.attackResolved = true;
    state.attackActive = false;

    if (isInvulnerable(state, nowMs) || isInvulnerable(state, hitAt)) {
      state.lastResult = { type: "incoming", hit: false, blocked: "iframe", at: nowMs };
      return { hit: false, blocked: "iframe", damage: 0 };
    }

    // Successful parry already cleared attackActive; if somehow still open and
    // last parry was in window, treat as blocked.
    const w = parryWindow(state, state.attackStartedAt);
    if (state.lastParryAt && state.lastParryAt >= w.open && state.lastParryAt <= w.close) {
      state.lastResult = { type: "incoming", hit: false, blocked: "parry", at: nowMs };
      return { hit: false, blocked: "parry", damage: 0 };
    }

    const damage = state.opts.foeDamage;
    state.lastResult = { type: "incoming", hit: true, blocked: "none", damage, at: nowMs };
    return { hit: true, blocked: "none", damage };
  }

  function staminaPct(state) {
    return clamp(state.stamina / Math.max(1, state.staminaMax), 0, 1);
  }

  function describeHud(state, nowMs) {
    const t = nowMs ?? state.now;
    const parts = [`STA ${Math.round(state.stamina)}/${state.staminaMax}`];
    if (isRolling(state, t)) {
      parts.push(isInvulnerable(state, t) ? "ROLL·i-frame" : "ROLL");
    }
    if (state.attackActive && !state.attackResolved) {
      parts.push(inParryWindow(state, t) ? "PARRY WINDOW" : "TELEGRAPH");
    }
    return parts.join(" · ");
  }

  return {
    ACTIONS,
    DEFAULTS,
    createState,
    actionCost,
    canAfford,
    spend,
    tick,
    isRolling,
    isInvulnerable,
    startRoll,
    beginFoeAttack,
    parryWindow,
    inParryWindow,
    tryParry,
    resolveIncoming,
    staminaPct,
    describeHud,
  };
});
