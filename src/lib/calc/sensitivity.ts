/**
 * Sensitivity and the three goals — the arithmetic behind lessons 5.6 (the three
 * goals of a mix: a low monthly payment, a low total, little exposure), 5.7
 * (what moves when one lever moves) and 5.8 (the workshop: three alternatives
 * for case A). Lessons 5.9 and 5.10 (author D) and stage 6 import it.
 *
 * ── The API ──────────────────────────────────────────────────────────────
 *
 * A mix is a list of schedule.ts's TrackSpec (kind, amount, rate, months, …); a
 * scenario is the course's teaching scenario in the builder's own form:
 *
 *   ScenarioSpec {inflation, primeShift, anchorShift, primeFromYear?}
 *   scenarioFrom(spec)         the schedule.ts Scenario it means (statement rounding,
 *                              blocks of 12 months): exactly what MixBuilder.vue builds
 *
 * What a mix costs under a scenario
 *   measuresOf(tracks, scenario)       first payment, highest payment (and its month), total
 *                                      paid, months — mixCashFlow + mixSummary (3.7, 3.8)
 *   paymentAt(tracks, scenario, m)     the mix's payment in month m (0 after the last)
 *   balanceAt(tracks, scenario, m)     what is still owed after month m's payment: the loan at
 *                                      m = 0, indexed on a linked track, 0 after the last
 *   balancesAt(tracks, scenario, ms)   the same at several points in time
 *   qualifyingTotal(tracks)            the payment the ratio uses (4.3): each track's first
 *                                      payment on its full amount, no index move, no shock
 *   variableAmount(tracks)             the part of the loan that is not fixed for its whole
 *                                      term — what the one-third rule (regulation.ts) counts
 *   loanOf(tracks)                     the tracks added up
 *   leftAt(tracks, scenario, m, net, others)   what stays for living in month m: net income minus
 *                                      the mix's payment and the other payments still running
 *
 * Levers (5.7): one thing moves, everything else stays
 *   Lever = {lever: "percent", from, to, points}   points of the loan move from track `from` to
 *                                                  track `to` (1-based; in percentage points)
 *         | {lever: "amount", change}              the loan changes by `change` shekels; every
 *                                                  track in proportion (splitByWeights)
 *         | {lever: "term", track, months}         `months` added to a track's term ("all" for all)
 *         | {lever: "rate", track, points}         `points` added to a track's contract rate
 *         | {lever: "index", points}               the index's yearly rise moves by `points`
 *         | {lever: "market", points}              prime and every variable anchor move by `points`
 *                                                  (prime from its shift year on)
 *   applyLever({tracks, scenario}, lever)   the changed mix, the old one untouched
 *   leverEffect({tracks, scenario}, lever)  before, after and the difference in the three measures
 *
 * The three goals (5.6), as objective functions: smaller is better, so a goal
 * picks the smallest score among candidate mixes
 *   GoalSpec = {goal: "payment", month?}    the payment in month `month` (default 1), or the
 *                                           highest payment under the base scenario (month: "highest")
 *            | {goal: "total"}              the total paid, under the base scenario
 *            | {goal: "exposure"}           stressRise: how far the highest payment under the
 *                                           stress scenario rises above the first payment today
 *   goalScore(goal, tracks, ctx)            ctx = {base, stress} (schedule.ts Scenarios)
 *   rankCandidates(cands, goal, ctx, allowed?)  every candidate with its score, whether it is
 *                                           allowed, and its rank among the allowed ones
 *                                           (ties keep the order of the list)
 *   winner(...)                             the allowed candidate with the smallest score
 *
 * What is ours and what is not
 *   - The three goals are Mogi's design (Brain J-090, page 7503881, updated 2026-10-08), not a
 *     fact about the market. The measures behind them (first payment, highest payment under a
 *     scenario, total paid) are 3.8–3.9's. "Exposure" as stressRise is this course's choice of
 *     one number for "how much can the payment rise"; Mogi's page names the goal, not a formula.
 *   - A scenario here is a teaching scenario, never a forecast (how Directive 451 forecasts is 5.4).
 *   - The limits a candidate must pass are regulation.ts's; `allowed` is a callback so this
 *     module does not repeat them (case-a-mix.ts has the one for case A).
 *
 * Money is Decimal, exact, rounded to the agora only by the schedules themselves (statement
 * rounding, as the lessons and MixBuilder.vue) or when shown (money.ts). Recomputed
 * independently in checks/kinds/sensitivity.py. Exports are stable: add, don't rename.
 */
import Decimal from "decimal.js";
import { qualifyingPayment } from "./affordability.ts";
import { splitByWeights } from "./mix.ts";
import { leftForLiving } from "./regulation.ts";
import { isFixedForTerm, type MixMonth, mixCashFlow, mixSummary, type Scenario, type TrackSpec } from "./schedule.ts";

export type Numeric = Decimal.Value;

const ZERO = new Decimal(0);
const HUNDRED = new Decimal(100);
const agora = (x: Numeric): Decimal => new Decimal(x).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

// ── Scenarios ──────────────────────────────────────────────────────────────

/** A teaching scenario as MixBuilder.vue's sliders write it. */
export interface ScenarioSpec {
  /** The index's rise, percent a year. */
  inflation: Numeric;
  /** How far prime is from today's, in percentage points, from year `primeFromYear` on. */
  primeShift: Numeric;
  /** How far an unlinked variable track's anchor is from today's at each reset, in percentage points (a linked variable track's too). */
  anchorShift: Numeric;
  /** The year prime starts to move (default 2). */
  primeFromYear?: number;
}

/** The schedule.ts Scenario a ScenarioSpec means: the same arrays MixBuilder.vue builds, in statement rounding. */
export function scenarioFrom(spec: ScenarioSpec): Scenario {
  const from = spec.primeFromYear ?? 2;
  return {
    inflation: [String(spec.inflation)],
    primeShift: [...Array.from({ length: Math.max(from - 1, 0) }, () => "0"), String(spec.primeShift)],
    anchorShift: [String(spec.anchorShift)],
    blockMonths: 12,
    rounding: "statement",
  };
}

// ── What a mix costs ───────────────────────────────────────────────────────

/** A mix's headline figures under one scenario (schedule.ts's MixSummary). */
export interface Measures {
  /** The payment in month 1. */
  first: Decimal;
  /** The highest monthly payment, and the first month it is reached. */
  max: Decimal;
  maxMonth: number;
  /** Every payment added up. */
  total: Decimal;
  /** The longest track's term, in months. */
  months: number;
}

export function measuresOf(tracks: TrackSpec[], scenario: Scenario): Measures {
  const s = mixSummary(mixCashFlow(tracks, scenario));
  return { first: s.firstPayment, max: s.maxPayment, maxMonth: s.maxMonth, total: s.totalPaid, months: s.months };
}

function flowOf(tracks: TrackSpec[], scenario: Scenario): MixMonth[] {
  return mixCashFlow(tracks, scenario);
}

function assertMonth(month: number): void {
  if (!Number.isInteger(month) || month < 0) throw new RangeError(`a month is a whole number from 0, got ${month}`);
}

/** The mix's payment in month `month` (1-based); 0 after the last month. */
export function paymentAt(tracks: TrackSpec[], scenario: Scenario, month: number): Decimal {
  assertMonth(month);
  if (month < 1) throw new RangeError("payments start in month 1");
  const flow = flowOf(tracks, scenario);
  return month <= flow.length ? flow[month - 1].payment : ZERO;
}

/** What is still owed after month `month`'s payment: the loan at month 0, 0 after the last payment. */
export function balanceAt(tracks: TrackSpec[], scenario: Scenario, month: number): Decimal {
  return balancesAt(tracks, scenario, [month])[0];
}

/** The balance at several points in time, one schedule computation. */
export function balancesAt(tracks: TrackSpec[], scenario: Scenario, months: number[]): Decimal[] {
  const flow = flowOf(tracks, scenario);
  const loan = loanOf(tracks);
  return months.map((m) => {
    assertMonth(m);
    if (m === 0) return loan;
    return m <= flow.length ? flow[m - 1].balance : ZERO;
  });
}

/** The tracks' amounts added up. */
export function loanOf(tracks: TrackSpec[]): Decimal {
  return tracks.reduce((s, t) => s.plus(t.amount), ZERO);
}

/**
 * The payment the payment-to-income ratio uses for the whole mix (lesson 4.3): each track's
 * first payment on its full amount, added up. No index move, no rate shock. Exact, unrounded.
 */
export function qualifyingTotal(tracks: TrackSpec[]): Decimal {
  return tracks.reduce((s, t) => s.plus(qualifyingPayment({ amount: t.amount, ratePercent: t.rate, months: t.months, method: t.method })), ZERO);
}

/** The part of the loan at a rate that is not fixed for its whole term: prime and every resetting track. */
export function variableAmount(tracks: TrackSpec[]): Decimal {
  return tracks.filter((t) => !isFixedForTerm(t.kind)).reduce((s, t) => s.plus(t.amount), ZERO);
}

/**
 * What stays for living in month `month`: the net income, minus the mix's payment that month,
 * minus every other payment still running (an obligation with `monthsLeft` months pays in months
 * 1 … monthsLeft; the 18-month rule decides what the ratio counts, not what the family pays).
 */
export function leftAt(tracks: TrackSpec[], scenario: Scenario, month: number, net: Numeric, others: { monthly: Numeric; monthsLeft: number }[] = []): Decimal {
  const running = others.filter((o) => month <= o.monthsLeft).map((o) => o.monthly);
  return leftForLiving(net, [paymentAt(tracks, scenario, month), ...running]);
}

// ── Levers ─────────────────────────────────────────────────────────────────

export type Lever =
  | { lever: "percent"; from: number; to: number; points: Numeric }
  | { lever: "amount"; change: Numeric }
  | { lever: "term"; track: number | "all"; months: number }
  | { lever: "rate"; track: number | "all"; points: Numeric }
  | { lever: "index"; points: Numeric }
  | { lever: "market"; points: Numeric };

export interface MixAndScenario {
  tracks: TrackSpec[];
  scenario: ScenarioSpec;
}

function trackIndex(tracks: TrackSpec[], track: number): number {
  if (!Number.isInteger(track) || track < 1 || track > tracks.length) throw new RangeError(`there is no track ${track}`);
  return track - 1;
}

const pick = (tracks: TrackSpec[], track: number | "all"): number[] =>
  track === "all" ? tracks.map((_, i) => i) : [trackIndex(tracks, track)];

/** The mix and scenario after one lever has moved. The input is not changed. */
export function applyLever(mix: MixAndScenario, lever: Lever): MixAndScenario {
  const tracks = mix.tracks.map((t) => ({ ...t }));
  const scenario: ScenarioSpec = { ...mix.scenario };
  switch (lever.lever) {
    case "percent": {
      const a = trackIndex(tracks, lever.from);
      const b = trackIndex(tracks, lever.to);
      if (a === b) throw new RangeError("a track cannot move money to itself");
      const shift = agora(loanOf(tracks).mul(lever.points).div(HUNDRED));
      if (shift.isNeg()) throw new RangeError("move a positive number of points; swap `from` and `to` to move the other way");
      if (new Decimal(tracks[a].amount).lt(shift)) throw new RangeError("the track has less than the amount to move");
      tracks[a].amount = new Decimal(tracks[a].amount).minus(shift).toFixed(2);
      tracks[b].amount = new Decimal(tracks[b].amount).plus(shift).toFixed(2);
      break;
    }
    case "amount": {
      const loan = loanOf(tracks);
      const next = loan.plus(lever.change);
      if (next.lte(0)) throw new RangeError("the loan would not be above zero");
      const amounts = splitByWeights(next, tracks.map((t) => t.amount));
      amounts.forEach((x, i) => (tracks[i].amount = x.toFixed(2)));
      break;
    }
    case "term":
      for (const i of pick(tracks, lever.track)) {
        const months = tracks[i].months + lever.months;
        if (!Number.isInteger(months) || months < 1) throw new RangeError("a term is a whole number of months, at least 1");
        tracks[i].months = months;
      }
      break;
    case "rate":
      for (const i of pick(tracks, lever.track)) {
        const rate = new Decimal(tracks[i].rate).plus(lever.points);
        if (rate.isNeg()) throw new RangeError("a rate cannot go below zero");
        tracks[i].rate = rate.toString();
      }
      break;
    case "index":
      scenario.inflation = new Decimal(scenario.inflation).plus(lever.points).toString();
      break;
    case "market":
      scenario.primeShift = new Decimal(scenario.primeShift).plus(lever.points).toString();
      scenario.anchorShift = new Decimal(scenario.anchorShift).plus(lever.points).toString();
      break;
  }
  return { tracks, scenario };
}

/** What one lever did to the three measures: before, after and the difference (after − before). */
export interface LeverEffect {
  before: Measures;
  after: Measures;
  delta: { first: Decimal; max: Decimal; total: Decimal };
  mix: MixAndScenario;
}

export function leverEffect(mix: MixAndScenario, lever: Lever): LeverEffect {
  const moved = applyLever(mix, lever);
  const before = measuresOf(mix.tracks, scenarioFrom(mix.scenario));
  const after = measuresOf(moved.tracks, scenarioFrom(moved.scenario));
  return {
    before,
    after,
    delta: { first: after.first.minus(before.first), max: after.max.minus(before.max), total: after.total.minus(before.total) },
    mix: moved,
  };
}

// ── The three goals ────────────────────────────────────────────────────────

export type GoalSpec = { goal: "payment"; month?: number | "highest" } | { goal: "total" } | { goal: "exposure" };

/** The two scenarios the goals read: `base` for the payment and the total, `stress` for the exposure. */
export interface GoalContext {
  base: Scenario;
  stress: Scenario;
}

/** How far the highest payment under the stress scenario rises above the first payment under the base one. */
export function stressRise(tracks: TrackSpec[], ctx: GoalContext): Decimal {
  return measuresOf(tracks, ctx.stress).max.minus(measuresOf(tracks, ctx.base).first);
}

/** A mix's score for one goal; smaller is better. */
export function goalScore(goal: GoalSpec, tracks: TrackSpec[], ctx: GoalContext): Decimal {
  switch (goal.goal) {
    case "payment":
      return goal.month === "highest" ? measuresOf(tracks, ctx.base).max : paymentAt(tracks, ctx.base, goal.month ?? 1);
    case "total":
      return measuresOf(tracks, ctx.base).total;
    case "exposure":
      return stressRise(tracks, ctx);
  }
}

export interface Candidate {
  id: string;
  tracks: TrackSpec[];
}

export interface Ranked {
  id: string;
  score: Decimal;
  allowed: boolean;
  /** 1 for the best allowed candidate; null for a candidate that is not allowed. */
  rank: number | null;
}

/** Every candidate with its score for a goal, in the order given; `rank` counts only the allowed ones. */
export function rankCandidates(cands: Candidate[], goal: GoalSpec, ctx: GoalContext, allowed: (c: Candidate) => boolean = () => true): Ranked[] {
  const rows: Ranked[] = cands.map((c) => ({ id: c.id, score: goalScore(goal, c.tracks, ctx), allowed: allowed(c), rank: null }));
  const order = rows
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => r.allowed)
    .sort((x, y) => x.r.score.cmp(y.r.score) || x.i - y.i);
  order.forEach(({ r }, k) => (r.rank = k + 1));
  return rows;
}

/** The allowed candidate with the smallest score (the first one on a tie), or undefined when none is allowed. */
export function winner(cands: Candidate[], goal: GoalSpec, ctx: GoalContext, allowed?: (c: Candidate) => boolean): Ranked | undefined {
  return rankCandidates(cands, goal, ctx, allowed).find((r) => r.rank === 1);
}
