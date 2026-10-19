/**
 * Lesson 7.8 — the workshop: is it worth refinancing case C? Case C (עדי וירון) holds the existing loan of the team's worked
 * example (700,000 ₪, fixed unlinked, 5.90% nominal, 20 years from 2023-07-01, 37 payments made, repaid on 2026-08-02 with
 * notice) and wants two things: to replace it, and 150,000 ₪ more for a renovation on the same property.
 *
 * Every number comes from the two modules of this stage, through their fact builders:
 *  - the cost of leaving (lessons 7.1–7.3): scripts/lessons/_earlyrepay-facts.ts on src/lib/calc/earlyrepay.ts, recomputed
 *    by checks/kinds/earlyrepay.py. The Order is known only through the team's transcription (Brain 7798786, read by the
 *    team on 2026-08-02/03; not verified against the Order); A = 4.823049% and C = 5.09% are values the team read on
 *    2026-08-02, לא אומת;
 *  - the test of section 15א and the comparison of staying with switching (lessons 7.4–7.5): _refinance-facts.ts on
 *    src/lib/calc/refinance.ts, recomputed by checks/kinds/refinance.py (the transcription of 451 §15א, not verified);
 *  - the schedule of a loan (met_*), the financing and payment ratios (ltv.py, regulation.py): the stage-3 and stage-4 modules.
 *
 * The workshop's choices, none of them fact: the three new offers are lesson 7.4's (invented banks ב׳, ג׳, ד׳, rates, terms
 * and up-front costs, imported from src/data/refinance-examples.ts so the two lessons agree), each lending what is needed to be
 * free of the old loan, P + T (the fee financed), and the top-up on top of that; the top-up as a loan of its own (6.4%,
 * 15 years) is invented; the incomes and the property's value are invented. The "same property" rule (from 2026-10-01) is the
 * team's transcription of circular 2840-06 / 2852, לא אומת. The fee is the fixture's (lesson 7.2) and the script refuses to
 * run if it ever drifts from the value lesson 7.4 takes as its input.
 */
import Decimal from "decimal.js";
import { moneyString } from "../../src/lib/calc/money.ts";
import { existingLoan, fixedOffer } from "../../src/lib/calc/refinance.ts";
import { CASE_C_DISCOUNT_FEE, CASE_C_LOAN, CASE_C_PAID, FEE_CASE, NET_INCOMES, NEW_LOAN_COSTS, OFFER_BANKS, OPERATIONAL_FEE, PROPERTY_VALUE, REFINANCE_FORECAST, SEPARATE_TOP_UP, TOP_UP, bank } from "../../src/data/case-c.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { type Case, effectiveOf, fee } from "./_earlyrepay-facts.ts";
import { type ExistingSpec, stay, sw } from "./_refinance-facts.ts";
import { difference, first, given, sumOf, times, total } from "./lesson-3-8.ts";
import { ltv, maxLoan, ratio } from "./regulation-facts.ts";

const F = [REFINANCE_FORECAST];
const cC: Case = { ...FEE_CASE };

export default function lesson78(): LessonData {
  const facts: Fact[] = [];
  const push = (...f: Fact[]) => facts.push(...f);
  const byId = (id: string) => facts.find((x) => x.id === id) as Fact;
  const money = (id: string) => byId(id).value as string;

  // ── The case ──
  push(
    given("case.top_up", moneyString(TOP_UP)),
    given("case.value", moneyString(PROPERTY_VALUE)),
    given("case.net1", moneyString(NET_INCOMES[0])),
    given("case.net2", moneyString(NET_INCOMES[1])),
    given("case.new_costs", moneyString(NEW_LOAN_COSTS)),
    given("case.principal", moneyString(FEE_CASE.principal)),
    given("case.rate", FEE_CASE.rate),
    given("case.years", String(FEE_CASE.term / 12)),
    given("avg.today", FEE_CASE.avgToday),
    given("avg.grant", FEE_CASE.avgGrant),
  );
  push(sumOf("case.income", [byId("case.net1"), byId("case.net2")]));

  // ── Step 1: what it costs to leave (lessons 7.1–7.3) ──
  push(
    fee("fee.paid", cC, "paid"),
    fee("fee.remaining", cC, "remaining"),
    fee("fee.payment", cC, "payment"),
    fee("fee.balance", cC, "balance"),
    fee("fee.pv_today", cC, "pv_today"),
    fee("fee.pv_grant", cC, "pv_grant"),
    fee("fee.v1", cC, "v1"),
    fee("fee.v2", cC, "v2"),
    fee("fee.lower", cC, "lower"),
    fee("fee.reduction", cC, "reduction_percent"),
    fee("fee.discount", cC, "discount"),
    fee("fee.operational", cC, "operational"),
    fee("fee.total", cC, "total"),
    fee("fee.total_v1_only", cC, "total_v1_only"),
    fee("fee.notice_days", cC, "notice_days"),
    fee("fee.bucket", cC, "bucket"),
    effectiveOf("rate.contract_eff", FEE_CASE.rate, 2),
  );
  // The guided tasks of the fee calculator: no notice at all, and a repayment a month before the third anniversary (no reduction yet).
  const noNotice: Case = { ...cC, noticeOn: undefined };
  const early: Case = { ...cC, repaid: "2026-06-30", noticeOn: "2026-05-31" };
  push(
    given("fee.no_notice_pct", "0.1"),
    fee("fee.no_notice", noNotice, "no_notice"),
    fee("fee.no_notice_total", noNotice, "total"),
    fee("fee.early_reduction", early, "reduction_percent"),
    fee("fee.early_total", early, "total"),
  );
  push(difference("fee.rule_worth", byId("fee.v1"), byId("fee.lower")), difference("fee.v1_only_extra", byId("fee.total_v1_only"), byId("fee.total")));
  // The two modules must agree on the fee: lesson 7.4 takes the discounting fee after the reduction as an input.
  if (money("fee.discount") !== moneyString(CASE_C_DISCOUNT_FEE)) throw new Error(`7.8: the fee of lesson 7.2 (${money("fee.discount")}) is no longer the input of lesson 7.4 (${CASE_C_DISCOUNT_FEE})`);
  if (money("fee.operational") !== moneyString(OPERATIONAL_FEE)) throw new Error("7.8: the operational fee drifted from lesson 7.4's input");

  // ── Step 2: where they stand, and the test of section 15א (lessons 7.4–7.5) ──
  const S: ExistingSpec = { tracks: [CASE_C_LOAN], paid: [CASE_C_PAID], fees: [CASE_C_DISCOUNT_FEE], shared: OPERATIONAL_FEE };
  push(
    stay("old.balance", S, "whole", "balance"),
    stay("old.months", S, "whole", "months"),
    stay("old.first", S, "whole", "first"),
    stay("old.total", S, "whole", "total"),
    stay("old.fee", S, "whole", "fee"),
    stay("old.financed", S, "whole", "financed"),
    stay("old.rate0", S, "whole", "rate_without", 2),
    stay("old.rate1", S, "whole", "rate_with", 2),
  );
  const financed = money("old.financed");
  const withTop = (extra: string) => moneyString(new Decimal(financed).plus(extra));
  const offer = (id: "b" | "c" | "d", amount: string, rate?: string, months?: number, upfront: string = NEW_LOAN_COSTS) =>
    fixedOffer({ name: bank(id).name, amount, months: months ?? bank(id).months, rate: rate ?? bank(id).rate, upfront }, REFINANCE_FORECAST);
  const swc = (id: string, o: ReturnType<typeof offer>, m: Parameters<typeof sw>[5], opts: { decimals?: number } = {}) => sw(id, S, "whole", o, F, m, { cash: NEW_LOAN_COSTS, decimals: opts.decimals });

  for (const b of OFFER_BANKS) {
    const o = offer(b.id, financed);
    push(
      given(`${b.id}.rate`, b.rate),
      given(`${b.id}.term`, String(b.months)),
      swc(`${b.id}.first`, o, "new_first"),
      swc(`${b.id}.months`, o, "new_months"),
      swc(`${b.id}.total`, o, "new_total"),
      swc(`${b.id}.switch_total`, o, "switch_total"),
      swc(`${b.id}.gap`, o, "monthly_gap"),
      swc(`${b.id}.saving`, o, "total_saving"),
      swc(`${b.id}.rate_new`, o, "new_rate", { decimals: 2 }),
      swc(`${b.id}.margin`, o, "margin", { decimals: 2 }),
      swc(`${b.id}.worth`, o, "worthwhile"),
      swc(`${b.id}.cash_be`, o, "cash_break_even"),
    );
  }
  // The edge of the test for bank ב׳'s term (the guided task of the refinance calculator): two rates that bracket the line.
  for (const [tag, rate] of [["t.pass", "5.6"], ["t.fail", "5.7"]] as const) {
    const o = offer("b", financed, rate);
    push(given(`${tag}.rate`, rate), swc(`${tag}.margin`, o, "margin", { decimals: 2 }), swc(`${tag}.worth`, o, "worthwhile"));
  }
  // The entry costs ARE in the rate of the test: bank ב׳ without them, with them, and with double.
  const oNo = offer("b", financed, undefined, undefined, "0");
  const oDouble = offer("b", financed, undefined, undefined, moneyString(new Decimal(NEW_LOAN_COSTS).mul(2)));
  push(
    given("cost.double", moneyString(new Decimal(NEW_LOAN_COSTS).mul(2))),
    sw("b.rate_nocost", S, "whole", oNo, F, "new_rate", { cash: "0", decimals: 2 }),
    sw("b.rate_double", S, "whole", oDouble, F, "new_rate", { cash: moneyString(new Decimal(NEW_LOAN_COSTS).mul(2)), decimals: 2 }),
    sw("b.margin_double", S, "whole", oDouble, F, "margin", { cash: moneyString(new Decimal(NEW_LOAN_COSTS).mul(2)), decimals: 2 }),
    sw("b.saving_double", S, "whole", oDouble, F, "total_saving", { cash: moneyString(new Decimal(NEW_LOAN_COSTS).mul(2)), decimals: 2 }),
  );
  // Bank ב׳ at other rates (same 203 months): the sample recommendation's ceiling, and the learner's own check at 5.5%.
  for (const [tag, rate] of [["t53", "5.3"], ["t55", "5.5"], ["t56", "5.6"], ["t57", "5.7"]] as const) {
    const o = offer("b", financed, rate);
    push(
      given(`${tag}.rate`, rate),
      swc(`${tag}.first`, o, "new_first"),
      swc(`${tag}.gap`, o, "monthly_gap"),
      swc(`${tag}.total`, o, "switch_total"),
      swc(`${tag}.saving`, o, "total_saving"),
      swc(`${tag}.new_rate`, o, "new_rate", { decimals: 2 }),
      swc(`${tag}.margin`, o, "margin", { decimals: 2 }),
      swc(`${tag}.worth`, o, "worthwhile"),
    );
  }
  // A lower payment is not a total saving: what the longer terms add over staying.
  push(
    times("c.naive", byId("c.gap"), 203),
    difference("c.extra", byId("c.switch_total"), byId("old.total")),
    difference("d.extra", byId("d.switch_total"), byId("old.total")),
  );

  // ── Step 3: the top-up of 150,000 ₪, inside the new loan or as a loan of its own ──
  for (const b of OFFER_BANKS) {
    const o = offer(b.id, withTop(TOP_UP));
    push(
      swc(`${b.id}.top_loan`, o, "new_loan"),
      swc(`${b.id}.top_first`, o, "new_first"),
      swc(`${b.id}.top_total`, o, "new_total"),
      swc(`${b.id}.top_switch_total`, o, "switch_total"),
    );
    push(
      difference(`${b.id}.top_add_first`, byId(`${b.id}.top_first`), byId(`${b.id}.first`)),
      difference(`${b.id}.top_add_total`, byId(`${b.id}.top_total`), byId(`${b.id}.total`)),
    );
    push(difference(`${b.id}.top_interest`, byId(`${b.id}.top_add_total`), byId("case.top_up")));
  }
  push(
    given("sep.rate", SEPARATE_TOP_UP.rates[0]),
    given("sep.months", String(SEPARATE_TOP_UP.months)),
    first("sep.first", [SEPARATE_TOP_UP]),
    total("sep.total", [SEPARATE_TOP_UP]),
  );
  push(difference("sep.interest", byId("sep.total"), byId("case.top_up")));
  // The top-up question alone: inside bank ב׳'s new loan against a loan of its own.
  push(difference("b.top_vs_sep", byId("sep.total"), byId("b.top_add_total")));

  // ── Step 4: the two ways to get both, in shekels (staying and a loan of its own, or one new loan) ──
  push(sumOf("keep.total", [byId("old.total"), byId("sep.total")]), sumOf("keep.first", [byId("old.first"), byId("sep.first")]));
  push(
    sumOf("b.parts", [byId("b.saving"), byId("b.top_vs_sep")]),
    difference("b.top_saving", byId("keep.total"), byId("b.top_switch_total")),
    difference("c.top_worse", byId("c.top_switch_total"), byId("keep.total")),
    difference("d.top_worse", byId("d.top_switch_total"), byId("keep.total")),
  );

  // ── Step 5: the repayment ratio (lessons 4.3–4.4) and the "same property" rule ──
  push(given("lim.pti", "50"), given("lim.capital", "40"), given("rule.months", "18"));
  push(
    ratio("ratio.today", money("old.first"), money("case.income")),
    ratio("ratio.b", money("b.top_first"), money("case.income")),
    ratio("ratio.c", money("c.top_first"), money("case.income")),
    ratio("ratio.d", money("d.top_first"), money("case.income")),
    ratio("ratio.keep", money("keep.first"), money("case.income")),
  );
  // The financing ratio of the one new loan with the top-up, against the value, and the ceiling of a loan for any purpose (the transcription).
  push(
    ltv("v.ltv_b", money("b.top_loan"), money("case.value")),
    ltv("v.ltv_old", money("old.balance"), money("case.value")),
    maxLoan("v.max_any", money("case.value"), "any_purpose"),
    given("v.any_pct", "50"),
    given("v.any_ext_pct", "70"),
    given("v.any_ext_cap", moneyString(new Decimal(200000))),
  );
  push(difference("v.room", byId("v.max_any"), byId("b.top_loan")));

  // ── The existing loan alone, for the tasks and exercises ──
  const loan = existingLoan([{ track: CASE_C_LOAN, paymentsMade: CASE_C_PAID, fee: CASE_C_DISCOUNT_FEE }], OPERATIONAL_FEE);
  void loan;

  return {
    lesson: "7.8",
    title: "סדנה: האם לתיק המחזור כדאי למחזר?",
    note: "Case C (עדי וירון): the loan and its fee are the team's worked example (700,000 ₪, 5.90% nominal, 20 years from 2023-07-01, repaid 2026-08-02; A = 4.823049% and C = 5.09% as the team read them on 2026-08-02, unverified; the Order and section 15א of directive 451 are known only through the team's transcription, not checked against them). The banks, their rates and terms, the up-front costs, the top-up as a loan of its own, the incomes and the property's value are invented. The new loans lend P + T (the fee financed), the top-up on top. The 'same property' rule is the team's transcription of circular 2840-06 / 2852, in force from 2026-10-01, unverified.",
    facts,
  };
}
