/**
 * Lesson 0.6 — present value: several payments, each moved back to today and
 * added up (discounting). Every number the lesson, its exercises and its video
 * show is declared here as a fact; the page and the video read
 * data/lessons/0-6.json, and checks/independent_check.py recomputes every fact
 * (checks/kinds/present_value.py).
 *
 * Inputs are teaching assumptions (round numbers), not market rates.
 */
import Decimal from "decimal.js";
import { moneyString } from "../../src/lib/calc/money.ts";
import { loanBalanceTable, streamPercentOffMistake, streamValueToday, valueToday } from "../../src/lib/calc/present-value.ts";
import { growthFactor, roundedString } from "../../src/lib/calc/rates.ts";
import type { Fact, LessonData } from "../build-data.ts";

const today = (id: string, amount: string, rate: string, periods: number): Fact => ({
  id,
  kind: "value_today",
  inputs: { amount, rate_percent: rate, periods },
  value: moneyString(valueToday(amount, rate, periods)),
});

const stream = (id: string, payment: string, rate: string, periods: number): Fact => ({
  id,
  kind: "stream_value_today",
  inputs: { payment, rate_percent: rate, periods },
  value: moneyString(streamValueToday(payment, rate, periods)),
});

const total = (id: string, payment: string, periods: number): Fact => ({
  id,
  kind: "payments_total",
  inputs: { payment, periods },
  value: moneyString(new Decimal(payment).mul(periods)),
});

const todayTable = (id: string, amount: string, rate: string, periods: number, decimals: number): Fact => ({
  id,
  kind: "value_today_table",
  inputs: { amount, rate_percent: rate, periods, decimals },
  value: Array.from({ length: periods }, (_, i) => ({
    period: i + 1,
    amount: moneyString(amount),
    growth: roundedString(growthFactor(rate, i + 1), decimals),
    value_today: moneyString(valueToday(amount, rate, i + 1)),
  })),
});

const loan = (id: string, principal: string, rate: string, payment: string, periods: number): Fact => ({
  id,
  kind: "loan_balance_table",
  inputs: { principal, rate_percent: rate, payment, periods },
  value: loanBalanceTable(principal, rate, payment, periods).map((r) => ({
    period: r.period,
    opening: moneyString(r.opening),
    interest: moneyString(r.interest),
    payment: moneyString(r.payment),
    closing: moneyString(r.closing),
  })),
});

/** The sum of other facts' money values (each already rounded to the agora). */
/** Payments "discounted" by taking percents off instead of dividing (the mistake from lesson 0.5). */
const percentOffStream = (id: string, payment: string, rate: string, periods: number, method: "simple" | "compound"): Fact => ({
  id,
  kind: "stream_percent_off_mistake",
  inputs: { payment, rate_percent: rate, periods, method },
  value: moneyString(streamPercentOffMistake(payment, rate, periods, method)),
});

/** A value rounded down or up to the thousand, for a range in an answer choice: 7,721.73 → 7,000 / 8,000. */
const thousandBound = (id: string, of: Fact, direction: "down" | "up"): Fact => {
  const k = new Decimal(of.value as string).div(1000);
  return {
    id,
    kind: "thousand_bound",
    inputs: { of: of.id, direction },
    value: moneyString((direction === "up" ? k.ceil() : k.floor()).mul(1000)),
  };
};

const sum = (id: string, terms: Fact[]): Fact => ({
  id,
  kind: "sum_of_facts",
  inputs: { terms: terms.map((t) => t.id).join(",") },
  value: moneyString(terms.reduce((acc, t) => acc.plus(t.value as string), new Decimal(0))),
});

const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

const given = (id: string, value: string): Fact => ({ id, kind: "given", inputs: {}, value });

export default function lesson06(): LessonData {
  // The explanation, part 1: 1,100 after a year and 1,210 after two, at 10% — each worth 1,000 today.
  const p1 = given("explain.pay_1", "1100.00");
  const p2 = given("explain.pay_2", "1210.00");
  const v1 = today("explain.today_1", "1100", "10", 1);
  const v2 = today("explain.today_2", "1210", "10", 2);
  // Exercise 2: 3,300 after a year and 2,420 after two, at 10%.
  const ex2p1 = given("ex2.pay_1", "3300.00");
  const ex2p2 = given("ex2.pay_2", "2420.00");
  const ex2v1 = today("ex2.today_1", "3300", "10", 1);
  const ex2v2 = today("ex2.today_2", "2420", "10", 2);
  const ex2v2Once = today("ex2.err_once", "2420", "10", 1);

  // Part 2: three payments of 1,000 at 10%.
  const threeTotal = total("explain.three_total", "1000", 3);
  const threeToday = stream("explain.three_today", "1000", "10", 3);

  // Prediction: ten payments of 1,000 at 5%.
  const predToday = stream("prediction.today", "1000", "5", 10);
  const predTotal = total("prediction.total", "1000", 10);

  // Worked example: 110,000 now, or 40,000 at the end of each of three years, at 4%.
  const workedToday = stream("worked.today", "40000", "4", 3);
  const workedNow = given("worked.now", "110000.00");
  const workedTotal = total("worked.total", "40000", 3);

  // Exercise 3: two payments of 5,000 at 4%.
  const ex3a = today("ex3.first", "5000", "4", 1);
  const ex3b = today("ex3.second", "5000", "4", 2);

  // Exercise 5: lend 10,000, receive 5,500 at the end of each of two years, at 6%.
  const ex5Today = stream("ex5.today", "5500", "6", 2);
  const ex5Lent = given("ex5.lent", "10000.00");
  const ex5Total = total("ex5.total", "5500", 2);

  const facts: Fact[] = [
    p1,
    p2,
    v1,
    v2,
    sum("explain.sum_today", [v1, v2]),
    sum("explain.sum_nominal", [p1, p2]),
    todayTable("explain.table", "1000", "10", 3, 3),
    threeTotal,
    threeToday,
    difference("explain.three_gap", threeTotal, threeToday),
    loan("loan.table", "2486.85", "10", "1000", 3),

    predToday,
    predTotal,
    todayTable("video.table_10", "1000", "5", 10, 6),
    today("prediction.lump", "10000", "5", 10),
    difference("prediction.gap", predTotal, predToday),
    thousandBound("prediction.low", predToday, "down"),
    thousandBound("prediction.high", predToday, "up"),

    // The slider's guided tasks.
    stream("slider.today_30", "1000", "5", 30),
    total("slider.total_30", "1000", 30),
    today("slider.first", "1000", "5", 1),
    today("slider.last_30", "1000", "5", 30),
    stream("slider.today_10_8", "1000", "8", 10),

    // Worked example.
    todayTable("worked.table", "40000", "4", 3, 6),
    workedToday,
    workedNow,
    workedTotal,
    difference("worked.gap", workedToday, workedNow),
    difference("worked.nominal_gap", workedTotal, workedNow),

    // Half-worked example.
    todayTable("half.table", "3000", "6", 3, 6),
    stream("half.total", "3000", "6", 3),

    // Exercises (exercise 2's answer is explain.sum_today).
    ex2p1,
    ex2p2,
    ex2v1,
    ex2v2,
    ex2v2Once,
    sum("ex2.answer", [ex2v1, ex2v2]),
    sum("ex2.err_nominal", [ex2p1, ex2p2]),
    sum("ex2.err_both_once", [ex2v1, ex2v2Once]),
    ex3a,
    ex3b,
    stream("ex3.answer", "5000", "4", 2),
    total("ex3.err_total", "5000", 2),
    sum("ex3.err_both_one_year", [ex3a, ex3a]),
    sum("ex3.err_both_two_years", [ex3b, ex3b]),
    percentOffStream("ex3.err_off", "5000", "4", 2, "simple"),
    percentOffStream("ex3.err_off_repeated", "5000", "4", 2, "compound"),
    stream("ex4.answer", "1000", "6", 4),
    total("ex4.err_total", "1000", 4),
    today("ex4.err_lump", "4000", "6", 4),
    percentOffStream("ex4.err_off", "1000", "6", 4, "simple"),
    percentOffStream("ex4.err_off_repeated", "1000", "6", 4, "compound"),
    ex5Today,
    ex5Lent,
    ex5Total,
    difference("ex5.answer", ex5Today, ex5Lent),
    difference("ex5.err_nominal", ex5Total, ex5Lent),
  ];

  return {
    lesson: "0.6",
    title: "ערך נוכחי",
    note: "Teaching assumptions, not market rates. Each value today is rounded to the agora once, at the end; a stream's total is the exact sum, rounded once.",
    facts,
  };
}
