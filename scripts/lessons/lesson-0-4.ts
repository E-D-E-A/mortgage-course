/**
 * Lesson 0.4 — annual versus monthly rates. Every number the lesson, its
 * exercises and its video show is declared here as a fact. The page and the
 * video read data/lessons/0-4.json; checks/independent_check.py recomputes
 * every fact (checks/kinds/rates.py and compound.py).
 *
 * Two conversions, kept apart by kind:
 *  - monthly_rate_by_division / effective_annual_rate: a stated annual rate,
 *    ÷ 12 each month (how loan contracts state rates, per the team's check in ENG-223);
 *  - monthly_rate_from_effective: the twelfth root of an effective annual rate.
 * Inputs are teaching assumptions (round numbers), not market rates.
 */
import Decimal from "decimal.js";
import { compoundBalance, compoundTable } from "../../src/lib/calc/compound.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { effectiveAnnualRate, growthFactor, periodicRateByDivision, periodicRateFromEffective, roundedString } from "../../src/lib/calc/rates.ts";
import type { Fact, LessonData } from "../build-data.ts";

const byDivision = (id: string, annual: string, decimals: number): Fact => ({
  id,
  kind: "monthly_rate_by_division",
  inputs: { annual_percent: annual, periods_per_year: 12, decimals },
  value: roundedString(periodicRateByDivision(annual, 12), decimals),
});

const effective = (id: string, annual: string, decimals: number): Fact => ({
  id,
  kind: "effective_annual_rate",
  inputs: { annual_percent: annual, periods_per_year: 12, decimals },
  value: roundedString(effectiveAnnualRate(annual, 12), decimals),
});

const fromEffective = (id: string, effectivePercent: string, decimals: number): Fact => ({
  id,
  kind: "monthly_rate_from_effective",
  inputs: { effective_percent: effectivePercent, periods_per_year: 12, decimals },
  value: roundedString(periodicRateFromEffective(effectivePercent, 12), decimals),
});

const factor = (id: string, ratePercent: string, periods: number, decimals: number): Fact => ({
  id,
  kind: "growth_factor_rounded",
  inputs: { rate_percent: ratePercent, periods, decimals },
  value: roundedString(growthFactor(ratePercent, periods), decimals),
});

/** The 12th root of 1 + R, as a factor: 1.06 → 1.004868. */
const rootFactor = (id: string, effectivePercent: string, decimals: number): Fact => ({
  id,
  kind: "monthly_factor_from_effective",
  inputs: { effective_percent: effectivePercent, periods_per_year: 12, decimals },
  value: roundedString(periodicRateFromEffective(effectivePercent, 12).div(100).plus(1), decimals),
});

/** The mistake of multiplying a rate by 12: "9" → 108. */
const timesTwelve = (id: string, ratePercent: string): Fact => ({
  id,
  kind: "annual_rate_by_multiplication",
  inputs: { monthly_percent: ratePercent, periods_per_year: 12 },
  value: new Decimal(ratePercent).mul(12).toFixed(),
});

/** A percent written as a fraction: "0.75" → "0.0075". */
const asFraction = (id: string, of: Fact): Fact => ({
  id,
  kind: "percent_as_fraction",
  inputs: { percent: of.id },
  value: new Decimal(of.value as string).div(100).toFixed(),
});

const compound = (id: string, principal: string, rate: string, periods: number): Fact => ({
  id,
  kind: "compound_balance",
  inputs: { principal, rate_percent: rate, periods },
  value: moneyString(compoundBalance(principal, rate, periods)),
});

const table = (id: string, principal: string, rate: string, periods: number): Fact => ({
  id,
  kind: "compound_table",
  inputs: { principal, rate_percent: rate, periods },
  value: compoundTable(principal, rate, periods).map((row) => ({
    period: row.period,
    opening: moneyString(row.opening),
    interest: moneyString(row.interest),
    interest_on_principal: moneyString(row.interestOnPrincipal),
    interest_on_interest: moneyString(row.interestOnInterest),
    closing: moneyString(row.closing),
  })),
});

/** Month by month: the balance at annual ÷ 12, and at the twelfth-root rate (the annual figure read as effective). */
const series = (id: string, principal: string, annual: string, periods: number): Fact => {
  const div = periodicRateByDivision(annual, 12);
  const root = periodicRateFromEffective(annual, 12);
  return {
    id,
    kind: "monthly_conversion_series",
    inputs: { principal, annual_percent: annual, periods },
    value: Array.from({ length: periods + 1 }, (_, n) => ({
      period: n,
      by_division: moneyString(new Decimal(principal).mul(growthFactor(div, n))),
      by_root: moneyString(new Decimal(principal).mul(growthFactor(root, n))),
    })),
  };
};

/** The balance after `periods` months at the twelfth-root rate of an effective annual rate. */
const atEffective = (id: string, principal: string, effectivePercent: string, periods: number): Fact => ({
  id,
  kind: "balance_at_effective_rate",
  inputs: { principal, effective_percent: effectivePercent, periods_per_year: 12, periods },
  value: moneyString(new Decimal(principal).mul(growthFactor(periodicRateFromEffective(effectivePercent, 12), periods))),
});

const conversionTable = (id: string, annuals: string[], decimals: number): Fact => ({
  id,
  kind: "rate_conversion_table",
  inputs: { annual_percents: annuals.join(","), periods_per_year: 12, decimals },
  value: annuals.map((a, i) => ({
    period: i + 1,
    annual: a,
    monthly: roundedString(periodicRateByDivision(a, 12), 4),
    effective: roundedString(effectiveAnnualRate(a, 12), decimals),
  })),
});

const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

const given = (id: string, value: string): Fact => ({ id, kind: "given", inputs: {}, value });

export default function lesson04(): LessonData {
  // The running example: 10,000 ₪ at 6% a year, interest added every month.
  const principal = given("explain.principal", "10000.00");
  const after12 = compound("explain.after_12", "10000", "0.5", 12);
  const onceAYear = compound("explain.once_a_year", "10000", "6", 1);

  // Worked example: lender A states 4.8% a year (÷ 12); lender B states an effective 4.9%.
  const workedFirst = table("worked.first_month", "100000", "0.4", 1);

  // Exercise 1: 9% a year → monthly.
  const ex1 = byDivision("ex1.answer", "9", 4);

  // Exercise 4: 50,000 at 3.6% a year, added monthly, for a year.
  const ex4 = compound("ex4.answer", "50000", "0.3", 12);
  const ex4Principal = given("ex4.principal", "50000.00");

  const monthly6 = byDivision("rate.monthly_6", "6", 4);

  const facts: Fact[] = [
    asFraction("rate.monthly_6_fraction", monthly6),
    principal,
    monthly6,
    factor("base.monthly_6", "0.5", 1, 6),
    factor("base.worked_a", "0.4", 1, 6),
    factor("base.ex3", "1", 1, 6),
    factor("base.ex4", "0.3", 1, 6),
    factor("base.ex6", "0.45", 1, 6),
    table("explain.table", "10000", "0.5", 12),
    after12,
    onceAYear,
    difference("explain.interest_12", after12, principal),
    difference("explain.interest_once", onceAYear, principal),
    difference("explain.extra", after12, onceAYear),
    effective("rate.effective_6", "6", 2),
    effective("rate.effective_6_long", "6", 4),
    factor("rate.factor_6", "0.5", 12, 6),
    fromEffective("rate.root_6", "6", 4),
    rootFactor("rate.root_factor_6", "6", 6),
    atEffective("explain.root_after_12", "10000", "6", 12),
    series("video.series_6", "10000", "6", 12),

    // The converter's guided tasks.
    effective("slider.effective_12", "12", 2),
    byDivision("slider.monthly_12", "12", 4),
    fromEffective("slider.root_12", "12", 4),
    effective("slider.effective_1", "1", 4),

    // Worked example.
    byDivision("worked.monthly_a", "4.8", 4),
    workedFirst,
    factor("worked.factor_a", "0.4", 12, 6),
    effective("worked.effective_a", "4.8", 4),
    effective("worked.effective_a_short", "4.8", 2),
    fromEffective("worked.monthly_b", "4.9", 4),

    // Half-worked example.
    conversionTable("half.table", ["3", "6", "9", "12"], 2),

    // Exercises.
    ex1,
    asFraction("ex1.err_fraction", ex1),
    timesTwelve("ex1.err_times", "9"),
    effective("ex3.answer", "12", 2),
    factor("ex3.factor", "1", 12, 6),
    byDivision("ex3.err_monthly", "12", 4),
    ex4,
    ex4Principal,
    difference("ex4.interest", ex4, ex4Principal),
    compound("ex4.err_once", "50000", "3.6", 1),
    compound("ex4.err_one_month", "50000", "0.3", 1),
    byDivision("ex4.monthly", "3.6", 4),
    factor("ex4.factor", "0.3", 12, 6),
    fromEffective("ex5.answer", "5", 4),
    rootFactor("ex5.root_factor", "5", 6),
    byDivision("ex5.err_division", "5", 4),
    effective("ex6.effective_a", "5.4", 2),
    factor("ex6.factor_a", "0.45", 12, 6),
    byDivision("ex6.monthly_a", "5.4", 4),
    fromEffective("ex6.monthly_b", "5.5", 4),
  ];

  return {
    lesson: "0.4",
    title: "שנתית מול חודשית",
    note: "Teaching assumptions, not market rates. Rates computed at 40 significant digits and rounded only for display (decimals in each fact's inputs); money rounded to the agora at the end.",
    facts,
  };
}
