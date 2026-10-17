/**
 * Lesson 9.3 — the whole file, part three: the recommendation, the negotiation plan and the checks before the loan is released
 * (case A, נועם ושירה). Stage-9 author B.
 *
 * Built from author A's casefile.ts (the offers of the three alternatives at the four fictional banks, the three scenarios, the
 * family's budget) and the earlier stages' modules, retyping nothing: the clocks and the exercise's rules for a round of
 * negotiation are lesson 6.6–6.7's (outreach.ts, ROUND_RULE, NEGOTIATION), the appraisal arithmetic is lesson 4.9's (ltv.ts,
 * regulation.ts), the banks' RULES are lesson 6.9's invented ones. The choice (src/data/case-a-recommendation.ts) is ONE reasonable
 * recommendation for a stated priority; nothing here says what a real bank would do, and nothing here is advice to a real client.
 *
 * Every number the page, its exercises, the report template and the video show is a fact here. The facts about a candidate (an
 * alternative read by a bank) come from _recommend-facts.ts; the new fact kinds are recommend.py's (rec_*); the window facts are
 * casefile.py's (cf_window).
 */
import Decimal from "decimal.js";
import { fileOf, householdIncome, incomeSheet, offerAt, planOf } from "../../src/lib/calc/casefile.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { bankClocks, applyEdit, type BankRequest, WINDOW_DAYS } from "../../src/lib/calc/outreach.ts";
import { CALENDAR_2026 } from "../../src/lib/calc/process.ts";
import { FILE } from "../../src/data/case-a-final.ts";
import { SCENARIOS } from "../../src/data/case-a-mix.ts";
import { NEGOTIATION, ROUND_RULE } from "../../src/data/case-a-offers.ts";
import { ANSWER_AFTER, BANKS, bank, LEFT_OUT, PLAN_BANKS, REQUEST_DATE } from "../../src/data/case-a-positioning.ts";
import { APPRAISAL_CASES, CHOICE, OTHER_PRIORITY, RATE_MOVES, RUNNER_UP, THRESHOLD_PTI, TODAY } from "../../src/data/case-a-recommendation.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { allCandidates, countFact, ctx, fixed25Facts, month61Facts, rankFact, rateMoveFacts } from "./_recommend-facts.ts";
import { clocksFact, daysUntilFact, effectFact, eventsInsideFact, governingFact, latestStartFact, roundAnswerFact, roundFitsFact, roundsFitFact } from "./_outreach-facts.ts";
import { difference, given, givenMoney } from "./_sensitivity-facts.ts";
import { disposable, ltv as ltvFact, maxLoan, maxPayment } from "./regulation-facts.ts";
import { totalFact } from "./_bankpolicy-facts.ts";
import lesson010 from "./lesson-0-10.ts";

const cal = CALENDAR_2026;
const BASE = SCENARIOS.base;

export default function lesson93(): LessonData {
  const facts: Fact[] = [];
  const c = ctx(facts);
  const { add, get } = c;
  const decisions = (lesson010().facts.find((f) => f.id === "decision.upcoming")?.value ?? []) as string[];
  if (decisions.length < 2) throw new Error("lesson 0.10 no longer lists two upcoming decisions");

  // ── The file, as 9.1 and 9.2 leave it ──
  const plan = planOf();
  const sheet = incomeSheet();
  add(givenMoney("in.price", FILE.price));
  add(givenMoney("in.loan", plan.loan.toString()));
  add(givenMoney("in.reserve", plan.reserve.toString()));
  add(givenMoney("in.reserve_after", plan.reserveAfter.toString()));
  add(givenMoney("in.budget", sheet.livingBudget.toString()));
  add(givenMoney("in.recognised", householdIncome().recognised.toString()));
  add(given("in.ceiling", "75"));
  add(given("in.line40", THRESHOLD_PTI));
  add(given("in.today", TODAY));
  add(given("in.car_left", FILE.car.monthsLeft as number));
  add(given("in.window", 60));

  // ── Every candidate: the three alternatives at the four banks ──
  const cand = allCandidates(c);
  const pairs = (["payment", "total", "exposure"] as const).flatMap((a) => (["a", "b", "c", "d"] as const).map((b) => `${a}.${b}`));
  const stages = pairs.map((k) => String(get(`g.${k}.stage`).value));
  add(given("fn.pairs", pairs.length));
  add(countFact("fn.approved", pairs.map((k) => String(get(`g.${k}.decision`).value)), "approve"));
  add(countFact("fn.refused", stages, "refused"));
  add(countFact("fn.budget", stages, "budget"));
  add(countFact("fn.ok", stages, "ok"));
  for (const a of ["payment", "total", "exposure"] as const) {
    add(countFact(`fn.ok.${a}`, (["a", "b", "c", "d"] as const).map((b) => String(get(`g.${a}.${b}.stage`).value)), "ok"));
    add(countFact(`fn.over40.${a}`, (["a", "b", "c", "d"] as const).map((b) => String(get(`g.${a}.${b}.flag40`).value)), "over"));
  }

  // The page's narrative leans on these; if the model changes and one stops holding, the build says which.
  const expect = (cond: boolean, what: string) => {
    if (!cond) throw new Error(`lesson 9.3: the page says "${what}", and the numbers no longer agree`);
  };
  expect(["payment", "total", "exposure"].every((a) => get(`g.${a}.d.stage`).value === "refused"), "bank ד׳ refuses every alternative");
  expect(stages.filter((s) => s === "budget").length === 1 && get("g.total.c.stage").value === "budget", "only 25 years at bank ג׳ breaks the budget");
  expect(get("g.exposure.a.flag40").value === "over" && get("g.exposure.b.flag40").value === "under" && get("g.exposure.c.flag40").value === "under", "only the fixed alternative at bank א׳ is over the 40% line");
  expect(["a", "c"].every((b) => new Decimal(get(`g.exposure.${b}.total`).value as string).gt(get("g.exposure.b.total").value as string)), "bank ב׳ has the lowest total for the fixed alternative");
  expect(["payment", "total"].every((a) => new Decimal(get(`g.${a}.b.rise`).value as string).gt(get("g.exposure.b.rise").value as string)), "the fixed alternative has the smallest rise");
  expect(new Decimal(get("g.payment.b.first").value as string).lt(get("g.exposure.b.first").value as string) && new Decimal(get("g.total.b.first").value as string).gt(get("g.exposure.b.first").value as string), "the linked one has the lowest first payment, the 25-year one a higher one than the fixed one");
  expect(new Decimal(get("g.total.b.total").value as string).lt(get("g.exposure.b.total").value as string) && new Decimal(get("g.payment.b.total").value as string).gt(get("g.exposure.b.total").value as string), "the 25-year one has the lowest total, the linked one the highest");

  month61Facts(c, "g.total.b", cand["total.b"].tracks!);
  fixed25Facts(c, "b");

  // ── The chosen pair, and the numbers of the recommendation ──
  const ch = `g.${CHOICE.alt}.${CHOICE.bank}`;
  const chOffer = cand[`${CHOICE.alt}.${CHOICE.bank}`];
  if (!chOffer.approved || !chOffer.tracks) throw new Error("the chosen pair is not approved");
  add(disposable("ch.disp", householdIncome().recognised.toString(), [FILE.car]));
  add(maxPayment("ch.line", String(get("ch.disp").value), THRESHOLD_PTI));
  const listTracks = chOffer.verdict.listTracks;
  add(totalFact("ch.qual", listTracks, BASE, "qualifying"));
  add(difference("ch.room40", get("ch.line"), get("ch.qual")));
  // the room agrees with author A's numbersFor
  {
    const a = offerAt(CHOICE.alt, CHOICE.bank);
    const room = sheet.max40.minus(a.verdict.listPayment);
    if (moneyString(room) !== get("ch.room40").value) throw new Error(`room to 40% differs from casefile.ts: ${room} vs ${get("ch.room40").value}`);
  }

  // price of the choice against the other alternatives, at the same bank
  const OB = OTHER_PRIORITY.bank;
  add(difference("pc.total_vs_total", get(`${ch}.total`), get(`g.total.${CHOICE.bank}.total`)));
  add(difference("pc.total_vs_payment", get(`g.payment.${CHOICE.bank}.total`), get(`${ch}.total`)));
  add(difference("pc.first_vs_payment", get(`${ch}.first`), get(`g.payment.${OB}.first`)));
  add(difference("pc.first_vs_total", get(`g.total.${CHOICE.bank}.first`), get(`${ch}.first`)));
  add(difference("pc.margin_vs_total", get(`${ch}.margin60`), get(`g.total.${CHOICE.bank}.margin60`)));

  // the pick among the banks for the chosen alternative
  const banksOk = (["a", "b", "c"] as const).map((b) => `g.${CHOICE.alt}.${b}`);
  const totals = banksOk.map((k) => String(get(`${k}.total`).value));
  add(rankFact("pick.rank", totals, String(get(`${ch}.total`).value)));
  add(difference("pick.gap_c", get(`g.${RUNNER_UP.alt}.${RUNNER_UP.bank}.total`), get(`${ch}.total`)));
  add(difference("pick.gap_a", get(`g.${CHOICE.alt}.a.total`), get(`${ch}.total`)));
  add(difference("pick.ratio_a_over", get(`g.${CHOICE.alt}.a.ratio`), get("in.line40")));
  add(difference("pick.ratio_room", get("in.line40"), get(`${ch}.ratio`)));

  // ── The clocks: when the approvals end, and the negotiation that fits inside them ──
  add(given("o.request", REQUEST_DATE));
  add(given("o.window", WINDOW_DAYS));
  add(given("o.round_days", ROUND_RULE.roundDays));
  add(given("o.round_reserve", ROUND_RULE.reserve));
  add(given("o.decision", decisions[1]));
  const requests: Record<string, BankRequest> = Object.fromEntries(
    BANKS.map((b) => [b.id, { name: b.name, requested: REQUEST_DATE, answeredAfter: ANSWER_AFTER[b.id as "a"], extended: b.id === LEFT_OUT, newLien: true }]),
  );
  const clocks = PLAN_BANKS.map((id) => {
    add(clocksFact(`o.${id}.approved`, requests[id], cal, "approved"));
    add(clocksFact(`o.${id}.valid_until`, requests[id], cal, "valid_until"));
    add(daysUntilFact(`o.${id}.left`, TODAY, bankClocks(requests[id], cal).validUntil));
    return bankClocks(requests[id], cal);
  });
  add(governingFact("o.governing", clocks));
  const validB = bankClocks(requests[CHOICE.bank], cal).validUntil;
  add(roundAnswerFact("o.round.answer", TODAY, ROUND_RULE.roundDays, cal));
  add(roundFitsFact("o.round.fits", TODAY, validB, ROUND_RULE.roundDays, ROUND_RULE.reserve, cal));
  add(roundsFitFact("o.rounds_count", TODAY, validB, ROUND_RULE.roundDays, ROUND_RULE.reserve, cal, "count"));
  add(roundsFitFact("o.rounds_last_start", TODAY, validB, ROUND_RULE.roundDays, ROUND_RULE.reserve, cal, "last_start"));
  add(latestStartFact("o.round.latest", validB, ROUND_RULE.roundDays, ROUND_RULE.reserve, TODAY, cal));
  add(eventsInsideFact("o.decision_inside", [decisions[1]], REQUEST_DATE, validB));
  add(daysUntilFact("o.decision_in", TODAY, decisions[1]));
  add(given("o.threshold", NEGOTIATION.threshold));

  // the exercise's rounds on the chosen offer: 0.10 off every track, then 0.05 off the fixed one
  const t0 = chOffer.tracks;
  const edits = NEGOTIATION.rounds;
  add(given("r1.points", new Decimal(edits[0].points).abs().toString()));
  add(given("r2.points", new Decimal(edits[1].points).abs().toString()));
  add(effectFact("r1.total", t0, BASE, edits[0], "total_gain"));
  add(effectFact("r1.first", t0, BASE, edits[0], "first_gain"));
  const t1 = applyEdit(t0, edits[0]);
  add(effectFact("r2.total", t1, BASE, edits[1], "total_gain"));
  add(effectFact("r2.first", t1, BASE, edits[1], "first_gain"));
  {
    const sum = new Decimal(get("r1.total").value as string).plus(get("r2.total").value as string);
    add({ id: "r.both_total", kind: "sum_of_facts", inputs: { terms: "r1.total,r2.total" }, value: moneyString(sum) });
  }
  // a base-scenario fixed offer has the same first payment and total as the 451 reading (a fixed unlinked track does not move)
  {
    const base0 = effectFact("tmp", t0, BASE, edits[0], "first_before").value;
    if (base0 !== get(`${ch}.first`).value) throw new Error(`the teaching base and the 451 scenario disagree on a fixed track: ${base0} vs ${get(`${ch}.first`).value}`);
    const tot0 = effectFact("tmp", t0, BASE, edits[0], "total_before").value;
    if (tot0 !== get(`${ch}.total`).value) throw new Error("the teaching base and the 451 scenario disagree on the total of a fixed track");
  }

  // ── Between the approval and the money: the appraisal ──
  const loan = plan.loan.toString();
  add({ id: "ap.break_even", kind: "ltv_min_value", inputs: { loan: moneyString(loan), ceiling: "75" }, value: moneyString(new Decimal(loan).mul(100).div(75)) });
  add(difference("ap.margin", get("in.price"), get("ap.break_even")));
  for (const v of APPRAISAL_CASES) {
    const k = `ap.${v}`;
    add(givenMoney(`${k}.value`, v));
    add(difference(`${k}.under`, get("in.price"), get(`${k}.value`)));
    add(ltvFact(`${k}.ltv`, moneyString(loan), moneyString(v)));
    add(maxLoan(`${k}.max_loan`, moneyString(v), "only_home"));
    add(difference(`${k}.room`, get(`${k}.max_loan`), get("in.loan")));
    if (new Decimal(get(`${k}.room`).value as string).isNeg()) {
      add(difference(`${k}.extra`, get("in.loan"), get(`${k}.max_loan`)));
      add(difference(`${k}.left`, get("in.reserve_after"), get(`${k}.extra`)));
      if (new Decimal(get(`${k}.left`).value as string).isNeg()) add(difference(`${k}.short`, get(`${k}.extra`), get("in.reserve_after")));
    }
  }

  // ── Between the approval and the money: the fixed rate moves before signing (a "what if", not a forecast) ──
  for (const [k, pts] of RATE_MOVES.entries()) rateMoveFacts(c, "mv", k, pts, listTracks, t0, BASE);

  // ── The number kinds, so the table of "which number is this" has its counts ──
  add(given("nk.kinds", 4));

  // ── Exercises' wrong answers ──
  add({ id: "ex.sum_first", kind: "sum_of_facts", inputs: { terms: `${ch}.first,g.payment.${OB}.first` }, value: moneyString(new Decimal(get(`${ch}.first`).value as string).plus(get(`g.payment.${OB}.first`).value as string)) });

  // keep the chosen bank's rule visible to the page
  add(given("rule.d_ceiling", bank("d").ltvMax));
  add(given("rule.b_ratio_max", bank("b").ratioMax));
  add(given("ap.reuse_days", 90));
  add(given("rule.b_relief_line", bank("b").ratioReliefLine ?? "none"));
  void ltvFact;

  return {
    lesson: "9.3",
    title: "התיק המסכם, ג׳: המלצה, משא ומתן ובדיקות לקראת העמדה",
    note: "Case A's whole file (src/lib/calc/casefile.ts, author A) read by the four fictional banks of lessons 6.6–6.9 under the Directive 451 base scenario, the stress scenario and the macro one of lesson 8.10 (all illustrative). ONE reasonable choice for the stated priority (src/data/case-a-recommendation.ts): the alternative of the smallest exposure at the bank with the lowest total among those that approve it. Rules of the exercise, not of any bank: the banks' lines and reliefs (lesson 6.9), a negotiation round of 3 business days and 7 days left after the answer, the 10,000 ₪ line that stops a round, a rise of the fixed rate before signing as a 'what if'. The family's budget (11,500 ₪) is the file's own assumption. The appraisal rule uses the lower of the appraisal and the price (lesson 4.9, the team's transcription, not verified). Nothing here says what a real bank does.",
    facts,
  };
}
