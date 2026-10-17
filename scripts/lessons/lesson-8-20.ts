/**
 * Lesson 8.20 — an estimate against a bank's offer (the distinction the lesson teaches).
 *
 * Three things that all look like "the rate": a public average (a fact about the past and about many borrowers), an estimate
 * (a model's guess for this case), a personal offer (a bank's answer to this case, with a date and terms); and, apart, a deal
 * that was carried out. Numbers: the workshop's made-up offer of case-s8.ts (candidate c05's shape at fictional bank ב׳, rates a few
 * hundredths off the list) against the estimate at the list; the same variable track with the simulation's default reset every
 * five years against an offer that resets every seven (the decided rule: the offer's terms take precedence over the simulation's
 * defaults); and eight made-up pairs (estimate, offer) for one kind of track at bank ב׳, to see whether the model is biased.
 * All SYNTHETIC. Engine facts: eng_eval (checks/kinds/engine.py, through schedule.py); the interval: est_mean_interval.
 */
import { SCENARIOS } from "../../src/data/case-a-mix.ts";
import { entryOf, mixOf, sampleOfferTracks, SAMPLE_OFFER } from "../../src/data/case-s8.ts";
import { scenarioFrom } from "../../src/lib/calc/sensitivity.ts";
import type { TrackSpec } from "../../src/lib/calc/schedule.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, given as given38 } from "./lesson-3-8.ts";
import { estMean } from "./_s8c-facts.ts";
import { engFact } from "./_stage8b-facts.ts";

/** Eight pairs: the model's estimate of a fixed track's rate at bank ב׳ and the offer that came, in percent. Invented. */
export const PAIRS: [string, string][] = [["4.30", "4.35"], ["4.30", "4.40"], ["4.35", "4.38"], ["4.28", "4.30"], ["4.32", "4.41"], ["4.30", "4.36"], ["4.33", "4.38"], ["4.31", "4.37"]];

export default function lesson820(): LessonData {
  const facts: Fact[] = [];
  const push = (...f: Fact[]) => facts.push(...f);
  const byId = (id: string) => facts.find((x) => x.id === id) as Fact;
  const base = scenarioFrom(SCENARIOS.base);
  const stress = scenarioFrom(SCENARIOS.stress);

  // ── The workshop's offer against the estimate at the list ──
  const { choice, shape } = entryOf(SAMPLE_OFFER.base);
  const estimate: TrackSpec[] = mixOf({ ...choice, bank: SAMPLE_OFFER.bank }, shape);
  const offer: TrackSpec[] = sampleOfferTracks();
  estimate.forEach((t, k) => push(given38(`est.rate_${k + 1}`, String(t.rate)), given38(`off.rate_${k + 1}`, String(offer[k].rate)), given38(`est.amount_${k + 1}`, String(t.amount))));
  push(
    engFact("est.first", estimate, base, "first"),
    engFact("est.total", estimate, base, "total"),
    engFact("est.max_stress", estimate, stress, "max"),
    engFact("off.first", offer, base, "first"),
    engFact("off.total", offer, base, "total"),
    engFact("off.max_stress", offer, stress, "max"),
  );
  push(
    difference("gap.first", byId("off.first"), byId("est.first")),
    difference("gap.total", byId("off.total"), byId("est.total")),
    difference("gap.max_stress", byId("off.max_stress"), byId("est.max_stress")),
  );
  estimate.forEach((_, k) => push(difference(`gap.rate_${k + 1}`, byId(`off.rate_${k + 1}`), byId(`est.rate_${k + 1}`))));

  // ── The reset interval: the simulation's default (5 years) against the offer's (7 years) ──
  const variable = (reset: number): TrackSpec[] => [{ kind: "variable_unlinked", amount: "500000", rate: "4.10", months: 360, resetMonths: reset }];
  push(
    given38("reset.default", "60"),
    given38("reset.offer", "84"),
    engFact("reset.sim.total", variable(60), stress, "total"),
    engFact("reset.off.total", variable(84), stress, "total"),
    engFact("reset.sim.max", variable(60), stress, "max"),
    engFact("reset.off.max", variable(84), stress, "max"),
    engFact("reset.sim.max_month", variable(60), stress, "max_month"),
    engFact("reset.off.max_month", variable(84), stress, "max_month"),
  );
  push(difference("reset.gap.total", byId("reset.sim.total"), byId("reset.off.total")), difference("reset.gap.max", byId("reset.sim.max"), byId("reset.off.max")));

  // ── Is the estimate biased? Eight pairs. ──
  PAIRS.forEach(([e, o], k) => push(given38(`pair.${k + 1}.est`, e), given38(`pair.${k + 1}.off`, o)));
  PAIRS.forEach((_, k) => push(difference(`pair.${k + 1}.gap`, byId(`pair.${k + 1}.off`), byId(`pair.${k + 1}.est`))));
  push(estMean("pairs.mean", PAIRS.map((_, k) => byId(`pair.${k + 1}.gap`).value as string)));
  // The first three pairs only: with so few, the interval is wide.
  push(estMean("pairs3.mean", [1, 2, 3].map((k) => byId(`pair.${k}.gap`).value as string)));
  // Without pair 2 (the largest gap): seven pairs, to see whether one pair carries the verdict.
  push(estMean("pairs7.mean", [1, 3, 4, 5, 6, 7, 8].map((k) => byId(`pair.${k}.gap`).value as string)));
  push(given38("pairs.count", String(PAIRS.length)));

  return {
    lesson: "8.20",
    title: "אומדן מול הצעת בנק",
    note: "Synthetic. The workshop's made-up offer of fictional bank ב׳ (candidate c05's shape: 50% fixed, 50% prime, 30 years; rates 4.35% and 4.65%) against the estimate at bank ב׳'s list (4.30% and 4.70%), flat scenarios of case A. The reset example: a variable track of 500,000 ₪ at 4.10% over 30 years, stress scenario of case A, reset every 60 months (the simulation's assumption) against 84 months (an offer's terms). The eight pairs (estimate, offer) are invented teaching numbers.",
    facts,
  };
}
