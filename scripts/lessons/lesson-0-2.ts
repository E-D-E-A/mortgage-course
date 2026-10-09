/**
 * Lesson 0.2 — interest and simple interest. Every number the lesson, its
 * exercises and its video show is declared here as a fact: what was computed,
 * from which inputs, and the result. The page and the video read
 * data/lessons/0-2.json; checks/independent_check.py recomputes every fact
 * (checks/kinds/percent.py and compound.py).
 *
 * Inputs are teaching assumptions (round numbers chosen to be computed in
 * one's head), not market rates.
 */
import { simpleBalance } from "../../src/lib/calc/compound.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { percentAsDecimal, percentOf, percentString, sharePercent } from "../../src/lib/calc/percent.ts";
import { quotient, simpleInterest, simpleInterestTable } from "../../src/lib/calc/simple.ts";
import type { Fact, LessonData } from "../build-data.ts";

const given = (id: string, amount: string): Fact => ({ id, kind: "given", inputs: {}, value: moneyString(amount) });

/** One year's interest: p% of the principal. */
const yearly = (id: string, principal: string, rate: string): Fact => ({
  id,
  kind: "percent_of",
  inputs: { amount: principal, rate_percent: rate },
  value: moneyString(percentOf(principal, rate)),
});

/** All the interest over n years. */
const interest = (id: string, principal: string, rate: string, periods: number): Fact => ({
  id,
  kind: "simple_interest",
  inputs: { principal, rate_percent: rate, periods },
  value: moneyString(simpleInterest(principal, rate, periods)),
});

/** Principal plus all the interest. */
const total = (id: string, principal: string, rate: string, periods: number): Fact => ({
  id,
  kind: "simple_balance",
  inputs: { principal, rate_percent: rate, periods },
  value: moneyString(simpleBalance(principal, rate, periods)),
});

const table = (id: string, principal: string, rate: string, periods: number): Fact => ({
  id,
  kind: "simple_interest_table",
  inputs: { principal, rate_percent: rate, periods },
  value: simpleInterestTable(principal, rate, periods).map((r) => ({
    period: r.period,
    interest: moneyString(r.interest),
    total_interest: moneyString(r.totalInterest),
  })),
});

const share = (id: string, part: string, whole: string): Fact => ({
  id,
  kind: "share_percent",
  inputs: { part, whole },
  value: percentString(sharePercent(part, whole)),
});

const ratio = (id: string, dividend: Fact, divisor: Fact): Fact => ({
  id,
  kind: "percent_quotient",
  inputs: { dividend: dividend.id, divisor: divisor.id },
  value: percentString(quotient(dividend.value as string, divisor.value as string)),
});

const v = (f: Fact) => f.value as string;

const decimal = (id: string, rate: string): Fact => ({
  id,
  kind: "percent_decimal",
  inputs: { rate_percent: rate },
  value: percentAsDecimal(rate).toFixed(),
});

export default function lesson02(): LessonData {
  const ex6yearly = yearly("ex6.yearly", "8000", "6");
  const ex7yearly = yearly("ex7.yearly", "20000", "5");
  const ex7target = given("ex7.target", "5000");
  const storyPrincipal = given("story.principal", "100");
  const bigPrincipal = given("big.principal", "10000");

  const facts: Fact[] = [
    // Prediction: lending 1,000 ₪ for 3 years at 5% a year
    given("pred.principal", "1000"),
    yearly("pred.yearly", "1000", "5"),
    interest("pred.interest", "1000", "5", 3),
    total("pred.total", "1000", "5", 3),
    total("pred.one_year", "1000", "5", 1),

    // The story (explanation and video): "I lend you 100 ₪"
    storyPrincipal,
    yearly("story.one", "100", "1"),
    yearly("story.yearly", "100", "5"),
    table("story.table", "100", "5", 3),
    interest("story.interest", "100", "5", 3),
    total("story.total", "100", "5", 3),
    interest("story.interest_6_years", "100", "5", 6),
    interest("story.interest_at_10", "100", "10", 3),

    // A bigger amount (explanation, slider and video)
    yearly("big.yearly", "10000", "5"),
    // The principal alone: 100 times the principal, same rate and years
    bigPrincipal,
    ratio("big.times", bigPrincipal, storyPrincipal),
    interest("big.interest_3_years", "10000", "5", 3),
    // Percent as a decimal (formula section)
    decimal("formula.r_5", "5"),
    table("big.table", "10000", "5", 10),
    interest("big.interest", "10000", "5", 10),
    total("big.total", "10000", "5", 10),

    // Worked example: 30,000 ₪ for 3 years at 4% a year
    given("worked.principal", "30000"),
    yearly("worked.one", "30000", "1"),
    yearly("worked.yearly", "30000", "4"),
    table("worked.table", "30000", "4", 3),
    interest("worked.interest", "30000", "4", 3),
    total("worked.total", "30000", "4", 3),
    share("worked.interest_share", moneyString(simpleInterest("30000", "4", 3)), "30000"),

    // Half-worked table: 4,000 ₪ for 4 years at 6% a year
    table("half.table", "4000", "6", 4),

    // Exercise 1: one year of 4% on 2,000
    yearly("ex1.answer", "2000", "4"),
    total("ex1.err_total", "2000", "4", 1),
    yearly("ex1.err_tenth", "2000", "40"),
    yearly("ex1.one", "2000", "1"),

    // Exercise 2: a deposit in a savings plan
    given("ex2.deposit", "5000"),

    // Exercise 3: total interest, 12,000 ₪, 4 years, 3%
    yearly("ex3.yearly", "12000", "3"),
    interest("ex3.answer", "12000", "3", 4),
    total("ex3.err_total", "12000", "3", 4),
    interest("ex3.err_thirty", "12000", "30", 4),
    decimal("ex3.r", "3"),

    // Exercise 4: everything received, 5,000 ₪, 3 years, 6%
    yearly("ex4.yearly", "5000", "6"),
    interest("ex4.interest", "5000", "6", 3),
    total("ex4.answer", "5000", "6", 3),
    total("ex4.err_one_year", "5000", "6", 1),

    // Exercise 5: 4% for 5 years against 5% for 4 years
    given("ex5.principal", "10000"),
    yearly("ex5.yearly_a", "10000", "4"),
    yearly("ex5.yearly_b", "10000", "5"),
    interest("ex5.a", "10000", "4", 5),
    interest("ex5.b", "10000", "5", 4),

    // Exercise 6: find the rate
    given("ex6.principal", "8000"),
    interest("ex6.interest", "8000", "6", 2),
    ex6yearly,
    share("ex6.answer", v(ex6yearly), "8000"),
    share("ex6.err_total", moneyString(simpleInterest("8000", "6", 2)), "8000"),
    decimal("ex6.err_decimal", "6"),
    decimal("ex6.err_decimal_total", "12"),

    // Exercise 7: find the years
    given("ex7.principal", "20000"),
    ex7yearly,
    ex7target,
    ratio("ex7.answer", ex7target, ex7yearly),
    share("ex7.err_share", v(ex7target), "20000"),
  ];

  return {
    lesson: "0.2",
    title: "ריבית: המחיר של כסף",
    note: "Teaching assumptions, not market rates. Interest is paid at the end of every year; the principal is returned at the end.",
    facts,
  };
}
