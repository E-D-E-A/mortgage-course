/**
 * Fact builders shared by lessons 9.3 and 9.4 (stage-9 author B). Not a lesson module: build-data.ts loads only lesson-*.ts and check-*.ts.
 *
 * Everything here COMPOSES: the offers and readings are src/lib/calc/casefile.ts's (author A), the facts about a bank's reading of a
 * file are _bankpolicy-facts.ts's, the engine and scenario facts are _stage8b-facts.ts's, the window facts are checks/kinds/casefile.py's
 * (cf_window), and the clocks are _outreach-facts.ts's. The only new fact kinds are the four of checks/kinds/recommend.py:
 * rec_stage, rec_flag, rec_count, rec_rank (the reason a candidate falls out, a ratio against a line, a count, a rank).
 *
 * A candidate is an alternative read by one bank. Its facts are `g.<alt>.<bank>.<what>`:
 *   loan, ltv, ratio, decision, relief, rate_k   (verdictFacts)   and, when the bank approves,
 *   first, total          under the base scenario (the Directive 451 forecast, lesson 8.10)
 *   max60, margin60       the highest payment of the first five years under the stress scenario, and what is left over the family's budget then
 *   stress_max, rise      the highest payment of the whole term under stress, and its rise over the base first payment (lesson 5.6)
 *   stage                 rec_stage: "refused" · "budget" · "ok"
 *   flag40                rec_flag: "over" · "under" the 40% line
 */
import Decimal from "decimal.js";
import { moneyString } from "../../src/lib/calc/money.ts";
import { mixInputs, type TrackSpec } from "../../src/lib/calc/schedule.ts";
import { applyEdit } from "../../src/lib/calc/outreach.ts";
import { disposableIncome, paymentToIncome } from "../../src/lib/calc/affordability.ts";
import { percentString } from "../../src/lib/calc/percent.ts";
import { qualifyingTotal, scenarioFrom, type ScenarioSpec } from "../../src/lib/calc/sensitivity.ts";
import { type AltId, type CaseOffer, fileOf, householdIncome, offerAt, readingOf, scenarioDef } from "../../src/lib/calc/casefile.ts";
import { FILE, LIVING_BUDGET } from "../../src/data/case-a-final.ts";
import { SCENARIOS } from "../../src/data/case-a-mix.ts";
import { BANKS } from "../../src/data/case-a-positioning.ts";
import type { BankId } from "../../src/data/case-a-offers.ts";
import { THRESHOLD_PTI } from "../../src/data/case-a-recommendation.ts";
import type { Fact } from "../build-data.ts";
import { verdictFacts } from "./_bankpolicy-facts.ts";
import { scnEvalFact } from "./_stage8b-facts.ts";
import { difference, given } from "./_sensitivity-facts.ts";
import { effectFact } from "./_outreach-facts.ts";

export type Add = <T extends Fact>(f: T) => T;
export type Sid = "forecast451" | "stress" | "macro";

export interface Ctx {
  facts: Fact[];
  add: Add;
  get: (id: string) => Fact;
}
export function ctx(facts: Fact[]): Ctx {
  const add: Add = (f) => (facts.push(f), f);
  const get = (id: string): Fact => {
    const f = facts.find((x) => x.id === id);
    if (!f) throw new Error(`no fact ${id}`);
    return f;
  };
  return { facts, add, get };
}

const WINDOW = 60;

/** The highest payment inside the first 60 months, and what is left over the family's budget in a month (kind cf_window, author A's). */
export function windowFact(id: string, sid: Sid, tracks: TrackSpec[], measure: "max" | "max_month" | "margin_max" | "margin_first"): Fact {
  const proto = scnEvalFact("tmp", sid, tracks, "first");
  const { measure: _drop, ...rest } = proto.inputs as Record<string, string | number>;
  const car = FILE.car;
  const r = readingOf(tracks, scenarioDef(sid));
  const value = measure === "max" ? moneyString(r.max60) : measure === "max_month" ? r.max60Month : measure === "margin_max" ? moneyString(r.margin60) : moneyString(r.marginFirst);
  return {
    id,
    kind: "cf_window",
    inputs: { ...rest, window: WINDOW, net: householdIncome().recognised.toString(), budget: LIVING_BUDGET, car_monthly: new Decimal(car.monthly).toString(), car_months: car.monthsLeft as number, measure },
    value,
  };
}

/** The reason a candidate falls out first (kind rec_stage). */
export const stageFact = (id: string, decision: string, margin: string): Fact => ({
  id,
  kind: "rec_stage",
  inputs: { decision, margin },
  value: decision === "refuse" ? "refused" : new Decimal(margin).isNeg() ? "budget" : "ok",
});

/** A ratio against a line, "over" or "under" (kind rec_flag). */
export const flagFact = (id: string, ratio: string, line: string): Fact => ({
  id,
  kind: "rec_flag",
  inputs: { ratio, line },
  value: new Decimal(ratio).gt(line) ? "over" : "under",
});

export const countFact = (id: string, values: string[], match: string): Fact => ({
  id,
  kind: "rec_count",
  inputs: { values: values.join("|"), match },
  value: values.filter((v) => v === match).length,
});

export const rankFact = (id: string, values: string[], of: string): Fact => ({
  id,
  kind: "rec_rank",
  inputs: { values: values.join("|"), of },
  value: 1 + values.filter((v) => new Decimal(v).lt(of)).length,
});

/** Every fact of one candidate (an alternative read by a bank). Returns the offer, so the caller can reach the tracks. */
export function candidateFacts(c: Ctx, alt: AltId, bankId: BankId): CaseOffer {
  const { add, get } = c;
  const p = `g.${alt}.${bankId}`;
  const o = offerAt(alt, bankId);
  const policy = BANKS.find((b) => b.id === bankId)!;
  verdictFacts(add, p, policy, fileOf(o.asked), { scenario: SCENARIOS.base, priced: false });
  let margin = "0.00";
  if (o.approved && o.tracks) {
    add(scnEvalFact(`${p}.first`, "forecast451", o.tracks, "first"));
    add(scnEvalFact(`${p}.total`, "forecast451", o.tracks, "total"));
    add(windowFact(`${p}.max60`, "stress", o.tracks, "max"));
    const m = add(windowFact(`${p}.margin60`, "stress", o.tracks, "margin_max"));
    margin = String(m.value);
    add(scnEvalFact(`${p}.stress_max`, "stress", o.tracks, "max"));
    add(difference(`${p}.rise`, get(`${p}.stress_max`), get(`${p}.first`)));
  }
  if (new Decimal(margin).isNeg()) {
    // how much the budget is short, as a positive number (0 − the negative margin)
    if (!c.facts.some((f) => f.id === "zero")) add({ id: "zero", kind: "given", inputs: {}, value: "0.00" });
    add(difference(`${p}.short`, get("zero"), get(`${p}.margin60`)));
  }
  add(stageFact(`${p}.stage`, String(get(`${p}.decision`).value), margin));
  add(flagFact(`${p}.flag40`, String(get(`${p}.ratio`).value), THRESHOLD_PTI));
  return o;
}

/** Every candidate of the file: the three alternatives at the four banks. */
export function allCandidates(c: Ctx): Record<string, CaseOffer> {
  const out: Record<string, CaseOffer> = {};
  for (const a of ["payment", "total", "exposure"] as const) for (const b of ["a", "b", "c", "d"] as const) out[`${a}.${b}`] = candidateFacts(c, a, b);
  return out;
}

/**
 * "What if the bank raised every track's rate by `points` before signing": the ratio the file would show (kind sens_mix, measure ratio, on the
 * moved list tracks), whether it is over the 40% line, and how much the first payment and the total paid rise (kind out_effect). A "what if", not a
 * forecast: the course does not know what a bank holds between the approval and the signing. Facts: `<p>.<k>.pts|ratio|flag|first_up|total_up`.
 */
export function rateMoveFacts(c: Ctx, p: string, k: number, points: string, listTracks: TrackSpec[], finalTracks: TrackSpec[], scenario: ScenarioSpec): void {
  const { add } = c;
  const moved = applyEdit(
    listTracks.map((t) => ({ ...t, amount: new Decimal(t.amount).toFixed(2) })),
    { target: "all", points },
  );
  const recognised = householdIncome().recognised.toString();
  const disp = disposableIncome(recognised, [FILE.car]);
  const ratio = paymentToIncome(qualifyingTotal(moved), disp);
  add(given(`${p}.${k}.pts`, points));
  add({
    id: `${p}.${k}.ratio`,
    kind: "sens_mix",
    inputs: { ...mixInputs(moved, scenarioFrom(scenario)), measure: "ratio", income: recognised, obligation_monthly: new Decimal(FILE.car.monthly).toString(), obligation_months: FILE.car.monthsLeft as number },
    value: percentString(ratio),
  });
  add(flagFact(`${p}.${k}.flag`, percentString(ratio), THRESHOLD_PTI));
  add(effectFact(`${p}.${k}.first_up`, finalTracks, scenario, { target: "all", points }, "first_delta"));
  add(effectFact(`${p}.${k}.total_up`, finalTracks, scenario, { target: "all", points }, "total_delta"));
}

/**
 * The first month after the five-year window where a variable track of the 25-year alternative resets (month 61): the stress payment of that month,
 * what is left of the net income after it (the car loan has ended by then: it has 26 payments), and what is left over the family's budget.
 * Needs the facts `in.recognised` and `in.budget`. Facts: `<p>.p61`, `<p>.left61`, `<p>.margin61`.
 */
export function month61Facts(c: Ctx, p: string, tracks: TrackSpec[]): void {
  const { add, get } = c;
  const r = readingOf(tracks, scenarioDef("stress"));
  if (r.maxMonth !== 61) throw new Error(`the stress maximum of ${p} is in month ${r.maxMonth}, not 61`);
  if ((FILE.car.monthsLeft as number) >= 61) throw new Error("the car loan still runs in month 61");
  add(scnEvalFact(`${p}.p61`, "stress", tracks, "payment", 61));
  add(difference(`${p}.left61`, get("in.recognised"), get(`${p}.p61`)));
  add(difference(`${p}.margin61`, get(`${p}.left61`), get("in.budget")));
}
