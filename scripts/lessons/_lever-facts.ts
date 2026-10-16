/**
 * Fact builders shared by lessons 6.4 and 6.5 (author B). Each builder computes its value with
 * src/lib/calc/levers.ts (on sensitivity.ts, schedule.ts, affordability.ts and regulation.ts) and
 * names a kind that checks/kinds/levers.py recomputes on its own. Not a lesson module:
 * build-data.ts loads only lesson-*.ts and check-*.ts.
 *
 * A lever fact carries the whole case as flat inputs (the tracks as sens_table writes them, the two
 * scenarios, the money of the deal, the incomes, one obligation) plus the lever, if any, and the
 * `measure` it reads. Money values are money strings, percents are percentString (two decimals, no
 * trailing zeros), months are whole numbers, a list of bans is "ltv|variable" or "none".
 */
import Decimal from "decimal.js";
import { moneyString } from "../../src/lib/calc/money.ts";
import { percentString } from "../../src/lib/calc/percent.ts";
import { applyMove, type LeverMove, perPoint, type Position, type PositionCase, positionOf, smallestEquityStep } from "../../src/lib/calc/levers.ts";
import type { TrackSpec } from "../../src/lib/calc/schedule.ts";
import type { Fact } from "../build-data.ts";

export const given = (id: string, value: string | number): Fact => ({ id, kind: "given", inputs: {}, value });
/** A teaching input in shekels, as "546000.00". */
export const givenMoney = (id: string, amount: string): Fact => ({ id, kind: "given", inputs: {}, value: moneyString(amount) });

export const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

export type LevMeasure =
  | "loan"
  | "ltv"
  | "qualifying"
  | "disposable"
  | "ratio"
  | "first"
  | "total"
  | "stress_max"
  | "stress_month"
  | "left_first"
  | "left_stress"
  | "margin_first"
  | "margin_stress"
  | "reserve"
  | "equity"
  | "variable"
  | "months"
  | "bans"
  | "above_capital";

const encodeTracks = (tracks: TrackSpec[]) => tracks.map((t) => [t.kind, t.amount, t.rate, t.months].join("|")).join(";");

/** The case's flat inputs, as checks/kinds/levers.py reads them. At most one obligation. */
export function caseInputs(c: PositionCase): Record<string, string | number> {
  if (c.obligations.length > 1) throw new RangeError("a lever fact carries at most one obligation");
  const o = c.obligations[0];
  const out: Record<string, string | number> = {
    price: String(c.price),
    equity: String(c.equity),
    reserve: String(c.reserve),
    deal: c.deal,
    incomes: c.incomes.map(String).join("|"),
    obligation_monthly: o ? String(o.monthly) : "0",
    obligation_months: o ? (o.monthsLeft ?? 99999) : 0,
    candidates: 1,
    c1_id: "case",
    c1_tracks: encodeTracks(c.tracks),
    base_inflation: String(c.base.inflation),
    base_prime_shift: String(c.base.primeShift),
    base_anchor_shift: String(c.base.anchorShift),
    stress_inflation: String(c.stress.inflation),
    stress_prime_shift: String(c.stress.primeShift),
    stress_anchor_shift: String(c.stress.anchorShift),
  };
  if (c.livingBudget !== undefined) out.living_budget = String(c.livingBudget);
  return out;
}

function leverInputs(m: LeverMove): Record<string, string | number> {
  switch (m.lever) {
    case "equity":
      return { lever: "equity", lever_add: String(m.add) };
    case "close_loan":
      return { lever: "close_loan", lever_payoff: String(m.payoff), lever_source: m.from };
    case "wait":
      return { lever: "wait", lever_months: m.months };
    case "borrower":
      return { lever: "borrower", lever_income: String(m.income) };
    case "term":
      return { lever: "term", lever_months: m.months };
    case "mix":
      return { lever: "mix", lever_from_track: m.from, lever_to_track: m.to, lever_points: String(m.points) };
  }
}

function valueOf(p: Position, measure: LevMeasure): string | number {
  const budgetOnly = (v: Decimal | null) => {
    if (v === null) throw new RangeError("the case has no living budget");
    return moneyString(v);
  };
  switch (measure) {
    case "loan":
      return moneyString(p.loan);
    case "ltv":
      return percentString(p.ltv);
    case "qualifying":
      return moneyString(p.qualifying);
    case "disposable":
      return moneyString(p.disposable);
    case "ratio":
      return percentString(p.ratio);
    case "first":
      return moneyString(p.first);
    case "total":
      return moneyString(p.total);
    case "stress_max":
      return moneyString(p.stressMax);
    case "stress_month":
      return p.stressMonth;
    case "left_first":
      return moneyString(p.leftFirst);
    case "left_stress":
      return moneyString(p.leftStress);
    case "margin_first":
      return budgetOnly(p.marginFirst);
    case "margin_stress":
      return budgetOnly(p.marginStress);
    case "reserve":
      return moneyString(p.reserve);
    case "equity":
      return moneyString(p.equity);
    case "variable":
      return moneyString(p.variable);
    case "months":
      return p.months;
    case "bans":
      return p.bans.length ? p.bans.join("|") : "none";
    case "above_capital":
      return p.aboveCapital ? "yes" : "no";
  }
}

/** One number about a case, after one lever when `move` is given (kind lev_measure). */
export const levFact = (id: string, c: PositionCase, measure: LevMeasure, move?: LeverMove): Fact => ({
  id,
  kind: "lev_measure",
  inputs: { ...caseInputs(c), ...(move ? leverInputs(move) : {}), measure },
  value: valueOf(positionOf(move ? applyMove(c, move) : c), measure),
});

/** The smallest whole step of extra equity that brings the ratio to the target (kind lev_step). */
export const stepFact = (id: string, c: PositionCase, target: string, step: string): Fact => {
  const found = smallestEquityStep(c, target, step);
  return { id, kind: "lev_step", inputs: { ...caseInputs(c), target, step }, value: found ? moneyString(found) : "none" };
};

/** A money fact divided by a points fact: the price of one percentage point (kind lev_div). */
export const divFact = (id: string, amount: Fact, points: Fact): Fact => {
  const pts = new Decimal(points.value as string);
  const v = perPoint(amount.value as string, pts);
  return { id, kind: "lev_div", inputs: { amount: amount.id, points: points.id }, value: v ? moneyString(v) : "none" };
};
