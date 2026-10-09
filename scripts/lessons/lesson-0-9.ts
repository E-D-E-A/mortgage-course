/**
 * Lesson 0.9 — what a loan is, and how a bank earns. Every number the lesson,
 * its exercises and its video show is declared here as a fact; the page and the
 * video read data/lessons/0-9.json, and checks/kinds/lending.py recomputes each one.
 *
 * All rates and amounts are invented round teaching numbers for a made-up
 * "בנק א׳". They are not any real bank's rates, costs or spreads.
 */
import { rateForSpreadIncome, spread, yearInterest } from "../../src/lib/calc/lending.ts";
import { plainNumber } from "../../src/lib/calc/indexation.ts";
import Decimal from "decimal.js";
import { moneyString } from "../../src/lib/calc/money.ts";
import type { Fact, LessonData } from "../build-data.ts";

const interest = (id: string, amount: string, rate: string): Fact => ({
  id,
  kind: "lend_year_interest",
  inputs: { amount, rate_percent: rate },
  value: moneyString(yearInterest(amount, rate)),
});

const spreadFact = (id: string, loan: string, cost: string): Fact => ({
  id,
  kind: "lend_spread",
  inputs: { loan_rate: loan, cost_rate: cost },
  value: plainNumber(spread(loan, cost)),
});

const sum = (id: string, a: string, b: string): Fact => ({
  id,
  kind: "lend_rate_sum",
  inputs: { a, b },
  value: plainNumber(new Decimal(a).plus(b)),
});

const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

type Loan = [amount: string, loanRate: string, costRate: string];
const spreadTable = (id: string, loans: Loan[]): Fact => ({
  id,
  kind: "lend_spread_table",
  inputs: Object.fromEntries(
    loans.flatMap(([a, l, c], n) => [
      [`amount_${n + 1}`, a],
      [`loan_rate_${n + 1}`, l],
      [`cost_rate_${n + 1}`, c],
    ]),
  ),
  value: loans.map(([a, l, c], n) => ({
    period: n + 1,
    amount: moneyString(a),
    loan_rate: plainNumber(l),
    cost_rate: plainNumber(c),
    spread: plainNumber(spread(l, c)),
    income: moneyString(yearInterest(a, spread(l, c))),
  })),
});

export default function lesson09(): LessonData {
  const fromBorrower = interest("explain.from_borrower", "100000", "5");
  const toDepositors = interest("explain.to_depositors", "100000", "2");

  const wReceived = interest("worked.received", "400000", "4.5");
  const wPaid = interest("worked.paid", "400000", "2.75");
  const wSpread = spreadFact("worked.spread", "4.5", "2.75");

  const facts: Fact[] = [
    // Prediction and explanation: 100,000 lent at 5%, deposits cost 2%.
    fromBorrower,
    toDepositors,
    difference("explain.spread_income", fromBorrower, toDepositors),
    spreadFact("explain.spread", "5", "2"),
    interest("explain.spread_check", "100000", plainNumber(spread("5", "2"))),

    // The illustration's guided tasks.
    spreadFact("slider.equal", "5", "5"),
    interest("slider.double", "200000", plainNumber(spread("5", "2"))),
    spreadFact("slider.both_up", "6", "3"),

    // Worked example: 400,000 at 4.5%, cost of funds 2.75%.
    wReceived,
    wPaid,
    difference("worked.spread_income", wReceived, wPaid),
    wSpread,
    interest("worked.spread_check", "400000", wSpread.value as string),

    // Half-worked table.
    spreadTable("half.table", [
      ["100000", "6", "4"],
      ["250000", "5.5", "3"],
      ["600000", "4.25", "2.5"],
    ]),

    // Exercise 2: 6% and 3.5%.
    spreadFact("ex2.answer", "6", "3.5"),
    sum("ex2.sum", "6", "3.5"),

    // Exercise 3: 200,000 at 5%, cost 3%.
    interest("ex3.received", "200000", "5"),
    interest("ex3.paid", "200000", "3"),
    spreadFact("ex3.spread", "5", "3"),
    interest("ex3.answer", "200000", plainNumber(spread("5", "3"))),

    // Exercise 5: 6,000 on 300,000, cost 2.5%.
    {
      id: "ex5.answer",
      kind: "lend_rate_for_income",
      inputs: { amount: "300000", income: "6000", cost_rate: "2.5" },
      value: plainNumber(rateForSpreadIncome("300000", "6000", "2.5")),
    },
    spreadFact("ex5.spread_only", plainNumber(rateForSpreadIncome("300000", "6000", "2.5")), "2.5"),
  ];

  return {
    lesson: "0.9",
    title: "מה זו הלוואה, ואיך בנק מרוויח",
    note: "Invented teaching numbers for a made-up bank; not any real bank's rates, costs or spreads.",
    facts,
  };
}
