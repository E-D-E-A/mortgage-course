/**
 * Lesson 2.4 — "nominal": one word, two meanings. Every number the lesson and
 * its exercises show is declared here as a fact; the page reads
 * data/lessons/2-4.json, and checks/kinds/tracks.py recomputes each computed one.
 *
 * All rates and the inflation are invented teaching numbers. The 5.90% → 6.06%
 * example is the Brain's worked example (page 7798786), recomputed here.
 */
import Decimal from "decimal.js";
import { plainNumber } from "../../src/lib/calc/indexation.ts";
import { periodicRateFromEffective } from "../../src/lib/calc/rates.ts";
import { breakEvenInflation, effectiveFromStated, monthlyByDivision, rateBeforeInflation, realRate } from "../../src/lib/calc/tracks.ts";
import type { Fact, LessonData } from "../build-data.ts";

const given = (id: string, value: unknown): Fact => ({ id, kind: "given", inputs: {}, value });

const monthly = (id: string, annual: string, decimals = 2): Fact => ({
  id,
  kind: "trk_monthly",
  inputs: { annual, decimals },
  value: monthlyByDivision(annual).toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP).toString(),
});

const effective = (id: string, annual: string): Fact => ({
  id,
  kind: "trk_effective",
  inputs: { annual },
  value: plainNumber(effectiveFromStated(annual)),
});

const real = (id: string, nominal: string, inflation: string): Fact => ({
  id,
  kind: "trk_real",
  inputs: { nominal, inflation },
  value: plainNumber(realRate(nominal, inflation)),
});

const beforeInflation = (id: string, realPercent: string, inflation: string): Fact => ({
  id,
  kind: "trk_before_inflation",
  inputs: { real: realPercent, inflation },
  value: plainNumber(rateBeforeInflation(realPercent, inflation)),
});

/** An indexed track's stated rate, turned effective (monthly compounding) and then before inflation. */
const effectiveBeforeInflation = (id: string, annual: string, inflation: string): Fact => ({
  id,
  kind: "trk_effective_before_inflation",
  inputs: { annual, inflation },
  value: plainNumber(rateBeforeInflation(effectiveFromStated(annual), inflation)),
});

const breakEven = (id: string, plain: string, indexed: string): Fact => ({
  id,
  kind: "trk_break_even",
  inputs: { plain, indexed },
  value: plainNumber(breakEvenInflation(plain, indexed)),
});

/** The break-even inflation after both stated rates are made effective. */
const breakEvenEffective = (id: string, plain: string, indexed: string): Fact => ({
  id,
  kind: "trk_break_even_effective",
  inputs: { plain, indexed },
  value: plainNumber(breakEvenInflation(effectiveFromStated(plain), effectiveFromStated(indexed))),
});

const pointsSum = (id: string, a: string, b: string): Fact => ({
  id,
  kind: "trk_points_sum",
  inputs: { a, b },
  value: plainNumber(new Decimal(a).plus(b)),
});

/** Rows for the half-worked table: a stated rate, its monthly rate, its effective rate, and that effective rate after inflation. */
const convertTable = (id: string, inflation: string, annuals: string[]): Fact => ({
  id,
  kind: "trk_convert_table",
  inputs: { inflation, ...Object.fromEntries(annuals.map((a, n) => [`annual_${n + 1}`, a])) },
  value: annuals.map((a, n) => ({
    period: n + 1,
    annual: plainNumber(a),
    monthly: plainNumber(monthlyByDivision(a)),
    effective: plainNumber(effectiveFromStated(a)),
    real: plainNumber(realRate(effectiveFromStated(a), inflation)),
  })),
});

export default function lesson24(): LessonData {
  const facts: Fact[] = [
    // Sense 1 (lesson 0.4): a stated annual rate.
    given("a.annual", "6"),
    monthly("a.monthly", "6"),
    effective("a.effective", "6"),
    // The Brain's example: 5.90% stated is 6.06% effective.
    given("brain.stated", "5.9"),
    effective("brain.effective", "5.9"),

    // Sense 2 (lesson 0.8): before inflation.
    given("b.nominal", "6"),
    given("b.inflation", "2"),
    real("b.real", "6", "2"),

    // The four corners and the worked example: 5% not indexed, 3% indexed, inflation 2%.
    given("w.plain", "5"),
    given("w.indexed", "3"),
    given("w.inflation", "2"),
    monthly("w.plain_monthly", "5", 4),
    monthly("w.indexed_monthly", "3"),
    effective("w.plain_effective", "5"),
    effective("w.indexed_effective", "3"),
    effectiveBeforeInflation("w.indexed_effective_before", "3", "2"),
    beforeInflation("w.indexed_yearly_before", "3", "2"),
    breakEven("w.break_even_yearly", "5", "3"),
    breakEvenEffective("w.break_even_effective", "5", "3"),
    pointsSum("w.mixed", "3", "2"),

    // Half-worked table: three stated rates, inflation 2%.
    convertTable("half.table", "2", ["6", "4.8", "3.6"]),

    // Exercise 3: 4.2% stated — the monthly rate.
    monthly("ex3.answer", "4.2"),
    {
      id: "ex3.root",
      kind: "trk_monthly_root",
      inputs: { annual: "4.2", decimals: 2 },
      value: periodicRateFromEffective("4.2").toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString(),
    },
    effective("ex3.effective", "4.2"),

    // Exercise 4: an indexed track at 2.4% stated — its effective rate (still real).
    effective("ex4.answer", "2.4"),
    monthly("ex4.monthly", "2.4"),

    // Exercise 5: an indexed track at 3.6% stated, inflation 2.5% — effective, before inflation.
    effectiveBeforeInflation("ex5.answer", "3.6", "2.5"),
    effective("ex5.effective", "3.6"),
    pointsSum("ex5.added", "3.6", "2.5"),
    beforeInflation("ex5.no_compounding", "3.6", "2.5"),
    pointsSum("ex5.effective_added", plainNumber(effectiveFromStated("3.6")), "2.5"),
  ];

  return {
    lesson: "2.4",
    title: "״נומינלית״ — מילה אחת, שתי משמעויות",
    note: "Invented teaching numbers, except the 5.90% → 6.06% example from Brain page 7798786 (recomputed). Effective rates assume interest added monthly at the stated annual rate ÷ 12.",
    facts,
  };
}
