/**
 * The small engine of workshop 8.28 (stage 8, author D): positioning → cash flow → search → hard-constraint filter →
 * efficient front → choice → explanation, on the stage's synthetic case (src/data/case-s8.ts), end to end, in ONE call.
 * It composes the stage's modules and adds nothing of its own to the maths: every number comes from engine.ts (cash flow),
 * constraints.ts (the reasons a candidate is out), objectives.ts (the weighted score), frontier.ts (the efficient set) and
 * search.ts (the count of the space). The spreadsheet and the Python notebook of the workshop do the same, in their own
 * languages, from the same case (scripts/build-engine-workshop.py); the independent check is checks/kinds/ws8.py through
 * checks/ws8_engine.py, which is also the notebook's code.
 *
 * LABEL: nothing here exists in Mogi's code ("Mogi היום": no mix calculation, the engine call is frozen). Weights, the
 * step of the grid, the term, the stress and the bank's price list are all להדגמה. Data is SYNTHETIC; the banks are fictional.
 *
 * ── What the workshop's search is ─────────────────────────────────────────
 * A grid of mixes of THREE kinds of track (fixed unlinked, prime, variable unlinked) at the asked bank's list prices, every
 * share a multiple of WS_STEP percent, every track WS_YEARS years. With a 10-point step that is compositions(10, 3) = 66
 * candidates (search.ts). The grid is a deliberate shrinking of the space of lesson 8.13: one term, three kinds, a coarse step.
 *
 * ── The API ───────────────────────────────────────────────────────────────
 *   WS_STEP, WS_YEARS, WS_WEIGHTS, WS_SCENARIOS    the workshop's own choices (להדגמה)
 *   gridShapes(step)                               every [fixed, prime, variable] share triple, in a fixed order
 *   runWorkshop(choice?, weights?)                 → WorkshopResult: one Row per candidate (shares, tracks, measures, reasons,
 *                                                  feasible, efficient, score, rank), the count of the space, counts of
 *                                                  feasible / efficient, the rejection counts by constraint, the winner
 *   explainWinner(result)                          the numbers an explanation needs (never the words): the winner's three
 *                                                  measures, the runner-up's, and the differences
 *   checkAgainstOffer(choice?, shape?)             the estimate (bank's list price) against the sample offer of case-s8.ts for
 *                                                  the same mix: payment and total of each, and the differences
 */
import Decimal from "decimal.js";
import { BASE_CHOICE, type Choice, candidateOf, entryOf, loanOfChoice, requestOf, S8_BANKS, S8_CASE, SAMPLE_OFFER, type ShapePart, s8Bank } from "../../data/case-s8.ts";
import { GOAL_CONTEXT } from "../../data/case-a-mix.ts";
import { type Constraint, type ConstraintId, CONSTRAINTS, evaluate as evaluateConstraints } from "./constraints.ts";
import { disposableIncome } from "./affordability.ts";
import { type Assessment, assess } from "./engine.ts";
import { frontIds } from "./frontier.ts";
import { objectiveValues, scoreRows } from "./objectives.ts";
import { compositions } from "./search.ts";
import type { TrackKind, TrackSpec } from "./schedule.ts";

export const WS_STEP = 10;
export const WS_YEARS = 30;
/** Weights of the first payment, the total and the exposure: a client who cares most about the first payment. להדגמה. */
export const WS_WEIGHTS = [40, 30, 30];
export const WS_SCENARIOS = GOAL_CONTEXT;
export const WS_KINDS: TrackKind[] = ["fixed_unlinked", "prime", "variable_unlinked"];

/** Every [fixed, prime, variable] share triple in WS_STEP points, the fixed share changing slowest. */
export function gridShapes(step = WS_STEP): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (let f = 0; f <= 100; f += step) for (let p = 0; p <= 100 - f; p += step) out.push([f, p, 100 - f - p]);
  return out;
}

export interface Row {
  id: string;
  shares: [number, number, number];
  tracks: TrackSpec[];
  assessment: Assessment;
  /** first payment, total paid, exposure — all smaller is better. */
  values: Decimal[];
  reasons: ConstraintId[];
  feasible: boolean;
  efficient: boolean;
  score: Decimal;
  rank: number | null;
}

export interface WorkshopResult {
  choice: Choice;
  weights: number[];
  loan: Decimal;
  /** Loan ÷ price × 100, exact. */
  ltv: Decimal;
  /** Recognised income minus the obligations the 18-month rule counts. */
  disposable: Decimal;
  spaceSize: bigint;
  rows: Row[];
  feasibleCount: number;
  efficientIds: string[];
  rejectionCounts: Record<ConstraintId, number>;
  winner: Row | undefined;
}

const idOf = (s: [number, number, number]) => `g${s[0]}-${s[1]}-${s[2]}`;
const shapeOf = (s: [number, number, number]): ShapePart[] =>
  WS_KINDS.map((kind, i) => ({ kind, share: s[i], years: WS_YEARS })).filter((p) => p.share > 0);

export function runWorkshop(choice: Choice = BASE_CHOICE, weights: number[] = WS_WEIGHTS): WorkshopResult {
  const shapes = gridShapes();
  const draft = shapes.map((s) => {
    const candidate = candidateOf(idOf(s), choice, shapeOf(s));
    const ev = evaluateConstraints(candidate);
    const assessment = assess(candidate.tracks, WS_SCENARIOS);
    return { s, candidate, ev, assessment };
  });
  const scoreInput = draft.map((d) => ({ id: idOf(d.s), values: objectiveValues(d.assessment), feasible: d.ev.feasible }));
  const scored = scoreRows(scoreInput, weights);
  const front = new Set(frontIds(scoreInput));
  const counts = Object.fromEntries(CONSTRAINTS.map((c: Constraint) => [c.id, 0])) as Record<ConstraintId, number>;
  const rows: Row[] = draft.map((d, i) => {
    const reasons = d.ev.reasons.map((r) => r.id);
    for (const r of reasons) counts[r]++;
    return {
      id: idOf(d.s),
      shares: d.s,
      tracks: d.candidate.tracks,
      assessment: d.assessment,
      values: objectiveValues(d.assessment),
      reasons,
      feasible: d.ev.feasible,
      efficient: front.has(idOf(d.s)),
      score: scored[i].score,
      rank: scored[i].rank,
    };
  });
  return {
    choice,
    weights,
    loan: loanOfChoice(choice),
    ltv: loanOfChoice(choice).div(S8_CASE.price).mul(100),
    disposable: disposableIncome(requestOf(choice).incomes.reduce((a, x) => a.plus(x), new Decimal(0)), requestOf(choice).obligations),
    spaceSize: compositions(100 / WS_STEP, 3),
    rows,
    feasibleCount: rows.filter((r) => r.feasible).length,
    efficientIds: rows.filter((r) => r.efficient).map((r) => r.id),
    rejectionCounts: counts,
    winner: rows.find((r) => r.rank === 1),
  };
}

export interface Explanation {
  winner: Row;
  runnerUp: Row | undefined;
  /** runner-up − winner, per objective (first, total, exposure). */
  gaps: Decimal[] | undefined;
}

export function explainWinner(r: WorkshopResult): Explanation | undefined {
  if (!r.winner) return undefined;
  const runnerUp = r.rows.find((x) => x.rank === 2);
  return { winner: r.winner, runnerUp, gaps: runnerUp ? runnerUp.values.map((v, i) => v.minus((r.winner as Row).values[i])) : undefined };
}

export interface OfferCheck {
  /** The estimate: the mix at the bank's list prices. */
  estimate: Assessment;
  /** The offer: the same mix at the rates the sample offer wrote. */
  offer: Assessment;
  firstGap: Decimal;
  totalGap: Decimal;
  estimateTracks: TrackSpec[];
  offerTracks: TrackSpec[];
}

/** The sample offer of case-s8.ts: one bank, one mix of the grid, a few hundredths of a point away from its list. */
export function checkAgainstOffer(): OfferCheck {
  const base = entryOf(SAMPLE_OFFER.base);
  const choice: Choice = { ...base.choice, bank: SAMPLE_OFFER.bank };
  const estimateTracks = candidateOf("est", choice, base.shape).tracks;
  const offerTracks = estimateTracks.map((t) => ({ ...t, rate: SAMPLE_OFFER.rates[t.kind] ?? t.rate }));
  const estimate = assess(estimateTracks, WS_SCENARIOS);
  const offer = assess(offerTracks, WS_SCENARIOS);
  return { estimate, offer, firstGap: offer.base.first.minus(estimate.base.first), totalGap: offer.base.total.minus(estimate.base.total), estimateTracks, offerTracks };
}

export { requestOf, s8Bank, S8_BANKS };

// ── The case, as plain data for the spreadsheet, the notebook and the independent check ──────────────────────────────
import { SCENARIOS } from "../../data/case-a-mix.ts";
import { LTV_CEILINGS, MAX_TERM_MONTHS, PTI_LIMIT, VARIABLE_SHARE } from "./regulation.ts";

/**
 * The case as one object of strings and whole numbers: every number the three implementations (this module, the sheet,
 * the notebook) start from, read from case-s8.ts and case-a-mix.ts. Nothing is typed here.
 */
export function workshopCase() {
  const base = entryOf(SAMPLE_OFFER.base);
  return {
    price: S8_CASE.price,
    base_equity: S8_CASE.baseEquity,
    savings: S8_CASE.savings,
    car_payoff: S8_CASE.carPayoff,
    incomes: [...S8_CASE.incomes],
    parent_income: S8_CASE.parentIncome,
    car_monthly: String(S8_CASE.car.monthly),
    rules: {
      ltv_ceiling: LTV_CEILINGS[S8_CASE.deal],
      pti_limit: PTI_LIMIT,
      variable_numerator: VARIABLE_SHARE.numerator,
      variable_denominator: VARIABLE_SHARE.denominator,
      max_term_months: MAX_TERM_MONTHS,
      years: WS_YEARS,
      step: WS_STEP,
      reset_months: 60,
    },
    car_months_left: S8_CASE.car.monthsLeft as number,
    max_payment: S8_CASE.maxPayment,
    target_ratio: S8_CASE.targetRatio,
    banks: Object.fromEntries(
      S8_BANKS.map((b) => [b.id, { name: b.name, prices: Object.fromEntries(WS_KINDS.map((k) => [k, b.prices[k]])), ratio_max: b.ratioMax, ltv_max: b.ltvMax }]),
    ),
    scenarios: {
      base: { prime_shift: SCENARIOS.base.primeShift, anchor_shift: SCENARIOS.base.anchorShift },
      stress: { prime_shift: SCENARIOS.stress.primeShift, anchor_shift: SCENARIOS.stress.anchorShift },
    },
    offer: {
      bank: SAMPLE_OFFER.bank,
      shares: WS_KINDS.map((k) => base.shape.find((p) => p.kind === k)?.share ?? 0),
      rates: Object.fromEntries(WS_KINDS.filter((k) => SAMPLE_OFFER.rates[k] !== undefined).map((k) => [k, SAMPLE_OFFER.rates[k]])),
    },
  };
}
