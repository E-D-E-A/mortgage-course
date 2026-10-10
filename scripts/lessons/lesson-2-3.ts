/**
 * Lesson 2.3 — indexed against not indexed. Every number the lesson, its
 * exercises and its illustration's tasks show is declared here as a fact; the
 * page reads data/lessons/2-3.json, and checks/kinds/tracks.py recomputes each
 * computed one.
 *
 * All amounts, rates and inflation figures are invented teaching numbers. The
 * one-year examples pay the interest (and, where stated, a payment) once, at
 * the end of the year, so they can be done in the head; the real monthly
 * mechanics of an indexed track come in stage 3.
 */
import Decimal from "decimal.js";
import { plainNumber } from "../../src/lib/calc/indexation.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { breakEvenInflation, indexedAmount, indexedYearOwed, plainYearOwed, rateBeforeInflation, yearInterest } from "../../src/lib/calc/tracks.ts";
import type { Fact, LessonData } from "../build-data.ts";

const given = (id: string, value: unknown): Fact => ({ id, kind: "given", inputs: {}, value });

const plainOwed = (id: string, amount: string, rate: string): Fact => ({
  id,
  kind: "trk_plain_owed",
  inputs: { amount, rate },
  value: moneyString(plainYearOwed(amount, rate)),
});

const indexedOwed = (id: string, amount: string, real: string, inflation: string): Fact => ({
  id,
  kind: "trk_indexed_owed",
  inputs: { amount, real, inflation },
  value: moneyString(indexedYearOwed(amount, real, inflation)),
});

const indexedAmt = (id: string, amount: string, inflation: string): Fact => ({
  id,
  kind: "trk_indexed_amount",
  inputs: { amount, inflation },
  value: moneyString(indexedAmount(amount, inflation)),
});

const interest = (id: string, balance: string, rate: string): Fact => ({
  id,
  kind: "trk_year_interest",
  inputs: { balance, rate },
  value: moneyString(yearInterest(balance, rate)),
});

/** A year's cost of an indexed debt in shekels: indexation plus interest, amount × ((1 + π)(1 + r) − 1). */
const indexedCost = (id: string, amount: string, real: string, inflation: string): Fact => ({
  id,
  kind: "trk_indexed_cost",
  inputs: { amount, real, inflation },
  value: moneyString(indexedYearOwed(amount, real, inflation).minus(amount)),
});

const breakEven = (id: string, plain: string, indexed: string): Fact => ({
  id,
  kind: "trk_break_even",
  inputs: { plain, indexed },
  value: plainNumber(breakEvenInflation(plain, indexed)),
});

const pointsDiff = (id: string, a: string, b: string): Fact => ({
  id,
  kind: "trk_points_diff",
  inputs: { a, b },
  value: plainNumber(new Decimal(a).minus(b)),
});

const pointsSum = (id: string, a: string, b: string): Fact => ({
  id,
  kind: "trk_points_sum",
  inputs: { a, b },
  value: plainNumber(new Decimal(a).plus(b)),
});

const beforeInflation = (id: string, real: string, inflation: string): Fact => ({
  id,
  kind: "trk_before_inflation",
  inputs: { real, inflation },
  value: plainNumber(rateBeforeInflation(real, inflation)),
});

/** After one year with a payment at its end: indexed debt + interest on it − the payment. */
const afterPayment = (id: string, amount: string, real: string, inflation: string, paid: string): Fact => ({
  id,
  kind: "trk_indexed_after_payment",
  inputs: { amount, real, inflation, paid },
  value: moneyString(indexedYearOwed(amount, real, inflation).minus(paid)),
});

/** One row per inflation figure: what each debt comes to after a year, and the indexed one minus the other. */
const owedTable = (id: string, amount: string, plain: string, real: string, inflations: string[]): Fact => ({
  id,
  kind: "trk_owed_table",
  inputs: { amount, plain, real, ...Object.fromEntries(inflations.map((p, n) => [`inflation_${n + 1}`, p])) },
  value: inflations.map((p, n) => {
    const a = plainYearOwed(amount, plain);
    const b = indexedYearOwed(amount, real, p);
    return { period: n + 1, inflation: plainNumber(p), plain: moneyString(a), indexed: moneyString(b), diff: moneyString(b.minus(a)) };
  }),
});

const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

export default function lesson23(): LessonData {
  const plain = plainOwed("explain.plain_owed", "100000", "5");
  const owed = indexedOwed("explain.indexed_owed", "100000", "3", "2");

  // Worked example: 400,000 ₪, not indexed at 4.8% against indexed at 2.7%.
  const wAmount = given("worked.amount", "400000");
  const wIndexed3 = indexedAmt("worked.indexed_3", "400000", "3");
  const wIndexed15 = indexedAmt("worked.indexed_15", "400000", "1.5");

  const facts: Fact[] = [
    // Prediction and explanation: 100,000 ₪ for a year, 5% not indexed against 3% indexed, inflation 2%.
    given("explain.amount", "100000"),
    given("explain.plain_rate", "5"),
    given("explain.real_rate", "3"),
    given("explain.inflation", "2"),
    plain,
    indexedAmt("explain.indexed_amount", "100000", "2"),
    interest("explain.indexed_interest", "102000", "3"),
    owed,
    difference("explain.gap", owed, plain),
    pointsSum("explain.added", "3", "2"),
    owedTable("explain.table", "100000", "5", "3", ["0", "1", "2", "3", "4"]),
    breakEven("explain.break_even", "5", "3"),
    pointsDiff("explain.break_even_approx", "5", "3"),
    beforeInflation("explain.as_plain", "3", "2"),

    // The illustration's tasks (same amount and rates as the explanation).
    breakEven("slider.break_even", "5", "3"),
    indexedOwed("slider.owed_4", "100000", "3", "4"),
    given("slider.plain_2", "4"),
    breakEven("slider.break_even_2", "4", "3"),

    // Worked example.
    wAmount,
    given("worked.plain_rate", "4.8"),
    given("worked.real_rate", "2.7"),
    given("worked.inflation_low", "1.5"),
    given("worked.inflation_high", "3"),
    interest("worked.plain_cost", "400000", "4.8"),
    wIndexed15,
    difference("worked.indexation_15", wIndexed15, wAmount),
    interest("worked.interest_15", "406000", "2.7"),
    indexedCost("worked.cost_15", "400000", "2.7", "1.5"),
    wIndexed3,
    interest("worked.interest_3_on_indexed", "412000", "2.7"),
    indexedCost("worked.cost_3", "400000", "2.7", "3"),
    breakEven("worked.break_even", "4.8", "2.7"),
    difference("worked.debt_growth", wIndexed3, wAmount),

    // Half-worked table: 200,000 ₪, 4.5% not indexed against 2.5% indexed.
    owedTable("half.table", "200000", "4.5", "2.5", ["0", "1", "2", "3"]),
    breakEven("half.break_even", "4.5", "2.5"),

    // Exercise 2: 200,000 ₪ indexed at 2%, inflation 3%.
    indexedOwed("ex2.answer", "200000", "2", "3"),
    plainOwed("ex2.added", "200000", "5"),
    plainOwed("ex2.no_index", "200000", "2"),
    indexedAmt("ex2.index_only", "200000", "3"),

    // Exercise 3: the inflation at which 4.5% not indexed and 2.5% indexed cost the same.
    breakEven("ex3.answer", "4.5", "2.5"),
    pointsDiff("ex3.approx", "4.5", "2.5"),
    breakEven("ex3.inverted", "2.5", "4.5"),

    // Exercise 5: indexed 3% with inflation 2.5%, as a rate before inflation.
    beforeInflation("ex5.answer", "3", "2.4"),
    pointsSum("ex5.added", "3", "2.4"),

    // Exercise 6: 500,000 ₪ indexed at 3%, inflation 4%, 25,000 ₪ paid at the end of the year.
    afterPayment("ex6.answer", "500000", "3", "4", "25000"),
    { id: "ex6.no_index", kind: "trk_plain_after_payment", inputs: { amount: "500000", rate: "3", paid: "25000" }, value: moneyString(plainYearOwed("500000", "3").minus("25000")) },
    indexedAmt("ex6.indexed", "500000", "4"),
    interest("ex6.interest", "520000", "3"),
    indexedOwed("ex6.no_payment", "500000", "3", "4"),
  ];

  return {
    lesson: "2.3",
    title: "צמוד מול לא צמוד",
    note: "Invented teaching numbers. One-year examples with interest paid at the end of the year; the monthly mechanics of an indexed track come in stage 3.",
    facts,
  };
}
