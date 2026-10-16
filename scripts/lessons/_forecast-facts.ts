/**
 * Fact builders for the forecast lessons (5.4, 5.5), one function per kind of
 * checks/kinds/forecast.py (kinds fcast_*). Not a lesson: the file name keeps
 * scripts/build-data.ts from picking it up.
 *
 * Curves go into a fact's inputs as the 30-yield string of src/data/curves.ts,
 * so the independent check reads exactly the numbers the TypeScript used.
 * Illustrative curves only: no Bank of Israel number is in any of these facts.
 */
import Decimal from "decimal.js";
import { type CurveSet, curveString } from "../../src/data/curves.ts";
import {
  expectedIndex,
  expectedIndexBySubtraction,
  expectedInflation,
  forecastTrack,
  type ForecastKind,
  forwardAnchors,
  forwardFromYields,
  forwardInflation,
  forwardRate,
  simpleGap,
  summarize,
  yearlyInflation,
  zeroYield,
} from "../../src/lib/calc/forecast.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { roundedString } from "../../src/lib/calc/rates.ts";
import type { Fact } from "../build-data.ts";

export type Curves = Pick<CurveSet, "nominal" | "real">;

export const num = (id: string, value: string): Fact => ({ id, kind: "given", inputs: {}, value });

export const curvePoint = (id: string, curve: string[], years: number): Fact => ({
  id,
  kind: "fcast_curve_point",
  inputs: { curve: curveString(curve), years },
  value: roundedString(zeroYield(curve, years), 4),
});

export const forward = (id: string, curve: string[], from: number, to: number, decimals: number): Fact => ({
  id,
  kind: "fcast_forward",
  inputs: { curve: curveString(curve), from_years: from, to_years: to, decimals },
  value: roundedString(forwardRate(curve, from, to), decimals),
});

export const forwardYieldsFact = (id: string, shortPct: string, shortYears: number, longPct: string, longYears: number, decimals: number): Fact => ({
  id,
  kind: "fcast_forward_yields",
  inputs: { short_percent: shortPct, short_years: shortYears, long_percent: longPct, long_years: longYears, decimals },
  value: roundedString(forwardFromYields(shortPct, shortYears, longPct, longYears), decimals),
});

export const growth = (id: string, percent: string, years: number, decimals: number): Fact => ({
  id,
  kind: "fcast_growth",
  inputs: { percent, years, decimals },
  value: roundedString(new Decimal(1).plus(new Decimal(percent).div(100)).pow(years), decimals),
});

/** 1 + percent ÷ 100, the growth factor of one year, shown to `decimals` places. */
export const factor = (id: string, percent: string, decimals: number): Fact => ({
  id,
  kind: "fcast_factor",
  inputs: { percent, decimals },
  value: roundedString(new Decimal(1).plus(new Decimal(percent).div(100)), decimals),
});

export const growthRatio = (id: string, shortPct: string, shortYears: number, longPct: string, longYears: number, decimals: number): Fact => ({
  id,
  kind: "fcast_growth_ratio",
  inputs: { short_percent: shortPct, short_years: shortYears, long_percent: longPct, long_years: longYears, decimals },
  value: roundedString(new Decimal(1).plus(new Decimal(longPct).div(100)).pow(longYears).div(new Decimal(1).plus(new Decimal(shortPct).div(100)).pow(shortYears)), decimals),
});

export const inflationFact = (id: string, nominal: string, real: string, decimals: number): Fact => ({
  id,
  kind: "fcast_inflation",
  inputs: { nominal_percent: nominal, real_percent: real, decimals },
  value: roundedString(expectedInflation(nominal, real), decimals),
});

export const gapPoints = (id: string, nominal: string, real: string, decimals: number): Fact => ({
  id,
  kind: "fcast_gap_points",
  inputs: { nominal_percent: nominal, real_percent: real, decimals },
  value: roundedString(simpleGap(nominal, real), decimals),
});

export const gapError = (id: string, nominal: string, real: string, decimals: number): Fact => ({
  id,
  kind: "fcast_gap_error",
  inputs: { nominal_percent: nominal, real_percent: real, decimals },
  value: roundedString(simpleGap(nominal, real).minus(expectedInflation(nominal, real)), decimals),
});

export const inflationAt = (id: string, c: Curves, years: number, decimals: number): Fact => ({
  id,
  kind: "fcast_inflation_at",
  inputs: { nominal: curveString(c.nominal), real: curveString(c.real), years, decimals },
  value: roundedString(expectedInflation(zeroYield(c.nominal, years), zeroYield(c.real, years)), decimals),
});

export const indexFact = (id: string, c: Curves, years: number, decimals: number): Fact => ({
  id,
  kind: "fcast_index",
  inputs: { nominal: curveString(c.nominal), real: curveString(c.real), years, decimals },
  value: roundedString(expectedIndex(c.nominal, c.real, years), decimals),
});

export const indexSimple = (id: string, c: Curves, years: number, decimals: number): Fact => ({
  id,
  kind: "fcast_index_simple",
  inputs: { nominal: curveString(c.nominal), real: curveString(c.real), years, decimals },
  value: roundedString(expectedIndexBySubtraction(c.nominal, c.real, years), decimals),
});

export const indexGapPercent = (id: string, c: Curves, years: number, decimals: number): Fact => ({
  id,
  kind: "fcast_index_gap_percent",
  inputs: { nominal: curveString(c.nominal), real: curveString(c.real), years, decimals },
  value: roundedString(expectedIndexBySubtraction(c.nominal, c.real, years).div(expectedIndex(c.nominal, c.real, years)).minus(1).mul(100), decimals),
});

export const inflationForward = (id: string, c: Curves, from: number, to: number, decimals: number): Fact => ({
  id,
  kind: "fcast_inflation_forward",
  inputs: { nominal: curveString(c.nominal), real: curveString(c.real), from_years: from, to_years: to, decimals },
  value: roundedString(forwardInflation(c.nominal, c.real, from, to), decimals),
});

export const yearlyInflationFact = (id: string, c: Curves, years: number): Fact => ({
  id,
  kind: "fcast_yearly_inflation",
  inputs: { nominal: curveString(c.nominal), real: curveString(c.real), years },
  value: yearlyInflation(c.nominal, c.real, years).map((x) => roundedString(x, 2)),
});

export const anchorsFact = (id: string, curve: string[], resetYears: number, blocks: number): Fact => ({
  id,
  kind: "fcast_anchors",
  inputs: { curve: curveString(curve), reset_years: resetYears, blocks },
  value: forwardAnchors(curve, resetYears, blocks).map((x) => roundedString(x, 2)),
});

/** a ± b of two percent facts (percentage points), rounded for display. */
export const points = (id: string, op: "minus" | "plus", a: Fact, b: Fact, decimals: number): Fact => ({
  id,
  kind: "fcast_points",
  inputs: { op, a: a.id, b: b.id, decimals },
  value: roundedString(op === "minus" ? new Decimal(a.value as string).minus(b.value as string) : new Decimal(a.value as string).plus(b.value as string), decimals),
});

/** part ÷ whole × 100 of two money facts. */
export const moneyShare = (id: string, part: Fact, whole: Fact, decimals: number): Fact => ({
  id,
  kind: "fcast_money_share",
  inputs: { part: part.id, whole: whole.id, decimals },
  value: roundedString(new Decimal(part.value as string).div(whole.value as string).mul(100), decimals),
});

// ── A forecast track ──

export interface TrackSpec {
  kind: ForecastKind;
  principal: string;
  rate: string;
  months: number;
  resetYears?: number;
  curves: Curves;
}

const specInputs = (s: TrackSpec) => ({
  kind: s.kind,
  principal: s.principal,
  rate_percent: s.rate,
  months: s.months,
  reset_years: s.resetYears ?? 0,
  nominal: curveString(s.curves.nominal),
  real: curveString(s.curves.real),
});

const forecastOf = (s: TrackSpec) => forecastTrack({ kind: s.kind, principal: s.principal, rate: s.rate, months: s.months, resetYears: s.resetYears || undefined, nominal: s.curves.nominal, real: s.curves.real });

export const spread = (id: string, s: TrackSpec): Fact => ({ id, kind: "fcast_spread", inputs: specInputs(s), value: roundedString(forecastOf(s).spread as Decimal, 2) });

export const rateBlocks = (id: string, s: TrackSpec): Fact => ({
  id,
  kind: "fcast_rate_blocks",
  inputs: specInputs(s),
  value: forecastOf(s).blocks.map((b) => ({
    block: b.block,
    from_month: b.fromMonth,
    to_month: b.toMonth,
    anchor: b.anchor === null ? null : roundedString(b.anchor, 2),
    rate: roundedString(b.rate, 2),
  })),
});

export const paymentAt = (id: string, s: TrackSpec, month: number): Fact => ({
  id,
  kind: "fcast_payment",
  inputs: { ...specInputs(s), month },
  value: moneyString((forecastOf(s).payments as Decimal[])[month - 1]),
});

export const first = (id: string, s: TrackSpec): Fact => ({ id, kind: "fcast_first", inputs: specInputs(s), value: moneyString(summarize(forecastOf(s))!.first) });
export const highest = (id: string, s: TrackSpec): Fact => ({ id, kind: "fcast_highest", inputs: specInputs(s), value: moneyString(summarize(forecastOf(s))!.highest) });
export const highestMonth = (id: string, s: TrackSpec): Fact => ({ id, kind: "fcast_highest_month", inputs: specInputs(s), value: summarize(forecastOf(s))!.highestMonth });
export const total = (id: string, s: TrackSpec): Fact => ({ id, kind: "fcast_total", inputs: specInputs(s), value: moneyString(summarize(forecastOf(s))!.total) });

export const pathRows = (id: string, s: TrackSpec, months: number[]): Fact => ({
  id,
  kind: "fcast_path_rows",
  inputs: { ...specInputs(s), months_list: months.join(",") },
  value: months.map((m) => ({ month: m, payment: moneyString((forecastOf(s).payments as Decimal[])[m - 1]) })),
});

export const hasForecast = (id: string, s: TrackSpec): Fact => ({ id, kind: "fcast_has_forecast", inputs: specInputs(s), value: forecastOf(s).hasForecast });

// ── Lesson 5.5: averages ──

export const average = (id: string, rates: string[], decimals: number): Fact => ({
  id,
  kind: "fcast_average",
  inputs: { rates: rates.join(","), decimals },
  value: roundedString(rates.reduce((s, r) => s.plus(r), new Decimal(0)).div(rates.length), decimals),
});

export const weightedAverage = (id: string, rates: string[], amounts: string[], decimals: number): Fact => ({
  id,
  kind: "fcast_weighted_average",
  inputs: { rates: rates.join(","), amounts: amounts.join(","), decimals },
  value: roundedString(rates.reduce((s, r, i) => s.plus(new Decimal(r).mul(amounts[i])), new Decimal(0)).div(amounts.reduce((s, a) => s.plus(a), new Decimal(0))), decimals),
});

export const countBelow = (id: string, rates: string[], than: Fact): Fact => ({
  id,
  kind: "fcast_count_below",
  inputs: { rates: rates.join(","), than: than.id },
  value: rates.filter((r) => new Decimal(r).lt(than.value as string)).length,
});

export const count = (id: string, rates: string[]): Fact => ({ id, kind: "fcast_count", inputs: { rates: rates.join(",") }, value: rates.length });
