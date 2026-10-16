/**
 * Lesson 7.4 — refinancing: when it pays. The two figures of Directive 451 §15א as the team transcribed them
 * (Brain 7733250, read 3 August 2026; not checked against the directive): the expected total rate of an existing loan
 * (the fee excluded) and the rate for comparison purposes (the early-repayment fee added to what is owed), per track and
 * for the whole loan; the regulator's sentence that compares the second with the new loan's expected total rate; and
 * "a lower payment is not a total saving": the payment, the rate and the total can each point a different way.
 *
 * The existing loan is the worked example of the early-repayment fee (lesson 7.2), the team's own computation, carried
 * unrounded: 700,000 ₪, fixed unlinked, 5.90% nominal, 20 years, 37 payments made. The fee is lesson 7.2's result (a
 * `given` here: this module does not compute it). Everything else is invented: the banks, their rates and terms, the new
 * loan's up-front costs, the second existing loan (three tracks) and its fees.
 *
 * Every number the page, its exercises, its illustration's guided tasks and its video show is a fact here;
 * checks/kinds/refinance.py recomputes the new ones (ref_*), checks/kinds/metrics.py the schedule ones (met_*).
 */
import Decimal from "decimal.js";
import type { Track } from "../../src/lib/calc/metrics.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { existingLoan } from "../../src/lib/calc/refinance.ts";
import { bank, CASE_C_DISCOUNT_FEE, CASE_C_LOAN, CASE_C_PAID, NEW_LOAN_COSTS, OPERATIONAL_FEE, PRESETS, REFINANCE_FORECAST } from "../../src/data/refinance-examples.ts";
import { fixedOffer } from "../../src/lib/calc/refinance.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, effective, given, irr, irrEffective, irrX12, payment, pv, sumOf, times, total, first } from "./lesson-3-8.ts";
import { type ExistingSpec, monthsKept, stay, sw } from "./_refinance-facts.ts";
import { fee as erFee } from "./_earlyrepay-facts.ts";
import { caseC } from "./lesson-7-1.ts";

const F = [REFINANCE_FORECAST];

export default function lesson74(): LessonData {
  const facts: Fact[] = [];
  const push = (...f: Fact[]) => facts.push(...f);
  const byId = (id: string) => facts.find((x) => x.id === id) as Fact;

  push(given("data_date", "2026-10-16"));

  // ── The small example: the numbers of lesson 3.10 (30,000 ₪, 6% a year, three months), read the other way round. ──
  // Lesson 3.10: a fee taken on the day the money arrives, so less is received. Here: a fee paid to be free of a loan
  // that has three payments left, so more is owed.
  const small: Track = { principal: "30000", rates: ["6"], months: 3 };
  const sBalance = given("s.balance", "30000.00");
  const sFee = given("s.fee", "150.00");
  push(
    sBalance,
    sFee,
    sumOf("s.financed", [sBalance, sFee]),
    first("s.payment", [small]),
    payment("s.last", [small], 3),
    total("s.total", [small]),
    pv("s.pv_own", [small], "0.5", "monthly"),
    irr("s.irr0", [small], "30000", 4),
    irrEffective("s.eff0", [small], "30000", 2),
    irr("s.irr1", [small], "30150", 4),
    irrX12("s.x12_1", [small], "30150", 2),
    irrEffective("s.eff1", [small], "30150", 2),
    pv("s.pv_check", [small], "0.2494", "monthly"),
    // The same fee counts the other way in lesson 3.10: received = P − T.
    difference("s.received_310", sBalance, sFee),
  );

  // ── The existing loan of תיק ג׳: the fixture. ──
  // The fee is lesson 7.2's result (src/lib/calc/earlyrepay.ts, checked by checks/kinds/earlyrepay.py). The refinance module
  // takes it as an input (src/data/refinance-examples.ts); the build stops if the two ever disagree.
  const feeDiscount = erFee("old.fee_discount", caseC, "discount");
  const feeOperational = erFee("old.fee_operational", caseC, "operational");
  if (feeDiscount.value !== CASE_C_DISCOUNT_FEE || feeOperational.value !== OPERATIONAL_FEE) {
    throw new Error(`the fee of lesson 7.2 (${feeDiscount.value} + ${feeOperational.value}) is no longer the fee in refinance-examples.ts (${CASE_C_DISCOUNT_FEE} + ${OPERATIONAL_FEE})`);
  }
  push(
    given("old.loan", "700000.00"),
    given("old.paid", String(CASE_C_PAID)),
    feeDiscount,
    feeOperational,
    sumOf("old.fee_total", [feeDiscount, feeOperational]),
  );
  const S: ExistingSpec = { tracks: [CASE_C_LOAN], paid: [CASE_C_PAID], fees: [CASE_C_DISCOUNT_FEE], shared: OPERATIONAL_FEE };
  push(
    stay("old.balance", S, "whole", "balance"),
    stay("old.months", S, "whole", "months"),
    stay("old.first", S, "whole", "first"),
    stay("old.total", S, "whole", "total"),
    stay("old.financed", S, "whole", "financed"),
    stay("old.irr0", S, "whole", "irr_without", 4),
    stay("old.rate0", S, "whole", "rate_without", 2),
    stay("old.rate0_4", S, "whole", "rate_without", 4),
    stay("old.irr1", S, "whole", "irr_with", 4),
    stay("old.rate1", S, "whole", "rate_with", 2),
    stay("old.rate1_4", S, "whole", "rate_with", 4),
    // The same track alone (the ₪60 is in the whole-loan figure only).
    stay("old.track_fee", S, 0, "fee"),
    stay("old.track_rate1", S, 0, "rate_with", 2),
    // The contract's own yearly rate: the first figure is the contract's rate, taken as an effective yearly rate.
    effective("old.contract_eff", "0.4917", 2),
  );

  // ── The new offers (invented), each lending exactly what is needed to be free of the old loan: P + T. ──
  const amount = moneyString(byId("old.financed").value as string);
  push(given("old.rate_nominal", "5.90"), given("c.years", "25"), given("t.pass_input", "5.6"), given("t.fail_input", "5.7"), given("keep.same_rate", "5.9"));
  push(given("n.amount", amount), given("n.costs", NEW_LOAN_COSTS), given("n.rate_b", bank("b").rate), given("n.rate_d", bank("d").rate));
  const offer = (id: "b" | "c" | "d", rate?: string, months?: number) =>
    fixedOffer({ name: bank(id).name, amount, months: months ?? bank(id).months, rate: rate ?? bank(id).rate, upfront: NEW_LOAN_COSTS }, REFINANCE_FORECAST);
  const OB = offer("b");
  const OC = offer("c");
  const OD = offer("d");
  const swc = (id: string, o: ReturnType<typeof offer>, m: Parameters<typeof sw>[5], opts: { k?: number; disc?: string; decimals?: number } = {}) =>
    sw(id, S, "whole", o, F, m, { cash: NEW_LOAN_COSTS, disc: opts.disc, k: opts.k, decimals: opts.decimals });
  const all = (tag: string, o: ReturnType<typeof offer>) =>
    push(
      swc(`${tag}.first`, o, "new_first"),
      swc(`${tag}.months`, o, "new_months"),
      swc(`${tag}.total`, o, "new_total"),
      swc(`${tag}.switch_total`, o, "switch_total"),
      swc(`${tag}.gap`, o, "monthly_gap"),
      swc(`${tag}.saving`, o, "total_saving"),
      swc(`${tag}.rate`, o, "new_rate", { decimals: 2 }),
      swc(`${tag}.margin`, o, "margin", { decimals: 2 }),
      swc(`${tag}.worth`, o, "worthwhile"),
      swc(`${tag}.cash_be`, o, "cash_break_even"),
      swc(`${tag}.pos_be`, o, "position_break_even"),
      swc(`${tag}.pv`, o, "pv_saving", { disc: "comparison" }),
    );
  push(swc("stay.total", OB, "stay_total"));
  all("b", OB);
  all("c", OC);
  all("d", OD);
  push(
    swc("b.new_loan", OB, "new_loan"),
    swc("b.pos12", OB, "position_at", { k: 12 }),
    swc("b.pos36", OB, "position_at", { k: 36 }),
    swc("b.pos60", OB, "position_at", { k: 60 }),
    swc("b.cash12", OB, "cash_at", { k: 12 }),
    swc("b.gap12", OB, "gap_at", { k: 12 }),
    swc("c.pos36", OC, "position_at", { k: 36 }),
    swc("c.pos120", OC, "position_at", { k: 120 }),
    swc("c.gap36", OC, "gap_at", { k: 36 }),
    difference("c.extra", byId("c.switch_total"), byId("stay.total")),
    difference("d.extra", byId("d.switch_total"), byId("stay.total")),
    effective("d.eff_nominal", "0.475", 2),
    difference("d.extra_no_costs", byId("d.total"), byId("stay.total")),
    times("c.naive", byId("c.gap"), 203),
    times("d.naive", byId("d.gap"), 203),
    // Two rates that bracket the line for the 203-month loan (the calculator's third task).
    swc("t.pass_rate", offer("b", "5.6"), "new_rate", { decimals: 2 }),
    swc("t.pass_margin", offer("b", "5.6"), "margin", { decimals: 2 }),
    swc("t.pass_worth", offer("b", "5.6"), "worthwhile"),
    swc("t.fail_rate", offer("b", "5.7"), "new_rate", { decimals: 2 }),
    swc("t.fail_margin", offer("b", "5.7"), "margin", { decimals: 2 }),
    swc("t.fail_worth", offer("b", "5.7"), "worthwhile"),
    swc("t.fail_gap", offer("b", "5.7"), "monthly_gap"),
    swc("t.fail_saving", offer("b", "5.7"), "total_saving"),
    // The saving of a lower rate, kept as a shorter loan: pay what you pay today on the new loan.
    monthsKept("keep.b", amount, bank("b").rate, byId("old.first").value as string),
    monthsKept("keep.same", amount, byId("keep.same_rate").value as string, byId("old.first").value as string),
  );

  // ── The three-track loan (invented): the figures per track and for the whole loan. ──
  const three = PRESETS.find((p) => p.id === "three")!;
  const T3: ExistingSpec = { tracks: three.tracks.map((t) => t.track), paid: three.tracks.map((t) => t.paymentsMade), fees: three.tracks.map((t) => t.fee), shared: three.shared };
  const loan3 = existingLoan(three.tracks.map((t) => ({ track: t.track, paymentsMade: t.paymentsMade, fee: t.fee })), three.shared);
  const amount3 = moneyString(loan3.whole.financed);
  const O3 = fixedOffer({ name: "בנק ב׳", amount: amount3, months: three.months, rate: three.rate, upfront: three.upfront }, REFINANCE_FORECAST);
  push(given("t3.amount_rate", three.rate), given("t3.costs", three.upfront), given("t3.fee_shared", three.shared));
  for (const [i, t] of three.tracks.entries()) {
    push(
      given(`t3.${i}.fee`, t.fee),
      stay(`t3.${i}.balance`, T3, i, "balance"),
      stay(`t3.${i}.months`, T3, i, "months"),
      stay(`t3.${i}.rate0`, T3, i, "rate_without", 2),
      stay(`t3.${i}.rate1`, T3, i, "rate_with", 2),
      sw(`t3.${i}.worth`, T3, i, O3, F, "worthwhile", { cash: three.upfront }),
      sw(`t3.${i}.margin`, T3, i, O3, F, "margin", { cash: three.upfront, decimals: 2 }),
    );
  }
  push(
    stay("t3.w.balance", T3, "whole", "balance"),
    stay("t3.w.fee", T3, "whole", "fee"),
    stay("t3.w.rate0", T3, "whole", "rate_without", 2),
    stay("t3.w.rate1", T3, "whole", "rate_with", 2),
    sw("t3.w.worth", T3, "whole", O3, F, "worthwhile", { cash: three.upfront }),
    sw("t3.w.margin", T3, "whole", O3, F, "margin", { cash: three.upfront, decimals: 2 }),
    sw("t3.new_rate", T3, "whole", O3, F, "new_rate", { cash: three.upfront, decimals: 2 }),
    sw("t3.new_loan", T3, "whole", O3, F, "new_loan", { cash: three.upfront }),
  );
  // Only the first track: the loan shrinks to what that track needs.
  const T1: ExistingSpec = { tracks: [T3.tracks[0]], paid: [T3.paid[0]], fees: [T3.fees[0]], shared: three.shared };
  const loan1 = existingLoan([{ track: T1.tracks[0], paymentsMade: T1.paid[0], fee: T1.fees[0] }], three.shared);
  const O1 = fixedOffer({ name: "בנק ב׳", amount: moneyString(loan1.whole.financed), months: three.months, rate: three.rate, upfront: three.upfront }, REFINANCE_FORECAST);
  push(
    stay("t1.rate1", T1, "whole", "rate_with", 2),
    stay("t1.fee", T1, "whole", "fee"),
    sw("t1.new_rate", T1, "whole", O1, F, "new_rate", { cash: three.upfront, decimals: 2 }),
    sw("t1.worth", T1, "whole", O1, F, "worthwhile", { cash: three.upfront }),
    sw("t1.margin", T1, "whole", O1, F, "margin", { cash: three.upfront, decimals: 2 }),
    sw("t1.new_loan", T1, "whole", O1, F, "new_loan", { cash: three.upfront }),
  );

  // ── Exercises. ──
  // 2: what a new loan has to cover. Balance 250,000 ₪ and a fee of 6,000 ₪ (invented).
  const e2b = given("ex2.balance", "250000.00");
  const e2f = given("ex2.fee", "6000.00");
  push(e2b, e2f, sumOf("ex2.answer", [e2b, e2f]), difference("ex2.err_minus", e2b, e2f));
  // 3: bank ד׳ (5.7%, 25 years): how much more is paid in all. Common mistake: the monthly gap times 203.
  push(given("ex3.months_left", "203"));
  // 5: the month the saving in payments covers the up-front costs (bank ב׳). Common mistake: the other break-even.
  // 6: keep paying what you pay today on bank ב׳'s loan. Common mistake: the old loan's 203 months.

  return {
    lesson: "7.4",
    title: "מחזור: מתי זה כדאי",
    note: "Teaching numbers, except the existing loan of תיק ג׳ and its fee, which are the team's worked example of the early-repayment fee (Brain 7798786, 2 August 2026; unverified). The banks, their rates and terms, the new loan's up-front costs and the three-track loan are invented. The two figures follow the team's transcription of Directive 451 §15א (Brain 7733250), not checked against the directive: P + T = the present value of the payments still to come, found as an IRR with T = 0 (expected total rate) and T = the early-repayment fee plus any other charge due if repaid now (rate for comparison purposes), each turned into a yearly rate by (1 + IRR)^12 − 1. The existing loan is carried unrounded (that is how the team's balance 637,956.74 comes out); the new loans follow the statement convention. The shared ₪60 is in the whole-loan figure only (our modelling choice). The cash view ignores the fee for leaving the new loan later (unknown today).",
    facts,
  };
}
