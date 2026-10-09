/**
 * Lesson 0.11 — bonds and yield. Every number the lesson, its exercises and
 * its video show is declared here as a fact: what was computed, from which
 * inputs, and the result. The page and the video read data/lessons/0-11.json;
 * checks/independent_check.py (checks/kinds/bonds.py) recomputes every fact.
 *
 * Inputs are teaching numbers (a bond of 100 ₪ that pays a round amount a
 * year), not market yields: no real yield is shown anywhere in the lesson.
 */
import Decimal from "decimal.js";
import {
  bondPrice,
  decimalString,
  deflatedAmount,
  indexedAmount,
  percentOff,
  percentString,
  presentValue,
  pricedPayments,
  singlePaymentYield,
  totalPayments,
} from "../../src/lib/calc/bonds.ts";
import { compoundBalance } from "../../src/lib/calc/compound.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import type { Fact, LessonData } from "../build-data.ts";

const given = (id: string, amount: string): Fact => ({ id, kind: "given", inputs: {}, value: moneyString(amount) });

const pv = (id: string, amount: string, rate: string, years: number): Fact => ({
  id,
  kind: "bond_present_value",
  inputs: { amount, rate_percent: rate, years },
  value: moneyString(presentValue(amount, rate, years)),
});

const price = (id: string, face: string, payment: string, years: number, yieldPercent: string): Fact => ({
  id,
  kind: "bond_price",
  inputs: { face, payment_percent: payment, years, yield_percent: yieldPercent },
  value: moneyString(bondPrice(face, payment, years, yieldPercent)),
});

const priceTable = (id: string, face: string, payment: string, years: number, yieldPercent: string): Fact => ({
  id,
  kind: "bond_price_table",
  inputs: { face, payment_percent: payment, years, yields: yieldPercent },
  value: pricedPayments(face, payment, years, yieldPercent).map((r) => ({
    year: r.year,
    payment: moneyString(r.payment),
    rate: percentString(r.ratePercent),
    pv: moneyString(r.presentValue),
  })),
});

/** The table's own total: each row rounded to the agora, then added — as a statement would. */
const tableTotal = (id: string, face: string, payment: string, years: number, yieldPercent: string): Fact => ({
  id,
  kind: "bond_table_total",
  inputs: { face, payment_percent: payment, years, yields: yieldPercent },
  value: moneyString(
    pricedPayments(face, payment, years, yieldPercent).reduce((s, r) => s.plus(moneyString(r.presentValue)), new Decimal(0)),
  ),
});

const singleYield = (id: string, payment: string, priceAmount: string, years: number): Fact => ({
  id,
  kind: "bond_single_yield",
  inputs: { payment, price: priceAmount, years },
  value: percentString(singlePaymentYield(payment, priceAmount, years)),
});

const indexed = (id: string, amount: string, change: string): Fact => ({
  id,
  kind: "bond_indexed_amount",
  inputs: { amount, index_change_percent: change },
  value: moneyString(indexedAmount(amount, change)),
});

const deflated = (id: string, amount: string, inflation: string): Fact => ({
  id,
  kind: "bond_deflated_amount",
  inputs: { amount, inflation_percent: inflation },
  value: moneyString(deflatedAmount(amount, inflation)),
});

const total = (id: string, face: string, payment: string, years: number): Fact => ({
  id,
  kind: "bond_total_payments",
  inputs: { face, payment_percent: payment, years },
  value: moneyString(totalPayments(face, payment, years)),
});

const series = (id: string, face: string, payment: string, years: number, from: number, to: number): Fact => ({
  id,
  kind: "bond_price_series",
  inputs: { face, payment_percent: payment, years, from_percent: from, to_percent: to },
  value: Array.from({ length: to - from + 1 }, (_, i) => ({
    yield: percentString(from + i),
    price: moneyString(bondPrice(face, payment, years, String(from + i))),
  })),
});

const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

export default function lesson011(): LessonData {
  // The opening question: a 3-year bond paying 5 ₪ a year on 100 ₪, when yields move from 5% to 6%.
  const p5 = price("pred.price_5", "100", "5", 3, "5");
  const p6 = price("pred.price_6", "100", "5", 3, "6");
  const p4 = price("explain.price_4", "100", "5", 3, "4");

  // The one-payment bond: 110 ₪ in a year.
  const onePay = given("one.payment", "110");
  const one100 = given("one.price_100", "100");
  const one105 = given("one.price_105", "105");

  // Indexed and unindexed, one year.
  const idxReceived = indexed("idx.received_3", "102", "3");
  const unidxReal = deflated("unidx.deflated_3", "105", "3");
  const hundred = given("face", "100");

  // The illustration's long bond.
  const p20at5 = price("guided.price_20_5", "100", "5", 20, "5");
  const p20at6 = price("guided.price_20_6", "100", "5", 20, "6");

  // Worked example: 4 years left, 4 ₪ a year, yields now 6%.
  const worked = price("worked.price", "100", "4", 4, "6");
  const workedTotal = total("worked.total_payments", "100", "4", 4);

  // Exercise 7: the same move in yield on a 2-year and a 10-year bond.
  const ex7at5 = given("ex7.price_at_5", "100");
  const ex7two = price("ex7.price_2", "100", "5", 2, "6");
  const ex7ten = price("ex7.price_10", "100", "5", 10, "6");

  const facts: Fact[] = [
    p5,
    p6,
    p4,
    difference("pred.drop", p5, p6),
    // A wrong option in the opening question: taking 6% off the price.
    { id: "pred.err_off", kind: "bond_percent_off", inputs: { amount: "100", rate_percent: "6" }, value: moneyString(percentOff("100", "6")) },
    difference("explain.rise_4", p4, p5),
    onePay,
    one100,
    one105,
    given("one.price_110", "110"),
    singleYield("one.yield_100", "110", "100", 1),
    singleYield("one.yield_105", "110", "105", 1),
    singleYield("one.yield_110", "110", "110", 1),
    difference("one.gain_100", onePay, one100),
    difference("one.gain_105", onePay, one105),
    pv("one.pv_at_10", "110", "10", 1),
    pv("one.pv_at_5", "110", "5", 1),
    priceTable("explain.table_6", "100", "5", 3, "6"),
    priceTable("explain.table_5", "100", "5", 3, "5"),
    priceTable("explain.table_4", "100", "5", 3, "4"),
    tableTotal("explain.table_4_total", "100", "5", 3, "4"),
    series("video.series_3", "100", "5", 3, 1, 9),
    hundred,
    idxReceived,
    singleYield("idx.nominal_yield_3", idxReceived.value as string, "100", 1),
    indexed("idx.received_1", "102", "1"),
    unidxReal,
    difference("unidx.real_gain_3", unidxReal, hundred),
    p20at5,
    p20at6,
    difference("guided.drop_20", p20at5, p20at6),
    priceTable("worked.table", "100", "4", 4, "6"),
    worked,
    workedTotal,
    difference("worked.paper_loss", hundred, worked),
    priceTable("half.table", "100", "6", 3, "4"),
    price("half.price", "100", "6", 3, "4"),
    singleYield("ex2.answer", "105", "100", 1),
    given("ex2.payment", "105"),
    given("ex2.price", "100"),
    pv("ex3.answer", "110", "4", 1),
    {
      id: "ex3.err_times",
      kind: "compound_balance",
      inputs: { principal: "110", rate_percent: "4", periods: 1 },
      value: moneyString(compoundBalance("110", "4", 1)),
    },
    { id: "ex3.err_off", kind: "bond_percent_off", inputs: { amount: "110", rate_percent: "4" }, value: moneyString(percentOff("110", "4")) },
    indexed("ex5.answer", "103", "2"),
    deflated("ex5.err_divided", "103", "2"),
    price("ex6.answer", "100", "3", 2, "5"),
    priceTable("ex6.table", "100", "3", 2, "5"),
    pv("ex6.err_once", "106", "5", 1),
    pv("ex6.err_no_first", "103", "5", 2),
    price("ex6.err_at_3", "100", "3", 2, "3"),
    ex7at5,
    ex7two,
    ex7ten,
    difference("ex7.answer", ex7at5, ex7ten),
    difference("ex7.drop_2", ex7at5, ex7two),
  ];
  const byId = (id: string) => facts.find((x) => x.id === id)!;
  const ratio = (id: string, payment: string, priceAmount: string): Fact => ({
    id,
    kind: "bond_single_yield_decimal",
    inputs: { payment, price: priceAmount, years: 1 },
    value: decimalString(singlePaymentYield(payment, priceAmount, 1).div(100)),
  });
  const ex6coupon2 = pv("ex6.pv_coupon_2", "3", "5", 2);
  const ex5payment = given("ex5.payment", "103");
  facts.push(
    difference("ex2.gain", byId("ex2.payment"), byId("ex2.price")),
    // The yield as a decimal before it becomes a percentage: 10 ÷ 100, 5 ÷ 105.
    ratio("one.ratio_100", "110", "100"),
    ratio("one.ratio_105", "110", "105"),
    // Exercise errors the review asked for.
    ex6coupon2,
    difference("ex6.err_forgot_coupon_2", byId("ex6.answer"), ex6coupon2),
    ex5payment,
    difference("ex5.err_increase", byId("ex5.answer"), ex5payment),
    // Price ticks on the video's price-by-yield chart.
    given("video.tick_90", "90"),
    given("video.tick_110", "110"),
  );

  return {
    lesson: "0.11",
    title: "אג״ח ותשואה",
    note: "Teaching numbers, not market yields. Money rounded to the agora at the end of each calculation; table rows rounded each on its own. Yields shown to two decimal places.",
    facts,
  };
}
