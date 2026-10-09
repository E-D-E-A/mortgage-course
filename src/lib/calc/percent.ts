/**
 * Percent — the arithmetic behind lesson 0.1.
 *
 * Percentages are strings or Decimals ("3" means 3%), so a rate never passes
 * through a binary float. Money results are exact Decimals; they are rounded to
 * the agora only when shown (money.ts). Percentage results are rounded to two
 * decimals by percentString, the one place that decides how a percent is shown.
 */
import Decimal from "decimal.js";

export type Numeric = Decimal.Value;

/** p% of an amount: amount × p ÷ 100. 3% of 200 → 6. */
export function percentOf(amount: Numeric, ratePercent: Numeric): Decimal {
  return new Decimal(amount).mul(ratePercent).div(100);
}

/** What one hundredth (1%) of an amount is worth: amount ÷ 100. */
export function onePercent(amount: Numeric): Decimal {
  return new Decimal(amount).div(100);
}

/** The multiplier that applies a change of p% (negative for a fall): 10 → 1.1, −10 → 0.9. */
export function changeFactor(ratePercent: Numeric): Decimal {
  return new Decimal(1).plus(new Decimal(ratePercent).div(100));
}

/** An amount after a change of p% (negative for a fall): 200, +10 → 220. */
export function afterChange(amount: Numeric, ratePercent: Numeric): Decimal {
  return new Decimal(amount).mul(changeFactor(ratePercent));
}

/** An amount after several changes in a row, each measured from the amount just before it. */
export function afterChanges(amount: Numeric, ratesPercent: Numeric[]): Decimal {
  return ratesPercent.reduce<Decimal>((value, rate) => afterChange(value, rate), new Decimal(amount));
}

/** What percent `part` is of `whole`: part ÷ whole × 100. 30 of 200 → 15. */
export function sharePercent(part: Numeric, whole: Numeric): Decimal {
  const w = new Decimal(whole);
  if (w.isZero()) throw new RangeError("a share of zero is not defined");
  return new Decimal(part).div(w).mul(100);
}

/** The change from `from` to `to`, in percent of `from` (negative for a fall): 4 → 5 is 25. */
export function relativeChangePercent(from: Numeric, to: Numeric): Decimal {
  return sharePercent(new Decimal(to).minus(from), from);
}

/** The change between two percentages in percentage points: 4% → 5% is 1. */
export function percentagePoints(fromPercent: Numeric, toPercent: Numeric): Decimal {
  return new Decimal(toPercent).minus(fromPercent);
}

/** A percentage as the course shows it: rounded half away from zero to two decimals, no trailing zeros. "25", "32.5", "-1". */
export function percentString(value: Numeric): string {
  return new Decimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed();
}

/** The single multiplier of several changes in a row: 10, −10 → 0.99. Exact, not rounded. */
export function combinedFactor(ratesPercent: Numeric[]): Decimal {
  return ratesPercent.reduce<Decimal>((f, rate) => f.mul(changeFactor(rate)), new Decimal(1));
}

/** The common mistake with changes in a row: adding the percentages (30 and 20 → 50). Shown only to name the mistake. */
export function addedPercents(ratesPercent: Numeric[]): Decimal {
  return ratesPercent.reduce<Decimal>((sum, rate) => sum.plus(rate), new Decimal(0));
}

/** A percent written as a decimal: divide by 100. "10" → 0.1, "2.5" → 0.025. */
export function percentAsDecimal(ratePercent: Numeric): Decimal {
  return new Decimal(ratePercent).div(100);
}

/** A plain product a × b — used only to name a mistake (400 × 3 without dividing by 100). */
export function product(a: Numeric, b: Numeric): Decimal {
  return new Decimal(a).mul(b);
}
