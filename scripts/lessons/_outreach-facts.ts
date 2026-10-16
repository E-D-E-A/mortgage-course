/**
 * Fact builders shared by lessons 6.6, 6.7 and 6.8 (stage-6 author C). Each builder computes its value with
 * src/lib/calc/outreach.ts and names a kind that checks/kinds/outreach.py recomputes on its own. Not a
 * lesson module: build-data.ts loads only lesson-*.ts and check-*.ts.
 *
 * The mix facts (a payment, a total, a ratio under a scenario) are sensitivity.ts's: this file re-exports
 * mixFact and difference from _sensitivity-facts.ts so a lesson imports one helper.
 */
import Decimal from "decimal.js";
import { moneyString } from "../../src/lib/calc/money.ts";
import {
  type BankClocks,
  type BankRequest,
  bankClocks,
  daysUntil,
  effectOf,
  eventsInside,
  firstYearMargin,
  governingIndex,
  latestRoundStart,
  type MixEdit,
  roundAnswer,
  roundFits,
  roundsThatFit,
  simpleMonthly,
  stopReason,
} from "../../src/lib/calc/outreach.ts";
import type { BankCalendar } from "../../src/lib/calc/process.ts";
import { mixInputs, type TrackKind, type TrackSpec } from "../../src/lib/calc/schedule.ts";
import { type ScenarioSpec, scenarioFrom } from "../../src/lib/calc/sensitivity.ts";
import type { Fact } from "../build-data.ts";

export { difference, given, givenMoney, mixFact, leverFact, type Mix } from "./_sensitivity-facts.ts";

const yes = (b: boolean | undefined) => (b ? "yes" : "no");
export const calInputs = (cal: BankCalendar) => ({ closed: cal.closed.join(","), friday_counts: yes(cal.fridayCounts) });

export type ClockMeasure = "answer_by" | "approved" | "valid_until" | "window_days";

/** One bank's date by `measure` (kind out_clocks). */
export const clocksFact = (id: string, r: BankRequest, cal: BankCalendar, measure: ClockMeasure): Fact => {
  const c = bankClocks(r, cal);
  const value = measure === "answer_by" ? c.answerBy : measure === "approved" ? c.approved : measure === "valid_until" ? c.validUntil : c.windowDays;
  return {
    id,
    kind: "out_clocks",
    inputs: { requested: r.requested, answered_after: r.answeredAfter, extended: yes(r.extended), new_lien: yes(r.newLien), ...calInputs(cal), measure },
    value,
  };
};

/** The bank whose terms end first (kind out_governing). */
export const governingFact = (id: string, clocks: BankClocks[]): Fact => ({
  id,
  kind: "out_governing",
  inputs: { names: clocks.map((c) => c.name).join("|"), ends: clocks.map((c) => c.validUntil).join("|") },
  value: clocks[governingIndex(clocks)].name,
});

export const daysUntilFact = (id: string, today: string, date: string): Fact => ({ id, kind: "out_days_until", inputs: { today, date }, value: daysUntil(today, date) });

export const roundAnswerFact = (id: string, start: string, roundDays: number, cal: BankCalendar): Fact => ({
  id,
  kind: "out_round_answer",
  inputs: { start, round_days: roundDays, ...calInputs(cal) },
  value: roundAnswer(start, roundDays, cal),
});

export const roundFitsFact = (id: string, start: string, validUntil: string, roundDays: number, reserve: number, cal: BankCalendar): Fact => ({
  id,
  kind: "out_round_fits",
  inputs: { start, valid_until: validUntil, round_days: roundDays, reserve, ...calInputs(cal) },
  value: yes(roundFits(start, validUntil, roundDays, reserve, cal)),
});

export const roundsFitFact = (id: string, start: string, validUntil: string, roundDays: number, reserve: number, cal: BankCalendar, measure: "count" | "last_start" | "last_answer"): Fact => {
  const rounds = roundsThatFit(start, validUntil, roundDays, reserve, cal);
  const last = rounds[rounds.length - 1];
  const value = measure === "count" ? rounds.length : !last ? "none" : measure === "last_start" ? last.start : last.answer;
  return { id, kind: "out_rounds_fit", inputs: { start, valid_until: validUntil, round_days: roundDays, reserve, ...calInputs(cal), measure }, value };
};

export const latestStartFact = (id: string, validUntil: string, roundDays: number, reserve: number, notBefore: string, cal: BankCalendar): Fact => ({
  id,
  kind: "out_latest_start",
  inputs: { valid_until: validUntil, round_days: roundDays, reserve, not_before: notBefore, ...calInputs(cal) },
  value: latestRoundStart(validUntil, roundDays, reserve, notBefore, cal) ?? "none",
});

export const eventsInsideFact = (id: string, dates: string[], from: string, to: string): Fact => ({
  id,
  kind: "out_events_inside",
  inputs: { dates: dates.join("|"), from, to },
  value: eventsInside(dates, from, to).length,
});

export type EffectMeasure = "first_before" | "first_after" | "first_delta" | "total_before" | "total_after" | "total_delta";

/** A mix's first payment or total before / after an edit to some rates (kind out_effect). */
export const effectFact = (id: string, tracks: TrackSpec[], scenario: ScenarioSpec, edit: MixEdit, measure: EffectMeasure): Fact => {
  const sc = scenarioFrom(scenario);
  const e = effectOf(tracks, sc, edit);
  const value = {
    first_before: e.before.first,
    first_after: e.after.first,
    first_delta: e.deltaFirst,
    total_before: e.before.total,
    total_after: e.after.total,
    total_delta: e.deltaTotal,
  }[measure];
  return { id, kind: "out_effect", inputs: { ...mixInputs(tracks, sc), edit_target: String(edit.target), edit_points: String(edit.points), measure }, value: moneyString(value) };
};

export const simpleMonthlyFact = (id: string, amount: string, points: string): Fact => ({
  id,
  kind: "out_simple_monthly",
  inputs: { amount, points },
  value: moneyString(simpleMonthly(amount, points)),
});

export const stopFact = (id: string, fits: boolean, lastGain: string, threshold: string): Fact => ({
  id,
  kind: "out_stop",
  inputs: { fits: yes(fits), last_gain: lastGain, threshold },
  value: stopReason(fits, lastGain, threshold),
});

export const marginFact = (id: string, tracks: TrackSpec[], costs: Record<TrackKind, string>): Fact => ({
  id,
  kind: "out_margin",
  inputs: { ...mixInputs(tracks), ...Object.fromEntries(Object.entries(costs).map(([k, v]) => [`cost_${k}`, v])) },
  value: moneyString(firstYearMargin(tracks, costs)),
});

export const asDecimal = (x: unknown) => new Decimal(String(x));
