/**
 * Value today of money that arrives later — the arithmetic behind lessons
 * 0.5 (the time value of money) and 0.6 (present value, discounting).
 *
 * Moving an amount forward n periods multiplies it by (1 + r)^n; moving it back
 * to today divides by the same factor. The value today of several payments is
 * the sum of each payment moved back on its own. This is also how a loan's
 * amount relates to its payments: at the loan's rate, the value today of all
 * the payments equals the amount lent (lesson 0.6 shows it; stage 3 builds on it).
 *
 * Rates are percentages per period as strings; results are exact Decimals,
 * rounded to agorot only when shown (money.ts), except in the period-by-period
 * tables, which follow the statement convention and round each line.
 */
import Decimal from "decimal.js";

export type Numeric = Decimal.Value;

const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
const ONE = new D(1);
const HUNDRED = new D(100);

function assertPeriods(periods: number, min = 0): void {
  if (!Number.isInteger(periods) || periods < min) {
    throw new RangeError(`periods must be a whole number of at least ${min}, got ${periods}`);
  }
}

function growth(ratePercent: Numeric): Decimal {
  const g = ONE.plus(new D(ratePercent).div(HUNDRED));
  if (g.lte(0)) throw new RangeError("a rate of −100% or less cannot be discounted");
  return g;
}

/** What `amount` today grows to after `periods` periods: amount × (1 + r)^n. */
export function valueLater(amount: Numeric, ratePercent: Numeric, periods: number): Decimal {
  assertPeriods(periods);
  return new D(amount).mul(growth(ratePercent).pow(periods));
}

/** 1 ÷ (1 + r)^n: what one shekel arriving after n periods is worth today. */
export function discountFactor(ratePercent: Numeric, periods: number): Decimal {
  assertPeriods(periods);
  return ONE.div(growth(ratePercent).pow(periods));
}

/** What `amount` arriving after `periods` periods is worth today: amount ÷ (1 + r)^n. */
export function valueToday(amount: Numeric, ratePercent: Numeric, periods: number): Decimal {
  return new D(amount).mul(discountFactor(ratePercent, periods));
}

/**
 * The beginner's mistake the lessons answer: taking r% off for each period
 * instead of dividing — amount × (1 − r × n).
 */
export function percentOffMistake(amount: Numeric, ratePercent: Numeric, periods: number): Decimal {
  assertPeriods(periods);
  return new D(amount).mul(ONE.minus(new D(ratePercent).div(HUNDRED).mul(periods)));
}

/** The value today of `periods` equal payments, one at the end of each period. Exact, unrounded. */
export function streamValueToday(payment: Numeric, ratePercent: Numeric, periods: number): Decimal {
  assertPeriods(periods, 1);
  let total = new D(0);
  for (let n = 1; n <= periods; n++) total = total.plus(valueToday(payment, ratePercent, n));
  return total;
}

export interface StreamRow {
  /** 1-based: the payment arrives at the end of this period. */
  period: number;
  payment: Decimal;
  /** 1 ÷ (1 + r)^period, unrounded. */
  factor: Decimal;
  /** payment × factor, unrounded. */
  valueToday: Decimal;
}

/** One row per payment: when it arrives, and what it is worth today. */
export function streamTable(payment: Numeric, ratePercent: Numeric, periods: number): StreamRow[] {
  assertPeriods(periods, 1);
  return Array.from({ length: periods }, (_, i) => {
    const period = i + 1;
    const factor = discountFactor(ratePercent, period);
    return { period, payment: new D(payment), factor, valueToday: new D(payment).mul(factor) };
  });
}

export interface LoanRow {
  period: number;
  opening: Decimal;
  /** opening × rate, rounded to the agora (statement convention). */
  interest: Decimal;
  payment: Decimal;
  closing: Decimal;
}

/**
 * A loan repaid by equal payments at the end of each period, the way a
 * statement shows it: each period's interest rounded to the agora, added to
 * the balance, then the payment taken off. Used to show that a loan equal to
 * the value today of its payments ends at (about) zero.
 */
export function loanBalanceTable(principal: Numeric, ratePercent: Numeric, payment: Numeric, periods: number): LoanRow[] {
  assertPeriods(periods, 1);
  const r = new D(ratePercent).div(HUNDRED);
  const pay = new D(payment);
  const rows: LoanRow[] = [];
  let balance = new D(principal);
  for (let period = 1; period <= periods; period++) {
    const interest = balance.mul(r).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    const closing = balance.plus(interest).minus(pay);
    rows.push({ period, opening: balance, interest, payment: pay, closing });
    balance = closing;
  }
  return rows;
}
