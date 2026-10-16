/**
 * Positioning — where a ratio sits against a line, how far it is, and what it
 * costs to move away from the line. The arithmetic behind lessons 6.1–6.3 (the
 * whole picture, thresholds and steps, the lever map). Lessons 6.4 (price of a
 * lever), 6.9 (the underwriter) and 6.11 (the workshop) import it: **the API
 * below is stable; add, don't rename.**
 *
 * ── The API ──────────────────────────────────────────────────────────────
 *
 * Thresholds, with a kind
 *   ThresholdKind  "regulatory_limit" | "capital_threshold" | "bank_policy" | "field_hypothesis"
 *   Metric         "pti" (payment ÷ disposable income, lesson 4.3) | "ltv" (loan ÷ value, lesson 1.2)
 *   Threshold {id, metric, kind, percent, label, source}   one line on one metric; percent is a string
 *   KIND_INFO                    per kind: the Hebrew name, what crossing it means, how the course labels it
 *   EXAMPLE_THRESHOLDS           the course's example set for stage 6 (case A): the five lines of
 *                                lesson 4.5 that concern positioning, plus the field hypotheses
 *   thresholdsOf(metric, list?)  the lines of one metric, lowest first
 *
 * Where a ratio stands
 *   standing(actual, t)          {threshold, actual, status, points}: status is "within" (below the
 *                                line), "at" (exactly on it: not crossed) or "over" (crossed: strictly
 *                                above, like 329's "exceeds"); points = line − actual, in percentage
 *                                points (positive = room, negative = how far over)
 *   standings(actual, list)      one per threshold, lowest line first
 *   band(actual, list)           {crossed, next, pointsToNext}: the lines already crossed, the nearest
 *                                line not yet crossed, and the points left to it (null past the last)
 *
 * The distance in shekels, on each axis the client can move along
 *   paymentRoom(disposable, payment, percent)   the largest payment the line allows, minus the payment:
 *                                shekels a month (negative = over). The line's payment is floored to the agora
 *   loanRoom(value, loan, percent)              the largest loan the line allows on the value, minus the loan
 *   incomeRoom(disposable, payment, percent)    the disposable income the payment needs to sit exactly on
 *                                the line, minus the income there is, rounded UP to the agora; 0 when within
 *   paymentCut(disposable, payment, percent)    how much a month the payment must fall to reach the line; 0 when within
 *   equityToReach(value, loan, percent)         how much of the loan must be replaced by equity to reach a financing
 *                                line; 0 when within
 *
 * The price of moving away from a line (the client's side of the trade)
 *   loanCut(tracks, disposable, percent, step?) the least that must come off the loan, in whole `step`s
 *                                (default 1,000 ₪; tracks keep their proportions, sensitivity.ts's
 *                                "amount" lever), for the payment ratio to be at most `percent`. It is also
 *                                the extra equity the client must bring: the price stays the same
 *   ratioAfterCut(tracks, disposable, cut)      the payment ratio after that cut, percent, exact
 *   ltvAfterCut(tracks, value, cut)             the financing ratio after it, percent, exact
 *   ltvAfterUse(value, loan, use)               the financing ratio when `use` shekels of the equity go
 *                                elsewhere (closing a debt) and the loan grows by as much, percent, exact
 *   termRoute(principal, rate, from, to)        one level-payment (שפיצר) loan, its term moved from `from`
 *                                to `to` months: both payments (each rounded to the agora), both totals
 *                                (payment × months) and the extra total paid. The price of a longer term is
 *                                a larger total; the gain is a lower payment
 *   shortestTerm(principal, rate, cap, from, step?, max?)   the shortest term, in whole `step`s of months
 *                                (default 12) from `from` up to `max` (default 360), whose payment is at most `cap`;
 *                                null when even `max` months is not enough
 *
 * What this module does NOT know (and the lessons say so)
 *   - The size of a step. Crossing a regulatory limit is a ban; crossing the capital threshold costs
 *     the bank capital (by how much, and what it does about it, is unknown, lesson 4.5); a bank's policy
 *     line is the bank's own; a field hypothesis is a claim by someone in the field that a line matters,
 *     with no number for what crossing it costs. So no function here prices a crossing: it prices only the
 *     move that avoids one. Whether a move is worth its price is the learner's judgement, with these
 *     numbers (lesson 6.2); lesson 6.4 prices each lever as gain against cost.
 *   - Which lines a real bank applies. EXAMPLE_THRESHOLDS are the course's example lines for teaching; the
 *     50 and 40 and the financing ceilings are regulation.ts's (the team's transcription of directive 329,
 *     not checked against the directive); 35, 30 are an example from the course brief ("the numbers are to
 *     be checked"), 60 and 40 of the financing ratio are one banker's remark (FK-H-004).
 *
 * Amounts are shekels as strings or Decimals; percents are strings. Results are exact Decimals, except where
 * a function says it rounds. Recomputed independently in checks/kinds/positioning.py.
 */
import Decimal from "decimal.js";
import { paymentToIncome } from "./affordability.ts";
import { annuityPayment } from "./amortization.ts";
import { floorAgora, LTV_CEILINGS, ltvPercentOf, PTI_CAPITAL_THRESHOLD, PTI_LIMIT } from "./regulation.ts";
import type { TrackSpec } from "./schedule.ts";
import { applyLever, loanOf, qualifyingTotal, type ScenarioSpec } from "./sensitivity.ts";

export type Numeric = Decimal.Value;

const HUNDRED = new Decimal(100);
const ZERO = new Decimal(0);

// ── Thresholds ─────────────────────────────────────────────────────────────

export type ThresholdKind = "regulatory_limit" | "capital_threshold" | "bank_policy" | "field_hypothesis";
export type Metric = "pti" | "ltv";

export interface Threshold {
  id: string;
  metric: Metric;
  kind: ThresholdKind;
  /** The line, as a percent string: "40". */
  percent: string;
  /** The line's name in Hebrew, as the course writes it. */
  label: string;
  /** Where the number comes from, in the course's words (never "verified" for what no one opened at its source). */
  source: string;
}

export interface KindInfo {
  name: string;
  /** What crossing a line of this kind means. */
  crossing: string;
  /** How sure the course is of a number of this kind. */
  label: string;
  /** Who sets it. */
  whoSets: string;
}

export const KIND_INFO: Record<ThresholdKind, KindInfo> = {
  regulatory_limit: {
    name: "מגבלה רגולטורית",
    crossing: "אסור: הבנק לא מאשר",
    label: "לפי תעתיק הצוות של ההוראה, לא אומת",
    whoSets: "בנק ישראל, זהה בכל הבנקים",
  },
  capital_threshold: {
    name: "סף הון",
    crossing: "מותר, אבל הבנק מחזיק יותר הון כנגד ההלוואה",
    label: "לפי תיעוד הצוות, לא אומת; כמה זה עולה לבנק ומה הוא עושה בגלל זה — לא ידוע",
    whoSets: "בנק ישראל, זהה בכל הבנקים",
  },
  bank_policy: {
    name: "מדיניות בנק",
    crossing: "הבנק הזה לא יאשר, או ידרוש תיקון",
    label: "בדוי: הקורס לא מכיר קו מפורסם של בנק",
    whoSets: "הבנק עצמו; בנק אחר אולי אחרת",
  },
  field_hypothesis: {
    name: "השערה מהשטח",
    crossing: "לא ידוע: ייתכן שמתחתיו התיק נראה בטוח יותר ויש כוח מיקוח",
    label: "השערה לבדיקה: המספרים לבדיקה, ממתין לאישור אילון",
    whoSets: "אף אחד לא קבע: טענה של איש מקצוע, שלא נבדקה",
  },
};

/** The course's example lines for stage 6, case A (lesson 6.2). A teaching set, not a map of real banks. */
export const EXAMPLE_THRESHOLDS: Threshold[] = [
  { id: "pti.30", metric: "pti", kind: "field_hypothesis", percent: "30", label: "30% יחס החזר", source: "דוגמה מהבריף של הקורס (30%–35%); המספרים לבדיקה" },
  { id: "pti.35", metric: "pti", kind: "field_hypothesis", percent: "35", label: "35% יחס החזר", source: "דוגמה מהבריף של הקורס (30%–35%); המספרים לבדיקה" },
  { id: "pti.40", metric: "pti", kind: "capital_threshold", percent: PTI_CAPITAL_THRESHOLD, label: "סף ההון: 40% יחס החזר", source: "תיעוד הצוות (Brain 7503881); לא אומת" },
  { id: "pti.50", metric: "pti", kind: "regulatory_limit", percent: PTI_LIMIT, label: "המגבלה: 50% יחס החזר", source: "תעתיק הצוות להוראה 329 (Brain 7503881); לא אומת" },
  { id: "ltv.40", metric: "ltv", kind: "field_hypothesis", percent: "40", label: "40% מימון", source: "טובי זמיר, 2026-08-05 (FK-H-004); מקור יחיד, לא נבדק" },
  { id: "ltv.60", metric: "ltv", kind: "field_hypothesis", percent: "60", label: "60% מימון", source: "טובי זמיר, 2026-08-05 (FK-H-004); מקור יחיד, לא נבדק" },
  { id: "ltv.75", metric: "ltv", kind: "regulatory_limit", percent: LTV_CEILINGS.only_home, label: "התקרה: 75% מימון (דירה יחידה)", source: "תעתיק הצוות להוראה 329 (Brain 7503881); לא אומת" },
];

/** The lines of one metric, lowest first. */
export function thresholdsOf(metric: Metric, list: Threshold[] = EXAMPLE_THRESHOLDS): Threshold[] {
  return list.filter((t) => t.metric === metric).sort((a, b) => new Decimal(a.percent).cmp(b.percent));
}

// ── Where a ratio stands ───────────────────────────────────────────────────

/** "within": below the line. "at": exactly on it (not crossed). "over": strictly above it (crossed). */
export type Status = "within" | "at" | "over";

export interface Standing {
  threshold: Threshold;
  actual: Decimal;
  status: Status;
  /** line − actual, percentage points: positive is room, negative is how far over. Exact. */
  points: Decimal;
}

/** Line − actual, in percentage points (positive = room). */
export function pointsTo(actual: Numeric, percent: Numeric): Decimal {
  return new Decimal(percent).minus(actual);
}

export function statusOf(actual: Numeric, percent: Numeric): Status {
  const c = new Decimal(actual).cmp(percent);
  return c < 0 ? "within" : c === 0 ? "at" : "over";
}

export function standing(actual: Numeric, threshold: Threshold): Standing {
  const a = new Decimal(actual);
  return { threshold, actual: a, status: statusOf(a, threshold.percent), points: pointsTo(a, threshold.percent) };
}

/** One standing per line, lowest line first. */
export function standings(actual: Numeric, list: Threshold[]): Standing[] {
  return [...list].sort((a, b) => new Decimal(a.percent).cmp(b.percent)).map((t) => standing(actual, t));
}

export interface Band {
  /** The lines already crossed, lowest first. */
  crossed: Threshold[];
  /** The nearest line not yet crossed (an "at" line counts as not crossed), or null. */
  next: Threshold | null;
  /** Points left to `next`, or null. */
  pointsToNext: Decimal | null;
}

export function band(actual: Numeric, list: Threshold[]): Band {
  const s = standings(actual, list);
  const next = s.find((x) => x.status !== "over") ?? null;
  return { crossed: s.filter((x) => x.status === "over").map((x) => x.threshold), next: next?.threshold ?? null, pointsToNext: next?.points ?? null };
}

// ── The distance in shekels ────────────────────────────────────────────────

function positive(value: Numeric, name: string): Decimal {
  const d = new Decimal(value);
  if (d.lte(0)) throw new RangeError(`${name} must be more than zero, got ${d.toString()}`);
  return d;
}

function nonNegative(value: Numeric, name: string): Decimal {
  const d = new Decimal(value);
  if (d.isNeg()) throw new RangeError(`${name} cannot be negative, got ${d.toString()}`);
  return d;
}

/** The largest payment the line allows, minus the payment: shekels a month; negative when over. */
export function paymentRoom(disposable: Numeric, payment: Numeric, percent: Numeric): Decimal {
  return floorAgora(positive(disposable, "the disposable income").mul(nonNegative(percent, "the line")).div(HUNDRED)).minus(nonNegative(payment, "the payment"));
}

/** The largest loan the line allows on the value, minus the loan: shekels; negative when over. */
export function loanRoom(value: Numeric, loan: Numeric, percent: Numeric): Decimal {
  return floorAgora(positive(value, "the value").mul(nonNegative(percent, "the line")).div(HUNDRED)).minus(nonNegative(loan, "the loan"));
}

/** How much a month the payment must fall to reach the line: 0 when it is within. */
export function paymentCut(disposable: Numeric, payment: Numeric, percent: Numeric): Decimal {
  const room = paymentRoom(disposable, payment, percent);
  return room.isNeg() ? room.neg() : ZERO;
}

/** How much of the loan must be replaced by equity (the price does not change) to reach a financing line: 0 when within. */
export function equityToReach(value: Numeric, loan: Numeric, percent: Numeric): Decimal {
  const room = loanRoom(value, loan, percent);
  return room.isNeg() ? room.neg() : ZERO;
}

/**
 * The extra disposable income a month that puts the payment exactly on the line:
 * payment × 100 ÷ line − disposable income, rounded up to the agora; 0 when the payment is within.
 */
export function incomeRoom(disposable: Numeric, payment: Numeric, percent: Numeric): Decimal {
  const need = nonNegative(payment, "the payment").mul(HUNDRED).div(positive(percent, "the line")).toDecimalPlaces(2, Decimal.ROUND_UP);
  const room = need.minus(positive(disposable, "the disposable income"));
  return room.isNeg() ? ZERO : room;
}

// ── The price of moving away from a line ───────────────────────────────────

const SCENARIO: ScenarioSpec = { inflation: "0", primeShift: "0", anchorShift: "0" };

/** The mix with `cut` shekels taken off the loan; the tracks keep their proportions. */
export function tracksAfterCut(tracks: TrackSpec[], cut: Numeric): TrackSpec[] {
  const c = nonNegative(cut, "the cut");
  if (c.isZero()) return tracks.map((t) => ({ ...t }));
  return applyLever({ tracks, scenario: SCENARIO }, { lever: "amount", change: c.neg() }).tracks;
}

/** The payment ratio, percent, exact, after `cut` shekels came off the loan. */
export function ratioAfterCut(tracks: TrackSpec[], disposable: Numeric, cut: Numeric): Decimal {
  return paymentToIncome(qualifyingTotal(tracksAfterCut(tracks, cut)), disposable);
}

/** The financing ratio, percent, exact, after `cut` shekels came off the loan (the value does not move). */
export function ltvAfterCut(tracks: TrackSpec[], value: Numeric, cut: Numeric): Decimal {
  return ltvPercentOf(loanOf(tracksAfterCut(tracks, cut)), value);
}

/** The financing ratio, percent, exact, when `use` shekels of the equity go elsewhere and the loan grows by as much. */
export function ltvAfterUse(value: Numeric, loan: Numeric, use: Numeric): Decimal {
  return ltvPercentOf(new Decimal(loan).plus(nonNegative(use, "the amount used")), value);
}

/**
 * The least that must come off the loan, in whole multiples of `step`, for the payment ratio to be at most
 * `percent`. 0 when it already is. The extra equity needed is the same number (the price does not change).
 */
export function loanCut(tracks: TrackSpec[], disposable: Numeric, percent: Numeric, step: Numeric = 1000): Decimal {
  const stepD = positive(step, "the step");
  const cap = nonNegative(percent, "the line");
  const ok = (cut: Decimal) => ratioAfterCut(tracks, disposable, cut).lte(cap);
  if (ok(ZERO)) return ZERO;
  const loan = loanOf(tracks);
  const pay = qualifyingTotal(tracks);
  const need = paymentToIncome(pay, disposable);
  // The payment is close to proportional to the loan: start from the proportional cut, then settle on the exact step.
  let cut = loan.mul(need.minus(cap)).div(need).div(stepD).floor().mul(stepD);
  if (cut.isNeg()) cut = ZERO;
  while (cut.lt(loan) && !ok(cut)) cut = cut.plus(stepD);
  while (cut.gte(stepD) && ok(cut.minus(stepD))) cut = cut.minus(stepD);
  if (cut.gte(loan)) throw new RangeError("no cut short of the whole loan reaches the line");
  return cut;
}

export interface TermRoute {
  fromMonths: number;
  toMonths: number;
  /** Each payment is the level payment rounded to the agora. */
  fromPayment: Decimal;
  toPayment: Decimal;
  /** Payment × months. */
  fromTotal: Decimal;
  toTotal: Decimal;
  /** fromPayment − toPayment: what the longer term gives (negative for a shorter term). */
  paymentDrop: Decimal;
  /** toTotal − fromTotal: what the longer term costs (negative for a shorter term). */
  extraTotal: Decimal;
}

const agora = (x: Numeric) => new Decimal(x).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

/** One level-payment loan, its term moved from `from` to `to` months, at the same rate. */
export function termRoute(principal: Numeric, ratePercent: Numeric, fromMonths: number, toMonths: number): TermRoute {
  const fromPayment = agora(annuityPayment(principal, ratePercent, fromMonths));
  const toPayment = agora(annuityPayment(principal, ratePercent, toMonths));
  const fromTotal = fromPayment.mul(fromMonths);
  const toTotal = toPayment.mul(toMonths);
  return { fromMonths, toMonths, fromPayment, toPayment, fromTotal, toTotal, paymentDrop: fromPayment.minus(toPayment), extraTotal: toTotal.minus(fromTotal) };
}

/**
 * The shortest term, in whole `step`s of months from `from` up to `max`, whose level payment (rounded to the
 * agora) is at most `cap`; null when even `max` is not enough.
 */
export function shortestTerm(principal: Numeric, ratePercent: Numeric, cap: Numeric, from: number, step = 12, max = 360): number | null {
  for (let months = from; months <= max; months += step) {
    if (agora(annuityPayment(principal, ratePercent, months)).lte(cap)) return months;
  }
  return null;
}
