/**
 * Lesson 4.13 — the four banks: what each bank's public pre-approval form asks.
 * Every number the lesson, its exercises and its video show is declared here as
 * a fact; the page and the video read data/lessons/4-13.json, and
 * checks/independent_check.py recomputes each one (checks/kinds/forms.py,
 * ltv.py, amortization.py, common.py).
 *
 * The forms' own limits (Leumi's 1,500,000 ₪ request ceiling, Hapoalim's "up to
 * 50% of the property's value" for an all-purpose loan, Discount's 30 years at
 * 5.5% on its screen) are given facts copied from the team's record of each
 * form (edea-mortgage, context/inputs/*-preapproval-questionnaire.md, read
 * 2026-08-25). Case A's numbers are the course map's (price, equity, the gift,
 * the car loan, the incomes); it gets no track, mix or payment here. Every other
 * person and amount is invented for teaching.
 */
import { annuityPayment } from "../../src/lib/calc/amortization.ts";
import { childrenUnder, householdSize, monthlyFromYearly } from "../../src/lib/calc/forms.ts";
import { maxLoan } from "../../src/lib/calc/ltv.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import Decimal from "decimal.js";
import type { Fact, LessonData } from "../build-data.ts";

const given = (id: string, amount: string): Fact => ({ id, kind: "given", inputs: {}, value: moneyString(amount) });
const givenCount = (id: string, value: number): Fact => ({ id, kind: "given", inputs: {}, value });

const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

const under = (id: string, ages: number[], limitAge: number): Fact => ({
  id,
  kind: "forms_children_under",
  inputs: { ages: ages.join("|"), limit_age: limitAge },
  value: childrenUnder(ages, limitAge),
});

const household = (id: string, adults: number, ages: number[]): Fact => ({
  id,
  kind: "forms_household_size",
  inputs: { adults, ages: ages.join("|") },
  value: householdSize(adults, ages),
});

const monthly = (id: string, yearly: string): Fact => ({
  id,
  kind: "forms_monthly_from_yearly",
  inputs: { yearly },
  value: moneyString(monthlyFromYearly(yearly)),
});

const ceilingLoan = (id: string, value: string, ceiling: string): Fact => ({
  id,
  kind: "ltv_max_loan",
  inputs: { value, ceiling },
  value: moneyString(maxLoan(value, ceiling)),
});

const payment = (id: string, principal: string, rate: string, months: number): Fact => ({
  id,
  kind: "amort_payment",
  inputs: { principal, rate_percent: rate, months },
  value: moneyString(annuityPayment(principal, rate, months)),
});

export default function lesson(): LessonData {
  // The prediction: one family, children aged 4, 19 and 20.
  const predAges = [4, 19, 20];

  // Case A, as the course map gives it.
  const price = given("caseA.price", "2200000");
  const equity = given("caseA.equity", "560000");
  const loan = difference("caseA.loan", price, equity);
  const gift = given("caseA.gift", "200000");
  const own = difference("caseA.own_savings", equity, gift);
  const leumiMax = given("leumi.max_request", "1500000");
  const overLeumi = difference("caseA.over_leumi", loan, leumiMax);

  // The half-worked example: two parents, children aged 2, 16, 19 and 20, all at home.
  const halfAges = [2, 16, 19, 20];

  // The explanation's example (shown in the page and the video): a yearly net income of 210,000 ₪.
  const explainYearly = given("explain.yearly", "210000");
  // Exercise 3: another self-employed borrower, so the answer is not on the page above it.
  const yearly = given("ex3.yearly", "186000");
  // Exercise 5: Discount's on-screen payment, 30 years at 5.5%, for 1,000,000 ₪.
  const interestYear = given("ex5.interest_year", "55000");

  return {
    lesson: "4.13",
    title: "ארבעת הבנקים",
    note: "Forms as recorded on 2026-08-25 (edea-mortgage context/inputs). Case A: map numbers only. Everything else is invented for teaching.",
    facts: [
      givenCount("pred.children", predAges.length),
      under("pred.leumi", predAges, 18),
      under("pred.poalim", predAges, 21),

      price,
      equity,
      loan,
      gift,
      own,
      given("caseA.income_1", "12400"),
      given("caseA.income_2", "9300"),
      given("caseA.car_payment", "1450"),
      givenCount("caseA.car_months", 26),
      leumiMax,
      overLeumi,

      under("half.leumi", halfAges, 18),
      under("half.mizrahi", halfAges, 18),
      under("half.poalim", halfAges, 21),
      household("half.discount", 2, halfAges),

      explainYearly,
      monthly("explain.monthly", "210000"),
      yearly,
      monthly("ex3.answer", "186000"),
      { id: "ex3.err_two_years", kind: "forms_monthly_from_yearly", inputs: { yearly: "93000" }, value: moneyString(monthlyFromYearly("93000")) },

      given("ex4.value", "1800000"),
      ceilingLoan("ex4.answer", "1800000", "50"),
      ceilingLoan("ex4.err_70", "1800000", "70"),
      ceilingLoan("ex4.err_75", "1800000", "75"),

      given("ex5.loan", "1000000"),
      payment("ex5.answer", "1000000", "5.5", 360),
      payment("ex5.err_25y", "1000000", "5.5", 300),
      interestYear,
      monthly("ex5.err_interest_only", "55000"),
    ],
  };
}
