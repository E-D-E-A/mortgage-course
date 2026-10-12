/**
 * Lesson 4.8 — credit data and the account's conduct. Every number the page, the
 * exercises and the video show is a fact here; checks/kinds/underwriting.py
 * recomputes every computed one.
 *
 * Case B (אבי and מיכל). The three-month statement of their joint current
 * account is INVENTED for teaching: אבי's business deposits average 7,500 a
 * month (lesson 4.1's recognised income), מיכל's deposits are her net-to-pay
 * from lesson 4.1's three payslips (7,700, 7,750, 7,800). No real account.
 *
 * What is NOT here, on purpose: what in a credit report disqualifies or makes a
 * loan dearer, how many months back a bank reads an account, what in an account
 * counts against a borrower. No source says; the lesson says so.
 *
 * Rules, none verified against the source document: a credit report or
 * indication is "not up to date" 60 days after it is received (search summary of
 * the Credit Data Law, 2026-10-10, and the team's Brain 6455298).
 */
import type { LessonData } from "../build-data.ts";
import {
  addDays,
  daysBetween,
  difference,
  given,
  mean,
  statementTable,
  sum,
} from "./_underwriting-facts.ts";

const MONTHS = [
  { month: "יולי", avi: "9000", michal: "7700", debits: "15900" },
  { month: "אוגוסט", avi: "6200", michal: "7750", debits: "15200" },
  { month: "ספטמבר", avi: "7300", michal: "7800", debits: "14800" },
];

export default function lesson48(): LessonData {
  const facts = [
    given("data_date", "2026-10-12"),
    given("rule.stale_days", 60),
    given("rule.report_years", 3),
    given("rule.free_reports_per_year", 1),
    // The Check Law summary (search, 2026-10-10; not verified): ten refused cheques in twelve months restrict an account for a year; a warning after five.
    given("rule.cheques_limit", 10),
    given("rule.cheques_months", 12),
    given("rule.cheques_warn", 5),
    given("rule.restriction_years", 1),
    given("case.months_collected", 3),
    given("case.avi_declared", "11000"),
    given("case.avi_recognised", "7500"),
    given("case.opening", "41000"),
    statementTable("stmt.table", "41000", MONTHS),
    given("stmt.returned_debits", 0),
  ];
  const rows = facts.find((f) => f.id === "stmt.table")!.value as { deposits: string; debits: string; closing: string; avi: string }[];
  // The deposits and debits of the three months, as facts, so the page prints no arithmetic.
  rows.forEach((r, k) => {
    facts.push(given(`stmt.deposits_${k + 1}`, r.deposits));
    facts.push(given(`stmt.debits_${k + 1}`, r.debits));
    facts.push(given(`stmt.avi_${k + 1}`, r.avi));
  });
  const ids = (p: string) => [1, 2, 3].map((k) => String(facts.find((f) => f.id === `${p}_${k}`)!.value));
  facts.push(sum("stmt.deposits_total", ids("stmt.deposits")));
  facts.push(sum("stmt.debits_total", ids("stmt.debits")));
  facts.push(sum("stmt.avi_total", ids("stmt.avi")));
  facts.push(difference("stmt.out_over_in", "stmt.debits_total", "stmt.deposits_total", facts));

  // The window: the longer the bank reads, the nearer אבי's deposits are to the recognised income.
  facts.push(mean("window.avg_3", ids("stmt.avi")));
  facts.push(mean("window.avg_2", ids("stmt.avi").slice(1)));
  facts.push(mean("window.avg_first_2", ids("stmt.avi").slice(0, 2)));
  facts.push(given("window.avg_1", ids("stmt.avi")[0]));
  facts.push(difference("window.gap_declared_3", "case.avi_declared", "window.avg_3", facts));
  facts.push(difference("window.gap_declared_1", "case.avi_declared", "window.avg_1", facts));
  facts.push(difference("window.gap_declared_2", "case.avi_declared", "window.avg_2", facts));
  facts.push(difference("window.gap_recognised_1", "case.avi_recognised", "stmt.avi_3", facts));
  facts.push(difference("window.gap_recognised_2", "case.avi_recognised", "window.avg_2", facts));

  // The report's clock (invented dates). The bank pulls at the pre-approval.
  facts.push(given("clock.pulled", "2026-10-26"));
  facts.push(addDays("clock.stale", "2026-10-26", 60));
  facts.push(given("clock.signing", "2026-12-28"));
  facts.push(daysBetween("clock.signing_day", "2026-10-26", "2026-12-28"));

  // Exercise 5: the customer fetched their own report on 20 September 2026.
  facts.push(given("ex5.fetched", "2026-09-20"));
  facts.push(addDays("ex5.answer", "2026-09-20", 60));
  facts.push(addDays("ex5.err_plus_one", "2026-09-20", 61));
  facts.push(addDays("ex5.err_minus_one", "2026-09-20", 59));

  return {
    lesson: "4.8",
    title: "נתוני אשראי והתנהלות החשבון",
    note: "The joint account of case B is invented; deposits follow lessons 4.1 (assessments, payslips). The 60-day and 3-year rules are summaries of the Credit Data Law and the team's Brain notes, not verified.",
    facts,
  };
}
