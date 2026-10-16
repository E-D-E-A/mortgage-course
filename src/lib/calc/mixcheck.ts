/**
 * A mix against the rules and against the yardsticks — the arithmetic behind
 * lessons 5.9 (is the mix good?) and 5.10 (is the mix realistic?), and the
 * mix-compliance checker of 5.10.
 *
 * Nothing here is a new formula. A mix is a list of tracks; this file only
 * adds them up the way the earlier lessons' modules ask, and hands the
 * results to those modules:
 *
 *   - the payment that goes into the ratio: affordability.ts's
 *     qualifyingPayment on each track (the first payment on the full amount),
 *     added (lesson 4.3), exact — never a sum of rounded payments;
 *   - the five lines: regulation.ts's checkRegulation (lesson 4.4);
 *   - the first payment, the highest payment under a path of rates, and the
 *     total paid: metrics.ts on the statement convention (lessons 3.8–3.9);
 *   - the effective rate of a contract rate: metrics.ts's effectiveAnnual.
 *
 * ── The API ──────────────────────────────────────────────────────────────
 *
 *   MixTrack {label, type, amount, ratePercent, months}   one track of a mix
 *   TrackType, canChange(type)     which types have a rate that can change
 *                                  during the loan (prime and the variable
 *                                  ones); a fixed-rate linked track does not:
 *                                  the index moves the balance, not the rate
 *   mixLoan(tracks)                the loan: the amounts added
 *   changingAmount(tracks)         the part at a rate that can change
 *   longestTerm(tracks)            the longest track's term, in months
 *   ratioPayment(tracks)           Σ the tracks' qualifying payments, exact
 *   checkMix(tracks, ctx)          the five lines for the whole mix
 *   stressTracks(tracks, rise)     the tracks as metrics.ts tracks, where each
 *                                  changing track's rate rises by `rise`
 *                                  points once, at its first reset (month 12
 *                                  for prime, month 60 for a variable track):
 *                                  a TEACHING SCENARIO, never a forecast
 *   mixMeasures(tracks, rise)      first payment, highest payment (and its
 *                                  month) and total paid, under that scenario
 *   contractEffective(nominal)     the effective annual rate of a nominal
 *                                  contract rate (÷ 12, then compounded)
 *   bestRatePerTrack(offers)       for several offers on the same tracks, the
 *                                  lowest rate each track has anywhere — the
 *                                  "mix" that no bank offered (lesson 5.10)
 *   argMin(values)                 the index of the smallest value
 *
 * Only unlinked tracks are priced by mixMeasures: a linked track needs an
 * index path, which is stage 5's forecast lessons' business. checkMix takes
 * any type (the five lines do not depend on linkage).
 *
 * Recomputed independently in checks/kinds/mixcheck.py.
 * Exports are stable: other lessons may import them. Add, don't rename.
 */
import Decimal from "decimal.js";
import { qualifyingPayment } from "./affordability.ts";
import { effectiveAnnual, firstPayment, highestPayment, mixPayments, totalPaid, type Track } from "./metrics.ts";
import { type DealType, type LineResult, checkRegulation, passesAllLimits } from "./regulation.ts";

export type Numeric = Decimal.Value;

export type TrackType = "fixed_unlinked" | "fixed_linked" | "prime" | "variable_unlinked" | "variable_linked";

export interface MixTrack {
  label: string;
  type: TrackType;
  /** Shekels. */
  amount: string;
  /** Nominal annual rate in percent, at the start. */
  ratePercent: string;
  months: number;
}

const CHANGES: Record<TrackType, boolean> = {
  fixed_unlinked: false,
  fixed_linked: false,
  prime: true,
  variable_unlinked: true,
  variable_linked: true,
};

/** Can the rate change during the loan? (Lesson 4.4: that is what counts toward the two-thirds line.) */
export function canChange(type: TrackType): boolean {
  const c = CHANGES[type];
  if (c === undefined) throw new RangeError(`unknown track type: ${type}`);
  return c;
}

/** The month of the first possible change in the teaching scenario: prime moves at any time (taken as month 12); a variable track at its first update (month 60). */
export const FIRST_RESET_MONTH: Record<"prime" | "variable", number> = { prime: 12, variable: 60 };

function nonEmpty(tracks: MixTrack[]): void {
  if (tracks.length === 0) throw new RangeError("a mix needs at least one track");
}

export function mixLoan(tracks: MixTrack[]): Decimal {
  nonEmpty(tracks);
  return tracks.reduce<Decimal>((s, t) => s.plus(t.amount), new Decimal(0));
}

export function changingAmount(tracks: MixTrack[]): Decimal {
  return tracks.filter((t) => canChange(t.type)).reduce<Decimal>((s, t) => s.plus(t.amount), new Decimal(0));
}

export function longestTerm(tracks: MixTrack[]): number {
  nonEmpty(tracks);
  return Math.max(...tracks.map((t) => t.months));
}

/** The payment the ratio uses for the whole mix: the tracks' qualifying payments added, exact. */
export function ratioPayment(tracks: MixTrack[]): Decimal {
  nonEmpty(tracks);
  return tracks.reduce<Decimal>((s, t) => s.plus(qualifyingPayment({ amount: t.amount, ratePercent: t.ratePercent, months: t.months })), new Decimal(0));
}

export interface MixContext {
  deal: DealType;
  /** The value the financing ratio is measured against. */
  value: Numeric;
  /** Recognised income after the obligations the 18-month rule takes off (lesson 4.2). */
  disposableIncome: Numeric;
  /** Payments on earlier loans that count with the new payment (the same-property rule, lesson 4.3). Default 0. */
  addedPayment?: Numeric;
}

export interface MixCheck {
  loan: Decimal;
  variable: Decimal;
  termMonths: number;
  /** The payment that went into the ratio. */
  payment: Decimal;
  lines: LineResult[];
  /** No ban crossed (the capital line may be). */
  withinBans: boolean;
}

/** All five lines of Directive 329 for a whole mix (lesson 4.4's checker, on the mix's own sums). */
export function checkMix(tracks: MixTrack[], ctx: MixContext): MixCheck {
  const loan = mixLoan(tracks);
  const variable = changingAmount(tracks);
  const termMonths = longestTerm(tracks);
  const payment = ratioPayment(tracks).plus(ctx.addedPayment ?? 0);
  const lines = checkRegulation({ deal: ctx.deal, value: ctx.value, loan, payment, disposableIncome: ctx.disposableIncome, variable, termMonths });
  return { loan, variable, termMonths, payment, lines, withinBans: passesAllLimits(lines) };
}

/** The mix as metrics.ts tracks, on the statement convention. `rise` (percentage points) is added once to every changing track, at its first reset. */
export function stressTracks(tracks: MixTrack[], risePercent: Numeric = 0): Track[] {
  nonEmpty(tracks);
  const rise = new Decimal(risePercent);
  return tracks.map((t) => {
    if (t.type === "fixed_linked" || t.type === "variable_linked") throw new RangeError("a linked track needs an index path; mixMeasures prices unlinked tracks only");
    const base = { principal: t.amount, months: t.months, rounding: "statement" as const };
    if (!canChange(t.type) || rise.isZero()) return { ...base, rates: [t.ratePercent] };
    const reset = t.type === "prime" ? FIRST_RESET_MONTH.prime : FIRST_RESET_MONTH.variable;
    return { ...base, rates: [t.ratePercent, new Decimal(t.ratePercent).plus(rise).toString()], blockMonths: reset };
  });
}

export interface MixMeasures {
  first: Decimal;
  highest: Decimal;
  highestMonth: number;
  total: Decimal;
}

export function mixMeasures(tracks: MixTrack[], risePercent: Numeric = 0): MixMeasures {
  const payments = mixPayments(stressTracks(tracks, risePercent));
  const high = highestPayment(payments);
  return { first: firstPayment(payments), highest: high.payment, highestMonth: high.month, total: totalPaid(payments) };
}

/** The effective annual rate, in percent, of a nominal contract rate: the monthly rate is the annual ÷ 12 (lesson 0.4), compounded twelve times. */
export function contractEffective(nominalPercent: Numeric): Decimal {
  return effectiveAnnual(new Decimal(nominalPercent).div(12));
}

/** One bank's rates on the same list of tracks, in the same order. */
export interface RateOffer {
  bank: string;
  rates: string[];
}

/** For each track, the lowest rate any offer has for it. The result is a list of rates no bank offered together. */
export function bestRatePerTrack(offers: RateOffer[]): string[] {
  if (offers.length === 0) throw new RangeError("at least one offer is needed");
  const n = offers[0].rates.length;
  if (offers.some((o) => o.rates.length !== n)) throw new RangeError("every offer must price the same tracks");
  return Array.from({ length: n }, (_, k) => offers.reduce((best, o) => (new Decimal(o.rates[k]).lt(best) ? o.rates[k] : best), offers[0].rates[k]));
}

/** The same tracks with other rates (an offer's, or the best of several). */
export function withRates(tracks: MixTrack[], rates: string[]): MixTrack[] {
  if (rates.length !== tracks.length) throw new RangeError("one rate per track");
  return tracks.map((t, k) => ({ ...t, ratePercent: rates[k] }));
}

/** The index of the smallest value (the first, on a tie). */
export function argMin(values: Numeric[]): number {
  if (values.length === 0) throw new RangeError("no values");
  let best = 0;
  for (let k = 1; k < values.length; k++) if (new Decimal(values[k]).lt(values[best])) best = k;
  return best;
}
