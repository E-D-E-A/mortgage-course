/**
 * The synthetic case of stage 8, defined ONCE (stage-8 author A). Every stage-8 lesson, component and check imports it;
 * nobody retypes these numbers. Authors B, C and D: add, don't rename.
 *
 * ── What it is ───────────────────────────────────────────────────────────
 *
 * Case A (נועם ושירה, src/data/case-a-*.ts): the same price, equity, incomes, car loan and savings, and the same four
 * FICTIONAL banks ("בנק א׳" … "בנק ד׳") with the price lists and the invented lines of stage 6 (case-a-positioning.ts). What this
 * file adds is the algorithm's view of the case:
 *
 *   - the client's own limits (a largest payment and a ratio they want to stay under): TEACHING ASSUMPTIONS;
 *   - the two LEVELS of decision variables of lesson 8.6 as a small space: level 1 (positioning the request: how much extra
 *     equity, whether to close the car loan, whether a parent joins, which bank) and level 2 (the mix: which kinds of track,
 *     what share of the loan in each, what term each);
 *   - `requestOf`, `mixOf`, `candidateOf`: build a constraints.ts Candidate from the choices, with the tracks priced at the
 *     asked bank's list prices (BANK_PRICES) — a TEACHING SIMPLIFICATION (in the market a bank prices the whole case, so a
 *     change in the mix can change the rates: FK-H-057, awaiting Eylon; lesson 8.17 teaches that shape);
 *   - `CANDIDATES`: a curated list of candidates (lesson 8.7), each failing a different set of reasons;
 *   - `SAMPLE_OFFER`: a made-up bank offer for the workshop's check (lesson 8.28): the tracks and rates one fictional bank
 *     "gave" for one candidate. Its payments are NOT typed here: the engine (B) or schedule.ts computes them.
 *
 * ── The label ────────────────────────────────────────────────────────────
 *
 * EVERYTHING HERE IS INVENTED, to illustrate: S8_LABEL. The stage-8 triple (what is "Mogi היום", "הוחלט", "עתיד") is
 * STAGE8_LABELS; every weight, threshold, margin, step and model number of the stage is `להדגמה` — not a Mogi decision and not
 * a bank's policy. The data is SYNTHETIC.
 *
 * ── The API ──────────────────────────────────────────────────────────────
 *
 *   S8_LABEL, STAGE8_LABELS, ILLUSTRATION        the strings every lesson shows
 *   S8_CASE                                      the case: deal, price, base equity, savings kept, incomes, the car loan,
 *                                                the client's limits
 *   S8_BANKS, s8Bank(id)                         the four banks' policies (bankpolicy.ts BankPolicy) with their list prices
 *   BankId                                       "a" | "b" | "c" | "d"
 *   Choice                                       level 1: {extraEquity, closeCar, parent, bank}
 *   LEVEL1                                       the options of each level-1 variable
 *   ShapePart                                    level 2, one track: {kind, share (percent of the loan), years}
 *   LEVEL2                                       the options of each level-2 variable: kinds, share step, terms
 *   requestOf(choice)                            constraints.ts Request
 *   loanOfChoice(choice)                         the loan the choice leaves: price − equity
 *   mixOf(choice, shape)                         TrackSpec[] priced at the asked bank's list
 *   candidateOf(id, choice, shape)               constraints.ts Candidate
 *   CANDIDATES, CANDIDATE_NAMES, candidateById(id), entryOf(id)   the curated list (12 candidates; c07 and c11 are feasible), their Hebrew names
 *   BASE_CHOICE                                  the family's own request: no extra equity, car loan kept, no parent, bank א׳
 *   SAMPLE_OFFER, sampleOfferTracks()            the made-up offer of the workshop (candidate c05 shape at bank ב׳, own rates)
 *
 * Money is a string of shekels, a share is a whole percent, a rate is a percent string.
 */
import Decimal from "decimal.js";
import type { Obligation } from "../lib/calc/affordability.ts";
import type { BankPolicy } from "../lib/calc/bankpolicy.ts";
import type { Candidate, Request } from "../lib/calc/constraints.ts";
import type { TrackKind, TrackSpec } from "../lib/calc/schedule.ts";
import { BANK_IDS, type BankId, EXAMPLE_LABEL } from "./case-a-offers.ts";
import { BANKS } from "./case-a-positioning.ts";
import { BORROWER_INCOME, CAR_PAYOFF, RESERVE } from "./case-a-levers.ts";
import { CASE_A, KIND_NAME_HE } from "./case-a-mix.ts";

export type { BankId };
export { BANK_IDS, KIND_NAME_HE };

// ── Labels ─────────────────────────────────────────────────────────────────

/** The mark every stage-8 example carries (case A's mark, plus the word "synthetic"). */
export const S8_LABEL = `${EXAMPLE_LABEL}. נתונים סינתטיים.`;

/** What a number in this stage is: not a Mogi decision and not a bank's policy. */
export const ILLUSTRATION = "להדגמה: לא החלטה של Mogi ולא מדיניות של בנק";

/** The three kinds of statement in stage 8 (course map: the rule for the whole stage). */
export const STAGE8_LABELS = {
  today: "Mogi היום",
  decided: "הוחלט",
  future: "עתיד",
} as const;

/** The four layer modes that were decided (their names; what each does in practice is plan). */
export const LAYER_MODES = ["כבוי", "צל", "מסייע", "אוטומטי"] as const;

// ── The case ───────────────────────────────────────────────────────────────

export const S8_CASE = {
  name: "נועם ושירה",
  deal: CASE_A.deal,
  /** The property's value, shekels. */
  price: CASE_A.price,
  /** The equity case A puts in, shekels. */
  baseEquity: CASE_A.equity,
  /** Savings kept outside the equity (the cushion); extra equity and closing the car loan both come from it. */
  savings: RESERVE,
  /** The recognised net monthly incomes. */
  incomes: CASE_A.netIncomes,
  car: CASE_A.car as Obligation,
  carPayoff: CAR_PAYOFF,
  /** A parent's net monthly income, if the parent joins as a borrower (lesson 6.4's teaching assumption). */
  parentIncome: BORROWER_INCOME,
  /** The client's limits — TEACHING ASSUMPTIONS for stage 8: the largest first payment and the ratio they want to stay under. */
  maxPayment: "8300",
  targetRatio: "40",
} as const;

// ── The banks ──────────────────────────────────────────────────────────────

export const S8_BANKS: BankPolicy[] = BANKS;

export function s8Bank(id: BankId): BankPolicy {
  const b = S8_BANKS.find((x) => x.id === id);
  if (!b) throw new Error(`no bank "${id}"`);
  return b;
}

// ── The two levels of decision variables ───────────────────────────────────

/** Level 1: positioning the request (lesson 8.6). */
export interface Choice {
  /** Extra equity from the savings, shekels. */
  extraEquity: string;
  /** Close the car loan first, paying its payoff from the savings. */
  closeCar: boolean;
  /** A parent joins as a borrower: their income counts. */
  parent: boolean;
  bank: BankId;
}

export const LEVEL1 = {
  extraEquity: ["0", "10000", "20000", "30000", "40000"],
  closeCar: [false, true],
  parent: [false, true],
  bank: BANK_IDS,
} as const;

/** One track of level 2: the kind, its share of the loan (whole percent) and its term in years. */
export interface ShapePart {
  kind: TrackKind;
  share: number;
  years: number;
}

export const LEVEL2 = {
  kinds: ["fixed_unlinked", "prime", "variable_unlinked"] as TrackKind[],
  /** The step the shares move in, percent of the loan. */
  shareStep: 10,
  /** The terms a track may have, years (every track has its own: DEC-2). */
  years: [20, 25, 30],
} as const;

export const BASE_CHOICE: Choice = { extraEquity: "0", closeCar: false, parent: false, bank: "a" };

/** The loan a choice leaves: price − base equity − extra equity. */
export function loanOfChoice(choice: Choice): Decimal {
  return new Decimal(S8_CASE.price).minus(S8_CASE.baseEquity).minus(choice.extraEquity);
}

/** What the family can still put in as equity: its savings, minus what closing the car loan takes. Never below zero. */
function equityAvailable(choice: Choice): Decimal {
  const free = new Decimal(S8_CASE.savings).minus(choice.closeCar ? S8_CASE.carPayoff : 0);
  return new Decimal(S8_CASE.baseEquity).plus(Decimal.max(free, 0));
}

/** The request a level-1 choice makes: the equity, the borrowers' incomes, the obligations still open, the client's limits and the bank. */
export function requestOf(choice: Choice): Request {
  return {
    deal: S8_CASE.deal,
    price: S8_CASE.price,
    equity: new Decimal(S8_CASE.baseEquity).plus(choice.extraEquity).toString(),
    equityAvailable: equityAvailable(choice).toString(),
    incomes: choice.parent ? [...S8_CASE.incomes, S8_CASE.parentIncome] : [...S8_CASE.incomes],
    obligations: choice.closeCar ? [] : [S8_CASE.car],
    maxPayment: S8_CASE.maxPayment,
    targetRatio: S8_CASE.targetRatio,
    bank: s8Bank(choice.bank),
  };
}

/** Level 2 on top of level 1: each part's share of the loan, priced at the asked bank's list. Shares must add to 100. */
export function mixOf(choice: Choice, shape: ShapePart[]): TrackSpec[] {
  const total = shape.reduce((s, p) => s + p.share, 0);
  if (total !== 100) throw new RangeError(`the shares add up to ${total}, not 100`);
  const loan = loanOfChoice(choice);
  const bank = s8Bank(choice.bank);
  return shape.map((p) => ({ kind: p.kind, amount: loan.mul(p.share).div(100).toFixed(2), rate: bank.prices[p.kind], months: p.years * 12 }));
}

export function candidateOf(id: string, choice: Choice, shape: ShapePart[]): Candidate {
  return { id, request: requestOf(choice), tracks: mixOf(choice, shape) };
}

// ── Curated candidates (lesson 8.7) ────────────────────────────────────────

const part = (kind: TrackKind, share: number, years = 30): ShapePart => ({ kind, share, years });

interface Entry {
  id: string;
  /** A short Hebrew name for tables. */
  name: string;
  choice: Choice;
  shape: ShapePart[];
}

const FIXED = "fixed_unlinked" as const;
const PRIME = "prime" as const;
const VAR = "variable_unlinked" as const;

/**
 * Twelve candidates for the filter of lesson 8.7. They are chosen so that every family of constraints rejects at least one,
 * some candidates fail several reasons at once, and exactly two are feasible (c07, c11) — see candidates.test (case-s8.test.ts).
 * Which fails what is NOT typed anywhere: constraints.ts computes it.
 */
const ENTRIES: Entry[] = [
  { id: "c01", name: "שליש־שליש, כמו שביקשו", choice: BASE_CHOICE, shape: [part(PRIME, 33), part(VAR, 33), part(FIXED, 34)] },
  { id: "c02", name: "הרבה משתנה", choice: BASE_CHOICE, shape: [part(PRIME, 40), part(VAR, 30), part(FIXED, 30)] },
  { id: "c03", name: "קבועה בלבד ל־20 שנה", choice: BASE_CHOICE, shape: [part(FIXED, 100, 20)] },
  { id: "c04", name: "קבועה בלבד ל־25 שנה", choice: BASE_CHOICE, shape: [part(FIXED, 100, 25)] },
  { id: "c05", name: "חצי קבועה, חצי פריים", choice: BASE_CHOICE, shape: [part(FIXED, 50), part(PRIME, 50)] },
  { id: "c06", name: "קבועה ופריים, ופריים קצר", choice: BASE_CHOICE, shape: [part(FIXED, 60), part(PRIME, 40, 20)] },
  { id: "c07", name: "60% קבועה, עם הון עצמי נוסף", choice: { ...BASE_CHOICE, extraEquity: "20000" }, shape: [part(FIXED, 60), part(PRIME, 20), part(VAR, 20)] },
  { id: "c08", name: "אחרי סגירת הרכב, מנוצל כל החיסכון", choice: { ...BASE_CHOICE, closeCar: true, extraEquity: "40000" }, shape: [part(FIXED, 50), part(PRIME, 30), part(VAR, 20)] },
  { id: "c09", name: "הורה כלווה נוסף", choice: { ...BASE_CHOICE, parent: true }, shape: [part(FIXED, 30), part(PRIME, 40), part(VAR, 30)] },
  { id: "c10", name: "בבנק ד׳", choice: { ...BASE_CHOICE, bank: "d" }, shape: [part(FIXED, 40), part(PRIME, 30), part(VAR, 30)] },
  { id: "c11", name: "40,000 ₪ הון עצמי נוסף", choice: { ...BASE_CHOICE, extraEquity: "40000" }, shape: [part(FIXED, 40), part(PRIME, 30), part(VAR, 30)] },
  { id: "c12", name: "40% קבועה, 40% פריים", choice: BASE_CHOICE, shape: [part(FIXED, 40), part(PRIME, 40), part(VAR, 20)] },
];

export const CANDIDATE_NAMES: Record<string, string> = Object.fromEntries(ENTRIES.map((e) => [e.id, e.name]));

export const CANDIDATES: Candidate[] = ENTRIES.map((e) => candidateOf(e.id, e.choice, e.shape));

export function candidateById(id: string): Candidate {
  const c = CANDIDATES.find((x) => x.id === id);
  if (!c) throw new Error(`no candidate "${id}"`);
  return c;
}

/** The entries' choices and shapes, for lessons that rebuild a candidate with one change. */
export function entryOf(id: string): { choice: Choice; shape: ShapePart[] } {
  const e = ENTRIES.find((x) => x.id === id);
  if (!e) throw new Error(`no candidate "${id}"`);
  return { choice: e.choice, shape: e.shape };
}

// ── The made-up offer for the workshop ─────────────────────────────────────

/**
 * What one fictional bank "gave" for one candidate: the tracks of candidate c05, at rates a few hundredths of a point
 * away from its list (an invented offer: nothing says a real bank does this). Used by lesson 8.28 to check the engine
 * against an offer; the offer's payments are computed from these tracks by schedule.ts / the engine, never typed.
 */
export const SAMPLE_OFFER = {
  bank: "b" as BankId,
  /** The candidate whose request the offer answers (the same choice and shape, at bank ב׳). */
  base: "c05",
  /** Rate (percent a year) per kind of track, as the bank wrote them in its offer. */
  rates: { fixed_unlinked: "4.35", prime: "4.65" } as Partial<Record<TrackKind, string>>,
};

/** The offer's tracks: candidate c05's shape at bank ב׳, with the offer's own rates. */
export function sampleOfferTracks(): TrackSpec[] {
  const { choice, shape } = entryOf(SAMPLE_OFFER.base);
  const at = { ...choice, bank: SAMPLE_OFFER.bank };
  return mixOf(at, shape).map((t) => ({ ...t, rate: SAMPLE_OFFER.rates[t.kind] ?? t.rate }));
}

// ── Counting the small space (lesson 8.6) ──────────────────────────────────

/** n choose k, exact (small n). */
function choose(n: number, k: number): number {
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}

/**
 * How many mixes level 2 allows: tracks of `kinds.length` kinds, shares in steps of `step` percent that add to 100 (a kind
 * may be left out), and each track used has one of `terms` terms. For each number k of kinds used: pick which kinds
 * (n choose k), split 100/step units among them each at least one (C(units − 1, k − 1)), choose a term for each (terms^k).
 */
export function countShapes(kinds: number, step: number, terms: number): number {
  const units = 100 / step;
  let total = 0;
  for (let k = 1; k <= Math.min(kinds, units); k++) total += choose(kinds, k) * choose(units - 1, k - 1) * terms ** k;
  return total;
}

/** The size of level 1: the product of the options of its variables. */
export function countChoices(): number {
  return LEVEL1.extraEquity.length * LEVEL1.closeCar.length * LEVEL1.parent.length * LEVEL1.bank.length;
}
