/**
 * Offers, the uniform baskets, and the three comparison measures — the
 * arithmetic behind lessons 5.1 (what a pre-approval shows), 5.2 (the uniform
 * baskets and the proposed basket) and 5.3 (expected total rate, total expected
 * payments, highest expected payment, and when comparing is allowed).
 * Lessons 5.4–5.10 import it.
 *
 * ── API (stable; add, don't rename) ─────────────────────────────────────────
 *
 *   UNIFORM_BASKETS                 the three baskets of Directive 451 appendix 5,
 *                                   as the team transcribed it (Brain 7733250,
 *                                   not checked against the directive): each
 *                                   part is an exact fraction {num, den} of the loan.
 *   splitBasket(loan, basket)       the loan cut by those fractions. EXACT: it
 *                                   throws when a part is not a whole number of
 *                                   agorot ("a third is exactly a third").
 *   canSplitExactly(loan, basket)   the same test, without throwing.
 *
 *   Forecast                        a teaching forecast: one anchor path per kind of
 *                                   variable track and a flat inflation rate. In the
 *                                   course these are ILLUSTRATIVE (lesson 5.4 shows
 *                                   how the Bank of Israel publishes the real ones);
 *                                   they are never the Bank of Israel's numbers.
 *   Offer, OfferTrack               an offer: tracks (kind, amount, months, and a
 *                                   contract rate for a fixed track or a margin for a
 *                                   variable one), the up-front charges A, the
 *                                   calculation month and the forecast it is
 *                                   measured on.
 *   basketOffer(args)               an offer made of a uniform basket at a bank's rates.
 *   offerTracks(offer, forecast)    the offer as metrics.ts tracks (statement rounding),
 *                                   forecast anchors + margins already added.
 *   impliedRate(track, forecast)    a variable track's rate on the day of issue (what the
 *                                   pre-approval marks as correct that day).
 *   measureOffer(offer, forecast)   the measures: loan, received (loan − A), first payment,
 *                                   highest expected payment (and its month), total
 *                                   expected payments, expected monthly IRR and the
 *                                   expected total rate (effective annual, in percent).
 *   basisDifferences(offers)        what keeps offers from being on the same basis:
 *                                   "amount", "mix" (kinds, shares, terms, resets),
 *                                   "month", "forecast". Empty = the same basis.
 *   scaleOffer(offer, loan)         the same mix (kinds, shares, terms, rates) for another
 *                                   loan amount; null when a track would not be a whole
 *                                   number of agorot.
 *   compareOffers(offers, forecasts) the measures of each offer, the basis differences,
 *                                   whether a price comparison is legitimate, and for
 *                                   each measure which offers are lowest.
 *   offerCode / forecastCode        the one-line text forms the facts carry and
 *                                   checks/kinds/offers.py parses.
 *
 * ── Conventions ─────────────────────────────────────────────────────────────
 *  - Rates are nominal annual percents as strings, a margin is in percentage
 *    points and may be negative, money is in shekels as a string.
 *  - The schedules, the payments, the total, the IRR and the conversion to a
 *    yearly rate are metrics.ts's (statement rounding, lessons 3.8–3.10): this
 *    file adds only how an offer becomes a list of tracks, the uniform baskets,
 *    and the comparison of offers. It never reimplements a measure.
 *  - The expected total rate is the actual cost of the credit of lesson 3.10:
 *    ((1 + IRR)^12 − 1) × 100, where the IRR is the monthly rate at which the
 *    value today of all the forecast payments equals the loan minus A (the
 *    charges collected on the day the loan is advanced). WHICH charges belong in
 *    A is an open legal question (Brain 7733250): A is an input here.
 *  - Prime's forecast is one anchor a year (PRIME_BLOCK_MONTHS), a variable track's
 *    one per reset (resetMonths, default 60 = DEC-3's five-year assumption); the
 *    last value carries on. A prime track's rate in a block is anchor + margin; a
 *    variable track's rate is its anchor + margin; a linked track's index rises by
 *    the forecast's inflation, at an even monthly pace (flat: a simplification).
 *  - A track with no forecast in the directive's table (foreign currency, "other")
 *    is not modelled; the course says so where it matters.
 *  - Same basis for a price comparison: the same loan amount, the same mix, the
 *    same calculation month and the same forecast. Everything else — the rates,
 *    the charges — is what the offers are being compared on.
 *
 * Recomputed independently in checks/kinds/offers.py (which imports only
 * Python's Decimal and the schedule builder of checks/kinds/metrics.py).
 */
import Decimal from "decimal.js";
import {
  annualByMultiplication,
  effectiveAnnual,
  firstPayment,
  highestPayment,
  irrMonthly,
  mixPayments,
  type Track,
  totalPaid,
} from "./metrics.ts";
import { moneyString } from "./money.ts";
import { DEFAULT_RESET_MONTHS, isFixedForTerm, isLinked, type TrackKind } from "./schedule.ts";

export type { TrackKind };
export { annualByMultiplication };

export type Numeric = Decimal.Value;

const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
const ZERO = new D(0);

/** The forecast of prime is one anchor for each year. */
export const PRIME_BLOCK_MONTHS = 12;

/** The track kinds the directive's reference table (as transcribed) gives a forecast for, in the order the table lists them. */
export const FORECAST_KINDS: readonly TrackKind[] = ["fixed_linked", "fixed_unlinked", "prime", "variable_linked", "variable_unlinked"];

export const KIND_HE: Record<TrackKind, string> = {
  fixed_unlinked: "קבועה לא צמודה",
  fixed_linked: "קבועה צמודה",
  prime: "משתנה פריים",
  variable_linked: "משתנה צמודה",
  variable_unlinked: "משתנה לא צמודה",
};

// ---------------------------------------------------------------- the uniform baskets

/** One part of a basket: an exact fraction of the loan. */
export interface BasketPart {
  kind: TrackKind;
  num: number;
  den: number;
}

export interface Basket {
  id: "uniform_1" | "uniform_2" | "uniform_3";
  he: string;
  parts: BasketPart[];
}

/**
 * Appendix 5, as the team transcribed it (Brain 7733250, read on 3 August 2026
 * from version 22 of the directive; not checked against the directive again).
 * Basket 2's variable linked part resets every five years on a government-bond
 * basis (DEFAULT_RESET_MONTHS). A fixed linked track is in none of the three.
 */
export const UNIFORM_BASKETS: readonly Basket[] = [
  { id: "uniform_1", he: "סל אחיד 1", parts: [{ kind: "fixed_unlinked", num: 1, den: 1 }] },
  {
    id: "uniform_2",
    he: "סל אחיד 2",
    parts: [
      { kind: "fixed_unlinked", num: 1, den: 3 },
      { kind: "prime", num: 1, den: 3 },
      { kind: "variable_linked", num: 1, den: 3 },
    ],
  },
  {
    id: "uniform_3",
    he: "סל אחיד 3",
    parts: [
      { kind: "fixed_unlinked", num: 1, den: 2 },
      { kind: "prime", num: 1, den: 2 },
    ],
  },
];

export const basketById = (id: Basket["id"]): Basket => {
  const b = UNIFORM_BASKETS.find((x) => x.id === id);
  if (!b) throw new RangeError(`no basket ${id}`);
  return b;
};

const agorotOf = (loan: Numeric): Decimal => {
  const a = new D(loan).mul(100);
  if (!a.isInteger() || a.lte(0)) throw new RangeError("the loan must be a positive whole number of agorot");
  return a;
};

/** Does the loan cut into whole agorot by this basket's fractions? */
export function canSplitExactly(loan: Numeric, basket: Basket): boolean {
  const a = agorotOf(loan);
  return basket.parts.every((p) => a.mul(p.num).mod(p.den).isZero());
}

/**
 * The loan cut by the basket's fractions, each part exact. Throws when a part
 * would not be a whole number of agorot: a third is exactly a third, so the
 * loan must divide. (The course's amounts do; the lessons say what happens
 * to an amount that does not: this function refuses it.)
 */
export function splitBasket(loan: Numeric, basket: Basket): { kind: TrackKind; amount: string }[] {
  if (!canSplitExactly(loan, basket)) throw new RangeError(`${loan} does not divide exactly by ${basket.he}`);
  const a = agorotOf(loan);
  return basket.parts.map((p) => ({ kind: p.kind, amount: moneyString(a.mul(p.num).div(p.den).div(100)) }));
}

// ---------------------------------------------------------------- forecast and offers

/**
 * A teaching forecast. Anchors are nominal annual percents (the variable
 * linked track's anchor is a real rate); each list holds one value per block
 * and the last carries on. ILLUSTRATIVE in the course.
 */
export interface Forecast {
  id: string;
  label: string;
  /** The calculation month, "YYYY-MM": the month the pre-approval is given (Appendix 4's rule). */
  month: string;
  /** Prime's anchor, one value per year. */
  prime: string[];
  /** A variable linked track's real anchor, one value per reset. */
  variableLinked: string[];
  /** A variable unlinked track's nominal anchor, one value per reset. */
  variableUnlinked: string[];
  /** The index's yearly rise, flat (percent). */
  inflation: string;
}

export interface OfferTrack {
  kind: TrackKind;
  /** The track's principal in shekels. */
  amount: string;
  months: number;
  /** A fixed track's contract rate, in percent. */
  rate?: string;
  /** A variable track's margin over its anchor, in percentage points (may be negative). */
  margin?: string;
  /** A variable track other than prime: months between resets. Default DEFAULT_RESET_MONTHS. */
  resetMonths?: number;
}

export interface Offer {
  name: string;
  /** The calculation month of the forecast the offer is measured on. */
  month: string;
  /** The id of the forecast. */
  forecast: string;
  /** A: the charges collected the day the loan is advanced, in shekels. */
  upfront: string;
  tracks: OfferTrack[];
}

export function offerLoan(offer: Offer): string {
  return moneyString(offer.tracks.reduce((s, t) => s.plus(t.amount), ZERO));
}

const need = (v: string | undefined, what: string, t: OfferTrack): string => {
  if (v === undefined) throw new RangeError(`a ${t.kind} track needs ${what}`);
  return v;
};

/** The resets of a track, in months: prime moves each year of the forecast, a variable track at its resets, a fixed track never. */
export function blockMonthsOf(t: OfferTrack): number | undefined {
  if (t.kind === "prime") return PRIME_BLOCK_MONTHS;
  if (isFixedForTerm(t.kind)) return undefined;
  return t.resetMonths ?? DEFAULT_RESET_MONTHS;
}

/** One offer track as a metrics.ts track, with the forecast's anchors added to the margin. */
export function trackOf(t: OfferTrack, f: Forecast): Track {
  const base = { principal: t.amount, months: t.months, rounding: "statement" as const };
  const inflationPercent = isLinked(t.kind) ? f.inflation : undefined;
  if (isFixedForTerm(t.kind)) return { ...base, rates: [need(t.rate, "a contract rate", t)], inflationPercent };
  const margin = need(t.margin, "a margin", t);
  const anchors = t.kind === "prime" ? f.prime : t.kind === "variable_linked" ? f.variableLinked : f.variableUnlinked;
  if (anchors.length === 0) throw new RangeError("a forecast needs at least one anchor for each kind of variable track");
  return { ...base, rates: anchors.map((a) => new D(a).plus(margin).toString()), blockMonths: blockMonthsOf(t), inflationPercent };
}

export function offerTracks(offer: Offer, f: Forecast): Track[] {
  if (offer.forecast !== f.id) throw new RangeError(`offer ${offer.name} is measured on forecast ${offer.forecast}, not ${f.id}`);
  if (offer.month !== f.month) throw new RangeError(`offer ${offer.name} is dated ${offer.month}, but forecast ${f.id} is for ${f.month}`);
  if (offer.tracks.length === 0) throw new RangeError("an offer needs at least one track");
  return offer.tracks.map((t) => trackOf(t, f));
}

/** A variable track's rate on the day of issue: the first block of its path. A fixed track's rate is its contract. */
export function impliedRate(t: OfferTrack, f: Forecast): string {
  return new D(trackOf(t, f).rates[0]).toString();
}

export interface OfferMeasures {
  loan: string;
  /** The loan minus A: what the borrower actually received. */
  received: string;
  first: string;
  highest: string;
  highestMonth: number;
  /** The sum of all the forecast payments. */
  total: string;
  /** The IRR a month, in percent, unrounded. */
  irrMonthly: Decimal;
  /** The expected total rate: the actual cost of credit, effective annual percent, unrounded. */
  expectedTotalRate: Decimal;
}

export function paymentPath(offer: Offer, f: Forecast): Decimal[] {
  return mixPayments(offerTracks(offer, f));
}

export function measureOffer(offer: Offer, f: Forecast): OfferMeasures {
  const pays = paymentPath(offer, f);
  const loan = new D(offerLoan(offer));
  const received = loan.minus(offer.upfront);
  const irr = irrMonthly(pays, received);
  const top = highestPayment(pays);
  return {
    loan: moneyString(loan),
    received: moneyString(received),
    first: moneyString(firstPayment(pays)),
    highest: moneyString(top.payment),
    highestMonth: top.month,
    total: moneyString(totalPaid(pays)),
    irrMonthly: irr,
    expectedTotalRate: effectiveAnnual(irr),
  };
}

/** An offer made of a uniform basket at a bank's rates: a fixed rate, and margins for prime and for the variable linked part. */
export interface BankRates {
  fixed: string;
  primeMargin: string;
  variableMargin: string;
}

export function basketOffer(args: { name: string; month: string; forecast: string; basket: Basket; loan: Numeric; months: number; rates: BankRates; upfront?: string }): Offer {
  const parts = splitBasket(args.loan, args.basket);
  return {
    name: args.name,
    month: args.month,
    forecast: args.forecast,
    upfront: args.upfront ?? "0.00",
    tracks: parts.map((p) => ({
      kind: p.kind,
      amount: p.amount,
      months: args.months,
      ...(p.kind === "fixed_unlinked" ? { rate: args.rates.fixed } : p.kind === "prime" ? { margin: args.rates.primeMargin } : { margin: args.rates.variableMargin }),
    })),
  };
}

/** The same mix for another loan: every track's amount in the same share of the new loan, or null when one would not be whole agorot. */
export function scaleOffer(offer: Offer, loan: Numeric): Offer | null {
  const old = agorotOf(offerLoan(offer));
  const target = agorotOf(loan);
  const tracks: OfferTrack[] = [];
  for (const t of offer.tracks) {
    const x = agorotOf(t.amount).mul(target);
    if (!x.mod(old).isZero()) return null;
    tracks.push({ ...t, amount: moneyString(x.div(old).div(100)) });
  }
  return { ...offer, tracks };
}

// ---------------------------------------------------------------- comparing

export type BasisDifference = "amount" | "mix" | "month" | "forecast";
export const BASIS_ORDER: readonly BasisDifference[] = ["amount", "mix", "month", "forecast"];

const gcd = (a: bigint, b: bigint): bigint => (b === 0n ? a : gcd(b, a % b));

/** The offer's mix: each track's kind, exact share of the loan, term and reset, sorted — so the same mix at two banks reads the same. */
export function mixSignature(offer: Offer): string {
  const loan = BigInt(agorotOf(offerLoan(offer)).toFixed(0));
  return offer.tracks
    .map((t) => {
      const a = BigInt(agorotOf(t.amount).toFixed(0));
      const g = gcd(a, loan);
      return `${t.kind}:${a / g}/${loan / g}:${t.months}:${blockMonthsOf(t) ?? 0}`;
    })
    .sort()
    .join(";");
}

/** What keeps these offers from being on the same basis (empty when they are). */
export function basisDifferences(offers: Offer[]): BasisDifference[] {
  if (offers.length < 2) return [];
  const same = (get: (o: Offer) => string) => offers.every((o) => get(o) === get(offers[0]));
  const checks: Record<BasisDifference, (o: Offer) => string> = {
    amount: (o) => offerLoan(o),
    mix: mixSignature,
    month: (o) => o.month,
    forecast: (o) => o.forecast,
  };
  return BASIS_ORDER.filter((k) => !same(checks[k]));
}

export type MeasureKey = "expectedTotalRate" | "total" | "highest";
export const MEASURE_KEYS: readonly MeasureKey[] = ["expectedTotalRate", "total", "highest"];

export interface Comparison {
  measures: OfferMeasures[];
  differences: BasisDifference[];
  /** True when the offers share the amount, the mix, the month and the forecast: only then is a ranking by price a comparison. */
  sameBasis: boolean;
  /** For each measure, the indexes of the lowest offers (a tie keeps all of them; ties are judged on the shown precision). */
  lowest: Record<MeasureKey, number[]>;
}

const valueOf = (m: OfferMeasures, k: MeasureKey): Decimal => (k === "expectedTotalRate" ? m.expectedTotalRate : new D(k === "total" ? m.total : m.highest));
/** The precision at which two measures count as equal: 0.005 of a percentage point, half an agora. */
const TIE: Record<MeasureKey, string> = { expectedTotalRate: "0.005", total: "0.005", highest: "0.005" };

export function compareOffers(offers: Offer[], forecasts: Forecast[]): Comparison {
  const byId = new Map(forecasts.map((f) => [f.id, f]));
  const measures = offers.map((o) => {
    const f = byId.get(o.forecast);
    if (!f) throw new RangeError(`no forecast ${o.forecast} for offer ${o.name}`);
    return measureOffer(o, f);
  });
  const differences = basisDifferences(offers);
  const lowest = Object.fromEntries(
    MEASURE_KEYS.map((k) => {
      const vals = measures.map((m) => valueOf(m, k));
      const min = vals.reduce((a, b) => (b.lt(a) ? b : a));
      return [k, vals.map((v, i) => (v.minus(min).abs().lte(TIE[k]) ? i : -1)).filter((i) => i >= 0)];
    }),
  ) as Record<MeasureKey, number[]>;
  return { measures, differences, sameBasis: differences.length === 0, lowest };
}

// ---------------------------------------------------------------- text forms (for facts and the Python check)

/** "kind:amount:months:rate-or-margin[:reset]" for each track, joined by ";". */
export function offerCode(o: Offer): string {
  return o.tracks.map((t) => [t.kind, t.amount, t.months, isFixedForTerm(t.kind) ? t.rate : t.margin, ...(t.resetMonths ? [t.resetMonths] : [])].join(":")).join(";");
}

/** "prime=a,b|vlinked=a,b|vunlinked=a,b|infl=x". */
export function forecastCode(f: Forecast): string {
  return `prime=${f.prime.join(",")}|vlinked=${f.variableLinked.join(",")}|vunlinked=${f.variableUnlinked.join(",")}|infl=${f.inflation}`;
}
