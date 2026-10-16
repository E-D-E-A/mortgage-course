/**
 * Fact builders for lessons 6.1–6.3 (stage 6, author A). Each builder computes its value with
 * src/lib/calc/positioning.ts (on regulation.ts, affordability.ts and sensitivity.ts) and names a kind
 * that checks/kinds/positioning.py recomputes on its own. Not a lesson module: build-data.ts loads
 * only lesson-*.ts and check-*.ts. Lessons 6.4 and later may import it.
 *
 * Case A's numbers are built from case-a-mix.ts through the sensitivity facts (kind sens_mix), so the
 * ratio, the loan and the payment of case A are checked by the same Python that checks stage 5.
 */
import Decimal from "decimal.js";
import { CASE_A, INITIAL_MIX, SCENARIOS } from "../../src/data/case-a-mix.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { percentString } from "../../src/lib/calc/percent.ts";
import {
  equityToReach,
  incomeRoom,
  loanCut,
  loanRoom,
  paymentCut,
  paymentRoom,
  pointsTo,
  shortestTerm,
  statusOf,
  termRoute,
} from "../../src/lib/calc/positioning.ts";
import { mixInputs, type TrackSpec } from "../../src/lib/calc/schedule.ts";
import { scenarioFrom } from "../../src/lib/calc/sensitivity.ts";
import type { Fact } from "../build-data.ts";
import { mixFact, leverFact, type Mix } from "./_sensitivity-facts.ts";

export { difference, given, givenMoney, sumOf } from "./_sensitivity-facts.ts";
export { mixFact, leverFact };
export type { Mix };

/** A teaching number shown as written: a percent, a count, years. */
export const givenNumber = (id: string, value: string | number): Fact => ({ id, kind: "given", inputs: {}, value });

/** Case A's initial mix under the base scenario, the one every stage-6 lesson starts from. */
export const MIX_A: Mix = { tracks: INITIAL_MIX, scenario: SCENARIOS.base };

/** Case A's income and car loan, as the ratio facts carry them. */
export const CASE_A_RECOGNISED = CASE_A.recognisedIncome;
export const CASE_A_DISPOSABLE = new Decimal(CASE_A.recognisedIncome).minus(CASE_A.car.monthly).toString();

export const points = (id: string, actual: string, percent: string): Fact => ({
  id,
  kind: "pos_points",
  inputs: { actual, percent },
  value: percentString(pointsTo(actual, percent)),
});

export const paymentRoomFact = (id: string, disposable: string, payment: string, percent: string): Fact => ({
  id,
  kind: "pos_payment_room",
  inputs: { disposable, payment, percent },
  value: moneyString(paymentRoom(disposable, payment, percent)),
});

export const paymentCutFact = (id: string, disposable: string, payment: string, percent: string): Fact => ({
  id,
  kind: "pos_payment_cut",
  inputs: { disposable, payment, percent },
  value: moneyString(paymentCut(disposable, payment, percent)),
});

export const loanRoomFact = (id: string, value: string, loan: string, percent: string): Fact => ({
  id,
  kind: "pos_loan_room",
  inputs: { value, loan, percent },
  value: moneyString(loanRoom(value, loan, percent)),
});

export const equityNeededFact = (id: string, value: string, loan: string, percent: string): Fact => ({
  id,
  kind: "pos_equity_needed",
  inputs: { value, loan, percent },
  value: moneyString(equityToReach(value, loan, percent)),
});

export const incomeRoomFact = (id: string, disposable: string, payment: string, percent: string): Fact => ({
  id,
  kind: "pos_income_room",
  inputs: { disposable, payment, percent },
  value: moneyString(incomeRoom(disposable, payment, percent)),
});

/** The least cut (in whole steps) off a mix's loan for its payment ratio to be at most the line. */
export const loanCutFact = (id: string, tracks: TrackSpec[], disposable: string, percent: string, step = 1000): Fact => ({
  id,
  kind: "pos_loan_cut",
  inputs: { ...mixInputs(tracks, scenarioFrom({ inflation: "0", primeShift: "0", anchorShift: "0" })), disposable, percent, step: String(step) },
  value: moneyString(loanCut(tracks, disposable, percent, step)),
});

export type TermMeasure = "from_payment" | "to_payment" | "from_total" | "to_total" | "payment_drop" | "extra_total";

export const termRouteFact = (id: string, principal: string, rate: string, from: number, to: number, measure: TermMeasure): Fact => {
  const r = termRoute(principal, rate, from, to);
  const v = { from_payment: r.fromPayment, to_payment: r.toPayment, from_total: r.fromTotal, to_total: r.toTotal, payment_drop: r.paymentDrop, extra_total: r.extraTotal }[measure];
  return { id, kind: "pos_term_route", inputs: { principal, rate, from, to, measure }, value: moneyString(v) };
};

export const shortestTermFact = (id: string, principal: string, rate: string, cap: string, from: number, step = 12, max = 360): Fact => ({
  id,
  kind: "pos_shortest_term",
  inputs: { principal, rate, cap, from, step, max },
  value: shortestTerm(principal, rate, cap, from, step, max) ?? "none",
});

/** One row per line (lowest percent first as given): percent, status, points. */
export const standingTableFact = (id: string, actual: string, percents: string[]): Fact => ({
  id,
  kind: "pos_standing_table",
  inputs: { actual, ...Object.fromEntries(percents.map((p, k) => [`percent_${k + 1}`, p])) },
  value: percents.map((p, k) => ({ period: k + 1, percent: p, status: statusOf(actual, p), points: percentString(pointsTo(actual, p)) })),
});

/** A whole-number difference a − b (kind fc_minus, checked in factors.py): payments until 17 are left of 26, and the like. */
export const minusWhole = (id: string, a: number, b: number): Fact => ({ id, kind: "fc_minus", inputs: { a: String(a), b: String(b), decimals: 0 }, value: String(a - b) });

/** A money fact times a whole count (kind met_times, checked in metrics.py). */
export const timesFact = (id: string, of: Fact, count: number): Fact => ({ id, kind: "met_times", inputs: { of: of.id, count }, value: moneyString(new Decimal(of.value as string).mul(count)) });
