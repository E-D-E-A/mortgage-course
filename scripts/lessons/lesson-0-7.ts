/**
 * Lesson 0.7 — inflation and the consumer price index. Every number the lesson,
 * its exercises and its video show is declared here as a fact; the page and the
 * video read data/lessons/0-7.json, and checks/kinds/indexation.py recomputes each one.
 *
 * The basket, its prices and every index value here are invented round teaching
 * numbers ("מספרים להמחשה"), not CPI data. The few real facts the lesson states
 * (who publishes the index and when) are sentences with their sources, not numbers
 * computed here.
 */
import { basketCost, chainIndex, changeOnNew, changePercent, deflatedAmount, dropPercent, indexedAmount, indexPoints, indexValue, plainNumber } from "../../src/lib/calc/indexation.ts";
import Decimal from "decimal.js";
import { moneyString } from "../../src/lib/calc/money.ts";
import type { Fact, LessonData } from "../build-data.ts";

type Item = [quantity: number, price: string];

const itemInputs = (items: Item[]) =>
  Object.fromEntries(items.flatMap(([q, p], n) => [[`quantity_${n + 1}`, q], [`price_${n + 1}`, p]]));

const cost = (id: string, items: Item[]): Fact => ({
  id,
  kind: "infl_basket_cost",
  inputs: itemInputs(items),
  value: moneyString(basketCost(items.map(([quantity, price]) => ({ quantity, price })))),
});

const index = (id: string, c: string, base: string): Fact => ({
  id,
  kind: "infl_index_value",
  inputs: { cost: c, base_cost: base },
  value: plainNumber(indexValue(c, base)),
});

const change = (id: string, old: string, next: string): Fact => ({
  id,
  kind: "infl_change_percent",
  inputs: { old, new: next },
  value: plainNumber(changePercent(old, next)),
});

const points = (id: string, old: string, next: string): Fact => ({
  id,
  kind: "infl_index_points",
  inputs: { old, new: next },
  value: plainNumber(indexPoints(old, next)),
});

const chain = (id: string, base: string, inflations: string[]): Fact => ({
  id,
  kind: "infl_chain_index",
  inputs: { base, ...Object.fromEntries(inflations.map((p, n) => [`inflation_${n + 1}`, p])) },
  value: plainNumber(chainIndex(base, inflations)),
});

const added = (id: string, base: string, inflations: string[]): Fact => ({
  id,
  kind: "infl_index_added",
  inputs: { base, ...Object.fromEntries(inflations.map((p, n) => [`inflation_${n + 1}`, p])) },
  // The mistake the exercise names: adding the yearly percentages instead of chaining them.
  value: plainNumber(new Decimal(base).mul(new Decimal(1).plus(inflations.reduce((s, p) => s.plus(p), new Decimal(0)).div(100)))),
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

/** Consecutive index values as a table: each row's start, end, change in points and change in percent. */
const indexTable = (id: string, values: string[]): Fact => ({
  id,
  kind: "infl_index_table",
  inputs: Object.fromEntries(values.map((v, n) => [`index_${n}`, v])),
  value: values.slice(1).map((end, n) => ({
    period: n + 1,
    start: values[n],
    end,
    points: plainNumber(indexPoints(values[n], end)),
    change: plainNumber(changePercent(values[n], end)),
  })),
});

const factor = (id: string, old: string, next: string): Fact => ({
  id,
  kind: "infl_growth_factor",
  inputs: { old, new: next },
  value: plainNumber(new Decimal(next).div(old)),
});

/** The mistake exercise 5 names: adding the index points to the amount as if they were shekels. */
const pointsAsShekels = (id: string, amount: string, old: string, next: string): Fact => ({
  id,
  kind: "infl_points_as_shekels",
  inputs: { amount, old_index: old, new_index: next },
  value: moneyString(new Decimal(amount).plus(indexPoints(old, next))),
});

const onNew = (id: string, old: string, next: string): Fact => ({
  id,
  kind: "infl_change_on_new",
  inputs: { old, new: next },
  value: plainNumber(changeOnNew(old, next)),
});

const drop = (id: string, old: string, next: string): Fact => ({
  id,
  kind: "infl_drop_percent",
  inputs: { old, new: next },
  value: plainNumber(dropPercent(old, next)),
});

const deflated = (id: string, amount: string, baseIndex: string, newIndex: string): Fact => ({
  id,
  kind: "infl_deflated_amount",
  inputs: { amount, base_index: baseIndex, new_index: newIndex },
  value: moneyString(deflatedAmount(amount, baseIndex, newIndex)),
});

const given = (id: string, value: string): Fact => ({ id, kind: "given", inputs: {}, value });

// The teaching basket: bread, milk, vegetables, bus rides. Quantity × price per month.
const BASE: Item[] = [
  [4, "10"],
  [10, "6"],
  [10, "10"],
  [40, "5"],
];
const NOW: Item[] = [
  [4, "12"],
  [10, "6.3"],
  [10, "9.1"],
  [40, "5.25"],
];
const replace = (items: Item[], at: number, price: string): Item[] => items.map((it, n) => (n === at ? [it[0], price] : it));

export default function lesson07(): LessonData {
  const baseTotal = cost("explain.base_total", BASE);
  const nowTotal = cost("explain.now_total", NOW);
  const base = baseTotal.value as string;
  const now = nowTotal.value as string;
  const nowIndex = index("explain.now_index", now, base);
  const y2Cost = given("explain.y2_cost", "424.36");
  const y2Index = index("explain.y2_index", y2Cost.value as string, base);

  const sliderBus = cost("slider.bus10_cost", replace(BASE, 3, "5.5"));
  const sliderBread = cost("slider.bread10_cost", replace(BASE, 0, "11"));
  const sliderMix = cost("slider.mix_cost", replace(replace(BASE, 0, "15"), 2, "8"));

  const workedNew = indexed("worked.basket_new", "5000", "102", "105.06");
  const workedOld = given("worked.basket_old", "5000.00");

  const ex2old = given("ex2.old", "800.00");
  const ex2new = given("ex2.new", "824.00");

  const facts: Fact[] = [
    // What the lesson says about the real index. Data, not computed; all from
    // research/notes/official-sources.md §7 (search summaries of CBS pages,
    // 2026-10-09, not yet read from the pages) and Brain page 7831553 (2026-08-03).
    given("cbs.day", "15"),
    given("cbs.time", "18:30"),
    given("cbs.early_time", "14:00"),
    given("cbs.example_date", "2026-08-14"),
    given("cbs.next_date", "2026-10-15"),
    given("cbs.groups", "10"),
    given("cbs.house_prices_out", "1999"),
    given("cbs.base_year", "2024"),
    given("cbs.data_date", "2026-10-09"),

    // Prediction: an index from 120 to 126.
    points("prediction.points", "120", "126"),
    change("prediction.change", "120", "126"),
    points("prediction.from_100", "100", "126"),
    factor("prediction.factor", "120", "126"),

    // The explanation's basket, item by item and in total.
    ...BASE.map(([q, p], n) => cost(`explain.base_line_${n + 1}`, [[q, p]])),
    ...NOW.map(([q, p], n) => cost(`explain.now_line_${n + 1}`, [[q, p]])),
    ...BASE.map(([, p], n) => change(`explain.item_change_${n + 1}`, p, NOW[n][1])),
    drop("explain.item_drop_3", BASE[2][1], NOW[2][1]),
    baseTotal,
    nowTotal,
    difference("explain.diff", nowTotal, baseTotal),
    index("explain.base_index", base, base),
    nowIndex,
    change("explain.now_change", "100", nowIndex.value as string),
    y2Cost,
    y2Index,
    points("explain.y2_points", nowIndex.value as string, y2Index.value as string),
    change("explain.y2_change", nowIndex.value as string, y2Index.value as string),
    factor("explain.y2_factor", nowIndex.value as string, y2Index.value as string),

    // The illustration's guided tasks.
    sliderBus,
    index("slider.bus10_index", sliderBus.value as string, base),
    sliderBread,
    index("slider.bread10_index", sliderBread.value as string, base),
    sliderMix,
    index("slider.mix_index", sliderMix.value as string, base),

    // Worked example: January index 102, December 105.06.
    change("worked.change", "102", "105.06"),
    factor("worked.factor", "102", "105.06"),
    points("worked.points", "102", "105.06"),
    workedOld,
    workedNew,
    difference("worked.basket_diff", workedNew, workedOld),

    // Half-worked table: 100 → 104 → 109.2 → 114.66.
    indexTable("half.table", ["100", "104", "109.2", "114.66"]),

    // Exercise 2: a basket from 800 to 824.
    ex2old,
    ex2new,
    change("ex2.answer", "800", "824"),
    factor("ex2.factor", "800", "824"),
    difference("ex2.diff", ex2new, ex2old),
    index("ex2.index", "824", "800"),
    onNew("ex2.on_new", "800", "824"),

    // Exercise 3: index 110 → 113.3.
    change("ex3.answer", "110", "113.3"),
    factor("ex3.factor", "110", "113.3"),
    points("ex3.points", "110", "113.3"),
    points("ex3.from_100", "100", "113.3"),
    onNew("ex3.on_new", "110", "113.3"),

    // Exercise 5: index 100 → 103.5, a basket of 2,000.
    indexed("ex5.answer", "2000", "100", "103.5"),
    given("ex5.old", "2000.00"),
    pointsAsShekels("ex5.points_as_shekels", "2000", "100", "103.5"),
    points("ex5.points", "100", "103.5"),
    deflated("ex5.divided", "2000", "100", "103.5"),

    // Exercise 6: two years, 3% and then 6% (not the half-worked table's 4% and 5%).
    chain("ex6.answer", "100", ["3", "6"]),
    chain("ex6.after_1", "100", ["3"]),
    added("ex6.added", "100", ["3", "6"]),
    change("ex6.total_change", "100", plainNumber(chainIndex("100", ["3", "6"]))),
  ];

  const byId = (id: string) => facts.find((f) => f.id === id)!;
  facts.push(difference("ex5.diff", byId("ex5.answer"), byId("ex5.old")));

  return {
    lesson: "0.7",
    title: "אינפלציה ומדד המחירים לצרכן",
    note: "Invented teaching numbers: the basket, its prices and every index value are illustrations, not CPI data.",
    facts,
  };
}
