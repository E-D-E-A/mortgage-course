/**
 * Lesson 3.11 — why the total paid, the value today and the IRR are three
 * different measures: two schedules, three measures, and rankings that do not
 * agree. Every number the lesson, its exercises, its illustration's guided
 * tasks and its video show is declared here as a fact; the page and the video
 * read data/lessons/3-11.json, and checks/independent_check.py recomputes every
 * fact (checks/kinds/metrics.py).
 *
 * Inputs are teaching numbers, not market rates or offers. "What the money
 * could earn meanwhile" (3%, 9%) is a teaching input, taken monthly as the
 * annual rate ÷ 12.
 */
import type { Track } from "../../src/lib/calc/metrics.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, first, given, interest, irrEffective, irrX12, payment, pv, pvCurve, series, total } from "./lesson-3-8.ts";

export default function lesson311(): LessonData {
  // ── The explanation (and the video): 400,000 ₪ at 6% (0.5% a month), 15 years, two ways. ──
  const S: Track = { principal: "400000", rates: ["6"], months: 180 };
  const E: Track = { ...S, method: "equal_principal" };
  const G: Track = { ...S, method: "grace_full", graceMonths: 12 };
  const sTotal = total("explain.s_total", [S]);
  const gTotal = total("explain.g_total", [G]);
  const x3Loan = given("ex3.loan", "400000.00");
  const eTotal = total("explain.e_total", [E]);
  const sPv3 = pv("explain.s_pv_3", [S], "3");
  const ePv3 = pv("explain.e_pv_3", [E], "3");
  const sPv9 = pv("explain.s_pv_9", [S], "9");
  const ePv9 = pv("explain.e_pv_9", [E], "9");

  // ── Worked example: two offers for 600,000 ₪. A: 5%, 20 years. B: 4.6%, 30 years. ──
  const A: Track = { principal: "600000", rates: ["5"], months: 240 };
  const B: Track = { principal: "600000", rates: ["4.6"], months: 360 };
  const aPay = first("worked.a_pay", [A]);
  const bPay = first("worked.b_pay", [B]);
  const aTotal = total("worked.a_total", [A]);
  const bTotal = total("worked.b_total", [B]);
  const aPv3 = pv("worked.a_pv_3", [A], "3");
  const bPv3 = pv("worked.b_pv_3", [B], "3");
  const aPv6 = pv("worked.a_pv_6", [A], "6");
  const bPv6 = pv("worked.b_pv_6", [B], "6");
  const aPv4 = pv("slider.a_pv_4", [A], "4");
  const bPv4 = pv("slider.b_pv_4", [B], "4");

  // ── Half-worked: 3,000 ₪ at 2% a month (24% a year), three months, two ways. ──
  const hA: Track = { principal: "3000", rates: ["24"], months: 3 };
  const hB: Track = { ...hA, method: "equal_principal" };

  const rates = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

  const facts: Fact[] = [
    // The explanation.
    given("explain.loan", "400000.00"),
    first("explain.s_first", [S]),
    first("explain.e_first", [E]),
    sTotal,
    eTotal,
    difference("explain.total_gap", sTotal, eTotal),
    interest("explain.s_interest", S),
    interest("explain.e_interest", E),
    irrX12("explain.s_irr", [S], "400000", 2),
    irrX12("explain.e_irr", [E], "400000", 2),
    irrEffective("explain.irr_eff", [S], "400000", 2),
    pv("explain.s_pv_6", [S], "6"),
    pv("explain.e_pv_6", [E], "6"),
    sPv3,
    ePv3,
    difference("explain.pv3_gap", sPv3, ePv3),
    sPv9,
    ePv9,
    difference("explain.pv9_gap", ePv9, sPv9),
    // 2.10's grace: full grace for the first 12 months.
    gTotal,
    pv("explain.g_pv_6", [G], "6"),
    irrX12("explain.g_irr", [G], "400000", 2),

    // The video.
    series("video.s_years", [S], 12),
    series("video.e_years", [E], 12),
    pvCurve("video.s_curve", [S], rates),
    pvCurve("video.e_curve", [E], rates),

    // Worked example.
    given("worked.loan", "600000.00"),
    aPay,
    bPay,
    difference("worked.pay_gap", aPay, bPay),
    aTotal,
    bTotal,
    difference("worked.total_gap", bTotal, aTotal),
    irrX12("worked.a_irr", [A], "600000", 2),
    irrX12("worked.b_irr", [B], "600000", 2),
    irrEffective("worked.a_eff", [A], "600000", 2),
    irrEffective("worked.b_eff", [B], "600000", 2),
    aPv3,
    bPv3,
    difference("worked.pv3_gap", bPv3, aPv3),
    aPv6,
    bPv6,
    difference("worked.pv6_gap", aPv6, bPv6),

    // The illustration's guided tasks (ThreeMeasures.vue).
    aPv4,
    bPv4,

    // Half-worked.
    given("half.loan", "3000.00"),
    first("half.a_pay", [hA]),
    total("half.a_total", [hA]),
    total("half.b_total", [hB]),
    pv("half.a_pv_1", [hA], "1", "monthly"),
    pv("half.b_pv_1", [hB], "1", "monthly"),
    pv("half.a_pv_3", [hA], "3", "monthly"),
    pv("half.b_pv_3", [hB], "3", "monthly"),
    first("half.b_first", [hB]),
    payment("half.b_pay_2", [hB], 2),
    payment("half.b_pay_3", [hB], 3),

    // Exercises.
    x3Loan,
    difference("ex3.err_interest", gTotal, x3Loan),
    pv("ex5.answer", [B], "6"),
    first("ex5.payment", [B]),
    total("ex5.err_total", [B]),
    pv("ex5.err_own", [B], "4.6"),
  ];

  return {
    lesson: "3.11",
    title: "למה סך תשלומים, ערך נוכחי ו־IRR הם שלושה מדדים שונים",
    note: "Teaching numbers, not market rates or offers. Monthly rate = annual ÷ 12; exact schedules, rounded to the agora only when shown. The rate the money could earn meanwhile is a teaching input.",
    facts,
  };
}
