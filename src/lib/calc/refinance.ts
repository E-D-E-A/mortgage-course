/**
 * The refinance test and the comparison of "stay" with "switch" — the
 * arithmetic behind lessons 7.4 (refinancing: when it pays), 7.5 (internal and
 * external refinance) and, later, 7.8 (the workshop).
 *
 * What the course teaches (as the team transcribed Directive 451 §15א and
 * Appendix 4, Brain 7733250, read on 3 August 2026 — a transcription, not
 * checked against the directive):
 *  - For a loan that already exists, two figures are computed by the same
 *    appendix, over the REMAINING term, per track and for the whole loan:
 *        P + T = C₁ ÷ (1 + r) + C₂ ÷ (1 + r)² + … + C_n ÷ (1 + r)ⁿ
 *    where P is the principal still owed after the last payment made, C₁…C_n
 *    are the payments still to come, and T the charges due if the loan were
 *    repaid today.
 *      - the expected total rate: T = 0 (the cost of the loan from here);
 *      - the rate for comparison purposes: T = the early-repayment fee and any
 *        other charge due if repaid now (the cost of staying, counting that
 *        leaving costs money).
 *    Both are turned into a yearly rate as the appendix does for the actual
 *    cost of credit: e = (1 + r)¹² − 1.
 *  - The regulator's own sentence: when the rate for comparison purposes is
 *    higher than the expected total rate in the pre-approval of the NEW loan,
 *    refinancing is economically worthwhile.
 *
 * Mind the direction: T is ADDED to what is owed (in lesson 3.10 a fee is
 * subtracted from what was received). The same payments "buy" a larger amount,
 * P + T, so the rate that explains them is LOWER than without T. That lower
 * number is the bar the new loan has to beat.
 *
 * ── API (stable; add, don't rename) ─────────────────────────────────────────
 *   tailOf(track, paymentsMade)        the loan as it stands today: balance, payments left, balance after each.
 *   stayFigures(payments, balance, T)  the two figures for one stream of remaining payments.
 *   existingLoan(tracks, sharedFee)    per track and for the whole loan. A shared charge (the ₪60 operational fee,
 *                                      charged once per repayment, not per track) belongs to the whole-loan figure
 *                                      only — OUR modelling choice; how a bank splits it per track is not known.
 *   refinanceTest(comparison, newRate) the regulator's sentence: strictly higher means worthwhile.
 *   newLoanOf(offer, forecast)         the new side, from offers.ts (payments, balances, the expected total rate).
 *   fixedOffer(args, forecast)         a one-track fixed unlinked offer, for the simple cases.
 *   trajectory(...)                    month by month: cash saved so far, the balance gap, and the net position.
 *   switchSummary(...)                 monthly gap, totals, break-even months, present-value saving.
 *   monthsAtPayment(amount, rate, pay) how many months a new loan lasts when you keep paying what you pay today
 *                                      (the saving of a lower rate, read as a shorter loan).
 *
 * ── Inputs that are NOT computed here ───────────────────────────────────────
 *  The early-repayment fee T comes from src/lib/calc/earlyrepay.ts (lessons
 *  7.1–7.3) or from a statement; this module takes it as an input, so the two
 *  modules stay independent.
 *
 * ── Conventions ─────────────────────────────────────────────────────────────
 *  - Rates are nominal annual percents as strings (a contract's), the monthly rate is ÷ 12; the IRRs are monthly
 *    percents; the yearly figures are effective ((1 + IRR)¹² − 1), never mixed with the nominal contract rate.
 *  - Money is shekels, rounded to the agora only for display (money.ts).
 *  - An existing loan is a metrics.ts Track. Its rounding is the caller's choice: the worked example of lesson 7.2 is
 *    the team's own computation, which carries the level payment unrounded ("exact"); a bank's statement rounds each
 *    month ("statement") and can differ from it by some agorot.
 *  - The new loan is an offers.ts Offer (statement rounding), so everything lessons 5.1–5.3 taught about offers holds.
 *  - The cash view ignores the fee that leaving the NEW loan later would cost: unknown today.
 *
 * Recomputed independently in checks/kinds/refinance.py (Python's Decimal, Newton's method for the IRR).
 */
import Decimal from "decimal.js";
import { annuityPayment } from "./amortization.ts";
import { effectiveAnnual, firstPayment, irrMonthly, presentValue, totalPaid, type MetricRow, type Track, trackRows } from "./metrics.ts";
import { moneyString } from "./money.ts";
import { type Forecast, type Offer, measureOffer, offerTracks, paymentPath } from "./offers.ts";

export type Numeric = Decimal.Value;

const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
const ZERO = new D(0);

function assertWhole(name: string, value: number, min: number): void {
  if (!Number.isInteger(value) || value < min) throw new RangeError(`${name} must be a whole number of at least ${min}, got ${value}`);
}

// ---------------------------------------------------------------- the loan as it stands today

/** An existing track, the payments already made, and the charges due if it were repaid today. */
export interface ExistingTrack {
  name?: string;
  /** The contract and its schedule (metrics.ts), from the first payment. */
  track: Track;
  /** How many monthly payments were made. */
  paymentsMade: number;
  /** T for this track: the early-repayment fee (the discounting fee after reductions; lessons 7.2–7.3), in shekels. */
  fee: Numeric;
}

/** A track as it stands: what is owed, what is still to be paid, and what is owed after each of those payments. */
export interface Tail {
  /** P: the principal owed after the last payment made. */
  balance: Decimal;
  /** C₁ … C_n: the payments still to come. */
  payments: Decimal[];
  /** The balance after each payment still to come (the last is zero). */
  balances: Decimal[];
}

export function tailOf(track: Track, paymentsMade: number): Tail {
  assertWhole("paymentsMade", paymentsMade, 0);
  const rows: MetricRow[] = trackRows(track);
  if (paymentsMade >= rows.length) throw new RangeError(`${paymentsMade} payments made, but the loan has only ${rows.length}: nothing is left to refinance`);
  const balance = paymentsMade === 0 ? new D(track.principal) : rows[paymentsMade - 1].closing;
  const left = rows.slice(paymentsMade);
  return { balance, payments: left.map((r) => r.payment), balances: left.map((r) => r.closing) };
}

// ---------------------------------------------------------------- the two figures of §15א

/** The two figures for one stream of remaining payments. */
export interface StayFigures {
  /** P. */
  balance: Decimal;
  /** T. */
  fee: Decimal;
  /** P + T: what it takes to be free of the loan today (what a new loan would have to cover). */
  financed: Decimal;
  payments: Decimal[];
  /** n: payments left. */
  months: number;
  first: Decimal;
  /** The sum of the payments still to come. */
  total: Decimal;
  /** The monthly IRR, T excluded, in percent. */
  irrWithout: Decimal;
  /** The monthly IRR, T included, in percent. */
  irrWith: Decimal;
  /** The expected total rate: effective annual percent, T excluded. */
  expectedTotalRate: Decimal;
  /** The rate for comparison purposes: effective annual percent, T included. */
  comparisonRate: Decimal;
}

export function stayFigures(payments: Numeric[], balance: Numeric, fee: Numeric): StayFigures {
  if (payments.length === 0) throw new RangeError("no payments left");
  const p = new D(balance);
  const t = new D(fee);
  if (t.isNegative()) throw new RangeError("the fee cannot be negative");
  const pay = payments.map((x) => new D(x));
  const irr0 = irrMonthly(pay, p);
  const irr1 = irrMonthly(pay, p.plus(t));
  return {
    balance: p,
    fee: t,
    financed: p.plus(t),
    payments: pay,
    months: pay.length,
    first: firstPayment(pay),
    total: totalPaid(pay),
    irrWithout: irr0,
    irrWith: irr1,
    expectedTotalRate: effectiveAnnual(irr0),
    comparisonRate: effectiveAnnual(irr1),
  };
}

/** Per track and for the whole loan. */
export interface ExistingLoan {
  tracks: StayFigures[];
  whole: StayFigures;
  /** The balance after each remaining month, whole loan (zero once everything is repaid). */
  balances: Decimal[];
}

const addLists = (lists: Decimal[][]): Decimal[] => {
  const n = Math.max(...lists.map((l) => l.length));
  return Array.from({ length: n }, (_, k) => lists.reduce((s, l) => (k < l.length ? s.plus(l[k]) : s), ZERO));
};

export function existingLoan(tracks: ExistingTrack[], sharedFee: Numeric = 0): ExistingLoan {
  if (tracks.length === 0) throw new RangeError("a loan needs at least one track");
  const tails = tracks.map((t) => tailOf(t.track, t.paymentsMade));
  const per = tracks.map((t, i) => stayFigures(tails[i].payments, tails[i].balance, t.fee));
  const balance = tails.reduce((s, t) => s.plus(t.balance), ZERO);
  const fee = tracks.reduce((s, t) => s.plus(t.fee), new D(sharedFee));
  return { tracks: per, whole: stayFigures(addLists(tails.map((t) => t.payments)), balance, fee), balances: addLists(tails.map((t) => t.balances)) };
}

/** The regulator's sentence (as transcribed): worthwhile when the rate for comparison purposes is HIGHER than the new loan's expected total rate. */
export interface TestResult {
  worthwhile: boolean;
  /** comparison − new, in percentage points of effective annual rate; positive: the new loan is cheaper. */
  margin: Decimal;
}

export function refinanceTest(comparisonRate: Numeric, newExpectedTotalRate: Numeric): TestResult {
  const margin = new D(comparisonRate).minus(newExpectedTotalRate);
  return { worthwhile: margin.gt(0), margin };
}

// ---------------------------------------------------------------- the new loan

export interface NewLoan {
  offer: Offer;
  /** The loan: what the new lender lends (it should cover P + T when the fee is financed). */
  loan: Decimal;
  /** The charges collected on the day it is advanced. */
  upfront: Decimal;
  payments: Decimal[];
  /** The balance after each payment (the last is zero). */
  balances: Decimal[];
  months: number;
  first: Decimal;
  total: Decimal;
  /** Its expected total rate: effective annual percent. */
  expectedTotalRate: Decimal;
}

export function newLoanOf(offer: Offer, forecast: Forecast): NewLoan {
  const m = measureOffer(offer, forecast);
  const payments = paymentPath(offer, forecast);
  const balances = addLists(offerTracks(offer, forecast).map((t) => trackRows(t).map((r) => r.closing)));
  return { offer, loan: new D(m.loan), upfront: new D(offer.upfront), payments, balances, months: payments.length, first: firstPayment(payments), total: totalPaid(payments), expectedTotalRate: m.expectedTotalRate };
}

/** A one-track fixed unlinked offer: the simple new loan of the lessons. Amount in shekels, rate nominal percent. */
export function fixedOffer(args: { name: string; amount: Numeric; months: number; rate: Numeric; upfront?: Numeric }, forecast: Forecast): Offer {
  return {
    name: args.name,
    month: forecast.month,
    forecast: forecast.id,
    upfront: moneyString(args.upfront ?? 0),
    tracks: [{ kind: "fixed_unlinked", amount: moneyString(args.amount), months: args.months, rate: new D(args.rate).toString() }],
  };
}

// ---------------------------------------------------------------- stay or switch

/** One month of the comparison (month 0 is the day of the switch). */
export interface TrajectoryPoint {
  month: number;
  /** What the new loan has saved in payments so far, less what was paid in cash on day 0 (positive: ahead). */
  cash: Decimal;
  /** What is still owed on the old loan less what is still owed on the new one (positive: the new loan owes less). */
  balanceGap: Decimal;
  /** cash + balanceGap: where you would stand if both loans could be closed that month at no charge. */
  position: Decimal;
}

export interface Stream {
  payments: Decimal[];
  /** The balance after each payment. */
  balances: Decimal[];
  /** The balance on day 0. */
  start: Decimal;
}

const at = (xs: Decimal[], k: number): Decimal => (k >= 1 && k <= xs.length ? xs[k - 1] : ZERO);

/**
 * Month by month, from day 0: `cashNow` is what is paid out of pocket on the day of the switch (the new loan's
 * up-front charges, and the exit fee when it is not financed). A payment missing at the end of a shorter loan is zero.
 */
export function trajectory(stay: Stream, next: Stream, cashNow: Numeric): TrajectoryPoint[] {
  const horizon = Math.max(stay.payments.length, next.payments.length);
  let cash = new D(cashNow).neg();
  const out: TrajectoryPoint[] = [];
  for (let k = 0; k <= horizon; k++) {
    if (k > 0) cash = cash.plus(at(stay.payments, k)).minus(at(next.payments, k));
    const stayBalance = k === 0 ? stay.start : at(stay.balances, k);
    const newBalance = k === 0 ? next.start : at(next.balances, k);
    const gap = stayBalance.minus(newBalance);
    out.push({ month: k, cash, balanceGap: gap, position: cash.plus(gap) });
  }
  return out;
}

export interface SwitchSummary {
  /** Old first payment − new first payment; positive: the new payment is lower. */
  monthlyGap: Decimal;
  stayTotal: Decimal;
  /** The new loan's payments plus the cash paid on day 0. */
  switchTotal: Decimal;
  /** stayTotal − switchTotal; positive: fewer shekels in all. */
  totalSaving: Decimal;
  /** The first month the cash saved so far is not negative; null if never. */
  cashBreakEven: number | null;
  /** The first month the net position is not negative; null if never. */
  positionBreakEven: number | null;
  /** The saving in present value at a monthly rate (percent), when one is given; null otherwise. */
  presentValueSaving: Decimal | null;
}

export function switchSummary(stay: Stream, next: Stream, cashNow: Numeric, discountMonthlyPercent?: Numeric): SwitchSummary {
  const path = trajectory(stay, next, cashNow);
  const stayTotal = totalPaid(stay.payments);
  const switchTotal = totalPaid(next.payments).plus(cashNow);
  const firstAhead = (pick: (p: TrajectoryPoint) => Decimal) => path.find((p) => p.month > 0 && !pick(p).isNegative())?.month ?? null;
  return {
    monthlyGap: firstPayment(stay.payments).minus(firstPayment(next.payments)),
    stayTotal,
    switchTotal,
    totalSaving: stayTotal.minus(switchTotal),
    cashBreakEven: firstAhead((p) => p.cash),
    positionBreakEven: firstAhead((p) => p.position),
    presentValueSaving: discountMonthlyPercent === undefined ? null : presentValue(stay.payments, discountMonthlyPercent).minus(presentValue(next.payments, discountMonthlyPercent)).minus(cashNow),
  };
}

/** The stay stream of an existing loan (whole loan or one track). */
export const stayStream = (balance: Numeric, payments: Decimal[], balances: Decimal[]): Stream => ({ payments, balances, start: new D(balance) });

/** The switch stream of a new loan. */
export const switchStream = (n: NewLoan): Stream => ({ payments: n.payments, balances: n.balances, start: n.loan });

/** The longest loan searched for in monthsAtPayment: 60 years, far beyond any mortgage. */
const MAX_MONTHS = 720;

/**
 * The fewest months in which a loan of `amount` at a nominal annual rate is repaid by a level payment of at most
 * `payment` (the exact annuity, unrounded). It answers: "if I keep paying what I pay today on a cheaper loan, when is it over?"
 * Throws when the payment does not even cover the interest.
 */
export function monthsAtPayment(amount: Numeric, annualPercent: Numeric, payment: Numeric): number {
  const pay = new D(payment);
  for (let n = 1; n <= MAX_MONTHS; n++) if (annuityPayment(amount, annualPercent, n).lte(pay)) return n;
  throw new RangeError("this payment does not repay the loan within 60 years");
}
