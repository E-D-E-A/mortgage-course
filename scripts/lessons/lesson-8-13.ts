/**
 * Lesson 8.13 - the space of mixes, and why not check everything. LABEL: Mogi today has no mix search in code; the counts are
 * combinatorics (general maths), computed in src/lib/calc/search.ts with BigInt and rechecked in checks/kinds/search.py with
 * Python integers. The Brain's two figures (about 287,000 combinations with one term, about 150 billion with a term per track,
 * on a 5-point split grid; about 124 million and 66 trillion at a 1-point grid) are REPRODUCED under a stated reading: five kinds
 * of track, 27 terms (the course reads them as 4 to 30 years; the page does not say), a term for every kind even with a zero share.
 * Whether Mogi counts it so is a question for Eylon. Time per candidate (1 millisecond) is an ASSUMPTION, not a measurement.
 */
import { BRAIN_SPACE, countLegalSplits, countSpace, yearsToCheck } from "../../src/lib/calc/search.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { given } from "./_sensitivity-facts.ts";
import { countFact, legalFact, minutesFact, powFact, yearsFact } from "./_stage8b-facts.ts";

const FIVE = ["fixed_unlinked", "fixed_linked", "prime", "variable_unlinked", "variable_linked"] as const;

export default function lesson813(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);

  // A space you can list by hand.
  add(countFact("hand.two", { kinds: 2, stepPercent: 50, terms: 1, termMode: "one" }));
  add(countFact("hand.two_terms", { kinds: 2, stepPercent: 50, terms: 3, termMode: "one" }));
  add(countFact("hand.two_per", { kinds: 2, stepPercent: 50, terms: 3, termMode: "per_track" }));
  add(countFact("hand.two_active", { kinds: 2, stepPercent: 50, terms: 3, termMode: "per_active_track" }));
  add(countFact("hand.three_25", { kinds: 3, stepPercent: 25, terms: 1, termMode: "one" }));
  add(countFact("hand.three_terms", { kinds: 3, stepPercent: 25, terms: 3, termMode: "one" }));
  add(powFact("hand.one_track", 3, 1));
  add(powFact("hand.two_tracks", 3, 2));
  add(countFact("demo.grid", { kinds: 3, stepPercent: 10, terms: 3, termMode: "one" }));
  add(countFact("demo.splits", { kinds: 3, stepPercent: 10, terms: 1, termMode: "one" }));

  // The Brain's space: five kinds, 5-point grid, 27 terms.
  add(given("brain.kinds", BRAIN_SPACE.kinds));
  add(given("brain.step", BRAIN_SPACE.stepPercent));
  add(given("brain.terms", BRAIN_SPACE.terms));
  add(countFact("brain.splits", { ...BRAIN_SPACE, terms: 1, termMode: "one" }));
  const one = add(countFact("brain.one", { ...BRAIN_SPACE, termMode: "one" }));
  const per = add(countFact("brain.per_track", BRAIN_SPACE));
  const active = add(countFact("brain.per_active", { ...BRAIN_SPACE, termMode: "per_active_track" }));
  add(countFact("brain.fine_one", { ...BRAIN_SPACE, stepPercent: 1, termMode: "one" }));
  const fine = add(countFact("brain.fine_per_track", { ...BRAIN_SPACE, stepPercent: 1 }));

  // How much of it is already illegal (the one-third-fixed rule).
  add(legalFact("brain.legal", [...FIVE], BRAIN_SPACE.stepPercent, countLegalSplits([...FIVE], BRAIN_SPACE.stepPercent)));

  // Time, at an assumed millisecond a candidate.
  const MS = 1;
  add(given("time.ms", MS));
  add(minutesFact("time.one", one.id, MS, BigInt(one.value as string)));
  add(yearsFact("time.per_track", per.id, MS, yearsToCheck(BigInt(per.value as string), MS).toFixed(1)));
  add(yearsFact("time.per_active", active.id, MS, yearsToCheck(BigInt(active.value as string), MS).toFixed(1)));
  add(yearsFact("time.fine", fine.id, MS, yearsToCheck(BigInt(fine.value as string), MS).toFixed(1)));
  void countSpace;

  return {
    lesson: "8.13",
    title: "מרחב התמהילים",
    note: "Counts by combinatorics (BigInt in src/lib/calc/search.ts; Python integers in the check). Five kinds of track, 5-point split grid, 27 terms read as 4-30 years: the course's reconstruction of the Brain's figures. 1 ms per candidate is an assumption for illustration, not a measurement.",
    facts,
  };
}
