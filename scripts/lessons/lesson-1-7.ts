/**
 * Lesson 1.7 — the process end to end, and its clocks. Every number the lesson,
 * its exercises, its illustration and its video show is declared here as a fact;
 * the page and the video read data/lessons/1-7.json, and checks/kinds/process.py
 * recomputes every computed one.
 *
 * The clocks (5 / 7 business days, 24 / 12 days, 90 days) are NOT verified
 * against Directive 451 itself: they come from the team's transcription in the
 * Brain (J-050 page 5898285, J-060 page 5931054, J-140 page 8716324, research
 * page 8290315; all Aug 2026). The official site is blocked in this
 * environment. The dates in the examples are invented teaching dates in
 * 2026; which days are banking business days follows the Brain's 2026 table
 * (page 8650753), with Friday counted as a short business day (a course
 * assumption, shown as such in the lesson).
 */
import {
  CALENDAR_2026,
  CLOSED_2026,
  addBusinessDays,
  addCalendarDays,
  businessDaysBetween,
  calendarDaysBetween,
  dayList,
  daysLeft,
  type BankCalendar,
} from "../../src/lib/calc/process.ts";
import type { Fact, LessonData } from "../build-data.ts";

const given = (id: string, value: string | number): Fact => ({ id, kind: "given", inputs: {}, value });

const NO_FRIDAY: BankCalendar = { ...CALENDAR_2026, fridayCounts: false };
const NO_HOLIDAYS: BankCalendar = { fridayCounts: true, closed: [] };
const inputsOf = (cal: BankCalendar) => ({ friday_counts: cal.fridayCounts ? "yes" : "no", closed: cal.closed.join(",") });

const businessAfter = (id: string, start: string, days: number, cal: BankCalendar = CALENDAR_2026): Fact => ({
  id,
  kind: "proc_add_business_days",
  inputs: { start, days, ...inputsOf(cal) },
  value: addBusinessDays(start, days, cal),
});

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

const businessBetween = (id: string, from: string, to: string, cal: BankCalendar = CALENDAR_2026): Fact => ({
  id,
  kind: "proc_business_days_between",
  inputs: { from, to, ...inputsOf(cal) },
  value: businessDaysBetween(from, to, cal),
});

const left = (id: string, window: number, used: number): Fact => ({
  id,
  kind: "proc_days_left",
  inputs: { window, used },
  value: daysLeft(window, used),
});

/** A table of events after an approval: days since it, and days left of the window. */
const windowTable = (id: string, start: string, window: number, events: [string, string][]): Fact => ({
  id,
  kind: "proc_window_table",
  inputs: {
    start,
    window,
    ...Object.fromEntries(events.flatMap(([event, date], n) => [[`event_${n + 1}`, event], [`date_${n + 1}`, date]])),
  },
  value: events.map(([event, date], n) => {
    const used = calendarDaysBetween(start, date);
    return { period: n + 1, event, date, days: used, left: daysLeft(window, used) };
  }),
});

// The clocks, as transcribed in the Brain (not verified against the directive).
const ANSWER = 5;
const ANSWER_EXTENDED = 7;
const WINDOW = 24;
const WINDOW_NO_LIEN = 12;
const APPRAISAL = 90;

export default function lesson17(): LessonData {
  // Worked example: נועם ושירה (the course's synthetic case), בנק א׳.
  const sent = "2026-10-11"; // a Sunday
  const approved = "2026-10-14";
  const appraisal = "2026-10-20";
  const signing = "2026-11-05";
  const used = calendarDaysBetween(approved, signing);

  const facts: Fact[] = [
    given("data_date", "2026-10-09"),
    given("steps.count", 12),
    given("clock.answer", ANSWER),
    given("clock.answer_extended", ANSWER_EXTENDED),
    given("clock.window", WINDOW),
    given("clock.window_no_lien", WINDOW_NO_LIEN),
    given("clock.appraisal", APPRAISAL),
    given("calendar.closed_2026", CLOSED_2026.join(",")),
    // An unattributed claim from the founders' meeting of 2026-10-01 (field knowledge, FK-H-079): shown as a claim.
    given("claim.fast_days", 21),
    // Eylon on appraisal validity (FK-H-037: 12–14 months, 2026-07-27; FK-H-038: 3 months between banks, 2026-08-05): claims, not rules.
    given("claim.appraisal_low_months", 12),
    given("claim.appraisal_high_months", 14),
    given("claim.appraisal_between_banks_months", 3),
    // From the Brain's banking calendar (page 8650753): a short day ends at 14:00; Yom Kippur eve and Yom Kippur 2026.
    given("calendar.short_day_end", "14:00"),
    given("calendar.yk_eve", "2026-09-20"),
    given("calendar.yk", "2026-09-21"),

    given("worked.sent", sent),
    businessAfter("worked.answer_by", sent, ANSWER),
    businessAfter("worked.answer_by_no_friday", sent, ANSWER, NO_FRIDAY),
    businessAfter("worked.answer_by_7", sent, ANSWER_EXTENDED),
    given("worked.approved", approved),
    businessBetween("worked.answered_after", sent, approved),
    calendarAfter("worked.window_end", approved, WINDOW),
    calendarAfter("worked.window_end_no_lien", approved, WINDOW_NO_LIEN),
    given("worked.appraisal", appraisal),
    calendarAfter("worked.appraisal_end", appraisal, APPRAISAL),
    given("worked.signing", signing),
    between("worked.used", approved, signing),
    left("worked.left", WINDOW, used),

    // For the video: the days after the request and after the approval, marked business or not.
    { id: "video.week", kind: "proc_day_list", inputs: { start: sent, days: 7, ...inputsOf(CALENDAR_2026) }, value: dayList(sent, 7, CALENDAR_2026) },
    { id: "video.window", kind: "proc_day_list", inputs: { start: approved, days: WINDOW, ...inputsOf(CALENDAR_2026) }, value: dayList(approved, WINDOW, CALENDAR_2026) },

    windowTable("half.table", approved, WINDOW, [
      ["האישור הגיע", approved],
      ["ההצעות הגיעו", "2026-10-21"],
      ["התיק נפתח", "2026-10-26"],
      ["השמאי ביקר", "2026-10-29"],
      ["החתימה נקבעה", signing],
    ]),

    // Exercise 2: an approval on Monday 2 November; the 24-day window.
    given("ex2.approved", "2026-11-02"),
    calendarAfter("ex2.answer", "2026-11-02", WINDOW),
    calendarAfter("ex2.err_day_one", "2026-11-02", WINDOW - 1),
    calendarAfter("ex2.err_twelve", "2026-11-02", WINDOW_NO_LIEN),

    // Exercise 3: a request sent on Thursday 22 October.
    given("ex3.sent", "2026-10-22"),
    businessAfter("ex3.answer", "2026-10-22", ANSWER),
    businessAfter("ex3.err_no_friday", "2026-10-22", ANSWER, NO_FRIDAY),
    // Counting the sending day itself as day 1 = counting from the day before it.
    businessAfter("ex3.err_day_one", "2026-10-21", ANSWER),
    calendarAfter("ex3.err_calendar", "2026-10-22", ANSWER),

    // Exercise 4: a refinance with no new lien, approval on Monday 9 November.
    given("ex4.approved", "2026-11-09"),
    calendarAfter("ex4.answer", "2026-11-09", WINDOW_NO_LIEN),
    calendarAfter("ex4.err_day_one", "2026-11-09", WINDOW_NO_LIEN - 1),
    calendarAfter("ex4.err_24", "2026-11-09", WINDOW),

    // Exercise 5: an appraisal from 1 September, used at a second bank on 15 November.
    given("ex5.appraisal", "2026-09-01"),
    given("ex5.second_bank", "2026-11-15"),
    between("ex5.answer", "2026-09-01", "2026-11-15"),
    // Counting both the first and the last day = counting from the day before.
    between("ex5.err_both_ends", "2026-08-31", "2026-11-15"),
    calendarAfter("ex5.last_day", "2026-09-01", APPRAISAL),

    // Exercise 6: a request sent on Thursday 17 September, before Yom Kippur.
    given("ex6.sent", "2026-09-17"),
    businessAfter("ex6.answer", "2026-09-17", ANSWER),
    businessAfter("ex6.err_no_friday", "2026-09-17", ANSWER, NO_FRIDAY),
    businessAfter("ex6.err_no_holidays", "2026-09-17", ANSWER, NO_HOLIDAYS),
    calendarAfter("ex6.err_calendar", "2026-09-17", ANSWER),
  ];

  return {
    lesson: "1.7",
    title: "התהליך מקצה לקצה",
    note: "Clocks per the team's Brain transcription of Directive 451 (Aug 2026), not verified against the directive. Example dates are invented; banking days per the Brain's 2026 table, Friday counted (course assumption).",
    facts,
  };
}
