/**
 * Lesson 3.10 — the value today of a whole schedule, and the internal rate of
 * return (IRR): the one monthly rate at which the payments are worth exactly
 * what the borrower received. Every number the lesson, its exercises and its
 * illustration's guided tasks show is declared here as a fact; the page reads
 * data/lessons/3-10.json, and checks/independent_check.py recomputes every
 * fact (checks/kinds/metrics.py finds each IRR by Newton's method; the
 * TypeScript uses bisection).
 *
 * Inputs are teaching numbers, not market rates or a bank's fees.
 */
import type { Track } from "../../src/lib/calc/metrics.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { bisection, difference, effective, first, given, irr, irrEffective, irrX12, pv, pvRows, share, total, x12 } from "./lesson-3-8.ts";

export default function lesson310(): LessonData {
  // ── The explanation: 30,000 ₪ at 6% a year (0.5% a month), three months. ──
  const small: Track = { principal: "30000", rates: ["6"], months: 3 };
  const smallLoan = given("explain.loan", "30000.00");
  const smallFee = given("explain.fee", "300.00");
  const smallTotal = total("explain.total", [small]);
  const big: Track = { principal: "600000", rates: ["4.8"], months: 240 };
  const bigEp: Track = { ...big, method: "equal_principal" };

  const sliderFee = given("slider.fee_big", "6000.00");

  // ── Worked example: 600,000 ₪ at 4.8%, 20 years, and a fee of 360 ₪ taken on the day of payout. ──
  const wLoan = given("worked.loan", "600000.00");
  const wFee = given("worked.fee", "360.00");

  // ── Half-worked: 9,000 ₪ at 12% (1% a month), three months, a fee of 90 ₪; try 1.5% a month. ──
  const half: Track = { principal: "9000", rates: ["12"], months: 3 };
  const hLoan = given("half.loan", "9000.00");
  const hFee = given("half.fee", "90.00");

  // ── Exercises. ──
  const x2: Track = { principal: "18000", rates: ["4.8"], months: 6 };
  const x5: Track = { principal: "12000", rates: ["6"], months: 12 };
  const x4Loan = given("ex4.loan", "50000.00");
  const x4Fee = given("ex4.fee", "500.00");
  const x5Loan = given("ex5.loan", "12000.00");
  const x5Fee = given("ex5.fee", "120.00");
  const x6Short: Track = { principal: "30000", rates: ["4.8"], months: 3 };

  const facts: Fact[] = [
    // Prediction: 30,000 ₪ received as 29,700 ₪ (a 300 ₪ fee), the same three payments.
    smallLoan,
    smallFee,
    difference("explain.received", smallLoan, smallFee),
    share("explain.fee_share", smallFee, smallLoan, 2),
    first("explain.payment", [small]),
    smallTotal,
    difference("explain.total_interest", smallTotal, smallLoan),
    pvRows("explain.rows_05", [small], "0.5", 6),
    pv("explain.pv_05", [small], "0.5", "monthly"),
    pv("explain.pv_04", [small], "0.4", "monthly"),
    pv("explain.pv_06", [small], "0.6", "monthly"),
    bisection("explain.search", [small], "29700", "0.5", "2", 6, 6),
    irr("explain.irr", [small], "29700", 4),
    irr("explain.irr_6", [small], "29700", 6),
    irrX12("explain.irr_x12", [small], "29700", 2),
    irrEffective("explain.irr_eff", [small], "29700", 2),
    pv("explain.pv_check", [small], "1.0076", "monthly"),

    // From monthly to yearly: 0.4% a month.
    x12("explain.x12_04", "0.4", 2),
    effective("explain.eff_04", "0.4", 3),
    irr("explain.big_irr", [big], "600000", 4),
    irrEffective("explain.big_eff", [big], "600000", 3),

    // The illustration's guided tasks (OneRateSearch.vue, default 600,000 ₪, 4.8%, 20 years).
    irrX12("slider.x12_fee0", [big], "600000", 2),
    irrEffective("slider.eff_fee0", [big], "600000", 2),
    sliderFee,
    share("slider.fee_share", sliderFee, given("slider.loan", "600000.00"), 2),
    given("slider.loan", "600000.00"),
    irrX12("slider.x12_fee6000", [big], "594000", 2),
    irrEffective("slider.eff_fee6000", [big], "594000", 2),
    irrX12("slider.x12_ep", [bigEp], "600000", 2),
    first("slider.ep_first", [bigEp]),
    first("slider.sp_first", [big]),

    // Worked example.
    wLoan,
    wFee,
    difference("worked.received", wLoan, wFee),
    first("worked.payment", [big]),
    pv("worked.pv_own", [big], "4.8"),
    irr("worked.irr", [big], "599640", 6),
    irrX12("worked.irr_x12", [big], "599640", 4),
    irrEffective("worked.irr_eff", [big], "599640", 4),
    irrEffective("worked.eff_no_fee", [big], "600000", 4),
    irrX12("worked.x12_no_fee", [big], "600000", 4),

    // Half-worked.
    hLoan,
    hFee,
    difference("half.received", hLoan, hFee),
    first("half.payment", [half]),
    pvRows("half.rows", [half], "1.5", 6),
    pv("half.pv", [half], "1.5", "monthly"),
    irr("half.irr", [half], "8910", 2),

    // Exercises.
    given("ex2.loan", "18000.00"),
    first("ex2.payment", [x2]),
    pv("ex2.answer", [x2], "0.4", "monthly"),
    total("ex2.err_total", [x2]),
    effective("ex3.answer", "0.45", 2),
    x12("ex3.err_x12", "0.45", 2),
    x4Loan,
    x4Fee,
    difference("ex4.received", x4Loan, x4Fee),
    pv("ex4.pv_05", [{ principal: "50000", rates: ["6"], months: 24 }], "0.5", "monthly"),
    x5Loan,
    x5Fee,
    difference("ex5.received", x5Loan, x5Fee),
    share("ex5.fee_share", x5Fee, x5Loan, 2),
    first("ex5.payment", [x5]),
    irrX12("ex5.answer", [x5], "11880", 2),
    irrEffective("ex5.err_effective", [x5], "11880", 2),
    irr("ex5.err_monthly", [x5], "11880", 2),
    irrX12("ex6.long", [big], "599640", 4),
    irrX12("ex6.short", [x6Short], "29640", 2),
    given("ex6.fee", "360.00"),
  ];

  return {
    lesson: "3.10",
    title: "ערך נוכחי ושיעור תשואה פנימי (IRR)",
    note: "Teaching numbers, not market rates or a bank's fees. Monthly rate = annual ÷ 12; exact schedules. The IRR is found by bisection to 10⁻¹² percentage points a month (TypeScript) and by Newton's method (Python), then rounded for display.",
    facts,
  };
}
