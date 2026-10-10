/**
 * Lesson 3.6 — when the rate is updated: the payment recalculated on the balance
 * left, over the months left (the course's assumption; DEC-3 applies changes
 * "under the track's terms"), and why one formula does not fit every track.
 *
 * Every number the page and its exercises show is a fact here; the page reads
 * data/lessons/3-6.json and checks/kinds/schedule.py (with amortization.py for the
 * stage-2 kinds) recomputes each one. Prime and anchor moves are teaching
 * scenarios, not forecasts. Schedules from src/lib/calc/schedule.ts.
 */
import { moneyString } from "../../src/lib/calc/money.ts";
import { pathInputs, recalculatedPayment, recalculationSteps, resetPoints, scheduleFromInputs } from "../../src/lib/calc/schedule.ts";
import { plainNumber } from "../../src/lib/calc/indexation.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { balance, difference, given, interest, payment, schRow, v } from "./lesson-3-5.ts";

const dec6 = (x: { toDecimalPlaces: (n: number) => { toString: () => string } }) => x.toDecimalPlaces(6).toString();

const recalc = (id: string, bal: string, rate: string, left: number): Fact => ({
  id,
  kind: "sch_recalc_payment",
  inputs: { balance: bal, rate_percent: rate, months_left: left },
  value: moneyString(recalculatedPayment(bal, rate, left)),
});

const monthsLeft = (id: string, months: number, paid: number): Fact => ({
  id,
  kind: "sch_months_left",
  inputs: { months, paid },
  value: String(months - paid),
});

/** The formula's steps for a recalculated payment: r, (1 + r)^−n, 1 − (1 + r)^−n. */
const steps = (prefix: string, rate: string, left: number): Fact[] => {
  const s = recalculationSteps("1", rate, left);
  return [
    { id: `${prefix}.r`, kind: "sch_monthly_decimal", inputs: { rate_percent: rate }, value: dec6(s.r) },
    { id: `${prefix}.base`, kind: "sch_growth_base", inputs: { rate_percent: rate }, value: dec6(s.r.plus(1)) },
    { id: `${prefix}.power`, kind: "sch_power", inputs: { rate_percent: rate, months: left }, value: dec6(s.power) },
    { id: `${prefix}.one_minus`, kind: "sch_one_minus_power", inputs: { rate_percent: rate, months: left }, value: dec6(s.oneMinus) },
  ];
};

export default function lesson36(): LessonData {
  // The explanation: a prime track of 500,000 ₪ for 20 years at 4.8%; from month 37, 6%.
  const P = "500000";
  const N = 240;
  const path = pathInputs({ principal: P, months: N, rate: "4.8", changes: [{ month: 37, rate: "6" }] });
  const c0 = payment("explain.c0", P, "4.8", N);
  const b36 = balance("explain.b36", P, "4.8", N, 36);
  const c37 = schRow("explain.c37", path, 37, "payment");
  const i36old = interest("explain.interest_old", v(b36), "4.8");
  const i36new = interest("explain.top", v(b36), "6");

  // The same loan in equal principal.
  const ep = pathInputs({ principal: P, months: N, rate: "4.8", method: "equal_principal", changes: [{ month: 37, rate: "6" }] });
  const ep36 = schRow("ep.payment_36", ep, 36, "payment");
  const ep37 = schRow("ep.payment_37", ep, 37, "payment");
  const epInterestNew = schRow("ep.interest_37", ep, 37, "interest");
  const epB36 = schRow("ep.balance_36", ep, 36, "closing");
  const epInterestOld = interest("ep.interest_37_old", v(epB36), "4.8");

  // The illustration's tasks: the variable track resets at month 61; prime falls by 1.2 points.
  const variable = pathInputs({ principal: P, months: N, rate: "4.8", changes: [{ month: 61, rate: "6" }] });
  const lower = pathInputs({ principal: P, months: N, rate: "4.8", changes: [{ month: 37, rate: "3.6" }] });

  // Worked example: Galit, a variable unlinked track of 360,000 ₪ for 25 years at 4.2%, reset after 5 years to 4.8%.
  const W = "360000";
  const WN = 300;
  const worked = pathInputs({ principal: W, months: WN, rate: "4.2", changes: [{ month: 61, rate: "4.8" }] });
  const wc0 = payment("worked.c0", W, "4.2", WN);
  const wb60 = balance("worked.b60", W, "4.2", WN, 60);
  const wc61 = schRow("worked.c61", worked, 61, "payment");

  // Half-worked table: a prime track of 400,000 ₪ for 20 years at 5%, prime moves three times.
  const halfPath = pathInputs({
    principal: "400000",
    months: 240,
    rate: "5",
    changes: [
      { month: 13, rate: "5.5" },
      { month: 25, rate: "6" },
      { month: 49, rate: "5.25" },
    ],
  });
  const halfRows = resetPoints(scheduleFromInputs(halfPath)).map((p, k) => ({
    period: k + 1,
    month: p.month,
    balance: moneyString(p.balance),
    left: String(p.monthsLeft),
    rate: plainNumber(p.rate),
    payment: moneyString(p.payment),
  }));

  // Exercise 5: 400,000 ₪ at 4.8% for 20 years; after 24 payments the rate is 5.4%.
  const ex5 = pathInputs({ principal: "400000", months: 240, rate: "4.8", changes: [{ month: 25, rate: "5.4" }] });
  const ex5b = balance("ex5.b24", "400000", "4.8", 240, 24);
  // Exercise 6: 480,000 ₪ in equal principal for 20 years at 4.8%; from month 61, 6%.
  const ex6 = pathInputs({ principal: "480000", months: 240, rate: "4.8", method: "equal_principal", changes: [{ month: 61, rate: "6" }] });
  const ex6flat = pathInputs({ principal: "480000", months: 240, rate: "4.8", method: "equal_principal" });
  const ex6b = schRow("ex6.balance", ex6, 60, "closing");

  const facts: Fact[] = [
    given("case.amount", "500000.00"),

    // Prediction and explanation.
    c0,
    b36,
    monthsLeft("explain.left", N, 36),
    ...steps("explain", "6", 204),
    i36old,
    i36new,
    difference("explain.interest_rise", i36new, i36old),
    c37,
    difference("explain.rise", c37, c0),
    recalc("explain.check", v(b36), "6", 204),
    schRow("explain.end", path, 240, "closing"),
    // Three mistakes.
    payment("wrong.one_formula", P, "6", N),
    payment("wrong.principal_left", P, "6", 204),
    recalc("wrong.full_term", v(b36), "6", N),

    // Equal principal.
    schRow("ep.principal_36", ep, 36, "principal_paid"),
    schRow("ep.principal_37", ep, 37, "principal_paid"),
    epB36,
    ep36,
    ep37,
    epInterestNew,
    epInterestOld,
    difference("ep.jump", epInterestNew, epInterestOld),

    // Illustration tasks.
    schRow("slider.variable_60", variable, 60, "payment"),
    schRow("slider.variable_61", variable, 61, "payment"),
    balance("slider.variable_b60", P, "4.8", N, 60),
    schRow("slider.lower_37", lower, 37, "payment"),
    schRow("slider.balance_120_up", path, 120, "closing"),
    balance("slider.balance_120_flat", P, "4.8", N, 120),

    // Worked example.
    given("worked.amount", "360000.00"),
    wc0,
    wb60,
    monthsLeft("worked.left", WN, 60),
    ...steps("worked", "4.8", 240),
    interest("worked.top", v(wb60), "4.8"),
    wc61,
    difference("worked.rise", wc61, wc0),

    // Half-worked table.
    { id: "half.table", kind: "sch_reset_table", inputs: halfPath, value: halfRows },

    // Exercise 3: months left after 7 years of a 25-year loan.
    monthsLeft("ex3.answer", 300, 84),
    difference("ex3.years_as_months", given("ex3.n", "300"), given("ex3.y", "7")),
    difference("ex3.years_left", given("ex3.t", "25"), given("ex3.y2", "7")),
    given("ex3.n", "300"),
    given("ex3.y", "7"),
    given("ex3.t", "25"),
    given("ex3.y2", "7"),
    // Exercise 4: 300,000 ₪ left, 180 months, the rate rises from 5% to 6%.
    recalc("ex4.answer", "300000", "6", 180),
    ...steps("ex4", "6", 180),
    recalc("ex4.old_rate", "300000", "5", 180),
    recalc("ex4.full_term", "300000", "6", 240),
    // Exercise 5.
    ex5b,
    monthsLeft("ex5.left", 240, 24),
    ...steps("ex5", "5.4", 216),
    schRow("ex5.answer", ex5, 25, "payment"),
    payment("ex5.one_formula", "400000", "5.4", 240),
    payment("ex5.principal_left", "400000", "5.4", 216),
    recalc("ex5.full_term", v(ex5b), "5.4", 240),
    // Exercise 6.
    schRow("ex6.answer", ex6, 61, "payment"),
    schRow("ex6.old_rate", ex6flat, 61, "payment"),
    ex6b,
    schRow("ex6.principal", ex6, 61, "principal_paid"),
    schRow("ex6.interest", ex6, 61, "interest"),
    recalc("ex6.spitzer", v(ex6b), "6", 180),
  ];

  return {
    lesson: "3.6",
    title: "כשהריבית מתעדכנת",
    note: "Teaching numbers: loans, rates and the moves of prime and the anchor are illustrations, not forecasts. On a rate change the payment is recalculated on the balance left over the months left (the course's assumption; check the contract). Schedules from src/lib/calc/schedule.ts.",
    facts,
  };
}
