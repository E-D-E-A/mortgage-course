/**
 * Lesson 8.1 — a variable and a function. General maths (ידע מתמטי כללי), on mortgage examples: a rule that turns inputs into an output.
 * Case numbers: stage 8's synthetic case (src/data/case-s8.ts): a loan of 1,640,000 ₪ and a disposable income of 20,250 ₪.
 * Everything else is a teaching input (rates and terms of the tables). Facts are computed by stats.ts; checks/kinds/stats.py recomputes them.
 */
import { S8_CASE } from "../../src/data/case-s8.ts";
import { loanOfChoice, BASE_CHOICE } from "../../src/data/case-s8.ts";
import { disposableIncome } from "../../src/lib/calc/affordability.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, given } from "./lesson-3-8.ts";
import { percentOf, prod, quot, spitzer } from "./_stats-facts.ts";

export default function lesson81(): LessonData {
  const facts: Fact[] = [];
  const push = (...f: Fact[]) => facts.push(...f);

  // ── The first rule: the first month's interest. 4.8% a year is 0.4% a month (lesson 0.4: ÷ 12). ──
  push(given("rate.year", "4.8"), quot("rate.month_pct", "4.8", "12", 1), given("rate.month", "0.004"));
  for (const [id, loan] of [["a", "100000"], ["b", "200000"], ["c", "750000"], ["d", "1640000"]] as const) {
    push(given(`f.in_${id}`, loan), prod(`f.out_${id}`, loan, "0.004", 0));
  }

  // ── The payment as a function of the loan: 4% a year, 25 years (300 months). ──
  push(spitzer("loan.p1", "1000000", "4", 300), spitzer("loan.p2", "2000000", "4", 300), quot("loan.ratio", spitzer("loan.p2", "2000000", "4", 300).value as string, spitzer("loan.p1", "1000000", "4", 300).value as string, 3));

  // ── The payment as a function of the rate: 1,000,000 ₪, 300 months. ──
  const r3 = spitzer("rate.p3", "1000000", "3", 300);
  const r4 = spitzer("rate.p4", "1000000", "4", 300);
  const r5 = spitzer("rate.p5", "1000000", "5", 300);
  const r6 = spitzer("rate.p6", "1000000", "6", 300);
  push(r3, r4, r5, r6, difference("rate.d34", r4, r3), difference("rate.d45", r5, r4), difference("rate.d56", r6, r5));

  // ── The payment as a function of the term: 1,000,000 ₪ at 4%. ──
  push(spitzer("term.p240", "1000000", "4", 240), spitzer("term.p300", "1000000", "4", 300), spitzer("term.p360", "1000000", "4", 360));

  // ── The chain: a loan, a payment, a ratio. The synthetic case: 1,640,000 ₪ (price − equity), 360 months, 4.40%; disposable income 20,250 ₪. ──
  const income = disposableIncome(S8_CASE.incomes.reduce((s, x) => s + Number(x), 0), [S8_CASE.car]).toString();
  push(given("chain.loan", loanOfChoice(BASE_CHOICE).toString()), given("chain.income", income));
  const pay = spitzer("chain.pay", loanOfChoice(BASE_CHOICE).toString(), "4.40", 360);
  push(pay, percentOf("chain.ratio", pay.value as string, income, 1));
  const pay2 = spitzer("chain.pay_300", loanOfChoice(BASE_CHOICE).toString(), "4.40", 300);
  push(pay2, percentOf("chain.ratio_300", pay2.value as string, income, 1));

  // ── Exercises. ──
  const ex4 = spitzer("ex.pay", "1200000", "4", 300);
  push(given("ex.loan", "1200000"), ex4, percentOf("ex.ratio", ex4.value as string, income, 1));
  push(given("ex.loan_f", "900000"), prod("ex.f_out", "900000", "0.004", 0));

  return { lesson: "8.1", title: "משתנה ופונקציה", note: "General maths on mortgage examples; the numbers are the synthetic case's.", facts };
}
