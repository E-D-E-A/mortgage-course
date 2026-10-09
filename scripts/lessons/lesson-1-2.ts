/**
 * Lesson 1.2 — equity and the financing ratio (LTV). Every number the lesson,
 * its exercises and its video show is declared here as a fact; the page and
 * the video read data/lessons/1-2.json, and checks/kinds/ltv.py recomputes
 * each one.
 *
 * Prices and equity are invented teaching numbers. Case A (נועם ושירה) is the
 * course's synthetic main case (course map, section 8). The ceilings 75 / 70 /
 * 50 are Directive 329's financing limits as the team transcribed them in the
 * Brain (page 7503881, J-090, updated 2026-10-08); not yet checked against the
 * directive itself.
 */
import Decimal from "decimal.js";
import { cushionPercent, loanNeeded, loanPerEquityShekel, ltvPercent, maxLoan, maxPrice, minEquity } from "../../src/lib/calc/ltv.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { percentString } from "../../src/lib/calc/percent.ts";
import type { Fact, LessonData } from "../build-data.ts";

/** The ceilings by deal type, from the team's transcription (see the header). */
export const CEILINGS = { onlyHome: "75", replacementHome: "70", investment: "50" } as const;

const given = (id: string, amount: string): Fact => ({ id, kind: "given", inputs: {}, value: moneyString(amount) });
const givenNumber = (id: string, value: string): Fact => ({ id, kind: "given", inputs: {}, value });

const loan = (id: string, price: string, equity: string): Fact => ({
  id,
  kind: "ltv_loan_needed",
  inputs: { price, equity },
  value: moneyString(loanNeeded(price, equity)),
});

const ltv = (id: string, loanAmount: string, value: string, decimals = 2): Fact => ({
  id,
  kind: "ltv_percent",
  inputs: decimals === 2 ? { loan: loanAmount, value } : { loan: loanAmount, value, decimals },
  value: ltvPercent(loanAmount, value).toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP).toFixed(),
});

const share = (id: string, part: string, whole: string): Fact => ({
  id,
  kind: "ltv_share",
  inputs: { part, whole },
  value: percentString(new Decimal(part).div(whole).mul(100)),
});

const maxLoanFact = (id: string, value: string, ceiling: string): Fact => ({
  id,
  kind: "ltv_max_loan",
  inputs: { value, ceiling },
  value: moneyString(maxLoan(value, ceiling)),
});

const minEquityFact = (id: string, price: string, value: string, ceiling: string): Fact => ({
  id,
  kind: "ltv_min_equity",
  inputs: { price, value, ceiling },
  value: moneyString(minEquity(price, value, ceiling)),
});

const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

const pointsGap = (id: string, ceiling: string, loanAmount: string, value: string): Fact => ({
  id,
  kind: "ltv_points_gap",
  inputs: { ceiling, loan: loanAmount, value },
  value: percentString(new Decimal(ceiling).minus(ltvPercent(loanAmount, value))),
});

const sum = (id: string, a: string, b: string): Fact => ({
  id,
  kind: "ltv_sum",
  inputs: { a, b },
  value: moneyString(new Decimal(a).plus(b)),
});

const times = (id: string, amount: string, factor: string): Fact => ({
  id,
  kind: "ltv_times",
  inputs: { amount, factor },
  value: moneyString(new Decimal(amount).mul(factor)),
});

const divide = (id: string, amount: string, divisor: string): Fact => ({
  id,
  kind: "ltv_divide",
  inputs: { amount, divisor },
  value: moneyString(new Decimal(amount).div(divisor)),
});

const complementValue = (percent: string) => percentString(new Decimal(100).minus(percent));
const complement = (id: string, percent: string): Fact => ({
  id,
  kind: "ltv_complement",
  inputs: { percent },
  value: complementValue(percent),
});

/** A percent as a decimal: 75 → 0.75. */
const fraction = (id: string, percent: string): Fact => ({
  id,
  kind: "ltv_fraction",
  inputs: { percent },
  value: new Decimal(percent).div(100).toFixed(),
});

type Purchase = [price: string, equity: string];
const priceTable = (id: string, rows: Purchase[]): Fact => ({
  id,
  kind: "ltv_price_table",
  inputs: Object.fromEntries(rows.flatMap(([p, e], n) => [[`price_${n + 1}`, p], [`equity_${n + 1}`, e]])),
  value: rows.map(([p, e], n) => ({
    period: n + 1,
    price: moneyString(p),
    equity: moneyString(e),
    loan: moneyString(loanNeeded(p, e)),
    ltv: percentString(ltvPercent(loanNeeded(p, e), p)),
  })),
});

const ceilingTable = (id: string, value: string, ceilings: string[]): Fact => ({
  id,
  kind: "ltv_ceiling_table",
  inputs: { value, ...Object.fromEntries(ceilings.map((c, n) => [`ceiling_${n + 1}`, c])) },
  value: ceilings.map((c, n) => ({
    period: n + 1,
    ceiling: percentString(c),
    max_loan: moneyString(maxLoan(value, c)),
    min_equity: moneyString(minEquity(value, value, c)),
  })),
});

export default function lesson12(): LessonData {
  const { onlyHome, replacementHome, investment } = CEILINGS;

  // Case A: נועם ושירה, 2,200,000 ₪ and 560,000 ₪ of their own.
  const aPrice = given("caseA.price", "2200000");
  const aEquity = given("caseA.equity", "560000");
  const aLoan = loan("caseA.loan", "2200000", "560000");
  const aMaxLoan = maxLoanFact("caseA.max_loan", "2200000", onlyHome);
  const aMinValue: Fact = {
    id: "caseA.min_value",
    kind: "ltv_min_value",
    inputs: { loan: aLoan.value as string, ceiling: onlyHome },
    value: moneyString(new Decimal(aLoan.value as string).mul(100).div(onlyHome)),
  };
  const aMinEquity = minEquityFact("caseA.min_equity", "2200000", "2200000", onlyHome);

  // The price-against-value example: price 1,000,000, value 950,000.
  const pvSame = minEquityFact("pv.min_equity_at_price", "1000000", "1000000", onlyHome);
  const pvLow = minEquityFact("pv.min_equity", "1000000", "950000", onlyHome);

  const explainLoan = loan("explain.loan", "1000000", "250000");
  const e3Loan = loan("ex3.loan", "1400000", "392000");
  const sLoan = loan("slider.loan", "1500000", "300000");

  // The illustration's first task: 1,500,000 with 300,000 of one's own.
  const sEquity = given("slider.equity", "300000");
  const sMin75 = minEquityFact("slider.min_equity_75", "1500000", "1500000", onlyHome);

  // Exercise 6 (case A, 20,000 less equity).
  const e6Less = given("ex6.less", "20000");
  const e6Equity = difference("ex6.equity", aEquity, e6Less);
  const e6Loan = loan("ex6.loan", "2200000", e6Equity.value as string);

  const facts: Fact[] = [
    // The ceilings themselves, so the page and the video never type them.
    givenNumber("ceiling.only_home", onlyHome),
    givenNumber("ceiling.replacement", replacementHome),
    givenNumber("ceiling.investment", investment),

    // Prediction and explanation: 1,000,000, of which 250,000 is one's own.
    given("explain.price", "1000000"),
    given("explain.equity", "250000"),
    explainLoan,
    ltv("explain.ltv", explainLoan.value as string, "1000000"),
    share("explain.equity_share", "250000", "1000000"),
    share("pred.equity_over_loan", "250000", "750000"),
    share("pred.loan_over_equity", "750000", "250000"),
    {
      id: "explain.per_shekel",
      kind: "ltv_per_shekel",
      inputs: { loan: "750000", equity: "250000" },
      value: loanPerEquityShekel("750000", "250000").toFixed(),
    },
    // A second, smaller-loan example in the head: 1,000,000 with 400,000 of one's own.
    given("explain2.equity", "400000"),
    loan("explain2.loan", "1000000", "400000"),
    ltv("explain2.ltv", "600000", "1000000"),
    {
      id: "explain2.cushion",
      kind: "ltv_cushion",
      inputs: { value: "1000000", debt: "600000" },
      value: percentString(cushionPercent("1000000", "600000")),
    },

    maxLoanFact("explain.max_loan", "1000000", onlyHome),
    // What each ceiling leaves to the buyer: 100 − ceiling.
    complement("own.only_home", onlyHome),
    complement("own.replacement", replacementHome),
    complement("own.investment", investment),

    // The three ceilings on a 1,000,000 home (table and video).
    ceilingTable("limits.table", "1000000", [onlyHome, replacementHome, investment]),

    // Price against value.
    given("pv.value", "950000"),
    maxLoanFact("pv.max_loan", "950000", onlyHome),
    pvSame,
    pvLow,
    difference("pv.extra", pvLow, pvSame),

    // Rounding near the ceiling: 1,500,050 on 2,000,000.
    given("round.loan", "1500050"),
    given("round.value", "2000000"),
    {
      id: "round.ltv2_shown",
      kind: "ltv_percent_fixed",
      inputs: { loan: "1500050", value: "2000000" },
      value: ltvPercent("1500050", "2000000").toFixed(2, Decimal.ROUND_HALF_UP),
    },
    ltv("round.ltv4", "1500050", "2000000", 4),

    // The illustration's guided tasks.
    given("slider.price", "1500000"),
    sEquity,
    sLoan,
    ltv("slider.ltv", sLoan.value as string, "1500000"),
    sMin75,
    difference("slider.more_75", sMin75, sEquity),
    minEquityFact("slider.min_equity_70", "1500000", "1500000", replacementHome),
    minEquityFact("slider.min_equity_50", "1500000", "1500000", investment),

    // Worked example: case A.
    aPrice,
    aEquity,
    aLoan,
    ltv("caseA.ltv", aLoan.value as string, "2200000"),
    // The lowest value that keeps the loan within the ceiling: loan ÷ ceiling × 100, and its distance below the price.
    aMinValue,
    difference("caseA.value_room", aPrice, aMinValue),
    pointsGap("caseA.gap_points", onlyHome, aLoan.value as string, "2200000"),
    aMaxLoan,
    difference("caseA.loan_room", aMaxLoan, aLoan),
    aMinEquity,
    difference("caseA.equity_room", aEquity, aMinEquity),
    given("caseA.gift", "200000"),
    givenNumber("caseA.age_noam", "31"),
    givenNumber("caseA.age_shira", "30"),

    // Half-worked table.
    priceTable("half.table", [
      ["1200000", "360000"],
      ["2500000", "875000"],
      ["1450000", "420000"],
    ]),

    // Exercise 1: what a 70% financing ratio means.
    givenNumber("ex1.ltv", "70"),
    complement("ex1.own", "70"),

    // Exercise 2: 900,000 with 270,000 of one's own — the loan.
    loan("ex2.answer", "900000", "270000"),
    given("ex2.equity", "270000"),
    given("ex2.price", "900000"),
    sum("ex2.added", "900000", "270000"),

    // Exercise 3: 1,400,000 with 392,000 — the financing ratio.
    given("ex3.price", "1400000"),
    given("ex3.equity_paid", "392000"),
    e3Loan,
    ltv("ex3.answer", e3Loan.value as string, "1400000"),
    share("ex3.equity_share", "392000", "1400000"),
    share("ex3.equity_over_loan", "392000", e3Loan.value as string),
    share("ex3.loan_over_equity", e3Loan.value as string, "392000"),
    fraction("ex3.as_decimal", percentString(ltvPercent(e3Loan.value as string, "1400000"))),

    // Exercise 4: the largest loan on 1,800,000 under the 75% ceiling.
    given("ex4.price", "1800000"),
    maxLoanFact("ex4.answer", "1800000", onlyHome),
    minEquityFact("ex4.min_equity", "1800000", "1800000", onlyHome),
    maxLoanFact("ex4.at_70", "1800000", replacementHome),
    maxLoanFact("ex4.at_50", "1800000", investment),

    // Exercise 5: price 1,200,000, value 1,140,000, ceiling 75% — the least equity.
    given("ex5.price", "1200000"),
    given("ex5.value", "1140000"),
    minEquityFact("ex5.answer", "1200000", "1140000", onlyHome),
    minEquityFact("ex5.at_price", "1200000", "1200000", onlyHome),
    maxLoanFact("ex5.max_loan", "1140000", onlyHome),
    minEquityFact("ex5.value_quarter", "1140000", "1140000", onlyHome),

    // Exercise 6: case A with 20,000 less equity.
    e6Less,
    e6Equity,
    e6Loan,
    ltv("ex6.answer", e6Loan.value as string, "2200000"),
    ltv("ex6.one_decimal", e6Loan.value as string, "2200000", 1),
    fraction("ex6.as_decimal", percentString(ltvPercent(e6Loan.value as string, "2200000"))),
    share("ex6.equity_share", e6Equity.value as string, "2200000"),

    // Exercise 7: the dearest home 560,000 can buy under 75%.
    {
      id: "ex7.answer",
      kind: "ltv_max_price",
      inputs: { equity: "560000", ceiling: onlyHome },
      value: moneyString(maxPrice("560000", onlyHome)),
    },
    times("ex7.times_three", "560000", "3"),
    divide("ex7.divided", "560000", "0.75"),
    divide("ex7.divided_by_25", "560000", "25"),
    times("ex7.times_125", "560000", "1.25"),
    fraction("ex7.loan_fraction", onlyHome),
    fraction("ex7.own_fraction", complementValue(onlyHome)),
    maxLoanFact("ex7.check_loan", moneyString(maxPrice("560000", onlyHome)), onlyHome),
  ];

  return {
    lesson: "1.2",
    title: "הון עצמי ושיעור מימון",
    note: "Invented teaching numbers; case A is the course's synthetic main case. Ceilings 75/70/50 per the team's Brain transcription of Directive 329 (page 7503881, 2026-10-08), not yet checked against the source.",
    facts,
  };
}
