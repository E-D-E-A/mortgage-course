/**
 * How a lender earns, and the Bank of Israel rate — the arithmetic behind
 * lessons 0.9 (loan, deposit, cost of funds, spread) and 0.10 (the Bank of
 * Israel rate and the decisions of 2026).
 *
 * Rates are percentages given as strings ("5" means 5%). A difference between
 * two rates is in percentage points, not percent. Results are exact Decimals;
 * money is rounded to the agora only for display (money.ts). Recomputed
 * independently in checks/kinds/lending.py.
 */
import Decimal from "decimal.js";

export type Numeric = Decimal.Value;

const HUNDRED = new Decimal(100);

/** The spread, in percentage points: the rate the lender charges minus what its money costs it. */
export function spread(loanRatePercent: Numeric, costOfFundsPercent: Numeric): Decimal {
  return new Decimal(loanRatePercent).minus(costOfFundsPercent);
}

/** Interest on an amount for one year at a yearly rate: amount × rate. */
export function yearInterest(amount: Numeric, ratePercent: Numeric): Decimal {
  return new Decimal(amount).mul(ratePercent).div(HUNDRED);
}

/** The loan rate that gives a wanted yearly spread income on an amount: cost of funds + income ÷ amount. */
export function rateForSpreadIncome(amount: Numeric, income: Numeric, costOfFundsPercent: Numeric): Decimal {
  const a = new Decimal(amount);
  if (a.lte(0)) throw new RangeError("the amount must be more than zero");
  return new Decimal(income).div(a).mul(HUNDRED).plus(costOfFundsPercent);
}

/**
 * The prime rate in Israel: the Bank of Israel rate plus a fixed 1.5 percentage
 * points (Bank of Israel consumer explainer, read through a search summary on
 * 2026-10-09; not yet checked against the page itself).
 */
export const PRIME_ADDITION = "1.5";

export function primeFromPolicy(policyRatePercent: Numeric, additionPoints: Numeric = PRIME_ADDITION): Decimal {
  return new Decimal(policyRatePercent).plus(additionPoints);
}

/** The change between two rates, in percentage points (negative for a cut). */
export function rateChange(beforePercent: Numeric, afterPercent: Numeric): Decimal {
  return new Decimal(afterPercent).minus(beforePercent);
}

/** By what percent of itself a rate fell: (before − after) ÷ before × 100. Not percentage points. */
export function relativeDrop(beforePercent: Numeric, afterPercent: Numeric): Decimal {
  const before = new Decimal(beforePercent);
  if (before.lte(0)) throw new RangeError("the starting rate must be more than zero");
  return before.minus(afterPercent).div(before).mul(HUNDRED);
}

/** The rate after `count` equal cuts of `cut` percentage points each. */
export function rateAfterCuts(startPercent: Numeric, cutPoints: Numeric, count: number): Decimal {
  if (!Number.isInteger(count) || count < 0) throw new RangeError(`count must be a whole number of at least 0, got ${count}`);
  return new Decimal(startPercent).minus(new Decimal(cutPoints).mul(count));
}

export interface Decision {
  date: string;
  /** The rate after the decision, in percent. */
  rate: Numeric;
}

export interface PathRow {
  date: string;
  before: Decimal;
  rate: Decimal;
  change: Decimal;
  prime: Decimal;
}

/** A sequence of rate decisions from a starting rate: each row's rate before and after, its change and the prime that follows. */
export function ratePath(startRatePercent: Numeric, decisions: Decision[]): PathRow[] {
  let before = new Decimal(startRatePercent);
  return decisions.map((d) => {
    const rate = new Decimal(d.rate);
    const row = { date: d.date, before, rate, change: rate.minus(before), prime: primeFromPolicy(rate) };
    before = rate;
    return row;
  });
}
