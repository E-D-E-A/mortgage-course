/**
 * Lesson 4.11 — the factor cards, part two: the deal, the property and the bank.
 * The thirteen other cards (src/data/factor-cards.ts) each carry a numerical
 * example; every number is a fact "card.<id>.<name>" here, computed by
 * src/lib/calc/factors.ts and recomputed by checks/kinds/factors.py.
 *
 * The prediction and exercises on loan terms use a level-payment (שפיצר)
 * assumption: annual rate ÷ 12 (the course's convention), numbers for
 * illustration, not market data and not an offer. Households are invented
 * (ליאור ותמר and the others). Nobody gave the course the size of any
 * price effect, so nothing here prices a factor.
 */
import { cardsFor } from "../../src/data/factor-cards.ts";
import type { LessonData } from "../build-data.ts";
import { FactBag } from "./_factor-facts.ts";

export default function lesson411(): LessonData {
  const b = new FactBag();
  for (const card of cardsFor("4.11")) b.card(card);

  // ── Prediction: 20 years against 30 years on a million shekels at 5% ──
  // (card.term_age.* holds the two payments.)
  b.calc("pred.drop", { op: "minus", a: "card.term_age.pay20", b: "card.term_age.pay30" });
  b.calc("pred.drop_percent", { op: "ratio", a: "pred.drop", b: "card.term_age.pay20", decimals: 2 });
  b.calc("pred.factor", { op: "divide", a: "card.term_age.m30", b: "card.term_age.m20" });
  // The tempting answer: the payment shrinks in proportion to the term (20 ÷ 30).
  b.calc("pred.scaled_total", { op: "times", a: "card.term_age.pay20", b: "card.term_age.m20" });
  b.calc("pred.scaled", { op: "divide", a: "pred.scaled_total", b: "card.term_age.m30" });
  b.given("pred.half_percent", "50");
  b.calc("pred.half", { op: "share", amount: "card.term_age.pay20", percent: "pred.half_percent" });
  // The interest part of the first payment (loan × annual rate ÷ 12): most of it at this rate, not at every rate (3.2).
  b.calc("pred.year_interest", { op: "share", amount: "card.term_age.loan", percent: "card.term_age.rate" });
  b.given("pred.months_in_year", "12");
  b.calc("pred.first_interest", { op: "divide", a: "pred.year_interest", b: "pred.months_in_year", decimals: 2 });

  // ── Worked example: ליאור ותמר, the same loan measured two ways ──
  b.given("w.price", "2400000");
  b.given("w.appraisal", "2300000");
  b.given("w.pct", "70");
  b.calc("w.max_price", { op: "share", amount: "w.price", percent: "w.pct" });
  b.calc("w.max_value", { op: "share", amount: "w.appraisal", percent: "w.pct" });
  b.calc("w.gap", { op: "minus", a: "w.max_price", b: "w.max_value" });
  b.calc("w.equity_price", { op: "minus", a: "w.price", b: "w.max_price" });
  b.calc("w.equity_value", { op: "minus", a: "w.price", b: "w.max_value" });

  // ── Half-worked example: the ceiling by type of deal, price 2,000,000 ──
  b.given("half.price", "1600000");
  for (const [k, pct] of [["single", "75"], ["replacement", "70"], ["investment", "50"]] as const) {
    b.given(`half.${k}.pct`, pct);
    b.calc(`half.${k}.max`, { op: "share", amount: "half.price", percent: `half.${k}.pct` });
    b.calc(`half.${k}.equity`, { op: "minus", a: "half.price", b: `half.${k}.max` });
  }

  // ── Exercises ──
  // 2: the ceiling for an investment property.
  b.given("ex2.price", "1500000");
  b.given("ex2.pct", "50");
  b.given("ex2.pct_single", "75");
  b.calc("ex2.answer", { op: "share", amount: "ex2.price", percent: "ex2.pct" });
  b.calc("ex2.err_single", { op: "share", amount: "ex2.price", percent: "ex2.pct_single" });
  // 3: the ratio against the lower of price and appraisal (the rule of lesson 4.9, unverified).
  b.given("ex3.price", "1200000");
  b.given("ex3.appraisal", "1100000");
  b.given("ex3.loan", "880000");
  b.calc("ex3.answer", { op: "ratio", a: "ex3.loan", b: "ex3.appraisal", decimals: 2 });
  b.calc("ex3.err_price", { op: "ratio", a: "ex3.loan", b: "ex3.price", decimals: 2 });
  // 4 and 7: twenty-five years against thirty, on one loan.
  b.given("ex4.loan", "800000");
  b.given("ex4.rate", "4.5");
  b.given("ex4.m25", "300");
  b.given("ex4.m30", "360");
  b.calc("ex4.pay25", { op: "payment", principal: "ex4.loan", rate: "ex4.rate", months: "ex4.m25" });
  b.calc("ex4.pay30", { op: "payment", principal: "ex4.loan", rate: "ex4.rate", months: "ex4.m30" });
  b.calc("ex4.answer", { op: "minus", a: "ex4.pay25", b: "ex4.pay30" });
  b.calc("ex4.total25", { op: "times", a: "ex4.pay25", b: "ex4.m25" });
  b.calc("ex4.total30", { op: "times", a: "ex4.pay30", b: "ex4.m30" });
  b.calc("ex7.answer", { op: "minus", a: "ex4.total30", b: "ex4.total25" });
  // 5: an offer valid for 24 days.
  b.given("ex5.offered", "2026-12-01");
  b.given("ex5.valid", "24");
  b.given("ex5.valid_30", "30");
  b.given("ex5.valid_31", "31");
  b.calc("ex5.answer", { op: "addDays", date: "ex5.offered", days: "ex5.valid" });
  b.calc("ex5.err_30", { op: "addDays", date: "ex5.offered", days: "ex5.valid_30" });
  b.calc("ex5.err_31", { op: "addDays", date: "ex5.offered", days: "ex5.valid_31" });
  // 6: the fixed third of a mix.
  b.given("ex6.loan", "1500000");
  b.given("ex6.parts", "3");
  b.calc("ex6.answer", { op: "divide", a: "ex6.loan", b: "ex6.parts" });
  b.calc("ex6.err_variable", { op: "minus", a: "ex6.loan", b: "ex6.answer" });

  // How many cards each group of the video holds (counted from the card data).
  const inGroup = (...g: string[]) => String(cardsFor("4.11").filter((c) => g.includes(c.group)).length);
  b.given("grid.deal", inGroup("deal"));
  b.given("grid.mix", inGroup("mix"));
  b.given("grid.bank", inGroup("bank", "bank_market", "process"));

  b.given("data_date", "2026-10-12");

  return {
    lesson: "4.11",
    title: "כרטיסי הגורמים, ב׳: העסקה, הנכס והבנק",
    note: "Factor-card examples are facts card.<id>.<name>; loans and households are invented teaching numbers (level payment, annual rate ÷ 12).",
    facts: b.facts,
  };
}
