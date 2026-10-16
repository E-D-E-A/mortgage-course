/**
 * Lesson 7.5 — internal and external refinance. Mostly field knowledge and open questions: what the course knows (the
 * test of lesson 7.4 is the same arithmetic whoever lends the new money), what field people say (hypothesis, awaiting
 * Eylon), and what nobody on the course knows. The numbers are one comparison, on the loan of lesson 7.4: two invented
 * answers to the same question — another bank, and the bank the loan is with now — with up-front costs that differ by an
 * INVENTED amount (the course does not know what an internal refinance costs).
 *
 * The existing loan is the worked example of lesson 7.2 (the team's computation, unrounded). The banks, rates and costs
 * are invented. checks/kinds/refinance.py recomputes every fact.
 */
import { moneyString } from "../../src/lib/calc/money.ts";
import { CASE_C_DISCOUNT_FEE, CASE_C_LOAN, CASE_C_PAID, EXTERNAL_COSTS, INTERNAL_COSTS, OPERATIONAL_FEE, REFINANCE_FORECAST } from "../../src/data/refinance-examples.ts";
import { fixedOffer } from "../../src/lib/calc/refinance.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, given, sumOf } from "./lesson-3-8.ts";
import { fee as erFee } from "./_earlyrepay-facts.ts";
import { caseC } from "./lesson-7-1.ts";
import { type ExistingSpec, stay, sw } from "./_refinance-facts.ts";

const F = [REFINANCE_FORECAST];

export default function lesson75(): LessonData {
  const facts: Fact[] = [];
  const push = (...f: Fact[]) => facts.push(...f);
  const byId = (id: string) => facts.find((x) => x.id === id) as Fact;
  push(given("data_date", "2026-10-16"));

  // ── The loan of lesson 7.4 (the worked example of 7.2). ──
  const S: ExistingSpec = { tracks: [CASE_C_LOAN], paid: [CASE_C_PAID], fees: [CASE_C_DISCOUNT_FEE], shared: OPERATIONAL_FEE };
  // The fee is lesson 7.2's result (earlyrepay.ts); the build stops if it is no longer the fee in refinance-examples.ts.
  const feeD = erFee("old.fee_discount", caseC, "discount");
  const feeO = erFee("old.fee_operational", caseC, "operational");
  if (feeD.value !== CASE_C_DISCOUNT_FEE || feeO.value !== OPERATIONAL_FEE) throw new Error("the fee of lesson 7.2 is no longer the fee in refinance-examples.ts");
  push(
    feeD,
    feeO,
    sumOf("old.fee_total", [feeD, feeO]),
    stay("old.balance", S, "whole", "balance"),
    stay("old.months", S, "whole", "months"),
    stay("old.first", S, "whole", "first"),
    stay("old.financed", S, "whole", "financed"),
    stay("old.total", S, "whole", "total"),
    stay("old.rate0", S, "whole", "rate_without", 2),
    stay("old.rate1", S, "whole", "rate_with", 2),
  );
  // What the bar would be if the fee were not there (a what-if, not a claim about any bank).
  const S0: ExistingSpec = { ...S, fees: ["0"], shared: "0" };
  push(stay("w.rate1_nofee", S0, "whole", "rate_with", 2));
  const amount = moneyString(byId("old.financed").value as string);
  const costsExt = given("x.costs_ext", EXTERNAL_COSTS);
  const costsInt = given("x.costs_int", INTERNAL_COSTS);
  push(given("n.amount", amount), costsExt, costsInt, difference("x.cost_gap", costsExt, costsInt));

  // ── The offers (invented). All are fixed unlinked, for the 203 months that are left. ──
  const offer = (name: string, rate: string, upfront: string) => fixedOffer({ name, amount, months: 203, rate, upfront }, REFINANCE_FORECAST);
  const cases = [
    { tag: "ext", o: offer("בנק אחר", "5.2", EXTERNAL_COSTS), cash: EXTERNAL_COSTS },
    { tag: "i0", o: offer("הבנק הנוכחי", "5.2", INTERNAL_COSTS), cash: INTERNAL_COSTS },
    { tag: "i1", o: offer("הבנק הנוכחי", "5.3", INTERNAL_COSTS), cash: INTERNAL_COSTS },
    { tag: "i2", o: offer("הבנק הנוכחי", "5.4", INTERNAL_COSTS), cash: INTERNAL_COSTS },
  ];
  const rates: Record<string, string> = { ext: "5.2", i0: "5.2", i1: "5.3", i2: "5.4" };
  for (const c of cases) {
    const s = (id: string, m: Parameters<typeof sw>[5], decimals?: number) => sw(`${c.tag}.${id}`, S, "whole", c.o, F, m, { cash: c.cash, disc: id === "pv" ? "comparison" : undefined, decimals });
    push(
      given(`${c.tag}.input_rate`, rates[c.tag]),
      s("first", "new_first"),
      s("rate", "new_rate", 2),
      s("margin", "margin", 2),
      s("worth", "worthwhile"),
      s("saving", "total_saving"),
      s("cash_be", "cash_break_even"),
      s("pos_be", "position_break_even"),
      s("gap", "monthly_gap"),
    );
  }
  push(
    sw("stay.total", S, "whole", cases[0].o, F, "stay_total", { cash: EXTERNAL_COSTS }),
    difference("d.ext_i1", byId("ext.saving"), byId("i1.saving")),
    difference("d.i0_ext", byId("i0.saving"), byId("ext.saving")),
    difference("d.i0_i1", byId("i0.saving"), byId("i1.saving")),
  );

  // ── Rules the course already knows (lesson 1.8, as the team transcribed them): the validity window. ──
  push(given("rule.window", "24"), given("rule.window_no_lien", "12"));

  return {
    lesson: "7.5",
    title: "מחזור פנימי מול חיצוני",
    note: "Mostly field knowledge: nothing here is stated as a rule of any bank. The numbers are one invented comparison on the loan of lesson 7.4 (the worked example of the early-repayment fee, the team's own computation, unrounded; the fee is lesson 7.2's result): a new loan from another bank with up-front costs of 2,400 ₪, and a new loan from the bank the loan is with now with up-front costs of 900 ₪ — the 1,500 ₪ difference is INVENTED (the field claim that an internal refinance needs no appraisal is unverified). The test and every measure are lesson 7.4's (Directive 451 §15א as the team transcribed it; unverified). The new loan covers P + T exactly; its up-front costs are paid in cash. All banks, rates and costs are invented.",
    facts,
  };
}
