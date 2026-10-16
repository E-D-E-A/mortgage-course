/**
 * Lesson 6.9 — a day at an underwriter's desk. The learner plays the underwriter of "בנק א׳", a
 * FICTIONAL bank whose rules are the exercise's invented rules (src/lib/calc/bankpolicy.ts, data in
 * src/data/case-a-positioning.ts and src/data/underwriter-day.ts), reading five files, the last of which
 * is case A (נועם ושירה); then the same file of case A is read by the four fictional banks.
 *
 * The banks' price lists are lessons 6.6–6.8's (src/data/case-a-offers.ts): the price a bank put on the
 * family's request. The rules are this lesson's: refuse above a line, take relief off the list at or
 * below another. Every number the page, its exercises, its simulation's checks and its video show is a
 * fact here. The decisions and the prices come from the invented rules, never from how a real bank works;
 * the facts are recomputed independently by checks/kinds/bankpolicy.py (the decision, the relief, the final
 * rates, the ceiling) and by sensitivity.py, ltv.py, regulation.py and affordability.py (the ratios, the
 * financing ratio, the payments). Teaching numbers: the banks' rules, the five files, the savings of case A
 * and the rates are assumptions; the rates are not market data and not an offer.
 */
import Decimal from "decimal.js";
import { moneyString } from "../../src/lib/calc/money.ts";
import { listTracks } from "../../src/lib/calc/bankpolicy.ts";
import { loanOf } from "../../src/lib/calc/sensitivity.ts";
import { RESERVE } from "../../src/data/case-a-levers.ts";
import { CASE_A, SCENARIOS } from "../../src/data/case-a-mix.ts";
import { BANKS, bank, caseAFile, movesFor, planEquity } from "../../src/data/case-a-positioning.ts";
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

  // ── The small example: a disposable income of 10,000 and a line at 40% ──
  add(givenMoney("m.disposable", "10000"));
  add(given("m.line", "40"));
  const mMax = add(maxPayment("m.max", "10000", "40"));
  const mOver = add(givenMoney("m.pay_over", "4200"));
  const mUnder = add(givenMoney("m.pay_under", "3900"));
  add(difference("m.over", mOver, mMax));
  add(difference("m.room", mMax, mUnder));

  // ── The prediction: what 0.15 point of relief is worth to case A over the whole loan (bank א׳'s list, the initial mix) ──
  const listed = listTracks(A, caseAFile().tracks);
  const relieved = listed.map((t) => ({ ...t, rate: new Decimal(t.rate).minus(A.ratioReliefPoints).toFixed(2) }));
  add(given("pred.relief", A.ratioReliefPoints));
  add(totalFact("pred.total_0", listed, BASE));
  add(totalFact("pred.total_15", relieved, BASE));
  add(difference("pred.diff", get("pred.total_0"), get("pred.total_15")));
  add(totalFact("pred.first_0", listed, BASE, "first"));
  add(totalFact("pred.first_15", relieved, BASE, "first"));
  add(difference("pred.first_diff", get("pred.first_0"), get("pred.first_15")));

  // ── The five files of the day, read by bank א׳ ──
  DAY_FILES.forEach((d, i) => {
    const n = i + 1;
    verdictFacts(add, `d${n}`, A, d.file, opts);
    add(givenMoney(`d${n}.value`, String(d.file.value)));
    add(givenMoney(`d${n}.income`, String(d.file.income)));
    add(disposable(`d${n}.disposable`, String(d.file.income), d.file.obligations));
    add(totalFact(`d${n}.list_total`, listTracks(A, d.file.tracks), BASE));
  });
  // File 2 again, the way it stands one payment later: 18 payments of the car loan left, so it no longer counts (lesson 4.2).
  const f2 = DAY_FILES[1].file;
  const f2Later = { ...f2, obligations: [{ ...f2.obligations[0], monthsLeft: 18 }] };
  verdictFacts(add, "d2w", A, f2Later, opts);
  add(disposable("d2w.disposable", String(f2.income), f2Later.obligations));
  add(given("d2.months_left", 19));
  add(given("d2w.months_left", 18));
  add(givenMoney("d2.car", "1500"));
  add(sum("ex2.err_added", ["17000", "1500"]));
  add(difference("d2.later_gain", get("d2.total"), get("d2w.total")));

  // ── Case A: the rule's relief lines against the case, at bank א׳ ──
  add(givenMoney("a.price", CASE_A.price));
  add(givenMoney("a.income", CASE_A.recognisedIncome));
  add(given("a.car_months", CASE_A.car.monthsLeft as number));
  const aDisp = add(disposable("a.disposable", CASE_A.recognisedIncome, [CASE_A.car]));
  const line = add(maxPayment("a.line_payment", aDisp.value as string, A.ratioReliefLine as string));
  add(given("a.line", A.ratioReliefLine as string));
  add(maxPayment("ex3.err50", aDisp.value as string, "50"));
  add(maxPayment("ex3.err_rec", CASE_A.recognisedIncome, A.ratioReliefLine as string));

  // ── Case A read by the four banks (the family's request: the initial mix) ──
  for (const b of BANKS) {
    const p = `b.${b.id}`;
    const v = verdictFacts(add, p, b, caseAFile(), opts);
    add(totalFact(`${p}.qualifying`, v.listTracks, BASE, "qualifying"));
    if (b.ratioReliefLine !== null) {
      const bl = add(maxPayment(`${p}.line_payment`, aDisp.value as string, b.ratioReliefLine));
      add(difference(`${p}.over`, get(`${p}.qualifying`), bl));
      add(given(`${p}.line`, b.ratioReliefLine));
    }
  }
  add(difference("ex4.over", get("b.a.qualifying"), line));
  void line;

  // ── Case A with the plan's equity, read by bank א׳: the same file, 21,000 ₪ more of the savings ──
  const equity = planEquity().toString();
  add(givenMoney("plan.equity", equity));
  const planned = verdictFacts(add, "pa", A, caseAFile(movesFor({ equity })), opts);
  add(totalFact("pa.list_total", planned.listTracks, BASE));
  add(difference("pa.relief_gain", get("pa.list_total"), get("pa.total")));
  add(difference("pa.vs_base", get("b.a.total"), get("pa.total")));

  // ── Bank ד׳: the financing ceiling, and the equity the case would need ──
  const loan = loanOf(listTracks(bank("d"), caseAFile().tracks));
  const loanFact = add(givenMoney("a.loan", moneyString(loan)));
  const cap = add(maxLoanAt("d.max_loan", CASE_A.price, bank("d").ltvMax));
  const short = add(difference("d.short", loanFact, cap));
  add(givenMoney("a.reserve", RESERVE));
  add(difference("d.short_after_reserve", short, get("a.reserve")));
  add(ltv("a.ltv", moneyString(loan), CASE_A.price));

  // ── Exercise: the half-worked table of file 2's rates ──
  for (const k of ["prime", "variable_unlinked", "fixed_unlinked"] as const) add(given(`a.list_${k}`, A.prices[k]));

  return {
    lesson: "6.9",
    title: "סימולציה: יום אחד בתור חתם אשראי בבנק",
    note: "Four fictional banks (src/data/case-a-positioning.ts) with the price lists of lessons 6.6–6.8 and INVENTED rules (src/lib/calc/bankpolicy.ts): refuse above a line, take relief off the list at or below another. Nothing here is how a real bank decides or prices. The ratio is measured at the bank's own list rates, before any relief. The files of the day are invented households (src/data/underwriter-day.ts); the fifth is case A. Base scenario: the index rises 2% a year, prime does not move. Rates are the course's teaching rates, not market data and not an offer.",
    facts,
  };
}
