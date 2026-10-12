/**
 * Lesson 4.9 — the collateral: the property, the appraisal, the registration
 * of rights, and the life and buildings insurances. Every number the page, the
 * exercises and the video show is a fact here; checks/kinds/underwriting.py
 * recomputes every computed one.
 *
 * Case B (אבי), from the course map and scripts/case_sketch.py: a single home
 * at 1,650,000 ₪, equity 520,000 ₪, two tracks of 565,000 ₪ (4.60% and 4.10%,
 * 300 months). The appraisals (1,560,000 ₪ and the table's values) are
 * teaching assumptions, not market data.
 *
 * Rules, none verified against the source document:
 *  - 75% ceiling for a single home (Directive 329, via the team's Brain notes
 *    and search summaries; lesson 4.4 owns it).
 *  - The value for the financing ratio is the lower of the appraisal and the
 *    price: a search summary of a Bank of Israel document (2026-10-10). Lesson
 *    1.2 left the question open; the lesson shows it as a summary, unverified.
 *  - 90 days, 14 days, 30 days, ₪30,000: Directive 451 §9(ה), §11(ב)(2),
 *    §11(ב)(3), §11(ד)(3), as the team transcribed them (Brain 8716324, 9797633).
 */
import type { LessonData } from "../build-data.ts";
import type { Track } from "../../src/lib/calc/underwriting.ts";
import {
  addDays,
  appraisalTable,
  balance,
  difference,
  given,
  lower,
  countDifference,
  dividePercent,
  mixPay,
  ratio,
  timesPercent,
  trackPay,
  untilAtMost,
} from "./_underwriting-facts.ts";

const PRICE = "1650000";
const EQUITY = "520000";
const LOAN = "1130000";
const CEILING = "75";
const APPRAISAL = "1560000";
const AVI: Track[] = [
  { principal: "565000", ratePercent: "4.60", months: 300 },
  { principal: "565000", ratePercent: "4.10", months: 300 },
];

export default function lesson49(): LessonData {
  const facts = [
    given("data_date", "2026-10-10"),
    // Rules (transcribed or summarised, not verified).
    given("rule.ceiling_single", CEILING),
    given("rule.appraisal_days", 90),
    given("rule.policy_answer_days", 14),
    given("rule.renewal_warning_days", 30),
    given("rule.no_insurance_below", "30000"),
    given("rule.structure_extra_percent", 20),

    // Case B: the deal.
    given("case.price", PRICE),
    given("case.equity", EQUITY),
    given("case.loan", LOAN),
    trackPay("case.pay_1", AVI[0]),
    trackPay("case.pay_2", AVI[1]),
    mixPay("case.payment", AVI),
    ratio("case.ltv_price", LOAN, PRICE, 1),

    // The appraisal comes in lower than the price.
    given("case.appraisal", APPRAISAL),
    lower("case.value_used", APPRAISAL, PRICE),
    ratio("case.ltv_appraisal", LOAN, APPRAISAL, 1),
    timesPercent("case.max_loan_price", PRICE, CEILING),
    timesPercent("case.max_loan_appraisal", APPRAISAL, CEILING),
  ];
  facts.push(difference("case.price_gap", "case.price", "case.appraisal", facts));
  facts.push(dividePercent("case.edge_appraisal", LOAN, CEILING));
  facts.push(difference("case.room", "case.max_loan_appraisal", "case.loan", facts));

  // Prediction: the ratio at the price, at the appraisal, and the wrong "it falls".
  facts.push(ratio("prediction.ltv_up", LOAN, APPRAISAL, 1));
  facts.push(ratio("prediction.ltv_price", LOAN, PRICE, 1));

  // The life cover follows the balance (case B's two tracks).
  facts.push(balance("life.after_60", AVI, 60));
  facts.push(balance("life.after_120", AVI, 120));
  facts.push(balance("life.after_240", AVI, 240));
  facts.push(untilAtMost("life.months_to_30k", AVI, "30000"));
  facts.push(given("life.months_total", 300));
  facts.push(countDifference("life.months_left_30k", "life.months_total", "life.months_to_30k", facts));

  // The half-worked table: four appraisals against the price 1,650,000, loan 1,130,000, ceiling 75%.
  facts.push(appraisalTable("half.table", PRICE, LOAN, CEILING, ["1700000", "1600000", "1520000", "1480000"]));

  // Worked example: dates (invented, 2026–2027).
  facts.push(given("worked.appraisal_date", "2026-10-20"));
  facts.push(addDays("worked.appraisal_last", "2026-10-20", 90));
  facts.push(given("worked.policy_sent", "2026-11-02"));
  facts.push(addDays("worked.policy_answer_by", "2026-11-02", 14));

  // Exercise 2: an appraisal of 1,480,000: the largest loan, and the equity missing.
  facts.push(given("ex2.appraisal", "1480000"));
  facts.push(timesPercent("ex2.max_loan", "1480000", CEILING));
  facts.push(difference("ex2.answer", "case.loan", "ex2.max_loan", facts));
  facts.push(timesPercent("ex2.err_price", PRICE, CEILING));
  facts.push(difference("ex2.err_price_gap", "case.price", "ex2.appraisal", facts));

  // Exercise 3: the ratio when the appraisal is 1,520,000.
  facts.push(given("ex3.appraisal", "1520000"));
  facts.push(ratio("ex3.answer", LOAN, "1520000", 1));
  facts.push(ratio("ex3.err_price", LOAN, PRICE, 1));
  facts.push(ratio("ex3.err_inverse", "1520000", LOAN, 1));

  // Exercise 4: the life cover after 10 years (120 payments).
  facts.push(given("ex4.loan", LOAN));
  facts.push(given("ex4.paid", 120));

  // Exercise 5: a small loan, 200,000 ₪ at 5% for 120 months: when does the balance reach 30,000?
  const small: Track[] = [{ principal: "200000", ratePercent: "5", months: 120 }];
  const ex5 = untilAtMost("ex5.answer", small, "30000");
  facts.push(ex5);
  facts.push(balance("ex5.balance_at", small, Number(ex5.value)));
  facts.push(balance("ex5.balance_before", small, Number(ex5.value) - 1));
  facts.push(countDifference("ex5.months_left", "ex5.months", "ex5.answer", [...facts, given("ex5.months", 120)]));
  facts.push(given("ex5.months", 120));
  facts.push(given("ex5.one", 1));
  facts.push(countDifference("ex5.before", "ex5.answer", "ex5.one", facts));
  facts.push(trackPay("ex5.payment", small[0]));

  // Exercise 6: an external policy handed in on Thursday 3 December 2026: the bank's 14 days.
  facts.push(given("ex6.sent", "2026-12-03"));
  facts.push(addDays("ex6.answer", "2026-12-03", 14));
  facts.push(addDays("ex6.err_day_one", "2026-12-03", 13));
  facts.push(addDays("ex6.err_thirty", "2026-12-03", 30));


  return {
    lesson: "4.9",
    title: "הבטוחה: הנכס, השמאות, רישום הזכויות וביטוחי חיים ומבנה",
    note: "Case B (אבי) from the course map; appraisals and dates are teaching assumptions. Rules from the team's Brain transcription of Directive 451 §9, §11 and a search summary of the financing-ratio value; not verified.",
    facts,
  };
}
