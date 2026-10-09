/**
 * One debt balance and the two forces on it, year by year — the arithmetic
 * behind lesson 2.11 ("אותה יתרת חוב: ריבית מול הצמדה, כל אחד בנפרד") and the
 * risk exercises of lesson 2.12.
 *
 * The teaching model is yearly, on purpose: monthly schedules are stage 3.
 * In one year:
 *   1. indexation (indexed tracks only) moves the balance itself:  X = P × π
 *   2. interest is charged on the indexed balance:                   I = (P + X) × r
 *      which splits exactly into interest on the opening balance (P × r)
 *      and interest on the indexation addition (X × r);
 *   3. one payment at the end of the year takes C off:               B = P + X + I − C.
 * A rate change does not touch the balance on the day it happens; it changes
 * the interest from then on: P × (new rate − old rate).
 *
 * Rates and inflation are percent strings ("3" means 3%), so nothing passes
 * through a binary float. Single facts round once, at the end (money.ts). The
 * year-by-year table follows the statement convention: each year's indexation
 * and interest rounded to the agora before they are added.
 *
 * Every number the lessons show is computed here, written to a data file by
 * scripts/build-data.ts, and recomputed independently in checks/kinds/balance.py.
 */
import Decimal from "decimal.js";

export type Numeric = Decimal.Value;

const HUNDRED = new Decimal(100);
const pct = (p: Numeric) => new Decimal(p).div(HUNDRED);

/** What indexation adds to the balance in a year when the index rises by π percent: P × π. */
export function indexationAdded(balance: Numeric, inflationPercent: Numeric): Decimal {
  return new Decimal(balance).mul(pct(inflationPercent));
}

/** A year's interest on a balance at r percent: P × r. */
export function interestOn(balance: Numeric, ratePercent: Numeric): Decimal {
  return new Decimal(balance).mul(pct(ratePercent));
}

/** The year's interest on an indexed balance: (P + P × π) × r. With π = 0, P × r. */
export function yearInterest(balance: Numeric, ratePercent: Numeric, inflationPercent: Numeric = 0): Decimal {
  return interestOn(new Decimal(balance).plus(indexationAdded(balance, inflationPercent)), ratePercent);
}

/** The part of the year's interest that exists only because of indexation: P × π × r. */
export function interestOnIndexation(balance: Numeric, ratePercent: Numeric, inflationPercent: Numeric): Decimal {
  return interestOn(indexationAdded(balance, inflationPercent), ratePercent);
}

/** The extra interest in a year after the rate moves from `oldRate` to `newRate` percent: P × (new − old). */
export function rateChangeInterest(balance: Numeric, oldRatePercent: Numeric, newRatePercent: Numeric): Decimal {
  return new Decimal(balance).mul(pct(newRatePercent).minus(pct(oldRatePercent)));
}

/** The balance after one year: P × (1 + π) × (1 + r) − C, rounded once (by the caller, via money.ts). */
export function balanceAfterYear(balance: Numeric, ratePercent: Numeric, inflationPercent: Numeric, payment: Numeric): Decimal {
  const P = new Decimal(balance);
  return P.plus(indexationAdded(P, inflationPercent)).plus(yearInterest(P, ratePercent, inflationPercent)).minus(payment);
}

export interface YearParts {
  opening: Decimal;
  /** P × π: the balance itself grows (0 on an unindexed track). */
  indexation: Decimal;
  /** P × r at the rate before the change. */
  interestBase: Decimal;
  /** P × (new − old): the extra interest the rate change brings (0 with no change). */
  interestFromChange: Decimal;
  /** P × π × r_new: interest charged on the indexation addition. */
  interestOnIndexation: Decimal;
  /** All of the year's interest: the three parts above. */
  interest: Decimal;
  payment: Decimal;
  closing: Decimal;
  /** closing − opening: negative when the balance went down. */
  change: Decimal;
  /** How much of the payment went to the balance after interest and indexation: C − I − X (may be negative). */
  principalPaid: Decimal;
}

/**
 * One year, split into its forces, exactly (no rounding): the illustration's
 * model. `ratePercent` is the rate before any change; `newRatePercent` the
 * rate for this year (equal to it when nothing changed).
 */
export function yearParts(input: {
  balance: Numeric;
  ratePercent: Numeric;
  newRatePercent?: Numeric;
  inflationPercent?: Numeric;
  payment?: Numeric;
}): YearParts {
  const opening = new Decimal(input.balance);
  const oldRate = new Decimal(input.ratePercent);
  const newRate = new Decimal(input.newRatePercent ?? input.ratePercent);
  const inflation = new Decimal(input.inflationPercent ?? 0);
  const payment = new Decimal(input.payment ?? 0);
  const indexation = indexationAdded(opening, inflation);
  const interestBase = interestOn(opening, oldRate);
  const interestFromChange = rateChangeInterest(opening, oldRate, newRate);
  const interestOnIdx = interestOn(indexation, newRate);
  const interest = interestBase.plus(interestFromChange).plus(interestOnIdx);
  const closing = opening.plus(indexation).plus(interest).minus(payment);
  return {
    opening,
    indexation,
    interestBase,
    interestFromChange,
    interestOnIndexation: interestOnIdx,
    interest,
    payment,
    closing,
    change: closing.minus(opening),
    principalPaid: payment.minus(interest).minus(indexation),
  };
}

export interface BalanceRow {
  /** 1-based year. */
  period: number;
  opening: Decimal;
  indexation: Decimal;
  interest: Decimal;
  closing: Decimal;
}

/**
 * Year-by-year table the way a statement shows it: each year's indexation is
 * rounded to the agora and added; the interest is computed on that indexed
 * balance and rounded to the agora; then the payment comes off. Every row adds up.
 */
export function balanceTable(
  balance: Numeric,
  ratePercent: Numeric,
  inflationPercent: Numeric,
  payment: Numeric,
  years: number,
): BalanceRow[] {
  if (!Number.isInteger(years) || years < 1) throw new RangeError(`years must be a whole number of at least 1, got ${years}`);
  const rows: BalanceRow[] = [];
  let opening = new Decimal(balance);
  for (let period = 1; period <= years; period++) {
    const indexation = indexationAdded(opening, inflationPercent).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    const interest = interestOn(opening.plus(indexation), ratePercent).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    const closing = opening.plus(indexation).plus(interest).minus(payment);
    rows.push({ period, opening, indexation, interest, closing });
    opening = closing;
  }
  return rows;
}
