/**
 * Lesson 0.3 — compound interest. Every number the lesson, its exercises and
 * its video show is declared here as a fact: what was computed, from which
 * inputs, and the result. The page and the video read data/lessons/0-3.json;
 * checks/independent_check.py recomputes every fact from its inputs.
 *
 * Inputs are teaching assumptions (round numbers chosen to be computed in
 * one's head), not market rates.
 */
import { compoundBalance, compoundTable, exactPeriodsToDouble, periodsToDouble, ruleOf72, simpleBalance } from "../../src/lib/calc/compound.ts";
import Decimal from "decimal.js";
import { moneyString } from "../../src/lib/calc/money.ts";
import type { Fact, LessonData } from "../build-data.ts";

const compound = (id: string, principal: string, rate: string, periods: number): Fact => ({
  id,
  kind: "compound_balance",
  inputs: { principal, rate_percent: rate, periods },
  value: moneyString(compoundBalance(principal, rate, periods)),
});

const simple = (id: string, principal: string, rate: string, periods: number): Fact => ({
  id,
  kind: "simple_balance",
  inputs: { principal, rate_percent: rate, periods },
  value: moneyString(simpleBalance(principal, rate, periods)),
});

const table = (id: string, principal: string, rate: string, periods: number): Fact => ({
  id,
  kind: "compound_table",
  inputs: { principal, rate_percent: rate, periods },
  value: compoundTable(principal, rate, periods).map((row) => ({
    period: row.period,
    opening: moneyString(row.opening),
    interest: moneyString(row.interest),
    interest_on_principal: moneyString(row.interestOnPrincipal),
    interest_on_interest: moneyString(row.interestOnInterest),
    closing: moneyString(row.closing),
  })),
});

const series = (id: string, principal: string, rate: string, periods: number): Fact => ({
  id,
  kind: "growth_series",
  inputs: { principal, rate_percent: rate, periods },
  value: Array.from({ length: periods + 1 }, (_, n) => ({
    period: n,
    compound: moneyString(compoundBalance(principal, rate, n)),
    simple: moneyString(simpleBalance(principal, rate, n)),
  })),
});

const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  // Both sides are already exact agorot strings, so their Decimal difference is exact.
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

export function lesson03(): LessonData {
  const prediction = compound("prediction.compound", "10000", "5", 10);
  const predictionSimple = simple("prediction.simple", "10000", "5", 10);

  const worked = compound("worked.final", "50000", "6", 3);
  const workedPrincipal: Fact = { id: "worked.principal", kind: "given", inputs: {}, value: "50000.00" };
  const workedSimple = simple("worked.simple_final", "50000", "6", 3);

  const ex2year2 = compound("ex2.balance_after_2", "20000", "5", 2);
  const ex2year3 = compound("ex2.balance_after_3", "20000", "5", 3);
  const ex2principal: Fact = { id: "ex2.principal", kind: "given", inputs: {}, value: "20000.00" };
  const ex3principal: Fact = { id: "ex3.principal", kind: "given", inputs: {}, value: "30000.00" };

  const ex3c = compound("ex3.compound", "30000", "4", 10);
  const ex3s = simple("ex3.simple", "30000", "4", 10);

  const ex5a = compound("ex5.at_5", "100000", "5", 30);
  const ex5b = compound("ex5.at_6", "100000", "6", 30);

  const video30c = compound("video.compound_30", "10000", "5", 30);
  const video30s = simple("video.simple_30", "10000", "5", 30);

  const facts: Fact[] = [
    prediction,
    predictionSimple,
    difference("prediction.gap", prediction, predictionSimple),
    table("explain.table", "10000", "5", 5),
    compound("explain.formula_5", "10000", "5", 5),
    compound("explain.after_2", "10000", "5", 2),
    { id: "explain.principal", kind: "given", inputs: {}, value: "10000.00" },
    compound("slider.compound_30_6", "10000", "6", 30),
    simple("slider.simple_30_6", "10000", "6", 30),
    series("explain.series_10", "10000", "5", 10),
    series("video.series_30", "10000", "5", 30),
    video30c,
    video30s,
    difference("video.gap_30", video30c, video30s),
    {
      id: "rule72.approx",
      kind: "rule_of_72",
      inputs: { rate_percent: "6" },
      value: ruleOf72("6").toString(),
    },
    {
      id: "rule72.exact",
      kind: "exact_doubling",
      inputs: { rate_percent: "6" },
      value: exactPeriodsToDouble("6").toDecimalPlaces(2).toFixed(2),
    },
    table("worked.table", "50000", "6", 3),
    worked,
    workedSimple,
    workedPrincipal,
    difference("worked.interest_total", worked, workedPrincipal),
    difference("worked.interest_on_interest", worked, workedSimple),
    difference("worked.simple_interest", workedSimple, workedPrincipal),
    table("half.table", "8000", "4", 3),
    compound("ex1.answer", "1000", "10", 2),
    table("ex1.table", "1000", "10", 2),
    simple("ex1.err_simple", "1000", "10", 2),
    table("ex2.table", "20000", "5", 3),
    ex2year2,
    ex2year3,
    ex2principal,
    difference("ex2.total_interest", ex2year3, ex2principal),
    ex3c,
    ex3s,
    difference("ex3.answer", ex3c, ex3s),
    ex3principal,
    difference("ex3.compound_interest", ex3c, ex3principal),
    difference("ex3.simple_interest", ex3s, ex3principal),
    {
      id: "ex4.answer",
      kind: "periods_to_double",
      inputs: { rate_percent: "6" },
      value: periodsToDouble("6"),
    },
    compound("ex4.factor_11", "1", "6", 11),
    compound("ex4.factor_12", "1", "6", 12),
    ex5a,
    ex5b,
    difference("ex5.answer", ex5b, ex5a),
  ];

  const byId = (id: string) => facts.find((f) => f.id === id)!;
  facts.push(
    difference("explain.interest_after_2", byId("explain.after_2"), byId("explain.principal")),
    difference("slider.gap_30_6", byId("slider.compound_30_6"), byId("slider.simple_30_6")),
  );

  return {
    lesson: "0.3",
    title: "ריבית דריבית",
    note: "Teaching assumptions, not market rates. Money rounded to the agora only at the end of each calculation.",
    facts,
  };
}
