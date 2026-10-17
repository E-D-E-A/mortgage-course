/**
 * Lesson 8.15 — the efficient frontier, and choosing a point by the client's preferences.
 *
 * Fifteen candidate mixes of case A (a parent joins as a borrower; src/data/frontier-candidates.ts), each with the three
 * goals of lesson 5.6 (first payment, total paid, exposure — sens_table), judged twice: by the law and the asked bank only,
 * and with the client's own limits on top (constraints.ts; checks/kinds/constraints.py). The frontier, who dominates whom,
 * the picks by weights and the weights that never pick an efficient point are frontier.ts' (checks/kinds/frontier.py).
 * Everything is SYNTHETIC and for illustration; the weights are never a Mogi decision.
 */
import Decimal from "decimal.js";
import { SCENARIOS } from "../../src/data/case-a-mix.ts";
import { S8_CASE, loanOfChoice } from "../../src/data/case-s8.ts";
import { ENTRIES, FRONTIER_CHOICE, lawOnly, mixCandidates, withClientLimits } from "../../src/data/frontier-candidates.ts";
import { evaluate } from "../../src/lib/calc/constraints.ts";
import type { Row } from "../../src/lib/calc/objectives.ts";
import { measuresOf } from "../../src/lib/calc/sensitivity.ts";
import { scenarioFrom } from "../../src/lib/calc/sensitivity.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { reasonsFact } from "./_constraints-facts.ts";
import { frCount, frFront, frNeverCount, frPick, frReach, frReachExact, given } from "./_s8c-facts.ts";
import { engTableFact } from "./_stage8b-facts.ts";
import { difference, mixFact } from "./_sensitivity-facts.ts";

export const WEIGHT_SETS: Record<string, number[]> = { pay: [60, 20, 20], total: [20, 60, 20], exp: [20, 20, 60], even: [1, 1, 1] };

export default function lesson815(): LessonData {
  const facts: Fact[] = [];
  const push = (...f: Fact[]) => facts.push(...f);
  const byId = (id: string) => facts.find((x) => x.id === id) as Fact;

  const base = SCENARIOS.base;
  const stress = SCENARIOS.stress;
  const cands = mixCandidates();
  const table = engTableFact("cand.table", cands, base, stress);
  push(table);
  const t = Object.fromEntries((table.value as { id: string; first: string; total: string; rise: string }[]).map((r) => [r.id, r]));

  // Feasibility: by the law and the bank only, then with the client's own limits.
  for (const c of lawOnly()) push(reasonsFact(`law.${c.id}`, c));
  for (const c of withClientLimits()) push(reasonsFact(`client.${c.id}`, c));
  const rowsOf = (prefix: string): Row[] =>
    ENTRIES.map((e) => ({ id: e.id, values: [t[e.id].first, t[e.id].total, t[e.id].rise], feasible: byId(`${prefix}.${e.id}`).value === "" }));
  const law = rowsOf("law");
  const client = rowsOf("client");
  // The page's claims about feasibility are checked here, so the text cannot drift from the data.
  if (law.some((r) => !r.feasible)) throw new Error("lesson 8.15 reads all fifteen candidates as feasible by the law and the bank");
  if (evaluate(withClientLimits()[0]).feasible) throw new Error("lesson 8.15 reads the 20-year fixed mix as breaking the client's limits");

  push(
    frCount("law.count_feasible", law, "feasible"),
    frCount("law.count_efficient", law, "efficient"),
    frCount("law.count_dominated", law, "dominated"),
    frFront("law.front", law),
    frCount("law.ft.count_efficient", law, "efficient", [0, 1]),
    frFront("law.ft.front", law, [0, 1]),
    frCount("law.fe.count_efficient", law, "efficient", [0, 2]),
    frFront("law.fe.front", law, [0, 2]),
    frCount("client.count_feasible", client, "feasible"),
    frCount("client.count_efficient", client, "efficient"),
    frFront("client.front", client),
    frReach("law.reach", law, 5),
    frReachExact("law.reach_exact", law, 5),
    frNeverCount("law.never_count", law, 5),
  );
  for (const [k, w] of Object.entries(WEIGHT_SETS)) push(frPick(`pick.${k}`, law, w), frPick(`pick.client.${k}`, client, w));

  // Hand-sized comparisons for the explanation and the exercises.
  const mix = (id: string) => ({ tracks: cands.find((c) => c.id === id)!.tracks, scenario: base });
  for (const id of ["m01", "m03", "m06", "m07", "m08", "m09"]) {
    push(mixFact(`v.${id}.first`, mix(id), "first"), mixFact(`v.${id}.total`, mix(id), "total"));
  }
  push(
    difference("d.m01_m03.first", byId("v.m01.first"), byId("v.m03.first")),
    difference("d.m03_m01.total", byId("v.m03.total"), byId("v.m01.total")),
    difference("d.m06_m08.first", byId("v.m08.first"), byId("v.m06.first")),
    difference("d.m08_m06.total", byId("v.m08.total"), byId("v.m06.total")),
    given("limit.first", S8_CASE.maxPayment),
    given("loan", loanOfChoice(FRONTIER_CHOICE).toFixed(2)),
  );
  // m08 is dominated in (first, total) by m06 but not in all three: the third goal keeps it.
  const ft = (byId("law.ft.front").value as { id: string; efficient: boolean }[]).find((r) => r.id === "m08");
  const all = (byId("law.front").value as { id: string; efficient: boolean }[]).find((r) => r.id === "m08");
  if (ft?.efficient || !all?.efficient) throw new Error("lesson 8.15 reads m08 as dominated on two goals and efficient on three");
  void measuresOf;
  void scenarioFrom;
  void Decimal;

  return {
    lesson: "8.15",
    title: "חזית הפתרונות היעילים",
    note: "Synthetic. Fifteen mixes of case A with a parent as a second borrower, priced at bank א׳'s list (a teaching simplification); the three goals as in lesson 5.6 (base and stress scenarios of case A). The weights are for illustration, not a Mogi decision. Feasibility: constraints.ts (the law and the bank; then the client's own limits). Frontier, picks and reach: frontier.ts over the lattice of weights in steps of 5 percent.",
    facts,
  };
}
