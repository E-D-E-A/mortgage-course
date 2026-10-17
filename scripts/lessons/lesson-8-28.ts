/**
 * Lesson 8.28 — the workshop: a small engine in a spreadsheet (and in Python). Stage 8, author D.
 * One synthetic case (src/data/case-s8.ts), one positioning choice, a grid of 66 mixes, the hard constraints, the efficient
 * front, a choice by weights, an explanation made of the engine's numbers, and a sample bank offer. Every number is read from
 * src/lib/calc/ws8.ts and recomputed in checks/kinds/ws8.py (through checks/ws8_engine.py, also the notebook's code). The
 * spreadsheet (public/downloads/engine-workshop-*.xlsx) and the notebook (engine-workshop.ipynb) are built from this lesson's
 * data file by scripts/build-engine-workshop.py. Status: "עתיד" (Mogi today has no mix calculation in code).
 */
import { BASE_CHOICE, type Choice } from "../../src/data/case-s8.ts";
import { runWorkshop, WS_WEIGHTS } from "../../src/lib/calc/ws8.ts";
import type { LessonData } from "../build-data.ts";
import { given } from "./affordability-facts.ts";
import { caseFact, ws8Fact } from "./_ws8-facts.ts";
import { percentFact } from "./_drift-facts.ts";

export const POSITIONED: Choice = { ...BASE_CHOICE, extraEquity: "20000" };
/** Closing the car loan spends the savings, so 20,000 more equity is no longer there: nothing is feasible. */
export const OVERSPENT: Choice = { ...BASE_CHOICE, extraEquity: "20000", closeCar: true };
export const CONSTRAINT_IDS = ["sum_equals_loan", "equity_available", "ltv", "pti", "variable_share", "term", "bank_ratio", "bank_ltv", "client_max_payment", "client_target_ratio"];

export default function lesson828(): LessonData {
  const facts = [caseFact(), ...WS_WEIGHTS.map((w, i) => given(`w.${i}`, String(w)))];
  const add = (prefix: string, c: Choice, whats: string[]) => whats.forEach((w) => facts.push(ws8Fact(`${prefix}.${w}`, c, w)));
  add("p", POSITIONED, ["loan", "ltv", "disposable", "space", "feasible", "efficient", "front_ids", "winner_id", "runner_id", "winner:first", "winner:total", "winner:exposure", "gap:first", "gap:total", "gap:exposure"]);
  add("p", POSITIONED, CONSTRAINT_IDS.map((id) => `reject:${id}`));
  add("p", POSITIONED, ["offer:estimate_first", "offer:offer_first", "offer:first_gap", "offer:estimate_total", "offer:offer_total", "offer:total_gap"]);
  add("b", BASE_CHOICE, ["loan", "ltv", "disposable", "feasible", "efficient", "winner_id", "winner:first"]);
  add("o", OVERSPENT, ["feasible"]);
  // The same positioning, weights that care most about the exposure (10, 20, 70): who wins then.
  facts.push(ws8Fact("x.winner_id", POSITIONED, "winner_id", [10, 20, 70]), ws8Fact("x.winner:first", POSITIONED, "winner:first", [10, 20, 70]), ws8Fact("x.winner:exposure", POSITIONED, "winner:exposure", [10, 20, 70]));
  // The rows of the efficient front, with their measures: the page's table.
  const r = runWorkshop(POSITIONED, WS_WEIGHTS);
  for (const row of r.rows.filter((x) => x.efficient)) {
    for (const f of ["first", "total", "exposure", "score", "reasons"]) facts.push(ws8Fact(`p.row.${row.id}.${f}`, POSITIONED, `row:${row.id}:${f}`));
  }
  // The winner of the unpositioned request, and one rejected candidate with every reason it fails.
  const space = Number(facts.find((x) => x.id === "p.space")?.value);
  const fact = (id: string) => Number(facts.find((x) => x.id === id)?.value);
  facts.push(percentFact("s.variable", fact("p.reject:variable_share"), space), percentFact("s.max", fact("p.reject:client_max_payment"), space), percentFact("s.target", fact("p.reject:client_target_ratio"), space));
  const rejected = r.rows.filter((x) => x.reasons.length >= 2)[0];
  if (rejected) for (const f of ["first", "reasons"]) facts.push(ws8Fact(`p.rej.${f}`, POSITIONED, `row:${rejected.id}:${f}`));
  facts.push({ id: "p.rej.id", kind: "given", inputs: {}, value: rejected?.id ?? "" });
  return {
    lesson: "8.28",
    title: "סדנה: מנוע קטן בגיליון (וגם ב־Python)",
    note: "Synthetic: the stage's case (case A's numbers, fictional banks), a 66-candidate grid, hard constraints, front, a choice by illustrative weights, the explanation numbers and a made-up bank offer. Mogi today has no mix calculation in code; everything is future and for illustration.",
    facts,
  };
}
