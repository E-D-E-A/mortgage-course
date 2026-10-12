/**
 * Lesson 4.5 — three kinds of number: a regulatory limit, a capital threshold
 * and a bank's policy. Every number the lesson, its exercises, its illustration
 * and its video show is declared here as a fact; the page and the video read
 * data/lessons/4-5.json, and checks/kinds/regulation.py (with ltv.py and
 * common.py) recomputes each one.
 *
 * The two directive numbers (50% and 40% payment ratio) and the financing
 * ceilings are the team's transcription of Directive 329 (Brain 7503881,
 * 2026-10-08), not checked against the directive. Every bank-policy number in
 * this lesson is INVENTED for teaching ("בנק א׳"): the course knows of no
 * published bank policy line, and says so. Amounts are invented.
 */
import { LTV_CEILINGS, PTI_CAPITAL_THRESHOLD, PTI_LIMIT } from "../../src/lib/calc/regulation.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { atPercent, difference, given, givenNumber, maxLoan, maxPayment, paymentTable, ratio } from "./regulation-facts.ts";

export default function lesson(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => {
    facts.push(f);
    return f;
  };

  add(givenNumber("pti.limit", PTI_LIMIT));
  add(givenNumber("pti.threshold", PTI_CAPITAL_THRESHOLD));
  add(givenNumber("ceiling.only_home", LTV_CEILINGS.only_home));
  add(givenNumber("ceiling.replacement", LTV_CEILINGS.replacement));
  add(givenNumber("ceiling.investment", LTV_CEILINGS.investment));
  add(givenNumber("half.policy", "30")); // a second bank's line, invented
  add(givenNumber("term.years", "30"));
  add(givenNumber("policy.pti", "35")); // a bank's line, invented
  add(givenNumber("pti.weight", "100")); // the risk weight above the threshold, as transcribed
  // What three public forms accept as the shortest term (the team's questionnaire files; not checked against the live forms).
  add(givenNumber("form.min_a_years", "5")); // one bank's refinance form
  add(givenNumber("form.min_b_years", "4")); // another bank's purchase form
  add(givenNumber("form.min_c_months", "12")); // a third bank's form, per track

  // Prediction: a bank says "Bank of Israel does not allow above 40%", at a ratio of 45%.
  add(given("pred.income", "16000"));
  add(given("pred.payment", "7200"));
  add(ratio("pred.ratio", "7200", "16000"));

  // The ladder: one disposable income, three lines.
  add(given("l.income", "16000"));
  const max50 = add(maxPayment("l.max_50", "16000", PTI_LIMIT));
  const max40 = add(maxPayment("l.max_40", "16000", PTI_CAPITAL_THRESHOLD));
  const maxPol = add(maxPayment("l.max_policy", "16000", "35"));
  add(difference("l.gap_threshold", max40, maxPol));
  add(difference("l.gap_ban", max50, maxPol));
  add(difference("l.gap_ban_threshold", max50, max40));

  // Four payments on that income, one outcome each.
  for (const [k, pay] of [["a", "5000"], ["b", "6000"], ["c", "6800"], ["d", "8400"]] as const) {
    add(given(`c.${k}.payment`, pay));
    add(ratio(`c.${k}.ratio`, pay, "16000"));
  }
  // The exact edge: a payment of exactly 40% and exactly 50%.
  add(given("c.edge40", "6400"));
  add(ratio("c.edge40.ratio", "6400", "16000"));

  // The three layers, in a table: each income, the largest payment at 50%, 40%, and the invented 35%.
  add(paymentTable("table.layers", ["12000", "16000", "20000"], [PTI_LIMIT, PTI_CAPITAL_THRESHOLD, "35"]));
  add(paymentTable("half.table", ["10000", "14000", "18000"], [PTI_LIMIT, PTI_CAPITAL_THRESHOLD, "30"]));

  // The financing ratio, three layers: the ceiling, and an invented bank line below it.
  const fPrice = add(given("f.price", "2000000"));
  const fCeil = add(maxLoan("f.max_loan", "2000000", "only_home"));
  add(givenNumber("f.policy", "65"));
  const fPol = add(atPercent("f.policy_loan", "2000000", "65"));
  const fEqCeil = add(difference("f.equity_ceiling", fPrice, fCeil));
  const fEqPol = add(difference("f.equity_policy", fPrice, fPol));
  add(difference("f.extra_equity", fEqPol, fEqCeil));

  // Exercises.
  add(given("ex2.income", "12000"));
  add(givenNumber("ex2.policy", "30"));
  const e2max50 = add(maxPayment("ex2.max_50", "12000", PTI_LIMIT));
  const e2max40 = add(maxPayment("ex2.max_40", "12000", PTI_CAPITAL_THRESHOLD));
  const e2answer = add(maxPayment("ex2.answer", "12000", "30"));
  add(difference("ex2.gap", e2max50, e2answer));
  add(difference("ex2.gap_threshold", e2max40, e2answer));

  add(given("ex4.payment", "5100"));
  add(ratio("ex4.ratio", "5100", "12000"));

  add(given("ex5.price", "1500000"));
  add(givenNumber("ex5.policy", "60"));
  const e5price = facts.find((x) => x.id === "ex5.price") as Fact;
  const e5ceil = add(maxLoan("ex5.max_loan", "1500000", "only_home"));
  const e5pol = add(atPercent("ex5.policy_loan", "1500000", "60"));
  add(difference("ex5.equity_ceiling", e5price, e5ceil));
  add(difference("ex5.answer", e5price, e5pol));

  return {
    lesson: "4.5",
    title: "שלושה סוגי מספרים",
    note: "The directive numbers are the team's transcription (Brain 7503881), not checked against the directive. Every bank-policy number here is invented for teaching. Amounts invented.",
    facts,
  };
}
