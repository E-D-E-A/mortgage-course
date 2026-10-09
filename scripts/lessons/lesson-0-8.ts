/**
 * Lesson 0.8 — indexation; real and nominal. Every number the lesson, its
 * exercises and its video show is declared here as a fact; the page and the
 * video read data/lessons/0-8.json, and checks/kinds/indexation.py (with
 * compound.py for the two compound-interest facts) recomputes each one.
 *
 * Inflation rates and index values are invented round teaching numbers
 * ("מספרים להמחשה"), not CPI data and not a forecast.
 */
import {
  approxRealRate,
  indexPoints,
  indexationTable,
  indexedAmount,
  indexedBalance,
  nominalRate,
  plainNumber,
  realRate,
  realRateOverNominal,
  realValue,
} from "../../src/lib/calc/indexation.ts";
import { compoundBalance, simpleBalance } from "../../src/lib/calc/compound.ts";
import Decimal from "decimal.js";
import { moneyString } from "../../src/lib/calc/money.ts";
import type { Fact, LessonData } from "../build-data.ts";

const indexed = (id: string, amount: string, baseIndex: string, newIndex: string): Fact => ({
  id,
  kind: "infl_indexed_amount",
  inputs: { amount, base_index: baseIndex, new_index: newIndex },
  value: moneyString(indexedAmount(amount, baseIndex, newIndex)),
});

const balance = (id: string, amount: string, inflation: string, years: number): Fact => ({
  id,
  kind: "infl_indexed_balance",
  inputs: { amount, inflation_percent: inflation, years },
  value: moneyString(indexedBalance(amount, inflation, years)),
});

const real = (id: string, amount: string, inflation: string, years: number): Fact => ({
  id,
  kind: "infl_real_value",
  inputs: { amount, inflation_percent: inflation, years },
  value: moneyString(realValue(amount, inflation, years)),
});

const realR = (id: string, nominal: string, inflation: string): Fact => ({
  id,
  kind: "infl_real_rate",
  inputs: { nominal_percent: nominal, inflation_percent: inflation },
  value: plainNumber(realRate(nominal, inflation)),
});

const realApprox = (id: string, nominal: string, inflation: string): Fact => ({
  id,
  kind: "infl_real_rate_approx",
  inputs: { nominal_percent: nominal, inflation_percent: inflation },
  value: plainNumber(approxRealRate(nominal, inflation)),
});

const nominalR = (id: string, realP: string, inflation: string): Fact => ({
  id,
  kind: "infl_nominal_rate",
  inputs: { real_percent: realP, inflation_percent: inflation },
  value: plainNumber(nominalRate(realP, inflation)),
});

const nominalApprox = (id: string, realP: string, inflation: string): Fact => ({
  id,
  kind: "infl_nominal_rate_approx",
  inputs: { real_percent: realP, inflation_percent: inflation },
  value: plainNumber(new Decimal(realP).plus(inflation)),
});

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

const table = (id: string, amount: string, inflation: string, years: number): Fact => ({
  id,
  kind: "infl_indexation_table",
  inputs: { amount, inflation_percent: inflation, years },
  value: indexationTable(amount, inflation, years).map((r) => ({
    period: r.period,
    opening: moneyString(r.opening),
    indexation: moneyString(r.indexation),
    closing: moneyString(r.closing),
  })),
});

const series = (id: string, amount: string, inflation: string, years: number): Fact => ({
  id,
  kind: "infl_indexation_series",
  inputs: { amount, inflation_percent: inflation, years },
  value: Array.from({ length: years + 1 }, (_, n) => ({
    year: n,
    indexed: moneyString(indexedBalance(amount, inflation, n)),
    unindexed: moneyString(amount),
    unindexed_real: moneyString(realValue(amount, inflation, n)),
  })),
});

const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

const points = (id: string, old: string, next: string): Fact => ({
  id,
  kind: "infl_index_points",
  inputs: { old, new: next },
  value: plainNumber(indexPoints(old, next)),
});

const given = (id: string, value: string): Fact => ({ id, kind: "given", inputs: {}, value });

export default function lesson08(): LessonData {
  const principal = given("explain.principal", "100000.00");
  const oneStep = indexed("explain.one_step", "100000", "100", "103");
  const realTen = real("explain.unindexed_real_10", "100000", "3", 10);

  const workedNominal = compound("worked.nominal", "50000", "4", 1);
  const workedBasket = balance("worked.basket", "50000", "3", 1);
  const workedReal = real("worked.real_value", "52000", "3", 1);
  const workedStart = given("worked.start", "50000.00");

  const ex1 = indexed("ex1.answer", "10000", "100", "104");
  const ex1start = given("ex1.start", "10000.00");
  const ex3 = indexed("ex3.answer", "80000", "105", "108.15");
  const ex3start = given("ex3.start", "80000.00");

  const facts: Fact[] = [
    // Prediction: 100,000 indexed, 3% a year, 10 years, no interest and no payments.
    principal,
    balance("prediction.indexed", "100000", "3", 10),
    simple("prediction.simple", "100000", "3", 10),

    // Explanation.
    oneStep,
    difference("explain.one_step_add", oneStep, principal),
    indexed("explain.odd_base", "100000", "104", "107.12"),
    points("explain.odd_points", "104", "107.12"),
    balance("explain.after_2", "100000", "3", 2),
    table("explain.table", "100000", "3", 3),
    realTen,
    difference("explain.lost_10", principal, realTen),
    realR("explain.real_rate", "5", "2"),
    realApprox("explain.real_approx", "5", "2"),

    // The illustration's guided tasks.
    balance("slider.indexed_30", "100000", "3", 30),
    real("slider.real_30", "100000", "3", 30),
    series("video.series_10", "100000", "3", 10),

    // Worked example: a 50,000 deposit at 4% for a year, inflation 3%.
    workedStart,
    workedNominal,
    workedBasket,
    difference("worked.gain_vs_basket", workedNominal, workedBasket),
    workedReal,
    difference("worked.real_gain", workedReal, workedStart),
    realR("worked.real_rate", "4", "3"),
    realApprox("worked.real_approx", "4", "3"),

    // Half-worked table: 50,000 indexed, 2% a year, 3 years.
    table("half.table", "50000", "2", 3),

    // Exercises.
    ex1start,
    ex1,
    difference("ex1.add", ex1, ex1start),
    ex3start,
    ex3,
    difference("ex3.add", ex3, ex3start),
    indexed("ex3.base_100", "80000", "100", "108.15"),
    indexed("ex3.points_as_percent", "80000", "100", "103.15"),
    points("ex3.points", "105", "108.15"),
    realR("ex4.answer", "6", "4"),
    realApprox("ex4.approx", "6", "4"),
    given("ex4.nominal", "6"),
    {
      id: "ex4.over_nominal",
      kind: "infl_real_rate_over_nominal",
      inputs: { nominal_percent: "6", inflation_percent: "4" },
      value: plainNumber(realRateOverNominal("6", "4")),
    },
    real("ex5.answer", "100000", "2", 5),
    simple("ex5.simple", "100000", "-2", 5),
    given("ex5.amount", "100000.00"),
    balance("ex5.indexed", "100000", "2", 5),
    nominalR("ex6.answer", "3", "2"),
    nominalApprox("ex6.approx", "3", "2"),
    // The mistake: dividing the growth factors instead of multiplying them.
    realR("ex6.divided", "3", "2"),
  ];

  return {
    lesson: "0.8",
    title: "הצמדה",
    note: "Invented teaching numbers: inflation rates and index values are illustrations, not CPI data or a forecast. Money rounded to the agora only at the end.",
    facts,
  };
}
