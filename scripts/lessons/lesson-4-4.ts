/**
 * Lesson 4.4 — Directive 329: the five lines. Every number the lesson, its
 * exercises, its checker and its video show is declared here as a fact; the
 * page and the video read data/lessons/4-4.json, and checks/kinds/regulation.py
 * (with ltv.py and common.py) recomputes each one.
 *
 * The limits are the team's transcription of Directive 329 (Brain 7503881,
 * J-090, updated 2026-10-08), matched by search summaries of the directive;
 * not checked against the directive itself. All amounts are invented teaching
 * numbers; no case of the course appears here.
 */
import Decimal from "decimal.js";
import { moneyString } from "../../src/lib/calc/money.ts";
import { percentString } from "../../src/lib/calc/percent.ts";
import { LTV_CEILINGS, MAX_TERM_YEARS, PTI_CAPITAL_THRESHOLD, PTI_LIMIT, RISK_WEIGHT_ABOVE_THRESHOLD } from "../../src/lib/calc/regulation.ts";
import type { Fact, LessonData } from "../build-data.ts";
import {
  atPercent,
  check,
  difference,
  given,
  givenNumber,
  ltv,
  maxLoan,
  maxPayment,
  maxVar,
  minFix,
  months,
  ratio,
  reducedValue,
  total,
  varShare,
  variableTable,
} from "./regulation-facts.ts";

export default function lesson(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => {
    facts.push(f);
    return f;
  };

  // The numbers of the directive, as transcribed.
  add(givenNumber("ceiling.only_home", LTV_CEILINGS.only_home));
  add(givenNumber("ceiling.replacement", LTV_CEILINGS.replacement));
  add(givenNumber("ceiling.investment", LTV_CEILINGS.investment));
  add(givenNumber("ceiling.any_purpose", LTV_CEILINGS.any_purpose));
  add(givenNumber("pti.limit", PTI_LIMIT));
  add(givenNumber("pti.threshold", PTI_CAPITAL_THRESHOLD));
  add(givenNumber("pti.weight", RISK_WEIGHT_ABOVE_THRESHOLD));
  add(givenNumber("term.years", String(MAX_TERM_YEARS)));
  add(months("term.months", MAX_TERM_YEARS));
  add(givenNumber("history.prime_cap_year", "2020"));

  // Prediction: 60% prime, 40% fixed.
  add(givenNumber("pred.prime", "60"));
  add(givenNumber("pred.fixed", "40"));
  add(givenNumber("pred.half", "50"));

  // Line 1 — the financing ratio, small numbers.
  add(given("e1.value", "1000000"));
  add(maxLoan("e1.max_loan", "1000000", "only_home"));
  add(maxLoan("e1.max_loan_any", "1000000", "any_purpose"));

  // A reduced-price home: measured against the appraisal (no cap reached in this example).
  const rpPrice = add(given("rp.price", "1400000"));
  add(given("rp.appraisal", "1500000"));
  add(reducedValue("rp.value", "1400000", "1500000"));
  const rpMax = add(maxLoan("rp.max_loan", "1500000", "only_home"));
  const rpMaxAtPrice = add(maxLoan("rp.max_loan_at_price", "1400000", "only_home"));
  add(difference("rp.equity", rpPrice, rpMax));
  const rpEqPrice = add(difference("rp.equity_at_price", rpPrice, rpMaxAtPrice));
  add(difference("rp.equity_gap", rpEqPrice, facts.find((x) => x.id === "rp.equity") as Fact));
  const rpEquity = facts.find((x) => x.id === "rp.equity") as Fact;
  add({ id: "rp.equity_share", kind: "ltv_share", inputs: { part: rpEquity.value as string, whole: rpPrice.value as string }, value: percentString(new Decimal(rpEquity.value as string).div(rpPrice.value as string).mul(100)) });

  // Lines 2 and 3 — the payment ratio, small numbers.
  add(given("e2.income", "10000"));
  add(maxPayment("e2.max_50", "10000", PTI_LIMIT));
  add(maxPayment("e2.max_40", "10000", PTI_CAPITAL_THRESHOLD));

  // Line 4 — the variable share.
  add(given("e3.loan", "900000"));
  add(maxVar("e3.max_var", "900000"));
  add(minFix("e3.min_fixed", "900000"));

  // Rounding at a line: a million, two-thirds.
  add(given("r.loan", "1000000"));
  add(maxVar("r.max_var", "1000000"));
  add(minFix("r.min_fixed", "1000000"));
  add({ id: "r.rounded_up", kind: "reg_two_thirds_rounded", inputs: { amount: "1000000" }, value: moneyString(new Decimal("1000000").mul(2).div(3)) });
  add({ id: "r.cut", kind: "reg_two_thirds_cut", inputs: { amount: "1000000" }, value: new Decimal("1000000").mul(2).div(3).toDecimalPlaces(3, Decimal.ROUND_DOWN).toFixed(3) });
  add(atPercent("r.at_6666", "1000000", "66.66"));
  add(atPercent("r.at_6667", "1000000", "66.67"));
  add(givenNumber("r.p6666", "66.66"));
  add(givenNumber("r.p6667", "66.67"));

  // The checker's opening family.
  add(given("ch.value", "1700000"));
  const chLoan = add(given("ch.loan", "1200000"));
  add(given("ch.payment", "7000"));
  add(given("ch.income", "16000"));
  const chVar = add(given("ch.variable", "840000"));
  add(givenNumber("ch.term_years", "30"));
  add(check("ch.check", { deal: "only_home", value: "1700000", loan: "1200000", payment: "7000", income: "16000", variable: "840000", termMonths: 360 }));
  add(ltv("ch.ltv", "1200000", "1700000"));
  add(ratio("ch.ratio", "7000", "16000"));
  add(varShare("ch.var_share", "840000", "1200000"));
  const chMaxVar = add(maxVar("ch.max_var", "1200000"));
  add(difference("ch.var_over", chVar, chMaxVar));
  add(maxPayment("ch.max_40", "16000", PTI_CAPITAL_THRESHOLD));
  add(maxPayment("ch.max_50", "16000", PTI_LIMIT));
  const chMax70 = add(maxLoan("ch.max_loan_70", "1700000", "replacement"));
  add(difference("ch.loan_over_70", chLoan, chMax70));
  add(givenNumber("ch.long_years", "32"));
  add(months("ch.long_months", 32));

  // Worked example: a replacement home.
  add(given("w.value", "2000000"));
  const wLoan = add(given("w.loan", "1450000"));
  const wPay = add(given("w.payment", "8600"));
  add(given("w.income", "20000"));
  const wVar = add(given("w.variable", "1000000"));
  add(ltv("w.ltv", "1450000", "2000000"));
  const wMax = add(maxLoan("w.max_loan", "2000000", "replacement"));
  add(difference("w.loan_over", wLoan, wMax));
  add(ratio("w.ratio", "8600", "20000"));
  add(maxPayment("w.max_50", "20000", PTI_LIMIT));
  const wMax40 = add(maxPayment("w.max_40", "20000", PTI_CAPITAL_THRESHOLD));
  add(difference("w.above_40", wPay, wMax40));
  add(varShare("w.var_share", "1000000", "1450000"));
  const wMaxVar = add(maxVar("w.max_var", "1450000"));
  add(difference("w.var_over", wVar, wMaxVar));
  add(check("w.check", { deal: "replacement", value: "2000000", loan: "1450000", payment: "8600", income: "20000", variable: "1000000", termMonths: 360 }));
  const wMaxVar2 = add(maxVar("w.max_var_after", "1400000"));
  add(difference("w.var_over_after", wVar, wMaxVar2));

  // Half-worked table: the most that may vary, the least that must be fixed.
  add(variableTable("half.table", ["900000", "1050000", "1000000"]));

  // Exercises.
  const ex2Value = add(given("ex2.value", "1600000"));
  const ex2Answer = add(maxLoan("ex2.answer", "1600000", "only_home"));
  add(maxLoan("ex2.at_70", "1600000", "replacement"));
  add(maxLoan("ex2.at_50", "1600000", "investment"));
  add(difference("ex2.equity", ex2Value, ex2Answer));

  add(given("ex3.income", "14500"));
  add(maxPayment("ex3.answer", "14500", PTI_LIMIT));
  add(maxPayment("ex3.at_40", "14500", PTI_CAPITAL_THRESHOLD));
  add(maxPayment("ex3.double", "14500", "200"));

  const ex4Loan = add(given("ex4.loan", "1350000"));
  const ex4Answer = add(maxVar("ex4.answer", "1350000"));
  add(atPercent("ex4.at_6666", "1350000", "66.66"));
  // The fixed third, mistaken for the answer.
  add(difference("ex4.third", ex4Loan, ex4Answer));

  add(givenNumber("ex5.ratio", "46"));

  const ex6Price = add(given("ex6.price", "1200000"));
  add(given("ex6.appraisal", "1300000"));
  const ex6Max = add(maxLoan("ex6.max_loan", "1300000", "only_home"));
  add(difference("ex6.answer", ex6Price, ex6Max));
  const ex6MaxAtPrice = add(maxLoan("ex6.max_loan_at_price", "1200000", "only_home"));
  add(difference("ex6.at_price", ex6Price, ex6MaxAtPrice));
  add(givenNumber("ex6.quarter_pct", "25"));
  add(atPercent("ex6.quarter", "1300000", "25"));

  add(given("ex7.loan", "1500000"));
  const ex7Prime = add(given("ex7.prime", "700000"));
  add(given("ex7.five_years", "350000"));
  add(given("ex7.fixed", "450000"));
  const ex7Changing = add(total("ex7.changing", ["700000", "350000"]));
  const ex7Max = add(maxVar("ex7.max_var", "1500000"));
  add(difference("ex7.answer", ex7Changing, ex7Max));
  const ex7Third = add(minFix("ex7.min_fixed", "1500000"));
  add(difference("ex7.prime_only", ex7Prime, ex7Third));

  return {
    lesson: "4.4",
    title: "הוראה 329",
    note: "Directive 329's limits as the team transcribed them (Brain 7503881, 2026-10-08), not checked against the directive. Amounts invented for teaching.",
    facts,
  };
}
