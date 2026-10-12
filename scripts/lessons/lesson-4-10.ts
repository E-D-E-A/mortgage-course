/**
 * Lesson 4.10 — the factor cards, part one: the client. The nine cards of the
 * client group (src/data/factor-cards.ts) each carry a numerical example, and
 * every number of it is a fact "card.<id>.<name>" here, computed by
 * src/lib/calc/factors.ts and recomputed by checks/kinds/factors.py. The lesson's
 * own prediction, worked example, half-worked table and exercises are facts too.
 *
 * All households are invented (ענת ובועז and the others); no number here is a
 * bank's rule, an offer or market data. Case A and Case B do not appear: the
 * cards are about factors, and the cases return in 4.15.
 */
import { cardsFor } from "../../src/data/factor-cards.ts";
import type { LessonData } from "../build-data.ts";
import { FactBag } from "./_factor-facts.ts";

export default function lesson410(): LessonData {
  const b = new FactBag();
  for (const card of cardsFor("4.10")) b.card(card);

  // ── Prediction: the same numbers as the payment-to-income card ──
  // (card.pti.ratio, card.pti.cap, card.pti.capital are the page's figures.)

  // ── Worked example: ענת ובועז, reading a file through the cards ──
  b.given("w.income", "21000");
  b.given("w.car", "1200");
  b.given("w.car_months", "30");
  b.given("w.small", "500");
  b.given("w.small_months", "10");
  b.calc("w.disposable", { op: "minus", a: "w.income", b: "w.car" });
  b.given("w.payment", "8712");
  b.calc("w.ratio", { op: "ratio", a: "w.payment", b: "w.disposable", decimals: 2 });
  b.given("w.cap", "40");
  b.calc("w.at_cap", { op: "share", amount: "w.disposable", percent: "w.cap" });
  b.calc("w.gap", { op: "minus", a: "w.payment", b: "w.at_cap" });
  b.given("w.ceiling", "50");
  b.calc("w.at_ceiling", { op: "share", amount: "w.disposable", percent: "w.ceiling" });

  // ── Half-worked example: three families ──
  const fam = [
    { k: "a", income: "16000", counted: "1000", payment: "6000" },
    { k: "b", income: "18000", counted: "2000", payment: "7200" },
    { k: "c", income: "24000", counted: "4000", payment: "7000" },
  ];
  for (const f of fam) {
    b.given(`half.${f.k}.income`, f.income);
    b.given(`half.${f.k}.counted`, f.counted);
    b.calc(`half.${f.k}.disposable`, { op: "minus", a: `half.${f.k}.income`, b: `half.${f.k}.counted` });
    b.given(`half.${f.k}.payment`, f.payment);
    b.calc(`half.${f.k}.ratio`, { op: "ratio", a: `half.${f.k}.payment`, b: `half.${f.k}.disposable`, decimals: 2 });
  }

  // ── Exercises ──
  // 2: the ratio, and its inverse as the common mistake.
  b.given("ex2.payment", "7200");
  b.given("ex2.disposable", "18000");
  b.calc("ex2.answer", { op: "ratio", a: "ex2.payment", b: "ex2.disposable", decimals: 2 });
  b.calc("ex2.err_inverse", { op: "ratio", a: "ex2.disposable", b: "ex2.payment", decimals: 2 });
  // 3: the largest payment under the ceiling, and the capital threshold as the mistake.
  b.given("ex3.disposable", "22000");
  b.given("ex3.ceiling", "50");
  b.given("ex3.capital", "40");
  b.calc("ex3.answer", { op: "share", amount: "ex3.disposable", percent: "ex3.ceiling" });
  b.calc("ex3.err_capital", { op: "share", amount: "ex3.disposable", percent: "ex3.capital" });
  // 4: obligations that count.
  b.given("ex4.income", "17500");
  b.given("ex4.car", "1300");
  b.given("ex4.loan", "700");
  b.given("ex4.leasing", "900");
  b.given("ex4.car_months", "28");
  b.given("ex4.loan_months", "12");
  b.given("ex4.leasing_months", "20");
  b.calc("ex4.after_car", { op: "minus", a: "ex4.income", b: "ex4.car" });
  b.calc("ex4.answer", { op: "minus", a: "ex4.after_car", b: "ex4.leasing" });
  b.calc("ex4.err_all", { op: "minus", a: "ex4.answer", b: "ex4.loan" });
  // 5: children under two definitions.
  for (const [i, age] of ["20", "17", "9", "3"].entries()) b.given(`ex5.age_${i + 1}`, age);
  b.given("ex5.limit_a", "18");
  b.given("ex5.limit_b", "21");
  const ages = [1, 2, 3, 4].map((i) => `ex5.age_${i}`);
  b.calc("ex5.count_a", { op: "countUpTo", of: ages, limit: "ex5.limit_a" });
  b.calc("ex5.count_b", { op: "countUpTo", of: ages, limit: "ex5.limit_b" });
  b.calc("ex5.answer", { op: "minus", a: "ex5.count_b", b: "ex5.count_a", decimals: 0 });
  // 7: equity when a gift is not recognised (a hypothetical).
  b.given("ex7.price", "1800000");
  b.given("ex7.equity", "450000");
  b.given("ex7.gift", "150000");
  b.calc("ex7.equity_without", { op: "minus", a: "ex7.equity", b: "ex7.gift" });
  b.calc("ex7.loan_with", { op: "minus", a: "ex7.price", b: "ex7.equity" });
  b.calc("ex7.loan_without", { op: "minus", a: "ex7.price", b: "ex7.equity_without" });
  b.calc("ex7.ltv_with", { op: "ratio", a: "ex7.loan_with", b: "ex7.price", decimals: 2 });
  b.calc("ex7.answer", { op: "ratio", a: "ex7.loan_without", b: "ex7.price", decimals: 2 });
  b.calc("ex7.err_share", { op: "ratio", a: "ex7.equity_without", b: "ex7.price", decimals: 2 });

  // How many open questions each card lists (the video marks the cards that have one). Counted from the card data.
  for (const card of cardsFor("4.10")) b.given(`grid.${card.id}.open`, String(card.thresholds.filter((t) => t.open).length));

  // The date the cards' numbers were checked against the sources.
  b.given("data_date", "2026-10-12");

  return {
    lesson: "4.10",
    title: "כרטיסי הגורמים, א׳: הלקוח",
    note: "Factor-card examples are facts card.<id>.<name>; households are invented teaching numbers.",
    facts: b.facts,
  };
}
