/**
 * Lesson 7.3 — exit points and timing: the reset day of a variable track, the notice
 * window of 10 to 45 days, the 16th of the month for the index fee, and the fee over
 * time (the steps of the reductions for time served). Every number the lesson, its
 * exercises, its illustration's guided tasks and its video show is a fact here;
 * data/lessons/7-3.json is what the page reads, and checks/kinds/earlyrepay.py
 * recomputes each one by its own route.
 *
 * The rules are the team's transcription of the 2002 Banking Order (Brain page 7798786),
 * not verified against the Order. Case C is the team's worked example; the variable
 * track, the linked loan and every average rate used on them are invented.
 * The fee over time holds the two published averages still, which the real ones are not.
 */
import { addDays } from "../../src/lib/calc/earlyrepay.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { type Case, datePlusDays, datePlusMonths, dayInterest, daysBetweenFact, fee, indexFeeOf, monthInterest, monthsBetween, percentOf, percentOfAmount, totalOf } from "./_earlyrepay-facts.ts";
import { caseC } from "./lesson-7-1.ts";
import { difference, given } from "./lesson-3-8.ts";

/** Repayment on `repaid` with a written notice 30 days before, unless a notice date is given. */
const on = (c: Case, repaid: string, noticeDaysBefore: number | null = 30): Case => ({ ...c, repaid, noticeOn: noticeDaysBefore === null ? undefined : addDays(repaid, -noticeDaysBefore) });

export default function lesson73(): LessonData {
  // ── A variable track, invented: 400,000 ₪, 4.5%, 25 years, granted 15.3.2022, the rate resets every 5 years (15.3.2027). ──
  const V: Case = { principal: "400000", rate: "4.5", term: 300, granted: "2022-03-15", repaid: "2026-11-16", reset: 60, avgToday: "3.6", avgGrant: "4.1" };
  const v24 = on(V, "2025-03-16");
  const v12 = on(V, "2026-03-16");
  const v4 = on(V, "2026-11-16");
  const vExit = on(V, "2027-03-15");
  const vAfter = on(V, "2027-03-16");
  const v1m = on(V, "2027-02-16");

  // ── Case C: the notice window around 2.8.2026. ──
  const cNone: Case = { ...caseC, noticeOn: undefined };
  const cShort = on(caseC, "2026-08-02", 6);
  const cMid = on(caseC, "2026-08-02", 13);

  // ── The index fee and the 16th: a linked loan with a balance of 500,000 ₪, the index up 0.25% a month on average. ──
  const lin: Case = { principal: "600000", rate: "4.2", term: 300, granted: "2021-08-01", repaid: "2026-08-15", linkage: "linked", avgToday: "3.4", avgGrant: "2.9", indexChange: "0.25", balance: "500000" };
  const lin15 = on(lin, "2026-08-15");
  const lin16 = on(lin, "2026-08-16");

  // ── The step of the reductions: case C, but granted 1.9.2023: the third year is completed on 1.9.2026. ──
  const r3: Case = { ...caseC, granted: "2023-09-01" };
  const r3a = on(r3, "2026-08-31");
  const r3b = on(r3, "2026-09-02");
  const c5a = on(caseC, "2028-06-02");
  const c5b = on(caseC, "2028-07-02");

  // ── Exercises ──
  const x4fee = indexFeeOf("ex4.fee", "400000", "0.25");
  const x4day = dayInterest("ex4.day", "400000", "4.2", 30);
  const r3before = fee("t3.before", r3a, "total");
  const r3after = fee("t3.after", r3b, "total");

  const facts: Fact[] = [
    // The variable track: the fee as the reset day comes closer, and on it.
    datePlusMonths("v.reset_date", V.granted, 60),
    fee("v24.paid", v24, "paid"),
    fee("v24.months", v24, "months_to_reset"),
    fee("v24.total", v24, "total"),
    fee("v12.months", v12, "months_to_reset"),
    fee("v12.total", v12, "total"),
    fee("v4.paid", v4, "paid"),
    fee("v4.months", v4, "months_to_reset"),
    fee("v4.bucket", v4, "bucket"),
    fee("v4.payment", v4, "payment"),
    fee("v4.balance", v4, "balance"),
    fee("v4.pv_today", v4, "pv_today"),
    fee("v4.pv_contract", v4, "pv_contract"),
    fee("v4.pv_grant", v4, "pv_grant"),
    fee("v4.v1", v4, "v1"),
    fee("v4.v2", v4, "v2"),
    fee("v4.lower", v4, "lower"),
    fee("v4.reduction", v4, "reduction_percent"),
    fee("v4.discount", v4, "discount"),
    fee("v4.op", v4, "operational"),
    fee("v4.total", v4, "total"),
    fee("vx.status", vExit, "status"),
    fee("vx.paid", vExit, "paid"),
    fee("vx.balance", vExit, "balance"),
    fee("vx.total", vExit, "total"),
    fee("v1m.months", v1m, "months_to_reset"),
    fee("v1m.total", v1m, "total"),
    difference("v.gap", fee("v4.total", v4, "total"), fee("vx.total", vExit, "total")),
    datePlusDays("v.win_from", "2027-03-15", -45),
    datePlusDays("v.win_to", "2027-03-15", -10),
    fee("va.months", vAfter, "months_to_reset"),
    fee("va.total", vAfter, "total"),

    // The notice window, around case C's repayment on 2.8.2026.
    datePlusDays("n.earliest", caseC.repaid, -45),
    datePlusDays("n.latest", caseC.repaid, -10),
    daysBetweenFact("n.ok_days", caseC.noticeOn!, caseC.repaid),
    fee("n.ok_fee", caseC, "no_notice"),
    fee("n.none_fee", cNone, "no_notice"),
    fee("n.mid_days", cMid, "notice_days"),
    fee("n.mid_fee", cMid, "no_notice"),
    fee("n.short_days", cShort, "notice_days"),
    fee("n.short_fee", cShort, "no_notice"),
    datePlusMonths("ag.counts_from", "2026-01-10", 6),

    // The index fee and the 16th.
    given("ix.balance", "500000.00"),
    fee("ix.fee15", lin15, "index"),
    fee("ix.fee16", lin16, "index"),
    dayInterest("ix.day", "500000", "4.2", 30),
    difference("ix.net", fee("ix.fee15", lin15, "index"), dayInterest("ix.day", "500000", "4.2", 30)),

    // The step of the reductions at three years, and at five.
    monthsBetween("t3.months_a", r3.granted, "2026-08-31"),
    fee("t3.paid_a", r3a, "paid"),
    fee("t3.red_a", r3a, "reduction_percent"),
    r3before,
    fee("t3.paid_b", r3b, "paid"),
    fee("t3.red_b", r3b, "reduction_percent"),
    r3after,
    difference("t3.saving", r3before, r3after),
    fee("t3.balance", r3a, "balance"),
    monthInterest("t3.month_interest", fee("t3.balance", r3a, "balance"), "5.90"),
    percentOf("t3.err_20pct", r3before, "20"),
    fee("c5.red_a", c5a, "reduction_percent"),
    fee("c5.total_a", c5a, "total"),
    fee("c5.red_b", c5b, "reduction_percent"),
    fee("c5.total_b", c5b, "total"),
    difference("c5.saving", fee("c5.total_a", c5a, "total"), fee("c5.total_b", c5b, "total")),
    fee("c.total", caseC, "total"),
    fee("c.red", caseC, "reduction_percent"),
    datePlusMonths("c.five", caseC.granted, 60),
    fee("c.balance", caseC, "balance"),

    // Exercises.
    daysBetweenFact("ex2.days", "2026-08-12", "2026-09-01"),
    x4fee,
    x4day,
    difference("ex4.answer", x4fee, x4day),
    totalOf("ex4.err_sum", [x4fee, x4day]),
    percentOfAmount("ex4.balance_pct", "400000", "0.25"),
    given("ex4.balance", "400000.00"),
    given("ex5.balance", "250000.00"),
  ];

  return {
    lesson: "7.3",
    title: "תחנות יציאה ותזמון: ה־16 בחודש, הודעה של 10–45 יום",
    note: "Case C is the team's worked example; the variable track (400,000 ₪, 4.5%, 25 years, granted 15.3.2022, resetting every 5 years), the linked loan and all the averages on them are invented. The fee over time holds the two published averages still, which the real ones are not. A rate that has already reset is not modelled: the variable-track series stops at the reset day. Fees follow the team's transcription of the 2002 Banking Order, not verified. A day's interest is taken as a thirtieth of a month's. Money is exact and rounded to the agora when shown.",
    facts,
  };
}
