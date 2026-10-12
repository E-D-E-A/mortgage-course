/**
 * Lesson 4.1 — recognised income. Every number the lesson, its exercises, its
 * payslip illustration and its video show is declared here as a fact; the page
 * reads data/lessons/4-1.json, and checks/kinds/affordability.py (with
 * household.py, percent.py and common.py) recomputes each computed one.
 *
 * Case B (אבי, self-employed, and his salaried wife מיכל) is the course's
 * synthetic case of stage 4, course/course-map.md section 8 and
 * scripts/case_sketch.py: declared net incomes 11,000 and 8,200. The tax
 * assessments (84,000 and 96,000 a year, net), the three payslips and every
 * other person here are invented teaching numbers — not a bank's rule, not a
 * tax calculation and not market data.
 */
import type { LessonData } from "../build-data.ts";
import { assessment, average, difference, given, monthly, net, netToPay, payslipTable, share, sum } from "./affordability-facts.ts";

// Case B, course-map section 8 (teaching assumptions).
const AVI_DECLARED = "11000";
const MICHAL_DECLARED = "8200";
const ASSESSMENTS = ["84000", "96000"]; // net a year, oldest first

// מיכל's three payslips (synthetic): basic 10,000, overtime varies; the same deductions each month.
const MANDATORY = ["900", "950", "650"]; // income tax · national insurance and health tax · employee's pension
const OTHER = ["400", "50"]; // employer loan · union dues
const MICHAL = [
  { name: "יולי", gross: "10650", mandatory: MANDATORY, other: OTHER },
  { name: "אוגוסט", gross: "10700", mandatory: MANDATORY, other: OTHER },
  { name: "ספטמבר", gross: "10750", mandatory: MANDATORY, other: OTHER },
];

export default function lesson41(): LessonData {
  const facts = [];
  const add = <T extends { id: string }>(f: T) => (facts.push(f as never), f);

  // ── Case B: what אבי says, and what his assessments show ──
  const aviDeclared = add(given("case.avi_declared", AVI_DECLARED));
  add(given("case.michal_declared", MICHAL_DECLARED));
  add(given("case.assess_old", ASSESSMENTS[0]));
  add(given("case.assess_latest", ASSESSMENTS[1]));
  const aviLatest = add(assessment("case.avi_latest", ASSESSMENTS, "latest"));
  const aviAvg = add(assessment("case.avi_avg", ASSESSMENTS, "average"));
  add(sum("case.assess_total", ASSESSMENTS));
  add(difference("case.avi_gap", aviDeclared, aviAvg));
  add(difference("case.avi_gap_latest", aviDeclared, aviLatest));
  add(share("case.avi_share", aviAvg.value as string, AVI_DECLARED));

  // ── מיכל's payslips ──
  const table = add(payslipTable("slip.table", MICHAL));
  // The payslip lines the illustration draws; their sums are the table's figures.
  const OVERTIME = ["650", "700", "750"];
  add(
    given(
      "slip.months",
      MICHAL.map((m, k) => ({
        name: m.name,
        pay: [
          { label: "שכר יסוד", amount: "10000" },
          { label: "שעות נוספות", amount: OVERTIME[k] },
        ],
        mandatory: [
          { label: "מס הכנסה", amount: MANDATORY[0] },
          { label: "ביטוח לאומי ומס בריאות", amount: MANDATORY[1] },
          { label: "פנסיה — חלק העובד", amount: MANDATORY[2] },
        ],
        other: [
          { label: "החזר הלוואה ממעביד", amount: OTHER[0] },
          { label: "דמי ועד", amount: OTHER[1] },
        ],
      })),
    ),
  );
  add(given("slip.basic", "10000"));
  add(given("slip.overtime", "700"));
  add(sum("slip.gross", ["10000", "700"]));
  add(given("slip.tax", MANDATORY[0]));
  add(given("slip.ni", MANDATORY[1]));
  add(given("slip.pension", MANDATORY[2]));
  add(sum("slip.mandatory", MANDATORY));
  add(net("slip.net", "10700", MANDATORY));
  add(given("slip.loan", OTHER[0]));
  add(given("slip.dues", OTHER[1]));
  add(sum("slip.other", OTHER));
  add(netToPay("slip.ntp", "8200", OTHER));
  const rows = table.value as { net: string; net_to_pay: string }[];
  const avgNet = add(average("michal.avg_net", rows.map((r) => r.net)));
  const avgNtp = add(average("michal.avg_ntp", rows.map((r) => r.net_to_pay)));
  add(difference("michal.gap", avgNet, avgNtp));
  add(sum("michal.net_sum", rows.map((r) => r.net)));

  // ── The household: declared against recognised ──
  const hhDeclared = add(sum("hh.declared", [AVI_DECLARED, MICHAL_DECLARED]));
  const hhAvg = add(sum("hh.rec_avg", [aviAvg.value as string, avgNet.value as string]));
  add(sum("hh.rec_latest", [aviLatest.value as string, avgNet.value as string]));
  add(difference("hh.gap", hhDeclared, hhAvg));
  add(sum("hh.rec_ntp", [aviAvg.value as string, avgNtp.value as string]));

  // ── Half-worked: נטע's three payslips (invented) ──
  const half = add(
    payslipTable("half.table", [
      { name: "יולי", gross: "9800", mandatory: ["2150"], other: [] },
      { name: "אוגוסט", gross: "9950", mandatory: ["2200"], other: [] },
      { name: "ספטמבר", gross: "10100", mandatory: ["2250"], other: [] },
    ]),
  );
  add(average("half.avg", (half.value as { net: string }[]).map((r) => r.net)));

  // ── Exercises ──
  // 1: which number is net pay (gross 12,000, mandatory 3,000, employer loan 500).
  add(given("ex1.gross", "12000"));
  add(given("ex1.mandatory", "3000"));
  add(given("ex1.loan", "500"));
  add(net("ex1.net", "12000", ["3000"]));
  add(netToPay("ex1.ntp", "9000", ["500"]));
  // 2: net from a payslip's lines.
  add(given("ex2.gross", "14200"));
  add(given("ex2.tax", "1850"));
  add(given("ex2.ni", "1250"));
  add(given("ex2.pension", "850"));
  add(net("ex2.answer", "14200", ["1850", "1250", "850"]));
  add(net("ex2.err_tax_only", "14200", ["1850"]));
  add(sum("ex2.err_deductions", ["1850", "1250", "850"]));
  // 3: three months' average.
  add(given("ex3.m1", "9150"));
  add(given("ex3.m2", "9300"));
  add(given("ex3.m3", "9600"));
  add(average("ex3.answer", ["9150", "9300", "9600"]));
  add(sum("ex3.err_sum", ["9150", "9300", "9600"]));
  add(average("ex3.err_two", ["9300", "9600"]));
  // 4: a self-employed person's monthly income from one assessment: 130,000 before tax, 28,000 tax.
  add(given("ex4.before_tax", "130000"));
  add(given("ex4.tax", "28000"));
  const ex4net = add(net("ex4.annual_net", "130000", ["28000"]));
  add(monthly("ex4.answer", ex4net.value as string));
  add(monthly("ex4.err_before_tax", "130000"));
  add(monthly("ex4.err_tax", "28000"));
  // 6: two assessments, 78,000 then 102,000: latest against the two-year average.
  const ex6latest = add(assessment("ex6.latest", ["78000", "102000"], "latest"));
  const ex6avg = add(assessment("ex6.avg", ["78000", "102000"], "average"));
  add(difference("ex6.answer", ex6latest, ex6avg));
  add(difference("ex6.err_years", ex6latest, add(monthly("ex6.older_monthly", "78000"))));
  add(difference("ex6.err_annual", add(given("ex6.latest_annual", "102000")), add(given("ex6.older_annual", "78000"))));
  // 7: a company owner's profit and dividend (invented): the same money once.
  add(given("ex7.profit", "200000"));
  add(given("ex7.dividend", "120000"));

  // ── Prediction ──
  // Options: what he declares; the latest assessment ÷ 12 and the two-year average; nothing.

  return {
    lesson: "4.1",
    title: "הכנסה מוכרת",
    note: "Case B (אבי ומיכל) is synthetic; assessments, payslips and every other person and amount are invented teaching numbers.",
    facts,
  };
}
