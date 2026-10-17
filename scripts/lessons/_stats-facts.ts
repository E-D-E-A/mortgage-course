/** Fact builders for stats.ts (stage 8, lessons 8.1–8.5; later authors may import). Lists travel as comma-separated text; the Python check (checks/kinds/stats.py) reads them. */
import Decimal from "decimal.js";
import { moneyString } from "../../src/lib/calc/money.ts";
import * as S from "../../src/lib/calc/stats.ts";
import type { Fact } from "../build-data.ts";

type N = string | number;
const csv = (xs: readonly N[]) => xs.map(String).join(",");
const pts = (ps: readonly { x: N; y: N }[]) => ps.map((p) => `${p.x}:${p.y}`).join(";");
const outs = (os: readonly { value: N; count: number }[]) => os.map((o) => `${o.value}:${o.count}`).join(";");
const f = (id: string, kind: string, inputs: Fact["inputs"], value: unknown): Fact => ({ id, kind, inputs, value });

export const total = (id: string, values: N[], d = 2) => f(id, "stats_sum", { values: csv(values), decimals: d }, S.formatPlain(S.sum(values), d));
export const mean = (id: string, values: N[], d = 2) => f(id, "stats_mean", { values: csv(values), decimals: d }, S.formatPlain(S.mean(values), d));
export const wmean = (id: string, values: N[], weights: N[], d = 2) => f(id, "stats_wmean", { values: csv(values), weights: csv(weights), decimals: d }, S.formatPlain(S.weightedMean(values, weights), d));
export const variance = (id: string, values: N[], d = 2, sample = false) => f(id, "stats_variance", { values: csv(values), decimals: d, sample: sample ? 1 : 0 }, S.formatPlain(sample ? S.sampleVariance(values) : S.variance(values), d));
export const std = (id: string, values: N[], d = 2, sample = false) => f(id, "stats_std", { values: csv(values), decimals: d, sample: sample ? 1 : 0 }, S.formatPlain(sample ? S.sampleStd(values) : S.std(values), d));
export const percentile = (id: string, values: N[], p: N, d = 2, method: "linear" | "nearest" = "linear") =>
  f(id, "stats_percentile", { values: csv(values), p, method, decimals: d }, S.formatPlain(method === "linear" ? S.percentile(values, p) : S.percentileNearestRank(values, p), d));
export const position = (id: string, n: number, p: N) => f(id, "stats_position", { n, p }, S.formatPlain(S.percentilePosition(n, p), 6));
export const hist = (id: string, values: N[], start: N, width: N, count: number) =>
  f(id, "stats_hist", { values: csv(values), start, width, count }, S.histogram(values, { start, width, count }).bins.map((b) => b.count).join(","));
export const outside = (id: string, values: N[], start: N, width: N, count: number) => {
  const h = S.histogram(values, { start, width, count });
  return f(id, "stats_outside", { values: csv(values), start, width, count }, h.below + h.above);
};
export const countIn = (id: string, values: N[], from: N, to: N) =>
  f(id, "stats_count_in", { values: csv(values), from, to }, values.filter((v) => new Decimal(v).gte(from) && new Decimal(v).lte(to)).length);
export const expect = (id: string, os: { value: N; count: number }[], d = 2) => f(id, "stats_expect", { outcomes: outs(os), decimals: d }, S.formatPlain(S.expectation(os), d));
export const distVar = (id: string, os: { value: N; count: number }[], d = 2) => f(id, "stats_dist_var", { outcomes: outs(os), decimals: d }, S.formatPlain(S.distributionVariance(os), d));
export const distStd = (id: string, os: { value: N; count: number }[], d = 2) => f(id, "stats_dist_std", { outcomes: outs(os), decimals: d }, S.formatPlain(S.distributionStd(os), d));
/** The probability, in percent, that the value is from…to, both ends included. */
export const prob = (id: string, os: { value: N; count: number }[], from: N, to: N, d = 1) =>
  f(id, "stats_prob", { outcomes: outs(os), from, to, decimals: d }, S.formatPlain(S.probabilityBetween(os, from, to).mul(100), d));
export const fit = (id: string, points: { x: N; y: N }[], part: "a" | "b", d = 4) => f(id, "stats_fit", { points: pts(points), part, decimals: d }, S.formatPlain(S.linearFit(points)[part], d));
export const err = (id: string, points: { x: N; y: N }[], line: { a: N; b: N }, measure: "mae" | "rmse" | "sse", d = 3) => {
  const e = S.errors(points, line);
  return f(id, "stats_err", { points: pts(points), a: line.a, b: line.b, measure, decimals: d }, S.formatPlain(e[measure], d));
};
export const fitErr = (id: string, points: { x: N; y: N }[], measure: "mae" | "rmse" | "sse", d = 3) => {
  const e = S.errors(points, S.linearFit(points));
  return f(id, "stats_fit_err", { points: pts(points), measure, decimals: d }, S.formatPlain(e[measure], d));
};
export const resid = (id: string, points: { x: N; y: N }[], line: { a: N; b: N }, d = 3) =>
  f(id, "stats_resid", { points: pts(points), a: line.a, b: line.b, decimals: d }, S.residuals(points, line).map((r) => S.formatPlain(r, d)).join(","));
export const lin = (id: string, a: N, b: N, x: N, d = 2) => f(id, "stats_lin", { a, b, x, decimals: d }, S.formatPlain(S.predict({ a, b }, x), d));
export const quot = (id: string, num: N, den: N, d = 2) => f(id, "stats_quot", { num, den, decimals: d }, S.formatPlain(new Decimal(num).div(den), d));
export const prod = (id: string, a: N, b: N, d = 2) => f(id, "stats_prod", { a, b, decimals: d }, S.formatPlain(new Decimal(a).mul(b), d));
/** A Spitzer payment to the agora: amount, nominal annual rate (percent), months. */
export const spitzer = (id: string, amount: N, rate: N, months: number): Fact => {
  const m = new Decimal(rate).div(1200);
  const pay = m.isZero() ? new Decimal(amount).div(months) : new Decimal(amount).mul(m).div(new Decimal(1).minus(new Decimal(1).plus(m).pow(-months)));
  return f(id, "stats_payment", { amount, rate, months }, moneyString(pay));
};
export const factExpect = (id: string, parts: Fact[], counts: number[]) =>
  f(id, "stats_fact_expect", { facts: parts.map((p) => p.id).join("|"), counts: counts.join(",") }, moneyString(S.expectation(parts.map((p, k) => ({ value: p.value as string, count: counts[k] })))));
export const factProbAbove = (id: string, parts: Fact[], counts: number[], limit: Fact, d = 1) => {
  const hit = parts.reduce((s, p, k) => s + (new Decimal(p.value as string).gt(limit.value as string) ? counts[k] : 0), 0);
  return f(id, "stats_fact_prob_above", { facts: parts.map((p) => p.id).join("|"), counts: counts.join(","), limit: limit.id, decimals: d }, S.formatPlain(new Decimal(hit).mul(100).div(counts.reduce((a, b) => a + b, 0)), d));
};
export const shapes = (id: string, kinds: number, step: number, terms: number, value: number) => f(id, "stats_shapes", { kinds, step, terms }, value);
export const countProduct = (id: string, factors: number[]) => f(id, "stats_count_product", { factors: factors.join(",") }, factors.reduce((a, b) => a * b, 1));
export const percentOf = (id: string, part: N, whole: N, d = 1) => f(id, "stats_percent", { part, whole, decimals: d }, S.formatPlain(new Decimal(part).mul(100).div(whole), d));
export const factPercent = (id: string, part: Fact, whole: Fact, d = 1) =>
  f(id, "stats_fact_percent", { part: part.id, whole: whole.id, decimals: d }, S.formatPlain(new Decimal(part.value as string).mul(100).div(whole.value as string), d));
