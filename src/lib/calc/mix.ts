/**
 * The arithmetic of a mortgage made of several loans — lessons 1.3 (three
 * separate questions), 1.4 (track and mix) and 1.5 (kinds of deals).
 *
 * - Splitting a loan into slices (tracks): every slice but the last is rounded
 *   to the agora; the last slice takes what is left, so the slices always add
 *   up to the loan exactly. A third is a third: weights, not whole percents.
 * - A slice's share of the loan, in percent.
 * - Two simple ways to return the principal, one year at a time, to show that
 *   the repayment method and the interest rate act on different parts of a
 *   payment (lesson 1.3). Yearly payments, not monthly, so the numbers can be
 *   done in the head; stage 3 does the real monthly schedule.
 *
 * Rates are percentages given as strings ("5" means 5%). Results are exact
 * Decimals; money is rounded to the agora only where a slice must be booked
 * (splitByWeights) or for display (money.ts). Recomputed independently in
 * checks/kinds/mix.py.
 */
import Decimal from "decimal.js";
import { toAgorot } from "./money.ts";

export type Numeric = Decimal.Value;

const HUNDRED = new Decimal(100);

function positive(value: Numeric, what: string): Decimal {
  const d = new Decimal(value);
  if (d.lte(0)) throw new RangeError(`${what} must be more than zero`);
  return d;
}

/** One slice of a loan: loan × weight ÷ total weight (exact; round for display). Weights may be percents (total 100) or parts (1 of 3). */
export function sliceAmount(loan: Numeric, weight: Numeric, totalWeight: Numeric = 100): Decimal {
  return new Decimal(loan).mul(weight).div(positive(totalWeight, "the total weight"));
}

/** A value cut (not rounded) to some decimal places, to show that a division goes on: 546,666.6666… */
export function cutTo(value: Numeric, places: number): Decimal {
  return new Decimal(value).toDecimalPlaces(places, Decimal.ROUND_DOWN);
}

/**
 * Splits a loan by weights. Every slice but the last is rounded to the agora;
 * the last is the loan minus the others, so the slices add up to the loan exactly.
 */
export function splitByWeights(loan: Numeric, weights: Numeric[]): Decimal[] {
  if (weights.length === 0) throw new RangeError("at least one slice is needed");
  const total = weights.reduce<Decimal>((s, w) => s.plus(positive(w, "every weight")), new Decimal(0));
  const amounts = weights.slice(0, -1).map((w) => toAgorot(sliceAmount(loan, w, total)));
  const taken = amounts.reduce((s, a) => s.plus(a), new Decimal(0));
  return [...amounts, new Decimal(loan).minus(taken)];
}

/** A slice's share of the loan, in percent: amount ÷ loan × 100. */
export function shareOf(amount: Numeric, loan: Numeric): Decimal {
  return new Decimal(amount).div(positive(loan, "the loan")).mul(HUNDRED);
}

/** A weight's share of the total, in percent: 1 of 3 → 33.33…%. */
export function weightShare(weight: Numeric, totalWeight: Numeric): Decimal {
  return new Decimal(weight).div(positive(totalWeight, "the total weight")).mul(HUNDRED);
}

/** The share as a plain fraction, before × 100 (the classic slip). */
export function shareFraction(amount: Numeric, loan: Numeric): Decimal {
  return new Decimal(amount).div(positive(loan, "the loan"));
}

/** Adds amounts (or shares). */
export function sum(values: Numeric[]): Decimal {
  return values.reduce<Decimal>((s, v) => s.plus(v), new Decimal(0));
}

/** What is left of the loan for the last slice: loan − the other slices. */
export function remainder(loan: Numeric, others: Numeric[]): Decimal {
  return new Decimal(loan).minus(sum(others));
}

/** How many different combinations: the choices for each question multiplied together. */
export function combinations(counts: number[]): number {
  for (const c of counts) {
    if (!Number.isInteger(c) || c < 1) throw new RangeError(`every count must be a whole number of at least 1, got ${c}`);
  }
  return counts.reduce((p, c) => p * c, 1);
}

/**
 * Two simple ways to return the principal, counted in whole years:
 * - "equal_principal": the same part of the principal every year;
 * - "interest_only": only interest every year, and the whole principal in the last year.
 */
export type YearlyMethod = "equal_principal" | "interest_only";

function checkYear(years: number, year: number): void {
  if (!Number.isInteger(years) || years < 1) throw new RangeError(`years must be a whole number of at least 1, got ${years}`);
  if (!Number.isInteger(year) || year < 1 || year > years) throw new RangeError(`year must be between 1 and ${years}, got ${year}`);
}

/** The principal repaid in a given year. */
export function principalPart(loan: Numeric, years: number, method: YearlyMethod, year: number): Decimal {
  checkYear(years, year);
  if (method === "equal_principal") return new Decimal(loan).div(years);
  return year === years ? new Decimal(loan) : new Decimal(0);
}

/** The debt at the start of a given year, before that year's payment. */
export function balanceAtStart(loan: Numeric, years: number, method: YearlyMethod, year: number): Decimal {
  checkYear(years, year);
  if (method === "equal_principal") return new Decimal(loan).minus(new Decimal(loan).div(years).mul(year - 1));
  return new Decimal(loan);
}

/** The interest for a given year: the debt at the start of the year × that year's rate. */
export function interestPart(loan: Numeric, years: number, method: YearlyMethod, year: number, ratePercent: Numeric): Decimal {
  return balanceAtStart(loan, years, method, year).mul(ratePercent).div(HUNDRED);
}

/** The year's payment: principal part + interest part. */
export function yearPayment(loan: Numeric, years: number, method: YearlyMethod, year: number, ratePercent: Numeric): Decimal {
  return principalPart(loan, years, method, year).plus(interestPart(loan, years, method, year, ratePercent));
}
