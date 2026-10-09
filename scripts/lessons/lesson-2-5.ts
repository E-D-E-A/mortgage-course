/**
 * Lesson 2.5 — the fixed tracks: fixed unlinked (קל״צ) and fixed linked
 * (קבועה צמודה). Every number the lesson and its exercises show is declared
 * here as a fact; the page reads data/lessons/2-5.json, and
 * checks/kinds/amortization.py (with indexation.py for the index arithmetic
 * from lesson 0.8) recomputes each one.
 *
 * All loans, rates and inflation paths are invented teaching numbers
 * ("מספרים להמחשה, לא תחזית"). The level payment comes from amortization.ts;
 * the lesson shows it as a computed result and teaches it in 3.1. The index is
 * assumed to rise evenly through a year (a twelfth root per month), and every
 * payment is the scheduled payment times the index ratio (lesson 0.8).
 *
 * The two average rates of February 2026 are Bank of Israel data as recorded
 * in the Brain (page 67469313, BIR_MRTG_99), not read from the source: "לא אומת".
 */
import Decimal from "decimal.js";
import {
  annuityBalance,
  annuityPayment,
  blockPath,
  indexPath,
  monthInterest,
  pathSchedule,
  yearlySummary,
} from "../../src/lib/calc/amortization.ts";
import { chainIndex, changePercent, indexedAmount, indexPoints, indexedBalance, plainNumber, realValue } from "../../src/lib/calc/indexation.ts";
import { yearInterest } from "../../src/lib/calc/lending.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import type { Fact, LessonData } from "../build-data.ts";

const given = (id: string, value: unknown): Fact => ({ id, kind: "given", inputs: {}, value });

const payment = (id: string, principal: string, rate: string, months: number): Fact => ({
  id,
  kind: "amort_payment",
  inputs: { principal, rate_percent: rate, months },
  value: moneyString(annuityPayment(principal, rate, months)),
});

const balance = (id: string, principal: string, rate: string, months: number, paid: number): Fact => ({
  id,
  kind: "amort_balance",
  inputs: { principal, rate_percent: rate, months, paid },
  value: moneyString(annuityBalance(principal, rate, months, paid)),
});

const interest = (id: string, amount: string, rate: string): Fact => ({
  id,
  kind: "amort_month_interest",
  inputs: { balance: amount, rate_percent: rate },
  value: moneyString(monthInterest(amount, rate)),
});

/** A fixed-rate track over `months`, linked to an index that rises by `inflation` a year when given. */
const pathInputs = (principal: string, rate: string, months: number, inflation?: string) => ({
  principal,
  months,
  block_months: months,
  rate_1: rate,
  ...(inflation === undefined ? {} : { inflation_1: inflation }),
});
const rowsOf = (principal: string, rate: string, months: number, inflation?: string) =>
  pathSchedule(principal, blockPath([rate], months, months), inflation === undefined ? undefined : indexPath([inflation], months, months));

const series = (id: string, principal: string, rate: string, months: number, inflation?: string): Fact => ({
  id,
  kind: "amort_path_series",
  inputs: pathInputs(principal, rate, months, inflation),
  value: yearlySummary(rowsOf(principal, rate, months, inflation)).map((y) => ({
    year: y.year,
    payment: moneyString(y.payment),
    balance: moneyString(y.balance),
  })),
});

const pathBalance = (id: string, principal: string, rate: string, months: number, inflation: string, month: number): Fact => ({
  id,
  kind: "amort_path_balance",
  inputs: { ...pathInputs(principal, rate, months, inflation), month },
  value: moneyString(rowsOf(principal, rate, months, inflation)[month - 1].closing),
});

const indexed = (id: string, amount: string, base: string, now: string): Fact => ({
  id,
  kind: "infl_indexed_amount",
  inputs: { amount, base_index: base, new_index: now },
  value: moneyString(indexedAmount(amount, base, now)),
});

const grown = (id: string, amount: string, inflation: string, years: number): Fact => ({
  id,
  kind: "infl_indexed_balance",
  inputs: { amount, inflation_percent: inflation, years },
  value: moneyString(indexedBalance(amount, inflation, years)),
});

const real = (id: string, amount: string, inflation: string, years: number): Fact => ({
  id,
  kind: "infl_real_value",
  inputs: { amount, inflation_percent: inflation, years },
  value: moneyString(realValue(amount, inflation, years)),
});

const chain = (id: string, base: string, inflations: string[]): Fact => ({
  id,
  kind: "infl_chain_index",
  inputs: { base, ...Object.fromEntries(inflations.map((p, n) => [`inflation_${n + 1}`, p])) },
  value: plainNumber(chainIndex(base, inflations)),
});

const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

/** Statement convention: each year's payment is last year's, rounded to the agora, times (1 + inflation). */
const linkedTable = (id: string, base: string, inflation: string, years: number): Fact => {
  const g = new Decimal(1).plus(new Decimal(inflation).div(100));
  let pay = new Decimal(base);
  const rows = Array.from({ length: years }, (_, k) => {
    pay = new Decimal(moneyString(pay.mul(g)));
    return { period: k + 1, index: plainNumber(indexedBalance("100", inflation, k + 1)), payment: moneyString(pay) };
  });
  return { id, kind: "amort_linked_payment_table", inputs: { payment: base, inflation_percent: inflation, years, base_index: "100" }, value: rows };
};

const v = (f: Fact) => f.value as string;

export default function lesson25(): LessonData {
  // The explanation: one track of 600,000 ₪ for 20 years, as unlinked at 5% or linked at 3%.
  const P = "600000";
  const N = 240;
  const amount = given("case.amount", "600000.00");
  const unlinked = payment("explain.unlinked_payment", P, "5", N);
  const unlinkedInterest = interest("explain.unlinked_interest", P, "5");
  const linked = payment("explain.linked_payment", P, "3", N);
  const linkedInterest = interest("explain.linked_interest", P, "3");
  const linkedYear1 = indexed("explain.linked_year1", v(linked), "100", "102");
  const linkedBalance12 = balance("explain.linked_balance_12", P, "3", N, 12);
  const linkedBalance12Indexed = indexed("explain.linked_balance_12_indexed", v(linkedBalance12), "100", "102");
  const unlinkedBalance12 = balance("explain.unlinked_balance_12", P, "5", N, 12);

  // Worked example: case A asks about two fixed tracks of 500,000 ₪ for 25 years.
  const W = "500000";
  const WN = 300;
  const workedUnlinked = payment("worked.unlinked_payment", W, "4.8", WN);
  const workedInterest = interest("worked.unlinked_interest", W, "4.8");
  const workedLinked = payment("worked.linked_payment", W, "3.2", WN);
  const workedIndex = chain("worked.index_5", "100", ["2.5", "2.5", "2.5", "2.5", "2.5"]);

  // Exercise 6: 3% for 20 years with 5% inflation; the schedule's balance after 5 years.
  const ex6Plain = balance("ex6.plain_balance", P, "3", N, 60);

  const facts: Fact[] = [
    amount,
    given("case.years", "20"),
    given("case.months", "240"),
    given("rate.unlinked", "5"),
    given("rate.linked", "3"),
    given("infl.base", "2"),

    // Explanation.
    unlinked,
    unlinkedInterest,
    difference("explain.unlinked_down", unlinked, unlinkedInterest),
    unlinkedBalance12,
    linked,
    linkedInterest,
    difference("explain.linked_down", linked, linkedInterest),
    linkedYear1,
    linkedBalance12,
    linkedBalance12Indexed,
    grown("explain.linked_year10", v(linked), "2", 10),
    real("explain.unlinked_real10", v(unlinked), "2", 10),

    // Official averages, February 2026 (Brain 67469313; not verified against the source).
    given("market.month", "2026-02"),
    given("market.unlinked", "4.74"),
    given("market.linked", "3.25"),

    // The illustration's guided tasks: inflation 2% in every year, then 0%, then 5% in years 1–5.
    series("slider.unlinked", P, "5", N),
    series("slider.linked_2", P, "3", N, "2"),
    series("slider.linked_0", P, "3", N, "0"),
    pathBalance("slider.linked_5_after5", P, "3", N, "5", 60),

    // Worked example.
    given("worked.amount", "500000.00"),
    workedUnlinked,
    workedInterest,
    difference("worked.unlinked_down", workedUnlinked, workedInterest),
    workedLinked,
    workedIndex,
    grown("worked.linked_after5", v(workedLinked), "2.5", 5),
    real("worked.unlinked_real5", v(workedUnlinked), "2.5", 5),

    // Half-worked table: the linked payment of the explanation, year by year at 2%.
    linkedTable("half.table", v(linked), "2", 4),

    // Exercise 3: a scheduled payment of 2,800 ₪, base index 102.4, index now 107.52.
    indexed("ex3.answer", "2800", "102.4", "107.52"),
    indexed("ex3.base_100", "2800", "100", "107.52"),
    indexed("ex3.points", "2800", "100", "105.12"),
    { id: "ex3.points_value", kind: "infl_index_points", inputs: { old: "102.4", new: "107.52" }, value: plainNumber(indexPoints("102.4", "107.52")) },
    { id: "ex3.change", kind: "infl_change_percent", inputs: { old: "102.4", new: "107.52" }, value: plainNumber(changePercent("102.4", "107.52")) },
    // Exercise 4: the first month's interest on 450,000 ₪ at 4.4%.
    interest("ex4.answer", "450000", "4.4"),
    { id: "ex4.year", kind: "lend_year_interest", inputs: { amount: "450000", rate_percent: "4.4" }, value: moneyString(yearInterest("450000", "4.4")) },
    // The mistake 4.4% → 0.44 (instead of 0.044): the same arithmetic with 44%.
    interest("ex4.tenfold", "450000", "44"),
    // Exercise 5: a fixed unlinked payment of 4,000 ₪, eight years of 3% inflation.
    real("ex5.answer", "4000", "3", 8),
    grown("ex5.indexed", "4000", "3", 8),
    { id: "ex5.simple", kind: "infl_indexed_balance", inputs: { amount: "4000", inflation_percent: "-24", years: 1 }, value: moneyString(indexedBalance("4000", "-24", 1)) },
    // Exercise 6: the balance in shekels after five years of 5% inflation.
    ex6Plain,
    grown("ex6.answer", v(ex6Plain), "5", 5),
    grown("ex6.simple", v(ex6Plain), "25", 1),
    pathBalance("ex6.exact", P, "3", N, "5", 60),
  ];

  return {
    lesson: "2.5",
    title: "מסלולים קבועים",
    note: "Invented teaching numbers: loans, rates and inflation are illustrations, not market data or a forecast. The February 2026 averages are Bank of Israel data as recorded in the Brain (67469313), not verified. Level payments from amortization.ts (annual rate ÷ 12); the index rises evenly within a year.",
    facts,
  };
}
