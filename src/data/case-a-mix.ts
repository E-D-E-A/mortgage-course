/**
 * Case A (נועם ושירה) in stage 5: the mix, defined once. Lessons 5.6–5.10, stage 6 and the
 * builder's defaults import it; nobody retypes these numbers.
 *
 * Everything here is a TEACHING ASSUMPTION, not market data and not a bank's offer
 * ("דוגמה לימודית — נתוני הלקוח והריביות להמחשה בלבד; אינם הצעת בנק או נתוני שוק עדכניים").
 * Case A has no bank offer until stage 6.
 *
 * The case (course map, section 8; scripts/case_sketch.py): price 2,200,000; equity 560,000;
 * loan 1,640,000 (financing ratio 74.55%); net incomes 12,400 + 9,300; a car loan of 1,450 a
 * month with 26 months left, which counts under the 18-month rule until fewer than 19 are left.
 *
 * The initial mix: three tracks over 360 months, 546,000 at 4.60%, 547,000 at 4.10%, 547,000
 * at 4.40%. Its payment-to-income ratio — 40.4% of the disposable income, 21,700 − 1,450 =
 * 20,250 — is computed (caseARatio, through affordability.ts), never typed.
 *
 * Which track each rate belongs to is this file's choice, made so a learner can see why:
 *   - 4.60% is a PRIME track. Prime = the Bank of Israel rate + 1.5 points, a convention (not
 *     stated here as a directive's rule); with the rate at 3.25% from 2026-09-03 (not verified)
 *     that is 4.75%, so 4.60% is prime minus 0.15 point.
 *   - 4.10% is a variable unlinked track that resets every 5 years (DEC-3's assumption): the rate
 *     is repriced after 5 years, so it is the cheapest of the three at the start.
 *   - 4.40% is a fixed unlinked track: the rate is locked for 30 years.
 *   The three are not equal "thirds" of a plan: they are 546,000 / 547,000 / 547,000, a simple
 *   starting draft. With the 4.40% track fixed, the variable part is 1,093,000 — 333 shekels
 *   under the two-thirds line (1,093,333.33): the initial mix passes the one-third-fixed rule,
 *   barely. (The other order — the 4.60% track fixed — would fail it by 667 shekels.)
 *
 * The price list below gives every kind of track ONE rate, whatever the mix and the term.
 * That is a teaching device so that two mixes can be compared on the same basis. In the
 * market a bank prices the whole case, and changing the mix can change the rates (FK-H-057,
 * field knowledge, awaiting Eylon). The linked tracks' rates are real rates (before the index).
 *
 * Scenarios are teaching scenarios in the builder's own form, never forecasts: how Directive 451
 * forecasts is lesson 5.4's.
 */
import type { Obligation } from "../lib/calc/affordability.ts";
import { affordability } from "../lib/calc/affordability.ts";
import { checkRegulation, passesAllLimits } from "../lib/calc/regulation.ts";
import type { GoalContext, ScenarioSpec } from "../lib/calc/sensitivity.ts";
import { loanOf, qualifyingTotal, scenarioFrom, variableAmount } from "../lib/calc/sensitivity.ts";
import type { TrackKind, TrackSpec } from "../lib/calc/schedule.ts";

export const CASE_A = {
  price: "2200000",
  equity: "560000",
  loan: "1640000",
  /** Net monthly incomes; the recognised income is their sum (the same simplification as lesson 4.15). */
  netIncomes: ["12400", "9300"],
  recognisedIncome: "21700",
  car: { kind: "loan", monthly: "1450", monthsLeft: 26 } as Obligation,
  deal: "only_home" as const,
  termMonths: 360,
};

/** The course's price list for case A: the starting rate of each kind, in percent a year. A teaching assumption. */
export const PRICE_LIST: Record<TrackKind, string> = {
  fixed_unlinked: "4.40",
  prime: "4.60",
  variable_unlinked: "4.10",
  fixed_linked: "2.90",
  variable_linked: "2.50",
};

/** Today's prime in the course's convention (the Bank of Israel rate 3.25% + 1.5), for the spread of the prime track. */
export const PRIME_TODAY = "4.75";

export const KIND_NAME_HE: Record<TrackKind, string> = {
  fixed_unlinked: "קבועה לא צמודה",
  fixed_linked: "קבועה צמודה",
  prime: "פריים",
  variable_unlinked: "משתנה לא צמודה",
  variable_linked: "משתנה צמודה",
};

/** The three teaching scenarios, in the builder's form (inflation, prime shift from year 2, anchor shift at each reset). */
export const SCENARIOS: Record<"base" | "stress" | "relief", ScenarioSpec> = {
  base: { inflation: "2", primeShift: "0", anchorShift: "0" },
  stress: { inflation: "4", primeShift: "2", anchorShift: "2" },
  relief: { inflation: "1", primeShift: "-1", anchorShift: "-1" },
};

/** Hebrew names: "תרחיש לחץ" is a term of lesson 8.10, so before then the harsh scenario is "מחמיר" and the mild one "מקל". */
export const SCENARIO_NAME_HE = { base: "תרחיש בסיס", stress: "תרחיש מחמיר", relief: "תרחיש מקל" } as const;

/** The context the three goals read: the base scenario for the payment and the total, the stress scenario for the exposure. */
export const GOAL_CONTEXT: GoalContext = { base: scenarioFrom(SCENARIOS.base), stress: scenarioFrom(SCENARIOS.stress) };

const track = (kind: TrackKind, amount: number, years: number): TrackSpec => ({
  kind,
  amount: String(amount),
  rate: PRICE_LIST[kind],
  months: years * 12,
});

/** The initial mix: three tracks over 360 months. */
export const INITIAL_MIX: TrackSpec[] = [track("prime", 546000, 30), track("variable_unlinked", 547000, 30), track("fixed_unlinked", 547000, 30)];

export interface CaseACandidate {
  id: string;
  /** A short Hebrew name for tables. */
  name: string;
  /** One line: what the mix is. */
  note: string;
  tracks: TrackSpec[];
}

/**
 * The fixed set of candidate mixes of lessons 5.6 and 5.8: the same 1,640,000 ₪ in each, built from the
 * same price list. Two of them (`linked_heavy`, `fixed_20`) break a limit on purpose, so that the limits
 * visibly change which mix wins a goal.
 */
export const CANDIDATES: CaseACandidate[] = [
  { id: "initial", name: "הראשוני", note: "פריים, משתנה ל־5 שנים וקבועה, בחלקים כמעט שווים", tracks: INITIAL_MIX },
  {
    id: "half",
    name: "חצי־חצי",
    note: "חצי קבועה לא צמודה, חצי משתנה לא צמודה",
    tracks: [track("fixed_unlinked", 820000, 30), track("variable_unlinked", 820000, 30)],
  },
  { id: "fixed", name: "קבועה בלבד", note: "כל ההלוואה קבועה לא צמודה", tracks: [track("fixed_unlinked", 1640000, 30)] },
  {
    id: "linked",
    name: "צמוד",
    note: "משתנה צמודה וקבועה צמודה",
    tracks: [track("variable_linked", 1093000, 30), track("fixed_linked", 547000, 30)],
  },
  {
    id: "short",
    name: "25 שנה",
    note: "משתנה לא צמודה וקבועה לא צמודה, שתיהן ל־25 שנה",
    tracks: [track("variable_unlinked", 1093000, 25), track("fixed_unlinked", 547000, 25)],
  },
  {
    id: "linked_heavy",
    name: "צמוד, בעיקר משתנה",
    note: "משתנה צמודה וקבועה צמודה, יותר משני שלישים משתנה",
    tracks: [track("variable_linked", 1300000, 30), track("fixed_linked", 340000, 30)],
  },
  { id: "fixed_20", name: "קבועה ל־20 שנה", note: "כל ההלוואה קבועה לא צמודה, ל־20 שנה", tracks: [track("fixed_unlinked", 1640000, 20)] },
];

export const candidate = (id: string): CaseACandidate => {
  const c = CANDIDATES.find((x) => x.id === id);
  if (!c) throw new Error(`no candidate "${id}"`);
  return c;
};

/** The three alternatives of lesson 5.8: the winner of each goal among the candidates that pass the limits (checked in the lesson's facts). */
export const ALTERNATIVE_IDS = { payment: "linked", total: "short", exposure: "fixed" } as const;

// ── The case's own limits ──────────────────────────────────────────────────

/** The disposable income of the ratio: the recognised income minus the car loan (still more than 18 months left). */
export function caseADisposable() {
  return affordability({ income: CASE_A.recognisedIncome, obligations: [CASE_A.car], newPayment: "0" }).disposable;
}

/** The payment-to-income ratio of a mix for case A, percent, exact: affordability.ts on the mix's qualifying payment. */
export function caseARatio(tracks: TrackSpec[]) {
  const r = affordability({ income: CASE_A.recognisedIncome, obligations: [CASE_A.car], newPayment: qualifyingTotal(tracks) });
  if (r.ratioPercent === null) throw new RangeError("the disposable income is not above zero");
  return r.ratioPercent;
}

/** All five lines of Directive 329 (regulation.ts) for a mix of case A. */
export function caseALimits(tracks: TrackSpec[]) {
  return checkRegulation({
    deal: CASE_A.deal,
    value: CASE_A.price,
    loan: loanOf(tracks),
    payment: qualifyingTotal(tracks),
    disposableIncome: caseADisposable(),
    variable: variableAmount(tracks),
    termMonths: Math.max(...tracks.map((t) => t.months)),
  });
}

/** True when no ban of 329 is crossed (the capital threshold does not count). */
export const caseAPasses = (tracks: TrackSpec[]): boolean => passesAllLimits(caseALimits(tracks));

/** A mix as MixBuilder.vue's `tracks` prop takes it. */
export function builderTracks(tracks: TrackSpec[]) {
  return tracks.map((t) => ({ kind: t.kind, amount: Number(t.amount), rate: t.rate, years: t.months / 12 }));
}
