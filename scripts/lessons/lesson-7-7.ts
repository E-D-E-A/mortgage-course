/**
 * Lesson 7.7 — complex deals, part two: self-build, pari passu versus a second-degree mortgage, and
 * the reverse mortgage. An INTRODUCTION ("היכרות בלבד"). The lesson's centre is a DISTINCTION it cannot
 * draw: what the course knows about two banks on one property, what the names alone say, what a summary
 * of directive 329 says (not verified), what Mogi decided (2026-07-29), and what nobody on the team knows.
 *
 * The numbers are two conditional teaching examples, never rules:
 *  - two banks on one property, "if the summary of directive 329 is right that the financing ceiling counts
 *    every loan on the property": 40% of the value from one bank, 20% from another (the field-knowledge
 *    example, with invented banks and an invented value), measured against the single-home ceiling of 75%
 *    (lesson 4.4, the team's transcription, not verified);
 *  - self-build, "if the field-knowledge claim is right" (FK-H-003: 50% of the land, then up to 70% of the
 *    future value; not verified, no source found): an invented plot and an invented future value.
 * Recomputed independently: ltv_max_loan and ltv_percent (ltv.py), reg_max_loan (regulation.py), difference
 * and hh_sum. Nothing is a bank's term; the reverse mortgage has no number at all.
 */
import type { Fact, LessonData } from "../build-data.ts";
import { difference as diff, sum } from "./affordability-facts.ts";
import { atPercent, given, givenNumber, ltv, maxLoan } from "./regulation-facts.ts";

export default function lesson77(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);
  const get = (id: string) => facts.find((f) => f.id === id) as Fact;

  // ── Two banks on one property (the field-knowledge example 40% + 20%, invented banks and value) ──
  add(given("p.value", "2000000"));
  add(givenNumber("p.pct_a", "40"));
  add(givenNumber("p.pct_b", "20"));
  add(givenNumber("p.pct_cap", "75"));
  add(atPercent("p.a", "2000000", "40"));
  add(atPercent("p.b", "2000000", "20"));
  add(sum("p.both", ["800000", "400000"]));
  add(ltv("p.ltv", "1200000", "2000000"));
  add(maxLoan("p.cap", "2000000", "only_home"));
  add(diff("p.room", get("p.cap"), get("p.both")));

  // ── Self-build, if the claim of field knowledge holds: 50% of the land, then up to 70% of the future value ──
  add(given("s.land", "1000000"));
  add(given("s.future", "3000000"));
  add(givenNumber("s.pct_land", "50"));
  add(givenNumber("s.pct_future", "70"));
  add(atPercent("s.first", "1000000", "50"));
  add(atPercent("s.cap", "3000000", "70"));
  add(diff("s.later", get("s.cap"), get("s.first")));

  return {
    lesson: "7.7",
    title: "עסקאות מורכבות, ב׳: בנייה עצמית, שני בנקים על אותו נכס ומשכנתא הפוכה",
    note: "Introduction only. Two conditional teaching examples (two lenders on one property under the single-home ceiling of the team's transcription of directive 329; self-build under a field-knowledge claim that has no source). Neither is a rule. The reverse mortgage has no number: the course does not know its terms.",
    facts,
  };
}
