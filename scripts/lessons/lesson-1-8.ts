/**
 * Lesson 1.8 — the pre-approval against the money: what binds the bank at each
 * moment. Every number the lesson and its exercises show is declared here as a
 * fact; the page reads data/lessons/1-8.json, and checks/kinds/process.py
 * recomputes every computed one.
 *
 * The rules (24 / 12 days, 5 / 7 business days) are NOT verified against
 * Directive 451 itself: they come from the team's transcription in the Brain
 * (J-060 page 5931054, J-070 page 5931117, research page 8290315; Aug 2026).
 * The dates are invented teaching dates in 2026.
 */
import { addCalendarDays, calendarDaysBetween, daysLeft } from "../../src/lib/calc/process.ts";
import type { Fact, LessonData } from "../build-data.ts";

const given = (id: string, value: string | number): Fact => ({ id, kind: "given", inputs: {}, value });

const calendarAfter = (id: string, start: string, days: number): Fact => ({
  id,
  kind: "proc_add_calendar_days",
  inputs: { start, days },
  value: addCalendarDays(start, days),
});

const between = (id: string, from: string, to: string): Fact => ({
  id,
  kind: "proc_calendar_days_between",
  inputs: { from, to },
  value: calendarDaysBetween(from, to),
});

const left = (id: string, window: number, used: number): Fact => ({
  id,
  kind: "proc_days_left",
  inputs: { window, used },
  value: daysLeft(window, used),
});

const ANSWER = 5;
const ANSWER_EXTENDED = 7;
const WINDOW = 24;
const WINDOW_NO_LIEN = 12;

export default function lesson18(): LessonData {
  const approved = "2026-10-14";
  const underwriting = "2026-11-03";
  const late = "2026-11-12";

  const facts: Fact[] = [
    given("data_date", "2026-10-09"),
    given("clock.answer", ANSWER),
    given("clock.answer_extended", ANSWER_EXTENDED),
    given("clock.window", WINDOW),
    given("clock.window_no_lien", WINDOW_NO_LIEN),
    // Eylon's figures from the 2026-07-27 call (field knowledge, FK-H-027): shown as a claim, not computed.
    given("claim.eylon_low", 28),
    given("claim.eylon_high", 30),
    given("claim.eylon_rates_months", 3),
    // Tobi Zamir, 2026-08-05 (FK-H-027): "תוקף 24 יום" — his figure, shown as his claim.
    given("claim.tobi_days", 24),

    // Worked example: נועם ושירה, בנק א׳ (the same dates as lesson 1.7).
    given("worked.approved", approved),
    calendarAfter("worked.window_end", approved, WINDOW),
    given("worked.underwriting", underwriting),
    between("worked.underwriting_day", approved, underwriting),
    left("worked.underwriting_left", WINDOW, calendarDaysBetween(approved, underwriting)),
    given("worked.late", late),
    between("worked.late_day", approved, late),

    // Exercise 2: approval on 2 November, 17 days used.
    given("ex2.used", 17),
    left("ex2.answer", WINDOW, 17),
    // Counting to day 25, the first day the bank is no longer bound: a window of 25.
    left("ex2.err_day_25", WINDOW + 1, 17),
    // Using the 12-day window: it closed already; a learner types 0.
    given("ex2.err_closed", 0),

    // Exercise 5: a refinance with no new lien, approval on Friday 23 October (the window crosses into November).
    given("ex5.approved", "2026-10-23"),
    calendarAfter("ex5.answer", "2026-10-23", WINDOW_NO_LIEN),
    calendarAfter("ex5.err_24", "2026-10-23", WINDOW),
    calendarAfter("ex5.err_day_one", "2026-10-23", WINDOW_NO_LIEN - 1),

    // Exercise 6: three banks, three approval dates, the same 24-day rule.
    given("ex6.bank_a", "2026-10-14"),
    given("ex6.bank_b", "2026-10-16"),
    given("ex6.bank_c", "2026-10-12"),
    calendarAfter("ex6.end_a", "2026-10-14", WINDOW),
    calendarAfter("ex6.end_b", "2026-10-16", WINDOW),
    calendarAfter("ex6.end_c", "2026-10-12", WINDOW),
    // Counting bank C's approval day as day 1.
    calendarAfter("ex6.err_day_one", "2026-10-12", WINDOW - 1),
  ];

  return {
    lesson: "1.8",
    title: "אישור עקרוני מול העמדת כסף",
    note: "Rules per the team's Brain transcription of Directive 451 (Aug 2026), not verified against the directive. Example dates are invented.",
    facts,
  };
}
