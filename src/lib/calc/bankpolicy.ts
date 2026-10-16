/**
 * A bank's invented policy, applied to a file — the arithmetic behind lessons 6.9 (a day as an
 * underwriter), 6.10 (the conversation tree) and 6.11 (the positioning plan of case A). Stage-6
 * author D.
 *
 * ── What this is, and what it is not ─────────────────────────────────────
 *
 * The rules in this file are the EXERCISE'S rules, invented for fictional banks ("בנק א׳" … "בנק ד׳").
 * Nothing here says how a real bank decides or prices: how banks really weigh the ratio, the
 * financing ratio and the rest is not known to the course (field knowledge FK-H-050…055, awaiting
 * Eylon). A lesson that shows these rules says so on the page, next to the rules.
 *
 * ── The rules (the exercise's) ───────────────────────────────────────────
 *
 * A bank has a PRICE LIST: one rate for each kind of track (stage 6's four banks use
 * src/data/case-a-offers.ts's, the prices of lessons 6.6–6.8). The list is the price of a file that
 * sits above the bank's good-file lines. A policy has two lines, one on the payment-to-income ratio
 * and one on the financing ratio. Each line has a REFUSAL point and, optionally, a RELIEF point:
 *
 *   actual above the refusal point          →  the bank refuses
 *   actual not above the relief point       →  the bank approves, and takes `reliefPoints`
 *                                              percentage points off the rate of EVERY track
 *   otherwise                               →  the list price, on that line
 *
 * "Above" is strict, the convention of regulation.ts and positioning.ts: exactly on a line has not
 * crossed it, so a file exactly on a relief line gets the relief. Both lines are read on exact
 * numbers, never on the rounded ones the page prints, and a lesson never builds a file whose number
 * is within a hundredth of a line (the independent check reads the numbers as the page shows them).
 *
 * The ratio is measured at the bank's LIST rates, before any relief: the payment the bank checks is
 * each track's first payment on its full amount (affordability.ts's qualifying payment, lesson 4.3),
 * over the disposable income (obligations that count under the 18-month rule are deducted, lesson
 * 4.2). The relief then lowers the rates the family would pay; it does not feed back into the ratio
 * (a simplification of the exercise, stated on the page).
 *
 * ── The API ──────────────────────────────────────────────────────────────
 *
 *   BankPolicy {id, name, prices, ratioMax, ratioReliefLine, ratioReliefPoints, ltvMax, ltvReliefLine, ltvReliefPoints}
 *   LoanFile   {value, income, obligations, tracks: {kind, amount, months}[]}
 *   listTracks(policy, tracks)      the file's tracks at the bank's list rates (schedule.ts TrackSpec)
 *   evaluate(policy, file)          the Verdict: loan, financing ratio, disposable income, list payment,
 *                                   ratio, one LineVerdict per line, the decision, the relief, the
 *                                   tracks at the list rates and at the final rates
 *   reasonLines(verdict)            the lines that refused, or the lines that gave relief
 *
 * Money is Decimal, exact. Percents are strings or Decimals ("40"). Recomputed independently in
 * checks/kinds/bankpolicy.py. Exports are stable: add, don't rename.
 */
import Decimal from "decimal.js";
import { disposableIncome, type Obligation, paymentToIncome } from "./affordability.ts";
import { ltvPercentOf } from "./regulation.ts";
import type { TrackKind, TrackSpec } from "./schedule.ts";
import { loanOf, qualifyingTotal } from "./sensitivity.ts";

export type Numeric = Decimal.Value;

export interface BankPolicy {
  id: string;
  /** "בנק א׳" … */
  name: string;
  /** The bank's list rate for each kind of track, percent a year. */
  prices: Record<TrackKind, string>;
  /** The bank refuses when the ratio is above this percent. */
  ratioMax: string;
  /** At or below this percent the bank takes `ratioReliefPoints` off every track; null: no relief on this line. */
  ratioReliefLine: string | null;
  ratioReliefPoints: string;
  /** The bank refuses when the financing ratio is above this percent. */
  ltvMax: string;
  ltvReliefLine: string | null;
  ltvReliefPoints: string;
}

/** A track as a client asks for it: no rate (the bank prices it). */
export interface RequestedTrack {
  kind: TrackKind;
  amount: Numeric;
  months: number;
}

export interface LoanFile {
  /** The property's value the financing ratio is measured against. */
  value: Numeric;
  /** The recognised monthly income. */
  income: Numeric;
  obligations: Obligation[];
  tracks: RequestedTrack[];
}

export type LineId = "ratio" | "ltv";
export type LineOutcome = "refuse" | "relief" | "clear";

export interface LineVerdict {
  id: LineId;
  /** Exact, percent. */
  actual: Decimal;
  max: string;
  reliefLine: string | null;
  reliefPoints: string;
  outcome: LineOutcome;
}

export interface Verdict {
  loan: Decimal;
  ltv: Decimal;
  disposable: Decimal;
  /** The payment the ratio uses, at the bank's list rates. Exact. */
  listPayment: Decimal;
  ratio: Decimal;
  lines: LineVerdict[];
  decision: "approve" | "refuse";
  /** Percentage points the relief takes off every track (0 when none, and when the bank refuses nothing is priced). */
  relief: Decimal;
  listTracks: TrackSpec[];
  finalTracks: TrackSpec[];
}

/** The file's tracks at the bank's list rates. */
export function listTracks(policy: BankPolicy, tracks: RequestedTrack[]): TrackSpec[] {
  return tracks.map((t) => ({ kind: t.kind, amount: new Decimal(t.amount).toFixed(2), rate: policy.prices[t.kind], months: t.months }));
}

function lineOutcome(actual: Decimal, max: string, reliefLine: string | null): LineOutcome {
  if (actual.gt(max)) return "refuse";
  if (reliefLine !== null && actual.lte(reliefLine)) return "relief";
  return "clear";
}

export function evaluate(policy: BankPolicy, file: LoanFile): Verdict {
  const listed = listTracks(policy, file.tracks);
  const loan = loanOf(listed);
  const ltv = ltvPercentOf(loan, file.value);
  const disposable = disposableIncome(file.income, file.obligations);
  const listPayment = qualifyingTotal(listed);
  const ratio = paymentToIncome(listPayment, disposable);
  const lines: LineVerdict[] = [
    { id: "ratio", actual: ratio, max: policy.ratioMax, reliefLine: policy.ratioReliefLine, reliefPoints: policy.ratioReliefPoints, outcome: lineOutcome(ratio, policy.ratioMax, policy.ratioReliefLine) },
    { id: "ltv", actual: ltv, max: policy.ltvMax, reliefLine: policy.ltvReliefLine, reliefPoints: policy.ltvReliefPoints, outcome: lineOutcome(ltv, policy.ltvMax, policy.ltvReliefLine) },
  ];
  const decision = lines.some((l) => l.outcome === "refuse") ? "refuse" : "approve";
  const relief = decision === "refuse" ? new Decimal(0) : lines.filter((l) => l.outcome === "relief").reduce((s, l) => s.plus(l.reliefPoints), new Decimal(0));
  const finalTracks = listed.map((t) => ({ ...t, rate: new Decimal(t.rate).minus(relief).toFixed(2) }));
  return { loan, ltv, disposable, listPayment, ratio, lines, decision, relief, listTracks: listed, finalTracks };
}

/** The reasons the bank gives, in the order of the lines: the lines that refused, or the lines that gave relief. */
export function reasonLines(v: Verdict): LineVerdict[] {
  return v.decision === "refuse" ? v.lines.filter((l) => l.outcome === "refuse") : v.lines.filter((l) => l.outcome === "relief");
}
