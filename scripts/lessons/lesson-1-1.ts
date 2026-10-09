/**
 * Lesson 1.1 — a mortgage: a loan with collateral. Every number the lesson and
 * its exercises show is declared here as a fact; the page reads
 * data/lessons/1-1.json, and checks/kinds/ltv.py recomputes each one.
 *
 * All amounts are invented round teaching numbers ("בנק א׳" is made up). They
 * leave out the costs of a forced sale and late-payment interest, which the
 * lesson says in words.
 */
import Decimal from "decimal.js";
import { cushionPercent, saleSplit } from "../../src/lib/calc/ltv.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { percentString } from "../../src/lib/calc/percent.ts";
import type { Fact, LessonData } from "../build-data.ts";

type Part = "lender" | "borrower" | "owed";

const given = (id: string, amount: string): Fact => ({ id, kind: "given", inputs: {}, value: moneyString(amount) });

const part = (id: string, sale: string, debt: string, p: Part): Fact => {
  const s = saleSplit(sale, debt);
  const v = p === "lender" ? s.toLender : p === "borrower" ? s.toBorrower : s.stillOwed;
  return { id, kind: "ltv_sale_part", inputs: { sale, debt, part: p }, value: moneyString(v) };
};

const cushion = (id: string, value: string, debt: string): Fact => ({
  id,
  kind: "ltv_cushion",
  inputs: { value, debt },
  value: percentString(cushionPercent(value, debt)),
});

const saleTable = (id: string, debt: string, sales: string[]): Fact => ({
  id,
  kind: "ltv_sale_table",
  inputs: { debt, ...Object.fromEntries(sales.map((s, n) => [`sale_${n + 1}`, s])) },
  value: sales.map((sale, n) => {
    const s = saleSplit(sale, debt);
    return {
      period: n + 1,
      sale: moneyString(sale),
      to_lender: moneyString(s.toLender),
      to_borrower: moneyString(s.toBorrower),
      still_owed: moneyString(s.stillOwed),
    };
  }),
});

const dropPercent = (id: string, from: string, to: string): Fact => ({
  id,
  kind: "ltv_drop_percent",
  inputs: { from, to },
  value: percentString(new Decimal(from).minus(to).div(from).mul(100)),
});

const afterDrop = (id: string, amount: string, drop: string): Fact => ({
  id,
  kind: "ltv_after_drop",
  inputs: { amount, drop_percent: drop },
  value: moneyString(new Decimal(amount).mul(new Decimal(100).minus(drop)).div(100)),
});

const times = (id: string, amount: string, factor: string): Fact => ({
  id,
  kind: "ltv_times",
  inputs: { amount, factor },
  value: moneyString(new Decimal(amount).mul(factor)),
});

const share = (id: string, partOf: string, whole: string): Fact => ({
  id,
  kind: "ltv_share",
  inputs: { part: partOf, whole },
  value: percentString(new Decimal(partOf).div(whole).mul(100)),
});

const sum = (id: string, a: string, b: string): Fact => ({
  id,
  kind: "ltv_sum",
  inputs: { a, b },
  value: moneyString(new Decimal(a).plus(b)),
});

const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

export default function lesson11(): LessonData {
  const wPrice = given("worked.price", "1500000");
  const wDebt = given("worked.debt", "780000");
  const wSale = given("worked.sale", "1380000");
  const ex6value = given("ex6.value", "1600000");
  const ex6debt = given("ex6.debt", "1040000");
  const ex6room = difference("ex6.room", ex6value, ex6debt);

  const facts: Fact[] = [
    // Prediction: the home is sold for 1,200,000 while 500,000 is still owed.
    given("pred.sale", "1200000"),
    given("pred.debt", "500000"),
    part("pred.to_lender", "1200000", "500000", "lender"),
    part("pred.to_borrower", "1200000", "500000", "borrower"),
    times("pred.half", "1200000", "0.5"),

    // Explanation: a home worth 1,000,000 with 600,000 owed, sold at its value and after a fall.
    given("explain.value", "1000000"),
    given("explain.debt", "600000"),
    part("explain.full.to_lender", "1000000", "600000", "lender"),
    part("explain.full.to_borrower", "1000000", "600000", "borrower"),
    given("explain.low_sale", "550000"),
    part("explain.low.to_lender", "550000", "600000", "lender"),
    part("explain.low.still_owed", "550000", "600000", "owed"),
    cushion("explain.cushion", "1000000", "600000"),

    // The illustration's guided tasks.
    given("slider.t2.sale", "500000"),
    part("slider.t2.still_owed", "500000", "600000", "owed"),
    given("slider.t3.big_debt", "900000"),
    afterDrop("slider.t3.sale", "1000000", "10"),
    part("slider.t3.big_debt.to_borrower", "900000", "900000", "borrower"),
    part("slider.t3.small_debt.to_borrower", "900000", "600000", "borrower"),

    // Worked example: bought at 1,500,000; 780,000 still owed; sold at 1,380,000.
    wPrice,
    wDebt,
    wSale,
    difference("worked.fall", wPrice, wSale),
    difference("worked.room", wPrice, wDebt),
    part("worked.big.still_owed", "1380000", "1400000", "owed"),
    given("worked.big_debt", "1400000"),
    dropPercent("worked.drop", "1500000", "1380000"),
    part("worked.to_lender", "1380000", "780000", "lender"),
    part("worked.to_borrower", "1380000", "780000", "borrower"),
    cushion("worked.cushion", "1500000", "780000"),

    // Half-worked table: 720,000 owed, three sale prices.
    given("half.debt", "720000"),
    saleTable("half.table", "720000", ["1000000", "760000", "690000"]),

    // Exercise 3: sold at 950,000, 410,000 owed — what is left for the borrower?
    part("ex3.answer", "950000", "410000", "borrower"),
    part("ex3.to_lender", "950000", "410000", "lender"),
    given("ex3.sale", "950000"),
    given("ex3.debt", "410000"),
    sum("ex3.added", "950000", "410000"),

    // Exercise 4: sold at 640,000, 700,000 owed — what is still owed?
    part("ex4.answer", "640000", "700000", "owed"),
    given("ex4.sale", "640000"),
    given("ex4.debt", "700000"),
    part("ex4.to_borrower", "640000", "700000", "borrower"),

    // Exercise 6: worth 1,600,000, 1,040,000 owed — how far can the value fall?
    cushion("ex6.answer", "1600000", "1040000"),
    share("ex6.debt_share", "1040000", "1600000"),
    ex6value,
    ex6debt,
    ex6room,
    share("ex6.room_over_debt", ex6room.value as string, "1040000"),
  ];

  return {
    lesson: "1.1",
    title: "משכנתא: הלוואה עם בטוחה",
    note: "Invented teaching numbers for a made-up bank. Sales are shown before the costs of the process and late-payment interest.",
    facts,
  };
}
