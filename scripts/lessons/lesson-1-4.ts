/**
 * Lesson 1.4 — track and mix: a mortgage is several loans together. Every
 * number the lesson and its exercises show is declared here as a fact; the
 * page reads data/lessons/1-4.json, and checks/kinds/mix.py recomputes each one.
 *
 * Case A (נועם ושירה) is the course's synthetic main case (course map, section 8):
 * a 2,200,000 ₪ flat and 560,000 ₪ of equity. Every split is an invented
 * teaching split, not a recommendation and not any bank's offer. The two terms
 * of 30 and 12 years are the example in the Mogi decision page 16646263
 * (Eylon, 2026-08-03).
 */
import Decimal from "decimal.js";
import { cutTo, remainder, shareFraction, shareOf, sliceAmount, splitByWeights, sum, weightShare } from "../../src/lib/calc/mix.ts";
import { plainNumber } from "../../src/lib/calc/indexation.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import type { Fact, LessonData } from "../build-data.ts";

const given = (id: string, value: string): Fact => ({ id, kind: "given", inputs: {}, value });

const slice = (id: string, loan: string, weight: string, total = "100"): Fact => ({
  id,
  kind: "mix_slice",
  inputs: { loan, weight, total_weight: total },
  value: moneyString(sliceAmount(loan, weight, total)),
});

const split = (id: string, loan: string, weights: string[]): Fact => {
  const amounts = splitByWeights(loan, weights);
  const total = sum(weights);
  return {
    id,
    kind: "mix_split",
    inputs: { loan, ...Object.fromEntries(weights.map((w, n) => [`weight_${n + 1}`, w])) },
    value: amounts.map((a, n) => ({
      period: n + 1,
      share: plainNumber(weightShare(weights[n], total)),
      amount: moneyString(a),
    })),
  };
};

const share = (id: string, amount: string, loan: string): Fact => ({
  id,
  kind: "mix_share",
  inputs: { amount, loan },
  value: plainNumber(shareOf(amount, loan)),
});

const fraction = (id: string, amount: string, loan: string): Fact => ({
  id,
  kind: "mix_share_fraction",
  inputs: { amount, loan },
  value: plainNumber(shareFraction(amount, loan)),
});

const amountSum = (id: string, amounts: string[]): Fact => ({
  id,
  kind: "mix_amount_sum",
  inputs: Object.fromEntries(amounts.map((a, n) => [`amount_${n + 1}`, a])),
  value: moneyString(sum(amounts)),
});

const shareSum = (id: string, shares: string[]): Fact => ({
  id,
  kind: "mix_share_sum",
  inputs: Object.fromEntries(shares.map((s, n) => [`share_${n + 1}`, s])),
  value: plainNumber(sum(shares)),
});

const rest = (id: string, loan: string, others: string[]): Fact => ({
  id,
  kind: "mix_remainder",
  inputs: { loan, ...Object.fromEntries(others.map((a, n) => [`amount_${n + 1}`, a])) },
  value: moneyString(remainder(loan, others)),
});

const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

const rows = (f: Fact) => f.value as { amount: string }[];

export default function lesson14(): LessonData {
  // Case A, from lesson 1.2: price − equity = the loan.
  const price = given("case.price", "2200000.00");
  const equity = given("case.equity", "560000.00");
  const loan = difference("case.loan", price, equity);
  const L = loan.value as string;

  // Worked example: three exact thirds of case A's loan.
  const thirds = split("worked.split", L, ["1", "1", "1"]);
  const third = rows(thirds)[0].amount;

  // The illustration's default split, and three "equal" slices in whole percents.
  const sliders = split("slider.split", L, ["40", "35", "25"]);
  const evenish = split("slider.evenish", L, ["33", "33", "34"]);

  // Half-worked table: 50 / 30 / 20.
  const half = split("half.split", L, ["50", "30", "20"]);

  // Exercise 6: 550,000 rate set for the whole term; 500,000 moves with the Bank of Israel rate; 450,000 updated every five years.
  const ex6Loan = amountSum("ex6.loan", ["550000", "500000", "450000"]);
  const ex6Moving = amountSum("ex6.moving", ["500000", "450000"]);

  const facts: Fact[] = [
    price,
    equity,
    loan,

    // Explanation: 100,000 ₪ in two tracks, 60% and 40%.
    given("explain.small_loan", "100000"),
    slice("explain.small_a", "100000", "60"),
    slice("explain.small_b", "100000", "40"),
    amountSum("explain.small_sum", [moneyString(sliceAmount("100000", "60")), moneyString(sliceAmount("100000", "40"))]),
    share("explain.small_share_back", "60000", "100000"),
    given("explain.term_long", "30"),
    given("explain.term_short", "12"),

    // The illustration's guided tasks.
    sliders,
    amountSum("slider.sum", rows(sliders).map((r) => r.amount)),
    shareSum("slider.moving_share", ["35", "25"]),
    evenish,
    slice("slider.exact_third", L, "1", "3"),

    // Worked example.
    thirds,
    {
      id: "worked.third_digits",
      kind: "mix_slice_truncated",
      inputs: { loan: L, weight: "1", total_weight: "3", decimals: 4 },
      value: cutTo(sliceAmount(L, "1", "3"), 4).toFixed(4),
    },
    amountSum("worked.naive_sum", [third, third, third]),
    amountSum("worked.sum", rows(thirds).map((r) => r.amount)),
    { id: "worked.moving_share", kind: "mix_weight_share", inputs: { weight: "2", total_weight: "3" }, value: plainNumber(weightShare("2", "3")) },

    // Half-worked table.
    half,

    // Exercise 2: 30% of 800,000.
    slice("ex2.answer", "800000", "30"),
    rest("ex2.other_part", "800000", [moneyString(sliceAmount("800000", "30"))]),
    slice("ex2.three_percent", "800000", "3"),
    slice("ex2.no_hundred", "800000", "3000"),
    slice("ex2.divided", "800000", "1", "30"),

    // Exercise 3: tracks of 450,000, 300,000 and 250,000; the second one's share.
    amountSum("ex3.loan", ["450000", "300000", "250000"]),
    share("ex3.answer", "300000", "1000000"),
    share("ex3.of_first", "300000", "450000"),
    fraction("ex3.fraction", "300000", "1000000"),

    // Exercise 4: a 1,200,000 loan with tracks of 500,000 and 380,000; the third track.
    rest("ex4.answer", "1200000", ["500000", "380000"]),
    amountSum("ex4.two_tracks", ["500000", "380000"]),
    rest("ex4.first_only", "1200000", ["500000"]),
    amountSum("ex4.added", ["1200000", "500000", "380000"]),

    // Exercise 5: two terms in one mix.
    given("ex5.term_a", "25"),
    given("ex5.term_b", "15"),

    // Exercise 6: the share whose rate can move.
    ex6Loan,
    ex6Moving,
    share("ex6.answer", ex6Moving.value as string, ex6Loan.value as string),
    share("ex6.fixed_share", "550000", ex6Loan.value as string),
    share("ex6.boi_only", "500000", ex6Loan.value as string),
    fraction("ex6.fraction", ex6Moving.value as string, ex6Loan.value as string),
  ];

  return {
    lesson: "1.4",
    title: "מסלול ותמהיל",
    note: "Case A is synthetic; every split is an invented teaching split, not a recommendation or a bank's offer.",
    facts,
  };
}
