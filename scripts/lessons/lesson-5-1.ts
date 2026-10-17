/**
 * Lesson 5.1 — what is written in a pre-approval. The example document is the
 * (fictional) pre-approval of "בנק א׳" to דנה ויואב: a proposed mix of three
 * tracks, with every figure the directive's section 4ג(ב4) says an approval
 * shows — as the team transcribed it (Brain 7733250), not checked against the
 * directive. Every number the lesson, its exercises, its illustration and its
 * video show is declared here as a fact; checks/kinds/offers.py (the offer
 * measures) and checks/kinds/process.py (the dates) recompute them.
 *
 * Invented: the borrowers, the bank, its rates, the forecast (teaching path, not
 * the Bank of Israel's), the dates. דנה ויואב are not the case of נועם ושירה.
 */
import { addCalendarDays, daysLeft } from "../../src/lib/calc/process.ts";
import { BANKS, FORECASTS, FORECAST_A } from "../../src/data/offer-examples.ts";
import { type Offer } from "../../src/lib/calc/offers.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { above, difference, given, share } from "./lesson-3-8.ts";
import { measure, ratePath, trackRows } from "./_offer-facts.ts";

const calendarAfter = (id: string, start: string, days: number): Fact => ({
  id,
  kind: "proc_add_calendar_days",
  inputs: { start, days },
  value: addCalendarDays(start, days),
});

const left = (id: string, window: number, used: number): Fact => ({
  id,
  kind: "proc_days_left",
  inputs: { window, used },
  value: daysLeft(window, used),
});

/** The document's offer: bank א׳'s own proposed mix, with its opening fee as the up-front charge A. */
export const docOffer = (): Offer => ({ ...BANKS[0].proposed(FORECAST_A.id), upfront: "360.00" });

export default function lesson51(): LessonData {
  const offer = docOffer();
  const F = FORECASTS;
  const issued = "2026-10-05";

  const first = measure("doc.first", offer, F, "first");
  const highest = measure("doc.highest", offer, F, "highest");

  const facts: Fact[] = [
    given("data_date", "2026-10-16"),

    // ── The example document. ──
    given("doc.value", "1500000.00"),
    measure("doc.loan", offer, F, "loan"),
    given("doc.fee", "360.00"),
    measure("doc.received", offer, F, "received"),
    given("doc.issued", issued),
    given("clock.window", 24),
    given("clock.window_no_lien", 12),
    calendarAfter("doc.valid_until", issued, 24),
    calendarAfter("doc.valid_until_no_lien", issued, 12),
    trackRows("doc.tracks", offer, F),
    // The prime track's rate year by year, as the (illustrative) forecast puts it: the document shows only the first.
    ratePath("doc.prime_path", offer, F, 1, 4),
    first,
    highest,
    measure("doc.highest_month", offer, F, "highest_month"),
    measure("doc.total", offer, F, "total"),
    measure("doc.rate", offer, F, "rate", 2),
    measure("doc.rate_4", offer, F, "rate", 4),
    difference("doc.gap", highest, first),
    above("doc.above", highest, first, 1),

    // ── Exercises. ──
    // 2: nine days of the 24 are gone.
    given("ex2.used", 9),
    left("ex2.answer", 24, 9),
    left("ex2.err_no_lien", 12, 9),
    left("ex2.err_next_day", 24, 10),
    // 3: the three tracks' first payments (the document shows each) and what the "first payment" line is.
    // (the answer is the document's first payment: month 1 of the mix is the three tracks' month 1 added.)
    // 4: the highest above the first, in percent; Mogi highlights from 10% (lesson 3.8).
    given("ex4.highlight", 10),
    // The common slip: the gap as a share of the highest instead of the first.
    share("ex4.err_of_highest", difference("doc.gap", highest, first), highest, 1),
    // 6: a pre-approval's terms hold at least 24 days from issue; a second bank's pre-approval issued two days later.
    given("ex6.second_issued", "2026-10-07"),
    calendarAfter("ex6.second_until", "2026-10-07", 24),
  ];

  return {
    lesson: "5.1",
    title: "מה כתוב באישור העקרוני",
    note: "A fictional pre-approval of בנק א׳ for דנה ויואב: invented rates, an invented forecast (not the Bank of Israel's), an invented opening fee as the up-front charge A (which charges count is an open legal question). Figures follow the team's transcription of Directive 451 section 4ג(ב4) and appendix 4, not checked against the directive. Schedules follow the statement convention (agorot, the last payment closes the balance); the IRR is found by bisection (TypeScript) and by Newton's method (Python).",
    facts,
  };
}
