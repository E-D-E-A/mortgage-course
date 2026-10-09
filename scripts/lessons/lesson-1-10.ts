/**
 * Lesson 1.10 — the workshop "עושים את זה לבד". Every number the page, its
 * checklist and its exercises show is declared here as a fact; the page reads
 * data/lessons/1-10.json, and checks/kinds/household.py (with percent.py and
 * common.py) recomputes each computed one.
 *
 * Two sorts of numbers:
 *  - Case A (נועם ושירה), the course's synthetic main case (course-map
 *    section 8): teaching assumptions, not a real client.
 *  - Numbers the checklist quotes from sources (days, months, a fee). They are
 *    "given" facts, each shown on the page with its source and reliability:
 *    official rules come from the team's transcriptions in the Brain and are
 *    "לא אומת"; field numbers wait for Eylon's approval.
 */
import { addCalendarDays, calendarDaysBetween, daysLeft, disposableIncome, monthlyTotal } from "../../src/lib/calc/household.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { percentOf, percentString, sharePercent } from "../../src/lib/calc/percent.ts";
import Decimal from "decimal.js";
import type { Fact, LessonData } from "../build-data.ts";

const given = (id: string, value: string | number): Fact => ({ id, kind: "given", inputs: {}, value });
const list = (xs: string[]) => xs.join("|");

const sum = (id: string, amounts: string[]): Fact => ({
  id,
  kind: "hh_sum",
  inputs: { amounts: list(amounts) },
  value: moneyString(monthlyTotal(amounts)),
});

const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

const share = (id: string, part: string, whole: string): Fact => ({
  id,
  kind: "share_percent",
  inputs: { part, whole },
  value: percentString(sharePercent(part, whole)),
});

const left = (id: string, window: number, used: number): Fact => ({
  id,
  kind: "hh_days_left",
  inputs: { window_days: window, used_days: used },
  value: daysLeft(window, used),
});

const addDays = (id: string, date: string, days: number): Fact => ({
  id,
  kind: "hh_add_days",
  inputs: { date, days },
  value: addCalendarDays(date, days),
});

const between = (id: string, from: string, to: string): Fact => ({
  id,
  kind: "hh_days_between",
  inputs: { from, to },
  value: calendarDaysBetween(from, to),
});

// Case A, course-map section 8 (teaching assumptions).
const NOAM = "12400";
const SHIRA = "9300";
const CAR = "1450";
const PRICE = "2200000";
const EQUITY = "560000";

export default function lesson110(): LessonData {
  const price = given("case.price", PRICE);
  const equity = given("case.equity", EQUITY);
  const gift = given("case.gift", "200000");
  const loan = difference("case.loan", price, equity);
  const reserve = given("case.reserve", "50000");
  const equityToPrice = difference("case.equity_to_price", equity, reserve);
  const loanWithReserve = difference("case.loan_with_reserve", price, equityToPrice);
  const capLoan: Fact = {
    id: "case.cap_loan",
    kind: "percent_of",
    inputs: { amount: PRICE, rate_percent: "75" },
    value: moneyString(percentOf(PRICE, "75")),
  };
  const WINDOW = 24;
  const NO_LIEN = 12;
  const USED = 11;

  const facts: Fact[] = [
    given("data_date", "2026-10-09"),

    // Case A: the deal map.
    given("case.noam_age", "31"),
    given("case.shira_age", "30"),
    price,
    equity,
    gift,
    difference("case.cash_now", equity, gift),
    loan,
    share("case.ltv", loan.value as string, PRICE),
    given("case.noam_income", NOAM),
    given("case.shira_income", SHIRA),
    sum("case.total_income", [NOAM, SHIRA]),
    given("case.car_payment", CAR),
    given("case.car_months", "26"),
    {
      id: "case.disposable",
      kind: "hh_disposable_income",
      inputs: { incomes: list([NOAM, SHIRA]), payments: CAR },
      value: moneyString(disposableIncome([NOAM, SHIRA], [CAR])),
    },

    // Money kept aside for the costs around the deal and for emergencies: a stated
    // teaching assumption (not an estimate of real costs). With it, less equity goes
    // to the price, and the loan grows.
    reserve,
    equityToPrice,
    loanWithReserve,
    share("case.ltv_with_reserve", loanWithReserve.value as string, PRICE),
    // The cap for a only home, as lesson 1.2 teaches it (Directive 329 via the Brain; לא אומת).
    given("ref.cap_only_home", "75"),
    capLoan,
    difference("case.cap_room", capLoan, loan),

    // The LTV exercise's common mistakes.
    share("ex.ltv_equity", EQUITY, PRICE),
    share("ex.ltv_wrong_base", loan.value as string, EQUITY),

    // The process: the number of steps, as in lesson 1.7's map row.
    given("steps.count", "12"),
    // Mogi works with up to four banks in parallel (decision 2026-08-13, Brain).
    given("banks.max", "4"),

    // Documents (Mogi practice, Eden 2026-08-04, Brain J-130; Eylon 2026-07-27, FK-H-033).
    given("docs.payslips", "3"),
    given("docs.statements_months", "3"),

    // Directive rules as transcribed in the Brain (לא אומת).
    given("rule.answer_days", "5"),
    given("rule.answer_days_extended", "7"),
    given("rule.window_days", String(WINDOW)),
    given("rule.window_no_lien_days", String(NO_LIEN)),
    given("rule.appraisal_days", "90"),
    // Insurance bought outside the bank: the bank answers within 14 days (Brain 9797633, לא אומת).
    given("rule.insurance_days", "14"),
    given("rule.payday_1", "1"),
    given("rule.payday_2", "10"),
    given("rule.payday_3", "15"),
    // The file-opening charge, from a secondary source (Brain 8290315, לא אומת).
    given("fee.file_opening_max", "360"),
    // Field: registration at the Israel Land Authority (Tobi, 2026-08-05, FK-H-046).
    given("field.rmi_months_low", "3"),
    given("field.rmi_months_high", "4"),
    // Field: "rates valid 3 months" (Eylon, 2026-07-27, FK-H-027), contradicted by the directive's floor.
    given("field.validity_months", "3"),

    // Exercise: the days left in the window.
    given("ex.used_days", USED),
    left("ex.days_left", WINDOW, USED),
    left("ex.days_left_no_lien", NO_LIEN, USED),
    {
      id: "ex.days_added",
      kind: "hh_days_sum",
      inputs: { window_days: WINDOW, used_days: USED },
      value: WINDOW + USED,
    },

    // Exercise: planning against the window (invented 2026 dates).
    given("plan.approved", "2026-11-10"),
    given("plan.appraisal", "2026-11-24"),
    given("plan.underwriting_days", 7),
    addDays("plan.underwriting_end", "2026-11-24", 7),
    addDays("plan.signing", addCalendarDays("2026-11-24", 7), 1),
    between("plan.used", "2026-11-10", addCalendarDays("2026-11-24", 8)),
    left("plan.left", WINDOW, calendarDaysBetween("2026-11-10", addCalendarDays("2026-11-24", 8))),
    addDays("plan.window_end", "2026-11-10", WINDOW),
    // The mistake of counting only to the end of underwriting (1 December), not to the signing.
    left("plan.err_to_underwriting", WINDOW, calendarDaysBetween("2026-11-10", "2026-12-01")),

    // Exercise: which payment day. The salaries arrive on the 9th (teaching assumption).
    given("ex.salary_day", "9"),
  ];

  return {
    lesson: "1.10",
    title: "סדנה: עושים את זה לבד",
    note: "Case A is the course's synthetic main case. Days, months and the fee are quoted from Brain transcriptions (not verified against the primary documents) or from field knowledge awaiting Eylon's approval.",
    facts,
  };
}
