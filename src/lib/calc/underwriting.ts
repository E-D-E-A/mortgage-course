/**
 * Underwriting, credit data and the collateral — the arithmetic behind lessons
 * 4.7 (what the bank checks: declared against verified), 4.8 (credit data and
 * the account's conduct) and 4.9 (the collateral: the appraisal and the
 * insurances). Owned by stage-4 author C.
 *
 * What is here, and what is not:
 *  - The repayment ratio is the payment ÷ the income × 100 (Mogi decision,
 *    Brain 67436545: "relevant monthly repayment ÷ recognized disposable
 *    monthly income × 100"). Lesson 4.3 owns the full rule (which payment,
 *    which income, the 18-month rule); this file only applies the division to
 *    a declared and a verified income, to show the gap underwriting finds.
 *  - The financing ratio is the loan ÷ the value × 100 (lesson 1.2, ltv.ts).
 *    Which value — the price, the appraisal, or the lower of the two — is a
 *    question lesson 1.2 left open; `lowerOf` only computes the lower one, and
 *    the lesson says which rule it shows and how sure it is.
 *  - Payments are the level payment (שפיצר) of amortization.ts, each track's
 *    payment rounded to the agora before they are added (as a statement shows
 *    them), so every sum printed on a page adds up.
 *
 * Rates are nominal annual percent strings; money is exact until shown, except
 * where a function says it rounds. Recomputed independently in
 * checks/kinds/underwriting.py. Exports are stable: add, don't rename.
 */
import Decimal from "decimal.js";
import { annuityBalance, annuityPayment } from "./amortization.ts";

export type Numeric = Decimal.Value;

const HUNDRED = new Decimal(100);

export interface Track {
  principal: Numeric;
  ratePercent: Numeric;
  months: number;
}

function positive(x: Numeric, what: string): Decimal {
  const d = new Decimal(x);
  if (d.lte(0)) throw new RangeError(`${what} must be above zero, got ${d.toString()}`);
  return d;
}

function nonNegative(x: Numeric, what: string): Decimal {
  const d = new Decimal(x);
  if (d.isNeg()) throw new RangeError(`${what} must not be negative, got ${d.toString()}`);
  return d;
}

const agorot = (x: Numeric) => new Decimal(x).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

/** One track's level payment, rounded to the agora. */
export function trackPayment(track: Track): Decimal {
  return agorot(annuityPayment(track.principal, track.ratePercent, track.months));
}

/** The mix's monthly payment: each track's payment rounded to the agora, then added. */
export function mixPayment(tracks: Track[]): Decimal {
  if (tracks.length === 0) throw new RangeError("a mix needs at least one track");
  return tracks.reduce((sum, t) => sum.plus(trackPayment(t)), new Decimal(0));
}

/** The sum of some amounts (incomes, deposits). */
export function total(amounts: Numeric[]): Decimal {
  return amounts.reduce<Decimal>((sum, a) => sum.plus(nonNegative(a, "an amount")), new Decimal(0));
}

/** The average of some amounts, exact. */
export function average(amounts: Numeric[]): Decimal {
  if (amounts.length === 0) throw new RangeError("no amounts to average");
  return total(amounts).div(amounts.length);
}

/** A ratio in percent: part ÷ whole × 100, exact. The repayment ratio is payment ÷ income × 100. */
export function ratioPercent(part: Numeric, whole: Numeric): Decimal {
  return nonNegative(part, "the part").div(positive(whole, "the whole")).mul(HUNDRED);
}

/** How much smaller the verified amount is than the declared one, in percent of the declared: (declared − verified) ÷ declared × 100. */
export function shortfallPercent(declared: Numeric, verified: Numeric): Decimal {
  const d = positive(declared, "the declared amount");
  return d.minus(nonNegative(verified, "the verified amount")).div(d).mul(HUNDRED);
}

/** The lower of two values (the price and the appraisal, for example). */
export function lowerOf(a: Numeric, b: Numeric): Decimal {
  const x = nonNegative(a, "a value");
  const y = nonNegative(b, "a value");
  return x.lt(y) ? x : y;
}

/**
 * The largest loan, split between the tracks in the same proportions as
 * `tracks`, whose payment is at most `capPercent` of `income`. The payment is
 * proportional to the loan when the split, the rates and the terms stay, so
 * the loan is the allowed payment ÷ the payment per shekel of loan. Rounded
 * DOWN to a whole `step` of shekels (1,000 by default), so it never passes the cap.
 */
export function maxLoanAtRatio(tracks: Track[], income: Numeric, capPercent: Numeric, step: Numeric = 1000): Decimal {
  if (tracks.length === 0) throw new RangeError("a mix needs at least one track");
  const loan = tracks.reduce((s, t) => s.plus(positive(t.principal, "a track's principal")), new Decimal(0));
  const exactPayment = tracks.reduce((s, t) => s.plus(annuityPayment(t.principal, t.ratePercent, t.months)), new Decimal(0));
  const perShekel = exactPayment.div(loan);
  const allowed = positive(income, "the income").mul(nonNegative(capPercent, "the cap")).div(HUNDRED);
  const s = positive(step, "the step");
  return allowed.div(perShekel).div(s).floor().mul(s);
}

/** The same mix scaled to a new loan: each track keeps its share of the loan, its rate and its term. */
export function scaleMix(tracks: Track[], newLoan: Numeric): Track[] {
  const loan = tracks.reduce((s, t) => s.plus(positive(t.principal, "a track's principal")), new Decimal(0));
  const target = positive(newLoan, "the new loan");
  return tracks.map((t) => ({ ...t, principal: new Decimal(t.principal).mul(target).div(loan).toDecimalPlaces(2, Decimal.ROUND_HALF_UP) }));
}

/** What the mix still owes after `paid` monthly payments: the tracks' balances added, exact. */
export function mixBalance(tracks: Track[], paid: number): Decimal {
  return tracks.reduce((s, t) => s.plus(annuityBalance(t.principal, t.ratePercent, t.months, Math.min(paid, t.months))), new Decimal(0));
}

/**
 * The first number of payments after which the mix owes no more than
 * `threshold` (lesson 4.9: below ₪30,000 the bank may not require the
 * insurances, as the team transcribed the directive). 0 if the loan starts at
 * or below it.
 */
export function paymentsUntilBalanceAtMost(tracks: Track[], threshold: Numeric): number {
  const limit = nonNegative(threshold, "the threshold");
  const longest = Math.max(...tracks.map((t) => t.months));
  for (let k = 0; k <= longest; k++) if (mixBalance(tracks, k).lte(limit)) return k;
  return longest;
}
