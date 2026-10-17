/**
 * Lesson 4.12 — how a bank prices. The tower of a bank's rate is a structure,
 * not a price list: nobody has given the course the size of any layer, so the
 * layers' sizes below are the course's teaching numbers, shown as such. The
 * only figures a source gave are the spread numbers of a banker (a field banker,
 * 2026-08-05: a clerk opens at 0.7–0.8 where 0.5 is allowed; FK-H-071, field
 * knowledge awaiting Eylon, a single source, units not stated). The lesson reads
 * them as percentage points of spread, labels that as an assumption, and asks
 * what a gap of that size does to a payment — an arithmetic fact, not a price.
 *
 * Rates and terms are illustration, annual rate ÷ 12 with level payments (the
 * course's convention); every household is invented.
 */
import type { LessonData } from "../build-data.ts";
import { FactBag } from "./_factor-facts.ts";

export default function lesson412(): LessonData {
  const b = new FactBag();

  // ── The tower: teaching sizes, in percentage points ──
  b.given("tower.anchor", "4");
  const layers = [
    ["cost", "0.15"],
    ["risk", "0.3"],
    ["capital", "0.2"],
    ["competition", "-0.1"],
    ["value", "-0.05"],
    ["appetite", "0.1"],
  ] as const;
  for (const [k, v] of layers) b.given(`tower.${k}`, v);
  const parts = layers.map(([k]) => `tower.${k}`);
  b.towerSpread("tower.spread", parts);
  b.towerRate("tower.rate", "tower.anchor", parts);

  // ── Prediction: a clerk opens at 0.8 where 0.5 is allowed, on a million for 25 years ──
  b.given("pred.loan", "1000000");
  b.given("pred.anchor", "4");
  b.given("pred.allowed", "0.5");
  b.given("pred.opened", "0.8");
  // The field banker said "0.7–0.8"; the lesson computes with the top of the range and says so.
  b.given("pred.opened_low", "0.7");
  b.given("pred.months", "300");
  b.calc("pred.gap", { op: "minus", a: "pred.opened", b: "pred.allowed" });
  b.calc("pred.rate_low", { op: "sum", of: ["pred.anchor", "pred.allowed"] });
  b.calc("pred.rate_high", { op: "sum", of: ["pred.anchor", "pred.opened"] });
  b.calc("pred.pay_low", { op: "payment", principal: "pred.loan", rate: "pred.rate_low", months: "pred.months" });
  b.calc("pred.pay_high", { op: "payment", principal: "pred.loan", rate: "pred.rate_high", months: "pred.months" });
  b.calc("pred.month_diff", { op: "minus", a: "pred.pay_high", b: "pred.pay_low" });
  b.calc("pred.total_diff", { op: "times", a: "pred.month_diff", b: "pred.months" });
  // The tempting answers: one year of the gap on the opening balance, and that times the term.
  b.calc("pred.year_one", { op: "share", amount: "pred.loan", percent: "pred.gap" });
  b.given("pred.years", "25");
  b.calc("pred.naive_term", { op: "times", a: "pred.year_one", b: "pred.years" });

  // ── Worked example: 800,000 for 20 years, anchor 3.5, spreads 0.4 and 0.7 ──
  b.given("w.loan", "800000");
  b.given("w.anchor", "3.5");
  b.given("w.months", "240");
  b.given("w.spread_low", "0.4");
  b.given("w.spread_high", "0.7");
  b.calc("w.rate_low", { op: "sum", of: ["w.anchor", "w.spread_low"] });
  b.calc("w.rate_high", { op: "sum", of: ["w.anchor", "w.spread_high"] });
  b.calc("w.pay_low", { op: "payment", principal: "w.loan", rate: "w.rate_low", months: "w.months" });
  b.calc("w.pay_high", { op: "payment", principal: "w.loan", rate: "w.rate_high", months: "w.months" });
  b.calc("w.month_diff", { op: "minus", a: "w.pay_high", b: "w.pay_low" });
  b.calc("w.total_diff", { op: "times", a: "w.month_diff", b: "w.months" });
  b.calc("w.gap", { op: "minus", a: "w.spread_high", b: "w.spread_low" });

  // ── Half-worked example: the same loan at three spreads ──
  for (const [k, s] of [["low", "0.4"], ["mid", "0.7"], ["high", "1"]] as const) {
    b.given(`half.${k}.spread`, s);
    b.calc(`half.${k}.rate`, { op: "sum", of: ["w.anchor", `half.${k}.spread`] });
    b.calc(`half.${k}.payment`, { op: "payment", principal: "w.loan", rate: `half.${k}.rate`, months: "w.months" });
  }
  b.calc("half.low.extra", { op: "minus", a: "half.low.payment", b: "half.low.payment" });
  b.calc("half.mid.extra", { op: "minus", a: "half.mid.payment", b: "half.low.payment" });
  b.calc("half.high.extra", { op: "minus", a: "half.high.payment", b: "half.low.payment" });

  // ── Exercises ──
  // 2: the rate is the anchor plus the spread.
  b.given("ex2.anchor", "3.8");
  b.given("ex2.spread", "0.55");
  b.calc("ex2.answer", { op: "sum", of: ["ex2.anchor", "ex2.spread"] });
  b.calc("ex2.err_minus", { op: "minus", a: "ex2.anchor", b: "ex2.spread" });
  // 4 and 7: 600,000 for 30 years at anchor 4.2, spread 0.5 against 0.8.
  b.given("ex4.loan", "600000");
  b.given("ex4.anchor", "4.2");
  b.given("ex4.months", "360");
  b.given("ex4.low", "0.5");
  b.given("ex4.high", "0.8");
  b.calc("ex4.rate_low", { op: "sum", of: ["ex4.anchor", "ex4.low"] });
  b.calc("ex4.rate_high", { op: "sum", of: ["ex4.anchor", "ex4.high"] });
  b.calc("ex4.pay_low", { op: "payment", principal: "ex4.loan", rate: "ex4.rate_low", months: "ex4.months" });
  b.calc("ex4.pay_high", { op: "payment", principal: "ex4.loan", rate: "ex4.rate_high", months: "ex4.months" });
  b.calc("ex4.answer", { op: "minus", a: "ex4.pay_high", b: "ex4.pay_low" });
  b.calc("ex7.answer", { op: "times", a: "ex4.answer", b: "ex4.months" });
  b.calc("ex4.gap", { op: "minus", a: "ex4.high", b: "ex4.low" });
  b.calc("ex7.err_year", { op: "share", amount: "ex4.loan", percent: "ex4.gap" });
  // The rule of thumb: what the worked example's gap costs a month, per hundred thousand borrowed.
  b.given("thumb.unit", "100000");
  b.calc("thumb.pay_low", { op: "payment", principal: "thumb.unit", rate: "w.rate_low", months: "w.months" });
  b.calc("thumb.pay_high", { op: "payment", principal: "thumb.unit", rate: "w.rate_high", months: "w.months" });
  b.calc("thumb.answer", { op: "minus", a: "thumb.pay_high", b: "thumb.pay_low" });
  b.calc("thumb.times", { op: "divide", a: "w.loan", b: "thumb.unit" });
  // 5: the same question on other numbers (so the rule of thumb does not print its answer):
  // 100,000 for 20 years, anchor 3.2, spreads 0.4 and 0.9.
  b.given("ex5.unit", "100000");
  b.given("ex5.anchor", "3.2");
  b.given("ex5.low", "0.4");
  b.given("ex5.high", "0.9");
  b.calc("ex5.rate_low", { op: "sum", of: ["ex5.anchor", "ex5.low"] });
  b.calc("ex5.rate_high", { op: "sum", of: ["ex5.anchor", "ex5.high"] });
  b.calc("ex5.pay_low", { op: "payment", principal: "ex5.unit", rate: "ex5.rate_low", months: "w.months" });
  b.calc("ex5.pay_high", { op: "payment", principal: "ex5.unit", rate: "ex5.rate_high", months: "w.months" });
  b.calc("ex5.answer", { op: "minus", a: "ex5.pay_high", b: "ex5.pay_low" });

  b.given("data_date", "2026-10-12");

  return {
    lesson: "4.12",
    title: "איך בנק מתמחר",
    note: "The tower's layer sizes are teaching numbers (nobody gave the course a size); the clerk's 0.5 and 0.8 are a single banker's figures read as percentage points (assumption). Level payments, annual rate ÷ 12.",
    facts: b.facts,
  };
}
