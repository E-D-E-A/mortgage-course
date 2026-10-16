/**
 * Lesson 6.5 — the red line: positioning against wrong information. Positioning chooses among TRUE
 * data and presents true facts in full, documented, in the strongest form; wrong information is a
 * fact left out where the bank needs it, a number inflated, a document that is not right. This
 * lesson's numbers are there to show that the two can print the SAME figure and still be opposites:
 * the ratio after closing the car loan from the savings (a real lever, with a price) equals the
 * ratio on a form that leaves the loan out (a figure about a family that does not exist).
 *
 * Case A (the car loan, the equity with its gift), case B (אבי: two assessments, the declared
 * income), and a small invented family (דנה ויואב) for the second failure: a position that passes
 * the bank's line and leaves the family short of its own budget.
 *
 * Every number the page, its exercises, its two components and its video show is a fact here;
 * levers.ts (on sensitivity.ts, affordability.ts, regulation.ts) computes them and
 * checks/kinds/levers.py, affordability.py, regulation.py and common.py recompute each.
 *
 * Legal consequences are NOT facts here and appear on the page only as questions to a lawyer.
 * The wrong-information examples on the page are what not to do: nothing here is a method.
 */
import { CAR_PAYOFF, CASE_A_POSITION as A, RESERVE } from "../../src/data/case-a-levers.ts";
import { CASE_A, SCENARIOS } from "../../src/data/case-a-mix.ts";
import type { PositionCase } from "../../src/lib/calc/levers.ts";
import type { TrackSpec } from "../../src/lib/calc/schedule.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { assessment } from "./affordability-facts.ts";
import { difference, divFact, given, givenMoney, levFact, type LevMeasure } from "./_lever-facts.ts";
import { share } from "./lesson-3-8.ts";
import { budgetMax, left, margin, maxPayment } from "./regulation-facts.ts";

/** Case B (אבי ומיכל): the course map's sketch, lesson 4.1's incomes and 4.7's two tracks. */
const B_ASSESSMENTS = ["84000", "96000"];
const B_MICHAL = "8200";
const B_DECLARED = "11000";
const bTrack = (kind: TrackSpec["kind"], rate: string): TrackSpec => ({ kind, amount: "565000", rate, months: 300 });
const caseB = (aviMonthly: string): PositionCase => ({
  deal: "only_home",
  price: "1650000",
  equity: "520000",
  reserve: "0",
  tracks: [bTrack("fixed_unlinked", "4.60"), bTrack("variable_unlinked", "4.10")],
  base: SCENARIOS.base,
  stress: SCENARIOS.stress,
  incomes: [aviMonthly, B_MICHAL],
  obligations: [],
});

/** דנה ויואב: invented. They bring 22,000 ₪ net a month and need 14,000 ₪ to live. */
const D_NET = "22000";
const D_BUDGET = "14000";

export default function lesson(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);
  const get = (id: string) => facts.find((f) => f.id === id) as Fact;
  const lev = (id: string, c: PositionCase, measure: LevMeasure, move?: Parameters<typeof levFact>[3]) => add(levFact(id, c, measure, move));

  // ── Case A: the same fact, two stories ──
  add(givenMoney("a.recognised", CASE_A.recognisedIncome));
  add(givenMoney("a.car_monthly", CASE_A.car.monthly));
  add(given("a.car_months", CASE_A.car.monthsLeft as number));
  add(givenMoney("a.reserve", RESERVE));
  add(givenMoney("a.payoff", CAR_PAYOFF));
  add(givenMoney("a.equity", CASE_A.equity));
  add(given("in.target", "40"));
  lev("a.ratio", A, "ratio");
  lev("a.disp", A, "disposable");
  lev("a.left", A, "left_first");
  lev("a.ltv", A, "ltv");
  const closed = { lever: "close_loan", payoff: CAR_PAYOFF, from: "reserve" } as const;
  // The ratio after closing the loan from the savings, and the ratio on a form that leaves the loan out:
  // the same arithmetic, the same number. Two different families.
  lev("t.ratio", A, "ratio", closed);
  lev("t.disp", A, "disposable", closed);
  lev("t.reserve", A, "reserve", closed);
  lev("t.left", A, "left_first", closed);
  add(difference("t.gap", get("a.ratio"), get("t.ratio")));
  add(difference("t.left_gain", get("t.left"), get("a.left")));
  add(divFact("t.pp", get("a.payoff"), get("t.gap")));
  add(given("t.wait", 9));
  lev("t.wait_ratio", A, "ratio", { lever: "wait", months: 9 });
  lev("t.wait_left", A, "months_left", { lever: "wait", months: 9 });

  // The equity: 200,000 ₪ of the 560,000 are a gift from the parents. The ratio and the financing ratio do not change with the label.
  add(givenMoney("g.gift", "200000"));
  add(share("g.share", get("g.gift"), get("a.equity"), 2));

  // ── Case B: two assessments; the average, the latest year, and a figure no document shows ──
  add(givenMoney("b.assess_old", B_ASSESSMENTS[0]));
  add(givenMoney("b.assess_new", B_ASSESSMENTS[1]));
  add(givenMoney("b.michal", B_MICHAL));
  add(givenMoney("b.declared", B_DECLARED));
  const avg = add(assessment("b.avg", B_ASSESSMENTS, "average"));
  const latest = add(assessment("b.latest", B_ASSESSMENTS, "latest"));
  lev("b.ratio_avg", caseB(avg.value as string), "ratio");
  lev("b.ratio_latest", caseB(latest.value as string), "ratio");
  lev("b.ratio_form", caseB(B_DECLARED), "ratio");
  add(difference("b.gap", get("b.ratio_avg"), get("b.ratio_form")));
  add(difference("b.rise", latest, avg));
  add(difference("b.gain_latest", get("b.ratio_avg"), get("b.ratio_latest")));

  // ── דנה ויואב: the bank's line allows more than the family's budget does ──
  add(givenMoney("d.net", D_NET));
  add(givenMoney("d.budget", D_BUDGET));
  add(maxPayment("d.bank_max", D_NET, "40"));
  add(left("d.left", D_NET, [get("d.bank_max").value as string]));
  add(margin("d.margin", get("d.left").value as string, D_BUDGET));
  add(budgetMax("d.family_max", D_NET, [], D_BUDGET));
  add(difference("d.over", get("d.bank_max"), get("d.family_max")));
  // The same family at the payment its own budget allows, and at a payment in between.
  add(left("d.left_family", D_NET, [get("d.family_max").value as string]));
  add(margin("d.margin_family", get("d.left_family").value as string, D_BUDGET));
  add(givenMoney("d.mid", "7500"));
  add(left("d.left_mid", D_NET, [get("d.mid").value as string]));
  add(margin("d.margin_mid", get("d.left_mid").value as string, D_BUDGET));
  add(difference("d.short", get("d.budget"), get("d.left")));

  // ── A document and what the client said (Mogi's rule): a payslip that says 12,400 and a client who says 13,000 ──
  add(givenMoney("r.doc", "12400"));
  add(givenMoney("r.said", "13000"));
  add(difference("r.gap", get("r.said"), get("r.doc")));

  return {
    lesson: "6.5",
    title: "הקו האדום: מיצוב מול מידע לא נכון",
    note: "Case A (the car loan, the gift in the equity), case B (אבי), and an invented family (דנה ויואב). Legal consequences are not facts: the page asks them as questions to a lawyer. Wrong-information examples are what not to do.",
    facts,
  };
}
