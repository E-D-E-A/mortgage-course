/**
 * Simple and compound interest — the arithmetic behind lessons 0.2 and 0.3.
 *
 * Every number the course shows is computed here (or in a sibling module),
 * written to a data file by scripts/build-data.ts, and checked against an
 * independent Python calculation in checks/independent_check.py.
 *
 * Rates are percentages per period, given as strings ("5" means 5% per period),
 * so a rate never passes through a binary float. Results are exact Decimals;
 * rounding to agorot happens only when a value is shown (see money.ts).
 */
import Decimal from "decimal.js";

export type Numeric = Decimal.Value;

const ONE = new Decimal(1);

/** The rate as a fraction: "5" → 0.05. */
export function rateFraction(ratePercent: Numeric): Decimal {
  return new Decimal(ratePercent).div(100);
}

/** Balance after `periods` periods when interest is added to the balance each period. */
export function compoundBalance(principal: Numeric, ratePercent: Numeric, periods: number): Decimal {
  assertPeriods(periods);
  return new Decimal(principal).mul(ONE.plus(rateFraction(ratePercent)).pow(periods));
}

/** Balance after `periods` periods when interest is paid on the principal only. */
export function simpleBalance(principal: Numeric, ratePercent: Numeric, periods: number): Decimal {
  assertPeriods(periods);
  return new Decimal(principal).mul(ONE.plus(rateFraction(ratePercent).mul(periods)));
}

export interface CompoundRow {
  /** 1-based period number. */
  period: number;
  opening: Decimal;
  /** Interest earned in this period: opening × rate. */
  interest: Decimal;
  /** The part of this period's interest that simple interest would also pay: principal × rate. */
  interestOnPrincipal: Decimal;
  /** The rest of this period's interest: interest earned on earlier interest. */
  interestOnInterest: Decimal;
  closing: Decimal;
}

/**
 * Period-by-period table of a compounding balance, the way a statement shows it:
 * each period's interest is rounded to the agora before it is added, so every
 * row adds up. Its final balance can differ from compoundBalance (rounded once,
 * at the end) by a few agorot; lesson 0.3 shows the learner why.
 */
export function compoundTable(principal: Numeric, ratePercent: Numeric, periods: number): CompoundRow[] {
  assertPeriods(periods);
  const p = new Decimal(principal);
  const r = rateFraction(ratePercent);
  const rows: CompoundRow[] = [];
  let balance = p;
  for (let period = 1; period <= periods; period++) {
    const interest = balance.mul(r).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    const interestOnPrincipal = p.mul(r);
    rows.push({
      period,
      opening: balance,
      interest,
      interestOnPrincipal,
      interestOnInterest: interest.minus(interestOnPrincipal),
      closing: balance.plus(interest),
    });
    balance = balance.plus(interest);
  }
  return rows;
}

/** The first whole number of periods after which the balance has at least doubled. */
export function periodsToDouble(ratePercent: Numeric): number {
  const growth = ONE.plus(rateFraction(ratePercent));
  if (growth.lte(1)) throw new RangeError("a balance never doubles at a rate of zero or less");
  let factor = ONE;
  let periods = 0;
  while (factor.lt(2)) {
    factor = factor.mul(growth);
    periods++;
  }
  return periods;
}

/** The rule of 72: an approximation of the periods to double, 72 ÷ rate. */
export function ruleOf72(ratePercent: Numeric): Decimal {
  return new Decimal(72).div(ratePercent);
}

/** The exact (fractional) number of periods to double: ln 2 ÷ ln(1 + r). */
export function exactPeriodsToDouble(ratePercent: Numeric): Decimal {
  return Decimal.ln(2).div(Decimal.ln(ONE.plus(rateFraction(ratePercent))));
}

function assertPeriods(periods: number): void {
  if (!Number.isInteger(periods) || periods < 0) {
    throw new RangeError(`periods must be a whole number of at least 0, got ${periods}`);
  }
}
