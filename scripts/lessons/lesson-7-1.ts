/**
 * Lesson 7.1 — the five fees of an early repayment. Every number the lesson, its
 * exercises and its illustration's guided tasks show is a fact here; the page reads
 * data/lessons/7-1.json, and checks/independent_check.py recomputes each one
 * (checks/kinds/earlyrepay.py).
 *
 * The rules are the team's transcription of the 2002 Banking Order (Brain page
 * 7798786), not verified against the Order. The loan of case C (עדי וירון) is the
 * team's worked example; every other loan, balance and index change is invented.
 */
import type { Fact, LessonData } from "../build-data.ts";
import { type Case, fee, indexFeeOf, percentOf, percentOfAmount, times, totalOf } from "./_earlyrepay-facts.ts";
import { difference, given } from "./lesson-3-8.ts";

/** Case C's loan, as in the team's worked example; they sent notice 30 days before. */
export const caseC: Case = {
  principal: "700000",
  rate: "5.90",
  term: 240,
  granted: "2023-07-01",
  repaid: "2026-08-02",
  avgToday: "4.823049",
  avgGrant: "5.09",
  noticeOn: "2026-07-03",
};

export default function lesson71(): LessonData {
  const noNotice: Case = { ...caseC, noticeOn: undefined };

  // ── Half-worked: three invented repayments; the fees of this lesson, without the discounting fee. ──
  const s1: Case = { principal: "350000", rate: "5.1", term: 240, granted: "2024-02-01", repaid: "2026-08-20", track: "prime", avgToday: "4.5", balance: "300000" };
  const s2: Case = { principal: "450000", rate: "3.1", term: 300, granted: "2022-03-01", repaid: "2026-08-10", linkage: "linked", avgToday: "3.3", avgGrant: "2.8", noticeOn: "2026-07-21", indexChange: "0.2", balance: "400000" };
  const s3: Case = { ...s2, noticeOn: undefined };

  // ── The index fee, illustration and text: a linked loan with a balance of 500,000 ₪, index up 0.25% a month on average. ──
  const lin: Case = { principal: "600000", rate: "4.2", term: 300, granted: "2021-08-01", repaid: "2026-08-10", linkage: "linked", avgToday: "3.4", avgGrant: "2.9", noticeOn: "2026-07-20", indexChange: "0.25", balance: "500000" };
  const lin16: Case = { ...lin, repaid: "2026-08-16", noticeOn: "2026-07-26" };

  // ── Exercises ──
  const x6: Case = { principal: "420000", rate: "3.4", term: 240, granted: "2020-09-01", repaid: "2026-09-09", linkage: "linked", avgToday: "3.2", avgGrant: "2.7", indexChange: "0.25", balance: "360000" };
  const x5: Case = { principal: "280000", rate: "5.0", term: 240, granted: "2023-02-01", repaid: "2026-09-14", track: "prime", avgToday: "4.5", noticeOn: "2026-09-09", balance: "250000" };

  const opOne = fee("op.one", caseC, "operational");
  const cBalance = fee("c.balance", caseC, "balance");
  const nn250 = given("ex2.balance", "250000.00");

  const facts: Fact[] = [
    // Prediction and the opening: case C's loan on the day of repayment.
    fee("c.paid", caseC, "paid"),
    fee("c.remaining", caseC, "remaining"),
    fee("c.payment", caseC, "payment"),
    cBalance,
    percentOf("pred.pct1", cBalance, "1"),
    fee("c.notice_days", caseC, "notice_days"),

    // The operational fee: ₪60 once per repayment, not per track.
    opOne,
    times("op.three", opOne, 3),
    times("op.five", opOne, 5),
    difference("op.over", times("op.five", opOne, 5), opOne),

    // The fee for no notice: 0.1% of the amount repaid.
    fee("nn.c_none", noNotice, "no_notice"),
    fee("nn.c_given", caseC, "no_notice"),
    given("nn.balance", "300000.00"),
    percentOfAmount("nn.fee", "300000", "0.1"),

    // The index fee: balance × ½ × the average monthly change of the index; 1st–15th only.
    given("ix.balance", "500000.00"),
    fee("ix.fee10", lin, "index"),
    fee("ix.fee16", lin16, "index"),
    fee("ix.fee_c", caseC, "index"),
    indexFeeOf("ix.half", "500000", "0.25"),
    percentOfAmount("ix.no_half", "500000", "0.25"),
    percentOfAmount("ill.nn", "500000", "0.1"),

    // Half-worked: operational, no-notice and index fee of three repayments.
    fee("h1.op", s1, "operational"),
    fee("h1.nn", s1, "no_notice"),
    fee("h1.ix", s1, "index"),
    totalOf("h1.total", [fee("h1.op", s1, "operational"), fee("h1.nn", s1, "no_notice"), fee("h1.ix", s1, "index")]),
    fee("h2.op", s2, "operational"),
    fee("h2.nn", s2, "no_notice"),
    fee("h2.ix", s2, "index"),
    totalOf("h2.total", [fee("h2.op", s2, "operational"), fee("h2.nn", s2, "no_notice"), fee("h2.ix", s2, "index")]),
    fee("h3.op", s3, "operational"),
    fee("h3.nn", s3, "no_notice"),
    fee("h3.ix", s3, "index"),
    totalOf("h3.total", [fee("h3.op", s3, "operational"), fee("h3.nn", s3, "no_notice"), fee("h3.ix", s3, "index")]),
    fee("h2.notice_days", s2, "notice_days"),
    given("h.balance1", "300000.00"),
    given("h.balance2", "400000.00"),

    // Exercises
    nn250,
    percentOfAmount("ex2.answer", "250000", "0.1"),
    percentOfAmount("ex2.err_1pct", "250000", "1"),
    percentOfAmount("ex2.err_10pct", "250000", "10"),
    given("ex4.balance", "480000.00"),
    indexFeeOf("ex4.answer", "480000", "0.3"),
    percentOfAmount("ex4.err_no_half", "480000", "0.3"),
    given("ex6.balance", "360000.00"),
    fee("ex6.op", x6, "operational"),
    fee("ex6.nn", x6, "no_notice"),
    fee("ex6.ix", x6, "index"),
    totalOf("ex6.answer", [fee("ex6.op", x6, "operational"), fee("ex6.nn", x6, "no_notice"), fee("ex6.ix", x6, "index")]),
    totalOf("ex6.err_no_op", [fee("ex6.nn", x6, "no_notice"), fee("ex6.ix", x6, "index")]),
    totalOf("ex6.err_no_ix", [fee("ex6.op", x6, "operational"), fee("ex6.nn", x6, "no_notice")]),
    given("ex5.balance", "250000.00"),
    fee("ex5.nn", x5, "no_notice"),
    fee("ex5.op", x5, "operational"),
    fee("ex5.notice_days", x5, "notice_days"),
  ];
  return {
    lesson: "7.1",
    title: "חמש עמלות הפירעון המוקדם",
    note: "Case C's loan is the team's worked example (700,000 ₪, fixed unlinked, 5.90%, 20 years, July 2023); every other loan, balance and index change is invented. Fees follow the team's transcription of the 2002 Banking Order (not verified against the Order). The operational fee is taken at its ceiling, 60 ₪. Money is exact and rounded to the agora when shown.",
    facts,
  };
}
