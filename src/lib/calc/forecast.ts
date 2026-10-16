/**
 * The Directive 451 forecast, built from zero curves — the arithmetic behind
 * lesson 5.4 (and the forecast side of 5.5 and later).
 *
 * What the course teaches (as the team transcribed Directive 451, Appendix 4,
 * version 22 of 19/07/2023: Brain 7733250, read 3 August 2026 — a transcription,
 * not re-checked against the directive):
 *  - a forecast of the payments needs, per track type, a forecast of the rate
 *    and/or of the index. The reference table says which curve: the nominal
 *    zero curve (a prime track; a variable unlinked track), the real zero curve
 *    (a variable linked track), expected inflation (a linked track, fixed or
 *    variable); a fixed unlinked track needs neither; foreign-currency and
 *    "other" tracks have no forecast at all.
 *  - a variable track that resets every V months uses today's anchor for the
 *    first V months; its anchor from V to 2V is the forward rate of the curve,
 *    [ (1 + A_2V)^(2V/12) ÷ (1 + A_V)^(V/12) ]^(12/V) − 1, and so on from 2V to 3V.
 *  - expected inflation is the COMPOUNDED gap between the nominal and the real
 *    curve, (1 + nominal) ÷ (1 + real) − 1, never the plain difference (wrong by
 *    a few hundredths of a percentage point a year; Brain 7831553, 3 August 2026).
 *
 * Course assumptions, stated wherever a lesson uses them (none is from the
 * directive's text as far as the transcription says):
 *  1. Curves are illustrative (src/data/curves.ts): 30 zero yields, four
 *     decimals, one per whole year, no interpolation. So a reset interval is a whole number of years.
 *  2. Today's anchor on the offer day is the curve's zero yield at the reset
 *     length. A real bank defines its own anchor and observation date.
 *  3. A track's rate is anchor + spread, the spread being fixed by the contract:
 *     s = today's rate − today's anchor, and every forecast rate = forward anchor + s.
 *  4. Prime: how the directive turns the nominal curve into a prime forecast is
 *     not in the transcription. The course treats prime as a track that resets
 *     every year (V = 12 months, today's anchor = the curve's 1-year yield).
 *  5. Every anchor (today's too) is rounded to two decimals of a percent before
 *     it enters the schedule, and so is each year's expected inflation, so that
 *     every printed table can be checked on its printed numbers.
 *  6. Linked tracks: the index follows the expected-inflation path, year by
 *     year, at an even monthly pace inside each year (the twelfth root); the
 *     first payment already carries one month of it (schedule.ts).
 *  7. Schedules follow the statement convention of schedule.ts (rounding "statement").
 *
 * Rates and yields are percent strings ("3.6" = 3.6% a year); results are exact
 * Decimals (40 digits) and are rounded only where the text above says so.
 * Recomputed independently in checks/kinds/forecast.py (kinds fcast_*).
 *
 * Exports are stable — other lessons may import them. Add, don't rename.
 */
import Decimal from "decimal.js";
import { indexPath } from "./amortization.ts";
import { highestPayment, totalPaid } from "./metrics.ts";
import { scheduleFromPaths, type TrackKind } from "./schedule.ts";

export type Numeric = Decimal.Value;

const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
const ONE = new D(1);
const HUNDRED = new D(100);

/** Zero yields in percent a year, one per whole year: index 0 is 1 year. */
export type Curve = Numeric[];

const fraction = (pct: Numeric) => new D(pct).div(HUNDRED);

/** Rounded to two decimals of a percent, half away from zero (assumption 5). */
export const round2 = (x: Numeric): Decimal => new D(x).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

function assertWhole(name: string, value: number, min: number): void {
  if (!Number.isInteger(value) || value < min) throw new RangeError(`${name} must be a whole number of at least ${min}, got ${value}`);
}

/** The zero yield for a whole number of years, from the curve. */
export function zeroYield(curve: Curve, years: number): Decimal {
  assertWhole("years", years, 1);
  if (years > curve.length) throw new RangeError(`the curve ends at ${curve.length} years, asked for ${years}`);
  return new D(curve[years - 1]);
}

/**
 * The yearly rate a curve implies between two lengths: the rate at which
 * "short, then roll over" ends where "long" ends, in percent, exact. From 0
 * years it is the zero yield itself. Lesson 0.12's formula, in years.
 */
export function forwardFromYields(shortPercent: Numeric, shortYears: number, longPercent: Numeric, longYears: number): Decimal {
  assertWhole("shortYears", shortYears, 0);
  assertWhole("longYears", longYears, 1);
  if (longYears <= shortYears) throw new RangeError("the long length must be longer than the short one");
  const long = ONE.plus(fraction(longPercent)).pow(longYears);
  const short = shortYears === 0 ? ONE : ONE.plus(fraction(shortPercent)).pow(shortYears);
  return long.div(short).pow(ONE.div(longYears - shortYears)).minus(ONE).mul(HUNDRED);
}

/** The forward rate between two lengths of a curve, in percent, exact. */
export function forwardRate(curve: Curve, fromYears: number, toYears: number): Decimal {
  return forwardFromYields(fromYears === 0 ? 0 : zeroYield(curve, fromYears), fromYears, zeroYield(curve, toYears), toYears);
}

/** Expected inflation for one length: (1 + nominal) ÷ (1 + real) − 1, in percent. Compounded. */
export function expectedInflation(nominalPercent: Numeric, realPercent: Numeric): Decimal {
  return ONE.plus(fraction(nominalPercent)).div(ONE.plus(fraction(realPercent))).minus(ONE).mul(HUNDRED);
}

/** The plain difference nominal − real, in percentage points: the shortcut the course warns about. */
export function simpleGap(nominalPercent: Numeric, realPercent: Numeric): Decimal {
  return new D(nominalPercent).minus(realPercent);
}

/**
 * The expected index after `years` years, relative to today (1 = today):
 * (1 + expected inflation)^years, with expected inflation from the two curves at
 * that length — the cumulative expected-CPI index the Bank of Israel's workbook
 * carries (as the team recorded it, Brain 7831553).
 */
export function expectedIndex(nominal: Curve, real: Curve, years: number): Decimal {
  if (years === 0) return ONE;
  const pi = expectedInflation(zeroYield(nominal, years), zeroYield(real, years)).div(HUNDRED);
  return ONE.plus(pi).pow(years);
}

/**
 * The shortcut the course warns about: the index after `years` years if the
 * yearly inflation were taken as the plain difference nominal − real,
 * (1 + (nominal − real))^years. Kept only to show its error against expectedIndex.
 */
export function expectedIndexBySubtraction(nominal: Curve, real: Curve, years: number): Decimal {
  if (years === 0) return ONE;
  const gap = simpleGap(zeroYield(nominal, years), zeroYield(real, years)).div(HUNDRED);
  return ONE.plus(gap).pow(years);
}

/** The yearly inflation expected between two lengths, in percent, exact: (E(to) ÷ E(from))^(1/(to − from)) − 1. */
export function forwardInflation(nominal: Curve, real: Curve, fromYears: number, toYears: number): Decimal {
  if (toYears <= fromYears) throw new RangeError("the later length must be longer than the earlier one");
  return expectedIndex(nominal, real, toYears).div(expectedIndex(nominal, real, fromYears)).pow(ONE.div(toYears - fromYears)).minus(ONE).mul(HUNDRED);
}

/** Expected inflation for each of the first `years` years (year y: from y − 1 to y), in percent, rounded to two decimals (assumption 5). */
export function yearlyInflation(nominal: Curve, real: Curve, years: number): Decimal[] {
  assertWhole("years", years, 1);
  return Array.from({ length: years }, (_, i) => round2(forwardInflation(nominal, real, i, i + 1)));
}

/**
 * A curve moved up (or down) by `points` percentage points everywhere, each
 * yield rounded to two decimals. For the lesson's "move the curve" illustration.
 */
export function shiftCurve(curve: Curve, points: Numeric): Decimal[] {
  return curve.map((y) => round2(new D(y).plus(points)));
}

/**
 * The anchors of a variable track that resets every `resetYears` years: block 0
 * (the first V years) has today's anchor, the curve's yield at V years
 * (assumption 2); block b ≥ 1 has the forward rate from b·V to (b + 1)·V years;
 * every anchor rounded to two decimals (assumption 5).
 */
export function forwardAnchors(curve: Curve, resetYears: number, blocks: number): Decimal[] {
  assertWhole("resetYears", resetYears, 1);
  assertWhole("blocks", blocks, 1);
  return Array.from({ length: blocks }, (_, b) => (b === 0 ? round2(zeroYield(curve, resetYears)) : round2(forwardRate(curve, b * resetYears, (b + 1) * resetYears))));
}

/** Track types of the reference table the course teaches, plus the two the directive leaves without a forecast. */
export type ForecastKind = TrackKind | "fx" | "other";

/** Which forecast inputs a track type needs, as the reference table says (Brain 7733250, transcription). */
export interface Inputs {
  /** "nominal", "real", or null (not relevant). */
  rate: "nominal" | "real" | null;
  /** Expected inflation needed for the index. */
  linkage: boolean;
  /** False for foreign-currency and "other" tracks: no forecast at all. */
  forecastable: boolean;
}

export function forecastInputs(kind: ForecastKind): Inputs {
  switch (kind) {
    case "fixed_unlinked":
      return { rate: null, linkage: false, forecastable: true };
    case "fixed_linked":
      return { rate: null, linkage: true, forecastable: true };
    case "prime":
    case "variable_unlinked":
      return { rate: "nominal", linkage: false, forecastable: true };
    case "variable_linked":
      return { rate: "real", linkage: true, forecastable: true };
    case "fx":
    case "other":
      return { rate: null, linkage: false, forecastable: false };
  }
}

export interface ForecastSpec {
  kind: ForecastKind;
  principal: Numeric;
  /** The track's rate on the offer day, percent a year. */
  rate: Numeric;
  /** The track's own term, in months. */
  months: number;
  /** Variable tracks: years between resets (default 5). Prime ignores it (1). */
  resetYears?: number;
  /** The nominal zero curve; needed by prime, variable unlinked and any linked track. */
  nominal?: Curve;
  /** The real zero curve; needed by any linked track. */
  real?: Curve;
}

/** One stretch of a forecast rate path. */
export interface RateBlock {
  block: number;
  fromMonth: number;
  toMonth: number;
  /** The anchor in this block (variable tracks only; the first block has today's). */
  anchor: Decimal | null;
  /** The track's rate in this block: anchor + spread (the first block: the offer's rate). */
  rate: Decimal;
}

export interface Forecast {
  kind: ForecastKind;
  /** False: the directive has no forecast for this track type; payments is null. */
  hasForecast: boolean;
  resetYears: number | null;
  /** s = today's rate − today's anchor; null for a track with no anchor. */
  spread: Decimal | null;
  blocks: RateBlock[];
  /** Expected inflation for each year of the term (linked tracks), percent, two decimals. */
  inflation: Decimal[] | null;
  /** The forecast payment of every month; null without a forecast. */
  payments: Decimal[] | null;
}

/** The forecast of one track: the rate path, the index path, and every payment. */
export function forecastTrack(spec: ForecastSpec): Forecast {
  assertWhole("months", spec.months, 1);
  const need = forecastInputs(spec.kind);
  if (!need.forecastable) {
    return { kind: spec.kind, hasForecast: false, resetYears: null, spread: null, blocks: [], inflation: null, payments: null };
  }
  const anchorCurve = need.rate === "nominal" ? spec.nominal : need.rate === "real" ? spec.real : undefined;
  if (need.rate && !anchorCurve) throw new RangeError(`a ${spec.kind} track needs the ${need.rate} curve`);
  if (need.linkage && !(spec.nominal && spec.real)) throw new RangeError(`a ${spec.kind} track needs both curves, for expected inflation`);

  const rate0 = new D(spec.rate);
  const resetYears = spec.kind === "prime" ? 1 : need.rate ? (spec.resetYears ?? 5) : null;
  const blockMonths = resetYears === null ? spec.months : resetYears * 12;
  const count = Math.ceil(spec.months / blockMonths);

  let anchors: Decimal[] | null = null;
  let spread: Decimal | null = null;
  const rates: Decimal[] = [rate0];
  if (anchorCurve && resetYears !== null) {
    anchors = forwardAnchors(anchorCurve, resetYears, count);
    spread = rate0.minus(anchors[0]);
    for (let b = 1; b < count; b++) rates.push(anchors[b].plus(spread));
    const low = rates.findIndex((r) => r.isNeg());
    if (low >= 0) throw new RangeError(`the forecast rate would fall below zero in block ${low + 1}`);
  }
  const blocks: RateBlock[] = rates.map((rate, b) => ({
    block: b + 1,
    fromMonth: b * blockMonths + 1,
    toMonth: Math.min((b + 1) * blockMonths, spec.months),
    anchor: anchors ? anchors[b] : null,
    rate,
  }));

  const inflation = need.linkage ? yearlyInflation(spec.nominal as Curve, spec.real as Curve, Math.ceil(spec.months / 12)) : null;
  const ratePath = Array.from({ length: spec.months }, (_, t) => rates[Math.min(Math.floor(t / blockMonths), rates.length - 1)]);
  const factors = inflation ? indexPath(inflation, 12, spec.months) : undefined;
  const payments = scheduleFromPaths(spec.principal, ratePath, factors, "spitzer", "statement").map((r) => r.payment);
  return { kind: spec.kind, hasForecast: true, resetYears, spread, blocks, inflation, payments };
}

/** The three numbers a pre-approval would show for a forecast track: the first payment, the highest, and the sum of all. */
export interface ForecastSummary {
  first: Decimal;
  highest: Decimal;
  highestMonth: number;
  total: Decimal;
}

export function summarize(forecast: Forecast): ForecastSummary | null {
  if (!forecast.payments) return null;
  const top = highestPayment(forecast.payments);
  return { first: new D(forecast.payments[0]), highest: top.payment, highestMonth: top.month, total: totalPaid(forecast.payments) };
}
