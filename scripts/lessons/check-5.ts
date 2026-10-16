/**
 * The stage-5 completion check (src/pages/checks/5.mdx): every number its
 * questions, answers and common wrong answers show, including the four
 * questions it repeats from stages 1, 2, 3 and 4 (lessons 1.2, 2.9, 3.9, 4.4).
 * Each fact reuses a kind a lesson already defined, through the lessons' own
 * fact builders (_offer-facts, _forecast-facts, _sensitivity-facts,
 * _mix-judge, lesson-3-8, regulation-facts, lesson-2-9), so
 * checks/independent_check.py rechecks every computed one with no new Python.
 *
 * Teaching numbers only: new inputs, not a lesson's worked example or exercise
 * (the sets of mixes of case A, of lessons 5.6-5.8, and the two offers of
 * 5.9-5.10 are the lessons' own, because they are the course's data files;
 * every question asks about a different amount, rate, goal or income). Every
 * bank, borrower and rate is invented ("בנק א׳"), every forecast and curve is
 * the course's illustration (src/data/offer-examples.ts, curves.ts), never the
 * Bank of Israel's. Directive 451 (the three baskets, the comparison measures,
 * the forecast table) and Directive 329 (the five lines) are the team's
 * transcription (Brain 7733250, 7503881), labelled "לא אומת" on the page: the
 * questions that lean on a rule state it as a premise, they never ask the
 * learner to produce it. Monthly rate = annual ÷ 12 (lesson 0.4; Brain ENG-223).
 * No question uses a bank's real behaviour, a real average, or an unverified
 * field claim.
 */
import Decimal from "decimal.js";
import { BANKS, FORECASTS, uniformOffer } from "../../src/data/offer-examples.ts";
import { CANDIDATES, CASE_A, INITIAL_MIX, PRICE_LIST, SCENARIOS, candidate, caseAPasses, caseADisposable } from "../../src/data/case-a-mix.ts";
import { basketById } from "../../src/lib/calc/offers.ts";
import { type Track } from "../../src/lib/calc/metrics.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { percentString } from "../../src/lib/calc/percent.ts";
import { effectiveAnnualRate, roundedString } from "../../src/lib/calc/rates.ts";
import { paymentToIncome } from "../../src/lib/calc/affordability.ts";
import { applyLever, qualifyingTotal, variableAmount } from "../../src/lib/calc/sensitivity.ts";
import { stressTracks } from "../../src/lib/calc/mixcheck.ts";
import type { TrackSpec } from "../../src/lib/calc/schedule.ts";
import type { Fact, LessonData } from "../build-data.ts";
import * as reg from "./regulation-facts.ts";
import * as M from "./lesson-3-8.ts";
import * as R from "./lesson-2-9.ts";
import * as F from "./_forecast-facts.ts";
import * as S from "./_sensitivity-facts.ts";
import { basis, lowest, measure, part, percentOf, canSplit } from "./_offer-facts.ts";
import { MIX_B, effectiveOf, pointsGap, measureFacts, bestRatesFact, loanOf, payOf, mixCheckFact, changingOf } from "./_mix-judge.ts";
import { withRates } from "../../src/lib/calc/mixcheck.ts";

/** The effective annual rate of a contract rate (monthly = annual ÷ 12), lesson 0.4 (the kind lesson 5.5 uses). */
const effective = (id: string, annual: string, decimals: number): Fact => ({
  id,
  kind: "effective_annual_rate",
  inputs: { annual_percent: annual, periods_per_year: 12, decimals },
  value: roundedString(effectiveAnnualRate(annual, 12), decimals),
});

/** A payment over a disposable income, in percent (lesson 4.3's kind). */
const ratioOf = (id: string, payment: string, disposable: string): Fact => ({
  id,
  kind: "aff_ratio",
  inputs: { payment, disposable },
  value: percentString(paymentToIncome(payment, disposable)),
});

/** A claim an answer option makes about computed numbers: the build fails if the data say otherwise. */
const claim = (ok: boolean, what: string) => {
  if (!ok) throw new Error(`check-5: ${what}`);
};

export default function check5(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);
  const adds = (fs: Fact[]) => fs.map(add);
  const get = (id: string) => facts.find((f) => f.id === id) as Fact;
  const v = (id: string) => get(id).value as string;
  const FC = FORECASTS;
  const bank = (id: "a" | "b" | "c") => BANKS.find((b) => b.id === id)!;

  // ═══ Review r1 (1.2): equity, loan and the financing ratio ═══
  add(reg.given("r1.price", "1850000"));
  add(reg.given("r1.equity", "600000"));
  add(reg.difference("r1.loan", get("r1.price"), get("r1.equity")));
  add(reg.ltv("r1.answer", v("r1.loan"), v("r1.price")));
  add(reg.ltv("r1.err_equity", v("r1.equity"), v("r1.price")));

  // ═══ Review r2 (2.9): level payments against equal principal, 500,000 ₪ at 3.9% for 20 years ═══
  const r2 = { principal: "500000", annual: "3.9", months: 240 };
  add(R.given("r2.principal", r2.principal));
  add(R.given("r2.rate", r2.annual));
  add(R.repMonths("r2.years", 20));
  add(R.repCell("r2.spitzer_first", "spitzer", r2.principal, r2.annual, r2.months, 1, "payment"));
  add(R.repCell("r2.equal_first", "equal_principal", r2.principal, r2.annual, r2.months, 1, "payment"));
  add(R.repTotalPaid("r2.spitzer_total", "spitzer", r2.principal, r2.annual, r2.months));
  add(R.repTotalPaid("r2.equal_total", "equal_principal", r2.principal, r2.annual, r2.months));

  // ═══ Review r3 (3.9): the interest in a level-payment loan ═══
  const r3: Track = { principal: "700000", rates: ["4.4"], months: 300 };
  add(M.given("r3.principal", "700000"));
  add(M.given("r3.rate", "4.4"));
  add(M.given("r3.years", "25"));
  add(M.first("r3.payment", [r3]));
  add(M.total("r3.total", [r3]));
  add(M.interest("r3.answer", r3));
  add(M.times("r3.err_times", get("r3.payment"), 300));

  // ═══ Review r4 (4.4): the largest part that may carry a changing rate ═══
  add(reg.given("r4.loan", "1350000"));
  add(reg.maxVar("r4.answer", "1350000"));
  add(reg.minFix("r4.fixed", "1350000"));

  // ═══ 5.1: a pre-approval's figures — bank ב׳'s proposed mix on the second forecast, and bank ג׳'s on the first ═══
  const docB = bank("b").proposed("forecast_b");
  add(measure("q1.first", docB, FC, "first"));
  add(measure("q1.highest", docB, FC, "highest"));
  add(measure("q1.highest_month", docB, FC, "highest_month"));
  claim(Number(v("q1.highest")) > Number(v("q1.first")), "q1: the highest expected payment is above the first");
  const docA = bank("a").proposed("forecast_b");
  const c1First = add(measure("q2.first", docA, FC, "first"));
  const c1High = add(measure("q2.highest", docA, FC, "highest"));
  add(measure("q2.highest_month", docA, FC, "highest_month"));
  const c1Gap = add(M.difference("q2.gap", c1High, c1First));
  add(M.above("q2.answer", c1High, c1First, 1));
  add(M.share("q2.err_of_highest", c1Gap, c1High, 1));
  add(M.given("q2.highlight", "10"));

  // ═══ 5.2: the baskets, as the team transcribed them (given in the prompt as a premise) ═══
  add(M.given("q3.loan", "1350000.00"));
  add(canSplit("q3.can_split", "1350000.00", basketById("uniform_2")));
  add(part("q3.answer", "1350000.00", basketById("uniform_2"), "variable_linked"));
  add(percentOf("q3.err_33", "1350000.00", "33"));
  const propA = bank("a").proposed("forecast_a");
  const propB = bank("b").proposed("forecast_a");
  for (const [id, o] of [["a", propA], ["b", propB]] as const) {
    add(measure(`q4.${id}_first`, o, FC, "first"));
    add(measure(`q4.${id}_total`, o, FC, "total"));
    add(measure(`q4.${id}_rate`, o, FC, "rate", 2));
  }
  add(basis("q4.basis", [propA, propB]));
  add(lowest("q4.lowest_rate", [propA, propB], FC, "rate"));
  add(lowest("q4.lowest_total", [propA, propB], FC, "total"));
  add(M.difference("q4.first_gap", get("q4.b_first"), get("q4.a_first")));
  add(M.difference("q4.total_gap", get("q4.a_total"), get("q4.b_total")));
  claim(Number(v("q4.first_gap")) > 0 && Number(v("q4.total_gap")) > 0, "q4: bank א׳ must have the lower first payment and bank ב׳ the lower total");
  claim((get("q4.lowest_rate").value as string[]).join() === "בנק א׳" && (get("q4.lowest_total").value as string[]).join() === "בנק ב׳", "q4: the lowest rate is bank א׳'s, the lowest total bank ב׳'s");
  claim((get("q4.basis").value as string[]).includes("mix"), "q4: the two proposed baskets differ in mix");
  add(basis("q4.basis_uniform", [uniformOffer(bank("a"), basketById("uniform_3"), "forecast_a"), uniformOffer(bank("b"), basketById("uniform_3"), "forecast_a")]));
  claim((get("q4.basis_uniform").value as string[]).length === 0, "q4: the same basket at two banks is one basis");

  // ═══ 5.3: the measures, and the same basis ═══
  const u2 = (id: "a" | "b" | "c") => uniformOffer(bank(id), basketById("uniform_2"), "forecast_a");
  add(M.given("q5.loan", "900000.00"));
  for (const id of ["b", "c"] as const) {
    add(measure(`q5.${id}.total`, u2(id), FC, "total"));
    add(measure(`q5.${id}.first`, u2(id), FC, "first"));
    add(measure(`q5.${id}.rate`, u2(id), FC, "rate", 2));
  }
  add(basis("q5.basis", [u2("b"), u2("c")]));
  claim((get("q5.basis").value as string[]).length === 0, "q5: the two offers must be on one basis");
  add(M.difference("q5.answer", get("q5.b.total"), get("q5.c.total")));
  add(M.difference("q5.err_first", get("q5.b.first"), get("q5.c.first")));
  add(lowest("q5.lowest_total", [u2("b"), u2("c")], FC, "total"));
  claim((get("q5.lowest_total").value as string[]).join() === "בנק ג׳", "q5: bank ג׳ must have the lower total");
  claim(Number(v("q5.answer")) > 0, "q5: the answer is positive");
  const b3 = basketById("uniform_3");
  const smallA = uniformOffer(bank("a"), b3, "forecast_a", "700000.00");
  const bigB = uniformOffer(bank("b"), b3, "forecast_a", "900000.00");
  add(M.given("q6.loan_a", "700000.00"));
  add(M.given("q6.loan_b", "900000.00"));
  add(measure("q6.a_total", smallA, FC, "total"));
  add(measure("q6.b_total", bigB, FC, "total"));
  add(measure("q6.a_rate", smallA, FC, "rate", 2));
  add(measure("q6.b_rate", bigB, FC, "rate", 2));
  add(basis("q6.basis", [smallA, bigB]));
  add(lowest("q6.lowest_total", [smallA, bigB], FC, "total"));
  add(lowest("q6.lowest_rate", [smallA, bigB], FC, "rate"));
  add(measure("q6.a_total_900", uniformOffer(bank("a"), b3, "forecast_a", "900000.00"), FC, "total"));
  add(M.difference("q6.gap_unequal", get("q6.b_total"), get("q6.a_total")));
  add(M.difference("q6.gap_equal", get("q6.b_total"), get("q6.a_total_900")));
  claim((get("q6.basis").value as string[]).join() === "amount", "q6: only the amount differs");
  claim(Number(v("q6.gap_unequal")) > Number(v("q6.gap_equal")) && Number(v("q6.gap_equal")) > 0, "q6: the unequal-amount gap is the larger one");

  // ═══ 5.4: a forward anchor from two yields, and the payment after the first reset ═══
  add(F.num("q7.y5", "3.2"));
  add(F.num("q7.y10", "4.6"));
  add(F.forwardYieldsFact("q7.answer", "3.2", 5, "4.6", 10, 2));
  add(F.average("q7.err_avg", ["3.2", "4.6"], 2));
  add(F.growth("q7.g10", "4.6", 10, 4));
  add(F.growth("q7.g5", "3.2", 5, 4));
  add(F.growthRatio("q7.ratio", "3.2", 5, "4.6", 10, 4));
  const x8: Track = { principal: "320000", rates: ["4.3", "4.9"], blockMonths: 60, months: 300 };
  add(F.num("q8.loan", "320000.00"));
  add(F.num("q8.rate0", "4.3"));
  add(F.num("q8.anchor0", "3.8"));
  add(F.num("q8.anchor1", "4.4"));
  add(F.points("q8.spread", "minus", get("q8.rate0"), get("q8.anchor0"), 2));
  add(F.points("q8.rate1", "plus", get("q8.anchor1"), get("q8.spread"), 2));
  add(M.first("q8.first", [{ ...x8, rates: ["4.3"] }]));
  add(M.balanceAfter("q8.balance_60", x8, 60));
  add(M.payment("q8.answer", [x8], 61));
  add(M.payment("q8.err_flat", [{ ...x8, rates: ["4.3"] }], 61));
  add(M.payment("q8.err_anchor", [{ ...x8, rates: ["4.3", "4.4"] }], 61));
  add(M.first("q8.err_months", [{ principal: v("q8.balance_60"), rates: ["4.9"], months: 300 }]));

  // ═══ 5.5: an average is not a price; the language of the rate ═══
  add(F.num("q9.price_s", "4.1"));
  add(F.num("q9.price_m", "4.6"));
  add(F.num("q9.price_w", "5.3"));
  const monthX = ["4.1", "4.1", "4.1", "4.1", "4.1", "4.6", "4.6", "4.6", "5.3", "5.3"];
  const monthY = ["4.1", "4.1", "4.1", "4.6", "4.6", "4.6", "5.3", "5.3", "5.3", "5.3"];
  add(F.average("q9.x_avg", monthX, 2));
  add(F.average("q9.y_avg", monthY, 2));
  add(F.points("q9.gap", "minus", get("q9.y_avg"), get("q9.x_avg"), 2));
  claim(Number(v("q9.gap")) > 0, "q9: the average rose");
  add(F.num("q10.nominal", "4.9"));
  add(effective("q10.answer", "4.9", 2));

  // ═══ 5.6: the goals of a mix, on case A's candidate mixes ═══
  const ctx = { base: SCENARIOS.base, stress: SCENARIOS.stress };
  const FOUR = ["initial", "half", "linked", "short"];
  const mixOf = (id: string): S.Mix => ({ tracks: id === "initial" ? INITIAL_MIX : candidate(id).tracks, scenario: SCENARIOS.base });
  add(S.givenMoney("a.recognised", CASE_A.recognisedIncome));
  add(S.givenMoney("a.car", CASE_A.car.monthly));
  add(S.given("a.car_months", CASE_A.car.monthsLeft));
  add(S.difference("a.disposable", get("a.recognised"), get("a.car")));
  for (const id of FOUR) {
    add(S.mixFact(`q11.${id}.first`, mixOf(id), "first"));
    add(S.mixFact(`q11.${id}.max`, mixOf(id), "max"));
    add(S.mixFact(`q11.${id}.total`, mixOf(id), "total"));
  }
  add(S.rankFact("q11.rank_highest", { goal: "payment", month: "highest" }, CANDIDATES, ctx, FOUR));
  add(S.rankFact("q11.rank_first", { goal: "payment" }, CANDIDATES, ctx, FOUR));
  add(S.rankFact("q11.rank_total", { goal: "total" }, CANDIDATES, ctx, FOUR));
  const winner = (id: string) => (get(id).value as { id: string; rank: number | null }[]).find((r) => r.rank === 1)?.id;
  claim(winner("q11.rank_highest") === "half" && winner("q11.rank_first") === "linked" && winner("q11.rank_total") === "short", "q11: half wins the highest payment, linked the first, short the total");
  const halfQ = add(S.mixFact("q12.qualifying", mixOf("half"), "qualifying"));
  add(S.mixFact("q12.answer", mixOf("half"), "ratio"));
  add(ratioOf("q12.err_recognised", v("q12.qualifying"), v("a.recognised")));
  void halfQ;
  add(S.mixFact("q12.variable_share", mixOf("half"), "variable_share"));
  {
    candidate("half").tracks.forEach((t, k) => {
      add(S.givenMoney(`q12.amount_${k + 1}`, t.amount));
      add(S.given(`q12.rate_${k + 1}`, t.rate));
    });
  }

  // ═══ 5.7: levers, one at a time ═══
  const halfMix = mixOf("half");
  const half0Total = add(S.mixFact("q13.total", halfMix, "total"));
  const half0Max = add(S.mixFact("q13.max", halfMix, "max"));
  const idxTotal = add(S.leverFact("q13.index_total", halfMix, { lever: "index", points: "1" }, "total"));
  add(S.difference("q13.index_d_total", idxTotal, half0Total));
  claim(Number(v("q13.index_d_total")) === 0, "q13: the index moves nothing in a mix with no linked track");
  const mktMax = add(S.leverFact("q13.market_max", halfMix, { lever: "market", points: "1" }, "max"));
  add(S.difference("q13.market_d_max", mktMax, half0Max));
  const half0First = add(S.mixFact("q13.first", halfMix, "first"));
  const amtFirst = add(S.leverFact("q13.amount_first", halfMix, { lever: "amount", change: "-100000" }, "first"));
  add(S.difference("q13.amount_d_first", half0First, amtFirst));
  const termFirst = add(S.leverFact("q13.term_first", halfMix, { lever: "term", track: "all", months: -60 }, "first"));
  add(S.difference("q13.term_d_first", termFirst, half0First));
  const rateFirst = add(S.leverFact("q14.rate_first", halfMix, { lever: "rate", track: "all", points: "0.25" }, "first"));
  const rateD = add(S.difference("q14.rate_d_first", rateFirst, half0First));
  const termD = get("q13.term_d_first");
  const afterRate = applyLever(halfMix, { lever: "rate", track: "all", points: "0.25" });
  const comboFirst = add(S.leverFact("q14.combo_first", afterRate, { lever: "term", track: "all", months: -60 }, "first"));
  const comboD = add(S.difference("q14.combo_d", comboFirst, half0First));
  const comboSum = add(S.sumOf("q14.combo_sum", [rateD, termD]));
  add(S.difference("q14.answer", comboSum, comboD));
  claim(Number(v("q14.answer")) > 0, "q14: the two levers together move less than the sum of each alone");

  // ═══ 5.8: the alternatives, scenario by scenario, and the lines of 329 ═══
  const altMix = (id: string, sc: keyof typeof SCENARIOS): S.Mix => ({ tracks: id === "initial" ? INITIAL_MIX : candidate(id).tracks, scenario: SCENARIOS[sc] });
  for (const id of ["short", "linked", "fixed"]) {
    for (const sc of ["base", "stress", "relief"] as const) add(S.mixFact(`q15.${id}.${sc}.total`, altMix(id, sc), "total"));
  }
  add(S.difference("q15.answer", get("q15.linked.stress.total"), get("q15.short.stress.total")));
  add(S.difference("q15.err_mixed", get("q15.linked.stress.total"), get("q15.short.relief.total")));
  add(S.difference("q15.err_base", get("q15.linked.base.total"), get("q15.short.base.total")));
  const track = (kind: TrackSpec["kind"], amount: number, years: number): TrackSpec => ({ kind, amount: String(amount), rate: PRICE_LIST[kind], months: years * 12 });
  const advised: TrackSpec[] = [track("variable_linked", 1200000, 30), track("fixed_linked", 440000, 30)];
  const advisedMix: S.Mix = { tracks: advised, scenario: SCENARIOS.base };
  advised.forEach((t, k) => {
    add(S.givenMoney(`q16.amount_${k + 1}`, t.amount));
    add(S.given(`q16.rate_${k + 1}`, t.rate));
  });
  add(S.mixFact("q16.first", advisedMix, "first"));
  add(S.mixFact("q16.variable", advisedMix, "variable"));
  add(S.mixFact("q16.variable_share", advisedMix, "variable_share"));
  add(S.mixFact("q16.ratio", advisedMix, "ratio"));
  add(reg.maxVar("q16.max_variable", CASE_A.loan));
  add(S.difference("q16.over", get("q16.variable"), get("q16.max_variable")));
  add(
    reg.check("q16.check", {
      deal: CASE_A.deal,
      value: CASE_A.price,
      loan: CASE_A.loan,
      payment: moneyString(qualifyingTotal(advised)),
      income: moneyString(caseADisposable()),
      variable: moneyString(variableAmount(advised)),
      termMonths: 360,
    }),
  );
  const lines16 = Object.fromEntries((get("q16.check").value as { id: string; status: string }[]).map((l) => [l.id, l.status]));
  claim(lines16.variable === "over" && lines16.ltv === "within" && lines16.pti === "within" && lines16.term === "within", "q16: only the variable-part line is crossed");
  claim(Number(v("q16.first")) < Number(S.mixFact("t", mixOf("linked"), "first").value), "q16: the advised mix has the lower first payment");
  add(S.mixFact("q16.linked_first", mixOf("linked"), "first"));
  add(S.mixFact("q16.linked_variable_share", mixOf("linked"), "variable_share"));

  // ═══ 5.9: is the mix good? Same form of the rate; the scenario of the goal ═══
  add(M.given("q17.nominal", "4.5"));
  add(M.given("q17.avg", "4.55"));
  add(effectiveOf("q17.eff", "4.5", 4));
  add(pointsGap("q17.answer", get("q17.eff"), get("q17.avg"), 3));
  add(pointsGap("q17.err_nominal", get("q17.nominal"), get("q17.avg"), 2));
  adds(measureFacts("q18", MIX_B));
  add(M.highest("q18.high_flat", stressTracks(MIX_B, 0)));
  add(M.given("q18.ceiling", "7000"));
  add(M.difference("q18.flat_room", get("q18.ceiling"), get("q18.high_flat")));
  add(M.difference("q18.over", get("q18.high"), get("q18.ceiling")));
  add(M.given("q18.rise", "2"));
  claim(Number(v("q18.high_flat")) < 7000 && Number(v("q18.high")) > 7000, "q18: the ceiling holds without the scenario and breaks with it");

  // ═══ 5.10: is the mix realistic? The best rate at each bank is not an offer ═══
  const offersX = [
    ["4.8", "4.0", "4.6"],
    ["4.6", "4.2", "4.3"],
  ];
  const mixX = MIX_B.map((t, k) => ({ ...t, ratePercent: offersX[0][k] }));
  const mixY = withRates(mixX, offersX[1]);
  add(bestRatesFact("q19.best", offersX));
  const best = v("q19.best").split(",");
  const mixH = withRates(mixX, best);
  mixX.forEach((t, k) => add(M.given(`q19.x${k + 1}`, t.ratePercent)));
  mixY.forEach((t, k) => add(M.given(`q19.y${k + 1}`, t.ratePercent)));
  best.forEach((r, k) => add(M.given(`q19.h${k + 1}`, r)));
  adds(measureFacts("q19x", mixX));
  adds(measureFacts("q19y", mixY));
  adds(measureFacts("q19h", mixH));
  add(M.given("q19.income", "17500"));
  add(M.given("q20.income", "15500"));
  add(M.given("q19.value", "1700000"));
  const ctxH = { deal: "only_home" as const, value: "1700000", disposableIncome: "17500" };
  add(payOf("q19.h_pay", mixH));
  add(reg.ratio("q19.h_ratio", v("q19.h_pay"), "17500"));
  add(mixCheckFact("q19.h_check", mixH, ctxH));
  add(loanOf("q19.loan", mixH));
  add(changingOf("q19.changing", mixH));
  add(M.difference("q19.saving_y", get("q19y.total"), get("q19h.total")));
  add(M.difference("q19.saving_x", get("q19x.total"), get("q19h.total")));
  const lines19 = (get("q19.h_check").value as { id: string; status: string }[]).map((l) => l.status);
  claim(!lines19.includes("over") && Number(v("q19.saving_y")) > 0 && Number(v("q19.saving_x")) > 0, "q19: the combined mix passes every line and is cheaper than both offers");
  // Question 20: the payment that enters the ratio, against the line of the capital threshold.
  add(payOf("q20.pay", mixX));
  add(reg.maxPayment("q20.max40", "15500", "40"));
  add(M.difference("q20.answer", get("q20.pay"), get("q20.max40")));
  add(reg.ratio("q20.ratio", v("q20.pay"), "15500"));
  claim(Number(v("q20.answer")) > 0 && Number(v("q20.ratio")) < 50, "q20: above the capital line, below the ban");
  add(reg.maxPayment("q20.max50", "15500", "50"));
  add(M.difference("q20.err_to_50", get("q20.max50"), get("q20.pay")));

  void Decimal;
  return {
    lesson: "check-5",
    title: "בדיקת סיום שלב 5",
    note: "Teaching numbers only, new inputs. Each fact reuses a lesson's kind. Monthly rate = annual ÷ 12. Offers, banks and forecasts are the course's invented ones (not market data, not a bank's offer, not the Bank of Israel's forecast); the baskets, the comparison measures and the limits are the team's transcription of Directives 451 and 329 (unverified). Case A appears only in 5.6-5.8 questions, with the course's price list and the lessons' teaching scenarios.",
    facts,
  };
}
