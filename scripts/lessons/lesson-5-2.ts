/**
 * Lesson 5.2 — the uniform baskets and the proposed basket. The three baskets are
 * the team's transcription of appendix 5 of Directive 451 (Brain 7733250), not
 * checked against the directive: basket 1 is all fixed unlinked; basket 2 is a
 * third each of fixed unlinked, prime and variable linked (every five years, on a
 * government-bond basis); basket 3 is half fixed unlinked and half prime. Every
 * number the lesson, its exercises, its illustration and its video show is
 * declared here as a fact; checks/kinds/offers.py recomputes them.
 *
 * Invented: the three banks and their rates, the forecast (a teaching path, not
 * the Bank of Israel's), the borrowers (דנה ויואב — not the case of נועם ושירה).
 */
import { BANKS, EXAMPLE_LOAN, EXAMPLE_MONTHS, FORECASTS, uniformOffer } from "../../src/data/offer-examples.ts";
import { basketById, type Offer } from "../../src/lib/calc/offers.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, given, months } from "./lesson-3-8.ts";
import { basis, canSplit, lowest, measure, part, percentOf, split, trackRows } from "./_offer-facts.ts";

const F = FORECASTS;
const FA = F[0].id;
const baskets = ["uniform_1", "uniform_2", "uniform_3"] as const;
const bankIds = ["a", "b", "c"] as const;

export default function lesson52(): LessonData {
  const bank = (id: (typeof bankIds)[number]) => BANKS.find((b) => b.id === id)!;
  const uni = (id: (typeof bankIds)[number], b: (typeof baskets)[number]): Offer => uniformOffer(bank(id), basketById(b), FA);
  const prop = (id: (typeof bankIds)[number]): Offer => bank(id).proposed(FA);

  const facts: Fact[] = [
    given("data_date", "2026-10-16"),
    given("explain.loan", EXAMPLE_LOAN),
    months("explain.months", EXAMPLE_MONTHS / 12),
    given("explain.years", EXAMPLE_MONTHS / 12),

    // ── The problem: two proposed baskets of different mixes. ──
    measure("prob.a_first", prop("a"), F, "first"),
    measure("prob.c_first", prop("c"), F, "first"),
    measure("prob.a_rate", prop("a"), F, "rate"),
    measure("prob.c_rate", prop("c"), F, "rate"),
    measure("prob.b_first", prop("b"), F, "first"),
    measure("prob.b_rate", prop("b"), F, "rate"),
    basis("prob.basis_ac", [prop("a"), prop("c")]),
    // The same two banks on the same basket (basket 3): nothing differs but the rates.
    basis("prob.basis_uniform", [uni("a", "uniform_3"), uni("c", "uniform_3")]),

    // ── The baskets: the loan cut in exact fractions. ──
    split("basket1.split", EXAMPLE_LOAN, basketById("uniform_1")),
    split("basket2.split", EXAMPLE_LOAN, basketById("uniform_2")),
    split("basket3.split", EXAMPLE_LOAN, basketById("uniform_3")),
    canSplit("exact.b2_1m", "1000000.00", basketById("uniform_2")),
    canSplit("exact.b3_1m", "1000000.00", basketById("uniform_3")),
    canSplit("exact.b1_1m", "1000000.00", basketById("uniform_1")),
    canSplit("exact.b2_900k", EXAMPLE_LOAN, basketById("uniform_2")),
  ];
  // A third written as 33%: the slip, and what it leaves out of each part.
  const third = part("explain.third", EXAMPLE_LOAN, basketById("uniform_2"), "prime");
  const slip = percentOf("explain.err_33", EXAMPLE_LOAN, "33");
  facts.push(third, slip, difference("explain.err_gap", third, slip));

  // ── The three banks on the three baskets: the rate (the actual cost of credit, lesson 3.10) and the first payment. ──
  for (const b of baskets) {
    const key = b.replace("uniform_", "b");
    for (const id of bankIds) {
      facts.push(measure(`u.${id}.${key}.first`, uni(id, b), F, "first"));
      facts.push(measure(`u.${id}.${key}.rate`, uni(id, b), F, "rate"));
    }
    facts.push(lowest(`u.${key}.lowest_rate`, bankIds.map((id) => uni(id, b)), F, "rate"));
    // Bank א׳ in full, for the table in the explanation.
    facts.push(measure(`u.a.${key}.highest`, uni("a", b), F, "highest"));
    facts.push(measure(`u.a.${key}.highest_month`, uni("a", b), F, "highest_month"));
    facts.push(measure(`u.a.${key}.total`, uni("a", b), F, "total"));
    facts.push(basis(`u.${key}.basis`, bankIds.map((id) => uni(id, b))));
  }
  // The tracks of basket 2 at each bank: each track's rate on the day of issue and its first payment.
  for (const id of bankIds) facts.push(trackRows(`u.${id}.b2.tracks`, uni(id, "uniform_2"), F));

  // ── Half-solved: a loan of 1,200,000 ₪ cut by each basket. ──
  const half = "1200000.00";
  facts.push(given("half.loan", half), split("half.b1", half, basketById("uniform_1")), split("half.b2", half, basketById("uniform_2")), split("half.b3", half, basketById("uniform_3")));

  // ── Exercises. ──
  facts.push(
    // 2: basket 3 on 900,000 ₪ — half is prime.
    part("ex2.answer", EXAMPLE_LOAN, basketById("uniform_3"), "prime"),
    part("ex2.err_third", EXAMPLE_LOAN, basketById("uniform_2"), "prime"),
    // 3: basket 2 on 1,200,000 ₪ — the variable linked third, and the slip of writing a third as 33%.
    part("ex3.answer", half, basketById("uniform_2"), "variable_linked"),
    percentOf("ex3.err_33", half, "33"),
  );
  // 6: the first payment of basket 1 against basket 3 at bank א׳ — and the slip of taking basket 2.
  const e6b1 = measure("ex6.b1", uni("a", "uniform_1"), F, "first");
  const e6b2 = measure("ex6.b2", uni("a", "uniform_2"), F, "first");
  const e6b3 = measure("ex6.b3", uni("a", "uniform_3"), F, "first");
  facts.push(e6b1, e6b2, e6b3, difference("ex6.answer", e6b1, e6b3), difference("ex6.err_b2", e6b1, e6b2));

  return {
    lesson: "5.2",
    title: "הסלים האחידים והסל המוצע",
    note: "Three fictional banks with invented rates, an invented forecast (not the Bank of Israel's), and a fictional borrower couple. The three baskets follow the team's transcription of Directive 451 appendix 5 (Brain 7733250), not checked against the directive. 'The actual cost of credit' is lesson 3.10's measure, computed on the forecast payments and the loan (no up-front charges here). Schedules follow the statement convention; the IRR is found by bisection (TypeScript) and Newton's method (Python).",
    facts,
  };
}
