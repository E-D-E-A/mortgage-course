/**
 * Lesson 6.9 — a day at an underwriter's desk. The learner plays the underwriter of "בנק א׳", a
 * FICTIONAL bank whose rules are the exercise's invented rules (src/lib/calc/bankpolicy.ts, data in
 * src/data/case-a-positioning.ts and src/data/underwriter-day.ts), reading five files, the last of which
 * is case A (נועם ושירה); then the same file of case A is read by the four fictional banks.
 *
 * Every number the page, its exercises, its simulation's checks and its video show is a fact here. The
 * decisions and the prices come from the invented rules, never from how a real bank works; the facts
 * are recomputed independently by checks/kinds/bankpolicy.py (the decision, the points, the final
 * rates, the ceiling) and by sensitivity.py, ltv.py, regulation.py and affordability.py (the ratios,
 * the financing ratio, the payments). Teaching numbers: the banks' lists and rules, the five files and
 * the course's price list are assumptions; the rates are not market data and not an offer.
 */
import Decimal from "decimal.js";
import { moneyString } from "../../src/lib/calc/money.ts";
import { listTracks } from "../../src/lib/calc/bankpolicy.ts";
import { loanOf } from "../../src/lib/calc/sensitivity.ts";
import { CASE_A, SCENARIOS } from "../../src/data/case-a-mix.ts";
import { BANKS, bank, caseAFile } from "../../src/data/case-a-positioning.ts";
import { DAY_BANK, DAY_FILES } from "../../src/data/underwriter-day.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { disposable, given, sum } from "./affordability-facts.ts";
import { maxLoanAt, totalFact, verdictFacts } from "./_bankpolicy-facts.ts";
import { difference, givenMoney } from "./_sensitivity-facts.ts";
import { ltv, maxPayment } from "./regulation-facts.ts";

const BASE = SCENARIOS.base;
const A = bank(DAY_BANK);

export default function lesson69(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);
  const get = (id: string) => facts.find((f) => f.id === id) as Fact;
  const opts = { scenario: BASE };

  // ── The prediction: what one step of 0.15 point costs case A over the whole loan (bank A's list, the initial mix) ──
  const listed = listTracks(A, caseAFile("initial").tracks);
  const stepped = listed.map((t) => ({ ...t, rate: new Decimal(t.rate).plus("0.15").toString() }));
  const predBase = add(totalFact("pred.total_0", listed, BASE));
  const predStep = add(totalFact("pred.total_15", stepped, BASE));
  add(difference("pred.diff", predStep, predBase));
  add(totalFact("pred.first_0", listed, BASE, "first"));
  add(totalFact("pred.first_15", stepped, BASE, "first"));
  add(difference("pred.first_diff", get("pred.first_15"), get("pred.first_0")));
  add(given("pred.step", "0.15"));

  // ── The five files of the day, read by bank א׳ ──
  DAY_FILES.forEach((d, i) => {
    const n = i + 1;
    verdictFacts(add, `d${n}`, A, d.file, opts);
    add(givenMoney(`d${n}.value`, String(d.file.value)));
    add(givenMoney(`d${n}.income`, String(d.file.income)));
    add(disposable(`d${n}.disposable`, String(d.file.income), d.file.obligations));
  });
  // File 2 again, the way it stands one payment later: 18 payments of the car loan left, so it no longer counts (lesson 4.2).
  const f2 = DAY_FILES[1].file;
  const f2Later = { ...f2, obligations: [{ ...f2.obligations[0], monthsLeft: 18 }] };
  verdictFacts(add, "d2w", A, f2Later, opts);
  add(disposable("d2w.disposable", String(f2.income), f2Later.obligations));
  add(given("d2.months_left", 19));
  add(given("d2w.months_left", 18));
  add(sum("ex2.err_added", ["17000", "1500"]));
  add(givenMoney("d2.car", "1500"));

  // ── Case A, the initial mix and the half-and-half mix, read by the four fictional banks ──
  add(givenMoney("a.income", CASE_A.recognisedIncome));
  add(givenMoney("a.price", CASE_A.price));
  const aDisp = add(disposable("a.disposable", CASE_A.recognisedIncome, [CASE_A.car]));
  for (const b of BANKS) {
    for (const req of ["initial", "half"] as const) {
      const p = `b.${b.id}.${req}`;
      const file = caseAFile(req);
      const v = verdictFacts(add, p, b, file, opts);
      // the payment at the bank's list, before any step, and the total at that list
      add(totalFact(`${p}.qualifying`, v.listTracks, BASE, "qualifying"));
      add(totalFact(`${p}.list_total`, v.listTracks, BASE));
      if (v.decision === "approve") add(totalFact(`${p}.list_first`, v.listTracks, BASE, "first"));
    }
  }
  // The rule's price for case A's initial mix at bank א׳: what the two steps add to the total.
  add(difference("b.a.initial.steps_total", get("b.a.initial.total"), get("b.a.initial.list_total")));
  add(difference("b.a.half.steps_total", get("b.a.half.total"), get("b.a.half.list_total")));
  // Half and half against the initial mix at bank א׳: first payment and total.
  add(difference("a.half_vs_initial_total", get("b.a.half.total"), get("b.a.initial.total")));
  add(difference("a.half_vs_initial_first", get("b.a.half.first"), get("b.a.initial.first")));

  // ── The line of bank ג׳ and how far case A is from it ──
  const line40 = add(maxPayment("c.line_payment", aDisp.value as string, "40"));
  add(difference("c.initial.over", get("b.c.initial.qualifying"), line40));
  add(difference("c.half.room", line40, get("b.c.half.qualifying")));
  add(given("c.line", "40"));
  add(maxPayment("ex3.err50", aDisp.value as string, "50"));
  add(maxPayment("ex3.err_rec", CASE_A.recognisedIncome, "40"));

  // ── Bank ד׳: the financing ceiling, and the equity the case would need ──
  const loan = loanOf(listTracks(bank("d"), caseAFile("initial").tracks));
  const loanFact = add(givenMoney("a.loan", moneyString(loan)));
  const cap = add(maxLoanAt("d.max_loan", CASE_A.price, bank("d").ltvMax));
  add(difference("d.short", loanFact, cap));
  add(ltv("a.ltv", moneyString(loan), CASE_A.price));

  // ── Exercise: the steps, and what the rates become ──
  for (const k of ["prime", "variable_unlinked", "fixed_unlinked"] as const) add(given(`a.list_${k}`, A.prices[k]));

  return {
    lesson: "6.9",
    title: "סימולציה: יום אחד בתור חתם אשראי בבנק",
    note: "Four fictional banks (src/data/case-a-positioning.ts) with INVENTED rules (src/lib/calc/bankpolicy.ts): refuse above a line, add percentage points to every track above a step. Nothing here is how a real bank decides or prices. The ratio is measured at the bank's own list rates, before any step. The files of the day are invented households (src/data/underwriter-day.ts); the fifth is case A. Base scenario: the index rises 2% a year, prime does not move. Rates are the course's teaching rates, not market data and not an offer.",
    facts,
  };
}
