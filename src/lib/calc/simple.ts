/**
 * Simple interest, year by year — the arithmetic behind lesson 0.2.
 *
 * The balance formula itself (principal × (1 + r × n)) lives in compound.ts as
 * simpleBalance, beside compound interest; this module adds what lesson 0.2
 * shows on its own: the interest of one year, the total over n years, and the
 * table of a loan whose interest is paid at the end of every year.
 */
import Decimal from "decimal.js";
import { simpleBalance } from "./compound.ts";
import { percentOf } from "./percent.ts";

export type Numeric = Decimal.Value;

/** Total simple interest over `periods` periods: principal × r × n. */
export function simpleInterest(principal: Numeric, ratePercent: Numeric, periods: number): Decimal {
  return simpleBalance(principal, ratePercent, periods).minus(principal);
}

export interface SimpleRow {
  /** 1-based year. */
  period: number;
  /** Interest of this year: always principal × r, since it is computed on the principal only. */
  interest: Decimal;
  /** All interest paid up to the end of this year. */
  totalInterest: Decimal;
}

/** Year-by-year table of a simple-interest loan: the same interest every year, and its running total. */
export function simpleInterestTable(principal: Numeric, ratePercent: Numeric, periods: number): SimpleRow[] {
  const yearly = percentOf(principal, ratePercent);
  // simpleBalance validates `periods` (a whole number of at least 0).
  simpleBalance(principal, ratePercent, periods);
  return Array.from({ length: periods }, (_, i) => ({
    period: i + 1,
    interest: yearly,
    totalInterest: simpleInterest(principal, ratePercent, i + 1),
  }));
}

/** A plain quotient, for "how many years" and "how many times" questions: a ÷ b. */
export function quotient(dividend: Numeric, divisor: Numeric): Decimal {
  const d = new Decimal(divisor);
  if (d.isZero()) throw new RangeError("division by zero");
  return new Decimal(dividend).div(d);
}
