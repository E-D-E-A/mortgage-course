/**
 * Lesson 1.3 — three separate things: the loan's purpose, the interest
 * mechanism and the repayment method. Every number the lesson and its
 * exercises show is declared here as a fact; the page reads data/lessons/1-3.json,
 * and checks/kinds/mix.py (with lending.py for one year's interest) recomputes each one.
 *
 * The loans are invented round teaching numbers, paid once a year so they can
 * be done in the head. They are not market rates or any bank's terms.
 */
import { balanceAtStart, combinations, interestPart, principalPart, sum, yearPayment, type YearlyMethod } from "../../src/lib/calc/mix.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import type { Fact, LessonData } from "../build-data.ts";

const given = (id: string, value: unknown): Fact => ({ id, kind: "given", inputs: {}, value });

type Part = "principal" | "balance" | "interest" | "payment";
const KIND: Record<Part, string> = {
  principal: "mix_principal_part",
  balance: "mix_balance_at_start",
  interest: "mix_interest_part",
  payment: "mix_year_payment",
};

/** One part of one year's payment on a loan returned over whole years. */
function year(id: string, part: Part, loan: string, years: number, method: YearlyMethod, y: number, rate = ""): Fact {
  const value =
    part === "principal"
      ? principalPart(loan, years, method, y)
      : part === "balance"
        ? balanceAtStart(loan, years, method, y)
        : part === "interest"
          ? interestPart(loan, years, method, y, rate)
          : yearPayment(loan, years, method, y, rate);
  const inputs: Record<string, string | number> = { loan, years, method, year: y };
  if (part === "interest" || part === "payment") inputs.rate_percent = rate;
  return { id, kind: KIND[part], inputs, value: moneyString(value) };
}

const combos = (id: string, counts: number[], added = false): Fact => ({
  id,
  kind: added ? "mix_count_sum" : "mix_combinations",
  inputs: Object.fromEntries(counts.map((c, n) => [`count_${n + 1}`, c])),
  value: String(added ? counts.reduce((s, c) => s + c, 0) : combinations(counts)),
});

const amountSum = (id: string, amounts: string[]): Fact => ({
  id,
  kind: "mix_amount_sum",
  inputs: Object.fromEntries(amounts.map((a, n) => [`amount_${n + 1}`, a])),
  value: moneyString(sum(amounts)),
});

export default function lesson13(): LessonData {
  const A = "equal_principal" as const;
  const B = "interest_only" as const;
  const facts: Fact[] = [
    // Explanation: 120,000 ₪ over 10 years, paid once a year; 5%, and 6% if the rate moves in year 2.
    given("explain.loan", "120000"),
    given("explain.years", "10"),
    given("explain.rate", "5"),
    given("explain.rate_up", "6"),
    year("explain.a_principal", "principal", "120000", 10, A, 1),
    year("explain.a_interest_1", "interest", "120000", 10, A, 1, "5"),
    year("explain.a_pay_1", "payment", "120000", 10, A, 1, "5"),
    year("explain.b_principal_1", "principal", "120000", 10, B, 1),
    year("explain.b_pay_1", "payment", "120000", 10, B, 1, "5"),
    year("explain.a_balance_2", "balance", "120000", 10, A, 2),
    year("explain.a_interest_2", "interest", "120000", 10, A, 2, "5"),
    year("explain.a_interest_2_up", "interest", "120000", 10, A, 2, "6"),
    year("explain.a_pay_2", "payment", "120000", 10, A, 2, "5"),
    year("explain.a_pay_2_up", "payment", "120000", 10, A, 2, "6"),
    year("explain.b_pay_2", "payment", "120000", 10, B, 2, "5"),
    year("explain.b_pay_2_up", "payment", "120000", 10, B, 2, "6"),
    year("explain.b_pay_last", "payment", "120000", 10, B, 10, "5"),

    // Independence multiplies: two answers to each of the three questions.
    combos("explain.combos", [2, 2, 2]),
    combos("explain.combos_if_tied", [2]),

    // Worked example: the inputs the couple states on the call.
    given("worked.amount", "1200000"),
    given("worked.years", "25"),

    // Exercise 3: three ways to set the rate × two ways to repay.
    combos("ex3.answer", [3, 2]),
    combos("ex3.added", [3, 2], true),

    // Exercise 4: 240,000 ₪ over 20 years, equal principal, 4% in year 1.
    year("ex4.principal", "principal", "240000", 20, A, 1),
    year("ex4.interest", "interest", "240000", 20, A, 1, "4"),
    year("ex4.answer", "payment", "240000", 20, A, 1, "4"),
    amountSum("ex4.whole_principal", ["240000", moneyString(interestPart("240000", 20, A, 1, "4"))]),

    // Exercise 5: the same loan in year 2, after the rate moved from 4% to 5%.
    year("ex5.balance", "balance", "240000", 20, A, 2),
    year("ex5.interest", "interest", "240000", 20, A, 2, "5"),
    year("ex5.answer", "payment", "240000", 20, A, 2, "5"),
    year("ex5.old_rate", "payment", "240000", 20, A, 2, "4"),
    amountSum("ex5.full_debt", [moneyString(principalPart("240000", 20, A, 2)), moneyString(interestPart("240000", 20, B, 2, "5"))]),
  ];

  return {
    lesson: "1.3",
    title: "שלושה דברים נפרדים",
    note: "Invented round teaching loans, paid once a year; not market rates or any bank's terms.",
    facts,
  };
}
