/**
 * Workshop 3.12 — a schedule by hand and in a spreadsheet. Every number the
 * page, its two tools, its exercises and the downloadable sheets show is a fact
 * here; checks/kinds/workshop.py (with amortization.py, repayment.py, mix.py,
 * percent.py and rates.py) recomputes each one.
 *
 * Two invented loans, neither of them case A (נועם ושירה get their mix only in
 * stage 5):
 *  - by hand: 12,000 ₪ at 6% a year (0.5% a month) for 12 months, small enough
 *    to do on a calculator;
 *  - in the sheet: 400,000 ₪ at 5.4% for 15 years, lesson 2.9's worked example.
 * Teaching numbers, not market rates. The schedule is the course's statement
 * convention (amortization.ts annuityStatement). scripts/build-sheets.py reads
 * the sheets' default inputs and the expected figures from data/lessons/3-12.json.
 */
import Decimal from "decimal.js";
import { annuityStatement } from "../../src/lib/calc/amortization.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import {
  HAND_MISTAKES,
  type HandField,
  type HandMistake,
  handMistake,
  interestBetween,
  naiveBalance,
  paymentAnnualAsMonthly,
  SHEET_CONVENTIONS,
  type SheetConvention,
  sheetFigures,
} from "../../src/lib/calc/workshop.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, given, percentOfFact, repCell, repMonthly, repMonths, repPayment, repSchedule, slice } from "./lesson-2-9.ts";

type Loan = readonly [string, string, number];
const loanInputs = ([principal, rate, months]: Loan) => ({ principal, rate_percent: rate, months });

/** An exact decimal, no trailing zeros: "55.136", "60" (the same as checks/kinds/workshop.py's exact()). */
const plainExact = (d: Decimal) => {
  const s = d.toFixed();
  return s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "") : s;
};

const ROW_FIELDS = { opening: "opening", payment: "payment", interest: "interest", principal_paid: "principalPaid", closing: "closing" } as const;
type RowField = keyof typeof ROW_FIELDS;

const cell = (id: string, loan: Loan, period: number, field: RowField): Fact => ({
  id,
  kind: "ws_statement_cell",
  inputs: { ...loanInputs(loan), period, field },
  value: moneyString(annuityStatement(...loan)[period - 1][ROW_FIELDS[field]]),
});

const SHEET_FIELDS = { regular: "regular", last: "last", total_paid: "totalPaid", total_interest: "totalInterest", final_closing: "finalClosing" } as const;
type SheetField = keyof typeof SHEET_FIELDS;

const sheet = (id: string, loan: Loan, convention: SheetConvention, field: SheetField): Fact => ({
  id,
  kind: "ws_sheet",
  inputs: { ...loanInputs(loan), convention, field },
  value: moneyString(sheetFigures(...loan, convention)[SHEET_FIELDS[field]]),
});

/**
 * The named mistakes of the hand table, month 1 to `upTo`: one fact per month,
 * field and mistake whose number differs from the right one (and from a mistake
 * already listed for that cell, so each wrong number has one name).
 * Id: hand.m<month>.<field>.<mistake>.
 */
function handMistakes(loan: Loan, upTo: number): Fact[] {
  const rows = annuityStatement(...loan);
  const right: Record<HandField, (k: number) => string> = {
    opening: (k) => moneyString(rows[k - 1].opening),
    interest: (k) => moneyString(rows[k - 1].interest),
    principal: (k) => moneyString(rows[k - 1].principalPaid),
    closing: (k) => moneyString(rows[k - 1].closing),
  };
  const facts: Fact[] = [];
  for (let k = 1; k <= upTo; k++) {
    for (const field of Object.keys(HAND_MISTAKES) as HandField[]) {
      if (field === "opening" && k === 1) continue; // month 1's opening is given
      const seen = new Set([Number(right[field](k))]);
      for (const mistake of HAND_MISTAKES[field] as HandMistake[]) {
        const value = handMistake(...loan, k, field, mistake);
        if (seen.has(value.toNumber())) continue;
        seen.add(value.toNumber());
        facts.push({
          id: `hand.m${k}.${field}.${mistake}`,
          kind: "ws_hand_mistake",
          inputs: { ...loanInputs(loan), period: k, field, mistake },
          value: plainExact(value),
        });
      }
    }
  }
  return facts;
}

/** How many months the learner fills by hand. */
export const HAND_MONTHS = 3;

export default function lesson312(): LessonData {
  const H: Loan = ["12000", "6", 12];
  const W: Loan = ["400000", "5.4", 180];

  // ── By hand ──
  const hPayment = repPayment("hand.payment", ...H);
  const hLast = cell("hand.last_payment", H, 12, "payment");
  const hEqualFirst = repCell("hand.err_equal_first", "equal_principal", ...H, 1, "payment");

  // ── In the sheet: the four conventions × five figures ──
  const sheetFacts: Fact[] = [];
  const S: Record<string, Fact> = {};
  for (const c of SHEET_CONVENTIONS) {
    for (const f of Object.keys(SHEET_FIELDS) as SheetField[]) {
      const fact = sheet(`sheet.${c}.${f}`, W, c, f);
      S[`${c}.${f}`] = fact;
      sheetFacts.push(fact);
    }
  }
  const zero = given("zero", "0.00");
  const wInterest1 = cell("ex2.answer", W, 1, "interest");
  const wLoan = given("sheet.loan", "400000.00");
  const ex3Answer = cell("ex3.answer", W, 60, "closing");
  const year1 = { id: "ex4.answer", kind: "ws_interest_between", inputs: { ...loanInputs(W), from: 1, to: 12 }, value: moneyString(interestBetween(...W, 1, 12)) };

  const facts: Fact[] = [
    zero,
    // The hand loan.
    given("hand.loan", "12000.00"),
    given("hand.by_hand", String(HAND_MONTHS)),
    repMonthly("hand.monthly", "6"),
    hPayment,
    repSchedule("hand.schedule", "spitzer", ...H),
    hLast,
    difference("hand.last_gap", hPayment, hLast),
    difference("hand.pmt_shown", zero, hPayment),
    sheet("hand.total_paid", H, "statement", "total_paid"),
    sheet("hand.total_interest", H, "statement", "total_interest"),
    // Step 1, the payment, and its mistakes.
    hEqualFirst,
    slice("hand.err_no_interest", "12000", "1", "12"),
    { id: "hand.err_annual", kind: "ws_payment_annual_as_monthly", inputs: loanInputs(H), value: moneyString(paymentAnnualAsMonthly(...H)) },
    // Step 2: the named mistakes of months 1–3.
    ...handMistakes(H, HAND_MONTHS),

    // The sheet's loan.
    wLoan,
    repMonths("sheet.months", 15),
    repMonthly("sheet.monthly", "5.4"),
    repPayment("sheet.payment", ...W),
    ...sheetFacts,
    difference("sheet.gap_exact_interest", S["exact.total_interest"], S["statement.total_interest"]),
    difference("sheet.gap_unrounded_interest", S["payment_unrounded.total_interest"], S["statement.total_interest"]),
    difference("sheet.gap_last", S["statement.regular"], S["statement.last"]),
    difference("sheet.overpaid", S["no_last_adjust.total_paid"], S["statement.total_paid"]),
    difference("sheet.pmt_shown", zero, S["statement.regular"]),
    cell("sheet.int_1", W, 1, "interest"),
    cell("sheet.prin_1", W, 1, "principal_paid"),
    cell("sheet.close_1", W, 1, "closing"),
    cell("sheet.int_2", W, 2, "interest"),

    // Exercise 2: month 1's interest on the sheet's loan.
    wInterest1,
    percentOfFact("ex2.err_annual", "400000", "5.4"),
    // Exercise 3: the balance after five years (60 payments).
    repMonths("ex3.months", 5),
    ex3Answer,
    difference("ex3.repaid", wLoan, ex3Answer),
    cell("ex3.err_opening", W, 60, "opening"),
    { id: "ex3.err_naive", kind: "ws_naive_balance", inputs: { ...loanInputs(W), paid: 60 }, value: moneyString(naiveBalance(...W, 60)) },
    repCell("ex3.err_equal", "equal_principal", ...W, 60, "closing"),
    // Exercise 4: the interest in the first year.
    year1,
    // Exercise 6: the last month not adjusted.
    sheet("ex6.answer", W, "no_last_adjust", "final_closing"),
  ];

  return {
    lesson: "3.12",
    title: "סדנה: לוח סילוקין ביד ובגיליון",
    note: "Teaching numbers, not market rates. Monthly rate = annual ÷ 12; the payment rounded to the agora once; each month's interest rounded to the agora; the last payment closes the balance (amortization.ts annuityStatement). The sheet conventions are workshop.ts sheetFigures.",
    facts,
  };
}
