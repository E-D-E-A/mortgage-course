/**
 * Measures of a whole repayment schedule — the arithmetic behind lessons 3.8
 * (the first payment, the payment under today's terms and the highest payment
 * under a forecast), 3.9 (the total paid, and where it goes: principal,
 * interest, indexation, fees), 3.10 (the value today of a schedule, and the one
 * rate that explains every payment: the internal rate of return, IRR) and 3.11
 * (why those three measures can rank two schedules differently).
 *
 * Conventions, the course's everywhere:
 *  - A track's rate is a contract's nominal annual rate in percent, as a
 *    string; the monthly rate is the annual rate ÷ 12 (lesson 0.4).
 *  - Payments are monthly, at the end of each month. A payment list starts
 *    with month 1.
 *  - Schedules here are exact: nothing is rounded on the way; money is rounded
 *    to the agora once, when shown (money.ts). A bank statement rounds every
 *    month, so its totals can differ from these by agorot.
 *  - The schedules themselves come from schedule.ts (lessons 3.5–3.7), which
 *    builds on amortization.ts: the level payment, a rate that changes at
 *    resets (recalculated on the balance left, over the months left), equal
 *    principal, and indexation (the balance moves by the index before each
 *    payment). This file adds grace (lesson 2.10, exact) and the measures.
 *  - A variable track's future rates, and a linked track's index, are teaching
 *    inputs here — never a forecast. Mogi forecasts only from the Bank of
 *    Israel's published forecast inputs (Brain 67436545).
 *
 * The IRR is found by bisection: the value today of the payments falls as the
 * rate rises, so halving a bracket that holds the answer always closes in on
 * it. The search stops when the bracket is narrower than 10⁻¹² percentage
 * points a month, far below any digit the course shows.
 *
 * Recomputed independently in checks/kinds/metrics.py (which finds the IRR by
 * Newton's method instead).
 *
 * Exports are stable: other lessons may import them. Add, don't rename.
 */
import Decimal from "decimal.js";
import { monthlyIndexFactor, pathSchedule } from "./amortization.ts";
import { scheduleFromPaths } from "./schedule.ts";

export type Numeric = Decimal.Value;

const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
const ZERO = new D(0);
const ONE = new D(1);
const HUNDRED = new D(100);
const TWELVE = new D(12);

export type Method = "spitzer" | "equal_principal" | "grace_partial" | "grace_full";

/** One loan track, described by its contract and (for a variable or linked track) a teaching path. */
export interface Track {
  principal: Numeric;
  /**
   * Nominal annual rates in percent, one per block of `blockMonths` months:
   * ["4.8"] for a rate that never moves; ["4.6", "5.1", …] for a variable
   * track whose rate is reset every `blockMonths` months. The last one carries on.
   */
  rates: Numeric[];
  /** Months in each block of `rates`. Default: the whole term. */
  blockMonths?: number;
  months: number;
  /** Default "spitzer". Grace takes one rate and no index. */
  method?: Method;
  /** A linked track: the index rises by this percent a year, at an even monthly pace. Default 0 (not linked). */
  inflationPercent?: Numeric;
  /** Grace methods: months of grace at the start, inside the term. */
  graceMonths?: number;
}

/** One month of a track. */
export interface MetricRow {
  month: number;
  /** The balance at the start of the month, after this month's indexation. */
  opening: Decimal;
  /** What indexation added to the balance this month (zero on an unlinked track). */
  indexation: Decimal;
  interest: Decimal;
  payment: Decimal;
  /** payment − interest: what repays the debt (negative when unpaid interest joins it). */
  principalPaid: Decimal;
  closing: Decimal;
  /** The nominal annual rate in force this month, in percent. */
  rate: Decimal;
}

function assertWhole(name: string, value: number, min: number): void {
  if (!Number.isInteger(value) || value < min) throw new RangeError(`${name} must be a whole number of at least ${min}, got ${value}`);
}

/** The month-by-month rates of a track: each block's rate for its months, the last carrying on. */
export function ratePath(track: Track): Decimal[] {
  assertWhole("months", track.months, 1);
  if (track.rates.length === 0) throw new RangeError("a track needs at least one rate");
  const block = track.blockMonths ?? track.months;
  assertWhole("blockMonths", block, 1);
  return Array.from({ length: track.months }, (_, t) => new D(track.rates[Math.min(Math.floor(t / block), track.rates.length - 1)]));
}

/** A grace period at the start, then the level payment on what is owed, over the months left. Exact. */
function graceRows(track: Track, kind: "partial" | "full"): MetricRow[] {
  const grace = track.graceMonths ?? 0;
  assertWhole("graceMonths", grace, 0);
  if (grace >= track.months) throw new RangeError("the grace must be shorter than the loan");
  const rate = new D(track.rates[0]);
  const m = rate.div(TWELVE).div(HUNDRED);
  const rows: MetricRow[] = [];
  let balance = new D(track.principal);
  for (let k = 1; k <= grace; k++) {
    const interest = balance.mul(m);
    const payment = kind === "partial" ? interest : ZERO;
    const closing = balance.plus(interest).minus(payment);
    rows.push({ month: k, opening: balance, indexation: ZERO, interest, payment, principalPaid: payment.minus(interest), closing, rate });
    balance = closing;
  }
  const after = pathSchedule(balance, Array.from({ length: track.months - grace }, () => rate));
  for (const r of after) {
    rows.push({ month: r.month + grace, opening: r.opening, indexation: ZERO, interest: r.interest, payment: r.payment, principalPaid: r.principalPaid, closing: r.closing, rate });
  }
  return rows;
}

/** Every month of a track, exact (round only for display). */
export function trackRows(track: Track): MetricRow[] {
  const method = track.method ?? "spitzer";
  const inflation = new D(track.inflationPercent ?? 0);
  if ((method === "grace_partial" || method === "grace_full") && (track.rates.length !== 1 || !inflation.isZero())) {
    throw new RangeError(`${method} takes one rate and no index`);
  }
  if (method === "grace_partial") return graceRows(track, "partial");
  if (method === "grace_full") return graceRows(track, "full");
  const factors = inflation.isZero() ? undefined : Array.from({ length: track.months }, () => monthlyIndexFactor(inflation));
  return scheduleFromPaths(track.principal, ratePath(track), factors, method).map((r) => ({
    month: r.month,
    opening: r.opening,
    indexation: r.indexation,
    interest: r.interest,
    payment: r.payment,
    principalPaid: r.principalPaid,
    closing: r.closing,
    rate: r.rate,
  }));
}

/** The payment of each month of a track, month 1 first. */
export function trackPayments(track: Track): Decimal[] {
  return trackRows(track).map((r) => r.payment);
}

/** A mix's cash flow: the tracks' payments added month by month. A track that has ended adds nothing. */
export function mixPayments(tracks: Track[]): Decimal[] {
  if (tracks.length === 0) throw new RangeError("a mix needs at least one track");
  const each = tracks.map(trackPayments);
  const months = Math.max(...each.map((p) => p.length));
  return Array.from({ length: months }, (_, t) => each.reduce((s, p) => (t < p.length ? s.plus(p[t]) : s), new D(0)));
}

/** The payment in month 1. */
export function firstPayment(payments: Numeric[]): Decimal {
  if (payments.length === 0) throw new RangeError("no payments");
  return new D(payments[0]);
}

/** The highest payment, and the first month it is paid. */
export function highestPayment(payments: Numeric[]): { month: number; payment: Decimal } {
  if (payments.length === 0) throw new RangeError("no payments");
  let best = 0;
  for (let t = 1; t < payments.length; t++) if (new D(payments[t]).gt(payments[best])) best = t;
  return { month: best + 1, payment: new D(payments[best]) };
}

/** The payment in a given month (1-based). */
export function paymentInMonth(payments: Numeric[], month: number): Decimal {
  assertWhole("month", month, 1);
  if (month > payments.length) throw new RangeError(`month ${month} is after the last payment (${payments.length})`);
  return new D(payments[month - 1]);
}

/** By how many percent `value` is above `base`: (value ÷ base − 1) × 100. */
export function percentAbove(value: Numeric, base: Numeric): Decimal {
  const b = new D(base);
  if (b.isZero()) throw new RangeError("the base cannot be zero");
  return new D(value).div(b).minus(ONE).mul(HUNDRED);
}

/** Everything paid: the sum of the payments. */
export function totalPaid(payments: Numeric[]): Decimal {
  return payments.reduce<Decimal>((s, p) => s.plus(p), new D(0));
}

/** Where a track's payments go: the principal lent, the interest, and what indexation added. They add up to the total paid. */
export interface Breakdown {
  principal: Decimal;
  interest: Decimal;
  indexation: Decimal;
  total: Decimal;
}

export function breakdown(track: Track): Breakdown {
  const rows = trackRows(track);
  const interest = rows.reduce((s, r) => s.plus(r.interest), new D(0));
  const indexation = rows.reduce((s, r) => s.plus(r.indexation), new D(0));
  return { principal: new D(track.principal), interest, indexation, total: totalPaid(rows.map((r) => r.payment)) };
}

/**
 * The value today of a list of payments at a monthly rate in percent:
 * C₁ ÷ (1 + r) + C₂ ÷ (1 + r)² + … — lesson 0.6, one payment a month.
 */
export function presentValue(payments: Numeric[], monthlyPercent: Numeric): Decimal {
  const g = ONE.plus(new D(monthlyPercent).div(HUNDRED));
  if (g.lte(0)) throw new RangeError("a rate of −100% or less cannot be discounted");
  const step = ONE.div(g);
  let factor = ONE;
  let total = new D(0);
  for (const p of payments) {
    factor = factor.mul(step);
    total = total.plus(new D(p).mul(factor));
  }
  return total;
}

/** The value today at an annual rate taken monthly the contract way: monthly = annual ÷ 12. */
export function presentValueAtAnnual(payments: Numeric[], annualPercent: Numeric): Decimal {
  return presentValue(payments, new D(annualPercent).div(TWELVE));
}

/** The value today of each payment on its own: payment ÷ (1 + r)^k. */
export interface PresentValueRow {
  month: number;
  payment: Decimal;
  /** (1 + r)^k, what the payment is divided by. */
  growth: Decimal;
  valueToday: Decimal;
}

export function presentValueRows(payments: Numeric[], monthlyPercent: Numeric): PresentValueRow[] {
  const g = ONE.plus(new D(monthlyPercent).div(HUNDRED));
  return payments.map((p, i) => {
    const growth = g.pow(i + 1);
    return { month: i + 1, payment: new D(p), growth, valueToday: new D(p).div(growth) };
  });
}

/** The IRR's search bracket, in percent a month, and when it stops. */
const LOW = -50;
const HIGH = 100;
export const IRR_TOLERANCE_PERCENT = "1e-12";

/**
 * The internal rate of return, monthly, in percent: the one monthly rate at
 * which the value today of the payments equals what the borrower received
 * (the loan, less any fees taken on the day it is paid out). Found by
 * bisection to within 10⁻¹² percentage points; throws when the payments are
 * not a loan's (none positive, or the answer is outside −50% to 100% a month).
 */
export function irrMonthly(payments: Numeric[], received: Numeric): Decimal {
  if (payments.length === 0) throw new RangeError("no payments");
  if (payments.some((p) => new D(p).isNegative())) throw new RangeError("payments must not be negative");
  const target = new D(received);
  if (!target.gt(0)) throw new RangeError("the amount received must be more than zero");
  let low = new D(LOW);
  let high = new D(HIGH);
  const gap = (r: Decimal) => presentValue(payments, r).minus(target);
  if (gap(low).lt(0) || gap(high).gt(0)) throw new RangeError("no rate between −50% and 100% a month explains these payments");
  const tol = new D(IRR_TOLERANCE_PERCENT);
  while (high.minus(low).gt(tol)) {
    const mid = low.plus(high).div(2);
    if (gap(mid).gt(0)) low = mid;
    else high = mid;
  }
  return low.plus(high).div(2);
}

/** One step of the search, as the lesson shows it by hand. */
export interface BisectionStep {
  step: number;
  low: Decimal;
  high: Decimal;
  /** The middle of the bracket, tried this step. */
  mid: Decimal;
  /** The value today of the payments at the middle rate. */
  valueToday: Decimal;
  /** "low" when the middle was too low (the value today is still above what was received), "high" otherwise. */
  verdict: "low" | "high";
}

/** The first `steps` steps of the bisection from a bracket the learner chooses (monthly percent). */
export function bisectionSteps(payments: Numeric[], received: Numeric, lowPercent: Numeric, highPercent: Numeric, steps: number): BisectionStep[] {
  assertWhole("steps", steps, 1);
  let low = new D(lowPercent);
  let high = new D(highPercent);
  const out: BisectionStep[] = [];
  for (let s = 1; s <= steps; s++) {
    const mid = low.plus(high).div(2);
    const valueToday = presentValue(payments, mid);
    const verdict = valueToday.gt(received) ? "low" : "high";
    out.push({ step: s, low, high, mid, valueToday, verdict });
    if (verdict === "low") low = mid;
    else high = mid;
  }
  return out;
}

/** A monthly rate as a yearly one by multiplication: × 12 (lesson 0.4's first way, read backwards). */
export function annualByMultiplication(monthlyPercent: Numeric): Decimal {
  return new D(monthlyPercent).mul(TWELVE);
}

/** A monthly rate as an effective annual rate: ((1 + r)^12 − 1) × 100 (lesson 0.4). */
export function effectiveAnnual(monthlyPercent: Numeric): Decimal {
  return ONE.plus(new D(monthlyPercent).div(HUNDRED)).pow(12).minus(ONE).mul(HUNDRED);
}
