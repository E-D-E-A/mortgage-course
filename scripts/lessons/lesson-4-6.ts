/**
 * Lesson 4.6 — a reasonable living budget: what is left for the family. Every
 * number the lesson, its exercises, its illustration and its video show is
 * declared here as a fact; the page and the video read data/lessons/4-6.json,
 * and checks/kinds/regulation.py (with affordability.py and common.py)
 * recomputes each one.
 *
 * The family and every living-budget figure are INVENTED for teaching: the
 * course has no source for what a "reasonable" living budget is, and says so.
 * The 50% and 40% payment-ratio lines are the team's transcription of
 * Directive 329 (Brain 7503881, 2026-10-08), not checked against it.
 */
import { LTV_CEILINGS, PTI_CAPITAL_THRESHOLD, PTI_LIMIT } from "../../src/lib/calc/regulation.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { budgetMax, difference, disposable, each, given, givenNumber, left, livingTable, maxPayment, ratio, weighted } from "./regulation-facts.ts";

export default function lesson(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => {
    facts.push(f);
    return f;
  };
  void LTV_CEILINGS;

  add(givenNumber("pti.limit", PTI_LIMIT));
  add(givenNumber("pti.threshold", PTI_CAPITAL_THRESHOLD));
  add(givenNumber("months.line", "18"));
  // Where a child stops being counted in the public forms (the team's questionnaire files): two forms at 18, one at 21.
  add(givenNumber("kids.low", "18"));
  add(givenNumber("kids.high", "21"));

  // Small numbers: what is left.
  const e1Net = add(given("e1.net", "10000"));
  add(given("e1.mortgage", "4000"));
  add(given("e1.other", "1000"));
  add(left("e1.left", "10000", ["4000", "1000"]));
  add(difference("e1.before_other", e1Net, facts.find((f) => f.id === "e1.mortgage") as Fact));

  // The same ratio, two households.
  add(given("e2.income", "16000"));
  const e2Pay = add(maxPayment("e2.payment", "16000", PTI_CAPITAL_THRESHOLD));
  add(left("e2.left", "16000", [e2Pay.value as string]));
  add(givenNumber("e2.people_a", "2"));
  add(givenNumber("e2.people_b", "5"));
  const e2Left = facts.find((f) => f.id === "e2.left") as Fact;
  add(each("e2.each_a", e2Left.value as string, 2));
  add(each("e2.each_b", e2Left.value as string, 5));

  // The invented family: four people, one car loan with ten months left.
  const wNet = add(given("w.net", "19000"));
  add(givenNumber("w.people", "4"));
  const wCar = add(given("w.car", "1200"));
  add(givenNumber("w.car_months", "10"));
  const wPay = add(given("w.payment", "6600"));
  add(given("w.budget", "11800"));
  add(disposable("w.disposable", "19000", [{ kind: "loan", monthly: "1200", monthsLeft: 10 }]));
  add(ratio("w.ratio", "6600", "19000"));
  add(maxPayment("w.max_50", "19000", PTI_LIMIT));
  add(maxPayment("w.max_40", "19000", PTI_CAPITAL_THRESHOLD));
  const wLeft = add(left("w.left", "19000", ["6600", "1200"]));
  add(each("w.each", wLeft.value as string, 4));
  const wBudget = facts.find((f) => f.id === "w.budget") as Fact;
  add(difference("w.shortfall", wBudget, wLeft));
  const wMaxBudget = add(budgetMax("w.max_for_budget", "19000", ["1200"], "11800"));
  add(difference("w.over", wPay, wMaxBudget));
  add(left("w.left_after", "19000", ["6600"]));
  add(difference("w.margin_after", facts.find((f) => f.id === "w.left_after") as Fact, wBudget));
  add(difference("w.before_mortgage", wNet, wCar));
  add(givenNumber("w.sixty", "60"));
  add(givenNumber("w.months_over", "24"));
  add(weighted("w.sixty_amount", "19000", "60"));

  // The household table: net, all payments, people.
  add(livingTable("half.table", [["15000", "6000", 3], ["18000", "8000", 4], ["24000", "12000", 3]]));

  // Exercises.
  const x2Net = add(given("ex2.net", "14000"));
  add(given("ex2.mortgage", "5000"));
  add(given("ex2.loans", "1000"));
  add(left("ex2.answer", "14000", ["5000", "1000"]));
  add(difference("ex2.forgot_loans", x2Net, facts.find((f) => f.id === "ex2.mortgage") as Fact));
  add(difference("ex2.forgot_mortgage", x2Net, facts.find((f) => f.id === "ex2.loans") as Fact));

  add(given("ex3.left", "9000"));
  add(givenNumber("ex3.people", "3"));
  add(each("ex3.answer", "9000", 3));
  add(each("ex3.adults_only", "9000", 2));

  add(given("ex4.left", "8000"));
  add(given("ex4.budget", "8600"));
  add(difference("ex4.answer", facts.find((f) => f.id === "ex4.budget") as Fact, facts.find((f) => f.id === "ex4.left") as Fact));

  const x5Net = add(given("ex5.net", "20000"));
  const x5Other = add(given("ex5.other", "1500"));
  const x5Budget = add(given("ex5.budget", "12000"));
  add(budgetMax("ex5.answer", "20000", ["1500"], "12000"));
  add(difference("ex5.forgot_other", x5Net, x5Budget));
  add(difference("ex5.forgot_budget", x5Net, x5Other));

  add(givenNumber("ex5.months", "10"));
  add(given("ex6.income", "20000"));
  add(maxPayment("ex6.max_50", "20000", PTI_LIMIT));
  add(maxPayment("ex6.max_40", "20000", PTI_CAPITAL_THRESHOLD));

  return {
    lesson: "4.6",
    title: "תקציב מחיה סביר",
    note: "The family and every living-budget figure are invented for teaching; the course has no source for a reasonable living budget. 50% and 40% are the team's transcription of Directive 329. Amounts invented.",
    facts,
  };
}
