/**
 * Lesson 0.5 — the time value of money: one amount moved forward in time
 * (× (1 + r)^n) and back to today (÷ (1 + r)^n). Every number the lesson, its
 * exercises and its video show is declared here as a fact; the page and the
 * video read data/lessons/0-5.json, and checks/independent_check.py recomputes
 * every fact (checks/kinds/present_value.py and compound.py).
 *
 * Inputs are teaching assumptions (round numbers), not market rates.
 */
import Decimal from "decimal.js";
import { simpleBalance } from "../../src/lib/calc/compound.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { percentOffCompoundMistake, percentOffMistake, valueLater, valueToday } from "../../src/lib/calc/present-value.ts";
import { growthFactor, roundedString } from "../../src/lib/calc/rates.ts";
import type { Fact, LessonData } from "../build-data.ts";

const later = (id: string, amount: string, rate: string, periods: number): Fact => ({
  id,
  kind: "compound_balance",
  inputs: { principal: amount, rate_percent: rate, periods },
  value: moneyString(valueLater(amount, rate, periods)),
});

const today = (id: string, amount: string, rate: string, periods: number): Fact => ({
  id,
  kind: "value_today",
  inputs: { amount, rate_percent: rate, periods },
  value: moneyString(valueToday(amount, rate, periods)),
});

const percentOff = (id: string, amount: string, rate: string, periods: number): Fact => ({
  id,
  kind: "percent_off_mistake",
  inputs: { amount, rate_percent: rate, periods },
  value: moneyString(percentOffMistake(amount, rate, periods)),
});

/** r% taken off n times in a row: amount × (1 − r)^n. */
const percentOffRepeated = (id: string, amount: string, rate: string, periods: number): Fact => ({
  id,
  kind: "percent_off_compound_mistake",
  inputs: { amount, rate_percent: rate, periods },
  value: moneyString(percentOffCompoundMistake(amount, rate, periods)),
});

const factor = (id: string, rate: string, periods: number, decimals: number): Fact => ({
  id,
  kind: "growth_factor_rounded",
  inputs: { rate_percent: rate, periods, decimals },
  value: roundedString(growthFactor(rate, periods), decimals),
});

/** One row per year: the growth factor (1 + r)^n, shown to `decimals`, and the value today of `amount` arriving then. */
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

const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

const given = (id: string, value: string): Fact => ({ id, kind: "given", inputs: {}, value });

export default function lesson05(): LessonData {
  // Prediction: 1,000 today or 1,200 in five years, when money can earn 5% a year.
  const predLater = later("prediction.grown", "1000", "5", 5);
  const predToday = today("prediction.today", "1200", "5", 5);
  const predOffer = given("prediction.offer", "1200.00");
  const predNow = given("prediction.now", "1000.00");

  // Worked example: 9,000 now or 10,000 in two years, at 4%.
  const workedToday = today("worked.today", "10000", "4", 2);
  const workedNow = given("worked.now", "9000.00");
  const workedGrown = later("worked.grown", "9000", "4", 2);
  const workedLater = given("worked.later", "10000.00");

  // Exercise 6: 8,500 today or 10,000 in four years, at 4%.
  const ex6Today = today("ex6.today", "10000", "4", 4);
  const ex6Now = given("ex6.now", "8500.00");
  const ex6Grown = later("ex6.grown", "8500", "4", 4);
  const ex6Later = given("ex6.later", "10000.00");

  const ex2 = later("ex2.answer", "2000", "10", 1);
  const ex2Principal = given("ex2.principal", "2000.00");

  const facts: Fact[] = [
    difference("ex2.interest", ex2, ex2Principal),
    // The explanation: 1,000 at 10%.
    later("explain.next_year", "1000", "10", 1),
    later("explain.two_years", "1000", "10", 2),
    today("explain.today_of_1100", "1100", "10", 1),
    today("explain.today_of_1210", "1210", "10", 2),
    today("explain.today_1y", "1000", "10", 1),
    later("explain.check_1y", "909.09", "10", 1),
    today("explain.today_2y", "1000", "10", 2),
    today("explain.today_3y", "1000", "10", 3),
    percentOff("explain.mistake", "1000", "10", 1),
    later("explain.mistake_grown", "900", "10", 1),
    todayTable("explain.table", "1000", "10", 5, 5),

    // Prediction.
    predLater,
    predToday,
    predOffer,
    predNow,
    difference("prediction.gap_later", predLater, predOffer),
    difference("prediction.gap_today", predNow, predToday),

    // The slider's guided tasks.
    today("slider.today_10", "1000", "5", 10),
    today("slider.today_30", "1000", "5", 30),
    today("slider.today_30_2", "1000", "2", 30),

    // Formula section.
    factor("formula.factor_3", "10", 3, 3),

    // Worked example.
    workedToday,
    workedNow,
    workedGrown,
    workedLater,
    factor("worked.factor", "4", 2, 4),
    difference("worked.gain_today", workedToday, workedNow),
    difference("worked.gain_later", workedLater, workedGrown),
    later("worked.gain_grown", "245.56", "4", 2),

    // Half-worked example.
    todayTable("half.table", "2000", "5", 4, 6),

    // Exercises.
    ex2,
    ex2Principal,
    later("ex3.err_grown", "1485", "10", 1),
    today("ex3.answer", "1650", "10", 1),
    percentOff("ex3.err_off", "1650", "10", 1),
    later("ex3.err_times", "1650", "10", 1),
    later("ex4.answer", "1000", "6", 3),
    {
      id: "ex4.err_simple",
      kind: "simple_balance",
      inputs: { principal: "1000", rate_percent: "6", periods: 3 },
      value: moneyString(simpleBalance("1000", "6", 3)),
    },
    today("ex4.err_today", "1000", "6", 3),
    today("ex5.answer", "5000", "4", 3),
    factor("ex5.factor", "4", 3, 6),
    percentOff("ex5.err_off", "5000", "4", 3),
    percentOffRepeated("ex5.err_off_repeated", "5000", "4", 3),
    later("ex5.err_times", "5000", "4", 3),
    today("ex5.err_once", "5000", "4", 1),
    ex6Today,
    ex6Now,
    ex6Grown,
    ex6Later,
    factor("ex6.factor", "4", 4, 6),
    difference("ex6.answer", ex6Today, ex6Now),
    difference("ex6.err_later", ex6Later, ex6Grown),
    difference("ex6.err_nominal", ex6Later, ex6Now),
  ];

  return {
    lesson: "0.5",
    title: "ערך הזמן של כסף",
    note: "Teaching assumptions, not market rates. Money rounded to the agora only at the end of each calculation; table rows round each line.",
    facts,
  };
}
