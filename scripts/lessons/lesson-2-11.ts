/**
 * Lesson 2.11 — the same debt balance: interest and indexation, each on its
 * own. Every number the lesson, its exercises and its video show is declared
 * here as a fact; the page and the video read data/lessons/2-11.json, and
 * checks/kinds/balance.py (with indexation.py for the two indexation kinds)
 * recomputes each one.
 *
 * The model is yearly on purpose (monthly schedules are stage 3): indexation
 * first, then interest on the indexed balance, then one payment at the end of
 * the year. Balances, rates, index rises and payments are invented round
 * teaching numbers ("מספרים להמחשה"), not market data and not a forecast.
 */
import Decimal from "decimal.js";
import {
  balanceAfterYear,
  balanceTable,
  indexationAdded,
  interestOnIndexation,
  rateChangeInterest,
  yearInterest,
} from "../../src/lib/calc/balance.ts";
import { indexedAmount } from "../../src/lib/calc/indexation.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import type { Fact, LessonData } from "../build-data.ts";

const given = (id: string, value: string): Fact => ({ id, kind: "given", inputs: {}, value });

const indexation = (id: string, balance: string, inflation: string): Fact => ({
  id,
  kind: "bal_indexation",
  inputs: { balance, inflation_percent: inflation },
  value: moneyString(indexationAdded(balance, inflation)),
});

const interest = (id: string, balance: string, rate: string, inflation = "0"): Fact => ({
  id,
  kind: "bal_interest",
  inputs: { balance, rate_percent: rate, inflation_percent: inflation },
  value: moneyString(yearInterest(balance, rate, inflation)),
});

const interestOnIdx = (id: string, balance: string, rate: string, inflation: string): Fact => ({
  id,
  kind: "bal_interest_on_indexation",
  inputs: { balance, rate_percent: rate, inflation_percent: inflation },
  value: moneyString(interestOnIndexation(balance, rate, inflation)),
});

const rateChange = (id: string, balance: string, oldRate: string, newRate: string): Fact => ({
  id,
  kind: "bal_rate_change_interest",
  inputs: { balance, old_rate_percent: oldRate, new_rate_percent: newRate },
  value: moneyString(rateChangeInterest(balance, oldRate, newRate)),
});

const after = (id: string, balance: string, rate: string, inflation: string, payment: string): Fact => ({
  id,
  kind: "bal_after_year",
  inputs: { balance, rate_percent: rate, inflation_percent: inflation, payment },
  value: moneyString(balanceAfterYear(balance, rate, inflation, payment)),
});

const table = (id: string, balance: string, rate: string, inflation: string, payment: string, years: number): Fact => ({
  id,
  kind: "bal_table",
  inputs: { balance, rate_percent: rate, inflation_percent: inflation, payment, years },
  value: balanceTable(balance, rate, inflation, payment, years).map((r) => ({
    period: r.period,
    opening: moneyString(r.opening),
    indexation: moneyString(r.indexation),
    interest: moneyString(r.interest),
    closing: moneyString(r.closing),
  })),
});

const indexed = (id: string, amount: string, baseIndex: string, newIndex: string): Fact => ({
  id,
  kind: "infl_indexed_amount",
  inputs: { amount, base_index: baseIndex, new_index: newIndex },
  value: moneyString(indexedAmount(amount, baseIndex, newIndex)),
});

const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

const sum = (id: string, ...addends: Fact[]): Fact => ({
  id,
  kind: "bal_sum",
  inputs: Object.fromEntries(addends.map((a, k) => [`addend_${k + 1}`, a.id])),
  value: moneyString(addends.reduce((s, a) => s.plus(a.value as string), new Decimal(0))),
});

export default function lesson211(): LessonData {
  // The lesson's one balance and one payment.
  const balance = given("explain.balance", "500000.00");
  const payment = given("explain.payment", "30000.00");

  // Force 1, on an unindexed track: interest at 5%, then the rate rises to 6%.
  const u5 = interest("u.interest_5", "500000", "5");
  const u6 = interest("u.interest_6", "500000", "6");
  const uAfter5 = after("u.after_5", "500000", "5", "0", "30000");
  const uAfter6 = after("u.after_6", "500000", "6", "0", "30000");

  // Force 2, on an indexed track: 3%, index 100 → 102.
  const iIdx = indexation("i.indexation", "500000", "2");
  const iIndexed = indexed("i.indexed_balance", "500000", "100", "102");
  const iInterest = interest("i.interest", "500000", "3", "2");
  const iBase = interest("i.interest_base", "500000", "3");
  const iOnIdx = interestOnIdx("i.interest_on_indexation", "500000", "3", "2");
  const iAfter = after("i.after", "500000", "3", "2", "30000");
  const iNoIdx = after("i.after_no_index", "500000", "3", "0", "30000");
  const iIdxTotal = sum("i.index_total", iIdx, iOnIdx);
  const iCharged = sum("i.interest_and_index", iInterest, iIdx);

  const thumbInterest = interest("thumb.both_rates", "500000", "5");

  // Worked example: two tracks of 300,000 each, 24,000 paid on each this year.
  const wBalance = given("worked.balance", "300000.00");
  const wPayment = given("worked.payment", "24000.00");
  const aBase = interest("worked.a.interest_base", "300000", "5.5");
  const aChange = rateChange("worked.a.change", "300000", "5.5", "6");
  const aInterest = interest("worked.a.interest", "300000", "6");
  const aAfter = after("worked.a.after", "300000", "6", "0", "24000");
  const bIdx = indexation("worked.b.indexation", "300000", "2.5");
  const bBase = interest("worked.b.interest_base", "300000", "3");
  const bOnIdx = interestOnIdx("worked.b.interest_on_indexation", "300000", "3", "2.5");
  const bInterest = interest("worked.b.interest", "300000", "3", "2.5");
  const bAfter = after("worked.b.after", "300000", "3", "2.5", "24000");
  const bPush = sum("worked.b.push", bIdx, bOnIdx);
  const bIndexed = sum("worked.b.indexed", wBalance, bIdx);

  // Exercise 2.
  const e2Balance = given("ex2.balance", "300000.00");
  const e2Payment = given("ex2.payment", "24000.00");

  // Exercise 3.
  const e3Balance = given("ex3.balance", "400000.00");
  const e3Idx = indexation("ex3.indexation", "400000", "3");

  // Exercise 4.
  const e4Balance = given("ex4.balance", "600000.00");
  const e4After = after("ex4.after", "600000", "3.5", "2", "36000");
  const e4Payment = given("ex4.payment", "36000.00");
  const e4NoIdx = after("ex4.after_no_index", "600000", "3.5", "0", "36000");
  const e4Idx = indexation("ex4.indexation", "600000", "2");
  const e4Base = interest("ex4.interest_base", "600000", "3.5");
  const e4Sum = sum("ex4.forgot_cross_parts", e4Idx, e4Base);
  const e4Interest = interest("ex4.interest", "600000", "3.5", "2");

  // Exercise 5: one point of rate against one percent of index, on the same 500,000.
  const e5Rate = rateChange("ex5.rate", "500000", "5", "6");
  const e5Idx = indexation("ex5.indexation", "500000", "1");
  const e5OnIdx = interestOnIdx("ex5.interest_on_indexation", "500000", "3", "1");

  // Exercise 6.
  const e6Idx = indexation("ex6.indexation", "400000", "4");
  const e6Interest = interest("ex6.interest", "400000", "3", "4");
  const e6Base = interest("ex6.interest_base", "400000", "3");
  const e6Balance = given("ex6.balance", "400000.00");

  const facts: Fact[] = [
    balance,
    payment,
    // Prediction: indexed, 3%, index +2%, 30,000 paid.
    difference("prediction.paid_only", balance, payment),

    // Explanation: force 1.
    u5,
    uAfter5,
    difference("u.principal_paid_5", payment, u5),
    u6,
    rateChange("u.change_extra", "500000", "5", "6"),
    uAfter6,
    // Explanation: force 2.
    iIdx,
    iIndexed,
    iInterest,
    iBase,
    iOnIdx,
    iAfter,
    difference("i.down", balance, iAfter),
    iNoIdx,
    difference("i.index_effect", iAfter, iNoIdx),
    iIdxTotal,
    iCharged,
    difference("i.principal_paid", payment, iCharged),

    // The rule of thumb: P × (π + r) − C, skipping the small P × π × r.
    thumbInterest,
    difference("thumb.approx_down", payment, thumbInterest),

    // The illustration's third task: the index rises 6% instead of 2%.
    after("slider.idx6_after", "500000", "3", "6", "30000"),

    // Worked example.
    wBalance,
    wPayment,
    aBase,
    aChange,
    aInterest,
    aAfter,
    difference("worked.a.down", wBalance, aAfter),
    bIdx,
    bIndexed,
    bBase,
    bOnIdx,
    bInterest,
    bAfter,
    difference("worked.b.down", wBalance, bAfter),
    bPush,

    // Half-worked table: indexed, 100,000, 3%, index +2% a year, 8,000 paid each year.
    table("half.table", "100000", "3", "2", "8000", 3),

    // Exercise 2: unindexed 300,000 at 4%, 24,000 paid.
    after("ex2.answer", "300000", "4", "0", "24000"),
    interest("ex2.interest", "300000", "4"),
    e2Balance,
    e2Payment,
    difference("ex2.no_interest", e2Balance, e2Payment),
    after("ex2.no_payment", "300000", "4", "0", "0"),

    // Exercise 3: indexed 400,000 at 2%, index +3%: the year's interest.
    interest("ex3.answer", "400000", "2", "3"),
    interest("ex3.on_opening", "400000", "2"),
    e3Idx,
    sum("ex3.indexed", e3Balance, e3Idx),
    e3Balance,
    interest("ex3.rates_added", "400000", "5"),

    // Exercise 4: indexed 600,000 at 3.5%, index +2%, 36,000 paid: how much did the balance go down?
    e4Balance,
    e4Payment,
    e4Idx,
    sum("ex4.indexed", e4Balance, e4Idx),
    e4Base,
    e4Interest,
    e4After,
    difference("ex4.answer", e4Balance, e4After),
    e4NoIdx,
    difference("ex4.no_index_down", e4Balance, e4NoIdx),
    e4Sum,
    difference("ex4.forgot_cross", e4Payment, e4Sum),

    // Exercise 5.
    e5Rate,
    e5Idx,
    e5OnIdx,
    sum("ex5.index_total", e5Idx, e5OnIdx),

    // Exercise 6: indexed 400,000 at 3%, index +4%: the smallest payment that keeps the balance from growing.
    e6Balance,
    e6Idx,
    sum("ex6.indexed", e6Balance, e6Idx),
    e6Interest,
    e6Base,
    sum("ex6.answer", e6Idx, e6Interest),
    sum("ex6.no_cross", e6Idx, e6Base),
  ];

  return {
    lesson: "2.11",
    title: "אותה יתרת חוב: ריבית מול הצמדה, כל אחד בנפרד",
    note: "Yearly teaching model: indexation, then interest on the indexed balance, then one payment at the end of the year. Invented teaching numbers, not market data. Money rounded to the agora only at the end; the half table rounds each year's parts.",
    facts,
  };
}
