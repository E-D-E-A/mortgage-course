/**
 * Lesson 4.7 — underwriting: how the bank checks. Declared against verified,
 * and the four answers. Every number the page, the exercises and the video
 * show is a fact here; checks/kinds/underwriting.py recomputes every computed one.
 *
 * Case B (אבי, self-employed, and his salaried wife מיכל), course map section 8
 * and scripts/case_sketch.py: price 1,650,000 ₪, equity 520,000 ₪, two tracks
 * of 565,000 ₪ (4.60% and 4.10%, 300 months). The declared incomes (11,000 and
 * 8,200) and the recognised income of אבי (7,500 = the average of two
 * assessments, 84,000 and 96,000 a year, ÷ 12) are lesson 4.1's numbers,
 * repeated here as given inputs.
 *
 * Rules (read from the official texts on 2026-10-19):
 *  - 50% payment ratio limit (Directive 329 v02/2026 section 5; lesson 4.4).
 *  - 40% and 35% are NOT rules: they are demonstration caps ("numbers for
 *    illustration"), not any bank's policy and not a Mogi decision.
 *  - 24 days, a floor; 12 when no new lien (Directive 451 v07/2023 §4ג(א)(4), §4ג(ז); lesson 1.8).
 * The dates are invented teaching dates.
 */
import type { LessonData } from "../build-data.ts";
import type { Track } from "../../src/lib/calc/underwriting.ts";
import {
  addDays,
  countDifference,
  daysBetween,
  difference,
  given,
  loanByPayment,
  maxLoanRatio,
  mixPay,
  perThousand,
  pointsGap,
  ratio,
  scaledPay,
  shortfall,
  sum,
  timesPercent,
  trackPay,
  verifyTable,
} from "./_underwriting-facts.ts";

const PRICE = "1650000";
const EQUITY = "520000";
const LOAN = "1130000";
const AVI_DECLARED = "11000";
const AVI_RECOGNISED = "7500";
const MICHAL = "8200";
const AVI: Track[] = [
  { principal: "565000", ratePercent: "4.60", months: 300 },
  { principal: "565000", ratePercent: "4.10", months: 300 },
];

export default function lesson47(): LessonData {
  const facts = [
    given("data_date", "2026-10-12"),
    given("rule.window", 24),
    given("rule.regulatory_cap", "50"),
    given("demo.cap_high", "40"),
    given("demo.cap_low", "35"),
    given("rule.financing_ceiling", "75"),
    // Open question (lesson 4.1): net or net-to-pay. Michal's net to pay, from the 4.1 payslips.
    given("case.michal_ntp", "7750"),

    // Case B: the deal and the incomes.
    given("case.price", PRICE),
    given("case.equity", EQUITY),
    given("case.loan", LOAN),
    given("case.avi_declared", AVI_DECLARED),
    given("case.avi_recognised", AVI_RECOGNISED),
    given("case.michal", MICHAL),
    sum("case.hh_declared", [AVI_DECLARED, MICHAL]),
    sum("case.hh_recognised", [AVI_RECOGNISED, MICHAL]),
    trackPay("case.pay_1", AVI[0]),
    trackPay("case.pay_2", AVI[1]),
    mixPay("case.payment", AVI),
  ];
  const v = (id: string) => String(facts.find((f) => f.id === id)!.value);
  facts.push(difference("case.hh_gap", "case.hh_declared", "case.hh_recognised", facts));
  facts.push(difference("case.avi_gap", "case.avi_declared", "case.avi_recognised", facts));
  facts.push(shortfall("case.avi_shortfall", AVI_DECLARED, AVI_RECOGNISED));
  facts.push(shortfall("case.hh_shortfall", v("case.hh_declared"), v("case.hh_recognised")));
  facts.push(ratio("case.ratio_declared", v("case.payment"), v("case.hh_declared"), 1));
  facts.push(ratio("case.ratio_recognised", v("case.payment"), v("case.hh_recognised"), 1));
  facts.push(ratio("case.ltv", LOAN, PRICE, 1));
  facts.push(pointsGap("case.ratio_gap", v("case.ratio_recognised"), v("case.ratio_declared")));
  // If the bank counts Michal's net to pay (7,750) instead of her net (8,200).
  facts.push(sum("case.hh_ntp", [AVI_RECOGNISED, v("case.michal_ntp")]));
  facts.push(ratio("case.ratio_ntp", v("case.payment"), v("case.hh_ntp"), 1));
  // The financing ceiling is a separate limit: 75% of the price.
  facts.push(timesPercent("case.fin_cap", PRICE, "75"));

  // What the lower income does to the largest loan, at three demonstration caps.
  for (const [name, cap] of [["regulatory", "50"], ["high", "40"], ["low", "35"]] as const) {
    facts.push(maxLoanRatio(`demo.max_loan_${name}`, AVI, v("case.hh_recognised"), cap));
    facts.push(maxLoanRatio(`demo.max_loan_${name}_declared`, AVI, v("case.hh_declared"), cap));
  }
  facts.push(timesPercent("demo.allowed_low", v("case.hh_recognised"), "35"));
  facts.push(perThousand("demo.per_thousand", v("case.payment"), LOAN));
  facts.push(loanByPayment("demo.loan_unrounded", v("demo.allowed_low"), v("case.payment"), LOAN));
  facts.push(shortfall("demo.loan_shortfall", v("demo.max_loan_high_declared"), v("demo.max_loan_high")));
  facts.push(difference("demo.equity_needed_low", "case.price", "demo.max_loan_low", facts));
  facts.push(difference("demo.equity_short_low", "demo.equity_needed_low", "case.equity", facts));
  facts.push(difference("demo.loan_drop_low", "case.loan", "demo.max_loan_low", facts));

  // The half-worked table: declared against verified, line by line.
  facts.push(
    verifyTable("half.table", [
      { line: "הכנסת אבי (חודשית)", declared: AVI_DECLARED, verified: AVI_RECOGNISED },
      { line: "הכנסת מיכל (חודשית)", declared: MICHAL, verified: MICHAL },
      { line: "ההכנסה של שניהם", declared: v("case.hh_declared"), verified: v("case.hh_recognised") },
    ]),
  );

  // Exercise 3: the shortfall in percent, with the usual wrong denominators.
  facts.push(ratio("ex3.err_over_verified", v("case.avi_gap"), AVI_RECOGNISED));
  facts.push(ratio("ex3.err_share", AVI_RECOGNISED, AVI_DECLARED));

  // Exercise 5: equity turns out to be 480,000 ₪ (40,000 less): the loan is larger, so is the payment.
  facts.push(given("ex5.equity_verified", "480000"));
  facts.push(difference("ex5.equity_gap", "case.equity", "ex5.equity_verified", facts));
  facts.push(difference("ex5.new_loan", "case.price", "ex5.equity_verified", facts));
  facts.push(scaledPay("ex5.answer", AVI, v("ex5.new_loan")));
  facts.push(ratio("ex5.ratio", v("ex5.answer"), v("case.hh_recognised"), 1));
  facts.push(trackPay("ex5.pay_1", { principal: "585000", ratePercent: "4.60", months: 300 }));
  facts.push(trackPay("ex5.pay_2", { principal: "585000", ratePercent: "4.10", months: 300 }));
  facts.push(sum("demo.total_short", [v("demo.equity_short_low"), v("ex5.equity_gap")]));
  facts.push(difference("ex5.pay_gap", "ex5.answer", "case.payment", facts));

  // Exercise 7: the clock. Approval Wednesday 4 November 2026; the bank asks for one more document on day 18.
  facts.push(given("ex7.approved", "2026-11-04"));
  facts.push(addDays("ex7.window_end", "2026-11-04", 24));
  facts.push(addDays("ex7.asked", "2026-11-04", 18));
  facts.push(given("ex7.reply_days", 5));
  facts.push(given("ex7.review_days", 4));
  facts.push(addDays("ex7.replied", v("ex7.asked"), 5));
  facts.push(addDays("ex7.finished", v("ex7.replied"), 4));
  facts.push(daysBetween("ex7.answer", v("ex7.window_end"), v("ex7.finished")));
  facts.push(daysBetween("ex7.err_from_ask", v("ex7.asked"), v("ex7.finished")));
  facts.push(daysBetween("ex7.err_from_approval", v("ex7.approved"), v("ex7.finished")));

  // Worked example: Avi's own clock (invented dates).
  facts.push(given("worked.approved", "2026-10-26"));
  facts.push(addDays("worked.window_end", "2026-10-26", 24));
  facts.push(given("worked.docs_sent", "2026-11-04"));
  facts.push(daysBetween("worked.docs_day", "2026-10-26", "2026-11-04"));
  facts.push(given("worked.finished", "2026-11-17"));
  facts.push(daysBetween("worked.finished_day", "2026-10-26", "2026-11-17"));
  facts.push(countDifference("worked.left", "rule.window", "worked.finished_day", facts));

  return {
    lesson: "4.7",
    title: "חיתום: איך הבנק בודק",
    note: "Case B (אבי ומיכל): incomes from lesson 4.1, mix from the case sketch; caps of 40% and 35% are demonstration numbers, not rules or policy. Dates invented. The 50% limit and the 24 days were read from the official texts (Directive 329, version 02/2026; Directive 451, version 07/2023).",
    facts,
  };
}
