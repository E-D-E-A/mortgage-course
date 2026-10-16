/**
 * Lesson 6.2 — thresholds and steps. A threshold (סף) is a number where something changes; a step (מדרגה)
 * is the change when it is crossed. The lesson measures where case A (נועם ושירה) stands against each line,
 * how far the lines are, and what it costs the client in shekels to move away from them: by more equity
 * (the loan shrinks), by more recognised income, or, for a family whose term is short of 30 years, by a
 * longer term. It never prices a CROSSING: no source gives the size of a step (a regulatory limit is a ban;
 * the capital threshold's cost to the bank is unknown, lesson 4.5; a bank's line is its own; a field
 * hypothesis has no number for what crossing costs). Every number the page, the exercises, the calculator's
 * defaults and the video show is a fact here; checks/kinds/positioning.py (with sensitivity.py, ltv.py,
 * affordability.py and regulation.py) recomputes each one.
 *
 * LABELS. 50% payment ratio, 40% payment ratio (capital threshold) and the 75% financing ceiling are the
 * team's transcription of directive 329 (Brain 7503881), not checked against the directive. The 35% and 30%
 * payment-ratio lines are the course brief's own example ("the numbers are to be checked"); the course found no
 * field-knowledge row that says them. The 60% and 40% financing lines are one banker's remark (FK-H-004).
 * Bank B's 38% and bank C's 65% are invented. "דנה ורועי" and the exercise families are invented, not case A.
 */
import { CASE_A } from "../../src/data/case-a-mix.ts";
import { LTV_CEILINGS, PTI_CAPITAL_THRESHOLD, PTI_LIMIT } from "../../src/lib/calc/regulation.ts";
import { shortestTerm } from "../../src/lib/calc/positioning.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { disposable, ratio as affRatio } from "./affordability-facts.ts";
import {
  MIX_A,
  difference,
  equityNeededFact,
  givenMoney,
  givenNumber,
  incomeRoomFact,
  leverFact,
  loanCutFact,
  loanRoomFact,
  mixFact,
  paymentCutFact,
  paymentRoomFact,
  points,
  shortestTermFact,
  standingTableFact,
  sumOf,
  termRouteFact,
} from "./_positioning-facts.ts";
import { ltv, maxLoan, maxPayment } from "./regulation-facts.ts";

export default function lesson(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => {
    facts.push(f);
    return f;
  };
  const v = (f: Fact) => f.value as string;
  /** A whole number of months as years: kind fc_divide (checked in factors.py). */
  const years = (id: string, months: number): Fact => ({ id, kind: "fc_divide", inputs: { a: String(months), b: "12", decimals: 0 }, value: String(months / 12) });

  // ── The lines ──
  add(givenNumber("l.limit", PTI_LIMIT));
  add(givenNumber("l.capital", PTI_CAPITAL_THRESHOLD));
  add(givenNumber("l.h35", "35"));
  add(givenNumber("l.h30", "30"));
  add(givenNumber("l.ceiling", LTV_CEILINGS.only_home));
  add(givenNumber("l.ltv60", "60"));
  add(givenNumber("l.ltv40", "40"));

  // ── A small example: a line, two payments, three distances ──
  const sIncome = add(givenMoney("s.income", "10000"));
  const sPay = add(givenMoney("s.pay", "4200"));
  const sRatio = add(affRatio("s.ratio", v(sPay), v(sIncome)));
  add(points("s.points", v(sRatio), PTI_CAPITAL_THRESHOLD));
  add(maxPayment("s.max", v(sIncome), PTI_CAPITAL_THRESHOLD));
  add(paymentCutFact("s.cut", v(sIncome), v(sPay), PTI_CAPITAL_THRESHOLD));
  const sNeed = add(incomeRoomFact("s.need", v(sIncome), v(sPay), PTI_CAPITAL_THRESHOLD));
  add(sumOf("s.total_income", [sIncome, sNeed]));
  const sPayIn = add(givenMoney("s2.pay", "3800"));
  const s2Ratio = add(affRatio("s2.ratio", v(sPayIn), v(sIncome)));
  add(points("s2.points", v(s2Ratio), PTI_CAPITAL_THRESHOLD));
  add(paymentRoomFact("s2.room", v(sIncome), v(sPayIn), PTI_CAPITAL_THRESHOLD));

  // ── Case A: where it stands ──
  add(givenMoney("a.price", CASE_A.price));
  const loan = add(mixFact("a.loan", MIX_A, "loan"));
  const disp = add(disposable("a.disp", CASE_A.recognisedIncome, [CASE_A.car]));
  const pay = add(mixFact("a.pay", MIX_A, "qualifying"));
  const ratio0 = add(mixFact("a.ratio", MIX_A, "ratio"));
  const ltv0 = add(ltv("a.ltv", v(loan), CASE_A.price));
  add(points("a.pts40", v(ratio0), PTI_CAPITAL_THRESHOLD));
  add(standingTableFact("a.pti_table", v(ratio0), [PTI_LIMIT, PTI_CAPITAL_THRESHOLD, "35", "30"].sort((x, y) => Number(x) - Number(y))));
  add(standingTableFact("a.ltv_table", v(ltv0), ["40", "60", LTV_CEILINGS.only_home]));
  add(maxLoan("a.max_loan", CASE_A.price, "only_home"));
  add(loanRoomFact("a.room", CASE_A.price, v(loan), LTV_CEILINGS.only_home));
  add(points("a.ltv_gap", v(ltv0), LTV_CEILINGS.only_home));

  // The three payment-ratio lines of the example (40 is the capital threshold; 35 and 30 are the brief's example).
  const cuts: Record<string, Fact> = {};
  for (const L of [PTI_CAPITAL_THRESHOLD, "35", "30"]) {
    add(maxPayment(`a.max.${L}`, v(disp), L));
    add(paymentCutFact(`a.paycut.${L}`, v(disp), v(pay), L));
    const need = add(incomeRoomFact(`a.income.${L}`, v(disp), v(pay), L));
    add(sumOf(`a.income_total.${L}`, [disp, need]));
    const cut = add(loanCutFact(`a.loancut.${L}`, MIX_A.tracks, v(disp), L));
    cuts[L] = cut;
    const lever = { lever: "amount", change: `-${v(cut)}` } as const;
    const after = add(leverFact(`a.loan_after.${L}`, MIX_A, lever, "loan"));
    add(leverFact(`a.ratio_after.${L}`, MIX_A, lever, "ratio"));
    add(ltv(`a.ltv_after.${L}`, v(after), CASE_A.price));
  }
  // One step short: 16,000 off the loan is not enough for the 40% line.
  add(givenMoney("a.short_cut", "16000"));
  add(leverFact("a.ratio_16", MIX_A, { lever: "amount", change: "-16000" }, "ratio"));
  // The price of each next step down: every five points costs about the same, and the step's worth is unknown.
  add(difference("a.step_35", cuts["35"], cuts["40"]));
  add(difference("a.step_30", cuts["30"], cuts["35"]));
  // The financing lines (a field hypothesis at 60 and 40): the equity that would replace the loan to reach them.
  add(equityNeededFact("a.eq60", CASE_A.price, v(loan), "60"));
  add(equityNeededFact("a.eq40", CASE_A.price, v(loan), "40"));
  add(equityNeededFact("a.eq75", CASE_A.price, v(loan), LTV_CEILINGS.only_home));

  // ── Another family, a longer term: דנה ורועי (invented), loan 1,200,000 at 4.5%, 20 years ──
  const tPrincipal = add(givenMoney("t.principal", "1200000"));
  add(givenNumber("t.rate", "4.5"));
  const tDisp = add(givenMoney("t.disp", "18000"));
  add(givenNumber("t.from", 240));
  add(years("t.from_years", 240));
  const tMax = add(maxPayment("t.max", v(tDisp), PTI_CAPITAL_THRESHOLD));
  const tMax35 = add(maxPayment("t.max35", v(tDisp), "35"));
  const short40 = shortestTerm("1200000", "4.5", v(tMax), 240);
  const short35 = shortestTerm("1200000", "4.5", v(tMax35), 240);
  if (short40 === null || short35 === null) throw new Error("lesson 6.2: the term example needs a term within 30 years");
  add(shortestTermFact("t.shortest40", v(tPrincipal), "4.5", v(tMax), 240));
  add(shortestTermFact("t.shortest35", v(tPrincipal), "4.5", v(tMax35), 240));
  add(years("t.years40", short40));
  add(years("t.years35", short35));
  for (const [k, to] of [["40", short40], ["35", short35]] as const) {
    const p = add(termRouteFact(`t.pay_to.${k}`, v(tPrincipal), "4.5", 240, to, "to_payment"));
    add(affRatio(`t.ratio_to.${k}`, v(p), v(tDisp)));
    add(termRouteFact(`t.drop.${k}`, v(tPrincipal), "4.5", 240, to, "payment_drop"));
    add(termRouteFact(`t.total_to.${k}`, v(tPrincipal), "4.5", 240, to, "to_total"));
    add(termRouteFact(`t.extra.${k}`, v(tPrincipal), "4.5", 240, to, "extra_total"));
  }
  const tPayFrom = add(termRouteFact("t.pay_from", v(tPrincipal), "4.5", 240, short40, "from_payment"));
  add(affRatio("t.ratio_from", v(tPayFrom), v(tDisp)));
  add(termRouteFact("t.total_from", v(tPrincipal), "4.5", 240, short40, "from_total"));

  // ── Exercises ──
  const e2Income = add(givenMoney("e2.income", "15000"));
  const e2Pay = add(givenMoney("e2.pay", "6450"));
  add(maxPayment("e2.max", v(e2Income), PTI_CAPITAL_THRESHOLD));
  add(paymentCutFact("e2.cut", v(e2Income), v(e2Pay), PTI_CAPITAL_THRESHOLD));

  const e3Income = add(givenMoney("e3.income", "14000"));
  const e3Pay = add(givenMoney("e3.pay", "6000"));
  add(paymentCutFact("e3.cut", v(e3Income), v(e3Pay), PTI_CAPITAL_THRESHOLD));
  const e3Need = add(incomeRoomFact("e3.need", v(e3Income), v(e3Pay), PTI_CAPITAL_THRESHOLD));
  add(sumOf("e3.total_income", [e3Income, e3Need]));

  // 4 is case A's price to the 35% line (a.loancut.35). 6: a term moved from 20 to 25 years.
  const e6 = add(givenMoney("e6.principal", "1000000"));
  add(givenNumber("e6.rate", "4.5"));
  add(termRouteFact("e6.extra", v(e6), "4.5", 240, 300, "extra_total"));
  add(termRouteFact("e6.drop", v(e6), "4.5", 240, 300, "payment_drop"));

  // 7: the 100,000 that case A could bring, against the 17,000 that reaches 40%.
  const e7cut = add(givenMoney("e7.cut", "100000"));
  const lever7 = { lever: "amount", change: "-100000" } as const;
  const e7loan = add(leverFact("e7.loan", MIX_A, lever7, "loan"));
  add(ltv("e7.ltv", v(e7loan), CASE_A.price));
  add(leverFact("e7.ratio", MIX_A, lever7, "ratio"));
  add(difference("e7.extra", e7cut, cuts[PTI_CAPITAL_THRESHOLD]));

  // Invented bank lines, for the sort.
  add(givenNumber("x.policy_b", "38"));
  add(givenNumber("x.policy_c", "65"));

  return {
    lesson: "6.2",
    title: "מיצוב: ספים ומדרגות",
    note: "Directive 329's 50%, 40% and 75% are the team's transcription (not checked); the 35% and 30% payment-ratio lines are the course brief's example (numbers to be checked); the 60% and 40% financing lines are FK-H-004 (one banker); bank lines and the families are invented. Case A is stage 5's.",
    facts,
  };
}
