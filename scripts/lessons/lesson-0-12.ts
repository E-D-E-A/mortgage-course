/**
 * Lesson 0.12 — the yield curve. Every number the lesson, its exercises and
 * its video show is declared here as a fact; the page and the video read
 * data/lessons/0-12.json, and checks/kinds/bonds.py recomputes each one.
 *
 * The curves are teaching curves — round yields chosen to show a shape — not
 * market data. No real yield or curve is shown anywhere in the lesson.
 */
import Decimal from "decimal.js";
import {
  bondPrice,
  curvePrice,
  curveShape,
  impliedRate,
  inflationGap,
  percentString,
  presentValue,
  pricedPayments,
  simpleDiscount,
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

const implied = (id: string, short: string, shortYears: number, long: string, longYears: number): Fact => ({
  id,
  kind: "bond_implied_rate",
  inputs: { short_percent: short, short_years: shortYears, long_percent: long, long_years: longYears },
  value: percentString(impliedRate(short, shortYears, long, longYears)),
});

const compound = (id: string, principal: string, rate: string, periods: number): Fact => ({
  id,
  kind: "compound_balance",
  inputs: { principal, rate_percent: rate, periods },
  value: moneyString(compoundBalance(principal, rate, periods)),
});

/** A teaching curve: its points, the rate it implies between each two neighbouring points, and its shape. */
const curve = (id: string, points: string): Fact => {
  const pts = points.split(",").map((p) => {
    const [years, y] = p.split(":");
    return { years: Number(years), yieldPercent: y };
  });
  return {
    id,
    kind: "bond_curve",
    inputs: { points },
    value: {
      points: pts.map((p) => ({ years: p.years, yield: percentString(p.yieldPercent) })),
      segments: pts.slice(1).map((p, i) => ({
        from: pts[i].years,
        to: p.years,
        rate: percentString(impliedRate(pts[i].yieldPercent, pts[i].years, p.yieldPercent, p.years)),
      })),
      shape: curveShape(pts),
    },
  };
};

const curveTable = (id: string, face: string, payment: string, yields: string): Fact => ({
  id,
  kind: "bond_price_table",
  inputs: { face, payment_percent: payment, years: yields.split(",").length, yields },
  value: pricedPayments(face, payment, yields.split(",").length, yields.split(",")).map((r) => ({
    year: r.year,
    payment: moneyString(r.payment),
    rate: percentString(r.ratePercent),
    pv: moneyString(r.presentValue),
  })),
});

const onCurve = (id: string, face: string, payment: string, yields: string): Fact => ({
  id,
  kind: "bond_curve_price",
  inputs: { face, payment_percent: payment, curve: yields },
  value: moneyString(curvePrice(face, payment, yields.split(","))),
});

const price = (id: string, face: string, payment: string, years: number, yieldPercent: string): Fact => ({
  id,
  kind: "bond_price",
  inputs: { face, payment_percent: payment, years, yield_percent: yieldPercent },
  value: moneyString(bondPrice(face, payment, years, yieldPercent)),
});

const gap = (id: string, nominal: string, real: string): Fact => ({
  id,
  kind: "bond_inflation_gap",
  inputs: { nominal_percent: nominal, real_percent: real },
  value: percentString(inflationGap(nominal, real)),
});

const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

export default function lesson012(): LessonData {
  const forward = implied("pred.forward", "3", 1, "4", 2);
  const twoLong = compound("two.long", "100", "4", 2);
  const twoShort = compound("two.short", "100", "3", 1);

  const workedCurve = onCurve("worked.price", "100", "5", "3,4,5");
  const workedFlat = price("worked.flat_5", "100", "5", 3, "5");

  const gapNominal = given("gap.nominal", "4");
  const gapReal = given("gap.real", "2");

  const ex2long = given("ex2.long", "4.5");
  const ex2short = given("ex2.short", "3");

  const facts: Fact[] = [
    curve("curve.rising", "1:3,2:3.25,5:3.75,10:4.25,20:4.75"),
    curve("curve.flat", "1:4,2:4,5:4,10:4,20:4"),
    curve("curve.falling", "1:5,2:4.5,5:4,10:3.75,20:3.5"),
    forward,
    { id: "pred.forward_whole", kind: "bond_round_whole", inputs: { of: forward.id }, value: new Decimal(forward.value as string).toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toString() },
    twoLong,
    twoShort,
    difference("two.needed", twoLong, twoShort),
    pv("zero.pv_2", "100", "4", 2),
    curveTable("worked.table", "100", "5", "3,4,5"),
    workedCurve,
    workedFlat,
    difference("worked.gap", workedCurve, workedFlat),
    curveTable("half.table", "100", "4", "2,3,4"),
    onCurve("half.price", "100", "4", "2,3,4"),
    gapNominal,
    gapReal,
    gap("gap.answer", "4", "2"),
    difference("gap.simple", gapNominal, gapReal),
    ex2long,
    ex2short,
    difference("ex2.answer", ex2long, ex2short),
    pv("ex3.answer", "100", "4", 2),
    pv("ex3.err_one_year", "100", "4", 1),
    { id: "ex3.err_simple", kind: "bond_simple_discount", inputs: { amount: "100", rate_percent: "4", years: 2 }, value: moneyString(simpleDiscount("100", "4", 2)) },
    pv("ex3.err_short_yield", "100", "3", 2),
    implied("ex4.answer", "2", 1, "3", 2),
    gap("ex5.answer", "4", "1.5"),
    given("ex5.nominal", "4"),
    given("ex5.real", "1.5"),
    curveTable("ex6.table", "100", "4", "3,3.5,4"),
    onCurve("ex6.answer", "100", "4", "3,3.5,4"),
    price("ex6.err_flat_4", "100", "4", 3, "4"),
  ];

  const byId = (id: string) => facts.find((x) => x.id === id)!;
  facts.push(
    { id: "ex4.answer_whole", kind: "bond_round_whole", inputs: { of: "ex4.answer" }, value: new Decimal(byId("ex4.answer").value as string).toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toString() },
    difference("ex5.simple", byId("ex5.nominal"), byId("ex5.real")),
  );

  return {
    lesson: "0.12",
    title: "עקום התשואות",
    note: "Teaching curves, not market data. Money rounded to the agora at the end of each calculation; table rows rounded each on its own. Yields and implied rates shown to two decimal places.",
    facts,
  };
}
