/**
 * Lesson 6.8 — why a bank offers its own mix, and how to tell whether a counter-offer is good for the
 * family. Every number the page, the exercises and the video show is declared here as a fact; the page
 * reads data/lessons/6-8.json and checks/kinds/outreach.py, sensitivity.py and schedule.py recompute
 * every computed one.
 *
 * WHAT IS A RULE AND WHAT IS AN EXERCISE'S ASSUMPTION
 *   - The counters are teaching examples of the KINDS of answer the team heard of (FK-H-072). Whether a
 *     real bank answers this way, and why, is unknown. Each counter is priced at its own bank's invented
 *     price list, and compared with the family's request priced at the SAME bank (the same basis).
 *   - The bank's income in the last table is a toy: the cost of funds of each kind of track is invented
 *     (src/data/case-a-offers.ts EXERCISE_COST_OF_FUNDS). The mechanism (a bank earns the gap between
 *     the rate it charges and what the money costs it) is general economics; the numbers are not.
 *   - The family's three goals are lesson 5.6's (Mogi's J-090 design): a low payment, a low total, and
 *     little exposure. The ratio is computed the way Mogi computes it (DEC-3): the first payment of each
 *     track on its full amount over the disposable income, with the car loan taken off.
 */
import {
  BANK_PRICES,
  COUNTERS,
  counterTracks,
  EXERCISE_COST_OF_FUNDS,
  requestedAt,
} from "../../src/data/case-a-offers.ts";
import { CANDIDATES, GOAL_CONTEXT, SCENARIOS } from "../../src/data/case-a-mix.ts";
import { percentString } from "../../src/lib/calc/percent.ts";
import { mixInputs, type TrackSpec } from "../../src/lib/calc/schedule.ts";
import { scenarioFrom } from "../../src/lib/calc/sensitivity.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, firstRatioFact, given, marginFact, mixFact } from "./_outreach-facts.ts";
import { tableFact } from "./_sensitivity-facts.ts";
import Decimal from "decimal.js";

void CANDIDATES;
void GOAL_CONTEXT;

const base = SCENARIOS.base;
const stress = SCENARIOS.stress;

type Group = "prime" | "linked" | "fixed_for_term" | "resetting";
const shareFact = (id: string, tracks: TrackSpec[], group: Group): Fact => {
  const loan = tracks.reduce((s, t) => s.plus(t.amount), new Decimal(0));
  const kinds: Record<Group, string[]> = { prime: ["prime"], linked: ["fixed_linked", "variable_linked"], fixed_for_term: ["fixed_unlinked", "fixed_linked"], resetting: ["variable_unlinked", "variable_linked"] };
  const part = tracks.filter((t) => kinds[group].includes(t.kind)).reduce((s, t) => s.plus(t.amount), new Decimal(0));
  return { id, kind: "sch_mix_share", inputs: { ...mixInputs(tracks, scenarioFrom(base)), group }, value: percentString(part.div(loan).mul(100)) };
};

export default function lesson68(): LessonData {
  const facts: Fact[] = [given("data_date", "2026-10-16"), given("case.loan", "1640000")];

  // The two comparisons. Prefix: rb = the request at bank ב׳, sw = bank ב׳'s counter (the variable track swapped for a linked one);
  // rc = the request at bank ג׳, hh = bank ג׳'s counter (half prime, half fixed).
  const pairs = [
    { req: "rb", ctr: "sw", bank: "b" as const, counter: COUNTERS[0] },
    { req: "rc", ctr: "hh", bank: "c" as const, counter: COUNTERS[1] },
  ];
  const tracksOf: Record<string, TrackSpec[]> = {
    rb: requestedAt("b"),
    sw: counterTracks("swap_linked"),
    rc: requestedAt("c"),
    hh: counterTracks("half_half"),
  };
  const measureFacts = (id: string) => {
    const t = tracksOf[id];
    const first = mixFact(`${id}.first`, { tracks: t, scenario: base }, "first");
    const total = mixFact(`${id}.total`, { tracks: t, scenario: base }, "total");
    const stressMax = mixFact(`${id}.stress_max`, { tracks: t, scenario: stress }, "max");
    const ratio = firstRatioFact(`${id}.ratio`, first);
    const variable = mixFact(`${id}.variable_share`, { tracks: t, scenario: base }, "variable_share");
    const rise = difference(`${id}.rise`, stressMax, first);
    facts.push(first, total, stressMax, rise, ratio, variable);
    return { first, total, stressMax, rise, ratio, variable };
  };
  const m: Record<string, ReturnType<typeof measureFacts>> = {};
  for (const id of Object.keys(tracksOf)) m[id] = measureFacts(id);

  for (const p of pairs) {
    facts.push(
      difference(`${p.ctr}.first_diff`, m[p.ctr].first, m[p.req].first),
      difference(`${p.ctr}.total_diff`, m[p.ctr].total, m[p.req].total),
      difference(`${p.ctr}.rise_diff`, m[p.ctr].rise, m[p.req].rise),
      difference(`${p.ctr}.stress_diff`, m[p.ctr].stressMax, m[p.req].stressMax),
      difference(`${p.ctr}.ratio_diff`, m[p.ctr].ratio, m[p.req].ratio),
      // The same, from the request's side, for the exercises that ask "how much lower".
      difference(`${p.ctr}.first_gain`, m[p.req].first, m[p.ctr].first),
    );
  }

  // Shares of the loan: what the counter moved.
  facts.push(
    shareFact("rb.share_prime", tracksOf.rb, "prime"),
    shareFact("rb.share_reset", tracksOf.rb, "resetting"),
    shareFact("rb.share_fixed", tracksOf.rb, "fixed_for_term"),
    shareFact("rb.share_linked", tracksOf.rb, "linked"),
    shareFact("sw.share_prime", tracksOf.sw, "prime"),
    shareFact("sw.share_reset", tracksOf.sw, "resetting"),
    shareFact("sw.share_fixed", tracksOf.sw, "fixed_for_term"),
    shareFact("sw.share_linked", tracksOf.sw, "linked"),
    shareFact("hh.share_prime", tracksOf.hh, "prime"),
    shareFact("hh.share_fixed", tracksOf.hh, "fixed_for_term"),
    shareFact("hh.share_reset", tracksOf.hh, "resetting"),
  );

  // The limits of Directive 329 and the 40% line, for the four mixes at once (the table of lesson 5.6).
  facts.push(
    tableFact(
      "limits",
      Object.keys(tracksOf).map((id) => ({ id, tracks: tracksOf[id] })),
      base,
      stress,
    ),
  );

  // The prices behind the two counters: the family's request and each counter's own bank.
  facts.push(
    given("price.b.variable", BANK_PRICES.b.variable_unlinked),
    given("price.b.fixed_linked", BANK_PRICES.b.fixed_linked),
    given("price.c.prime", BANK_PRICES.c.prime),
    given("price.c.fixed", BANK_PRICES.c.fixed_unlinked),
  );

  // A toy: a bank's year, with invented costs of funds (the table of the lesson's last part).
  const costs = EXERCISE_COST_OF_FUNDS;
  for (const [k, v] of Object.entries(costs)) facts.push(given(`cost.${k}`, v));
  const margin: Record<string, Fact> = {};
  for (const id of Object.keys(tracksOf)) {
    margin[id] = marginFact(`${id}.margin`, tracksOf[id], costs);
    facts.push(margin[id]);
  }
  for (const p of pairs) facts.push(difference(`${p.ctr}.margin_diff`, margin[p.ctr], margin[p.req]));

  return {
    lesson: "6.8",
    title: "למה בנק מציע את התמהיל שלו",
    note: "The counters, the banks' prices and the cost of funds are invented teaching data; a real bank's reasons are unknown. Each counter is compared with the family's request at the same invented bank.",
    facts,
  };
}
