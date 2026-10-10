/**
 * Schedules of whole tracks and of a whole mix — stage 3 (lessons 3.5–3.7),
 * and the engine that 3.8–3.11 compute their figures from. Built on
 * amortization.ts, which it imports and never changes.
 *
 * Conventions, the same everywhere in the course:
 *  - Rates are a contract's nominal annual rate, in percent, as strings
 *    ("4.75" = 4.75% a year). The monthly rate is the annual rate ÷ 12.
 *  - Payments are monthly, at the end of each month of the schedule.
 *  - Each track carries its own term (Mogi decision DEC-2: Eylon, 2026-08-03).
 *    A mix's cash flow is the sum of its tracks, month by month; a track that
 *    has ended adds nothing.
 *  - An index-linked track is indexed every month (Mogi decision DEC-3: Eylon
 *    approved 2026-10-07, Eden accepted 2026-10-08): its balance moves with the
 *    index before that month's payment, so already the first payment carries
 *    one month of index. The base index (M₀) is the index on the day the
 *    schedule starts; each payment is indexed one month more than the last.
 *  - When a track's rate changes (prime moves; a variable track reaches a reset
 *    point), the payment is recalculated on the balance left, over the months
 *    left; the term stays. That is the course's calculation assumption, and
 *    DEC-3 says changes apply "under the track's terms"; a contract may differ.
 *  - Variable tracks reset every `resetMonths` from the start (DEC-3: in a first
 *    simulation, before an offer, every 60 months, labelled as an assumption;
 *    supported intervals 12, 24, 30, 36, 60, 72, 84 and 120 months).
 *  - Methods: "spitzer" (the level payment, recalculated on every change) and
 *    "equal_principal" (each month repays the balance ÷ the months left; with
 *    no change that is the same part every month).
 *
 * A scenario (index and rate paths) is a teaching scenario, never a forecast:
 * pages label it "תרחיש להמחשה, לא תחזית".
 *
 * Rounding: two conventions, chosen per call (the `rounding` option).
 *  - "exact" (the default): every figure is an exact Decimal; money is rounded
 *    to the agora only when shown (money.ts). Kept as the default so callers
 *    that do not ask for statement rounding are unchanged.
 *  - "statement": the way a statement shows it, and what teaching tables use
 *    (course/AUTHORING.md), so every row adds up on the printed numbers: the
 *    balance in agorot; on a linked track the opening balance is indexed and
 *    rounded to the agora each month; each month's interest rounded to the
 *    agora; the payment rounded to the agora when it is set (month 1, and a
 *    rate change: Spitzer on the balance left over the months left), and on a
 *    linked track carried with the index and rounded again (the set payment ×
 *    M_k ÷ M at setting, lesson 2.5); the last payment clears the balance. On a
 *    flat unlinked track this is amortization.ts's annuityStatement /
 *    equalPrincipalStatement, row for row.
 * Recomputed independently in checks/kinds/schedule.py (fact kinds with the
 * prefix sch_).
 *
 * Exports are stable — later lessons import them. Add, don't rename.
 */
import Decimal from "decimal.js";
import { annuityPayment, blockPath, indexPath, monthInterest, pathSchedule, type PathRow } from "./amortization.ts";
import { splitByWeights } from "./mix.ts";

export type Numeric = Decimal.Value;

const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
const ZERO = new D(0);
const ONE = new D(1);
const HUNDRED = new D(100);
/** Rounded to the agora, half up. */
const agorot = (x: Numeric): Decimal => new D(x).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

// ---------------------------------------------------------------------------
// Tracks and scenarios
// ---------------------------------------------------------------------------

/** The five tracks the course computes (lessons 2.5–2.7). */
export type TrackKind = "fixed_unlinked" | "fixed_linked" | "prime" | "variable_unlinked" | "variable_linked";

export const TRACK_KINDS: TrackKind[] = ["fixed_unlinked", "fixed_linked", "prime", "variable_unlinked", "variable_linked"];

/** How the principal is repaid. */
export type ScheduleMethod = "spitzer" | "equal_principal";

/** How money is rounded inside a schedule: "exact" (round only for display) or "statement" (every row in agorot). See the file comment. */
export type Rounding = "exact" | "statement";

/** DEC-3: the reset interval assumed in a first simulation, before an offer. */
export const DEFAULT_RESET_MONTHS = 60;
/** DEC-3: the reset intervals the calculation supports, in months. */
export const SUPPORTED_RESET_MONTHS = [12, 24, 30, 36, 60, 72, 84, 120];

/** Is the track's balance linked to the index? */
export const isLinked = (kind: TrackKind): boolean => kind === "fixed_linked" || kind === "variable_linked";
/** Is the rate fixed for the whole term? */
export const isFixedForTerm = (kind: TrackKind): boolean => kind === "fixed_unlinked" || kind === "fixed_linked";
/** Does the rate reset at points every few years? */
export const resets = (kind: TrackKind): boolean => kind === "variable_unlinked" || kind === "variable_linked";

/** One track of a mix. */
export interface TrackSpec {
  kind: TrackKind;
  /** The track's principal, in shekels. */
  amount: Numeric;
  /** The track's total annual rate at the start, in percent ("4.25"). */
  rate: Numeric;
  /** The track's own term, in months (DEC-2). */
  months: number;
  /** Default "spitzer". */
  method?: ScheduleMethod;
  /** Variable tracks only: months between resets. Default DEFAULT_RESET_MONTHS. */
  resetMonths?: number;
  /** Overrides the scenario's rounding for this track. */
  rounding?: Rounding;
}

/**
 * A teaching scenario: how the index, prime and the variable tracks' anchors
 * move, each as one value per block of `blockMonths` (default 12: one value a
 * year). The last value carries on to the end. All default to "nothing moves".
 */
export interface Scenario {
  /** The index's rise in each block, in percent a year, at an even pace inside the year (lesson 0.4's twelfth root). */
  inflation?: Numeric[];
  /** How far prime is from today's prime, in percentage points, in each block. */
  primeShift?: Numeric[];
  /** How far an unlinked variable track's anchor is from today's, in percentage points, in each block; read at each reset point. */
  anchorShift?: Numeric[];
  /** The same for a linked variable track's anchor; defaults to anchorShift. */
  linkedAnchorShift?: Numeric[];
  /** Months per block. Default 12. */
  blockMonths?: number;
  /** How every track of the mix is rounded, unless a track says otherwise. Default "exact". */
  rounding?: Rounding;
}

function assertMonths(months: number, what = "months"): void {
  if (!Number.isInteger(months) || months < 1) throw new RangeError(`${what} must be a whole number of at least 1, got ${months}`);
}

const pathOr = (values: Numeric[] | undefined, block: number, months: number): Decimal[] =>
  blockPath(values && values.length > 0 ? values : [0], block, months);

/**
 * A rate path from a start rate and rate changes: from month `month` (1-based,
 * the first month at the new rate) on, the rate is `rate`. Changes are applied
 * in order of their month. For a hand-made path (lessons 3.6, 3.7).
 */
export function rateChangesPath(start: Numeric, months: number, changes: { month: number; rate: Numeric }[] = []): Decimal[] {
  assertMonths(months);
  const sorted = [...changes].sort((a, b) => a.month - b.month);
  for (const c of sorted) if (!Number.isInteger(c.month) || c.month < 1 || c.month > months) throw new RangeError(`a change must fall inside the term, got month ${c.month}`);
  return Array.from({ length: months }, (_, t) => {
    let r = new D(start);
    for (const c of sorted) if (t + 1 >= c.month) r = new D(c.rate);
    return r;
  });
}

/**
 * Monthly index factors from an index series: values[0] is the base index (M₀),
 * values[k] the index used for payment k. Month k's factor is values[k] ÷ values[k − 1].
 * Months after the last value keep the index where it is (factor 1).
 */
export function indexFactorsFromIndex(values: Numeric[], months: number): Decimal[] {
  assertMonths(months);
  if (values.length < 1) throw new RangeError("an index series needs at least the base index");
  const v = values.map((x) => new D(x));
  if (v.some((x) => x.lte(0))) throw new RangeError("an index is always above zero");
  return Array.from({ length: months }, (_, t) => (t + 1 < v.length ? v[t + 1].div(v[t]) : ONE));
}

/** The rate in force in each month of a track, under a scenario. Throws if a rate would fall below zero. */
export function trackRatePath(track: TrackSpec, scenario: Scenario = {}): Decimal[] {
  assertMonths(track.months, "a track's term");
  const block = scenario.blockMonths ?? 12;
  assertMonths(block, "blockMonths");
  const start = new D(track.rate);
  let path: Decimal[];
  if (isFixedForTerm(track.kind)) {
    path = Array.from({ length: track.months }, () => start);
  } else if (track.kind === "prime") {
    const shift = pathOr(scenario.primeShift, block, track.months);
    path = shift.map((s) => start.plus(s));
  } else {
    const every = track.resetMonths ?? DEFAULT_RESET_MONTHS;
    assertMonths(every, "resetMonths");
    const shifts = track.kind === "variable_linked" ? (scenario.linkedAnchorShift ?? scenario.anchorShift) : scenario.anchorShift;
    const shift = pathOr(shifts, block, track.months);
    // The rate set at a reset after month k holds from month k + 1 to the next reset.
    path = Array.from({ length: track.months }, (_, t) => {
      const lastReset = Math.floor(t / every) * every; // 0 = the start: no reset yet
      return lastReset === 0 ? start : start.plus(shift[lastReset]);
    });
  }
  const low = path.findIndex((r) => r.isNeg());
  if (low >= 0) throw new RangeError(`the rate would fall below zero in month ${low + 1}`);
  return path;
}

/** The monthly index factors of a track under a scenario, or undefined when the track is not linked. */
export function trackIndexFactors(track: TrackSpec, scenario: Scenario = {}): Decimal[] | undefined {
  if (!isLinked(track.kind)) return undefined;
  const block = scenario.blockMonths ?? 12;
  const inflation = scenario.inflation && scenario.inflation.length > 0 ? scenario.inflation : [0];
  return indexPath(inflation, block, track.months);
}

// ---------------------------------------------------------------------------
// One track, month by month
// ---------------------------------------------------------------------------

/** One month of a track's schedule (amortization.ts's PathRow, plus the index). */
export interface ScheduleRow extends PathRow {
  /** The index on this month's payment ÷ the base index: M ÷ M₀ (1 on an unlinked track). */
  indexRatio: Decimal;
  /** הפרשי הצמדה on the balance this month: what the index added to the balance before the payment (opening − last month's closing). */
  indexation: Decimal;
  /** הפרשי הצמדה in the payment: the payment − the same payment at the base index (payment − payment ÷ indexRatio). */
  paymentIndexation: Decimal;
}

/**
 * The schedule of one track from month-by-month paths: `rates[t]` is the annual
 * rate in month t + 1 (the term is rates.length months), `factors[t]` (default 1)
 * how much the index moved in month t + 1. The engine every other function uses.
 *
 * rounding "exact" (default): Spitzer is amortization.ts's pathSchedule. Equal
 * principal: each month the balance is indexed, the month's interest is
 * opening × rate ÷ 12, and the principal part is opening ÷ months left.
 * Exact, unrounded.
 *
 * rounding "statement": the same rules in agorot (see the file comment).
 */
export function scheduleFromPaths(principal: Numeric, rates: Numeric[], factors?: Numeric[], method: ScheduleMethod = "spitzer", rounding: Rounding = "exact"): ScheduleRow[] {
  const months = rates.length;
  assertMonths(months);
  if (factors && factors.length !== months) throw new RangeError("factors must have one entry per month");
  let base: PathRow[];
  if (rounding === "statement") {
    base = statementPath(principal, rates, factors, method);
  } else if (method === "spitzer") {
    base = pathSchedule(principal, rates, factors);
  } else {
    base = [];
    let balance = new D(principal);
    for (let t = 0; t < months; t++) {
      const factor = new D(factors ? factors[t] : 1);
      const opening = balance.mul(factor);
      const rate = new D(rates[t]);
      const interest = monthInterest(opening, rate);
      const principalPaid = opening.div(months - t);
      const closing = t === months - 1 ? ZERO : opening.minus(principalPaid);
      base.push({ month: t + 1, opening, payment: principalPaid.plus(interest), interest, principalPaid, closing, rate, indexFactor: factor });
      balance = closing;
    }
  }
  let ratio = ONE;
  let previous = rounding === "statement" ? agorot(principal) : new D(principal);
  return base.map((row) => {
    ratio = ratio.mul(row.indexFactor);
    const paymentIndexation = new D(row.payment).minus(new D(row.payment).div(ratio));
    const out: ScheduleRow = {
      ...row,
      indexRatio: ratio,
      indexation: new D(row.opening).minus(previous),
      paymentIndexation: rounding === "statement" ? agorot(paymentIndexation) : paymentIndexation,
    };
    previous = new D(row.closing);
    return out;
  });
}

/**
 * The statement convention, month by month. The balance is in agorot; on a
 * linked track it is indexed and rounded to the agora before the payment. The
 * interest is rounded to the agora. The payment (Spitzer) or the principal part
 * (equal principal) is set in agorot at the start and, for Spitzer, again at
 * every rate change — on the balance left before this month's index move, over
 * the months left — and is then carried with the index: this month's payment is
 * the set one × the index's move since it was set, rounded to the agora. That
 * is lesson 2.5's C × M_k ÷ M_0 on the printed C, so the page's equalities hold
 * on its printed numbers. The last month pays what is left.
 */
function statementPath(principal: Numeric, rates: Numeric[], factors: Numeric[] | undefined, method: ScheduleMethod): PathRow[] {
  const months = rates.length;
  const rows: PathRow[] = [];
  let balance = agorot(principal);
  let set = ZERO; // Spitzer: the payment, as set; equal principal: the principal part, as set
  let ratio = ONE; // the index's move since the start
  let setRatio = ONE; // the index's move up to the month before the payment was set
  for (let t = 0; t < months; t++) {
    const factor = new D(factors ? factors[t] : 1);
    const rate = new D(rates[t]);
    const left = months - t;
    if (t === 0 || (method === "spitzer" && !rate.eq(rates[t - 1]))) {
      set = agorot(method === "spitzer" ? annuityPayment(balance, rate, left) : balance.div(left));
      setRatio = ratio;
    }
    ratio = ratio.mul(factor);
    const opening = factor.eq(1) ? balance : agorot(balance.mul(factor));
    const interest = agorot(monthInterest(opening, rate));
    const current = ratio.eq(setRatio) ? set : agorot(set.mul(ratio).div(setRatio));
    const last = t === months - 1;
    const principalPaid = last ? opening : method === "spitzer" ? current.minus(interest) : current;
    const closing = opening.minus(principalPaid);
    rows.push({ month: t + 1, opening, payment: principalPaid.plus(interest), interest, principalPaid, closing, rate, indexFactor: factor });
    balance = closing;
  }
  return rows;
}

/** One track's schedule under a scenario; rounded by the track's `rounding`, else the scenario's, else "exact". */
export function trackSchedule(track: TrackSpec, scenario: Scenario = {}): ScheduleRow[] {
  const rounding = track.rounding ?? scenario.rounding ?? "exact";
  return scheduleFromPaths(track.amount, trackRatePath(track, scenario), trackIndexFactors(track, scenario), track.method ?? "spitzer", rounding);
}

/** What a schedule adds up to: paid = principal + interest + indexation (the balance's הפרשי הצמדה). */
export interface ScheduleTotals {
  paid: Decimal;
  interest: Decimal;
  /** All the index added to the balance over the term (negative when the index fell overall). */
  indexation: Decimal;
  /** The principal repaid: the sum of the principal parts (= the loan + indexation). */
  principalPaid: Decimal;
}

/** The totals of a schedule, over its first `through` months (default: the whole term). */
export function scheduleTotals(rows: ScheduleRow[], through: number = rows.length): ScheduleTotals {
  const part = rows.slice(0, through);
  const sum = (f: (r: ScheduleRow) => Decimal.Value) => part.reduce((s, r) => s.plus(f(r)), new D(0));
  return { paid: sum((r) => r.payment), interest: sum((r) => r.interest), indexation: sum((r) => r.indexation), principalPaid: sum((r) => r.principalPaid) };
}

/** The payment after a rate change: the level payment on the balance left, over the months left (the 3.1 formula with B for P and the months left for n). */
export function recalculatedPayment(balance: Numeric, annualPercent: Numeric, monthsLeft: number): Decimal {
  assertMonths(monthsLeft, "monthsLeft");
  return annuityPayment(balance, annualPercent, monthsLeft);
}

/** The recalculated payment's formula, one step at a time (lesson 3.6): r = annual ÷ 12 ÷ 100, (1 + r)^−n, 1 − (1 + r)^−n, B × r, and the payment. Exact. */
export interface RecalculationSteps {
  r: Decimal;
  power: Decimal;
  oneMinus: Decimal;
  top: Decimal;
  payment: Decimal;
}

export function recalculationSteps(balance: Numeric, annualPercent: Numeric, monthsLeft: number): RecalculationSteps {
  assertMonths(monthsLeft, "monthsLeft");
  const r = new D(annualPercent).div(12).div(HUNDRED);
  if (r.isZero()) throw new RangeError("the steps need a rate above zero");
  const power = ONE.plus(r).pow(-monthsLeft);
  const oneMinus = ONE.minus(power);
  const top = new D(balance).mul(r);
  return { r, power, oneMinus, top, payment: top.div(oneMinus) };
}

/** Each rate change of a schedule: the month it starts, the balance and months left at that moment, the new rate and the new payment. */
export interface ResetPoint {
  month: number;
  balance: Decimal;
  monthsLeft: number;
  rate: Decimal;
  payment: Decimal;
}

export function resetPoints(rows: ScheduleRow[]): ResetPoint[] {
  const out: ResetPoint[] = [];
  rows.forEach((row, t) => {
    if (t > 0 && !row.rate.eq(rows[t - 1].rate)) out.push({ month: t + 1, balance: new D(rows[t - 1].closing), monthsLeft: rows.length - t, rate: row.rate, payment: row.payment });
  });
  return out;
}

// ---------------------------------------------------------------------------
// A mix: one cash flow
// ---------------------------------------------------------------------------

/** One month of a mix's cash flow. */
export interface MixMonth {
  month: number;
  /** The mix's payment this month: the sum of its tracks' payments. */
  payment: Decimal;
  /** Each track's payment this month, in the order of the tracks (0 after a track has ended). */
  byTrack: Decimal[];
  /** The mix's balance after this month's payments. */
  balance: Decimal;
}

/** Every track's schedule under one scenario, in order (rounded as the scenario, or each track, says). */
export function mixSchedules(tracks: TrackSpec[], scenario: Scenario = {}): ScheduleRow[][] {
  if (tracks.length === 0) throw new RangeError("a mix needs at least one track");
  return tracks.map((t) => trackSchedule(t, scenario));
}

/** The mix's cash flow, month by month, up to its longest track's last month. Set `scenario.rounding` to "statement" for a statement's figures. */
export function mixCashFlow(tracks: TrackSpec[], scenario: Scenario = {}, schedules: ScheduleRow[][] = mixSchedules(tracks, scenario)): MixMonth[] {
  const months = Math.max(...schedules.map((s) => s.length));
  return Array.from({ length: months }, (_, t) => {
    const byTrack = schedules.map((s) => (t < s.length ? s[t].payment : ZERO));
    const balance = schedules.reduce((sum, s) => sum.plus(t < s.length ? s[t].closing : ZERO), new D(0));
    return { month: t + 1, payment: byTrack.reduce((a, b) => a.plus(b), new D(0)), byTrack, balance };
  });
}

/** A mix's headline figures under one scenario. */
export interface MixSummary {
  /** The payment in month 1. */
  firstPayment: Decimal;
  /** The highest monthly payment in this scenario, and the first month it is reached (compared to the agora). */
  maxPayment: Decimal;
  maxMonth: number;
  /** Every payment of every track, added up, in shekels as paid. */
  totalPaid: Decimal;
  /** The longest track's term, in months. */
  months: number;
}

export function mixSummary(flow: MixMonth[]): MixSummary {
  if (flow.length === 0) throw new RangeError("an empty cash flow");
  // Compared to the agora, so equal payments in different months tie, and the first one wins.
  const cents = (d: Decimal) => d.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  let max = flow[0];
  for (const m of flow) if (cents(m.payment).gt(cents(max.payment))) max = m;
  return {
    firstPayment: flow[0].payment,
    maxPayment: max.payment,
    maxMonth: max.month,
    totalPaid: flow.reduce((s, m) => s.plus(m.payment), new D(0)),
    months: flow.length,
  };
}

/**
 * The last month of the run that starts at the highest payment: the months after
 * mixSummary's maxMonth that keep paying the same, compared to the agora (lesson
 * 3.7: "the highest payment, from month 61 to month 179"). maxMonth itself when
 * the next month already differs.
 */
export function maxRunEnd(flow: MixMonth[]): number {
  const { maxPayment, maxMonth } = mixSummary(flow);
  const cents = (d: Decimal) => d.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  let end = maxMonth;
  while (end < flow.length && cents(flow[end].payment).eq(cents(maxPayment))) end++;
  return end;
}

/** How much of a mix sits in each kind of exposure, in shekels and in percent of the loan. */
export interface Exposure {
  total: Decimal;
  /** In a prime track. */
  prime: Decimal;
  /** Linked to the index (fixed or variable). */
  linked: Decimal;
  /** At a rate fixed for the whole term (linked or not). */
  fixedForTerm: Decimal;
  /** In a variable track that resets every few years. */
  resetting: Decimal;
  /** The same four, in percent of the total. */
  share: { prime: Decimal; linked: Decimal; fixedForTerm: Decimal; resetting: Decimal };
}

export function exposure(tracks: TrackSpec[]): Exposure {
  const total = tracks.reduce((s, t) => s.plus(t.amount), new D(0));
  if (total.lte(0)) throw new RangeError("a mix's total must be above zero");
  const part = (test: (k: TrackKind) => boolean) => tracks.filter((t) => test(t.kind)).reduce((s, t) => s.plus(t.amount), new D(0));
  const prime = part((k) => k === "prime");
  const linked = part(isLinked);
  const fixedForTerm = part(isFixedForTerm);
  const resetting = part(resets);
  const pct = (x: Decimal) => x.div(total).mul(HUNDRED);
  return { total, prime, linked, fixedForTerm, resetting, share: { prime: pct(prime), linked: pct(linked), fixedForTerm: pct(fixedForTerm), resetting: pct(resetting) } };
}

/**
 * The mistake lesson 3.7 warns against: one level payment for the whole mix,
 * at the amount-weighted rate, over the amount-weighted term (rounded to whole
 * months, half up). It is not the mix's payment; it is here to show the gap.
 */
export function oneFormulaPayment(tracks: TrackSpec[]): Decimal {
  const total = tracks.reduce((s, t) => s.plus(t.amount), new D(0));
  if (total.lte(0)) throw new RangeError("a mix's total must be above zero");
  const rate = tracks.reduce((s, t) => s.plus(new D(t.amount).mul(t.rate)), new D(0)).div(total);
  const months = tracks.reduce((s, t) => s.plus(new D(t.amount).mul(t.months)), new D(0)).div(total).toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber();
  return annuityPayment(total, rate, months);
}

/**
 * Splits a loan into tracks by shares in percent (they should add up to 100):
 * every track but the last rounded to the agora, the last takes the rest, so
 * the tracks always add up to the loan (mix.ts's splitByWeights).
 */
export function splitLoan(loan: Numeric, sharesPercent: Numeric[]): Decimal[] {
  return splitByWeights(loan, sharesPercent);
}

// ---------------------------------------------------------------------------
// The loan's start: base date and interim period (lesson 3.5)
// ---------------------------------------------------------------------------

/** When the schedule starts, by the day the money is paid out. */
export interface ScheduleStart {
  /** The day the schedule counts from (ISO date): the 1st of a month. */
  start: string;
  /** The first payment's day (ISO date): a month after the start. */
  firstPayment: string;
  /** The interim period (תקופת ביניים) in days, between the payout and the start. */
  interimDays: number;
  /** "credit": the money came after the start, so the schedule counts days the borrower did not have it. "charge": the money came before the start. "none": on the 1st. */
  direction: "credit" | "charge" | "none";
}

const iso = (d: Date) => d.toISOString().slice(0, 10);
const DAY = 86_400_000;

/**
 * The rule the team transcribed from Directive 451 §17 (Brain, not verified
 * against the source): money paid out on the 1st–15th of a month → the loan is
 * counted from the 1st of that month, first payment on the 1st of the next;
 * on the 16th or later → counted from the 1st of the next month, first payment
 * a month after that. `payout` is an ISO date ("2026-11-20").
 */
export function scheduleStart(payout: string): ScheduleStart {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(payout);
  if (!m) throw new RangeError(`payout must be an ISO date, got ${payout}`);
  const [y, mo, d] = [Number(m[1]), Number(m[2]) - 1, Number(m[3])];
  const paid = new Date(Date.UTC(y, mo, d));
  if (paid.getUTCDate() !== d) throw new RangeError(`not a real date: ${payout}`);
  const start = new Date(Date.UTC(y, d <= 15 ? mo : mo + 1, 1));
  const first = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
  const days = Math.round((paid.getTime() - start.getTime()) / DAY);
  return { start: iso(start), firstPayment: iso(first), interimDays: Math.abs(days), direction: days > 0 ? "credit" : days < 0 ? "charge" : "none" };
}

/**
 * Interest for an interim period, at the loan's annual rate (§18(ג), as
 * transcribed) counted by the day: amount × rate ÷ 100 × days ÷ 365. The ÷ 365
 * is the course's calculation assumption; the contract sets the exact method.
 */
export function interimInterest(amount: Numeric, annualPercent: Numeric, days: number): Decimal {
  if (!Number.isInteger(days) || days < 0) throw new RangeError(`days must be a whole number of at least 0, got ${days}`);
  return new D(amount).mul(annualPercent).div(HUNDRED).mul(days).div(365);
}

// ---------------------------------------------------------------------------
// Facts: a flat encoding of a track and a mix (shared with checks/kinds/schedule.py)
// ---------------------------------------------------------------------------

/** Flat fact inputs for one path: principal, months, method, rate, change_k_month/_rate, index_k or inflation_k (+ inflation_block_months), and rounding when it is "statement". */
export type PathInputs = Record<string, string | number>;

/** Builds a path's flat inputs. */
export function pathInputs(p: {
  principal: Numeric;
  months: number;
  rate: Numeric;
  method?: ScheduleMethod;
  changes?: { month: number; rate: Numeric }[];
  index?: Numeric[];
  inflation?: Numeric[];
  inflationBlockMonths?: number;
  rounding?: Rounding;
}): PathInputs {
  const out: PathInputs = { principal: String(p.principal), months: p.months, method: p.method ?? "spitzer", rate: String(p.rate) };
  if (p.rounding && p.rounding !== "exact") out.rounding = p.rounding;
  (p.changes ?? []).forEach((c, k) => {
    out[`change_${k + 1}_month`] = c.month;
    out[`change_${k + 1}_rate`] = String(c.rate);
  });
  (p.index ?? []).forEach((v, k) => (out[`index_${k}`] = String(v)));
  (p.inflation ?? []).forEach((v, k) => (out[`inflation_${k + 1}`] = String(v)));
  if (p.inflation && p.inflation.length > 0) out.inflation_block_months = p.inflationBlockMonths ?? 12;
  return out;
}

const numbered = (i: PathInputs, prefix: string, from = 1): string[] => {
  const out: string[] = [];
  for (let k = from; `${prefix}_${k}` in i; k++) out.push(String(i[`${prefix}_${k}`]));
  return out;
};

/** The schedule a path's flat inputs describe. */
export function scheduleFromInputs(i: PathInputs): ScheduleRow[] {
  const months = Number(i.months);
  const changes: { month: number; rate: string }[] = [];
  for (let k = 1; `change_${k}_month` in i; k++) changes.push({ month: Number(i[`change_${k}_month`]), rate: String(i[`change_${k}_rate`]) });
  const rates = rateChangesPath(String(i.rate), months, changes);
  const index = numbered(i, "index", 0);
  const inflation = numbered(i, "inflation");
  const factors = index.length > 0 ? indexFactorsFromIndex(index, months) : inflation.length > 0 ? indexPath(inflation, Number(i.inflation_block_months ?? 12), months) : undefined;
  return scheduleFromPaths(String(i.principal), rates, factors, (i.method as ScheduleMethod) ?? "spitzer", (i.rounding as Rounding) ?? "exact");
}

/** Flat fact inputs for a mix and its scenario: t{k}_kind/_amount/_rate/_months/_method/_reset/_rounding, block_months, rounding, inflation_k, prime_shift_k, anchor_shift_k, linked_anchor_shift_k. */
export function mixInputs(tracks: TrackSpec[], scenario: Scenario = {}): PathInputs {
  const out: PathInputs = { tracks: tracks.length, block_months: scenario.blockMonths ?? 12 };
  tracks.forEach((t, k) => {
    const p = `t${k + 1}_`;
    out[`${p}kind`] = t.kind;
    out[`${p}amount`] = String(t.amount);
    out[`${p}rate`] = String(t.rate);
    out[`${p}months`] = t.months;
    out[`${p}method`] = t.method ?? "spitzer";
    if (resets(t.kind)) out[`${p}reset`] = t.resetMonths ?? DEFAULT_RESET_MONTHS;
    if (t.rounding) out[`${p}rounding`] = t.rounding;
  });
  if (scenario.rounding && scenario.rounding !== "exact") out.rounding = scenario.rounding;
  const put = (name: string, values?: Numeric[]) => (values ?? []).forEach((v, k) => (out[`${name}_${k + 1}`] = String(v)));
  put("inflation", scenario.inflation);
  put("prime_shift", scenario.primeShift);
  put("anchor_shift", scenario.anchorShift);
  put("linked_anchor_shift", scenario.linkedAnchorShift);
  return out;
}

/** The mix and scenario that flat inputs describe. */
export function mixFromInputs(i: PathInputs): { tracks: TrackSpec[]; scenario: Scenario } {
  const tracks: TrackSpec[] = Array.from({ length: Number(i.tracks) }, (_, k) => {
    const p = `t${k + 1}_`;
    const t: TrackSpec = { kind: i[`${p}kind`] as TrackKind, amount: String(i[`${p}amount`]), rate: String(i[`${p}rate`]), months: Number(i[`${p}months`]), method: i[`${p}method`] as ScheduleMethod };
    if (`${p}reset` in i) t.resetMonths = Number(i[`${p}reset`]);
    if (`${p}rounding` in i) t.rounding = i[`${p}rounding`] as Rounding;
    return t;
  });
  const opt = (name: string) => {
    const v = numbered(i, name);
    return v.length > 0 ? v : undefined;
  };
  const scenario: Scenario = { blockMonths: Number(i.block_months ?? 12) };
  const inflation = opt("inflation");
  const primeShift = opt("prime_shift");
  const anchorShift = opt("anchor_shift");
  const linkedAnchorShift = opt("linked_anchor_shift");
  if (inflation) scenario.inflation = inflation;
  if (primeShift) scenario.primeShift = primeShift;
  if (anchorShift) scenario.anchorShift = anchorShift;
  if (linkedAnchorShift) scenario.linkedAnchorShift = linkedAnchorShift;
  if (i.rounding) scenario.rounding = i.rounding as Rounding;
  return { tracks, scenario };
}
