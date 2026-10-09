/**
 * The stage-0 completion check (src/pages/checks/0.mdx): every number its
 * questions, answers and common wrong answers show. Each fact reuses a kind a
 * stage-0 lesson already defined, so the independent check recomputes it the
 * same way. All amounts and rates are teaching numbers.
 */
import Decimal from "decimal.js";
import { compoundBalance, ruleOf72, simpleBalance } from "../../src/lib/calc/compound.ts";
import { approxRealRate, changePercent, indexedBalance, plainNumber, realRate } from "../../src/lib/calc/indexation.ts";
import { primeFromPolicy, PRIME_ADDITION, spread } from "../../src/lib/calc/lending.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { percentagePoints, percentOf, percentString, relativeChangePercent } from "../../src/lib/calc/percent.ts";
import { percentOffMistake, streamValueToday, valueToday } from "../../src/lib/calc/present-value.ts";
import { effectiveAnnualRate, periodicRateByDivision, roundedString } from "../../src/lib/calc/rates.ts";
import { simpleInterest } from "../../src/lib/calc/simple.ts";
import type { Fact, LessonData } from "../build-data.ts";

const given = (id: string, value: string): Fact => ({ id, kind: "given", inputs: {}, value });
const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});
const compound = (id: string, principal: string, rate: string, periods: number): Fact => ({
  id,
  kind: "compound_balance",
  inputs: { principal, rate_percent: rate, periods },
  value: moneyString(compoundBalance(principal, rate, periods)),
});
const simple = (id: string, principal: string, rate: string, periods: number): Fact => ({
  id,
  kind: "simple_balance",
  inputs: { principal, rate_percent: rate, periods },
  value: moneyString(simpleBalance(principal, rate, periods)),
});

export default function check0(): LessonData {
  // q3's loan, and the compound answer a learner who mixes 0.2 and 0.3 would give.
  const loan = given("q3.principal", "5000.00");
  const loanCompound = compound("q3.compound_balance", "5000", "4", 3);

  return {
    lesson: "check-0",
    title: "בדיקת סיום שלב 0",
    note: "Teaching numbers only. Each fact reuses a stage-0 lesson's kind.",
    facts: [
      // q1 (0.1): 15% of 240 ₪.
      { id: "q1.answer", kind: "percent_of", inputs: { amount: "240.00", rate_percent: "15" }, value: moneyString(percentOf("240", "15")) },
      compound("q1.new_price", "240", "15", 1),
      { id: "q1.one_percent", kind: "percent_of", inputs: { amount: "240.00", rate_percent: "1" }, value: moneyString(percentOf("240", "1")) },

      // q2 (0.1): a rate from 4% to 6% — points and relative change.
      { id: "q2.points", kind: "percentage_point_change", inputs: { from_percent: "4", to_percent: "6" }, value: percentString(percentagePoints("4", "6")) },
      { id: "q2.relative", kind: "relative_change_percent", inputs: { from: "4", to: "6" }, value: percentString(relativeChangePercent("4", "6")) },

      // q3 (0.2): 5,000 ₪ at 4% simple interest for 3 years.
      loan,
      { id: "q3.answer", kind: "simple_interest", inputs: { principal: "5000", rate_percent: "4", periods: 3 }, value: moneyString(simpleInterest("5000", "4", 3)) },
      { id: "q3.one_year", kind: "simple_interest", inputs: { principal: "5000", rate_percent: "4", periods: 1 }, value: moneyString(simpleInterest("5000", "4", 1)) },
      simple("q3.balance", "5000", "4", 3),
      loanCompound,
      difference("q3.compound_interest", loanCompound, loan),

      // q4 (0.3): 20,000 ₪ compounded at 5% for 4 years; the simple-interest answer as the mistake.
      compound("q4.answer", "20000", "5", 4),
      simple("q4.simple", "20000", "5", 4),

      // q5 (0.3): the rule of 72 at 6%.
      { id: "q5.rule72", kind: "rule_of_72", inputs: { rate_percent: "6" }, value: ruleOf72("6").toString() },

      // q6 (0.4): a 4.8% annual rate, monthly by division.
      {
        id: "q6.answer",
        kind: "monthly_rate_by_division",
        inputs: { annual_percent: "4.8", periods_per_year: 12, decimals: 4 },
        value: roundedString(periodicRateByDivision("4.8", 12), 4),
      },

      // q7 (0.4): 12% a year, credited 1% a month — the effective annual rate.
      {
        id: "q7.monthly",
        kind: "monthly_rate_by_division",
        inputs: { annual_percent: "12", periods_per_year: 12, decimals: 4 },
        value: roundedString(periodicRateByDivision("12", 12), 4),
      },
      {
        id: "q7.effective",
        kind: "effective_annual_rate",
        inputs: { annual_percent: "12", periods_per_year: 12, decimals: 2 },
        value: roundedString(effectiveAnnualRate("12", 12), 2),
      },

      // q8 (0.5): 10,816 ₪ in two years at 4% — its value today.
      { id: "q8.answer", kind: "value_today", inputs: { amount: "10816", rate_percent: "4", periods: 2 }, value: moneyString(valueToday("10816", "4", 2)) },
      {
        id: "q8.percent_off",
        kind: "percent_off_mistake",
        inputs: { amount: "10816", rate_percent: "4", periods: 2 },
        value: moneyString(percentOffMistake("10816", "4", 2)),
      },

      // q9 (0.6): 1,000 ₪ at the end of each of 3 years, at 5%.
      { id: "q9.answer", kind: "stream_value_today", inputs: { payment: "1000", rate_percent: "5", periods: 3 }, value: moneyString(streamValueToday("1000", "5", 3)) },
      { id: "q9.one", kind: "value_today", inputs: { amount: "1000", rate_percent: "5", periods: 3 }, value: moneyString(valueToday("1000", "5", 3)) },

      // q10 (0.7): an index from 104 to 106.6 points.
      { id: "q10.answer", kind: "infl_change_percent", inputs: { old: "104", new: "106.6" }, value: plainNumber(changePercent("104", "106.6")) },
      { id: "q10.points", kind: "infl_index_points", inputs: { old: "104", new: "106.6" }, value: plainNumber(new Decimal("106.6").minus("104")) },

      // q11 (0.8): a 200,000 ₪ indexed debt after a year of 3% inflation.
      { id: "q11.answer", kind: "infl_indexed_balance", inputs: { amount: "200000", inflation_percent: "3", years: 1 }, value: moneyString(indexedBalance("200000", "3", 1)) },

      { id: "q11.added", kind: "percent_of", inputs: { amount: "200000.00", rate_percent: "3" }, value: moneyString(percentOf("200000", "3")) },

      // q12 (0.8): 5% before inflation, 2% inflation — the real rate.
      { id: "q12.real", kind: "infl_real_rate", inputs: { nominal_percent: "5", inflation_percent: "2" }, value: plainNumber(realRate("5", "2")) },

      {
        id: "q12.approx",
        kind: "infl_real_rate_approx",
        inputs: { nominal_percent: "5", inflation_percent: "2" },
        value: plainNumber(approxRealRate("5", "2")),
      },
      { id: "q12.sum", kind: "lend_rate_sum", inputs: { a: "5", b: "2" }, value: plainNumber(new Decimal("5").plus("2")) },

      // q13 (0.9): cost of funds 2.5%, loan rate 6%.
      { id: "q13.answer", kind: "lend_spread", inputs: { loan_rate: "6", cost_rate: "2.5" }, value: plainNumber(spread("6", "2.5")) },

      { id: "q13.sum", kind: "lend_rate_sum", inputs: { a: "6", b: "2.5" }, value: plainNumber(new Decimal("6").plus("2.5")) },

      // q14 (0.10): prime when the Bank of Israel rate is 2.5% (a hypothetical).
      given("q14.addition", PRIME_ADDITION),
      { id: "q14.answer", kind: "lend_prime", inputs: { policy_rate: "2.5", addition: PRIME_ADDITION }, value: plainNumber(primeFromPolicy("2.5")) },

      // q17 (0.11): one payment of 100 ₪ in a year, at a 4% yield.
      { id: "q17.answer", kind: "value_today", inputs: { amount: "100", rate_percent: "4", periods: 1 }, value: moneyString(valueToday("100", "4", 1)) },
      {
        id: "q17.percent_off",
        kind: "percent_off_mistake",
        inputs: { amount: "100", rate_percent: "4", periods: 1 },
        value: moneyString(percentOffMistake("100", "4", 1)),
      },
    ],
  };
}
