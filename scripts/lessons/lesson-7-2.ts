/**
 * Lesson 7.2 — the discounting fee: two formulas, the lower of the two, the
 * published average rate (effective, not nominal), and the reductions for time
 * served. Every number the lesson, its exercises, its illustration's guided tasks
 * and its video show is a fact here; data/lessons/7-2.json is what the page reads,
 * and checks/kinds/earlyrepay.py recomputes each one by its own route.
 *
 * The rules are the team's transcription of the 2002 Banking Order (Brain page
 * 7798786), not verified against the Order. The loan of case C and the two average
 * rates are the team's worked example ("values the team read on 2026-08-02, not
 * verified"); every other loan and rate is invented.
 *
 * About A: the team's page writes it 4.823%, but its present value (694,721.98) is
 * the one A = 4.823049% gives. The fixture uses the value that reproduces the team's
 * table to the agora; "sens." facts show what exactly 4.823% would give.
 */
import type { Fact, LessonData } from "../build-data.ts";
import {
  type Case,
  afterReduction,
  effectiveOf,
  fee,
  minOf,
  monthlyPercent,
  monthsBetween,
  percentOf,
  pvSingle,
  ratioOf,
  totalOf,
} from "./_earlyrepay-facts.ts";
import { difference, given } from "./lesson-3-8.ts";
import { caseC } from "./lesson-7-1.ts";

export default function lesson72(): LessonData {
  const W = caseC;

  // ── The intuition: one payment, a year away. ──
  const oneLoan = given("one.loan", "100000.00");
  const onePayment = given("one.payment", "110000.00");
  const oneRelend = percentOf("one.relend", oneLoan, "105");
  const onePv5 = pvSingle("one.pv5", "110000", "5", 1);
  const onePv12 = pvSingle("one.pv12", "110000", "12", 1);

  // ── Sensitivity: exactly 4.823%. ──
  const exactA: Case = { ...W, avgToday: "4.823" };

  // ── The second case: granted January 2023, an invented grant average of 4.40%, below today's. ──
  const second: Case = { ...W, granted: "2023-01-01", avgGrant: "4.40" };

  // ── Half-worked: an invented loan of 300,000 ₪, 5.0%, 10 years, granted July 2022, repaid 1 August 2026, notice given. ──
  const H: Case = { principal: "300000", rate: "5.0", term: 120, granted: "2022-07-01", repaid: "2026-08-01", avgToday: "4.1", avgGrant: "4.8", noticeOn: "2026-07-01" };

  // ── Exercises ──
  const x2Fee = given("ex2.fee", "25000.00");
  const x6v1 = given("ex6.v1", "30000.00");
  const x6v2 = given("ex6.v2", "18000.00");
  const x6lower = minOf("ex6.lower", [x6v1, x6v2]);
  const x6disc = afterReduction("ex6.disc", x6lower, 20);
  const x6op = fee("ex6.op", W, "operational");
  const x6hi = afterReduction("ex6.err_high_disc", x6v1, 20);
  const x7 = given("ex7.v2", "-2000.00");
  const x7pay = given("ex7.pay", "2000.00");

  const facts: Fact[] = [
    // The small picture: a bullet of 110,000 ₪ in a year, a loan of 100,000 ₪ at 10%.
    oneLoan,
    onePayment,
    oneRelend,
    difference("one.lost", onePayment, oneRelend),
    onePv5,
    difference("one.fee", onePv5, oneLoan),
    onePv12,
    difference("one.gain", oneLoan, onePv12),

    // The worked example (case C), step by step.
    fee("w.paid", W, "paid"),
    fee("w.remaining", W, "remaining"),
    monthsBetween("w.months_served", W.granted, W.repaid),
    fee("w.payment", W, "payment"),
    fee("w.balance", W, "balance"),
    fee("w.bucket", W, "bucket"),
    effectiveOf("w.eff_contract", "5.90", 2),
    monthlyPercent("w.m_contract", "nominal", "5.90", 4),
    monthlyPercent("w.m_today", "effective", W.avgToday, 4),
    monthlyPercent("w.m_grant", "effective", W.avgGrant!, 4),
    monthlyPercent("w.m_mistake", "nominal", W.avgToday, 4),
    fee("w.pv_today", W, "pv_today"),
    fee("w.pv_contract", W, "pv_contract"),
    fee("w.pv_grant", W, "pv_grant"),
    fee("w.v1", W, "v1"),
    fee("w.v2", W, "v2"),
    fee("w.lower", W, "lower"),
    fee("w.binding", W, "binding"),
    difference("w.worth", fee("w.v1", W, "v1"), fee("w.v2", W, "v2")),
    fee("w.reduction", W, "reduction_percent"),
    fee("w.discount", W, "discount"),
    fee("w.op", W, "operational"),
    fee("w.no_notice", W, "no_notice"),
    fee("w.total", W, "total"),
    fee("w.total_v1_only", W, "total_v1_only"),
    difference("w.real_saving", fee("w.total_v1_only", W, "total_v1_only"), fee("w.total", W, "total")),
    ratioOf("w.overstate", fee("w.total_v1_only", W, "total_v1_only"), fee("w.total", W, "total"), 1),

    // The mistake: dividing the published (effective) average by 12.
    fee("w.pv_mistake", W, "pv_today_nominal_mistake"),
    fee("w.v1_mistake", W, "v1_nominal_mistake"),
    difference("w.mistake_gap", fee("w.v1", W, "v1"), fee("w.v1_mistake", W, "v1_nominal_mistake")),

    // Sensitivity to the third decimal of A.
    fee("sens.v1", exactA, "v1"),
    fee("sens.v2", exactA, "v2"),
    difference("sens.gap", fee("sens.v1", exactA, "v1"), fee("w.v1", W, "v1")),

    // The second case: the grant average is below today's.
    fee("c2.paid", second, "paid"),
    fee("c2.v1", second, "v1"),
    fee("c2.v2", second, "v2"),
    fee("c2.binding", second, "binding"),
    fee("c2.sum", second, "sum"),
    fee("c2.total", second, "total"),
    fee("c2.total_v1_only", second, "total_v1_only"),
    fee("c2.reduction", second, "reduction_percent"),

    // Half-worked: the invented loan.
    fee("h.paid", H, "paid"),
    fee("h.remaining", H, "remaining"),
    fee("h.balance", H, "balance"),
    fee("h.bucket", H, "bucket"),
    fee("h.pv_today", H, "pv_today"),
    fee("h.pv_grant", H, "pv_grant"),
    fee("h.v1", H, "v1"),
    fee("h.v2", H, "v2"),
    fee("h.lower", H, "lower"),
    fee("h.reduction", H, "reduction_percent"),
    fee("h.discount", H, "discount"),
    fee("h.op", H, "operational"),
    fee("h.total", H, "total"),

    // Exercises
    x2Fee,
    afterReduction("ex2.answer", x2Fee, 20),
    afterReduction("ex2.err_30", x2Fee, 30),
    percentOf("ex2.err_cut", x2Fee, "20"),
    effectiveOf("ex3.answer", "5.90", 2),
    monthlyPercent("ex3.err_monthly", "nominal", "5.90", 2),
    effectiveOf("ex5.eff", "4.8", 3),
    x6v1,
    x6v2,
    x6lower,
    x6disc,
    x6op,
    totalOf("ex6.answer", [x6disc, x6op]),
    totalOf("ex6.err_high", [x6hi, x6op]),
    totalOf("ex6.err_no_reduction", [x6lower, x6op]),
    x6hi,
    x7,
    x7pay,
  ];

  return {
    lesson: "7.2",
    title: "עמלת ההיוון: שתי נוסחאות, הנמוכה מביניהן, ריבית ממוצעת והפחתות לפי ותק",
    note: "Case C's loan and its two published averages are the team's worked example (A = 4.823049, C = 5.09, effective annual, values read 2026-08-02, not verified; the team's page writes A as 4.823 but its present value matches 4.823049 to the agora); every other loan and rate is invented. Contract rates are nominal (monthly = annual ÷ 12), the averages are effective annual (monthly by the twelfth root). Fees follow the team's transcription of the 2002 Banking Order, not verified. A negative discounting fee is set off against the other fees; the total is floored at zero (our reading). Money is exact and rounded to the agora when shown.",
    facts,
  };
}
