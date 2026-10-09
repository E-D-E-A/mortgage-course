/**
 * Lesson 0.1 — percent. Every number the lesson, its exercises and its video
 * show is declared here as a fact: what was computed, from which inputs, and
 * the result. The page and the video read data/lessons/0-1.json;
 * checks/independent_check.py recomputes every fact from its inputs
 * (checks/kinds/percent.py).
 *
 * Inputs are teaching assumptions — round prices and amounts chosen to be
 * computed in one's head — not real prices or rates.
 */
import Decimal from "decimal.js";
import { moneyString } from "../../src/lib/calc/money.ts";
import {
  addedPercents,
  afterChanges,
  combinedFactor,
  percentAsDecimal,
  percentagePoints,
  percentOf,
  product,
  percentString,
  relativeChangePercent,
  sharePercent,
} from "../../src/lib/calc/percent.ts";
import type { Fact, LessonData } from "../build-data.ts";

const given = (id: string, amount: string): Fact => ({ id, kind: "given", inputs: {}, value: moneyString(amount) });

const part = (id: string, amount: string, rate: string): Fact => ({
  id,
  kind: "percent_of",
  inputs: { amount, rate_percent: rate },
  value: moneyString(percentOf(amount, rate)),
});

/** An amount after one or more changes in a row ("10|-10"), each measured from the amount just before it. */
const after = (id: string, amount: string, changes: string): Fact => ({
  id,
  kind: "after_percent_change",
  inputs: { amount, changes_percent: changes },
  value: moneyString(afterChanges(amount, changes.split("|"))),
});

const share = (id: string, partValue: string, whole: string): Fact => ({
  id,
  kind: "share_percent",
  inputs: { part: partValue, whole },
  value: percentString(sharePercent(partValue, whole)),
});

const change = (id: string, from: string, to: string): Fact => ({
  id,
  kind: "relative_change_percent",
  inputs: { from, to },
  value: percentString(relativeChangePercent(from, to)),
});

const points = (id: string, from: string, to: string): Fact => ({
  id,
  kind: "percentage_point_change",
  inputs: { from_percent: from, to_percent: to },
  value: percentString(percentagePoints(from, to)),
});

const factor = (id: string, changes: string): Fact => ({
  id,
  kind: "combined_factor",
  inputs: { changes_percent: changes },
  value: combinedFactor(changes.split("|")).toFixed(),
});

const added = (id: string, changes: string): Fact => ({
  id,
  kind: "added_percents",
  inputs: { changes_percent: changes },
  value: percentString(addedPercents(changes.split("|"))),
});

const decimal = (id: string, rate: string): Fact => ({
  id,
  kind: "percent_decimal",
  inputs: { rate_percent: rate },
  value: percentAsDecimal(rate).toFixed(),
});

const times = (id: string, a: string, b: string): Fact => ({
  id,
  kind: "plain_product",
  inputs: { a, b },
  value: percentString(product(a, b)),
});

/** dividend ÷ divisor, both facts, as a plain number to two decimals. */
const ratio = (id: string, dividend: Fact, divisor: Fact): Fact => ({
  id,
  kind: "percent_quotient",
  inputs: { dividend: dividend.id, divisor: divisor.id },
  value: percentString(new Decimal(dividend.value as string).div(divisor.value as string)),
});

const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  // Both sides are already exact agorot strings, so their Decimal difference is exact.
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

const rows = (id: string, amounts: string[], rates: string[]): Fact => ({
  id,
  kind: "percent_rows",
  inputs: { amounts: amounts.join("|"), rates_percent: rates.join("|") },
  value: amounts.map((a, i) => ({
    amount: moneyString(a),
    rate_percent: percentString(rates[i]),
    one_percent: moneyString(percentOf(a, "1")),
    result: moneyString(percentOf(a, rates[i])),
  })),
});

/** A fact's value as an input to the next calculation (agorot strings like "220.00"). */
const v = (f: Fact) => f.value as string;

export default function lesson01(): LessonData {
  // Prediction: 200 ₪, up 10%, then down 10%.
  const predStart = given("pred.start", "200");
  const predUp = after("pred.up", "200", "10");
  const predAfter = after("pred.after", "200", "10|-10");
  const predLost = difference("pred.lost", predStart, predAfter);

  // Explanation: price from 200 to 230.
  const priceOld = given("explain.price_old", "200");
  const priceNew = given("explain.price_new", "230");
  const priceRise = difference("explain.price_rise", priceNew, priceOld);
  const explainPart30 = given("explain.part_30", "30");

  // Percentage points: 4% → 5%, on 10,000 ₪.
  const at4 = part("pp.at_4", "10000", "4");
  const at5 = part("pp.at_5", "10000", "5");
  const ppGap = difference("pp.gap", at5, at4);

  // Worked example: a 600 ₪ coat, 25% off, then 10% off at the till.
  const wPrice = given("worked.price", "600");
  const wAfterFirst = after("worked.after_first", "600", "-25");
  const wFinal = after("worked.final", "600", "-25|-10");
  const wSaved = difference("worked.saved", wPrice, wFinal);

  // Exercise 3: 250 → 300.
  const ex3old = given("ex3.old", "250");
  const ex3new = given("ex3.new", "300");
  const ex3diff = difference("ex3.diff", ex3new, ex3old);

  // Exercise 4: a 3% charge on 8,000 ₪ rises to 4%.
  const ex4old = part("ex4.at_3", "8000", "3");
  const ex4new = part("ex4.at_4", "8000", "4");

  // Exercise 5: 8% → 6%.
  const ex5points = points("ex5.points_between", "6", "8");

  // Exercise 6: 500 → 400 and back.
  const ex6high = given("ex6.high", "500");
  const ex6low = given("ex6.low", "400");
  const ex6diff = difference("ex6.diff", ex6high, ex6low);

  // Exercise 7: 1,000 ₪, 30% off then 20% off.
  const ex7price = given("ex7.price", "1000");
  const ex7afterFirst = after("ex7.after_first", "1000", "-30");
  const ex7final = after("ex7.final", "1000", "-30|-20");
  const ex7saved = difference("ex7.saved", ex7price, ex7final);

  const facts: Fact[] = [
    // Prediction and its reveal
    predStart,
    predUp,
    predAfter,
    predLost,
    after("pred.down_then_up", "200", "-10|10"),
    after("pred.down", "200", "-10"),
    part("pred.down_rise", moneyString(afterChanges("200", ["-10"])), "10"),
    part("pred.rise", "200", "10"),
    part("pred.drop", v(predUp), "10"),
    share("pred.total_fall", v(predLost), "200"),
    factor("pred.factor", "10|-10"),

    // The explanation: what a percent is, of 200 and of 5,000
    part("explain.one_of_100", "100", "1"),
    part("explain.one_of_200", "200", "1"),
    part("explain.three_of_200", "200", "3"),
    part("explain.one_of_5000", "5000", "1"),
    part("explain.three_of_5000", "5000", "3"),
    part("explain.half_of_200", "200", "50"),
    share("explain.share_30_of_200", "30", "200"),
    // 30 out of 200, one step at a time: 30 ÷ 200 = 0.15, then × 100
    explainPart30,
    ratio("explain.fraction_30_of_200", explainPart30, priceOld),
    // Percent as a decimal: divide by 100
    decimal("explain.decimal_10", "10"),
    decimal("explain.decimal_5", "5"),
    decimal("explain.decimal_3", "3"),
    decimal("explain.decimal_2_5", "2.5"),

    // Change in percent
    priceOld,
    priceNew,
    priceRise,
    change("explain.price_change", "200", "230"),
    factor("explain.factor_up_10", "10"),
    factor("explain.factor_down_10", "-10"),

    // Percentage points vs percent
    points("pp.points", "4", "5"),
    change("pp.relative", "4", "5"),
    at4,
    at5,
    ppGap,
    share("pp.gap_of_400", v(ppGap), v(at4)),
    share("pp.gap_of_10000", v(ppGap), "10000"),
    // 5% → 4%: one point out of 5 (and the mistake in exercise 2: measuring 4 → 5 from 5)
    share("pp.one_of_five", "1", "5"),
    // "1% of 4%" — the tiny change the ambiguous sentence could mean
    after("pp.one_percent_of_4", "4", "1"),

    // Tools for the head: 3,600 ₪
    part("head.ten", "3600", "10"),
    part("head.one", "3600", "1"),
    part("head.five", "3600", "5"),
    part("head.fifty", "3600", "50"),
    part("head.twenty_five", "3600", "25"),

    // The video: 100 squares
    part("video.square_220", v(predUp), "1"),

    // Worked example
    wPrice,
    part("worked.first_off", "600", "25"),
    wAfterFirst,
    part("worked.second_off", v(wAfterFirst), "10"),
    wFinal,
    wSaved,
    share("worked.saved_share", v(wSaved), "600"),
    added("worked.added", "25|10"),
    factor("worked.factor_first", "-25"),
    factor("worked.factor", "-25|-10"),

    // Half-worked table
    rows("half.table", ["5000", "800", "12000", "64"], ["3", "15", "2.5", "25"]),

    // Exercise 1: 3% of 400
    part("ex1.answer", "400", "3"),
    part("ex1.one", "400", "1"),
    part("ex1.err_thirty", "400", "30"),
    after("ex1.err_total", "400", "3"),
    times("ex1.err_no_hundred", "400", "3"),


    // Exercise 3: 250 → 300
    ex3old,
    ex3new,
    ex3diff,
    change("ex3.answer", "250", "300"),
    share("ex3.err_new_base", v(ex3diff), "300"),
    share("ex3.err_ratio", "300", "250"),
    share("ex3.err_upside_down", "250", "300"),

    // Exercise 4: 3% → 4% of 8,000
    ex4old,
    ex4new,
    difference("ex4.answer", ex4new, ex4old),
    points("ex4.points", "3", "4"),
    change("ex4.relative", "3", "4"),

    // Exercise 5: 8% → 6%
    ex5points,
    share("ex5.answer", v(ex5points), "8"),
    share("ex5.err_new_base", v(ex5points), "6"),
    change("ex5.signed", "8", "6"),
    share("ex5.err_remaining", "6", "8"),

    // Exercise 6: back up from 400 to 500
    ex6high,
    ex6low,
    ex6diff,
    share("ex6.fall", v(ex6diff), "500"),
    change("ex6.answer", "400", "500"),
    share("ex6.err_ratio", "500", "400"),
    share("ex6.err_remaining", "400", "500"),

    // Exercise 7: two discounts
    ex7price,
    part("ex7.first_off", "1000", "30"),
    ex7afterFirst,
    part("ex7.second_off", v(ex7afterFirst), "20"),
    ex7final,
    ex7saved,
    share("ex7.answer", v(ex7saved), "1000"),
    added("ex7.err_added", "30|20"),
    share("ex7.err_price_share", v(ex7final), "1000"),
  ];

  return {
    lesson: "0.1",
    title: "אחוז: חלק ממאה",
    note: "Teaching assumptions, not real prices. Money rounded to the agora at the end of each calculation; percentages to two decimals.",
    facts,
  };
}
