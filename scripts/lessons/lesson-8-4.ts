/**
 * Lesson 8.4 — probability and expectation. General maths: a die, two dice, and then a TOY on a variable track's reset: a die decides
 * how far the rate moves, each face is a payment (Spitzer, schedule.ts's rule via stats_payment). The die is a toy: in the market there is
 * no die, and the lesson says so (lesson 8.12 teaches when a probability may be attached). Nothing here is a forecast.
 */
import Decimal from "decimal.js";
import { DICE, DIE_RATE_CHANGES } from "../../src/data/s8-datasets.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, given } from "./lesson-3-8.ts";
import { countProduct, lin, expect, factExpect, factProbAbove, percentOf, prob, spitzer } from "./_stats-facts.ts";

export default function lesson84(): LessonData {
  const facts: Fact[] = [];
  const push = (...f: Fact[]) => facts.push(...f);

  // ── One die, two dice. ──
  const die = [1, 2, 3, 4, 5, 6].map((value) => ({ value, count: 1 }));
  const two = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((value, k) => ({ value, count: [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1][k] }));
  push(countProduct("two.cases", [6, 6]), percentOf("one.p", "1", "6", 1), expect("one.exp", die, 1), prob("one.p_ge5", die, 5, 6, 1));
  push(expect("two.exp", two, 1), prob("two.p7", two, 7, 7, 1), prob("two.p_ge10", two, 10, 12, 1), prob("two.p10", two, 10, 10, 1), prob("two.p2", two, 2, 2, 1), percentOf("two.pair", "1", "36", 1));

  // ── The toy: 500,000 ₪ owed, 240 months left, 4.10% a year; the die moves the rate at the reset. ──
  push(given("t.balance", "500000"), given("t.months", "240"), given("t.rate", "4.10"));
  const pays: Fact[] = DIE_RATE_CHANGES.map((c, k) => {
    const rate = new Decimal("4.10").plus(c).toFixed(2);
    push(given(`t.rate${k + 1}`, rate), given(`t.change${k + 1}`, c));
    return spitzer(`t.pay${k + 1}`, "500000", rate, 240);
  });
  push(...pays);
  const now = pays[2]; // the face that changes nothing
  push(factExpect("t.exp_fair", pays, [...DICE.fair]), factExpect("t.exp_low", pays, [...DICE.loadedLow]), factExpect("t.exp_high", pays, [...DICE.loadedHigh]));
  push(difference("t.exp_minus_now", facts.find((f) => f.id === "t.exp_fair") as Fact, now), difference("t.range", pays[5], pays[0]), difference("t.worst_minus_now", pays[5], now));
  push(factProbAbove("t.p_above_fair", pays, [...DICE.fair], now), factProbAbove("t.p_above_low", pays, [...DICE.loadedLow], now), factProbAbove("t.p_above_high", pays, [...DICE.loadedHigh], now));
  push(lin("t.rate_avg", 1, "4.10", "0.25", 2), spitzer("t.pay_avg", "500000", "4.35", 240));
  push(difference("t.shift_part", facts.find((f) => f.id === "t.pay_avg") as Fact, now), difference("t.convex", facts.find((f) => f.id === "t.exp_fair") as Fact, facts.find((f) => f.id === "t.pay_avg") as Fact));
  push(expect("t.rate_exp", DIE_RATE_CHANGES.map((v) => ({ value: v, count: 1 })), 2));

  // ── Exercises. ──
  push(expect("ex.sum_exp", [1, 2, 3, 4].map((value) => ({ value, count: 1 })), 1));
  push(prob("ex.ge8", two, 8, 12, 1));
  return { lesson: "8.4", title: "הסתברות ותוחלת", note: "General maths: dice, then a toy on a variable track's reset (not a forecast).", facts };
}
