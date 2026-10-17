/**
 * Lesson 8.11 - Monte Carlo from zero. LABEL: general method (maths); the future MODEL (yearly moves of prime and their weights) is
 * an invented ASSUMPTION for illustration ("זו הנחה, לא עובדה"). Mogi today has no simulation in code. The generator is the seeded
 * mulberry32 of src/lib/calc/montecarlo.ts, recomputed independently in checks/kinds/montecarlo.py (bit for bit); the cash flow of
 * each simulated future comes from the engine, rechecked through checks/kinds/schedule.py. The mix is one prime track
 * (300,000 for 15 years at the course's price-list prime rate): a teaching assumption, not an offer.
 */
import { PRICE_LIST } from "../../src/data/case-a-mix.ts";
import { DEFAULT_MODEL, type FutureModel } from "../../src/lib/calc/montecarlo.ts";
import type { TrackSpec } from "../../src/lib/calc/schedule.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, given, givenMoney } from "./_sensitivity-facts.ts";
import { mcFact, mcRngFact, mcStepsFact } from "./_stage8b-facts.ts";

export const TRACK: TrackSpec = { kind: "prime", amount: "300000", rate: PRICE_LIST.prime, months: 180 };
export const MODEL: FutureModel = { ...DEFAULT_MODEL, years: 15 };
export const THRESHOLD = "2400";

export default function lesson811(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);

  add(givenMoney("t.amount", TRACK.amount as string));
  add(given("t.rate", TRACK.rate as string));
  add(given("t.years", TRACK.months / 12));
  add(givenMoney("t.threshold", THRESHOLD));
  add(mcRngFact("rng.seed1", 1, 6));
  add(mcStepsFact("steps.seed1", 1, 6, MODEL));

  // Ten futures, by hand.
  add(mcFact("ten.list", [TRACK], 1, 10, MODEL, "list_max"));
  add(mcFact("ten.count", [TRACK], 1, 10, MODEL, "count_at_least", THRESHOLD));
  add(mcFact("ten.p", [TRACK], 1, 10, MODEL, "p_at_least", THRESHOLD));
  add(mcFact("ten.p_pct", [TRACK], 1, 10, MODEL, "p_pct", THRESHOLD));
  add(mcFact("ten.mean", [TRACK], 1, 10, MODEL, "mean_max"));
  add(mcFact("ten.first", [TRACK], 1, 10, MODEL, "first"));

  // A thousand futures.
  add(mcFact("k.first", [TRACK], 1, 1000, MODEL, "first"));
  for (const m of ["count_at_least", "p_at_least", "p_pct", "se_pct", "se"] as const) add(mcFact(`k.${m}`, [TRACK], 1, 1000, MODEL, m, THRESHOLD));
  for (const m of ["mean_max", "p5_max", "p50_max", "p95_max", "min_max", "max_max"] as const) add(mcFact(`k.${m}`, [TRACK], 1, 1000, MODEL, m));

  // The same question again: other seeds.
  const k1p = facts.find((x) => x.id === "k.p_pct")!;
  const k2p = add(mcFact("k2.p_pct", [TRACK], 2, 1000, MODEL, "p_pct", THRESHOLD));
  add(difference("k.gap_pct", k1p, k2p));
  for (let seed = 1; seed <= 8; seed++) add(mcFact(`h.seed${seed}.p_pct`, [TRACK], seed, 100, MODEL, "p_pct", THRESHOLD));

  return {
    lesson: "8.11",
    title: "סימולציית מונטה־קרלו מאפס",
    note: "One prime track (300,000, 15 years, price-list prime rate) simulated over 15 years with an INVENTED model of prime's yearly moves (src/lib/calc/montecarlo.ts DEFAULT_MODEL, years 15). Seeded generator mulberry32. Teaching assumptions, synthetic data.",
    facts,
  };
}
