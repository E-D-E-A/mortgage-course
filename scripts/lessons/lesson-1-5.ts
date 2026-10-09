/**
 * Lesson 1.5 — kinds of deals and clients. A classification lesson: few
 * numbers. Every number it shows is declared here as a fact; the page reads
 * data/lessons/1-5.json, and checks/kinds/mix.py recomputes the computed ones.
 *
 * Case C (עדי וירון) is the course's synthetic refinance case (course map,
 * section 8). The count of loan purposes is the number of values of
 * `transaction_stated.purpose` in the advisor app's field registry
 * (edea-mortgage, packages/schemas/registry/v1.yaml, commit 6156bf8, read 2026-10-09).
 */
import { remainder, sum } from "../../src/lib/calc/mix.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import type { Fact, LessonData } from "../build-data.ts";

const given = (id: string, value: string): Fact => ({ id, kind: "given", inputs: {}, value });

export default function lesson15(): LessonData {
  const facts: Fact[] = [
    // The registry's purposes: רכישת דירה, רכישת מגרש, בנייה עצמית, מחזור מבנק אחר, מחזור מאותו בנק,
    // הלוואה לכל מטרה, שיפוצים, הרחבת נכס, בניית ממ"ד.
    given("purposes.count", "9"),
    // The investment-home ceiling, as lesson 1.2 shows it (Directive 329 per the team's Brain transcription,
    // page 7503881, 2026-10-08; not yet checked against the directive). Same value as 1.2's ceiling.investment.
    given("ceiling.investment", "50"),

    // Case C: an existing mortgage, and an addition for renovation.
    given("caseC.existing", "700000"),
    given("caseC.years", "20"),
    given("caseC.addition", "150000"),

    // Exercise 3: a refinance with an addition.
    given("ex3.debt", "520000.00"),
    {
      id: "ex3.answer",
      kind: "mix_amount_sum",
      inputs: { amount_1: "520000", amount_2: "80000" },
      value: moneyString(sum(["520000", "80000"])),
    },
    {
      id: "ex3.subtracted",
      kind: "mix_remainder",
      inputs: { loan: "520000", amount_1: "80000" },
      value: moneyString(remainder("520000", ["80000"])),
    },
  ];

  return {
    lesson: "1.5",
    title: "סוגי עסקאות ולקוחות",
    note: "Case C is synthetic. The purpose count is read from the advisor app's field registry (commit 6156bf8).",
    facts,
  };
}
