/**
 * The stage-2 completion check (src/pages/checks/2.mdx): every number its
 * questions, answers and common wrong answers show, including the questions it
 * repeats from stages 0 and 1. Each fact reuses a kind a lesson already defined.
 * Teaching numbers only.
 */
import Decimal from "decimal.js";
import { balanceAfterYear } from "../../src/lib/calc/balance.ts";
import { inflationGap } from "../../src/lib/calc/bonds.ts";
import { disposableIncome } from "../../src/lib/calc/household.ts";
import { indexedBalance, plainNumber } from "../../src/lib/calc/indexation.ts";
import { primeFromPolicy, PRIME_ADDITION } from "../../src/lib/calc/lending.ts";
import { ltvPercent } from "../../src/lib/calc/ltv.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { percentOf, percentString } from "../../src/lib/calc/percent.ts";
import { periodicRateByDivision, roundedString } from "../../src/lib/calc/rates.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { repCell, repPayment } from "./lesson-2-9.ts";

const rateSum = (id: string, a: string, b: string): Fact => ({
  id,
  kind: "lend_rate_sum",
  inputs: { a, b },
  value: plainNumber(new Decimal(a).plus(b)),
});
const ltv = (id: string, loan: string, value: string): Fact => ({
  id,
  kind: "ltv_percent",
  inputs: { loan, value },
  value: ltvPercent(loan, value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(),
});
const pctOf = (id: string, amount: string, rate: string): Fact => ({
  id,
  kind: "percent_of",
  inputs: { amount, rate_percent: rate },
  value: moneyString(percentOf(amount, rate)),
});
const afterYear = (id: string, balance: string, rate: string, inflation: string, payment: string): Fact => ({
  id,
  kind: "bal_after_year",
  inputs: { balance, rate_percent: rate, inflation_percent: inflation, payment },
  value: moneyString(balanceAfterYear(balance, rate, inflation, payment)),
});

export default function check2(): LessonData {
  return {
    lesson: "check-2",
    title: "בדיקת סיום שלב 2",
    note: "Teaching numbers only. Each fact reuses a lesson's kind.",
    facts: [
      // r1 (0.4): 6% a year, monthly by division.
      {
        id: "r1.answer",
        kind: "monthly_rate_by_division",
        inputs: { annual_percent: "6", periods_per_year: 12, decimals: 4 },
        value: roundedString(periodicRateByDivision("6", 12), 4),
      },
      // r2 (1.2): a 1,350,000 ₪ loan on a 1,800,000 ₪ home; the equity share as the mistake.
      ltv("r2.answer", "1350000", "1800000"),
      ltv("r2.equity_share", "450000", "1800000"),
      // r3 (1.9): incomes 15,000 and 8,000, a fixed payment of 2,000.
      {
        id: "r3.answer",
        kind: "hh_disposable_income",
        inputs: { incomes: "15000|8000", payments: "2000" },
        value: moneyString(disposableIncome(["15000", "8000"], ["2000"])),
      },
      {
        id: "r3.incomes",
        kind: "hh_disposable_income",
        inputs: { incomes: "15000|8000", payments: "0" },
        value: moneyString(disposableIncome(["15000", "8000"], ["0"])),
      },

      // q1 (2.1): Bank of Israel rate 3% (supposed) → prime → a track at prime − 0.8.
      { id: "q1.addition", kind: "given", inputs: {}, value: PRIME_ADDITION },
      { id: "q1.prime", kind: "lend_prime", inputs: { policy_rate: "3", addition: PRIME_ADDITION }, value: plainNumber(primeFromPolicy("3")) },
      rateSum("q1.answer", plainNumber(primeFromPolicy("3")), "-0.8"),
      rateSum("q1.added", plainNumber(primeFromPolicy("3")), "0.8"),
      rateSum("q1.from_boi", "3", "-0.8"),

      // q4 (2.3): 100,000 ₪ indexed, 2% inflation, 3% real — the first year's interest.
      {
        id: "q4.indexed",
        kind: "infl_indexed_balance",
        inputs: { amount: "100000", inflation_percent: "2", years: 1 },
        value: moneyString(indexedBalance("100000", "2", 1)),
      },
      pctOf("q4.answer", moneyString(indexedBalance("100000", "2", 1)), "3"),
      pctOf("q4.on_original", "100000.00", "3"),
      pctOf("q4.added_rates", "100000.00", "5"),

      // q5 (2.3): unindexed 5%, indexed 3% — the inflation at which they cost the same.
      { id: "q5.answer", kind: "bond_inflation_gap", inputs: { nominal_percent: "5", real_percent: "3" }, value: percentString(inflationGap("5", "3")) },
      rateSum("q5.subtracted", "5", "-3"),

      // q8 (2.6): prime 5% (supposed), a track at prime − 0.5, the Bank of Israel adds 0.25 points.
      rateSum("q8.prime_after", "5", "0.25"),
      rateSum("q8.answer", "5.25", "-0.5"),
      rateSum("q8.before", "5", "-0.5"),

      // q12 (2.9): 120,000 ₪ over 120 months at 6% — equal principal, month 1; Spitzer as the mistake.
      repCell("q12.principal", "equal_principal", "120000", "6", 120, 1, "principal"),
      repCell("q12.interest", "equal_principal", "120000", "6", 120, 1, "interest"),
      repCell("q12.answer", "equal_principal", "120000", "6", 120, 1, "payment"),
      repPayment("q12.spitzer", "120000", "6", 120),

      // q14 (2.10): 200,000 ₪ at 6% for 120 months, 12 months of partial grace — a grace-month payment.
      repCell("q14.answer", "grace_partial", "200000", "6", 120, 1, "payment", 12),

      // q16 (2.11): one year — 100,000 ₪, 2% indexation, 4% interest, a 10,000 ₪ payment.
      afterYear("q16.answer", "100000", "4", "2", "10000"),
      afterYear("q16.no_index", "100000", "4", "0", "10000"),
      afterYear("q16.no_payment", "100000", "4", "2", "0"),
    ],
  };
}
