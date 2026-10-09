/**
 * Annual and monthly rates — the arithmetic behind lesson 0.4.
 *
 * Two different conversions, never to be mixed silently:
 *  - Division: a stated annual rate (the rate a loan contract names) is turned
 *    into a monthly rate by dividing it by 12. 6% a year → 0.5% a month.
 *    Interest added every month then grows the balance by more than 6% in a
 *    year — that larger figure is the effective annual rate.
 *  - Twelfth root: when the annual figure is already an effective rate, the
 *    monthly rate that compounds to exactly it is (1 + R)^(1/12) − 1.
 *
 * Rates are percentages as strings ("6" means 6%), so a rate never passes
 * through a binary float. Roots and powers run at 40 significant digits;
 * a rate is rounded only when it is shown (percentString).
 */
import Decimal from "decimal.js";

export type Numeric = Decimal.Value;

/** A private Decimal with room for fractional powers; results convert freely to the default Decimal. */
const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
const ONE = new D(1);
const HUNDRED = new D(100);

function assertPeriodsPerYear(periodsPerYear: number): void {
  if (!Number.isInteger(periodsPerYear) || periodsPerYear < 1) {
    throw new RangeError(`periods per year must be a whole number of at least 1, got ${periodsPerYear}`);
  }
}

/** The monthly (periodic) rate by division: annual ÷ 12. "6" → 0.5 (percent). */
export function periodicRateByDivision(annualPercent: Numeric, periodsPerYear = 12): Decimal {
  assertPeriodsPerYear(periodsPerYear);
  return new D(annualPercent).div(periodsPerYear);
}

/**
 * The effective annual rate of a stated annual rate whose interest is added
 * `periodsPerYear` times a year at annual ÷ periodsPerYear each time:
 * ((1 + r/m)^m − 1) × 100. "6" monthly → 6.1677811864... (percent).
 */
export function effectiveAnnualRate(annualPercent: Numeric, periodsPerYear = 12): Decimal {
  const periodic = periodicRateByDivision(annualPercent, periodsPerYear).div(HUNDRED);
  return ONE.plus(periodic).pow(periodsPerYear).minus(ONE).mul(HUNDRED);
}

/**
 * The periodic rate that compounds to exactly the given effective annual rate:
 * ((1 + R)^(1/m) − 1) × 100. "6" → 0.4867550565... (percent) — a twelfth root.
 */
export function periodicRateFromEffective(effectivePercent: Numeric, periodsPerYear = 12): Decimal {
  assertPeriodsPerYear(periodsPerYear);
  const base = ONE.plus(new D(effectivePercent).div(HUNDRED));
  if (base.lte(0)) throw new RangeError("an effective rate of −100% or less has no periodic rate");
  return base.pow(ONE.div(periodsPerYear)).minus(ONE).mul(HUNDRED);
}

/** (1 + r)^n for a rate in percent: what one shekel grows to over n periods. */
export function growthFactor(ratePercent: Numeric, periods: number): Decimal {
  if (!Number.isInteger(periods) || periods < 0) {
    throw new RangeError(`periods must be a whole number of at least 0, got ${periods}`);
  }
  return ONE.plus(new D(ratePercent).div(HUNDRED)).pow(periods);
}

/**
 * A rate or factor rounded for display, half away from zero, with trailing
 * zeros dropped: (6.16778…, 2) → "6.17"; (0.5, 4) → "0.5".
 */
export function roundedString(value: Numeric, decimals: number): string {
  return new D(value).toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP).toFixed();
}
