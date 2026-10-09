/**
 * The stage-1 completion check (src/pages/checks/1.mdx): every number its
 * questions, answers and common wrong answers show, including the stage-0
 * questions it repeats (brief: every stage check includes earlier stages).
 * Each fact reuses a kind a lesson already defined. Teaching numbers only.
 */
import Decimal from "decimal.js";
import { compoundBalance, simpleBalance } from "../../src/lib/calc/compound.ts";
import { disposableIncome } from "../../src/lib/calc/household.ts";
import { indexedBalance } from "../../src/lib/calc/indexation.ts";
import { ltvPercent, maxLoan, minEquity, saleSplit } from "../../src/lib/calc/ltv.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { percentagePoints, percentOf, percentString, sharePercent } from "../../src/lib/calc/percent.ts";
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
const sale = (id: string, salePrice: string, debt: string, part: "lender" | "borrower" | "owed"): Fact => {
  const s = saleSplit(salePrice, debt);
  const v = part === "lender" ? s.toLender : part === "borrower" ? s.toBorrower : s.stillOwed;
  return { id, kind: "ltv_sale_part", inputs: { sale: salePrice, debt, part }, value: moneyString(v) };
};
const ltv = (id: string, loan: string, value: string): Fact => ({
  id,
  kind: "ltv_percent",
  inputs: { loan, value },
  value: ltvPercent(loan, value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(),
});

export default function check1(): LessonData {
  const price = given("q4.price", "1800000.00");
  const loan = given("q4.loan", "1260000.00");
  return {
    lesson: "check-1",
    title: "בדיקת סיום שלב 1",
    note: "Teaching numbers only. Each fact reuses a lesson's kind.",
    facts: [
      // r1 (0.1): an LTV ceiling from 75% to 70% — points, and the relative change as the mistake.
      // How many points 70% is below 75%, and that gap as a share of 75% (the relative-change mistake).
      { id: "r1.points", kind: "percentage_point_change", inputs: { from_percent: "70", to_percent: "75" }, value: percentString(percentagePoints("70", "75")) },
      { id: "r1.relative", kind: "share_percent", inputs: { part: "5", whole: "75" }, value: percentString(sharePercent("5", "75")) },

      // r2 (0.3): 10,000 ₪ at 4% compound for 3 years; simple interest as the mistake.
      compound("r2.answer", "10000", "4", 3),
      { id: "r2.simple", kind: "simple_balance", inputs: { principal: "10000", rate_percent: "4", periods: 3 }, value: moneyString(simpleBalance("10000", "4", 3)) },

      // r3 (0.8): an indexed debt of 300,000 ₪ after a year of 2% inflation.
      {
        id: "r3.answer",
        kind: "infl_indexed_balance",
        inputs: { amount: "300000", inflation_percent: "2", years: 1 },
        value: moneyString(indexedBalance("300000", "2", 1)),
      },
      { id: "r3.added", kind: "percent_of", inputs: { amount: "300000.00", rate_percent: "2" }, value: moneyString(percentOf("300000", "2")) },

      // q2 (1.1): a pledged home sold for 1,200,000 ₪ with 900,000 ₪ owed; and a sale that falls short.
      sale("q2.borrower", "1200000", "900000", "borrower"),
      sale("q2.lender", "1200000", "900000", "lender"),
      sale("q3.owed", "800000", "900000", "owed"),

      // q4 (1.2): price 1,800,000 ₪ (value = price), loan 1,260,000 ₪.
      ltv("q4.answer", "1260000", "1800000"),
      price,
      loan,
      difference("q4.equity", price, loan),
      { id: "q4.equity_share", kind: "share_percent", inputs: { part: "540000.00", whole: "1800000" }, value: percentString(sharePercent("540000", "1800000")) },

      // q5 (1.2): a ceiling of 75% on a 2,000,000 ₪ home — the largest loan and the least equity.
      { id: "q5.max_loan", kind: "ltv_max_loan", inputs: { value: "2000000", ceiling: "75" }, value: moneyString(maxLoan("2000000", "75")) },
      { id: "q5.min_equity", kind: "ltv_min_equity", inputs: { price: "2000000", value: "2000000", ceiling: "75" }, value: moneyString(minEquity("2000000", "2000000", "75")) },

      // q6 (1.2): price 2,000,000 ₪, value 1,900,000 ₪, ceiling 75% — the equity needed.
      { id: "q6.answer", kind: "ltv_min_equity", inputs: { price: "2000000", value: "1900000", ceiling: "75" }, value: moneyString(minEquity("2000000", "1900000", "75")) },
      { id: "q6.max_loan", kind: "ltv_max_loan", inputs: { value: "1900000", ceiling: "75" }, value: moneyString(maxLoan("1900000", "75")) },

      // q8 (1.4): a 1,500,000 ₪ loan, 40% and 35% in two tracks — the third track.
      { id: "q8.first", kind: "percent_of", inputs: { amount: "1500000.00", rate_percent: "40" }, value: moneyString(percentOf("1500000", "40")) },
      { id: "q8.second", kind: "percent_of", inputs: { amount: "1500000.00", rate_percent: "35" }, value: moneyString(percentOf("1500000", "35")) },
      { id: "q8.third", kind: "percent_of", inputs: { amount: "1500000.00", rate_percent: "25" }, value: moneyString(percentOf("1500000", "25")) },

      // q12 (1.9): case A's disposable income before living costs.
      {
        id: "q12.answer",
        kind: "hh_disposable_income",
        inputs: { incomes: "12400|9300", payments: "1450" },
        value: moneyString(disposableIncome(["12400", "9300"], ["1450"])),
      },
      {
        id: "q12.incomes",
        kind: "hh_disposable_income",
        inputs: { incomes: "12400|9300", payments: "0" },
        value: moneyString(disposableIncome(["12400", "9300"], ["0"])),
      },
    ],
  };
}
