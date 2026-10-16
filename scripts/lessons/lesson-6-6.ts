/**
 * Lesson 6.6 — going to the banks: whom, in what order, and against which clocks. Every number the page,
 * the exercises and the video show is declared here as a fact; the page reads data/lessons/6-6.json and
 * checks/kinds/outreach.py recomputes every computed one.
 *
 * WHAT IS A RULE AND WHAT IS AN EXERCISE'S ASSUMPTION
 *   - 5 business days (7) to answer, 24 calendar days (12 with no new lien) of terms from the approval:
 *     the team's transcription of Directive 451 in the Brain (J-050, J-060, J-070), not checked
 *     against the directive.
 *   - How long a re-pricing round takes (3 business days) and how many days must stay after its answer
 *     (7): RULES OF THE EXERCISE. No deadline for a re-pricing answer is known (Brain J-100).
 *   - The Bank of Israel decision dates are lesson 0.10's (search-index summaries, not verified).
 *   - The four banks, their answer times and every date are invented teaching data.
 */
import { CASE_A, INITIAL_MIX, SCENARIOS } from "../../src/data/case-a-mix.ts";
import { ROUND_RULE } from "../../src/data/case-a-offers.ts";
import { ANSWER_DAYS, ANSWER_DAYS_EXTENDED, bankClocks, type BankRequest, roundAnswer, WINDOW_DAYS, WINDOW_DAYS_NO_LIEN } from "../../src/lib/calc/outreach.ts";
import { addCalendarDays, CALENDAR_2026, calendarDaysBetween } from "../../src/lib/calc/process.ts";
import type { Fact, LessonData } from "../build-data.ts";
import {
  clocksFact,
  daysUntilFact,
  effectFact,
  eventsInsideFact,
  given,
  governingFact,
  latestStartFact,
  roundAnswerFact,
  roundFitsFact,
  roundsFitFact,
  simpleMonthlyFact,
} from "./_outreach-facts.ts";
import lesson010 from "./lesson-0-10.ts";

const cal = CALENDAR_2026;
const { roundDays, reserve } = ROUND_RULE;
const addDays = (id: string, start: string, days: number): Fact => ({ id, kind: "proc_add_calendar_days", inputs: { start, days }, value: addCalendarDays(start, days) });

export default function lesson66(): LessonData {
  const decisions = (lesson010().facts.find((f) => f.id === "decision.upcoming")?.value ?? []) as string[];
  if (decisions.length < 2) throw new Error("lesson 0.10 no longer lists two upcoming decisions");

  const facts: Fact[] = [
    given("data_date", "2026-10-16"),
    given("clock.answer", ANSWER_DAYS),
    given("clock.answer_extended", ANSWER_DAYS_EXTENDED),
    given("clock.window", WINDOW_DAYS),
    given("clock.window_no_lien", WINDOW_DAYS_NO_LIEN),
    given("round.days", roundDays),
    given("round.reserve", reserve),
    given("decision.1", decisions[0]),
    given("decision.2", decisions[1]),
    given("calendar.closed_2026", cal.closed.join(",")),
  ];

  // ── Worked example: case A, four requests sent the same day ────────────────────────────────────────────
  const request = "2026-11-01";
  const today = "2026-11-09";
  const banks: { id: string; name: string; after: number; extended?: boolean; newLien: boolean }[] = [
    { id: "a", name: "בנק א׳", after: 2, newLien: true },
    { id: "b", name: "בנק ב׳", after: 4, newLien: true },
    { id: "c", name: "בנק ג׳", after: 5, newLien: true },
    { id: "d", name: "בנק ד׳", after: 7, extended: true, newLien: true },
  ];
  facts.push(given("worked.request", request), given("worked.today", today));
  const clocks = banks.map((b) => {
    const r: BankRequest = { name: b.name, requested: request, answeredAfter: b.after, extended: b.extended, newLien: b.newLien };
    facts.push(
      given(`worked.${b.id}.after`, b.after),
      clocksFact(`worked.${b.id}.answer_by`, r, cal, "answer_by"),
      clocksFact(`worked.${b.id}.approved`, r, cal, "approved"),
      clocksFact(`worked.${b.id}.valid_until`, r, cal, "valid_until"),
    );
    const c = bankClocks(r, cal);
    facts.push(daysUntilFact(`worked.${b.id}.left`, today, c.validUntil));
    return c;
  });
  facts.push(governingFact("worked.governing", clocks));
  const gov = clocks.reduce((best, c) => (c.validUntil < best.validUntil ? c : best), clocks[0]);
  facts.push(
    daysUntilFact("worked.governing_left", today, gov.validUntil),
    eventsInsideFact("worked.decision_inside", [decisions[0], decisions[1]], today, gov.validUntil),
    daysUntilFact("worked.decision_in", today, decisions[1]),
  );
  // The request-to-approval gap: the slowest bank's answer day, counted from the request.
  facts.push(daysUntilFact("worked.d_wait", request, clocks[3].approved), daysUntilFact("worked.a_wait", request, clocks[0].approved));

  // Rounds against the governing bank's clock, one after another.
  let at = today;
  for (let k = 1; k <= 4; k++) {
    facts.push(roundFitsFact(`worked.round_${k}.fits`, at, gov.validUntil, roundDays, reserve, cal), roundAnswerFact(`worked.round_${k}.answer`, at, roundDays, cal));
    // The next round starts the day this answer arrives.
    at = roundAnswer(at, roundDays, cal);
  }
  facts.push(
    roundsFitFact("worked.rounds_count", today, gov.validUntil, roundDays, reserve, cal, "count"),
    roundsFitFact("worked.rounds_last_answer", today, gov.validUntil, roundDays, reserve, cal, "last_answer"),
    latestStartFact("worked.latest_start", gov.validUntil, roundDays, reserve, today, cal),
    // The slowest bank's clock holds more rounds.
    roundsFitFact("worked.d_rounds_count", today, clocks[3].validUntil, roundDays, reserve, cal, "count"),
  );

  // ── A rate that moves while waiting: case A's mix (the family's request), at bank א׳'s prices ───────────
  const mix = INITIAL_MIX;
  const sc = SCENARIOS.base;
  facts.push(
    effectFact("rate.first", mix, sc, { target: "prime", points: "0" }, "first_before"),
    effectFact("rate.up.first", mix, sc, { target: "prime", points: "0.25" }, "first_delta"),
    effectFact("rate.up.after", mix, sc, { target: "prime", points: "0.25" }, "first_after"),
    effectFact("rate.up.total", mix, sc, { target: "prime", points: "0.25" }, "total_delta"),
    effectFact("rate.down.first", mix, sc, { target: "prime", points: "-0.25" }, "first_delta"),
    effectFact("rate.down.total", mix, sc, { target: "prime", points: "-0.25" }, "total_delta"),
    given("rate.points", "0.25"),
    given("rate.prime_amount", mix[0].amount),
    given("rate.prime_rate", mix[0].rate),
    given("rate.prime_months", mix[0].months),
    // After the terms lapse a fixed rate may come back different: a teaching +0.20, not a forecast.
    given("lapse.points", "0.20"),
    effectFact("lapse.first", mix, sc, { target: "fixed_unlinked", points: "0.20" }, "first_delta"),
    effectFact("lapse.total", mix, sc, { target: "fixed_unlinked", points: "0.20" }, "total_delta"),
    given("case.loan", CASE_A.loan),
  );

  // ── Exercise 2: the validity clock from the bank's own approval ───────────────────────────────────────
  const ex2: BankRequest = { name: "בנק ב׳", requested: "2026-11-12", answeredAfter: 3, newLien: true };
  facts.push(
    given("ex2.requested", ex2.requested),
    given("ex2.after", ex2.answeredAfter),
    clocksFact("ex2.approved", ex2, cal, "approved"),
    clocksFact("ex2.answer", ex2, cal, "valid_until"),
    // From the request, not from the approval.
    addDays("ex2.err_request", ex2.requested, WINDOW_DAYS),
    // The no-new-lien window, which does not apply here.
    addDays("ex2.err_short", bankClocks(ex2, cal).approved, WINDOW_DAYS_NO_LIEN),
    // The approval day counted as day 1.
    addDays("ex2.err_day_one", bankClocks(ex2, cal).approved, WINDOW_DAYS - 1),
  );

  // ── Exercise 3: the clock that ends first (one of the three is a refinance with no new lien) ──────────
  const ex3: { id: string; name: string; after: number; newLien: boolean }[] = [
    { id: "a", name: "בנק א׳", after: 2, newLien: true },
    { id: "b", name: "בנק ב׳", after: 4, newLien: false },
    { id: "c", name: "בנק ג׳", after: 5, newLien: true },
  ];
  const ex3Clocks = ex3.map((b) => {
    const r: BankRequest = { name: b.name, requested: request, answeredAfter: b.after, newLien: b.newLien };
    facts.push(given(`ex3.${b.id}.after`, b.after), clocksFact(`ex3.${b.id}.approved`, r, cal, "approved"), clocksFact(`ex3.${b.id}.valid_until`, r, cal, "valid_until"));
    return bankClocks(r, cal);
  });
  facts.push(governingFact("ex3.governing", ex3Clocks));
  const ex3Gov = ex3Clocks.reduce((best, c) => (c.validUntil < best.validUntil ? c : best), ex3Clocks[0]);
  facts.push(
    daysUntilFact("ex3.answer", today, ex3Gov.validUntil),
    // The first bank to approve, taken as the first to end.
    daysUntilFact("ex3.err_first", today, ex3Clocks[0].validUntil),
    // The last bank to approve, taken as the one that decides.
    daysUntilFact("ex3.err_last", today, ex3Clocks[2].validUntil),
  );

  // ── Exercise 5: how many rounds fit ───────────────────────────────────────────────────────────────────
  const ex5Start = "2026-11-10";
  const ex5End = "2026-11-26";
  facts.push(
    given("ex5.start", ex5Start),
    given("ex5.end", ex5End),
    roundsFitFact("ex5.answer", ex5Start, ex5End, roundDays, reserve, cal, "count"),
    roundsFitFact("ex5.err_no_reserve", ex5Start, ex5End, roundDays, 0, cal, "count"),
    daysUntilFact("ex5.days", ex5Start, ex5End),
  );

  // ── Exercise 6: the latest day to start a round ───────────────────────────────────────────────────────
  facts.push(
    given("ex6.end", gov.validUntil),
    latestStartFact("ex6.answer", gov.validUntil, roundDays, reserve, today, cal),
    latestStartFact("ex6.err_no_reserve", gov.validUntil, roundDays, 0, today, cal),
    // The last day of the terms itself.
    given("ex6.err_last_day", gov.validUntil),
  );

  // ── Exercise 7: what a quarter-point on prime costs each month ────────────────────────────────────────
  facts.push(simpleMonthlyFact("ex7.err_simple", mix[0].amount as string, "0.25"));

  // The span of the whole wait, for the page's sentence on how long the slowest bank took.
  facts.push({ id: "worked.span", kind: "proc_calendar_days_between", inputs: { from: request, to: today }, value: calendarDaysBetween(request, today) });

  return {
    lesson: "6.6",
    title: "אסטרטגיית הפנייה לבנקים",
    note: "The 5/7 business-day and 24/12 calendar-day rules are the Brain's transcription of Directive 451, not verified against it. The round rule (3 business days, 7 reserve days) is the exercise's own. All four banks and all dates are invented.",
    facts,
  };
}
