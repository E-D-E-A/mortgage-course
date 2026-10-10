/**
 * Lesson 3.9 — the total paid, and where it goes: the principal, the interest,
 * indexation and fees. Every number the lesson, its exercises and its
 * illustration's guided tasks show is declared here as a fact; the page reads
 * data/lessons/3-9.json, and checks/independent_check.py recomputes every fact
 * (checks/kinds/metrics.py, plus the shared kinds named below).
 *
 * Inputs are teaching numbers, not market rates. The linked track's index
 * rises 2% every year: a teaching assumption, never a forecast (Mogi forecasts
 * only from the Bank of Israel's published inputs, Brain 67436545). The file
 * opening fee is "up to about 360 ₪" by a secondary source (unverified).
 */
import Decimal from "decimal.js";
import { simpleBalance } from "../../src/lib/calc/compound.ts";
import type { Track } from "../../src/lib/calc/metrics.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, first, given, indexation, interest, payment, share, sumOf, times, total } from "./lesson-3-8.ts";

const simple = (id: string, principal: string, rate: string, periods: number): Fact => ({
  id,
  kind: "simple_balance",
  inputs: { principal, rate_percent: rate, periods },
  value: moneyString(simpleBalance(principal, rate, periods)),
});

const simpleInterest = (id: string, principal: string, rate: string, periods: number): Fact => ({
  id,
  kind: "simple_interest",
  inputs: { principal, rate_percent: rate, periods },
  value: moneyString(simpleBalance(principal, rate, periods).minus(principal)),
});

export default function lesson39(): LessonData {
  // ── The explanation. ──
  const small: Track = { principal: "12000", rates: ["6"], months: 12 };
  const big: Track = { principal: "600000", rates: ["4.8"], months: 240 };
  const big30: Track = { ...big, months: 360 };
  const linked: Track = { principal: "600000", rates: ["3"], months: 240, inflationPercent: "2" };

  const smallPay = first("small.payment", [small]);
  const smallTotal = total("small.total", [small]);
  const smallTimes = times("small.times", smallPay, 12);
  const bigPay = first("big.payment", [big]);
  const bigTotal = total("big.total", [big]);
  const bigInterest = interest("big.interest", big);
  const big30Pay = first("big30.payment", [big30]);
  const big30Total = total("big30.total", [big30]);
  const big30Interest = interest("big30.interest", big30);
  const lnkTotal = total("lnk.total", [linked]);
  const lnkInterest = interest("lnk.interest", linked);
  const lnkIndex = indexation("lnk.indexation", linked);
  const fee = given("fee.open", "360.00");
  const everything = sumOf("slider.everything", [bigTotal, fee]);
  const everything30 = sumOf("slider.everything_30", [big30Total, fee]);
  const everythingLinked = sumOf("slider.everything_linked", [lnkTotal, fee]);

  // ── Worked example: 450,000 ₪ at 5%, 20 or 25 years. ──
  const w20: Track = { principal: "450000", rates: ["5"], months: 240 };
  const w25: Track = { ...w20, months: 300 };
  const wPay20 = first("worked.pay_20", [w20]);
  const wPay25 = first("worked.pay_25", [w25]);
  const wTotal20 = total("worked.total_20", [w20]);
  const wTotal25 = total("worked.total_25", [w25]);
  const wInt20 = interest("worked.int_20", w20);
  const wInt25 = interest("worked.int_25", w25);

  // ── Half-worked: 300,000 ₪ at 4.2%, 15, 20 or 25 years — the learner's route: payment × months. ──
  const hLoan = given("half.loan", "300000.00");
  const half = [15, 20, 25].map((years) => {
    const t: Track = { principal: "300000", rates: ["4.2"], months: years * 12 };
    const pay = first(`half.pay_${years}`, [t]);
    const tot = times(`half.total_${years}`, pay, years * 12);
    const int = difference(`half.int_${years}`, tot, hLoan);
    return { years, pay, tot, int };
  });

  // ── Exercises. ──
  // 1: 24,000 ₪ at 5.4% for 24 months.
  const x1Pay = first("ex1.payment", [{ principal: "24000", rates: ["5.4"], months: 24 }]);
  const x1Total = times("ex1.answer", x1Pay, 24);
  const x1Loan = given("ex1.loan", "24000.00");
  // 3: the 30-year loan of the explanation, by the learner's route.
  const x3Total = times("ex3.total", big30Pay, 360);
  const x3Loan = given("ex3.loan", "600000.00");
  // 4: a linked track: what the index added.
  const x4: Track = { principal: "400000", rates: ["2.8"], months: 180, inflationPercent: "2.5" };
  const x4Total = total("ex4.total", [x4]);
  const x4Interest = interest("ex4.interest", x4);
  const x4Loan = given("ex4.loan", "400000.00");
  const x4NoInterest = difference("ex4.err_no_interest", x4Total, x4Loan);
  // 5: 30 or 25 years on the explanation's loan: the interest saved, by the learner's route.
  const x5Pay25 = first("ex5.pay_25", [{ ...big, months: 300 }]);
  const x5Total25 = times("ex5.total_25", x5Pay25, 300);
  const x5Int25 = difference("ex5.int_25", x5Total25, x3Loan);
  const x5Int30 = difference("ex3.answer", x3Total, x3Loan);

  const facts: Fact[] = [
    // Prediction.
    given("prediction.loan", "600000.00"),
    simple("prediction.once", "600000", "4.8", 1),
    simple("prediction.simple", "600000", "4.8", 20),

    // The explanation: small numbers.
    given("small.loan", "12000.00"),
    smallPay,
    smallTotal,
    payment("small.last", [small], 12),
    smallTimes,
    difference("small.times_gap", smallTimes, smallTotal),
    interest("small.interest", small),

    // The explanation: 600,000 ₪, 20 years.
    given("big.loan", "600000.00"),
    bigPay,
    bigTotal,
    bigInterest,
    share("big.interest_share", bigInterest, bigTotal, 1),
    // 30 years.
    big30Pay,
    big30Total,
    big30Interest,
    difference("big30.pay_gap", bigPay, big30Pay),
    difference("big30.interest_gap", big30Interest, bigInterest),
    share("big30.interest_share", big30Interest, big30Total, 1),

    // Indexation: a linked track at 3%, the index rising 2% a year (assumption).
    first("lnk.first", [linked]),
    payment("lnk.last", [linked], 240),
    lnkTotal,
    lnkInterest,
    lnkIndex,
    difference("lnk.over_unlinked", lnkTotal, bigTotal),

    // Fees.
    fee,
    share("fee.share_of_interest", fee, bigInterest, 2),

    // The illustration's defaults and guided tasks.
    everything,
    share("slider.interest_share", bigInterest, everything, 1),
    share("slider.fee_share", fee, everything, 2),
    everything30,
    share("slider.interest_share_30", big30Interest, everything30, 1),
    everythingLinked,
    share("slider.index_share", lnkIndex, everythingLinked, 1),

    // Worked example.
    given("worked.loan", "450000.00"),
    wPay20,
    wPay25,
    difference("worked.pay_gap", wPay20, wPay25),
    wTotal20,
    wTotal25,
    difference("worked.total_gap", wTotal25, wTotal20),
    wInt20,
    wInt25,
    share("worked.share_20", wInt20, wTotal20, 1),
    share("worked.share_25", wInt25, wTotal25, 1),
    sumOf("worked.everything_20", [wTotal20, fee]),

    // Half-worked.
    hLoan,
    ...half.flatMap((h) => [h.pay, h.tot, h.int]),

    // Exercises.
    x1Pay,
    x1Total,
    x1Loan,
    difference("ex1.err_interest", x1Total, x1Loan),
    x3Total,
    x3Loan,
    x5Int30,
    simpleInterest("ex3.err_simple", "600000", "4.8", 30),
    difference("ex3.round_gap", big30Total, x3Total),
    x4Total,
    x4Interest,
    x4Loan,
    x4NoInterest,
    difference("ex4.answer", x4NoInterest, x4Interest),
    difference("ex4.err_minus_interest", x4Total, x4Interest),
    indexation("ex4.exact", x4),
    x5Pay25,
    x5Total25,
    x5Int25,
    difference("ex5.answer", x5Int30, x5Int25),
    difference("ex5.err_pay", x5Pay25, big30Pay),
  ];

  return {
    lesson: "3.9",
    title: "סך תשלומים, ריבית, הצמדה ועמלות",
    note: "Teaching numbers, not market rates. Monthly rate = annual ÷ 12; schedules follow the statement convention (each month's interest rounded to the agora, the payment rounded once, the last payment clearing the balance), so totals agree with 2.9 and 3.12. The linked track's index rises 2% a year (2.5% in exercise 4): a teaching assumption, not a forecast. Where the learner multiplies a rounded payment by the number of months, the fact does the same (met_times).",
    facts,
  };
}
