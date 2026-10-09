/**
 * Bonds and yields — the arithmetic behind lessons 0.11 (bond price and yield)
 * and 0.12 (the yield curve).
 *
 * A bond here is a teaching bond: a face amount repaid at the end, a fixed
 * payment once a year, and a whole number of years. Its price is the present
 * value of its payments, each discounted at the yield (one yield for all years,
 * or one yield per year from a curve).
 *
 * Rates and yields are percentages per year, given as strings ("5" means 5%),
 * so a rate never passes through a binary float. Results are exact Decimals;
 * money is rounded to the agora only when shown (money.ts), and a yield shown
 * as a percentage is rounded to two decimal places by percentString().
 *
 * This module has its own present-value helper on purpose: it depends on no
 * other lesson's calc module.
 */
import Decimal from "decimal.js";

export type Numeric = Decimal.Value;

const ONE = new Decimal(1);
const HUNDRED = new Decimal(100);

const fraction = (ratePercent: Numeric) => new Decimal(ratePercent).div(HUNDRED);

/** A yield as shown to the learner: two decimal places, half away from zero: "4.76". */
export function percentString(ratePercent: Numeric): string {
  return new Decimal(ratePercent).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2);
}

/** A rate or factor shown as a plain decimal with a fixed number of places: "0.0476", "1.2613". */
export function decimalString(value: Numeric, places = 4): string {
  return new Decimal(value).toDecimalPlaces(places, Decimal.ROUND_HALF_UP).toFixed(places);
}

/** How many times an amount grows in `years` years at `ratePercent` a year: (1 + r)^years. */
export function growthFactor(ratePercent: Numeric, years: number): Decimal {
  assertYears(years);
  return ONE.plus(fraction(ratePercent)).pow(years);
}

/** What an amount paid after `years` years is worth today, discounted at `ratePercent` a year: amount ÷ (1 + r)^years. */
export function presentValue(amount: Numeric, ratePercent: Numeric, years: number): Decimal {
  assertYears(years);
  return new Decimal(amount).div(ONE.plus(fraction(ratePercent)).pow(years));
}

/** Discounting the simple-interest way, amount ÷ (1 + r × years) — a common mistake, kept to explain it. */
export function simpleDiscount(amount: Numeric, ratePercent: Numeric, years: number): Decimal {
  assertYears(years);
  return new Decimal(amount).div(ONE.plus(fraction(ratePercent).mul(years)));
}

/** The amount minus a percentage of itself: amount × (1 − r). Another mistake, kept to explain it. */
export function percentOff(amount: Numeric, ratePercent: Numeric): Decimal {
  return new Decimal(amount).mul(ONE.minus(fraction(ratePercent)));
}

export interface BondPayment {
  /** 1-based year of the payment. */
  year: number;
  payment: Decimal;
}

/** The payments of a teaching bond: `paymentPercent` of the face each year, and the face with the last payment. */
export function bondPayments(face: Numeric, paymentPercent: Numeric, years: number): BondPayment[] {
  assertYears(years);
  if (years < 1) throw new RangeError("a bond lasts at least one year");
  const f = new Decimal(face);
  const yearly = f.mul(fraction(paymentPercent));
  return Array.from({ length: years }, (_, i) => ({
    year: i + 1,
    payment: i === years - 1 ? yearly.plus(f) : yearly,
  }));
}

/** The sum of all a bond's payments, undiscounted — what a holder receives by keeping it to the end. */
export function totalPayments(face: Numeric, paymentPercent: Numeric, years: number): Decimal {
  return bondPayments(face, paymentPercent, years).reduce((s, p) => s.plus(p.payment), new Decimal(0));
}

export interface PricedPayment extends BondPayment {
  /** The yield this payment is discounted at, percent a year. */
  ratePercent: Decimal;
  presentValue: Decimal;
}

/**
 * Each payment with its present value. `yields` is one yield for every year,
 * or a curve: yields[i] is the yield for a payment after i + 1 years.
 */
export function pricedPayments(face: Numeric, paymentPercent: Numeric, years: number, yields: Numeric | Numeric[]): PricedPayment[] {
  const curve = Array.isArray(yields) ? yields : Array.from({ length: years }, () => yields);
  if (curve.length < years) throw new RangeError(`the curve has ${curve.length} yields, the bond needs ${years}`);
  return bondPayments(face, paymentPercent, years).map((p) => {
    const rate = new Decimal(curve[p.year - 1]);
    return { ...p, ratePercent: rate, presentValue: presentValue(p.payment, rate, p.year) };
  });
}

/** A bond's price: the present value of all its payments at one yield. Exact; round once, at the end. */
export function bondPrice(face: Numeric, paymentPercent: Numeric, years: number, yieldPercent: Numeric): Decimal {
  return sum(pricedPayments(face, paymentPercent, years, yieldPercent).map((p) => p.presentValue));
}

/** A bond's price from a curve: each payment discounted at the yield for its own length. */
export function curvePrice(face: Numeric, paymentPercent: Numeric, curve: Numeric[]): Decimal {
  return sum(pricedPayments(face, paymentPercent, curve.length, curve).map((p) => p.presentValue));
}

/**
 * The yield of a bond with a single payment: the yearly rate at which `price`
 * grows to `payment` in `years` years, (payment ÷ price)^(1/years) − 1, in percent.
 */
export function singlePaymentYield(payment: Numeric, price: Numeric, years: number): Decimal {
  assertYears(years);
  if (years < 1) throw new RangeError("a yield needs at least one year");
  const p = new Decimal(price);
  if (p.lte(0)) throw new RangeError("a price must be above zero");
  return new Decimal(payment).div(p).pow(ONE.div(years)).minus(1).mul(HUNDRED);
}

/** An indexed payment: the amount stated in today's prices, times the index's change. */
export function indexedAmount(amount: Numeric, indexChangePercent: Numeric): Decimal {
  return new Decimal(amount).mul(ONE.plus(fraction(indexChangePercent)));
}

/** A nominal amount in today's prices, after a year in which prices rose by `inflationPercent`. */
export function deflatedAmount(amount: Numeric, inflationPercent: Numeric): Decimal {
  return new Decimal(amount).div(ONE.plus(fraction(inflationPercent)));
}

/**
 * The inflation that makes a nominal yield and a real yield of the same length
 * equal: (1 + nominal) ÷ (1 + real) − 1, in percent. Compounded, not subtracted.
 */
export function inflationGap(nominalPercent: Numeric, realPercent: Numeric): Decimal {
  return ONE.plus(fraction(nominalPercent)).div(ONE.plus(fraction(realPercent))).minus(1).mul(HUNDRED);
}

/**
 * The yearly rate a curve implies between two lengths: the rate that makes
 * "short, then roll over" end where "long" ends.
 * ((1 + long)^longYears ÷ (1 + short)^shortYears)^(1/(longYears − shortYears)) − 1, in percent.
 */
export function impliedRate(shortPercent: Numeric, shortYears: number, longPercent: Numeric, longYears: number): Decimal {
  assertYears(shortYears);
  assertYears(longYears);
  if (longYears <= shortYears) throw new RangeError("the long length must be longer than the short one");
  const long = ONE.plus(fraction(longPercent)).pow(longYears);
  const short = ONE.plus(fraction(shortPercent)).pow(shortYears);
  return long.div(short).pow(ONE.div(longYears - shortYears)).minus(1).mul(HUNDRED);
}

export interface CurvePoint {
  years: number;
  yieldPercent: Numeric;
}

export type CurveShape = "rising" | "falling" | "flat" | "mixed";

/**
 * The curve's shape, read from its points in order of length. Each step is
 * compared within `tolerancePercent` (a rounding allowance, default 0.05 points):
 * every step up → rising, every step down → falling, no step at all → flat.
 */
export function curveShape(points: CurvePoint[], tolerancePercent: Numeric = "0.05"): CurveShape {
  const tol = new Decimal(tolerancePercent);
  let up = false;
  let down = false;
  const sorted = [...points].sort((a, b) => a.years - b.years);
  for (let i = 1; i < sorted.length; i++) {
    const step = new Decimal(sorted[i].yieldPercent).minus(sorted[i - 1].yieldPercent);
    if (step.gt(tol)) up = true;
    else if (step.lt(tol.neg())) down = true;
  }
  if (up && down) return "mixed";
  if (up) return "rising";
  if (down) return "falling";
  return "flat";
}

function sum(values: Decimal[]): Decimal {
  return values.reduce((s, v) => s.plus(v), new Decimal(0));
}

function assertYears(years: number): void {
  if (!Number.isInteger(years) || years < 0) {
    throw new RangeError(`years must be a whole number of at least 0, got ${years}`);
  }
}
