/**
 * The full pipeline of lesson 8.21: positioning -> mix -> predicted price -> probability of approval -> ranking ->
 * explanation, once for each bank; and a real offer that replaces a bank's estimate.
 *
 * LABEL (course/stage-8-brief.md): this is a TEACHING MODEL of how the algorithm Mogi plans could be put together
 * ("עתיד"). Mogi today has no mix calculation in code (the engine call is frozen). Every weight, threshold, price list and
 * line below is for illustration (להדגמה): the four banks are fictional, their price lists and refusal/relief lines are
 * stage 6's invented rules (bankpolicy.ts), the probability model is lesson 8.19's SYNTHETIC one (taken as if calibrated),
 * and the ranking rule is the course's. The LLM never computes any of it: it only explains the numbers this code produced.
 *
 * ── The stages, per bank ───────────────────────────────────────────────────
 *   1 positioning   a short list of level-1 choices (lesson 8.6): the request as asked, and with a parent joining as a
 *                   borrower. Each is judged separately and the better one is kept (stage 5, the rule of `rankRows`).
 *   2 mix           the grid search of lesson 8.14 at the bank's price list, with the hard constraints of 8.7 (law, the
 *                   bank's lines, the client's limits): the feasible candidate with the lowest weighted score. Weights
 *                   [1,1,1] here, for illustration.
 *   3 price         what the bank's invented rules do to that mix: refuse (above a line) or approve with relief
 *                   (percentage points off every track) -- the predicted rates; first payment and total paid under
 *                   the base scenario of case A, from the engine.
 *   4 probability   lesson 8.19's model of the chance of approval from the payment ratio and the financing ratio (taken
 *                   as if calibrated, k = 1; in reality Mogi has no approvals data), and 0 where the bank refuses.
 *   5 ranking       banks the bank would approve with a chance at or above a threshold come first, by total paid; then
 *                   banks approved but below the threshold; then refusals (rankRows).
 *   6 explanation   why each bank sits where it does, as data (explain): the facts the page then writes in words.
 *   7 an offer      replaces a bank's estimate: its own price and a chance of 1 (an offer is an approval), and the
 *                   ranking is read again (withOffer).
 *
 * ── The API ────────────────────────────────────────────────────────────────
 *   POSITIONINGS                         [{id: "asked", ...}, {id: "parent", ...}]: level-1 choices of case-s8.ts
 *   RANK_THRESHOLD                       "0.55"
 *   approvalProbability(ratio, ltv, decision, params?)   six decimals; 0 when the bank refuses
 *   rankRows(rows, threshold)            rows {id, decision, total, p}; returns each row's group (1, 2, 3) and rank (1..; null for a refusal)
 *   runBank(bankId, positioningId)       stages 2-4 for one bank and one positioning (runs the search; about a second)
 *   explain(ranked)                      for each non-first row, why it is behind the first: "refused" | "below_threshold" | "dearer"
 *
 * Money is Decimal / money strings; percents are percent strings. The probability and the ranking are recomputed
 * independently in checks/kinds/pipeline.py; the search, the bank's rules and the engine through their own kinds (srch_*, bp_*, sens_mix).
 */
import Decimal from "decimal.js";
import { approvalProbability, RANK_THRESHOLD } from "./ranking.ts";

export { approvalProbability, CALIBRATED, explain, RANK_THRESHOLD, rankRows } from "./ranking.ts";
export type { RankInput, RankOutput, Why } from "./ranking.ts";
import { evaluate as evaluateConstraints } from "./constraints.ts";
import { evaluate as evaluateBank, type Verdict } from "./bankpolicy.ts";
import { measuresOf, scenarioFrom } from "./sensitivity.ts";
import { type GridSpec, type SearchCandidate, type SearchContext, searchGrid } from "./search.ts";
import type { Request } from "./constraints.ts";
import type { TrackSpec } from "./schedule.ts";
import { BASE_CHOICE, type BankId, type Choice, loanOfChoice, requestOf, S8_CASE, s8Bank } from "../../data/case-s8.ts";
import { SCENARIOS } from "../../data/case-a-mix.ts";

export const GRID = { kinds: ["fixed_unlinked", "prime", "variable_unlinked"] as const, stepPercent: 10, termsMonths: [300, 360], termMode: "shared" as const };
export const WEIGHTS = [1, 1, 1];

export interface Positioning {
  id: "asked" | "parent";
  nameHe: string;
  choice: Omit<Choice, "bank">;
}

export const POSITIONINGS: Positioning[] = [
  { id: "asked", nameHe: "כפי שביקשו", choice: { extraEquity: BASE_CHOICE.extraEquity, closeCar: BASE_CHOICE.closeCar, parent: false } },
  { id: "parent", nameHe: "הורה מצטרף ללווים", choice: { extraEquity: BASE_CHOICE.extraEquity, closeCar: BASE_CHOICE.closeCar, parent: true } },
];

export interface BankRun {
  bank: BankId;
  positioning: Positioning["id"];
  choice: Choice;
  /** The grid searched, and what it found. */
  size: number;
  feasible: number;
  bestId: string | null;
  /** The best mix at the bank's list rates (undefined when nothing is feasible). */
  listTracks?: TrackSpec[];
  verdict?: Verdict;
  /** What the bank would charge (list less relief), the estimate. */
  finalTracks?: TrackSpec[];
  first?: string;
  total?: string;
  p?: string;
}

/** The search's context for a request: the course's two scenarios, the weights, and the hard constraints of lesson 8.7 as the feasibility test. */
export function searchContextFor(request: Request): SearchContext {
  return {
    scenarios: { base: scenarioFrom(SCENARIOS.base), stress: scenarioFrom(SCENARIOS.stress) },
    weights: WEIGHTS,
    feasible: (c: SearchCandidate) => evaluateConstraints({ id: c.id, request, tracks: c.tracks }).reasons.map((r) => r.id),
  };
}

/** The grid of the lesson for a bank and a choice. */
export function gridFor(bank: BankId, choice: Choice): GridSpec {
  return { loan: loanOfChoice(choice).toString(), kinds: [...GRID.kinds], stepPercent: GRID.stepPercent, termsMonths: GRID.termsMonths, termMode: GRID.termMode, rates: s8Bank(bank).prices };
}

/** Stages 2-4 for one bank and one positioning. */
export function runBank(bank: BankId, positioning: Positioning["id"]): BankRun {
  const pos = POSITIONINGS.find((p) => p.id === positioning) as Positioning;
  const choice: Choice = { ...pos.choice, bank };
  const request = requestOf(choice);
  const ctx = searchContextFor(request);
  const scenarios = ctx.scenarios;
  const result = searchGrid(gridFor(bank, choice), ctx);
  const feasible = result.entries.filter((e) => e.status === "feasible").length;
  if (!result.best) return { bank, positioning, choice, size: result.size, feasible, bestId: null };
  const best = result.entries.find((e) => e.candidate.id === result.best?.id)?.candidate as SearchCandidate;
  const income = request.incomes.reduce<Decimal>((s, x) => s.plus(x), new Decimal(0));
  const verdict = evaluateBank(s8Bank(bank), { value: S8_CASE.price, income, obligations: request.obligations, tracks: best.tracks.map((t) => ({ kind: t.kind, amount: t.amount, months: t.months })) });
  const base = scenarios.base;
  const priced = verdict.decision === "approve" ? measuresOf(verdict.finalTracks, base) : null;
  return {
    bank,
    positioning,
    choice,
    size: result.size,
    feasible,
    bestId: best.id,
    listTracks: best.tracks,
    verdict,
    finalTracks: verdict.decision === "approve" ? verdict.finalTracks : undefined,
    first: priced?.first.toFixed(2),
    total: priced?.total.toFixed(2),
    p: approvalProbability(verdict.ratio.toFixed(2), verdict.ltv.toFixed(2), verdict.decision),
  };
}
