/**
 * Lesson 7.6 — complex deals, part one: the upgrader, the bridge loan, draws in instalments and
 * builder financing. An INTRODUCTION ("היכרות בלבד"): the lesson says what each deal is, why it is
 * complex, what to ask and when to send the case to a specialist, and says plainly what the course
 * does not know. It states no rule, rate or procedure of a bridge loan, a builder's financing or a
 * bank's escort as fact, and so it holds no number about them.
 *
 * The only figures are two teaching examples, both of the exercise's own making:
 *  - the upgrader: the financing ceilings of Directive 329 as the team transcribed them (75% of the
 *    value for a single home, 70% for a replacement home; lesson 4.4, not verified) applied to an
 *    invented purchase price, and what the old apartment's sale would leave once its loan is paid off,
 *    before the costs and taxes the course does not compute;
 *  - the draws: an invented loan taken in four equal parts, to show that a schedule of a loan given
 *    on one day does not describe it.
 * Each is recomputed independently (reg_max_loan: regulation.py; difference and hh_sum: common.py and
 * affordability.py). Names, amounts and the people are invented; nothing is a bank's term or an offer.
 */
import type { Fact, LessonData } from "../build-data.ts";
import { difference as diff, sum } from "./affordability-facts.ts";
import { given, givenNumber, maxLoan } from "./regulation-facts.ts";

export default function lesson76(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);
  const get = (id: string) => facts.find((f) => f.id === id) as Fact;

  // ── The upgrader's example: an invented purchase, an invented old apartment ──
  add(given("u.price", "2400000"));
  add(givenNumber("u.pct_rep", "70"));
  add(givenNumber("u.pct_only", "75"));
  add(maxLoan("u.max_rep", "2400000", "replacement"));
  add(maxLoan("u.max_only", "2400000", "only_home"));
  add(diff("u.equity_rep", get("u.price"), get("u.max_rep")));
  add(diff("u.equity_only", get("u.price"), get("u.max_only")));
  add(diff("u.equity_gap", get("u.equity_rep"), get("u.equity_only")));
  add(given("u.sale", "1800000"));
  add(given("u.old_loan", "500000"));
  add(diff("u.left", get("u.sale"), get("u.old_loan")));
  add(diff("u.spare", get("u.left"), get("u.equity_rep")));

  // ── Draws: an invented loan of 1,200,000 ₪ taken in four equal parts ──
  add(given("d.total", "1200000"));
  add(given("d.part", "300000"));
  add(sum("d.after2", ["300000", "300000"]));
  add(sum("d.after3", ["300000", "300000", "300000"]));
  add(diff("d.rest1", get("d.total"), get("d.part")));
  add(diff("d.rest2", get("d.total"), get("d.after2")));
  add(diff("d.rest3", get("d.total"), get("d.after3")));

  return {
    lesson: "7.6",
    title: "עסקאות מורכבות, א׳: משפרי דיור, גישור, משיכות לשיעורין ומימון קבלן",
    note: "Introduction only. The numbers are two teaching examples: an upgrader's purchase (the ceilings of directive 329 as the team transcribed them, lesson 4.4, not verified, on an invented price) and a loan taken in four equal parts. Nothing is a rule, a price or a procedure of a bridge loan or of builder financing: the course does not know them.",
    facts,
  };
}
