/**
 * The calculation engine of stage 8 (lesson 8.9), and the one every later search,
 * ranking and simulation of the stage calls: a candidate mix and a scenario go in,
 * a cash flow and the stage-3 measures come out. Same input, same output: nothing
 * here reads the clock, a random generator or an outside file.
 *
 * LABEL (course/stage-8-brief.md): nothing in stage 8 is an existing Mogi system.
 * "Mogi today": no mix calculation exists in Mogi's code (the engine call is frozen).
 * "Decided": only Eylon's 15 calculation rules (as the Brain page records them) and the
 * layer modes. "Future": everything else. This file is an illustration of the idea of an
 * engine, built from the course's own schedule rules (schedule.ts, metrics.ts).
 *
 * ── The API ────────────────────────────────────────────────────────────────
 *
 *   trackFlow(track, scenario)        one track under one scenario: every month's row (opening,
 *                                     interest, indexation, payment, principal, closing, rate)
 *                                     and its totals. Memoised: the same track under the same
 *                                     scenario is computed once.
 *   mixFlow(tracks, scenario)         the mix: the tracks' payments added month by month (a track
 *                                     that has ended adds nothing), the balance left after each
 *                                     month, and each track's own flow.
 *   evaluate(tracks, scenario)        the measures of lesson 3.8-3.9 for one scenario:
 *                                       first    the payment in month 1
 *                                       max      the highest PROJECTED payment, maxMonth the first month it is paid.
 *                                                "Projected" leaves out the clearing payment: in the last month of a
 *                                                level-payment (Spitzer) track the statement convention pays whatever is
 *                                                left, which carries the rounding of all the months before it (a few
 *                                                shekels). That is a rounding effect, not a rate or index effect, so for
 *                                                the highest payment the last month of such a track is replaced by the
 *                                                payment that was due: the previous month's payment moved by the index's
 *                                                move that month (projectedLast). `first`, `total` and every other figure
 *                                                still use the payments actually made. (Assumes the rate does not change
 *                                                in the very last month of the track; the course's resets never do.)
 *                                       total    every payment added up
 *                                       interest, indexation   where the total went besides the principal
 *                                       loan, months
 *                                     (total = loan + interest + indexation, to the agora: tested)
 *   assess(tracks, ctx)               evaluate under two scenarios, `ctx = {base, stress}`; adds
 *                                     rise = stress.max - base.first (the course's "exposure",
 *                                     sensitivity.ts's stressRise: same number, tested)
 *   fingerprint(evaluation)           a short text that says "this exact result": FNV-1a 32 bit of
 *                                     "first|max|maxMonth|total|months" (money to the agora). Two
 *                                     runs of the same input must print the same fingerprint.
 *   inputKey(tracks, scenario)        the canonical text of an input (what the memo is keyed by)
 *   clearEngineCache()                for tests
 *
 * Conventions: all of schedule.ts's. Rates are nominal annual percent strings; monthly = annual
 * divided by 12; money is Decimal, in "statement" rounding unless the scenario or the track says
 * otherwise (each month's interest to the agora; the last payment clears the balance), so every
 * printed table of the stage adds up on its printed numbers.
 *
 * Recomputed independently in checks/kinds/engine.py (through checks/kinds/schedule.py's
 * cash flow, which is itself written without this code).
 *
 * Exports are stable: lessons 8.9-8.21 and the other stage-8 modules import them. Add, don't rename.
 */
import Decimal from "decimal.js";
import { scheduleTotals, type Scenario, type ScheduleRow, trackSchedule, type TrackSpec } from "./schedule.ts";
import { moneyString } from "./money.ts";

export type { Scenario, ScheduleRow, TrackSpec };
export type Numeric = Decimal.Value;

const ZERO = new Decimal(0);

/** The two scenarios the course's goals read: the base for payment and total, the stress for exposure. */
export interface ScenarioPair {
  base: Scenario;
  stress: Scenario;
}

/** One track under one scenario. */
export interface TrackFlow {
  track: TrackSpec;
  rows: ScheduleRow[];
  /** The payment of each month, month 1 first. */
  payments: Decimal[];
  /** Every payment added up. */
  total: Decimal;
  interest: Decimal;
  indexation: Decimal;
}

/** The mix: tracks added together. */
export interface MixFlow {
  tracks: TrackFlow[];
  /** The mix's payment in each month, month 1 first (the sum of the tracks' payments). */
  payments: Decimal[];
  /** What is still owed after each month's payments. */
  balance: Decimal[];
  months: number;
}

/** The stage-3 measures of a mix under one scenario. */
export interface Evaluation {
  loan: Decimal;
  first: Decimal;
  max: Decimal;
  /** The first month the highest payment is paid (equal payments compare to the agora; the first wins). */
  maxMonth: number;
  total: Decimal;
  interest: Decimal;
  indexation: Decimal;
  months: number;
}

/** Evaluation under the pair of scenarios the goals read. */
export interface Assessment {
  base: Evaluation;
  stress: Evaluation;
  /** stress.max - base.first: how far the highest payment under stress is above today's first payment. */
  rise: Decimal;
}

// ── Canonical input, and the memo ──────────────────────────────────────────

const withRounding = (scenario: Scenario): Scenario => ({ ...scenario, rounding: scenario.rounding ?? "statement" });

/** The canonical text of a track under a scenario: every field that changes the result, in a fixed order. */
function trackKey(track: TrackSpec, scenario: Scenario): string {
  const s = withRounding(scenario);
  const list = (v?: Numeric[]) => (v ? v.map(String).join(",") : "-");
  return [
    track.kind,
    String(track.amount),
    String(track.rate),
    track.months,
    track.method ?? "spitzer",
    track.resetMonths ?? "-",
    track.rounding ?? "-",
    s.rounding,
    s.blockMonths ?? 12,
    list(s.inflation),
    list(s.primeShift),
    list(s.anchorShift),
    list(s.linkedAnchorShift),
  ].join("|");
}

/** The canonical text of a whole input: the tracks in the order given, then the scenario. Same text, same result. */
export function inputKey(tracks: TrackSpec[], scenario: Scenario): string {
  return tracks.map((t) => trackKey(t, scenario)).join(";");
}

const memo = new Map<string, TrackFlow>();
const MEMO_LIMIT = 20000;

export function clearEngineCache(): void {
  memo.clear();
}

// ── One track, one mix ─────────────────────────────────────────────────────

export function trackFlow(track: TrackSpec, scenario: Scenario = {}): TrackFlow {
  const key = trackKey(track, scenario);
  const hit = memo.get(key);
  if (hit) return hit;
  const rows = trackSchedule(track, withRounding(scenario));
  const totals = scheduleTotals(rows);
  const flow: TrackFlow = {
    track,
    rows,
    payments: rows.map((r) => r.payment),
    total: totals.paid,
    interest: totals.interest,
    indexation: totals.indexation,
  };
  if (memo.size >= MEMO_LIMIT) memo.clear();
  memo.set(key, flow);
  return flow;
}

export function mixFlow(tracks: TrackSpec[], scenario: Scenario = {}): MixFlow {
  if (tracks.length === 0) throw new RangeError("a mix needs at least one track");
  const flows = tracks.map((t) => trackFlow(t, scenario));
  const months = Math.max(...flows.map((f) => f.rows.length));
  const payments = Array.from({ length: months }, (_, t) => flows.reduce((s, f) => (t < f.rows.length ? s.plus(f.rows[t].payment) : s), ZERO));
  const balance = Array.from({ length: months }, (_, t) => flows.reduce((s, f) => (t < f.rows.length ? s.plus(f.rows[t].closing) : s), ZERO));
  return { tracks: flows, payments, balance, months };
}

const cents = (d: Decimal): Decimal => d.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

/**
 * The payment that was due in a track's last month, without the clearing of rounding: the previous month's payment moved by the
 * index's move between the two months, to the agora. Only for a Spitzer track of at least two months; any other track pays what it pays.
 */
export function projectedLast(t: TrackFlow): Decimal {
  const n = t.rows.length;
  const last = t.rows[n - 1];
  if ((t.track.method ?? "spitzer") !== "spitzer" || n < 2) return last.payment;
  const prev = t.rows[n - 2];
  return prev.payment.mul(last.indexRatio).div(prev.indexRatio).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

/** The mix's payments with each track's clearing payment replaced by the one that was due (see `evaluate`: what `max` reads). */
export function projectedPayments(flow: MixFlow): Decimal[] {
  return Array.from({ length: flow.months }, (_, t) =>
    flow.tracks.reduce((s, f) => (t >= f.rows.length ? s : t === f.rows.length - 1 ? s.plus(projectedLast(f)) : s.plus(f.rows[t].payment)), ZERO),
  );
}

export function evaluate(tracks: TrackSpec[], scenario: Scenario = {}): Evaluation {
  const flow = mixFlow(tracks, scenario);
  const projected = projectedPayments(flow);
  let best = 0;
  for (let t = 1; t < flow.months; t++) if (cents(projected[t]).gt(cents(projected[best]))) best = t;
  const sum = (pick: (f: TrackFlow) => Decimal) => flow.tracks.reduce((s, f) => s.plus(pick(f)), ZERO);
  return {
    loan: tracks.reduce((s, t) => s.plus(t.amount), ZERO),
    first: flow.payments[0],
    max: projected[best],
    maxMonth: best + 1,
    total: flow.payments.reduce((s, p) => s.plus(p), ZERO),
    interest: sum((f) => f.interest),
    indexation: sum((f) => f.indexation),
    months: flow.months,
  };
}

export function assess(tracks: TrackSpec[], ctx: ScenarioPair): Assessment {
  const base = evaluate(tracks, ctx.base);
  const stress = evaluate(tracks, ctx.stress);
  return { base, stress, rise: stress.max.minus(base.first) };
}

// ── "Same input, same output" ──────────────────────────────────────────────

/** FNV-1a, 32 bit, over the UTF-8 bytes of a text; eight lowercase hex digits. */
export function fnv1a(text: string): string {
  let h = 0x811c9dc5;
  for (const b of new TextEncoder().encode(text)) {
    h ^= b;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/** The fingerprint of a result: it changes if any shown figure changes by an agora. */
export function fingerprint(e: Evaluation): string {
  return fnv1a([moneyString(e.first), moneyString(e.max), e.maxMonth, moneyString(e.total), e.months].join("|"));
}
