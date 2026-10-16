/**
 * Going to the banks (lessons 6.6–6.8): the clocks that run while you wait, what
 * a rate that moves costs, what one notch of negotiation is worth in shekels, and
 * a toy view of what a mix may be worth to a bank.
 *
 * ── API (stable; add, don't rename) ─────────────────────────────────────────
 *
 *   The four clocks (lesson 6.6)
 *   validityDays(newLien)            24 calendar days, or 12 when no new lien is registered.
 *   bankClocks(request, calendar)    one bank's dates: the last day it may answer, the day it
 *                                    did, and the last day of the terms it holds. THE VALIDITY
 *                                    RUNS FROM THAT BANK'S OWN APPROVAL, not from the request
 *                                    and not from the slowest bank's answer.
 *   governingIndex(clocks)           the bank whose terms end first (the first on a tie): the
 *                                    clock that decides how long ALL the approvals stay alive.
 *   daysUntil(today, date)           calendar days from `today` to `date` (negative once past).
 *   roundAnswer / roundFits /        a negotiation round takes `roundDays` business days (a
 *   roundsThatFit / latestRoundStart rule of the EXERCISE, not a known deadline) and needs a
 *                                    reserve of calendar days after the answer for what must
 *                                    still happen before signing (also the exercise's rule).
 *                                    A round fits when answer day + reserve is not after the
 *                                    last day of the terms. Rounds run one after another: the
 *                                    next starts the day the previous answer arrives.
 *   eventsInside(dates, from, to)    the dates (a Bank of Israel decision, say) that fall in
 *                                    the window [from, to].
 *
 *   A rate that moves (lessons 6.6, 6.7)
 *   MixEdit                          { target: a track kind | "all" | a 1-based track number,
 *                                      points }: add `points` percentage points to the rate
 *                                    of those tracks.
 *   effectOf(tracks, scenario, edit) the mix's measures before and after the edit, and the
 *                                    differences of the first payment and of the total paid
 *                                    (after − before, so a rise is positive). Statement
 *                                    rounding, the way every teaching table is built.
 *   simpleMonthly(amount, points)    the rule-of-thumb "amount × points ÷ 100 ÷ 12": interest
 *                                    on the whole balance for one month. NOT the payment's
 *                                    change (the payment also repays principal); kept as the
 *                                    wrong answer a learner is likely to give.
 *
 *   Negotiation (lesson 6.7)
 *   stopReason(fits, lastGain,       "time" when the next round does not fit, "small_gain"
 *              threshold)            when the last round gained less than the threshold,
 *                                    otherwise "continue". An exercise rule, stated as such.
 *   runRounds(...)                   a whole negotiation: rounds one after another, each taking
 *                                    some points off some tracks. A round that does not fit before
 *                                    the terms end produces NO offer (Brain J-100, a team claim):
 *                                    its gain is zero and the mix stays as it was. Each row says
 *                                    what the round gained (shekels over the loan's life, and in
 *                                    the first payment), what the offer is worth afterwards, and
 *                                    the rule's advice for the next step.
 *
 *   A bank's view (lesson 6.8, a toy)
 *   firstYearMargin(tracks, costs)   Σ amount × (rate − cost of the kind) ÷ 100: what the
 *                                    year's interest would be above an INVENTED cost of funds
 *                                    for each kind of track. Not how any bank prices.
 *
 * ── Conventions ─────────────────────────────────────────────────────────────
 *  - Dates are ISO strings and are handled in UTC (process.ts). The day an event happens is day
 *    0: "24 days from the approval" ends on the 24th day after the approval's day.
 *  - Everything about how many days a bank takes, how long a re-pricing round takes, and what a
 *    bank does with a mix is an INPUT here. The course gives the numbers as rules of the exercise.
 *  - The schedules, payments and totals are sensitivity.ts's (and through it schedule.ts's);
 *    this file adds the clocks and what to do with the differences.
 *
 * Recomputed independently in checks/kinds/outreach.py (plain Python date and Decimal
 * arithmetic; the schedules come from checks/kinds/schedule.py).
 */
import Decimal from "decimal.js";
import { addBusinessDays, addCalendarDays, type BankCalendar, calendarDaysBetween } from "./process.ts";
import type { Scenario, TrackKind, TrackSpec } from "./schedule.ts";
import { type Measures, measuresOf } from "./sensitivity.ts";

const ZERO = new Decimal(0);

export type Numeric = Decimal.Value;

/** The answer to a pre-approval request: 5 business days, 7 for loan types the bank defined in advance (team transcription of Directive 451; not verified). */
export const ANSWER_DAYS = 5;
export const ANSWER_DAYS_EXTENDED = 7;
/** The terms hold at least this many calendar days from the approval (24; 12 when no new lien is registered). Same source and status. */
export const WINDOW_DAYS = 24;
export const WINDOW_DAYS_NO_LIEN = 12;

export const validityDays = (newLien: boolean): number => (newLien ? WINDOW_DAYS : WINDOW_DAYS_NO_LIEN);

// ── The clocks of one bank ──────────────────────────────────────────────────

export interface BankRequest {
  name: string;
  /** The day the request was sent (day 0 of the answer clock). */
  requested: string;
  /** Business days the bank took to answer: 1 up to the limit. */
  answeredAfter: number;
  /** A loan type the bank defined in advance: 7 business days instead of 5. */
  extended?: boolean;
  /** A new lien registered on the property (24 days) or not (12). */
  newLien: boolean;
}

export interface BankClocks {
  name: string;
  /** The last day the bank may answer. */
  answerBy: string;
  /** The day it did (day 0 of the validity clock). */
  approved: string;
  /** The last day the terms hold. */
  validUntil: string;
  windowDays: number;
}

export function bankClocks(r: BankRequest, calendar: BankCalendar): BankClocks {
  const limit = r.extended ? ANSWER_DAYS_EXTENDED : ANSWER_DAYS;
  if (!Number.isInteger(r.answeredAfter) || r.answeredAfter < 1 || r.answeredAfter > limit) {
    throw new RangeError(`${r.name}: the answer takes 1 to ${limit} business days, got ${r.answeredAfter}`);
  }
  const approved = addBusinessDays(r.requested, r.answeredAfter, calendar);
  const windowDays = validityDays(r.newLien);
  return {
    name: r.name,
    answerBy: addBusinessDays(r.requested, limit, calendar),
    approved,
    validUntil: addCalendarDays(approved, windowDays),
    windowDays,
  };
}

/** The index of the bank whose terms end first; the first of them on a tie. */
export function governingIndex(clocks: BankClocks[]): number {
  if (clocks.length === 0) throw new RangeError("there are no banks");
  let best = 0;
  clocks.forEach((c, k) => {
    if (c.validUntil < clocks[best].validUntil) best = k;
  });
  return best;
}

/** Calendar days from `today` to `date`; negative once `date` has passed. */
export const daysUntil = (today: string, date: string): number => calendarDaysBetween(today, date);

/** The dates in `dates` that fall in [from, to], both included. */
export const eventsInside = (dates: string[], from: string, to: string): string[] => dates.filter((d) => d >= from && d <= to);

// ── Rounds of negotiation against the clock ─────────────────────────────────

/** The day a round started on `start` is answered: `roundDays` business days later. */
export const roundAnswer = (start: string, roundDays: number, calendar: BankCalendar): string => addBusinessDays(start, roundDays, calendar);

/** A round fits when its answer arrives with `reserve` calendar days still left before the terms end. */
export function roundFits(start: string, validUntil: string, roundDays: number, reserve: number, calendar: BankCalendar): boolean {
  return addCalendarDays(roundAnswer(start, roundDays, calendar), reserve) <= validUntil;
}

export interface Round {
  start: string;
  answer: string;
}

/** The rounds that fit one after another, the next starting the day the previous answer arrives. */
export function roundsThatFit(start: string, validUntil: string, roundDays: number, reserve: number, calendar: BankCalendar): Round[] {
  const rounds: Round[] = [];
  let at = start;
  while (rounds.length < 50 && roundFits(at, validUntil, roundDays, reserve, calendar)) {
    const answer = roundAnswer(at, roundDays, calendar);
    rounds.push({ start: at, answer });
    at = answer;
  }
  return rounds;
}

/** The latest day a round can start and still fit, searching back from the end of the terms; null if none on or after `notBefore`. */
export function latestRoundStart(validUntil: string, roundDays: number, reserve: number, notBefore: string, calendar: BankCalendar): string | null {
  for (let d = validUntil; d >= notBefore; d = addCalendarDays(d, -1)) {
    if (roundFits(d, validUntil, roundDays, reserve, calendar)) return d;
  }
  return null;
}

// ── A rate that moves ───────────────────────────────────────────────────────

export interface MixEdit {
  /** A kind of track, every track, or one track by its 1-based number. */
  target: TrackKind | "all" | number;
  /** Percentage points added to the rate of those tracks (negative lowers). */
  points: Numeric;
}

export function applyEdit(tracks: TrackSpec[], edit: MixEdit): TrackSpec[] {
  const hit = (t: TrackSpec, k: number) => edit.target === "all" || edit.target === t.kind || edit.target === k + 1;
  if (typeof edit.target === "number" && (!Number.isInteger(edit.target) || edit.target < 1 || edit.target > tracks.length)) {
    throw new RangeError(`there is no track ${edit.target}`);
  }
  return tracks.map((t, k) => {
    if (!hit(t, k)) return { ...t };
    const rate = new Decimal(t.rate).plus(edit.points);
    if (rate.isNeg()) throw new RangeError("a rate cannot go below zero");
    return { ...t, rate: rate.toString() };
  });
}

export interface Effect {
  before: Measures;
  after: Measures;
  /** after − before: positive when the edit costs more. */
  deltaFirst: Decimal;
  deltaTotal: Decimal;
}

export function effectOf(tracks: TrackSpec[], scenario: Scenario, edit: MixEdit): Effect {
  const before = measuresOf(tracks, scenario);
  const after = measuresOf(applyEdit(tracks, edit), scenario);
  return { before, after, deltaFirst: after.first.minus(before.first), deltaTotal: after.total.minus(before.total) };
}

/** amount × points ÷ 100 ÷ 12, to the agora: a month's interest on the whole balance, NOT the change in a level payment. */
export function simpleMonthly(amount: Numeric, points: Numeric): Decimal {
  return new Decimal(amount).mul(points).div(100).div(12).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

// ── Negotiation ─────────────────────────────────────────────────────────────

export type Stop = "time" | "small_gain" | "continue";

/**
 * The exercise's rule for another round: not if it does not fit before the terms end; not if the
 * last round gained less than the client's threshold (in shekels over the loan's life); otherwise go on.
 * The order matters: time is checked first, because a round that does not fit produces no offer at all.
 */
export function stopReason(fits: boolean, lastGain: Numeric, threshold: Numeric): Stop {
  if (!fits) return "time";
  if (new Decimal(lastGain).lt(threshold)) return "small_gain";
  return "continue";
}

export interface RoundInput {
  /** Which rates the bank moved: a kind of track, every track, or one track by its 1-based number. */
  target: MixEdit["target"];
  /** How many percentage points the bank took OFF those rates in this round (0 = it did not move). */
  points: Numeric;
}

export interface RoundRow {
  /** 1-based. */
  round: number;
  start: string;
  answer: string;
  /** The answer arrives with the reserve still left before the terms end. */
  fits: boolean;
  /** Shekels saved over the loan's life by this round (0 when it did not fit or did not move). */
  gainTotal: Decimal;
  /** Shekels saved in the first payment. */
  gainFirst: Decimal;
  /** The offer's first payment and total paid after this round. */
  firstAfter: Decimal;
  totalAfter: Decimal;
  /** The tracks as they stand after this round. */
  tracksAfter: TrackSpec[];
  /** The exercise's advice after this round, looking at whether the NEXT round would fit. */
  advice: Stop;
}

/** A negotiation round after round, from `start` (usually today), against the end of the terms. */
export function runRounds(
  tracks: TrackSpec[],
  scenario: Scenario,
  inputs: RoundInput[],
  start: string,
  validUntil: string,
  roundDays: number,
  reserve: number,
  threshold: Numeric,
  calendar: BankCalendar,
): RoundRow[] {
  let current = tracks.map((t) => ({ ...t }));
  let at = start;
  return inputs.map((input, k) => {
    const answer = roundAnswer(at, roundDays, calendar);
    const fits = roundFits(at, validUntil, roundDays, reserve, calendar);
    let gainTotal = ZERO;
    let gainFirst = ZERO;
    if (fits && new Decimal(input.points).gt(0)) {
      const e = effectOf(current, scenario, { target: input.target, points: new Decimal(input.points).neg() });
      gainTotal = e.deltaTotal.neg();
      gainFirst = e.deltaFirst.neg();
      current = applyEdit(current, { target: input.target, points: new Decimal(input.points).neg() });
    }
    const m = measuresOf(current, scenario);
    const nextFits = roundFits(answer, validUntil, roundDays, reserve, calendar);
    const row: RoundRow = {
      round: k + 1,
      start: at,
      answer,
      fits,
      gainTotal,
      gainFirst,
      firstAfter: m.first,
      totalAfter: m.total,
      tracksAfter: current.map((t) => ({ ...t })),
      advice: fits ? stopReason(nextFits, gainTotal, threshold) : "time",
    };
    at = answer;
    return row;
  });
}

// ── A bank's view (a toy) ───────────────────────────────────────────────────

/** Σ amount × (rate − cost of the kind) ÷ 100, to the agora. The costs are an input: the course invents them. */
export function firstYearMargin(tracks: TrackSpec[], costs: Record<TrackKind, Numeric>): Decimal {
  return tracks
    .reduce((sum, t) => sum.plus(new Decimal(t.amount).mul(new Decimal(t.rate).minus(costs[t.kind])).div(100)), new Decimal(0))
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}
