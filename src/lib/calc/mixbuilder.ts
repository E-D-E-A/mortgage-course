/**
 * What MixBuilder.vue adds in stage 5 (lessons 5.7 and 5.8) that is arithmetic — a thin layer, no new
 * formula. Each function hands the work to the module that owns it:
 *
 *   rescaleToLoan(amounts, loan)   the tracks' amounts after the loan moves: every track in
 *                                  proportion, the last one takes the rest (mix.ts's splitByWeights,
 *                                  the same split as sensitivity.ts's "amount" lever)
 *   checkBuilderMix(tracks, ctx)   the mix against the payment-to-income ratio and the five lines of
 *                                  Directive 329: the payment is the tracks' qualifying payments added
 *                                  (sensitivity.ts qualifyingTotal) plus the same-property payments of
 *                                  `obligations` (affordability.ts ratioPayment); the lines are
 *                                  regulation.ts's checkRegulation — the way mixcheck.ts does it for 5.10
 *   summaryDelta(a, b)             first payment, highest payment and total paid of mix a minus mix b
 *
 * Recomputed independently: the amounts split by checks/kinds/mix.py, the ratio and the lines by
 * checks/kinds/affordability.py and regulation.py (through the lessons' facts); summaryDelta is a plain
 * subtraction of two schedule.ts figures. Exports are stable: add, don't rename.
 */
import Decimal from "decimal.js";
import { type Obligation, paymentToIncome, ratioPayment } from "./affordability.ts";
import { splitByWeights } from "./mix.ts";
import { type DealType, type LineResult, checkRegulation, passesAllLimits } from "./regulation.ts";
import type { MixSummary, TrackSpec } from "./schedule.ts";
import { loanOf, qualifyingTotal, variableAmount } from "./sensitivity.ts";

export type Numeric = Decimal.Value;

/**
 * The amounts after the loan becomes `loan`: every track in proportion, exact to the agora; the last
 * track with an amount takes the rest. A track at zero stays at zero; if every track is at zero the
 * whole loan goes to the last track.
 */
export function rescaleToLoan(amounts: Numeric[], loan: Numeric): Decimal[] {
  if (new Decimal(loan).lte(0)) throw new RangeError("the loan must be above zero");
  const out = amounts.map(() => new Decimal(0));
  const live = amounts.map((a, i) => (new Decimal(a).gt(0) ? i : -1)).filter((i) => i >= 0);
  if (live.length === 0) {
    out[out.length - 1] = new Decimal(loan);
    return out;
  }
  splitByWeights(loan, live.map((i) => amounts[i])).forEach((x, k) => (out[live[k]] = x));
  return out;
}

export interface BuilderContext {
  deal: DealType;
  /** The value the financing ratio is measured against (the price). Without it only the payment-to-income ratio is computed and `lines` is empty. */
  value?: Numeric;
  /** Recognised income after the obligations the 18-month rule takes off (lesson 4.2). */
  disposableIncome: Numeric;
  /** Obligations whose payment counts with the new payment (the same-property rule, lesson 4.3). */
  obligations?: Obligation[];
}

export interface BuilderCheck {
  loan: Decimal;
  /** The payment that went into the ratio. */
  payment: Decimal;
  /** Payment ÷ disposable income, percent, exact. */
  ratio: Decimal;
  lines: LineResult[];
  /** No ban crossed (the capital line may be); null when there were no lines to check. */
  withinBans: boolean | null;
}

export function checkBuilderMix(tracks: TrackSpec[], ctx: BuilderContext): BuilderCheck {
  const loan = loanOf(tracks);
  const payment = ratioPayment(qualifyingTotal(tracks), ctx.obligations ?? []);
  const ratio = paymentToIncome(payment, ctx.disposableIncome);
  if (ctx.value === undefined) return { loan, payment, ratio, lines: [], withinBans: null };
  const lines = checkRegulation({
    deal: ctx.deal,
    value: ctx.value,
    loan,
    payment,
    disposableIncome: ctx.disposableIncome,
    variable: variableAmount(tracks),
    termMonths: Math.max(...tracks.map((t) => t.months)),
  });
  return { loan, payment, ratio, lines, withinBans: passesAllLimits(lines) };
}

export interface SummaryDelta {
  first: Decimal;
  max: Decimal;
  total: Decimal;
}

/** The headline figures of mix `a` minus those of mix `b` (negative: `a` is lower). */
export function summaryDelta(a: Pick<MixSummary, "firstPayment" | "maxPayment" | "totalPaid">, b: Pick<MixSummary, "firstPayment" | "maxPayment" | "totalPaid">): SummaryDelta {
  return { first: a.firstPayment.minus(b.firstPayment), max: a.maxPayment.minus(b.maxPayment), total: a.totalPaid.minus(b.totalPaid) };
}
