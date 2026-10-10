/**
 * Lesson 2.10 — grace, balloon and bullet: deferring a payment does not lower
 * the cost. Every number the lesson, its exercises and its illustration's
 * guided tasks show is declared here as a fact; checks/kinds/repayment.py
 * recomputes each one (percent_of, simple_balance and difference are checked
 * by their own modules).
 *
 * Inputs are teaching numbers, not market rates. Grace sits inside the term
 * (Mogi decision, Brain 67436545, Q11). Case A (נועם ושירה) is synthetic.
 */
import { compoundBalance, simpleBalance } from "../../src/lib/calc/compound.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import type { Fact, LessonData } from "../build-data.ts";
import {
  difference,
  given,
  percentOfFact,
  repCell,
  repMonthly,
  repMonths,
  repPayment,
  repSchedule,
  repTotalInterest,
  repTotalPaid,
} from "./lesson-2-9.ts";

export default function lesson210(): LessonData {
  // ── The explanation: 100,000 ₪ at 6% a year (0.5% a month), 12 months, 3 of them grace. ──
  const E = ["100000", "6", 12] as const;
  const eNonePaid = repTotalPaid("explain.none_paid", "spitzer", ...E);
  const ePartialPaid = repTotalPaid("explain.partial_paid", "grace_partial", ...E, 3);
  const eFullPaid = repTotalPaid("explain.full_paid", "grace_full", ...E, 3);
  const eNoneInterest = repTotalInterest("explain.none_interest", "spitzer", ...E);
  const ePartialInterest = repTotalInterest("explain.partial_interest", "grace_partial", ...E, 3);
  const eFullInterest = repTotalInterest("explain.full_interest", "grace_full", ...E, 3);
  const eFullClose3 = repCell("explain.full_close_3", "grace_full", ...E, 3, "closing", 3);
  const ePrincipal = given("explain.principal", "100000.00");

  // ── Bullet and balloon: 100,000 ₪ at 6% for 12 months. ──
  const bPartialInterest = repTotalInterest("bullet.partial_interest", "bullet_partial", ...E);
  const bFullInterest = repTotalInterest("bullet.full_interest", "bullet_full", ...E);

  // ── The illustration's defaults: 600,000 ₪, 4.8%, 20 years, 12 months of grace. ──
  const S = ["600000", "4.8", 240] as const;
  const sNoneInterest = repTotalInterest("slider.none_interest", "spitzer", ...S);
  const sPartialInterest = repTotalInterest("slider.partial_interest", "grace_partial", ...S, 12);
  const sFullInterest = repTotalInterest("slider.full_interest", "grace_full", ...S, 12);
  const sNonePaid = repTotalPaid("slider.none_paid", "spitzer", ...S);
  const sPartialPaid = repTotalPaid("slider.partial_paid", "grace_partial", ...S, 12);
  const sFullPaid = repTotalPaid("slider.full_paid", "grace_full", ...S, 12);
  const sFullInterest36 = repTotalInterest("slider.full_interest_36", "grace_full", ...S, 36);

  // ── Worked example, case A: one track of 500,000 ₪ at 4.8% for 25 years, 12 months of grace. ──
  const W = ["500000", "4.8", 300] as const;
  const wNone = repPayment("worked.none_pay", ...W);
  const wGracePay = repCell("worked.grace_pay", "grace_partial", ...W, 1, "payment", 12);
  const wAfter = repCell("worked.after_pay", "grace_partial", ...W, 13, "payment", 12);
  const wFullAfter = repCell("worked.full_after_pay", "grace_full", ...W, 13, "payment", 12);
  const wNoneInterest = repTotalInterest("worked.none_interest", "spitzer", ...W);
  const wPartialInterest = repTotalInterest("worked.partial_interest", "grace_partial", ...W, 12);
  const wFullInterest = repTotalInterest("worked.full_interest", "grace_full", ...W, 12);
  const wFullBalance = repCell("worked.full_balance", "grace_full", ...W, 12, "closing", 12);

  // ── Exercises. ──
  const x3 = repCell("ex3.answer", "grace_full", "200000", "6", 120, 2, "closing", 2);
  const x4Last = repCell("ex4.answer", "bullet_partial", "250000", "4.8", 60, 60, "payment");
  const sFullExtra = difference("slider.full_extra", sFullInterest, sNoneInterest);
  // Exercise 5: with 24 months of grace, how much more each month after full grace than after partial grace.
  const x5Full = repCell("ex5.full_after", "grace_full", ...S, 25, "payment", 24);
  const x5Partial = repCell("ex5.partial_after", "grace_partial", ...S, 25, "payment", 24);
  const s12Full = repCell("slider.full_after", "grace_full", ...S, 13, "payment", 12);
  const s12Partial = repCell("slider.partial_after", "grace_partial", ...S, 13, "payment", 12);
  // Exercise 6: 80,000 ₪ at 4.8% for 24 months, full bullet against partial bullet.
  const B6 = ["80000", "4.8", 24] as const;
  const x6Partial = repTotalInterest("ex6.partial_interest", "bullet_partial", ...B6);
  const x6Full = repTotalInterest("ex6.full_interest", "bullet_full", ...B6);

  const facts: Fact[] = [
    // Explanation.
    ePrincipal,
    repMonthly("explain.monthly", "6"),
    repSchedule("explain.none", "spitzer", ...E),
    repSchedule("explain.partial", "grace_partial", ...E, 3),
    repSchedule("explain.full", "grace_full", ...E, 3),
    repCell("explain.full_int_2", "grace_full", ...E, 2, "interest", 3),
    eFullClose3,
    difference("explain.full_added", eFullClose3, ePrincipal),
    eNonePaid,
    ePartialPaid,
    eFullPaid,
    eNoneInterest,
    ePartialInterest,
    eFullInterest,
    difference("explain.partial_extra", ePartialPaid, eNonePaid),
    difference("explain.full_extra", eFullPaid, eNonePaid),
    difference("explain.full_over_partial", eFullPaid, ePartialPaid),

    // Bullet and balloon.
    repSchedule("bullet.partial", "bullet_partial", ...E),
    repSchedule("bullet.full", "bullet_full", ...E),
    bPartialInterest,
    bFullInterest,
    difference("bullet.gap", bFullInterest, bPartialInterest),
    repCell("bullet.partial_last", "bullet_partial", ...E, 12, "payment"),
    repCell("bullet.full_last", "bullet_full", ...E, 12, "payment"),
    repCell("bullet.monthly_interest", "bullet_partial", ...E, 1, "payment"),
    given("rule.bullet_share_limit", "10"),
    { id: "bullet.formula", kind: "compound_balance", inputs: { principal: "100000", rate_percent: "0.5", periods: 12 }, value: moneyString(compoundBalance("100000", "0.5", 12)) },

    // Illustration.
    repMonths("slider.months", 20),
    repCell("slider.grace_pay", "grace_partial", ...S, 1, "payment", 12),
    repCell("slider.none_pay", "spitzer", ...S, 1, "payment"),
    s12Partial,
    s12Full,
    repCell("slider.full_balance", "grace_full", ...S, 12, "closing", 12),
    sNoneInterest,
    sPartialInterest,
    sFullInterest,
    sNonePaid,
    sPartialPaid,
    sFullPaid,
    difference("slider.partial_extra", sPartialInterest, sNoneInterest),
    sFullExtra,
    sFullInterest36,
    difference("slider.full_extra_36", sFullInterest36, sNoneInterest),

    // Worked example.
    repMonths("worked.months", 25),
    repMonthly("worked.monthly", "4.8"),
    wGracePay,
    wNone,
    difference("worked.relief", wNone, wGracePay),
    wAfter,
    difference("worked.after_gap", wAfter, wNone),
    wNoneInterest,
    wPartialInterest,
    difference("worked.partial_extra", wPartialInterest, wNoneInterest),
    wFullBalance,
    wFullAfter,
    wFullInterest,
    difference("worked.full_extra", wFullInterest, wNoneInterest),

    // Half-worked table: full grace on 50,000 ₪ at 6%; the first three months.
    repSchedule("half.full", "grace_full", "50000", "6", 60, 3),

    // Exercise 2: partial grace on 300,000 ₪ at 4.8%.
    percentOfFact("ex2.answer", "300000", "0.4"),
    percentOfFact("ex2.err_year", "300000", "4.8"),
    given("ex2.zero", "0.00"),
    // Exercise 3: full grace, two months, 200,000 ₪ at 6%.
    x3,
    { id: "ex3.err_simple", kind: "simple_balance", inputs: { principal: "200000", rate_percent: "0.5", periods: 2 }, value: moneyString(simpleBalance("200000", "0.5", 2)) },
    repCell("ex3.one_month", "grace_full", "200000", "6", 120, 1, "closing", 2),
    // Exercise 4: partial bullet, 250,000 ₪ at 4.8% for 5 years.
    x4Last,
    repCell("ex4.monthly", "bullet_partial", "250000", "4.8", 60, 1, "payment"),
    given("ex4.principal", "250000.00"),
    // Exercise 5.
    x5Full,
    x5Partial,
    difference("ex5.answer", x5Full, x5Partial),
    difference("ex5.err_12", s12Full, s12Partial),
    // Exercise 6.
    x6Partial,
    x6Full,
    difference("ex6.answer", x6Full, x6Partial),
    repCell("ex6.monthly", "bullet_partial", ...B6, 1, "payment"),
    repCell("ex6.full_last", "bullet_full", ...B6, 24, "payment"),
    { id: "ex6.formula", kind: "compound_balance", inputs: { principal: "80000", rate_percent: "0.4", periods: 24 }, value: moneyString(compoundBalance("80000", "0.4", 24)) },
  ];

  return {
    lesson: "2.10",
    title: "גרייס, בלון ובולט",
    note: "Teaching numbers, not market rates. Grace inside the term; unpaid interest joins the debt month by month, rounded to the agora.",
    facts,
  };
}
