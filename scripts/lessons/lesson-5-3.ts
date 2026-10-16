/**
 * Lesson 5.3 — the comparison measures of Directive 451 as the team transcribed
 * them (Brain 7733250, appendix 4, not checked against the directive): the expected
 * total rate (the actual cost of credit of lesson 3.10), the total expected payments
 * and the highest expected payment — and when comparing offers is allowed: only on the
 * same amount, mix, month and forecast. Every number the lesson, its exercises, its
 * illustration and its video show is declared here as a fact; checks/kinds/offers.py
 * recomputes them (the offer measures, the basis check and the lowest offer).
 *
 * Invented: the three banks and their rates, the three forecasts (teaching paths,
 * never the Bank of Israel's), the borrowers (דנה ויואב), the up-front fee.
 */
import { BANKS, EXAMPLE_LOAN, FORECASTS, uniformOffer } from "../../src/data/offer-examples.ts";
import { basketById, type Offer } from "../../src/lib/calc/offers.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { above, difference, given, share } from "./lesson-3-8.ts";
import { basis, lowest, measure, trackRows } from "./_offer-facts.ts";

const F = FORECASTS;
const ids = ["a", "b", "c"] as const;
const bank = (id: (typeof ids)[number]) => BANKS.find((b) => b.id === id)!;
const b3 = basketById("uniform_3");
const b2 = basketById("uniform_2");

export default function lesson53(): LessonData {
  const facts: Fact[] = [given("data_date", "2026-10-16"), given("explain.loan", EXAMPLE_LOAN), given("explain.years", 25)];
  const push = (...f: Fact[]) => facts.push(...f);

  /** The three measures, the first payment and (for the highest) its month of an offer, under a tag. */
  const all = (tag: string, o: Offer, withMonth = false) =>
    push(
      measure(`${tag}.rate`, o, F, "rate", 2),
      measure(`${tag}.total`, o, F, "total"),
      measure(`${tag}.highest`, o, F, "highest"),
      measure(`${tag}.first`, o, F, "first"),
      ...(withMonth ? [measure(`${tag}.highest_month`, o, F, "highest_month")] : []),
    );

  // ── The same basis: basket 3, 900,000 ₪, 25 years, forecast א׳, October 2026, at the three banks. ──
  const base = ids.map((id) => uniformOffer(bank(id), b3, "forecast_a"));
  ids.forEach((id, k) => all(`base.${id}`, base[k], true));
  push(
    lowest("base.lowest_rate", base, F, "rate"),
    lowest("base.lowest_total", base, F, "total"),
    lowest("base.lowest_highest", base, F, "highest"),
    basis("base.basis", base),
    measure("base.a.rate4", base[0], F, "rate", 4),
    measure("base.a.irr", base[0], F, "irr_monthly", 5),
    trackRows("base.a.tracks", base[0], F),
    measure("base.a.loan", base[0], F, "loan"),
  );

  // ── One condition broken at a time: bank א׳ changes, the other two stay. ──
  const aFcB = uniformOffer(bank("a"), b3, "forecast_b");
  const aFcC = uniformOffer(bank("a"), b3, "forecast_c");
  const a600 = uniformOffer(bank("a"), b3, "forecast_a", "600000.00");
  const aB2 = uniformOffer(bank("a"), b2, "forecast_a");
  all("fc.a", aFcB);
  all("mo.a", aFcC);
  all("am.a", a600);
  all("mx.a", aB2, true);
  push(
    lowest("fc.lowest_rate", [aFcB, base[1], base[2]], F, "rate"),
    lowest("mo.lowest_rate", [aFcC, base[1], base[2]], F, "rate"),
    lowest("am.lowest_total", [a600, base[1], base[2]], F, "total"),
    lowest("am.lowest_rate", [a600, base[1], base[2]], F, "rate"),
    lowest("mx.lowest_rate", [aB2, base[1], base[2]], F, "rate"),
    basis("fc.basis", [aFcB, base[1], base[2]]),
    basis("mo.basis", [aFcC, base[1], base[2]]),
    basis("am.basis", [a600, base[1], base[2]]),
    basis("mx.basis", [aB2, base[1], base[2]]),
    given("am.loan_a", "600000.00"),
  );

  // ── The same banks' own proposed baskets: different mixes. ──
  const prop = ids.map((id) => bank(id).proposed("forecast_a"));
  const propB = ids.map((id) => bank(id).proposed("forecast_b"));
  ids.forEach((id, k) => all(`prop.${id}`, prop[k], true));
  ids.forEach((id, k) => push(measure(`propB.${id}.rate`, propB[k], F, "rate", 2)));
  push(
    lowest("prop.lowest_rate", prop, F, "rate"),
    lowest("prop.lowest_total", prop, F, "total"),
    lowest("prop.lowest_highest", prop, F, "highest"),
    lowest("propB.lowest_rate", propB, F, "rate"),
    basis("prop.basis", prop),
  );

  // ── Up-front charges (T): the same bank ג׳ with a fee on the day of the loan (an assumption: which charges count is open). ──
  const cFee = uniformOffer(bank("c"), b3, "forecast_a", EXAMPLE_LOAN, "3000.00");
  push(
    given("fee.amount", "3000.00"),
    measure("fee.c.received", cFee, F, "received"),
    measure("fee.c.rate", cFee, F, "rate", 2),
    measure("fee.c.total", cFee, F, "total"),
    lowest("fee.lowest_rate", [base[0], base[1], cFee], F, "rate"),
  );

  push(difference("base.gap_bc", facts.find((x) => x.id === "base.c.total")!, facts.find((x) => x.id === "base.b.total")!));

  // ── Exercises. ──
  push(
    // 2: the difference in total payments between bank ב׳ and bank א׳ on the same basket.
    difference("ex2.answer", facts.find((x) => x.id === "base.b.total")!, facts.find((x) => x.id === "base.a.total")!),
    difference("ex2.err_first", facts.find((x) => x.id === "base.b.first")!, facts.find((x) => x.id === "base.a.first")!),
    // 5: how far above the first payment the highest expected payment is, in basket 2 at bank א׳.
    above("ex5.answer", facts.find((x) => x.id === "mx.a.highest")!, facts.find((x) => x.id === "mx.a.first")!, 1),
  );
  const gap5 = difference("ex5.gap", facts.find((x) => x.id === "mx.a.highest")!, facts.find((x) => x.id === "mx.a.first")!);
  push(gap5, share("ex5.err_of_highest", gap5, facts.find((x) => x.id === "mx.a.highest")!, 1));

  // Half-solved: amounts for the match table.
  push(given("half.loan_a", "900000.00"), given("half.loan_b", "800000.00"));

  return {
    lesson: "5.3",
    title: "מדדי ההשוואה לפי הוראה 451",
    note: "Three fictional banks with invented rates, three invented forecasts (not the Bank of Israel's), and a fictional borrower couple. The measures follow the team's transcription of Directive 451 appendix 4 (Brain 7733250), not checked against the directive: the expected total rate is lesson 3.10's actual cost of credit, the monthly IRR of all forecast payments against the loan less the up-front charges, compounded to a year; the total is the sum of the forecast payments; the highest is the highest forecast payment (first month it appears). Schedules follow the statement convention; the IRR is found by bisection (TypeScript) and Newton's method (Python). Which charges count as up-front charges is an open legal question.",
    facts,
  };
}
