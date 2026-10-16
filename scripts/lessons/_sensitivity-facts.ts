/**
 * Fact builders shared by lessons 5.6, 5.7 and 5.8 (author C). Each builder computes its value with
 * src/lib/calc/sensitivity.ts (on schedule.ts, affordability.ts and regulation.ts) and names a kind
 * that checks/kinds/sensitivity.py recomputes on its own. Not a lesson module: build-data.ts loads
 * only lesson-*.ts and check-*.ts.
 *
 * A mix fact carries the mix's flat inputs (schedule.ts's mixInputs, the same ones schedule.py reads)
 * plus `measure`; a lever fact adds the lever. Money values are money strings, percents are
 * percentString (two decimals, no trailing zeros), months are whole numbers.
 */
import Decimal from "decimal.js";
import { paymentToIncome } from "../../src/lib/calc/affordability.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { percentString } from "../../src/lib/calc/percent.ts";
import { maxVariable, variableSharePercent } from "../../src/lib/calc/regulation.ts";
import { mixInputs, type TrackSpec } from "../../src/lib/calc/schedule.ts";
import {
  applyLever,
  balanceAt,
  type Candidate,
  goalScore,
  type GoalContext,
  type GoalSpec,
  type Lever,
  leftAt,
  loanOf,
  measuresOf,
  paymentAt,
  qualifyingTotal,
  rankCandidates,
  type ScenarioSpec,
  scenarioFrom,
  stressRise,
  variableAmount,
} from "../../src/lib/calc/sensitivity.ts";
import { CASE_A, caseAPasses } from "../../src/data/case-a-mix.ts";
import type { Fact } from "../build-data.ts";

export interface Mix {
  tracks: TrackSpec[];
  scenario: ScenarioSpec;
}

export const given = (id: string, value: string | number): Fact => ({ id, kind: "given", inputs: {}, value });
/** A teaching input in shekels, as "546000.00". */
export const givenMoney = (id: string, amount: string): Fact => ({ id, kind: "given", inputs: {}, value: moneyString(amount) });

export const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

/** The case's income and car loan, as the ratio facts carry them. */
const caseInputs = {
  income: CASE_A.recognisedIncome,
  obligation_monthly: CASE_A.car.monthly,
  obligation_months: CASE_A.car.monthsLeft as number,
};

export type Measure =
  | "first"
  | "max"
  | "max_month"
  | "total"
  | "months"
  | "payment"
  | "balance"
  | "left"
  | "loan"
  | "qualifying"
  | "variable"
  | "ratio"
  | "variable_share"
  | "variable_room";

export interface Extra {
  /** For payment, balance and left. */
  month?: number;
}

const leftInputs = { net: CASE_A.recognisedIncome, other_monthly: CASE_A.car.monthly, other_months: CASE_A.car.monthsLeft as number };

function valueOf(mix: Mix, measure: Measure, extra: Extra): string | number {
  const sc = scenarioFrom(mix.scenario);
  const t = mix.tracks;
  switch (measure) {
    case "first":
      return moneyString(measuresOf(t, sc).first);
    case "max":
      return moneyString(measuresOf(t, sc).max);
    case "max_month":
      return measuresOf(t, sc).maxMonth;
    case "total":
      return moneyString(measuresOf(t, sc).total);
    case "months":
      return measuresOf(t, sc).months;
    case "payment":
      return moneyString(paymentAt(t, sc, extra.month as number));
    case "balance":
      return moneyString(balanceAt(t, sc, extra.month as number));
    case "left":
      return moneyString(leftAt(t, sc, extra.month as number, leftInputs.net, [{ monthly: leftInputs.other_monthly, monthsLeft: leftInputs.other_months }]));
    case "loan":
      return moneyString(loanOf(t));
    case "qualifying":
      return moneyString(qualifyingTotal(t));
    case "variable":
      return moneyString(variableAmount(t));
    case "ratio": {
      // The ratio of lesson 4.3: the qualifying payment over the income minus the car loan (more than 18 months left, so it counts).
      const disposable = new Decimal(caseInputs.income).minus(caseInputs.obligation_monthly);
      return percentString(paymentToIncome(qualifyingTotal(t), disposable));
    }
    case "variable_share":
      return percentString(variableSharePercent(variableAmount(t), loanOf(t)));
    case "variable_room":
      return moneyString(maxVariable(loanOf(t)).minus(variableAmount(t)));
  }
}

const withCase = (measure: Measure): Record<string, string | number> => (measure === "ratio" ? caseInputs : measure === "left" ? leftInputs : {});

/** One number about a mix under its scenario (kind sens_mix). */
export const mixFact = (id: string, mix: Mix, measure: Measure, extra: Extra = {}): Fact => ({
  id,
  kind: "sens_mix",
  inputs: { ...mixInputs(mix.tracks, scenarioFrom(mix.scenario)), measure, ...(extra.month !== undefined ? { month: extra.month } : {}), ...withCase(measure) },
  value: valueOf(mix, measure, extra),
});

/** The lever's own fields, flat. */
function leverInputs(l: Lever): Record<string, string | number> {
  switch (l.lever) {
    case "percent":
      return { lever: "percent", lever_from: l.from, lever_to: l.to, lever_points: String(l.points) };
    case "amount":
      return { lever: "amount", lever_change: String(l.change) };
    case "term":
      return { lever: "term", lever_track: l.track, lever_months: l.months };
    case "rate":
      return { lever: "rate", lever_track: l.track, lever_points: String(l.points) };
    case "index":
      return { lever: "index", lever_points: String(l.points) };
    case "market":
      return { lever: "market", lever_points: String(l.points) };
  }
}

/** The same number after ONE lever has moved; the inputs are the BEFORE mix and the lever (kind sens_mix). */
export const leverFact = (id: string, mix: Mix, lever: Lever, measure: Measure, extra: Extra = {}): Fact => ({
  id,
  kind: "sens_mix",
  inputs: { ...mixInputs(mix.tracks, scenarioFrom(mix.scenario)), ...leverInputs(lever), measure, ...(extra.month !== undefined ? { month: extra.month } : {}), ...withCase(measure) },
  value: valueOf(applyLever(mix, lever), measure, extra),
});

/** A money fact divided by a step (kind sens_divide): the change in a result per unit of the lever. */
export const perStep = (id: string, of: Fact, step: string): Fact => ({
  id,
  kind: "sens_divide",
  inputs: { value: of.id, by: step },
  value: moneyString(new Decimal(of.value as string).div(step)),
});

/** A sum of money facts (kind met_sum, checked in metrics.py). */
export const sumOf = (id: string, parts: Fact[]): Fact => ({
  id,
  kind: "met_sum",
  inputs: { facts: parts.map((p) => p.id).join("|") },
  value: moneyString(parts.reduce((s, p) => s.plus(p.value as string), new Decimal(0))),
});

/** The tracks as sens_table and sens_rank read them: "kind|amount|rate|months;…". */
const encodeTracks = (tracks: TrackSpec[]) => tracks.map((t) => [t.kind, t.amount, t.rate, t.months].join("|")).join(";");

function candidateInputs(cands: Candidate[], base: ScenarioSpec, stress: ScenarioSpec): Record<string, string | number> {
  const out: Record<string, string | number> = {
    candidates: cands.length,
    base_inflation: String(base.inflation),
    base_prime_shift: String(base.primeShift),
    base_anchor_shift: String(base.anchorShift),
    stress_inflation: String(stress.inflation),
    stress_prime_shift: String(stress.primeShift),
    stress_anchor_shift: String(stress.anchorShift),
    price: CASE_A.price,
    ...caseInputs,
  };
  cands.forEach((c, k) => {
    out[`c${k + 1}_id`] = c.id;
    out[`c${k + 1}_tracks`] = encodeTracks(c.tracks);
  });
  return out;
}

/** One row per candidate: the measures of lesson 5.6's table (kind sens_table). */
export const tableFact = (id: string, cands: Candidate[], base: ScenarioSpec, stress: ScenarioSpec): Fact => ({
  id,
  kind: "sens_table",
  inputs: candidateInputs(cands, base, stress),
  value: cands.map((c) => {
    const b = measuresOf(c.tracks, scenarioFrom(base));
    const s = measuresOf(c.tracks, scenarioFrom(stress));
    const mix = { tracks: c.tracks, scenario: base };
    return {
      id: c.id,
      first: moneyString(b.first),
      max: moneyString(b.max),
      max_month: b.maxMonth,
      total: moneyString(b.total),
      stress_max: moneyString(s.max),
      rise: moneyString(s.max.minus(b.first)),
      ratio: valueOf(mix, "ratio", {}) as string,
      variable_share: valueOf(mix, "variable_share", {}) as string,
      passes: caseAPasses(c.tracks) ? "yes" : "no",
    };
  }),
});

/** The candidates ranked for one goal among those in `allowedIds` (kind sens_rank). */
export const rankFact = (id: string, goal: GoalSpec, cands: Candidate[], ctx: { base: ScenarioSpec; stress: ScenarioSpec }, allowedIds: string[]): Fact => {
  const gctx: GoalContext = { base: scenarioFrom(ctx.base), stress: scenarioFrom(ctx.stress) };
  const rows = rankCandidates(cands, goal, gctx, (c) => allowedIds.includes(c.id));
  return {
    id,
    kind: "sens_rank",
    inputs: {
      ...candidateInputs(cands, ctx.base, ctx.stress),
      goal: goal.goal,
      ...(goal.goal === "payment" ? { month: goal.month ?? 1 } : {}),
      allowed: allowedIds.join("|"),
    },
    value: rows.map((r) => ({ id: r.id, score: moneyString(r.score), allowed: r.allowed ? "yes" : "no", rank: r.rank })),
  };
};

export { goalScore, stressRise };
