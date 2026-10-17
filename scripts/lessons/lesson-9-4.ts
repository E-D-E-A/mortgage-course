/**
 * Lesson 9.4 — the same decision explained twice: to the client and to a professional reviewer (case A, נועם ושירה).
 * Stage-9 author B. Teaches no new term: it uses the numbers of lesson 9.3's recommendation (the fixed-only alternative at the
 * fictional bank ב׳, for the stated priority of certainty) and asks the learner to write what a client needs and what a reviewer needs.
 *
 * Built from author A's casefile.ts and the earlier stages' modules through _recommend-facts.ts, retyping nothing. The new kinds are
 * recommend.py's (rec_*); the lowest-of kind is casefile.py's (cf_lowest). Every number is the exercise's: the banks and their lines are
 * invented (lesson 6.9), the scenarios are the course's (lesson 8.10), the family's budget is the file's own assumption. The conflict of
 * interest is taught as a QUESTION; what the law and Mogi's policy say is not decided here (questions for Eylon and the lawyer).
 */
import Decimal from "decimal.js";
import { type AltId, householdIncome, incomeOf, planOf, incomeSheet, offerAt } from "../../src/lib/calc/casefile.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { FILE } from "../../src/data/case-a-final.ts";
import { SCENARIOS } from "../../src/data/case-a-mix.ts";
import { bank } from "../../src/data/case-a-positioning.ts";
import { CHOICE, REVIEW_MONTHS, RATE_MOVES, RUNNER_UP, THRESHOLD_PTI } from "../../src/data/case-a-recommendation.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { allCandidates, countFact, ctx, month61Facts, rankFact, rateMoveFacts } from "./_recommend-facts.ts";
import { scnEvalFact } from "./_stage8b-facts.ts";
import { average, untilDrop } from "./affordability-facts.ts";
import { difference, given, givenMoney } from "./_sensitivity-facts.ts";
import { disposable, maxLoan, maxPayment, ratio as ratioFact } from "./regulation-facts.ts";
import { totalFact } from "./_bankpolicy-facts.ts";

const BASE = SCENARIOS.base;
const ALTS = ["payment", "total", "exposure"] as const;
const BANK4 = ["a", "b", "c", "d"] as const;

export default function lesson94(): LessonData {
  const facts: Fact[] = [];
  const c = ctx(facts);
  const { add, get } = c;
  const num = (id: string) => new Decimal(get(id).value as string);

  // ── The file ──
  const plan = planOf();
  const sheet = incomeSheet();
  add(givenMoney("in.price", FILE.price));
  add(givenMoney("in.loan", plan.loan.toString()));
  add(givenMoney("in.reserve_after", plan.reserveAfter.toString()));
  add(givenMoney("in.budget", sheet.livingBudget.toString()));
  add(givenMoney("in.recognised", householdIncome().recognised.toString()));
  add(givenMoney("in.car_monthly", new Decimal(FILE.car.monthly).toString()));
  add(given("in.car_left", FILE.car.monthsLeft as number));
  add(given("in.line40", THRESHOLD_PTI));
  add(given("in.ceiling", "75"));

  // ── Every candidate, with the reason it falls out ──
  const cand = allCandidates(c);
  const pairs = ALTS.flatMap((a) => BANK4.map((b) => `${a}.${b}`));
  const stages = pairs.map((k) => String(get(`g.${k}.stage`).value));
  add(given("fn.pairs", pairs.length));
  add(countFact("fn.refused", stages, "refused"));
  add(countFact("fn.budget", stages, "budget"));
  add(countFact("fn.ok", stages, "ok"));
  add(given("fn.rejected", pairs.length - 1)); // every candidate but the chosen one
  const expect = (cond: boolean, what: string) => {
    if (!cond) throw new Error(`lesson 9.4: the page says "${what}", and the numbers no longer agree`);
  };
  expect(stages.filter((s) => s === "refused").length === 3 && stages.filter((s) => s === "budget").length === 1, "three candidates are refused and one breaks the budget");

  month61Facts(c, "g.total.b", cand["total.b"].tracks!);

  // ── The chosen pair ──
  const ch = `g.${CHOICE.alt}.${CHOICE.bank}`;
  const chOffer = cand[`${CHOICE.alt}.${CHOICE.bank}`];
  if (!chOffer.approved || !chOffer.tracks) throw new Error("the chosen pair is not approved");
  add(disposable("ch.disp", householdIncome().recognised.toString(), [FILE.car]));
  add(maxPayment("ch.line", String(get("ch.disp").value), THRESHOLD_PTI));
  add(totalFact("ch.qual", chOffer.verdict.listTracks, BASE, "qualifying"));
  add(difference("ch.room40", get("ch.line"), get("ch.qual")));

  // ── The price of the choice, and the pick among banks ──
  const B = CHOICE.bank;
  add(difference("pc.total_vs_total", get(`${ch}.total`), get(`g.total.${B}.total`)));
  add(difference("pc.total_vs_payment", get(`g.payment.${B}.total`), get(`${ch}.total`)));
  add(difference("pc.first_vs_payment", get(`${ch}.first`), get(`g.payment.${B}.first`)));
  add(difference("pc.first_vs_total", get(`g.total.${B}.first`), get(`${ch}.first`)));
  add(difference("pc.margin_vs_total", get(`${ch}.margin60`), get(`g.total.${B}.margin60`)));
  add(rankFact("pick.rank", (["a", "b", "c"] as const).map((b) => String(get(`g.exposure.${b}.total`).value)), String(get(`${ch}.total`).value)));
  add(difference("pick.gap_c", get(`g.${RUNNER_UP.alt}.${RUNNER_UP.bank}.total`), get(`${ch}.total`)));
  add(difference("pick.gap_a", get("g.exposure.a.total"), get(`${ch}.total`)));
  add(difference("pick.ratio_a_over", get("g.exposure.a.ratio"), get("in.line40")));

  // ── Who wins under each priority (among the candidates that pass the hard filters) ──
  const okPairs = pairs.filter((k) => get(`g.${k}.stage`).value === "ok");
  const lowest = (id: string, keys: string[], what: "first" | "total") => {
    const values = keys.map((k) => num(`g.${k}.${what}`));
    let best = 0;
    values.forEach((v, i) => {
      if (v.lt(values[best])) best = i;
    });
    add({ id, kind: "cf_lowest", inputs: { ids: keys.map((k) => `g.${k}.${what}`).join("|"), labels: keys.join("|") }, value: keys[best] });
    return keys[best];
  };
  const wFirst = lowest("win.first", okPairs, "first");
  const wTotal = lowest("win.total", okPairs, "total");
  const wCertain = lowest("win.certain", okPairs.filter((k) => k.startsWith("exposure.")), "total");
  expect(wFirst === `payment.${B}` && wTotal === `total.${B}` && wCertain === `exposure.${B}`, "each priority has its own winner at bank ב׳");

  // ── The family's budget: the living budget at which each choice at bank ב׳ breaks ──
  for (const a of ALTS) add({ id: `sens.limit.${a}`, kind: "sum_of_facts", inputs: { terms: `in.budget,g.${a}.${B}.margin60` }, value: moneyString(num("in.budget").plus(num(`g.${a}.${B}.margin60`))) });

  // ── The appraisal: the page names one low appraisal and what is short ──
  add(givenMoney("ap.2100000.value", "2100000"));
  add(maxLoan("ap.2100000.max_loan", moneyString("2100000"), "only_home"));
  add(difference("ap.2100000.extra", get("in.loan"), get("ap.2100000.max_loan")));
  add(difference("ap.2100000.short", get("ap.2100000.extra"), get("in.reserve_after")));
  expect(num("ap.2100000.short").gt(0), "a low appraisal leaves the savings short");

  // ── The rate: what if the bank raises the fixed rate before signing ──
  RATE_MOVES.forEach((pts, k) => rateMoveFacts(c, "mv", k, pts, chOffer.verdict.listTracks, chOffer.tracks!, BASE));

  // ── The scenarios: does the ranking of the totals change with the scenario? ──
  for (const a of ALTS) {
    const t = cand[`${a}.${B}`].tracks!;
    add(scnEvalFact(`sc.${a}.stress_total`, "stress", t, "total"));
    add(scnEvalFact(`sc.${a}.macro_total`, "macro", t, "total"));
  }
  const order = (key: (a: AltId) => Decimal) => [...ALTS].sort((x, y) => key(x).comparedTo(key(y))).join(">");
  const base = order((a) => num(`g.${a}.${B}.total`));
  expect(order((a) => num(`sc.${a}.stress_total`)) === base && order((a) => num(`sc.${a}.macro_total`)) === base, "the order of the totals is the same in the three scenarios");
  expect(num("sc.exposure.stress_total").eq(num(`${ch}.total`)) && num("sc.exposure.macro_total").eq(num(`${ch}.total`)), "a fixed unlinked loan costs the same in every scenario");
  // the price of certainty against the 25-year alternative, in each scenario: the same fixed loan, a different variable one
  add(difference("sens.gap_base", get(`g.exposure.${B}.total`), get(`g.total.${B}.total`)));
  add(difference("sens.gap_stress", get("sc.exposure.stress_total"), get("sc.total.stress_total")));
  add(difference("sens.gap_macro", get("sc.exposure.macro_total"), get("sc.total.macro_total")));
  expect(num("sens.gap_stress").gt(0) && num("sens.gap_stress").lt(num("sens.gap_base")) && num("sens.gap_macro").gt(num("sens.gap_base")), "the price of certainty is smallest in stress and largest in the macro path");
  add(difference("sens.payment_stress_over", get("sc.payment.stress_total"), get("sc.exposure.stress_total")));

  // ── When to look again: the car loan stops counting, and the ratio it shows ──
  add(untilDrop("rv.until_drop", FILE.car.monthsLeft as number));
  add(ratioFact("rv.ratio_free", String(get(`${ch}.first`).value), String(get("in.recognised").value)));
  add(difference("rv.ratio_gain", get(`${ch}.ratio`), get("rv.ratio_free")));
  add(given("rv.months", REVIEW_MONTHS));
  // the same number, two stories (lesson 6.5): the ratio when the car loan is HIDDEN is the ratio after it has ENDED
  expect(get("rv.ratio_free").value !== get(`${ch}.ratio`).value, "hiding the loan shows a lower ratio");

  // ── The red lines on this file: a one-off payment that would inflate an income ──
  const shira = incomeOf("shira");
  add(average("rl.shira_naive", shira.rows.map((r) => moneyString(r.net))));
  add(average("rl.shira_recognised", shira.rows.map((r) => moneyString(r.recognisedNet))));
  add(difference("rl.shira_gap", get("rl.shira_naive"), get("rl.shira_recognised")));
  add(givenMoney("rl.oneoff", shira.oneOffs.toString()));

  // ── Rules of the banks, as the page names them ──
  add(given("rule.d_ceiling", bank("d").ltvMax));
  add(given("rule.b_ratio_max", bank("b").ratioMax));
  void offerAt;

  return {
    lesson: "9.4",
    title: "הסבר כפול: מה נבחר, מה נפסל, מה המחיר, ומתי לבחון מחדש",
    note: "The recommendation of lesson 9.3 (case A: the fixed-only alternative at the fictional bank ב׳, for the stated priority of certainty) explained to a client and to a reviewer. Numbers come from src/lib/calc/casefile.ts (author A) and the earlier modules; all banks, their lines and prices, the scenarios (lesson 8.10) and the family's living budget are the course's own invented or illustrative assumptions. The conflict of interest of an advisor is taught as a question: what the law and Mogi's policy allow is not decided here. The review period (24 months) is a proposal, not a rule.",
    facts,
  };
}
