/**
 * Lesson 1.9 — what the advisor finds out before talking about rates. Every
 * number the lesson and its exercises show is declared here as a fact; the
 * page reads data/lessons/1-9.json, and checks/kinds/household.py (with
 * percent.py and common.py) recomputes each computed one.
 *
 * Case A (נועם ושירה) is the course's synthetic main case, course/course-map.md
 * section 8: a teaching example, not a real client. דנה ויואב and the four
 * households of the half-worked table are invented too. No number here is a
 * bank's rule or market data.
 */
import { disposableIncome, disposableTable, monthlyTotal } from "../../src/lib/calc/household.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { percentOf } from "../../src/lib/calc/percent.ts";
import Decimal from "decimal.js";
import type { Fact, LessonData } from "../build-data.ts";

const given = (id: string, value: string | number): Fact => ({ id, kind: "given", inputs: {}, value });
const list = (xs: string[]) => xs.join("|");

const sum = (id: string, amounts: string[]): Fact => ({
  id,
  kind: "hh_sum",
  inputs: { amounts: list(amounts) },
  value: moneyString(monthlyTotal(amounts)),
});

const disposable = (id: string, incomes: string[], payments: string[]): Fact => ({
  id,
  kind: "hh_disposable_income",
  inputs: { incomes: list(incomes), payments: list(payments) },
  value: moneyString(disposableIncome(incomes, payments)),
});

const half = (id: string, amount: string): Fact => ({
  id,
  kind: "percent_of",
  inputs: { amount, rate_percent: "50" },
  value: moneyString(percentOf(amount, "50")),
});

const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

type Household = [income1: string, income2: string, payments: string[]];
const table = (id: string, households: Household[]): Fact => ({
  id,
  kind: "hh_disposable_table",
  inputs: Object.fromEntries(
    households.flatMap(([a, b, p], n) => [
      [`income_1_${n + 1}`, a],
      [`income_2_${n + 1}`, b],
      [`payments_${n + 1}`, list(p)],
    ]),
  ),
  value: disposableTable(households.map(([a, b, p], n) => ({ household: String(n + 1), incomes: [a, b], fixedPayments: p }))).map(
    (r) => ({
      household: r.household,
      income_1: moneyString(r.income_1),
      income_2: moneyString(r.income_2),
      payments: moneyString(r.payments),
      disposable: moneyString(r.disposable),
    }),
  ),
});

// Case A, course-map section 8 (teaching assumptions).
const NOAM = "12400";
const SHIRA = "9300";
const CAR = "1450";

export default function lesson19(): LessonData {
  const equity = given("case.equity", "560000");
  const gift = given("case.gift", "200000");
  const shiraHalf = half("ex.half_shira", SHIRA);

  const facts: Fact[] = [
    given("data_date", "2026-10-09"),

    // Case A.
    given("case.noam_age", "31"),
    given("case.shira_age", "30"),
    given("case.price", "2200000"),
    equity,
    gift,
    given("case.noam_income", NOAM),
    given("case.shira_income", SHIRA),
    given("case.car_payment", CAR),
    given("case.car_months", "26"),
    sum("case.total_income", [NOAM, SHIRA]),
    disposable("case.disposable", [NOAM, SHIRA], [CAR]),
    difference("case.cash_now", equity, gift),

    // Explanation: small round numbers first.
    given("explain.income_1", "6000"),
    given("explain.income_2", "4000"),
    given("explain.payment", "1000"),
    sum("explain.total", ["6000", "4000"]),
    disposable("explain.disposable", ["6000", "4000"], ["1000"]),

    // Worked example: דנה ויואב (invented).
    given("worked.income_dana", "10800"),
    given("worked.income_yoav", "7600"),
    given("worked.loan_payment", "900"),
    given("worked.leasing_payment", "600"),
    sum("worked.total", ["10800", "7600"]),
    sum("worked.payments", ["900", "600"]),
    disposable("worked.disposable", ["10800", "7600"], ["900", "600"]),
    given("worked.deposit", "300000"),
    given("worked.deposit_months", "5"),
    given("worked.checking", "120000"),
    sum("worked.equity", ["300000", "120000"]),

    // Half-worked table: four invented households.
    table("half.table", [
      ["8000", "7000", ["900"]],
      ["11500", "6200", ["2300"]],
      ["14800", "0", ["1100", "650"]],
      ["9600", "9600", ["2200"]],
    ]),

    // Exercises: the first meeting with case A.
    sum("ex.err_added", [NOAM, SHIRA, CAR]),
    disposable("ex.err_one_income", [NOAM], [CAR]),
    shiraHalf,
    disposable("ex.half_disposable", [NOAM, shiraHalf.value as string], [CAR]),
    sum("ex.half_no_payment", [NOAM, shiraHalf.value as string]),
    half("ex.half_all", disposableIncome([NOAM, SHIRA], [CAR]).toString()),
  ];

  return {
    lesson: "1.9",
    title: "מה היועץ מברר לפני שמדברים על ריבית",
    note: "Case A is the course's synthetic main case (course-map section 8). All households and amounts are invented teaching numbers, not client data or bank rules.",
    facts,
  };
}
